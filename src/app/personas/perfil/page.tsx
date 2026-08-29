import type { Metadata } from "next";
import { PerfilPersona } from "@/components/personas/perfil-persona";

export const metadata: Metadata = { title: "Mi perfil" };

export default function PaginaPerfilPersona() {
  return <PerfilPersona />;
}
