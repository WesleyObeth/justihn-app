import type { Metadata } from "next";
import { Suspense } from "react";
import { Vista } from "@/components/portal/marco";
import { PantallaPasos } from "@/components/portal/pantalla-pasos";

export const metadata: Metadata = { title: "Procesos" };

export default function PaginaPasos() {
  return (
    <Vista titulo="Procesos" ancho="max-w-[1280px]">
      {/* Suspense: la vista lee `?proceso=` desde la URL (useSearchParams). */}
      <Suspense fallback={null}>
        <PantallaPasos />
      </Suspense>
    </Vista>
  );
}
