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

/**
 * VISTA de una sentencia para la UI — NO es la tabla.
 *
 * La tabla `sentencias` existe desde el 2026-09-01 y su esquema literal está
 * en `automatizaciones/corpus-csj/esquema/01-corpus.sql` (record_id,
 * expediente, materia del CEDIJ, tribunal de procedencia, magistrado, fecha,
 * proceso, resumen_cedij, texto = la FICHA jurisprudencial, fuente_url,
 * reservada). Lo que aquí se llama `titulo`, `ponente`, `fallo`, `extracto` y
 * `organo` se DERIVA de esa ficha en `lib/corpus/sentencias.ts` (§1.7 del
 * CLAUDE.md técnico); `materia` es la etiqueta corta, mapeada en
 * `lib/corpus/catalogo.ts`. Los 12 seeds de `data/sentencias.ts` cumplen esta
 * misma forma para que Dashboard, demos y Jus IA demo sigan funcionando.
 */
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
  /**
   * Número de La Gaceta («35,807»), o `null` mientras no se conozca. Hasta el
   * 2026-09-02 era `meta: "La Gaceta Nº ___ · 19 ago 2026"`: dos campos en
   * una cadena, con la fecha repetida de `fechaIso`. `etiquetaPublicacion()`
   * los vuelve a juntar para la pantalla.
   */
  numeroGaceta: string | null;
  /** Día de publicación (YYYY-MM-DD) → `fecha_publicacion`. */
  fechaIso: string;
  resumen: string;
  /** Lectura de impacto sobre la práctica del abogado (valor del producto). */
  afecta: string;
  fuenteUrl?: string;
}

/** Tabla `nombres_vigilados` — monitoreo Pro sobre lo que el Estado publica. */
export interface NombreVigilado {
  /**
   * Hoy es un slug del nombre (`vig-<nombre normalizado>`), que de paso evita
   * duplicados. En la tabla será `uuid`, y la unicidad va por
   * (dueño, nombre normalizado): dos personas pueden vigilar el mismo nombre.
   * No cambia la UI; se anota para el esquema.
   */
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
  /** ISO 8601 → columna `creado_en`. El «hace 2 h» se calcula al pintar (`lib/tiempo.ts`). */
  creadoEn: string;
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
  /** ISO 8601 → `creado_en`. */
  creadoEn: string;
}

/**
 * Tabla `leads` — una consulta del consultorio gratuito. SOLO la fila: lo que
 * hasta el 2026-09-02 viajaba aquí y no es columna se fue a su sitio:
 *   · `nuevo` era «no leído por ESTE abogado» → estado por usuario
 *     (`leadsVistosIds` en el store, como `notifsLeidasIds`).
 *   · `respuestas` era un conteo → se deriva de `respuestas_consulta`
 *     (`respuestasDe()` en `data/catalogo.ts`).
 *   · `respuestaDemo` era la respuesta pegada al lead → ahora es una fila de
 *     `respuestas_consulta` con autor y fecha (`RESPUESTAS_SEED`).
 *   · `cuando: "hace 2 h"` → `creadoEn` y `<Cuando>` lo pinta.
 */
export interface Lead {
  id: string;
  materia: Materia;
  ciudad: string;
  /** ISO 8601 → `creado_en`. */
  creadoEn: string;
  pregunta: string;
  /**
   * `null` = consulta anónima: se publica ANTES del alta (§7.2) y se le
   * asigna dueño cuando exista la cuenta. FK a `personas`.
   */
  personaId: string | null;
}

/** Tabla `notificaciones`. */
export interface Notificacion {
  id: string;
  icono: "gaceta" | "leads" | "bell" | "ia" | "card";
  titulo: string;
  meta: string;
  /** ISO 8601 → `creado_en`. Notificaciones agrupa Hoy/Ayer/Anteriores a partir de esto. */
  creadoEn: string;
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
  /** ISO 8601 → `creado_en`. */
  creadoEn: string;
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

/**
 * Tabla `abogados` — perfil del suscriptor. `AbogadoDirectorio` (en
 * `data/directorio.ts`) es la VISTA PÚBLICA de esta misma fila: comparten `id`
 * y `verificado`; `metricas` se deriva (vistas, contactos) y `valoracion` no
 * tiene productor —no hay reseñas— así que no será columna.
 */
export interface PerfilAbogado {
  id: string;
  nombre: string;
  nombreCorto: string;
  iniciales: string;
  /**
   * Solo el número del carné del CAH («00000»). El rótulo «Colegiación CAH
   * Nº …» lo arma `etiquetaColegiacion()`: hasta el 2026-09-02 la cadena
   * completa vivía en el dato.
   */
  colegiacionNumero: string;
  ciudad: string;
  bio: string;
  especialidades: Materia[];
  email: string;
  whatsapp: string;
  direccion: string;
  verificado: boolean;
  metricas: { vistas: number; contactos: number; valoracion: string };
}
