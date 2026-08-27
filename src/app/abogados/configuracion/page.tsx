import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { PantallaConfiguracion } from "@/components/portal/pantalla-configuracion";

export const metadata: Metadata = { title: "Configuración" };

export default function PaginaConfiguracion() {
  return (
    <Vista titulo="Configuración" ancho="max-w-[900px]">
      <PantallaConfiguracion />
    </Vista>
  );
}
