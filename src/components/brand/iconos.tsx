/**
 * Iconografía de línea — trazo 1.8, extremos redondeados, viewBox 24
 * (`marca-tipografia-colores.md` §Iconografía).
 *
 * Se recrean los paths del handoff en vez de mapear a Lucide: varios son
 * específicos del dominio (la balanza de jurisprudencia, el diario de Gaceta) y
 * el diseño es pixel-perfect. Lucide queda para iconografía genérica futura.
 */
export type NombreIcono =
  | "dash"
  | "juris"
  | "pasos"
  | "gaceta"
  | "plantillas"
  | "perfil"
  | "leads"
  | "calc"
  | "planes"
  | "config"
  | "bell"
  | "help"
  | "logout"
  | "card"
  | "chevrons"
  | "chevron"
  | "atras"
  | "buscar"
  | "mas"
  | "documento"
  | "enviar"
  | "cerrar"
  | "alerta"
  | "check"
  | "candado"
  | "subir"
  | "libro"
  | "correo"
  | "telefono"
  | "ubicacion"
  | "reloj";

const PATHS: Record<NombreIcono, string[]> = {
  dash: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h5v-6h4v6h5V9.5"],
  juris: ["M12 3v18", "M5 7h14", "M12 7 7.5 7 5 13a3 3 0 0 0 5 0L7.5 7", "M12 7l4.5 0L19 13a3 3 0 0 1-5 0L16.5 7", "M8 21h8"],
  pasos: ["M4 6h4v4H4z", "M4 14h4v4H4z", "M11 8h9", "M11 16h9"],
  gaceta: [
    "M4 5h12a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5z",
    "M18 9h2a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2",
    "M7.5 9h5",
    "M7.5 12.5h7",
    "M7.5 16h7",
  ],
  plantillas: ["M6 3h9l4 4v14H6z", "M15 3v4h4", "M9.5 12h5", "M9.5 15.5h5"],
  perfil: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4.5 20.5a7.5 7.5 0 0 1 15 0"],
  leads: ["M4 5h16v11H9l-5 4V5z", "M8.5 9h7", "M8.5 12h4.5"],
  calc: [
    "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
    "M8.5 6.5h7v3h-7z",
    "M8.5 13.5h.01",
    "M12 13.5h.01",
    "M15.5 13.5h.01",
    "M8.5 17h.01",
    "M12 17h.01",
    "M15.5 17h.01",
  ],
  planes: ["M12 3l2.7 5.6 6.3.8-4.6 4.3 1.2 6.1L12 16.9 6.4 19.8l1.2-6.1L3 9.4l6.3-.8L12 3z"],
  config: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z",
  ],
  bell: ["M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8", "M10.3 20a2 2 0 0 0 3.4 0"],
  help: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    "M9.2 9a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.4-2.8 4",
    "M12 17.5h.01",
  ],
  logout: ["M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4", "M10 8l-4 4 4 4", "M6 12h10"],
  card: ["M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z", "M2 10h20", "M6 15h4"],
  chevrons: ["M7 9l5-5 5 5", "M7 15l5 5 5-5"],
  chevron: ["M6 9l6 6 6-6"],
  atras: ["M15 18l-6-6 6-6"],
  buscar: ["M15 15 L20 20"],
  mas: ["M12 5v14M5 12h14"],
  documento: ["M6 3h9l4 4v14H6z", "M15 3v4h4"],
  enviar: ["M12 19V5", "M6 11l6-6 6 6"],
  cerrar: ["M6 6l12 12M18 6L6 18"],
  alerta: ["M12 8v4", "M12 15.5h.01"],
  check: ["M4 12l5 5L20 6"],
  candado: ["M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"],
  subir: ["M12 16V4", "M6 10l6-6 6 6", "M4 20h16"],
  libro: [
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z",
    "M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  ],
  correo: ["M4 5h16v14H4z", "M4 7l8 6 8-6"],
  telefono: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"],
  ubicacion: ["M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"],
  reloj: ["M12 7v5l3 2"],
};

/** Íconos que además llevan un círculo o rectángulo base. */
const FORMAS: Partial<Record<NombreIcono, React.ReactNode>> = {
  buscar: <circle cx="10.5" cy="10.5" r="6" />,
  alerta: <circle cx="12" cy="12" r="9" />,
  candado: <rect x="5" y="10.5" width="14" height="9" rx="2.5" />,
  ubicacion: <circle cx="12" cy="10" r="2.5" />,
  reloj: <circle cx="12" cy="12" r="9" />,
};

export interface IconoProps {
  nombre: NombreIcono;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icono({ nombre, size = 17, strokeWidth = 1.8, className }: IconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {FORMAS[nombre]}
      {PATHS[nombre].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
