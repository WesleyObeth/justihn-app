/**
 * Lo PURO de un artículo de código — sin `process.env` ni fetch — para que la
 * pantalla de Legislación y sus tests lo importen sin arrastrar Supabase ni
 * OpenAI al bundle del navegador (mismo reparto que `catalogo.ts`).
 */

/** Un artículo del corpus de legislación, tal como lo consume la UI. */
export interface ArticuloCorpus {
  /** `articulos.id`. */
  id: number;
  codigoId: string;
  codigoNombre: string;
  /** «120», «120-A». */
  numero: string;
  /** Posición en el código; `null` cuando la fila viene del RPC semántico. */
  orden: number | null;
  /** Página del PDF oficial donde empieza. */
  pagina: number | null;
  /**
   * Rúbrica del artículo («Ámbito del proceso ordinario»). Solo el CPC las
   * trae; en el Trabajo y Familia es `null` y la card enseña el número solo.
   */
  rubrica: string | null;
  /** El texto oficial, sin la cabecera «Artículo N.» ni la rúbrica. */
  cuerpo: string;
  /** El PDF oficial abierto en su página (`#page=N`). */
  fuenteUrl: string;
  /** Solo en el modo por significado. */
  similitud?: number;
}

export const POR_PAGINA_ARTICULOS = 20;
/** Tope del modo semántico: es lo que admite el RPC `buscar_legislacion`. */
export const LIMITE_SEMANTICO_ARTICULOS = 12;

const CABECERA = /^Art[íi]culo\s+(\d{1,4}(?:\s*-\s*[A-Za-z])?)\s*\.?\s*(?:-\s*)?/;
/**
 * La rúbrica del CPC va en MAYÚSCULAS tras la cabecera y termina en punto o
 * dos puntos; a veces con la nota al pie pegada («ABREVIADO.1») y a veces con
 * un espacio antes del punto («OBJETO .»). Se exige que no haya minúsculas:
 * «Artículo 24. Las personas civilmente capaces…» no es una rúbrica.
 */
const RUBRICA = /^([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 ,;'()/-]{2,140}?)\s*[.:]\s*\d{0,2}(?=\s|$)/;

/**
 * Parte el texto de la base en número, rúbrica y cuerpo. Medido sobre 400
 * artículos del CPC: 363 traen rúbrica; los del Trabajo y Familia, ninguno.
 */
export function parsearArticulo(texto: string): {
  numero: string | null;
  rubrica: string | null;
  cuerpo: string;
} {
  const limpio = texto.replace(/\r/g, "").trim();
  const cab = limpio.match(CABECERA);
  if (!cab) return { numero: null, rubrica: null, cuerpo: limpio };

  const numero = cab[1]!.replace(/\s+/g, "").toUpperCase();
  let resto = limpio.slice(cab[0].length);
  let rubrica: string | null = null;

  const rub = resto.match(RUBRICA);
  if (rub && !/[a-záéíóúüñ]/.test(rub[1]!)) {
    rubrica = frase(rub[1]!);
    resto = resto.slice(rub[0].length);
  }
  return { numero, rubrica, cuerpo: resto.trim() };
}

/** «ÁMBITO DEL PROCESO ORDINARIO» → «Ámbito del proceso ordinario». */
function frase(mayusculas: string): string {
  const s = mayusculas.replace(/\s+/g, " ").replace(/\s+([,;.)])/g, "$1").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * ¿La búsqueda es un número de artículo? Acepta «120», «120-A», «art 120»,
 * «artículo 120-a», «Art. 676.». Devuelve el número normalizado o `null`.
 */
export function pareceNumeroArticulo(q: string): string | null {
  const m = q
    .trim()
    .match(/^(?:art(?:[íi]culo)?s?\.?\s*)?(\d{1,4})(?:\s*-\s*([a-zA-Z]))?\.?$/i);
  if (!m) return null;
  return m[2] ? `${m[1]}-${m[2]!.toUpperCase()}` : m[1]!;
}

/** Párrafos del cuerpo, para pintarlo con aire: el PDF separa con línea vacía. */
export function parrafosDe(cuerpo: string): string[] {
  return cuerpo
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}
