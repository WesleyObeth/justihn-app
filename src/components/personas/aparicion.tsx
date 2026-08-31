"use client";

/**
 * Una aparición del corpus, desplegable.
 *
 * Vive aquí y no dentro de una pantalla porque la usan **las dos de
 * Verificación**: el Informe Verifica (mirar a un tercero) y Mi nombre
 * (vigilar el propio). Las dos llevan el mismo disclaimer de homónimos, que
 * pide "abre la sentencia y compruébalo" — con dos copias, arreglar una
 * dejaría a la otra pidiendo algo imposible, que es como estaban antes.
 */
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import type { Aparicion } from "@/data/monitoreo";

/**
 * Una aparición, que SE PUEDE ABRIR.
 *
 * El disclaimer pide "abre cada sentencia y contrasta" y antes no había forma
 * de hacerlo: el texto exigía algo que la pantalla no permitía. Al desplegarla
 * se ve el resumen del CEDIJ, quién la firmó, el fallo y el fragmento del texto
 * oficial — que es con lo que se contrasta si el homónimo es o no la persona.
 */
export function FilaAparicion({ aparicion: { sentencia: s, rol } }: { aparicion: Aparicion }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div className="rounded-[10px] border border-borde">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full cursor-pointer flex-col gap-1.5 px-4 py-3 text-left hover:bg-lienzo"
      >
        <span className="flex flex-wrap items-center gap-2 text-[11.5px] text-texto-4">
          <span className="rounded-full bg-chip px-2.5 py-[2px] font-medium text-celeste">
            {s.materia}
          </span>
          {rol && <span className="font-semibold text-texto-3">{rol}</span>}
          <span>
            {s.organo} · {s.fecha}
          </span>
          <span className="ml-auto font-mono">{s.expediente}</span>
        </span>
        <span className="flex w-full items-start gap-2">
          <span className="min-w-0 flex-1 text-[13.5px] leading-[1.5] font-medium">
            {s.titulo}
          </span>
          <span className="mt-0.5 shrink-0 text-[11.5px] font-medium text-celeste">
            {abierta ? "Cerrar" : "Abrir"}
          </span>
        </span>
      </button>

      {abierta && (
        <div className="border-t border-borde px-4 py-3.5">
          <Dato rotulo="Resumen del CEDIJ">{s.resumen}</Dato>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Dato rotulo="Firma">{s.ponente}</Dato>
            <Dato rotulo="Fallo">{s.fallo}</Dato>
          </div>
          <Dato rotulo="Fragmento del texto oficial" className="mt-3">
            {s.extracto}
          </Dato>
          {s.fuenteUrl ? (
            <a
              href={s.fuenteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium"
            >
              <Icono nombre="check" size={12} strokeWidth={2.6} />
              Ver la sentencia íntegra en el Poder Judicial
            </a>
          ) : (
            /* El seed del piloto no trae la URL por sentencia (§8). Se dice, en
               vez de dejar un enlace que no existe. */
            <p className="mt-3 text-[11.5px] leading-[1.5] text-texto-4">
              El enlace al documento íntegro del Poder Judicial llega cuando esté indexado el
              corpus completo. Lo de arriba es el texto oficial que devuelve su API.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function Dato({
  rotulo,
  children,
  className,
}: {
  rotulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10.5px] font-semibold tracking-[.8px] text-texto-4 uppercase">
        {rotulo}
      </div>
      <p className="mt-1 text-[12.5px] leading-[1.6] text-texto-2">{children}</p>
    </div>
  );
}

