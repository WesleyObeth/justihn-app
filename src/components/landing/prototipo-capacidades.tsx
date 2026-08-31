"use client";

/**
 * ⚗️ PROTOTIPO TEMPORAL — reestructurar "Lo que encuentras dentro" de la
 * landing de abogados (2026-08-30). Se borra con su ruta al elegir una.
 *
 * Lo que las tres corrigen del muro de 8 cards iguales:
 *   1. **Faltaba Jus IA** — el corazón del producto, con demo propio justo
 *      debajo, no estaba en la lista de lo que encuentras dentro.
 *   2. **Títulos de pantalla, no de trabajo.** Nadie busca "monitoreo de
 *      nombres"; busca enterarse si mencionan a su cliente.
 *   3. **No decía qué plan incluye qué**, que es la duda que decide y estaba
 *      2.000px más abajo.
 *   4. **Cero jerarquía**: Jus IA pesaría lo mismo que la calculadora.
 *
 * ⚠️ Hallazgo que hay que resolver con Wesley, no con diseño: **"Procesos
 * paso a paso" no aparece en las features de NINGÚN plan** del catálogo. Aquí
 * se marca como pendiente en vez de inventarle un plan.
 */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { SimboloJusIA } from "@/components/brand/logos";

type Plan = "Gratis" | "Profesional" | "Premium" | "pendiente";

type IconoCapacidad = NombreIcono | "jus-ia";

interface Capacidad {
  icono: IconoCapacidad;
  /** El trabajo que resuelve, en la voz del abogado. */
  titulo: string;
  desc: string;
  /** Plan mínimo — sacado de `PLANES[].features` del catálogo. */
  plan: Plan;
  nota?: string;
}

const INVESTIGAR: Capacidad[] = [
  {
    icono: "jus-ia",
    titulo: "Preguntar y recibir la cita",
    desc: "Jus IA responde con la sentencia o el artículo que lo sostiene — y si no lo encuentra, lo dice.",
    plan: "Profesional",
    nota: "60/mes · ilimitada en Premium",
  },
  {
    icono: "juris",
    titulo: "Buscar jurisprudencia del CSJ",
    desc: "Sentencias con el resumen del CEDIJ, órgano, magistrado y fallo, filtradas por materia.",
    plan: "Gratis",
    nota: "limitada · ilimitada desde Profesional",
  },
  {
    icono: "libro",
    titulo: "Consultar la ley vigente",
    desc: "Códigos y artículos con su síntesis y el enlace al PDF oficial del Poder Judicial.",
    plan: "Profesional",
  },
];

const NO_PERDER: Capacidad[] = [
  {
    icono: "gaceta",
    titulo: "Enterarte de la reforma a tiempo",
    desc: "Alertas de La Gaceta por materia, con el efecto práctico y no solo el titular del acuerdo.",
    plan: "Profesional",
  },
  {
    icono: "perfil",
    titulo: "Saber si mencionan a tu cliente",
    desc: "Te avisa cuando un nombre que vigilas aparece en lo que el Estado publica.",
    plan: "Premium",
  },
  {
    icono: "pasos",
    titulo: "No dejar vencer un término",
    desc: "El camino procesal con sus plazos y su checklist, paso por paso.",
    plan: "pendiente",
  },
];

const TRABAJAR: Capacidad[] = [
  {
    icono: "plantillas",
    titulo: "Arrancar un escrito, no la hoja en blanco",
    desc: "Demandas y escritos editables como punto de partida.",
    plan: "Premium",
  },
  {
    icono: "calc",
    titulo: "Calcular sin dudar del número",
    desc: "Prestaciones laborales, cómputo de plazos y vía procesal según la cuantía.",
    plan: "Premium",
  },
  {
    icono: "leads",
    titulo: "Que te encuentren clientes",
    desc: "Las consultas del consultorio público llegan con su materia y su ciudad.",
    plan: "Gratis",
    nota: "con prioridad en Premium",
  },
];

