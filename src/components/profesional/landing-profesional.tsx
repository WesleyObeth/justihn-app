import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { OFERTA, PLANES } from "@/data/catalogo";
import { INSTITUCIONES, TRAMITES } from "@/data/tramites";

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
  const materias = [...new Set(TRAMITES.map((t) => t.materia))];

  return (
    <div className="landing-contenido">
      {/* ── Hero ── */}
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-8 text-center md:pt-[176px]">
        <p
          className="text-[12px] font-semibold tracking-[2.5px] uppercase"
          style={{ color: "var(--mint)" }}
        >
          Para profesionales del derecho
        </p>
        <h1 className="font-display mx-auto mt-3 max-w-[820px] text-[clamp(29px,5vw,48px)] leading-[1.14] font-bold text-balance">
          Un asistente jurídico que cita sus fuentes
          <br className="hidden md:block" />{" "}
          <span>— o admite que no las tiene</span>
        </h1>
        <p
          className="mx-auto mt-5 max-w-[600px] text-[15.5px] leading-[1.65]"
          style={{ color: "var(--muted)" }}
        >
          Jurisprudencia, legislación, alertas de La Gaceta, modelos y calculadoras. Cada
          dato llega con el enlace al documento oficial, para que el respaldo lo
          compruebes tú y no tengas que confiar en nuestra palabra.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/abogados"
            className="rounded-[12px] px-6 py-3.5 text-[14.5px] font-semibold text-white"
            style={{ background: "var(--turq)" }}
          >
            Ver el portal por dentro
          </Link>
          <a
            href="#planes"
            className="rounded-[12px] border px-6 py-3.5 text-[14.5px] font-semibold"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
          >
            Ver planes
          </a>
        </div>
        <p className="mt-3 text-[12.5px]" style={{ color: "var(--muted)" }}>
          Primer mes a {OFERTA.anclaPrimerMes} · anual {OFERTA.descuentoAnual} · sin tarjeta
          para probar
        </p>
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

      {/* ── Leads: el funnel de la vía B hacia la A ── */}
      <section id="leads" className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
        <div className="glass-card p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-8">
            <div className="min-w-[300px] flex-1">
              <p
                className="text-[11px] font-bold tracking-[2px] uppercase"
                style={{ color: "var(--mint)" }}
              >
                Clientes, no solo herramientas
              </p>
              <h2 className="font-display mt-2 text-[24px] leading-[1.28] font-bold">
                El mismo sitio donde la gente busca ayuda es donde te encuentra
              </h2>
              <p
                className="mt-3 text-[13.5px] leading-[1.65]"
                style={{ color: "var(--muted)" }}
              >
                Del lado público hay {TRAMITES.length} guías de trámites y procesos ante{" "}
                {INSTITUCIONES.length} instituciones del Estado, y un consultorio gratuito.
                Cada guía termina recomendando un abogado de esa materia, y cada consulta
                sin responder es un cliente esperando. Tu perfil aparece en el directorio
                por materia y ciudad — con prioridad si eres Premium.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {materias.map((m) => (
                  <span
                    key={m}
                    className="rounded-full px-2.5 py-[3px] text-[11.5px] font-medium"
                    style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/"
              className="rounded-[12px] border px-5 py-3 text-[13.5px] font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              Ver el lado público →
            </Link>
          </div>
        </div>
      </section>

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

      {/* ── CTA final ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-14">
        <div className="glass-card flex flex-wrap items-center justify-between gap-6 p-8">
          <div className="min-w-[280px] flex-1">
            <h2 className="font-display text-[22px] leading-[1.3] font-bold">
              Entra y pruébalo antes de decidir
            </h2>
            <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
              El portal está abierto para que lo recorras. Justihn está en validación con
              abogados del gremio: si algo te falta, queremos oírlo antes de construirlo.
            </p>
          </div>
          <Link
            href="/abogados"
            className="rounded-[12px] px-6 py-3.5 text-[14.5px] font-semibold text-white"
            style={{ background: "var(--turq)" }}
          >
            Entrar al portal
          </Link>
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
