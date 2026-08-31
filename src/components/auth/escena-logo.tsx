"use client";

/**
 * Escena animada del logo — **el libro que se abre**.
 *
 * Portada de `justihn-logo-scene.jsx` (el archivo que pasó Wesley), tratada
 * como especificación: se conservan sus tiempos, easings y transformaciones,
 * y se ignora su motor de timeline propio. Los keyframes viven en `auth.css`,
 * donde la línea de tiempo completa se lee de un vistazo.
 *
 * Cuatro actos en 6,8 s:
 *   1. **Cerrado**  0 → 1,4 s   — las dos páginas SUPERPUESTAS (una sola
 *      forma: el libro cerrado), entrando con fade y de 0,92 a escala 1.
 *   2. **Apertura** 1,4 → 3,0 s — se separan ±7 y giran a ±26° con un rebote
 *      (`easeOutBack`); el cruce aparece porque nace del solape real.
 *   3. **Nombre**   3,0 → 5,2 s — el grupo se recentra (de +294px a 0, que es
 *      medio lockup) y el wordmark entra deslizando desde la izquierda.
 *   4. **Final**    5,2 → 6,8 s — fade para reiniciar.
 *
 * Geometría del archivo: grosor 13 × 0,9 = 11,7 · rx = W/2 = 5,85 · pivote en
 * el centro de cada página a y=21. Al terminar coincide con el logo oficial
 * (`rotate(-26 17 21)` / `rotate(26 31 21)`), verificado.
 *
 * El lienzo se construye a la escala intrínseca del archivo (símbolo 200,
 * hueco 28, wordmark 560 → lockup de 788) y se reduce con `scale`, para que
 * el desplazamiento de 294px siga siendo exactamente medio lockup.
 */
import { useEffect, useId, useState } from "react";

/** Medidas intrínsecas del archivo original. */
const SIMBOLO = 200;
const HUECO = 28;
const CAJA_NOMBRE = 560;
const ANCHO = SIMBOLO + HUECO + CAJA_NOMBRE;

/** x común de las dos páginas mientras el libro está cerrado: 24 − W/2. */
const W = 13 * 0.9;
const X_CERRADO = 24 - W / 2;

/** Aire a cada lado en pantallas estrechas, para que el lockup no toque el borde. */
const MARGEN = 20;

export function EscenaLogo({
  ancho = 480,
  bucle = false,
  pie,
}: {
  /**
   * Ancho final del lockup abierto; el resto se escala en proporción. Es un
   * MÁXIMO: si no cabe en la pantalla, manda el viewport (ver `anchoReal`).
   */
  ancho?: number;
  bucle?: boolean;
  pie?: string;
}) {
  const clip = useId();

  /**
   * El ancho pedido se recorta al del viewport. Sin esto, en un teléfono el
   * lockup se salía por los dos lados **y generaba scroll horizontal**, que es
   * lo que además lo descuadraba: la vista podía quedar desplazada y el símbolo
   * aparecía fuera de sitio.
   *
   * Se mide tras el mount (no en carga de módulo, §4.5): el servidor entrega el
   * ancho pedido y el cliente lo ajusta antes de la primera pintura útil. Es un
   * overlay que aparece después de una acción del usuario, así que no hay SSR
   * que preservar.
   */
  const [anchoReal, setAnchoReal] = useState(ancho);
  useEffect(() => {
    const medir = () => setAnchoReal(Math.min(ancho, window.innerWidth - MARGEN * 2));
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [ancho]);

  const escala = anchoReal / ANCHO;

  const pagina = {
    y: 3,
    width: W,
    height: 36,
    rx: W / 2,
    x: X_CERRADO,
  };

  return (
    <div
      className={`escena-logo relative ${bucle ? "escena-logo--bucle" : ""}`}
      style={{ width: anchoReal, height: SIMBOLO * escala + (pie ? 64 : 0) }}
    >
      {/* El LIENZO centra y reduce; el GRUPO solo hace la animación. Antes el
          grupo llevaba `zoom`, que no es estándar y en algunos motores escala
          el texto de otra manera — el lockup salía descompensado. Con
          `transform: scale` el resultado es idéntico en todos. */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: ANCHO,
          height: SIMBOLO,
          transform: `translate(-50%, -50%) scale(${escala})`,
        }}
      >
        <div
          className="esc-grupo absolute inset-0 flex items-center"
          style={{ gap: HUECO }}
        >
          <svg
            width={SIMBOLO}
            height={SIMBOLO}
            viewBox="0 0 48 48"
            className="shrink-0"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={clip}>
                {/* El recorte acompaña a la página izquierda: si se quedara
                  quieto, el cruce aparecería fuera del solape. */}
                <rect className="esc-pagina esc-pagina-izq" {...pagina} />
              </clipPath>
            </defs>

            <rect
              className="esc-pagina esc-pagina-izq"
              {...pagina}
              fill="#ffffff"
            />
            <rect
              className="esc-pagina esc-pagina-der"
              {...pagina}
              fill="#1584c7"
            />
            <g clipPath={`url(#${clip})`}>
              <rect
                className="esc-pagina esc-pagina-der"
                {...pagina}
                fill="#0e5f92"
              />
            </g>
          </svg>

          <div style={{ width: CAJA_NOMBRE, overflow: "hidden" }}>
            <p
              className="wordmark esc-nombre whitespace-nowrap text-white"
              style={{ fontSize: 128, letterSpacing: "-2px", lineHeight: 1.15 }}
            >
              Justihn
            </p>
          </div>
        </div>
      </div>

      {pie && (
        <p
          className="esc-pie absolute bottom-0 left-1/2 -translate-x-1/2 text-[14px] whitespace-nowrap tracking-[.3px]"
          style={{ color: "#7f9ec0" }}
        >
          {pie}
        </p>
      )}
    </div>
  );
}
