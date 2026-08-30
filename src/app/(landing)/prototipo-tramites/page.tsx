import type { Metadata } from "next";
import { PrototipoTramites } from "@/components/landing/prototipo-tramites";

export const metadata: Metadata = {
  title: { absolute: "Prototipo · estructura de trámites" },
  description: "Comparativa temporal de tres estructuras para la sección de trámites.",
};

/** ⚗️ Ruta temporal para elegir estructura. Se borra con el componente. */
export default function PaginaPrototipoTramites() {
  return <PrototipoTramites />;
}
