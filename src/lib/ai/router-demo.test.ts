import { describe, expect, it } from "vitest";
import { responderDemo } from "./router-demo";
import { SENTENCIAS } from "@/data/sentencias";

const META = "Usó 1 crédito · quedan 25";

/**
 * El router es determinista por contrato (§0.6): mismo input + mismo turno →
 * misma salida. Sin eso, ni los tests ni el render del servidor son estables.
 */
describe("responderDemo", () => {
  it("es determinista para el mismo turno", () => {
    const a = responderDemo("¿qué plazo aplica?", 3, META);
    const b = responderDemo("¿qué plazo aplica?", 3, META);
    expect(a).toEqual(b);
  });

  it("varía la apertura según el turno, sin azar", () => {
    const t0 = responderDemo("consulta genérica", 0, META);
    const t1 = responderDemo("consulta genérica", 1, META);
    expect(t0.text).not.toBe(t1.text);
    // Y vuelve a la primera variante al ciclar.
    expect(responderDemo("consulta genérica", 2, META).text).toBe(t0.text);
  });

  it("reconoce un expediente real del corpus y adjunta su tarjeta", () => {
    const r = responderDemo("explícame CL-528-24", 0, META);
    expect(r.tarjeta?.expediente).toBe("CL-528-24");
    expect(r.tarjeta?.sentenciaId).toBe(SENTENCIAS[0]!.id);
  });

  it("un expediente inexistente NO devuelve una tarjeta equivocada", () => {
    const r = responderDemo("explícame el CC-9999-99", 0, META);
    expect(r.tarjeta).toBeUndefined();
    expect(r.text).toContain("No encontré");
    expect(r.gratuita).toBe(true);
  });

  it("un expediente CAS-… se trata como caso propio, no como sentencia", () => {
    const r = responderDemo("¿qué incluyo en la contestación del CAS-0178-2026?", 0, META);
    expect(r.tarjeta).toBeUndefined();
    expect(r.text).toContain("casos activos");
  });

  it("no cobra crédito por saludos ni por preguntas sobre capacidades", () => {
    expect(responderDemo("hola", 0, META).gratuita).toBe(true);
    expect(responderDemo("¿qué puedes hacer?", 0, META).gratuita).toBe(true);
  });

  it("cobra crédito por una consulta jurídica real", () => {
    const r = responderDemo("calcula prestaciones por despido", 0, META);
    expect(r.gratuita).toBeUndefined();
    expect(r.meta).toBe(META);
  });

  it("toda respuesta jurídica llega con al menos una cita", () => {
    const consultas = [
      "¿qué dice la ley sobre arrendamiento?",
      "calcula las prestaciones",
      "resume la gaceta de esta semana",
      "consulta sin patrón conocido",
    ];
    for (const consulta of consultas) {
      const r = responderDemo(consulta, 0, META);
      expect(r.citas?.length, `sin citas: "${consulta}"`).toBeGreaterThan(0);
    }
  });

  it("abre el editor cuando se pide redactar un escrito", () => {
    const r = responderDemo("redacta la demanda", 0, META);
    expect(r.escrito?.titulo).toContain("Demanda");
    expect(r.escrito?.cuerpo).toContain("[NOMBRE DEL CLIENTE]");
  });
});
