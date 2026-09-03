/**
 * Legislación sobre el corpus REAL: las tablas `codigos` + `articulos` de
 * Supabase (`automatizaciones/legislacion/esquema/01-legislacion.sql`; 2.162
 * artículos de Trabajo, Familia y Procesal Civil, cargados el 2026-09-01 con
 * la página del PDF oficial en cada fila).
 *
 * Solo servidor. PostgREST por `fetch` con la clave `anon`, como
 * `sentencias.ts` y por las mismas razones. Los artículos no tienen reserva
 * §5 (es el texto de la ley, no hay personas), así que RLS solo da lectura.
 *
 * Dos modos, los mismos de Jurisprudencia (§1.7):
 *  · **Por número o palabras**: si la consulta es un número («120», «art
 *    120-A») se va directo al artículo; si no, ILIKE con AND entre palabras
 *    sobre el texto — medido el 2026-09-03: 0,15 s, porque son 2.162 filas
 *    de ~1 KB, no hace falta índice trigram. Ordenado por posición en el
 *    código: un código se lee en orden, no por fecha.
 *  · **Por significado**: vectoriza la consulta y usa el MISMO RPC
 *    `buscar_legislacion` que Jus IA, en los tres códigos a la vez (el RPC no
 *    filtra por código). Hasta 12 artículos, ordenados por afinidad.
 *
 * ⚠️ ILIKE no ignora tildes: «cesantia» no encuentra «cesantía». La pantalla
 * ofrece el modo por significado cuando no hay resultados, que sí lo entiende.
 */
import { ARTICULOS_SIN_TEXTO, CODIGOS_CARGADOS, getCodigo } from "@/data/legislacion";
import { vectorizar } from "./embeddings";
import { buscarLegislacion } from "./supabase";
import {
  LIMITE_SEMANTICO_ARTICULOS,
  pareceNumeroArticulo,
  parsearArticulo,
  POR_PAGINA_ARTICULOS,
  type ArticuloCorpus,
} from "./articulo";

export {
  LIMITE_SEMANTICO_ARTICULOS,
  pareceNumeroArticulo,
  parsearArticulo,
  POR_PAGINA_ARTICULOS,
  type ArticuloCorpus,
} from "./articulo";

/**
 * Umbral del modo semántico, MEDIDO sobre los 2.162 artículos el 2026-09-03:
 *
 *   pertinentes   0,51 – 0,71   (cesantía · plazo del despido · alimentos ·
 *                                monitorio · matrimonio · vacaciones)
 *   ajenas        0,19 – 0,33   (criptomonedas en Islandia · una receta ·
 *                                el wifi · el imperio romano)
 *
 * El mismo 0,45 de Jus IA y de Jurisprudencia cae en el hueco. Se mantiene
 * un solo número para los tres porque el modelo de embeddings es uno.
 */
const UMBRAL_SEMANTICO = 0.45;

// ── Filas y mapeo ──────────────────────────────────────────────────────────

interface FilaArticulo {
  id: number;
  codigo_id: string;
  numero: string;
  orden: number;
  pagina: number | null;
  texto: string;
  /** Embed por la FK `articulos.codigo_id → codigos.id`. */
  codigos: { nombre: string; fuente_url: string } | null;
}

const COLUMNAS = "id,codigo_id,numero,orden,pagina,texto,codigos(nombre,fuente_url)";

function conPagina(fuenteUrl: string, pagina: number | null): string {
  return pagina ? `${fuenteUrl}#page=${pagina}` : fuenteUrl;
}

