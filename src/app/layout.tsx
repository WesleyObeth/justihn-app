import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

/** Instrument Sans: wordmark, texto e interfaz. Su "J" es la oficial de la marca. */
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Space Grotesk: titulares y cifras dentro del producto. Nunca el wordmark. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Origen público del sitio. Es lo que vuelve absolutas las URLs de las
 * tarjetas sociales: WhatsApp y LinkedIn descartan un `og:image` relativo, así
 * que sin esto no hay miniatura.
 * TODO(dominio): al comprar el dominio definitivo, se cambia AQUÍ y nada más.
 */
const SITIO =
  process.env.NEXT_PUBLIC_SITIO_URL?.trim() || "https://justihn-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: {
    default: "Justihn — Asistente jurídico con fuentes verificadas",
    template: "%s · Justihn",
  },
  description:
    "Jurisprudencia, legislación y alertas de La Gaceta para abogados de Honduras. Cada respuesta cita la fuente oficial.",
  // Deploy de validación: NO indexar hasta el lanzamiento público (la raíz
  // del dominio queda reservada para la vía B). Quitar al lanzar.
  // Ojo: `noindex` no afecta la vista previa de WhatsApp — su rastreador lee
  // las etiquetas Open Graph igual. Son cosas distintas.
  robots: { index: false, follow: false },
  // La imagen NO se declara aquí: la aportan los `opengraph-image.tsx` de cada
  // grupo de rutas (raíz, home ciudadana y /para-abogados), que Next resuelve
  // a URL absoluta con sus medidas — WhatsApp las necesita para pintar la
  // burbuja grande sin esperar a descargar el PNG.
  // Sin `url` global a propósito: un `og:url` fijo haría que toda página
  // compartida se canonice como la home. Las páginas que se comparten de
  // verdad declaran el suyo; el resto no emite ninguno y el lector se queda
  // con el enlace que se pegó, que es lo correcto.
  openGraph: {
    type: "website",
    siteName: "Justihn",
    locale: "es_HN",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0d2144",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-HN">
      <body className={`${instrumentSans.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
