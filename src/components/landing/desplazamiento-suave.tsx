"use client";

/**
 * Desplazamiento suave a las anclas de la página, con un destello en la
 * sección de destino.
 *
 * Va en JS y no con `html { scroll-behavior: smooth }` a propósito: esa regla
 * es global y también alcanza al salto al principio que hace Next al cambiar
 * de ruta — en una página de 8.000px, abrir un trámite se convertiría en un
 * scroll animado de varios segundos. Aquí solo se intercepta el clic en
 * anclas de la propia página; la navegación entre rutas queda intacta.
 *
 * El destello existe porque el desplazamiento por sí solo desorienta: cuando
 * la página frena, no siempre está claro qué parte es la que pediste. Un
 * halo de kilo segundo señala el bloque y se apaga.
 */
import { useEffect } from "react";

/** Descuento por la nav fija (mismo valor que `scroll-mt-24/28` del contenido). */
const ALTO_NAV = 96;

export function DesplazamientoSuave() {
  useEffect(() => {
    const menosMovimiento = matchMedia("(prefers-reduced-motion: reduce)");

    const alHacerClic = (e: MouseEvent) => {
      // Se respetan los atajos del navegador (abrir en pestaña nueva, etc.).
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

      const enlace = (e.target as Element | null)?.closest?.("a");
      if (!enlace) return;

      const href = enlace.getAttribute("href");
      // Vale "#seccion" y "/#seccion" cuando ya se está en esa página.
      if (!href) return;
      const anclaMisma = href.startsWith("#");
      const anclaRaiz = href.startsWith("/#") && window.location.pathname === "/";
      if (!anclaMisma && !anclaRaiz) return;

      const id = href.slice(href.indexOf("#") + 1);
      const destino = id && document.getElementById(id);
      if (!destino) return;

      e.preventDefault();

      const y = destino.getBoundingClientRect().top + window.scrollY - ALTO_NAV;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: menosMovimiento.matches ? "auto" : "smooth",
      });

      // La URL se actualiza sin volver a saltar: `pushState` no desplaza.
      history.pushState(null, "", `#${id}`);

      if (!menosMovimiento.matches) {
        destino.classList.remove("destello-ancla");
        // Forzar reflujo para poder relanzar la animación en el mismo destino.
        void destino.offsetWidth;
        destino.classList.add("destello-ancla");
        window.setTimeout(() => destino.classList.remove("destello-ancla"), 1400);
      }
    };

    document.addEventListener("click", alHacerClic);
    return () => document.removeEventListener("click", alHacerClic);
  }, []);

  return null;
}
