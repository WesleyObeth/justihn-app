import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/security/api-guard";
import { LIMITES, sanitizeText } from "@/lib/security/sanitize";
import { responderDemo } from "@/lib/ai/router-demo";
import type { RespuestaIA } from "@/lib/ai/tipos";

/**
 * Consulta a Jus IA. Toda la superficie pasa por `guard()` (§3.1) antes de
 * gastar un solo token: rate-limit → auth → Zod → créditos.
 */
const consultaSchema = z.object({
  consulta: z.string().min(1).max(LIMITES.consulta),
  /** Índice del turno: hace la variación determinista y reproducible (§0.6). */
  turno: z.number().int().min(0).max(500),
  cuotaRestante: z.number().int().min(0).max(9999).nullable(),
});

export async function POST(req: Request) {
  const g = await guard(req, {
    action: "ia-consultar",
    schema: consultaSchema,
    rateLimit: { limit: 20, windowMs: 60_000 },
    // TODO(auth): pasar a "session" al cablear Supabase Auth. Hoy la ruta es
    // pública porque el portal corre en modo demo sin datos de personas reales.
    role: "public",
    cost: 0,
    maxBodyBytes: 8 * 1024,
  });
  if (!g.ok) return g.response;

  // El texto del abogado es entrada hostil hasta demostrar lo contrario (§0.3):
  // se sanea antes de tocar el router o, en Fase 2, el prompt del modelo.
  const consulta = sanitizeText(g.data.consulta, LIMITES.consulta);
  if (!consulta) {
    return NextResponse.json(
      { error: "consulta_vacia", mensaje: "Escribe una consulta." },
      { status: 400 },
    );
  }

  const metaCosto =
    g.data.cuotaRestante === null
      ? "Consulta ilimitada · plan Pro"
      : `Usó 1 crédito · quedan ${Math.max(0, g.data.cuotaRestante - 1)}`;

  const respuesta: RespuestaIA =
    process.env.JUSTIHN_MOTOR_IA === "claude"
      ? await responderConMotorReal(consulta, metaCosto)
      : responderDemo(consulta, g.data.turno, metaCosto);

  return NextResponse.json(respuesta);
}

/**
 * Import dinámico: mantiene el SDK de Anthropic fuera del bundle mientras el
 * motor real siga apagado, y evita que un fallo del corpus tumbe la respuesta.
 */
async function responderConMotorReal(consulta: string, metaCosto: string): Promise<RespuestaIA> {
  try {
    const { responderConClaude } = await import("@/lib/ai/motor-claude");
    return await responderConClaude(consulta, metaCosto);
  } catch (error) {
    console.error("[jus-ia] motor real no disponible:", error);
    return {
      text: "El motor de búsqueda con citas no está disponible en este momento. No voy a responderte con fuentes que no pueda verificar — inténtalo de nuevo en unos minutos.",
      meta: "Sin costo",
      gratuita: true,
    };
  }
}
