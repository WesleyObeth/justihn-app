import type { Metadata } from "next";
import { Suspense } from "react";
import { IndiceTramites } from "@/components/publico/tramites";

export const metadata: Metadata = {
  title: "Guías de trámites",
  description: "Trámites de Honduras paso a paso, por institución del Estado.",
};

export default function PaginaTramites() {
  return (
    <Suspense fallback={null}>
      <IndiceTramites />
    </Suspense>
  );
}
