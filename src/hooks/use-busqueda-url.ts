"use client";

import { useSyncExternalStore } from "react";

/**
 * `window.location.search` como estado, NO `useSearchParams`.
 *
 * Motivo (incidente real, 2026-08-29): ese hook obliga a envolver el árbol en
 * un `<Suspense>`, y bajo Suspense Next abandona el prerenderizado del
 * subárbol y emite el fallback — la home salió VACÍA en el HTML del servidor,
 * justo el contenido que es el motor de captación del producto.
 *
 * Aquí el servidor devuelve "" (sin parámetros) y el cliente el valor real
 * tras el mount, que es exactamente el contrato de `useSyncExternalStore`.
 * No se suscribe a nada porque el enlace que cambia el parámetro remonta la
 * página: no hace falta escuchar `popstate` para los usos que tiene hoy.
 */
const sinSuscripcion = () => () => {};
const enCliente = () => window.location.search;
const enServidor = () => "";

export function useBusquedaUrl(): string {
  return useSyncExternalStore(sinSuscripcion, enCliente, enServidor);
}

/** Lee un parámetro suelto de la URL. `null` en el servidor. */
export function useParametroUrl(nombre: string): string | null {
  return new URLSearchParams(useBusquedaUrl()).get(nombre);
}
