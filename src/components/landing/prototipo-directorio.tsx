"use client";

/**
 * ⚗️ PROTOTIPO TEMPORAL — tres maneras de estructurar el directorio de la home
 * ciudadana, y tres tratamientos del CTA (2026-08-30). Se borra con su ruta.
 *
 * El CTA de hoy ("Contactar por WhatsApp") tiene un problema que no es de
 * diseño sino de modelo: saca el contacto de Justihn en el primer toque. Sin
 * registro, sin trazabilidad y sin poder enseñarle al abogado cuántos
 * contactos le trajo la plataforma — que es justo lo que sostiene que pague.
 * Los tres prototipos lo reemplazan por una consulta DIRIGIDA, que es el
 * mismo circuito del consultorio pero con destinatario.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { InsigniaNotario } from "@/components/publico/paso-profesional";
import { DIRECTORIO } from "@/data/directorio";
import type { AbogadoDirectorio } from "@/data/directorio";
import type { Materia } from "@/types/dominio";

const ORDENADOS = [...DIRECTORIO].sort((a, b) => Number(b.premium) - Number(a.premium));

function primerNombre(n: string) {
  return n.replace(/^Abg\.\s*/, "").split(" ")[0];
}

function Avatar({ a, size = 52 }: { a: AbogadoDirectorio; size?: number }) {
  return (
    <span
      className="font-display grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size / 3,
        background: "linear-gradient(180deg,#0d2144,#0a1830)",
      }}
    >
      {a.iniciales}
    </span>
  );
}

function Insignias({ a }: { a: AbogadoDirectorio }) {
  return (
    <>
      {a.validado && (
        <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10px] font-bold text-exito">
          <Icono nombre="check" size={9} strokeWidth={2.6} />
          Validado
        </span>
      )}
      {a.notario && <InsigniaNotario verificado={a.notario.verificado} />}
    </>
  );
}

function Materias({ a, max = 3 }: { a: AbogadoDirectorio; max?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {a.materias.slice(0, max).map((m) => (
        <span
          key={m}
          className="rounded-full px-2.5 py-[3px] text-[11.5px] font-medium"
          style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
        >
          {m}
        </span>
      ))}
    </div>
  );
}

// ── A · filas, como trámites y procesos ────────────────────────────────────

function OpcionA() {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-2.5">
      {ORDENADOS.map((a) => (
        <div key={a.id} className="glass-card flex flex-wrap items-center gap-4 p-4">
          <Avatar a={a} size={46} />
          <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[14.5px] font-bold">{a.nombre}</span>
              <Insignias a={a} />
            </div>
            <p className="mt-0.5 text-[12px]" style={{ color: "var(--muted)" }}>
              {a.ciudad} · ★ {a.valoracion} · {a.materias.join(" · ")}
            </p>
          </div>
          <span
            className="rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-white"
            style={{ background: "var(--turq)" }}
          >
            Consultar
          </span>
        </div>
      ))}
    </div>
  );
}

// ── B · cards con la materia primero y dos acciones ────────────────────────

