import type { Metadata } from "next";
import { LandingProfesional } from "@/components/profesional/landing-profesional";

export const metadata: Metadata = {
  // `absolute` evita que la plantilla del layout raíz ("%s · Justihn") le
  // añada la marca por segunda vez. El título ya la lleva al frente.
  title: { absolute: "Justihn para abogados — jurisprudencia y leyes de Honduras" },
  description:
    "Jurisprudencia del CSJ, códigos, alertas de La Gaceta, modelos de escritos y calculadoras. Cada respuesta con el enlace al documento oficial.",
  // El enlace que más se comparte por WhatsApp: su `og:url` tiene que ser
  // esta página, no la home. La imagen la pone `opengraph-image.tsx`.
  openGraph: { url: "/para-abogados" },
};

export default function PaginaParaAbogados() {
  return <LandingProfesional />;
}
