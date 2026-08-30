import "@/components/landing/landing.css";
import { FondoAurora } from "@/components/landing/fondo-aurora";
import { NavAurora } from "@/components/landing/nav-aurora";
import { BotonesMagneticos } from "@/components/landing/magnetico";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Shell de la landing (solo la home): fondo aurora WebGL + nav glassy fija.
 * Stacking del contrato: fondo z-0 · canvas+scrim z-1 · contenido z-2 ·
 * nav z-100. Las páginas públicas interiores usan el shell claro de (publico).
 */
export default function LayoutLanding({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-aurora">
      <HidratarStore />
      <FondoAurora />
      <NavAurora />
      {children}
      <BotonesMagneticos />
      <Toast />
    </div>
  );
}
