"use client";

import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import { getInstitucion, type Tramite } from "@/data/tramites";
import { buscarAbogados } from "@/data/directorio";
import { AvisoProfesional } from "@/components/publico/paso-profesional";
import { usePortal } from "@/store/portal";

// ── Detalle de un trámite ──────────────────────────────────────────────────

export function DetalleTramite({ tramite }: { tramite: Tramite }) {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const inst = getInstitucion(tramite.institucionId)!;
  const abogados = buscarAbogados(tramite.materia).slice(0, 2);

  return (
    <div className="mx-auto max-w-[1140px] px-4 py-8 md:px-6">
      <Link href="/#tramites" className="text-[13px]">
        ← Todas las guías
      </Link>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl border border-borde bg-white p-6 md:p-7">
          <div className="text-[11px] font-bold tracking-[.8px] text-celeste uppercase">
            {inst.sigla} · {inst.nombre}
          </div>
          <h1 className="font-display mt-1.5 text-[24px] leading-[1.25] font-bold">
            {tramite.nombre}
          </h1>
          <p className="mt-2 text-[14px] leading-[1.65] text-texto-2">
            {tramite.resumen}
          </p>

          {tramite.fuenteUrl && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-exito-bg px-2.5 py-1 font-semibold text-exito">
                <Icono nombre="check" size={12} strokeWidth={2.6} />
                Verificado con la fuente oficial
              </span>
              <a
                href={tramite.fuenteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-celeste hover:text-marino"
              >
                {tramite.fuenteNombre ?? "Ver la fuente"} →
              </a>
            </div>
          )}

          {/* Patrón Jusbrasil: la landing da la probadita (paso 1); la guía
              completa, el checklist y los costos viven en tu cuenta gratis. */}
          <ol className="mt-5 flex flex-col">
            <li className="flex gap-3.5 py-4">
              <span className="grid h-[28px] w-[28px] min-w-[28px] place-items-center rounded-full bg-chip text-[13px] font-bold text-celeste">
                1
              </span>
              <div>
                <div className="text-[14.5px] font-semibold">
                  {tramite.pasos[0]!.titulo}
                </div>
                <p className="mt-1 text-[13.5px] leading-[1.6] text-texto-3">
                  {tramite.pasos[0]!.detalle}
                </p>
                {tramite.pasos[0]!.profesional && (
                  <AvisoProfesional
                    profesional={tramite.pasos[0]!.profesional}
                    materia={tramite.materia}
                  />
                )}
              </div>
            </li>
          </ol>

          <div
            aria-hidden
            className="pointer-events-none flex flex-col gap-3 opacity-50 blur-[3px] select-none"
          >
            {tramite.pasos.slice(1, 3).map((paso, i) => (
              <div
                key={paso.titulo}
                className="flex gap-3.5 border-t border-borde-suave py-4"
              >
                <span className="grid h-[28px] w-[28px] min-w-[28px] place-items-center rounded-full bg-chip text-[13px] font-bold text-celeste">
                  {i + 2}
                </span>
                <div>
                  <div className="text-[14.5px] font-semibold">
                    {paso.titulo}
                  </div>
                  <p className="mt-1 text-[13.5px] leading-[1.6] text-texto-3">
                    ████ ███ ██████
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[-8px] rounded-xl border border-chip-borde bg-chip/60 p-5 text-center">
            <div className="font-display text-[16px] font-bold">
              Crea tu cuenta gratis para ver la guía completa
            </div>
            <p className="mx-auto mt-1 max-w-[420px] text-[12.5px] leading-[1.55] text-texto-3">
              Los {tramite.pasos.length} pasos con requisitos y costos, tu
              avance guardado, y el consultorio para preguntar gratis.
            </p>
            <Link
              // El gate promete "crear cuenta": tiene que PASAR por el alta y volver
              // aquí después, no colar al visitante dentro del portal.
              href={`/crear-cuenta?tipo=persona&next=${encodeURIComponent(`/personas/tramites/${tramite.id}`)}`}
              className="mt-3.5 inline-block rounded-xl bg-celeste px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-cruce"

              style={{ color: "#fff" }}
            >
              Crear mi cuenta gratis
            </Link>
            <p className="mt-2 text-[11px] text-texto-4">
              Sin tarjeta · demo de validación
            </p>
          </div>
        </article>

        {/* ── Lateral: el funnel — abogados de la materia ── */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              Abogados que te pueden ayudar
            </h2>
            <p className="mt-1 text-[12.5px] text-texto-3">
              Especialistas en {tramite.materia.toLowerCase()} del directorio.
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {abogados.map((a) => (
                <div key={a.id} className="rounded-xl border border-borde p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-display grid h-10 w-10 place-items-center rounded-full text-[14px] font-semibold text-white"
                      style={{
                        background: "linear-gradient(180deg,#0d2144,#0a1830)",
                      }}
                    >
                      {a.iniciales}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold">
                        {a.nombre}
                      </div>
                      <div className="text-[11.5px] text-texto-4">
                        {a.ciudad} · {a.anios} años
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      mostrarToast(
                        `Así le escribes a ${a.nombre} desde Justihn (demo de validación)`,
                      )
                    }
                    className="mt-3 w-full cursor-pointer rounded-lg bg-celeste py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
                  >
                    Consultar con{" "}
                    {a.nombre.replace(/^Abg\.\s*/, "").split(" ")[0]}
                  </button>
                </div>
              ))}
            </div>
            <Link
              href={`/?materia=${encodeURIComponent(tramite.materia)}#directorio`}
              className="mt-3 inline-block text-[12.5px]"
            >
              Buscar abogado de {tramite.materia.toLowerCase()} →
            </Link>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="font-display text-[15px] font-bold">
              ¿Tu caso es distinto?
            </h2>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
              Pregunta gratis en el consultorio y un abogado colegiado te
              orienta.
            </p>
            <Link
              href="/#consultorio"
              className="mt-3 inline-block rounded-lg bg-marino px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-celeste hover:text-white"

              style={{ color: "#fff" }}
            >
              Ir al consultorio
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
