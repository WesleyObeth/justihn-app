import type { Metadata } from "next";
import { RestablecerContrasena } from "@/components/auth/restablecer";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  description: "Crea una contraseña nueva para tu cuenta de Justihn.",
};

/**
 * Adonde llega el enlace de «¿La olvidaste?»: el callback ya cambió el código
 * por una sesión, así que aquí solo se pide la contraseña nueva.
 */
export default function PaginaRestablecer() {
  return <RestablecerContrasena />;
}
