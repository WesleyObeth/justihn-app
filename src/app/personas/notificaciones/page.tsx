import type { Metadata } from "next";
import { NotificacionesPersona } from "@/components/personas/notificaciones-persona";

export const metadata: Metadata = { title: "Notificaciones" };

export default function PaginaNotificacionesPersona() {
  return <NotificacionesPersona />;
}
