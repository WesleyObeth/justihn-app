import type { Metadata } from "next";
import { PantallaOnboarding } from "@/components/auth/onboarding";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Crea tu cuenta de Justihn en tres pasos: cuenta, validación profesional con el CAH y tus materias de práctica.",
};

export default function PaginaCrearCuenta() {
  return <PantallaOnboarding />;
}
