"use client";

import { useAhora } from "@/hooks/use-saludo";
import { fechaCorta, fechaLarga, formatearRelativo } from "@/lib/tiempo";

/**
 * «hace 2 h» / «ayer» / «21 ago» a partir de un timestamp real.
 *
 * El servidor no conoce el reloj del visitante, así que sirve la fecha corta
 * —determinista— y el cliente la cambia por el relativo tras el mount
 * (`useAhora`, mismo patrón que el saludo por hora). El `<time>` lleva el
 * ISO y el `title` la fecha completa: el relativo es cómodo, pero un abogado
 * que copia un dato necesita el día y la hora exactos.
 */
export function Cuando({ iso, className }: { iso: string; className?: string }) {
  const ahora = useAhora();
  const texto = ahora ? formatearRelativo(iso, ahora) : fechaCorta(iso, new Date(iso));
  return (
    <time dateTime={iso} title={fechaLarga(iso)} className={className}>
      {texto}
    </time>
  );
}
