"use client";

/**
 * Shell del portal ciudadano (`/personas`) — gemelo visual del portal de
 * abogados: sidebar marino en escritorio, barra superior con navegación
 * horizontal en móvil. La "cuenta" es la sesión demo de la persona.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { LogoJustihn, SimboloJustihn } from "@/components/brand/logos";
import { PERSONA_DEMO } from "@/data/persona";
import { usePortal } from "@/store/portal";
import { cn } from "@/lib/utils";

const NAV_PERSONA: { href: string; label: string; icono: NombreIcono }[] = [
  { href: "/personas", label: "Inicio", icono: "dash" },
  { href: "/personas/tramites", label: "Trámites", icono: "pasos" },
  { href: "/personas/consultas", label: "Mis consultas", icono: "leads" },
  { href: "/personas/directorio", label: "Encuentra abogado", icono: "perfil" },
  { href: "/personas/calculadora", label: "Calculadora", icono: "calc" },
  { href: "/personas/plan", label: "Mi plan", icono: "planes" },
];

function esActiva(pathname: string, href: string): boolean {
  if (href === "/personas") return pathname === "/personas";
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

      <MenuUsuarioPersona />
    </nav>
  );
}

/** Menú del avatar (patrón del portal de abogados): perfil, configuración,
 *  ayuda y cerrar sesión. */
function MenuUsuarioPersona() {
  const router = useRouter();
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const ir = (href: string) => {
    setAbierto(false);
    router.push(href);
  };

  return (
    <div className="relative border-t border-white/[0.08] p-2.5">
      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-[55] cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div
            className="absolute bottom-[64px] left-2.5 z-[60] w-[218px] rounded-[14px] border border-white/[0.14] bg-[#12294f] p-2"
            style={{ boxShadow: "0 18px 48px rgba(5,12,26,.6)", animation: "fadeUp .2s ease" }}
            role="menu"
          >
            <div className="px-3 pt-1.5 pb-2">
              <div className="text-sm font-semibold">{PERSONA_DEMO.nombre}</div>
              <div className="text-[11px] text-sobre-marino">
                Plan Gratis · miembro desde {PERSONA_DEMO.miembroDesde}
              </div>
            </div>
            <div className="my-1 h-px bg-white/[0.1]" />
            <ItemMenu icono="perfil" onClick={() => ir("/personas/perfil")}>
              Mi perfil
            </ItemMenu>
            <ItemMenu icono="config" onClick={() => ir("/personas/configuracion")}>
              Configuración
            </ItemMenu>
            <ItemMenu icono="help" onClick={() => ir("/personas/ayuda")}>
              Ayuda
            </ItemMenu>
            <div className="my-1 h-px bg-white/[0.1]" />
            <ItemMenu
              icono="logout"
              onClick={() => {
                setAbierto(false);
                mostrarToast("Sesión de demostración — el login llega con la Fase 2");
              }}
            >
              Cerrar sesión
            </ItemMenu>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-1 text-left hover:bg-white/[0.07]"
      >
        <span className="font-display grid h-9 w-9 shrink-0 place-items-center rounded-full bg-celeste text-[13px] font-semibold text-white">
          {PERSONA_DEMO.iniciales}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{PERSONA_DEMO.nombre}</span>
          <span className="block text-[11px] text-sobre-marino">Plan Gratis</span>
        </span>
        <Icono nombre="chevrons" size={16} className="shrink-0 text-sobre-marino" />
      </button>
    </div>
  );
}

function ItemMenu({
  icono,
  onClick,
  children,
}: {
  icono: NombreIcono;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-nav hover:bg-white/[0.08] hover:text-white"
    >
      <Icono nombre={icono} size={15} />
      {children}
    </button>
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
        <Link
          href="/personas/perfil"
          className="flex items-center gap-2 text-[12px] text-sobre-marino hover:text-white"
        >
          <span className="font-display grid h-7 w-7 place-items-center rounded-full bg-celeste text-[11px] font-semibold text-white">
            {PERSONA_DEMO.iniciales}
          </span>
          {PERSONA_DEMO.nombre}
        </Link>
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
