import type {
  DocumentoValidacion,
  Lead,
  Notificacion,
  PerfilAbogado,
  Plan,
  Plantilla,
  RespuestaConsulta,
} from "@/types/dominio";

/**
 * Catálogo canónico de planes — FUENTE ÚNICA DE VERDAD de precios (§0.5).
 * Ningún componente escribe "L130" inline: todo sale de aquí.
 *
 * Modelo del proyecto (`justihn/CLAUDE.md` §2): la escalera es por cuota de IA,
 * no por contenido — todo el corpus está disponible en todos los planes.
 */
export const PLANES: Plan[] = [
  {
    id: "gratis",
    nombre: "Gratis",
    resumen: "Para conocer el sistema",
    precioLempiras: 0,
    precioEtiqueta: "L0",
    periodo: "/mes",
    precioAnualLempiras: 0,
    precioAnualEtiqueta: "L0",
    periodoAnual: "/año",
    colorEtiqueta: "var(--color-texto-4)",
    features: [
      "Búsqueda limitada de jurisprudencia",
      "Perfil en el directorio",
      "Comunidad y consultorio",
    ],
    cuotaIa: 0,
    destacado: false,
  },
  {
    id: "profesional",
    nombre: "Profesional",
    resumen: "Para el ejercicio de todos los días",
    precioLempiras: 147,
    precioEtiqueta: "L147",
    periodo: "/mes",
    precioAnualLempiras: 1176,
    precioAnualEtiqueta: "L1,176",
    periodoAnual: "/año",
    colorEtiqueta: "var(--color-celeste)",
    features: [
      "Mis casos: expediente por cliente, checklist y plazos",
      "Jurisprudencia y legislación ilimitadas",
      "Alertas de Gaceta por materia",
      "Jus IA con citas verificadas (60/mes)",
      "Soporte por WhatsApp",
    ],
    cuotaIa: 60,
    // El recomendado (decisión Wesley 2026-08-30): es el que cubre el
    // ejercicio diario y el escalón de entrada al pago. `destacado` es la
    // ÚNICA fuente de esa recomendación — de aquí salen la insignia y el
    // realce en la landing de abogados, en su versión black, en la card
    // puente de la home ciudadana y en la pantalla de planes del portal.
    destacado: true,
  },
  {
    id: "premium",
    nombre: "Premium",
    resumen: "Para quien vive de litigar",
    precioLempiras: 267,
    precioEtiqueta: "L267",
    periodo: "/mes",
    precioAnualLempiras: 2136,
    precioAnualEtiqueta: "L2,136",
    periodoAnual: "/año",
    colorEtiqueta: "var(--color-dorado)",
    features: [
      "Jus IA con citas ilimitada",
      "Propuestas de honorarios generadas desde el trámite",
      "Modelos de escritos editables, incluidos los notariales",
      "Calculadoras y análisis de documentos",
      "Monitoreo de nombres",
      "Prioridad en leads del directorio",
    ],
    cuotaIa: null,
    destacado: false,
  },
];

export const CUOTA_BASE = 60;

/**
 * Tácticas de conversión definidas en el modelo de negocio (§2 del CLAUDE.md).
 * Los precios anuales viven en cada plan (`precioAnualEtiqueta`), no aquí.
 */
export const OFERTA = {
  anclaPrimerMes: "L25",
  descuentoAnual: "−33%",
} as const;

export function getPlan(id: string): Plan | undefined {
  return PLANES.find((p) => p.id === id);
}

/**
 * TODO(data): tabla `plantillas` con el archivo .docx en Supabase Storage.
 * Las `vistaPrevia` son aperturas de demostración con [corchetes] por completar
 * — el texto final lo valida el socio abogado (backlog #5 del proyecto).
 */
/**
 * Los modelos notariales (auténticas, acta de matrimonio) nacen el 2026-09-02
 * del feedback de un abogado. Son BORRADORES de estructura para revisión del
 * socio: no citan artículos del Código del Notariado porque esa norma no está
 * en ninguna fuente estatal legible (ver `actos-notariales.ts`).
 */
