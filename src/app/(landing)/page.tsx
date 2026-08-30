import type { Metadata } from "next";
import { LandingContenido } from "@/components/landing/landing-content";

export const metadata: Metadata = {
  title: "Justihn — Tu guía legal en Honduras",
  description:
    "Guías de trámites paso a paso, consultorio legal gratuito y abogados por materia. Orientación con fuentes oficiales.",
};

export default function PaginaHome() {
  // Sin Suspense a propósito: envolver la landing entera hacía que Next
  // emitiera el fallback (null) en el HTML estático. El contenido de la home
  // tiene que llegar al crawler — es el motor de captación del producto.
  return <LandingContenido />;
}
