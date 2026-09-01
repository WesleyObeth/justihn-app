import type { RespuestaIA } from "./tipos";

/**
 * Lo que Jus IA responde cuando el corpus no respalda la consulta.
 *
 * Vive en un solo sitio porque **es la promesa del producto puesta en palabras**
 * (§4.1: "sin fuente no hay respuesta"). Con una copia por motor, un día dirían
 * cosas distintas y la que se lea peor será la que vea el abogado.
 */
export const SIN_FUENTES: RespuestaIA = {
  text: "No encontré fuentes oficiales que respalden una respuesta a esa consulta. Prefiero decírtelo a darte un artículo que no pueda enlazarte. Puedes reformularla o buscar directamente en jurisprudencia.",
  meta: "Sin costo",
  gratuita: true,
};
