import type { Metadata } from "next";
import { Suspense } from "react";
import { CalculadoraPublica } from "@/components/publico/calculadora";

export const metadata: Metadata = { title: "Calculadora de prestaciones" };

export default function PaginaCalculadoraPersona() {
  return (
    // Suspense: lee salario/años de la URL cuando llegas desde el gate público.
    <Suspense fallback={null}>
      <CalculadoraPublica enPortal />
    </Suspense>
  );
}
