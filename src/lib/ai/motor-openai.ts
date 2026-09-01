/**
 * Motor de Jus IA sobre OpenAI — **para probar el circuito RAG completo**.
 *
 * Existe porque encender el producto con Claude exige una segunda clave y una
 * segunda facturación, y lo que hay que validar primero no es qué modelo
 * redacta mejor: es si la recuperación trae las sentencias correctas y si el
 * modelo se ciñe a ellas. Eso se ve igual con cualquier modelo decente.
 *
 * ⚠️ **Comparte con `motor-claude.ts` todo lo que no puede divergir**: la
 * recuperación (`recuperarDelCorpus`, con el filtro de materias reservadas
 * dentro del RPC), el preámbulo endurecido y el sobre `wrapExternalData` contra
 * inyección indirecta (§3.2 del blueprint). Lo único propio de este archivo es
 * la llamada HTTP. Si algún día divergen en seguridad, el bug estará aquí.
 *
 * El destino sigue siendo Claude (`JUSTIHN_MOTOR_IA=claude`): esto es el banco
 * de pruebas, no el reemplazo.
 */
import { HARDENED_SYSTEM_PREAMBLE, wrapExternalData } from "@/lib/security/ai-safety";
import { recuperarDelCorpus } from "@/lib/corpus/recuperar";
import { etiquetaDeFuente, seleccionarCitas, FORMATO_RESPUESTA } from "./citas";
import { SIN_FUENTES } from "./sin-fuentes";
import type { RespuestaIA } from "./tipos";

const MODELO = process.env.JUSTIHN_MODELO_OPENAI ?? "gpt-4o";

export async function responderConOpenAI(
  consulta: string,
  metaCosto: string,
): Promise<RespuestaIA> {
  const fragmentos = await recuperarDelCorpus(consulta);

  // Sin fuentes no hay respuesta: es la promesa del producto (§4.1), no una
  // optimización. Se decide ANTES de gastar un token en generar.
  if (fragmentos.length === 0) return SIN_FUENTES;

  // Fuentes numeradas: el modelo referencia [n] y los chips se filtran a las
  // usadas (ver lib/ai/citas.ts). Sin URL en la etiqueta a propósito.
  const contexto = fragmentos
    .map((f, i) => wrapExternalData(f.contenido, etiquetaDeFuente(i, f)))
    .join("\n\n");

  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Falta OPENAI_API_KEY.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 2000,
      messages: [
        { role: "system", content: `${HARDENED_SYSTEM_PREAMBLE}\n\n${FORMATO_RESPUESTA}` },
        {
          role: "user",
          content: `Consulta:\n${consulta}\n\nFuentes recuperadas del corpus oficial:\n${contexto}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`openai ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string | null }; finish_reason: string }[];
  };
  const texto = json.choices[0]?.message?.content?.trim();
  if (!texto) return SIN_FUENTES;

  return {
    text: texto,
    citas: seleccionarCitas(texto, fragmentos),
    meta: metaCosto,
  };
}
