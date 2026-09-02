import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy de Next 16 (el sucesor de `middleware.ts`). Dos trabajos:
 *
 *  1. **Refrescar la sesión** en cada petición: Supabase guarda el token en
 *     cookies y este es el único sitio que puede reescribirlas antes de que
 *     el servidor responda. Sin esto, un token caducado deja al usuario
 *     "logueado" en el cliente y sin sesión en el servidor.
 *  2. **Cerrar los portales**: `/abogados` y `/personas` exigen sesión. Se
 *     redirige al login con `next=` para volver donde iba. Fallar cerrado
 *     (§0.4): no hay modo demo.
 *
 * Lo que NO decide: a qué portal pertenece la cuenta. Eso lo dice la ficha de
 * abogado (`mi_destino()`) y lo resuelven login y callback; aquí solo se
 * comprueba que HAY alguien.
 */
const PROTEGIDAS = ["/abogados", "/personas"];

export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          for (const { name, value } of lista) request.cookies.set(name, value);
          respuesta = NextResponse.next({ request });
          for (const { name, value, options } of lista) respuesta.cookies.set(name, value, options);
        },
      },
    },
  );

  // `getUser` (no `getSession`): valida el token contra Auth en vez de
  // fiarse de la cookie, y de paso la refresca si hace falta.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const protegida = PROTEGIDAS.some((p) => ruta === p || ruta.startsWith(`${p}/`));

  if (protegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/iniciar-sesion";
    url.search = "";
    url.searchParams.set("next", ruta);
    return NextResponse.redirect(url);
  }

  return respuesta;
}

export const config = {
  // Todo menos estáticos e imágenes: el refresco de sesión tiene que correr
  // también en las rutas de la API y en las páginas públicas (el menú del
  // avatar de la landing sabe si hay sesión).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff2?)$).*)"],
};
