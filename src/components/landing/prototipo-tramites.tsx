"use client";

/**
 * ⚗️ PROTOTIPO TEMPORAL — tres maneras de estructurar la sección de trámites
 * de la home ciudadana, para que Wesley elija (2026-08-30).
 *
 * Usa los datos REALES del seed, no maquetas: los 9 trámites verificados, su
 * institución, sus pasos y su tasa. Lo único local es `TASA_CORTA` — un
 * resumen de una línea de la `tasa` verificada, para que quepa en una columna.
 * Si se elige una opción con costo visible, ese campo se muda al seed como
 * `tasaCorta` (fuente única, §0.5) y este archivo se borra entero junto con
 * su ruta `/prototipo-tramites`.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { getInstitucion, TRAMITES } from "@/data/tramites";
import type { Tramite } from "@/data/tramites";

const ADMIN = TRAMITES.filter((t) => t.tipo === "tramite");
const por = (id: string) => ADMIN.find((t) => t.id === id)!;

/**
 * Resumen de una línea de la tasa verificada. NO inventa cifras: condensa lo
 * que ya dice `tasa` en cada guía.
 */
const TASA_CORTA: Record<string, string> = {
  "abrir-rtn": "Gratuito",
  "facturacion-cai": "Sin tasa oficial",
  "permiso-operacion": "Según tus ventas",
  "licencia-sanitaria": "Desde L 341",
  "licencia-ambiental": "Lo calcula el sistema",
  "inscripcion-oncae": "L 400",
  "tradicion-dominio": "L 200 + 1.5%",
  "traspaso-vehiculo": "L 300",
  "constituir-sociedad": "≈ L 2,040",
};

const esGratis = (id: string) => TASA_CORTA[id] === "Gratuito";

// ── Opción A · rutas por situación ─────────────────────────────────────────

interface Ruta {
  id: string;
  etiqueta: string;
  titulo: string;
  intro: string;
  pasos: { tramite: Tramite; nota?: string; condicional?: boolean }[];
}

const RUTAS: Ruta[] = [
  {
    id: "negocio",
    etiqueta: "Abrir un negocio",
    titulo: "De no tener nada a poder facturar",
    intro:
      "Van en este orden y cada uno pide el anterior. Los dos últimos solo si tu giro los exige.",
    pasos: [
      { tramite: por("abrir-rtn"), nota: "Sin esto no puedes hacer lo siguiente" },
      { tramite: por("facturacion-cai"), nota: "Te habilita a emitir factura válida" },
      { tramite: por("permiso-operacion"), nota: "Lo pide tu alcaldía cada año" },
      { tramite: por("licencia-sanitaria"), nota: "Si manejas alimentos", condicional: true },
      { tramite: por("licencia-ambiental"), nota: "Si tu actividad impacta el ambiente", condicional: true },
    ],
  },
  {
    id: "comprar",
    etiqueta: "Comprar o vender algo",
    titulo: "Que lo que compraste quede a tu nombre",
    intro: "Pagar no es ser dueño: mientras no se inscriba, el bien sigue registrado a nombre de otro.",
    pasos: [
      { tramite: por("traspaso-vehiculo"), nota: "Vehículos, en el Registro Vehicular" },
      { tramite: por("tradicion-dominio"), nota: "Casas y terrenos, en el Registro Inmueble" },
    ],
  },
  {
    id: "crecer",
    etiqueta: "Formalizar y vender al Estado",
    titulo: "De comerciante individual a empresa proveedora",
    intro: "El Estado solo compra a proveedores inscritos, y para inscribirte necesitas estar constituido.",
    pasos: [
      { tramite: por("constituir-sociedad"), nota: "Ante notario y Registro Mercantil" },
      { tramite: por("inscripcion-oncae"), nota: "Te habilita a participar en licitaciones" },
    ],
  },
];

