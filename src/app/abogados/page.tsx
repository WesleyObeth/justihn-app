import type { Metadata } from "next";
import { PantallaJusIA } from "@/components/ia/pantalla-jus-ia";
import { BannerValidacion } from "@/components/portal/marco";

export const metadata: Metadata = { title: "Jus IA" };

/**
 * Home del portal. A diferencia del resto de vistas no lleva título visible:
 * el saludo y el titular del composer hacen de encabezado.
 */
export default function PaginaJusIA() {
  return (
    <div className="flex h-full flex-col">
      <BannerValidacion />
      <div className="min-h-0 flex-1">
        <PantallaJusIA />
      </div>
    </div>
  );
}
