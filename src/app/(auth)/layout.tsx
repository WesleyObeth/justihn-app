import "@/components/landing/landing.css";
import "@/components/auth/auth.css";
import { FondoAurora } from "@/components/landing/fondo-aurora";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Shell de las pantallas de autenticación (iniciar sesión + crear cuenta):
 * el aurora en su variante NOCHE (shader oscuro sobre gradiente navy, handoff
 * design_handoff_auth), sin navegación — el logo vive dentro de cada pantalla.
 */
export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-aurora landing-aurora--noche">
      <HidratarStore />
      <FondoAurora variante="noche" />
      <div className="landing-contenido">{children}</div>
      <Toast />
    </div>
  );
}
