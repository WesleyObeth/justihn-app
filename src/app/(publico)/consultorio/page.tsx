import type { Metadata } from "next";
import { PantallaConsultorio } from "@/components/publico/consultorio";

export const metadata: Metadata = {
  title: "Consultorio legal gratuito",
  description: "Pregunta gratis y un abogado colegiado de Honduras te orienta.",
};

export default function PaginaConsultorio() {
  return <PantallaConsultorio />;
}
