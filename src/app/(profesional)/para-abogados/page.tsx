import type { Metadata } from "next";
import { LandingProfesional } from "@/components/profesional/landing-profesional";

export const metadata: Metadata = {
  title: "Justihn para abogados — jurisprudencia, Gaceta y modelos de Honduras",
  description:
    "Jurisprudencia del CSJ, códigos, alertas de La Gaceta, modelos de escritos y calculadoras. Cada respuesta con el enlace al documento oficial.",
};

export default function PaginaParaAbogados() {
  return <LandingProfesional />;
}
