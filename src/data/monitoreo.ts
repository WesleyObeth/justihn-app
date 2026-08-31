import { SENTENCIAS } from "@/data/sentencias";
import type { NombreVigilado, Sentencia } from "@/types/dominio";

/**
 * Monitoreo de nombres (feature Pro) — el sustituto honesto del "Acompanha"
 * de Jusbrasil: en Honduras no hay diario procesal, así que se vigila lo que
 * el Estado SÍ publica (sentencias del PJ + Gaceta), no movimientos de
 * expedientes.
 *
 * El matching de esta Fase 1 es REAL: corre sobre el texto oficial de las 12
 * sentencias del piloto. Los vigilados iniciales son partes reales de esas
 * sentencias — la demo demuestra el motor, no lo finge.
 *
 * TODO(data): tabla `nombres_vigilados` con RLS por `abogado_id`; el match se
 * ejecuta al ingerir cada tanda nueva del scraper (sentencias + Gaceta) y
 * dispara la notificación WhatsApp/correo.
 */
/**
 * Lo que vigila el CIUDADANO: su propio nombre y nada más — en la vía B no hay
 * clientes ni contrapartes. Arranca con el de la persona demo, que no aparece
 * en el corpus: el estado normal de este producto es "sin apariciones", y
 * sembrarlo con un match falso vendería miedo (§4.5).
 *
 * TODO(data): misma tabla `nombres_vigilados`, con RLS por `persona_id`.
 */
export const VIGILADOS_INICIALES_PERSONA: NombreVigilado[] = [
  { id: "vigp-carlos-zelaya", nombre: "Carlos Zelaya", tipo: "propio" },
];

export const VIGILADOS_INICIALES: NombreVigilado[] = [
  { id: "vig-propio", nombre: "María Castillo", tipo: "propio" },
  { id: "vig-henriquez", nombre: "Wilson Pablo Henríquez Martínez", tipo: "cliente" },
  { id: "vig-estado", nombre: "Estado de Honduras", tipo: "contraparte" },
];

export interface Aparicion {
  sentencia: Sentencia;
  /** "Recurrente" / "Recurrido" si el texto lo permite inferir. */
  rol: string | null;
}

/** Comparación sin tildes ni mayúsculas (los extractos del PJ vienen sin tildes). */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Busca el nombre en el texto oficial de cada sentencia del corpus. Es la
 * misma consulta que en Fase 2 corre sobre Postgres al ingerir cada tanda.
 */
export function buscarApariciones(nombre: string): Aparicion[] {
  const n = normalizar(nombre.trim());
  if (n.length < 4) return [];
  return SENTENCIAS.filter((s) =>
    normalizar(`${s.titulo} ${s.resumen} ${s.extracto}`).includes(n),
  ).map((s) => ({ sentencia: s, rol: inferirRol(s.extracto, n) }));
}

/** El encabezado del extracto oficial lista "Recurrente … Recurrido …". */
function inferirRol(extracto: string, nombreNormalizado: string): string | null {
  const texto = normalizar(extracto);
  const posicion = texto.indexOf(nombreNormalizado);
  if (posicion < 0) return null;
  const antes = texto.slice(0, posicion);
  const recurrente = antes.lastIndexOf("recurrente");
  const recurrido = antes.lastIndexOf("recurrido");
  if (recurrente < 0 && recurrido < 0) return null;
  return recurrido > recurrente ? "Recurrido" : "Recurrente";
}
