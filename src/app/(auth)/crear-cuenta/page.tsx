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
export default async function PaginaCrearCuenta({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; desde?: string }>;
}) {
  const { tipo, desde } = await searchParams;
  return tipo === "persona" ? (
    <RegistroPersona desdeConsultorio={desde === "consultorio"} />
  ) : (
    <PantallaOnboarding />
  );
}