const GRUPOS = [
  { id: "investigar", titulo: "Investigar", sub: "Lo que antes te llevaba una tarde", items: INVESTIGAR },
  { id: "vigilar", titulo: "No perder nada", sub: "Lo que se pierde por no enterarse a tiempo", items: NO_PERDER },
  { id: "trabajar", titulo: "Producir y crecer", sub: "Del escrito al cliente siguiente", items: TRABAJAR },
];

const TODAS = [...INVESTIGAR, ...NO_PERDER, ...TRABAJAR];

function Insignia({ plan, nota }: { plan: Plan; nota?: string }) {
  if (plan === "pendiente") {
    return (
      <span
        className="rounded-full px-2 py-[2px] text-[10.5px] font-bold"
        style={{ background: "var(--color-aviso)", color: "var(--color-aviso-texto)" }}
        title="No aparece en las features de ningún plan del catálogo"
      >
        Plan sin definir
      </span>
    );
  }
  const estilo =
    plan === "Gratis"
      ? { background: "var(--color-exito-bg)", color: "var(--color-exito)" }
      : plan === "Profesional"
        ? { background: "rgba(21,132,199,.12)", color: "var(--mint)" }
        : { background: "rgba(197,160,72,.16)", color: "#8a6d2a" };
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span
        className="rounded-full px-2 py-[2px] text-[10.5px] font-bold whitespace-nowrap"
        style={estilo}
      >
        {plan === "Gratis" ? "Desde Gratis" : `Desde ${plan}`}
      </span>
      {nota && (
        <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>
          {nota}
        </span>
      )}
    </span>
  );
}

function IconoCap({ nombre, size = 17 }: { nombre: IconoCapacidad; size?: number }) {
  return nombre === "jus-ia" ? (
    <SimboloJusIA size={size + 1} variante="claro" />
  ) : (
    <Icono nombre={nombre} size={size} />
  );
}

// ── A · agrupadas por el trabajo que resuelven ─────────────────────────────

