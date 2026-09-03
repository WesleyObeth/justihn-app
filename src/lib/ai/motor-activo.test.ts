import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import { motorActivo, techoDiarioIA } from "./motor-activo";
import { rateLimitDistribuido, rateLimit } from "@/lib/security/rate-limit";
import { guard } from "@/lib/security/api-guard";

/**
 * El interlock del motor real y el techo global son los dos frenos de gasto
 * del endpoint público de Jus IA (§0 y §7.1 del CLAUDE.md). Si un refactor los
 * relaja en silencio, el peor día pasa de ~US$6 a la tarjeta entera — por eso
 * cada regla está fijada aquí.
 */

afterEach(() => vi.unstubAllEnvs());

function sinRedis() {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("KV_REST_API_URL", "");
  vi.stubEnv("KV_REST_API_TOKEN", "");
}

describe("rateLimitDistribuido", () => {
  it("acepta las variables de upstash.com", () => {
    sinRedis();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
    expect(rateLimitDistribuido()).toBe(true);
  });

  it("acepta los alias KV_* del Marketplace de Vercel", () => {
    sinRedis();
    vi.stubEnv("KV_REST_API_URL", "https://x.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "tok");
    expect(rateLimitDistribuido()).toBe(true);
  });

  it("una variable UPSTASH_* vacía no tapa el alias KV_*", () => {
    sinRedis();
    vi.stubEnv("KV_REST_API_URL", "https://x.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "tok");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    expect(rateLimitDistribuido()).toBe(true);
  });

  it("sin credenciales no hay contador compartido", () => {
    sinRedis();
    expect(rateLimitDistribuido()).toBe(false);
  });
});

describe("motorActivo — el interlock", () => {
  it("fuera de producción enciende el motor pedido aunque no haya Redis", () => {
    sinRedis();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("JUSTIHN_MOTOR_IA", "openai");
    expect(motorActivo()).toBe("openai");
  });

  it("en producción SIN rate limit distribuido se niega a encender el motor real", () => {
    sinRedis();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JUSTIHN_MOTOR_IA", "openai");
    expect(motorActivo()).toBeNull();
  });

  it("en producción CON rate limit distribuido enciende", () => {
    sinRedis();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JUSTIHN_MOTOR_IA", "claude");
    vi.stubEnv("KV_REST_API_URL", "https://x.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "tok");
    expect(motorActivo()).toBe("claude");
  });

  it("un motor no reconocido es demo, no un intento de adivinar", () => {
    vi.stubEnv("JUSTIHN_MOTOR_IA", "gemini");
    expect(motorActivo()).toBeNull();
  });
});

describe("techoDiarioIA", () => {
  it("por defecto son 200 consultas al día", () => {
    vi.stubEnv("JUSTIHN_IA_TECHO_DIA", "");
    expect(techoDiarioIA()).toBe(200);
  });

  it("respeta el override por variable de entorno", () => {
    vi.stubEnv("JUSTIHN_IA_TECHO_DIA", "500");
    expect(techoDiarioIA()).toBe(500);
  });

  it("un valor inválido o no positivo cae al defecto, nunca a Infinity", () => {
    vi.stubEnv("JUSTIHN_IA_TECHO_DIA", "abc");
    expect(techoDiarioIA()).toBe(200);
    vi.stubEnv("JUSTIHN_IA_TECHO_DIA", "-5");
    expect(techoDiarioIA()).toBe(200);
  });
});

describe("rateLimit en memoria (dev)", () => {
  it("corta al agotar la ventana y se recupera al expirar", async () => {
    sinRedis();
    const opts = { bucket: "test-ventana", limit: 2, windowMs: 50 };
    expect((await rateLimit("ip-a", opts)).success).toBe(true);
    expect((await rateLimit("ip-a", opts)).success).toBe(true);
    expect((await rateLimit("ip-a", opts)).success).toBe(false);
    // Otra identidad no comparte contador.
    expect((await rateLimit("ip-b", opts)).success).toBe(true);
    await new Promise((r) => setTimeout(r, 60));
    expect((await rateLimit("ip-a", opts)).success).toBe(true);
  });
});

describe("guard con techo global", () => {
  const post = (ip: string) =>
    new Request("http://localhost/api/x", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
    });

  it("el techo es compartido: agota para TODAS las IPs, no por llamante", async () => {
    sinRedis();
    const opts = {
      action: "test-techo",
      rateLimitGlobal: { limit: 2, windowMs: 60_000 },
    };
    expect((await guard(post("1.1.1.1"), opts)).ok).toBe(true);
    expect((await guard(post("2.2.2.2"), opts)).ok).toBe(true);
    const tercero = await guard(post("3.3.3.3"), opts);
    expect(tercero.ok).toBe(false);
    if (!tercero.ok) {
      expect(tercero.response.status).toBe(429);
      expect((await tercero.response.json()).error).toBe("techo_global");
    }
  });
});
