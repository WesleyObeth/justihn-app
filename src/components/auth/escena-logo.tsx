"use client";

/**
 * Escena animada del logo — **el libro que se abre**.
 *
 * Cuatro actos en 6,8 s, según la especificación de `justihn-logo-scene.jsx`
 * (los tiempos y easings viven en `auth.css`, donde se ven como una sola
 * línea de tiempo):
 *
 *   1. **Cerrado**  0 → 1,4 s   — el libro cerrado, centrado sobre el marino.
 *   2. **Apertura** 1,4 → 3,0 s — las páginas giran a ±26° y nace el cruce.
 *   3. **Nombre**   3,0 → 5,2 s — el símbolo se corre a la izquierda al abrirse
 *      hueco para el wordmark.
 *   4. **Final**    5,2 → 6,8 s — respiración y fade para reiniciar.
 *
 * `bucle` lo repite (escaparate). El splash de carga hace UNA pasada y navega
 * a los 5 s, o sea justo cuando el nombre termina de revelarse — antes de que
 * empiece el fade del cuarto acto.
 *
 * La geometría es la oficial de `brand/logos.tsx`: mismos rects, mismos
 * colores, mismo cruce con clipPath. Aquí solo se animan.
 */
import { useId } from "react";

export function EscenaLogo({
  size = 120,
  bucle = false,
  pie,
}: {
  size?: number;
  bucle?: boolean;
  /** Línea bajo el logo ("Preparando tu portal…"). */
  pie?: string;
}) {
  const clip = useId();

  return (
    <div
      className={`escena-logo flex flex-col items-center gap-7 ${bucle ? "escena-logo--bucle" : ""}`}
    >
      <div className="esc-grupo flex items-center" style={{ gap: size * 0.15 }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className="shrink-0"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clip}>
              {/* El recorte acompaña a la página izquierda en su giro: si se
                  quedara quieto, el cruce aparecería fuera del solape. */}
              <rect
                className="esc-pagina-izq"
                x="11.15"
                y="3"
                width="11.7"
                height="36"
                rx="5.85"
              />
            </clipPath>
          </defs>

          <rect
            className="esc-pagina-izq"
            x="11.15"
            y="3"
            width="11.7"
            height="36"
            rx="5.85"
            fill="#ffffff"
          />
          <rect
            className="esc-pagina-der"
            x="25.15"
            y="3"
            width="11.7"
            height="36"
            rx="5.85"
            fill="#1584c7"
          />
          <g clipPath={`url(#${clip})`} className="esc-cruce">
            <rect
              className="esc-pagina-der"
              x="25.15"
              y="3"
              width="11.7"
              height="36"
              rx="5.85"
              fill="#0e5f92"
            />
          </g>
        </svg>

        <span
          className="wordmark esc-nombre leading-none text-white"
          style={{ fontSize: size * 0.48, letterSpacing: "-0.02em" }}
        >
          Justihn
        </span>
      </div>

      {pie && (
        <p className="esc-pie text-[14px] tracking-[.3px]" style={{ color: "#7f9ec0" }}>
          {pie}
        </p>
      )}
    </div>
  );
}
