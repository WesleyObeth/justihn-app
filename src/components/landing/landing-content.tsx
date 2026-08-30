"use client";

/**
 * Landing pública estilo Jusbrasil sobre el fondo aurora: un gran buscador
 * como puerta de entrada, prueba con números reales, y las dos audiencias
 * (gente común / abogados) con su CTA. Contenido en z-2 sobre el canvas.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import {
  SeccionConsultorio,
  SeccionDirectorio,
  SeccionProcesos,
  SeccionTramites,
  TituloSeccion,
} from "@/components/landing/secciones";
import { SeccionDemo } from "@/components/landing/demo-marco";
import {
  DemoCalculadora,
  DemoConsultorio,
  DemoGuiaTramite,
} from "@/components/publico/demos-personas";
import { INSTITUCIONES, TRAMITES } from "@/data/tramites";
import { OFERTA, PLANES } from "@/data/catalogo";
import { PieAurora } from "@/components/landing/pie-aurora";

const POPULARES = ["abrir-rtn", "traspaso-vehiculo", "permiso-operacion", "constituir-sociedad"];

/**
 * El plan que enseña el puente hacia la vía A: se toma **del catálogo**, no
 * por id, para que sea siempre EL MISMO que `/para-abogados` marca como
 * recomendado. Si mañana la recomendación cambia, se toca `destacado` en
 * `data/catalogo.ts` y esta card se mueve sola — nunca al revés.
 */
const PLAN_PUENTE = PLANES.find((p) => p.destacado) ?? PLANES[1]!;

/**
 * FAQ de la landing ciudadana: responde a quien AÚN no tiene cuenta. No
 * reutiliza el FAQ del portal (`personas/ayuda`), que resuelve dudas de uso
 * de alguien que ya está dentro. Las cifras se interpolan de los seeds —
 * nada de números escritos a mano que envejezcan solos.
 */
const FAQ_PERSONAS: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "¿Cuánto cuesta usar Justihn?",
    respuesta:
      "Nada. Las guías, el consultorio, las calculadoras y el directorio son gratis y no caducan. No pedimos tarjeta para crear la cuenta.",
  },
  {
    pregunta: "¿Justihn es un bufete de abogados?",
    respuesta:
      "No. Somos la herramienta que te orienta con fuentes oficiales y te conecta con abogados colegiados. Las guías son orientación general: para tu caso concreto, quien responde es el profesional.",
  },
  {
    pregunta: "¿De dónde salen los requisitos y los costos?",
    respuesta: `Del portal de cada institución: SAR, Instituto de la Propiedad, ARSA, ONCAE, alcaldías y el Poder Judicial, entre otras ${INSTITUCIONES.length}. Cada guía enlaza al documento oficial y lleva el sello de verificada. Si un dato no tiene fuente, no lo publicamos.`,
  },
  {
    pregunta: "¿Quién responde mis preguntas del consultorio?",
    respuesta:
      "Abogados colegiados, con su nombre, su ciudad y sus materias a la vista. La respuesta es pública, para que también le sirva a quien tenga la misma duda. Si te convence, lo contactas directo.",
  },
  {
    pregunta: "¿Tengo que crear cuenta?",
    respuesta:
      "Para mirar no. Puedes buscar guías, ver el primer paso y explorar el directorio sin registrarte. La cuenta gratis desbloquea la guía completa, el checklist que se guarda y tus consultas.",
  },
  {
    pregunta: "¿Qué pasa con mis datos?",
    respuesta:
      "Puedes revisar o pedir la supresión de tus datos cuando quieras — respondemos en 72 horas hábiles (habeas data, artículo 182 de la Constitución). Tus consultas del consultorio son públicas; tus datos de contacto no.",
  },
];

