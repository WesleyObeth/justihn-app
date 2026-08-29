import type { Metadata } from "next";
import { AyudaPersona } from "@/components/personas/ayuda-persona";

export const metadata: Metadata = { title: "Ayuda" };

export default function PaginaAyudaPersona() {
  return <AyudaPersona />;
}
