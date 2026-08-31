import { ImageResponse } from "next/og";
import { fuentesOg, OG_CONTENT_TYPE, OG_SIZE, TarjetaOg } from "@/lib/og/tarjeta";
import { TRAMITES } from "@/data/tramites";

/**
 * Tarjeta de la vía B (home ciudadana). Habla como la gente busca —
 * "trámite", "abogado"— no en lenguaje de gremio, y su promesa es la que la
 * home cumple: guías con la fuente oficial y un consultorio gratis.
 */
export const alt = "Justihn — trámites, procesos y abogados en Honduras";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Imagen() {
  return new ImageResponse(
    (
      <TarjetaOg
        eyebrow="Para personas"
        titulo="Tu trámite, paso a paso y sin vueltas"
        bajada="Requisitos, costos y tiempos de los trámites del Estado. Consulta gratis con abogados de Honduras."
        // El conteo sale del seed: escrito a mano se queda viejo en cuanto
        // nace una guía, y esta tarjeta es lo que se ve al compartir el enlace.
        sellos={[`${TRAMITES.length} guías con fuente`, "Consultorio gratis", "Abogados por materia"]}
      />
    ),
    { ...size, fonts: await fuentesOg() },
  );
}
