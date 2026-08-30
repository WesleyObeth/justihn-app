import type { Metadata } from "next";
import { LandingProfesional } from "@/components/profesional/landing-profesional";

export const metadata: Metadata = {
  title: "Para abogados — black",
  description:
    "Versión oscura de la landing de Justihn para abogados: jurisprudencia, Jus IA con citas y alertas de La Gaceta.",
};

export default function PaginaParaAbogadosBlack() {
  return <LandingProfesional />;
}
