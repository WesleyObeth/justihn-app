"use client";

/**
 * Mi plan (ciudadano): Gratis activo + lo que traerá el de pago.
 *
 * Lo incluido se DERIVA de los seeds (`TRAMITES.length`, `INSTITUCIONES`,
 * `DIRECTORIO`): escrito a mano se quedaba viejo — decía "calculadora de
 * prestaciones" en singular cuando ya hay dos, y no mencionaba Instituciones,
 * Verifica ni Mi nombre, que nacieron después.
 *
 * ⚠️ El plan de pago no lleva precio ni fecha (§4.5): lo define el socio. Lo
 * único que se promete es lo que ya está decidido — lo gratis sigue gratis.
 */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { SimboloJusIALinear } from "@/components/brand/logos";
import { DIRECTORIO } from "@/data/directorio";
import { INSTITUCIONES, TRAMITES } from "@/data/tramites";
import { usePortal } from "@/store/portal";

export function PlanPersona() {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntas = usePortal((s) => s.preguntasPublico);
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const vigilados = usePortal((s) => s.nombresVigiladosPersona);

  const enProgreso = TRAMITES.filter((t) => (pasosTramite[t.id] ?? []).length > 0).length;

  return (
    <div className="max-w-[1180px]">
      <h1 className="font-display text-[24px] font-bold">Mi plan</h1>
      <p className="mt-1 text-[13px] text-texto-3">
        Lo esencial es gratis para siempre. El plan de pago está en definición.
      </p>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border-2 border-celeste bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-[1px] text-celeste uppercase">
                Gratis
              </span>
              <span className="rounded-full bg-chip px-2.5 py-[3px] text-[10.5px] font-bold text-celeste">
                TU PLAN
              </span>
            </div>
            <div className="mt-1.5 flex items-end gap-2">
              <span className="font-display text-[34px] leading-none font-bold">L 0</span>
              <span className="pb-1 text-[14px] text-texto-3">para siempre</span>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.6] text-texto-3">
              No pedimos tarjeta, ni ahora ni después.
            </p>

            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                `Las ${TRAMITES.length} guías de trámites y procesos, con tu avance guardado`,
                "Consultas ilimitadas al consultorio — varios abogados pueden responderte",
                "Calculadora de prestaciones y calculadora de plazos",
                `Directorio de ${DIRECTORIO.length} abogados por materia y ciudad`,
                `Las ${INSTITUCIONES.length} instituciones del Estado y sus trámites`,
                "Informe Verifica en sentencias publicadas",
                "Vigilancia de tu nombre y el de tu familia",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5]">
                  <span className="mt-0.5 shrink-0 text-exito">
                    <Icono nombre="check" size={14} strokeWidth={2.6} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Lo que la persona está usando de verdad: un plan sin uso al lado
              es una lista de promesas. */}
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              Lo que llevas usado
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <Uso href="/personas/consultas" valor={preguntas.length} etiqueta="consultas" />
              <Uso href="/personas/tramites" valor={enProgreso} etiqueta="trámites en curso" />
              <Uso href="/personas/monitoreo" valor={vigilados.length} etiqueta="nombres vigilados" />
            </div>
            <p className="mt-3 text-[11.5px] leading-[1.55] text-texto-4">
              Sin límite en ninguno: el plan gratis no tiene cuota.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <JusIA />

          <div className="rounded-2xl border-2 border-dashed border-borde bg-white/70 p-6">
            <span className="text-xs font-semibold tracking-[1px] text-dorado uppercase">
              Plan de pago — en definición
            </span>
            <div className="font-display mt-1.5 text-[22px] leading-[1.2] font-bold text-texto-3">
              Lo que traerá
            </div>
            <ul className="mt-3.5 flex flex-col gap-3">
              {(
                [
                  [
                    "candado",
                    "Informe Verifica completo",
                    "Folio real de un inmueble e historial de una empresa, además de las sentencias.",
                  ],
                  [
                    "bell",
                    "Vigilancia con aviso",
                    "Que te avisen apenas salga algo con tu nombre, sin entrar a mirar.",
                  ],
                  [
                    "documento",
                    "Tus documentos en un lugar",
                    "Guardar lo de cada trámite para no volver a buscarlo.",
                  ],
                ] as [NombreIcono, string, string][]
              ).map(([icono, titulo, desc]) => (
                <li key={titulo} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-lienzo text-texto-4">
                    <Icono nombre={icono} size={12} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-marino">{titulo}</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.5] text-texto-3">
                      {desc}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => mostrarToast("Te avisaremos cuando el plan de pago esté disponible")}
              className="mt-4 w-full cursor-pointer rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[13px] font-medium text-marino hover:border-celeste"
            >
              Avisarme cuando esté
            </button>
            <p className="mt-3 text-[11.5px] leading-[1.55] text-texto-4">
              Sin precio ni fecha todavía: lo define el gremio. Lo que hoy es gratis seguirá
              siendo gratis.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-[720px] text-[12px] leading-[1.6] text-texto-4">
        Tienes derecho a acceder, revisar y pedir la supresión de tus datos personales (habeas
        data, art. 182 de la Constitución) — solicítalo desde{" "}
        <Link href="/personas/configuracion">Configuración</Link> y respondemos en 72 horas
        hábiles.
      </p>
    </div>
  );
}

