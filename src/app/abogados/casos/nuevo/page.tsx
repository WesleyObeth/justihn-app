import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { NuevoCaso } from "@/components/portal/nuevo-caso";

export const metadata: Metadata = { title: "Nuevo caso" };

export default function PaginaNuevoCaso() {
  return (
    <Vista titulo="Nuevo caso">
      <NuevoCaso />
    </Vista>
  );
}
