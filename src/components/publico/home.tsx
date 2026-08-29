"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { INSTITUCIONES, TRAMITES } from "@/data/tramites";
import { DIRECTORIO } from "@/data/directorio";

const POPULARES = ["abrir-rtn", "traspaso-vehiculo", "permiso-operacion", "constituir-sociedad"];

/** Home pública: la persona llega buscando SU situación, no una sigla. */
export function HomePublica() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const buscar = () => {
    const termino = q.trim();
    router.push(termino ? `/tramites?q=${encodeURIComponent(termino)}` : "/tramites");
  };

  const destacados = POPULARES.map((id) => TRAMITES.find((t) => t.id === id)!);
  const materias = [...new Set(DIRECTORIO.flatMap((a) => a.materias))];

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="px-4 pt-14 pb-12 text-white md:px-6"
        style={{ background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)" }}
      >
        <div className="mx-auto max-w-[760px] text-center">
          <h1 className="font-display text-[clamp(26px,4.5vw,40px)] leading-[1.2] font-bold text-balance">
            Los trámites y las leyes de Honduras, explicados paso a paso
          </h1>
          <p className="mt-3 text-[15px] text-sobre-marino-2">
            Guías con fuentes oficiales, un consultorio gratuito y abogados de verdad cuando los
            necesitas.
          </p>

          <div className="mx-auto mt-7 flex max-w-[560px] items-center gap-2 rounded-[14px] bg-white p-2 pl-4">
            <Icono nombre="buscar" size={17} className="shrink-0 text-texto-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
              placeholder="¿Qué necesitas hacer? Ej. abrir un RTN, traspasar un carro…"
              aria-label="Buscar un trámite"
              className="min-w-0 flex-1 border-none bg-transparent text-[14.5px] text-marino outline-none"
            />
            <button
              type="button"
              onClick={buscar}
              className="cursor-pointer rounded-[10px] bg-celeste px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-cruce"
            >
              Buscar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12.5px]">
            <span className="text-sobre-marino">Populares:</span>
            {destacados.map((t) => (
              <Link
                key={t.id}
                href={`/tramites/${t.id}`}
                className="rounded-full border border-white/20 px-3 py-1 text-[#dbe7f3] hover:border-white/50 hover:text-white"
              >
                {t.nombre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1140px] px-4 md:px-6">
        {/* ── Las 3 puertas ── */}
        <section className="mt-[-34px] grid grid-cols-1 gap-4 md:grid-cols-3">
          <PuertaCard
            href="/tramites"
            icono="pasos"
            titulo="Guías de trámites"
            desc={`${TRAMITES.length} trámites de ${INSTITUCIONES.length} instituciones del Estado, paso a paso y sin juridiqués.`}
            cta="Ver los trámites"
          />
          <PuertaCard
            href="/consultorio"
            icono="leads"
            titulo="Consultorio gratuito"
            desc="Pregunta gratis y un abogado colegiado te orienta en público. Sin costo, sin compromiso."
            cta="Hacer mi pregunta"
          />
          <PuertaCard
            href="/directorio"
            icono="perfil"
            titulo="Encuentra abogado"
            desc="Abogados por materia y ciudad — laboral, mercantil, familia, ambiental y más."
            cta="Buscar abogado"
          />
        </section>

        {/* ── Trámites por institución ── */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[22px] font-bold">Trámites por institución</h2>
            <Link href="/tramites" className="text-[13px]">
              Ver todos →
            </Link>
          </div>
          <p className="mt-1 text-[13.5px] text-texto-3">
            Cada institución del Estado, con sus trámites explicados — ejemplo: el IP.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INSTITUCIONES.slice(0, 6).map((inst) => {
              const delInst = TRAMITES.filter((t) => t.institucionId === inst.id);
              return (
                <Link
                  key={inst.id}
                  href={`/tramites?institucion=${inst.id}`}
                  className="rounded-xl border border-borde bg-white p-4.5 text-marino hover:border-celeste"
                >
                  <div className="text-[11px] font-bold tracking-[.8px] text-celeste uppercase">
                    {inst.sigla}
                  </div>
                  <div className="font-display mt-1 text-[14.5px] leading-[1.35] font-semibold">
                    {inst.nombre}
                  </div>
                  <div className="mt-1 text-[12.5px] text-texto-3">{inst.descripcion}</div>
                  <div className="mt-2 text-[12px] text-celeste">
                    {delInst.length} {delInst.length === 1 ? "trámite" : "trámites"} →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Despido / calculadora (imán laboral) ── */}
        <section className="mt-12 flex flex-wrap items-center gap-5 rounded-2xl border border-borde bg-white p-6 md:p-8">
          <div className="min-w-[260px] flex-1">
            <div className="text-[11px] font-bold tracking-[1px] text-celeste uppercase">
              ¿Te despidieron?
            </div>
            <h2 className="font-display mt-1.5 text-[21px] leading-[1.3] font-bold">
              Calcula en un minuto lo que te corresponde por ley
            </h2>
            <p className="mt-1.5 max-w-[520px] text-[13.5px] leading-[1.6] text-texto-3">
              Cesantía, preaviso, vacaciones y aguinaldos proporcionales según el Código del
              Trabajo — y qué hacer después, con un abogado laboral si lo necesitas.
            </p>
          </div>
          <Link
            href="/calculadora-prestaciones"
            className="rounded-xl bg-marino px-5 py-3 text-[14px] font-semibold text-white hover:bg-celeste hover:text-white"
          >
            Calcular mis prestaciones
          </Link>
        </section>

        {/* ── Directorio por materia ── */}
        <section className="mt-12">
          <h2 className="font-display text-[22px] font-bold">Abogados por materia</h2>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {materias.map((m) => (
              <Link
                key={m}
                href={`/directorio?materia=${encodeURIComponent(m)}`}
                className="rounded-full border border-borde bg-white px-4 py-2 text-[13px] font-medium text-texto-2 hover:border-celeste hover:text-celeste"
              >
                {m}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Planes público ── */}
        <section className="mt-12">
          <h2 className="font-display text-[22px] font-bold">Cuánto cuesta</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-borde bg-white p-6">
              <div className="text-xs font-semibold tracking-[1px] text-texto-4 uppercase">
                Gratis
              </div>
              <div className="font-display mt-1.5 text-[26px] font-bold">L0</div>
              <ul className="mt-3 flex flex-col gap-2 text-[13.5px]">
                {[
                  "Todas las guías de trámites",
                  "Consultorio: pregunta y recibe orientación",
                  "Directorio de abogados por materia",
                  "Calculadora de prestaciones",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-celeste">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-borde bg-white/60 p-6">
              <div className="text-xs font-semibold tracking-[1px] text-dorado uppercase">
                Plan de pago — en definición
              </div>
              <div className="font-display mt-1.5 text-[26px] font-bold text-texto-3">
                Próximamente
              </div>
              <p className="mt-3 text-[13.5px] leading-[1.6] text-texto-3">
                Estamos definiendo con el gremio qué incluirá el plan pagado para el público
                (verificaciones, alertas y más). Las guías y el consultorio seguirán siendo
                gratis.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA abogados ── */}
        <section
          className="mt-12 flex flex-wrap items-center gap-5 rounded-2xl p-6 text-white md:p-8"
          style={{ background: "linear-gradient(90deg,#0d2144,#0a1830)" }}
        >
          <div className="min-w-[260px] flex-1">
            <h2 className="font-display text-[21px] leading-[1.3] font-bold">
              ¿Eres profesional del derecho?
            </h2>
            <p className="mt-1.5 max-w-[560px] text-[13.5px] leading-[1.6] text-sobre-marino-2">
              Jurisprudencia y legislación con IA que cita sus fuentes, modelos de escritos y los
              leads de este consultorio — desde L147/mes.
            </p>
          </div>
          <Link
            href="/abogados"
            className="rounded-xl bg-celeste px-5 py-3 text-[14px] font-semibold text-white hover:bg-cruce"
          >
            Conocer el portal de abogados
          </Link>
        </section>
      </div>
    </>
  );
}

function PuertaCard({
  href,
  icono,
  titulo,
  desc,
  cta,
}: {
  href: string;
  icono: "pasos" | "leads" | "perfil";
  titulo: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-borde bg-white p-5.5 text-marino shadow-[0_8px_28px_rgba(10,24,48,.08)] hover:border-celeste"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-chip text-celeste">
        <Icono nombre={icono} size={18} />
      </span>
      <div className="font-display mt-3 text-[16.5px] font-bold">{titulo}</div>
      <p className="mt-1 text-[13px] leading-[1.55] text-texto-3">{desc}</p>
      <div className="mt-2.5 text-[13px] font-medium text-celeste">{cta} →</div>
    </Link>
  );
}
