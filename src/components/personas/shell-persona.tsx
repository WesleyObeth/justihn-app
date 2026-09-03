"use client";

/**
 * Shell del portal ciudadano (`/personas`) — gemelo del portal de abogados:
 * sidebar marino colapsable en escritorio (mismo estado del store, así que la
 * preferencia viaja con la persona), navegación agrupada por categorías y
 * drawer en móvil. La "cuenta" es la sesión demo de la persona.
 */
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { mesAnio } from "@/lib/tiempo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { LogoJustihn, SimboloJustihn } from "@/components/brand/logos";
import { DrawerMenuMovil, IconoColapsar } from "@/components/portal/sidebar";
import { useTodosLosAvisos } from "./notificaciones-persona";
import { PERSONA_DEMO } from "@/data/persona";
import { usePortal, useNotifsSinLeer } from "@/store/portal";
import { cn } from "@/lib/utils";

interface ItemNav {
  href: string;
  label: string;
  icono: NombreIcono;
}

type EntradaNav = ItemNav | { seccion: string };

/**
 * Dos categorías con la misma lógica que las del abogado (Investigación /
 * Consultorio), vista desde el ciudadano: lo que ya empezó y guarda avance,
 * y lo que consulta cuando lo necesita. "Mi plan" no está aquí sino en el menú
 * del avatar — donde lo tiene el abogado, y donde ya se anuncia su plan.
 */
const NAV_PERSONA: EntradaNav[] = [
  { href: "/personas", label: "Inicio", icono: "dash" },
  { seccion: "Mis gestiones" },
  { href: "/personas/tramites", label: "Trámites", icono: "pasos" },
  { href: "/personas/consultas", label: "Mis consultas", icono: "leads" },
  { seccion: "Herramientas" },
  { href: "/personas/instituciones", label: "Instituciones", icono: "gaceta" },
  { href: "/personas/directorio", label: "Encuentra abogado", icono: "perfil" },
  { href: "/personas/calculadora", label: "Calculadoras", icono: "calc" },
  { seccion: "Verificación" },
  { href: "/personas/verifica", label: "Informe Verifica", icono: "buscar" },
  { href: "/personas/monitoreo", label: "Mi nombre", icono: "bell" },
];

