import { describe, expect, it } from "vitest";
import { calcularVencimiento } from "./plazos";

describe("calcularVencimiento", () => {
  // 2026-08-24 es lunes.
  it("cuenta días calendario desde el día siguiente a la notificación", () => {
    const v = calcularVencimiento("2026-08-24", 3, false);
    expect(v?.toISOString().slice(0, 10)).toBe("2026-08-27"); // jueves
  });

  it("salta fines de semana cuando el plazo es en días hábiles", () => {
    // Lunes + 5 hábiles = lunes siguiente (salta sáb/dom).
    const v = calcularVencimiento("2026-08-24", 5, true);
    expect(v?.toISOString().slice(0, 10)).toBe("2026-08-31");
  });

  it("un plazo hábil que arranca en viernes cae en la semana siguiente", () => {
    // Viernes 2026-08-28 + 2 hábiles = martes 2026-09-01.
    const v = calcularVencimiento("2026-08-28", 2, true);
    expect(v?.toISOString().slice(0, 10)).toBe("2026-09-01");
  });

  it("rechaza entradas inválidas en lugar de calcular basura", () => {
    expect(calcularVencimiento("no-es-fecha", 3, true)).toBeNull();
    expect(calcularVencimiento("2026-08-24", 0, true)).toBeNull();
    expect(calcularVencimiento("2026-08-24", -2, false)).toBeNull();
    expect(calcularVencimiento("2026-08-24", 9999, false)).toBeNull();
  });
});
