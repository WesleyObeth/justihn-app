import type { Codigo } from "@/types/dominio";

/**
 * Catálogo de códigos — contrato de la tabla `codigos` (cargada el
 * 2026-09-01: Trabajo 875 · Familia 357 · Procesal Civil 930 artículos, con
 * la página del PDF oficial en cada uno).
 *
 * Los ids son LOS DE LA TABLA (`automatizaciones/legislacion/articulos.mjs`
 * es quien los define): el seed viejo llamaba «cpc» al Procesal Civil y la
 * pantalla habría preguntado por un código que no existe. `ALIAS_CODIGO`
 * resuelve los enlaces viejos.
 *
 * Los `destacados` no son una muestra del texto —el texto está entero en la
 * base— sino los artículos que OTRA pantalla del producto ya aplica
 * (calculadoras, plazos, Mis casos), verificados contra el PDF al construir
 * esa pantalla. Cada uno enlaza su artículo real y su herramienta.
 *
 * ⚠️ Corrección del 2026-09-03: el seed anterior decía que el art. 399 del
 * CPC era el proceso abreviado y el 400 el ordinario. El PDF oficial dice lo
 * contrario — 399 «ÁMBITO DEL PROCESO ORDINARIO», 400 «ÁMBITO DEL PROCESO
 * ABREVIADO» (reformado por Decreto 21-2015). Leer el artículo antes de
 * resumirlo: por eso ahora la pantalla enseña el texto y no una síntesis.
 */
const CEDIJ = "https://www.poderjudicial.gob.hn/Cedij/Cdigos/";