function esActiva(pathname: string, href: string): boolean {
  if (href === "/personas") return pathname === "/personas";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * `variante="escritorio"`: columna fija con colapso, oculta bajo `lg`.
 * `variante="movil"`: mismo contenido siempre expandido, para el drawer.
 */
export function SidebarPersona({
  variante = "escritorio",
}: {
  variante?: "escritorio" | "movil";
}) {
  const pathname = usePathname();
  const esMovil = variante === "movil";
  const colapsado = usePortal((s) => s.sidebarColapsado) && !esMovil;
  const toggleSidebar = usePortal((s) => s.toggleSidebar);
  const expandido = !colapsado;

  return (
    <nav
      aria-label="Navegación del portal"
      className={cn(
        "relative z-20 flex shrink-0 flex-col text-[#e8eef6] transition-[width,min-width] duration-[250ms]",
        esMovil ? "h-full" : "max-lg:hidden",
      )}
      style={{
        width: colapsado ? 68 : 236,
        minWidth: colapsado ? 68 : 236,
        background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)",
      }}
    >
      <div className="flex items-center gap-[7px] px-3.5 pt-4 pb-2.5">
        {expandido ? (
          <>
            <Link href="/" className="ml-[3px] inline-block" aria-label="Justihn — inicio">
              <LogoJustihn size={28} variante="oscuro" textoPx={17} />
            </Link>
            {!esMovil && (
              <button
                type="button"
                onClick={toggleSidebar}
                title="Contraer menú"
                aria-label="Contraer menú"
                className="ml-auto grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-sobre-marino hover:bg-white/10 hover:text-[#e8eef6]"
              >
                <IconoColapsar direccion="izquierda" />
              </button>
            )}
          </>
        ) : (
          <Link href="/" className="ml-[3px]" aria-label="Justihn — inicio">
            <SimboloJustihn size={28} variante="oscuro" />
          </Link>
        )}
      </div>

      {colapsado && (
        <div className="flex justify-center pb-1.5">
          <button
            type="button"
            onClick={toggleSidebar}
            title="Expandir menú"
            aria-label="Expandir menú"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-sobre-marino hover:bg-white/10 hover:text-[#e8eef6]"
          >
            <IconoColapsar direccion="derecha" />
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-2.5 py-1">
        {NAV_PERSONA.map((entrada) => {
          if ("seccion" in entrada) {
            // Colapsada la barra no hay ancho para el rótulo; el grupo se lee
            // por la separación entre iconos.
            return expandido ? (
              <div
                key={entrada.seccion}
                className="px-3 pt-2.5 pb-0.5 text-[10px] font-semibold tracking-[1.6px] whitespace-nowrap text-[#5f7ba0] uppercase"
              >
                {entrada.seccion}
              </div>
            ) : (
              <div key={entrada.seccion} className="mx-auto my-1.5 h-px w-6 bg-white/[0.12]" />
            );
          }
          const activo = esActiva(pathname, entrada.href);
          return (
            <Link
              key={entrada.href}
              href={entrada.href}
              title={entrada.label}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-[7px] transition-colors",
                activo ? "bg-celeste text-white" : "text-nav hover:bg-white/[0.08]",
              )}
            >
              <span className="grid w-[22px] min-w-[22px] place-items-center">
                <Icono nombre={entrada.icono} size={17} />
              </span>
              {expandido && (
                <span className="text-[13.5px] font-medium whitespace-nowrap">{entrada.label}</span>
              )}
            </Link>
          );
        })}
      </div>

      <MenuUsuarioPersona expandido={expandido} />
    </nav>
  );
}

/** Menú del avatar (patrón del portal de abogados): plan, perfil,
 *  configuración, ayuda y cerrar sesión. */
function MenuUsuarioPersona({ expandido }: { expandido: boolean }) {
  const router = useRouter();
  const sinLeer = useNotifsSinLeer(useTodosLosAvisos());
  const [abierto, setAbierto] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  /**
   * Cierre de sesión real. Tres pasos y ninguno sobra: `signOut` borra las
   * cookies que lee el proxy, `replace` saca el portal del historial para que
   * el botón atrás no vuelva a él, y `refresh` invalida el caché de rutas de
   * Next — sin él se puede volver a pintar una pantalla del portal que ya
   * estaba renderizada con la sesión anterior.
   */
  const salir = async () => {
    setAbierto(false);
    setSaliendo(true);
    await supabaseNavegador().auth.signOut();
    router.replace("/");
    router.refresh();
  };

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
            className="absolute bottom-[66px] left-2.5 z-[60] w-[224px] rounded-[14px] border border-white/[0.14] bg-[#12294f] p-2"
            style={{ boxShadow: "0 18px 48px rgba(5,12,26,.6)", animation: "fadeUp .2s ease" }}
            role="menu"
          >
            {/* Identidad + plan de un vistazo */}
            <div className="border-b border-white/10 px-3 pt-2.5 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{PERSONA_DEMO.nombre}</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-1.5 py-px text-[10px] font-bold text-[#9fb6d0]">
                  GRATIS
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-sobre-marino">
                Miembro desde {mesAnio(PERSONA_DEMO.creadoEn)}
              </div>
            </div>

            {/* El plan: contexto antes que las acciones, como en el del abogado */}
            <button
              type="button"
              role="menuitem"
              onClick={() => ir("/personas/plan")}
              className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-2.5 text-[12.5px] text-[#9fb6d0]">
                <span className="grid w-[18px] place-items-center text-[#e8eef6]">
                  <Icono nombre="planes" size={15} />
                </span>
                <span className="flex-1">Mi plan</span>
                <b className="text-[#e8eef6]">Gratis</b>
              </div>
              <div className="mt-1.5 ml-[28px] text-[11px] text-celeste">Ver qué incluye →</div>
            </button>

            {/* Cuenta */}
            <div className="my-1 border-t border-white/10 pt-1">
              <ItemMenu icono="perfil" onClick={() => ir("/personas/perfil")}>
                Mi perfil
              </ItemMenu>
              <ItemMenu icono="config" onClick={() => ir("/personas/configuracion")}>
                Configuración
              </ItemMenu>
            </div>

            {/* Avisos y soporte */}
            <div className="my-1 border-t border-white/10 pt-1">
              <ItemMenu
                icono="bell"
                onClick={() => ir("/personas/notificaciones")}
                insignia={sinLeer}
              >
                Notificaciones
              </ItemMenu>
              <ItemMenu icono="help" onClick={() => ir("/personas/ayuda")}>
                Ayuda
              </ItemMenu>
            </div>

            <div className="mt-1 border-t border-white/10 pt-1">
              <ItemMenu
                icono="logout"
                destructivo
                onClick={() => void salir()}
              >
                {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
              </ItemMenu>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        title={PERSONA_DEMO.nombre}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-[7px] text-left hover:bg-white/[0.08]"
      >
        {/* El punto sobre el avatar es lo único que delata avisos sin leer con
            el menú cerrado — y con la barra colapsada, lo único visible. */}
        <span className="relative grid h-[34px] w-[34px] min-w-[34px] place-items-center">
          <span className="font-display grid h-[34px] w-[34px] place-items-center rounded-full bg-celeste text-[12.5px] font-semibold text-white">
            {PERSONA_DEMO.iniciales}
          </span>
          {sinLeer > 0 && !abierto && (
            <span
              className="absolute -top-px -right-px h-2.5 w-2.5 rounded-full bg-urgente ring-2 ring-[#0b1d3a]"
              aria-label={`${sinLeer} notificaciones sin leer`}
              role="img"
            />
          )}
        </span>
        {expandido && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold">
                {PERSONA_DEMO.nombre}
              </span>
              <span className="block text-[11px] text-sobre-marino">Plan Gratis</span>
            </span>
            <span className="grid place-items-center text-sobre-marino">
              <Icono nombre="chevrons" size={18} />
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function ItemMenu({
  icono,
  onClick,
  children,
  insignia,
  destructivo,
}: {
  icono: NombreIcono;
  onClick: () => void;
  children: React.ReactNode;
  insignia?: number;
  destructivo?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px]",
        destructivo ? "text-[#f0857a] hover:bg-[rgba(240,133,122,.1)]" : "hover:bg-white/[0.08]",
      )}
    >
      <span className="grid w-[18px] place-items-center">
        <Icono nombre={icono} size={15} />
      </span>
      <span className="flex-1">{children}</span>
      {insignia !== undefined && insignia > 0 && (
        <span className="rounded-full bg-urgente px-[7px] py-px text-[10.5px] font-bold text-white">
          {insignia}
        </span>
      )}
    </button>
  );
}

// ── Navegación móvil (bajo `lg`) ───────────────────────────────────────────

/** Barra superior con hamburguesa — gemela de la del portal de abogados. */
export function HeaderMovilPersona() {
  const setMenuMovil = usePortal((s) => s.setMenuMovil);

  return (
    <header className="flex items-center gap-2.5 border-b border-borde bg-white px-4 py-2.5 lg:hidden">
      <button
        type="button"
        onClick={() => setMenuMovil(true)}
        aria-label="Abrir menú"
        className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-marino hover:bg-lienzo"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <Link href="/personas" aria-label="Justihn">
        <LogoJustihn size={24} textoPx={15} />
      </Link>
    </header>
  );
}

/** Drawer del portal ciudadano: el sidebar completo en variante móvil. */
export function CapaMenuMovilPersona() {
  return (
    <DrawerMenuMovil>
      <SidebarPersona variante="movil" />
    </DrawerMenuMovil>
  );
}
