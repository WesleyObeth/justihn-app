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
  DemoGuiaTramite,
  DemoMisTramites,
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
              className="chip-tramite rounded-full px-3.5 py-1.5"
            >
              {t.nombre}
            </Link>
          ))}
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
            icono="pasos"
            titulo="Hacer un trámite"
            desc="RTN, traspasos, permisos y licencias — paso a paso, con requisitos y costos."
          />
          <Puerta
            icono="juris"
            titulo="Enfrentar un proceso"
            desc="Me despidieron, pensión alimenticia, divorcio o herencia — el paso a paso y tu abogado."
          />
          <Puerta
            icono="leads"
            titulo="Resolver una duda"
            desc="Pregunta gratis en el consultorio y un abogado colegiado te orienta en público."
          />
          <Puerta
            icono="perfil"
            titulo="Encontrar abogado"
            desc="Por materia y ciudad, con perfiles validados: laboral, familia, mercantil y más."
          />
        </div>
      </section>

      {/* ── Demostraciones: lo que hay detrás de la cuenta gratis ── */}
      <SeccionDemo
        eyebrow="Dentro de una guía"
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
        eyebrow="Tu cuenta gratis"
        titulo="Los trámites no se hacen de una sentada"
        descripcion="Un permiso lleva días y cinco ventanillas. Con tu cuenta vas marcando lo que ya hiciste y el avance queda guardado: vuelves y sigues donde lo dejaste, no donde empezaste."
        puntos={[
          { icono: "pasos", texto: "Marca cada paso y ve cuánto te falta" },
          { icono: "reloj", texto: "Se guarda solo — retomas desde cualquier teléfono" },
          { icono: "documento", texto: "Con los requisitos y las tasas siempre a mano" },
        ]}
        demo={<DemoMisTramites />}
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
      {/* ── Plan: uno solo, y es gratis ──────────────────────────────────
          Estructura adaptada de la referencia que pasó Wesley (la card de
          plan de Sonriprev): promesa y precio a la izquierda, lo que incluye
          a la derecha, separadas por una línea. Funciona porque el ojo lee
          primero "cuánto" y después "qué", que es el orden de la duda.
          ⚠️ La referencia usa escasez ("los primeros 200 aseguran estas
          condiciones"). Aquí NO se copia: sería inventarse un cupo que no
          existe. El gancho es la gratuidad, que sí es verdad. */}
      <section id="plan" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <TituloSeccion
          eyebrow="Cuánto cuesta"
          titulo="Para las personas, Justihn es gratis"
          desc="No hay prueba de 15 días ni tarjeta al final del formulario. Lo que ves es lo que hay."
        />

        <div
          className="glass-card mx-auto mt-9 grid max-w-[900px] grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          style={{
            borderColor: "rgba(21,132,199,.4)",
            boxShadow: "0 18px 50px rgba(13,33,68,.10)",
          }}
        >
          {/* ── Promesa y precio ── */}
          <div className="p-8 md:p-10">
            <span
              className="inline-block rounded-full border px-3.5 py-1.5 text-[11.5px] font-bold tracking-[1.4px] uppercase"
              style={{
                borderColor: "rgba(21,132,199,.35)",
                background: "var(--color-chip)",
                color: "var(--mint)",
              }}
            >
              Plan único · sin tarjeta
            </span>

            <h3 className="font-display mt-6 text-[30px] leading-none font-bold">Plan Gratis</h3>

            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-[64px] leading-[0.9] font-bold">L0</span>
              <span className="pb-1.5 text-[19px]" style={{ color: "var(--muted)" }}>
                / para siempre
              </span>
            </div>

            <p className="mt-5 text-[14.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
              Todo lo que necesitas para resolver tu trámite o tu duda. Sin costo y sin
              sorpresas:{" "}
              <b style={{ color: "var(--ink)" }}>
                no pedimos tarjeta, ni ahora ni después.
              </b>
            </p>

            <Link
              href="/crear-cuenta?tipo=persona"
              className="magnetic mt-7 flex items-center justify-center gap-2 rounded-full py-4 text-[15.5px] font-semibold"
              style={{
                background: "var(--turq)",
                color: "#fff",
                boxShadow: "0 10px 28px rgba(21,132,199,.32)",
              }}
            >
              Crear cuenta gratis
              <svg
                width="17"
                height="17"
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

            <p className="mt-3.5 text-center text-[12.5px]" style={{ color: "var(--muted)" }}>
              Listo en un minuto · solo tu nombre y tu correo
            </p>
          </div>

          {/* ── Lo que incluye ── */}
          <div
            className="border-t p-8 md:border-t-0 md:border-l md:p-10"
            style={{ borderColor: "var(--line)" }}
          >
            <p
              className="text-[11.5px] font-bold tracking-[1.6px] uppercase"
              style={{ color: "var(--muted)" }}
            >
              Incluido
            </p>

            <ul className="mt-4 flex flex-col">
              {[
                `Las ${TRAMITES.length} guías completas, con su fuente oficial`,
                "Checklist de tus trámites, guardado",
                "Consultas ilimitadas al consultorio",
                "Calculadora de prestaciones y de plazos",
                "Directorio de abogados por materia y ciudad",
              ].map((f, i) => (
                <li
                  key={f}
                  className={`flex items-start gap-3 py-3.5 text-[14px] leading-[1.5] ${i > 0 ? "border-t" : ""}`}
                  style={i > 0 ? { borderColor: "var(--line)" } : undefined}
                >
                  <span className="mt-0.5 shrink-0" style={{ color: "var(--color-exito)" }}>
                    <Icono nombre="check" size={16} strokeWidth={2.6} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* El plan de pago del socio, con LAS MISMAS palabras que el
                portal ciudadano — si cambia una, cambian las dos. */}
            <div
              className="mt-6 flex gap-3 rounded-[14px] border px-4 py-3.5"
              style={{ borderColor: "var(--line)", background: "var(--color-chip)" }}
            >
              <span className="mt-0.5 shrink-0" style={{ color: "var(--mint)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z" />
                </svg>
              </span>
              <p className="text-[12.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
                ¿Verificaciones y alertas sobre tu nombre? El{" "}
                <b style={{ color: "var(--ink)" }}>plan de pago está en definición</b> — lo que
                hoy es gratis seguirá siendo gratis.
              </p>
            </div>
          </div>
        </div>
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

      {/* ── Para abogados ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-10">
        <div className="glass-card p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-6">
            {/* `min(280px,100%)` y no 280 a secas: el mínimo rígido desbordaba la
                pantalla por debajo de 360px, donde ya no queda ese ancho después
                del padding de la sección y de la card. */}
            <div className="min-w-[min(280px,100%)] flex-1">
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

/**
 * Card de orientación, NO navegable (decisión Wesley 2026-08-30): resume lo
 * que el sitio resuelve. Antes era un enlace con "Empezar →" y competía con
 * las secciones reales que vienen justo debajo — el visitante decidía dos
 * veces lo mismo. Por eso también lleva `glass-card--estatica`: sin el hover
 * que levanta la card, que en algo no clicable es una promesa falsa.
 */
function Puerta({
  icono,
  titulo,
  desc,
}: {
  icono: "pasos" | "juris" | "leads" | "perfil";
  titulo: string;
  desc: string;
}) {
  return (
    <div className="glass-card glass-card--estatica block p-6">
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
    </div>
  );
}