export function LandingContenido() {
  // Un solo estado de búsqueda: el hero y la sección de trámites filtran lo
  // mismo — buscar arriba lleva al usuario a los resultados de abajo.
  const [q, setQ] = useState("");

  const buscar = () => {
    document.getElementById("tramites")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const destacados = POPULARES.map((id) => TRAMITES.find((t) => t.id === id)!);

  return (
    <div className="landing-contenido">
      {/* ── Hero ── */}
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-8 text-center md:pt-[176px]">
        {/* Dos líneas fijas en escritorio: el quiebre es de composición, no
            del ancho disponible. En móvil fluye natural. */}
        <h1 className="font-display mx-auto max-w-[860px] text-[clamp(30px,5.5vw,52px)] leading-[1.12] font-bold text-balance">
          Tus derechos, tus trámites
          <br className="hidden md:block" />{" "}
          <span>y un abogado cuando lo necesitas</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[15.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          Qué necesitas, dónde se hace y cuánto cuesta — cada dato con su fuente oficial.
          Y un abogado colegiado que responde gratis si se complica.
        </p>

        {/* Buscador con el borde aurora canónico de Jus IA: la puerta de
            entrada se reconoce como la misma superficie inteligente. */}
        <div className="relative mx-auto mt-8 flex max-w-[620px] items-center gap-2 rounded-full border border-borde bg-white py-2 pr-2 pl-5 shadow-[0_16px_48px_rgba(13,33,68,.14)]">
          <span aria-hidden className="borde-aurora" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="¿Qué necesitas resolver? Ej. abrir un RTN, me despidieron…"
            aria-label="Buscar"
            className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-marino outline-none"
          />
          <button
            type="button"
            onClick={buscar}
            aria-label="Buscar"
            className="grid h-11 w-11 min-w-11 cursor-pointer place-items-center rounded-full text-white transition-colors"
            style={{ background: "var(--turq)" }}
          >
            <Icono nombre="buscar" size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12.5px]">
          {destacados.map((t) => (
            <Link
              key={t.id}
              href={`/tramites/${t.id}`}
              className="rounded-full border px-3.5 py-1.5 transition-colors hover:border-celeste hover:text-celeste"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              {t.nombre}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Por qué confiar: el mismo papel que "Cómo cita" en la vía A ── */}
      <section id="fuentes" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <TituloSeccion
          eyebrow="Por qué confiar"
          titulo="Orientación con la fuente a la vista"
          desc="En temas legales el problema no es la falta de información, es no saber cuál es cierta. Aquí cada dato dice de dónde salió."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Pilar
            icono="check"
            titulo="Cada dato con su fuente"
            desc={`Requisitos, costos y plazos salidos del portal de cada una de las ${INSTITUCIONES.length} instituciones que cubrimos. Cada guía enlaza al documento oficial para que lo verifiques.`}
          />
          <Pilar
            icono="leads"
            titulo="Preguntar no cuesta"
            desc="El consultorio es gratis y la respuesta es pública: te contesta un abogado colegiado, no un formulario automático."
          />
          <Pilar
            icono="ubicacion"
            titulo="Hecho para Honduras"
            desc="SAR, Instituto de la Propiedad, ARSA, ONCAE, alcaldías y juzgados de aquí — no consejos generales de otro país."
          />
        </div>
      </section>

      {/* ── Puertas de entrada ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-14">
        <TituloSeccion
          eyebrow="Por dónde empezar"
          titulo="¿Qué necesitas resolver hoy?"
          desc="Cuatro caminos, todos gratis. Cada uno termina, si hace falta, en un abogado de esa materia."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Puerta
            href="#tramites"
            icono="pasos"
            titulo="Hacer un trámite"
            desc="RTN, traspasos, permisos y licencias — paso a paso, con requisitos y costos."
          />
          <Puerta
            href="#procesos"
            icono="juris"
            titulo="Enfrentar un proceso"
            desc="Me despidieron, pensión alimenticia, divorcio o herencia — el paso a paso y tu abogado."
          />
          <Puerta
            href="#consultorio"
            icono="leads"
            titulo="Resolver una duda"
            desc="Pregunta gratis en el consultorio y un abogado colegiado te orienta en público."
          />
          <Puerta
            href="#directorio"
            icono="perfil"
            titulo="Encontrar abogado"
            desc="Por materia y ciudad, con perfiles validados: laboral, familia, mercantil y más."
          />
        </div>
      </section>

      {/* ── Demostraciones: lo que hay detrás de la cuenta gratis ── */}
      <SeccionDemo
        eyebrow="Guías de trámites"
        titulo="Deja de averiguar en la fila qué papel te falta"
        descripcion="Cada guía trae los requisitos, la tasa exacta y el orden de los pasos, con el enlace al portal de la institución para que lo verifiques. Con tu cuenta gratis vas marcando lo que ya hiciste."
        puntos={[
          { icono: "check", texto: "Requisitos y costos contrastados con la fuente oficial" },
          { icono: "pasos", texto: "El checklist se guarda: retomas donde lo dejaste" },
          { icono: "perfil", texto: "Te avisa cuándo el paso exige notario o abogado" },
        ]}
        demo={<DemoGuiaTramite />}
      />

      <SeccionDemo
        eyebrow="Consultorio gratuito"
        titulo="Tu duda, respondida por un abogado colegiado"
        descripcion="Escribes lo que te pasa y un profesional colegiado te orienta en público — sin costo y sin tener que explicar tu caso tres veces. Si se complica, contactas al que te convenció."
        puntos={[
          { icono: "leads", texto: "Preguntar es gratis, sin límite y sin tarjeta" },
          { icono: "perfil", texto: "Responde un colegiado con su nombre y su materia" },
          { icono: "correo", texto: "Te avisamos cuando tu consulta tenga respuesta" },
        ]}
        demo={<DemoConsultorio />}
        invertida
      />

      <SeccionDemo
        eyebrow="Calculadoras"
        titulo="Cuánto te toca por ley, antes de firmar nada"
        descripcion="Si te despidieron, el primer problema es no saber cuánto reclamar. Te damos el desglose orientativo — cesantía, preaviso y proporcionales — para que no llegues a ciegas a esa conversación."
        puntos={[
          { icono: "calc", texto: "Cesantía, preaviso y proporcionales, desglosados" },
          { icono: "documento", texto: "Con la guía del proceso laboral al lado" },
          { icono: "perfil", texto: "Y un abogado laboral si decides reclamar" },
        ]}
        demo={<DemoCalculadora />}
      />

      <SeccionTramites termino={q} onTermino={setQ} />

      <SeccionProcesos />

      <SeccionConsultorio />

      <SeccionDirectorio />

      {/* ── Plan: uno solo, y es gratis ──────────────────────────────────
          La vía A muestra tres cards porque ahí la decisión es cuál comprar.
          Aquí no hay decisión: enseñar una escalera de planes inventaría una
          duda que la persona no tiene. Una card, y lo que dice es "no pagas".
          El plan de pago que el socio pidió está EN DEFINICIÓN — se nombra al
          pie, con las mismas palabras que usa el portal ciudadano, para que
          las dos pantallas no se contradigan. */}
      <section id="plan" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <TituloSeccion
          eyebrow="Cuánto cuesta"
          titulo="Para las personas, Justihn es gratis"
          desc="No hay prueba de 15 días ni tarjeta al final del formulario. Lo que ves es lo que hay."
        />

        <div className="mx-auto mt-8 max-w-[440px]">
          <div
            className="glass-card flex flex-col p-7"
            style={{
              borderColor: "rgba(21,132,199,.55)",
              boxShadow: "0 0 0 1px rgba(21,132,199,.45), 0 14px 40px rgba(21,132,199,.14)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[12px] font-bold tracking-[1.2px] uppercase"
                style={{ color: "var(--mint)" }}
              >
                Gratis
              </span>
              <span
                className="rounded-full px-2.5 py-[3px] text-[10.5px] font-bold"
                style={{ background: "rgba(21,132,199,.12)", color: "var(--mint)" }}
              >
                Sin tarjeta
              </span>
            </div>
            <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted)" }}>
              Para cualquier persona en Honduras
            </p>
            <div className="mt-3 flex items-end gap-1">
              <span className="font-display text-[32px] leading-none font-bold">L0</span>
              <span className="text-[13px]" style={{ color: "var(--muted)" }}>
                /mes
              </span>
            </div>
            <p className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
              para siempre — sin caducidad
            </p>

            <ul
              className="mt-4 flex flex-col gap-2 border-t pt-4 text-[13px]"
              style={{ borderColor: "var(--line)" }}
            >
              {[
                `Las ${TRAMITES.length} guías completas, con su fuente oficial`,
                "Checklist de tus trámites, guardado",
                "Consultas ilimitadas al consultorio",
                "Calculadora de prestaciones y de plazos",
                "Directorio de abogados por materia y ciudad",
              ].map((f) => (
                <li key={f} className="flex gap-2.5" style={{ color: "var(--muted)" }}>
                  <span style={{ color: "var(--mint)" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/crear-cuenta?tipo=persona"
              className="magnetic mt-5 rounded-[10px] py-2.5 text-center text-[13.5px] font-semibold"
              style={{ background: "var(--turq)", color: "#fff" }}
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>

        <p
          className="mx-auto mt-6 max-w-[520px] text-center text-[12.5px] leading-[1.6]"
          style={{ color: "var(--muted)" }}
        >
          Más adelante habrá un plan de pago con herramientas de verificación y
          protección — está en definición. Lo que hoy es gratis seguirá siendo gratis.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-[760px] scroll-mt-24 px-5 py-14">
        <TituloSeccion
          eyebrow="Antes de empezar"
          titulo="Preguntas frecuentes"
          desc="Lo que más nos preguntan, respondido sin letra pequeña."
        />
        <div className="mt-8 flex flex-col gap-3">
          {FAQ_PERSONAS.map((f) => (
            <details
              key={f.pregunta}
              /* El relleno va en el `summary`: en el contenedor, la zona que
                 abre la pregunta mide lo que la línea de texto y en el
                 teléfono hay que apuntarle. */
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

      {/* ── CTA final ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-16">
        <div
          className="relative overflow-hidden rounded-[24px] px-6 py-14 text-center md:px-14"
          style={{
            background: "linear-gradient(160deg,#0d2144 0%,#0a1830 55%,#08142a 100%)",
            border: "1px solid rgba(125,211,252,.16)",
          }}
        >
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
              Tu trámite pendiente
            </p>
            <h2 className="font-display mx-auto mt-4 max-w-[720px] text-[clamp(26px,4vw,42px)] leading-[1.14] font-bold text-balance text-white">
              Nadie debería perder un día por no saber qué papel llevar.
            </h2>
            <p
              className="mx-auto mt-4 max-w-[540px] text-[15px] leading-[1.65]"
              style={{ color: "rgba(226,238,248,.72)" }}
            >
              Crea tu cuenta gratis, abre la guía de lo que necesitas y ve marcando. Y si
              se complica, pregunta — te responde un abogado colegiado.
            </p>

            <div className="mt-8 flex justify-center">
              {/* ⚠️ El color va INLINE: la landing define
                  `.landing-aurora a { color: inherit }`, que por especificidad
                  le gana a `text-white` de Tailwind. */}
              <Link
                href="/crear-cuenta?tipo=persona"
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
              Gratis, sin tarjeta · tus guías y consultas quedan guardadas
            </p>
          </div>
        </div>
      </section>

      {/* ── Para abogados ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-10">
        <div className="glass-card p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-6">
            <div className="min-w-[280px] flex-1">
              <p className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "var(--mint)" }}>
                Para profesionales del derecho
              </p>
              <h2 className="font-display mt-2 text-[24px] leading-[1.25] font-bold">
                La jurisprudencia de Honduras, a una pregunta de distancia
              </h2>
              <ul className="mt-4 flex flex-col gap-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
                {[
                  "Jus IA responde citando la sentencia o el artículo — y si no encuentra fuente, lo dice",
                  "Alertas de La Gaceta por materia y monitoreo de nombres",
                  "Modelos de escritos, calculadoras y los leads de este consultorio",
                ].map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span style={{ color: "var(--mint)" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Un solo plan, no dos precios sueltos: esta card es un puente a
                la otra vía, no una tabla de tarifas — quien la lee todavía no
                está eligiendo tier. Se enseña el Profesional, que es el de
                entrada al pago y el que cubre el ejercicio diario.
                Todo sale de `data/catalogo` (§0.5): antes "L147" y "L267"
                estaban escritos a mano aquí y habrían quedado desfasados en
                cuanto cambiara el precio. */}
            <div className="flex flex-col items-start gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[11px] font-bold tracking-[1.2px] uppercase"
                    style={{ color: "var(--mint)" }}
                  >
                    Plan {PLAN_PUENTE.nombre}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-[3px] text-[10.5px] font-bold"
                    style={{ background: "rgba(21,132,199,.12)", color: "var(--mint)" }}
                  >
                    Recomendado
                  </span>
                </div>
                <div className="mt-1 flex items-end gap-1">
                  <span className="font-display text-[30px] leading-none font-bold">
                    {PLAN_PUENTE.precioEtiqueta}
                  </span>
                  <span className="text-[13px]" style={{ color: "var(--muted)" }}>
                    {PLAN_PUENTE.periodo}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
                  {PLAN_PUENTE.resumen}
                </p>
                <p className="mt-0.5 text-[12px]" style={{ color: "var(--muted)" }}>
                  o {PLAN_PUENTE.precioAnualEtiqueta}
                  {PLAN_PUENTE.periodoAnual} ({OFERTA.descuentoAnual})
                </p>
              </div>
              {/* ⚠️ El blanco va INLINE: `.landing-aurora a { color: inherit }`
                  le gana por especificidad a `text-white` de Tailwind, y el
                  texto salía marino sobre el azul. Es la misma trampa del CTA
                  de la landing de abogados. */}
              <Link
                href="/para-abogados"
                className="magnetic rounded-[12px] px-6 py-3.5 text-[14px] font-semibold"
                style={{ background: "var(--turq)", color: "#fff" }}
              >
                Conocer Justihn para abogados
              </Link>
              <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                Primer mes a {OFERTA.anclaPrimerMes} en tu primera suscripción
              </span>
            </div>
          </div>
        </div>
      </section>

      <PieAurora
        descripcion="Orientación legal con fuentes oficiales para Honduras. Justihn no es un bufete: las guías son orientación general y no sustituyen la asesoría profesional sobre tu caso concreto."
        columnas={[
          {
            titulo: "Para ti",
            enlaces: [
              { href: "#tramites", label: "Guías de trámites" },
              { href: "#procesos", label: "Procesos legales" },
              { href: "#consultorio", label: "Consultorio gratuito" },
              { href: "#directorio", label: "Encuentra abogado" },
              { href: "#plan", label: "Cuánto cuesta" },
              { href: "#faq", label: "Preguntas frecuentes" },
              { href: "/personas", label: "Mi cuenta" },
            ],
          },
          {
            titulo: "Abogados",
            enlaces: [
              { href: "/para-abogados", label: "Justihn para abogados" },
              { href: "/abogados", label: "Portal de abogados" },
              { href: "/iniciar-sesion", label: "Entrar como abogado" },
              { href: "/iniciar-sesion?tipo=persona", label: "Iniciar sesión" },
            ],
          },
        ]}
        nota="Habeas data (art. 182 de la Constitución): revisa o pide la supresión de tus datos — respondemos en 72 horas hábiles. · © 2026 Justihn (demo de validación)"
      />
    </div>
  );
}

function Puerta({
  href,
  icono,
  titulo,
  desc,
}: {
  href: string;
  icono: "pasos" | "juris" | "leads" | "perfil";
  titulo: string;
  desc: string;
}) {
  return (
    <Link href={href} className="glass-card block p-6">
      <span
        className="grid h-11 w-11 place-items-center rounded-xl"
        style={{ background: "rgba(21,132,199,0.1)", color: "var(--mint)" }}
      >
        <Icono nombre={icono} size={19} />
      </span>
      <div className="font-display mt-3.5 text-[17px] font-bold">{titulo}</div>
      <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
        {desc}
      </p>
      <div className="mt-3 text-[13px] font-medium" style={{ color: "var(--mint)" }}>
        Empezar →
      </div>
    </Link>
  );
}

/** Pilar de confianza — gemelo del de la landing de abogados. */
function Pilar({
  icono,
  titulo,
  desc,
}: {
  icono: "check" | "leads" | "ubicacion";
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
