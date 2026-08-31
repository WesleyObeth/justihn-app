import type { Metadata } from "next";
import { Suspense } from "react";
import { CalculadoraPublica } from "@/components/publico/calculadora";
import { CalculadoraPlazos } from "@/components/personas/calculadora-plazos";

export const metadata: Metadata = { title: "Calculadoras" };

export default function PaginaCalculadoraPersona() {
  return (
    <div className="flex max-w-[860px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[24px] font-bold">Calculadoras</h1>
        <p className="mt-1 text-[13px] text-texto-3">
          Cuánto te corresponde y hasta cuándo puedes reclamarlo — con el artículo que lo dice.
        </p>
      </div>
      {/* Suspense: lee salario/años de la URL cuando llegas desde el gate público. */}
      <Suspense fallback={null}>
        <CalculadoraPublica enPortal />
      </Suspense>
      <CalculadoraPlazos />
    </div>
  );
}
