import type { Metadata } from "next";
import { PantallaInicio } from "@/components/portal/pantalla-inicio";

export const metadata: Metadata = { title: "Dashboard" };

export default function PaginaInicio() {
  return <PantallaInicio />;
}
