import type { Metadata } from "next";
import { ConsultasPersona } from "@/components/personas/consultas-persona";

export const metadata: Metadata = { title: "Mis consultas" };

export default function PaginaConsultasPersona() {
  return <ConsultasPersona />;
}