function Uso({ href, valor, etiqueta }: { href: string; valor: number; etiqueta: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
    >
      <div className="font-display text-[22px] leading-none font-bold">{valor}</div>
      <div className="mt-1 text-[11.5px] text-texto-3">{etiqueta}</div>
    </Link>
  );
}

/**
 * Jus IA en el plan de pago (decisión Wesley 2026-08-31).
 *
 * Se anuncia sin fecha y sin precio, y diciendo POR QUÉ todavía no está: el
 * motor existe pero se niega a responder sin corpus indexado, porque prefiere
 * decir "no encontré fuentes" a inventar una cita — que es exactamente la
 * promesa que distingue a Justihn de preguntarle a cualquier IA. Anunciarlo
 * como si ya funcionara sería romper esa promesa en la pantalla que la vende.
 */
function JusIA() {
  return (
    <div
      className="rounded-2xl p-6 text-[#e8eef6]"
      style={{ background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)" }}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
          <SimboloJusIALinear size={18} />
        </span>
        <div>
          <div className="text-[10.5px] font-semibold tracking-[1.2px] text-sobre-marino uppercase">
            Con el plan de pago
          </div>
          <div className="font-display text-[18px] leading-tight font-bold">Jus IA para ti</div>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-[1.65] text-sobre-marino-2">
        Preguntas en tus palabras —«me despidieron sin preaviso, ¿qué hago?»— y responde{" "}
        <b className="text-[#e8eef6]">citando la ley, con enlace al documento oficial</b>. No es
        un chat que opina: si no encuentra la fuente, lo dice en vez de inventarla.
      </p>

      <ul className="mt-3.5 flex flex-col gap-2">
        {[
          "Cada respuesta enlaza el artículo o la sentencia en que se apoya",
          "Entiende tu caso sin que sepas cómo se llama en derecho",
          "Y cuando haga falta un abogado, te lo dice",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2 text-[12.5px] leading-[1.55]">
            <span className="mt-0.5 shrink-0 text-celeste">
              <Icono nombre="check" size={12} strokeWidth={2.6} />
            </span>
            <span className="text-sobre-marino-2">{t}</span>
          </li>
        ))}
      </ul>

      {/* Por qué todavía no: el motor está escrito y apagado a propósito. */}
      <p className="mt-4 rounded-[10px] bg-white/[0.07] px-4 py-3 text-[11.5px] leading-[1.6] text-sobre-marino">
        <b className="text-[#e8eef6]">Aún no está encendida.</b> Necesita el corpus del Poder
        Judicial indexado — más de 20.000 sentencias — y hasta entonces preferimos no encenderla:
        una respuesta sin fuente no vale nada en un asunto legal. Mientras tanto, en el{" "}
        <Link href="/personas/consultas" className="text-celeste hover:text-white">
          consultorio
        </Link>{" "}
        te responden abogados de verdad, gratis.
      </p>
    </div>
  );
}
