"use client";

/**
 * Inicio del portal ciudadano — adaptación del dashboard del abogado.
 *
 * Toma su estructura (entrada arriba · métricas · triaje + destacado · accesos)
 * pero NO sus contenidos, porque las dos audiencias no se parecen: el abogado
 * entra a trabajar y mide su producción (cuota de IA, búsquedas, alertas); el
 * ciudadano llega con UN problema y lo que necesita saber es qué dejó a medias
 * y cuánto tiempo le queda. Por eso las métricas son de SU gestión, el triaje
 * se deriva de lo que hizo, y el destacado es un plazo legal — no un digest.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import { PERSONA_DEMO } from "@/data/persona";
import { PLAZOS_CIUDADANO, etiquetaPlazo } from "@/data/plazos";
import { buscarGuias, getInstitucion, INSTITUCIONES, TRAMITES } from "@/data/tramites";
import { DIRECTORIO } from "@/data/directorio";
import { usePortal } from "@/store/portal";
import { useSaludoPorHora } from "@/hooks/use-saludo";
import { useAvisosPersona } from "./notificaciones-persona";

export function InicioPersona() {
  const franja = useSaludoPorHora();

  return (
    <div className="max-w-[1180px]" style={{ animation: "fadeUp .3s ease" }}>
      {/* El saludo es contexto, no titular: el protagonista es la caja. */}
      <p className="text-[12.5px] text-texto-4">
        {franja ? `${franja}, ` : "Hola, "}
        {PERSONA_DEMO.nombre.split(" ")[0]}
      </p>
      <h1 className="font-display mt-0.5 text-[24px] font-bold">¿Qué necesitas resolver?</h1>

      <BuscadorProblema />
      <Metricas />

      {/* Dos rejillas, no una.
          Con una sola, cada columna apila lo suyo y la última card de cada lado
          empieza donde termina la anterior — que depende del contenido: medido,
          "Lo que viene" arrancaba 121px por debajo de "Lo que otros preguntan"
          con la cuenta vacía y 157px con datos. Ninguna altura fija arregla las
          dos a la vez. Sacándolas a su PROPIA fila quedan alineadas por
          construcción, en cualquier estado. El `flex-1` de la última card de
          cada columna de arriba cierra las dos a la misma altura, así que la
          costura entre las dos rejillas es una línea recta. */}
      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <TusPendientes />
          <MisConsultas />
          <MisTramites />
        </div>

        <div className="flex flex-col gap-4">
          <PlazoDestacado />
          <AntesDeFirmar />
          <AccesosRapidos />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.6fr_1fr]">
        <LoQueOtrosPreguntan />
        <LoQueViene />
      </div>
    </div>
  );
}

// ── Buscador por problema ──────────────────────────────────────────────────

/**
 * Busca sobre las guías con el motor canónico (`buscarGuias`), el mismo de la
 * pantalla Trámites. Los resultados salen AQUÍ y no navegando a otra pantalla:
 * el ciudadano llega con una duda y mandarlo a una lista con filtros es
 * pedirle que vuelva a decidir. Sin coincidencia ofrece el consultorio — 14
 * guías no cubren todo, y ese es el camino honesto.
 */
function BuscadorProblema() {
  const [q, setQ] = useState("");
  const termino = q.trim();
  const buscando = termino.length >= 3;
  const resultados = buscando ? buscarGuias(termino) : [];

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

// ── Métricas ───────────────────────────────────────────────────────────────

/**
 * Las tres del abogado miden su producción; estas miden la gestión del
 * ciudadano. Con la cuenta recién creada dos valen cero, así que en vez del
 * "0" seco llevan la invitación a empezar: un cero sin salida es un tablero
 * que dice que no has hecho nada.
 */
function Metricas() {
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);

  const enProgreso = TRAMITES.filter((t) => {
    const hechos = (pasosTramite[t.id] ?? []).length;
    return hechos > 0 && hechos < t.pasos.length;
  }).length;
  const completos = TRAMITES.filter(
    (t) => (pasosTramite[t.id] ?? []).length === t.pasos.length,
  ).length;
  const respondidas = preguntas.filter((p) => respondidos[p.id]?.length).length;

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Metrica
        href="/personas/tramites"
        rotulo="Trámites en curso"
        valor={enProgreso > 0 ? String(enProgreso) : "—"}
        pie={
          enProgreso > 0
            ? completos > 0
              ? `${completos} ${completos === 1 ? "terminado" : "terminados"}`
              : "Retómalos donde los dejaste"
            : "Abre una guía y marca tu avance"
        }
      />
      <Metrica
        href="/personas/consultas"
        rotulo="Mis consultas"
        valor={preguntas.length > 0 ? String(preguntas.length) : "—"}
        pie={
          preguntas.length > 0
            ? respondidas > 0
              ? `${respondidas} ${respondidas === 1 ? "respondida" : "respondidas"}`
              : "Esperando a los abogados"
            : "Preguntar es gratis"
        }
        acento={respondidas > 0}
      />
      <Metrica
        href="/personas/tramites"
        rotulo="Guías disponibles"
        valor={String(TRAMITES.length)}
        pie="Todas con su fuente oficial"
      />
    </div>
  );
}

