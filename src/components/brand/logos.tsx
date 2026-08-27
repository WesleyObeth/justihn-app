/**
 * Logos oficiales — geometría FIJA.
 * Fuente de verdad: `design_handoff_portal/logos-oficiales.md`.
 * No redibujar, rotar, recolorear ni estirar. Bajo 24px el cruce se omite.
 *
 * Los `id` de clipPath llevan sufijo por instancia: dos logos en la misma página
 * con el mismo id harían que el segundo herede el recorte del primero.
 */
import { useId } from "react";

interface SimboloProps {
  size?: number;
  /** Página izquierda: marino sobre claro, blanca sobre marino. */
  variante?: "claro" | "oscuro";
  className?: string;
}

/** Símbolo Justihn — dos páginas que se abren; el cruce nace donde se solapan. */
export function SimboloJustihn({ size = 28, variante = "claro", className }: SimboloProps) {
  const clip = useId();
  const paginaIzq = variante === "oscuro" ? "#ffffff" : "#0d2144";
  const conCruce = size >= 24;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      {conCruce && (
        <defs>
          <clipPath id={clip}>
            <rect
              x="11.15"
              y="3"
              width="11.7"
              height="36"
              rx="5.85"
              transform="rotate(-26 17 21)"
            />
          </clipPath>
        </defs>
      )}
      <rect
        x="11.15"
        y="3"
        width="11.7"
        height="36"
        rx="5.85"
        fill={paginaIzq}
        transform="rotate(-26 17 21)"
      />
      <rect
        x="25.15"
        y="3"
        width="11.7"
        height="36"
        rx="5.85"
        fill="#1584c7"
        transform="rotate(26 31 21)"
      />
      {conCruce && (
        <g clipPath={`url(#${clip})`}>
          <rect
            x="25.15"
            y="3"
            width="11.7"
            height="36"
            rx="5.85"
            fill="#0e5f92"
            transform="rotate(26 31 21)"
          />
        </g>
      )}
    </svg>
  );
}

/** Lockup horizontal: símbolo + wordmark en Instrument Sans 700. */
export function LogoJustihn({
  size = 28,
  variante = "claro",
  textoPx = 17,
}: SimboloProps & { textoPx?: number }) {
  return (
    <span className="flex items-center gap-[7px]">
      <SimboloJustihn size={size} variante={variante} className="shrink-0" />
      <span
        className="wordmark leading-none"
        style={{
          fontSize: textoPx,
          color: variante === "oscuro" ? "#ffffff" : "var(--color-marino)",
        }}
      >
        Justihn
      </span>
    </span>
  );
}

/**
 * Símbolo Jus IA — libro asimétrico: barra alta celeste (la respuesta de la IA)
 * y barra corta, asentadas en la misma base.
 */
export function SimboloJusIA({ size = 16, variante = "oscuro", className }: SimboloProps) {
  const clip = useId();
  const barraCorta = variante === "oscuro" ? "#ffffff" : "#0d2144";

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <polygon points="8,25 16,25 25.5,42 15,42" />
        </clipPath>
      </defs>
      <polygon points="8,25 16,25 25.5,42 15,42" fill={barraCorta} />
      <polygon points="25,5 36.5,5 31,42 19.5,42" fill="#1584c7" />
      <g clipPath={`url(#${clip})`}>
        <polygon points="25,5 36.5,5 31,42 19.5,42" fill="#0e5f92" />
      </g>
    </svg>
  );
}

/**
 * Versión linear de Jus IA en `currentColor` — la que usa la iconografía de
 * menú, para que combine con el resto de los íconos de línea.
 */
export function SimboloJusIALinear({ size = 17, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="8,25 16,25 25.5,42 15,42" stroke="currentColor" strokeWidth={3.2} />
      <polygon points="25,5 36.5,5 31,42 19.5,42" stroke="currentColor" strokeWidth={3.2} />
    </svg>
  );
}

/** Avatar de Jus IA en la burbuja de chat: caja marina con el símbolo relleno. */
export function AvatarJusIA({ size = 28 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(180deg,#0d2144,#0a1830)",
      }}
    >
      <SimboloJusIA size={Math.round(size * 0.57)} variante="oscuro" />
    </span>
  );
}
