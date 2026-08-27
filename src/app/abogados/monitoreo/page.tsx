import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaMonitoreo } from "@/components/portal/pantalla-monitoreo";

export const metadata: Metadata = { title: "Monitoreo de nombres" };

export default function PaginaMonitoreo() {
  return (
    <Vista titulo="Monitoreo de nombres" ancho="max-w-[1080px]">
      <PantallaMonitoreo />
    </Vista>
  );
}
