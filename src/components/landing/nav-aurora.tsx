"use client";

/**
 * Nav fijo glassy de la landing (estado sólido al hacer scroll).
 * Parametrizada porque el shell aurora sirve a las DOS audiencias: la home
 * ciudadana y `/para-abogados`. Cambian los enlaces, no la superficie.
 *
 * **Menú de móvil (2026-08-30).** Por debajo de 980px la fila de enlaces y los
 * de texto se esconden — no caben junto al logo y el CTA. Hasta hoy no había
 * nada que los sustituyera: en un teléfono el nav era logo + "Crear cuenta
 * gratis" y punto, así que no se podía llegar a ninguna sección **ni cambiar a
 * la otra audiencia**, que es la travesía que más importa (un abogado que entra
 * por la home ciudadana no tenía puerta).
 *
 * El panel **se renderiza siempre** y se oculta con CSS, nunca desmontándolo:
 * es la misma regla que los filtros de trámites (§4.7) — un menú montado solo
 * al abrirlo deja al crawler sin esos enlaces.
 *
 * No bloquea el scroll del body a propósito: el panel es corto y cuelga de la
 * nav en vez de cubrir la pantalla. Con `overflow:hidden` en el body, el clic en
 * un ancla se pisaría a sí mismo — `desplazamiento-suave.tsx` escucha en
 * `document` y correría ANTES de que React aplicara el cierre, así que su
 * `scrollTo` no movería nada.
 */
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { SimboloJustihn } from "@/components/brand/logos";

export interface EnlaceNav {
  href: string;
  label: string;
}

const ENLACES_CIUDADANO: EnlaceNav[] = [
  { href: "#tramites", label: "Trámites" },
  { href: "#procesos", label: "Procesos" },
  { href: "#consultorio", label: "Consultorio" },
  { href: "#directorio", label: "Encuentra abogado" },
  { href: "#faq", label: "Preguntas" },
];

export function NavAurora({
  enlaces = ENLACES_CIUDADANO,
  secundario = { href: "/para-abogados", label: "Para abogados" },
  login = { href: "/iniciar-sesion?tipo=persona", label: "Iniciar sesión" },
  cta = { href: "/crear-cuenta?tipo=persona", label: "Crear cuenta gratis" },
  logoVariante = "claro",
}: {
  enlaces?: EnlaceNav[];
  secundario?: EnlaceNav;
  /**
   * Entrada para quien YA tiene cuenta. Va como enlace de texto, no como
   * botón: el botón lleno se reserva para la acción que la página busca —
   * en una landing, crear cuenta. Sin esto, un usuario que vuelve no tiene
   * por dónde entrar y acaba en el formulario de alta buscando la salida.
   */
  login?: EnlaceNav;
  cta?: EnlaceNav;
  /** "oscuro" para shells sobre fondo marino (landing black). */
  logoVariante?: "claro" | "oscuro";
}) {
  const nav = useRef<HTMLElement>(null);
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();

  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const onScroll = () => el.classList.toggle("solid", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape cierra, y al pasar a escritorio se cierra solo: si no, el estado
  // quedaría abierto por debajo y reaparecería al volver a encoger la ventana.
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    const ancho = matchMedia("(min-width: 981px)");
    const alRedimensionar = () => ancho.matches && setAbierto(false);
    document.addEventListener("keydown", alTeclear);
    ancho.addEventListener("change", alRedimensionar);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      ancho.removeEventListener("change", alRedimensionar);
    };
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <nav ref={nav} className={`nav${abierto ? " abierto" : ""}`}>
      <Link className="brand" href="/" aria-label="Justihn — inicio" onClick={cerrar}>
        <SimboloJustihn size={30} variante={logoVariante} />
        <span className="wm">Justihn</span>
      </Link>
      <div className="nav-mid">
        {enlaces.map((e) => (
          <a key={e.href} href={e.href}>
            {e.label}
          </a>
        ))}
      </div>
      <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link className="nav-login" href={secundario.href}>
          {secundario.label}
        </Link>
        <Link className="nav-login" href={login.href}>
          {login.label}
        </Link>
        {/* `magnetic`: su hover solo cambia fondo y sombra, así que el
            transform que escribe GSAP no pisa nada (ver `magnetico.tsx`). */}
        <Link className="nav-cta magnetic" href={cta.href} onClick={cerrar}>
          {cta.label}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <button
          type="button"
          className="nav-burger"
          aria-label={abierto ? "Cerrar el menú" : "Abrir el menú"}
          aria-expanded={abierto}
          aria-controls={idPanel}
          onClick={() => setAbierto((v) => !v)}
        >
          {/* Tres trazos que se cruzan: el de en medio se desvanece y los
              otros dos giran sobre el centro del botón. */}
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="nav-panel" id={idPanel}>
        <div className="nav-panel-caja">
          {enlaces.map((e) => (
            <a key={e.href} href={e.href} onClick={cerrar}>
              {e.label}
            </a>
          ))}
          <div className="nav-panel-pie">
            <Link href={secundario.href} onClick={cerrar}>
              {secundario.label}
            </Link>
            <Link href={login.href} onClick={cerrar}>
              {login.label}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
