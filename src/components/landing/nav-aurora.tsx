"use client";

/**
 * Nav fijo glassy de la landing (estado sólido al hacer scroll).
 * Parametrizada porque el shell aurora sirve a las DOS audiencias: la home
 * ciudadana y `/para-abogados`. Cambian los enlaces, no la superficie.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
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
];

export function NavAurora({
  enlaces = ENLACES_CIUDADANO,
  secundario = { href: "/para-abogados", label: "Para abogados" },
  cta = { href: "/personas", label: "Crear cuenta gratis" },
  logoVariante = "claro",
}: {
  enlaces?: EnlaceNav[];
  secundario?: EnlaceNav;
  cta?: EnlaceNav;
  /** "oscuro" para shells sobre fondo marino (landing black). */
  logoVariante?: "claro" | "oscuro";
}) {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const onScroll = () => el.classList.toggle("solid", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav ref={nav} className="nav">
      <Link className="brand" href="/" aria-label="Justihn — inicio">
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
        <Link className="nav-cta" href={cta.href}>
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
      </div>
    </nav>
  );
}
