import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

/**
 * Adonde vuelven los enlaces de correo (confirmación de alta, recuperación
 * de contraseña, enlace mágico): cambia el `code` por una sesión y manda a
 * cada cuenta a SU portal.
 *
 * El destino lo decide la base (`mi_destino()`: ¿tiene ficha de abogado?),
 * no un parámetro que cualquiera pueda escribir. `next` solo se acepta si es
 * una ruta interna — sin eso sería un redirect abierto colgando del correo.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = destinoSeguro(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/iniciar-sesion?error=enlace", url.origin));
  }

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/iniciar-sesion?error=enlace", url.origin));
  }

  if (next) return NextResponse.redirect(new URL(next, url.origin));

  const { data } = await supabase.rpc("mi_destino");
  return NextResponse.redirect(new URL(`/${data === "abogados" ? "abogados" : "personas"}`, url.origin));
}

function destinoSeguro(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
