/**
 * Router determinístico de Jus IA — Fase 1 (Blueprint §4.1).
 *
 * Corre en el servidor detrás de `guard()`, igual que correrá el motor real: la
 * UI ya habla con un endpoint, no con datos locales. En Fase 2 este módulo se
 * sustituye por `motor-claude.ts` (RAG sobre el corpus oficial) sin que la UI
 * cambie — ambos devuelven el mismo `RespuestaIA`.
 *
 * Determinista por contrato (§0.6): la variación sale del índice del turno, no
 * de `Math.random()`, para que servidor y cliente coincidan y los tests sean
 * reproducibles.
 */
import { buscarPorExpediente } from "@/data/sentencias";
import type { RespuestaIA } from "./tipos";

export const CLAVE_ADJUNTO_PDF = "__adjunto_pdf__";
export const CLAVE_ADJUNTO_FOTO = "__adjunto_foto__";

const SALUDO_RE =
  /^(hola|buenas|buenos días|buenas tardes|buenas noches|hey|saludos|qué tal|gracias|muchas gracias|ok|vale|perfecto|excelente)[\s!.,]*$/;

/** Formatos reales del corpus (CL-528-24, AC-937-23…) + los casos propios (CAS-…). */
const EXPEDIENTE_RE = /\b(cas|cl|cc|ca|cp|ac|aa|ap|al|rp|ri|ep)[-\s]?\d{1,4}(?:[-\s]?\d{2,4})?\b/;

