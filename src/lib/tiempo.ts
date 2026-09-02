/**
 * Tiempo relativo — «hace 2 h», «ayer», «21 ago» — calculado AL PINTAR a
 * partir de un timestamp real.
 *
 * Hasta el 2026-09-02 los seeds guardaban el texto de pantalla («hace 2 h»)
 * en el propio dato, y Notificaciones agrupaba por `startsWith("hace")`. Una
 * tabla guarda `creado_en`; el «hace 2 h» es una VISTA de ese dato y cambia
 * con el reloj. Este módulo es el único sitio que sabe convertir lo uno en lo
 * otro (§4 del CLAUDE.md: un solo lugar por dato).
 *
 * Es puro a propósito: recibe `ahora` en vez de leer `Date.now()`, así que
 * los tests son deterministas y el servidor nunca lo llama con un reloj que
 * no coincide con el del visitante (§4.5). El reloj lo pone `useAhora()`.
 */

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Medianoche local del día de `fecha`. */
function medianoche(fecha: Date): number {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
}

/** «21 ago», o «21 ago 2025» si no es el año en curso. */
export function fechaCorta(iso: string, ahora: Date): string {
  const f = new Date(iso);
  const base = `${f.getDate()} ${MESES[f.getMonth()]}`;
  return f.getFullYear() === ahora.getFullYear() ? base : `${base} ${f.getFullYear()}`;
}

/**
 * Cuánto hace. Los tramos siguen lo que la gente dice, no una escala
 * uniforme: minutos y horas mientras sea hoy, «ayer» por nombre, días hasta
 * la semana, y a partir de ahí la fecha — «hace 23 días» obliga a calcular
 * y una fecha se lee de un vistazo.
 */
export function formatearRelativo(iso: string, ahora: Date): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  const delta = ahora.getTime() - fecha.getTime();

  // Un reloj adelantado en el cliente (o un dato futuro) no debe decir «hace -3 min».
  if (delta < MINUTO) return "hace un momento";
  if (delta < HORA) return `hace ${Math.floor(delta / MINUTO)} min`;

  const diasDeDiferencia = Math.round((medianoche(ahora) - medianoche(fecha)) / DIA);
  if (diasDeDiferencia === 0) return `hace ${Math.floor(delta / HORA)} h`;
  if (diasDeDiferencia === 1) return "ayer";
  if (diasDeDiferencia < 7) return `hace ${diasDeDiferencia} días`;
  return fechaCorta(iso, ahora);
}

export type GrupoRecencia = "hoy" | "ayer" | "anteriores";

/** Para agrupar listas por recencia — Notificaciones lo usa como cabeceras. */
export function grupoRecencia(iso: string, ahora: Date): GrupoRecencia {
  const dias = Math.round((medianoche(ahora) - medianoche(new Date(iso))) / DIA);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  return "anteriores";
}

/** Fecha completa para el `title`/lector de pantalla: «2 sep 2026, 09:20». */
export function fechaLarga(iso: string): string {
  const f = new Date(iso);
  const hh = String(f.getHours()).padStart(2, "0");
  const mm = String(f.getMinutes()).padStart(2, "0");
  return `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}, ${hh}:${mm}`;
}