export const PLANTILLAS: Plantilla[] = [
  {
    id: "autentica-firma",
    tipo: "Notarial",
    nombre: "Razón de autenticación de firma",
    desc: "Borrador de estructura — pendiente de revisión del socio.",
    vistaPrevia:
      "El infrascrito Notario, [NOMBRE], con exequátur número [___], DA FE: que la firma que antecede, puesta al pie del documento [DESCRIPCIÓN], es auténtica por haber sido puesta en mi presencia, en esta fecha, por [NOMBRE DEL COMPARECIENTE], mayor de edad, [ESTADO CIVIL], [PROFESIÓN], de este domicilio, a quien identifico con su documento de identidad número [___].\n\n[CIUDAD], [FECHA].",
  },
  {
    id: "autentica-copia",
    tipo: "Notarial",
    nombre: "Razón de autenticación de copia",
    desc: "Borrador de estructura — pendiente de revisión del socio.",
    vistaPrevia:
      "El infrascrito Notario, [NOMBRE], con exequátur número [___], DA FE: que la presente fotocopia, compuesta de [N] folios, es fiel y conforme con su original, documento [DESCRIPCIÓN], que he tenido a la vista y devuelvo a la persona interesada.\n\n[CIUDAD], [FECHA].",
  },
  {
    id: "acta-matrimonio-notarial",
    tipo: "Notarial",
    nombre: "Acta de matrimonio civil ante notario",
    desc: "Comparecencia, lectura de los artículos 40, 41, 42, 64, 68 y 70 y régimen patrimonial (art. 30 C. de Familia).",
    vistaPrevia:
      "En la ciudad de [CIUDAD], a los [___] días del mes de [___] de [AÑO], ante mí, [NOTARIO], Notario Público con exequátur número [___], comparecen [CONTRAYENTE 1] y [CONTRAYENTE 2], mayores de edad, [ESTADOS CIVILES], [PROFESIONES], de este domicilio, con identidades número [___] y [___], acompañados de los testigos [TESTIGO 1] y [TESTIGO 2], mayores de edad, no parientes de los contrayentes…\n\nDI LECTURA de viva voz a los artículos 40, 41, 42, 64, 68 y 70 del Código de Familia y, preguntados los contrayentes si comprenden sus alcances y persisten en formalizar el matrimonio, respondieron afirmativamente, adoptando el régimen patrimonial de [RÉGIMEN]…",
  },
  {
    id: "divorcio-mutuo",
    tipo: "Familia",
    nombre: "Solicitud de divorcio por mutuo consentimiento",
    desc: "Con convenio regulador incluido.",
    vistaPrevia:
      "SEÑOR JUEZ DE LETRAS DE FAMILIA DE [CIUDAD]\n\nNosotros, [NOMBRE CÓNYUGE 1] y [NOMBRE CÓNYUGE 2], mayores de edad, de este domicilio, con identidades número [___], comparecemos ante usted con el respeto debido a promover SOLICITUD DE DIVORCIO POR MUTUO CONSENTIMIENTO, acompañando el convenio regulador suscrito por ambos…\n\nPRIMERO: Contrajimos matrimonio civil el [FECHA], inscrito bajo partida número [___] del Registro Nacional de las Personas…",
  },
  {
    id: "despido-injustificado",
    tipo: "Laboral",
    nombre: "Demanda por despido injustificado",
    desc: "Cálculo de prestaciones anexo.",
    vistaPrevia:
      "SEÑOR JUEZ DE LETRAS DEL TRABAJO DE [CIUDAD]\n\nYo, [NOMBRE DEL TRABAJADOR], mayor de edad, [profesión u oficio], comparezco a interponer DEMANDA ORDINARIA LABORAL por despido injustificado contra [NOMBRE DEL PATRONO], con domicilio en [___]…\n\nHECHOS. PRIMERO: Inicié la relación laboral el [FECHA], devengando un salario mensual de L[___], desempeñando el cargo de [___]. SEGUNDO: El [FECHA DEL DESPIDO] fui despedido sin causa justificada ni pago de prestaciones…",
  },
  {
    id: "nulidad-contrato",
    tipo: "Civil",
    nombre: "Demanda de nulidad de contrato",
    desc: "Vía proceso ordinario.",
    vistaPrevia:
      "SEÑOR JUEZ DE LETRAS DE LO CIVIL DE [CIUDAD]\n\nYo, [NOMBRE], mayor de edad, comparezco a promover DEMANDA DE NULIDAD DE CONTRATO en proceso ordinario contra [DEMANDADO], fundándome en los hechos y consideraciones de derecho siguientes…\n\nHECHOS. PRIMERO: El [FECHA] las partes suscribieron el contrato de [___], cuya nulidad se pretende por [causal: vicio del consentimiento / objeto ilícito / falta de formalidad]…",
  },
  {
    id: "constitucion-sociedad",
    tipo: "Mercantil",
    nombre: "Escritura de constitución de sociedad",
    desc: "S. de R.L. y S.A.",
    vistaPrevia:
      "INSTRUMENTO PÚBLICO NÚMERO [___]. En la ciudad de [CIUDAD], a los [___] días del mes de [___] de [AÑO], ante mí, [NOTARIO], comparecen [SOCIO 1] y [SOCIO 2], quienes constituyen una SOCIEDAD DE RESPONSABILIDAD LIMITADA que se regirá por las cláusulas siguientes…\n\nPRIMERA (Denominación y domicilio): La sociedad girará bajo la denominación [___] S. de R.L., con domicilio en [___]…",
  },
  {
    id: "recurso-amparo",
    tipo: "Constitucional",
    nombre: "Recurso de amparo",
    desc: "Contra acto administrativo.",
    vistaPrevia:
      "HONORABLE SALA DE LO CONSTITUCIONAL DE LA CORTE SUPREMA DE JUSTICIA\n\nYo, [NOMBRE], actuando en mi condición de [___], interpongo RECURSO DE AMPARO contra [AUTORIDAD RECURRIDA] por el acto administrativo consistente en [___], que vulnera mis derechos constitucionales de [___]…\n\nHECHOS. PRIMERO: Con fecha [FECHA] la autoridad recurrida emitió [resolución/acto] número [___], notificada el [FECHA]…",
  },
  {
    id: "poder-general",
    tipo: "Notarial",
    nombre: "Poder general de administración",
    desc: "Formato protocolizable.",
    vistaPrevia:
      "INSTRUMENTO PÚBLICO NÚMERO [___]. En la ciudad de [CIUDAD], a los [___] días del mes de [___] de [AÑO], ante mí, [NOTARIO], comparece [PODERDANTE], quien otorga PODER GENERAL DE ADMINISTRACIÓN amplio y suficiente a favor de [APODERADO]…\n\nFACULTADES: administrar los bienes del poderdante, celebrar contratos de arrendamiento, cobrar rentas y frutos, representarlo ante autoridades administrativas…",
  },
];

