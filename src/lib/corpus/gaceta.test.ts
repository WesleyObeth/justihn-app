import { describe, expect, it } from "vitest";
import { filaAPublicacion, paginaPdf } from "./gaceta";

/** Una fila tal como la devuelve PostgREST con el embed de `gacetas`. */
const FILA = {
  id: 7,
  gaceta_numero: 37235,
  orden: 1,
  seccion: "A" as const,
  emisor: "PODER JUDICIAL",
  titulo: "Auto Acordado Sobre la implementación del Protocolo de Actuación…",
  tipo: "Auto acordado",
  materia: null,
  pagina_inicio: 8,
  pagina_fin: 24,
  extracto: "Poder Judicial AUTO ACORDADO…",
  gacetas: { fecha: "2026-09-01", url_pdf: "https://enag.gob.hn/index.php/gaceta-digital/20260901-37235/viewdocument/4885", paginas_a: 24, slug: "20260901-37235" },
};

describe("filaAPublicacion — la cita abre el PDF en su página", () => {
  it("la Sección A abre en su propia página", () => {
    const p = filaAPublicacion(FILA);
    expect(p.fuenteUrl.endsWith("#page=8")).toBe(true);
    // Honduras separa miles con coma, como la propia Gaceta («No. 37,235»).
    expect(p.gacetaEtiqueta).toBe("37,235");
    expect(p.fechaIso).toBe("2026-09-01");
    expect(p.materia).toBeNull();
  });

  it("la Sección B va detrás de la A: B.1 es la página paginas_a + 1", () => {
    expect(paginaPdf({ seccion: "B", pagina_inicio: 1 }, 24)).toBe(25);
    // Sin saber cuántas páginas tiene la A, no se inventa: se abre la portada.
    expect(paginaPdf({ seccion: "B", pagina_inicio: 1 }, null)).toBeNull();
    expect(filaAPublicacion({ ...FILA, seccion: "B", pagina_inicio: 3, gacetas: { ...FILA.gacetas, paginas_a: null } }).fuenteUrl).not.toContain("#page");
  });
});
