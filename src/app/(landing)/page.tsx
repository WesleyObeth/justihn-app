import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingContenido } from "@/components/landing/landing-content";

export const metadata: Metadata = {
  title: "Justihn — Tu guía legal en Honduras",
  description:
    "Guías de trámites paso a paso, consultorio legal gratuito y abogados por materia. Orientación con fuentes oficiales.",
};

export default function PaginaHome() {
  return (
    // Suspense: el directorio lee `?materia=` para llegar filtrado.
    <Suspense fallback={null}>
      <LandingContenido />
    </Suspense>
  );
}
