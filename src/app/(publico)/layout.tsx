import "@/components/landing/landing.css";
import { FondoAurora } from "@/components/landing/fondo-aurora";
import { NavAurora } from "@/components/landing/nav-aurora";
import { PieAurora } from "@/components/landing/pie-aurora";
import { BotonesMagneticos } from "@/components/landing/magnetico";
import { Toast } from "@/components/portal/capas-globales";
import { HidratarStore } from "@/components/portal/marco";

/**
 * Shell de las páginas públicas interiores — hoy el detalle de trámite y la
 * calculadora. **Es el MISMO shell aurora de la home** (decisión Wesley
 * 2026-08-30): antes tenían cabecera blanca y fondo plano, así que abrir una
 * guía desde la home se sentía como salir del sitio. Nav, fondo y pie son los
 * mismos; lo único que cambia es el contenido.
 *
 * Comparte el store con el portal de abogados a propósito: una pregunta del
 * consultorio aparece como lead en el portal, y la respuesta del abogado
 * aparece pública aquí — misma data, dos caras.
 */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-aurora">
      <HidratarStore />
      <FondoAurora />
      <NavAurora />
      {/* `pt`: la nav es fija, así que el contenido arranca por debajo. */}
      <div className="landing-contenido pt-[110px]">{children}</div>
      <PieAurora
        descripcion="Orientación legal con fuentes oficiales para Honduras. Justihn no es un bufete: las guías son orientación general y no sustituyen la asesoría profesional sobre tu caso concreto."
        columnas={[
          {
            titulo: "Para ti",
            enlaces: [
              { href: "/#tramites", label: "Guías de trámites" },
              { href: "/#procesos", label: "Procesos legales" },
              { href: "/#consultorio", label: "Consultorio gratuito" },
              { href: "/#directorio", label: "Encuentra abogado" },
              { href: "/personas", label: "Mi cuenta" },
            ],
          },
          {
            titulo: "Abogados",
            enlaces: [
              { href: "/para-abogados", label: "Justihn para abogados" },
              { href: "/abogados", label: "Portal de abogados" },
              { href: "/iniciar-sesion", label: "Entrar como abogado" },
            ],
          },
        ]}
        nota="Habeas data (art. 182 de la Constitución): revisa o pide la supresión de tus datos — respondemos en 72 horas hábiles. · © 2026 Justihn (demo de validación)"
      />
      <BotonesMagneticos />
      <Toast />
    </div>
  );
}
