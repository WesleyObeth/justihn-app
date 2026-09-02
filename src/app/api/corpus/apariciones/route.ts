import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/security/api-guard";
import { LIMITES, sanitizeText } from "@/lib/security/sanitize";
import { buscarAparicionesCorpus } from "@/lib/corpus/sentencias";

/**
 * ¿Aparece este nombre como PARTE en alguna sentencia publicada? Lo consumen
 * Monitoreo de nombres (abogado), Mi nombre e Informe Verifica (ciudadano).
 *
 * Postgres puro sobre `sentencias.partes` (migración 03). Mientras esa columna
 * no exista, responde `disponible: false` y las pantallas siguen sobre el
 * piloto diciéndolo — nunca un resultado inventado ni un «sin apariciones»
 * que en realidad significa «no pude buscar».
 *
 * Las materias reservadas por §5 no llegan aquí: RLS las esconde a la clave
 * `anon`, así que no hay filtro que olvidar.
 */
const esquema = z.object({
  nombre: z.string().min(4).max(LIMITES.nombre),
});

export async function POST(req: Request) {
  const g = await guard(req, {
    action: "corpus-apariciones",
    schema: esquema,
    rateLimit: { limit: 30, windowMs: 60_000 },
    role: "session",
    cost: 0,
    maxBodyBytes: 1024,
  });
  if (!g.ok) return g.response;

  const nombre = sanitizeText(g.data.nombre, LIMITES.nombre);
  if (nombre.length < 4) {
    return NextResponse.json(
      { error: "nombre_corto", mensaje: "Escribe al menos cuatro caracteres." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await buscarAparicionesCorpus(nombre));
  } catch (error) {
    console.error("[apariciones] el corpus no respondió:", error);
    return NextResponse.json(
      {
        error: "corpus_no_disponible",
        mensaje: "El corpus no respondió. Inténtalo de nuevo en unos segundos.",
      },
      { status: 503 },
    );
  }
}
