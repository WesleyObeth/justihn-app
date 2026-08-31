"use client";

/**
 * Mis consultas — el otro lado de la pantalla Leads del portal de abogados:
 * misma pregunta, mismo store; cuando el abogado responde allá, la persona lo
 * ve aquí.
 *
 * El formulario ya no domina la pantalla. Cuando la persona todavía no ha
 * preguntado es lo único que importa y va abierto; en cuanto tiene consultas,
 * lo que importa es SEGUIRLAS, así que se pliega detrás de un botón.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import { FormularioPregunta } from "@/components/publico/formulario-pregunta";
import { cn } from "@/lib/utils";
import { getFirmante } from "@/data/directorio";
import type { Lead, RespuestaConsulta } from "@/types/dominio";

type Filtro = "todas" | "respondidas" | "esperando";

export function ConsultasPersona() {
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  /**
   * Se guarda CUÁNTAS consultas había al abrir el formulario, no un booleano:
   * publicar cambia ese número, así que el formulario se pliega solo al enviar
   * sin necesidad de un efecto (que además no pasaría el lint, §4.7.18).
   */
  const [abiertoCon, setAbiertoCon] = useState<number | null>(null);
  const abierto = abiertoCon !== null && preguntas.length === abiertoCon;

  const respondidas = preguntas.filter((p) => respondidos[p.id]?.length);
  const esperando = preguntas.filter((p) => !respondidos[p.id]?.length);
  const lista =
    filtro === "respondidas" ? respondidas : filtro === "esperando" ? esperando : preguntas;

  const sinNada = preguntas.length === 0;

  return (
    <div className="max-w-[1080px]">
      <h1 className="font-display text-[24px] font-bold">Mis consultas</h1>
      <p className="mt-1 text-[13px] text-texto-3">
        Preguntas gratis, en público y sin datos sensibles — abogados colegiados responden.
      </p>

      {!sinNada && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Resumen rotulo="Publicadas" valor={preguntas.length} />
          <Resumen rotulo="Respondidas" valor={respondidas.length} acento={respondidas.length > 0} />
          <Resumen rotulo="Esperando" valor={esperando.length} />
        </div>
      )}

      {/* Abierto cuando no hay nada que seguir; plegado cuando sí. */}
      {sinNada || abierto ? (
        <div className="mt-4">
          <FormularioPregunta />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAbiertoCon(preguntas.length)}
          className="mt-4 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-borde bg-white px-4 py-3.5 text-left text-[13.5px] font-medium text-marino hover:border-celeste"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-chip text-celeste">
            <Icono nombre="mas" size={14} />
          </span>
          Hacer otra consulta — es gratis
        </button>
      )}

      {!sinNada && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            {(
              [
                ["todas", `Todas (${preguntas.length})`],
                ["respondidas", `Respondidas (${respondidas.length})`],
                ["esperando", `Esperando (${esperando.length})`],
              ] as const
            ).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                  filtro === valor
                    ? "border-celeste bg-celeste text-white"
                    : "border-borde bg-white text-texto-3 hover:border-celeste hover:text-marino",
                )}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          <div className="mt-3.5 flex flex-col gap-3">
            {lista.map((p) => (
              <FilaConsulta key={p.id} lead={p} respuestas={respondidos[p.id] ?? []} />
            ))}
            {lista.length === 0 && (
              <p className="rounded-2xl border border-borde bg-white px-6 py-8 text-center text-[13.5px] text-texto-3">
                {filtro === "respondidas"
                  ? "Todavía no te han respondido ninguna. Te avisamos en cuanto pase."
                  : "No tienes consultas esperando — todas tienen respuesta."}
              </p>
            )}
          </div>
        </>
      )}

      {sinNada && <EjemploRespondido />}
    </div>
  );
}

function Resumen({
  rotulo,
  valor,
  acento,
}: {
  rotulo: string;
  valor: number;
  acento?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-borde bg-white px-5 py-4">
      <div className="text-xs tracking-[.4px] text-texto-3 uppercase">{rotulo}</div>
      <div
        className={cn(
          "font-display mt-1 text-[26px] leading-none font-bold",
          acento && "text-exito",
        )}
      >
        {valor}
      </div>
    </div>
  );
}

/** Cada consulta lleva a su detalle: la lista resume, el detalle desarrolla. */
function FilaConsulta({ lead, respuestas }: { lead: Lead; respuestas: RespuestaConsulta[] }) {
  const primera = respuestas[0];
  const firmante = primera ? getFirmante(primera.abogadoId) : undefined;
  return (
    <Link
      href={`/personas/consultas/${lead.id}`}
      className="flex items-start gap-3.5 rounded-2xl border border-borde bg-white p-5 text-marino hover:border-celeste"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste">
            {lead.materia}
          </span>
          <span className="text-[12px] text-texto-4">
            {lead.ciudad} · {lead.cuando}
          </span>
          {primera ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[3px] text-[10.5px] font-bold text-exito">
              <Icono nombre="check" size={9} strokeWidth={2.6} />
              {respuestas.length === 1 ? "Respondida" : `${respuestas.length} respuestas`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-texto-4">
              <Icono nombre="reloj" size={11} />
              Esperando
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55]">{lead.pregunta}</p>

        {primera && firmante && (
          <p className="mt-2 line-clamp-1 text-[12.5px] text-texto-3">
            <b className="font-semibold text-marino">{firmante.nombre}:</b> {primera.texto}
          </p>
        )}
      </div>
      <Icono nombre="atras" size={15} className="mt-1 shrink-0 rotate-180 text-texto-4" />
    </Link>
  );
}

/**
 * El estado vacío enseña una respuesta REAL en vez de esperar: el obstáculo no
 * es no saber dónde escribir, es no creer que alguien conteste (mismo criterio
 * que Inicio y que la sección consultorio de la home).
 */
function EjemploRespondido() {
  const ejemplo = LEADS.find((l) => l.respuestaDemo);
  if (!ejemplo) return null;

  return (
    <div className="mt-5 rounded-2xl border border-borde bg-white p-5">
      <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
        Así se ve una consulta respondida
      </h2>
      <div className="mt-3 rounded-xl border border-borde px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste">
            {ejemplo.materia}
          </span>
          <span className="text-[12px] text-texto-4">{ejemplo.ciudad}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-exito">
            <Icono nombre="check" size={10} strokeWidth={2.6} />
            Respondida
          </span>
        </div>
        <p className="mt-2 text-[13.5px] leading-[1.55]">“{ejemplo.pregunta}”</p>
        <div className="mt-3 border-t border-borde pt-3">
          <div className="flex items-center gap-2.5">
            <span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-celeste text-[11px] font-semibold text-white">
              {ABOGADA_DEMO.iniciales}
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-semibold">{ABOGADA_DEMO.nombre}</span>
              <span className="block text-[11px] text-texto-4">{ABOGADA_DEMO.colegiacion}</span>
            </span>
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.6] text-texto-3">{ejemplo.respuestaDemo}</p>
        </div>
      </div>
    </div>
  );
}
