"use client";

/**
 * Inicio del portal ciudadano.
 *
 * NO es el dashboard del abogado con otros datos. El abogado entra a trabajar
 * y tiene qué controlar —casos, leads, cuota—; el ciudadano llega con UN
 * problema concreto ("me despidieron", "compré algo vencido") y se va. Por eso
 * lo primero es una caja donde escribir el problema, no un panel de métricas.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import { PERSONA_DEMO } from "@/data/persona";
import { buscarGuias, getInstitucion, TRAMITES } from "@/data/tramites";
import { usePortal } from "@/store/portal";
import { useSaludoPorHora } from "@/hooks/use-saludo";

export function InicioPersona() {
  const franja = useSaludoPorHora();
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const pasosTramite = usePortal((s) => s.pasosTramite);

  const enProgreso = TRAMITES.filter((t) => (pasosTramite[t.id] ?? []).length > 0);
  const respondidas = preguntas.filter((p) => respondidos[p.id]).length;

  return (
    <div className="max-w-[1080px]" style={{ animation: "fadeUp .3s ease" }}>
      {/* El saludo baja a línea de contexto: el protagonista es la caja. */}
      <p className="text-[12.5px] text-texto-4">
        {franja ? `${franja}, ` : "Hola, "}
        {PERSONA_DEMO.nombre.split(" ")[0]}
      </p>
      <h1 className="font-display mt-0.5 text-[24px] font-bold">¿Qué necesitas resolver?</h1>

      <BuscadorProblema />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          {/* Mis consultas */}
          <div className="rounded-2xl border border-borde bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Mis consultas
              </h2>
              <Link href="/personas/consultas" className="text-[12.5px]">
                Ver todas →
              </Link>
            </div>
            {preguntas.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2.5">
                {preguntas.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    href="/personas/consultas"
                    className="rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-chip px-2.5 py-[2px] text-[11px] font-medium text-celeste">
                        {p.materia}
                      </span>
                      {respondidos[p.id] ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-exito">
                          <Icono nombre="check" size={10} strokeWidth={2.6} />
                          Respondida
                        </span>
                      ) : (
                        <span className="text-[11px] text-texto-4">Esperando respuesta…</span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.55] text-texto-2">
                      {p.pregunta}
                    </p>
                  </Link>
                ))}
                {respondidas > 0 && (
                  <p className="text-[12px] text-exito">
                    ✓ {respondidas}{" "}
                    {respondidas === 1 ? "consulta respondida" : "consultas respondidas"} por
                    abogados
                  </p>
                )}
              </div>
            ) : (
              <ConsultorioVacio />
            )}
          </div>

          {/* Trámites en progreso */}
          <div className="rounded-2xl border border-borde bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Mis trámites
              </h2>
              <Link href="/personas/tramites" className="text-[12.5px]">
                Ver todos →
              </Link>
            </div>
            {enProgreso.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2.5">
                {enProgreso.slice(0, 3).map((t) => {
                  const hechos = (pasosTramite[t.id] ?? []).length;
                  return (
                    <Link
                      key={t.id}
                      href={`/personas/tramites/${t.id}`}
                      className="rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13.5px] font-semibold">{t.nombre}</span>
                        <span className="text-[11.5px] whitespace-nowrap text-celeste">
                          {hechos}/{t.pasos.length} pasos
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded bg-sutil">
                        <div
                          className="h-full rounded bg-celeste transition-[width]"
                          style={{ width: `${(hechos / t.pasos.length) * 100}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-texto-3">
                Abre una guía y marca tu avance — aquí verás tus trámites en progreso.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Acceso
            href="/personas/tramites"
            icono="pasos"
            titulo="Guías de trámites"
            desc={`${TRAMITES.length} trámites paso a paso con tu avance guardado`}
          />
          <Acceso
            href="/personas/calculadora"
            icono="calc"
            titulo="¿Te despidieron?"
            desc="Cuánto te toca y hasta cuándo puedes reclamar, según el Código del Trabajo"
          />
          <Acceso
            href="/personas/directorio"
            icono="perfil"
            titulo="Encuentra abogado"
            desc="Por materia y ciudad, con perfiles validados"
          />
          <div className="rounded-2xl border border-borde bg-white p-5">
            <div className="text-[11px] font-semibold tracking-[1px] text-texto-4 uppercase">
              Tu plan
            </div>
            <div className="font-display mt-1 text-[18px] font-bold">Gratis</div>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
              Guías, consultorio y calculadoras sin costo. El plan de pago está en definición.
            </p>
            <Link href="/personas/plan" className="mt-2 inline-block text-[12.5px]">
              Ver mi plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Buscador por problema ──────────────────────────────────────────────────

/**
 * Busca sobre las guías con el motor canónico (`buscarGuias`), el mismo de la
 * pantalla Trámites. Los resultados salen AQUÍ y no navegando a otra pantalla:
 * el ciudadano llega con una duda y mandarlo a una lista con filtros es
 * pedirle que vuelva a decidir.
 *
 * Cuando no hay coincidencia no se queda en "sin resultados" — ofrece llevar
 * lo escrito al consultorio, que es la respuesta honesta: el catálogo tiene 14
 * guías y no cubre todo, pero un abogado colegiado sí puede orientar.
 */
function BuscadorProblema() {
  const [q, setQ] = useState("");
  const termino = q.trim();
  const resultados = termino.length >= 3 ? buscarGuias(termino) : [];
  const buscando = termino.length >= 3;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2.5 rounded-xl border border-borde bg-white px-4 py-3 focus-within:border-celeste">
        <Icono nombre="buscar" size={17} className="shrink-0 text-texto-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={120}
          placeholder="Ej. me despidieron, producto vencido, sacar el RTN…"
          aria-label="Buscar qué necesitas resolver"
          className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-marino outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Limpiar búsqueda"
            className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded text-texto-4 hover:text-marino"
          >
            <Icono nombre="cerrar" size={14} />
          </button>
        )}
      </div>

      {buscando && (
        <div className="mt-2.5 overflow-hidden rounded-xl border border-borde bg-white">
          {resultados.length > 0 ? (
            resultados.slice(0, 5).map((t, i) => (
              <Link
                key={t.id}
                href={`/personas/tramites/${t.id}`}
                className={`flex items-start gap-3 px-4 py-3 text-marino hover:bg-lienzo ${
                  i > 0 ? "border-t border-borde" : ""
                }`}
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-chip text-celeste">
                  <Icono nombre={t.tipo === "proceso" ? "juris" : "pasos"} size={13} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold">{t.nombre}</span>
                  <span className="mt-0.5 block text-[12px] leading-[1.5] text-texto-3">
                    {getInstitucion(t.institucionId)!.sigla} · {t.paraQuien}
                  </span>
                </span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-4">
              <p className="text-[13px] text-texto-3">
                No hay una guía de eso todavía. Pregúntalo en el consultorio: es gratis y te
                responde un abogado colegiado.
              </p>
              <Link
                href="/personas/consultas"
                className="mt-2.5 inline-block rounded-lg bg-celeste px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
              >
                Preguntar en el consultorio
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Estado vacío del consultorio ───────────────────────────────────────────

/**
 * Antes decía "Aún no has preguntado nada" y un botón. Pero el obstáculo del
 * ciudadano no es no saber dónde escribir: es no creer que alguien vaya a
 * responderle. Así que en su lugar va un intercambio REAL ya respondido y
 * firmado con su número de colegiación — mismo criterio que la sección
 * consultorio de la home pública (`landing/secciones.tsx`).
 *
 * El componente no se comparte con esa: aquella pinta sobre el shell aurora
 * (`glass-card`, `var(--muted)`) y esta sobre el tema del portal. Lo que se
 * comparte es la fuente —`respuestaDemo` del seed— y el criterio.
 */
function ConsultorioVacio() {
  const ejemplo = LEADS.find((l) => l.respuestaDemo);
  if (!ejemplo) return null;

  return (
    <div className="mt-3">
      <p className="text-[12.5px] text-texto-3">
        Todavía no has preguntado nada. Así se ve una consulta respondida:
      </p>

      <div className="mt-2.5 rounded-xl border border-borde px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-chip px-2.5 py-[2px] text-[11px] font-medium text-celeste">
            {ejemplo.materia}
          </span>
          <span className="text-[11.5px] text-texto-4">{ejemplo.ciudad}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-exito">
            <Icono nombre="check" size={10} strokeWidth={2.6} />
            Respondida
          </span>
        </div>

        <p className="mt-2 text-[13px] leading-[1.55] text-texto-2">“{ejemplo.pregunta}”</p>

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
          <p className="mt-2 line-clamp-3 text-[12.5px] leading-[1.6] text-texto-3">
            {ejemplo.respuestaDemo}
          </p>
        </div>
      </div>

      <Link
        href="/personas/consultas"
        className="mt-3 inline-block rounded-lg bg-celeste px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
      >
        Hacer mi primera consulta
      </Link>
    </div>
  );
}

function Acceso({
  href,
  icono,
  titulo,
  desc,
}: {
  href: string;
  icono: NombreIcono;
  titulo: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3.5 rounded-2xl border border-borde bg-white p-5 text-marino hover:border-celeste"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-chip text-celeste">
        <Icono nombre={icono} size={17} />
      </span>
      <span>
        <span className="font-display block text-[15px] font-bold">{titulo}</span>
        <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-texto-3">{desc}</span>
      </span>
    </Link>
  );
}
