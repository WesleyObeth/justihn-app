import type { Metadata } from "next";
import { Suspense } from "react";
import { Vista } from "@/components/portal/marco";
import { PantallaLeads } from "@/components/portal/pantalla-leads";

export const metadata: Metadata = { title: "Leads del consultorio" };

export default function PaginaLeads() {
  return (
    <Vista titulo="Leads del consultorio" ancho="max-w-[1080px]">
      {/* Suspense: la vista lee los filtros desde la URL (useSearchParams). */}
      <Suspense fallback={null}>
        <PantallaLeads />
      </Suspense>
    </Vista>
  );
}
