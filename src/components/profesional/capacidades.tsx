"use client";

/**
 * "Lo que encuentras dentro" — **tres categorías con vista previa**
 * (estructura elegida por Wesley 2026-08-30 sobre una referencia suya: lista
 * seleccionable a la izquierda, panel de producto a la derecha).
 *
 * Sustituye al muro de 8 cards iguales, que tenía tres problemas: no incluía
 * **Jus IA** (el corazón del producto), llamaba a cada función por el nombre
 * de su pantalla en vez de por el trabajo que resuelve, y no daba ninguna
 * jerarquía — la calculadora pesaba lo mismo que la jurisprudencia del CSJ.
 *
 * Detalles que sostienen la estructura:
 * - **Cada card lleva sus funciones como chips aunque no esté activa.** La
 *   referencia son tres servicios; aquí son nueve funciones, y si solo se
 *   vieran las de la categoría abierta el inventario desaparecería.
 * - **Los tres paneles se MONTAN siempre** y el inactivo se oculta con
 *   `hidden`. Montar solo el activo dejaría 6 de 9 funciones fuera del HTML
 *   del servidor — el error que ya costó un incidente de SSR en la home.
 * - **Los tres paneles miden lo mismo** (`min-h`): con alturas distintas, la
 *   página daba un salto al cambiar de categoría.
 *
 * ⚠️ El contenido de los paneles sale de los **seeds reales** (la sentencia
 * CL-528-24 del piloto del corpus, la alerta de Gaceta, el lead del
 * consultorio): no son maquetas y cambian con el seed. La idea de meter
 * capturas del portal está evaluada en `plataforma/CLAUDE.md` — se difiere a
 * cuando la UI se estabilice tras Supabase, porque una captura driftea en
 * cuanto cambia una pantalla y no le da texto al crawler.
 */
import { useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { SimboloJusIA } from "@/components/brand/logos";
import { LEADS } from "@/data/catalogo";
import { PUBLICACIONES } from "@/data/gaceta";
import { SENTENCIAS } from "@/data/sentencias";
import { PLANTILLAS } from "@/data/catalogo";

type IconoCap = NombreIcono | "jus-ia";

interface Categoria {
  id: string;
  icono: NombreIcono;
  titulo: string;
  desc: string;
  funciones: { icono: IconoCap; titulo: string }[];
}

const CATEGORIAS: Categoria[] = [
  {
    id: "investigar",
    icono: "buscar",
    titulo: "Investigar con fuente",
    desc: "Jurisprudencia, leyes y un asistente que responde citando el documento — o admite que no lo encontró.",
    funciones: [
      { icono: "jus-ia", titulo: "Jus IA" },
      { icono: "juris", titulo: "Jurisprudencia del CSJ" },
      { icono: "libro", titulo: "Legislación vigente" },
    ],
  },
  {
    id: "vigilar",
    icono: "bell",
    titulo: "No perder nada de vista",
    desc: "Lo que cambia en tus materias, lo que se publica sobre tus clientes y los términos que corren.",
    funciones: [
      { icono: "gaceta", titulo: "Alertas de La Gaceta" },
      { icono: "perfil", titulo: "Monitoreo de nombres" },
      { icono: "pasos", titulo: "Procesos con sus plazos" },
    ],
  },
  {
    id: "producir",
    icono: "documento",
    titulo: "Producir y conseguir clientes",
    desc: "Del escrito al cliente siguiente: modelos, cálculos y las consultas que llegan del lado público.",
    funciones: [
      { icono: "plantillas", titulo: "Modelos de escritos" },
      { icono: "calc", titulo: "Calculadoras del litigante" },
      { icono: "leads", titulo: "Leads del consultorio" },
    ],
  },
];

/** Alto común de los tres paneles: sin él, cambiar de categoría daba un salto. */
const ALTO_PANEL = "min-h-[404px]";

function IconoFn({ nombre, size = 14 }: { nombre: IconoCap; size?: number }) {
  return nombre === "jus-ia" ? (
    <SimboloJusIA size={size + 2} variante="claro" />
  ) : (
    <Icono nombre={nombre} size={size} />
  );
}

function Marco({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div
      className={`superficie-dia flex flex-col overflow-hidden rounded-[16px] border border-borde bg-white shadow-[0_18px_50px_rgba(13,33,68,.13)] ${ALTO_PANEL}`}
    >
      <div className="ventana-cabecera flex items-center gap-2 border-b px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: "var(--line)" }} />
          ))}
        </span>
        <span
          className="text-[10.5px] font-bold tracking-[1.2px] uppercase"
          style={{ color: "var(--muted)" }}
        >
          {etiqueta}
        </span>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

// ── Vistas: contenido REAL de los seeds ────────────────────────────────────

