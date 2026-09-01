/**
 * Motor real de Jus IA — Fase 2 (Blueprint §2, AI-First Add-on).
 *
 * **Cableado al corpus real el 2026-09-01.** Recupera con
 * `recuperarDelCorpus`, que es EL MISMO camino que usa `motor-openai.ts`: la
 * recuperación y los filtros legales no pueden depender de qué modelo redacta.
 *
 * Para activarlo: `JUSTIHN_MOTOR_IA=claude` + `ANTHROPIC_API_KEY` (y
 * `OPENAI_API_KEY`, que es quien vectoriza la consulta) en el servidor.
 *
 * Sigue fallando cerrado: sin fragmentos no responde. Un modelo contestando
 * derecho hondureño de memoria produce citas inventadas — exactamente lo que el
 * producto promete NO hacer.
 */
import Anthropic from "@anthropic-ai/sdk";
import { HARDENED_SYSTEM_PREAMBLE, wrapExternalData } from "@/lib/security/ai-safety";
import { recuperarDelCorpus } from "@/lib/corpus/recuperar";
import { etiquetaDeFuente, seleccionarCitas, FORMATO_RESPUESTA } from "./citas";
import { SIN_FUENTES } from "./sin-fuentes";
import type { RespuestaIA } from "./tipos";

const MODELO = "claude-opus-5";

/** Cliente perezoso: sin esto, importar el módulo exigiría la clave en build. */
let cliente: Anthropic | null = null;
function getCliente(): Anthropic {
  if (!cliente) cliente = new Anthropic();
  return cliente;
}

export async function responderConClaude(
  consulta: string,
  metaCosto: string,
): Promise<RespuestaIA> {
  const fragmentos = await recuperarDelCorpus(consulta);

  // Sin fuentes no hay respuesta: es la regla de producto, no una optimización.
  if (fragmentos.length === 0) return SIN_FUENTES;

  // Cada fragmento va envuelto como DATO, nunca como instrucción (§3.2), y
  // numerado: el modelo referencia [n] y los chips se filtran a las fuentes
  // usadas (ver lib/ai/citas.ts).
  const contexto = fragmentos
    .map((f, i) => wrapExternalData(f.contenido, etiquetaDeFuente(i, f)))
    .join("\n\n");

  const respuesta = await getCliente().messages.create({
    model: MODELO,
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: `${HARDENED_SYSTEM_PREAMBLE}\n\n${FORMATO_RESPUESTA}`,
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
    citas: seleccionarCitas(texto, fragmentos),
    meta: metaCosto,
  };
}
