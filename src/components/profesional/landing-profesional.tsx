import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { OFERTA, PLANES } from "@/data/catalogo";
import { INSTITUCIONES, TRAMITES } from "@/data/tramites";
import { PieAurora } from "@/components/landing/pie-aurora";
import { Capacidades } from "@/components/profesional/capacidades";
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


/**
 * FAQ de la landing — responde objeciones de quien AÚN no tiene cuenta, no las
 * dudas de uso del portal (esas viven en `FAQS` del catálogo y en /abogados/ayuda).
 * Los precios se interpolan del catálogo: nada de escribir "L147" a mano (§0.5).
 * Misma regla que toda la página: no prometer lo que el portal no hace hoy.
 */
const FAQ_LANDING: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "¿Jus IA puede inventarme una cita?",
    respuesta:
      "Está construido para lo contrario: si no encuentra el documento que respalda la respuesta, te dice que no lo encontró. Cada cita trae expediente o artículo y enlaza al documento oficial, para que la verifiques antes de llevarla a un escrito.",
  },
  {
    pregunta: "¿De dónde sale la información?",
    respuesta:
      "Solo de fuentes que el Estado publica: sentencias del Poder Judicial con el resumen del CEDIJ, códigos y leyes, La Gaceta, y los requisitos de instituciones como el SAR, el IP, ARSA y ONCAE. Justihn no usa foros ni doctrina de otros países.",
  },
  {
    pregunta: "¿Cuánto cuesta?",
    respuesta: `Hay un plan Gratis que no caduca. Los de pago van de ${PLANES[1]!.precioEtiqueta} a ${PLANES[2]!.precioEtiqueta} al mes, con el primer mes a ${OFERTA.anclaPrimerMes} y el año completo al precio de 8 meses (${OFERTA.descuentoAnual}). Ambos traen todo el contenido: la diferencia es la cuota de Jus IA.`,
  },
  {
    pregunta: "¿Puedo usar las respuestas en mis escritos?",
    respuesta:
      "Sí — el texto y sus citas son tuyos, y cada fuente se puede abrir para verificarla. Jus IA es tu asistente de investigación, no tu firma: el criterio jurídico y la responsabilidad profesional del escrito siguen siendo tuyos.",
  },
  {
    pregunta: "¿Cómo me llegan clientes?",
    respuesta:
      "Tu perfil aparece en el directorio público desde el plan Gratis. Cuando alguien pregunta en el consultorio gratuito, la consulta te llega como lead con su materia y ciudad — responder en público es lo que te pone delante de quien busca abogado. Con Premium apareces con prioridad.",
  },
  {
    pregunta: "¿Necesito tarjeta para empezar?",
    respuesta:
      "No. El plan Gratis no pide método de pago y no caduca: creas tu cuenta, le preguntas a Jus IA una duda real y decides después si el sistema te sirve para el día a día.",
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
        <Encabezado
          eyebrow="Cómo cita"
          titulo="La diferencia con preguntarle a una IA cualquiera"
          sub="Una cita inventada no es un error de software: es un escrito que se cae en audiencia. Por eso el sistema está construido al revés que un chatbot."
        />
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
            desc="Nada de doctrina de México o España adaptada a medias: códigos, instituciones y trámites de aquí."
          />
        </div>
      </section>

      {/* ── Capacidades ── */}
      <section id="capacidades" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <Encabezado
          eyebrow="Qué incluye"
          titulo="Lo que encuentras dentro"
          sub="Nueve herramientas que ya son pantallas del portal, no promesas de un roadmap."
        />
        <Capacidades />
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
        <Encabezado
          eyebrow="Planes"
          titulo="Elige tu plan, pensado para el gremio"
          sub="Los planes de pago traen todo el contenido, ilimitado — la diferencia entre ellos es la cuota de Jus IA. El Gratis te deja probar sin tarjeta."
        />

        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          {PLANES.map((p, i) => (
            <div
              key={p.id}
              className="glass-card flex flex-col p-6"
              /* El destaque va por sombra-anillo, no por grosor de borde: un
                 borde de 2px encogería el contenido 1px por lado y las tres
                 cards dejarían de alinear. */
              style={
                p.destacado
                  ? {
                      borderColor: "rgba(21,132,199,.55)",
                      boxShadow:
                        "0 0 0 1px rgba(21,132,199,.45), 0 14px 40px rgba(21,132,199,.14)",
                    }
                  : undefined
              }
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
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted)" }}>
                {p.resumen}
              </p>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-[32px] leading-none font-bold">
                  {p.precioEtiqueta}
                </span>
                <span className="text-[13px]" style={{ color: "var(--muted)" }}>
                  {p.periodo}
                </span>
              </div>
              {/* Las tres cards llevan SIEMPRE esta línea: en las de pago es el
                  precio anual y en Gratis, el "sin tarjeta". Si Gratis no la
                  tuviera, sus features arrancarían más arriba que las demás. */}
              <p className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
                {p.precioAnualLempiras > 0 ? (
                  <>
                    o {p.precioAnualEtiqueta}
                    {p.periodoAnual} ({OFERTA.descuentoAnual})
                  </>
                ) : (
                  <>para siempre — sin tarjeta</>
                )}
              </p>
              <div
                className="mt-4 flex flex-1 flex-col border-t pt-4"
                style={{ borderColor: "var(--line)" }}
              >
                {i > 0 && (
                  <p className="mb-2 text-[12px] font-semibold">
                    Todo lo del plan {PLANES[i - 1]!.nombre}, y además:
                  </p>
                )}
                <ul className="flex flex-col gap-2 text-[13px]">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5" style={{ color: "var(--muted)" }}>
                      <span style={{ color: "var(--mint)" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/crear-cuenta"
                /* Solo el plan destacado lleva imán: es el único con relleno
                   azul. Los otros dos son de borde (ver el CTA secundario). */
                className={`${p.destacado ? "magnetic " : ""}mt-5 rounded-[10px] py-2.5 text-center text-[13.5px] font-semibold`}
                style={
                  p.destacado
                    ? { background: "var(--turq)", color: "#fff" }
                    : { border: "1px solid var(--line)", color: "var(--ink)" }
                }
              >
                {p.precioLempiras === 0 ? "Crear cuenta gratis" : `Empezar con ${p.nombre}`}
              </Link>
            </div>
          ))}
        </div>

        <p
          className="mx-auto mt-6 max-w-[560px] text-center text-[12.5px] leading-[1.6]"
          style={{ color: "var(--muted)" }}
        >
          Primer mes a {OFERTA.anclaPrimerMes} en tu primera suscripción de pago · el año
          completo equivale a 8 meses ({OFERTA.descuentoAnual}) · cambias o cancelas cuando
          quieras.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-[760px] scroll-mt-24 px-5 py-14">
        <Encabezado
          eyebrow="Antes de crear tu cuenta"
          titulo="Preguntas frecuentes"
          sub="Las dudas que más escuchamos del gremio, respondidas sin letra pequeña."
        />
        <div className="mt-8 flex flex-col gap-3">
          {FAQ_LANDING.map((f) => (
            <details
              key={f.pregunta}
              /* El relleno va en el `summary`, no aquí: puesto en el
                 contenedor, la zona que abre la pregunta medía 20px de alto
                 —el de la línea de texto— y en el teléfono había que apuntarle.
                 Con el relleno dentro, se toca la fila entera. */
              className="group rounded-[14px] border"
              style={{
                borderColor: "var(--line)",
                background: "var(--card)",
                backdropFilter: "blur(6px)",
              }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14.5px] leading-[1.4] font-semibold [&::-webkit-details-marker]:hidden">
                {f.pregunta}
                <span
                  aria-hidden
                  className="shrink-0 text-[18px] leading-none font-normal transition-transform duration-200 group-open:rotate-45"
                  style={{ color: "var(--mint)" }}
                >
                  +
                </span>
              </summary>
              <p
                className="-mt-1 px-5 pb-4 text-[13.5px] leading-[1.65]"
                style={{ color: "var(--muted)" }}
              >
                {f.respuesta}
              </p>
            </details>
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

            {/* Un solo CTA a propósito (decisión Wesley 2026-08-30): el
                cierre pide UNA decisión. El "Ver el portal por dentro" que
                acompañaba aquí competía con el botón azul y ofrecía entrar sin
                cuenta justo donde se pide crearla. La entrada directa al
                portal —la que sirve para enseñárselo al socio— sigue viva en
                el pie ("Abogados → Portal"). */}
            <div className="mt-8 flex justify-center">
              {/* ⚠️ El color va INLINE, no con `text-white`: la landing define
                  `.landing-aurora a { color: inherit }`, que por especificidad
                  le gana a las utilidades de Tailwind y dejaba el texto marino
                  sobre el botón azul. */}
              <Link
                href="/crear-cuenta"
                className="magnetic inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14.5px] font-semibold transition-opacity hover:opacity-90"
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
            </div>

            <p className="mt-6 text-[12.5px]" style={{ color: "rgba(226,238,248,.55)" }}>
              Plan Gratis sin caducidad · primer mes a {OFERTA.anclaPrimerMes} · anual{" "}
              {OFERTA.descuentoAnual}
            </p>
          </div>
        </div>
      </section>

      <PieAurora
        descripcion="Orientación legal con fuentes oficiales para Honduras. Justihn no sustituye el criterio del profesional: es la herramienta con la que trabaja."
        columnas={[
          {
            titulo: "Abogados",
            enlaces: [
              { href: "#fuentes", label: "Cómo cita" },
              { href: "#capacidades", label: "Qué incluye" },
              { href: "#leads", label: "Clientes" },
              { href: "#planes", label: "Planes" },
              { href: "#faq", label: "Preguntas frecuentes" },
              { href: "/iniciar-sesion", label: "Iniciar sesión" },
              { href: "/abogados", label: "Portal" },
            ],
          },
          {
            titulo: "Para personas",
            enlaces: [
              { href: "/", label: "Guías y trámites" },
              { href: "/#consultorio", label: "Consultorio" },
              { href: "/#directorio", label: "Encuentra abogado" },
            ],
          },
        ]}
        nota="© 2026 Justihn · Cada cita enlaza a su fuente oficial"
      />
    </div>
  );
}

/**
 * Encabezado canónico de las secciones centradas (las de demos llevan el suyo
 * propio, alineado a la izquierda). Un solo patrón: eyebrow + título + bajada
 * — así ninguna sección queda sin contexto ni con jerarquía distinta.
 */
function Encabezado({
  eyebrow,
  titulo,
  sub,
}: {
  eyebrow: string;
  titulo: string;
  sub: string;
}) {
  return (
    <>
      <p
        className="text-center text-[11px] font-bold tracking-[2px] uppercase"
        style={{ color: "var(--mint)" }}
      >
        {eyebrow}
      </p>
      {/* El tamaño escala con el ancho en vez de quedarse en 26px fijos: a
          360px, "La diferencia con preguntarle a una IA cualquiera" caía en
          TRES líneas y el bloque se desarmaba. El piso de 22px es el umbral
          medido para que entre en dos —y es el mismo mínimo de los titulares
          de las secciones de demo, así que en móvil las dos familias de
          encabezado quedan a la misma altura tipográfica. */}
      <h2 className="font-display mt-2 text-center text-[clamp(22px,5.8vw,26px)] leading-[1.2] font-bold text-balance">
        {titulo}
      </h2>
      <p
        className="mx-auto mt-2 max-w-[620px] text-center text-[14px] leading-[1.6]"
        style={{ color: "var(--muted)" }}
      >
        {sub}
      </p>
    </>
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
