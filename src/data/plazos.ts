/**
 * Plazos legales que le corren a una persona común.
 *
 * NO son un dato nuevo: cada uno sale del texto verificado de su guía en
 * `tramites.ts`, con el artículo que lo fija. Por eso cada entrada lleva su
 * `tramiteId` — la guía es la fuente y esto es el índice que la hace
 * calculable. `plazos.test.ts` comprueba que el artículo citado aparezca de
 * verdad en el texto de esa guía, que es lo que impide que diverjan (§4.7.13).
 *
 * Verificados el 2026-08-31 contra los PDF del CEDIJ (Poder Judicial):
 *   · Código del Trabajo (mayo 2018), arts. 864 y 865
 *   · Código de Familia (act. con reformas Ley de Adopciones), art. 240
 *
 * TODO(data): tabla `plazos_legales`, alimentada al indexar los códigos.
 */

export type UnidadPlazo = "dias-habiles" | "dias-calendario" | "meses" | "anios";

export interface PlazoLegal {
  id: string;
  /** El hecho desde el que corre, dicho como lo diría la persona. */
  hecho: string;
  /** Qué distingue este plazo de su vecino — se lee bajo el selector. */
  detalle: string;
  /** Cómo se llama la fecha que hay que pedirle. */
  etiquetaFecha: string;
  cantidad: number;
  unidad: UnidadPlazo;
  articulo: string;
  cuerpoLegal: string;
  /** La guía de la que sale el texto verificado. */
  tramiteId: string;
  /** Lo que no puede faltar junto al resultado. */
  advertencia: string;
}

export const PLAZOS_CIUDADANO: PlazoLegal[] = [
  {
    id: "despido-injustificado",
    hecho: "Me despidieron y quiero reclamar",
    detalle:
      "Los derechos y acciones para reclamar contra un despido injustificado prescriben en dos meses, contados desde que terminó el contrato.",
    etiquetaFecha: "Último día que trabajaste",
    cantidad: 2,
    unidad: "meses",
    articulo: "art. 864",
    cuerpoLegal: "Código del Trabajo",
    tramiteId: "despido-injustificado",
    advertencia:
      "Es la razón #1 por la que se pierden reclamos legítimos en Honduras. Reclamar en la Secretaría de Trabajo es gratis y no espera a que consigas abogado.",
  },
  {
    id: "despido-indirecto",
    hecho: "Renuncié por culpa de mi patrono",
    detalle:
      "Cuando eres tú quien da por terminado el contrato con justa causa (despido indirecto), el plazo es de un mes desde que el patrono dio el motivo.",
    etiquetaFecha: "Día en que el patrono dio el motivo",
    cantidad: 1,
    unidad: "meses",
    articulo: "art. 865",
    cuerpoLegal: "Código del Trabajo",
    tramiteId: "despido-injustificado",
    advertencia:
      "Es la mitad del plazo del despido normal. Si dudas de cuál es tu caso, pregunta antes de que corra: el reloj no se detiene mientras lo averiguas.",
  },
  {
    id: "divorcio-contencioso",
    hecho: "Quiero divorciarme por una causal",
    detalle:
      "El divorcio contencioso no puede entablarse después de un año desde que se tuvo conocimiento de la causa.",
    etiquetaFecha: "Día en que supiste de la causa",
    cantidad: 1,
    unidad: "anios",
    articulo: "art. 240",
    cuerpoLegal: "Código de Familia",
    tramiteId: "divorcio-ciudadano",
    advertencia:
      "Infidelidad, malos tratos, abandono y adicciones no caducan mientras los hechos persistan (numerales 1, 2, 4 y 6). Para las demás causales, el año sí corre.",
  },
];

export function getPlazo(id: string): PlazoLegal | undefined {
  return PLAZOS_CIUDADANO.find((p) => p.id === id);
}

/** "2 meses", "10 días hábiles" — una sola forma de decirlo en toda la UI. */
export function etiquetaPlazo(p: PlazoLegal): string {
  const uno = p.cantidad === 1;
  switch (p.unidad) {
    case "meses":
      return uno ? "1 mes" : `${p.cantidad} meses`;
    case "anios":
      return uno ? "1 año" : `${p.cantidad} años`;
    case "dias-habiles":
      return `${p.cantidad} ${uno ? "día hábil" : "días hábiles"}`;
    case "dias-calendario":
      return `${p.cantidad} ${uno ? "día" : "días"}`;
  }
}
