import type { Cita } from "@/types/dominio";
import type { FragmentoCorpus } from "./tipos";

/**
 * Fuentes numeradas: el contrato entre el prompt y los chips de citas.
 *
 * El problema que resuelve (visto en vivo el 2026-09-01): el motor citaba TODO
 * lo recuperado — 16 chips para una pregunta cuya respuesta usaba dos fuentes.
 * Citar lo consultado no es citar lo usado, y un abogado no puede distinguir
 * cuál de las 16 respalda la afirmación que le importa.
 *
 * El mecanismo: cada fragmento entra al prompt como "Fuente [n]", el modelo
 * marca [n] en el texto donde se apoya en una, y aquí se filtran los chips a
 * las realmente referenciadas — con el MISMO número visible en el texto y en
 * el chip, para que se correspondan de un vistazo.
 */

/** Etiqueta con la que un fragmento entra al prompt. Sin URL a propósito: el
 *  modelo no debe escribir enlaces (los chips ya los llevan) y no se le da la
 *  materia prima para intentarlo. */
export function etiquetaDeFuente(indice: number, f: FragmentoCorpus): string {
  return `Fuente [${indice + 1}] · ${f.titulo}`;
}

/** Reglas de formato que acompañan al preámbulo endurecido en los dos motores. */
export const FORMATO_RESPUESTA = `FORMATO DE LA RESPUESTA:
- Prosa clara en español. Puedes usar **negritas** para lo importante y listas simples.
- NO escribas URLs ni enlaces en el texto: cada fuente se muestra aparte, ya enlazada al documento oficial.
- Las fuentes vienen numeradas ("Fuente [1]", "Fuente [2]"…). Cuando una afirmación se apoye en una, marca su número entre corchetes al final de la frase, por ejemplo: "…un mes de salario por año trabajado [3]." Usa SOLO números de la lista.
- No cites fuentes que no hayas usado. No uses tablas ni encabezados de almohadilla (#).`;

/**
 * Filtra las citas a las fuentes que el texto realmente referencia.
 *
 * Fallback deliberado: si el modelo no marcó ningún [n] (modelo viejo, prompt
 * ignorado), se citan TODAS las recuperadas — enseñar de más es ruido, esconder
 * el respaldo de una afirmación sería faltar a la promesa del producto.
 */
export function seleccionarCitas(texto: string, fragmentos: FragmentoCorpus[]): Cita[] {
  const usados = new Set<number>();
  for (const m of texto.matchAll(/\[(\d{1,2})\]/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= fragmentos.length) usados.add(n);
  }

  const indices =
    usados.size > 0 ? [...usados].sort((a, b) => a - b) : fragmentos.map((_, i) => i + 1);

  return indices.map((n) => {
    const f = fragmentos[n - 1]!;
    const cita: Cita = { etiqueta: f.titulo, url: f.fuenteUrl };
    if (usados.size > 0) cita.numero = n;
    return cita;
  });
}
