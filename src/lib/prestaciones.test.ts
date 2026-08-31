import { describe, expect, it } from "vitest";
import { aMeses, calcularPrestaciones } from "./prestaciones";

const monto = (r: ReturnType<typeof calcularPrestaciones>, clave: string) =>
  r.conceptos.find((c) => c.clave === clave)!.monto;

/**
 * La escalera está verificada contra el PDF del Código del Trabajo (CEDIJ) el
 * 2026-08-31. Estos tests fijan cada tramo: antes el cálculo era `salario ×
 * años` para la cesantía y "1 mes / 2 meses" para el preaviso, y contradecía a
 * la guía de despido del propio producto (deuda §8).
 */
describe("cesantía — art. 120", () => {
  const S = 15000;
  const dia = S / 30;

  it("menos de 3 meses: no hay auxilio", () => {
    expect(monto(calcularPrestaciones(S, 2), "cesantia")).toBe(0);
  });

  it("de 3 a 6 meses: 10 días de salario", () => {
    expect(monto(calcularPrestaciones(S, 3), "cesantia")).toBeCloseTo(dia * 10, 6);
    expect(monto(calcularPrestaciones(S, 6), "cesantia")).toBeCloseTo(dia * 10, 6);
  });

  it("más de 6 meses y menos de un año: 20 días", () => {
    expect(monto(calcularPrestaciones(S, 7), "cesantia")).toBeCloseTo(dia * 20, 6);
    expect(monto(calcularPrestaciones(S, 11), "cesantia")).toBeCloseTo(dia * 20, 6);
  });

  it("más de un año: un mes por año, y proporcional en la fracción", () => {
    expect(monto(calcularPrestaciones(S, 12), "cesantia")).toBeCloseTo(S, 6);
    expect(monto(calcularPrestaciones(S, 48), "cesantia")).toBeCloseTo(S * 4, 6);
    // 18 meses = año y medio.
    expect(monto(calcularPrestaciones(S, 18), "cesantia")).toBeCloseTo(S * 1.5, 6);
  });

  it("«en ningún caso podrá exceder del salario de 25 meses»", () => {
    const treinta = calcularPrestaciones(S, 30 * 12);
    expect(monto(treinta, "cesantia")).toBeCloseTo(S * 25, 6);
  });

  it("microempresa: el tope baja a 15 meses (art. 120-A)", () => {
    const r = calcularPrestaciones(S, 30 * 12, { microempresa: true });
    expect(monto(r, "cesantia")).toBeCloseTo(S * 15, 6);
    expect(r.conceptos.find((c) => c.clave === "cesantia")!.articulo).toContain("120-A");
  });
});

describe("preaviso — art. 116", () => {
  const S = 15000;
  const dia = S / 30;

  it("recorre los cinco tramos de la ley", () => {
    expect(monto(calcularPrestaciones(S, 1), "preaviso")).toBeCloseTo(dia, 6); // 24 h
    expect(monto(calcularPrestaciones(S, 4), "preaviso")).toBeCloseTo(dia * 7, 6); // 1 semana
    expect(monto(calcularPrestaciones(S, 8), "preaviso")).toBeCloseTo(dia * 14, 6); // 2 semanas
    expect(monto(calcularPrestaciones(S, 18), "preaviso")).toBeCloseTo(S, 6); // 1 mes
    expect(monto(calcularPrestaciones(S, 36), "preaviso")).toBeCloseTo(S * 2, 6); // 2 meses
  });

  it("el salto de 2 años ocurre DESPUÉS de los 24 meses, no en ellos", () => {
    expect(monto(calcularPrestaciones(S, 24), "preaviso")).toBeCloseTo(S, 6);
    expect(monto(calcularPrestaciones(S, 25), "preaviso")).toBeCloseTo(S * 2, 6);
  });
});

describe("vacaciones — art. 346", () => {
  const S = 15000;
  const dia = S / 30;

  it("nacen al primer año y suben por tramos", () => {
    expect(monto(calcularPrestaciones(S, 11), "vacaciones")).toBe(0);
    expect(monto(calcularPrestaciones(S, 12), "vacaciones")).toBeCloseTo(dia * 10, 6);
    expect(monto(calcularPrestaciones(S, 24), "vacaciones")).toBeCloseTo(dia * 12, 6);
    expect(monto(calcularPrestaciones(S, 36), "vacaciones")).toBeCloseTo(dia * 15, 6);
    expect(monto(calcularPrestaciones(S, 48), "vacaciones")).toBeCloseTo(dia * 20, 6);
    expect(monto(calcularPrestaciones(S, 120), "vacaciones")).toBeCloseTo(dia * 20, 6);
  });
});

/**
 * La promesa del producto es citar la fuente. Un renglón sin artículo no puede
 * colarse en el subtotal que la UI presenta como respaldado por la ley.
 */
describe("qué está respaldado y qué no", () => {
  it("cesantía, preaviso y vacaciones llevan su artículo", () => {
    const r = calcularPrestaciones(15000, 48);
    for (const clave of ["cesantia", "preaviso", "vacaciones"]) {
      const c = r.conceptos.find((x) => x.clave === clave)!;
      expect(c.verificado, clave).toBe(true);
      expect(c.articulo, clave).toMatch(/^art\. \d+/);
    }
  });

  it("los décimos van sin artículo y FUERA del subtotal verificado", () => {
    const r = calcularPrestaciones(15000, 48);
    const d = r.conceptos.find((c) => c.clave === "decimos")!;
    expect(d.verificado).toBe(false);
    expect(d.articulo).toBeUndefined();
    expect(r.totalVerificado).toBeCloseTo(r.total - d.monto, 6);
    expect(r.totalVerificado).toBeLessThan(r.total);
  });

  it("el total verificado es la suma exacta de lo que lleva artículo", () => {
    const r = calcularPrestaciones(15000, 30);
    const suma = r.conceptos.filter((c) => c.verificado).reduce((s, c) => s + c.monto, 0);
    expect(r.totalVerificado).toBeCloseTo(suma, 6);
  });
});

describe("robustez", () => {
  it("nunca devuelve NaN ni negativos ante entrada basura", () => {
    for (const [salario, meses] of [
      [NaN, 36],
      [-500, 48],
      [15000, -2],
      [Infinity, 12],
      [15000, NaN],
    ] as const) {
      const r = calcularPrestaciones(salario, meses);
      expect(Number.isFinite(r.total)).toBe(true);
      expect(r.total).toBeGreaterThanOrEqual(0);
      for (const c of r.conceptos) expect(Number.isFinite(c.monto), c.clave).toBe(true);
    }
  });

  it("aMeses combina años y meses, y no baja de cero", () => {
    expect(aMeses(4, 0)).toBe(48);
    expect(aMeses(1, 6)).toBe(18);
    expect(aMeses(0, 7)).toBe(7);
    expect(aMeses(-3, -2)).toBe(0);
    expect(aMeses(NaN, 5)).toBe(5);
  });
});
