/**
 * RAG: de la consulta en castellano a los fragmentos oficiales que la respaldan.
 *
 * Vive aparte de los motores porque **los dos comparten esto**: cambiar de
 * modelo generador (Claude, OpenAI) no puede cambiar qué fuentes se recuperan
 * ni qué filtros legales se aplican. Si esto estuviera dentro de un motor, el
 * otro tendría su propia copia y una de las dos acabaría sin el filtro de §5.
 */
import { buscarCorpus, buscarLegislacion, type FilaLegislacion } from "./supabase";
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

/** "No se indica" y compañía son huecos del CEDIJ, no datos que enseñar. */
const PLACEHOLDER = /^\s*(no\s+(se\s+)?indica|n\/?a|ninguno|sin\s+dato|-+)\s*$/i;
function sinHueco(v: string | null): string | null {
  const t = (v ?? "").trim();
  return t && !PLACEHOLDER.test(t) ? t : null;
}

/** Un artículo recuperado, en el shape que consumen los motores. */
export function fragmentoDeArticulo(f: FilaLegislacion): FragmentoCorpus {
  return {
    id: `articulo-${f.articulo_id}`,
    tipo: "legislacion" as const,
    titulo: `${f.codigo_nombre} · artículo ${f.numero}`,
    contenido: f.texto,
    fuenteUrl: f.fuente_url,
    score: f.similitud,
  };
}

export async function recuperarDelCorpus(
  consulta: string,
  opciones: { materias?: string[]; limite?: number } = {},
): Promise<FragmentoCorpus[]> {
  const embedding = await vectorizar(consulta);
  // La consulta se vectoriza UNA vez y busca en los dos espacios: sentencias
  // (fragmentos) y códigos (artículos). La legislación degrada a [] si su
  // esquema aún no existe o si falla — quedarse sin artículos deja una
  // respuesta con menos fuentes, no una respuesta rota.
  const [filas, articulos] = await Promise.all([
    buscarCorpus(embedding, opciones),
    buscarLegislacion(embedding).catch((error) => {
      console.error("[corpus] legislación no disponible:", error);
      return [] as FilaLegislacion[];
    }),
  ]);

  // La norma va ANTES que su aplicación: si el art. 120 responde la consulta,
  // debe ser la primera cita y las sentencias lo acompañan. No se mezclan por
  // score: fragmento de 1.200 chars y artículo completo no puntúan igual.
  const legislacion = articulos
    .filter((f) => f.similitud >= UMBRAL_SIMILITUD)
    .map(fragmentoDeArticulo);

  const sentencias = filas
    .filter((f) => f.similitud >= UMBRAL_SIMILITUD)
    .map((f) => ({
      id: String(f.record_id),
      tipo: "sentencia" as const,
      // El título es lo que se ve en la cita: expediente, órgano y año son lo
      // que un abogado usa para reconocer una sentencia de un vistazo.
      //
      // ⚠️ `sinHueco` no es defensa de sobra. El CEDIJ rellena lo que no tiene
      // con la cadena "No se indica" —el 52% de los órganos—, y `filter(Boolean)`
      // la deja pasar porque es un texto no vacío: las citas salían como
      // «AC-834-22 · No se indica · 2025», enseñando el hueco. Se normaliza al
      // ingerir, pero también aquí: la base ya tiene filas viejas, y una cita mal
      // formada es lo primero que se ve de este producto.
      titulo: [f.expediente, sinHueco(f.organo), f.fecha_sentencia?.slice(0, 4)]
        .filter(Boolean)
        .join(" · "),
      contenido: f.fragmento,
      fuenteUrl: f.fuente_url,
      score: f.similitud,
    }));

  return [...legislacion, ...sentencias];
}
