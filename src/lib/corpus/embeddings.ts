/**
 * Vectorización de la consulta, para buscar en el corpus por similitud.
 *
 * Un solo modelo, y el mismo que se usó al indexar: **los embeddings solo se
 * comparan entre sí si salen del mismo modelo**. Cambiarlo aquí sin reindexar
 * el corpus no da un error — da resultados silenciosamente malos, que es peor.
 * Por eso el nombre del modelo vive en una constante exportada y el script de
 * indexación (`automatizaciones/corpus-csj/embeddings.mjs`) importa el mismo
 * valor literal.
 */

/** 1536 dimensiones: es lo que declara `sentencia_chunks.embedding`. */
export const MODELO_EMBEDDING = "text-embedding-3-small";

export async function vectorizar(texto: string): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Falta OPENAI_API_KEY: no se puede buscar en el corpus.");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODELO_EMBEDDING, input: texto }),
  });

  if (!res.ok) {
    throw new Error(`embeddings ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}
