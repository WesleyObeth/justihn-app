/**
 * Catálogos del corpus que comparten servidor y pantalla: materias, tipos de
 * proceso y tamaños de página. Puro a propósito — sin `process.env` ni fetch —
 * para que la pantalla de Jurisprudencia pueda pintar sus selects sin arrastrar
 * al bundle del navegador el acceso a Supabase ni a OpenAI.
 */
import type { Materia } from "@/types/dominio";

/**
 * Cómo llama el CEDIJ a cada materia en la base ↔ la etiqueta corta de la UI
 * (la de los chips, los seeds y el tipo `Materia`). Conteo real 2026-09-02:
 * Constitucional 7.189 · Laboral 4.874 · Penal 2.644 · Contencioso ~1.600 ·
 * Civil 987 · DD.HH. unas decenas.
 */
export const MATERIAS_CORPUS: { etiqueta: Materia; db: string }[] = [
  { etiqueta: "Constitucional", db: "Derecho Constitucional" },
  { etiqueta: "Laboral", db: "Derecho Laboral" },
  { etiqueta: "Penal", db: "Derecho Penal" },
  { etiqueta: "Contencioso Adm.", db: "Contencioso Administrativo" },
  { etiqueta: "Civil", db: "Derecho Civil" },
  { etiqueta: "DD.HH.", db: "Derechos Humanos Grupos Vulnerables" },
];

export type TipoProcesoId = "casacion" | "amparo" | "habeas" | "revision" | "inconstitucionalidad";

/**
 * `sentencias.proceso` es «Tipo · Subtipo» («Casación · Laboral», «Recurso ·
 * Habeas Corpus (Exhibición Personal)»). El filtro busca el tipo dentro de la
 * cadena porque el CEDIJ no es consistente: el habeas corpus aparece como
 * tipo o como subtipo según la ficha.
 */
export const TIPOS_PROCESO: { id: TipoProcesoId; etiqueta: string; patron: string }[] = [
  { id: "casacion", etiqueta: "Casación", patron: "Casación" },
  { id: "amparo", etiqueta: "Amparo", patron: "Amparo" },
  { id: "habeas", etiqueta: "Habeas corpus", patron: "Habeas Corpus" },
  { id: "revision", etiqueta: "Revisión", patron: "Revisión" },
  { id: "inconstitucionalidad", etiqueta: "Inconstitucionalidad", patron: "Inconstitucionalidad" },
];

export const POR_PAGINA = 20;
/** Tope de resultados del modo semántico: es lo que admite el RPC. */
export const LIMITE_SEMANTICO = 30;

export function materiaDb(etiqueta: string): string | null {
  return MATERIAS_CORPUS.find((x) => x.etiqueta === etiqueta)?.db ?? null;
}
