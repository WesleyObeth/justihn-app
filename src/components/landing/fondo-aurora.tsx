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

export function FondoAurora() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPerf =
      window.innerWidth < 760 ||
      (navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false);

    let api: { dispose: () => void } | null = null;
    if (canvas.current && hasWebGL() && !reduced) {
      try {
        api = initAurora(canvas.current, { lowPerf });
      } catch {
        api = null;
      }
    }
    if (!api) setFallback(true);
    return () => api?.dispose();
  }, []);

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
