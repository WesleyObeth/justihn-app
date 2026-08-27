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
