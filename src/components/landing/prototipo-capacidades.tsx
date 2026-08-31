"use client";

/**
 * ⚗️ PROTOTIPO TEMPORAL — "Lo que encuentras dentro", 3ª ronda (2026-08-30).
 * Se borra con su ruta al elegir una.
 *
 * Patrón de la referencia que pasó Wesley: **lista seleccionable a la
 * izquierda, vista previa a la derecha**. Resuelve a la vez los dos problemas
 * de la sección original — da jerarquía (se mira una cosa a la vez) sin
 * perder el inventario (las tres categorías siempre visibles) — y encima
 * enseña producto en lugar de describirlo.
 *
 * Las nueve funciones se reparten en las 3 categorías que pidió Wesley.
 *
 * ⚠️ SSR: los tres paneles se MONTAN siempre y el inactivo se oculta con
 * `hidden`. Montar solo el activo dejaría 6 de 9 funciones fuera del HTML del
 * servidor — el mismo error que ya costó un incidente en la home.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { SimboloJusIA } from "@/components/brand/logos";

type IconoCap = NombreIcono | "jus-ia";

interface Funcion {
  icono: IconoCap;
  titulo: string;
  desc: string;
}

interface Categoria {
  id: string;
  icono: NombreIcono;
  titulo: string;
  desc: string;
  funciones: Funcion[];
}

const CATEGORIAS: Categoria[] = [
  {
    id: "investigar",
    icono: "buscar",
    titulo: "Investigar con fuente",
    desc: "Jurisprudencia, leyes y un asistente que responde citando el documento — o admite que no lo encontró.",
    funciones: [
      {
        icono: "jus-ia",
        titulo: "Jus IA",
        desc: "Preguntas en lenguaje normal; responde con la sentencia o el artículo que lo sostiene.",
      },
      {
        icono: "juris",
        titulo: "Jurisprudencia del CSJ",
        desc: "Con el resumen del CEDIJ, órgano, magistrado y fallo, filtrada por materia.",
      },
      {
        icono: "libro",
        titulo: "Legislación vigente",
        desc: "Códigos y artículos con síntesis y enlace al PDF oficial del Poder Judicial.",
      },
    ],
  },
  {
    id: "vigilar",
    icono: "bell",
    titulo: "No perder nada de vista",
    desc: "Lo que cambia en tus materias, lo que se publica sobre tus clientes y los términos que corren.",
    funciones: [
      {
        icono: "gaceta",
        titulo: "Alertas de La Gaceta",
        desc: "Por materia, con el efecto práctico y no solo el titular del acuerdo.",
      },
      {
        icono: "perfil",
        titulo: "Monitoreo de nombres",
        desc: "Te avisa cuando un nombre que vigilas aparece en lo que el Estado publica.",
      },
      {
        icono: "pasos",
        titulo: "Procesos con sus plazos",
        desc: "El camino procesal paso por paso, con su checklist para no dejar vencer un término.",
      },
    ],
  },
  {
    id: "producir",
    icono: "documento",
    titulo: "Producir y conseguir clientes",
    desc: "Del escrito al cliente siguiente: modelos, cálculos y las consultas que llegan del lado público.",
    funciones: [
      {
        icono: "plantillas",
        titulo: "Modelos de escritos",
        desc: "Demandas y escritos editables como punto de partida, no como plantilla ciega.",
      },
      {
        icono: "calc",
        titulo: "Calculadoras del litigante",
        desc: "Prestaciones, cómputo de plazos y vía procesal según la cuantía.",
      },
      {
        icono: "leads",
        titulo: "Leads del consultorio",
        desc: "Las consultas del público llegan con su materia y su ciudad.",
      },
    ],
  },
];

function IconoFn({ nombre, size = 16 }: { nombre: IconoCap; size?: number }) {
  return nombre === "jus-ia" ? (
    <SimboloJusIA size={size + 2} variante="claro" />
  ) : (
    <Icono nombre={nombre} size={size} />
  );
}

// ── Vistas previas esquemáticas (el panel derecho) ─────────────────────────

function Marco({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="superficie-dia overflow-hidden rounded-[14px] border border-borde bg-white">
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
      <div className="p-4">{children}</div>
    </div>
  );
}

function VistaInvestigar() {
  return (
    <Marco etiqueta="Jus IA">
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-[12px] bg-chip px-3.5 py-2 text-[12.5px] leading-[1.5] text-marino">
          ¿En cuánto prescribe el reclamo por despido injustificado?
        </p>
      </div>
      <div className="mt-3 flex gap-2.5">
        <span className="mt-0.5 shrink-0">
          <SimboloJusIA size={17} variante="claro" />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] leading-[1.55] text-texto-2">
            Dos meses desde la terminación del contrato,{" "}
            <b className="text-marino">artículo 864 del Código del Trabajo</b>.
          </p>
          <div className="caja-panel mt-2.5 rounded-[10px] border px-3 py-2">
            <span className="text-[10px] font-bold tracking-[1px] text-celeste uppercase">
              Fuente citada
            </span>
            <p className="mt-1 text-[11.5px] font-semibold text-marino">
              CL-528-24 · Casación laboral
            </p>
          </div>
        </div>
      </div>
    </Marco>
  );
}

function VistaVigilar() {
  return (
    <Marco etiqueta="Alertas y monitoreo">
      <div className="flex flex-col gap-2">
        {[
          { m: "Laboral", t: "Reglamento de teletrabajo en el sector privado", n: true },
          { m: "Civil", t: "Reforma a disposiciones sobre arrendamiento", n: false },
        ].map((a) => (
          <div key={a.t} className="caja-panel rounded-[10px] border px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-chip px-2 py-[1px] text-[10px] font-semibold text-celeste">
                {a.m}
              </span>
              {a.n && (
                <span className="rounded-full bg-aviso px-2 py-[1px] text-[10px] font-bold text-aviso-texto">
                  Nuevo
                </span>
              )}
            </div>
            <p className="mt-1 text-[12px] leading-[1.4] font-semibold text-marino">{a.t}</p>
          </div>
        ))}
        <div
          className="mt-1 flex items-center gap-2 rounded-[10px] px-3 py-2.5"
          style={{ background: "var(--color-chip)" }}
        >
          <Icono nombre="perfil" size={14} className="shrink-0 text-celeste" />
          <p className="text-[11.5px] text-texto-2">
            <b className="text-marino">Wilson P. Henríquez</b> apareció en una sentencia nueva
          </p>
        </div>
      </div>
    </Marco>
  );
}

function VistaProducir() {
  return (
    <Marco etiqueta="Modelos y leads">
      <div className="caja-panel rounded-[10px] border px-3 py-2.5">
        <p className="text-[10px] font-bold tracking-[1px] text-celeste uppercase">
          Demanda por despido injustificado
        </p>
        <p className="mt-1.5 font-mono text-[10.5px] leading-[1.6] text-texto-3">
          SEÑOR JUEZ DE LETRAS DEL TRABAJO DE [CIUDAD]
          <br />
          Yo, [NOMBRE], comparezco a interponer DEMANDA…
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10.5px] text-texto-4">Cálculo de prestaciones anexo</span>
          <span className="text-[10.5px] font-semibold text-celeste">Editar →</span>
        </div>
      </div>
      <div className="caja-panel mt-2 rounded-[10px] border px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-chip px-2 py-[1px] text-[10px] font-semibold text-celeste">
            Laboral
          </span>
          <span className="text-[10px] text-texto-4">San Pedro Sula · hace 2 h</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-[1.5] text-texto-2">
          “Me despidieron después de 4 años sin darme ninguna explicación ni pagarme
          prestaciones…”
        </p>
      </div>
    </Marco>
  );
}

const VISTAS: Record<string, React.ReactNode> = {
  investigar: <VistaInvestigar />,
  vigilar: <VistaVigilar />,
  producir: <VistaProducir />,
};

// ── G · el patrón de la referencia ─────────────────────────────────────────

function OpcionG() {
  const [activa, setActiva] = useState(CATEGORIAS[0]!.id);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
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
                  <p
                    className="mt-1.5 text-[13px] leading-[1.6]"
                    style={{ color: "var(--muted)" }}
                  >
                    {c.desc}
                  </p>
                  {/* Las tres funciones siempre visibles: son el inventario y
                      no pueden depender de que la categoría esté activa. */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.funciones.map((f) => (
                      <span
                        key={f.titulo}
                        className="rounded-full px-2.5 py-[3px] text-[11px] font-medium"
                        style={{
                          background: on ? "rgba(21,132,199,.12)" : "rgba(13,33,68,.05)",
                          color: on ? "var(--mint)" : "var(--muted)",
                        }}
                      >
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

// ── H · mismo patrón, pero el panel lista las funciones en detalle ─────────

function OpcionH() {
  const [activa, setActiva] = useState(CATEGORIAS[0]!.id);
  const cat = CATEGORIAS.find((c) => c.id === activa)!;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="flex flex-col gap-2.5">
        {CATEGORIAS.map((c) => {
          const on = c.id === activa;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiva(c.id)}
              aria-pressed={on}
              className="flex cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-3.5 text-left transition-colors"
              style={
                on
                  ? { borderColor: "var(--color-celeste)", background: "rgba(21,132,199,.08)" }
                  : { borderColor: "var(--line)", background: "rgba(255,255,255,.6)" }
              }
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
                style={
                  on
                    ? { background: "var(--color-celeste)", color: "#fff" }
                    : { background: "rgba(21,132,199,.1)", color: "var(--mint)" }
                }
              >
                <Icono nombre={c.icono} size={17} />
              </span>
              <span
                className="text-[14.5px] leading-[1.25] font-bold"
                style={on ? { color: "var(--mint)" } : undefined}
              >
                {c.titulo}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        {CATEGORIAS.map((c) => (
          <div key={c.id} hidden={c.id !== activa}>
            <p className="text-[13.5px] leading-[1.65]" style={{ color: "var(--muted)" }}>
              {c.desc}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {c.funciones.map((f) => (
                <div key={f.titulo} className="glass-card flex flex-col p-4">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-[10px]"
                    style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
                  >
                    <IconoFn nombre={f.icono} size={17} />
                  </span>
                  <h4 className="mt-3 text-[14px] leading-[1.3] font-bold">{f.titulo}</h4>
                  <p
                    className="mt-1.5 text-[12.5px] leading-[1.55]"
                    style={{ color: "var(--muted)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-4">{VISTAS[cat.id]}</div>
      </div>
    </div>
  );
}

// ── I · las tres categorías en columna, sin interacción ────────────────────

function OpcionI() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {CATEGORIAS.map((c) => (
        <div key={c.id} className="glass-card flex flex-col p-5">
          <span
            className="grid h-11 w-11 place-items-center rounded-xl"
            style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
          >
            <Icono nombre={c.icono} size={19} />
          </span>
          <h3 className="font-display mt-3.5 text-[17px] leading-[1.25] font-bold">
            {c.titulo}
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
            {c.desc}
          </p>
          <div className="mt-4 flex flex-col border-t pt-1" style={{ borderColor: "var(--line)" }}>
            {c.funciones.map((f, i) => (
              <div
                key={f.titulo}
                className={`flex gap-2.5 py-3 ${i > 0 ? "border-t" : ""}`}
                style={i > 0 ? { borderColor: "var(--line)" } : undefined}
              >
                <span className="mt-0.5 shrink-0" style={{ color: "var(--mint)" }}>
                  <IconoFn nombre={f.icono} size={15} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] leading-[1.3] font-semibold">{f.titulo}</p>
                  <p
                    className="mt-0.5 text-[12px] leading-[1.5]"
                    style={{ color: "var(--muted)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

function Bloque({
  letra,
  titulo,
  idea,
  pros,
  contras,
  children,
}: {
  letra: string;
  titulo: string;
  idea: string;
  pros: string;
  contras: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-12">
      <div
        className="mb-8 rounded-[14px] border px-5 py-4"
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
          <b style={{ color: "var(--mint)" }}>La idea:</b> {idea}
          <br />
          <b style={{ color: "var(--color-exito)" }}>A favor:</b> {pros}
          <br />
          <b style={{ color: "var(--color-aviso-texto)" }}>En contra:</b> {contras}
        </p>
      </div>
      {children}
    </section>
  );
}

export function PrototipoCapacidades() {
  return (
    <div className="landing-contenido">
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-4 text-center md:pt-[176px]">
        <p
          className="text-[11px] font-bold tracking-[2px] uppercase"
          style={{ color: "var(--mint)" }}
        >
          Prototipo · 3ª ronda
        </p>
        <h1 className="font-display mt-2 text-[clamp(26px,4vw,38px)] leading-[1.15] font-bold text-balance">
          Tres categorías, con vista previa
        </h1>
        <p
          className="mx-auto mt-3 max-w-[680px] text-[14px] leading-[1.65]"
          style={{ color: "var(--muted)" }}
        >
          Sobre la referencia que pasaste: lista seleccionable a la izquierda y panel de vista
          previa a la derecha. Las nueve funciones se reparten en{" "}
          <b>Investigar · No perder nada de vista · Producir y conseguir clientes</b>.
        </p>
      </section>

      <Bloque
        letra="G"
        titulo="Como la referencia"
        idea="Tres cards seleccionables a la izquierda; a la derecha, el producto de esa categoría."
        pros="Es el patrón de tu referencia: jerarquía sin perder inventario. Cada card lleva sus tres funciones como chips, así que se ve TODO aunque solo una esté activa — y el panel enseña producto en lugar de describirlo."
        contras="Necesita clic para descubrir las otras dos vistas; quien no interactúe se lleva solo la primera."
      >
        <OpcionG />
      </Bloque>

      <Bloque
        letra="H"
        titulo="Selector estrecho + detalle ancho"
        idea="La izquierda se reduce a tres botones; la derecha despliega las tres funciones en detalle y la vista previa debajo."
        pros="Da mucho más sitio al detalle de cada función: cabe una descripción de verdad, no un chip. La columna izquierda ocupa poco y se escanea de un golpe."
        contras="Al cambiar de categoría se mueve casi toda la sección — más ruido visual que en G, donde solo cambia el panel."
      >
        <OpcionH />
      </Bloque>

      <Bloque
        letra="I"
        titulo="Tres columnas, sin clic"
        idea="Las tres categorías lado a lado, cada una con sus tres funciones dentro."
        pros="Todo visible de una vez, cero interacción, cero riesgo de que alguien se pierda dos tercios. La más simple de mantener."
        contras="Sin vista previa: vuelve a describir en vez de enseñar, que era justo lo que la referencia resuelve."
      >
        <OpcionI />
      </Bloque>

      <section className="mx-auto max-w-[1080px] px-5 pb-20 text-center">
        <Link
          href="/para-abogados"
          className="text-[13.5px] font-semibold"
          style={{ color: "var(--mint)" }}
        >
          ← Volver a la landing
        </Link>
      </section>
    </div>
  );
}