/**
 * TODO(data): tabla `leads` — consultas del consultorio gratuito (Vía B).
 * `creadoEn` son instantes FIJOS (hora de Honduras): el «hace 2 h» que se ve
 * en pantalla sale del reloj del visitante, así que con el tiempo estos leads
 * dirán «hace 3 semanas» — que es la verdad de un seed, no un defecto. Las
 * filas reales de Fase 2 traen su `creado_en` y el mismo componente las pinta.
 */
export const LEADS: Lead[] = [
  {
    id: "lead-2408",
    materia: "Laboral",
    ciudad: "San Pedro Sula",
    creadoEn: "2026-09-02T09:20:00-06:00",
    pregunta:
      "Me despidieron después de 4 años sin darme ninguna explicación ni pagarme prestaciones. ¿Qué puedo reclamar y cuánto tiempo tengo?",
    personaId: null,
  },
  {
    id: "lead-2407",
    materia: "Familia",
    ciudad: "Tegucigalpa",
    creadoEn: "2026-09-02T06:40:00-06:00",
    pregunta:
      "Mi expareja no cumple con la pensión alimenticia acordada. ¿Cómo puedo exigir el pago?",
    personaId: null,
  },
  {
    id: "lead-2404",
    materia: "Civil",
    ciudad: "La Ceiba",
    creadoEn: "2026-09-01T15:10:00-06:00",
    pregunta:
      "Quiero comprar un terreno pero el vendedor solo tiene un documento privado. ¿Es seguro? ¿Qué debo verificar antes?",
    personaId: null,
  },
  {
    id: "lead-2402",
    materia: "Laboral",
    ciudad: "Choloma",
    creadoEn: "2026-09-01T11:30:00-06:00",
    pregunta: "¿Es legal que mi empleador me descuente del salario los faltantes de caja?",
    personaId: null,
  },
];

