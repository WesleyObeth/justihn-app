/**
 * RAG: de la consulta en castellano a los fragmentos oficiales que la respaldan.
 *
 * Vive aparte de los motores porque **los dos comparten esto**: cambiar de
 * modelo generador (Claude, OpenAI) no puede cambiar qué fuentes se recuperan
 * ni qué filtros legales se aplican. Si esto estuviera dentro de un motor, el
 * otro tendría su propia copia y una de las dos acabaría sin el filtro de §5.
 */
import { buscarCorpus } from "./supabase";
import { vectorizar } from "./embeddings";
import type { FragmentoCorpus } from "@/lib/ai/tipos";

/**
 * Por debajo de esto el fragmento es ruido.
 *
 * **0,45 está medido, no elegido a ojo** (2026-09-01, sobre 2.009 sentencias):
 *
 *   pertinentes   0,53 – 0,69   (despido · pagaré · amparo)
 *   ajenas        0,22 – 0,34   (criptomonedas en Islandia · una receta · wifi)
 *
 * Hay un hueco limpio entre ambos grupos y 0,45 cae en medio. Con el 0,3 que
 * había, "el régimen fiscal de las criptomonedas en Islandia" devolvía **cinco
 * citas de jurisprudencia hondureña**: el modelo decía correctamente que no
 * tenía la información, pero la respuesta salía con cinco enlaces debajo —
 * exactamente el aspecto de una respuesta respaldada que §4.5 prohíbe.
 *
 * ⚠️ Descartar de más es preferible a citar de más: una respuesta con menos
 * fuentes se nota y se puede reformular; una que cita una sentencia que no
 * viene al caso parece correcta y no se nota.
 */
const UMBRAL_SIMILITUD = 0.45;

export async function recuperarDelCorpus(
  consulta: string,
  opciones: { materias?: string[]; limite?: number } = {},
): Promise<FragmentoCorpus[]> {
  const embedding = await vectorizar(consulta);
  const filas = await buscarCorpus(embedding, opciones);

  return filas
    .filter((f) => f.similitud >= UMBRAL_SIMILITUD)
    .map((f) => ({
      id: String(f.record_id),
      tipo: "sentencia" as const,
      // El título es lo que se ve en la cita: expediente, órgano y año son lo
      // que un abogado usa para reconocer una sentencia de un vistazo.
      titulo: [f.expediente, f.organo, f.fecha_sentencia?.slice(0, 4)]
        .filter(Boolean)
        .join(" · "),
      contenido: f.fragmento,
      fuenteUrl: f.fuente_url,
      score: f.similitud,
    }));
}
