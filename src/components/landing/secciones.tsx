"use client";

/**
 * Las tres experiencias públicas como SECCIONES de la landing (patrón
 * Jusbrasil: todo se ve en la home, profundizar pide cuenta). Cada una es
 * interactiva de verdad — filtros, buscador y el formulario real del
 * consultorio — sobre el tema aurora claro.
 */
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { FormularioPregunta } from "@/components/publico/formulario-pregunta";
import { getInstitucion, INSTITUCIONES, TRAMITES } from "@/data/tramites";
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

function TituloSeccion({ eyebrow, titulo, desc }: { eyebrow: string; titulo: string; desc: string }) {
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
  const [institucion, setInstitucion] = useState("todas");

  const administrativos = TRAMITES.filter((t) => t.tipo === "tramite");
  const termino = normalizar(q.trim());
  const filtrados = administrativos.filter((t) => {
    const porInst = institucion === "todas" || t.institucionId === institucion;
    const porTermino =
      !termino || normalizar(`${t.nombre} ${t.paraQuien} ${t.resumen}`).includes(termino);
    return porInst && porTermino;
  });

  return (
    <section id="tramites" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-16">
      <TituloSeccion
        eyebrow="Guías de trámites"
        titulo="Cada trámite del Estado, explicado paso a paso"
        desc={`${administrativos.length} guías ante las instituciones del Estado: qué necesitas, dónde se hace y cuánto cuesta.`}
      />

      <div className="mx-auto mt-7 flex max-w-[440px] items-center gap-2 rounded-full border bg-white px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
        <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar trámite…"
          aria-label="Buscar trámite"
          className="min-w-0 flex-1 border-none bg-transparent text-[13.5px] text-marino outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Chip activo={institucion === "todas"} onClick={() => setInstitucion("todas")}>
          Todas ({administrativos.length})
        </Chip>
        {INSTITUCIONES.map((inst) => {
          const n = administrativos.filter((t) => t.institucionId === inst.id).length;
          if (n === 0) return null;
          return (
            <Chip
              key={inst.id}
              activo={institucion === inst.id}
              onClick={() => setInstitucion(inst.id)}
            >
              {inst.sigla} ({n})
            </Chip>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((t) => {
          const inst = getInstitucion(t.institucionId)!;
          return (
            <Link key={t.id} href={`/tramites/${t.id}`} className="glass-card flex flex-col p-5">
              <div className="text-[11px] font-bold tracking-[.8px] uppercase" style={{ color: "var(--mint)" }}>
                {inst.sigla}
              </div>
              <div className="font-display mt-1 flex items-start gap-1.5 text-[15px] leading-[1.35] font-semibold">
                {t.nombre}
                {t.fuenteUrl && (
                  <span
                    title="Verificado con la fuente oficial"
                    className="mt-[3px] shrink-0 text-exito"
                  >
                    <Icono nombre="check" size={13} strokeWidth={2.6} />
                  </span>
                )}
              </div>
              <p className="mt-1.5 flex-1 text-[12.5px] leading-[1.55]" style={{ color: "var(--muted)" }}>
                {t.paraQuien}
              </p>
              <div className="mt-2.5 text-[12px]" style={{ color: "var(--mint)" }}>
                Ver la guía ({t.pasos.length} pasos) →
              </div>
            </Link>
          );
        })}
      </div>

      {filtrados.length === 0 && (
        <div className="glass-card mt-6 px-6 py-10 text-center">
          <p className="text-[13.5px]" style={{ color: "var(--muted)" }}>
            Aún no tenemos una guía para «{q.trim()}» — pregunta abajo en el consultorio y un
            abogado te orienta gratis.
          </p>
        </div>
      )}
    </section>
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
            <Link href="/persona/consultas" className="text-[13px]" style={{ color: "var(--mint)" }}>
              Ver todas las consultas del consultorio →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sección Directorio ─────────────────────────────────────────────────────

export function SeccionDirectorio() {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  // `?materia=` y `?notarios=1` permiten llegar filtrado desde un paso de guía.
  const params = useSearchParams();
  const materiaUrl = params.get("materia") as Materia | null;
  const [materia, setMateria] = useState<Materia | "todas">(materiaUrl ?? "todas");
  const [soloNotarios, setSoloNotarios] = useState(params.get("notarios") === "1");

  const materias = [...new Set(DIRECTORIO.flatMap((a) => a.materias))];
  const abogados = (soloNotarios ? buscarNotarios() : buscarAbogados(materia)).slice(0, 3);

  const elegirMateria = (m: Materia | "todas") => {
    setSoloNotarios(false);
    setMateria(m);
  };

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
        <Chip activo={soloNotarios} onClick={() => setSoloNotarios(true)}>
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
        <Link href="/persona/abogados" className="text-[13px]" style={{ color: "var(--mint)" }}>
          Ver todo el directorio →
        </Link>
      </div>
    </section>
  );
}
