"use client";

import { useSearchParams } from "next/navigation";
import { ConmutadorVistas, leerVista } from "./legislacion/comun";
import { VistaBuscador } from "./legislacion/vista-buscador";
import { VistaLector } from "./legislacion/vista-lector";
import { VistaTemas } from "./legislacion/vista-temas";

/**
 * Legislación sobre el CORPUS REAL (conectada el 2026-09-03). Desde ese mismo
 * día conviven TRES estructuras como prototipos dentro del portal —Buscador,
 * Lector y Temas— para que Wesley elija con la pantalla real y no con una
 * maqueta (`?vista=`). Cuando elija, las otras dos se borran.
 */
export function PantallaLegislacion() {
  const params = useSearchParams();
  const vista = leerVista(params.get("vista"));
  return (
    <>
      <ConmutadorVistas vista={vista} />
      {vista === "lector" ? (
        <VistaLector />
      ) : vista === "temas" ? (
        <VistaTemas />
      ) : (
        <VistaBuscador key={params.toString()} />
      )}
    </>
  );
}
