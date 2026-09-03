"use client";

import { useEffect, useState } from "react";
import type { ResultadoGaceta } from "@/lib/corpus/gaceta";

export type EstadoGaceta =
  | { tipo: "cargando" }
  | { tipo: "listo"; datos: ResultadoGaceta }
  | { tipo: "error"; mensaje: string };

/** El último resultado, para que Dashboard y Gaceta no pidan dos veces lo mismo al navegar. */
let cache: { clave: string; datos: ResultadoGaceta; en: number } | null = null;
const TTL_MS = 5 * 60_000;

/**
 * Las publicaciones recientes de La Gaceta (Sección A) desde la API. Un
 * solo sitio lo pide: la pantalla de alertas y el digest del Dashboard
 * leen del mismo dato y no pueden contradecirse.
 */
export function useGaceta(opciones: { dias?: number; materia?: string | null } = {}): EstadoGaceta {
  const clave = JSON.stringify({ dias: opciones.dias ?? 30, materia: opciones.materia ?? null });
  const [estado, setEstado] = useState<EstadoGaceta>(() =>
    cache && cache.clave === clave && Date.now() - cache.en < TTL_MS ? { tipo: "listo", datos: cache.datos } : { tipo: "cargando" },
  );

  useEffect(() => {
    if (cache && cache.clave === clave && Date.now() - cache.en < TTL_MS) return;
    const abortador = new AbortController();
    fetch("/api/gaceta/publicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: clave,
      signal: abortador.signal,
    })
      .then(async (res) => {
        const json = (await res.json()) as ResultadoGaceta & { mensaje?: string };
        if (!res.ok) throw new Error(json.mensaje ?? `Error ${res.status}`);
        cache = { clave, datos: json, en: Date.now() };
        setEstado({ tipo: "listo", datos: json });
      })
      .catch((e: unknown) => {
        if (abortador.signal.aborted) return;
        setEstado({ tipo: "error", mensaje: e instanceof Error ? e.message : "No se pudo leer La Gaceta." });
      });
    return () => abortador.abort();
  }, [clave]);

  return estado;
}
