"use client";

/**
 * ⚗️ PROTOTIPO TEMPORAL — tres maneras de estructurar el consultorio de la
 * home ciudadana (2026-08-30). Se borra con su ruta al elegir una.
 *
 * El problema que las tres intentan resolver: hoy la sección promete "te
 * responde un abogado colegiado" y enseña preguntas SIN respuesta, porque
 * `leadsRespondidos` arranca vacío. Prueba lo contrario de lo que dice. Por
 * eso los tres prototipos usan las `respuestaDemo` que ya viven en el seed.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { FormularioPregunta } from "@/components/publico/formulario-pregunta";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import type { Lead } from "@/types/dominio";

const RESPONDIDAS = LEADS.filter((l) => l.respuestaDemo);

/** Firma del colegiado que responde — el argumento entero de la sección. */
function Firma({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${compacta ? "h-7 w-7 text-[10.5px]" : "h-9 w-9 text-[12px]"}`}
        style={{ background: "var(--color-celeste)" }}
      >
        {ABOGADA_DEMO.iniciales}
      </span>
      <div className="min-w-0">
        <p className={`leading-[1.3] font-semibold ${compacta ? "text-[12px]" : "text-[13px]"}`}>
          {ABOGADA_DEMO.nombre}
        </p>
        <p
          className={`leading-[1.3] ${compacta ? "text-[10.5px]" : "text-[11.5px]"}`}
          style={{ color: "var(--muted)" }}
        >
          {ABOGADA_DEMO.colegiacion} · {ABOGADA_DEMO.especialidades.join(" · ")}
        </p>
      </div>
    </div>
  );
}

function Intercambio({ lead, compacto = false }: { lead: Lead; compacto?: boolean }) {
  return (
    <div className="glass-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-chip px-2.5 py-[2px] text-[11px] font-semibold text-celeste">
          {lead.materia}
        </span>
        <span className="text-[11px]" style={{ color: "var(--muted)" }}>
          {lead.ciudad} · {lead.cuando}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-exito">
          <Icono nombre="check" size={10} strokeWidth={2.8} />
          Respondida
        </span>
      </div>
      <p className={`mt-2.5 leading-[1.55] ${compacto ? "text-[13px]" : "text-[14.5px]"}`}>
        “{lead.pregunta}”
      </p>
      <div
        className="mt-3.5 border-t pt-3.5"
        style={{ borderColor: "var(--line)" }}
      >
        <Firma compacta={compacto} />
        <p
          className={`mt-2 leading-[1.6] ${compacto ? "line-clamp-3 text-[12.5px]" : "text-[13.5px]"}`}
          style={{ color: "var(--muted)" }}
        >
          {lead.respuestaDemo}
        </p>
      </div>
    </div>
  );
}

const PASOS_CICLO = [
  { icono: "documento" as const, t: "Escribes lo que te pasa", d: "En tus palabras. No hace falta saber el término legal." },
  { icono: "perfil" as const, t: "Responde un colegiado", d: "Con su nombre, su ciudad y sus materias a la vista." },
  { icono: "leads" as const, t: "Queda pública y puedes contactarlo", d: "Le sirve a quien tenga tu misma duda; si te convence, le escribes." },
];

// ── A · la conversación primero ────────────────────────────────────────────

function OpcionA() {
  return (
    <div className="mx-auto max-w-[720px]">
      <Intercambio lead={RESPONDIDAS[0]!} />
      <div className="glass-card mt-5 p-6">
        <h3 className="font-display text-[17px] font-bold">Ahora la tuya</h3>
        <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
          Gratis y sin cuenta para preguntar.
        </p>
        <div className="mt-4">
          <FormularioPregunta desdeLanding claro />
        </div>
      </div>
    </div>
  );
}

// ── B · el ciclo en 3 pasos + formulario, prueba al lado ───────────────────

function OpcionB() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <ol className="flex flex-col gap-3">
          {PASOS_CICLO.map((p, i) => (
            <li key={p.t} className="flex gap-3">
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold"
                style={{ background: "var(--turq)", color: "#fff" }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] font-semibold">{p.t}</p>
                <p className="mt-0.5 text-[12.5px] leading-[1.55]" style={{ color: "var(--muted)" }}>
                  {p.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <FormularioPregunta desdeLanding claro />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {RESPONDIDAS.slice(0, 2).map((l) => (
          <Intercambio key={l.id} lead={l} compacto />
        ))}
      </div>
    </div>
  );
}

// ── C · formulario centrado + muro de respuestas ───────────────────────────

function OpcionC() {
  const [abierta, setAbierta] = useState<string | null>(RESPONDIDAS[0]?.id ?? null);
  return (
    <>
      <div className="mx-auto max-w-[560px]">
        <FormularioPregunta desdeLanding claro />
      </div>
      <p className="mt-8 text-center text-[12px] font-bold tracking-[1.6px] uppercase" style={{ color: "var(--muted)" }}>
        Respondidas esta semana
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        {RESPONDIDAS.map((l) => {
          const on = abierta === l.id;
          return (
            <div key={l.id} className="glass-card overflow-hidden">
              <button
                type="button"
                onClick={() => setAbierta(on ? null : l.id)}
                className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
              >
                <span className="rounded-full bg-chip px-2.5 py-[2px] text-[11px] font-semibold text-celeste">
                  {l.materia}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">
                  {l.pregunta}
                </span>
                <span
                  aria-hidden
                  className={`shrink-0 text-[17px] leading-none transition-transform ${on ? "rotate-45" : ""}`}
                  style={{ color: "var(--mint)" }}
                >
                  +
                </span>
              </button>
              {on && (
                <div className="border-t px-5 pt-3.5 pb-4" style={{ borderColor: "var(--line)" }}>
                  <Firma compacta />
                  <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
                    {l.respuestaDemo}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

function Bloque({
  letra,
  titulo,
  pros,
  contras,
  children,
}: {
  letra: string;
  titulo: string;
  pros: string;
  contras: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-12">
      <div
        className="mb-7 rounded-[14px] border px-5 py-4"
        style={{ borderColor: "var(--line)", background: "rgba(255,255,255,.6)" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-7 w-7 place-items-center rounded-full text-[13px] font-bold"
            style={{ background: "var(--turq)", color: "#fff" }}
          >
            {letra}
          </span>
          <h2 className="font-display text-[19px] font-bold">{titulo}</h2>
        </div>
        <p className="mt-2 text-[12.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          <b style={{ color: "var(--color-exito)" }}>A favor:</b> {pros}
          <br />
          <b style={{ color: "var(--color-aviso-texto)" }}>En contra:</b> {contras}
        </p>
      </div>
      {children}
    </section>
  );
}

export function PrototipoConsultorio() {
  return (
    <div className="landing-contenido">
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-4 text-center md:pt-[176px]">
        <p className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "var(--mint)" }}>
          Prototipo · elegir una
        </p>
        <h1 className="font-display mt-2 text-[clamp(26px,4vw,38px)] leading-[1.15] font-bold text-balance">
          Tres maneras de estructurar el consultorio
        </h1>
        <p className="mx-auto mt-3 max-w-[620px] text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
          Las tres enseñan respuestas de verdad. Hoy la sección promete que responde un
          colegiado y muestra preguntas sin contestar — eso se arregla en cualquiera.
        </p>
      </section>

      <Bloque
        letra="A"
        titulo="La conversación primero"
        pros="Enseña qué recibes ANTES de pedirte que escribas: la pregunta de alguien como tú y la respuesta firmada por una colegiada. Es la que más confianza construye."
        contras="El formulario queda abajo; quien ya venía decidido tiene que bajar para preguntar."
      >
        <OpcionA />
      </Bloque>

      <Bloque
        letra="B"
        titulo="El ciclo en 3 pasos + formulario"
        pros="Explica el mecanismo (escribes → responde un colegiado → queda público) y deja el formulario arriba. Prueba y acción conviven."
        contras="Dos columnas compiten por la atención; en móvil se apila y el argumento se alarga."
      >
        <OpcionB />
      </Bloque>

      <Bloque
        letra="C"
        titulo="Formulario centrado + muro de respuestas"
        pros="La acción manda: formulario grande y centrado. Debajo, las 4 consultas resueltas en acordeón — mucha prueba en poco alto."
        contras="Al entrar solo se ve una respuesta abierta; hay que hacer clic para descubrir el resto."
      >
        <OpcionC />
      </Bloque>

      <section className="mx-auto max-w-[1080px] px-5 pb-20 text-center">
        <Link href="/" className="text-[13.5px] font-semibold" style={{ color: "var(--mint)" }}>
          ← Volver a la home
        </Link>
      </section>
    </div>
  );
}
