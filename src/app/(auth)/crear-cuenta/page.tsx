import type { Metadata } from "next";
import { PantallaAlta } from "@/components/auth/alta";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Crea tu cuenta de Justihn. El alta profesional pide colegiación y materias; la de personas, solo tu nombre y correo.",
};

export default function PaginaCrearCuenta() {
  return <PantallaAlta />;
}
