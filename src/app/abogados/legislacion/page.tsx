import type { Metadata } from "next";
import { Suspense } from "react";
import { Vista } from "@/components/portal/marco";
import { PantallaLegislacion } from "@/components/portal/pantalla-legislacion";

export const metadata: Metadata = { title: "Legislación" };

export default function PaginaLegislacion() {
  return (
    <Vista titulo="Legislación" ancho="max-w-[1280px]">
      {/* Suspense: la vista lee `?codigo=` desde la URL (useSearchParams). */}
      <Suspense fallback={null}>
        <PantallaLegislacion />
      </Suspense>
    </Vista>
  );
}
