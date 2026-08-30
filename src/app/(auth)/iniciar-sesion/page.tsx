import type { Metadata } from "next";
import { PantallaIniciarSesion } from "@/components/auth/iniciar-sesion";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a tu cuenta de Justihn: jurisprudencia, alertas de La Gaceta y Jus IA.",
};

export default function PaginaIniciarSesion() {
  return <PantallaIniciarSesion />;
}
