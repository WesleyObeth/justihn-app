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
} from "@/components/landing/secciones";
import { TRAMITES } from "@/data/tramites";

const POPULARES = ["abrir-rtn", "traspaso-vehiculo", "permiso-operacion", "constituir-sociedad"];

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

      {/* ── Para ti ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-14">
        <h2 className="font-display text-center text-[26px] font-bold">
          ¿Qué necesitas resolver hoy?
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <SeccionTramites termino={q} onTermino={setQ} />

      <SeccionProcesos />

      <SeccionConsultorio />

      {/* ── ¿Te despidieron? ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-10">
        <div className="glass-card flex flex-wrap items-center gap-6 p-7 md:p-9">
          <div className="min-w-[260px] flex-1">
            <p className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "var(--mint)" }}>
              ¿Te despidieron?
            </p>
            <h2 className="font-display mt-2 text-[24px] leading-[1.25] font-bold">
              Calcula en un minuto lo que te corresponde por ley
            </h2>
            <p className="mt-2 max-w-[520px] text-[13.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
              Cesantía, preaviso, vacaciones y aguinaldos según el Código del Trabajo — y los
              pasos que siguen, con un abogado laboral si lo necesitas.
            </p>
          </div>
          <Link
            href="/calculadora-prestaciones"
            className="rounded-[12px] px-6 py-3.5 text-[14px] font-semibold"
            style={{ background: "var(--turq)", color: "#fff" }}
          >
            Calcular mis prestaciones
          </Link>
        </div>
      </section>

      <SeccionDirectorio />

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
            <div className="flex flex-col items-start gap-3">
              <div>
                <span className="font-display text-[30px] font-bold">L147</span>
                <span className="text-[13px]" style={{ color: "var(--muted)" }}>
                  /mes · Premium L267
                </span>
              </div>
              <Link
                href="/para-abogados"
                className="rounded-[12px] px-6 py-3.5 text-[14px] font-semibold text-white"
                style={{ background: "var(--turq)" }}
              >
                Conocer Justihn para abogados
              </Link>
              <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                Primer mes a L25 en tu primera suscripción
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-10 border-t" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-start justify-between gap-6 px-5 py-10">
          <div className="max-w-[400px]">
            <span className="font-display text-[16px] font-bold">Justihn</span>
            <p className="mt-2 text-[12.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
              Orientación legal con fuentes oficiales para Honduras. Justihn no es un bufete:
              las guías son orientación general y no sustituyen la asesoría profesional sobre
              tu caso concreto.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
            <span className="text-[11px] font-semibold tracking-[1px] uppercase">Para ti</span>
            <Link href="#tramites">Guías de trámites</Link>
            <Link href="#procesos">Procesos legales</Link>
            <Link href="#consultorio">Consultorio gratuito</Link>
            <Link href="#directorio">Encuentra abogado</Link>
            <Link href="/personas">Mi cuenta</Link>
          </div>
          <div className="flex flex-col gap-1.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
            <span className="text-[11px] font-semibold tracking-[1px] uppercase">Abogados</span>
            <Link href="/abogados">Portal de abogados</Link>
            <Link href="/abogados/planes">Planes</Link>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: "var(--line)" }}>
          <p className="mx-auto max-w-[1080px] px-5 py-4 text-[11.5px]" style={{ color: "var(--muted)" }}>
            Habeas data (art. 182 de la Constitución): revisa o pide la supresión de tus datos —
            respondemos en 72 horas hábiles. · Justihn (demo de validación)
          </p>
        </div>
      </footer>
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
