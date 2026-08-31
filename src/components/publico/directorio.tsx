"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { ciudadesDelDirectorio, DIRECTORIO, filtrarDirectorio } from "@/data/directorio";
import { TarjetaAbogado } from "@/components/publico/tarjeta-abogado";
import type { Materia } from "@/types/dominio";
import { cn } from "@/lib/utils";

/**
 * Directorio público: abogados por materia, ciudad y nombre.
 *
 * Los filtros viven en la URL (patrón del portal): una guía de trámite puede
 * aterrizar en `?materia=Consumidor` y ese enlace es compartible. El orden lo
 * decide `filtrarDirectorio` —Premium primero—, no la pantalla.
 */
export function PantallaDirectorio({ enPortal = false }: { enPortal?: boolean }) {
  const base = enPortal ? "/personas/directorio" : "/directorio";
  const rutaConsultorio = enPortal ? "/personas/consultas" : "/consultorio";
  const router = useRouter();
  const params = useSearchParams();

  // `?notarios=1` llega desde un paso de trámite que exige notario.
  const soloNotarios = params.get("notarios") === "1";
  const materia = (params.get("materia") as Materia | null) ?? "todas";
  const ciudad = params.get("ciudad") ?? "todas";
  const q = params.get("q") ?? "";

  const materias = [...new Set(DIRECTORIO.flatMap((a) => a.materias))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
  const ciudades = ciudadesDelDirectorio();
  const abogados = filtrarDirectorio({ materia, ciudad, q, soloNotarios });
  const hayFiltro = soloNotarios || materia !== "todas" || ciudad !== "todas" || q !== "";

  const navegar = (cambios: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(cambios)) {
      if (v === null || v === "" || v === "todas") p.delete(k);
      else p.set(k, v);
    }
    const query = p.toString();
    router.replace(query ? `${base}?${query}` : base, { scroll: false });
  };

  /** Cuántos abogados quedarían con esa materia, respetando los demás filtros:
   *  un chip en 0 avisa antes de vaciar la pantalla. */
  const cuenta = (m: Materia) =>
    filtrarDirectorio({ materia: m, ciudad, q, soloNotarios }).length;

  return (
    <div className={enPortal ? "max-w-[1180px]" : "mx-auto max-w-[1080px] px-4 py-8 md:px-6"}>
      <h1 className="font-display text-[24px] font-bold">Encuentra abogado</h1>
      <p className="mt-1 max-w-[660px] text-[13px] leading-[1.6] text-texto-3">
        Profesionales del derecho por materia y ciudad. Los perfiles con insignia están
        validados con su colegiación al día.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 min-w-[min(260px,100%)] flex-1 items-center gap-2 rounded-lg border border-borde bg-white px-3.5 focus-within:border-celeste">
          <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
          <input
            value={q}
            onChange={(e) => navegar({ q: e.target.value })}
            maxLength={80}
            placeholder="Busca por nombre o por lo que hace: consumidor, despidos…"
            aria-label="Buscar abogado"
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => navegar({ q: null })}
              aria-label="Limpiar búsqueda"
              className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded text-texto-4 hover:text-marino"
            >
              <Icono nombre="cerrar" size={13} />
            </button>
          )}
        </div>

        <select
          value={ciudad}
          onChange={(e) => navegar({ ciudad: e.target.value })}
          aria-label="Filtrar por ciudad"
          className="h-10 w-[min(200px,100%)] shrink-0 rounded-lg border border-borde bg-white px-3 text-[13px] text-marino outline-none focus:border-celeste"
        >
          <option value="todas">Todas las ciudades</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Materias y notarios en filas separadas: ser notario NO es una materia
          (§ del seed), y mezclarlos en la misma fila los hacía parecer lo mismo. */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip activo={!soloNotarios && materia === "todas"} onClick={() => navegar({ materia: null, notarios: null })}>
          Todas las materias
        </Chip>
        {materias.map((m) => {
          const n = cuenta(m);
          return (
            <Chip
              key={m}
              activo={!soloNotarios && materia === m}
              deshabilitado={n === 0}
              onClick={() => navegar({ materia: m, notarios: null })}
            >
              {m} ({n})
            </Chip>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Chip activo={soloNotarios} onClick={() => navegar({ notarios: soloNotarios ? null : "1", materia: null })}>
          <span className="inline-flex items-center gap-1.5">
            <Icono nombre="documento" size={12} />
            Solo notarios
          </span>
        </Chip>
        <span className="text-[12.5px] text-texto-3">
          {abogados.length} {abogados.length === 1 ? "profesional" : "profesionales"}
        </span>
        {hayFiltro && (
          <button
            type="button"
            onClick={() => router.replace(base, { scroll: false })}
            className="cursor-pointer text-[12.5px] font-medium text-celeste hover:text-cruce"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {abogados.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-borde bg-white px-6 py-10 text-center">
          <p className="text-[14px] font-semibold">Ningún abogado con esos filtros</p>
          <p className="mx-auto mt-1.5 max-w-[440px] text-[13px] leading-[1.6] text-texto-3">
            El directorio todavía es pequeño. Publica tu consulta en el consultorio: es gratis y
            la ven todos los abogados de esa materia.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => router.replace(base, { scroll: false })}
              className="cursor-pointer rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[13px] font-medium text-marino hover:border-celeste"
            >
              Ver todos
            </button>
            <Link
              href={rutaConsultorio}
              className="rounded-lg bg-celeste px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-cruce hover:text-white"
            >
              Preguntar en el consultorio
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {abogados.map((a) => (
            <TarjetaAbogado
              key={a.id}
              abogado={a}
              href={enPortal ? `/personas/directorio/${a.id}` : undefined}
            />
          ))}
        </div>
      )}

      {!soloNotarios && (
        <div className="mt-5 rounded-2xl border border-borde bg-white p-5">
          <h2 className="font-display text-[16px] font-bold">¿No sabes qué materia necesitas?</h2>
          <p className="mt-1 text-[13px] leading-[1.6] text-texto-3">
            Publica tu caso en el consultorio: es gratis, lo ven los abogados de la materia que
            corresponda y varios pueden responderte.
          </p>
          <Link
            href={rutaConsultorio}
            className="mt-3 inline-block rounded-lg bg-marino px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-celeste hover:text-white"
          >
            Ir al consultorio
          </Link>
        </div>
      )}
    </div>
  );
}

function Chip({
  activo,
  deshabilitado,
  onClick,
  children,
}: {
  activo: boolean;
  deshabilitado?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      disabled={deshabilitado}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
        activo
          ? "border-celeste bg-celeste text-white"
          : "border-borde bg-white text-texto-3 hover:border-celeste hover:text-marino",
        deshabilitado && "cursor-not-allowed opacity-45 hover:border-borde hover:text-texto-3",
      )}
    >
      {children}
    </button>
  );
}
