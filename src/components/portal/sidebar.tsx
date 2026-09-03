"use client";

import { supabaseNavegador } from "@/lib/supabase/cliente";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { LogoJustihn, SimboloJustihn, SimboloJusIALinear } from "@/components/brand/logos";
import { usePortal, useCuota, useNotifsSinLeer } from "@/store/portal";
import { ABOGADA_DEMO, etiquetaColegiacion } from "@/data/catalogo";
import { cn } from "@/lib/utils";
import { BuscadorGlobal } from "./buscador-global";

interface ItemNav {
  href: string;
  label: string;
  icono?: NombreIcono;
  jusIa?: boolean;
  premium?: boolean;
}

type EntradaNav = ItemNav | { seccion: string };

const NAV: EntradaNav[] = [
  { href: "/abogados", label: "Jus IA", jusIa: true },
  { href: "/abogados/dashboard", label: "Dashboard", icono: "dash" },
  // Despacho: lo que el abogado gestiona, no lo que consulta (nace 2026-09-02
  // del feedback de un abogado: expedientes y propuestas de honorarios).
  { seccion: "Despacho" },
  { href: "/abogados/casos", label: "Mis casos", icono: "documento" },
  { href: "/abogados/propuestas", label: "Propuestas", icono: "plantillas", premium: true },
  { seccion: "Investigación" },
  { href: "/abogados/jurisprudencia", label: "Jurisprudencia", icono: "juris" },
  { href: "/abogados/legislacion", label: "Legislación", icono: "libro" },
  { href: "/abogados/procesos", label: "Procesos", icono: "pasos" },
  { href: "/abogados/gaceta", label: "Gaceta", icono: "gaceta" },
  { href: "/abogados/monitoreo", label: "Monitoreo", icono: "bell", premium: true },
  { href: "/abogados/modelos", label: "Modelos", icono: "plantillas", premium: true },
  { seccion: "Consultorio" },
  { href: "/abogados/leads", label: "Leads", icono: "leads" },
  { href: "/abogados/calculadoras", label: "Calculadoras", icono: "calc" },
];

/**
 * `variante="escritorio"`: columna fija con colapso, oculta bajo `lg`.
 * `variante="movil"`: mismo contenido siempre expandido, para el drawer.
 */
export function Sidebar({ variante = "escritorio" }: { variante?: "escritorio" | "movil" }) {
  const pathname = usePathname();
  const esMovil = variante === "movil";
  const colapsado = usePortal((s) => s.sidebarColapsado) && !esMovil;
  const toggleSidebar = usePortal((s) => s.toggleSidebar);
  const expandido = !colapsado;

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        "relative z-20 flex shrink-0 flex-col text-[#e8eef6] transition-[width,min-width] duration-[250ms] print:hidden",
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
            <Link href="/abogados" className="ml-[3px] flex items-center gap-[7px]" aria-label="Justihn">
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
          <Link href="/abogados" className="ml-[3px]" aria-label="Justihn">
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

      {expandido && <BuscadorGlobal />}

      <div className="flex flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto px-2.5 py-1.5">
        {NAV.map((entrada) => {
          if ("seccion" in entrada) {
            return expandido ? (
              <div
                key={entrada.seccion}
                className="px-3 pt-3.5 pb-1 text-[10px] font-semibold tracking-[1.6px] whitespace-nowrap text-[#5f7ba0] uppercase"
              >
                {entrada.seccion}
              </div>
            ) : null;
          }
          return (
            <ItemNavegacion
              key={entrada.href}
              item={entrada}
              activo={esRutaActiva(pathname, entrada.href)}
              expandido={expandido}
            />
          );
        })}
      </div>

      <MenuUsuario expandido={expandido} />
    </nav>
  );
}

/** `/abogados` solo coincide exacto; el resto también con sus subrutas de detalle. */
function esRutaActiva(pathname: string, href: string): boolean {
  if (href === "/abogados") return pathname === "/abogados";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ItemNavegacion({
  item,
  activo,
  expandido,
}: {
  item: ItemNav;
  activo: boolean;
  expandido: boolean;
}) {
  const esPremium = usePortal((s) => s.plan) === "premium";

  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={activo ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-[9px] transition-colors",
        activo ? "bg-celeste text-white" : "text-nav hover:bg-white/[0.08]",
      )}
    >
      <span className="grid w-[22px] min-w-[22px] place-items-center">
        {item.jusIa ? <SimboloJusIALinear size={17} /> : <Icono nombre={item.icono!} size={17} />}
      </span>
      {expandido && (
        <>
          <span className="text-[13.5px] font-medium whitespace-nowrap">{item.label}</span>
          {item.premium && !esPremium && (
            <span className="ml-auto rounded-full border border-[rgba(201,154,58,.4)] bg-[rgba(201,154,58,.18)] px-1.5 py-px text-[10px] font-semibold text-dorado">
              PREMIUM
            </span>
          )}
        </>
      )}
    </Link>
  );
}