export const CODIGOS: Codigo[] = [
  {
    id: "codigo-trabajo",
    nombre: "Código del Trabajo",
    decreto: "Decreto 189-1959 (ed. consolidada mayo 2018)",
    materia: "Laboral",
    estado: "cargado",
    fuenteUrl: `${CEDIJ}Codigo%20del%20Trabajo%20(mayo%202018).pdf`,
    descripcion:
      "Contrato, preaviso, cesantía, vacaciones y prescripción — el sustento de la calculadora de prestaciones y de los procesos de despido.",
    destacados: [
      {
        numero: "116",
        titulo: "Preaviso",
        nota: "De 24 horas a 2 meses según la antigüedad del trabajador.",
        herramienta: { etiqueta: "Calcular prestaciones", href: "/abogados/calculadoras" },
      },
      {
        numero: "120",
        titulo: "Auxilio de cesantía",
        nota: "10 días · 20 días · 1 mes por año; tope de 25 meses (15 en microempresa, art. 120-A).",
        herramienta: { etiqueta: "Calcular prestaciones", href: "/abogados/calculadoras" },
      },
      {
        numero: "346",
        titulo: "Vacaciones remuneradas",
        nota: "10, 12, 15 y 20 días laborables según los años de servicio.",
        herramienta: { etiqueta: "Calcular prestaciones", href: "/abogados/calculadoras" },
      },
      {
        numero: "864",
        titulo: "Prescripción del reclamo por despido",
        nota: "2 meses desde el despido injustificado o la corrección disciplinaria.",
        herramienta: { etiqueta: "Calcular el plazo", href: "/abogados/calculadoras" },
      },
      {
        numero: "865",
        titulo: "Prescripción del despido indirecto",
        nota: "1 mes desde que el patrono dio motivo para la separación.",
      },
    ],
  },
  {
    id: "codigo-familia",
    nombre: "Código de Familia",
    decreto: "Decreto 76-84 (con reformas de la Ley de Adopciones)",
    materia: "Familia",
    estado: "cargado",
    fuenteUrl: `${CEDIJ}Codigo%20de%20Familia%20(Actualizado%20con%20Reformas%20Ley%20de%20Adopciones).pdf`,
    descripcion:
      "Matrimonio, divorcio, alimentos, guarda y patria potestad — la base del expediente notarial y del paso a paso de familia.",
    destacados: [
      {
        numero: "21",
        titulo: "Prohibiciones para contraer matrimonio",
        herramienta: { etiqueta: "Abrir un caso de matrimonio", href: "/abogados/casos/nuevo" },
      },
      {
        numero: "24",
        titulo: "Solicitud del matrimonio",
        nota: "Verbal o por escrito ante el funcionario del domicilio de cualquiera de los contrayentes.",
        herramienta: { etiqueta: "Abrir un caso de matrimonio", href: "/abogados/casos/nuevo" },
      },
      {
        numero: "30",
        titulo: "Celebración del matrimonio",
        nota: "Ante funcionario o notario, con dos testigos mayores de edad que no sean parientes.",
      },
      {
        numero: "240",
        titulo: "Plazo para demandar el divorcio contencioso",
        nota: "1 año desde que se tuvo conocimiento de la causa (con excepciones).",
      },
      {
        numero: "244",
        titulo: "Divorcio por mutuo consentimiento",
        nota: "Solicitud personal y por escrito al Juez: es judicial, no notarial.",
        herramienta: { etiqueta: "Ver el proceso", href: "/abogados/procesos" },
      },
    ],
  },
  {
    id: "codigo-procesal-civil",
    nombre: "Código Procesal Civil",
    decreto: "Decreto 211-2006 (ed. oficial 2018)",
    materia: "Civil",
    estado: "cargado",
    fuenteUrl: `${CEDIJ}Codigo%20Procesal%20Civil%20(2018).pdf`,
    descripcion:
      "Vías declarativas, monitorio, ejecución y recursos — cotejado durante el PoC del cobro de deuda.",
    destacados: [
      {
        numero: "399",
        titulo: "Ámbito del proceso ordinario",
        nota: "Por materia, cualquiera que sea la cuantía.",
        herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
      },
      {
        numero: "400",
        titulo: "Ámbito del proceso abreviado",
        nota: "Cuantía hasta L 100,000 (reforma del Decreto 21-2015) y materias tasadas, como la expiración del arrendamiento por la Ley de Inquilinato.",
        herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
      },
      {
        numero: "598",
        titulo: "Abreviado por la Ley de Inquilinato",
        nota: "Expiración del arrendamiento e impugnación de depósitos.",
      },
      {
        numero: "676",
        titulo: "Proceso monitorio",
        nota: "Deuda de dinero vencida y exigible hasta L 200,000.",
        herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
      },
      {
        numero: "677",
        titulo: "Documentos que acreditan la deuda",
      },
      {
        numero: "782",
        titulo: "Ejecución de títulos extrajudiciales",
      },
    ],
  },
  {
    id: "codigo-civil",
    nombre: "Código Civil",
    decreto: "1906 (con reformas)",
    materia: "Civil",
    estado: "preparacion",
    descripcion: "Obligaciones, contratos, bienes y sucesiones.",
    destacados: [],
    motivoPendiente:
      "El CEDIJ no publica el Código Civil en su biblioteca de PDF (verificado el 2026-08-29). Sin una fuente estatal legible no se carga texto.",
  },
  {
    id: "codigo-penal",
    nombre: "Código Penal",
    decreto: "Decreto 130-2017 (vigente desde 2020)",
    materia: "Penal",
    estado: "preparacion",
    descripcion: "Delitos, penas y medidas de seguridad.",
    destacados: [],
    motivoPendiente:
      "El CEDIJ solo publica el Código Penal de 1983, derogado desde 2020. Cargarlo como vigente sería citar una ley que ya no rige; el nuevo entra cuando haya PDF oficial con texto.",
  },
  {
    id: "ley-justicia-constitucional",
    nombre: "Ley sobre Justicia Constitucional",
    decreto: "Decreto 244-2003",
    materia: "Constitucional",
    estado: "preparacion",
    descripcion: "Amparo, habeas corpus, habeas data e inconstitucionalidad.",
    destacados: [],
    motivoPendiente: "Todavía sin PDF oficial con capa de texto localizado en una fuente del Estado.",
  },
];

/**
 * Temas: la entrada por SITUACIÓN (prototipo «Temas», 2026-09-03). Cada tema
 * junta los artículos que la regulan aunque vivan en códigos distintos, y la
 * herramienta del portal que los aplica. Nacen de los destacados ya
 * verificados; un tema nuevo exige que sus artículos existan en la tabla
 * (`legislacion.test.ts` lo exige contra los destacados o el catálogo).
 */
