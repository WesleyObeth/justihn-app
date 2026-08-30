"use client";

/**
 * Composer de Jus IA en el hero de `/para-abogados`. Es el gemelo del buscador
 * de la home ciudadana —misma superficie, mismo borde aurora— pero aquí la
 * caja no busca: pregunta. Escribir es libre; al ENVIAR se pide cuenta: la
 * consulta queda guardada en el store y el visitante pasa por `/crear-cuenta`,
 * que se la muestra y la dispara al entrar al chat. Así el lead se captura sin
 * que la pregunta se pierda por el camino.
 *
 * No usa `usePreguntarAJusIA` a propósito: ese hook es para quien YA está
 * dentro del portal y va directo al chat.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { usePortal } from "@/store/portal";

/**
 * Tres preguntas de arranque, deliberadamente de MATERIAS DISTINTAS y con
 * fuentes distintas: Código del Trabajo · Código Procesal Civil más
 * jurisprudencia real · Instituto de la Propiedad. Su trabajo no es cubrir
 * las dudas más frecuentes sino enseñar el alcance en un vistazo — por eso se
 * descartó una segunda pregunta laboral (el tope del auxilio de cesantía),
 * que habría gastado un espacio repitiendo materia.
 */
const SUGERENCIAS = [
  "Prescripción del despido injustificado",
  "Requisitos del proceso monitorio",
  "Inscribir una compraventa en el IP",
];

export function ComposerJusIA() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const nuevaConsulta = usePortal((s) => s.nuevaConsulta);
  const setConsultaPendiente = usePortal((s) => s.setConsultaPendiente);

  const enviar = (texto: string) => {
    const limpio = texto.trim();
    if (!limpio) return;
    // La pregunta se guarda ANTES de mandar a la puerta de cuenta: si el
    // visitante se registra, la consulta lo está esperando del otro lado.
    nuevaConsulta();
    setConsultaPendiente(limpio);
    router.push("/crear-cuenta");
  };

  return (
    <>
      {/* `superficie-dia`: la card es blanca también en la landing black — es
          superficie del producto, no tema de la página. */}
      <div className="superficie-dia relative mx-auto mt-8 max-w-[660px] rounded-[20px] border border-borde bg-white p-4 text-left shadow-[0_16px_48px_rgba(13,33,68,.14)]">
        {/* Anillo de bienvenida: se enciende, gira unos segundos y se apaga
            solo. Señala la caja al entrar sin dejar animación perpetua — y al
            recargar la página vuelve a reproducirse. */}
        <span aria-hidden className="borde-aurora borde-aurora--intro" />
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
            className="magnetic grid h-10 w-10 min-w-10 place-items-center rounded-full text-white transition-opacity disabled:opacity-35"
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
            className="chip-tramite cursor-pointer rounded-full px-3.5 py-1.5"
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
