import type { Metadata } from "next";
import { ConfiguracionPersona } from "@/components/personas/configuracion-persona";

export const metadata: Metadata = { title: "Configuración" };

export default function PaginaConfiguracionPersona() {
  return <ConfiguracionPersona />;
}
