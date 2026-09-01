import { CapaMenuMovil, HeaderMovil, Sidebar } from "@/components/portal/sidebar";
import { EditorEscrito, Toast } from "@/components/portal/capas-globales";
import { HidratarStore, ProveedorUpgrade } from "@/components/portal/marco";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorUpgrade>
      <HidratarStore />
      <div className="flex h-screen overflow-hidden lienzo-cielo text-marino">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <HeaderMovil />
          <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7">{children}</main>
        </div>
      </div>
      <CapaMenuMovil />
      <EditorEscrito />
      <Toast />
    </ProveedorUpgrade>
  );
}
