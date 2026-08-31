import type { Metadata } from "next";
import { VerificaPersona } from "@/components/personas/verifica-persona";

export const metadata: Metadata = { title: "Informe Verifica" };

export default function PaginaVerificaPersona() {
  return <VerificaPersona />;
}
