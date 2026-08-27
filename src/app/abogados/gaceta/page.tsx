import type { Metadata } from "next";
import { Suspense } from "react";
import { Vista } from "@/components/portal/marco";
import { PantallaGaceta } from "@/components/portal/pantalla-gaceta";

export const metadata: Metadata = { title: "Alertas de Gaceta" };

export default function PaginaGaceta() {
  return (
    <Vista titulo="Alertas de Gaceta" ancho="max-w-[1280px]">
      {/* Suspense: la vista lee el deep-link del digest desde la URL (useSearchParams). */}
      <Suspense fallback={null}>
        <PantallaGaceta />
      </Suspense>
    </Vista>
  );
}
