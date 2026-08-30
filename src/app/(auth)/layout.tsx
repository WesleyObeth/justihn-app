import "@/components/landing/landing.css";
import "@/components/auth/auth.css";
import { FondoAurora } from "@/components/landing/fondo-aurora";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Shell de las pantallas de autenticación (iniciar sesión + crear cuenta).
 *
 * **Prueba 2026-08-30 (Wesley):** usa la MISMA aurora clara de las landings en
 * vez de la variante noche del handoff, para ver cuál convence. Si se vuelve
 * atrás: `landing-aurora--noche` + `<FondoAurora variante="noche" />`, y las
 * tarjetas vuelven a glass oscuro (está todo en un solo commit).
 */
export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-aurora">
      <HidratarStore />
      <FondoAurora />
      <div className="landing-contenido">{children}</div>
      <Toast />
    </div>
  );
}
