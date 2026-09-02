/**
 * Parser de la FICHA JURISPRUDENCIAL del CEDIJ.
 *
 * `sentencias.texto` no es la sentencia: es la **ficha** que el CEDIJ redacta
 * sobre cada fallo (verificado 2026-09-02 sobre 400 filas: las 400 terminan en
 * «Sentencia · @documento», el cuerpo íntegro no viaja en la API). La ficha es
 * texto plano con rótulos al inicio de línea —«Recurrente …», «Fallo …»— y
 * bloques de varias líneas (Tesauro, Respuesta al problema jurídico,
 * Consideraciones de la sala, Legislación aplicada), y cada bloque puede
 * repetirse: una ficha trae en promedio 1,5 problemas jurídicos.
 *
 * Se parsea en la app y no en la base por la misma razón que los fragmentos no
 * guardan texto (§7.1): un solo dato de origen. Si mañana el CEDIJ cambia un
 * rótulo, se corrige aquí y se aplica a las 19.742 sin reingerir nada.
 *
 * ⚠️ Dos columnas de la tabla NO dicen lo que su nombre promete, y las dos se
 * resuelven aquí: `fallo` guarda el estado de publicación («Publicada», en el
 * 100% de la muestra) y el fallo real solo vive en la línea «Fallo …» de la
 * ficha; y `organo` es el **tribunal de procedencia** (la instancia recurrida),
 * no quien dictó la sentencia — toda sentencia del corpus la dictó la Corte
 * Suprema, así que cuando la ficha no lo indica se dice eso y no se inventa
 * una sala.
 */

export interface ProblemaJuridico {
  /** Ruta temática del tesauro, de lo general a lo concreto; la pregunta va aparte. */
  tesauro: string[];
  pregunta: string | null;
  respuesta: string | null;
  consideraciones: string | null;
}

export interface FichaJurisprudencial {
  tema: string | null;
  tipoProceso: string | null;
  subTipoProceso: string | null;
  fechaResolucion: string | null;
  ponente: string | null;
  materia: string | null;
  recurrente: string | null;
  recurrido: string | null;
  tribunalProcedencia: string | null;
  fechaSentenciaRecurrida: string | null;
  motivo: string | null;
  hechos: string | null;
  actoRecurrido: string | null;
  fallo: string | null;
  problemas: ProblemaJuridico[];
  /** «Código Procesal Civil 720 numeral 1», una por línea del bloque. */
  legislacion: string[];
  jerarquia: string | null;
  vigencia: string | null;
}

/**
 * El CEDIJ rellena lo que no tiene con «No se indica» / «No indica» — en el
 * 52% de los tribunales de procedencia y el 29% de los ponentes. Es un hueco,
 * no un dato: se devuelve `null` para que la UI decida qué decir en su lugar.
 */
export function sinHueco(valor: string | null | undefined): string | null {
  const v = valor?.trim();
  if (!v) return null;
  if (/^no (se )?indica/i.test(v) || /^no definid[ao]$/i.test(v)) return null;
  return v;
}

/** Rótulos de UNA línea: «Rótulo valor». El orden no importa. */
const CAMPOS: [RegExp, keyof Omit<FichaJurisprudencial, "problemas" | "legislacion">][] = [
  [/^Tema\s+(.+)$/, "tema"],
  [/^Tipo de proceso\s+(.+)$/, "tipoProceso"],
  [/^Sub tipo de proceso\s+(.+)$/, "subTipoProceso"],
  [/^Fecha de resolución\s+(.+)$/, "fechaResolucion"],
  [/^Magistrado ponente\s+(.+)$/, "ponente"],
  [/^Materia\s+(.+)$/, "materia"],
  [/^Recurrente\s+(.+)$/, "recurrente"],
  [/^Recurrido\s+(.+)$/, "recurrido"],
  [/^Tribunal de procedencia\s+(.+)$/, "tribunalProcedencia"],
  [/^Fecha de sentencia recurrida\s+(.+)$/, "fechaSentenciaRecurrida"],
  [/^Motivo de la casación\s+(.+)$/, "motivo"],
  [/^Hechos relevantes\s+(.+)$/, "hechos"],
  [/^Acto recurrido\s+(.+)$/, "actoRecurrido"],
  [/^Fallo\s+(.+)$/, "fallo"],
  [/^Jerarquía Jurisprudencial\s+(.+)$/, "jerarquia"],
  [/^Vigencia Jurisprudencial\s+(.+)$/, "vigencia"],
];

/** Rótulos que abren un BLOQUE de varias líneas (hasta el siguiente rótulo). */
type Bloque = "tesauro" | "respuesta" | "consideraciones" | "legislacion";
const BLOQUES: [RegExp, Bloque][] = [
  [/^Tesauro\s*$/, "tesauro"],
  [/^Respuesta al problema jurídico\s*$/, "respuesta"],
  [/^Consideraciones de la sala\s*$/, "consideraciones"],
  [/^Legislación aplicada\b/, "legislacion"],
];

/** Líneas que cierran cualquier bloque sin abrir otro. */
const CIERRES = [/^Sentencia\s*$/, /^@documento/, /^Categoría\s/, /^Novedades\s/, /^Anonimizada\s/];

