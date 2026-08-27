import type { Cita, EscritoGenerado, TarjetaSentencia } from "@/types/dominio";

/**
 * Contrato de respuesta de Jus IA — lo cumplen por igual el router de Fase 1
 * (`router-demo.ts`) y el motor real de Fase 2 (`motor-claude.ts`). La UI solo
 * conoce este shape, así que cambiar de motor no le afecta.
 */
export interface RespuestaIA {
  text: string;
  citas?: Cita[];
  tabla?: [string, string][];
  tarjeta?: TarjetaSentencia;
  chips?: string[];
  /** Etiqueta de costo mostrada al pie ("Usó 1 crédito · quedan 25"). */
  meta?: string;
  escrito?: EscritoGenerado;
  /** `true` = no consume cuota (saludos, ayuda sobre capacidades). */
  gratuita?: boolean;
}

/** Fragmento del corpus recuperado por RAG que respalda una respuesta. */
export interface FragmentoCorpus {
  id: string;
  tipo: "sentencia" | "legislacion" | "gaceta";
  titulo: string;
  contenido: string;
  fuenteUrl: string;
  /** Similitud del match de pgvector, para ordenar y descartar ruido. */
  score: number;
}
