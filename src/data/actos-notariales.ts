import type { Materia } from "@/types/dominio";

/**
 * Actos notariales — el expediente que un notario reúne por cliente.
 *
 * Nace el 2026-09-02 del primer feedback de un abogado externo: «si el
 * sistema digitalizara los expedientes notariales —divorcio, matrimonio,
 * declaración de herencia y auténticas— sería excelente». Es la materia
 * prima de «Mis casos» (tipo `notarial`) y de los modelos notariales.
 *
 * Regla de siempre: **sin fuente no hay texto.** Cada documento del checklist
 * lleva el artículo del que sale; cuando la fuente aún no está cargada (el
 * Código del Notariado, Decreto 353-2005, no está en ninguna fuente estatal
 * legible que hayamos podido verificar), el acto lo dice con
 * `fuentePendiente` y la UI lo enseña — igual que las guías sin sello.
 *
 * ⚠️ El divorcio por mutuo consentimiento es JUDICIAL en Honduras (art. 244
 * del Código de Familia: «al Juez competente»). Va aquí porque el abogado lo
 * nombró como expediente del despacho, no porque lo autorice un notario: el
 * caso se abre como `proceso` y reutiliza la guía verificada.
 */

const CODIGO_FAMILIA =
  "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20de%20Familia%20(Actualizado%20con%20Reformas%20Ley%20de%20Adopciones).pdf";
const CODIGO_FAMILIA_NOMBRE =
  "Código de Familia (edición CEDIJ, actualizada con reformas) — Poder Judicial de Honduras";

export interface DocumentoRequerido {
  titulo: string;
  /** Artículo o norma que lo exige. Se muestra junto al documento. */
  fuente?: string;
  /** `false` = solo en ciertos casos (lo dice el título). */
  obligatorio: boolean;
}

export interface ActoNotarial {
  id: string;
  nombre: string;
  /** Para el selector de «Nuevo caso». */
  resumen: string;
  materia: Materia;
  /** Qué pasa en el acto, en orden — lo que el notario hace, no lo que el cliente trae. */
  pasos: { titulo: string; detalle: string; fuente?: string }[];
  documentos: DocumentoRequerido[];
  /** Plazos que el expediente tiene que vigilar, si la ley los fija. */
  plazos?: { titulo: string; detalle: string; fuente: string }[];
  fuenteUrl?: string;
  fuenteNombre?: string;
  /** La norma que rige el acto aún no está en una fuente estatal legible. */
  fuentePendiente?: string;
  /** Exige exequátur notarial vigente (no basta ser abogado). */
  requiereNotario: boolean;
}

