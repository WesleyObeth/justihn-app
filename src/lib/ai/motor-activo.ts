/**
 * Interlock del motor real de Jus IA.
 *
 * El endpoint es `role: "public"` mientras no exista Supabase Auth, así que
 * cada consulta al motor real gasta dinero de OpenAI/Anthropic sin pedir
 * cuenta. Los dos frenos que lo hacen tolerable — el rate limit por IP y el
 * techo global diario — solo frenan de verdad si el contador es COMPARTIDO
 * entre instancias: en Vercel, un limiter en memoria no limita nada (cada
 * petición puede caer en una instancia distinta).
 *
 * Por eso el motor real NO se enciende en producción sin rate limit
 * distribuido, aunque `JUSTIHN_MOTOR_IA` lo pida: se sirve el motor demo y se
 * grita en los logs qué falta. Preferimos que Wesley vea respuestas demo en su
 * primera prueba y lo arregle en un minuto, a que el motor corra semanas con
 * la puerta abierta sin que nadie lo note.
 */
import { rateLimitDistribuido } from "@/lib/security/rate-limit";

export type MotorReal = "claude" | "openai";

let avisoEmitido = false;

export function motorActivo(): MotorReal | null {
  const motor = process.env.JUSTIHN_MOTOR_IA;
  if (motor !== "claude" && motor !== "openai") return null;

  if (process.env.NODE_ENV === "production" && !rateLimitDistribuido()) {
    if (!avisoEmitido) {
      avisoEmitido = true;
      console.error(
        `[jus-ia] JUSTIHN_MOTOR_IA=${motor} pedido, pero sin rate limit ` +
          "distribuido en producción: se sirve el motor demo. Configura " +
          "UPSTASH_REDIS_REST_URL/TOKEN o instala 'Upstash for Redis' desde " +
          "el Marketplace de Vercel (KV_REST_API_*) y redeploya.",
      );
    }
    return null;
  }

  return motor;
}

/**
 * Techo global de consultas al motor real por día — el freno de gasto que las
 * ventanas por IP no dan: rotando IPs, 20/min por IP son ~29.000 consultas
 * diarias de una sola máquina (~US$900 a precios de gpt-4o). Con techo, el
 * peor día cuesta `techo × ~US$0,03` y se acaba. Solo aplica al motor real:
 * ponérselo al demo regalaría un DoS de 200 peticiones contra una demo que no
 * cuesta nada.
 */
export function techoDiarioIA(): number {
  const techo = Number(process.env.JUSTIHN_IA_TECHO_DIA ?? 200);
  return Number.isFinite(techo) && techo > 0 ? Math.floor(techo) : 200;
}
