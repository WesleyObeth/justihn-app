import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/security/api-guard";
import { LIMITES, sanitizeText } from "@/lib/security/sanitize";
import {
  buscarJurisprudencia,
  buscarPorSignificado,
  MATERIAS_CORPUS,
  TIPOS_PROCESO,
  type ResultadoBusqueda,
} from "@/lib/corpus/sentencias";

/**
 * Búsqueda de jurisprudencia sobre el corpus real. Pasa por `guard()` como
 * todo lo que toca el servidor (§3.1), aunque no gaste LLM: el modo por
 * palabras es Postgres puro, y el semántico paga un embedding (~US$0,00002)
 * — barato, pero no gratis, así que lleva techo global aparte.
 */
const esquema = z.object({
  q: z.string().max(LIMITES.busqueda).default(""),
  materia: z.enum(["todas", ...MATERIAS_CORPUS.map((m) => m.etiqueta)]).default("todas"),
  proceso: z.enum(["todos", ...TIPOS_PROCESO.map((t) => t.id)]).default("todos"),
  anio: z.number().int().min(1980).max(2100).nullable().default(null),
  pagina: z.number().int().min(1).max(500).default(1),
  modo: z.enum(["texto", "semantica"]).default("texto"),
});

/** Cuántas búsquedas por significado admite el servicio al día, entre todos. */
const TECHO_SEMANTICO_DIA = 3000;

export async function POST(req: Request) {
  // El techo global solo aplica al modo que cuesta dinero, y el modo viaja en
  // el cuerpo: se mira antes del guard sobre una copia, sin consumir el original.
  const semantica = await esSemantica(req);

  const g = await guard(req, {
    action: semantica ? "jurisprudencia-semantica" : "jurisprudencia-buscar",
    schema: esquema,
    rateLimit: { limit: 40, windowMs: 60_000 },
    rateLimitGlobal: semantica ? { limit: TECHO_SEMANTICO_DIA, windowMs: 86_400_000 } : undefined,
    // TODO(auth): "session" al cablear Supabase Auth — es pantalla del portal.
    role: "public",
    cost: 0,
    maxBodyBytes: 2 * 1024,
  });
  if (!g.ok) return g.response;

  const q = sanitizeText(g.data.q, LIMITES.busqueda);
  const filtros = { q, materia: g.data.materia, proceso: g.data.proceso, anio: g.data.anio };

  if (g.data.modo === "semantica" && q.length < 3) {
    return NextResponse.json(
      { error: "consulta_corta", mensaje: "Escribe qué buscas para buscar por significado." },
      { status: 400 },
    );
  }

  try {
    const resultado: ResultadoBusqueda =
      g.data.modo === "semantica"
        ? await buscarPorSignificado(filtros)
        : await buscarJurisprudencia(filtros, g.data.pagina);
    // La ficha parseada viaja entera: la pantalla la usa para partes y fallo,
    // y es más barato que otra petición al abrir cada resultado.
    return NextResponse.json({ ...resultado, modo: g.data.modo });
  } catch (error) {
    // Sin corpus no hay lista: se dice, no se rellena con el seed.
    console.error("[jurisprudencia] el corpus no respondió:", error);
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
