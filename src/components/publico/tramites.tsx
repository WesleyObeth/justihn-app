"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { getInstitucion, INSTITUCIONES, TRAMITES, type Tramite } from "@/data/tramites";
import { buscarAbogados } from "@/data/directorio";
import { usePortal } from "@/store/portal";
import { cn } from "@/lib/utils";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Índice de trámites: buscador + filtro por institución, todo en la URL. */
export function IndiceTramites() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const institucion = params.get("institucion") ?? "todas";

  const actualizarUrl = (termino: string, inst: string) => {
    const p = new URLSearchParams();
    if (termino.trim()) p.set("q", termino.trim());
    if (inst !== "todas") p.set("institucion", inst);
    const query = p.toString();
    router.replace(`/tramites${query ? `?${query}` : ""}`, { scroll: false });
  };

  const termino = normalizar(q.trim());
  const filtrados = TRAMITES.filter((t) => {
    const porInst = institucion === "todas" || t.institucionId === institucion;
    const porTermino =
      !termino ||
      normalizar(`${t.nombre} ${t.paraQuien} ${t.resumen} ${getInstitucion(t.institucionId)?.nombre}`).includes(
        termino,
      );
    return porInst && porTermino;
  });

  return (
    <div className="mx-auto max-w-[1140px] px-4 py-8 md:px-6">
      <h1 className="font-display text-[26px] font-bold">Guías de trámites</h1>
      <p className="mt-1 text-[13.5px] text-texto-3">
        Paso a paso, requisitos y en qué institución — orientación general verificada con
        profesionales del derecho.
      </p>

      <div className="mt-5 flex min-w-[220px] items-center gap-2 rounded-xl border border-borde bg-white px-4 py-3 focus-within:border-celeste sm:max-w-[480px]">
        <Icono nombre="buscar" size={16} className="shrink-0 text-texto-4" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            actualizarUrl(e.target.value, institucion);
          }}
          placeholder="Busca tu trámite…"
          aria-label="Buscar trámite"
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
        />
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        <ChipInstitucion activo={institucion === "todas"} onClick={() => actualizarUrl(q, "todas")}>
          Todas ({TRAMITES.length})
        </ChipInstitucion>
        {INSTITUCIONES.map((inst) => {
          const n = TRAMITES.filter((t) => t.institucionId === inst.id).length;
          if (n === 0) return null;
          return (
            <ChipInstitucion
              key={inst.id}
              activo={institucion === inst.id}
              onClick={() => actualizarUrl(q, inst.id)}
            >
              {inst.sigla} ({n})
            </ChipInstitucion>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((t) => {
          const inst = getInstitucion(t.institucionId)!;
          return (
            <Link
              key={t.id}
              href={`/tramites/${t.id}`}
              className="flex flex-col rounded-xl border border-borde bg-white p-4.5 text-marino hover:border-celeste"
            >
              <div className="text-[11px] font-bold tracking-[.8px] text-celeste uppercase">
                {inst.sigla}
              </div>
              <div className="font-display mt-1 text-[15.5px] leading-[1.35] font-semibold">
                {t.nombre}
              </div>
              <p className="mt-1.5 flex-1 text-[12.5px] leading-[1.55] text-texto-3">
                {t.paraQuien}
              </p>
              <div className="mt-2.5 text-[12.5px] text-celeste">
                Ver la guía ({t.pasos.length} pasos) →
              </div>
            </Link>
          );
        })}
      </div>

      {filtrados.length === 0 && (
        <div className="mt-5 rounded-xl border border-borde bg-white px-6 py-10 text-center">
          <p className="text-[13.5px] text-texto-3">
            Aún no tenemos una guía para «{q.trim()}». Pregunta en el consultorio y un abogado te
            orienta gratis — y tu pregunta nos dice qué guía escribir después.
          </p>
          <Link
            href="/consultorio"
            className="mt-4 inline-block rounded-xl bg-celeste px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-cruce"
          >
            Preguntar en el consultorio
          </Link>
        </div>
      )}
    </div>
  );
}

function ChipInstitucion({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-[7px] text-[12.5px] font-medium transition-colors",
        activo
          ? "border-celeste bg-celeste text-white"
          : "border-borde bg-white text-texto-3 hover:border-celeste",
      )}
    >
      {children}
    </button>
  );
}

