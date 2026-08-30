"use client";

/**
 * Dispara las demostraciones cuando entran en pantalla, y las rearma al salir
 * para que vuelvan a reproducirse si el visitante sube y baja.
 *
 * La animación NO es el contenido: el HTML trae siempre el estado final y esta
 * clase solo añade el reveal. Si no hay JS o el sistema pide menos movimiento,
 * la vista se queda como está — completa.
 */
import { useEffect, useRef, useState } from "react";

export function useEnVista<T extends HTMLElement>(margen = "-15% 0px -15% 0px") {
  const ref = useRef<T>(null);
  const [enVista, setEnVista] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entrada]) => setEnVista(Boolean(entrada?.isIntersecting)),
      { rootMargin: margen },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margen]);

  return { ref, enVista };
}
