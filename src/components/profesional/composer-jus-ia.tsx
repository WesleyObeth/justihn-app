"use client";

/**
 * Composer de Jus IA en el hero de `/para-abogados`. Es el gemelo del buscador
 * de la home ciudadana —misma superficie, mismo borde aurora— pero aquí la
 * caja no busca: pregunta. Al enviar, `usePreguntarAJusIA` deja la consulta
 * disparándose al llegar al chat (`/abogados`), que es la demostración del
 * producto: preguntas algo real y ves con qué fuentes responde.
 */
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";

/** Preguntas de arranque: las que un litigante hondureño haría de verdad. */
const SUGERENCIAS = [
  "Prescripción del despido injustificado",
  "Tope del auxilio de cesantía",
  "Requisitos del proceso monitorio",
  "Inscribir una compraventa en el IP",
];

export function ComposerJusIA() {
  const [q, setQ] = useState("");
  const preguntar = usePreguntarAJusIA();

  const enviar = (texto: string) => {
    const limpio = texto.trim();
    if (!limpio) return;
    preguntar(limpio, { enviarDirecto: true });
  };

  return (
    <>
      <div className="relative mx-auto mt-8 max-w-[660px] rounded-[20px] border border-borde bg-white p-4 text-left shadow-[0_16px_48px_rgba(13,33,68,.14)]">
        <span aria-hidden className="borde-aurora" />
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            // Enter envía; Shift+Enter deja escribir un párrafo largo.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar(q);
            }
          }}
          rows={2}
          placeholder="Preguntar a Jus IA"
          aria-label="Preguntar a Jus IA"
          className="min-h-[56px] w-full resize-none border-none bg-transparent text-[15.5px] leading-[1.6] text-marino outline-none"
        />
        <div className="mt-1 flex items-center justify-between gap-3">
          <span
            className="flex items-center gap-1.5 text-[11.5px] leading-[1.4]"
            style={{ color: "var(--muted)" }}
          >
            <Icono nombre="check" size={12} strokeWidth={2.6} />
            Responde con la sentencia o el artículo — o dice que no lo encontró
          </span>
          <button
            type="button"
            onClick={() => enviar(q)}
            disabled={!q.trim()}
            aria-label="Preguntar a Jus IA"
            className="grid h-10 w-10 min-w-10 place-items-center rounded-full text-white transition-opacity disabled:opacity-35"
            style={{ background: "var(--turq)" }}
          >
            <Icono nombre="enviar" size={17} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12.5px]">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => enviar(s)}
            className="cursor-pointer rounded-full border px-3.5 py-1.5 transition-colors hover:border-celeste hover:text-celeste"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