/**
 * Tabla `respuestas_consulta` — las respuestas de demostración, como FILAS
 * con autor y fecha, no como un texto pegado al lead. Existen para que el
 * consultorio público pueda ENSEÑAR lo que promete: sin ellas mostraba
 * preguntas sin contestar y probaba lo contrario de su título.
 *
 * Quién firma importa (§4.5: sin autor identificable no se pinta): las
 * laborales las firma la abogada demo —por eso su portal las ve como
 * RESPONDIDAS—, y las otras dos, abogados del directorio de esa materia, así
 * que a ella le quedan consultas por responder.
 * ⚙️ Pendiente del socio: revisar estas orientaciones antes de lanzar. Son
 * generales a propósito y no citan artículos sin verificar.
 */
export const RESPUESTAS_SEED: Record<string, RespuestaConsulta[]> = {
  "lead-2408": [
    {
      abogadoId: "maria-castillo",
      texto:
        "Te corresponden cesantía, preaviso, vacaciones y aguinaldo proporcionales. Ojo con el plazo: el reclamo por despido injustificado prescribe a los dos meses desde que terminó el contrato (artículo 864 del Código del Trabajo). La Procuraduría del Trabajo asesora gratis, y conviene ir con el cálculo hecho.",
      creadoEn: "2026-09-02T10:05:00-06:00",
    },
  ],
  "lead-2407": [
    {
      abogadoId: "roberto-pineda",
      texto:
        "Puedes pedir la ejecución ante el mismo juzgado que fijó la pensión. Lleva el acta o la sentencia y el detalle de los meses no pagados: el juez puede ordenar la retención directa del salario.",
      creadoEn: "2026-09-02T08:30:00-06:00",
    },
  ],
  "lead-2404": [
    {
      abogadoId: "gabriela-nunez",
      texto:
        "Un documento privado no te hace dueño. Antes de pagar, pide en el Instituto de la Propiedad la certificación del inmueble para ver quién figura como titular y si tiene gravámenes; la compraventa se formaliza en escritura pública ante notario y se inscribe.",
      creadoEn: "2026-09-01T18:20:00-06:00",
    },
  ],
  "lead-2402": [
    {
      abogadoId: "maria-castillo",
      texto:
        "No de forma automática. El patrono no puede descontarte del salario a discreción: los descuentos por faltantes exigen que se te haya comprobado responsabilidad y, en general, tu autorización. Guarda tus boletas de pago — son la prueba.",
      creadoEn: "2026-09-01T13:45:00-06:00",
    },
  ],
};

/**
 * Las respuestas de una consulta: las del seed más las del store, en orden
 * de llegada. Si el mismo abogado tiene una en las dos (reescribió la suya),
 * manda la del store. ÚNICO sitio que las junta: el abogado y el ciudadano
 * tienen que ver la misma lista o el portal se contradice.
 */
