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
        {/* Son dos y la segunda queda por debajo del pliegue: sin este índice
            no se descubre que existe. Salta con `desplazamiento-suave`. */}
        <nav aria-label="Ir a una calculadora" className="mt-3 flex flex-wrap gap-2">
          <a
            href="#prestaciones"
            className="rounded-full border border-borde bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-marino hover:border-celeste hover:text-celeste"
          >
            ¿Cuánto me toca por el despido?
          </a>
          <a
            href="#plazos"
            className="rounded-full border border-borde bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-marino hover:border-celeste hover:text-celeste"
          >
            ¿Cuánto tiempo tengo?
          </a>
        </nav>
      </div>
      {/* Suspense: lee salario/años de la URL cuando llegas desde el gate público. */}
      <section id="prestaciones" className="scroll-mt-6">
        <Suspense fallback={null}>
          <CalculadoraPublica enPortal />
        </Suspense>
      </section>
      <section id="plazos" className="scroll-mt-6">
        <CalculadoraPlazos />
      </section>
    </div>
  );
}
