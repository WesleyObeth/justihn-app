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
    id: "ley-justicia-constitucional",
    nombre: "Ley sobre Justicia Constitucional",
    decreto: "Decreto 244-2003",
    materia: "Constitucional",
    estado: "cargado",
    fuenteUrl: "https://www.tsc.gob.hn/web/leyes/Ley%20Sobre%20Justicia%20Constitucional%20(07).pdf",
    descripcion:
      "Amparo, habeas corpus, habeas data e inconstitucionalidad — plazos, admisibilidad, medidas cautelares y sentencia. PDF con texto del Tribunal Superior de Cuentas.",
    destacados: [
      {
        numero: "42",
        titulo: "Procedencia del amparo",
        nota: "Contra resoluciones, actos y hechos de los Poderes del Estado, incluidas las entidades descentralizadas.",
        herramienta: { etiqueta: "Ver el proceso de amparo", href: "/abogados/procesos?proceso=recurso-amparo" },
      },
      {
        numero: "46",
        titulo: "Inadmisibilidad del amparo",
        nota: "Mera legalidad, actos consentidos, recursos pendientes en la vía contencioso-administrativa.",
      },
      {
        numero: "48",
        titulo: "Plazo para promover la acción",
        nota: "2 meses desde la última notificación o desde que se conoció el acto.",
        herramienta: { etiqueta: "Ver el proceso de amparo", href: "/abogados/procesos?proceso=recurso-amparo" },
      },
      {
        numero: "49",
        titulo: "Requisitos del escrito de interposición",
      },
      {
        numero: "59",
        titulo: "Cuándo proceden las medidas cautelares",
        nota: "Peligro para la integridad del reclamante, o ejecución que haría inútil el amparo.",
      },
      {
        numero: "63",
        titulo: "Requisitos de la sentencia",
      },
    ],
  },
  {
    id: "codigo-comercio",
    nombre: "Código de Comercio",
    decreto: "Decreto 73-50",
    materia: "Mercantil",
    estado: "cargado",
    fuenteUrl: "https://honduras.eregulations.org/media/codigo%20del%20comercio.pdf",
    descripcion:
      "Comerciantes, sociedades, títulos valores, contratos mercantiles y Registro de Comercio. PDF con texto publicado por e-Regulations Honduras.",
    advertencia:
      "Edición publicada por e-Regulations sin las reformas recientes: los mínimos de socios y de capital, entre otros, han cambiado. Úsalo para la estructura y contrasta con La Gaceta antes de citar cifras.",
    destacados: [
      {
        numero: "14",
        titulo: "Contenido de la escritura constitutiva",
        herramienta: { etiqueta: "Ver el proceso de constitución", href: "/abogados/procesos?proceso=constitucion-sociedad-mercantil" },
      },
      {
        numero: "18",
        titulo: "Plazo para inscribir la escritura",
        nota: "15 días desde el otorgamiento; pasado, cualquier socio puede gestionarla.",
      },
      {
        numero: "93",
        titulo: "Fundación de la sociedad anónima",
        nota: "Simultánea, ante notario, o por suscripción pública.",
      },
      {
        numero: "95",
        titulo: "Aportaciones en dinero",
        nota: "Certificado de depósito o cheque certificado; el notario da fe.",
      },
      {
        numero: "384",
        titulo: "Registro obligatorio en la Cámara de Comercio",
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
];

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
  // El PDF de e-Regulations salta del 999 al 1001 y del 1235 al 1246 (falta
  // una página en el origen). Verificado 2026-09-03.
  "codigo-comercio": ["1000", "1236", "1237", "1238", "1239", "1240", "1241", "1242", "1243", "1244", "1245"],
};

/** Hoy: los tres del CEDIJ (2026-09-01) + la Ley y el Código de Comercio (2026-09-03). */
