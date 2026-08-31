"use client";

/**
 * Calculadora de plazos del ciudadano.
 *
 * NO es la del abogado con otro nombre: la suya pide "días de plazo", que un
 * ciudadano no sabe. Aquí elige el HECHO que le pasó y el plazo lo pone la ley
 * — con su artículo, su advertencia y el enlace al PDF oficial. Los tres plazos
 * salen de guías ya verificadas (`data/plazos.ts`).
 */
import { useState } from "react";
import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import { PLAZOS_CIUDADANO, etiquetaPlazo, type PlazoLegal } from "@/data/plazos";
import { TRAMITES } from "@/data/tramites";
import { calcularVencimientoPorUnidad, diasHasta } from "@/lib/plazos";
import { useHoy } from "@/hooks/use-saludo";
import { cn } from "@/lib/utils";

export function CalculadoraPlazos() {
  const [plazoId, setPlazoId] = useState(PLAZOS_CIUDADANO[0].id);
  const [fecha, setFecha] = useState("");
  // "Hoy" llega tras el mount: el servidor no conoce la zona del visitante (§4.5).
  const hoy = useHoy();

  const plazo = PLAZOS_CIUDADANO.find((p) => p.id === plazoId)!;
  const vencimiento = fecha
    ? calcularVencimientoPorUnidad(fecha, plazo.cantidad, plazo.unidad)
    : null;

  return (
    <div className="rounded-2xl border border-borde bg-white p-6">
      <h2 className="font-display text-[17px] font-bold">¿Cuánto tiempo tengo?</h2>
      <p className="mt-1 text-[12.5px] text-texto-3">
        Muchos reclamos legítimos se pierden por dejar pasar el plazo. Elige qué te pasó y desde
        cuándo.
      </p>

      <fieldset className="mt-4">
        <legend className="text-[12.5px] text-texto-3">¿Qué te pasó?</legend>
        <div className="mt-2 flex flex-col gap-2">
          {PLAZOS_CIUDADANO.map((p) => (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                p.id === plazoId ? "border-celeste bg-chip" : "border-borde hover:border-celeste",
              )}
            >
              <input
                type="radio"
                name="plazo"
                value={p.id}
                checked={p.id === plazoId}
                onChange={() => setPlazoId(p.id)}
                className="mt-[3px] accent-[var(--color-celeste)]"
              />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-marino">{p.hecho}</span>
                <span className="mt-0.5 block text-[12px] leading-[1.5] text-texto-3">
                  {etiquetaPlazo(p)} · {p.cuerpoLegal}, {p.articulo}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 flex flex-col gap-1.5 text-[12.5px] text-texto-3">
        {plazo.etiquetaFecha}
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="h-[42px] rounded-lg border border-borde px-3 text-sm text-marino outline-none focus:border-celeste"
        />
      </label>

      {vencimiento && hoy ? (
        <Resultado plazo={plazo} vencimiento={vencimiento} restantes={diasHasta(vencimiento, hoy)} />
      ) : (
        <div className="mt-4 rounded-[10px] bg-lienzo p-4 text-center text-[12.5px] text-texto-4">
          Elige la fecha y te decimos hasta cuándo tienes.
        </div>
      )}
    </div>
  );
}

function Resultado({
  plazo,
  vencimiento,
  restantes,
}: {
  plazo: PlazoLegal;
  vencimiento: Date;
  restantes: number;
}) {
  const guia = TRAMITES.find((t) => t.id === plazo.tramiteId)!;
  const vencido = restantes < 0;
  const urgente = !vencido && restantes <= 15;

  const fechaLarga = vencimiento.toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "mt-4 rounded-[10px] border-l-[3px] px-4 py-3.5",
        vencido
          ? "border-urgente bg-[rgba(214,69,56,.06)]"
          : urgente
            ? "border-dorado bg-[rgba(201,154,58,.08)]"
            : "border-celeste bg-lienzo",
      )}
    >
      <div className="text-[10.5px] font-semibold tracking-[1.2px] uppercase">
        {vencido ? (
          <span className="text-urgente">El plazo ya venció</span>
        ) : (
          <span className="text-celeste">Tienes hasta el</span>
        )}
      </div>
      <div className="font-display mt-0.5 text-[17px] font-bold text-marino">
        {fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1)}
      </div>
      <p className="mt-1 text-[12.5px] text-texto-2">
        {vencido
          ? `Venció hace ${Math.abs(restantes)} ${Math.abs(restantes) === 1 ? "día" : "días"}. Aun así, consulta: hay excepciones y otros reclamos que sí siguen abiertos.`
          : restantes === 0
            ? "Vence hoy — es el último día."
            : `Te ${restantes === 1 ? "queda 1 día" : `quedan ${restantes} días`}.`}
      </p>

      <p className="mt-2.5 text-[11.5px] leading-[1.6] text-texto-3">{plazo.advertencia}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
        <Link href={`/personas/tramites/${guia.id}`} className="font-medium">
          Ver la guía: {guia.nombre} →
        </Link>
        <a
          href={guia.fuenteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-texto-3 hover:text-celeste"
        >
          <Icono nombre="check" size={11} strokeWidth={2.6} />
          {plazo.cuerpoLegal}, {plazo.articulo} — texto oficial
        </a>
      </div>
    </div>
  );
}
