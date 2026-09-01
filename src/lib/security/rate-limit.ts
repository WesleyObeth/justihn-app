/**
 * Rate limiting — Blueprint §3.1 y §7 (anti-patrón: limiter in-memory en
 * serverless de producción, donde cada instancia lleva su propio contador).
 *
 * En prod se usa Upstash Redis (contador compartido por todas las instancias);
 * en dev se degrada a un Map en memoria. La degradación es explícita y se avisa
 * una sola vez por proceso — nunca silenciosa.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms en que se reinicia la ventana. */
  reset: number;
}

/**
 * Credenciales del Redis compartido. Se aceptan dos juegos de nombres porque
 * llegan por caminos distintos: `UPSTASH_*` es lo que da upstash.com, y `KV_*`
 * es lo que inyecta el Marketplace de Vercel al instalar "Upstash for Redis"
 * (misma base, otro prefijo). Sin el alias, la instalación de un clic desde
 * Vercel dejaría el limiter degradado a memoria sin que nadie lo note.
 */
function credencialesRedis(): { url: string; token: string } | null {
  // `||` a propósito: una variable presente pero VACÍA no debe tapar el alias.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/** ¿Hay contador compartido entre instancias? El motor real de Jus IA no debe
 *  encenderse en producción sin esto (interlock en `lib/ai/motor-activo.ts`). */
export function rateLimitDistribuido(): boolean {
  return credencialesRedis() !== null;
}

let avisoEmitido = false;

function avisarDegradacion() {
  if (avisoEmitido) return;
  avisoEmitido = true;
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[security] Rate limit in-memory en producción: cada instancia lleva su " +
        "propio contador. Configura UPSTASH_REDIS_REST_URL/TOKEN — o instala " +
        "'Upstash for Redis' desde el Marketplace de Vercel (sus KV_REST_API_* también valen).",
    );
  }
}

/** Limiters de Upstash, uno por bucket (ventana distinta por acción). */
const limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(bucket: string, limit: number, windowMs: number): Ratelimit {
  const key = `${bucket}:${limit}:${windowMs}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis(credencialesRedis()!),
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: `justihn:rl:${bucket}`,
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/** Fallback de desarrollo: ventana deslizante simple en memoria. */
const memoria = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const ahora = Date.now();
  const desde = ahora - windowMs;
  const hits = (memoria.get(key) ?? []).filter((t) => t > desde);
  const success = hits.length < limit;
  if (success) hits.push(ahora);
  memoria.set(key, hits);

  // Poda oportunista: sin esto el Map crece sin techo en un dev server largo.
  if (memoria.size > 5000) {
    for (const [k, v] of memoria) {
      if (v.every((t) => t <= desde)) memoria.delete(k);
    }
  }

  return {
    success,
    limit,
    remaining: Math.max(0, limit - hits.length),
    reset: (hits[0] ?? ahora) + windowMs,
  };
}

export async function rateLimit(
  identificador: string,
  { bucket, limit, windowMs }: { bucket: string; limit: number; windowMs: number },
): Promise<RateLimitResult> {
  if (!credencialesRedis()) {
    avisarDegradacion();
    return memoryLimit(`${bucket}:${identificador}`, limit, windowMs);
  }

  try {
    const r = await getUpstashLimiter(bucket, limit, windowMs).limit(identificador);
    return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset };
  } catch (error) {
    // Redis caído: fail-closed (§0.4). Preferimos rechazar a dejar la puerta abierta.
    console.error("[security] rate limit backend inaccesible:", error);
    return { success: false, limit, remaining: 0, reset: Date.now() + windowMs };
  }
}

/** Identidad del llamante: sesión si existe, IP como respaldo. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "desconocido";
}
