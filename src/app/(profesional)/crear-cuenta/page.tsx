import type { Metadata } from "next";
import { PantallaCrearCuenta } from "@/components/profesional/crear-cuenta";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de Justihn para preguntarle a Jus IA con fuentes citadas.",
};

export default function PaginaCrearCuenta() {
  return <PantallaCrearCuenta />;
}
