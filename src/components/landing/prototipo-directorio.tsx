"use client";

/**
 * ⚗️ PROTOTIPO TEMPORAL — la card oficial del abogado (2026-08-30, 2ª ronda).
 * Se borra con su ruta al elegir una.
 *
 * Punto de partida: la "B" de la ronda anterior (materia arriba) funcionaba,
 * pero arrastraba dos métricas que no se sostienen:
 *
 *   ★ 4.9 valoración — NO existe sistema de reseñas. Ese número no lo produce
 *     nadie: es prueba fabricada, y aquí decide a quién contrata una persona.
 *   21 contactos    — vanidad. Que le escriban no dice que responda bien.
 *
 * Las tres evoluciones las quitan y las reemplazan por lo único que Justihn
 * puede probar de verdad: **lo que el abogado ha respondido en el consultorio**.
 * Ahí se lee cómo explica antes de contactarlo, y crea el círculo que el
 * producto necesita — responder en público es lo que te trae clientes.
 *
 * `EXTRA` es dato de demostración local; si se elige una variante, se muda al
 * seed (`data/directorio.ts`) como campos del perfil.
 */
import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import { InsigniaNotario } from "@/components/publico/paso-profesional";
import { DIRECTORIO } from "@/data/directorio";
import type { AbogadoDirectorio } from "@/data/directorio";

const ORDENADOS = [...DIRECTORIO].sort((a, b) => Number(b.premium) - Number(a.premium));

interface Extra {
  anios: number;
  respuestas: number;
  responde: string;
  /** Fragmento de una respuesta suya en el consultorio: su voz, no un eslogan. */
  cita: string;
  enLinea: boolean;
}

const EXTRA: Record<string, Extra> = {
  "maria-castillo": {
    anios: 12,
    respuestas: 34,
    responde: "el mismo día",
    cita: "El plazo corre desde que terminó el contrato, no desde que te pagaron. Dos meses.",
    enLinea: true,
  },
  "carlos-mejia": {
    anios: 15,
    respuestas: 21,
    responde: "en 1 día",
    cita: "Antes de firmar el pacto social decide quién administra: cambiarlo después cuesta otra escritura.",
    enLinea: true,
  },
  "lucia-fernandez": {
    anios: 9,
    respuestas: 12,
    responde: "en 2 días",
    cita: "La licencia ambiental no se pide al final: si arrancas sin ella, la multa la fija MiAmbiente por día.",
    enLinea: false,
  },
  "roberto-pineda": {
    anios: 18,
    respuestas: 27,
    responde: "el mismo día",
    cita: "Pídeme el folio real antes de dar un adelanto. La mitad de mi trabajo es evitar ese pleito.",
    enLinea: true,
  },
  "ana-varela": {
    anios: 7,
    respuestas: 19,
    responde: "en horas",
    cita: "Si te citan a declarar, no vayas solo. Puedes pedir asistencia antes de decir una palabra.",
    enLinea: true,
  },
};

const ex = (a: AbogadoDirectorio) => EXTRA[a.id]!;

function primerNombre(n: string) {
  return n.replace(/^Abg\.\s*/, "").split(" ")[0];
}

function Avatar({ a, size = 46 }: { a: AbogadoDirectorio; size?: number }) {
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

function Materias({ a }: { a: AbogadoDirectorio }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {a.materias.map((m) => (
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

function Cabecera({ a }: { a: AbogadoDirectorio }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar a={a} />
      <div className="min-w-0">
        <span className="block text-[15px] leading-[1.25] font-bold">{a.nombre}</span>
        <span className="text-[12px]" style={{ color: "var(--muted)" }}>
          {a.ciudad} · {ex(a).anios} años de ejercicio
        </span>
      </div>
    </div>
  );
}

function Credenciales({ a }: { a: AbogadoDirectorio }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {a.validado ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10.5px] font-bold text-exito">
          <Icono nombre="check" size={9} strokeWidth={2.8} />
          Colegiación validada
        </span>
      ) : (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10.5px] font-semibold"
          style={{ background: "var(--color-aviso)", color: "var(--color-aviso-texto)" }}
        >
          Validación en trámite
        </span>
      )}
      {a.notario && <InsigniaNotario verificado={a.notario.verificado} />}
    </div>
  );
}

