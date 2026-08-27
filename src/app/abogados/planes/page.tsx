import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaPlanes } from "@/components/portal/pantalla-planes";

export const metadata: Metadata = { title: "Planes y suscripción" };

export default function PaginaPlanes() {
  return (
    <Vista titulo="Planes y suscripción" ancho="max-w-[1100px]">
      <PantallaPlanes />
    </Vista>
  );
}
