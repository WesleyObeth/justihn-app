import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formato monetario hondureño. Un solo lugar decide cómo se ve un Lempira. */
export function fmtLempiras(n: number): string {
  return `L ${Math.round(n).toLocaleString("es-HN")}`;
}