export function parsearFicha(texto: string): FichaJurisprudencial {
  const ficha: FichaJurisprudencial = {
    tema: null,
    tipoProceso: null,
    subTipoProceso: null,
    fechaResolucion: null,
    ponente: null,
    materia: null,
    recurrente: null,
    recurrido: null,
    tribunalProcedencia: null,
    fechaSentenciaRecurrida: null,
    motivo: null,
    hechos: null,
    actoRecurrido: null,
    fallo: null,
    problemas: [],
    legislacion: [],
    jerarquia: null,
    vigencia: null,
  };

  const lineas = texto.split("\n").map((l) => l.trim());
  let bloque: Bloque | null = null;
  let actual: ProblemaJuridico | null = null;

  const abrirProblema = () => {
    actual = { tesauro: [], pregunta: null, respuesta: null, consideraciones: null };
    ficha.problemas.push(actual);
    return actual;
  };

  for (const linea of lineas) {
    if (!linea) continue;

    const apertura = BLOQUES.find(([re]) => re.test(linea));
    if (apertura) {
      bloque = apertura[1];
      // Cada «Tesauro» abre un problema jurídico nuevo; respuesta y
      // consideraciones cuelgan del último abierto (o de uno implícito si la
      // ficha empezó por la respuesta, cosa que no se ha visto pero no cuesta).
      if (bloque === "tesauro") abrirProblema();
      continue;
    }

    if (CIERRES.some((re) => re.test(linea))) {
      bloque = null;
      continue;
    }

    const campo = CAMPOS.find(([re]) => re.test(linea));
    if (campo) {
      bloque = null;
      const valor = linea.match(campo[0])![1]!.trim();
      // Un rótulo repetido (pasa con «Fallo» en fichas con dos problemas) se
      // queda con el primero: es el que corresponde al encabezado.
      if (ficha[campo[1]] === null) ficha[campo[1]] = sinHueco(valor);
      continue;
    }

    if (bloque === "legislacion") {
      ficha.legislacion.push(linea);
      continue;
    }
    if (bloque) {
      const p = actual ?? abrirProblema();
      if (bloque === "tesauro") {
        if (linea.startsWith("¿") || linea.endsWith("?")) p.pregunta = unir(p.pregunta, linea);
        else p.tesauro.push(linea);
      } else if (bloque === "respuesta") {
        p.respuesta = unir(p.respuesta, linea);
      } else {
        p.consideraciones = unir(p.consideraciones, linea);
      }
    }
  }

  return ficha;
}

function unir(previo: string | null, linea: string): string {
  return previo ? `${previo} ${linea}` : linea;
}

/** Longitud máxima del título derivado: cabe en una línea de card a 15,5px. */
const TITULO_MAX = 110;

/**
 * El título que se enseña en listados y citas.
 *
 * Solo el 3% de las fichas trae «Tema» (13 de 400). Para el resto, el tesauro
 * del primer problema jurídico es lo más parecido a un título que redactó el
 * propio CEDIJ: su ruta temática de lo general a lo concreto («Recurso de
 * Revisión · Retroactividad de la ley penal»). Se salta el primer nivel cuando
 * hay más de dos, porque «Derecho Procesal Laboral» es la rama, no el tema.
 * Último recurso: el tipo de proceso y el expediente — nunca un texto inventado.
 */
export function tituloDeFicha(
  ficha: FichaJurisprudencial,
  respaldo: { expediente: string; proceso: string | null },
): string {
  if (ficha.tema) return recortar(ficha.tema, TITULO_MAX);

  const ruta = ficha.problemas[0]?.tesauro ?? [];
  const relevante = ruta.length > 2 ? ruta.slice(1) : ruta;
  if (relevante.length > 0) return recortar(relevante.join(" · "), TITULO_MAX);

  return [respaldo.proceso, respaldo.expediente].filter(Boolean).join(" · ");
}

function recortar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const corte = texto.lastIndexOf(" ", max - 1);
  return `${texto.slice(0, corte > 40 ? corte : max - 1)}…`;
}

/**
 * Normalización para buscar nombres: sin tildes ni mayúsculas, un solo espacio.
 * El CEDIJ escribe los nombres de forma inconsistente («Henriquez» y
 * «Henríquez» en la misma ficha), así que se normalizan los dos lados: lo que
 * se guarda en `sentencias.partes` y lo que escribe quien busca. El script de
 * carga (`automatizaciones/corpus-csj/partes.mjs`) lleva esta misma función
 * como literal: si cambia aquí, cambia allí.
 */
export function normalizarNombre(texto: string): string {
  return (
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      // La puntuación de las razones sociales («S. de R.L.», «S.A. de C.V.»)
      // se escribe de veinte formas: fuera, y que comparen las letras.
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
  );
}

/**
 * Lo que se indexa para la búsqueda por nombre: recurrente y recurrido,
 * normalizados, en un solo texto. Una parte que no se nombra en esas dos líneas
 * (un testigo, un tercero citado en las consideraciones) NO entra: Monitoreo y
 * Verifica prometen «si aparece como parte», no «si se le menciona».
 */
export function partesIndexables(ficha: FichaJurisprudencial): string | null {
  const partes = [ficha.recurrente, ficha.recurrido].filter(Boolean) as string[];
  if (partes.length === 0) return null;
  // Se normaliza cada parte y DESPUÉS se unen: el separador sobrevive a la
  // limpieza y un nombre no coincide a caballo entre recurrente y recurrido.
  return partes.map(normalizarNombre).join(" · ");
}

/**
 * En qué calidad aparece un nombre: «Recurrente», «Recurrido» o null si no
 * figura como parte (p. ej. solo en las consideraciones).
 */
export function rolDeParte(ficha: FichaJurisprudencial, nombre: string): string | null {
  const n = normalizarNombre(nombre);
  if (!n) return null;
  if (ficha.recurrente && normalizarNombre(ficha.recurrente).includes(n)) return "Recurrente";
  if (ficha.recurrido && normalizarNombre(ficha.recurrido).includes(n)) return "Recurrido";
  return null;
}