export function responderDemo(consulta: string, turno: number, metaCosto: string): RespuestaIA {
  const low = consulta.toLowerCase();

  if (SALUDO_RE.test(low)) {
    const variantes = [
      "¡Hola! ¿En qué caso trabajamos hoy?",
      "Buenas — lista para investigar. ¿Por dónde empezamos?",
      "Con gusto. Cuéntame tu consulta o pega un número de expediente y te traigo sus datos.",
    ];
    return {
      text: variantes[turno % variantes.length]!,
      chips: [
        "¿Qué debo priorizar hoy?",
        "Busca jurisprudencia sobre despido injustificado",
        "Resume la última Gaceta",
      ],
      meta: "Sin costo",
      gratuita: true,
    };
  }

  const expMatch = low.match(EXPEDIENTE_RE);
  if (expMatch) {
    const st = buscarPorExpediente(expMatch[0]!);

    if (st) {
      return {
        text: `Encontré el expediente ${st.expediente} (${st.organo}, ${st.fecha}):\n\n${st.resumen}\n\nPuedo explicarte el criterio, buscar precedentes en contra o generar la cita lista para tu escrito.`,
        tarjeta: {
          sentenciaId: st.id,
          materia: st.materia,
          expediente: st.expediente,
          titulo: st.titulo,
          meta: `${st.organo} · ${st.fecha}`,
          fallo: st.fallo,
        },
        citas: [{ etiqueta: `${st.expediente}, ${st.organo}` }],
        chips: [
          "Explícame el criterio y cómo aplicarlo",
          "¿Hay criterios contrarios recientes?",
          "Genera la cita para mi escrito",
        ],
        meta: metaCosto,
      };
    }

    // Expediente CAS-… = caso propio de la abogada (no es sentencia publicada).
    if (expMatch[1] === "cas") {
      return {
        text: `Ese expediente es uno de tus casos activos, no una sentencia publicada. Para la contestación te sugiero:\n\n1. Verifica el plazo — según tu brief, vence en 2 días.\n2. Revisa el criterio de la Sala sobre la carga de la prueba del despido (tengo CL-528-24 en el corpus, directamente aplicable).\n3. Puedo redactarte el borrador con las citas insertadas.`,
        citas: [{ etiqueta: "CL-528-24, Corte de Apelaciones del Trabajo de San Pedro Sula" }],
        chips: [
          "Redacta el borrador de la contestación",
          "Explícame CL-528-24",
          "¿Cómo se interrumpe el plazo?",
        ],
        meta: metaCosto,
      };
    }

    // Sin fuente no hay respuesta: honestidad antes que una tarjeta equivocada.
    return {
      text: `No encontré el expediente "${expMatch[0]!.toUpperCase()}" en la muestra del corpus (piloto de 100 sentencias). Cuando el corpus completo esté indexado (20,202), podré buscarlo — mientras tanto puedo buscar por tema.`,
      chips: [
        "Busca jurisprudencia sobre despido injustificado",
        "Explícame CL-528-24",
        "¿Qué sentencias tienes de mi materia?",
      ],
      meta: "Sin costo",
      gratuita: true,
    };
  }

  if (low.includes(CLAVE_ADJUNTO_PDF)) {
    return {
      text: "Leí el documento completo (14 páginas). Resumen:\n\n• Es una sentencia de la Corte de Apelaciones del Trabajo que confirma la condena por despido injustificado en primera instancia.\n• El punto central: el empleador no probó la causal invocada; la carga de la prueba del despido justificado recae en el patrono (Código del Trabajo, art. ___).\n• Montos confirmados: cesantía, preaviso y salarios caídos por L 98,400.\n• Voto particular de un magistrado sobre el cómputo de los salarios caídos — útil si te toca distinguir el caso.\n\n¿Quieres que lo compare con tu caso activo o que extraiga las citas para tu escrito?",
      citas: [
        { etiqueta: "Código del Trabajo, art. ___" },
        { etiqueta: "CAT-0312-2026, considerando IV" },
      ],
      chips: [
        "Compáralo con mi caso CAS-0178",
        "Extrae las citas para mi escrito",
        "¿El voto particular me sirve?",
      ],
      meta: metaCosto,
    };
  }

  if (low.includes(CLAVE_ADJUNTO_FOTO)) {
    return {
      text: "Leí la foto — es un contrato de arrendamiento manuscrito/escaneado. Lo que identifiqué:\n\n• Partes: [arrendador] y [arrendatario], inmueble en Comayagüela.\n• Canon: L 8,500 mensuales, plazo de 2 años con renovación automática.\n• Ojo: la cláusula sexta fija un preaviso de 15 días — el decreto publicado el 18 de agosto establece un mínimo mayor para contratos nuevos; esa cláusula podría ser inaplicable.\n\nLa imagen tiene una sección borrosa en la cláusula de depósito: si puedes, súbela de nuevo con más luz.",
      citas: [
        { etiqueta: "Código Civil, art. ___" },
        { etiqueta: "La Gaceta Nº ______, 18 ago 2026" },
      ],
      chips: [
        "Redacta una adenda que corrija el preaviso",
        "¿Qué pasa con los contratos ya firmados?",
      ],
      meta: metaCosto,
    };
  }

  if (
    /artículo|articulo|art\.|qué dice la ley|que dice la ley|código|codigo|constituci|es legal|está permitido|esta permitido/.test(
      low,
    )
  ) {
    return {
      text: 'Según la legislación hondureña vigente, tu pregunta se responde así:\n\nLa regla general está en el artículo que cito abajo: la norma exige [supuesto de hecho] y produce [consecuencia jurídica]. La excepción aplica solo cuando se cumple la condición prevista en el mismo cuerpo legal.\n\nCito textualmente el pasaje clave: "…" (verifica el texto oficial en el enlace de la cita — nunca respondo con artículos que no pueda enlazar).\n\n(Respuesta de demostración — el producto final cita el artículo exacto del corpus oficial.)',
      citas: [
        { etiqueta: "Código aplicable, art. ___" },
        { etiqueta: "Constitución de la República, art. ___" },
      ],
      chips: [
        "Dame la jurisprudencia que lo interpreta",
        "¿Hay reformas recientes a ese artículo?",
        "Aplícalo a mi caso",
      ],
      meta: metaCosto,
    };
  }

  if (/redact|borrador|contestaci|escrito para|escrito de/.test(low)) {
    return {
      text: "Preparé un borrador con los datos disponibles y las citas verificadas insertadas — aquí abajo, listo para editar. Completa los datos entre [corchetes] y ajusta lo que necesites; puedo reescribir cualquier sección.",
      citas: [
        { etiqueta: "Código del Trabajo, art. ___" },
        { etiqueta: "Código Procesal del Trabajo, art. ___" },
      ],
      chips: [
        "Hazlo más formal",
        "Agrega el cálculo de prestaciones como anexo",
        "¿Qué documentos debo acompañar?",
      ],
      meta: metaCosto,
      escrito: {
        titulo: "Demanda ordinaria laboral — despido injustificado",
        cuerpo: BORRADOR_DEMANDA,
      },
    };
  }

  if (/prestacion|cesant|despido|indemniza|preaviso/.test(low)) {
    return {
      text: "Para un salario mensual de L 15,000 y 4 años de servicio, el cálculo orientativo según el Código del Trabajo queda así:",
      tabla: [
        ["Cesantía (4 años)", "L 60,000"],
        ["Preaviso (2 meses)", "L 30,000"],
        ["Vacaciones proporcionales", "L 7,500"],
        ["13º y 14º mes proporcionales", "L 15,000"],
        ["Total estimado", "L 112,500"],
      ],
      citas: [
        { etiqueta: "Código del Trabajo, art. ___" },
        { etiqueta: "CAT-____-2025, Corte de Apelaciones del Trabajo" },
      ],
      chips: [
        "¿Cómo se interrumpe la prescripción?",
        "Redacta la demanda con estos montos",
        "¿Qué documentos necesito del cliente?",
      ],
      meta: metaCosto,
    };
  }

  if (/audiencia|concilia/.test(low)) {
    return {
      text: "Para la audiencia de conciliación del jueves (CAS-0164-2026), este es tu checklist:\n\n1. Poder de representación vigente y documentos personales de tu cliente.\n2. Cálculo de prestaciones actualizado — llévalo impreso como base de la negociación (lo tienes en Calculadoras).\n3. Piso y techo del arreglo definidos con tu cliente ANTES de la audiencia.\n4. Si no hay avenimiento, el juicio continúa en la misma audiencia: lleva tus medios de prueba listos (Código Procesal del Trabajo, art. ___).\n\n¿Te genero el cálculo de prestaciones o un guion de negociación?",
      citas: [
        { etiqueta: "Código del Trabajo, art. ___" },
        { etiqueta: "Código Procesal del Trabajo, art. ___" },
      ],
      chips: [
        "Calcula las prestaciones del caso",
        "Redacta el guion de negociación",
        "¿Qué pasa si no comparece la contraparte?",
      ],
      meta: metaCosto,
    };
  }

  if (/gaceta|teletrabajo|decreto|reglamento|arrendamiento/.test(low)) {
    return {
      text: "Esta semana hay 5 publicaciones en tus materias. La más relevante para tu práctica:\n\nReglamento de teletrabajo en el sector privado (18 ago) — regula jornada, reversibilidad del acuerdo y obligaciones del empleador en equipo y conectividad. Afecta directamente a 2 de tus casos laborales activos.\n\n(Resumen de demostración.)",
      citas: [
        { etiqueta: "La Gaceta Nº ______, 18 ago 2026" },
        { etiqueta: "Código del Trabajo, art. ___" },
      ],
      chips: [
        "¿Cómo afecta a mi caso CAS-0178?",
        "Compárame el texto anterior y el nuevo",
        "Suscríbeme a la materia Laboral",
      ],
      meta: metaCosto,
    };
  }

  if (/prioriz|pendiente|hoy|agenda|urgente/.test(low)) {
    return {
      text: "Según tu brief de hoy, este es el orden que te sugiero:\n\n1. ACTUAR — La contestación de la demanda en CAS-0178-2026 vence en 2 días. Es tu único plazo fatal de la semana.\n2. REVISAR — El nuevo reglamento de teletrabajo afecta 2 casos laborales activos; conviene leer el resumen antes de tu audiencia del jueves.\n3. INFORMATIVO — El jueves a las 9:00 tienes la audiencia de conciliación de CAS-0164-2026; puedo dejarte listo el checklist y el cálculo de prestaciones.",
      citas: [{ etiqueta: "La Gaceta Nº ______, 18 ago 2026" }],
      chips: [
        "Redacta un borrador de la contestación",
        "Resume el reglamento de teletrabajo",
        "Prepárame la audiencia del jueves",
      ],
      meta: metaCosto,
    };
  }

  if (/qué más puedes|qué puedes hacer|capacidades|ayudarme con/.test(low)) {
    return {
      text: "Esto es lo que puedo hacer por ti hoy:\n\n• Buscar jurisprudencia y explicarte el criterio de cualquier sentencia (pega el expediente, ej. CL-528-24).\n• Resumir publicaciones de La Gaceta y decirte a cuáles de tus casos afectan.\n• Calcular prestaciones, aranceles y plazos procesales.\n• Redactar borradores de escritos con las citas ya insertadas.\n• Priorizar tu día con el brief de casos, Gaceta y leads.",
      chips: [
        "Explícame CL-528-24",
        "Calcula prestaciones con L15,000 y 4 años",
        "¿Qué debo priorizar hoy?",
      ],
      meta: "Sin costo",
      gratuita: true,
    };
  }

  const aperturas = [
    "Con base en las fuentes oficiales disponibles, tu consulta se resuelve así:",
    "Revisé el corpus oficial y esto es lo relevante para tu consulta:",
  ];
  return {
    text: `${aperturas[turno % aperturas.length]}\n\n1. El marco aplicable está en la legislación vigente citada abajo — reviso primero ley especial y luego la general.\n2. La Sala de lo Civil ha sostenido un criterio uniforme en los últimos 5 años sobre este punto.\n3. Te propongo el siguiente paso procesal concreto, con el plazo que corre desde la notificación.\n\n(Respuesta de demostración — el producto final consulta el corpus real de la CSJ y La Gaceta.)`,
    citas: [
      { etiqueta: "Código aplicable, art. ___" },
      { etiqueta: "Sentencia ____-2024, Sala Civil" },
      { etiqueta: "La Gaceta Nº ______" },
    ],
    chips: [
      "Dame la jurisprudencia que sustenta el punto 2",
      "Redacta este argumento para mi escrito",
      "¿Qué plazo exacto aplica?",
    ],
    meta: metaCosto,
  };
}

