/**
 * Cálculo orientativo de vencimiento de plazos procesales.
 *
 * Módulo canónico (§0.5): la calculadora de la UI y Jus IA deben dar la misma
 * fecha. Convención: el plazo corre desde el día siguiente a la notificación;
 * en días hábiles se saltan sábados y domingos.
 *
 * ⚠️ NO descuenta feriados judiciales ni asuetos — la UI lo advierte siempre.
 * TODO(data): tabla de feriados judiciales por año (fuente: acuerdos de la CSJ).
 */
export function calcularVencimiento(
  fechaNotificacionIso: string,
  dias: number,
  habiles: boolean,
): Date | null {
  const inicio = new Date(`${fechaNotificacionIso}T00:00:00`);
  if (Number.isNaN(inicio.getTime())) return null;
  if (!Number.isFinite(dias) || dias <= 0 || dias > 365) return null;

  const fecha = new Date(inicio);
  let restantes = Math.floor(dias);
  while (restantes > 0) {
    fecha.setDate(fecha.getDate() + 1);
    const dia = fecha.getDay();
    if (!habiles || (dia !== 0 && dia !== 6)) restantes -= 1;
  }
  return fecha;
}

/**
 * Vencimiento de un plazo legal expresado en meses o años (los del ciudadano:
 * "dos meses desde que terminó el contrato"). Vive aquí, junto al de días, para
 * que no haya dos módulos calculando fechas (§4.4).
 *
 * Convención de plazos por meses/años: se cuenta de fecha a fecha. Si el mes de
 * destino no tiene ese día —del 31 de enero, dos meses— se toma el último día
 * de ese mes, que es lo que evita saltar al mes siguiente y REGALAR días que la
 * ley no da.
 */
export function calcularVencimientoPorUnidad(
  fechaIso: string,
  cantidad: number,
  unidad: "dias-habiles" | "dias-calendario" | "meses" | "anios",
): Date | null {
  if (unidad === "dias-habiles" || unidad === "dias-calendario") {
    return calcularVencimiento(fechaIso, cantidad, unidad === "dias-habiles");
  }

  const inicio = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(inicio.getTime())) return null;
  if (!Number.isFinite(cantidad) || cantidad <= 0 || cantidad > 120) return null;

  const meses = unidad === "anios" ? Math.floor(cantidad) * 12 : Math.floor(cantidad);
  const dia = inicio.getDate();
  const fecha = new Date(inicio);
  fecha.setDate(1); // primero el mes, o el 31 desbordaría al mes siguiente
  fecha.setMonth(fecha.getMonth() + meses);
  const ultimoDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
  fecha.setDate(Math.min(dia, ultimoDelMes));
  return fecha;
}

/** Días que faltan (negativo = ya venció). Se compara a medianoche. */
export function diasHasta(vencimiento: Date, hoy: Date): number {
  const a = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());
  const b = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}
