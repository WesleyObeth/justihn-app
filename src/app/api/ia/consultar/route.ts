import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/security/api-guard";
import { LIMITES, sanitizeText } from "@/lib/security/sanitize";
import { responderDemo } from "@/lib/ai/router-demo";
import { motorActivo, techoDiarioIA, type MotorReal } from "@/lib/ai/motor-activo";
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
  // El interlock decide ANTES del guard: el techo global solo existe cuando el
  // motor real va a gastar dinero — ponérselo al demo regalaría un DoS barato.
  const motor = motorActivo();

  const g = await guard(req, {
    action: "ia-consultar",
    schema: consultaSchema,
    rateLimit: { limit: 20, windowMs: 60_000 },
    rateLimitGlobal: motor ? { limit: techoDiarioIA(), windowMs: 86_400_000 } : undefined,
    role: "session",
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
      ? "Consulta ilimitada · plan Premium"
      : `Usó 1 crédito · quedan ${Math.max(0, g.data.cuotaRestante - 1)}`;

  const respuesta: RespuestaIA = motor
    ? await responderConMotorReal(motor, consulta, metaCosto)
    : responderDemo(consulta, g.data.turno, metaCosto);

  return NextResponse.json(respuesta);
}

/**
 * Import dinámico: mantiene los SDK fuera del bundle mientras el motor real
 * esté apagado, y evita que un fallo del corpus tumbe la respuesta.
 *
 * ⚠️ El catch NO improvisa una respuesta jurídica. Si el corpus no contesta,
 * Jus IA lo dice y no responde — un modelo respondiendo sin sus fuentes es el
 * fallo que este producto existe para no cometer (§4.1).
 */
async function responderConMotorReal(
  motor: MotorReal,
  consulta: string,
  metaCosto: string,
): Promise<RespuestaIA> {
  try {
    if (motor === "openai") {
      const { responderConOpenAI } = await import("@/lib/ai/motor-openai");
      return await responderConOpenAI(consulta, metaCosto);
    }
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
