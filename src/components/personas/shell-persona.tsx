"use client";

/**
 * Shell del portal ciudadano (`/persona`) — gemelo visual del portal de
 * abogados: sidebar marino en escritorio, barra superior con navegación
 * horizontal en móvil. La "cuenta" es la sesión demo de la persona.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { LogoJustihn, SimboloJustihn } from "@/components/brand/logos";
import { PERSONA_DEMO } from "@/data/persona";
import { cn } from "@/lib/utils";

const NAV_PERSONA: { href: string; label: string; icono: NombreIcono }[] = [
  { href: "/persona", label: "Inicio", icono: "dash" },
  { href: "/persona/tramites", label: "Trámites", icono: "pasos" },
  { href: "/persona/consultas", label: "Mis consultas", icono: "leads" },
  { href: "/persona/abogados", label: "Encuentra abogado", icono: "perfil" },
  { href: "/persona/calculadora", label: "Calculadora", icono: "calc" },
  { href: "/persona/plan", label: "Mi plan", icono: "planes" },
];

function esActiva(pathname: string, href: string): boolean {
  if (href === "/persona") return pathname === "/persona";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarPersona() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación del portal"
      className="relative z-20 hidden w-[236px] min-w-[236px] flex-col text-[#e8eef6] lg:flex"
      style={{ background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)" }}
    >
      <div className="px-4 pt-4 pb-3">
        <Link href="/" aria-label="Justihn — inicio" className="ml-[3px] inline-block">
          <LogoJustihn size={28} variante="oscuro" textoPx={17} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-1.5">
        {NAV_PERSONA.map((item) => {
          const activo = esActiva(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-[9px] transition-colors",
                activo ? "bg-celeste text-white" : "text-nav hover:bg-white/[0.08]",
              )}
            >
              <span className="grid w-[22px] min-w-[22px] place-items-center">
                <Icono nombre={item.icono} size={17} />
              </span>
              <span className="text-[13.5px] font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/[0.08] p-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-display grid h-9 w-9 place-items-center rounded-full bg-celeste text-[13px] font-semibold text-white">
            {PERSONA_DEMO.iniciales}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold">{PERSONA_DEMO.nombre}</div>
            <div className="text-[11px] text-sobre-marino">Plan Gratis</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Barra superior móvil: logo + navegación horizontal deslizable. */
export function HeaderMovilPersona() {
  const pathname = usePathname();

  return (
    <div
      className="text-[#e8eef6] lg:hidden"
      style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <Link href="/" aria-label="Justihn — inicio">
          <SimboloJustihn size={26} variante="oscuro" />
        </Link>
        <span className="flex items-center gap-2 text-[12px] text-sobre-marino">
          <span className="font-display grid h-7 w-7 place-items-center rounded-full bg-celeste text-[11px] font-semibold text-white">
            {PERSONA_DEMO.iniciales}
          </span>
          {PERSONA_DEMO.nombre}
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 py-2.5">
        {NAV_PERSONA.map((item) => {
          const activo = esActiva(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap",
                activo ? "bg-celeste text-white" : "text-nav hover:bg-white/10",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
