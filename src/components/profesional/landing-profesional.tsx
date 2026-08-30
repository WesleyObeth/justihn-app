import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { OFERTA, PLANES } from "@/data/catalogo";
import { INSTITUCIONES, TRAMITES } from "@/data/tramites";
import { ComposerJusIA } from "@/components/profesional/composer-jus-ia";
import { DemoGaceta, DemoJusIA, DemoLeads, SeccionDemo } from "@/components/profesional/demos";

/**
 * Landing de la vía A: el abogado que todavía no es suscriptor.
 *
 * Regla de esta página: **no promete nada que el portal no haga hoy**. El
 * corpus completo aún no está indexado, así que aquí no se anuncian cifras de
 * sentencias — se vende lo que sí es verificable: que cada respuesta llega con
 * su fuente, y que cuando no la hay el sistema lo dice en vez de inventarla.
 */

const CAPACIDADES: { icono: NombreIcono; titulo: string; desc: string }[] = [
  {
    icono: "juris",
    titulo: "Jurisprudencia del CSJ",
    desc: "Sentencias con el resumen del CEDIJ, órgano, magistrado y fallo. Filtras por materia y abres el texto íntegro.",
  },
  {
    icono: "libro",
    titulo: "Legislación",
    desc: "Códigos y artículos con su síntesis. Lo que está cargado se muestra con su fuente; lo que no, aparece en preparación.",
  },
  {
    icono: "gaceta",
    titulo: "Alertas de La Gaceta",
    desc: "Publicaciones por materia, para enterarte de la reforma antes que tu contraparte.",
  },
  {
    icono: "pasos",
    titulo: "Procesos paso a paso",
    desc: "El camino procesal con sus plazos y su checklist, para no perder un término por descuido.",
  },
  {
    icono: "plantillas",
    titulo: "Modelos de escritos",
    desc: "Demandas y escritos editables como punto de partida, no como plantilla ciega.",
  },
  {
    icono: "calc",
    titulo: "Calculadoras del litigante",
    desc: "Prestaciones laborales, cómputo de plazos y vía procesal según la cuantía.",
  },
  {
    icono: "perfil",
    titulo: "Monitoreo de nombres",
    desc: "Te avisa cuando un nombre que vigilas aparece en lo que el Estado publica.",
  },
  {
    icono: "leads",
    titulo: "Leads del consultorio",
    desc: "Las consultas que la gente hace en el lado público llegan aquí, con su materia y ciudad.",
  },
];

