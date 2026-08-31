"use client";

/**
 * Splash de entrada al portal: **una sola pasada** de la escena del logo y, a
 * los 5 s, al portal. Cinco segundos cae justo al terminar el tercer acto —
 * con el nombre ya revelado y antes de que empiece el fade del cuarto—, así
 * que la navegación no corta la animación a media frase.
 *
 * La escena vive en `escena-logo.tsx`; aquí solo van el lienzo marino y el
 * temporizador.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EscenaLogo } from "@/components/auth/escena-logo";

export function SplashJustihn({ destino = "/abogados" }: { destino?: string }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push(destino), 5000);
    return () => clearTimeout(t);
  }, [router, destino]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center"
      style={{ background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)" }}
      role="status"
      aria-label="Preparando tu portal"
    >
      <EscenaLogo ancho={520} pie="Preparando tu portal…" />
    </div>
  );
}
