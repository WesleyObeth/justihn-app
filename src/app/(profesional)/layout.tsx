import "@/components/landing/landing.css";
import { FondoAurora } from "@/components/landing/fondo-aurora";
import { NavAurora } from "@/components/landing/nav-aurora";
import { BotonesMagneticos } from "@/components/landing/magnetico";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Shell de la landing de la vía A (abogados). Misma superficie aurora que la
 * home ciudadana —es la misma marca— con la navegación de la otra audiencia:
 * los enlaces apuntan a las secciones de esta página y el CTA lleva al portal.
 */
export default function LayoutProfesional({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-aurora">
      <HidratarStore />
      <FondoAurora />
      <NavAurora
        enlaces={[
          { href: "#capacidades", label: "Qué incluye" },
          { href: "#fuentes", label: "Cómo cita" },
          { href: "#leads", label: "Clientes" },
          { href: "#planes", label: "Planes" },
          { href: "#faq", label: "Preguntas" },
        ]}
        secundario={{ href: "/", label: "Para personas" }}
        cta={{ href: "/iniciar-sesion", label: "Iniciar sesión" }}
      />
      {children}
      <BotonesMagneticos />
      <Toast />
    </div>
  );
}