function OpcionB() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ORDENADOS.map((a) => (
        <div key={a.id} className="glass-card flex flex-col p-5">
          {/* La materia arriba: es lo primero que la persona busca — no el
              nombre, que todavía no le dice nada. */}
          <Materias a={a} />
          <div className="mt-3.5 flex items-center gap-3">
            <Avatar a={a} size={44} />
            <div className="min-w-0">
              <span className="block text-[14.5px] leading-[1.25] font-bold">{a.nombre}</span>
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                {a.ciudad}
              </span>
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Insignias a={a} />
            <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
              ★ {a.valoracion} · {a.contactos} contactos
            </span>
          </div>
          <p className="mt-2.5 flex-1 text-[12.5px] leading-[1.55]" style={{ color: "var(--muted)" }}>
            {a.bio}
          </p>
          <div className="mt-4 flex gap-2">
            <span
              className="flex-1 rounded-lg py-2.5 text-center text-[13px] font-semibold text-white"
              style={{ background: "var(--turq)" }}
            >
              Consultar con {primerNombre(a.nombre)}
            </span>
            <span
              className="rounded-lg border px-3.5 py-2.5 text-center text-[13px] font-semibold"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            >
              Perfil
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── C · agrupado por materia, como las rutas de trámites ───────────────────

function OpcionC() {
  const materias = [...new Set(ORDENADOS.flatMap((a) => a.materias))] as Materia[];
  const [activa, setActiva] = useState<Materia>(materias[0]!);
  const deLaMateria = ORDENADOS.filter((a) => a.materias.includes(activa));

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {materias.map((m) => {
          const n = ORDENADOS.filter((a) => a.materias.includes(m)).length;
          const on = m === activa;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setActiva(m)}
              className="cursor-pointer rounded-full border px-3.5 py-[7px] text-[12.5px] font-medium transition-colors"
              style={
                on
                  ? { background: "var(--turq)", borderColor: "transparent", color: "#fff" }
                  : {
                      borderColor: "var(--line)",
                      color: "var(--muted)",
                      background: "rgba(255,255,255,.6)",
                    }
              }
            >
              {m} ({n})
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[13.5px]" style={{ color: "var(--muted)" }}>
        {deLaMateria.length === 1
          ? "1 profesional atiende esta materia"
          : `${deLaMateria.length} profesionales atienden esta materia`}
      </p>

      <div className="mx-auto mt-4 flex max-w-[720px] flex-col gap-2.5">
        {deLaMateria.map((a) => (
          <div key={a.id} className="glass-card flex flex-wrap items-center gap-4 p-4.5">
            <Avatar a={a} size={48} />
            <div className="min-w-[200px] flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[14.5px] font-bold">{a.nombre}</span>
                <Insignias a={a} />
              </div>
              <p className="mt-0.5 text-[12px]" style={{ color: "var(--muted)" }}>
                {a.ciudad} · ★ {a.valoracion}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.5]" style={{ color: "var(--muted)" }}>
                {a.bio}
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-1">
              <span
                className="rounded-[10px] px-4 py-2.5 text-center text-[13px] font-semibold text-white"
                style={{ background: "var(--turq)" }}
              >
                Consultar
              </span>
              <span className="text-center text-[10.5px]" style={{ color: "var(--muted)" }}>
                Te responde por Justihn
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

function Bloque({
  letra,
  titulo,
  pros,
  contras,
  cta,
  children,
}: {
  letra: string;
  titulo: string;
  pros: string;
  contras: string;
  cta: string;
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
          <b style={{ color: "var(--mint)" }}>CTA:</b> {cta}
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

export function PrototipoDirectorio() {
  return (
    <div className="landing-contenido">
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-4 text-center md:pt-[176px]">
        <p className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: "var(--mint)" }}>
          Prototipo · elegir una
        </p>
        <h1 className="font-display mt-2 text-[clamp(26px,4vw,38px)] leading-[1.15] font-bold text-balance">
          Tres maneras de estructurar el directorio
        </h1>
        <p className="mx-auto mt-3 max-w-[640px] text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
          Las tres cambian “Contactar por WhatsApp” por una consulta dirigida: el contacto
          empieza dentro de Justihn y queda como lead de ese abogado. Puedes mezclar —
          quedarte con la estructura de una y el CTA de otra.
        </p>
      </section>

      <Bloque
        letra="A"
        titulo="Filas, como trámites y procesos"
        cta="«Consultar», a secas."
        pros="Habla el mismo idioma que el resto de la página, entran los cinco en poco alto y se comparan de un vistazo."
        contras="Cabe menos información por perfil: la bio se pierde y elegir abogado necesita más señal que elegir un trámite."
      >
        <OpcionA />
      </Bloque>

      <Bloque
        letra="B"
        titulo="Cards con la materia primero"
        cta="«Consultar con Ana» + «Perfil» como acción secundaria."
        pros="Pone arriba lo que la persona busca (la materia, no el nombre) y suma prueba: validado, valoración y contactos. El CTA con nombre se siente personal."
        contras="Es la más alta de las tres, y con cinco perfiles la segunda fila del grid queda coja."
      >
        <OpcionB />
      </Bloque>

      <Bloque
        letra="C"
        titulo="Agrupado por materia"
        cta="«Consultar» + microcopy «Te responde por Justihn»."
        pros="Responde literalmente el título de la sección y la pregunta real ('¿quién ve MI tema?'). Coherente con las rutas de trámites."
        contras="Obliga a elegir materia antes de ver a nadie; un abogado de dos materias aparece dos veces."
      >
        <OpcionC />
      </Bloque>

      <section className="mx-auto max-w-[1080px] px-5 pb-20 text-center">
        <Link href="/" className="text-[13.5px] font-semibold" style={{ color: "var(--mint)" }}>
          ← Volver a la home
        </Link>
      </section>
    </div>
  );
}
