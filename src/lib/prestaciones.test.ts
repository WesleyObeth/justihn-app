import { describe, expect, it } from "vitest";
import { calcularPrestaciones } from "./prestaciones";

describe("calcularPrestaciones", () => {
  it("calcula el caso de referencia del producto (L15,000 · 4 años)", () => {
    const r = calcularPrestaciones(15000, 4);
    expect(r.cesantia).toBe(60000);
    expect(r.preaviso).toBe(30000);
    expect(r.total).toBe(99000);
  });

  it("reduce el preaviso a un salario con menos de 2 años", () => {
    expect(calcularPrestaciones(15000, 1).preaviso).toBe(15000);
    expect(calcularPrestaciones(15000, 2).preaviso).toBe(30000);
  });

  it("aplica el tope de años computables en cesantía", () => {
    const treinta = calcularPrestaciones(10000, 30);
    const veinticinco = calcularPrestaciones(10000, 25);
    expect(treinta.cesantia).toBe(veinticinco.cesantia);
  });

  it("nunca devuelve NaN ni negativos ante entrada basura", () => {
    for (const [salario, anios] of [
      [NaN, 3],
      [-500, 4],
      [15000, -2],
      [Infinity, 1],
    ] as const) {
      const r = calcularPrestaciones(salario, anios);
      expect(Number.isFinite(r.total)).toBe(true);
      expect(r.total).toBeGreaterThanOrEqual(0);
    }
  });
});
