"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { calcularPrestaciones } from "@/lib/prestaciones";
import { buscarAbogados } from "@/data/directorio";
import { usePortal } from "@/store/portal";
import { fmtLempiras } from "@/lib/utils";

/**
 * Calculadora ciudadana — "me despidieron, ¿qué me corresponde?". El imán de
 * tráfico #1 del análisis. USA EL MISMO `calcularPrestaciones` que el portal
 * de abogados (§0.5: un solo lugar por dato): la persona y su abogado ven el
 * mismo número.
 *
 * Fuera del portal el resultado se muestra BLOQUEADO (patrón Jusbrasil): el
 * cálculo ya corrió — se ve difuminado — y para leerlo hay que crear cuenta o
 * iniciar sesión. Los valores viajan en la URL: al entrar, la persona ve SU
 * cálculo, no un formulario vacío.
 */
export function CalculadoraPublica({ enPortal = false }: { enPortal?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const rutaConsultorio = enPortal ? "/personas/consultas" : "/#consultorio";
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [salario, setSalario] = useState(enPortal ? (params.get("salario") ?? "") : "");
  const [anios, setAnios] = useState(enPortal ? (params.get("anios") ?? "") : "");

  const salarioNum = Number(salario);
  const aniosNum = Number(anios);
  const valido = salarioNum > 0 && aniosNum > 0;
  const bloqueado = !enPortal && valido;
  const r = calcularPrestaciones(salarioNum, aniosNum);
  const laborales = buscarAbogados("Laboral").slice(0, 2);

  /** Con los valores puestos: al entrar ve su propio cálculo hecho. */
  const destinoConDatos = `/personas/calculadora?salario=${salarioNum}&anios=${aniosNum}`;

  const iniciarSesion = () => {
    mostrarToast("Sesión de demostración — el login real llega con la Fase 2");
    router.push(destinoConDatos);
  };

  const desglose = (
    <div className="flex flex-col gap-2 rounded-xl bg-lienzo p-5">
      <Fila etiqueta="Cesantía (auxilio por el despido)" valor={fmtLempiras(r.cesantia)} />
      <Fila etiqueta="Preaviso" valor={fmtLempiras(r.preaviso)} />
      <Fila etiqueta="Vacaciones + 13º y 14º proporcionales" valor={fmtLempiras(r.proporcionales)} />
      <div className="flex justify-between gap-3 border-t border-borde pt-2.5 text-[16px]">
        <span className="font-semibold">Total estimado</span>
        <b className="whitespace-nowrap text-celeste">{fmtLempiras(r.total)}</b>
      </div>
    </div>
  );

  return (
    <div className={enPortal ? "max-w-[860px]" : "mx-auto max-w-[860px] px-4 py-8 md:px-6"}>
      {/* En la ruta pública este es EL título de la página; dentro del portal
          convive con la calculadora de plazos bajo un h1 propio, así que baja
          a h2 para no dejar dos h1 ni titular la pantalla con una sola de las
          dos herramientas. */}
      <Titular enPortal={enPortal} className="font-display text-[26px] leading-[1.25] font-bold">
        ¿Te despidieron? Esto es lo que te corresponde por ley
      </Titular>
      <p className="mt-2 max-w-[640px] text-[13.5px] leading-[1.6] text-texto-3">
        Si te despidieron <b>sin causa justificada</b>, el Código del Trabajo te reconoce
        cesantía, preaviso y las partes proporcionales de vacaciones y aguinaldos. Calcula tu
        estimación en un minuto:
      </p>

      <div className="mt-6 rounded-2xl border border-borde bg-white p-6">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
            ¿Cuánto ganabas al mes? (L)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
              placeholder="Ej. 12,000"
              className="rounded-lg border border-borde px-3 py-2.5 text-sm text-marino outline-none focus:border-celeste"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
            ¿Cuántos años trabajaste?
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={anios}
              onChange={(e) => setAnios(e.target.value)}
              placeholder="Ej. 4"
              className="rounded-lg border border-borde px-3 py-2.5 text-sm text-marino outline-none focus:border-celeste"
            />
          </label>
        </div>

        {!valido && (
          <div className="mt-5 rounded-xl bg-lienzo p-5 text-center text-[13px] text-texto-4">
            Escribe tu salario y tus años trabajados para ver el cálculo.
          </div>
        )}

        {valido && !bloqueado && <div className="mt-5">{desglose}</div>}

        {bloqueado && (
          <div className="relative mt-5">
            {/* El cálculo YA corrió: se ve detrás, difuminado. */}
            <div aria-hidden className="pointer-events-none blur-[7px] select-none">
              {desglose}
            </div>

            <div className="absolute inset-0 grid place-items-center rounded-xl bg-white/45 px-4">
              <div className="w-full max-w-[420px] rounded-2xl border border-chip-borde bg-white px-5 py-5 text-center shadow-[0_12px_36px_rgba(13,33,68,.14)]">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-chip text-celeste">
                  <Icono nombre="candado" size={17} />
                </span>
                <div className="font-display mt-2.5 text-[16px] leading-[1.35] font-bold">
                  Tu cálculo está listo
                </div>
                <p className="mx-auto mt-1 max-w-[320px] text-[12.5px] leading-[1.55] text-texto-3">
                  Crea tu cuenta gratis para ver el desglose completo, guardarlo y saber qué
                  hacer después.
                </p>
                <Link
                  href={`/crear-cuenta?tipo=persona&next=${encodeURIComponent(destinoConDatos)}`}
                  className="mt-3.5 block rounded-xl bg-celeste px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-cruce"
                
              style={{ color: "#fff" }}
            >
                  Crear mi cuenta gratis
                </Link>
                <button
                  type="button"
                  onClick={iniciarSesion}
                  className="mt-2 w-full cursor-pointer rounded-xl border border-borde bg-lienzo px-5 py-2.5 text-[13px] font-medium text-marino hover:border-celeste hover:text-celeste"
                >
                  Ya tengo cuenta — iniciar sesión
                </button>
                <p className="mt-2 text-[11px] text-texto-4">Sin tarjeta · demo de validación</p>
              </div>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11.5px] leading-[1.55] text-texto-4">
          Estimación orientativa — el cálculo exacto depende de tu caso (salario variable,
          jornada, causa del despido). <b>Ojo con los plazos:</b> los reclamos laborales
          prescriben; no dejes pasar el tiempo.
        </p>
      </div>

      {valido && !bloqueado && (
        <div className="mt-6 rounded-2xl border border-borde bg-white p-6">
          <h2 className="font-display text-[17px] font-bold">¿Y ahora qué? Tus siguientes pasos</h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            {[
              "Guarda toda la evidencia: contrato, recibos de pago, mensajes del despido",
              "Reclama primero por la vía administrativa (Secretaría de Trabajo) — es gratis",
              "Si no hay acuerdo, un abogado laboral presenta la demanda con este cálculo",
            ].map((paso, i) => (
              <li
                key={paso}
                className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-texto-2"
              >
                <span className="grid h-[22px] w-[22px] min-w-[22px] place-items-center rounded-full bg-chip text-[11.5px] font-bold text-celeste">
                  {i + 1}
                </span>
                {paso}
              </li>
            ))}
          </ol>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {laborales.map((a) => (
              <div key={a.id} className="rounded-xl border border-borde p-4">
                <div className="text-[13.5px] font-semibold">{a.nombre}</div>
                <div className="text-[11.5px] text-texto-4">
                  {a.ciudad} · {a.anios} años · Laboral
                </div>
                <button
                  type="button"
                  onClick={() =>
                    mostrarToast(
                    `Así le escribes a ${a.nombre} desde Justihn (demo de validación)`,
                  )
                  }
                  className="mt-2.5 w-full cursor-pointer rounded-lg bg-celeste py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
                >
                  Consultar con {a.nombre.replace(/^Abg\.\s*/, "").split(" ")[0]}
                </button>
              </div>
            ))}
          </div>
          <Link href={rutaConsultorio} className="mt-3.5 inline-block text-[13px]">
            ¿Dudas sobre tu caso? Pregunta gratis en el consultorio →
          </Link>
        </div>
      )}
    </div>
  );
}

function Titular({
  enPortal,
  className,
  children,
}: {
  enPortal: boolean;
  className: string;
  children: React.ReactNode;
}) {
  return enPortal ? (
    <h2 className={className}>{children}</h2>
  ) : (
    <h1 className={className}>{children}</h1>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13.5px]">
      <span className="text-texto-3">{etiqueta}</span>
      <b className="whitespace-nowrap">{valor}</b>
    </div>
  );
}
