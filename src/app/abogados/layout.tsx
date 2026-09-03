import { CapaMenuMovil, HeaderMovil, Sidebar } from "@/components/portal/sidebar";
import { EditorEscrito, Toast } from "@/components/portal/capas-globales";
import { HidratarStore, ProveedorUpgrade } from "@/components/portal/marco";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorUpgrade>
      <HidratarStore />
      {/* `print:*`: las propuestas de honorarios se imprimen a PDF desde el
          navegador; sin esto el alto fijo y el scroll interno cortan el
          documento a una sola página. */}
      <div className="flex h-screen overflow-hidden lienzo-cielo text-marino print:h-auto print:overflow-visible print:bg-white">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <HeaderMovil />
          <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7 print:overflow-visible print:p-0">{children}</main>
        </div>
      </div>
      <CapaMenuMovil />
      <EditorEscrito />
      <Toast />
    </ProveedorUpgrade>
  );
}