function OpcionA() {
  const [ruta, setRuta] = useState(RUTAS[0]!.id);
  const activa = RUTAS.find((r) => r.id === ruta)!;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {RUTAS.map((r) => {
          const on = r.id === ruta;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRuta(r.id)}
              aria-pressed={on}
              className="cursor-pointer rounded-full border px-4 py-2 text-[13px] font-medium transition-colors"
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
              {r.etiqueta} ({r.pasos.length})
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-[720px]">
        <h3 className="font-display text-center text-[19px] font-bold">{activa.titulo}</h3>
        <p
          className="mx-auto mt-1.5 max-w-[520px] text-center text-[13px] leading-[1.6]"
          style={{ color: "var(--muted)" }}
        >
          {activa.intro}
        </p>

        <ol className="mt-6 flex flex-col">
          {activa.pasos.map((p, i) => {
            const inst = getInstitucion(p.tramite.institucionId)!;
            const ultimo = i === activa.pasos.length - 1;
            return (
              <li key={p.tramite.id} className="flex gap-4">
                {/* Riel: el número y la línea que encadena con el siguiente */}
                <div className="flex flex-col items-center">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold"
                    style={
                      p.condicional
                        ? {
                            background: "rgba(255,255,255,.7)",
                            border: "1.5px dashed var(--line)",
                            color: "var(--muted)",
                          }
                        : { background: "var(--turq)", color: "#fff" }
                    }
                  >
                    {i + 1}
                  </span>
                  {!ultimo && (
                    <span
                      className="w-px flex-1"
                      style={{ background: "var(--line)", minHeight: 26 }}
                    />
                  )}
                </div>

                <Link
                  href={`/tramites/${p.tramite.id}`}
                  className="glass-card mb-3 flex flex-1 flex-wrap items-center gap-x-4 gap-y-1.5 p-4"
                >
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-[15px] leading-[1.3] font-semibold">
                        {p.tramite.nombre}
                      </span>
                      {p.tramite.fuenteUrl && (
                        <span className="shrink-0 text-exito" title="Fuente oficial verificada">
                          <Icono nombre="check" size={12} strokeWidth={2.8} />
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px]" style={{ color: "var(--muted)" }}>
                      {inst.sigla} · {p.nota}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[12px] font-semibold"
                    style={
                      esGratis(p.tramite.id)
                        ? { background: "var(--color-exito-bg)", color: "var(--color-exito)" }
                        : { background: "var(--color-chip)", color: "var(--mint)" }
                    }
                  >
                    {TASA_CORTA[p.tramite.id]}
                  </span>
                  <span className="text-[12px] whitespace-nowrap" style={{ color: "var(--mint)" }}>
                    {p.tramite.pasos.length} pasos →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

// ── Opción B · lista comparativa ───────────────────────────────────────────

function OpcionB() {
  return (
    <div className="mx-auto max-w-[860px]">
      <div
        className="hidden gap-4 px-4 pb-2 text-[11px] font-bold tracking-[.8px] uppercase sm:grid sm:grid-cols-[minmax(0,1fr)_110px_140px_70px]"
        style={{ color: "var(--muted)" }}
      >
        <span>Trámite</span>
        <span>Institución</span>
        <span>Costo</span>
        <span className="text-right">Pasos</span>
      </div>
      <div className="flex flex-col gap-2">
        {ADMIN.map((t) => {
          const inst = getInstitucion(t.institucionId)!;
          return (
            <Link
              key={t.id}
              href={`/tramites/${t.id}`}
              className="glass-card grid grid-cols-1 items-center gap-x-4 gap-y-1 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_110px_140px_70px]"
            >
              <div className="flex items-center gap-1.5">
                {t.fuenteUrl && (
                  <span className="shrink-0 text-exito" title="Fuente oficial verificada">
                    <Icono nombre="check" size={12} strokeWidth={2.8} />
                  </span>
                )}
                <span className="text-[14px] leading-[1.35] font-semibold">{t.nombre}</span>
              </div>
              <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
                {inst.sigla}
              </span>
              <span
                className="text-[12.5px] font-semibold"
                style={{ color: esGratis(t.id) ? "var(--color-exito)" : "var(--ink)" }}
              >
                {TASA_CORTA[t.id]}
              </span>
              <span
                className="text-[12.5px] sm:text-right"
                style={{ color: "var(--mint)" }}
              >
                {t.pasos.length} →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Opción C · destacado + lista ───────────────────────────────────────────

function OpcionC() {
  const destacado = por("abrir-rtn");
  const resto = ADMIN.filter((t) => t.id !== destacado.id);
  const inst = getInstitucion(destacado.institucionId)!;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Link href={`/tramites/${destacado.id}`} className="glass-card flex flex-col p-6">
        <span
          className="text-[11px] font-bold tracking-[1.2px] uppercase"
          style={{ color: "var(--mint)" }}
        >
          El más buscado · {inst.sigla}
        </span>
        <h3 className="font-display mt-2 text-[22px] leading-[1.25] font-bold">
          {destacado.nombre}
        </h3>
        <p
          className="mt-2 flex-1 text-[13px] leading-[1.6]"
          style={{ color: "var(--muted)" }}
        >
          {destacado.paraQuien}.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[12px] font-semibold"
            style={{ background: "var(--color-exito-bg)", color: "var(--color-exito)" }}
          >
            {TASA_CORTA[destacado.id]}
          </span>
          <span className="text-[12.5px]" style={{ color: "var(--muted)" }}>
            {destacado.pasos.length} pasos · {destacado.requisitos.length} requisitos
          </span>
        </div>
        <span
          className="mt-4 rounded-[10px] py-2.5 text-center text-[13.5px] font-semibold"
          style={{ background: "var(--turq)", color: "#fff" }}
        >
          Ver la guía
        </span>
      </Link>

      <div className="flex flex-col gap-2">
        {resto.map((t) => {
          const i = getInstitucion(t.institucionId)!;
          return (
            <Link
              key={t.id}
              href={`/tramites/${t.id}`}
              className="glass-card flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"
            >
              <div className="min-w-[180px] flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] leading-[1.3] font-semibold">{t.nombre}</span>
                  {t.fuenteUrl && (
                    <span className="shrink-0 text-exito" title="Fuente oficial verificada">
                      <Icono nombre="check" size={11} strokeWidth={2.8} />
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
                  {i.sigla}
                </p>
              </div>
              <span
                className="text-[12.5px] font-semibold"
                style={{ color: esGratis(t.id) ? "var(--color-exito)" : "var(--ink)" }}
              >
                {TASA_CORTA[t.id]}
              </span>
              <span className="text-[12px] whitespace-nowrap" style={{ color: "var(--mint)" }}>
                {t.pasos.length} pasos →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Página del prototipo ───────────────────────────────────────────────────

function Bloque({
  letra,
  titulo,
  pros,
  contras,
  children,
}: {
  letra: string;
  titulo: string;
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
          <b style={{ color: "var(--color-exito)" }}>A favor:</b> {pros}
          <br />
          <b style={{ color: "var(--color-aviso-texto)" }}>En contra:</b> {contras}
        </p>
      </div>
      {children}
    </section>
  );
}

export function PrototipoTramites() {
  return (
    <div className="landing-contenido">
      <section className="mx-auto max-w-[880px] px-5 pt-[150px] pb-4 text-center md:pt-[176px]">
        <p
          className="text-[11px] font-bold tracking-[2px] uppercase"
          style={{ color: "var(--mint)" }}
        >
          Prototipo · elegir una
        </p>
        <h1 className="font-display mt-2 text-[clamp(26px,4vw,38px)] leading-[1.15] font-bold text-balance">
          Tres maneras de estructurar los trámites
        </h1>
        <p
          className="mx-auto mt-3 max-w-[600px] text-[14px] leading-[1.65]"
          style={{ color: "var(--muted)" }}
        >
          Las tres con los 9 trámites reales y su costo verificado. Esta ruta es temporal:
          al elegir una, se lleva a la home y se borra el resto.
        </p>
      </section>

      <Bloque
        letra="A"
        titulo="Rutas por situación"
        pros="Habla como la gente busca ('voy a abrir un negocio'), y enseña que los trámites van encadenados — un dato que la persona no sabe y que ninguna lista de links da."
        contras="Obliga a decidir a qué ruta pertenece cada trámite; los que sirven a varias situaciones hay que repetirlos o elegirles una."
      >
        <OpcionA />
      </Bloque>

      <Bloque
        letra="B"
        titulo="Lista comparativa"
        pros="El costo queda en columna y se compara de un vistazo. Ocupa la mitad de alto que 9 cards y se escanea en segundos."
        contras="Se siente a tabla de datos, no a guía. Sin jerarquía: el RTN pesa lo mismo que la licencia ambiental."
      >
        <OpcionB />
      </Bloque>

      <Bloque
        letra="C"
        titulo="Uno destacado + lista"
        pros="Da jerarquía sin reestructurar nada: el más buscado entra por los ojos y el resto queda accesible y compacto."
        contras="Sigue sin explicar el orden entre trámites, y hay que decidir (y sostener) cuál es 'el más buscado'."
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
