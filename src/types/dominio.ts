/**
 * Tipos del dominio Justihn.
 *
 * Estos shapes SON el contrato de las tablas de Supabase (Blueprint §4.2): los
 * seeds de `src/data/` se diseñan como el esquema literal que tendrán las tablas
 * en Fase 2, de modo que cablear el backend no obligue a tocar la UI.
 *
 * Origen real de cada entidad (ver `justihn/CLAUDE.md` §3):
 *   Sentencia   → API REST abierta del PJ (`sij.poderjudicial.gob.hn:5006/api/`)
 *   Publicacion → La Gaceta / ENAG (`enag.gob.hn/.../viewdocument/{id}`)
 *   Paso/fuente → legislación PJ (`legislacion.poderjudicial.gob.hn`)
 */

export type Materia =
  | "Civil"
  | "Laboral"
  | "Penal"
  | "Constitucional"
  | "Contencioso Adm."
  | "Familia"
  | "Mercantil"
  | "Notarial"
  // Nace 2026-08-31 con la guía de reclamo de consumo: sin materia propia, la
  // guía no podría recomendar abogado y el funnel guía→lead quedaría cortado.
  | "Consumidor"
  // Nace 2026-09-02 al conectar Jurisprudencia al corpus real: el CEDIJ
  // clasifica unas pocas sentencias como "Derechos Humanos Grupos Vulnerables".
  | "DD.HH.";

export type PlanId = "gratis" | "profesional" | "premium";

/** Tabla `sentencias` — corpus CSJ + cortes de apelaciones. */
export interface Sentencia {
  id: string;
  expediente: string;
  materia: Materia;
  organo: string;
  fecha: string;
  fechaIso: string;
  titulo: string;
  /** Resumen redactado por el CEDIJ — viene con la sentencia en la API del PJ. */
  resumen: string;
  ponente: string;
  fallo: string;
  extracto: string;
  /** Enlace al documento oficial. Toda cita debe poder abrirse. */
  fuenteUrl?: string;
}

/** Tabla `publicaciones_gaceta`. */
export interface PublicacionGaceta {
  id: string;
  materia: Materia;
  titulo: string;
  meta: string;
  fechaIso: string;
  resumen: string;
  /** Lectura de impacto sobre la práctica del abogado (valor del producto). */
  afecta: string;
  fuenteUrl?: string;
}

/** Tabla `nombres_vigilados` — monitoreo Pro sobre lo que el Estado publica. */
export interface NombreVigilado {
  id: string;
  nombre: string;
  /**
   * Qué es ese nombre para quien lo vigila. `cliente`/`contraparte` son del
   * abogado; `propio`/`familiar`, del ciudadano — que NO puede vigilar a
   * terceros: eso convertiría el monitoreo en acoso (§5), y para mirar a otro
   * está el Informe Verifica con sus reglas.
   */
  tipo: "propio" | "familiar" | "cliente" | "contraparte";
}

/** Tabla `codigos` + `articulos_codigo` — legislación consolidada del PJ. */
export interface ArticuloCodigo {
  /** Número o rango real del articulado (p. ej. "676" o "680–685"). */
  numero: string;
  titulo: string;
  /** Síntesis propia del contenido — NO el texto literal (ese llega con el corpus). */
  sintesis: string;
  /** Dato práctico verificado (montos, plazos) que merece destacarse. */
  nota?: string;
  /** Enlaza la herramienta que aplica la regla (p. ej. calculadora de vía). */
  herramienta?: { etiqueta: string; href: string };
}

export interface Codigo {
  id: string;
  nombre: string;
  decreto: string;
  materia: Materia;
  /** "muestra" = artículos verificados cargados · "preparacion" = llega con el corpus. */
  estado: "muestra" | "preparacion";
  /** PDF oficial íntegro (host de la whitelist §3.3). */
  fuenteUrl?: string;
  descripcion: string;
  articulos: ArticuloCodigo[];
}

/** Tabla `procesos` + `pasos_proceso` — el "paso a paso" con fuente citada. */
export interface PasoProceso {
  titulo: string;
  detalle: string;
  fuente: string;
  fuenteUrl?: string;
  /** Detalle expandible: qué llevar, cuándo y qué error evitar. */
  documentos?: string[];
  plazo?: string;
  nota?: string;
}

export interface Proceso {
  id: string;
  nombre: string;
  materia: Materia;
  pasos: PasoProceso[];
  /** Plantilla de escrito que acompaña el proceso (id en `PLANTILLAS`). */
  plantillaId?: string;
}

/** Tabla `plantillas` — escritos editables (plan Pro). */
export interface Plantilla {
  id: string;
  tipo: Materia;
  nombre: string;
  desc: string;
  /** Primeros párrafos del escrito — visibles para todos; editar exige Pro. */
  vistaPrevia: string;
}

