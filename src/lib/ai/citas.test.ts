import { describe, expect, it } from "vitest";
import { seleccionarCitas, etiquetaDeFuente } from "./citas";
import { renderMarkdownLite } from "./markdown-lite";
import type { FragmentoCorpus } from "./tipos";

const fragmento = (i: number): FragmentoCorpus => ({
  id: `f${i}`,
  tipo: "sentencia",
  titulo: `Fuente ${i}`,
  contenido: "…",
  fuenteUrl: `https://sij.poderjudicial.gob.hn/sentences/${i}`,
  score: 0.6,
});

describe("seleccionarCitas — solo se citan las fuentes usadas", () => {
  const fragmentos = [1, 2, 3, 4, 5].map(fragmento);

  it("filtra los chips a los [n] que el texto referencia, en orden", () => {
    const citas = seleccionarCitas("La cesantía la regula el art. 120 [3]. Ver también [1].", fragmentos);
    expect(citas.map((c) => c.numero)).toEqual([1, 3]);
    expect(citas.map((c) => c.etiqueta)).toEqual(["Fuente 1", "Fuente 3"]);
  });

  it("sin marcadores cae a citar TODO lo recuperado — nunca a citar nada", () => {
    // Esconder el respaldo sería peor que enseñar de más (§4.5 al revés).
    const citas = seleccionarCitas("Respuesta sin marcadores.", fragmentos);
    expect(citas).toHaveLength(5);
    expect(citas[0]!.numero).toBeUndefined();
  });

  it("un [n] fuera de rango no fabrica una cita", () => {
    const citas = seleccionarCitas("Como dice [2], y también [9].", fragmentos);
    expect(citas.map((c) => c.numero)).toEqual([2]);
  });

  it("la etiqueta del prompt no lleva URL — el modelo no debe escribir enlaces", () => {
    expect(etiquetaDeFuente(0, fragmentos[0]!)).toBe("Fuente [1] · Fuente 1");
    expect(etiquetaDeFuente(0, fragmentos[0]!)).not.toContain("https://");
  });
});

describe("renderMarkdownLite — lo que el prompt permite, y nada más", () => {
  it("pinta las negritas del motor", () => {
    expect(renderMarkdownLite("1. **Encabezado**: texto")).toBe("1. <b>Encabezado</b>: texto");
  });

  it("un enlace markdown se reduce a su etiqueta (la URL vive en los chips)", () => {
    const html = renderMarkdownLite("[Código del Trabajo, artículo 120](https://x.pdf#page=48)");
    expect(html).toBe("Código del Trabajo, artículo 120");
    expect(html).not.toContain("https://");
  });

  it("los marcadores [n] se vuelven superíndices discretos", () => {
    expect(renderMarkdownLite("…por año trabajado [3].")).toContain("<sup");
    expect(renderMarkdownLite("…por año trabajado [3].")).toContain("[3]");
  });

  it("escapa HTML ANTES de marcar: un <script> del texto llega inerte", () => {
    const html = renderMarkdownLite('<script>alert("x")</script> **ok**');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<b>ok</b>");
  });

  it("un ** sin cerrar (texto a medio revelar) queda literal, sin romper nada", () => {
    expect(renderMarkdownLite("El plazo es **de un a")).toBe("El plazo es **de un a");
  });

  it("los [corchetes de datos] del demo no se confunden con marcadores de fuente", () => {
    const html = renderMarkdownLite("Presenta el escrito ante [Juzgado competente].");
    expect(html).not.toContain("<sup");
  });
});