function MenuUsuario({ expandido }: { expandido: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const cuota = useCuota();
  const sinLeer = useNotifsSinLeer();

  // Escape cierra el menú; el clic fuera lo cubre el overlay de abajo.
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
    router.replace("/para-abogados");
    router.refresh();
  };

  return (
    <div ref={contenedor} className="relative border-t border-white/[0.08] p-2.5">
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
                <span className="text-sm font-semibold">{ABOGADA_DEMO.nombre}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10px] font-bold",
                    cuota.esPremium
                      ? "border border-[rgba(201,154,58,.4)] bg-[rgba(201,154,58,.18)] text-dorado"
                      : "border border-white/20 bg-white/10 text-[#9fb6d0]",
                  )}
                >
                  {cuota.esPremium ? "PREMIUM" : "PROFESIONAL"}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-sobre-marino">
                {etiquetaColegiacion(ABOGADA_DEMO.colegiacionNumero)}
              </div>
            </div>

            {/* Plan y cuota: el contexto antes que las acciones */}
            <button
              type="button"
              role="menuitem"
              onClick={() => ir("/abogados/planes")}
              className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-2.5 text-[12.5px] text-[#9fb6d0]">
                <span className="grid w-[18px] place-items-center text-[#e8eef6]">
                  <SimboloJusIALinear size={15} />
                </span>
                <span className="flex-1">Jus IA este mes</span>
                <b className="text-[#e8eef6]">{cuota.etiqueta}</b>
              </div>
              {!cuota.esPremium && (
                <div className="mt-2 ml-[28px] h-1 overflow-hidden rounded bg-white/15">
                  <div
                    className="h-full rounded bg-celeste"
                    style={{ width: `${cuota.porcentaje}%` }}
                  />
                </div>
              )}
              <div className="mt-1.5 ml-[28px] text-[11px] text-celeste">
                {cuota.esPremium ? "Ver plan y facturación" : "Mejorar plan →"}
              </div>
            </button>

            {/* Cuenta */}
            <div className="my-1 border-t border-white/10 pt-1">
              <ItemMenu icono="perfil" onClick={() => ir("/abogados/perfil")}>
                Mi perfil
              </ItemMenu>
              <ItemMenu icono="config" onClick={() => ir("/abogados/configuracion")}>
                Configuración
              </ItemMenu>
            </div>

            {/* Avisos y soporte */}
            <div className="my-1 border-t border-white/10 pt-1">
              <ItemMenu
                icono="bell"
                onClick={() => ir("/abogados/notificaciones")}
                insignia={sinLeer}
              >
                Notificaciones
              </ItemMenu>
              <ItemMenu icono="help" onClick={() => ir("/abogados/ayuda")}>
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
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-[7px] text-left hover:bg-white/[0.08]"
      >
        <span className="grid h-[34px] w-[34px] min-w-[34px] place-items-center rounded-full bg-celeste text-[12.5px] font-semibold text-white">
          {ABOGADA_DEMO.iniciales}
        </span>
        {expandido && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold">
                {ABOGADA_DEMO.nombreCorto}
              </span>
              <span className="block text-[11px] text-sobre-marino">
                {cuota.esPremium ? "Plan Premium" : "Plan Profesional"}
              </span>
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
  children,
  onClick,
  insignia,
  destructivo,
}: {
  icono: NombreIcono;
  children: React.ReactNode;
  onClick: () => void;
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

/** Barra superior con hamburguesa — visible solo en pantallas pequeñas. */
export function HeaderMovil() {
  const setMenuMovil = usePortal((s) => s.setMenuMovil);

  return (
    <header className="print:hidden flex items-center gap-2.5 border-b border-borde bg-white px-4 py-2.5 lg:hidden">
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
      <Link href="/abogados" aria-label="Justihn">
        <LogoJustihn size={24} textoPx={15} />
      </Link>
    </header>
  );
}

/**
 * Mecánica del drawer, compartida por los dos portales: se cierra al navegar
 * (cambio de pathname), con Escape o tocando el fondo. El contenido lo pone
 * cada portal — aquí solo vive el comportamiento, que es lo que no conviene
 * duplicar.
 */
export function DrawerMenuMovil({ children }: { children: React.ReactNode }) {
  const abierto = usePortal((s) => s.menuMovil);
  const setMenuMovil = usePortal((s) => s.setMenuMovil);
  const pathname = usePathname();

  useEffect(() => {
    setMenuMovil(false);
  }, [pathname, setMenuMovil]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuMovil(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, setMenuMovil]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={() => setMenuMovil(false)}
        className="absolute inset-0 cursor-default bg-[rgba(10,24,48,.5)]"
      />
      <div className="absolute inset-y-0 left-0" style={{ animation: "fadeUp .2s ease" }}>
        {children}
      </div>
    </div>
  );
}

/** Drawer del portal de abogados: el Sidebar completo en variante móvil. */
export function CapaMenuMovil() {
  return (
    <DrawerMenuMovil>
      <Sidebar variante="movil" />
    </DrawerMenuMovil>
  );
}

export function IconoColapsar({ direccion }: { direccion: "izquierda" | "derecha" }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direccion === "izquierda" ? (
        <>
          <path d="M14.5 6 L8.5 12 L14.5 18" />
          <path d="M18 4 V20" opacity=".45" />
        </>
      ) : (
        <>
          <path d="M9.5 6 L15.5 12 L9.5 18" />
          <path d="M6 4 V20" opacity=".45" />
        </>
      )}
    </svg>
  );
}