/** Tabla `leads` — consultas del consultorio gratuito (Vía B del modelo). */
/**
 * Una respuesta del consultorio.
 *
 * Es una LISTA por consulta, no un texto: varios abogados responden la misma
 * pregunta y la persona compara antes de escribirle a uno (patrón Jusbrasil,
 * decisión Wesley 2026-08-31). Antes era `Record<leadId, string>` y el segundo
 * abogado en responder habría borrado al primero — mientras el portal del
 * abogado ya decía "tu respuesta + N de otros abogados".
 *
 * TODO(data): tabla `respuestas_consulta` con FK a `consultas` y `abogados`.
 */
export interface RespuestaConsulta {
  /** `id` del directorio, o el de la abogada demo. */
  abogadoId: string;
  texto: string;
  cuando: string;
}

/**
 * Un mensaje que la persona le envía a un abogado desde su perfil.
 *
 * Vive DENTRO de Justihn a propósito (§4.5): sacar el contacto a WhatsApp en el
 * primer toque dejaría al abogado sin poder demostrar cuántos contactos le
 * trajo la plataforma — que es lo que sostiene que pague la suscripción.
 *
 * TODO(data): tabla `mensajes_abogado` con FK a `abogados` y `personas`, y RLS
 * a las dos puntas: solo el remitente y el destinatario lo leen.
 */
export interface MensajeAbogado {
  abogadoId: string;
  /** Materia del asunto — el abogado necesita saber de qué le hablan. */
  materia: Materia;
  texto: string;
  cuando: string;
}

export interface Lead {
  id: string;
  materia: Materia;
  ciudad: string;
  cuando: string;
  nuevo: boolean;
  respuestas: number;
  pregunta: string;
  /**
   * Respuesta de demostración, para que el consultorio público pueda ENSEÑAR
   * lo que promete. Sin esto la sección mostraba preguntas sin contestar —
   * decía "te responde un abogado colegiado" y probaba lo contrario.
   * ⚙️ Pendiente del socio: revisar estas orientaciones antes de lanzar. Son
   * generales a propósito y no citan artículos sin verificar.
   */
  respuestaDemo?: string;
}

/** Tabla `notificaciones`. */
export interface Notificacion {
  id: string;
  icono: "gaceta" | "leads" | "bell" | "ia" | "card";
  titulo: string;
  meta: string;
  cuando: string;
  /** Estado inicial; el "leído" real vive por usuario. */
  noLeidaPorDefecto: boolean;
  destino: string;
}

/** Catálogo canónico de planes — fuente única de verdad de precios (§0.5). */
export interface Plan {
  id: PlanId;
  nombre: string;
  /** Para quién es el plan, en una línea — se muestra bajo el nombre. */
  resumen: string;
  precioLempiras: number;
  precioEtiqueta: string;
  periodo: string;
  /** Pago anual con el descuento de la oferta (−33%): "pagas 8 meses". */
  precioAnualLempiras: number;
  precioAnualEtiqueta: string;
  periodoAnual: string;
  colorEtiqueta: string;
  features: string[];
  /** Cuota mensual de Jus IA; `null` = ilimitada. */
  cuotaIa: number | null;
  destacado: boolean;
}

// ── Conversación con Jus IA ────────────────────────────────────────────────

export interface Cita {
  etiqueta: string;
  url?: string;
  /** Número de fuente ([1], [2]…) cuando la respuesta referencia por número:
   *  el mismo que aparece en superíndice dentro del texto. */
  numero?: number;
}

export interface TarjetaSentencia {
  sentenciaId: string;
  materia: Materia;
  expediente: string;
  titulo: string;
  meta: string;
  fallo: string;
}

export interface Adjunto {
  nombre: string;
  meta: string;
}

export interface EscritoGenerado {
  titulo: string;
  cuerpo: string;
}

export interface MensajeChat {
  id: string;
  who: "u" | "a";
  text: string;
  citas?: Cita[];
  /** Filas clave-valor; la última se renderiza como total. */
  tabla?: [string, string][];
  tarjeta?: TarjetaSentencia;
  chips?: string[];
  /** Costo mostrado al pie de la respuesta ("Usó 1 crédito · quedan N"). */
  meta?: string;
  adjunto?: Adjunto;
  escrito?: EscritoGenerado;
}

export interface ConversacionGuardada {
  id: string;
  titulo: string;
  fecha: string;
  mensajes: MensajeChat[];
}

/** Triaje diario: casos, Gaceta y leads en un solo veredicto. */
export interface ItemBrief {
  id: string;
  veredicto: "ACTUAR" | "REVISAR" | "INFO";
  referencia: string;
  urgencia?: string;
  titulo: string;
  pregunta: string;
  /** Verbo contextual del CTA — muestra que Jus IA entiende el ítem, no un "preguntar" genérico. */
  accion: string;
}

/** Documento de validación profesional ante el CAH. */
export interface DocumentoValidacion {
  id: string;
  nombre: string;
  meta: string;
  estado: "recibido" | "pendiente";
}

/** Tabla `abogados` — perfil del suscriptor. */
export interface PerfilAbogado {
  id: string;
  nombre: string;
  nombreCorto: string;
  iniciales: string;
  colegiacion: string;
  ciudad: string;
  bio: string;
  especialidades: Materia[];
  email: string;
  whatsapp: string;
  direccion: string;
  verificado: boolean;
  metricas: { vistas: number; contactos: number; valoracion: string };
}
