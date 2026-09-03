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

/**
 * Tabla `codigos` (`automatizaciones/legislacion/esquema/01-legislacion.sql`,
 * cargada el 2026-09-01 con Trabajo · Familia · Procesal Civil) más lo que la
 * tabla NO guarda y la pantalla sí necesita: decreto, materia y descripción.
 * El texto de los artículos vive en `articulos` y se lee por
 * `lib/corpus/legislacion.ts` — aquí ya no hay síntesis: hay artículos reales.
 */
export interface ArticuloDestacado {
  /** Número real del articulado («120», «120-A»). UNO, para enlazar su ruta. */
  numero: string;
  /**
   * Rótulo propio para reconocerlo de un vistazo — el CEDIJ solo titula los
   * artículos del CPC; los del Trabajo y Familia no llevan rúbrica.
   */
  titulo: string;
  /** Dato práctico verificado contra el PDF oficial (montos, plazos). */
  nota?: string;
  /** La herramienta del producto que aplica la regla. */
  herramienta?: { etiqueta: string; href: string };
}

export interface Codigo {
  /** = `codigos.id` — el mismo id que usa el pipeline de ingesta. */
  id: string;
  /** = `codigos.nombre`. */
  nombre: string;
  decreto: string;
  materia: Materia;
  /** "cargado" = artículo por artículo en Supabase · "preparacion" = sin fuente estatal legible. */
  estado: "cargado" | "preparacion";
  /** = `codigos.fuente_url` (PDF oficial del CEDIJ, host de la whitelist §3.3). Solo los cargados. */
  fuenteUrl?: string;
  descripcion: string;
  /** Artículos que el producto ya usa en otra pantalla, con su herramienta. */
  destacados: ArticuloDestacado[];
  /** Por qué no está, cuando no está: el hueco se explica (§4.5). */
  motivoPendiente?: string;
}

/**
 * Una cita que se puede ABRIR. `url` es una ruta del portal (el artículo en
 * Legislación, una sentencia en Jurisprudencia) o un PDF oficial abierto en
 * su página; `procesos.test.ts` no admite otra cosa. Contrato de la tabla
 * `citas_paso` (paso → n citas).
 */
export interface FuenteCita {
  /** «Código de Familia, art. 244». */
  etiqueta: string;
  url: string;
}

/** Tabla `procesos` + `pasos_proceso` — el "paso a paso" con fuente citada. */
export interface PasoProceso {
  titulo: string;
  detalle: string;
  /** Al menos una: sin fuente no hay paso (regla #1). */
  fuentes: FuenteCita[];
  /** Detalle expandible: qué llevar, cuándo y qué error evitar. */
  documentos?: string[];
  plazo?: string;
  nota?: string;
}

export interface Proceso {
  id: string;
  nombre: string;
  materia: Materia;
  /** Para quién y qué cambia: el dato que decide si este es el proceso. */
  resumen: string;
  /** Las normas de las que salen las citas, para el sello de la cabecera. */
  fuentesOficiales: string[];
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

// ── Despacho: casos y propuestas (nacen 2026-09-02 del feedback de un abogado) ──

/** De qué nace un caso: un acto notarial, un trámite ante una institución o un proceso judicial. */
export type TipoCaso = "notarial" | "tramite" | "proceso";

/** Un documento del expediente y si ya lo entregó el cliente. */
export interface DocumentoCaso {
  titulo: string;
  /** Artículo que lo exige, si la fuente está cargada. */
  fuente?: string;
  recibido: boolean;
}

/** Un vencimiento que el expediente vigila. */
export interface PlazoCaso {
  id: string;
  titulo: string;
  /** Día (YYYY-MM-DD). */
  fechaIso: string;
}

/**
 * Tabla `casos` — el expediente por cliente («Mis casos», pantalla #16,
 * desbloqueada por el feedback de #4 del producto). El checklist nace del
 * origen (`actos-notariales.ts` o la guía de `tramites.ts`) al crearlo y desde
 * ahí es del caso: si la guía cambia, un expediente ya abierto no pierde lo
 * que el cliente ya entregó. RLS por `abogado_id`.
 */
export interface Caso {
  id: string;
  abogadoId: string;
  cliente: {
    nombre: string;
    /** 13 dígitos sin guiones (`lib/identidad.ts`). */
    identidad?: string;
    telefono?: string;
    correo?: string;
  };
  tipo: TipoCaso;
  /** id del acto notarial, del trámite o del proceso, según `tipo`. */
  referenciaId: string;
  titulo: string;
  estado: "abierto" | "en_tramite" | "cerrado";
  documentos: DocumentoCaso[];
  plazos: PlazoCaso[];
  notas: string;
  /** Propuesta de honorarios vinculada, si la hay. */
  propuestaId?: string;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Tabla `propuestas_honorarios`. Guarda SOLO lo que escribió el abogado; el
 * documento (servicios, requisitos, advertencias) se deriva de la guía en
 * cada render con `lib/honorarios.ts` — un solo dato de origen (§4.4).
 */
export interface PropuestaHonorarios {
  id: string;
  abogadoId: string;
  casoId?: string;
  origen: { tipo: TipoCaso; referenciaId: string };
  cliente: { nombre: string; rtn?: string; atencion?: string };
  referencia: string;
  /** Día de la propuesta (YYYY-MM-DD). */
  fechaIso: string;
  /** Lempiras. */
  honorarios: number;
  /** «en un solo pago» · «50% al inicio y 50% a la entrega» … */
  formaPago: string;
  notas?: string;
  creadoEn: string;
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
