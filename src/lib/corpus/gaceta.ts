/**
 * La Gaceta sobre las tablas REALES: `gacetas` + `publicaciones_gaceta`
 * (`automatizaciones/gaceta/esquema/01-gaceta.sql`), que llena
 * `capturar.py` desde la Mac con los PDF de la ENAG.
 *
 * Solo servidor; PostgREST por `fetch` con la clave `anon`, como el resto de
 * `lib/corpus/`. Mientras la migración no esté pasada, PostgREST responde
 * que la tabla no existe (`PGRST205` / `42P01`): se devuelve
 * `disponible: false` y la pantalla enseña el seed DICIENDO que es el seed —
 * el mismo patrón de Monitoreo antes de la migración 03 (§1.7).
 */
import type { Materia } from "@/types/dominio";

export interface FilaGaceta {
  numero: number;
  fecha: string;
  slug: string;
  url_pdf: string;
  paginas: number;
  paginas_a: number | null;
}

export interface FilaPublicacion {
  id: number;
  gaceta_numero: number;
  orden: number;
  seccion: "A" | "B";
  emisor: string | null;
  titulo: string;
  tipo: string | null;
  materia: string | null;
  pagina_inicio: number | null;
  pagina_fin: number | null;
  extracto: string | null;
  gacetas: Pick<FilaGaceta, "fecha" | "url_pdf" | "paginas_a" | "slug"> | null;
}

/** Una publicación tal como la consume la UI. */
export interface PublicacionReal {
  id: number;
  gacetaNumero: number;
  /** «37,235», como lo imprime la propia Gaceta. */
  gacetaEtiqueta: string;
  fechaIso: string;
  seccion: "A" | "B";
  emisor: string | null;
  titulo: string;
  tipo: string | null;
  materia: Materia | null;
  paginaInicio: number | null;
  paginaFin: number | null;
  extracto: string | null;
  /** El PDF oficial abierto en la página donde empieza. */
  fuenteUrl: string;
}

export interface GacetaReal {
  numero: number;
  etiqueta: string;
  fechaIso: string;
  urlPdf: string;
  paginas: number;
  publicaciones: number;
}

export const etiquetaGaceta = (n: number) => n.toLocaleString("es-HN");

/**
 * La página del PDF: la Sección A empieza en la 1; la B va detrás de la A.
 * Sin `paginas_a` no se puede ubicar la B, y se abre la portada.
 */
export function paginaPdf(p: Pick<FilaPublicacion, "seccion" | "pagina_inicio">, paginasA: number | null): number | null {
  if (!p.pagina_inicio) return null;
  if (p.seccion === "A") return p.pagina_inicio;
  return paginasA ? paginasA + p.pagina_inicio : null;
}

export function filaAPublicacion(f: FilaPublicacion): PublicacionReal {
  const pag = paginaPdf(f, f.gacetas?.paginas_a ?? null);
  const base = f.gacetas?.url_pdf ?? "";
  return {
    id: f.id,
    gacetaNumero: f.gaceta_numero,
    gacetaEtiqueta: etiquetaGaceta(f.gaceta_numero),
    fechaIso: f.gacetas?.fecha ?? "",
    seccion: f.seccion,
    emisor: f.emisor,
    titulo: f.titulo,
    tipo: f.tipo,
    materia: (f.materia as Materia | null) ?? null,
    paginaInicio: f.pagina_inicio,
    paginaFin: f.pagina_fin,
    extracto: f.extracto,
    fuenteUrl: pag ? `${base}#page=${pag}` : base,
  };
}

// ── PostgREST ──────────────────────────────────────────────────────────────

function configuracion() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return { url, key };
}

class SinTabla extends Error {}

async function consultar<T>(tabla: string, query: string, opciones: { contar?: boolean } = {}): Promise<{ filas: T[]; total: number | null }> {
  const { url, key } = configuracion();
  const headers: Record<string, string> = { apikey: key, Authorization: `Bearer ${key}` };
  if (opciones.contar) headers.Prefer = "count=exact";
  const res = await fetch(`${url}/rest/v1/${tabla}?${query}`, { headers, cache: "no-store" });
  if (!res.ok && res.status !== 206) {
    let cuerpo: { code?: string; message?: string } = {};
    try {
      cuerpo = (await res.json()) as typeof cuerpo;
    } catch {
      /* sin JSON */
    }
    // La tabla no existe todavía: la migración de La Gaceta no se ha pasado.
    if (res.status === 404 || cuerpo.code === "42P01" || cuerpo.code === "PGRST205") throw new SinTabla(cuerpo.message ?? "sin tabla");
    throw new Error(`PostgREST ${res.status}: ${cuerpo.message ?? ""}`);
  }
  const filas = (await res.json()) as T[];
  const rango = res.headers.get("content-range");
  const total = rango ? Number(rango.split("/")[1]) : null;
  return { filas, total: Number.isFinite(total) ? total : null };
}

