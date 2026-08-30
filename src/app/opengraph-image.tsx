import { ImageResponse } from "next/og";
import { fuentesOg, OG_CONTENT_TYPE, OG_SIZE, TarjetaOg } from "@/lib/og/tarjeta";

/**
 * Tarjeta social por defecto: la heredan las rutas que no traen la suya
 * (portal, auth, trámites…). Habla de lo que el producto ES, sin suponer
 * quién comparte el enlace.
 */
export const alt = "Justihn — asistente jurídico de Honduras que cita sus fuentes";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Imagen() {
  return new ImageResponse(
    (
      <TarjetaOg
        eyebrow="Honduras"
        titulo="El asistente jurídico que cita sus fuentes"
        bajada="Jurisprudencia, leyes, La Gaceta y trámites del Estado. Si no hay fuente, no hay respuesta."
        sellos={["Poder Judicial", "La Gaceta", "Cada cita, enlazada"]}
      />
    ),
    { ...size, fonts: await fuentesOg() },
  );
}
