import type { Metadata } from "next";
import { Suspense } from "react";
import { Vista } from "@/components/portal/marco";
import { PantallaPlantillas } from "@/components/portal/pantalla-plantillas";

export const metadata: Metadata = { title: "Modelos de escritos" };

export default function PaginaPlantillas() {
  return (
    <Vista titulo="Modelos de escritos">
      {/* Suspense: la vista lee búsqueda y filtro desde la URL (useSearchParams). */}
      <Suspense fallback={null}>
        <PantallaPlantillas />
      </Suspense>
    </Vista>
  );
}
