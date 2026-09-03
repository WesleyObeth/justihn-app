import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaCasos } from "@/components/portal/pantalla-casos";

export const metadata: Metadata = { title: "Mis casos" };

export default function PaginaCasos() {
  return (
    <Vista titulo="Mis casos">
      <PantallaCasos />
    </Vista>
  );
}