function Metrica({
  href,
  rotulo,
  valor,
  pie,
  acento,
}: {
  href: string;
  rotulo: string;
  valor: string;
  pie: string;
  acento?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-borde bg-white px-5 py-4.5 text-marino hover:border-celeste"
    >
      <div className="text-xs tracking-[.4px] text-texto-3 uppercase">{rotulo}</div>
      <div className="font-display mt-1.5 text-[30px] leading-none font-bold">{valor}</div>
      <div className={`mt-2 text-xs ${acento ? "font-semibold text-exito" : "text-texto-3"}`}>
        {pie}
      </div>
    </Link>
  );
}

// ── Triaje: qué tiene pendiente ────────────────────────────────────────────

/**
 * El equivalente de "Pendientes de hoy" del abogado. Se deriva del MISMO
 * `useAvisosPersona` que alimenta Notificaciones — con dos derivaciones
 * distintas, la campana y el tablero podrían contradecirse. Se descarta el
 * grupo "De Justihn" porque una novedad no es un pendiente que resolver.
 */
function TusPendientes() {
  const grupos = useAvisosPersona();
  const pendientes = grupos
    .filter((g) => g.etiqueta !== "De Justihn")
    .flatMap((g) => g.avisos)
    .slice(0, 4);

  if (pendientes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <div className="flex items-baseline gap-2.5">
        <h2 className="font-display text-[17px] font-bold">Tus pendientes</h2>
        <span className="text-[12px] text-texto-4">lo que dejaste a medias</span>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {pendientes.map((a) => (
          <Link
            key={a.id}
            href={a.destino}
            className="flex items-center gap-3 rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-chip text-celeste">
              <Icono nombre={a.icono} size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold">{a.titulo}</span>
              <span className="mt-0.5 block truncate text-[12px] text-texto-3">{a.meta}</span>
            </span>
            {/* `chevron` apunta hacia abajo y esto es un enlace, no un
                acordeón: se usa `atras` rotado, que es el único chevron
                horizontal del set. */}
            <Icono nombre="atras" size={15} className="shrink-0 rotate-180 text-texto-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Mis consultas ──────────────────────────────────────────────────────────

function MisConsultas() {
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);

  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold">Mis consultas</h2>
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
        </div>
      ) : (
        <ConsultorioVacio />
      )}
    </div>
  );
}

/**
 * Antes decía "Aún no has preguntado nada" y un botón. Pero el obstáculo del
 * ciudadano no es no saber dónde escribir: es no creer que alguien vaya a
 * responderle. Así que va un intercambio REAL ya respondido y firmado con su
 * colegiación — mismo criterio que la sección consultorio de la home pública
 * (`landing/secciones.tsx`). El componente no se comparte con aquella porque
 * pintan sobre temas distintos; lo compartido es la fuente y el criterio.
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

// ── Mis trámites ───────────────────────────────────────────────────────────

function MisTramites() {
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const enProgreso = TRAMITES.filter((t) => (pasosTramite[t.id] ?? []).length > 0);

  // Sin `flex-1` a propósito: la fila de abajo ya alinea por su cuenta, así que
  // estirar esta card solo metería el hueco DENTRO de ella — un rectángulo
  // blanco vacío. Suelto, el aire queda entre cards, que se lee como aire.
  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold">Mis trámites</h2>
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
        <div className="mt-3">
          <p className="text-[13px] text-texto-3">
            Aún no has empezado ninguna guía. Estas son de las más buscadas:
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {["abrir-rtn", "reclamo-consumidor", "despido-injustificado", "traspaso-vehiculo"]
              .map((id) => TRAMITES.find((t) => t.id === id))
              .filter((t) => t !== undefined)
              .map((t) => (
                <Link
                  key={t.id}
                  href={`/personas/tramites/${t.id}`}
                  className="rounded-full border border-borde px-3.5 py-1.5 text-[12.5px] font-medium text-marino hover:border-celeste hover:text-celeste"
                >
                  {t.nombre}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Prueba social: el consultorio en marcha ────────────────────────────────

/**
 * El eco de "Leads en tu especialidad" del abogado, visto desde el otro lado.
 * Enseña que el consultorio se usa —y qué clase de cosas se preguntan— sin
 * inventar un contador de actividad: son las consultas del seed, las mismas
 * que le llegan al abogado.
 */
function LoQueOtrosPreguntan() {
  const ejemplos = LEADS.filter((l) => l.respuestaDemo).slice(1, 4);
  if (ejemplos.length === 0) return null;

  return (
    <div className="flex flex-col rounded-2xl border border-borde bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold">Lo que otros preguntan</h2>
        <Link href="/personas/consultas" className="text-[12.5px]">
          Ir al consultorio →
        </Link>
      </div>
      <p className="mt-1 text-[12.5px] text-texto-3">
        Consultas reales del consultorio, respondidas por abogados colegiados.
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {ejemplos.map((l) => (
          <Link
            key={l.id}
            href="/personas/consultas"
            className="rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-chip px-2.5 py-[2px] text-[11px] font-medium text-celeste">
                {l.materia}
              </span>
              <span className="text-[11.5px] text-texto-4">{l.ciudad}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-exito">
                <Icono nombre="check" size={10} strokeWidth={2.6} />
                Respondida
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.55] text-texto-2">
              {l.pregunta}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Columna derecha ────────────────────────────────────────────────────────

/**
 * El destacado del abogado es su digest de Gaceta. El del ciudadano es un
 * PLAZO: es lo que le hace perder el caso sin enterarse, y el dato ya está
 * verificado contra el PDF del CEDIJ (`data/plazos.ts`). No es un anuncio —
 * es el aviso más útil que este producto puede dar.
 */
function PlazoDestacado() {
  const plazo = PLAZOS_CIUDADANO[0];

  return (
    <div
      className="rounded-2xl p-5 text-[#e8eef6]"
      style={{ background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)" }}
    >
      <div className="text-[11px] font-semibold tracking-[1.2px] text-sobre-marino uppercase">
        Ojo con los plazos
      </div>
      <p className="font-display mt-1.5 text-[16px] leading-[1.35] font-bold">
        {plazo.hecho}: tienes {etiquetaPlazo(plazo)}
      </p>
      <p className="mt-2 text-[12.5px] leading-[1.6] text-sobre-marino-2">
        {plazo.cuerpoLegal}, {plazo.articulo}. Es la razón número uno por la que se pierden
        reclamos legítimos en Honduras.
      </p>
      <Link
        href="/personas/calculadora"
        className="mt-3.5 inline-block rounded-lg bg-celeste px-3.5 py-[9px] text-[13px] font-semibold text-white hover:bg-[#0d6ba3] hover:text-white"
      >
        Calcular mi plazo
      </Link>
    </div>
  );
}

/** El caso de uso que motiva Verifica, dicho como lo vive la persona. */
function AntesDeFirmar() {
  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <h2 className="font-display text-[15px] font-bold">¿Vas a firmar con alguien?</h2>
      <p className="mt-1.5 text-[12.5px] leading-[1.6] text-texto-3">
        Antes de comprar un terreno, alquilar o asociarte, mira qué hay publicado sobre esa
        persona o empresa en las fuentes del Estado.
      </p>
      <Link href="/personas/verifica" className="mt-2.5 inline-block text-[12.5px] font-medium">
        Hacer un Informe Verifica →
      </Link>
    </div>
  );
}

/**
 * Cuatro, no seis (decisión Wesley: achicarla para alinear la fila de abajo).
 * Se van las dos que ya tienen otra puerta en esta misma pantalla: "Mis
 * consultas" es una card entera más arriba, y a Calculadoras lleva el botón del
 * destacado oscuro. Quedan las que NO se alcanzan de otro modo desde Inicio.
 */
function AccesosRapidos() {
  const accesos: { href: string; icono: NombreIcono; label: string }[] = [
    { href: "/personas/tramites", icono: "pasos", label: "Guías de trámites" },
    { href: "/personas/instituciones", icono: "gaceta", label: "Instituciones" },
    { href: "/personas/directorio", icono: "perfil", label: "Encuentra abogado" },
    { href: "/personas/monitoreo", icono: "bell", label: "Mi nombre" },
  ];

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-borde bg-white p-5">
      <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
        Accesos rápidos
      </h2>
      <div className="mt-3 grid flex-1 grid-cols-1 content-start gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {accesos.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-2.5 rounded-[10px] border border-borde bg-lienzo px-3.5 py-3 text-[12.5px] font-medium text-marino hover:border-celeste hover:text-celeste"
          >
            <span className="grid shrink-0 place-items-center text-texto-4">
              <Icono nombre={a.icono} size={15} />
            </span>
            {a.label}
          </Link>
        ))}
      </div>
      <p className="mt-3 border-t border-borde pt-3 text-[11.5px] leading-[1.5] text-texto-4">
        {INSTITUCIONES.length} instituciones del Estado · {DIRECTORIO.length} abogados por materia
      </p>
    </div>
  );
}

/**
 * Lo que viene.
 *
 * Los tres puntos NO son un anuncio de marketing: son ítems reales del backlog
 * del producto, con su bloqueo dicho en voz alta. El Informe Verifica completo
 * depende de cuentas institucionales (SURE/CCIT) que aún no existen; la guía de
 * alquiler está bloqueada porque el texto de la Ley de Inquilinato no está
 * publicado en ninguna fuente estatal legible; y el plan de pago se define con
 * el gremio. Prometer fechas sería justo lo que prohíbe §4.5 — por eso ninguno
 * las lleva, y la nota final repite el único compromiso que sí está tomado:
 * lo gratis sigue gratis.
 *
 * `flex-1` cierra la columna derecha a la altura de la izquierda — el mismo
 * recurso que usa el Dashboard del abogado en su última card.
 */
function LoQueViene() {
  const mostrarToast = usePortal((s) => s.mostrarToast);

  const puntos: { icono: NombreIcono; titulo: string; desc: string }[] = [
    {
      icono: "candado",
      titulo: "Informe Verifica completo",
      desc: "Folio real de un inmueble e historial de una empresa, además de las sentencias.",
    },
    {
      icono: "pasos",
      titulo: "Más guías, una a una",
      desc: "Alquiler y devolución del depósito están entre las próximas.",
    },
    {
      icono: "planes",
      titulo: "Un plan con más herramientas",
      desc: "En definición con el gremio, para quien necesite más que lo gratuito.",
    },
  ];

  return (
    <div className="flex flex-col rounded-2xl border-2 border-dashed border-borde bg-white/70 p-5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[11px] font-semibold tracking-[1.2px] text-dorado uppercase">
          Lo que viene
        </h2>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-[1.55] text-texto-3">
        En lo que estamos trabajando. Sin fechas: se publica cuando esté verificado.
      </p>

      <ul className="mt-3.5 flex flex-1 flex-col content-start gap-3">
        {puntos.map((p) => (
          <li key={p.titulo} className="flex items-start gap-2.5">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-lienzo text-texto-4">
              <Icono nombre={p.icono} size={12} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-marino">{p.titulo}</span>
              <span className="mt-0.5 block text-[12px] leading-[1.5] text-texto-3">
                {p.desc}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => mostrarToast("Te avisaremos por correo cuando salga algo nuevo")}
        className="mt-4 cursor-pointer rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[12.5px] font-medium text-marino hover:border-celeste"
      >
        Avísame cuando salga
      </button>
      <p className="mt-2.5 text-[11.5px] leading-[1.5] text-texto-4">
        Lo que hoy es gratis seguirá siendo gratis.
      </p>
    </div>
  );
}
