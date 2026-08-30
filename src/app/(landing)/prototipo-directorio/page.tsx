import type { Metadata } from "next";
import { PrototipoDirectorio } from "@/components/landing/prototipo-directorio";

export const metadata: Metadata = {
  title: { absolute: "Prototipo · estructura del directorio" },
  description: "Comparativa temporal de tres estructuras y tres CTA para el directorio.",
};

/** ⚗️ Ruta temporal para elegir estructura. Se borra con el componente. */
export default function PaginaPrototipoDirectorio() {
  return <PrototipoDirectorio />;
}
