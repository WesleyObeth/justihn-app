import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaPropuestas } from "@/components/portal/pantalla-propuestas";

export const metadata: Metadata = { title: "Propuestas de honorarios" };

export default function PaginaPropuestas() {
  return (
    <Vista titulo="Propuestas de honorarios">
      <PantallaPropuestas />
    </Vista>
  );
}
