"use client";

/**
 * Piezas del marco de contenido: hidratación del store, banner de validación,
 * encabezado de página y el contexto del modal de upgrade (que cualquier vista
 * puede disparar con `useUpgrade()`).
 */
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { usePortal } from "@/store/portal";
import { ModalUpgrade } from "./capas-globales";
import { cn } from "@/lib/utils";

/**
 * Rehidrata el store tras el mount. Con `skipHydration` el primer render del
 * cliente usa los valores iniciales, iguales a los del servidor: sin esto, un
 * localStorage con datos rompería la hidratación (§0.6).
 */
export function HidratarStore() {
  useEffect(() => {
    void usePortal.persist.rehydrate();
  }, []);
  return null;
}

// ── Modal de mejora de plan, disponible para toda la app ───────────────────

const UpgradeContext = createContext<() => void>(() => {});

/** Abre el modal de Pro; si ya es Pro, confirma que no hay nada que desbloquear. */
export function useUpgrade() {
  return useContext(UpgradeContext);
}

export function ProveedorUpgrade({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const esPremium = usePortal((s) => s.plan) === "premium";
  const mostrarToast = usePortal((s) => s.mostrarToast);

  const solicitar = () => {
    if (esPremium) mostrarToast("Ya tienes el plan Premium — todo desbloqueado");
    else setAbierto(true);
  };

  return (
    <UpgradeContext.Provider value={solicitar}>
      {children}
      <ModalUpgrade abierto={abierto} onCerrar={() => setAbierto(false)} />
    </UpgradeContext.Provider>
  );
}

// ── Banner de validación profesional ───────────────────────────────────────

/**
 * Aparece en todas las pantallas menos Perfil (donde el usuario ya está en el
 * lugar de resolverlo). Es descartable y su estado se persiste.
 */
export function BannerValidacion() {
  const pathname = usePathname();
  const oculto = usePortal((s) => s.bannerValidacionOculto);
  const constanciaSubida = usePortal((s) => s.constanciaSubida);
  const ocultar = usePortal((s) => s.ocultarBannerValidacion);

  if (oculto || constanciaSubida || pathname === "/abogados/perfil") return null;

  return (
    <div className="mb-4.5 flex max-w-[1280px] flex-wrap items-center gap-3 rounded-xl border border-aviso-borde bg-aviso px-4.5 py-3.5 print:hidden">
      <span className="grid place-items-center text-aviso-texto">
        <Icono nombre="alerta" size={16} />
      </span>
      <p className="min-w-[220px] flex-1 text-[13px] text-aviso-cuerpo">
        Tu perfil aún no está validado — falta la <b>constancia de solvencia CAH</b>. Un perfil
        validado genera hasta 3× más contactos.
      </p>
      <Link
        href="/abogados/perfil#validacion"
        className="rounded-lg bg-marino px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap text-white hover:bg-celeste hover:text-white"
      >
        Completar validación
      </Link>
      <button
        type="button"
        onClick={ocultar}
        aria-label="Descartar aviso"
        className="grid cursor-pointer place-items-center text-aviso-texto hover:text-[#3a2c0d]"
      >
        <Icono nombre="cerrar" size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

// ── Encabezado de pantalla ─────────────────────────────────────────────────

/**
 * Envoltura estándar de vista: banner + título + animación de entrada.
 * Jus IA no lo usa (tiene su propio layout a pantalla completa).
 */
export function Vista({
  titulo,
  children,
  ancho = "max-w-[1280px]",
  className,
}: {
  titulo: string;
  children: React.ReactNode;
  ancho?: string;
  className?: string;
}) {
  return (
    <>
      <BannerValidacion />
      <h1 className="wordmark mb-5 max-w-[1280px] text-[23px]">{titulo}</h1>
      <div className={cn(ancho, className)} style={{ animation: "fadeUp .3s ease" }}>
        {children}
      </div>
    </>
  );
}
