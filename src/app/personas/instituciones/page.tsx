import type { Metadata } from "next";
import { InstitucionesPersona } from "@/components/personas/instituciones-persona";

export const metadata: Metadata = { title: "Instituciones del Estado" };

export default function PaginaInstituciones() {
  return <InstitucionesPersona />;
}
