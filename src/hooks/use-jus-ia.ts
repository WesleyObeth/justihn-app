"use client";

/**
 * Lógica de conversación con Jus IA.
 *
 * La UI habla con `/api/ia/consultar` — nunca con el router directamente — para
 * que cablear el motor real (RAG + Claude) en Fase 2 no le afecte. Los estados
 * progresivos de "pensando" son propios del cliente: describen lo que el motor
 * está haciendo y sobreviven al cambio de backend.
 */
import { useCallback, useEffect, useRef } from "react";
import { usePortal, useCuota } from "@/store/portal";
import { marcarParaEscribir } from "@/components/ia/maquina-escribir";
import { ESTADOS_PENSANDO, ESTADOS_PENSANDO_ADJUNTO } from "@/data/jus-ia";
import type { RespuestaIA } from "@/lib/ai/tipos";
import type { Adjunto, MensajeChat } from "@/types/dominio";

const RITMO_ESTADOS_MS = [0, 650, 1300] as const;

/**
 * Piso de duración del estado "pensando": el router demo responde en ~50ms y
 * sin esto ni los estados progresivos ni la animación del avatar llegan a
 * verse. Con el motor real solo actúa si la respuesta llega más rápido.
 */
const MIN_PENSANDO_MS = 1900;

function nuevoId(): string {
  return crypto.randomUUID();
}

export function useJusIA() {
  const chat = usePortal((s) => s.chat);
  const pensando = usePortal((s) => s.pensando);
  const agregarMensaje = usePortal((s) => s.agregarMensaje);
  const setPensando = usePortal((s) => s.setPensando);
  const consumirCuota = usePortal((s) => s.consumirCuota);
  const setBorrador = usePortal((s) => s.setBorrador);
  const cuota = useCuota();

  const temporizadores = useRef<number[]>([]);
  const abortador = useRef<AbortController | null>(null);

  const limpiarTemporizadores = useCallback(() => {
    temporizadores.current.forEach((id) => window.clearTimeout(id));
    temporizadores.current = [];
  }, []);

  // Al desmontar (cambio de ruta), corta los timers y la petición en vuelo.
  useEffect(
    () => () => {
      limpiarTemporizadores();
      abortador.current?.abort();
    },
    [limpiarTemporizadores],
  );

  const enviar = useCallback(
    async (texto: string, adjunto?: Adjunto & { clave: string }) => {
      const consulta = texto.trim();
      if (!consulta || usePortal.getState().pensando) return;

      const turno = usePortal.getState().chat.length;
      const mensajeUsuario: MensajeChat = {
        id: nuevoId(),
        who: "u",
        text: consulta,
        ...(adjunto ? { adjunto: { nombre: adjunto.nombre, meta: adjunto.meta } } : {}),
      };

      agregarMensaje(mensajeUsuario);
      setBorrador("");

      const estados = adjunto ? ESTADOS_PENSANDO_ADJUNTO : ESTADOS_PENSANDO;
      setPensando(true, estados[0]);
      limpiarTemporizadores();
      RITMO_ESTADOS_MS.forEach((retraso, i) => {
        if (i === 0) return;
        temporizadores.current.push(
          window.setTimeout(() => setPensando(true, estados[i]!), retraso),
        );
      });

      abortador.current?.abort();
      const controlador = new AbortController();
      abortador.current = controlador;
      const inicioPensando = performance.now();

      /** Espera lo que falte para cumplir el piso de "pensando". */
      const respetarPiso = async () => {
        const restante = MIN_PENSANDO_MS - (performance.now() - inicioPensando);
        if (restante > 0) await new Promise((r) => window.setTimeout(r, restante));
      };

      try {
        const res = await fetch("/api/ia/consultar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // La clave del adjunto viaja en la consulta para que el motor sepa que
          // hay un documento adjunto; en Fase 2 se sustituye por el file_id real.
          body: JSON.stringify({
            consulta: adjunto ? `${adjunto.clave} ${consulta}` : consulta,
            turno,
            cuotaRestante: cuota.restantes,
          }),
          signal: controlador.signal,
        });

        if (!res.ok) {
          const detalle = (await res.json().catch(() => null)) as { mensaje?: string } | null;
          throw new Error(detalle?.mensaje ?? "No se pudo completar la consulta.");
        }

        // `gratuita` es metadato de facturación, no parte del mensaje que se
        // persiste: se separa antes de guardarlo en el hilo.
        const { gratuita, ...contenido } = (await res.json()) as RespuestaIA;

        await respetarPiso();
        if (controlador.signal.aborted) return;

        limpiarTemporizadores();
        setPensando(false);
        // El borrador de escrito viaja DENTRO del mensaje y se renderiza
        // nativo en el hilo (nada de abrir el editor lateral desde el chat —
        // ese drawer queda para acciones fuera de esta pantalla).
        const idRespuesta = nuevoId();
        // Solo las respuestas recién llegadas se escriben con efecto — el
        // historial recargado aparece entero (ver maquina-escribir.ts).
        marcarParaEscribir(idRespuesta);
        agregarMensaje({ id: idRespuesta, who: "a", ...contenido });
        if (!gratuita) consumirCuota();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // El abort solo ocurre al desmontar (cambio de ruta): si no se
          // resetea, el chat queda "pensando" para siempre al volver.
          limpiarTemporizadores();
          setPensando(false);
          return;
        }
        limpiarTemporizadores();
        setPensando(false);
        agregarMensaje({
          id: nuevoId(),
          who: "a",
          text:
            error instanceof Error
              ? `No pude completar la consulta: ${error.message}`
              : "No pude completar la consulta. Intenta de nuevo.",
          meta: "Sin costo",
        });
      }
    },
    [agregarMensaje, setPensando, setBorrador, consumirCuota, cuota.restantes, limpiarTemporizadores],
  );

  return { chat, pensando, enviar };
}

/**
 * Adjuntos de demostración: alterna documento y foto para mostrar las dos rutas
 * de lectura (PDF de sentencia · foto de contrato).
 *
 * TODO(data): reemplazar por subida real a Supabase Storage + Files API; el
 * archivo se analiza server-side y nunca se envía crudo al prompt (§3.2).
 */
export function adjuntoDemo(indice: number): Adjunto & { clave: string; texto: string } {
  const esFoto = indice % 2 === 1;
  return esFoto
    ? {
        nombre: "contrato-arrendamiento.jpg",
        meta: "Foto · 2.1 MB",
        clave: "__adjunto_foto__",
        texto: "Léeme este contrato y dime si hay algo que corregir",
      }
    : {
        nombre: "sentencia-CAT-0312-2026.pdf",
        meta: "PDF · 14 páginas",
        clave: "__adjunto_pdf__",
        texto: "Resúmeme esta sentencia",
      };
}
