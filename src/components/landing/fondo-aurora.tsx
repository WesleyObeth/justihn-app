"use client";

/**
 * Fondo aurora (WebGL) + capas base, replicado del proyecto de origen con el
 * boot original: sin WebGL o con reduced-motion cae al blob estático.
 * Stacking del contrato: fondo z-0 · canvas+scrim z-1 · contenido z-2.
 */
import { useEffect, useRef, useState } from "react";
import { initAurora } from "./aurora";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

export function FondoAurora({ variante = "clara" }: { variante?: "clara" | "noche" }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  const noche = variante === "noche";

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPerf =
      window.innerWidth < 760 ||
      (navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false);

    let api: { dispose: () => void } | null = null;
    if (canvas.current && hasWebGL() && !reduced) {
      try {
        api = initAurora(canvas.current, { lowPerf, light: !noche });
      } catch {
        api = null;
      }
    }
    if (!api) setFallback(true);
    return () => api?.dispose();
  }, [noche]);

  if (noche) {
    // Variante de las pantallas de auth (handoff design_handoff_auth): el
    // shader dibuja su propio navy opaco, así que no lleva capas claras ni
    // scrim — solo el canvas sobre el gradiente del shell, y un resplandor
    // estático si no hay WebGL.
    return (
      <>
        <canvas
          ref={canvas}
          className="funnel-bg funnel-bg--noche"
          style={fallback ? { display: "none" } : undefined}
          aria-hidden
        />
        <div
          className="funnel-fallback funnel-fallback--noche"
          style={fallback ? { display: "block" } : undefined}
        >
          <i />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-wrap">
        <div className="bg-base" />
        <div className="bg-grid" />
        <div className="bg-grain" />
      </div>
      <canvas
        ref={canvas}
        className="funnel-bg"
        style={fallback ? { display: "none" } : undefined}
        aria-hidden
      />
      <div className="funnel-scrim" />
      <div className="funnel-fallback" style={fallback ? { display: "block" } : undefined}>
        <i />
      </div>
    </>
  );
}
