"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import {
  buscarGuias,
  getInstitucion,
  INSTITUCIONES,
  TRAMITES,
  type Tramite,
} from "@/data/tramites";
import { buscarAbogados } from "@/data/directorio";
import { AvisoProfesional } from "@/components/publico/paso-profesional";
import { usePortal } from "@/store/portal";
import { cn } from "@/lib/utils";

/**
 * Lista de guías del portal.
 *
 * Estructura: los trámites del Estado y los procesos legales van en secciones
 * SEPARADAS cuando no hay filtro activo. Antes compartían una parrilla plana de
 * 14 cards donde un divorcio y un RTN se veían igual, y la única señal de que
 * son cosas distintas era un chip de filtro que había que pulsar para notarlo.
 */
export function TramitesPersona() {
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const [q, setQ] = useState("");
  const [institucion, setInstitucion] = useState("todas");
  const [tipo, setTipo] = useState<"todos" | "tramite" | "proceso">("todos");

  // Sin término, la lista completa; con término, lo que devuelve el buscador
  // canónico (el mismo de Inicio).
  const base = q.trim() ? buscarGuias(q) : TRAMITES;
  const porTipo = base.filter((t) => tipo === "todos" || t.tipo === tipo);
  const filtrados = porTipo.filter(
    (t) => institucion === "todas" || t.institucionId === institucion,
  );

  const enProgreso = TRAMITES.filter((t) => (pasosTramite[t.id] ?? []).length > 0);
  const hayFiltro = q.trim() !== "" || tipo !== "todos" || institucion !== "todas";
  const limpiar = () => {
    setQ("");
    setTipo("todos");
    setInstitucion("todas");
  };

  // Solo se parte en dos cuando no hay filtro de tipo: con "Procesos" activo,
  // un encabezado "Procesos legales" sobre la única lista sería ruido.
  const secciones =
    tipo === "todos"
      ? ([
          { clave: "tramite", titulo: "Trámites del Estado", desc: "Gestiones ante una institución" },
          { clave: "proceso", titulo: "Procesos legales", desc: "Cuando el asunto va a un juzgado o a una autoridad" },
        ] as const)
      : ([{ clave: tipo, titulo: "", desc: "" }] as const);

  return (
    <div className="max-w-[1180px]">
      <h1 className="font-display text-[24px] font-bold">Trámites y procesos</h1>
      <p className="mt-1 text-[13px] text-texto-3">
        Paso a paso, con requisitos, costos y su fuente oficial — marca tu avance y retómalo
        cuando quieras.
      </p>

      {enProgreso.length > 0 && (
        <div className="mt-4 rounded-xl border border-borde bg-white p-4">
          <div className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
            En progreso
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {enProgreso.map((t) => {
              const hechos = (pasosTramite[t.id] ?? []).length;
              return (
                <Link
                  key={t.id}
                  href={`/personas/tramites/${t.id}`}
                  className="rounded-full border border-chip-borde bg-chip px-3.5 py-1.5 text-[12.5px] font-medium text-celeste hover:border-celeste"
                >
                  {t.nombre} · {hechos}/{t.pasos.length}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <Filtros
        q={q}
        setQ={setQ}
        tipo={tipo}
        setTipo={setTipo}
        institucion={institucion}
        setInstitucion={setInstitucion}
        porTipo={porTipo}
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className="text-[12.5px] text-texto-3">
          {filtrados.length === TRAMITES.length
            ? `${TRAMITES.length} guías, todas con su fuente oficial`
            : `${filtrados.length} ${filtrados.length === 1 ? "resultado" : "resultados"}`}
        </p>
        {hayFiltro && (
          <button
            type="button"
            onClick={limpiar}
            className="cursor-pointer text-[12.5px] font-medium text-celeste hover:text-cruce"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <SinResultados onLimpiar={limpiar} />
      ) : (
        secciones.map(({ clave, titulo, desc }) => {
          const suyos = filtrados.filter((t) => t.tipo === clave);
          if (suyos.length === 0) return null;
          return (
            <section key={clave} className="mt-5">
              {titulo && (
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <h2 className="font-display text-[15px] font-bold">{titulo}</h2>
                  <span className="text-[12px] text-texto-4">
                    {suyos.length} · {desc}
                  </span>
                </div>
              )}
              <div className="mt-2.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {suyos.map((t) => (
                  <TarjetaGuia key={t.id} tramite={t} hechos={(pasosTramite[t.id] ?? []).length} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

/**
 * Los tres controles.
 *
 * El buscador manda y por eso ocupa el espacio sobrante: antes medía 230px
 * mientras el select de institución se llevaba 480 — lo secundario era el doble
 * de grande que lo principal. Y los tres iban a 42/41/40px: un `<select>` no se
 * iguala por interlineado, hay que darle ALTURA explícita (§4.7.7), así que los
 * tres llevan `h-10`.
 */
function Filtros({
  q,
  setQ,
  tipo,
  setTipo,
  institucion,
  setInstitucion,
  porTipo,
}: {
  q: string;
  setQ: (v: string) => void;
  tipo: "todos" | "tramite" | "proceso";
  setTipo: (v: "todos" | "tramite" | "proceso") => void;
  institucion: string;
  setInstitucion: (v: string) => void;
  porTipo: Tramite[];
}) {
  // El conteo por institución se calcula sobre lo YA filtrado por tipo: así una
  // opción en 0 avisa antes de elegirla, en vez de dejar la parrilla en blanco
  // (pasaba con "Procesos" + "SAR").
  const cuenta = (id: string) => porTipo.filter((t) => t.institucionId === id).length;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5">
      <div className="flex h-10 min-w-[min(260px,100%)] flex-1 items-center gap-2 rounded-lg border border-borde bg-white px-3.5 focus-within:border-celeste">
        <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={120}
          placeholder="Buscar por lo que necesitas: despido, RTN, vencido…"
          aria-label="Buscar trámite"
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

      <div className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-borde bg-white px-1">
        {(
          [
            ["todos", "Todos"],
            ["tramite", "Trámites"],
            ["proceso", "Procesos"],
          ] as const
        ).map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            aria-pressed={tipo === valor}
            onClick={() => {
              setTipo(valor);
              setInstitucion("todas");
            }}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              tipo === valor ? "bg-celeste text-white" : "text-texto-3 hover:text-marino",
            )}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <select
        value={institucion}
        onChange={(e) => setInstitucion(e.target.value)}
        aria-label="Filtrar por institución"
        className="h-10 w-[min(220px,100%)] shrink-0 rounded-lg border border-borde bg-white px-3 text-[13px] text-marino outline-none focus:border-celeste"
      >
        <option value="todas">Todas las instituciones</option>
        {INSTITUCIONES.map((i) => {
          const n = cuenta(i.id);
          return (
            <option key={i.id} value={i.id} disabled={n === 0}>
              {i.sigla} ({n})
            </option>
          );
        })}
      </select>
    </div>
  );
}

/** Antes la parrilla se quedaba en blanco, sin decir nada ni ofrecer salida. */
function SinResultados({ onLimpiar }: { onLimpiar: () => void }) {
  return (
    <div className="mt-5 rounded-2xl border border-borde bg-white px-6 py-10 text-center">
      <p className="text-[14px] font-semibold">No hay ninguna guía con esos filtros</p>
      <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-[1.6] text-texto-3">
        Puede que todavía no la hayamos escrito. Pregúntalo en el consultorio: es gratis y te
        responde un abogado colegiado.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        <button
          type="button"
          onClick={onLimpiar}
          className="cursor-pointer rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[13px] font-medium text-marino hover:border-celeste"
        >
          Ver todas las guías
        </button>
        <Link
          href="/personas/consultas"
          className="rounded-lg bg-celeste px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-cruce"
        >
          Preguntar en el consultorio
        </Link>
      </div>
    </div>
  );
}

/**
 * La card gana el pie con pasos y costo. `tasaCorta` ya existía en el seed y no
 * se mostraba: "cuánto me va a costar" es de las dos primeras preguntas de
 * cualquiera, y obligaba a abrir la guía para saberlo.
 */
function TarjetaGuia({ tramite, hechos }: { tramite: Tramite; hechos: number }) {
  const inst = getInstitucion(tramite.institucionId)!;
  const total = tramite.pasos.length;
  const completo = hechos === total;

  return (
    <Link
      href={`/personas/tramites/${tramite.id}`}
      className="flex flex-col rounded-xl border border-borde bg-white p-4.5 text-marino hover:border-celeste"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-bold tracking-[.8px] text-celeste uppercase">
          {inst.sigla}
        </span>
        {hechos > 0 &&
          (completo ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-exito">
              <Icono nombre="check" size={10} strokeWidth={2.6} />
              Completo
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-celeste">
              {hechos}/{total}
            </span>
          ))}
      </div>

      <div className="font-display mt-1 text-[15px] leading-[1.35] font-semibold">
        {tramite.nombre}
      </div>
      <p className="mt-1.5 flex-1 text-[12.5px] leading-[1.55] text-texto-3">
        {tramite.paraQuien}
      </p>

      {hechos > 0 && (
        <div className="mt-2.5 h-1 overflow-hidden rounded bg-sutil">
          <div
            className="h-full rounded bg-celeste transition-[width]"
            style={{ width: `${(hechos / total) * 100}%` }}
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-borde pt-2.5 text-[11.5px] text-texto-4">
        <span>{total} pasos</span>
        <span aria-hidden>·</span>
        <span className={tramite.tasaCorta.toLowerCase().startsWith("gratu") ? "font-semibold text-exito" : ""}>
          {tramite.tasaCorta}
        </span>
      </div>
    </Link>
  );
}

// ── Detalle con checklist ──────────────────────────────────────────────────

export function DetalleTramitePersona({ tramite }: { tramite: Tramite }) {
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const togglePasoTramite = usePortal((s) => s.togglePasoTramite);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const inst = getInstitucion(tramite.institucionId)!;
  const hechos = pasosTramite[tramite.id] ?? [];
  const abogados = buscarAbogados(tramite.materia).slice(0, 2);
  const completo = hechos.length === tramite.pasos.length;

  return (
    <div className="max-w-[1080px]">
      <Link href="/personas/tramites" className="text-[13px]">
        ← Todos los trámites
      </Link>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-borde bg-white p-6">
          <div className="text-[11px] font-bold tracking-[.8px] text-celeste uppercase">
            {inst.sigla} · {inst.nombre}
          </div>
          <h1 className="font-display mt-1.5 text-[22px] leading-[1.25] font-bold">
            {tramite.nombre}
          </h1>
          <p className="mt-2 text-[13.5px] leading-[1.6] text-texto-2">{tramite.resumen}</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded bg-sutil">
              <div
                className="h-full rounded bg-celeste transition-[width]"
                style={{ width: `${(hechos.length / tramite.pasos.length) * 100}%` }}
              />
            </div>
            <span className="text-[12px] whitespace-nowrap text-texto-3">
              {hechos.length} de {tramite.pasos.length} pasos
            </span>
          </div>

          <ol className="mt-3 flex flex-col">
            {tramite.pasos.map((paso, i) => {
              const hecho = hechos.includes(i);
              return (
                <li
                  key={paso.titulo}
                  className="flex gap-3.5 border-b border-borde-suave py-3.5 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => togglePasoTramite(tramite.id, i)}
                    aria-pressed={hecho}
                    aria-label={hecho ? `Desmarcar: ${paso.titulo}` : `Marcar hecho: ${paso.titulo}`}
                    className={cn(
                      "grid h-[26px] w-[26px] min-w-[26px] cursor-pointer place-items-center rounded-full border text-[12.5px] font-bold transition-colors",
                      hecho
                        ? "border-celeste bg-celeste text-white"
                        : "border-chip-borde bg-chip text-celeste hover:border-celeste",
                    )}
                  >
                    {hecho ? <Icono nombre="check" size={13} strokeWidth={2.6} /> : i + 1}
                  </button>
                  <div className={cn(hecho && "opacity-55")}>
                    <div className={cn("text-sm font-semibold", hecho && "line-through")}>
                      {paso.titulo}
                    </div>
                    <p className="mt-[3px] text-[13px] leading-[1.55] text-texto-3">
                      {paso.detalle}
                    </p>
                    {paso.profesional && !hecho && (
                      <AvisoProfesional
                        profesional={paso.profesional}
                        materia={tramite.materia}
                        enPortal
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {completo && (
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-[10px] border-l-[3px] border-exito bg-exito-bg/60 px-4 py-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-exito text-white">
                <Icono nombre="check" size={15} strokeWidth={2.6} />
              </span>
              <div className="min-w-[180px] flex-1">
                <div className="text-[13.5px] font-semibold">¡Trámite completado!</div>
                <p className="text-[12.5px] text-texto-3">
                  Si algo se complicó en el camino, un abogado te lo resuelve.
                </p>
              </div>
            </div>
          )}

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
              <div className="font-display mt-1.5 text-[16px] font-bold">{tramite.tasa}</div>
              {tramite.nota && (
                <p className="mt-2 flex items-start gap-2 text-[12px] leading-[1.55] whitespace-pre-line text-aviso-cuerpo">
                  <span className="mt-px grid shrink-0 place-items-center text-dorado">
                    <Icono nombre="alerta" size={12} />
                  </span>
                  {tramite.nota}
                </p>
              )}
            </div>
          </div>

          {tramite.fuenteUrl ? (
            <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-[10px] border border-exito/30 bg-exito-bg/50 px-4 py-3 text-[12.5px] leading-[1.55]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-exito">
                <Icono nombre="check" size={13} strokeWidth={2.6} />
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
              <span className="basis-full text-texto-3">
                Aun así es orientación general: tu caso puede tener condiciones propias.
              </span>
            </div>
          ) : (
            <p className="mt-4 rounded-[10px] border border-aviso-borde bg-aviso px-4 py-3 text-[12px] leading-[1.55] text-aviso-cuerpo">
              <b>Guía de demostración.</b> Orientación general — requisitos y tasas exactos se
              verifican contra la fuente institucional antes del lanzamiento.
            </p>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              ¿Se complicó? Estos abogados ayudan
            </h2>
            <div className="mt-3 flex flex-col gap-3">
              {abogados.map((a) => (
                <div key={a.id} className="rounded-xl border border-borde p-3.5">
                  <div className="text-[13px] font-semibold">{a.nombre}</div>
                  <div className="text-[11.5px] text-texto-4">
                    {a.ciudad} · {a.anios} años
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      mostrarToast(
                        `Así le escribes a ${a.nombre} desde Justihn (demo de validación)`,
                      )
                    }
                    className="mt-2.5 w-full cursor-pointer rounded-lg bg-celeste py-2 text-[12px] font-semibold text-white hover:bg-cruce"
                  >
                    Consultar con {a.nombre.replace(/^Abg\.\s*/, "").split(" ")[0]}
                  </button>
                </div>
              ))}
            </div>
            <Link
              href={`/personas/directorio?materia=${encodeURIComponent(tramite.materia)}`}
              className="mt-3 inline-block text-[12.5px]"
            >
              Ver más de {tramite.materia.toLowerCase()} →
            </Link>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="font-display text-[14.5px] font-bold">¿Tu caso es distinto?</h2>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
              Pregunta gratis y un abogado colegiado te orienta.
            </p>
            <Link
              href="/personas/consultas"
              className="mt-3 inline-block rounded-lg bg-marino px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-celeste hover:text-white"
            >
              Hacer una consulta
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
