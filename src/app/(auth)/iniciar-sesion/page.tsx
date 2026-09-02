import type { Metadata } from "next";
import { PantallaIniciarSesion } from "@/components/auth/iniciar-sesion";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Entra a tu cuenta de Justihn. Una sola puerta para abogados y para personas.",
};

/**
 * Login compartido por las dos vías. El `?tipo=` se resuelve en el servidor
 * (mismo motivo que en `crear-cuenta`: leerlo en cliente dejaba ver el copy
 * del abogado durante un instante) y solo personaliza — nunca cambia lo que
 * se pide para entrar.
 */
/** Solo rutas internas de los portales: un `next` libre sería un redirect abierto. */
function destinoSeguro(next?: string): string | undefined {
  if (!next || next.startsWith("//")) return undefined;
  return next.startsWith("/abogados") || next.startsWith("/personas") ? next : undefined;
}

export default async function PaginaIniciarSesion({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; next?: string; error?: string }>;
}) {
  const { tipo, next, error } = await searchParams;
  return (
    <PantallaIniciarSesion
      esPersona={tipo === "persona"}
      next={destinoSeguro(next)}
      errorInicial={
        error === "enlace" ? "Ese enlace ya no es válido. Inicia sesión o pide uno nuevo." : undefined
      }
    />
  );
}
