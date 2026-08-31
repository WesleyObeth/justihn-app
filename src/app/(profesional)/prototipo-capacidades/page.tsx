import type { Metadata } from "next";
import { PrototipoCapacidades } from "@/components/landing/prototipo-capacidades";

export const metadata: Metadata = {
  title: { absolute: "Prototipo · lo que encuentras dentro" },
  description: "Comparativa temporal de tres estructuras para la sección de capacidades.",
};

/** ⚗️ Ruta temporal para elegir estructura. Se borra con el componente. */
export default function PaginaPrototipoCapacidades() {
  return <PrototipoCapacidades />;
}
