/**
 * Documento Nacional de Identificación de Honduras (DNI).
 *
 * Son 13 dígitos que se escriben `0801-1990-12345`, y cada bloque significa
 * algo: los dos primeros son el departamento de inscripción, los dos
 * siguientes el municipio, después el año de nacimiento y al final un
 * correlativo. Eso permite cazar el error de tecleo más común —una cifra de
 * más o de menos— sin inventarse reglas que el RNP no tiene publicadas.
 *
 * ⚠️ El departamento del DNI es donde la persona está INSCRITA, no donde
 * ejerce. No se contrasta con el departamento que eligió en el formulario: un
 * abogado nacido en Copán que litiga en Tegucigalpa es lo normal, no un error.
 *
 * Puro y con el año como parámetro: los tests no dependen del reloj (§4.5).
 */

/** Los 18 departamentos van del 01 al 18. */
const DEPARTAMENTO_MAX = 18;

/** Edad mínima plausible para un profesional colegiado. */
const EDAD_MINIMA = 18;

/** Solo los dígitos, que es como se guarda en la base. */
export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 13);
}

/**
 * Máscara mientras se escribe: `0801199012345` se ve `0801-1990-12345`. Se
 * aplica en cada tecla, así que también arregla lo que se pega con guiones,
 * espacios o puntos.
 */
export function formatearIdentidad(valor: string): string {
  const d = soloDigitos(valor);
  return [d.slice(0, 4), d.slice(4, 8), d.slice(8, 13)].filter(Boolean).join("-");
}

/** `0801199012345` → `0801-1990-12345`, para mostrar lo que viene de la base. */
export function mostrarIdentidad(guardado: string): string {
  return formatearIdentidad(guardado);
}

/**
 * Devuelve el mensaje de error, o `null` si el número es plausible. Devolver
 * el texto y no un booleano mantiene el porqué junto a la regla: si un día se
 * afina el criterio, el mensaje se afina con él.
 */
export function validarIdentidad(
  valor: string,
  anioActual = new Date().getFullYear(),
): string | null {
  const d = soloDigitos(valor);
  if (d.length !== 13) return "El número de identidad son 13 dígitos, como 0801-1990-12345.";

  const departamento = Number(d.slice(0, 2));
  if (departamento < 1 || departamento > DEPARTAMENTO_MAX) {
    return "Los dos primeros dígitos son el departamento, del 01 al 18.";
  }

  const municipio = Number(d.slice(2, 4));
  if (municipio < 1) return "Los dígitos 3 y 4 son el municipio y no pueden ser 00.";

  const anio = Number(d.slice(4, 8));
  if (anio < 1900 || anio > anioActual - EDAD_MINIMA) {
    return "Los dígitos 5 al 8 son tu año de nacimiento. Revísalos.";
  }

  return null;
}
