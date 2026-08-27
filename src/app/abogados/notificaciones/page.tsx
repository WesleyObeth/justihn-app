import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaNotificaciones } from "@/components/portal/pantalla-notificaciones";

export const metadata: Metadata = { title: "Notificaciones" };

export default function PaginaNotificaciones() {
  return (
    <Vista titulo="Notificaciones" ancho="max-w-[900px]">
      <PantallaNotificaciones />
    </Vista>
  );
}
