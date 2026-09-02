"use client";

import { getFirmante, type Firmante } from "@/data/directorio";
import { cn } from "@/lib/utils";

/**
 * Quién firma una respuesta del consultorio: avatar, nombre y su credencial
 * (colegiación si la publica; si no, ciudad y años de ejercicio).
 *
 * Un solo componente para las cuatro vitrinas del ciudadano. Antes cada una
 * tenía el bloque copiado con `ABOGADA_DEMO` escrito a mano, así que una
 * respuesta de OTRO abogado habría salido firmada por ella. Sin autor
 * identificable no se pinta (§4.5): devuelve `null`.
 */
export function FirmaRespuesta({
  abogadoId,
  tamano = "md",
  className,
}: {
  abogadoId: string;
  tamano?: "sm" | "md";
  className?: string;
}) {
  const firmante = getFirmante(abogadoId);
  if (!firmante) return null;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "font-display grid shrink-0 place-items-center rounded-full bg-celeste font-semibold text-white",
          tamano === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-[12px]",
        )}
      >
        {firmante.iniciales}
      </span>
      <span className="min-w-0">
        <span className={cn("block font-semibold", tamano === "sm" ? "text-[12.5px]" : "text-[13.5px]")}>
          {firmante.nombre}
        </span>
        <span className={cn("block text-texto-4", tamano === "sm" ? "text-[11px]" : "text-[11.5px]")}>
          {credencial(firmante)}
        </span>
      </span>
    </div>
  );
}

/** Colegiación si la publica; si no, lo verificable: ciudad y años de ejercicio. */
export function credencial(f: Firmante): string {
  return f.colegiacion ?? `${f.ciudad}${f.anios ? ` · ${f.anios} años` : ""}`;
}
