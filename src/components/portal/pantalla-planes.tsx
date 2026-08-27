"use client";

import { useState } from "react";
import { usePortal } from "@/store/portal";
import { OFERTA, PLANES } from "@/data/catalogo";
import { cn, fmtLempiras } from "@/lib/utils";
import type { Plan } from "@/types/dominio";

type Ciclo = "mensual" | "anual";

/**
 * Comparativa de planes. El titular dice la tesis del modelo: todo el corpus
 * está en todos los planes; lo que escala es la cuota de IA. El pago anual
 * (−33%) es la táctica del modelo de negocio que además esquiva el cobro
 * recurrente sin BAC — por eso el toggle es parte de la demo, no un adorno.
 */
export function PantallaPlanes() {
  const planActual = usePortal((s) => s.plan);
  const cicloActual = usePortal((s) => s.cicloPlan);
  const setPlan = usePortal((s) => s.setPlan);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [ciclo, setCiclo] = useState<Ciclo>("mensual");

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl font-bold">
          Todo el corpus para todos — la diferencia es la IA
        </h2>
        <p className="mt-1.5 text-[13.5px] text-texto-3">
          Primer mes a {OFERTA.anclaPrimerMes} · pago anual {OFERTA.descuentoAnual}
        </p>

        <div
          role="radiogroup"
          aria-label="Ciclo de pago"
          className="mt-4 inline-flex rounded-full border border-borde bg-white p-1"
        >
          <BotonCiclo activo={ciclo === "mensual"} onClick={() => setCiclo("mensual")}>
            Mensual
          </BotonCiclo>
          <BotonCiclo activo={ciclo === "anual"} onClick={() => setCiclo("anual")}>
            Anual {OFERTA.descuentoAnual}
          </BotonCiclo>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
        {PLANES.map((plan) => (
          <TarjetaPlan
            key={plan.id}
            plan={plan}
            ciclo={ciclo}
            planActual={planActual}
            cicloActual={cicloActual}
            onElegir={() => {
              const mismoPlan = plan.id === planActual;
              if (plan.id === "gratis" || (mismoPlan && ciclo === cicloActual)) return;
              // TODO(pagos): aquí entra el checkout. El cobro recurrente B2C
              // topa con el mismo cuello de BAC que Sonriprev — el pago anual
              // único es la vía que esquiva ese bloqueo.
              setPlan(plan.id, ciclo);
              mostrarToast(
                mismoPlan
                  ? `Plan ${plan.nombre} ahora con pago ${ciclo} — demo sin cobro real`
                  : `Plan ${plan.nombre} ${ciclo === "anual" ? "anual " : ""}activado — demo sin cobro real`,
              );
            }}
          />
        ))}
      </div>
    </>
  );
}

function BotonCiclo({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activo}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full px-4 py-[7px] text-[12.5px] font-semibold transition-colors",
        activo ? "bg-marino text-white" : "text-texto-3 hover:text-marino",
      )}
    >
      {children}
    </button>
  );
}

function TarjetaPlan({
  plan,
  ciclo,
  planActual,
  cicloActual,
  onElegir,
}: {
  plan: Plan;
  ciclo: Ciclo;
  planActual: string;
  cicloActual: Ciclo;
  onElegir: () => void;
}) {
  const anual = ciclo === "anual";
  const precio = anual ? plan.precioAnualEtiqueta : plan.precioEtiqueta;
  const periodo = anual ? plan.periodoAnual : plan.periodo;
  const ahorro = plan.precioLempiras * 12 - plan.precioAnualLempiras;

  // "Actual" exige plan Y ciclo: estando en Base mensual, la card Base con el
  // toggle en anual ofrece el cambio de ciclo (la táctica del modelo, §2).
  const mismoPlan = plan.id === planActual;
  const esActual = mismoPlan && (plan.id === "gratis" || ciclo === cicloActual);
  const cambioDeCiclo = mismoPlan && !esActual && plan.id !== "gratis";

  const etiquetaCta = esActual
    ? "Plan actual"
    : plan.id === "gratis"
      ? "Tu punto de partida"
      : cambioDeCiclo
        ? anual
          ? `Pasar a anual — ahorras ${fmtLempiras(ahorro)}`
          : "Volver al pago mensual"
        : anual
          ? `Cambiar a ${plan.nombre} anual — ${OFERTA.descuentoAnual}`
          : `Cambiar a ${plan.nombre} — 1er mes ${OFERTA.anclaPrimerMes}`;

  const inerte = esActual || plan.id === "gratis";

  return (
    <div
      className={cn(
        "flex flex-col rounded-[14px] bg-white p-6",
        plan.destacado && !esActual
          ? "border-2 border-celeste shadow-[0_8px_24px_rgba(21,132,199,.15)]"
          : "border border-borde",
      )}
    >
      <div
        className="text-xs font-semibold tracking-[1px] uppercase"
        style={{ color: plan.colorEtiqueta }}
      >
        {plan.nombre}
        {mismoPlan && plan.id !== "gratis" && ` — tu plan (${cicloActual})`}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="font-display text-[30px] font-bold">{precio}</span>
        <span className="text-[12.5px] opacity-70">{periodo}</span>
      </div>
      <div className="min-h-[17px] text-[11.5px] text-exito">
        {anual && ahorro > 0 && `Pagas 8 meses — ahorras ${fmtLempiras(ahorro)} al año`}
      </div>

      <ul className="mt-3 flex flex-1 flex-col gap-[9px]">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-[13px] leading-[1.45]">
            <span className="text-celeste">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onElegir}
        disabled={inerte}
        className={cn(
          "mt-4.5 rounded-lg px-4 py-[11px] text-[13px]",
          inerte
            ? esActual
              ? "cursor-default border border-chip-borde bg-chip font-semibold text-celeste"
              : "cursor-default border border-borde bg-lienzo text-texto-3"
            : "cursor-pointer border-none bg-marino font-semibold text-white hover:bg-celeste",
        )}
      >
        {etiquetaCta}
      </button>
    </div>
  );
}
