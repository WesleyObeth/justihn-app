"use client";

/**
 * Botón canónico de "Preguntar a Jus IA": gradiente celeste vivo + símbolo de
 * la marca. Único lugar que define cómo se ve la acción de IA en el portal —
 * lo usan detalle de sentencia/publicación, calculadoras, paso a paso y el
 * Dashboard.
 */
import { SimboloJusIALinear } from "@/components/brand/logos";
import { cn } from "@/lib/utils";

export function BotonJusIA({
  children,
  onClick,
  compacto,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  compacto?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "boton-jus-ia inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none font-semibold text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste",
        compacto ? "px-3.5 py-2 text-[12.5px]" : "px-4 py-2.5 text-[13px]",
        className,
      )}
    >
      <SimboloJusIALinear size={compacto ? 13 : 14} />
      {children}
    </button>
  );
}
