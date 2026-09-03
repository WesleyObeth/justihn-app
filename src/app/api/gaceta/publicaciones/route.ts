import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/security/api-guard";
import { publicacionesRecientes } from "@/lib/corpus/gaceta";

/**
 * Las publicaciones recientes de La Gaceta (Sección A) y sus ediciones, para
 * la pantalla de alertas y el digest del Dashboard. Postgres puro; sin LLM.
 * Si la migración de La Gaceta no está pasada responde `disponible: false`
 * y la pantalla lo dice.
 */
const esquema = z.object({
  dias: z.number().int().min(7).max(120).default(30),
  materia: z.string().max(40).nullable().default(null),
});

export async function POST(req: Request) {
  const g = await guard(req, {
    action: "gaceta-publicaciones",
    schema: esquema,
    rateLimit: { limit: 60, windowMs: 60_000 },
    role: "session",
    cost: 0,
    maxBodyBytes: 1024,
  });
  if (!g.ok) return g.response;

  try {
    const r = await publicacionesRecientes({ dias: g.data.dias, materia: g.data.materia });
    return NextResponse.json(r);
  } catch (error) {
    console.error("[gaceta] la base no respondió:", error);
    return NextResponse.json(
      { error: "gaceta_no_disponible", mensaje: "La Gaceta no respondió. Inténtalo de nuevo en unos segundos." },
      { status: 503 },
    );
  }
}
