"use client";

import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import {
  INSTITUCIONES,
  materiasDeInstitucion,
  type Institucion,
} from "@/data/tramites";
import { usePortal } from "@/store/portal";
import { tramitesDe } from "./instituciones-persona";

/**
 * Una institución y sus trámites.
 *
 * El enlace al portal solo existe si el host pasó la whitelist §3.3 — ver el
 * comentario del campo `sitio`. Cuando NO lo hay se dice por qué, en vez de
 * dejar el hueco: que Justihn no lo enlace no significa que la oficina no
 * exista.
 */
export function DetalleInstitucion({ institucion }: { institucion: Institucion }) {
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const suyos = tramitesDe(institucion.id);
  const materias = materiasDeInstitucion(institucion.id);
  const otras = INSTITUCIONES.filter((i) => i.id !== institucion.id).slice(0, 5);

  return (
    <div className="max-w-[1180px]">
      <Link
        href="/personas/instituciones"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-texto-3 hover:text-celeste"
      >
        <Icono nombre="atras" size={13} />
        Instituciones
      </Link>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_312px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-6">
            <span className="text-[11px] font-bold tracking-[.8px] text-celeste uppercase">
              {institucion.sigla}
            </span>
            <h1 className="font-display mt-1 text-[22px] leading-[1.25] font-bold">
              {institucion.nombre}
            </h1>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-texto-2">
              {institucion.descripcion}
            </p>

            {materias.length > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] text-texto-4">Materias:</span>
                {materias.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-borde bg-white p-6">
            <h2 className="font-display text-[17px] font-bold">
              {suyos.length} {suyos.length === 1 ? "guía" : "guías"} de esta institución
            </h2>
            <p className="mt-1 text-[12.5px] text-texto-3">
              Cada una con sus requisitos, su costo y su fuente oficial.
            </p>

            <div className="mt-3.5 flex flex-col gap-2.5">
              {suyos.map((t) => {
                const hechos = (pasosTramite[t.id] ?? []).length;
                const completo = hechos === t.pasos.length;
                return (
                  <Link
                    key={t.id}
                    href={`/personas/tramites/${t.id}`}
                    className="rounded-xl border border-borde px-4.5 py-4 text-marino hover:border-celeste"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-[14px] font-semibold">{t.nombre}</span>
                      {hechos > 0 ? (
                        completo ? (
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-exito">
                            <Icono nombre="check" size={10} strokeWidth={2.6} />
                            Completo
                          </span>
                        ) : (
                          <span className="text-[11.5px] font-semibold whitespace-nowrap text-celeste">
                            {hechos}/{t.pasos.length} pasos
                          </span>
                        )
                      ) : (
                        <span className="text-[11.5px] whitespace-nowrap text-texto-4">
                          {t.pasos.length} pasos · {t.tasaCorta}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">{t.resumen}</p>
                    {hechos > 0 && !completo && (
                      <div className="mt-2 h-1 overflow-hidden rounded bg-sutil">
                        <div
                          className="h-full rounded bg-celeste"
                          style={{ width: `${(hechos / t.pasos.length) * 100}%` }}
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              Portal oficial
            </h2>
            {institucion.sitio ? (
              <>
                <a
                  href={institucion.sitio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium"
                >
                  <Icono nombre="check" size={12} strokeWidth={2.6} />
                  {new URL(institucion.sitio).hostname.replace(/^www\./, "")}
                </a>
                <p className="mt-2 text-[11.5px] leading-[1.55] text-texto-4">
                  Es el sitio del Estado, no de Justihn: ahí se hacen los trámites en línea
                  cuando la institución los ofrece.
                </p>
              </>
            ) : (
              /* Sin enlace, pero con explicación: el hueco solo se lee como
                 descuido si no se dice por qué está. */
              <p className="mt-2 text-[12.5px] leading-[1.6] text-texto-3">
                No enlazamos su portal todavía: no responde o no hemos podido comprobarlo. Los
                datos de sus guías sí están verificados contra su fuente.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="font-display text-[14.5px] font-bold">¿No es lo que buscabas?</h2>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
              Pregunta gratis y un abogado colegiado te dice qué oficina te toca.
            </p>
            <Link
              href="/personas/consultas"
              className="mt-3 inline-block rounded-lg bg-marino px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-celeste hover:text-white"
            >
              Hacer una consulta
            </Link>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              Otras instituciones
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {otras.map((i) => (
                <Link
                  key={i.id}
                  href={`/personas/instituciones/${i.id}`}
                  className="rounded-full border border-borde px-3 py-1.5 text-[12px] font-medium text-texto-2 hover:border-celeste hover:text-celeste"
                >
                  {i.sigla}
                </Link>
              ))}
              <Link
                href="/personas/instituciones"
                className="rounded-full px-3 py-1.5 text-[12px] font-medium text-celeste hover:text-cruce"
              >
                Ver todas →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