export function respuestasDe(
  leadId: string,
  persistidas: Record<string, RespuestaConsulta[]>,
): RespuestaConsulta[] {
  const delStore = persistidas[leadId] ?? [];
  const reescritas = new Set(delStore.map((r) => r.abogadoId));
  return [...(RESPUESTAS_SEED[leadId] ?? []).filter((r) => !reescritas.has(r.abogadoId)), ...delStore];
}

/** Los leads del seed que ya tienen respuesta — lo que las vitrinas enseñan. */
export const LEADS_RESPONDIDOS: Lead[] = LEADS.filter((l) => RESPUESTAS_SEED[l.id]?.length);

/** «Colegiación CAH Nº 00000» a partir del número. Un solo rótulo para todas las superficies. */
export function etiquetaColegiacion(numero: string): string {
  return `Colegiación CAH Nº ${numero}`;
}

export const NOTIFICACIONES: Notificacion[] = [
  {
    id: "notif-gaceta",
    icono: "gaceta",
    titulo: "Nueva publicación en Gaceta — materia Laboral",
    meta: "Reglamento de teletrabajo en el sector privado",
    creadoEn: "2026-09-02T08:10:00-06:00",
    noLeidaPorDefecto: true,
    destino: "/abogados/gaceta?materia=Laboral",
  },
  {
    id: "notif-lead",
    icono: "leads",
    titulo: "Nuevo lead en tu especialidad",
    meta: "Despido injustificado · San Pedro Sula",
    creadoEn: "2026-09-02T07:05:00-06:00",
    noLeidaPorDefecto: true,
    destino: "/abogados/leads?pendientes=1",
  },
  {
    id: "notif-digest",
    icono: "bell",
    titulo: "Tu digest semanal está listo",
    meta: "5 publicaciones en Laboral y Civil",
    creadoEn: "2026-09-01T09:00:00-06:00",
    noLeidaPorDefecto: true,
    destino: "/abogados/gaceta?digest=1",
  },
  {
    id: "notif-ia",
    icono: "ia",
    titulo: "Respuesta de Jus IA guardada en tu historial",
    meta: "Consulta sobre divorcio · 3 fuentes citadas",
    creadoEn: "2026-09-01T16:30:00-06:00",
    noLeidaPorDefecto: false,
    destino: "/abogados",
  },
  {
    id: "notif-factura",
    icono: "card",
    titulo: "Factura de agosto disponible",
    meta: "Plan Profesional · L147",
    creadoEn: "2026-08-21T10:00:00-06:00",
    noLeidaPorDefecto: false,
    destino: "/abogados/perfil",
  },
];

/**
 * Perfil demo. TODO(auth): sale de `supabase.auth.getUser()` + tabla `abogados`
 * con RLS por `abogado_id`; ningún dato de perfil se sirve sin sesión.
 */
/**
 * ⚠️ El `id` es EL MISMO que el de su ficha en `DIRECTORIO` (2026-09-02). Eran
 * dos —`demo-abogada-castillo` aquí, `maria-castillo` allá— y `getFirmante`
 * hacía de puente. En la tabla `abogados` hay una fila y un id: el perfil del
 * suscriptor y su ficha pública son dos VISTAS del mismo registro, no dos
 * registros. El store migra (v3) lo que quedó persistido con el id viejo.
 */
export const ABOGADA_DEMO: PerfilAbogado = {
  id: "maria-castillo",
  nombre: "Abg. María Castillo",
  nombreCorto: "María Castillo",
  iniciales: "MC",
  colegiacionNumero: "00000",
  ciudad: "Tegucigalpa, M.D.C.",
  bio: "Litigio laboral y civil, derecho de familia. Atiende consultas en línea.",
  especialidades: ["Laboral", "Civil", "Familia"],
  email: "maria.castillo@bufete.hn",
  whatsapp: "+504 9999-0000",
  direccion: "Col. Palmira, Tegucigalpa",
  verificado: false,
  metricas: { vistas: 86, contactos: 12, valoracion: "4.9" },
};

