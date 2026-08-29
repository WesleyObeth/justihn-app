"use client";

import { usePortal } from "@/store/portal";

/** Mi plan (persona): Gratis activo + el plan de pago en definición (socio). */
export function PlanPersona() {
  const mostrarToast = usePortal((s) => s.mostrarToast);

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[24px] font-bold">Mi plan</h1>
      <p className="mt-1 text-[13px] text-texto-3">
        Lo esencial es gratis para siempre. El plan de pago está en definición.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-celeste bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[1px] text-celeste uppercase">
              Gratis
            </span>
            <span className="rounded-full bg-chip px-2.5 py-[3px] text-[10.5px] font-bold text-celeste">
              TU PLAN
            </span>
          </div>
          <div className="font-display mt-1.5 text-[28px] font-bold">L0</div>
          <ul className="mt-3.5 flex flex-col gap-2 text-[13.5px]">
            {[
              "Todas las guías de trámites, con tu avance guardado",
              "Consultorio: pregunta gratis a abogados colegiados",
              "Directorio de abogados por materia",
              "Calculadora de prestaciones laborales",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-celeste">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-borde bg-white/70 p-6">
          <span className="text-xs font-semibold tracking-[1px] text-dorado uppercase">
            Plan de pago — en definición
          </span>
          <div className="font-display mt-1.5 text-[28px] font-bold text-texto-3">
            Próximamente
          </div>
          <p className="mt-3.5 text-[13.5px] leading-[1.65] text-texto-3">
            Lo estamos definiendo con el gremio: verificaciones de personas y propiedades,
            alertas sobre tu nombre y más herramientas de protección. Lo gratuito seguirá
            siendo gratuito.
          </p>
          <button
            type="button"
            onClick={() => mostrarToast("Te avisaremos cuando el plan de pago esté disponible")}
            className="mt-4 cursor-pointer rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[13px] font-medium text-marino hover:border-celeste"
          >
            Avisarme cuando esté
          </button>
        </div>
      </div>

      <p className="mt-5 max-w-[640px] text-[12px] leading-[1.6] text-texto-4">
        Tienes derecho a acceder, revisar y pedir la supresión de tus datos personales (habeas
        data, art. 182 de la Constitución) — solicítalo desde aquí y respondemos en 72 horas
        hábiles.
      </p>
    </div>
  );
}
