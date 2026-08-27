/**
 * Motor real de Jus IA — Fase 2 (Blueprint §2, AI-First Add-on).
 *
 * Este módulo está desactivado hasta que exista el corpus indexado: sin RAG, un
 * modelo respondería derecho hondureño de memoria y produciría citas inventadas
 * — exactamente lo que el producto promete NO hacer. Por eso `recuperarCorpus`
 * lanza en vez de devolver una lista vacía: fallar cerrado (§0.4) es preferible
 * a una respuesta sin fuentes.
 *
 * Para activarlo (backlog #3 de `justihn/CLAUDE.md`):
 *   1. Poblar `sentencias`/`legislacion`/`gaceta` con embeddings (pgvector).
 *   2. Implementar `recuperarCorpus` con el match de similitud.
 *   3. Poner `JUSTIHN_MOTOR_IA=claude` y `ANTHROPIC_API_KEY` en el servidor.
 */
import Anthropic from "@anthropic-ai/sdk";
import { HARDENED_SYSTEM_PREAMBLE, wrapExternalData } from "@/lib/security/ai-safety";
import type { FragmentoCorpus, RespuestaIA } from "./tipos";

const MODELO = "claude-opus-5";

/** Cliente perezoso: sin esto, importar el módulo exigiría la clave en build. */
let cliente: Anthropic | null = null;
function getCliente(): Anthropic {
  if (!cliente) cliente = new Anthropic();
  return cliente;
}

/**
 * Recupera los fragmentos del corpus oficial que respaldan la consulta.
 *
 * TODO(data): `select ... from buscar_corpus(embedding, materias, limite)` en
 * Supabase con pgvector; el RPC aplica RLS y filtra materias reservadas
 * (niñez, violencia doméstica, procesos bajo reserva — regla §5 del proyecto).
 */
async function recuperarCorpus(_consulta: string): Promise<FragmentoCorpus[]> {
  throw new Error(
    "Corpus no indexado: el motor Claude requiere RAG sobre las fuentes oficiales. " +
      "Ver backlog #3 (scraper n8n del corpus CSJ).",
  );
}

export async function responderConClaude(
  consulta: string,
  metaCosto: string,
): Promise<RespuestaIA> {
  const fragmentos = await recuperarCorpus(consulta);

  // Sin fuentes no hay respuesta: es la regla de producto, no una optimización.
  if (fragmentos.length === 0) {
    return {
      text: "No encontré fuentes oficiales que respalden una respuesta a esa consulta. Prefiero decírtelo a darte un artículo que no pueda enlazarte. Puedes reformularla o buscar directamente en jurisprudencia.",
      meta: "Sin costo",
      gratuita: true,
    };
  }

  // Cada fragmento va envuelto como DATO, nunca como instrucción (§3.2).
  const contexto = fragmentos
    .map((f) => wrapExternalData(f.contenido, `${f.titulo} — ${f.fuenteUrl}`))
    .join("\n\n");

  const respuesta = await getCliente().messages.create({
    model: MODELO,
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: HARDENED_SYSTEM_PREAMBLE,
        // El preámbulo es idéntico en cada request: cachearlo evita repagarlo.
        cache_control: { type: "ephemeral" },
      },
    ],
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `Consulta de la abogada:\n${consulta}\n\nFuentes recuperadas del corpus oficial:\n${contexto}`,
      },
    ],
  });

  // `refusal` llega con HTTP 200: hay que revisarlo antes de leer el contenido.
  if (respuesta.stop_reason === "refusal") {
    return {
      text: "No puedo responder esa consulta. Si crees que es un error, reformúlala o escríbenos por WhatsApp.",
      meta: "Sin costo",
      gratuita: true,
    };
  }

  const texto = respuesta.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return {
    text: texto,
    citas: fragmentos.map((f) => ({ etiqueta: f.titulo, url: f.fuenteUrl })),
    meta: metaCosto,
  };
}