export const DOCUMENTOS_VALIDACION: DocumentoValidacion[] = [
  {
    id: "carne-cah",
    nombre: "Carné de colegiación (CAH)",
    meta: "PDF · subido el 12 ago 2026",
    estado: "recibido",
  },
  {
    id: "dni",
    nombre: "Documento de identidad (DNI)",
    meta: "PDF · subido el 12 ago 2026",
    estado: "recibido",
  },
  {
    id: "solvencia-cah",
    nombre: "Constancia de solvencia CAH vigente",
    meta: "Requerido para la insignia de perfil validado",
    estado: "pendiente",
  },
];

export const FAQS = [
  {
    pregunta: "¿De dónde salen las fuentes que cita Jus IA?",
    respuesta:
      "Del corpus oficial indexado: sentencias de la CSJ, legislación vigente y publicaciones de La Gaceta. Cada respuesta enlaza al documento original — si no hay fuente, Jus IA te lo dice en lugar de inventar.",
  },
  {
    pregunta: "¿Puedo usar las respuestas en mis escritos?",
    respuesta:
      'Sí. Usa "Insertar en escrito" o copia el texto con sus citas. Recuerda que Jus IA es apoyo de investigación: la responsabilidad profesional del escrito sigue siendo tuya.',
  },
  {
    pregunta: "¿Cómo funcionan las alertas de La Gaceta?",
    respuesta:
      "Suscríbete a materias en Alertas de Gaceta. Cada publicación nueva en tus materias te llega por correo y, si lo activas, en el digest semanal por WhatsApp.",
  },
  {
    pregunta: "¿Qué incluye el plan Premium?",
    respuesta:
      "Jus IA ilimitada, modelos de escritos editables, calculadoras, monitoreo de nombres y prioridad en los leads del consultorio. Puedes cambiar de plan en cualquier momento desde Mi perfil.",
  },
  {
    pregunta: "¿Cómo valido mi perfil de abogado?",
    respuesta:
      "En Mi perfil → Validación profesional sube tu carné de colegiación, tu DNI y la constancia de solvencia del CAH. Revisamos en 1–2 días hábiles y tu perfil recibe la insignia de validado.",
  },
] as const;

export const PREFERENCIAS_NOTIFICACION = [
  {
    k: "digest",
    titulo: "Digest semanal por WhatsApp",
    desc: "Resumen de Gaceta en tus materias, los lunes",
  },
  {
    k: "email",
    titulo: "Alertas de Gaceta por correo",
    desc: "Al momento de cada publicación relevante",
  },
  {
    k: "leads",
    titulo: "Nuevos leads del consultorio",
    desc: "Cuando alguien pregunta en tu especialidad",
  },
  {
    k: "nombres",
    titulo: "Monitoreo de nombres (Premium)",
    desc: "Si tu nombre o el de tu cliente aparece en publicaciones",
  },
] as const;

/** Cada ítem navega a lo que describe — el Dashboard no muestra nada inerte. */
export const ACTIVIDAD_RECIENTE = [
  {
    when: "Hoy",
    title: "Consultaste 4 sentencias de casación laboral",
    meta: 'Búsqueda: "despido injustificado"',
    destino: "/abogados/jurisprudencia",
  },
  {
    when: "Ayer",
    title: "Jus IA respondió tu consulta sobre divorcio",
    meta: "3 fuentes citadas · guardada en tu historial",
    destino: "/abogados",
  },
  {
    when: "Jue 20",
    title: "Nueva publicación en Gaceta — materia Laboral",
    meta: "Incluida en tu digest semanal",
    destino: "/abogados/gaceta/reglamento-teletrabajo-2026",
  },
  {
    when: "Mié 19",
    title: "Tu perfil apareció en 12 búsquedas del directorio",
    meta: "Especialidad: Laboral",
    destino: "/abogados/perfil",
  },
] as const;
