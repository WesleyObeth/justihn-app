/**
 * `guard()` — el único portón de entrada de toda route handler y Server Action.
 * Blueprint §3.0/§3.1. El orden importa: se rechaza barato antes de gastar caro.
 *
 *   body-size → rate-limit → auth/rol → Zod → créditos
 *
 * Devuelve `data` tipado o un `NextResponse` de error ya formateado.
 */
import { NextResponse } from "next/server";
import type { z } from "zod";
import { rateLimit, clientIp } from "./rate-limit";
import { usuarioActual } from "@/lib/supabase/servidor";

export type Rol = "public" | "session" | "admin";

export interface GuardOptions<S extends z.ZodType> {
  /** Scopea el bucket de rate-limit y el ledger de créditos. */
  action: string;
  schema?: S;
  rateLimit?: { limit: number; windowMs: number };
  /**
   * Techo COMPARTIDO por todos los llamantes (identificador fijo, no la IP).
   * Es el freno de gasto de las acciones que pagan un LLM por consulta: la
   * ventana por IP no frena a quien rota IPs; esta sí, porque se agota para
   * todos a la vez y el peor día queda acotado.
   */
  rateLimitGlobal?: { limit: number; windowMs: number };
  role?: Rol;
  /** Créditos de Jus IA que debita la acción (0 = gratuita). */
  cost?: number;
  /** Tope de payload en bytes. */
  maxBodyBytes?: number;
}

export type GuardResult<S extends z.ZodType> =
  | { ok: true; data: z.infer<S>; ip: string; usuarioId: string | null }
  | { ok: false; response: NextResponse };

const MAX_BODY_BYTES = 32 * 1024;

function error(status: number, codigo: string, mensaje: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: codigo, mensaje, ...extra }, { status });
}

/**
 * Resuelve la sesión contra Supabase Auth (cableado 2026-09-02). El usuario
 * se VERIFICA con `getUser()` —no se lee de la cookie—, y sin sesión la ruta
 * falla cerrada (§0.4): el modo demo `JUSTIHN_DEMO_SESSION` se retiró.
 *
 * `admin` no existe todavía: nace con el panel de validación de constancias.
 */
async function resolverSesion(): Promise<{ usuarioId: string | null; rol: Rol }> {
  try {
    const user = await usuarioActual();
    return user ? { usuarioId: user.id, rol: "session" } : { usuarioId: null, rol: "public" };
  } catch {
    return { usuarioId: null, rol: "public" };
  }
}

export async function guard<S extends z.ZodType>(
  req: Request,
  options: GuardOptions<S>,
): Promise<GuardResult<S>> {
  const ip = clientIp(req);
  const { action, schema, role = "public", cost = 0 } = options;

  // 1. Body-size ceiling — antes de leer nada al buffer.
  const maxBytes = options.maxBodyBytes ?? MAX_BODY_BYTES;
  const declarado = Number(req.headers.get("content-length") ?? 0);
  if (declarado > maxBytes) {
    return {
      ok: false,
      response: error(413, "payload_grande", "La solicitud excede el tamaño permitido."),
    };
  }

  // 2. Rate limit — frena floods antes de tocar auth o el LLM.
  if (options.rateLimit) {
    const rl = await rateLimit(ip, { bucket: action, ...options.rateLimit });
    if (!rl.success) {
      const segundos = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "limite_excedido",
            mensaje: `Demasiadas solicitudes. Intenta de nuevo en ${segundos} s.`,
          },
          { status: 429, headers: { "Retry-After": String(segundos) } },
        ),
      };
    }
  }

  // 2b. Techo global — un solo contador para todos los llamantes. Va después
  // del límite por IP (que corta al abusador barato, sin gastar una lectura
  // del contador compartido) y antes de auth: si el techo del día se agotó,
  // no hay nada más que decidir.
  if (options.rateLimitGlobal) {
    const rl = await rateLimit("todos", {
      bucket: `${action}:global`,
      ...options.rateLimitGlobal,
    });
    if (!rl.success) {
      const segundos = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "techo_global",
            mensaje:
              "El servicio alcanzó su límite de consultas por hoy. Vuelve a intentarlo más tarde.",
          },
          { status: 429, headers: { "Retry-After": String(segundos) } },
        ),
      };
    }
  }

  // 3. Autenticación y rol — falla cerrado.
  const { usuarioId, rol } = await resolverSesion();
  if (role !== "public") {
    if (!usuarioId) {
      return {
        ok: false,
        response: error(401, "no_autenticado", "Inicia sesión para continuar."),
      };
    }
    if (role === "admin" && rol !== "admin") {
      return { ok: false, response: error(403, "sin_permiso", "No tienes acceso a esta acción.") };
    }
  }

  // 4. Validación estricta del cuerpo.
  let data = undefined as z.infer<S>;
  if (schema) {
    let crudo: unknown;
    try {
      crudo = await req.json();
    } catch {
      return { ok: false, response: error(400, "json_invalido", "El cuerpo no es JSON válido.") };
    }
    const parsed = schema.safeParse(crudo);
    if (!parsed.success) {
      return {
        ok: false,
        response: error(400, "entrada_invalida", "La solicitud no cumple el esquema esperado.", {
          detalles: parsed.error.issues.map((i) => ({
            campo: i.path.join("."),
            problema: i.message,
          })),
        }),
      };
    }
    data = parsed.data;
  }

  // 5. Ledger de créditos — evita el wallet-draining por llamadas masivas al LLM.
  if (cost > 0 && usuarioId) {
    const saldo = await debitarCreditos(usuarioId, action, cost);
    if (!saldo.ok) {
      return {
        ok: false,
        response: error(402, "sin_creditos", saldo.mensaje, { restantes: saldo.restantes }),
      };
    }
  }

  return { ok: true, data, ip, usuarioId };
}

/**
 * Débito atómico del ledger de créditos por abogado.
 *
 * TODO(data): reemplazar por un RPC de Supabase que haga el decremento y el
 * insert de auditoría en una sola transacción (`select ... for update`). En
 * Fase 1 no hay backend: la cuota se refleja en el store del cliente y esta
 * función solo deja el seam listo.
 */
async function debitarCreditos(
  _usuarioId: string,
  _action: string,
  _cost: number,
): Promise<{ ok: true } | { ok: false; mensaje: string; restantes: number }> {
  return { ok: true };
}
