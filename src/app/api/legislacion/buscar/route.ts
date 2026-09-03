import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/security/api-guard";
import { LIMITES, sanitizeText } from "@/lib/security/sanitize";
import { getCodigo } from "@/data/legislacion";
import {
  buscarArticulos,
  buscarArticulosPorSignificado,
  contarArticulos,
  type ResultadoArticulos,
} from "@/lib/corpus/legislacion";

/**
 * Búsqueda de legislación sobre las tablas reales (§1.1). Mismo reparto que
 * `jurisprudencia/buscar`: todo pasa por `guard()`; el modo por palabras es
 * Postgres puro y el semántico paga un embedding, así que lleva techo global.
 */
const esquema = z.object({
  codigo: z
    .string()
    .max(40)
    .regex(/^[a-z0-9-]+$/)
    .nullable()
    .default(null),
  q: z.string().max(LIMITES.busqueda).default(""),
  pagina: z.number().int().min(1).max(200).default(1),
  modo: z.enum(["texto", "semantica"]).default("texto"),
});

const TECHO_SEMANTICO_DIA = 3000;

export async function POST(req: Request) {
  const semantica = await esSemantica(req);

  const g = await guard(req, {
    action: semantica ? "legislacion-semantica" : "legislacion-buscar",
    schema: esquema,
    rateLimit: { limit: 60, windowMs: 60_000 },
    rateLimitGlobal: semantica ? { limit: TECHO_SEMANTICO_DIA, windowMs: 86_400_000 } : undefined,
    role: "session",
    cost: 0,
    maxBodyBytes: 2 * 1024,
  });
  if (!g.ok) return g.response;

  const q = sanitizeText(g.data.q, LIMITES.busqueda);

  // El código se resuelve contra el catálogo (alias incluidos) y tiene que
  // estar cargado: preguntarle a la base por un id inventado es una consulta
  // gratis para el atacante y un vacío confuso para el abogado.
  const codigo = g.data.codigo ? getCodigo(g.data.codigo) : null;
  if (g.data.codigo && (!codigo || codigo.estado !== "cargado")) {
    return NextResponse.json(
      { error: "codigo_no_cargado", mensaje: "Ese código no está cargado todavía." },
      { status: 400 },
    );
  }

  if (g.data.modo === "semantica" && q.length < 3) {
    return NextResponse.json(
      { error: "consulta_corta", mensaje: "Escribe qué buscas para buscar por significado." },
      { status: 400 },
    );
  }

  try {
    const [resultado, conteos]: [ResultadoArticulos, Record<string, number>] = await Promise.all([
      g.data.modo === "semantica"
        ? buscarArticulosPorSignificado(q)
        : buscarArticulos({ codigoId: codigo?.id ?? null, q }, g.data.pagina),
      contarArticulos(),
    ]);
    return NextResponse.json({ ...resultado, conteos, modo: g.data.modo });
  } catch (error) {
    console.error("[legislacion] el corpus no respondió:", error);
    return NextResponse.json(
      {
        error: "corpus_no_disponible",
        mensaje: "El corpus no respondió. Inténtalo de nuevo en unos segundos.",
      },
      { status: 503 },
    );
  }
}

async function esSemantica(req: Request): Promise<boolean> {
  try {
    const cuerpo = (await req.clone().json()) as { modo?: unknown };
    return cuerpo?.modo === "semantica";
  } catch {
    return false;
  }
}
