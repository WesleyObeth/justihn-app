import { describe, expect, it } from "vitest";
import { fragmentoDeArticulo } from "./recuperar";

/**
 * La cita de un artículo es lo primero que ve el abogado en una respuesta de
 * legislación: su forma es contrato, no decoración.
 */
describe("fragmentoDeArticulo", () => {
  const fila = {
    articulo_id: 120,
    codigo_id: "codigo-trabajo",
    codigo_nombre: "Código del Trabajo",
    numero: "120",
    fuente_url:
      "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20del%20Trabajo%20(mayo%202018).pdf#page=48",
    texto: "Artículo 120. Si el contrato de trabajo por tiempo indeterminado concluye…",
    similitud: 0.61,
  };

  it("la cita nombra el código y el artículo, no un id interno", () => {
    const f = fragmentoDeArticulo(fila);
    expect(f.titulo).toBe("Código del Trabajo · artículo 120");
    expect(f.tipo).toBe("legislacion");
  });

  it("la URL llega intacta, con la página del PDF incluida", () => {
    // "Toda cita debe poder abrirse" — y abrirse en la página del artículo,
    // no en la portada de un PDF de 300 páginas.
    expect(fragmentoDeArticulo(fila).fuenteUrl).toContain("#page=48");
  });

  it("los sufijos de reforma se conservan (120-A no es 120)", () => {
    const f = fragmentoDeArticulo({ ...fila, numero: "120-A" });
    expect(f.titulo).toContain("artículo 120-A");
  });
});
