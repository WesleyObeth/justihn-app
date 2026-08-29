import type { Metadata } from "next";
import { CalculadoraPublica } from "@/components/publico/calculadora";

export const metadata: Metadata = { title: "Calculadora de prestaciones" };

export default function PaginaCalculadoraPersona() {
  return <CalculadoraPublica enPortal />;
}
