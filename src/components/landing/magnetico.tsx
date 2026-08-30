"use client";

/**
 * Botón magnético: los elementos con la clase `.magnetic` se van hacia el
 * cursor cuando pasa por encima y vuelven a su sitio con un rebote elástico
 * al salir.
 *
 * Se monta UNA vez por shell y trabaja sobre el DOM, no por componente: así
 * cualquier botón se vuelve magnético con solo añadirle la clase, sin tener
 * que envolverlo ni pasarle props — incluidos los que aparecen después
 * (el `MutationObserver` los recoge).
 *
 * Reglas de la casa que sí aplican aquí:
 * - **Solo con ratón.** En una pantalla táctil no hay "acercarse": el dedo ya
 *   está encima, y el efecto haría que el botón se escapara justo al tocarlo.
 *   Se exige `(hover: hover) and (pointer: fine)`.
 * - **`prefers-reduced-motion` lo apaga**, igual que el aurora y el splash.
 * - **GSAP entra por import dinámico**: es decoración, no tiene por qué pesar
 *   en el primer render de una landing que además se mide por SEO.
 *
 * **Dónde va (decisión Wesley 2026-08-30): solo en los botones azules
 * sólidos** — el CTA del nav, el de enviar del composer, el del plan
 * destacado y el principal del cierre. En un botón de solo borde el imán no
 * se lee como intención sino como que el botón tiembla, y si TODO se mueve la
 * jerarquía de la página se pierde: el efecto deja de señalar la acción
 * principal porque ya no distingue a nadie.
 *
 * ⚠️ No poner `.magnetic` en algo cuyo `:hover` ya use `transform` — la card
 * glass de la landing sube 2px, por ejemplo. GSAP escribe el mismo transform
 * y una de las dos animaciones se pierde. Es para botones y enlaces.
 */
import { useEffect } from "react";

/** Cuánto sigue al cursor: 0 = quieto, 1 = pegado al puntero. */
const FACTOR = 0.35;
/** El rebote al volver. Con `elastic` la duración corta no se aprecia. */
const DURACION = 0.8;
const EASE = "elastic.out(1,0.4)";

type Mover = (valor: number) => void;

export function BotonesMagneticos() {
  useEffect(() => {
    const finoConHover = matchMedia("(hover: hover) and (pointer: fine)");
    const menosMovimiento = matchMedia("(prefers-reduced-motion: reduce)");
    if (!finoConHover.matches || menosMovimiento.matches) return;

    let vivo = true;
    const limpiezas: (() => void)[] = [];

    void import("gsap").then(({ gsap }) => {
      // El import es asíncrono: si el shell se desmontó mientras cargaba, no
      // hay que enganchar nada.
      if (!vivo) return;

      /** Los setters de quickTo son por elemento y se reutilizan entre eventos:
       *  crear uno por movimiento del ratón tiraría el rendimiento. */
      const setters = new WeakMap<Element, { x: Mover; y: Mover }>();

      const moverA = (el: Element) => {
        let s = setters.get(el);
        if (!s) {
          s = {
            x: gsap.quickTo(el, "x", { duration: DURACION, ease: EASE }),
            y: gsap.quickTo(el, "y", { duration: DURACION, ease: EASE }),
          };
          setters.set(el, s);
        }
        return s;
      };

      const alMover = (e: PointerEvent) => {
        const el = e.currentTarget as HTMLElement;
        const caja = el.getBoundingClientRect();
        const { x, y } = moverA(el);
        x((e.clientX - (caja.left + caja.width / 2)) * FACTOR);
        y((e.clientY - (caja.top + caja.height / 2)) * FACTOR);
      };

      const alSalir = (e: PointerEvent) => {
        const { x, y } = moverA(e.currentTarget as HTMLElement);
        x(0);
        y(0);
      };

      const enganchados = new WeakSet<Element>();
      const enganchar = (raiz: ParentNode) => {
        const candidatos = [
          ...(raiz instanceof Element && raiz.matches(".magnetic") ? [raiz] : []),
          ...raiz.querySelectorAll<HTMLElement>(".magnetic"),
        ];
        for (const el of candidatos) {
          if (enganchados.has(el)) continue;
          enganchados.add(el);
          el.addEventListener("pointermove", alMover as EventListener);
          el.addEventListener("pointerleave", alSalir as EventListener);
          limpiezas.push(() => {
            el.removeEventListener("pointermove", alMover as EventListener);
            el.removeEventListener("pointerleave", alSalir as EventListener);
            gsap.set(el, { x: 0, y: 0 });
          });
        }
      };

      enganchar(document);

      // Los `.magnetic` que React monte después (una sección que aparece, un
      // diálogo) se enganchan solos.
      const observador = new MutationObserver((cambios) => {
        for (const c of cambios) {
          for (const nodo of c.addedNodes) {
            if (nodo.nodeType === Node.ELEMENT_NODE) enganchar(nodo as Element);
          }
        }
      });
      observador.observe(document.body, { childList: true, subtree: true });
      limpiezas.push(() => observador.disconnect());
    });

    return () => {
      vivo = false;
      for (const limpiar of limpiezas) limpiar();
    };
  }, []);

  return null;
}
