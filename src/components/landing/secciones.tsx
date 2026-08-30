"use client";

/**
 * Las tres experiencias públicas como SECCIONES de la landing (patrón
 * Jusbrasil: todo se ve en la home, profundizar pide cuenta). Cada una es
 * interactiva de verdad — filtros, buscador y el formulario real del
 * consultorio — sobre el tema aurora claro.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { useBusquedaUrl } from "@/hooks/use-busqueda-url";
import { Icono } from "@/components/brand/iconos";
import { FormularioPregunta } from "@/components/publico/formulario-pregunta";
import {
  getInstitucion,
  getTramite,
  RUTAS_TRAMITE,
  TRAMITES,
} from "@/data/tramites";
import type { RutaTramite, Tramite } from "@/data/tramites";
import { buscarAbogados, buscarNotarios, DIRECTORIO } from "@/data/directorio";
import { InsigniaNotario } from "@/components/publico/paso-profesional";
import { LEADS, ABOGADA_DEMO } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import type { Materia } from "@/types/dominio";
import { cn } from "@/lib/utils";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function Chip({
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
        activo ? "border-transparent text-white" : "hover:border-celeste hover:text-celeste",
      )}
      style={
        activo
          ? { background: "var(--turq)" }
          : { borderColor: "var(--line)", color: "var(--muted)", background: "rgba(255,255,255,.6)" }
      }
    >
      {children}
    </button>
  );
}

export function TituloSeccion({ eyebrow, titulo, desc }: { eyebrow: string; titulo: string; desc: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "var(--mint)" }}>
        {eyebrow}
      </p>
      <h2 className="font-display mt-2 text-[clamp(22px,3vw,28px)] font-bold">{titulo}</h2>
      <p
        className="mx-auto mt-2 max-w-[560px] text-[13.5px] leading-[1.6]"
        style={{ color: "var(--muted)" }}
      >
        {desc}
      </p>
    </div>
  );
}

// ── Sección Trámites ───────────────────────────────────────────────────────

export function SeccionTramites({
  termino: q,
  onTermino: setQ,
}: {
  termino: string;
  onTermino: (v: string) => void;
}) {
  const administrativos = TRAMITES.filter((t) => t.tipo === "tramite");
  const termino = normalizar(q.trim());
  const buscando = termino.length > 0;
  const encontrados = administrativos.filter((t) =>
    normalizar(`${t.nombre} ${t.paraQuien} ${t.resumen}`).includes(termino),
  );

  return (
    <section id="tramites" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-16">
      <TituloSeccion
        eyebrow="Guías de trámites"
        titulo="Cada trámite del Estado, explicado paso a paso"
        desc={`${administrativos.length} guías con lo que necesitas, dónde se hace y cuánto cuesta — agrupadas por lo que vas a resolver, y en el orden en que van.`}
      />

      <div
        className="mx-auto mt-7 flex max-w-[440px] items-center gap-2 rounded-full border bg-white px-4 py-2.5"
        style={{ borderColor: "var(--line)" }}
      >
        <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar trámite…"
          aria-label="Buscar trámite"
          className="min-w-0 flex-1 border-none bg-transparent text-[13.5px] text-marino outline-none"
        />
        {buscando && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Limpiar búsqueda"
            className="shrink-0 cursor-pointer text-texto-4 transition-colors hover:text-marino"
          >
            <Icono nombre="cerrar" size={14} />
          </button>
        )}
      </div>

      {!buscando && (
        <nav
          aria-label="Categorías de trámites"
          className="mt-4 flex flex-wrap justify-center gap-2 text-[12.5px]"
        >
          {RUTAS_TRAMITE.map((r) => (
            <a key={r.id} href={`#ruta-${r.id}`} className="chip-tramite rounded-full px-3.5 py-1.5">
              {r.etiqueta} ({r.pasos.length})
            </a>
          ))}
        </nav>
      )}

      {/* Buscando se rompe el orden a propósito: quien escribe "RTN" quiere su
          guía, no la ruta entera. Navegando, en cambio, las rutas cuentan algo
          que una lista no puede — que los trámites se encadenan. */}
      {buscando ? (
        <div className="mx-auto mt-7 max-w-[720px]">
          {encontrados.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {encontrados.map((t) => (
                <FilaTramite key={t.id} tramite={t} />
              ))}
            </div>
          ) : (
            <div className="glass-card px-6 py-10 text-center">
              <p className="text-[13.5px]" style={{ color: "var(--muted)" }}>
                Aún no tenemos una guía para «{q.trim()}» — pregunta abajo en el consultorio y
                un abogado te orienta gratis.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mt-9 flex max-w-[760px] flex-col gap-11">
          {RUTAS_TRAMITE.map((ruta) => (
            <Ruta key={ruta.id} ruta={ruta} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Una ruta: su encabezado y los trámites encadenados por el riel numerado. */
function Ruta({ ruta }: { ruta: RutaTramite }) {
  return (
    <div id={`ruta-${ruta.id}`} className="scroll-mt-28">
      <p
        className="text-[11px] font-bold tracking-[2px] uppercase"
        style={{ color: "var(--mint)" }}
      >
        {ruta.etiqueta}
      </p>
      <h3 className="font-display mt-1.5 text-[19px] leading-[1.3] font-bold">{ruta.titulo}</h3>
      <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
        {ruta.intro}
      </p>

      <ol className="mt-5 flex flex-col">
        {ruta.pasos.map((paso, i) => {
          const t = getTramite(paso.tramiteId);
          if (!t) return null;
          return (
            <li key={paso.tramiteId} className="flex gap-4">
              {/* Riel: el número y la línea que encadena con el siguiente. */}
              <div className="flex flex-col items-center" aria-hidden>
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold"
                  style={
                    paso.condicional
                      ? {
                          background: "rgba(255,255,255,.7)",
                          border: "1.5px dashed var(--line)",
                          color: "var(--muted)",
                        }
                      : { background: "var(--turq)", color: "#fff" }
                  }
                >
                  {i + 1}
                </span>
                {i < ruta.pasos.length - 1 && (
                  <span
                    className="w-px flex-1"
                    style={{ background: "var(--line)", minHeight: 22 }}
                  />
                )}
              </div>
              <div className="mb-3 min-w-0 flex-1">
                <FilaTramite tramite={t} nota={paso.nota} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Fila de trámite: nombre + sello, su institución (o la nota de la ruta),
 *  el costo de un vistazo y cuántos pasos tiene. */
function FilaTramite({ tramite: t, nota }: { tramite: Tramite; nota?: string }) {
  const inst = getInstitucion(t.institucionId)!;
  const gratis = /^gratuito/i.test(t.tasaCorta);

  return (
    <Link
      href={`/tramites/${t.id}`}
      className="glass-card flex flex-wrap items-center gap-x-4 gap-y-1.5 p-4"
    >
      <div className="min-w-[190px] flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[15px] leading-[1.3] font-semibold">{t.nombre}</span>
          {t.fuenteUrl && (
            <span className="shrink-0 text-exito" title="Verificado con la fuente oficial">
              <Icono nombre="check" size={12} strokeWidth={2.8} />
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px]" style={{ color: "var(--muted)" }}>
          {inst.sigla}
          {nota ? ` · ${nota}` : ""}
        </p>
      </div>
      <span
        className="rounded-full px-3 py-1 text-[12px] font-semibold"
        style={
          gratis
            ? { background: "var(--color-exito-bg)", color: "var(--color-exito)" }
            : { background: "var(--color-chip)", color: "var(--mint)" }
        }
      >
        {t.tasaCorta}
      </span>
      <span className="text-[12px] whitespace-nowrap" style={{ color: "var(--mint)" }}>
        {t.pasos.length} pasos →
      </span>
    </Link>
  );
}


// ── Sección Procesos legales ───────────────────────────────────────────────

/**
 * Lo que pidió el socio: "proceso laboral, me despidieron, ejemplos" — el
 * paso a paso del proceso judicial y, al final, el abogado de ESA materia
 * (recomendado o buscado en el directorio).
 */
export function SeccionProcesos() {
  const [materia, setMateria] = useState<Materia | "todas">("todas");
  const procesos = TRAMITES.filter((t) => t.tipo === "proceso");
  const materias = [...new Set(procesos.map((p) => p.materia))];
  const filtrados =
    materia === "todas" ? procesos : procesos.filter((p) => p.materia === materia);

  return (
    <section id="procesos" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-[1080px] px-5">
        <TituloSeccion
          eyebrow="Procesos legales"
          titulo="¿Te despidieron? ¿Pensión, divorcio, herencia?"
          desc="El paso a paso de cada proceso, en lenguaje claro — y el abogado de esa materia cuando llegue el momento de dar el paso."
        />

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Chip activo={materia === "todas"} onClick={() => setMateria("todas")}>
            Todos ({procesos.length})
          </Chip>
          {materias.map((m) => (
            <Chip key={m} activo={materia === m} onClick={() => setMateria(m)}>
              {m} ({procesos.filter((p) => p.materia === m).length})
            </Chip>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {filtrados.map((t) => (
            <Link key={t.id} href={`/tramites/${t.id}`} className="glass-card flex flex-col p-5.5">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                  style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
                >
                  {t.materia}
                </span>
                <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                  {t.pasos.length} pasos
                </span>
              </div>
              <div className="font-display mt-2 text-[16.5px] leading-[1.3] font-bold">
                {t.nombre}
              </div>
              <p className="mt-1.5 flex-1 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
                {t.resumen}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[12.5px]" style={{ color: "var(--mint)" }}>
                Ver el paso a paso →
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-5 text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
          ¿Ya sabes que necesitas abogado?{" "}
          <a href="#directorio" style={{ color: "var(--mint)" }}>
            Búscalo por materia en el directorio →
          </a>
        </p>
      </div>
    </section>
  );
}

// ── Sección Consultorio ────────────────────────────────────────────────────

export function SeccionConsultorio() {
  const preguntasPublico = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const preguntas = [...preguntasPublico, ...LEADS].slice(0, 4);

  return (
    <section id="consultorio" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-[1080px] px-5">
        <TituloSeccion
          eyebrow="Consultorio gratuito"
          titulo="Pregunta gratis, te responde un abogado colegiado"
          desc="La orientación es pública y sin costo. Para tu caso concreto, contactas al abogado que te convenció."
        />

        <div className="mt-7 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <FormularioPregunta desdeLanding claro />

          <div className="flex flex-col gap-3">
            {preguntas.map((lead) => {
              const respuesta = respondidos[lead.id];
              return (
                <div key={lead.id} className="glass-card p-4.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-[3px] text-[11.5px] font-medium"
                      style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
                    >
                      {lead.materia}
                    </span>
                    <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                      {lead.ciudad} · {lead.cuando}
                    </span>
                    {respuesta && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-exito">
                        <Icono nombre="check" size={9} strokeWidth={2.6} />
                        Respondida
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13.5px] leading-[1.55]">{lead.pregunta}</p>
                  {respuesta && (
                    <p
                      className="mt-2 line-clamp-2 border-l-[3px] pl-3 text-[12.5px] leading-[1.55]"
                      style={{ borderColor: "var(--mint)", color: "var(--muted)" }}
                    >
                      <b>{ABOGADA_DEMO.nombre}:</b> {respuesta}
                    </p>
                  )}
                </div>
              );
            })}
            <Link href="/personas/consultas" className="text-[13px]" style={{ color: "var(--mint)" }}>
              Ver todas las consultas del consultorio →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sección Directorio ─────────────────────────────────────────────────────

/** Filtro del directorio: puede venir de la URL o de un clic del usuario. */
type FiltroDirectorio =
  | { tipo: "todas" }
  | { tipo: "materia"; materia: Materia }
  | { tipo: "notarios" };

const MATERIAS_DIRECTORIO = [...new Set(DIRECTORIO.flatMap((a) => a.materias))];

export function SeccionDirectorio() {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const busqueda = useBusquedaUrl();
  // Cuando el usuario toca un chip, su elección manda sobre la URL.
  const [filtroUsuario, setFiltroUsuario] = useState<FiltroDirectorio | null>(null);

  const filtroUrl = useMemo<FiltroDirectorio>(() => {
    const p = new URLSearchParams(busqueda);
    if (p.get("notarios") === "1") return { tipo: "notarios" };
    const m = p.get("materia");
    // La URL es entrada del usuario: se valida contra las materias reales.
    return m && (MATERIAS_DIRECTORIO as string[]).includes(m)
      ? { tipo: "materia", materia: m as Materia }
      : { tipo: "todas" };
  }, [busqueda]);

  const filtro = filtroUsuario ?? filtroUrl;
  const soloNotarios = filtro.tipo === "notarios";
  const materia: Materia | "todas" = filtro.tipo === "materia" ? filtro.materia : "todas";

  const materias = MATERIAS_DIRECTORIO;
  const abogados = (soloNotarios ? buscarNotarios() : buscarAbogados(materia)).slice(0, 3);

  const elegirMateria = (m: Materia | "todas") =>
    setFiltroUsuario(m === "todas" ? { tipo: "todas" } : { tipo: "materia", materia: m });

  return (
    <section id="directorio" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-16">
      <TituloSeccion
        eyebrow="Encuentra abogado"
        titulo="Profesionales del derecho por materia y ciudad"
        desc="Perfiles con insignia de validado: colegiación comprobada con documentos ante el CAH."
      />

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Chip activo={!soloNotarios && materia === "todas"} onClick={() => elegirMateria("todas")}>
          Todas
        </Chip>
        <Chip activo={soloNotarios} onClick={() => setFiltroUsuario({ tipo: "notarios" })}>
          Notarios
        </Chip>
        {materias.map((m) => (
          <Chip key={m} activo={!soloNotarios && materia === m} onClick={() => elegirMateria(m)}>
            {m}
          </Chip>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {abogados.map((a) => (
          <div key={a.id} className="glass-card flex flex-col p-5">
            <div className="flex items-center gap-3.5">
              <span
                className="font-display grid h-[52px] w-[52px] place-items-center rounded-full text-[17px] font-semibold text-white"
                style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
              >
                {a.iniciales}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[14.5px] font-bold">{a.nombre}</span>
                  {a.validado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10px] font-bold text-exito">
                      <Icono nombre="check" size={9} strokeWidth={2.6} />
                      Validado
                    </span>
                  )}
                  {a.notario && <InsigniaNotario verificado={a.notario.verificado} />}
                </div>
                <div className="text-[12px]" style={{ color: "var(--muted)" }}>
                  {a.ciudad} · ★ {a.valoracion}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.materias.map((m) => (
                <span
                  key={m}
                  className="rounded-full px-2.5 py-[3px] text-[11.5px] font-medium"
                  style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
                >
                  {m}
                </span>
              ))}
            </div>

            <p className="mt-2.5 flex-1 text-[12.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
              {a.bio}
            </p>

            <button
              type="button"
              onClick={() => mostrarToast(`Así inicia el contacto con ${a.nombre} (demo de validación)`)}
              className="mt-4 w-full cursor-pointer rounded-lg py-2.5 text-[13px] font-semibold text-white"
              style={{ background: "var(--turq)" }}
            >
              Contactar por WhatsApp
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 text-center">
        <Link href="/personas/directorio" className="text-[13px]" style={{ color: "var(--mint)" }}>
          Ver todo el directorio →
        </Link>
      </div>
    </section>
  );
}
