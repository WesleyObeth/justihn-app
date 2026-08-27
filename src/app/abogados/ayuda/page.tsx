import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaAyuda } from "@/components/portal/pantalla-ayuda";

export const metadata: Metadata = { title: "Ayuda" };

export default function PaginaAyuda() {
  return (
    <Vista titulo="Ayuda" ancho="max-w-[900px]">
      <PantallaAyuda />
    </Vista>
  );
}
