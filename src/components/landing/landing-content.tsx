"use client";

/**
 * Landing pública estilo Jusbrasil sobre el fondo aurora: un gran buscador
 * como puerta de entrada, prueba con números reales, y las dos audiencias
 * (gente común / abogados) con su CTA. Contenido en z-2 sobre el canvas.
 */
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { INSTITUCIONES, TRAMITES } from "@/data/tramites";
import { SENTENCIAS } from "@/data/sentencias";

const POPULARES = ["abrir-rtn", "traspaso-vehiculo", "permiso-operacion", "constituir-sociedad"];

export function LandingContenido() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const buscar = () => {
    const termino = q.trim();
    router.push(termino ? `/tramites?q=${encodeURIComponent(termino)}` : "/tramites");
  };

  const destacados = POPULARES.map((id) => TRAMITES.find((t) => t.id === id)!);

  return (
    <div className="landing-contenido">
      {/* ── Hero ── */}
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-16 text-center md:pt-[176px]">
        <p className="text-[12px] font-semibold tracking-[2.5px] uppercase" style={{ color: "var(--mint)" }}>
          Justicia e información legal de Honduras
        </p>
        <h1 className="font-display mx-auto mt-3 max-w-[760px] text-[clamp(30px,5.5vw,52px)] leading-[1.12] font-bold text-balance">
          Tus derechos, tus trámites y un abogado cuando lo necesitas
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[15.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          Guías paso a paso con fuentes oficiales, un consultorio gratuito con abogados
          colegiados y la jurisprudencia del país en un solo lugar.
        </p>

        <div className="mx-auto mt-8 flex max-w-[620px] items-center gap-2 rounded-[16px] bg-white p-2 pl-4 border border-borde shadow-[0_16px_48px_rgba(13,33,68,.14)]">
          <Icono nombre="buscar" size={18} className="shrink-0 text-texto-4" />
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
            className="cursor-pointer rounded-[12px] px-5 py-3 text-[14px] font-semibold text-white"
            style={{ background: "var(--turq)" }}
          >
            Buscar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12.5px]">
          <span style={{ color: "var(--muted)" }}>Populares:</span>
          {destacados.map((t) => (
            <Link
              key={t.id}
              href={`/tramites/${t.id}`}
              className="rounded-full border px-3 py-1 transition-colors"
              style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
              {t.nombre}
            </Link>
          ))}
        </div>

        {/* Prueba con números reales */}
        <div className="mx-auto mt-12 grid max-w-[720px] grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat cifra="20,202" etiqueta="sentencias del PJ" />
          <Stat cifra={String(TRAMITES.length)} etiqueta="guías de trámites" />
          <Stat cifra={String(INSTITUCIONES.length)} etiqueta="instituciones del Estado" />
          <Stat cifra="Gratis" etiqueta="consultorio legal" />
        </div>
      </section>

      {/* ── Para ti ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-14">
        <h2 className="font-display text-center text-[26px] font-bold">
          ¿Qué necesitas resolver hoy?
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Puerta
            href="/tramites"
            icono="pasos"
            titulo="Hacer un trámite"
            desc={`RTN, traspasos, permisos y ${TRAMITES.length - 3} guías más — paso a paso, con requisitos y costos.`}
          />
          <Puerta
            href="/consultorio"
            icono="leads"
            titulo="Resolver una duda legal"
            desc="Pregunta gratis en el consultorio y un abogado colegiado te orienta en público."
          />
          <Puerta
            href="/directorio"
            icono="perfil"
            titulo="Encontrar abogado"
            desc="Por materia y ciudad, con perfiles validados — laboral, familia, mercantil y más."
          />
        </div>
      </section>

      {/* ── Trámites por institución ── */}
      <section className="mx-auto max-w-[1080px] px-5 py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[24px] font-bold">Trámites por institución</h2>
          <Link href="/tramites" className="text-[13px]" style={{ color: "var(--mint)" }}>
            Ver todos →
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {INSTITUCIONES.slice(0, 6).map((inst) => {
            const n = TRAMITES.filter((t) => t.institucionId === inst.id).length;
            return (
              <Link
                key={inst.id}
                href={`/tramites?institucion=${inst.id}`}
                className="glass-card block p-5"
              >
                <div className="text-[11px] font-bold tracking-[1px] uppercase" style={{ color: "var(--mint)" }}>
                  {inst.sigla}
                </div>
                <div className="font-display mt-1.5 text-[15px] leading-[1.35] font-semibold">
                  {inst.nombre}
                </div>
                <div className="mt-1 text-[12.5px] leading-[1.5]" style={{ color: "var(--muted)" }}>
                  {inst.descripcion}
                </div>
                <div className="mt-2.5 text-[12px]" style={{ color: "var(--mint)" }}>
                  {n} {n === 1 ? "trámite" : "trámites"} →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

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
                  `Jus IA responde citando las ${SENTENCIAS.length > 0 ? "20,202" : ""} sentencias del corpus oficial — nunca inventa`,
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
                href="/abogados"
                className="rounded-[12px] px-6 py-3.5 text-[14px] font-semibold text-white"
                style={{ background: "var(--turq)" }}
              >
                Conocer el portal de abogados
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
            <Link href="/tramites">Guías de trámites</Link>
            <Link href="/consultorio">Consultorio gratuito</Link>
            <Link href="/directorio">Encuentra abogado</Link>
            <Link href="/persona">Mi cuenta</Link>
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

function Stat({ cifra, etiqueta }: { cifra: string; etiqueta: string }) {
  return (
    <div className="glass-card px-4 py-3.5 text-center">
      <div className="font-display text-[20px] font-bold" style={{ color: "var(--mint)" }}>
        {cifra}
      </div>
      <div className="mt-0.5 text-[11.5px] leading-[1.35]" style={{ color: "var(--muted)" }}>
        {etiqueta}
      </div>
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
  icono: "pasos" | "leads" | "perfil";
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
