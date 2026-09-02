/**
 * Jurisprudencia sobre el corpus REAL: la tabla `sentencias` de Supabase
 * (19.742 fichas del CEDIJ, 17.319 legibles con la clave `anon` — el resto
 * son las reservadas por §5, que RLS hace invisibles).
 *
 * Solo servidor. Habla con PostgREST por `fetch`, igual que `supabase.ts`, y
 * por las mismas razones: una sola llamada no justifica el SDK, y la clave
 * `anon` es la única que entra en este repo.
 *
 * Dos modos de búsqueda, decididos el 2026-09-02:
 *  · **Por palabras** (el modo por defecto): Postgres puro, sin LLM ni
 *    embeddings — ILIKE sobre el resumen del CEDIJ y el expediente, con conteo
 *    exacto y paginación de verdad. Es lo que un abogado espera de un buscador
 *    de jurisprudencia: «dame todas las de cesantía, las más recientes primero».
 *  · **Por significado**: vectoriza la consulta (~US$0,00002) y usa el mismo
 *    RPC `buscar_corpus` que Jus IA. Devuelve las 30 más afines, sin páginas:
 *    un ranking semántico no tiene «página 7». Sirve para lo que las palabras
 *    no encuentran («me despidieron estando embarazada» no dice «fuero»).
 *
 * ⚠️ La búsqueda por NOMBRE de parte (Monitoreo, Mi nombre, Verifica) necesita
 * la columna `sentencias.partes` de la migración `03-partes.sql`. ILIKE sobre
 * `texto` NO sirve: medido el 2026-09-02, un término inexistente tarda 2,2 s
 * (barrido secuencial de 192 MB) y cae por `statement timeout` a los 3 s. Hasta
 * que la migración se pase, `buscarAparicionesCorpus` lo dice (`disponible:
 * false`) y las pantallas siguen sobre el piloto, avisándolo.
 */
import type { Materia, Sentencia } from "@/types/dominio";
import { vectorizar } from "./embeddings";
import {
  parsearFicha,
  normalizarNombre,
  rolDeParte,
  sinHueco,
  tituloDeFicha,
  type FichaJurisprudencial,
} from "./ficha";
import { buscarCorpus } from "./supabase";
import {
  LIMITE_SEMANTICO,
  MATERIAS_CORPUS,
  materiaDb,
  POR_PAGINA,
  TIPOS_PROCESO,
  type TipoProcesoId,
} from "./catalogo";

// ── Catálogos ──────────────────────────────────────────────────────────────
// Viven en `catalogo.ts` (puro, sin `process.env`) porque la pantalla los
// necesita para pintar los selects y este módulo es solo de servidor.
export {
  LIMITE_SEMANTICO,
  MATERIAS_CORPUS,
  materiaDb,
  POR_PAGINA,
  TIPOS_PROCESO,
  type TipoProcesoId,
} from "./catalogo";

/**
 * Umbral del modo semántico: el mismo 0,45 de Jus IA, y medido otra vez sobre
 * el corpus completo el 2026-09-02. Con 0,35, «régimen fiscal de las
 * criptomonedas en Islandia» devolvía 15 sentencias hondureñas (0,36–0,40):
 * sobre 17.000 fichas el ruido sube a 0,40, mientras lo pertinente sigue
 * puntuando 0,58–0,70. Un resultado que no tiene que ver con lo buscado es
 * peor que una lista corta.
 */
const UMBRAL_SEMANTICO = 0.45;

// ── Filas y mapeo ──────────────────────────────────────────────────────────

interface FilaSentencia {
  record_id: number;
  expediente: string;
  materia: string;
  organo: string | null;
  magistrado: string | null;
  fecha_sentencia: string | null;
  proceso: string | null;
  resumen_cedij: string | null;
  fuente_url: string;
  texto: string;
}

const COLUMNAS =
  "record_id,expediente,materia,organo,magistrado,fecha_sentencia,proceso,resumen_cedij,fuente_url,texto";

