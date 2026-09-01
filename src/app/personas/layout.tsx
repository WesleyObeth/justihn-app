import {
  CapaMenuMovilPersona,
  HeaderMovilPersona,
  SidebarPersona,
} from "@/components/personas/shell-persona";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Portal ciudadano (Vía B, patrón Jusbrasil): la landing pública da la
 * probadita; la cuenta gratis abre este portal. Comparte el store con el
 * portal de abogados — las consultas de la persona son los leads del abogado.
 */
export default function LayoutPersona({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HidratarStore />
      <div className="flex h-screen overflow-hidden lienzo-cielo text-marino">
        <SidebarPersona />
        <div className="flex min-w-0 flex-1 flex-col">
          <HeaderMovilPersona />
          <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7">{children}</main>
        </div>
      </div>
      <CapaMenuMovilPersona />
      <Toast />
    </>
  );
}
