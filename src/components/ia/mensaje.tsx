"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { AvatarJusIA, SimboloJusIA, SimboloJusIALinear } from "@/components/brand/logos";
import { ChipMateria } from "@/components/ui/primitivos";
import { usePortal } from "@/store/portal";
import { isFuenteOficial } from "@/lib/security/sanitize";
import type { MensajeChat } from "@/types/dominio";

export function BurbujaUsuario({ mensaje }: { mensaje: MensajeChat }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[76%] rounded-[14px] bg-[#e9eff6] px-4 py-[11px] text-sm leading-[1.6] whitespace-pre-line text-marino">
        {mensaje.adjunto && (
          <div className="mb-2 flex items-center gap-[9px] rounded-[9px] border border-[#d5dfeb] bg-white px-3 py-2">
            <span className="grid place-items-center text-celeste">
              <Icono nombre="documento" size={16} />
            </span>
            <div>
              <div className="text-[12.5px] font-semibold">{mensaje.adjunto.nombre}</div>
              <div className="text-[10.5px] text-texto-4">{mensaje.adjunto.meta}</div>
            </div>
          </div>
        )}
        {mensaje.text}
      </div>
    </div>
  );
}

export function RespuestaJusIA({
  mensaje,
  onChip,
}: {
  mensaje: MensajeChat;
  onChip: (texto: string) => void;
}) {
  const mostrarToast = usePortal((s) => s.mostrarToast);

  const copiar = async () => {
    const citas = mensaje.citas?.map((c) => `— ${c.etiqueta}`).join("\n") ?? "";
    try {
      await navigator.clipboard.writeText(citas ? `${mensaje.text}\n\n${citas}` : mensaje.text);
      mostrarToast("Respuesta copiada con sus citas");
    } catch {
      mostrarToast("No se pudo copiar — selecciona el texto manualmente");
    }
  };

  return (
    <div className="flex gap-3">
      <AvatarJusIA size={28} />
      <div className="min-w-0 flex-1">
        <div className="font-display text-xs font-bold text-marino">Jus IA</div>
        <div className="mt-1 text-[14.5px] leading-[1.7] whitespace-pre-line text-[#1c3350]">
          {mensaje.text}
        </div>

        {mensaje.tabla && <TablaResultado filas={mensaje.tabla} />}
        {mensaje.tarjeta && <TarjetaSentenciaChat tarjeta={mensaje.tarjeta} />}
        {mensaje.escrito && <EscritoChat escrito={mensaje.escrito} />}
        {mensaje.citas && mensaje.citas.length > 0 && <Citas citas={mensaje.citas} />}

        {mensaje.chips && mensaje.chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-[7px]">
            {mensaje.chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onChip(chip)}
                className="cursor-pointer rounded-full border border-chip-borde bg-white px-3.5 py-1.5 text-xs font-medium text-celeste hover:bg-chip"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center gap-3.5 text-[11.5px] text-texto-4">
          <button type="button" onClick={copiar} className="cursor-pointer hover:text-celeste">
            Copiar
          </button>
          <button
            type="button"
            onClick={() => mostrarToast("Guardada en tu historial")}
            className="cursor-pointer hover:text-celeste"
          >
            Guardar en historial
          </button>
          <button
            type="button"
            onClick={() => mostrarToast("Insertada en tu borrador de escrito")}
            className="cursor-pointer hover:text-celeste"
          >
            Insertar en escrito
          </button>
          {mensaje.meta && <span className="ml-auto text-[#b3bfd0]">{mensaje.meta}</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * Borrador de escrito NATIVO en el hilo (nada de drawers): documento editable
 * en línea con las acciones al pie. El borrador es del profesional — se edita
 * aquí mismo y la advertencia de responsabilidad queda siempre visible.
 */
function EscritoChat({ escrito }: { escrito: NonNullable<MensajeChat["escrito"]> }) {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [texto, setTexto] = useState(escrito.cuerpo);
  const campo = useRef<HTMLTextAreaElement>(null);

  // Auto-alto con tope: el documento crece hasta ~420px y luego scrollea.
  useLayoutEffect(() => {
    const el = campo.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 420)}px`;
  }, [texto]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      mostrarToast("Escrito copiado al portapapeles");
    } catch {
      mostrarToast("No se pudo copiar — selecciona el texto manualmente");
    }
  };

  return (
    <div className="mt-3 max-w-[620px] overflow-hidden rounded-[12px] border border-borde bg-white">
      <div
        className="flex items-center gap-2.5 px-4 py-3 text-white"
        style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
      >
        <SimboloJusIALinear size={15} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-display truncate text-[13.5px] font-bold">{escrito.titulo}</div>
          <div className="text-[10.5px] text-sobre-marino">
            Borrador editable · citas verificadas incluidas
          </div>
        </div>
      </div>

      <div className="border-b border-aviso-borde bg-aviso px-4 py-2 text-[11.5px] text-aviso-cuerpo">
        Completa los datos entre [corchetes] — la responsabilidad del escrito es del profesional.
      </div>

      <textarea
        ref={campo}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        aria-label={`Borrador: ${escrito.titulo}`}
        className="w-full resize-none overflow-y-auto border-none bg-white px-4.5 py-3.5 text-[13px] leading-[1.7] text-marino outline-none"
      />

      <div className="flex flex-wrap gap-2 border-t border-borde px-4 py-2.5">
        <button
          type="button"
          onClick={copiar}
          className="cursor-pointer rounded-lg bg-marino px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-celeste"
        >
          Copiar escrito
        </button>
        <button
          type="button"
          onClick={() => mostrarToast("La descarga .docx llega con el backend — copia el texto mientras tanto")}
          className="cursor-pointer rounded-lg border border-borde bg-lienzo px-3.5 py-2 text-[12px] font-medium text-marino hover:border-celeste"
        >
          Descargar .docx
        </button>
      </div>
    </div>
  );
}

function TablaResultado({ filas }: { filas: [string, string][] }) {
  return (
    <div className="mt-3 max-w-[440px] overflow-hidden rounded-[10px] border border-borde">
      {filas.map(([clave, valor], i) => {
        const esTotal = i === filas.length - 1;
        return (
          <div
            key={clave}
            className={`flex justify-between gap-4 px-3.5 py-[9px] ${
              esTotal ? "bg-lienzo" : i > 0 ? "border-t border-sutil" : ""
            }`}
          >
            <span className="text-[13px] text-texto-2">{clave}</span>
            <span
              className={`font-mono text-[13px] text-marino ${esTotal ? "font-bold" : "font-medium"}`}
            >
              {valor}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TarjetaSentenciaChat({
  tarjeta,
}: {
  tarjeta: NonNullable<MensajeChat["tarjeta"]>;
}) {
  return (
    <Link
      href={`/abogados/jurisprudencia/${tarjeta.sentenciaId}`}
      className="mt-3 block max-w-[480px] rounded-[10px] border border-borde bg-[#fbfcfe] px-4 py-3.5 text-marino hover:border-celeste hover:text-marino"
    >
      <div className="flex items-center gap-2">
        <ChipMateria>{tarjeta.materia}</ChipMateria>
        <span className="font-mono text-[11px] text-texto-4">{tarjeta.expediente}</span>
      </div>
      <div className="mt-1.5 text-[13.5px] font-semibold">{tarjeta.titulo}</div>
      <div className="mt-[3px] text-xs text-texto-3">
        {tarjeta.meta} · Fallo: {tarjeta.fallo}
      </div>
      <div className="mt-1.5 text-xs text-celeste">Ver sentencia íntegra →</div>
    </Link>
  );
}

/**
 * Chips de citas. Solo se convierten en enlace si la URL apunta a una fuente
 * oficial verificada (§3.3): nunca un `href` de esquema arbitrario.
 */
function Citas({ citas }: { citas: NonNullable<MensajeChat["citas"]> }) {
  const mostrarToast = usePortal((s) => s.mostrarToast);

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {citas.map((cita) => {
        const contenido = (
          <>
            <Icono nombre="libro" size={11} strokeWidth={2} className="shrink-0" />
            {cita.etiqueta}
          </>
        );
        const clases =
          "inline-flex items-center gap-[5px] rounded-full border border-chip-borde bg-chip px-[9px] py-[3px] text-[11.5px] text-celeste";

        return isFuenteOficial(cita.url) ? (
          <a
            key={cita.etiqueta}
            href={cita.url}
            target="_blank"
            rel="noopener noreferrer"
            className={clases}
          >
            {contenido}
          </a>
        ) : (
          <button
            key={cita.etiqueta}
            type="button"
            onClick={() => mostrarToast("Abriendo la fuente oficial…")}
            className={`${clases} cursor-pointer`}
          >
            {contenido}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Estado "pensando": el símbolo de Jus IA gira sobre su eje — sin la caja
 * marina del avatar, solo el logo — y el mensaje progresivo va acompañado de
 * puntos de escritura. Todo CSS puro (keyframes en globals.css) — nada que
 * recalcule React por frame.
 */
export function IndicadorPensando({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <LogoJusIAPensando />
      <div className="flex items-baseline gap-2">
        <span
          className="text-[13px] text-texto-4"
          style={{ animation: "pulseSoft 1.2s ease-in-out infinite" }}
        >
          {mensaje}
        </span>
        <PuntosEscribiendo />
      </div>
    </div>
  );
}

function LogoJusIAPensando() {
  return (
    /* Mismo hueco de 28px que ocupa el avatar en las respuestas, para que el
       hilo no salte cuando llega el mensaje. */
    <span
      aria-hidden
      className="grid h-7 w-7 shrink-0 place-items-center"
      style={{ perspective: 120 }}
    >
      <SimboloJusIA
        size={24}
        variante="claro"
        className="[animation:logoGiraY_1.5s_ease-in-out_infinite]"
      />
    </span>
  );
}

function PuntosEscribiendo() {
  return (
    <span aria-hidden className="flex items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-celeste"
          style={{ animation: `puntoEscribe 1.1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </span>
  );
}
