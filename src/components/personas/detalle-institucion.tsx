"use client";

import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import { type Institucion } from "@/data/tramites";
import { tramitesDe } from "./instituciones-persona";

/** Una institución y sus trámites. El enlace al portal solo existe si el host
 *  pasó la whitelist §3.3 — ver el comentario del campo `sitio`. */
export function DetalleInstitucion({ institucion }: { institucion: Institucion }) {
  const suyos = tramitesDe(institucion.id);

  return (
    <div className="max-w-[860px]">
      <Link
        href="/personas/instituciones"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-texto-3 hover:text-celeste"
      >
        <Icono nombre="atras" size={13} />
        Instituciones
      </Link>

      <div className="mt-3 flex items-start gap-4">
        <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-chip text-[12px] font-bold text-celeste">
          {institucion.sigla.slice(0, 4)}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[22px] leading-[1.25] font-bold">
            {institucion.nombre}
          </h1>
          <p className="mt-1 text-[13px] leading-[1.6] text-texto-3">{institucion.descripcion}</p>
        </div>
      </div>

      {institucion.sitio && (
        <a
          href={institucion.sitio}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[12.5px]"
        >
          <Icono nombre="check" size={12} strokeWidth={2.6} />
          Portal oficial: {new URL(institucion.sitio).hostname.replace(/^www\./, "")}
        </a>
      )}

      <h2 className="mt-6 text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
        {suyos.length} {suyos.length === 1 ? "trámite" : "trámites"} en Justihn
      </h2>

      <div className="mt-2.5 flex flex-col gap-2.5">
        {suyos.map((t) => (
          <Link
            key={t.id}
            href={`/personas/tramites/${t.id}`}
            className="rounded-xl border border-borde bg-white px-4.5 py-4 text-marino hover:border-celeste"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-[14px] font-semibold">{t.nombre}</span>
              <span className="text-[11.5px] whitespace-nowrap text-texto-4">
                {t.pasos.length} pasos · {t.tasaCorta}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">{t.resumen}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
