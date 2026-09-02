import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el SERVIDOR (route handlers, server components,
 * `guard()`): lee la sesión de las cookies que puso el navegador y que el
 * proxy mantiene frescas. Misma clave `anon`: quien decide qué se ve es RLS
 * con el `auth.uid()` de esa sesión, nunca una clave con más poder.
 *
 * ⚠️ La `service_role` NO entra en este repo ni siquiera del lado servidor
 * (decisión mantenida): todo lo que la app hace, lo hace como el usuario.
 */
export async function supabaseServidor() {
  const almacen = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => almacen.getAll(),
        setAll: (lista) => {
          // En un server component `set` lanza; el proxy ya refrescó la
          // sesión antes, así que aquí se puede ignorar sin perder nada.
          try {
            for (const { name, value, options } of lista) almacen.set(name, value, options);
          } catch {
            /* solo lectura en este contexto */
          }
        },
      },
    },
  );
}

/** El usuario de la sesión, o `null`. Verificado contra Auth, no leído de la cookie. */
export async function usuarioActual() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
