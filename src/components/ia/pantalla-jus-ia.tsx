"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { BurbujaUsuario, IndicadorPensando, RespuestaJusIA } from "@/components/ia/mensaje";
import { usePortal, useCuota } from "@/store/portal";
import { adjuntoDemo, useJusIA } from "@/hooks/use-jus-ia";
import { useTitularJusIA } from "@/hooks/use-saludo";
import { HISTORIAL, SUGERENCIAS } from "@/data/jus-ia";
import { cn } from "@/lib/utils";

/**
 * Chat en una sola columna centrada; el historial vive en un panel lateral
 * (slide-over, mismo patrón que el editor de escritos) para que la
 * conversación respire (decisión Wesley 2026-08-25).
 */
export function PantallaJusIA() {
  const { chat, pensando, enviar } = useJusIA();
  const nueva = usePortal((s) => s.nuevaConsulta);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const hayMensajes = chat.length > 0;

  // Consulta que otra pantalla dejó lista (brief del Dashboard): se envía al
  // montar. Va en un timeout cancelable para que el doble mount de StrictMode
  // no dispare (y aborte) el fetch en el montaje descartado; el store se relee
  // al ejecutar para consumirla exactamente una vez.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const pendiente = usePortal.getState().consultaPendiente;
      if (!pendiente) return;
      usePortal.getState().setConsultaPendiente(null);
      void enviar(pendiente);
    }, 0);
    return () => window.clearTimeout(id);
  }, [enviar]);

  return (
    <div
      className="mx-auto flex h-full w-full max-w-[760px] flex-col"
      style={{ animation: "fadeUp .3s ease" }}
    >
      <div className="flex items-center justify-between pb-2">
        {hayMensajes ? (
          <button
            type="button"
            onClick={nueva}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-borde bg-white px-3 py-[7px] text-[12.5px] font-semibold text-marino hover:border-celeste hover:text-celeste"
          >
            <Icono nombre="mas" size={12} strokeWidth={2.2} />
            Nueva consulta
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setHistorialAbierto(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-[7px] text-[12.5px] text-texto-3 hover:bg-white hover:text-marino"
        >
          <Icono nombre="reloj" size={13} strokeWidth={2} />
          Historial
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {hayMensajes ? (
          <Hilo chat={chat} pensando={pensando} onEnviar={enviar} />
        ) : (
          <EstadoFresco onEnviar={enviar} />
        )}
      </div>

      <PanelHistorial abierto={historialAbierto} onCerrar={() => setHistorialAbierto(false)} />
    </div>
  );
}

// ── Panel de historial (slide-over) ────────────────────────────────────────

function PanelHistorial({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const activa = usePortal((s) => s.conversacionActiva);
  const cargar = usePortal((s) => s.cargarConversacion);

  return (
    <Dialog.Root open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[54] bg-[rgba(10,24,48,.25)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-0 right-0 bottom-0 z-[55] flex w-[360px] max-w-[92vw] flex-col bg-white"
          style={{ boxShadow: "var(--shadow-lateral)", animation: "fadeUp .25s ease" }}
        >
          <div className="flex items-center gap-3 border-b border-borde px-5 py-4">
            <Icono nombre="reloj" size={16} strokeWidth={2} className="text-texto-3" />
            <Dialog.Title className="font-display flex-1 text-[15px] font-bold text-marino">
              Historial de consultas
            </Dialog.Title>
            <Dialog.Close
              className="grid cursor-pointer place-items-center text-texto-4 hover:text-marino"
              aria-label="Cerrar historial"
            >
              <Icono nombre="cerrar" size={15} strokeWidth={2} />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
            {HISTORIAL.map((conv) => {
              const fuentes = conv.mensajes.at(-1)?.citas?.length ?? 0;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    cargar(conv.id, conv.mensajes);
                    onCerrar();
                  }}
                  className={cn(
                    "cursor-pointer rounded-[10px] border px-3.5 py-2.5 text-left hover:border-celeste",
                    activa === conv.id
                      ? "border-celeste bg-chip"
                      : "border-transparent bg-transparent",
                  )}
                >
                  <div className="truncate text-[13px] font-semibold text-marino">
                    {conv.titulo}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-texto-4">
                    {conv.fecha} · {fuentes} fuentes citadas
                  </div>
                </button>
              );
            })}
          </div>

          <p className="border-t border-borde px-5 py-3 text-[11.5px] text-texto-4">
            Cada consulta guarda sus fuentes — reábrela para retomar la investigación.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Estado fresco ──────────────────────────────────────────────────────────

function EstadoFresco({ onEnviar }: { onEnviar: (texto: string) => void }) {
  const titular = useTitularJusIA();

  return (
    <div className="flex flex-1 flex-col items-stretch justify-center pb-[4vh]">
      {/* Vacío en servidor; el hook elige la frase tras el mount (§0.6).
          min-h reserva las dos líneas para que no salte el layout. */}
      <h1 className="font-display grid min-h-[73px] content-center text-center text-[29px] leading-[1.25] font-bold tracking-[-.4px] text-balance text-marino">
        {titular}
      </h1>

      <Composer variante="hero" onEnviar={onEnviar} />

      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGERENCIAS.map((s) => (
          <button
            key={s.titulo}
            type="button"
            onClick={() => onEnviar(s.consulta)}
            className="flex cursor-pointer items-center gap-3 rounded-[11px] border border-borde bg-white px-4 py-3 text-left text-texto-2 hover:border-celeste hover:text-marino"
          >
            <span className="grid place-items-center text-texto-4">
              <Icono nombre={s.icono as NombreIcono} size={16} />
            </span>
            <span className="text-[13.5px]">{s.titulo}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onEnviar("¿Qué más puedes hacer por mí?")}
        className="mx-auto mt-2.5 flex cursor-pointer items-center gap-1.5 px-2 py-1.5 text-[12.5px] text-texto-4 hover:text-marino"
      >
        <Icono nombre="chevron" size={13} />
        Mostrar más sugerencias
      </button>
    </div>
  );
}

// ── Hilo de conversación ───────────────────────────────────────────────────

function Hilo({
  chat,
  pensando,
  onEnviar,
}: {
  chat: ReturnType<typeof useJusIA>["chat"];
  pensando: boolean;
  onEnviar: (texto: string) => void;
}) {
  const cuota = useCuota();
  const pensandoMsg = usePortal((s) => s.pensandoMsg);
  const finDelHilo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finDelHilo.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length, pensando]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-5.5 overflow-y-auto px-0.5 pt-1.5 pb-5">
        {chat.map((mensaje) =>
          mensaje.who === "u" ? (
            <BurbujaUsuario key={mensaje.id} mensaje={mensaje} />
          ) : (
            <RespuestaJusIA key={mensaje.id} mensaje={mensaje} onChip={onEnviar} />
          ),
        )}
        {pensando && <IndicadorPensando mensaje={pensandoMsg} />}
        <div ref={finDelHilo} />
      </div>

      <Composer variante="hilo" onEnviar={onEnviar} />

      <p className="mt-2 text-center text-[11.5px] text-texto-4">
        Solo fuentes oficiales publicadas ·{" "}
        {cuota.esPremium ? "consultas ilimitadas" : `${cuota.restantes} consultas restantes`}
      </p>
    </>
  );
}

// ── Composer ───────────────────────────────────────────────────────────────

function Composer({
  variante,
  onEnviar,
}: {
  variante: "hero" | "hilo";
  onEnviar: (texto: string, adjunto?: ReturnType<typeof adjuntoDemo>) => void;
}) {
  const borrador = usePortal((s) => s.borrador);
  const setBorrador = usePortal((s) => s.setBorrador);
  const pensando = usePortal((s) => s.pensando);
  const chat = usePortal((s) => s.chat);
  const cuota = useCuota();
  const campoRef = useRef<HTMLTextAreaElement>(null);

  // Textarea auto-expandible: una consulta larga (p. ej. prellenada desde una
  // calculadora) envuelve en varias líneas en vez de desbordar en una sola.
  useLayoutEffect(() => {
    const el = campoRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [borrador]);

  const enviar = () => {
    if (!borrador.trim() || pensando) return;
    onEnviar(borrador);
  };

  const adjuntar = () => {
    if (pensando) return;
    const adjunto = adjuntoDemo(chat.filter((m) => m.adjunto).length);
    onEnviar(adjunto.texto, adjunto);
  };

  const campo = (
    <textarea
      ref={campoRef}
      rows={1}
      value={borrador}
      onChange={(e) => setBorrador(e.target.value)}
      onKeyDown={(e) => {
        // Enter envía; Shift+Enter inserta salto de línea.
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          enviar();
        }
      }}
      placeholder={
        variante === "hero" ? "Escribe tu consulta o describe tu caso" : "Responde o pregunta algo más…"
      }
      aria-label="Consulta para Jus IA"
      disabled={pensando}
      className={cn(
        "w-full min-w-0 resize-none overflow-y-auto border-none bg-transparent leading-[1.5] text-marino outline-none disabled:opacity-60",
        variante === "hero" ? "px-1 pt-0.5 pb-4 text-[15px]" : "flex-1 self-center text-[14.5px]",
      )}
    />
  );

  const botonEnviar = (
    <button
      type="button"
      onClick={enviar}
      disabled={pensando || !borrador.trim()}
      aria-label={pensando ? "Jus IA está trabajando" : "Enviar consulta"}
      className={cn(
        "grid h-9 w-9 min-w-9 cursor-pointer place-items-center rounded-[10px] border-none bg-celeste text-white hover:bg-cruce disabled:cursor-not-allowed",
        pensando ? "disabled:opacity-90" : "disabled:opacity-45",
      )}
    >
      {pensando ? (
        <span
          aria-hidden
          className="h-4 w-4 rounded-full border-2 border-white/35 border-t-white"
          style={{ animation: "giraSpinner .7s linear infinite" }}
        />
      ) : (
        <Icono nombre="enviar" size={16} strokeWidth={2.2} />
      )}
    </button>
  );

  const bordeAurora = (
    <span aria-hidden className={cn("borde-aurora", pensando && "borde-aurora--pensando")} />
  );

  if (variante === "hilo") {
    return (
      <div
        className="relative flex items-center gap-2.5 rounded-[14px] border border-borde-fuerte bg-white py-2.5 pr-2.5 pl-4"
        style={{ boxShadow: "var(--shadow-composer-sm)" }}
      >
        {bordeAurora}
        {campo}
        {botonEnviar}
      </div>
    );
  }

  return (
    <div
      className="relative mt-8.5 rounded-2xl border border-borde-fuerte bg-white px-4 pt-4 pb-3"
      style={{ boxShadow: "var(--shadow-composer)" }}
    >
      {bordeAurora}
      {campo}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={adjuntar}
          title="Adjuntar documento"
          aria-label="Adjuntar documento"
          className="grid cursor-pointer place-items-center text-texto-4 hover:text-marino"
        >
          <Icono nombre="mas" size={17} />
        </button>
        <button
          type="button"
          onClick={adjuntar}
          title="Adjuntar expediente"
          aria-label="Adjuntar expediente"
          className="grid cursor-pointer place-items-center text-texto-4 hover:text-marino"
        >
          <Icono nombre="documento" size={17} />
        </button>
        <span className="flex-1" />
        <span className="text-[11.5px] text-texto-4">
          {cuota.esPremium ? "Consultas ilimitadas" : `${cuota.restantes} consultas restantes`}
        </span>
        {botonEnviar}
      </div>
    </div>
  );
}
