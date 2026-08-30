"use client";

/**
 * Splash de entrada al portal (handoff auth, vista compartida login/onboarding):
 * el logo se arma en secuencia — pop, las páginas se abren de 0° a ±26°,
 * aparece el cruce, entra el wordmark — y a los 5 s navega al portal.
 *
 * La geometría es la oficial de `brand/logos.tsx` (rects 11.7×36 rx 5.85,
 * ±26°, cruce #0e5f92): la capa animada rota los MISMOS rects por CSS y la
 * capa final con cruce es el `SimboloJustihn` de siempre — no hay un segundo
 * dibujo del logo que pueda driftear.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SimboloJustihn } from "@/components/brand/logos";

export function SplashJustihn({ destino = "/abogados" }: { destino?: string }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push(destino), 5000);
    return () => clearTimeout(t);
  }, [router, destino]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7"
      style={{ background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)" }}
      role="status"
      aria-label="Preparando tu portal"
    >
      <div className="splash-pop flex items-center gap-[18px]">
        <div className="relative h-[120px] w-[120px]">
          {/* Capa 1: las dos páginas sin cruce, rotando de 0° a ±26°. */}
          <svg width="120" height="120" viewBox="0 0 48 48" className="absolute inset-0">
            <rect
              className="splash-pagina-izq"
              x="11.15"
              y="3"
              width="11.7"
              height="36"
              rx="5.85"
              fill="#ffffff"
            />
            <rect
              className="splash-pagina-der"
              x="25.15"
              y="3"
              width="11.7"
              height="36"
              rx="5.85"
              fill="#1584c7"
            />
          </svg>
          {/* Capa 2: el logo terminado (con cruce) aparece encima a los 2 s. */}
          <div className="splash-cruce absolute inset-0">
            <SimboloJustihn size={120} variante="oscuro" />
          </div>
        </div>
        <span
          className="wordmark splash-wordmark text-[58px] leading-none text-white"
          style={{ letterSpacing: "-1px" }}
        >
          Justihn
        </span>
      </div>
      <div className="splash-texto text-[14px] tracking-[.3px]" style={{ color: "#7f9ec0" }}>
        Preparando tu portal…
      </div>
    </div>
  );
}
