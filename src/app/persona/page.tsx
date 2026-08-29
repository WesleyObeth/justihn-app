import type { Metadata } from "next";
import { InicioPersona } from "@/components/personas/inicio-persona";

export const metadata: Metadata = { title: "Mi Justihn" };

export default function PaginaInicioPersona() {
  return <InicioPersona />;
}
