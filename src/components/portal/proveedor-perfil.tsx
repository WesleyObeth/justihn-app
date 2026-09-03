"use client";

/**
 * El perfil del abogado de la sesión, disponible en todo el portal.
 *
 * El servidor lo lee de `abogados` (`lib/supabase/perfil.ts`) y lo baja por
 * este contexto. `useMiPerfil()` mezcla lo real sobre el demo, así que el
 * portal nunca se queda sin nombre: **lo que la tabla sabe manda, y lo que aún
 * no tiene columna sigue siendo demo** — hoy solo las métricas del perfil.
 * Cuando existan de verdad (§7.3), salen de aquí y esta mezcla desaparece.
 */
import { createContext, useContext, useEffect } from "react";
import { ABOGADA_DEMO } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import type { PerfilReal } from "@/lib/supabase/perfil";
import type { PerfilAbogado } from "@/types/dominio";

const PerfilContext = createContext<PerfilReal | null>(null);

export function ProveedorPerfil({
  perfil,
  children,
}: {
  perfil: PerfilReal | null;
  children: React.ReactNode;
}) {
  const setPlan = usePortal((s) => s.setPlan);

  // El plan vive en la fila, no en el navegador: sin esto la barra dice
  // «Profesional» (el valor semilla del store) a una cuenta gratis, y las
  // pantallas Premium se desbloquean por un localStorage. Se sincroniza tras
  // el mount, después de que `HidratarStore` haya rehidratado (si se hiciera
  // antes, la rehidratación pisaría el plan real con el guardado).
  useEffect(() => {
    if (!perfil) return;
    const id = window.setTimeout(() => {
      if (usePortal.getState().plan !== perfil.plan) setPlan(perfil.plan);
    }, 0);
    return () => window.clearTimeout(id);
  }, [perfil, setPlan]);

  return <PerfilContext.Provider value={perfil}>{children}</PerfilContext.Provider>;
}

/**
 * El perfil con el que se pinta el portal. Devuelve SIEMPRE un perfil
 * completo: el real encima del demo cuando hay ficha de abogado, el demo
 * entero cuando no la hay (una cuenta de la vía B que abrió `/abogados`).
 */
export function useMiPerfil(): PerfilAbogado & { esDemo: boolean } {
  const real = useContext(PerfilContext);
  if (!real) return { ...ABOGADA_DEMO, esDemo: true };
  const { plan: _plan, ...datos } = real;
  // `metricas` es lo único que no viene de la tabla: no hay columnas de vistas
  // ni contactos, y menos de valoración (§4.5 la eliminó de lo público). Se
  // hereda del demo hasta que existan de verdad, no se inventa por cuenta.
  return { ...ABOGADA_DEMO, ...datos, esDemo: false };
}
