import type { Proceso } from "@/types/dominio";

/**
 * Seed del "paso a paso" de procesos.
 *
 * TODO(data): tablas `procesos` + `pasos_proceso`. Las fuentes salen de la
 * legislación del PJ (`legislacion.poderjudicial.gob.hn`, PDFs en
 * `Anexos/{GUID}{nombre}.pdf`) y del corpus de sentencias. El backlog #5 del
 * proyecto define con el socio qué códigos cargar primero.
 *
 * Los `art. ___` son marcadores explícitos: el producto NO cita un artículo o
 * plazo que no pueda enlazar al texto oficial (regla de producto, ver
 * `ai-safety.ts`). Documentos y notas prácticas son conocimiento general de
 * práctica — el socio abogado los valida (backlog #5).
 */
export const PROCESOS: Proceso[] = [
  {
    id: "divorcio-mutuo-consentimiento",
    plantillaId: "divorcio-mutuo",
    nombre: "Divorcio por mutuo consentimiento",
    materia: "Familia",
    pasos: [
      {
        titulo: "Reunir documentación",
        detalle:
          "Certificación de matrimonio, certificados de nacimiento de hijos (si aplica) e identificación de ambos cónyuges.",
        fuente: "Código de Familia, art. ___",
        documentos: [
          "Certificación de matrimonio (RNP)",
          "Certificados de nacimiento de los hijos",
          "Tarjetas de identidad de ambos cónyuges",
          "Inventario de bienes comunes (si aplica)",
        ],
        plazo:
          "Las certificaciones del RNP tienen vigencia limitada — solicítalas cerca de la presentación.",
        nota: "Verifica que los nombres coincidan exactamente entre documentos: una discrepancia obliga a rectificar antes de presentar.",
      },
      {
        titulo: "Redactar el convenio regulador",
        detalle:
          "Acuerdo sobre bienes, pensión alimenticia y guarda de los hijos. Debe firmarse por ambos cónyuges.",
        fuente: "Código de Familia, art. ___",
        documentos: [
          "Convenio regulador firmado por ambos cónyuges",
          "Propuesta de pensión alimenticia",
          "Acuerdo de guarda y régimen de visitas",
        ],
        nota: "El convenio incompleto es la causa más común de prevención del juzgado — cubre bienes, alimentos y guarda aunque no haya conflicto.",
      },
      {
        titulo: "Presentar la solicitud conjunta",
        detalle:
          "Ante el juzgado de familia del domicilio conyugal, con auxilio de profesional del derecho.",
        fuente: "Código Procesal Civil, art. ___",
        documentos: [
          "Solicitud conjunta (usa el modelo de este proceso)",
          "Poder de representación, si actúa un solo apoderado",
        ],
        plazo: "El juzgado admite o previene en el plazo legal (art. ___).",
        nota: "La competencia es del juzgado de familia del último domicilio conyugal.",
      },
      {
        titulo: "Audiencia de ratificación",
        detalle: "Ambos cónyuges ratifican personalmente su voluntad ante el juez.",
        fuente: "Sentencia SF-____-2023, Sala Civil",
        documentos: ["Tarjetas de identidad de ambos cónyuges"],
        plazo: "Se señala por auto del juzgado tras admitir la solicitud.",
        nota: "La ratificación es personalísima: la incomparecencia de un cónyuge suspende la audiencia.",
      },
      {
        titulo: "Sentencia e inscripción",
        detalle: "Dictada la sentencia, se inscribe en el Registro Nacional de las Personas.",
        fuente: "Ley del RNP, art. ___",
        documentos: ["Certificación de la sentencia firme"],
        plazo: "La inscripción procede una vez firme la sentencia.",
        nota: "Hasta la inscripción en el RNP, el divorcio no surte efectos frente a terceros.",
      },
    ],
  },
  {
    id: "demanda-despido-injustificado",
    plantillaId: "despido-injustificado",
    nombre: "Demanda por despido injustificado",
    materia: "Laboral",
    pasos: [
      {
        titulo: "Agotar la vía administrativa",
        detalle: "Presentar reclamo ante la Secretaría de Trabajo cuando corresponda.",
        fuente: "Código del Trabajo, art. ___",
        documentos: [
          "Contrato de trabajo o constancia laboral",
          "Comprobantes de salario recientes",
          "Carta de despido, si existe",
        ],
        plazo: "La acción prescribe en el plazo del art. ___ — documenta la fecha exacta del despido.",
        nota: "De la fecha del despido corren la prescripción y los cálculos: fíjala con evidencia (carta, testigos, mensajes).",
      },
      {
        titulo: "Calcular las prestaciones",
        detalle:
          "Cesantía, preaviso, vacaciones y aguinaldos proporcionales según antigüedad y salario.",
        fuente: "Código del Trabajo, arts. ___",
        documentos: ["Últimos recibos de pago", "Constancia de antigüedad"],
        nota: "Usa la calculadora del portal como estimación y valida el número contra el expediente antes de plasmarlo en la demanda.",
      },
      {
        titulo: "Presentar la demanda",
        detalle: "Ante el juzgado de letras del trabajo competente.",
        fuente: "Código Procesal del Trabajo, art. ___",
        documentos: [
          "Demanda (usa el modelo de este proceso)",
          "Cálculo de prestaciones anexo",
          "Pruebas documentales de la relación laboral",
        ],
        plazo: "Admisión o prevención en el plazo legal (art. ___).",
        nota: "La cuantía reclamada define el juzgado competente — revísala antes de presentar.",
      },
      {
        titulo: "Audiencia de conciliación y juicio",
        detalle: "Fase obligatoria de conciliación; de no haber acuerdo, se abre a pruebas.",
        fuente: "Código Procesal del Trabajo, art. ___",
        documentos: ["Pliego de pruebas", "Testigos debidamente notificados"],
        plazo: "Se señala por auto del juzgado.",
        nota: "Llega con propuesta de conciliación ya calculada: buena parte de los casos laborales se resuelve en esta fase.",
      },
    ],
  },
  {
    id: "constitucion-sociedad-mercantil",
    plantillaId: "constitucion-sociedad",
    nombre: "Constitución de una sociedad mercantil",
    materia: "Mercantil",
    pasos: [
      {
        titulo: "Escritura pública de constitución",
        detalle: "Otorgada ante notario con los estatutos sociales.",
        fuente: "Código de Comercio, art. ___",
        documentos: [
          "Identidad de los socios",
          "Proyecto de estatutos (usa el modelo de este proceso)",
          "Comprobante del capital social",
        ],
        nota: "Define desde la escritura al representante legal y sus límites: cambiarlo después exige nueva escritura e inscripción.",
      },
      {
        titulo: "Inscripción en el Registro Mercantil",
        detalle: "Presentación del testimonio ante la cámara de comercio correspondiente.",
        fuente: "Código de Comercio, art. ___",
        documentos: [
          "Testimonio de la escritura",
          "Formulario de inscripción",
          "Comprobante de pago de tasas registrales",
        ],
        plazo: "El registro inscribe u observa según su carga (plazo legal: art. ___).",
        nota: "En la CCIC la consulta pública posterior es por número de matrícula, no por nombre — guarda ese dato.",
      },
      {
        titulo: "Obtención de RTN y permisos",
        detalle: "Registro tributario y permisos de operación municipales.",
        fuente: "Código Tributario, art. ___",
        documentos: [
          "Escritura inscrita",
          "RTN del representante legal",
          "Formularios del SAR y de la municipalidad",
        ],
        nota: "Sin RTN la sociedad no factura: es el paso que suele trabar el arranque de operaciones.",
      },
    ],
  },
  {
    id: "recurso-amparo",
    plantillaId: "recurso-amparo",
    nombre: "Recurso de amparo",
    materia: "Constitucional",
    pasos: [
      {
        titulo: "Verificar la procedencia",
        detalle: "Acto de autoridad que vulnere derechos constitucionales, sin otra vía idónea.",
        fuente: "Ley de Justicia Constitucional, art. ___",
        documentos: [
          "Acto reclamado (resolución o notificación)",
          "Evidencia del agotamiento de la vía previa",
        ],
        plazo: "El plazo de interposición corre desde la notificación del acto (art. ___).",
        nota: "El amparo no sustituye los recursos ordinarios: si había otra vía idónea disponible, se declara improcedente.",
      },
      {
        titulo: "Presentar el recurso",
        detalle: "Ante la Sala de lo Constitucional o corte de apelaciones según el caso.",
        fuente: "Ley de Justicia Constitucional, art. ___",
        documentos: [
          "Recurso de amparo (usa el modelo de este proceso)",
          "Copias para la autoridad recurrida",
          "Poder de representación",
        ],
        nota: "Identifica con precisión el derecho constitucional vulnerado y el acto concreto — el amparo genérico se rechaza de plano.",
      },
      {
        titulo: "Informe de la autoridad",
        detalle: "La autoridad recurrida rinde informe en el plazo legal.",
        fuente: "Ley de Justicia Constitucional, art. ___",
        plazo: "Plazo legal del informe: art. ___.",
        nota: "Valora pedir la suspensión del acto reclamado si su ejecución haría irreparable el daño.",
      },
      {
        titulo: "Sentencia",
        detalle: "Se otorga o deniega el amparo; efectos restitutorios.",
        fuente: "Sentencia SCO-____-2024",
        nota: "Los efectos del amparo son restitutorios: devuelven las cosas al estado anterior a la violación del derecho.",
      },
    ],
  },
];

export function getProceso(id: string): Proceso | undefined {
  return PROCESOS.find((p) => p.id === id);
}