function Boton({ a, ancho = true }: { a: AbogadoDirectorio; ancho?: boolean }) {
  return (
    <span
      className={`rounded-lg py-2.5 text-center text-[13px] font-semibold text-white ${ancho ? "block w-full" : "px-4"}`}
      style={{ background: "var(--turq)" }}
    >
      Consultar con {primerNombre(a.nombre)}
    </span>
  );
}

// ── D · la card que habla ──────────────────────────────────────────────────

function OpcionD() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {ORDENADOS.map((a) => (
        <div key={a.id} className="glass-card flex flex-col p-5">
          <Materias a={a} />
          <div className="mt-3.5">
            <Cabecera a={a} />
          </div>
          <div className="mt-3">
            <Credenciales a={a} />
          </div>

          {/* Su voz: un fragmento de lo que ya respondió en público. Es lo
              único que deja juzgar CÓMO explica antes de escribirle. */}
          <blockquote
            className="mt-4 flex-1 rounded-[12px] border-l-[3px] py-2.5 pr-3 pl-3.5 text-[13px] leading-[1.6]"
            style={{
              borderColor: "var(--color-celeste)",
              background: "rgba(21,132,199,.06)",
              color: "var(--ink)",
            }}
          >
            “{ex(a).cita}”
            <footer className="mt-1.5 text-[11px]" style={{ color: "var(--muted)" }}>
              De una de sus {ex(a).respuestas} respuestas en el consultorio
            </footer>
          </blockquote>

          <div className="mt-4">
            <Boton a={a} />
          </div>
          <p className="mt-2 text-center text-[11px]" style={{ color: "var(--muted)" }}>
            Suele responder {ex(a).responde}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── E · la ficha de credenciales ───────────────────────────────────────────

function OpcionE() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ORDENADOS.map((a) => (
        <div key={a.id} className="glass-card flex flex-col p-5">
          <Materias a={a} />
          <div className="mt-3.5">
            <Cabecera a={a} />
          </div>

          {/* Señales verificables en filas, como una ficha. Nada de estrellas:
              todo lo de aquí lo puede comprobar el producto. */}
          <dl className="mt-4 flex flex-col">
            {[
              {
                icono: "check" as const,
                k: "Colegiación",
                v: a.validado ? "Validada con el CAH" : "En trámite",
                ok: a.validado,
              },
              {
                icono: "leads" as const,
                k: "En el consultorio",
                v: `${ex(a).respuestas} respuestas públicas`,
                ok: true,
              },
              {
                icono: "reloj" as const,
                k: "Responde",
                v: ex(a).responde,
                ok: true,
              },
              {
                icono: "ubicacion" as const,
                k: "Atiende",
                v: ex(a).enLinea ? "En línea y presencial" : "Presencial",
                ok: true,
              },
            ].map((f, i) => (
              <div
                key={f.k}
                className={`flex items-center gap-2.5 py-2 text-[12.5px] ${i > 0 ? "border-t" : ""}`}
                style={i > 0 ? { borderColor: "var(--line)" } : undefined}
              >
                <span
                  className="shrink-0"
                  style={{ color: f.ok ? "var(--color-exito)" : "var(--color-aviso-texto)" }}
                >
                  <Icono nombre={f.icono} size={14} strokeWidth={2.2} />
                </span>
                <dt className="shrink-0" style={{ color: "var(--muted)" }}>
                  {f.k}
                </dt>
                <dd className="ml-auto text-right font-medium">{f.v}</dd>
              </div>
            ))}
          </dl>

          <p
            className="mt-3 flex-1 text-[12.5px] leading-[1.55]"
            style={{ color: "var(--muted)" }}
          >
            {a.bio}
          </p>
          <div className="mt-4">
            <Boton a={a} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── F · fila ancha con todo a la vista ─────────────────────────────────────

function OpcionF() {
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-3">
      {ORDENADOS.map((a) => (
        <div key={a.id} className="glass-card flex flex-wrap gap-5 p-5">
          <div className="min-w-[260px] flex-1">
            <Materias a={a} />
            <div className="mt-3">
              <Cabecera a={a} />
            </div>
            <p className="mt-2.5 text-[12.5px] leading-[1.55]" style={{ color: "var(--muted)" }}>
              {a.bio}
            </p>
            <div className="mt-2.5">
              <Credenciales a={a} />
            </div>
          </div>

          {/* Columna de decisión: la prueba del consultorio y la acción. */}
          <div
            className="flex min-w-[200px] flex-col justify-center gap-2.5 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5"
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "var(--mint)" }}>
                <Icono nombre="leads" size={15} strokeWidth={2.2} />
              </span>
              <span className="text-[12.5px]">
                <b>{ex(a).respuestas}</b> respuestas públicas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: "var(--mint)" }}>
                <Icono nombre="reloj" size={15} strokeWidth={2.2} />
              </span>
              <span className="text-[12.5px]">Responde {ex(a).responde}</span>
            </div>
            <Boton a={a} />
            <Link
              href="#"
              className="text-center text-[11.5px]"
              style={{ color: "var(--mint)" }}
            >
              Ver su perfil y sus respuestas →
            </Link>
          </div>
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

export function PrototipoDirectorio() {
  return (
    <div className="landing-contenido">
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-4 text-center md:pt-[176px]">
        <p
          className="text-[11px] font-bold tracking-[2px] uppercase"
          style={{ color: "var(--mint)" }}
        >
          Prototipo · la card oficial del abogado
        </p>
        <h1 className="font-display mt-2 text-[clamp(26px,4vw,38px)] leading-[1.15] font-bold text-balance">
          Tres cards para elegir abogado
        </h1>
        <p
          className="mx-auto mt-3 max-w-[660px] text-[14px] leading-[1.65]"
          style={{ color: "var(--muted)" }}
        >
          Las tres quitan la valoración “★ 4.9” y el contador de contactos: no hay sistema de
          reseñas detrás, así que ese número no lo produce nadie. En su lugar usan lo único
          que Justihn sí puede probar — lo que el abogado respondió en el consultorio.
        </p>
      </section>

      <Bloque
        letra="D"
        titulo="La card que habla"
        idea="Un fragmento real de una respuesta suya, citado."
        pros="Es lo más persuasivo que puede llevar una card de abogado: dejas juzgar CÓMO explica antes de escribirle. Y crea el círculo del producto — responder en público te trae clientes."
        contras="Ocupa más y exige que cada abogado tenga al menos una respuesta publicada; el que acaba de entrar no tiene qué citar."
      >
        <OpcionD />
      </Bloque>

      <Bloque
        letra="E"
        titulo="La ficha de credenciales"
        idea="Filas de señales que el producto puede comprobar, como una ficha."
        pros="Sobria y muy escaneable: colegiación, actividad, tiempo de respuesta y modalidad, todo comparable entre perfiles. Nada inventado."
        contras="Se siente a formulario. No transmite personalidad: cinco fichas se parecen entre sí."
      >
        <OpcionE />
      </Bloque>

      <Bloque
        letra="F"
        titulo="Fila ancha con columna de decisión"
        idea="A la izquierda quién es; a la derecha, separado por una línea, la prueba y la acción."
        pros="Separa 'conocerlo' de 'decidir'. Cabe la bio entera y el ojo va directo a la columna de la derecha cuando ya se decidió. Coherente con las filas de trámites."
        contras="En móvil se apila y pierde la separación; con muchos perfiles es una lista larga sin jerarquía."
      >
        <OpcionF />
      </Bloque>

      <section className="mx-auto max-w-[1080px] px-5 pb-20 text-center">
        <Link href="/" className="text-[13.5px] font-semibold" style={{ color: "var(--mint)" }}>
          ← Volver a la home
        </Link>
      </section>
    </div>
  );
}