const COLUMNAS =
  "id,gaceta_numero,orden,seccion,emisor,titulo,tipo,materia,pagina_inicio,pagina_fin,extracto,gacetas(fecha,url_pdf,paginas_a,slug)";

export interface ResultadoGaceta {
  disponible: boolean;
  publicaciones: PublicacionReal[];
  gacetas: GacetaReal[];
  /** Cuántas publicaciones por materia en el periodo (null = sin materia). */
  porMateria: Record<string, number>;
  desdeIso: string;
}

// ⚠️ NO se recuerda que la tabla «no existe»: la migración se pasa en
// caliente y el servidor en marcha tiene que verla en la siguiente petición.
// Costó una verificación: el aviso «sin ediciones» no salía porque un
// recuerdo de «sin tabla» de antes de la migración cortocircuitaba.

/**
 * Las publicaciones de la Sección A desde una fecha (por defecto los últimos
 * 30 días publicados), más recientes primero, y las ediciones del periodo.
 * La Sección B (avisos legales) no se lista aquí: es una masa de edictos y
 * convocatorias; se ofrece por edición, abriendo el PDF en su página.
 */
export async function publicacionesRecientes(opciones: { dias?: number; materia?: string | null } = {}): Promise<ResultadoGaceta> {
  const dias = opciones.dias ?? 30;
  const vacio = (d: boolean): ResultadoGaceta => ({ disponible: d, publicaciones: [], gacetas: [], porMateria: {}, desdeIso: "" });
  try {
    // La fecha de corte se calcula sobre la ÚLTIMA edición capturada, no
    // sobre hoy: la ENAG publica con retraso y «los últimos 30 días» de
    // calendario podrían estar vacíos sin que falte nada.
    const { filas: ultimas } = await consultar<FilaGaceta>("gacetas", "select=numero,fecha,slug,url_pdf,paginas,paginas_a&order=fecha.desc&limit=1");
    if (ultimas.length === 0) return { ...vacio(true) };
    const ultima = new Date(`${ultimas[0]!.fecha}T00:00:00Z`);
    ultima.setUTCDate(ultima.getUTCDate() - dias);
    const desdeIso = ultima.toISOString().slice(0, 10);

    const [{ filas: gacetasFilas }, { filas: pubs }] = await Promise.all([
      consultar<FilaGaceta & { publicaciones_gaceta: { count: number }[] }>(
        "gacetas",
        `select=numero,fecha,slug,url_pdf,paginas,paginas_a,publicaciones_gaceta(count)&fecha=gte.${desdeIso}&order=fecha.desc`,
      ),
      consultar<FilaPublicacion>(
        "publicaciones_gaceta",
        [
          `select=${COLUMNAS}`,
          "seccion=eq.A",
          `gacetas.fecha=gte.${desdeIso}`,
          `gaceta_numero=gte.${Math.max(0, ultimas[0]!.numero - 400)}`,
          opciones.materia ? `materia=eq.${encodeURIComponent(opciones.materia)}` : null,
          "order=gaceta_numero.desc,orden.asc",
          "limit=400",
        ]
          .filter(Boolean)
          .join("&"),
      ),
    ]);
    const numeros = new Set(gacetasFilas.map((g) => g.numero));
    const publicaciones = pubs.filter((p) => numeros.has(p.gaceta_numero)).map(filaAPublicacion);
    const porMateria: Record<string, number> = {};
    for (const p of publicaciones) porMateria[p.materia ?? "null"] = (porMateria[p.materia ?? "null"] ?? 0) + 1;
    return {
      disponible: true,
      publicaciones,
      gacetas: gacetasFilas.map((g) => ({
        numero: g.numero,
        etiqueta: etiquetaGaceta(g.numero),
        fechaIso: g.fecha,
        urlPdf: g.url_pdf,
        paginas: g.paginas,
        publicaciones: g.publicaciones_gaceta?.[0]?.count ?? 0,
      })),
      porMateria,
      desdeIso,
    };
  } catch (error) {
    if (error instanceof SinTabla) return vacio(false);
    throw error;
  }
}

export async function getPublicacionReal(id: number): Promise<PublicacionReal | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  try {
    const { filas } = await consultar<FilaPublicacion>("publicaciones_gaceta", `select=${COLUMNAS}&id=eq.${id}&limit=1`);
    return filas[0] ? filaAPublicacion(filas[0]) : null;
  } catch (error) {
    if (error instanceof SinTabla) return null;
    throw error;
  }
}

/** Las demás publicaciones de la misma edición (Sección A), en su orden. */
export async function getMismaGaceta(numero: number, excluirId: number): Promise<PublicacionReal[]> {
  const { filas } = await consultar<FilaPublicacion>(
    "publicaciones_gaceta",
    `select=${COLUMNAS}&gaceta_numero=eq.${numero}&id=neq.${excluirId}&order=orden.asc`,
  );
  return filas.map(filaAPublicacion);
}