const BORRADOR_DEMANDA = `SEÑOR JUEZ DE LETRAS DEL TRABAJO

Yo, MARÍA CASTILLO, mayor de edad, abogada, inscrita en el CAH bajo el Nº 00000, actuando como apoderada legal del señor [NOMBRE DEL CLIENTE], respetuosamente comparezco a interponer DEMANDA ORDINARIA LABORAL POR DESPIDO INJUSTIFICADO contra [RAZÓN SOCIAL DEL EMPLEADOR], conforme a los hechos y fundamentos siguientes:

PRIMERO — RELACIÓN LABORAL. Mi representado laboró para la demandada desde el [FECHA DE INGRESO], desempeñando el cargo de [CARGO], con salario mensual de L 15,000.00.

SEGUNDO — DEL DESPIDO. El día [FECHA DEL DESPIDO] la demandada dio por terminada la relación laboral sin causa justificada ni el preaviso de ley (Código del Trabajo, art. ___).

TERCERO — PRESTACIONES RECLAMADAS. Con base en el criterio sostenido en CAT-____-2025:
  · Cesantía (4 años): L 60,000.00
  · Preaviso (2 meses): L 30,000.00
  · Vacaciones proporcionales: L 7,500.00
  · 13º y 14º mes proporcionales: L 15,000.00
  TOTAL RECLAMADO: L 112,500.00

PETICIÓN. Admitir la presente demanda, tener por acompañados los documentos que se adjuntan y, previo el trámite de ley, condenar a la demandada al pago de las prestaciones reclamadas más costas.

Tegucigalpa, M.D.C., [FECHA].

________________________
Abg. María Castillo
CAH Nº 00000`;
