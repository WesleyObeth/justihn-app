import type { ConversacionGuardada, ItemBrief } from "@/types/dominio";

/**
 * Titulares del hero de Jus IA — uno por carga de página, elegido al azar en
 * cliente (decisión Wesley 2026-08-25: saludo y titular fusionados en una sola
 * línea corta; unas variantes llevan nombre y otras no).
 */
export const TITULARES_HERO: ((ctx: { franja: string; nombre: string }) => string)[] = [
  ({ franja, nombre }) => `${franja}, ${nombre} — ¿qué caso trabajamos hoy?`,
  () => "Menos tiempo investigando. Más tiempo argumentando.",
  () => "Encuentra en minutos lo que te tomaría horas en los tribunales",
  ({ franja, nombre }) => `${franja}, ${nombre}. Cada respuesta, con su fuente.`,
  () => "La jurisprudencia de Honduras, a una pregunta de distancia",
  ({ nombre }) => `¿Por dónde empezamos, ${nombre}?`,
];

/** Sugerencias del estado fresco del composer. */
export const SUGERENCIAS = [
  {
    titulo: "Redactar una demanda laboral",
    icono: "plantillas" as const,
    consulta: "Ayúdame a redactar una demanda por despido injustificado",
  },
  {
    titulo: "Buscar jurisprudencia de un caso",
    icono: "juris" as const,
    consulta: "Busca jurisprudencia reciente sobre despido injustificado y prestaciones",
  },
  {
    titulo: "Calcular prestaciones laborales",
    icono: "calc" as const,
    consulta: "Calcula las prestaciones de un empleado con 4 años y salario de L15,000",
  },
  {
    titulo: "Resumir una publicación de Gaceta",
    icono: "gaceta" as const,
    consulta: "Resúmeme el decreto sobre teletrabajo publicado esta semana en La Gaceta",
  },
] as const;

/**
 * Brief diario — triaje de casos, Gaceta y leads.
 * TODO(data): lo produce un workflow n8n nocturno que cruza plazos procesales,
 * publicaciones nuevas en las materias suscritas y leads sin responder.
 */
export const BRIEF: ItemBrief[] = [
  {
    id: "brief-contestacion",
    veredicto: "ACTUAR",
    referencia: "CAS-0178-2026",
    urgencia: "vence en 2 días",
    titulo: "Contestación de demanda — Juzgado de Letras del Trabajo",
    pregunta: "¿Qué debo incluir en la contestación de la demanda del expediente CAS-0178-2026?",
    accion: "Contestar demanda",
  },
  {
    id: "brief-teletrabajo",
    veredicto: "REVISAR",
    referencia: "GACETA Nº 35,214",
    titulo: "Reglamento de teletrabajo — afecta 2 casos laborales activos",
    pregunta: "¿Cómo afecta el nuevo reglamento de teletrabajo a mis casos laborales activos?",
    accion: "Analizar impacto",
  },
  {
    id: "brief-audiencia",
    veredicto: "INFO",
    referencia: "CAS-0164-2026",
    titulo: "Audiencia de conciliación el jueves 9:00 — Juzgado de Letras del Trabajo",
    pregunta:
      "Prepárame la audiencia de conciliación del jueves: qué debo llevar y qué plazos corren después",
    accion: "Preparar audiencia",
  },
];

/**
 * Historial de conversaciones. TODO(data): tabla `conversaciones` +
 * `mensajes_conversacion` con RLS por `abogado_id`.
 */
export const HISTORIAL: ConversacionGuardada[] = [
  {
    id: "conv-divorcio",
    titulo: "Requisitos del divorcio por mutuo consentimiento",
    fecha: "Ayer",
    mensajes: [
      {
        id: "conv-divorcio-u",
        who: "u",
        text: "¿Cuáles son los requisitos para el divorcio por mutuo consentimiento?",
      },
      {
        id: "conv-divorcio-a",
        who: "a",
        text: "Para el divorcio por mutuo consentimiento se requiere, en síntesis:\n\n1. Solicitud conjunta ante el juzgado de familia competente.\n2. Plazo legal mínimo desde la celebración del matrimonio.\n3. Convenio regulador sobre bienes, alimentos y guarda.\n4. Ratificación personal de ambos cónyuges ante el juez.",
        citas: [
          { etiqueta: "Código de Familia, art. ___" },
          { etiqueta: "Sentencia SF-____-2023, Sala Civil" },
        ],
      },
    ],
  },
  {
    id: "conv-prescripcion",
    titulo: "Prescripción de acciones laborales",
    fecha: "Jue 20",
    mensajes: [
      {
        id: "conv-prescripcion-u",
        who: "u",
        text: "¿En cuánto tiempo prescriben las acciones por despido injustificado?",
      },
      {
        id: "conv-prescripcion-a",
        who: "a",
        text: "El plazo de prescripción corre desde la fecha del despido y se interrumpe con la presentación del reclamo. El criterio reciente de la Corte de Apelaciones del Trabajo confirma el cómputo en días hábiles administrativos para la vía previa.\n\n(Respuesta de demostración.)",
        citas: [
          { etiqueta: "Código del Trabajo, art. ___" },
          { etiqueta: "Sentencia CAT-____-2025" },
        ],
      },
    ],
  },
  {
    id: "conv-nulidad",
    titulo: "Nulidad de contrato — criterio de la Sala Civil",
    fecha: "Lun 17",
    mensajes: [
      {
        id: "conv-nulidad-u",
        who: "u",
        text: "¿Qué criterio mantiene la Sala Civil sobre nulidad por vicios del consentimiento?",
      },
      {
        id: "conv-nulidad-a",
        who: "a",
        text: "La Sala de lo Civil exige prueba directa del vicio al momento de contratar; el error debe ser esencial y excusable. La casación de junio 2026 reitera ese estándar y casa la sentencia por indebida valoración documental.\n\n(Respuesta de demostración.)",
        citas: [
          { etiqueta: "Código Civil, art. ___" },
          { etiqueta: "CAS-0147-2026, Sala Civil" },
        ],
      },
    ],
  },
];

/** Estados progresivos del indicador "pensando". */
export const ESTADOS_PENSANDO = [
  "Leyendo tu consulta…",
  "Buscando en jurisprudencia y Gaceta…",
  "Comparando criterios de la Sala…",
] as const;

export const ESTADOS_PENSANDO_ADJUNTO = [
  "Leyendo el documento…",
  "Extrayendo texto y estructura…",
  "Contrastando con el corpus oficial…",
] as const;
