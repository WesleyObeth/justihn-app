import "@/components/landing/landing.css";
import { FondoAurora } from "@/components/landing/fondo-aurora";
import { NavAurora } from "@/components/landing/nav-aurora";
import { BotonesMagneticos } from "@/components/landing/magnetico";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Shell de la landing black (`/para-abogados-black`): la MISMA landing de la
 * vía A en tema oscuro — aurora noche del login + tokens remapeados por
 * `.landing-aurora--black` (landing.css). El contenido es el mismo componente
 * `LandingProfesional`; aquí solo cambia el tema. Página de comparación con
 * Wesley: el enlace secundario vuelve a la versión clara.
 */
export default function LayoutProfesionalBlack({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-aurora landing-aurora--black">
      <HidratarStore />
      <FondoAurora variante="noche" />
      <NavAurora
        logoVariante="oscuro"
        enlaces={[
          { href: "#capacidades", label: "Qué incluye" },
          { href: "#fuentes", label: "Cómo cita" },
          { href: "#leads", label: "Clientes" },
          { href: "#planes", label: "Planes" },
          { href: "#faq", label: "Preguntas" },
        ]}
        secundario={{ href: "/para-abogados", label: "Versión clara" }}
        login={{ href: "/iniciar-sesion", label: "Iniciar sesión" }}
        /* El botón lleno es el alta, no el login: esta página existe para
           convertir abogados NUEVOS — hero, demos, planes y FAQ están todos
           dedicados a convencer. Además, por debajo de 980px el nav esconde
           los enlaces de texto y solo sobrevive este botón. */
        cta={{ href: "/crear-cuenta", label: "Crear cuenta gratis" }}
      />
      {children}
      <BotonesMagneticos />
      <Toast />
    </div>
  );
}