// ── Detalle de un trámite ──────────────────────────────────────────────────

export function DetalleTramite({ tramite }: { tramite: Tramite }) {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const inst = getInstitucion(tramite.institucionId)!;
  const abogados = buscarAbogados(tramite.materia).slice(0, 2);

  return (
    <div className="mx-auto max-w-[1140px] px-4 py-8 md:px-6">
      <Link href="/tramites" className="text-[13px]">
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
          <p className="mt-2 text-[14px] leading-[1.65] text-texto-2">{tramite.resumen}</p>

          <ol className="mt-5 flex flex-col">
            {tramite.pasos.map((paso, i) => (
              <li
                key={paso.titulo}
                className="flex gap-3.5 border-b border-borde-suave py-4 last:border-b-0"
              >
                <span className="grid h-[28px] w-[28px] min-w-[28px] place-items-center rounded-full bg-chip text-[13px] font-bold text-celeste">
                  {i + 1}
                </span>
                <div>
                  <div className="text-[14.5px] font-semibold">{paso.titulo}</div>
                  <p className="mt-1 text-[13.5px] leading-[1.6] text-texto-3">{paso.detalle}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[10px] bg-lienzo p-4">
              <div className="text-[10.5px] font-semibold tracking-[.8px] text-texto-4 uppercase">
                Requisitos
              </div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {tramite.requisitos.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-[13px] text-texto-2">
                    <span className="mt-px grid shrink-0 place-items-center text-celeste">
                      <Icono nombre="check" size={12} strokeWidth={2.4} />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[10px] bg-lienzo p-4">
              <div className="text-[10.5px] font-semibold tracking-[.8px] text-texto-4 uppercase">
                Costo aproximado
              </div>
              <div className="font-display mt-1.5 text-[17px] font-bold">{tramite.tasa}</div>
              {tramite.nota && (
                <p className="mt-2 flex items-start gap-2 text-[12.5px] leading-[1.55] text-aviso-cuerpo">
                  <span className="mt-px grid shrink-0 place-items-center text-dorado">
                    <Icono nombre="alerta" size={12} />
                  </span>
                  {tramite.nota}
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 rounded-[10px] border border-aviso-borde bg-aviso px-4 py-3 text-[12px] leading-[1.55] text-aviso-cuerpo">
            <b>Guía de demostración.</b> Orientación general — los requisitos y tasas exactos los
            verifica nuestro equipo legal contra la fuente institucional antes del lanzamiento, y
            pueden variar según tu caso.
          </p>
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
                      style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
                    >
                      {a.iniciales}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold">{a.nombre}</div>
                      <div className="text-[11.5px] text-texto-4">
                        {a.ciudad} · ★ {a.valoracion}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      mostrarToast(`Así inicia el contacto con ${a.nombre} (demo de validación)`)
                    }
                    className="mt-3 w-full cursor-pointer rounded-lg bg-celeste py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
                  >
                    Contactar por WhatsApp
                  </button>
                </div>
              ))}
            </div>
            <Link
              href={`/directorio?materia=${encodeURIComponent(tramite.materia)}`}
              className="mt-3 inline-block text-[12.5px]"
            >
              Ver más abogados de {tramite.materia.toLowerCase()} →
            </Link>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="font-display text-[15px] font-bold">¿Tu caso es distinto?</h2>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
              Pregunta gratis en el consultorio y un abogado colegiado te orienta.
            </p>
            <Link
              href="/consultorio"
              className="mt-3 inline-block rounded-lg bg-marino px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-celeste hover:text-white"
            >
              Ir al consultorio
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
