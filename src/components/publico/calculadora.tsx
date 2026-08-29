"use client";

import Link from "next/link";
import { useState } from "react";
import { calcularPrestaciones } from "@/lib/prestaciones";
import { buscarAbogados } from "@/data/directorio";
import { usePortal } from "@/store/portal";
import { fmtLempiras } from "@/lib/utils";

/**
 * Calculadora ciudadana — "me despidieron, ¿qué me corresponde?". El imán de
 * tráfico #1 del análisis. USA EL MISMO `calcularPrestaciones` que el portal
 * de abogados (§0.5: un solo lugar por dato): la persona y su abogado ven el
 * mismo número.
 */
export function CalculadoraPublica({ enPortal = false }: { enPortal?: boolean }) {
  const rutaConsultorio = enPortal ? "/persona/consultas" : "/consultorio";
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [salario, setSalario] = useState("");
  const [anios, setAnios] = useState("");

  const salarioNum = Number(salario);
  const aniosNum = Number(anios);
  const valido = salarioNum > 0 && aniosNum > 0;
  const r = calcularPrestaciones(salarioNum, aniosNum);
  const laborales = buscarAbogados("Laboral").slice(0, 2);

  return (
    <div className={enPortal ? "max-w-[860px]" : "mx-auto max-w-[860px] px-4 py-8 md:px-6"}>
      <h1 className="font-display text-[26px] leading-[1.25] font-bold">
        ¿Te despidieron? Esto es lo que te corresponde por ley
      </h1>
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

        {valido ? (
          <div className="mt-5 flex flex-col gap-2 rounded-xl bg-lienzo p-5">
            <Fila etiqueta="Cesantía (auxilio por el despido)" valor={fmtLempiras(r.cesantia)} />
            <Fila etiqueta="Preaviso" valor={fmtLempiras(r.preaviso)} />
            <Fila
              etiqueta="Vacaciones + 13º y 14º proporcionales"
              valor={fmtLempiras(r.proporcionales)}
            />
            <div className="flex justify-between gap-3 border-t border-borde pt-2.5 text-[16px]">
              <span className="font-semibold">Total estimado</span>
              <b className="whitespace-nowrap text-celeste">{fmtLempiras(r.total)}</b>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-lienzo p-5 text-center text-[13px] text-texto-4">
            Escribe tu salario y tus años trabajados para ver el cálculo.
          </div>
        )}

        <p className="mt-3 text-[11.5px] leading-[1.55] text-texto-4">
          Estimación orientativa — el cálculo exacto depende de tu caso (salario variable,
          jornada, causa del despido). <b>Ojo con los plazos:</b> los reclamos laborales
          prescriben; no dejes pasar el tiempo.
        </p>
      </div>

      {valido && (
        <div className="mt-6 rounded-2xl border border-borde bg-white p-6">
          <h2 className="font-display text-[17px] font-bold">¿Y ahora qué? Tus siguientes pasos</h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            {[
              "Guarda toda la evidencia: contrato, recibos de pago, mensajes del despido",
              "Reclama primero por la vía administrativa (Secretaría de Trabajo) — es gratis",
              "Si no hay acuerdo, un abogado laboral presenta la demanda con este cálculo",
            ].map((paso, i) => (
              <li key={paso} className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-texto-2">
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
                  {a.ciudad} · ★ {a.valoracion} · Laboral
                </div>
                <button
                  type="button"
                  onClick={() =>
                    mostrarToast(`Así inicia el contacto con ${a.nombre} (demo de validación)`)
                  }
                  className="mt-2.5 w-full cursor-pointer rounded-lg bg-celeste py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
                >
                  Contactar por WhatsApp
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

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13.5px]">
      <span className="text-texto-3">{etiqueta}</span>
      <b className="whitespace-nowrap">{valor}</b>
    </div>
  );
}
