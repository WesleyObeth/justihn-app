import type { Codigo } from "@/types/dominio";

/**
 * Seed de legislación consolidada — la promesa "legislación ilimitada" del
 * plan Base.
 *
 * La muestra del CPC es REAL: artículos verificados contra el PDF oficial del
 * PJ (`poderjudicial.gob.hn/Cedij/Cdigos/Codigo Procesal Civil (2018).pdf`)
 * durante el PoC del proceso monitorio (justihn/CLAUDE.md §4, 2026-08-24).
 * Las síntesis son redacción propia — el texto íntegro de cada artículo llega
 * con la carga del corpus; por eso cada card enlaza el PDF oficial.
 *
 * TODO(data): tablas `codigos` + `articulos_codigo`, alimentadas por el
 * scraper de `legislacion.poderjudicial.gob.hn` (PDFs en `Anexos/{GUID}…`,
 * fuente verde verificada 2026-08-22 — backlog #3/#5 del proyecto).
 */
const CPC_PDF =
  "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20Procesal%20Civil%20(2018).pdf";

export const CODIGOS: Codigo[] = [
  {
    id: "cpc",
    nombre: "Código Procesal Civil",
    decreto: "Decreto 211-2006 (con reformas, ed. oficial 2018)",
    materia: "Civil",
    estado: "muestra",
    fuenteUrl: CPC_PDF,
    descripcion:
      "Muestra verificada: los artículos de cuantía, vía declarativa y proceso monitorio, cotejados contra el PDF oficial del Poder Judicial.",
    articulos: [
      {
        numero: "399",
        titulo: "Ámbito del proceso abreviado",
        sintesis:
          "Se tramitan por el proceso abreviado los asuntos cuya cuantía no excede de L 100,000, además de las materias que el Código señala expresamente.",
        nota: "Tope vigente por reforma del Decreto 21-2015.",
        herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
      },
      {
        numero: "400",
        titulo: "Ámbito del proceso ordinario",
        sintesis:
          "Las demandas cuya cuantía supera el tope del abreviado — y las que no tienen cuantía determinada — se deciden en proceso ordinario.",
      },
      {
        numero: "676",
        titulo: "Procedencia del proceso monitorio",
        sintesis:
          "Puede acudir al monitorio quien reclame una deuda de dinero líquida, vencida y exigible que no exceda de L 200,000.",
        nota: "Bajo L 5,000 el régimen del monitorio no exige profesional del derecho.",
        herramienta: { etiqueta: "Calcular la vía por cuantía", href: "/abogados/calculadoras" },
      },
      {
        numero: "677",
        titulo: "Documentos que acreditan la deuda",
        sintesis:
          "La deuda puede acreditarse con documentos firmados por el deudor, facturas, certificaciones y demás soportes con los que habitualmente se documentan créditos.",
      },
      {
        numero: "680–685",
        titulo: "Trámite del monitorio",
        sintesis:
          "Admitida la petición, el juzgado requiere de pago al deudor, que cuenta con 20 días para pagar u oponerse. Sin oposición, se despacha la ejecución; con oposición, el asunto sigue por la vía declarativa que corresponda.",
        nota: "Requerimiento de pago: 20 días.",
      },
      {
        numero: "782–783",
        titulo: "Ejecución de títulos extrajudiciales",
        sintesis:
          "Enumeran los títulos que traen aparejada ejecución sin proceso declarativo previo (escrituras públicas y demás títulos que el Código reconoce) y sus requisitos.",
      },
    ],
  },
  {
    id: "codigo-trabajo",
    nombre: "Código del Trabajo",
    decreto: "Decreto 189-1959",
    materia: "Laboral",
    estado: "preparacion",
    descripcion:
      "Prestaciones, preaviso, cesantía y jornada — el sustento de la calculadora laboral y de los procesos de despido.",
    articulos: [],
  },
  {
    id: "codigo-familia",
    nombre: "Código de Familia",
    decreto: "Decreto 76-84",
    materia: "Familia",
    estado: "preparacion",
    descripcion: "Divorcio, alimentos, guarda y patria potestad — la base del paso a paso de familia.",
    articulos: [],
  },
  {
    id: "codigo-civil",
    nombre: "Código Civil",
    decreto: "1906 (con reformas)",
    materia: "Civil",
    estado: "preparacion",
    descripcion: "Obligaciones, contratos, bienes y sucesiones.",
    articulos: [],
  },
  {
    id: "ley-justicia-constitucional",
    nombre: "Ley sobre Justicia Constitucional",
    decreto: "Decreto 244-2003",
    materia: "Constitucional",
    estado: "preparacion",
    descripcion: "Amparo, habeas corpus, habeas data e inconstitucionalidad.",
    articulos: [],
  },
];

export function getCodigo(id: string): Codigo | undefined {
  return CODIGOS.find((c) => c.id === id);
}
