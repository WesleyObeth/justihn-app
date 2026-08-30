import { ImageResponse } from "next/og";
import { fuentesOg, OG_CONTENT_TYPE, OG_SIZE, TarjetaOg } from "@/lib/og/tarjeta";

/**
 * Tarjeta de la vía A. Es la que más se comparte hoy: el enlace que Wesley y
 * el socio pasan por WhatsApp a abogados. Por eso el titular habla del oficio
 * ("tu investigación", el mismo del hero) y los sellos son las tres promesas
 * que un colegiado puede verificar en dos minutos dentro del portal.
 */
export const alt = "Justihn para abogados — jurisprudencia, La Gaceta y Jus IA con citas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Imagen() {
  return new ImageResponse(
    (
      <TarjetaOg
        eyebrow="Para abogados"
        titulo="Tu investigación jurídica empieza en Justihn"
        bajada="Jurisprudencia del CSJ, códigos y alertas de La Gaceta. Jus IA responde con la sentencia o el artículo que lo sostiene."
        sellos={["Jus IA con citas", "Alertas de Gaceta", "Modelos y cálculos"]}
      />
    ),
    { ...size, fonts: await fuentesOg() },
  );
}
