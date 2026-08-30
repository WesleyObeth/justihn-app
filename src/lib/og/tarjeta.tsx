/**
 * Tarjeta social (Open Graph) — lo que se ve al pegar un enlace de Justihn en
 * WhatsApp, LinkedIn o X.
 *
 * Se genera con `next/og` (satori) EN EL BUILD: cada `opengraph-image.tsx` es
 * una ruta estática, así que el PNG queda servido como archivo y ningún
 * crawler tiene que esperar a que se renderice.
 *
 * Decisiones que vienen del medio, no del gusto:
 * - **1200×630** (1.91:1), el ratio que WhatsApp y LinkedIn muestran completo.
 * - **Texto grande y corto.** En el chat la tarjeta se ve a ~300px de ancho:
 *   lo que aquí mide 60px allá mide 15. Un titular de más de ocho palabras
 *   no se lee en el teléfono.
 * - **Fondo marino**, el mismo del login — la tarjeta tiene que reconocerse
 *   como Justihn antes de leerse.
 * - Peso final por debajo de 300 KB: WhatsApp descarta las imágenes pesadas y
 *   deja la burbuja sin miniatura.
 *
 * satori solo entiende flexbox: todo contenedor con más de un hijo lleva
 * `display: flex` explícito, y no hay `gap` heredado ni `position: static`.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const DIR_FUENTES = join(process.cwd(), "src/app/_og-fuentes");

/** Fuentes de la marca en TTF — satori NO lee woff2, que es lo que deja
 *  `next/font` en el build. Por eso viven aparte, versionadas (OFL). */
export async function fuentesOg() {
  const [display, medium, bold] = await Promise.all([
    readFile(join(DIR_FUENTES, "SpaceGrotesk-Bold.ttf")),
    readFile(join(DIR_FUENTES, "InstrumentSans-Medium.ttf")),
    readFile(join(DIR_FUENTES, "InstrumentSans-Bold.ttf")),
  ]);
  return [
    { name: "Space Grotesk", data: display, weight: 700 as const, style: "normal" as const },
    { name: "Instrument Sans", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Instrument Sans", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

/** Símbolo oficial (geometría de `logo/justihn-icon-dark.svg`) como data URI:
 *  satori dibuja SVG dentro de <img>, no como elementos sueltos. */
const SIMBOLO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 48 48"><defs><clipPath id="c"><rect x="11.15" y="3" width="11.7" height="36" rx="5.85" transform="rotate(-26 17 21)"/></clipPath></defs><rect x="11.15" y="3" width="11.7" height="36" rx="5.85" fill="#ffffff" transform="rotate(-26 17 21)"/><rect x="25.15" y="3" width="11.7" height="36" rx="5.85" fill="#1584c7" transform="rotate(26 31 21)"/><g clip-path="url(#c)"><rect x="25.15" y="3" width="11.7" height="36" rx="5.85" fill="#0e5f92" transform="rotate(26 31 21)"/></g></svg>`,
)}`;

export interface DatosTarjeta {
  /** A quién habla la tarjeta — va sobre el titular, en celeste. */
  eyebrow: string;
  /** El titular. Corto: se lee a 300px de ancho en el chat. */
  titulo: string;
  /** Una línea de apoyo. Dos como mucho. */
  bajada: string;
  /** Tres pruebas cortas al pie. Son el argumento, no adorno. */
  sellos: string[];
}

export function TarjetaOg({ eyebrow, titulo, bajada, sellos }: DatosTarjeta) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#0a1830",
        fontFamily: "Instrument Sans",
      }}
    >
      {/* Marino del login */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "linear-gradient(160deg,#0d2144 0%,#0a1830 55%,#0e2a52 100%)",
        }}
      />
      {/* Eco del aurora: un solo resplandor celeste arriba a la derecha */}
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -120,
          width: 760,
          height: 620,
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(21,132,199,.45) 0%, rgba(21,132,199,0) 68%)",
        }}
      />
      {/* Filo celeste inferior: cierra la tarjeta cuando el chat la recorta */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          backgroundImage: "linear-gradient(90deg,#1584c7 0%,#7dd3fc 55%,#0e5f92 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "62px 72px 66px",
        }}
      >
        {/* Lockup: símbolo oficial + wordmark en Instrument Sans 700 */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SIMBOLO} width={72} height={72} alt="" />
          <span
            style={{
              marginLeft: 9,
              fontSize: 46,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.015em",
            }}
          >
            Justihn
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#7dd3fc",
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              marginTop: 18,
              fontFamily: "Space Grotesk",
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              maxWidth: 980,
            }}
          >
            {titulo}
          </span>
          <span
            style={{
              marginTop: 20,
              fontSize: 29,
              fontWeight: 500,
              lineHeight: 1.4,
              color: "rgba(226,238,248,.76)",
              maxWidth: 900,
            }}
          >
            {bajada}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {sellos.map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: 14,
                padding: "11px 20px 12px",
                borderRadius: 999,
                border: "1px solid rgba(125,211,252,.32)",
                backgroundColor: "rgba(21,132,199,.16)",
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 12.5 L10 18 L19.5 7" />
              </svg>
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 23,
                  fontWeight: 700,
                  color: "#dbeafe",
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
