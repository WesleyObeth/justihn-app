import type { Metadata } from "next";
import { HomePublica } from "@/components/publico/home";

export const metadata: Metadata = {
  title: "Justihn — Tu guía legal en Honduras",
  description:
    "Guías de trámites paso a paso, consultorio legal gratuito y abogados por materia. Orientación con fuentes oficiales.",
};

export default function PaginaHome() {
  return <HomePublica />;
}
