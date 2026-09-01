/**
 * Acceso al corpus indexado en Supabase.
 *
 * Se habla con PostgREST por `fetch` en vez de con `@supabase/supabase-js` a
 * propósito: lo único que necesita este módulo es una llamada al RPC
 * `buscar_corpus`, y una dependencia entera para eso engordaría el bundle sin
 * darnos nada. Cuando entre Supabase Auth (§7.2) sí hará falta el SDK, y este
 * módulo puede pasarse a él sin que la UI se entere.
 *
 * ⚠️ **Solo la clave `anon`.** Su seguridad la da RLS, no el secreto: con ella
 * las sentencias reservadas por §5 son invisibles (verificado 2026-09-01: 1.517
 * legibles de 1.705, y escribir devuelve 401). La `service_role` NO entra en
 * este repo — se deploya a Vercel, y un `NEXT_PUBLIC_` la publicaría en el
 * navegador de cada visitante.
 */

export interface FilaCorpus {
  /** Fragmento concreto del que salió la cita, para poder auditarla. */
  chunk_id: number;
  record_id: number;
  expediente: string;
  materia: string;
  organo: string | null;
  fecha_sentencia: string | null;
  fallo: string | null;
  fuente_url: string;
  fragmento: string;
  similitud: number;
}

function configuracion() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY: el corpus no es accesible.",
    );
  }
  return { url, key };
}

/**
 * Busca en el corpus por similitud vectorial. **Devuelve una fila por
 * sentencia**, con su mejor fragmento.
 *
 * Esa unicidad la garantiza el RPC (`distinct on (record_id)`), no este
 * módulo. Dos motivos para que viva en la base: la unidad de cita es la
 * sentencia, no el trozo —a un abogado no le sirven cinco fragmentos del mismo
 * fallo—, y un ranking plano por similitud se llenaría con la sentencia más
 * larga, que por tener más fragmentos tiene más billetes en la rifa.
 *
 * El filtro de materias reservadas tampoco va aquí: vive dentro del RPC. Una
 * regla legal que dependa de que quien llama se acuerde de aplicarla acaba
 * olvidándose en alguna llamada.
 */
export async function buscarCorpus(
  embedding: number[],
  opciones: { materias?: string[]; limite?: number } = {},
): Promise<FilaCorpus[]> {
  const { url, key } = configuracion();

  const res = await fetch(`${url}/rest/v1/rpc/buscar_corpus`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      consulta_embedding: embedding,
      materias_filtro: opciones.materias ?? null,
      limite: opciones.limite ?? 8,
    }),
    // El corpus no cambia entre peticiones de un mismo despliegue, pero Next
    // cachearía la respuesta POST por defecto en algunos caminos: aquí no
    // queremos que una consulta distinta reciba el resultado de otra.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`buscar_corpus ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return (await res.json()) as FilaCorpus[];
}
