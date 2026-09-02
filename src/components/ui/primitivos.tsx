"use client";

/**
 * Primitivos de interfaz del portal (patrón shadcn/ui: copiados aquí y 100%
 * personalizables). Los valores salen de `marca-tipografia-colores.md` y del
 * prototipo hifi — radios 12/8/20, sombras y hovers definidos por la marca.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { Icono, type NombreIcono } from "@/components/brand/iconos";

// ── Botón ──────────────────────────────────────────────────────────────────

type VarianteBoton = "marino" | "celeste" | "suave" | "dorado" | "chip";

const VARIANTES: Record<VarianteBoton, string> = {
  marino: "bg-marino text-white border-transparent hover:bg-celeste font-semibold",
  celeste: "bg-celeste text-white border-transparent hover:bg-cruce font-semibold",
  suave: "bg-lienzo text-marino border-borde hover:border-celeste hover:text-celeste",
  dorado: "bg-dorado text-[#3a2c0d] border-transparent hover:bg-[#d0a748] font-bold",
  chip: "bg-white text-celeste border-chip-borde hover:bg-chip font-medium rounded-full",
};

export interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  icono?: NombreIcono;
}

export function Boton({
  variante = "suave",
  icono,
  className,
  children,
  type = "button",
  ...props
}: BotonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste",
        "disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTES[variante],
        className,
      )}
      {...props}
    >
      {icono && <Icono nombre={icono} size={14} />}
      {children}
    </button>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

export function Card({
  className,
  interactiva,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactiva?: boolean }) {
  /**
   * Tratamiento «Papel» (decisión Wesley 2026-09-02, prototipo con 4
   * variantes: Actual · Vidrio · Papel · Trazo): sin borde visible, radio 16 y
   * sombra tonal marina en dos capas — sobre el lienzo Cielo el borde gris de
   * 1px se perdía y las cards no se separaban del fondo. El borde se conserva
   * transparente para que nada se mueva un píxel respecto a la versión
   * anterior. La interactiva se levanta 1px al pasar el mouse. Revertir = este
   * bloque y los dos tokens `--shadow-papel*` de globals.css.
   */
  return (
    <div
      className={cn(
        "rounded-2xl border border-transparent bg-white shadow-papel",
        interactiva &&
          "cursor-pointer transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-papel-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste",
        className,
      )}
      {...props}
    />
  );
}

/** Card con degradado marino — digest, plan y soporte. */
export function CardMarino({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl text-[#e8eef6]", className)}
      style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
      {...props}
    />
  );
}

// ── Chips ──────────────────────────────────────────────────────────────────

export function ChipMateria({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-chip px-[9px] py-[3px] text-[11px] font-semibold text-celeste">
      {children}
    </span>
  );
}

export function Meta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-[11px] text-texto-4", className)}>{children}</span>;
}

/** Etiqueta de sección en versalitas — "TU BRIEF DE HOY", "DIGEST SEMANAL". */
export function Rotulo({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[1.4px] text-texto-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Encabezados ────────────────────────────────────────────────────────────

export function TituloSeccion({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag className={cn("font-display text-[15px] font-semibold text-marino", className)}>
      {children}
    </Tag>
  );
}

// ── Toggle pill ────────────────────────────────────────────────────────────

export function TogglePill({
  activo,
  onToggle,
  etiqueta,
}: {
  activo: boolean;
  onToggle: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={onToggle}
      className={cn(
        "box-border h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full border-0 p-[3px] transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste",
        activo ? "bg-celeste" : "bg-[#c9d5e4]",
      )}
    >
      <span
        className="block h-4 w-4 rounded-full bg-white transition-transform"
        style={{ transform: `translateX(${activo ? 16 : 0}px)` }}
      />
    </button>
  );
}

/** Píldora de materia suscribible (Alertas de Gaceta). */
export function PillMateria({
  nombre,
  activa,
  onToggle,
  className,
}: {
  nombre: string;
  activa: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onToggle}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-[7px] text-[12.5px] font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste",
        activa
          ? "border-celeste bg-celeste text-white"
          : "border-borde bg-white text-texto-3 hover:border-celeste",
        className,
      )}
    >
      {nombre}
    </button>
  );
}

// ── Avisos ─────────────────────────────────────────────────────────────────

export function AvisoDorado({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[10px] border border-aviso-borde bg-aviso px-4 py-3.5",
        className,
      )}
    >
      <span className="mt-px grid place-items-center text-aviso-texto">
        <Icono nombre="alerta" size={14} />
      </span>
      <div className="text-[13px] leading-[1.55] text-aviso-cuerpo">{children}</div>
    </div>
  );
}

/** Enlace a fuente oficial — el diferencial del producto va siempre visible. */
export function EnlaceFuente({
  children,
  onClick,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const contenido = (
    <>
      <Icono nombre="libro" size={11} strokeWidth={2} className="shrink-0" />
      {children}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 inline-flex items-center gap-[5px] text-[12px]"
      >
        {contenido}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1.5 inline-flex cursor-pointer items-center gap-[5px] text-[12px] text-celeste hover:text-marino"
    >
      {contenido}
    </button>
  );
}

// ── Volver ─────────────────────────────────────────────────────────────────

export function BotonVolver({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3.5 inline-flex cursor-pointer items-center gap-[7px] text-[13px] text-celeste hover:text-marino"
    >
      <Icono nombre="atras" size={14} strokeWidth={2} />
      {children}
    </button>
  );
}
