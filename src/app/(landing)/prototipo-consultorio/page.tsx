import type { Metadata } from "next";
import { PrototipoConsultorio } from "@/components/landing/prototipo-consultorio";

export const metadata: Metadata = {
  title: { absolute: "Prototipo · estructura del consultorio" },
  description: "Comparativa temporal de tres estructuras para el consultorio gratuito.",
};

/** ⚗️ Ruta temporal para elegir estructura. Se borra con el componente. */
export default function PaginaPrototipoConsultorio() {
  return <PrototipoConsultorio />;
}
