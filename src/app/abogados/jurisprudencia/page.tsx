import type { Metadata } from "next";
import { Suspense } from "react";
import { Vista } from "@/components/portal/marco";
import { BuscadorJurisprudencia } from "@/components/portal/jurisprudencia";

export const metadata: Metadata = { title: "Jurisprudencia" };

export default function PaginaJurisprudencia() {
  return (
    <Vista titulo="Jurisprudencia">
      {/* Suspense: la vista lee la búsqueda desde la URL (useSearchParams). */}
      <Suspense fallback={null}>
        <BuscadorJurisprudencia />
      </Suspense>
    </Vista>
  );
}
