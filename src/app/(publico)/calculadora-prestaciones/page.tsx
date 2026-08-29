import type { Metadata } from "next";
import { Suspense } from "react";
import { CalculadoraPublica } from "@/components/publico/calculadora";

export const metadata: Metadata = {
  title: "Calculadora de prestaciones laborales",
  description:
    "¿Te despidieron? Calcula gratis tu cesantía, preaviso y aguinaldos proporcionales según el Código del Trabajo de Honduras.",
};

export default function PaginaCalculadoraPublica() {
  return (
    <Suspense fallback={null}>
      <CalculadoraPublica />
    </Suspense>
  );
}
