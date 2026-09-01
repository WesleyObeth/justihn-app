"use client";

/**
 * Efecto de escritura de las respuestas de Jus IA.
 *
 * El texto llega COMPLETO del endpoint y se revela progresivamente — es
 * presentación, no streaming de tokens (ese es el upgrade de Fase 2, cuando el
 * endpoint pase a SSE). Nada del contenido cambia: solo el ritmo al que se ve.
 *
 * El registro de "recién llegado" vive en módulo, no en el store persistido:
 * al recargar la página, el historial aparece entero al instante — reanimar
 * conversaciones viejas sería un tic, no un efecto.
 */
import { useEffect, useMemo, useState } from "react";

const recienLlegados = new Set<string>();

/** La llama `use-jus-ia` al agregar una respuesta nueva al hilo. */
export function marcarParaEscribir(id: string) {
  recienLlegados.add(id);
}

const prefiereQuieto = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Devuelve el texto parcial a pintar y si el efecto terminó (las citas y
 * acciones del mensaje esperan a `terminado` para no adelantarse al texto).
 *
 * Ritmo: la respuesta entera se revela en ~2,2 s independientemente del largo
 * (paso proporcional) — lo bastante vivo para leerse escribiéndose, lo
 * bastante corto para no estorbar a quien ya está leyendo.
 */
export function useMaquinaDeEscribir(id: string, texto: string) {
  const [visibles, setVisibles] = useState(() =>
    recienLlegados.has(id) && !prefiereQuieto() ? 0 : texto.length,
  );

  useEffect(() => {
    // La marca se consume aquí, pero el intervalo NO se condiciona a ella:
    // en dev StrictMode el efecto corre dos veces (montar → limpiar → montar)
    // y condicionarlo dejaba la segunda pasada sin animación — el mensaje se
    // quedaba en 0 caracteres para siempre. El intervalo es idempotente: si el
    // texto ya está completo, su primer tic se apaga solo.
    recienLlegados.delete(id);
    const total = texto.length;
    const paso = Math.max(3, Math.ceil(total / 140));
    const timer = window.setInterval(() => {
      setVisibles((v) => {
        if (v >= total) {
          window.clearInterval(timer);
          return v;
        }
        return Math.min(total, v + paso);
      });
    }, 16);
    return () => window.clearInterval(timer);
  }, [id, texto]);

  const terminado = visibles >= texto.length;
  const parcial = useMemo(
    () => (terminado ? texto : texto.slice(0, visibles)),
    [texto, visibles, terminado],
  );
  return { parcial, terminado };
}
