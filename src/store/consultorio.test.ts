import { describe, expect, it, beforeEach } from "vitest";
import { usePortal } from "./portal";
import { ABOGADA_DEMO } from "@/data/catalogo";
import { getFirmante, DIRECTORIO } from "@/data/directorio";

/**
 * El consultorio admite VARIAS respuestas por consulta (decisión Wesley
 * 2026-08-31, patrón Jusbrasil). Lo que se protege aquí es lo que antes fallaba
 * en silencio: con `Record<id, string>`, el segundo abogado en responder
 * borraba al primero — mientras el portal del abogado ya decía "tu respuesta +
 * N de otros abogados".
 */
describe("responderLead — varias respuestas por consulta", () => {
  beforeEach(() => {
    usePortal.setState({ leadsRespondidos: {} });
  });

  it("dos abogados distintos suman, no se pisan", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-1", "Orientación de la primera", ABOGADA_DEMO.id);
    responderLead("lead-1", "Orientación de la segunda", "gabriela-nunez");

    const respuestas = usePortal.getState().leadsRespondidos["lead-1"]!;
    expect(respuestas).toHaveLength(2);
    expect(respuestas.map((r) => r.abogadoId)).toEqual([ABOGADA_DEMO.id, "gabriela-nunez"]);
  });

  it("el mismo abogado reescribe la suya en vez de duplicarla", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-2", "Primer intento", ABOGADA_DEMO.id);
    responderLead("lead-2", "Corregida", ABOGADA_DEMO.id);

    const respuestas = usePortal.getState().leadsRespondidos["lead-2"]!;
    expect(respuestas).toHaveLength(1);
    expect(respuestas[0]!.texto).toBe("Corregida");
  });

  it("conserva el orden en que respondieron", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-3", "a", "carlos-mejia");
    responderLead("lead-3", "b", "roberto-pineda");
    responderLead("lead-3", "c", ABOGADA_DEMO.id);
    expect(usePortal.getState().leadsRespondidos["lead-3"]!.map((r) => r.texto)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("consultas distintas no se mezclan", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-a", "de la A", ABOGADA_DEMO.id);
    responderLead("lead-b", "de la B", ABOGADA_DEMO.id);
    const estado = usePortal.getState().leadsRespondidos;
    expect(estado["lead-a"]![0]!.texto).toBe("de la A");
    expect(estado["lead-b"]![0]!.texto).toBe("de la B");
  });
});

/**
 * Cada respuesta guarda solo el `abogadoId`; la UI resuelve la firma. Si el
 * resolutor fallara, se mostraría una respuesta sin autor en una pantalla que
 * promete abogados colegiados — por eso el detalle no la pinta (§4.5).
 */
describe("getFirmante — quién firma cada respuesta", () => {
  it("resuelve a la abogada suscriptora, con su colegiación", () => {
    const f = getFirmante(ABOGADA_DEMO.id)!;
    expect(f.nombre).toBe(ABOGADA_DEMO.nombre);
    expect(f.colegiacion).toBeTruthy();
  });

  it("resuelve a cualquiera del directorio público", () => {
    for (const a of DIRECTORIO) {
      const f = getFirmante(a.id);
      expect(f?.nombre, a.id).toBe(a.nombre);
      expect(f?.iniciales, a.id).toBeTruthy();
    }
  });

  it("un id desconocido devuelve undefined en vez de inventar un nombre", () => {
    expect(getFirmante("no-existe")).toBeUndefined();
    expect(getFirmante("")).toBeUndefined();
  });
});