/** Una sentencia del corpus, con su ficha parseada. Extiende el contrato del seed. */
export interface SentenciaCorpus extends Sentencia {
  recordId: number;
  proceso: string | null;
  ficha: FichaJurisprudencial;
  /** Solo en el modo semántico. */
  similitud?: number;
}

function materiaCorta(db: string): Materia {
  const m = MATERIAS_CORPUS.find((x) => x.db === db);
  // Una materia nueva del CEDIJ no debe romper la pantalla: se enseña sin el
  // prefijo «Derecho », que es lo más parecido a la etiqueta corta.
  return m?.etiqueta ?? (db.replace(/^Derecho\s+/, "") as Materia);
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** «2026-01-13» → «13 ene 2026», sin pasar por Date (evita el desfase de zona). */
export function fechaCorta(iso: string | null): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "sin fecha";
  return `${Number(m[3])} ${MESES[Number(m[2]) - 1]} ${m[1]}`;
}

export function filaASentencia(fila: FilaSentencia): SentenciaCorpus {
  const ficha = parsearFicha(fila.texto);
  const problema = ficha.problemas[0];
  return {
    id: String(fila.record_id),
    recordId: fila.record_id,
    expediente: fila.expediente,
    materia: materiaCorta(fila.materia),
    // `organo` de la tabla es el tribunal de PROCEDENCIA, no quien resolvió:
    // en la card se leería como si la Corte de Apelaciones hubiera dictado la
    // casación. Toda sentencia del corpus la dictó la CSJ; la procedencia va
    // en la ficha, con su rótulo.
    organo: "Corte Suprema de Justicia",
    fecha: fechaCorta(fila.fecha_sentencia),
    fechaIso: fila.fecha_sentencia ?? "",
    titulo: tituloDeFicha(ficha, { expediente: fila.expediente, proceso: fila.proceso }),
    resumen: fila.resumen_cedij ?? ficha.hechos ?? "",
    ponente: ficha.ponente ?? sinHueco(fila.magistrado) ?? "No consta en la ficha",
    fallo: ficha.fallo ?? "No consta en la ficha",
    extracto: problema?.consideraciones ?? problema?.respuesta ?? "",
    fuenteUrl: fila.fuente_url,
    proceso: fila.proceso,
    ficha,
  };
}

// ── PostgREST ──────────────────────────────────────────────────────────────

function configuracion() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return { url, key };
}

interface RespuestaPostgrest<T> {
  filas: T[];
  /** Total de la consulta (cabecera `Content-Range`), si se pidió conteo. */
  total: number | null;
}