function VistaInvestigar() {
  const s = SENTENCIAS.find((x) => x.expediente === "CL-528-24") ?? SENTENCIAS[0]!;
  return (
    <Marco etiqueta="Jus IA">
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-[12px] bg-chip px-3.5 py-2 text-[12.5px] leading-[1.5] text-marino">
          ¿En cuánto tiempo prescribe el reclamo por despido injustificado?
        </p>
      </div>
      <div className="mt-3 flex gap-2.5">
        <span className="mt-0.5 shrink-0">
          <SimboloJusIA size={17} variante="claro" />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] leading-[1.55] text-texto-2">
            Dos meses desde la terminación del contrato, según el{" "}
            <b className="text-marino">artículo 864 del Código del Trabajo</b>. Si fue por culpa
            del patrono, el plazo del 865 es de un mes.
          </p>
          <div className="caja-panel mt-3 rounded-[10px] border px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-[1px] text-celeste uppercase">
                Fuente citada
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[1px] text-[9.5px] font-bold text-exito">
                <Icono nombre="check" size={9} strokeWidth={2.6} />
                Verificable
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-[1.4] font-semibold text-marino">
              {s.expediente} · {s.titulo}
            </p>
            <p className="mt-1 text-[11px] leading-[1.4] text-texto-4">
              {s.organo} · {s.fecha}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[10.5px]" style={{ color: "var(--muted)" }}>
        Sin fuente no responde · el criterio jurídico es del profesional
      </p>
    </Marco>
  );
}

function VistaVigilar() {
  const pubs = PUBLICACIONES.slice(0, 2);
  return (
    <Marco etiqueta="Alertas y monitoreo">
      <div className="flex flex-col gap-2">
        {pubs.map((p, i) => (
          <div key={p.id} className="caja-panel rounded-[10px] border px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-chip px-2 py-[1px] text-[10px] font-semibold text-celeste">
                {p.materia}
              </span>
              {i === 0 && (
                <span className="rounded-full bg-aviso px-2 py-[1px] text-[10px] font-bold text-aviso-texto">
                  Nuevo
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[12px] leading-[1.4] font-semibold text-marino">
              {p.titulo}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-[1.5] text-texto-4">{p.afecta}</p>
          </div>
        ))}
        <div
          className="flex items-center gap-2 rounded-[10px] px-3 py-2.5"
          style={{ background: "var(--color-chip)" }}
        >
          <Icono nombre="perfil" size={14} className="shrink-0 text-celeste" />
          <p className="text-[11.5px] leading-[1.45] text-texto-2">
            <b className="text-marino">Wilson P. Henríquez</b> apareció en una sentencia nueva
          </p>
        </div>
      </div>
    </Marco>
  );
}

function VistaProducir() {
  const modelo = PLANTILLAS.find((p) => p.id === "despido-injustificado") ?? PLANTILLAS[0]!;
  const lead = LEADS[0]!;
  return (
    <Marco etiqueta="Modelos y leads">
      <div className="caja-panel rounded-[10px] border px-3 py-2.5">
        <p className="text-[10px] font-bold tracking-[1px] text-celeste uppercase">
          {modelo.nombre}
        </p>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-[1.65] text-texto-3">
          {modelo.vistaPrevia.split("\n")[0]}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10.5px] text-texto-4">{modelo.desc}</span>
          <span className="text-[10.5px] font-semibold text-celeste">Editar →</span>
        </div>
      </div>
      <div className="caja-panel mt-2 rounded-[10px] border px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-chip px-2 py-[1px] text-[10px] font-semibold text-celeste">
            {lead.materia}
          </span>
          <span className="text-[10px] text-texto-4">
            {lead.ciudad} · {lead.cuando}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-[1.5] text-texto-2">
          “{lead.pregunta}”
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10.5px] text-texto-4">
            {lead.respuestas === 1 ? "1 abogado ya respondió" : `${lead.respuestas} respondieron`}
          </span>
          <span
            className="rounded-[7px] px-2.5 py-1 text-[10.5px] font-semibold text-white"
            style={{ background: "var(--turq)" }}
          >
            Responder
          </span>
        </div>
      </div>
    </Marco>
  );
}

const VISTAS: Record<string, React.ReactNode> = {
  investigar: <VistaInvestigar />,
  vigilar: <VistaVigilar />,
  producir: <VistaProducir />,
};

export function Capacidades() {
  const [activa, setActiva] = useState(CATEGORIAS[0]!.id);

  return (
    <div className="mt-9 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)]">
      <div className="flex flex-col gap-3">
        {CATEGORIAS.map((c) => {
          const on = c.id === activa;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiva(c.id)}
              aria-pressed={on}
              className="glass-card glass-card--estatica cursor-pointer p-5 text-left transition-colors"
              style={
                on
                  ? {
                      borderColor: "rgba(21,132,199,.5)",
                      boxShadow: "0 0 0 1px rgba(21,132,199,.35)",
                    }
                  : undefined
              }
            >
              <div className="flex items-start gap-3.5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors"
                  style={
                    on
                      ? { background: "var(--color-celeste)", color: "#fff" }
                      : { background: "rgba(21,132,199,.1)", color: "var(--mint)" }
                  }
                >
                  <Icono nombre={c.icono} size={19} />
                </span>
                <div className="min-w-0">
                  <h3
                    className="font-display text-[17px] leading-[1.25] font-bold"
                    style={on ? { color: "var(--mint)" } : undefined}
                  >
                    {c.titulo}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
                    {c.desc}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.funciones.map((f) => (
                      <span
                        key={f.titulo}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-medium transition-colors"
                        style={{
                          background: on ? "rgba(21,132,199,.12)" : "rgba(13,33,68,.05)",
                          color: on ? "var(--mint)" : "var(--muted)",
                        }}
                      >
                        <IconoFn nombre={f.icono} size={12} />
                        {f.titulo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:sticky lg:top-28">
        {CATEGORIAS.map((c) => (
          <div key={c.id} hidden={c.id !== activa}>
            {VISTAS[c.id]}
          </div>
        ))}
      </div>
    </div>
  );
}
