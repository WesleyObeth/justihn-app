"use client";

/**
 * Franja horaria del saludo — ÚNICO lugar que decide "Buenos días / Buenas
 * tardes / Buenas noches" (regla §4 del CLAUDE.md: un solo lugar por dato).
 *
 * La hora local no la conoce el servidor: se sirve cadena vacía y el cliente
 * la completa tras el mount (§0.6). `useSyncExternalStore` es el mecanismo
 * previsto para esto — un `setState` en un efecto provocaría un render en
 * cascada. El valor se memoiza porque `getSnapshot` debe ser estable entre
 * renders; la franja solo cambia al recargar, que es el comportamiento esperado.
 */
import { useSyncExternalStore } from "react";
import { TITULARES_HERO } from "@/data/jus-ia";
import { ABOGADA_DEMO } from "@/data/catalogo";

let franjaMemo: string | null = null;

const SIN_SUSCRIPCION = () => () => {};

function snapshotCliente(): string {
  if (franjaMemo === null) {
    const hora = new Date().getHours();
    franjaMemo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
  }
  return franjaMemo;
}

/** `""` durante SSR e hidratación; la franja real después del mount. */
export function useSaludoPorHora(): string {
  return useSyncExternalStore(SIN_SUSCRIPCION, snapshotCliente, () => "");
}

/**
 * Titular del hero de Jus IA: una frase del pool por carga de página. El azar
 * corre solo en cliente tras el mount (nunca en carga de módulo, regla §4.5) y
 * se memoiza para que el snapshot sea estable entre renders.
 */
let titularMemo: string | null = null;

function snapshotTitular(): string {
  if (titularMemo === null) {
    const contexto = {
      franja: snapshotCliente(),
      nombre: ABOGADA_DEMO.nombreCorto.split(" ")[0]!,
    };
    const elegido = TITULARES_HERO[Math.floor(Math.random() * TITULARES_HERO.length)]!;
    titularMemo = elegido(contexto);
  }
  return titularMemo;
}

/** `""` durante SSR e hidratación; el titular elegido después del mount. */
export function useTitularJusIA(): string {
  return useSyncExternalStore(SIN_SUSCRIPCION, snapshotTitular, () => "");
}

/**
 * Etiqueta de la semana en curso (lunes a domingo), p. ej. "semana del 24 al
 * 30 de agosto". La fecha local no la conoce el servidor: mismo patrón que la
 * franja — cadena vacía en SSR, valor real tras el mount.
 */
let semanaMemo: string | null = null;

function snapshotSemana(): string {
  if (semanaMemo === null) {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    const mes = (d: Date) => d.toLocaleDateString("es-HN", { month: "long" });
    semanaMemo =
      lunes.getMonth() === domingo.getMonth()
        ? `semana del ${lunes.getDate()} al ${domingo.getDate()} de ${mes(domingo)}`
        : `semana del ${lunes.getDate()} de ${mes(lunes)} al ${domingo.getDate()} de ${mes(domingo)}`;
  }
  return semanaMemo;
}

/** `""` durante SSR e hidratación; la semana real después del mount. */
export function useSemanaActual(): string {
  return useSyncExternalStore(SIN_SUSCRIPCION, snapshotSemana, () => "");
}
