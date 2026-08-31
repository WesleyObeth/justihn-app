import type { Metadata } from "next";
import { PantallaOnboarding } from "@/components/auth/onboarding";
import { RegistroPersona } from "@/components/auth/registro-persona";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Crea tu cuenta de Justihn. El alta profesional pide colegiación y materias; la de personas, solo tu nombre y correo.",
};

/**
 * Puerta única de alta: el abogado hace el onboarding de tres pasos; la
 * persona, un formulario corto. Una sola URL, haciendo pareja con el login
 * compartido — lo que cambia es lo que el producto necesita saber de cada uno.
 *
 * El `?tipo=` se lee **en el servidor**, no con un hook de cliente: leerlo en
 * el cliente hacía que el HTML llegara siempre con el formulario del abogado
 * y se viera un parpadeo del stepper antes de cambiar al corto. A cambio la
 * ruta se sirve dinámica, que en una pantalla de auth (sin SEO, `noindex`) no
 * cuesta nada.
 */
/**
 * A dónde volver tras el alta. Se acepta SOLO una ruta interna del portal
 * ciudadano: un `next` sin validar es un redirect abierto — bastaría un
 * `?next=https://otro-sitio` para que Justihn mande al usuario fuera después
 * de que escriba su correo y su contraseña.
 */
function destinoSeguro(next?: string): string | undefined {
  if (!next) return undefined;
  // `//host` y `/\host` son rutas protocolo-relativas: salen del dominio.
  if (!next.startsWith("/personas") || next.startsWith("//")) return undefined;
  return next;
}

export default async function PaginaCrearCuenta({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; desde?: string; next?: string }>;
}) {
  const { tipo, desde, next } = await searchParams;
  return tipo === "persona" ? (
    <RegistroPersona
      desdeConsultorio={desde === "consultorio"}
      destino={destinoSeguro(next)}
    />
  ) : (
    <PantallaOnboarding />
  );
}
