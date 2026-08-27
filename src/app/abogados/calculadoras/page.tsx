import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaCalculadoras } from "@/components/portal/pantalla-calculadoras";

export const metadata: Metadata = { title: "Calculadoras" };

export default function PaginaCalculadoras() {
  return (
    <Vista titulo="Calculadoras" ancho="max-w-[1280px]">
      <PantallaCalculadoras />
    </Vista>
  );
}
