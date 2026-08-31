"use client";

/**
 * ⚗️ PROTOTIPO TEMPORAL — "Lo que encuentras dentro", 2ª ronda (2026-08-30).
 * Se borra con su ruta al elegir una.
 *
 * La 1ª ronda (rejilla agrupada / lista / destacada) no convenció, y las
 * insignias de plan se van: la tabla de precios está 800px más abajo y
 * adelantarla convertía una sección que vende ALCANCE en una de precios.
 *
 * Estas tres son paradigmas distintos, no variantes de rejilla:
 *   D · mosaico con celdas de tamaños distintos (jerarquía visual)
 *   E · un caso real de principio a fin (jerarquía narrativa)
 *   F · lista editorial sin cajas (jerarquía tipográfica)
 *
 * Las tres incluyen **Jus IA**, que faltaba en la sección real, y llaman a
 * cada función por el trabajo que resuelve, no por el nombre de su pantalla.
 */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { SimboloJusIA } from "@/components/brand/logos";

type IconoCapacidad = NombreIcono | "jus-ia";

interface Capacidad {
  icono: IconoCapacidad;
  titulo: string;
  desc: string;
}

const CAPS: Capacidad[] = [
  {
    icono: "jus-ia",
    titulo: "Pregunta y recibe la cita",
    desc: "Jus IA responde con la sentencia o el artículo que lo sostiene — y si no lo encuentra, lo dice en vez de inventarlo.",
  },
  {
    icono: "juris",
    titulo: "Jurisprudencia del CSJ",
    desc: "Sentencias con el resumen del CEDIJ, órgano, magistrado y fallo, filtradas por materia.",
  },
  {
    icono: "gaceta",
    titulo: "Entérate de la reforma a tiempo",
    desc: "Alertas de La Gaceta por materia, con el efecto práctico y no solo el titular del acuerdo.",
  },
  {
    icono: "libro",
    titulo: "La ley vigente, con su fuente",
    desc: "Códigos y artículos con síntesis y enlace al PDF oficial del Poder Judicial.",
  },
  {
    icono: "leads",
    titulo: "Que te encuentren clientes",
    desc: "Las consultas del consultorio público llegan con su materia y su ciudad.",
  },
  {
    icono: "plantillas",
    titulo: "Arranca el escrito, no la hoja en blanco",
    desc: "Demandas y escritos editables como punto de partida.",
  },
  {
    icono: "calc",
    titulo: "Calcula sin dudar del número",
    desc: "Prestaciones, cómputo de plazos y vía procesal según la cuantía.",
  },
  {
    icono: "perfil",
    titulo: "Si mencionan a tu cliente, lo sabes",
    desc: "Te avisa cuando un nombre que vigilas aparece en lo que el Estado publica.",
  },
  {
    icono: "pasos",
    titulo: "No dejes vencer un término",
    desc: "El camino procesal con sus plazos y su checklist, paso por paso.",
  },
];

function IconoCap({ nombre, size = 18 }: { nombre: IconoCapacidad; size?: number }) {
  return nombre === "jus-ia" ? (
    <SimboloJusIA size={size + 2} variante="claro" />
  ) : (
    <Icono nombre={nombre} size={size} />
  );
}

// ── D · mosaico ────────────────────────────────────────────────────────────

/** Cuánto ocupa cada celda. La primera manda; el resto la rodea. */
const AREAS = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-2",
  "",
  "",
  "lg:col-span-2",
  "",
  "",
  "lg:col-span-2",
  "lg:col-span-2",
];

