"use client";

/**
 * Catálogo de trámites POR INSTITUCIÓN — el pedido literal del socio abogado
 * ("ver todas las instituciones del Estado y los trámites de cada una, ej. el
 * IP", feedback 2026-08-29).
 *
 * Ojo con §1.3: en la home pública se decidió NO ofrecer filtro por
 * institución, porque quien llega de Google no busca "un trámite de ONCAE",
 * busca "voy a abrir un negocio". Eso sigue en pie. Aquí es distinto: dentro
 * del portal sí hay gente que ya sabe que su asunto es del IP y entra por ahí.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import {
  buscarInstituciones,
  INSTITUCIONES,
  TRAMITES,
  type Institucion,
} from "@/data/tramites";
import { usePortal } from "@/store/portal";

/** Los trámites de una institución, en el orden del seed. */
export function tramitesDe(institucionId: string) {
  return TRAMITES.filter((t) => t.institucionId === institucionId);
}

export function InstitucionesPersona() {
  const [q, setQ] = useState("");
  const resultados = buscarInstituciones(q);

  return (
    <div className="max-w-[1180px]">
      <h1 className="font-display text-[24px] font-bold">Instituciones del Estado</h1>
      <p className="mt-1 max-w-[660px] text-[13px] leading-[1.6] text-texto-3">
        Si ya sabes qué oficina te toca, entra por aquí. Cada institución trae sus trámites con
        requisitos, costos y el orden de los pasos.
      </p>

      <div className="mt-4 flex h-10 max-w-[420px] items-center gap-2 rounded-lg border border-borde bg-white px-3.5 focus-within:border-celeste">
        <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={80}
          placeholder="Busca por sigla o por lo que hace: impuestos, propiedad…"
          aria-label="Buscar institución"
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Limpiar búsqueda"
            className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded text-texto-4 hover:text-marino"
          >
            <Icono nombre="cerrar" size={13} />
          </button>
        )}
      </div>

      <p className="mt-3 text-[12.5px] text-texto-3">
        {resultados.length === INSTITUCIONES.length
          ? `${INSTITUCIONES.length} instituciones · ${TRAMITES.length} guías en total`
          : `${resultados.length} ${resultados.length === 1 ? "institución" : "instituciones"}`}
      </p>

      {resultados.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-borde bg-white px-6 py-10 text-center">
          <p className="text-[14px] font-semibold">Ninguna institución con ese nombre</p>
          <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-[1.6] text-texto-3">
            Prueba con lo que necesitas hacer — el buscador de trámites entiende mejor esa forma
            de preguntar.
          </p>
          <Link
            href="/personas/tramites"
            className="mt-4 inline-block rounded-lg bg-celeste px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-cruce"
          >
            Buscar por trámite
          </Link>
        </div>
      ) : (
        <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {resultados.map((inst) => (
            <TarjetaInstitucion key={inst.id} institucion={inst} />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaInstitucion({ institucion }: { institucion: Institucion }) {
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const suyos = tramitesDe(institucion.id);
  const enCurso = suyos.filter((t) => {
    const hechos = (pasosTramite[t.id] ?? []).length;
    return hechos > 0 && hechos < t.pasos.length;
  }).length;

  return (
    <Link
      href={`/personas/instituciones/${institucion.id}`}
      className="flex flex-col rounded-xl border border-borde bg-white p-4.5 text-marino hover:border-celeste"
    >
      {/* La sigla va como rótulo, no dentro de un cuadro: `slice(0, 4)` cortaba
          «ONCAE» en «ONCA» y «MiAmbiente» en «MiAm», y además repetía un dato
          que ya estaba dos líneas más abajo. Mismo patrón que la card de guía. */}
      <span className="text-[11px] font-bold tracking-[.8px] text-celeste uppercase">
        {institucion.sigla}
      </span>
      <span className="font-display mt-1 text-[15px] leading-[1.35] font-semibold">
        {institucion.nombre}
      </span>
      <p className="mt-1.5 flex-1 text-[12.5px] leading-[1.55] text-texto-3">
        {institucion.descripcion}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-borde pt-2.5 text-[11.5px] text-texto-4">
        <span className="inline-flex items-center gap-1.5">
          <Icono nombre="pasos" size={12} />
          {suyos.length} {suyos.length === 1 ? "guía" : "guías"}
        </span>
        {institucion.sitio && (
          <>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Icono nombre="check" size={10} strokeWidth={2.6} />
              portal oficial
            </span>
          </>
        )}
        {enCurso > 0 && (
          <span className="ml-auto font-semibold text-celeste">
            {enCurso} en curso
          </span>
        )}
      </div>
    </Link>
  );
}