function OpcionA() {
  return (
    <div className="flex flex-col gap-10">
      {GRUPOS.map((g) => (
        <div key={g.id}>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h3 className="font-display text-[18px] font-bold">{g.titulo}</h3>
            <span className="text-[13px]" style={{ color: "var(--muted)" }}>
              {g.sub}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {g.items.map((c) => (
              <div key={c.titulo} className="glass-card flex flex-col p-5">
                <span
                  className="grid h-9 w-9 place-items-center rounded-[10px]"
                  style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
                >
                  <IconoCap nombre={c.icono} />
                </span>
                <h4 className="mt-3 text-[14.5px] leading-[1.3] font-bold">{c.titulo}</h4>
                <p
                  className="mt-1.5 flex-1 text-[12.5px] leading-[1.6]"
                  style={{ color: "var(--muted)" }}
                >
                  {c.desc}
                </p>
                <div className="mt-3">
                  <Insignia plan={c.plan} nota={c.nota} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── B · lista con la columna del plan ──────────────────────────────────────

function OpcionB() {
  return (
    <div className="mx-auto max-w-[820px]">
      {GRUPOS.map((g) => (
        <div key={g.id} className="mt-7 first:mt-0">
          <p
            className="text-[11px] font-bold tracking-[1.6px] uppercase"
            style={{ color: "var(--mint)" }}
          >
            {g.titulo}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {g.items.map((c) => (
              <div
                key={c.titulo}
                className="glass-card flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5"
              >
                <span className="shrink-0" style={{ color: "var(--mint)" }}>
                  <IconoCap nombre={c.icono} size={16} />
                </span>
                <div className="min-w-[240px] flex-1">
                  <p className="text-[14px] leading-[1.3] font-semibold">{c.titulo}</p>
                  <p className="mt-0.5 text-[12px] leading-[1.5]" style={{ color: "var(--muted)" }}>
                    {c.desc}
                  </p>
                </div>
                <Insignia plan={c.plan} nota={c.nota} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── C · Jus IA destacada + el resto compacto ───────────────────────────────

function OpcionC() {
  const [jusIa, ...resto] = TODAS;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div
        className="glass-card flex flex-col p-6"
        style={{
          borderColor: "rgba(21,132,199,.5)",
          boxShadow: "0 0 0 1px rgba(21,132,199,.4), 0 14px 40px rgba(21,132,199,.12)",
        }}
      >
        <span
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ background: "rgba(21,132,199,.12)" }}
        >
          <SimboloJusIA size={22} variante="claro" />
        </span>
        <h3 className="font-display mt-3.5 text-[20px] leading-[1.25] font-bold">
          {jusIa!.titulo}
        </h3>
        <p className="mt-2 flex-1 text-[13.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          {jusIa!.desc} Es lo que separa a Justihn de preguntarle a un chatbot: sin fuente,
          no hay respuesta.
        </p>
        <div className="mt-4">
          <Insignia plan={jusIa!.plan} nota={jusIa!.nota} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {resto.map((c) => (
          <div key={c.titulo} className="glass-card flex flex-col p-4">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0" style={{ color: "var(--mint)" }}>
                <IconoCap nombre={c.icono} size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] leading-[1.3] font-bold">{c.titulo}</p>
                <p className="mt-1 text-[12px] leading-[1.5]" style={{ color: "var(--muted)" }}>
                  {c.desc}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pl-[26px]">
              <Insignia plan={c.plan} nota={c.nota} />
            </div>
          </div>
        ))}
      </div>
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
          Prototipo · elegir una
        </p>
        <h1 className="font-display mt-2 text-[clamp(26px,4vw,38px)] leading-[1.15] font-bold text-balance">
          Tres maneras de contar lo que hay dentro
        </h1>
        <p
          className="mx-auto mt-3 max-w-[660px] text-[14px] leading-[1.65]"
          style={{ color: "var(--muted)" }}
        >
          Las tres arreglan lo mismo: <b>añaden Jus IA</b> (faltaba), cambian los nombres de
          pantalla por el trabajo que resuelven, y dicen <b>qué plan incluye cada cosa</b> —
          la duda que decide y que hoy vive 2.000px más abajo.
        </p>
      </section>

      <Bloque
        letra="A"
        titulo="Agrupadas por el trabajo"
        idea="Investigar · No perder nada · Producir y crecer."
        pros="Un abogado se reconoce en los grupos, no en una lista de pantallas. Da jerarquía sin sacrificar nada y hace pareja con las rutas de trámites de la home."
        contras="Es la más alta de las tres, y hay funciones que caben en dos grupos (las alertas también son investigar)."
      >
        <OpcionA />
      </Bloque>

      <Bloque
        letra="B"
        titulo="Lista con la columna del plan"
        idea="Filas compactas agrupadas, con la insignia del plan a la derecha."
        pros="La más escaneable y la mitad de alto. El plan queda alineado en columna, así que se compara de un vistazo qué te da cada nivel."
        contras="Se siente a tabla de precios adelantada; le quita algo de aire a una sección que vende alcance."
      >
        <OpcionB />
      </Bloque>

      <Bloque
        letra="C"
        titulo="Jus IA destacada + el resto"
        idea="La función que diferencia manda; las otras ocho la acompañan."
        pros="Deja clarísimo cuál es el corazón del producto. El ojo entra por Jus IA y el resto se lee como lo que la rodea."
        contras="Aplana las ocho restantes: 'que te encuentren clientes' merece más que una línea, y aquí pesa igual que la calculadora."
      >
        <OpcionC />
      </Bloque>

      <section className="mx-auto max-w-[1080px] px-5 pb-20 text-center">
        <Link href="/para-abogados" className="text-[13.5px] font-semibold" style={{ color: "var(--mint)" }}>
          ← Volver a la landing
        </Link>
      </section>
    </div>
  );
}