class ErrorPostgrest extends Error {
  constructor(
    public status: number,
    public codigo: string | null,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

async function consultar<T>(
  query: string,
  opciones: { desde?: number; hasta?: number; contar?: boolean } = {},
): Promise<RespuestaPostgrest<T>> {
  const { url, key } = configuracion();
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
  if (opciones.contar) headers.Prefer = "count=exact";
  if (opciones.desde !== undefined && opciones.hasta !== undefined) {
    headers.Range = `${opciones.desde}-${opciones.hasta}`;
    headers["Range-Unit"] = "items";
  }

  const res = await fetch(`${url}/rest/v1/sentencias?${query}`, {
    headers,
    // El corpus cambia con el refresco semanal y las retiradas del CEDIJ se
    // espejan: una búsqueda cacheada podría seguir listando una sentencia que
    // el Estado ya despublicó.
    cache: "no-store",
  });

  if (!res.ok && res.status !== 206) {
    let codigo: string | null = null;
    let mensaje = `PostgREST ${res.status}`;
    try {
      const cuerpo = (await res.json()) as { code?: string; message?: string };
      codigo = cuerpo.code ?? null;
      mensaje = cuerpo.message ?? mensaje;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new ErrorPostgrest(res.status, codigo, mensaje);
  }

  const filas = (await res.json()) as T[];
  const rango = res.headers.get("content-range");
  const total = rango ? Number(rango.split("/")[1]) : null;
  return { filas, total: Number.isFinite(total) ? total : null };
}

// ── Conteo ─────────────────────────────────────────────────────────────────

let conteo: { total: number; en: number } | null = null;
const CONTEO_TTL_MS = 10 * 60_000;

/** Sentencias legibles (las reservadas no cuentan: RLS no las devuelve). */
export async function contarCorpus(): Promise<number> {
  if (conteo && Date.now() - conteo.en < CONTEO_TTL_MS) return conteo.total;
  const { total } = await consultar<{ record_id: number }>("select=record_id", {
    desde: 0,
    hasta: 0,
    contar: true,
  });
  if (total === null) throw new Error("PostgREST no devolvió el conteo del corpus.");
  conteo = { total, en: Date.now() };
  return total;
}

// ── Búsqueda ───────────────────────────────────────────────────────────────

export interface FiltrosBusqueda {
  q: string;
  materia?: string;
  proceso?: TipoProcesoId | "todos";
  anio?: number | null;
}

export interface ResultadoBusqueda {
  resultados: SentenciaCorpus[];
  total: number;
  pagina: number;
  porPagina: number;
  totalCorpus: number;
  /** Algo que la UI debe decir — p. ej. que el modo semántico no pagina. */
  aviso?: string;
}

/**
 * Lo que va dentro de un patrón ILIKE de PostgREST: solo letras, dígitos y
 * guiones. Fuera comodines (`%`, `_`, `*`) y los caracteres que PostgREST usa
 * para armar `or=(...)` (comas, paréntesis, puntos, comillas). No es solo
 * higiene: una coma dentro del valor rompería la expresión entera.
 */
function palabraSegura(p: string): string {
  return p.replace(/[^\p{L}\p{N}-]+/gu, "");
}

/** ¿Parece un expediente («CL-528-24», «cl 528», «AC-834-22»)? */
function pareceExpediente(q: string): string | null {
  const m = q.trim().match(/^([a-z]{2,4})[\s-]*(\d{1,5})(?:[\s-]*(\d{2,4}))?$/i);
  if (!m) return null;
  return [m[1]!.toUpperCase(), m[2], m[3]].filter(Boolean).join("-");
}

let partesDisponible: boolean | null = null;

function filtrosComunes(f: FiltrosBusqueda): string[] {
  const partes: string[] = [];
  const db = f.materia && f.materia !== "todas" ? materiaDb(f.materia) : null;
  if (db) partes.push(`materia=eq.${encodeURIComponent(db)}`);
  const tipo =
    f.proceso && f.proceso !== "todos" ? TIPOS_PROCESO.find((t) => t.id === f.proceso) : null;
  if (tipo) partes.push(`proceso=ilike.${encodeURIComponent(`*${tipo.patron}*`)}`);
  if (f.anio) {
    partes.push(`fecha_sentencia=gte.${f.anio}-01-01`);
    partes.push(`fecha_sentencia=lte.${f.anio}-12-31`);
  }
  return partes;
}

/** El `or=(...)` del texto libre, o null si no hay nada que buscar. */
function filtroTexto(q: string, conPartes: boolean): string | null {
  const palabras = q
    .split(/\s+/)
    .map(palabraSegura)
    .filter((p) => p.length >= 2)
    .slice(0, 6);
  if (palabras.length === 0) return null;

  const enResumen =
    palabras.length === 1
      ? `resumen_cedij.ilike.*${palabras[0]}*`
      : `and(${palabras.map((p) => `resumen_cedij.ilike.*${p}*`).join(",")})`;

  const ramas = [enResumen];
  const expediente = pareceExpediente(q);
  if (expediente) ramas.push(`expediente.ilike.*${expediente}*`);
  if (conPartes) {
    // Las palabras del nombre en orden, con comodín entre ellas: «wilson
    // henriquez» encuentra «wilson pablo henriquez martinez».
    const nombre = normalizarNombre(q).split(" ").map(palabraSegura).filter(Boolean);
    if (nombre.join("").length >= 4) ramas.push(`partes.ilike.*${nombre.join("*")}*`);
  }
  return `or=(${ramas.join(",")})`;
}

/**
 * Modo por palabras. Orden: más recientes primero — ILIKE no rankea, y en
 * jurisprudencia lo reciente pesa (los criterios cambian de sala en sala).
 */
export async function buscarJurisprudencia(
  f: FiltrosBusqueda,
  pagina = 1,
): Promise<ResultadoBusqueda> {
  const desde = (pagina - 1) * POR_PAGINA;
  const totalCorpus = await contarCorpus();

  const intentar = async (conPartes: boolean) => {
    const query = [
      `select=${COLUMNAS}`,
      ...filtrosComunes(f),
      filtroTexto(f.q, conPartes),
      "order=fecha_sentencia.desc.nullslast,record_id.desc",
    ]
      .filter(Boolean)
      .join("&");
    return consultar<FilaSentencia>(query, { desde, hasta: desde + POR_PAGINA - 1, contar: true });
  };

  let respuesta: RespuestaPostgrest<FilaSentencia>;
  try {
    respuesta = await intentar(partesDisponible !== false);
    if (partesDisponible === null && f.q.trim()) partesDisponible = true;
  } catch (error) {
    // 42703 = «column does not exist»: la migración 03 no se ha pasado. Se
    // recuerda para no volver a pagar el intento, y se busca sin partes.
    if (error instanceof ErrorPostgrest && error.codigo === "42703" && partesDisponible !== false) {
      partesDisponible = false;
      respuesta = await intentar(false);
    } else {
      throw error;
    }
  }

  return {
    resultados: sinDuplicados(respuesta.filas.map(filaASentencia)),
    total: respuesta.total ?? respuesta.filas.length,
    pagina,
    porPagina: POR_PAGINA,
    totalCorpus,
  };
}

/**
 * Modo por significado: mismo RPC que Jus IA (`distinct on` por sentencia y el
 * filtro §5 dentro), los datos de la ficha se completan con una segunda
 * lectura por `record_id`. Los filtros de proceso y año se aplican en esa
 * segunda lectura: el RPC solo filtra por materia.
 */
export async function buscarPorSignificado(f: FiltrosBusqueda): Promise<ResultadoBusqueda> {
  const totalCorpus = await contarCorpus();
  const db = f.materia && f.materia !== "todas" ? materiaDb(f.materia) : null;

  const embedding = await vectorizar(f.q.trim());
  const afines = (
    await buscarCorpus(embedding, {
      materias: db ? [db] : undefined,
      limite: LIMITE_SEMANTICO,
    })
  ).filter((x) => x.similitud >= UMBRAL_SEMANTICO);

  if (afines.length === 0) {
    return { resultados: [], total: 0, pagina: 1, porPagina: LIMITE_SEMANTICO, totalCorpus };
  }

  const ids = afines.map((x) => x.record_id);
  const query = [
    `select=${COLUMNAS}`,
    `record_id=in.(${ids.join(",")})`,
    ...filtrosComunes({ ...f, materia: undefined }),
  ].join("&");
  const { filas } = await consultar<FilaSentencia>(query);

  const similitudPorId = new Map(afines.map((x) => [x.record_id, x.similitud]));
  const resultados = sinDuplicados(
    filas
      .map((fila) => ({ ...filaASentencia(fila), similitud: similitudPorId.get(fila.record_id) }))
      .sort((a, b) => (b.similitud ?? 0) - (a.similitud ?? 0)),
  );

  return {
    resultados,
    total: resultados.length,
    pagina: 1,
    porPagina: LIMITE_SEMANTICO,
    totalCorpus,
    aviso: `Hasta ${LIMITE_SEMANTICO} sentencias afines por significado, ordenadas por afinidad. Este modo no pagina.`,
  };
}

/**
 * El CEDIJ tiene sentencias publicadas DOS veces con `record_id` distinto
 * (CL-463-01: 1173 y 1224, misma fecha, mismo texto salvo 58 caracteres). En
 * una lista se leen como un bug. Se colapsan por expediente + fecha dentro de
 * lo que se va a enseñar, quedándose con la primera (la mejor puntuada en el
 * modo semántico). El conteo total no se toca: es el de la base, y mentirlo
 * para cuadrar sería peor que una página de 19.
 */
function sinDuplicados(lista: SentenciaCorpus[]): SentenciaCorpus[] {
  const vistas = new Set<string>();
  return lista.filter((s) => {
    const clave = `${s.expediente}|${s.fechaIso}`;
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
}

// ── Una sentencia ──────────────────────────────────────────────────────────

export async function getSentenciaCorpus(recordId: number): Promise<SentenciaCorpus | null> {
  if (!Number.isInteger(recordId) || recordId <= 0) return null;
  const { filas } = await consultar<FilaSentencia>(
    `select=${COLUMNAS}&record_id=eq.${recordId}&limit=1`,
  );
  return filas[0] ? filaASentencia(filas[0]) : null;
}

/** Para los enlaces viejos por slug del seed («cl-528-24») y para Jus IA. */
export async function getRecordIdPorExpediente(expediente: string): Promise<number | null> {
  const exp = pareceExpediente(expediente);
  if (!exp) return null;
  const { filas } = await consultar<{ record_id: number }>(
    `select=record_id&expediente=eq.${encodeURIComponent(exp)}&limit=1`,
  );
  return filas[0]?.record_id ?? null;
}

/**
 * Tres sentencias de la misma materia y el mismo tipo de proceso, las más
 * recientes. No es «relacionadas por parecido» —eso costaría un embedding por
 * ficha abierta—: es «lo último que dijo la misma sala sobre esta rama».
 */
export async function getRelacionadas(actual: SentenciaCorpus): Promise<SentenciaCorpus[]> {
  const db = materiaDb(actual.materia);
  const tipo = TIPOS_PROCESO.find((t) => actual.proceso?.includes(t.patron));
  const query = [
    `select=${COLUMNAS}`,
    `record_id=neq.${actual.recordId}`,
    db ? `materia=eq.${encodeURIComponent(db)}` : null,
    tipo ? `proceso=ilike.${encodeURIComponent(`*${tipo.patron}*`)}` : null,
    "order=fecha_sentencia.desc.nullslast,record_id.desc",
    "limit=3",
  ]
    .filter(Boolean)
    .join("&");
  const { filas } = await consultar<FilaSentencia>(query);
  return filas.map(filaASentencia);
}

// ── Apariciones por nombre (Monitoreo · Mi nombre · Verifica) ──────────────

export interface AparicionCorpus {
  sentencia: SentenciaCorpus;
  rol: string | null;
}

export interface ResultadoApariciones {
  /** `false` hasta que exista `sentencias.partes` (migración 03). */
  disponible: boolean;
  apariciones: AparicionCorpus[];
  totalCorpus: number;
}

/** Tope de apariciones por nombre: «Estado de Honduras» aparece en miles. */
export const LIMITE_APARICIONES = 50;

export async function buscarAparicionesCorpus(nombre: string): Promise<ResultadoApariciones> {
  const totalCorpus = await contarCorpus();
  const n = normalizarNombre(nombre);
  if (n.length < 4 || partesDisponible === false) {
    return { disponible: partesDisponible !== false, apariciones: [], totalCorpus };
  }

  const patron = `*${n.replace(/ /g, "*")}*`;
  try {
    const { filas } = await consultar<FilaSentencia>(
      [
        `select=${COLUMNAS}`,
        `partes=ilike.${encodeURIComponent(patron)}`,
        "order=fecha_sentencia.desc.nullslast,record_id.desc",
        `limit=${LIMITE_APARICIONES}`,
      ].join("&"),
    );
    partesDisponible = true;
    return {
      disponible: true,
      totalCorpus,
      apariciones: filas.map((fila) => {
        const sentencia = filaASentencia(fila);
        return { sentencia, rol: rolDeParte(sentencia.ficha, nombre) };
      }),
    };
  } catch (error) {
    if (error instanceof ErrorPostgrest && error.codigo === "42703") {
      partesDisponible = false;
      return { disponible: false, apariciones: [], totalCorpus };
    }
    throw error;
  }
}
