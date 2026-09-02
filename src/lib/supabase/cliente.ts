"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el navegador. Solo la clave `anon`: su seguridad
 * la da RLS (ver `supabase/esquema/01-negocio.sql`). La sesión viaja en
 * cookies —no en localStorage— para que el servidor (proxy, route handlers,
 * server components) vea al mismo usuario que el cliente.
 *
 * Singleton: `createBrowserClient` ya lo memoiza internamente, pero exponerlo
 * como función deja claro que se obtiene, no se construye.
 */
export function supabaseNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/** Mensajes de error de Supabase Auth en el idioma de la pantalla. */
export function mensajeAuth(codigo: string | undefined, fallback: string): string {
  switch (codigo) {
    case "invalid_credentials":
      return "Correo o contraseña incorrectos.";
    case "email_not_confirmed":
      return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada.";
    case "user_already_exists":
    case "email_exists":
      return "Ya existe una cuenta con ese correo. Inicia sesión.";
    case "weak_password":
      return "La contraseña es demasiado débil: usa al menos 8 caracteres.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Demasiados intentos. Espera un minuto y vuelve a probar.";
    case "same_password":
      return "La contraseña nueva no puede ser igual a la anterior.";
    default:
      return fallback;
  }
}