export function filaAArticulo(fila: FilaArticulo): ArticuloCorpus {
  const { rubrica, cuerpo } = parsearArticulo(fila.texto);
  const codigo = getCodigo(fila.codigo_id);
  const fuente = fila.codigos?.fuente_url ?? codigo?.fuenteUrl ?? "";
  return {
    id: fila.id,
    codigoId: fila.codigo_id,
    codigoNombre: fila.codigos?.nombre ?? codigo?.nombre ?? fila.codigo_id,
    numero: fila.numero,
    orden: fila.orden,
    pagina: fila.pagina,
    rubrica,
    cuerpo,
    fuenteUrl: conPagina(fuente, fila.pagina),
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

async function consultar<T>(
  query: string,
  opciones: { desde?: number; hasta?: number; contar?: boolean } = {},
): Promise<{ filas: T[]; total: number | null }> {
  const { url, key } = configuracion();
  const headers: Record<string, string> = { apikey: key, Authorization: `Bearer ${key}` };
  if (opciones.contar) headers.Prefer = "count=exact";
  if (opciones.desde !== undefined && opciones.hasta !== undefined) {
    headers.Range = `${opciones.desde}-${opciones.hasta}`;
    headers["Range-Unit"] = "items";
  }
  // Los códigos cambian con una reforma, no entre dos clics; pero un
  // artículo corregido en la ingesta debe verse sin esperar a un redeploy.
  const res = await fetch(`${url}/rest/v1/articulos?${query}`, { headers, cache: "no-store" });
  if (!res.ok && res.status !== 206) {
    throw new Error(`PostgREST ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const filas = (await res.json()) as T[];
  const rango = res.headers.get("content-range");
  const total = rango ? Number(rango.split("/")[1]) : null;
  return { filas, total: Number.isFinite(total) ? total : null };
}

/** Solo letras, dígitos y guiones dentro de un patrón ILIKE (ver `sentencias.ts`). */
function palabraSegura(p: string): string {
  return p.replace(/[^\p{L}\p{N}-]+/gu, "");
}

// ── Conteo por código ──────────────────────────────────────────────────────

let conteos: { porCodigo: Record<string, number>; en: number } | null = null;
const CONTEO_TTL_MS = 10 * 60_000;

/** Cuántos artículos tiene cada código cargado (para la columna de códigos). */
export async function contarArticulos(): Promise<Record<string, number>> {
  if (conteos && Date.now() - conteos.en < CONTEO_TTL_MS) return conteos.porCodigo;
  const pares = await Promise.all(
    CODIGOS_CARGADOS.map(async (c) => {
      const { total } = await consultar<{ id: number }>(
        `select=id&codigo_id=eq.${encodeURIComponent(c.id)}`,
        { desde: 0, hasta: 0, contar: true },
      );
      return [c.id, total ?? 0] as const;
    }),
  );
  conteos = { porCodigo: Object.fromEntries(pares), en: Date.now() };
  return conteos.porCodigo;
}

// ── Búsqueda ───────────────────────────────────────────────────────────────

export interface FiltrosArticulos {
  /** Código cargado, o `null` para buscar en todos. */
  codigoId: string | null;
  q: string;
}

export interface ResultadoArticulos {
  articulos: ArticuloCorpus[];
  total: number;
  pagina: number;
  porPagina: number;
  /** Algo que la UI debe decir — p. ej. que el número pedido no tiene texto. */
  aviso?: string;
}

/** El `or=(...)`/`and` del texto libre, o null si no hay nada que buscar. */
function filtroPalabras(q: string): string[] {
  return q
    .split(/\s+/)
    .map(palabraSegura)
    .filter((p) => p.length >= 2)
    .slice(0, 6)
    .map((p) => `texto=ilike.${encodeURIComponent(`*${p}*`)}`);
}

/**
 * Modo por número o palabras. Sin consulta, lista el código en orden: es
 * la forma de LEER un código, no solo de buscar en él.
 */
export async function buscarArticulos(
  f: FiltrosArticulos,
  pagina = 1,
): Promise<ResultadoArticulos> {
  const desde = (pagina - 1) * POR_PAGINA_ARTICULOS;
  const numero = pareceNumeroArticulo(f.q);
  const partes = [`select=${COLUMNAS}`];
  if (f.codigoId) partes.push(`codigo_id=eq.${encodeURIComponent(f.codigoId)}`);
  if (numero) partes.push(`numero=eq.${encodeURIComponent(numero)}`);
  else partes.push(...filtroPalabras(f.q));
  partes.push("order=codigo_id.asc,orden.asc");

  const { filas, total } = await consultar<FilaArticulo>(partes.join("&"), {
    desde,
    hasta: desde + POR_PAGINA_ARTICULOS - 1,
    contar: true,
  });

  const resultado: ResultadoArticulos = {
    articulos: filas.map(filaAArticulo),
    total: total ?? filas.length,
    pagina,
    porPagina: POR_PAGINA_ARTICULOS,
  };
  if (numero && resultado.total === 0) {
    const sinTexto = f.codigoId
      ? ARTICULOS_SIN_TEXTO[f.codigoId]?.includes(numero)
      : Object.values(ARTICULOS_SIN_TEXTO).some((l) => l.includes(numero));
    if (sinTexto) {
      resultado.aviso = `El artículo ${numero} existe en el código, pero su encabezado no está en la capa de texto del PDF oficial: su contenido quedó dentro del artículo anterior. Ábrelo en el PDF para leerlo.`;
    }
  }
  return resultado;
}

/**
 * Modo por significado: el mismo RPC que Jus IA, sobre los tres códigos. La
 * fila del RPC no trae `orden` ni la página suelta (viene dentro de la URL).
 */
export async function buscarArticulosPorSignificado(q: string): Promise<ResultadoArticulos> {
  const embedding = await vectorizar(q.trim());
  const afines = (await buscarLegislacion(embedding, LIMITE_SEMANTICO_ARTICULOS)).filter(
    (x) => x.similitud >= UMBRAL_SEMANTICO,
  );
  const articulos: ArticuloCorpus[] = afines.map((x) => {
    const { rubrica, cuerpo } = parsearArticulo(x.texto);
    const pagina = Number(x.fuente_url.match(/#page=(\d+)$/)?.[1]);
    return {
      id: x.articulo_id,
      codigoId: x.codigo_id,
      codigoNombre: x.codigo_nombre,
      numero: x.numero,
      orden: null,
      pagina: Number.isFinite(pagina) ? pagina : null,
      rubrica,
      cuerpo,
      fuenteUrl: x.fuente_url,
      similitud: x.similitud,
    };
  });
  return {
    articulos,
    total: articulos.length,
    pagina: 1,
    porPagina: LIMITE_SEMANTICO_ARTICULOS,
    aviso: `Hasta ${LIMITE_SEMANTICO_ARTICULOS} artículos afines por significado en los ${CODIGOS_CARGADOS.length} códigos cargados, ordenados por afinidad. Este modo no pagina.`,
  };
}

// ── Índice de un código (vista Lector) ─────────────────────────────────────

export interface EntradaIndice {
  numero: string;
  orden: number;
  pagina: number | null;
  rubrica: string | null;
  /** Primeras palabras del cuerpo, para los artículos sin rúbrica. */
  arranque: string;
}

const indices = new Map<string, { entradas: EntradaIndice[]; en: number }>();

/**
 * Todo el articulado de un código, ligero (sin el texto): es lo que pinta el
 * índice del Lector. Se lee entero de la base (930 filas × ~1 KB) y se cachea
 * 10 min en memoria: un código no cambia entre dos clics.
 */
export async function indiceDeCodigo(codigoId: string): Promise<EntradaIndice[]> {
  const c = indices.get(codigoId);
  if (c && Date.now() - c.en < CONTEO_TTL_MS) return c.entradas;
  const entradas: EntradaIndice[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { filas } = await consultar<{ numero: string; orden: number; pagina: number | null; texto: string }>(
      `select=numero,orden,pagina,texto&codigo_id=eq.${encodeURIComponent(codigoId)}&order=orden.asc`,
      { desde, hasta: desde + 999 },
    );
    for (const f of filas) {
      const { rubrica, cuerpo } = parsearArticulo(f.texto);
      entradas.push({
        numero: f.numero,
        orden: f.orden,
        pagina: f.pagina,
        rubrica,
        arranque: cuerpo.replace(/\s+/g, " ").slice(0, 80),
      });
    }
    if (filas.length < 1000) break;
  }
  indices.set(codigoId, { entradas, en: Date.now() });
  return entradas;
}

// ── Selección por tema ─────────────────────────────────────────────────────

/** Los artículos de un tema, en el orden pedido (vista Temas). */
export async function getArticulosSeleccion(
  pares: { codigoId: string; numero: string }[],
): Promise<ArticuloCorpus[]> {
  if (pares.length === 0) return [];
  const or = pares
    .map((p) => `and(codigo_id.eq.${encodeURIComponent(p.codigoId)},numero.eq.${encodeURIComponent(p.numero)})`)
    .join(",");
  const { filas } = await consultar<FilaArticulo>(`select=${COLUMNAS}&or=(${or})`);
  const porClave = new Map(filas.map((f) => [`${f.codigo_id}/${f.numero}`, filaAArticulo(f)]));
  return pares.map((p) => porClave.get(`${p.codigoId}/${p.numero}`)).filter((a): a is ArticuloCorpus => !!a);
}

// ── Un artículo ────────────────────────────────────────────────────────────

export async function getArticulo(codigoId: string, numero: string): Promise<ArticuloCorpus | null> {
  const codigo = getCodigo(codigoId);
  const n = pareceNumeroArticulo(numero);
  if (!codigo || codigo.estado !== "cargado" || !n) return null;
  const { filas } = await consultar<FilaArticulo>(
    `select=${COLUMNAS}&codigo_id=eq.${encodeURIComponent(codigo.id)}&numero=eq.${encodeURIComponent(n)}&limit=1`,
  );
  return filas[0] ? filaAArticulo(filas[0]) : null;
}

export interface VecinoArticulo {
  numero: string;
  rubrica: string | null;
}

/** El artículo anterior y el siguiente por posición, para leer el código de corrido. */
export async function getVecinos(
  codigoId: string,
  orden: number,
): Promise<{ anterior: VecinoArticulo | null; siguiente: VecinoArticulo | null }> {
  const base = `select=numero,texto&codigo_id=eq.${encodeURIComponent(codigoId)}`;
  const [ant, sig] = await Promise.all([
    consultar<{ numero: string; texto: string }>(`${base}&orden=lt.${orden}&order=orden.desc&limit=1`),
    consultar<{ numero: string; texto: string }>(`${base}&orden=gt.${orden}&order=orden.asc&limit=1`),
  ]);
  const vecino = (f?: { numero: string; texto: string }): VecinoArticulo | null =>
    f ? { numero: f.numero, rubrica: parsearArticulo(f.texto).rubrica } : null;
  return { anterior: vecino(ant.filas[0]), siguiente: vecino(sig.filas[0]) };
}