export interface TemaLegislacion {
  id: string;
  titulo: string;
  /** Pares código + número, en el orden en que se leen. */
  articulos: { codigoId: string; numero: string }[];
  herramienta: { etiqueta: string; href: string };
  /** Qué hace la herramienta con estos artículos, en una frase. */
  detalle: string;
}

const T = (numero: string) => ({ codigoId: "codigo-trabajo", numero });
const F = (numero: string) => ({ codigoId: "codigo-familia", numero });
const P = (numero: string) => ({ codigoId: "codigo-procesal-civil", numero });

export const TEMAS_LEGISLACION: TemaLegislacion[] = [
  {
    id: "despido",
    titulo: "Despido y prestaciones",
    articulos: [T("116"), T("120"), T("120-A"), T("346"), T("864"), T("865")],
    herramienta: { etiqueta: "Calcular prestaciones", href: "/abogados/calculadoras" },
    detalle:
      "La calculadora aplica los arts. 116, 120 y 346 y devuelve cada concepto con su artículo; el 864 marca el plazo para reclamar.",
  },
  {
    id: "terminacion",
    titulo: "Terminación del contrato de trabajo",
    articulos: [T("110"), T("111"), T("112"), T("113"), T("114"), T("115")],
    herramienta: { etiqueta: "Ver el proceso de despido", href: "/abogados/procesos" },
    detalle: "Las causas justas de una y otra parte, y el emplazamiento cuando el patrono alega justa causa.",
  },
  {
    id: "matrimonio",
    titulo: "Matrimonio civil y notarial",
    articulos: [F("21"), F("24"), F("30")],
    herramienta: { etiqueta: "Abrir un caso de matrimonio", href: "/abogados/casos/nuevo" },
    detalle: "Mis casos precarga el checklist de documentos desde estos artículos.",
  },
  {
    id: "divorcio",
    titulo: "Divorcio",
    articulos: [F("240"), F("244")],
    herramienta: { etiqueta: "Ver el proceso", href: "/abogados/procesos" },
    detalle: "El mutuo consentimiento es judicial (art. 244): entra como proceso, no como acto notarial.",
  },
  {
    id: "deuda",
    titulo: "Cobro de una deuda",
    articulos: [P("676"), P("677"), P("782"), P("400")],
    herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
    detalle: "Monitorio hasta L 200,000; abreviado hasta L 100,000; los títulos extrajudiciales van a ejecución directa.",
  },
  {
    id: "arrendamiento",
    titulo: "Arrendamiento y depósito",
    articulos: [P("400"), P("598")],
    herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
    detalle: "La expiración del arrendamiento y la impugnación de depósitos van por el abreviado, con base en la Ley de Inquilinato.",
  },
  {
    id: "via",
    titulo: "¿Ordinario o abreviado?",
    articulos: [P("399"), P("400")],
    herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
    detalle: "El 399 reparte por materia; el 400, por cuantía y materias tasadas.",
  },
];

export function getTema(id: string | null | undefined): TemaLegislacion | undefined {
  return TEMAS_LEGISLACION.find((t) => t.id === id);
}

/** Ids viejos que siguen en enlaces (calculadoras, marcadores del navegador). */
export const ALIAS_CODIGO: Record<string, string> = { cpc: "codigo-procesal-civil" };

export function getCodigo(id: string | null | undefined): Codigo | undefined {
  if (!id) return undefined;
  const real = ALIAS_CODIGO[id] ?? id;
  return CODIGOS.find((c) => c.id === real);
}

export const CODIGOS_CARGADOS = CODIGOS.filter((c) => c.estado === "cargado");

/**
 * Artículos que NO existen en la capa de texto de los PDF del CEDIJ
 * (`automatizaciones/legislacion/README.md`, «Pérdidas conocidas»): el
 * encabezado desapareció al extraer, y su contenido quedó dentro del artículo
 * anterior. Buscarlos por número da vacío; la pantalla dice por qué en vez de
 * decir «no existe».
 */
export const ARTICULOS_SIN_TEXTO: Record<string, string[]> = {
  "codigo-trabajo": ["527", "529"],
  "codigo-procesal-civil": ["40", "420"],
};
