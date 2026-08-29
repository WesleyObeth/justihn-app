import type { Metadata } from "next";
import { Suspense } from "react";
import { PantallaDirectorio } from "@/components/publico/directorio";

export const metadata: Metadata = { title: "Encuentra abogado" };

export default function PaginaAbogadosPersona() {
  return (
    <Suspense fallback={null}>
      <PantallaDirectorio enPortal />
    </Suspense>
  );
}
