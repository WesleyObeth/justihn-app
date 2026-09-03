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

  /**
   * Bloquea el scroll del documento mientras dura el splash. El overlay es
   * `fixed` y ya se recorta solo, pero la página de auth que queda debajo mide
   * más que la ventana: sin esto se puede arrastrar la escena hacia arriba y
   * ver la card del formulario asomando por el borde, que rompe la sensación
   * de "entrando al portal". Se restaura el valor anterior al desmontar, no se
   * pone a `""`, para no pisar un bloqueo que hubiera puesto otra capa.
   */
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  return (
    <div
      // `overflow-hidden`: aunque la escena ya se recorta al viewport, este
      // overlay no puede ser nunca el que le dé scroll horizontal a la página.
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden overscroll-none"
      style={{ background: "linear-gradient(180deg,#0d2144 0%,#0a1830 100%)" }}
      role="status"
      aria-label="Preparando tu portal"
    >
      <EscenaLogo ancho={520} pie="Preparando tu portal…" />
    </div>
  );
}
