"use client";

/** Nav fijo glassy de la landing (estado sólido al hacer scroll). */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SimboloJustihn } from "@/components/brand/logos";

export function NavAurora() {
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
        <SimboloJustihn size={30} />
        <span className="wm">Justihn</span>
      </Link>
      <div className="nav-mid">
        <a href="#tramites">Trámites</a>
        <a href="#consultorio">Consultorio</a>
        <a href="#directorio">Encuentra abogado</a>
      </div>
      <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link className="nav-login" href="/abogados">
          Para abogados
        </Link>
        <Link className="nav-cta" href="/persona">
          Crear cuenta gratis
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
