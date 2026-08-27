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

export const metadata: Metadata = {
  title: {
    default: "Justihn — Asistente jurídico con fuentes verificadas",
    template: "%s · Justihn",
  },
  description:
    "Jurisprudencia, legislación y alertas de La Gaceta para abogados de Honduras. Cada respuesta cita la fuente oficial.",
  // Deploy de validación: NO indexar hasta el lanzamiento público (la raíz
  // del dominio queda reservada para la vía B). Quitar al lanzar.
  robots: { index: false, follow: false },
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
