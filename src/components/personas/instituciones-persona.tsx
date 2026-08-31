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
import { Icono } from "@/components/brand/iconos";
import { INSTITUCIONES, TRAMITES, type Institucion } from "@/data/tramites";

/** Los trámites de una institución, en el orden del seed. */
export function tramitesDe(institucionId: string) {
  return TRAMITES.filter((t) => t.institucionId === institucionId);
}

export function InstitucionesPersona() {
  return (
    <div className="max-w-[1080px]">
      <h1 className="font-display text-[24px] font-bold">Instituciones del Estado</h1>
      <p className="mt-1 max-w-[640px] text-[13px] leading-[1.6] text-texto-3">
        Si ya sabes qué oficina te toca, entra por aquí. Cada institución trae sus trámites con
        requisitos, costos y el orden de los pasos.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INSTITUCIONES.map((inst) => (
          <TarjetaInstitucion key={inst.id} institucion={inst} />
        ))}
      </div>
    </div>
  );
}

function TarjetaInstitucion({ institucion }: { institucion: Institucion }) {
  const suyos = tramitesDe(institucion.id);

  return (
    <Link
      href={`/personas/instituciones/${institucion.id}`}
      className="flex flex-col rounded-2xl border border-borde bg-white p-5 text-marino hover:border-celeste"
    >
      <div className="flex items-start gap-3">
        <span className="font-display grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-chip text-[11px] font-bold text-celeste">
          {institucion.sigla.slice(0, 4)}
        </span>
        <span className="min-w-0">
          <span className="font-display block text-[14.5px] leading-[1.3] font-bold">
            {institucion.nombre}
          </span>
          <span className="mt-0.5 block text-[11.5px] text-texto-4">{institucion.sigla}</span>
        </span>
      </div>

      <p className="mt-3 flex-1 text-[12.5px] leading-[1.55] text-texto-3">
        {institucion.descripcion}
      </p>

      <span className="mt-3.5 flex items-center gap-2 border-t border-borde pt-3 text-[12.5px] text-celeste">
        <Icono nombre="pasos" size={14} />
        {suyos.length} {suyos.length === 1 ? "trámite" : "trámites"}
      </span>
    </Link>
  );
}
