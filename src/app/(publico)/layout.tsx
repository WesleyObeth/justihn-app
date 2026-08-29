import { FooterPublico, HeaderPublico } from "@/components/publico/shell";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Shell del sitio público (Vía B). Comparte el store con el portal de
 * abogados a propósito: una pregunta del consultorio aparece como lead en el
 * portal, y la respuesta del abogado aparece pública aquí — misma data, dos
 * caras.
 */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-lienzo text-marino">
      <HidratarStore />
      <HeaderPublico />
      <main className="flex-1">{children}</main>
      <FooterPublico />
      <Toast />
    </div>
  );
}