export function LandingProfesional() {
  return (
    <div className="landing-contenido">
      {/* ── Hero ── */}
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-8 text-center md:pt-[176px]">
        <h1 className="font-display mx-auto max-w-[820px] text-[clamp(32px,5.5vw,52px)] leading-[1.12] font-bold text-balance">
          Tu investigación jurídica empieza en Justihn
        </h1>
        <p
          className="mx-auto mt-5 max-w-[580px] text-[15.5px] leading-[1.65]"
          style={{ color: "var(--muted)" }}
        >
          Pregunta por jurisprudencia, legislación, La Gaceta, procesos y modelos de
          escritos. Cada respuesta llega con su fuente.
        </p>

        {/* La caja ES la demostración: pregunta algo real y mira con qué
            fuentes responde. Gemela del buscador de la home ciudadana. */}
        <ComposerJusIA />
      </section>

      {/* ── Cómo cita: el diferencial ── */}
      <section id="fuentes" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <h2 className="font-display text-center text-[26px] font-bold">
          La diferencia con preguntarle a una IA cualquiera
        </h2>
        <p
          className="mx-auto mt-2 max-w-[620px] text-center text-[14px] leading-[1.6]"
          style={{ color: "var(--muted)" }}
        >
          Una cita inventada no es un error de software: es un escrito que se cae en
          audiencia. Por eso el sistema está construido al revés que un chatbot.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Pilar
            icono="check"
            titulo="Sin fuente no hay respuesta"
            desc="Si no encuentra el documento que respalda lo que le preguntas, lo dice. Prefiere quedarse corto antes que llenar el vacío."
          />
          <Pilar
            icono="documento"
            titulo="Solo fuentes del Estado"
            desc="Poder Judicial, La Gaceta, SAR, Instituto de la Propiedad, ARSA, ONCAE. Cada afirmación enlaza al documento original."
          />
          <Pilar
            icono="ubicacion"
            titulo="Derecho hondureño"
            desc="No contenido de México o España adaptado a las malas: códigos, instituciones y trámites de aquí."
          />
        </div>
      </section>

      {/* ── Capacidades ── */}
      <section id="capacidades" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <h2 className="font-display text-center text-[26px] font-bold">
          Lo que encuentras dentro
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPACIDADES.map((c) => (
            <div key={c.titulo} className="glass-card flex flex-col p-5">
              <span
                className="grid h-9 w-9 place-items-center rounded-[10px]"
                style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
              >
                <Icono nombre={c.icono} size={17} />
              </span>
              <h3 className="mt-3 text-[14.5px] font-bold">{c.titulo}</h3>
              <p
                className="mt-1.5 text-[12.5px] leading-[1.6]"
                style={{ color: "var(--muted)" }}
              >
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demostraciones: el producto a la vista, con datos reales ── */}
      <SeccionDemo
        id="jus-ia"
        eyebrow="Jus IA"
        titulo="Pregunta en lenguaje normal, recibe la cita"
        descripcion="No hace falta acertar con el término del buscador. Preguntas como se lo explicarías a un colega y la respuesta llega con la sentencia o el artículo que la sostiene, enlazado al documento del Estado."
        puntos={[
          { icono: "check", texto: "La cita se abre: expediente, órgano, magistrado y fallo" },
          { icono: "candado", texto: "Si no encuentra fuente lo dice, en vez de rellenar el hueco" },
          { icono: "reloj", texto: "El historial guarda cada consulta con sus fuentes" },
        ]}
        demo={<DemoJusIA />}
      />

      <SeccionDemo
        eyebrow="Alertas de La Gaceta"
        titulo="Entérate de la reforma antes que tu contraparte"
        descripcion="Eliges tus materias y Justihn te avisa de lo que se publica. Cada alerta explica en una línea a qué de tu trabajo afecta — no te deja el PDF y que te las arregles."
        puntos={[
          { icono: "gaceta", texto: "Filtradas por las materias que litigas" },
          { icono: "juris", texto: "Con el efecto práctico, no solo el titular del acuerdo" },
          { icono: "bell", texto: "Monitoreo de nombres: te avisa cuando aparece uno que vigilas" },
        ]}
        demo={<DemoGaceta />}
        invertida
      />

      <SeccionDemo
        id="leads"
        eyebrow="Clientes, no solo herramientas"
        titulo="El mismo sitio donde la gente busca ayuda es donde te encuentra"
        descripcion={`Del lado público hay ${TRAMITES.length} guías de trámites y procesos ante ${INSTITUCIONES.length} instituciones del Estado, y un consultorio gratuito. Cada guía termina recomendando un abogado de esa materia, y cada consulta sin responder es un cliente esperando.`}
        puntos={[
          { icono: "leads", texto: "Las consultas llegan con su materia y su ciudad" },
          { icono: "perfil", texto: "Tu perfil aparece en el directorio, con prioridad si eres Premium" },
          { icono: "documento", texto: "Las guías de trámites derivan a un abogado de esa materia" },
        ]}
        demo={<DemoLeads />}
      />

      {/* ── Planes ── */}
      <section id="planes" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <h2 className="font-display text-center text-[26px] font-bold">
          Planes en lempiras, pensados para el gremio
        </h2>
        <p
          className="mx-auto mt-2 max-w-[560px] text-center text-[14px] leading-[1.6]"
          style={{ color: "var(--muted)" }}
        >
          Todo el contenido está en todos los planes. Lo que cambia es cuánta IA con citas
          usas al mes.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANES.map((p) => (
            <div
              key={p.id}
              className="glass-card flex flex-col p-6"
              style={p.destacado ? { borderColor: "rgba(21,132,199,.45)" } : undefined}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[12px] font-bold tracking-[1.2px] uppercase"
                  style={{ color: p.colorEtiqueta }}
                >
                  {p.nombre}
                </span>
                {p.destacado && (
                  <span
                    className="rounded-full px-2.5 py-[3px] text-[10.5px] font-bold"
                    style={{ background: "rgba(21,132,199,.12)", color: "var(--mint)" }}
                  >
                    Recomendado
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-[32px] leading-none font-bold">
                  {p.precioEtiqueta}
                </span>
                <span className="text-[13px]" style={{ color: "var(--muted)" }}>
                  {p.periodo}
                </span>
              </div>
              {p.precioAnualLempiras > 0 && (
                <p className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
                  o {p.precioAnualEtiqueta}
                  {p.periodoAnual} ({OFERTA.descuentoAnual})
                </p>
              )}
              <ul className="mt-4 flex flex-1 flex-col gap-2 text-[13px]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5" style={{ color: "var(--muted)" }}>
                    <span style={{ color: "var(--mint)" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/abogados/planes"
                className="mt-5 rounded-[10px] py-2.5 text-center text-[13.5px] font-semibold"
                style={
                  p.destacado
                    ? { background: "var(--turq)", color: "#fff" }
                    : { border: "1px solid var(--line)", color: "var(--muted)" }
                }
              >
                {p.precioLempiras === 0 ? "Empezar gratis" : "Elegir plan"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────────
          Único bloque oscuro de la página, a propósito: después de recorrer
          todo en claro, el momento de decidir tiene su propio peso visual.
          El marino es el mismo del sidebar del portal — al que lleva. */}
      <section className="mx-auto max-w-[1080px] px-5 py-16">
        <div
          className="relative overflow-hidden rounded-[24px] px-6 py-14 text-center md:px-14"
          style={{
            background: "linear-gradient(160deg,#0d2144 0%,#0a1830 55%,#08142a 100%)",
            border: "1px solid rgba(125,211,252,.16)",
          }}
        >
          {/* Resplandor celeste: eco del fondo aurora, ahora sobre marino. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 0%, rgba(21,132,199,.35) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <p
              className="text-[11.5px] font-bold tracking-[2.5px] uppercase"
              style={{ color: "#7dd3fc" }}
            >
              Tu próximo caso
            </p>
            <h2 className="font-display mx-auto mt-4 max-w-[720px] text-[clamp(26px,4vw,42px)] leading-[1.14] font-bold text-balance text-white">
              Tu próxima búsqueda ya no empieza en Google.
            </h2>
            <p
              className="mx-auto mt-4 max-w-[540px] text-[15px] leading-[1.65]"
              style={{ color: "rgba(226,238,248,.72)" }}
            >
              Crea tu cuenta gratis y pregúntale a Jus IA una duda real del caso que
              tienes encima. Si no encuentra la fuente te lo va a decir — eso también es
              información.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/* ⚠️ El color va INLINE, no con `text-white`: la landing define
                  `.landing-aurora a { color: inherit }`, que por especificidad
                  le gana a las utilidades de Tailwind y dejaba el texto marino
                  sobre el botón azul. */}
              <Link
                href="/crear-cuenta"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14.5px] font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--turq)", color: "#fff" }}
              >
                Crear cuenta gratis
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/abogados"
                className="rounded-full border px-7 py-3.5 text-[14.5px] font-semibold transition-colors"
                style={{ borderColor: "rgba(226,238,248,.32)", color: "#e2eef8" }}
              >
                Ver el portal por dentro
              </Link>
            </div>

            <p className="mt-6 text-[12.5px]" style={{ color: "rgba(226,238,248,.55)" }}>
              Plan Gratis sin caducidad · primer mes a {OFERTA.anclaPrimerMes} · anual{" "}
              {OFERTA.descuentoAnual}
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-6 border-t" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-start justify-between gap-6 px-5 py-10">
          <div className="max-w-[420px]">
            <p className="font-display text-[15px] font-bold">Justihn</p>
            <p className="mt-2 text-[12.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
              Orientación legal con fuentes oficiales para Honduras. Justihn no sustituye
              el criterio del profesional: es la herramienta con la que trabaja.
            </p>
          </div>
          <div className="flex gap-10 text-[12.5px]" style={{ color: "var(--muted)" }}>
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold" style={{ color: "var(--ink)" }}>
                Abogados
              </span>
              <Link href="/abogados">Portal</Link>
              <Link href="/abogados/planes">Planes</Link>
              <a href="#capacidades">Qué incluye</a>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold" style={{ color: "var(--ink)" }}>
                Para personas
              </span>
              <Link href="/">Guías y trámites</Link>
              <Link href="/#consultorio">Consultorio</Link>
              <Link href="/#directorio">Encuentra abogado</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Pilar({
  icono,
  titulo,
  desc,
}: {
  icono: NombreIcono;
  titulo: string;
  desc: string;
}) {
  return (
    <div className="glass-card p-6">
      <span
        className="grid h-10 w-10 place-items-center rounded-full"
        style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
      >
        <Icono nombre={icono} size={18} strokeWidth={2.2} />
      </span>
      <h3 className="mt-3.5 text-[15px] font-bold">{titulo}</h3>
      <p className="mt-1.5 text-[13px] leading-[1.65]" style={{ color: "var(--muted)" }}>
        {desc}
      </p>
    </div>
  );
}
