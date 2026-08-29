import type { Metadata } from "next";
import { Suspense } from "react";
import { PantallaDirectorio } from "@/components/publico/directorio";

export const metadata: Metadata = {
  title: "Encuentra abogado",
  description: "Abogados de Honduras por materia y ciudad, con perfiles validados.",
};

export default function PaginaDirectorio() {
  return (
    <Suspense fallback={null}>
      <PantallaDirectorio />
    </Suspense>
  );
}