function OpcionD() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {CAPS.map((c, i) => {
        const grande = i === 0;
        return (
          <div
            key={c.titulo}
            className={`glass-card flex flex-col p-5 ${AREAS[i]}`}
            style={
              grande
                ? {
                    borderColor: "rgba(21,132,199,.4)",
                    background:
                      "linear-gradient(160deg, rgba(21,132,199,.10), rgba(255,255,255,.72) 55%)",
                  }
                : undefined
            }
          >
            <span
              className={`grid place-items-center rounded-xl ${grande ? "h-12 w-12" : "h-9 w-9"}`}
              style={{ background: "rgba(21,132,199,.12)", color: "var(--mint)" }}
            >
              <IconoCap nombre={c.icono} size={grande ? 24 : 17} />
            </span>
            <h3
              className={`font-display mt-3.5 leading-[1.25] font-bold ${grande ? "text-[22px]" : "text-[15px]"}`}
            >
              {c.titulo}
            </h3>
            <p
              className={`mt-2 flex-1 leading-[1.6] ${grande ? "text-[14px]" : "text-[12.5px]"}`}
              style={{ color: "var(--muted)" }}
            >
              {c.desc}
              {grande && " Es lo que separa a Justihn de preguntarle a un chatbot."}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── E · un caso de principio a fin ─────────────────────────────────────────

const CASO = [
  {
    icono: "jus-ia" as IconoCapacidad,
    momento: "Llega el caso",
    titulo: "Preguntas en lenguaje normal",
    desc: "«Me despidieron tras 4 años sin prestaciones, ¿qué reclamo y en cuánto tiempo?». Jus IA responde con el artículo y la sentencia que lo sostienen.",
  },
  {
    icono: "juris" as IconoCapacidad,
    momento: "Verificas",
    titulo: "Abres la sentencia citada",
    desc: "Expediente, órgano, magistrado y fallo, con el resumen del CEDIJ. La cita se comprueba antes de llevarla a un escrito.",
  },
  {
    icono: "calc" as IconoCapacidad,
    momento: "Cuantificas",
    titulo: "Calculas lo que le corresponde",
    desc: "Cesantía, preaviso y proporcionales desglosados, y la vía procesal según la cuantía.",
  },
  {
    icono: "plantillas" as IconoCapacidad,
    momento: "Redactas",
    titulo: "Arrancas del modelo, no de cero",
    desc: "La demanda laboral editable, con el cálculo anexo.",
  },
  {
    icono: "pasos" as IconoCapacidad,
    momento: "Presentas",
    titulo: "Sigues el proceso sin perder un término",
    desc: "El camino con sus plazos y su checklist hasta la audiencia.",
  },
];

const EN_PARALELO = [
  { icono: "gaceta" as IconoCapacidad, t: "La Gaceta te avisa de lo que cambia en tus materias" },
  { icono: "perfil" as IconoCapacidad, t: "Y si mencionan a tu cliente en lo que el Estado publica" },
  { icono: "leads" as IconoCapacidad, t: "Mientras el consultorio te trae el caso siguiente" },
];

function OpcionE() {
  return (
    <div className="mx-auto max-w-[760px]">
      <ol className="flex flex-col">
        {CASO.map((p, i) => (
          <li key={p.titulo} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                style={{ background: "var(--turq)", color: "#fff" }}
              >
                <IconoCap nombre={p.icono} size={16} />
              </span>
              {i < CASO.length - 1 && (
                <span
                  className="w-px flex-1"
                  style={{ background: "var(--line)", minHeight: 20 }}
                />
              )}
            </div>
            <div className="mb-5 min-w-0 flex-1 pt-1">
              <p
                className="text-[10.5px] font-bold tracking-[1.6px] uppercase"
                style={{ color: "var(--mint)" }}
              >
                {p.momento}
              </p>
              <h3 className="font-display mt-1 text-[16.5px] leading-[1.3] font-bold">
                {p.titulo}
              </h3>
              <p
                className="mt-1.5 text-[13.5px] leading-[1.6]"
                style={{ color: "var(--muted)" }}
              >
                {p.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div
        className="glass-card mt-3 flex flex-col gap-2.5 p-5"
        style={{ background: "rgba(21,132,199,.06)" }}
      >
        <p
          className="text-[10.5px] font-bold tracking-[1.6px] uppercase"
          style={{ color: "var(--mint)" }}
        >
          Y mientras tanto, solo
        </p>
        {EN_PARALELO.map((x) => (
          <div key={x.t} className="flex items-center gap-2.5 text-[13.5px]">
            <span className="shrink-0" style={{ color: "var(--mint)" }}>
              <IconoCap nombre={x.icono} size={15} />
            </span>
            {x.t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── F · lista editorial, sin cajas ─────────────────────────────────────────

function OpcionF() {
  return (
    <div className="mx-auto max-w-[820px]">
      {CAPS.map((c, i) => (
        <div
          key={c.titulo}
          className={`flex flex-wrap items-baseline gap-x-5 gap-y-1 py-5 ${i > 0 ? "border-t" : ""}`}
          style={i > 0 ? { borderColor: "var(--line)" } : undefined}
        >
          <span
            className="shrink-0 self-center"
            style={{ color: "var(--mint)", width: 22 }}
            aria-hidden
          >
            <IconoCap nombre={c.icono} size={19} />
          </span>
          <h3 className="font-display min-w-[260px] flex-1 text-[19px] leading-[1.25] font-bold">
            {c.titulo}
          </h3>
          <p
            className="min-w-[280px] flex-[1.3] text-[13.5px] leading-[1.6]"
            style={{ color: "var(--muted)" }}
          >
            {c.desc}
          </p>
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
          Prototipo · 2ª ronda
        </p>
        <h1 className="font-display mt-2 text-[clamp(26px,4vw,38px)] leading-[1.15] font-bold text-balance">
          Tres maneras de contar lo que hay dentro
        </h1>
        <p
          className="mx-auto mt-3 max-w-[660px] text-[14px] leading-[1.65]"
          style={{ color: "var(--muted)" }}
        >
          Sin insignias de plan: la tabla de precios está 800px más abajo y adelantarla
          convertía una sección que vende alcance en una de precios. Tres paradigmas
          distintos — jerarquía visual, narrativa y tipográfica.
        </p>
      </section>

      <Bloque
        letra="D"
        titulo="Mosaico"
        idea="Celdas de tamaños distintos: Jus IA manda y el resto la rodea."
        pros="Jerarquía de un vistazo, sin leer. Rompe el muro de cajas iguales y deja aire donde hace falta; es el lenguaje que la gente ya reconoce en producto."
        contras="El tamaño de cada celda es una decisión estética que hay que sostener, y en móvil el mosaico se aplana a una columna: la jerarquía desaparece."
      >
        <OpcionD />
      </Bloque>

      <Bloque
        letra="E"
        titulo="Un caso, de principio a fin"
        idea="Un despido injustificado recorrido con las herramientas en el orden real de uso."
        pros="No enumera funciones: enseña el producto TRABAJANDO. Un abogado ve su miércoles ahí dentro, y de paso queda claro que las piezas se encadenan en vez de ser nueve cosas sueltas."
        contras="Se casa con una materia (laboral); quien litiga penal tiene que traducir. Y compite en formato con las rutas de trámites de la home."
      >
        <OpcionE />
      </Bloque>

      <Bloque
        letra="F"
        titulo="Lista editorial"
        idea="Sin cajas: tipografía grande a la izquierda, explicación a la derecha, línea fina entre medias."
        pros="Se lee como un índice, no como un catálogo. Mucho aire, cero ruido visual, y el titular de cada función tiene sitio para decir algo de verdad."
        contras="Es la más sobria de las tres: no aporta ninguna jerarquía — las nueve pesan igual, que era parte del problema original."
      >
        <OpcionF />
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