export const ACTOS_NOTARIALES: ActoNotarial[] = [
  {
    id: "matrimonio-civil",
    nombre: "Matrimonio civil ante notario",
    resumen:
      "Manifestación de los contrayentes, comprobación de capacidad y celebración con dos testigos.",
    materia: "Familia",
    requiereNotario: true,
    pasos: [
      {
        titulo: "Manifestación de los contrayentes",
        detalle:
          "Comparecen ante el notario del domicilio de cualquiera de los dos, presentan su identificación y declaran nombres, nacionalidad, edad, estado civil, domicilio de los dos últimos años, profesión, generales de los padres y que no están casados ni en unión de hecho con tercera persona.",
        fuente: "art. 24 del Código de Familia",
      },
      {
        titulo: "Comprobación de la capacidad y de los requisitos",
        detalle:
          "El notario dicta las providencias necesarias para comprobar lo declarado. Sin certificado médico prenupcial y sin la publicación de los edictos, el matrimonio está prohibido.",
        fuente: "arts. 21 numeral 3, 24 y 28 del Código de Familia",
      },
      {
        titulo: "Señalamiento y celebración",
        detalle:
          "Acreditada la capacidad, el notario señala día y hora —incluso para celebración inmediata si lo piden— y formaliza el acto con dos testigos mayores de edad que no sean parientes; lee los artículos 40, 41, 42, 64, 68 y 70, pregunta el régimen patrimonial y levanta el acta.",
        fuente: "arts. 29 y 30 del Código de Familia",
      },
    ],
    documentos: [
      { titulo: "Documento de identificación personal de cada contrayente", fuente: "art. 24", obligatorio: true },
      { titulo: "Certificado médico prenupcial de cada contrayente (gratuito en centros de salud del Estado)", fuente: "arts. 21.3 y 28", obligatorio: true },
      { titulo: "Publicación de los edictos legales", fuente: "art. 21.3", obligatorio: true },
      { titulo: "Dos testigos mayores de edad, no parientes, con identificación", fuente: "art. 30", obligatorio: true },
      { titulo: "Si hubo matrimonio anterior: documento que acredite su disolución o inexistencia", fuente: "art. 26", obligatorio: false },
      { titulo: "Si hubo matrimonio anterior con hijos: prueba de que está garantizada la obligación de alimentarlos", fuente: "art. 26", obligatorio: false },
      { titulo: "Si administra bienes de menores: inventario respectivo", fuente: "art. 26", obligatorio: false },
      { titulo: "Contrayente extranjero: prueba de soltería con dos testigos hábiles y certificación consular o legalizada", fuente: "art. 27", obligatorio: false },
      { titulo: "Contrayente menor de edad: comparecencia de quienes deben dar el consentimiento", fuente: "art. 25", obligatorio: false },
      { titulo: "Poder especial, si uno de los contrayentes comparece representado", fuente: "art. 30", obligatorio: false },
    ],
    plazos: [
      {
        titulo: "Mujer con matrimonio anterior disuelto: 300 días",
        detalle:
          "No puede casarse antes de 300 días desde la disolución, nulidad o fin de la unión de hecho, salvo parto en ese término o separación material acreditada.",
        fuente: "art. 21 numeral 1 del Código de Familia",
      },
    ],
    fuenteUrl: CODIGO_FAMILIA,
    fuenteNombre: CODIGO_FAMILIA_NOMBRE,
  },
  {
    id: "autentica",
    nombre: "Auténtica de firma o de copia",
    resumen:
      "El acto notarial de más volumen: dar fe de que una firma se puso ante el notario, o de que una copia coincide con su original.",
    materia: "Notarial",
    requiereNotario: true,
    pasos: [
      {
        titulo: "Identificar al compareciente",
        detalle:
          "El notario identifica a quien firma con su documento personal y deja constancia de sus generales en el acta.",
      },
      {
        titulo: "Presenciar la firma, o cotejar la copia",
        detalle:
          "En la auténtica de firma, la persona firma en presencia del notario; en la de copia, el notario coteja la reproducción contra el original que tiene a la vista.",
      },
      {
        titulo: "Razón de autenticación",
        detalle:
          "Se extiende la razón con lugar, fecha, identificación del compareciente o del documento cotejado, y se asienta en el protocolo o libro que corresponda.",
      },
    ],
    documentos: [
      { titulo: "Documento cuya firma se autentica, sin firmar hasta estar ante el notario", obligatorio: true },
      { titulo: "Documento de identificación personal de quien firma", obligatorio: true },
      { titulo: "Para auténtica de copia: el ORIGINAL a la vista y la copia a cotejar", obligatorio: false },
      { titulo: "Si firma en representación de otro: el poder o la acreditación de la representación", obligatorio: false },
    ],
    fuentePendiente:
      "El Código del Notariado (Decreto 353-2005) no está en ninguna fuente estatal legible que hayamos podido verificar; los artículos se citarán cuando se cargue. El checklist recoge la práctica general del acto, validada por el socio.",
  },
  {
    id: "declaratoria-herederos",
    nombre: "Declaratoria de herederos",
    resumen:
      "Reunir la prueba del fallecimiento y del parentesco, y llevar la declaratoria hasta su inscripción en el IP.",
    materia: "Civil",
    requiereNotario: false,
    pasos: [
      {
        titulo: "Prueba del fallecimiento y del parentesco",
        detalle:
          "Certificado de defunción y partidas que prueben el vínculo de cada heredero con el causante; si hay testamento, se acompaña.",
      },
      {
        titulo: "Inventario de los bienes",
        detalle:
          "Escrituras, folio real o certificación íntegra de los inmuebles, y datos de los vehículos, para que la declaratoria los alcance.",
      },
      {
        titulo: "Declaratoria e inscripción",
        detalle:
          "Obtenida la declaratoria, la certificación se inscribe en el Registro de la Propiedad Inmueble y, para vehículos, en el Registro de Sentencias del IP. Sin la inscripción los bienes no pasan a nombre de los herederos.",
      },
    ],
    documentos: [
      { titulo: "Certificado de defunción del causante", obligatorio: true },
      { titulo: "Partidas de nacimiento o de matrimonio que prueben el parentesco de cada heredero", obligatorio: true },
      { titulo: "Documento de identificación de cada heredero", obligatorio: true },
      { titulo: "Testamento, si existe", obligatorio: false },
      { titulo: "Escrituras, folio real o certificación íntegra de los inmuebles (L 300.00 en el IP)", obligatorio: false },
      { titulo: "Sentencia o resolución de declaratoria de herederos, certificada — original y copia legible", obligatorio: true },
      { titulo: "Para vehículos: la misma certificación inscrita en el Registro de Sentencias del IP", obligatorio: false },
    ],
    fuenteUrl: "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20Procesal%20Civil%20(2018).pdf",
    fuenteNombre: "Código Procesal Civil (edición CEDIJ 2018) — Poder Judicial de Honduras · tasas del IP verificadas en la guía de herencia",
    fuentePendiente:
      "La vía NOTARIAL de la declaratoria la habilita la Ley del Notariado; mientras no esté cargada, el expediente sigue el checklist de la vía judicial, que sí está verificado.",
  },
];

export function getActoNotarial(id: string): ActoNotarial | undefined {
  return ACTOS_NOTARIALES.find((a) => a.id === id);
}
