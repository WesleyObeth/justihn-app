import { describe, expect, it } from "vitest";
import { PLAZOS_CIUDADANO, etiquetaPlazo } from "./plazos";
import { TRAMITES } from "./tramites";
import { calcularVencimientoPorUnidad, diasHasta } from "@/lib/plazos";

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("plazos del ciudadano — el seed no puede alejarse de su guía", () => {
  it("cada plazo apunta a una guía que existe", () => {
    for (const p of PLAZOS_CIUDADANO) {
      expect(TRAMITES.some((t) => t.id === p.tramiteId), `${p.id} → ${p.tramiteId}`).toBe(true);
    }
  });

  /**
   * El invariante que de verdad protege: el número del plazo vive en la prosa
   * de la guía y aquí como dato. Si alguien corrige uno y olvida el otro, esto
   * lo topa — el artículo citado tiene que aparecer en el texto de la guía.
   */
  it("el artículo citado aparece en el texto de su guía", () => {
    for (const p of PLAZOS_CIUDADANO) {
      const guia = TRAMITES.find((t) => t.id === p.tramiteId)!;
      const numero = p.articulo.replace(/[^\d]/g, "");
      expect(JSON.stringify(guia).includes(numero), `${p.id}: ${p.articulo} en ${guia.id}`).toBe(
        true,
      );
    }
  });

  it("la guía citada conserva su fuente oficial", () => {
    for (const p of PLAZOS_CIUDADANO) {
      const guia = TRAMITES.find((t) => t.id === p.tramiteId)!;
      expect(guia.fuenteUrl, `${p.id}`).toMatch(/^https:\/\//);
    }
  });

  it("ids únicos y sin campos vacíos", () => {
    const ids = PLAZOS_CIUDADANO.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PLAZOS_CIUDADANO) {
      for (const campo of ["hecho", "detalle", "etiquetaFecha", "articulo", "cuerpoLegal", "advertencia"] as const) {
        expect(p[campo].trim().length, `${p.id}.${campo}`).toBeGreaterThan(0);
      }
      expect(p.cantidad).toBeGreaterThan(0);
    }
  });
});

describe("cálculo por meses y años", () => {
  it("cuenta de fecha a fecha", () => {
    expect(iso(calcularVencimientoPorUnidad("2026-01-15", 2, "meses")!)).toBe("2026-03-15");
    expect(iso(calcularVencimientoPorUnidad("2026-08-31", 1, "anios")!)).toBe("2027-08-31");
  });

  /** Del 31 de enero, dos meses: marzo tiene 31, así que no se recorta. */
  it("no desborda al mes siguiente cuando el día no existe", () => {
    // 31 de enero + 1 mes → febrero no tiene 31: se toma el último día.
    expect(iso(calcularVencimientoPorUnidad("2026-01-31", 1, "meses")!)).toBe("2026-02-28");
    // Año bisiesto.
    expect(iso(calcularVencimientoPorUnidad("2024-01-31", 1, "meses")!)).toBe("2024-02-29");
    // 29 de febrero + 1 año → 2027 no es bisiesto.
    expect(iso(calcularVencimientoPorUnidad("2024-02-29", 1, "anios")!)).toBe("2025-02-28");
  });

  it("delega los plazos por días en el cálculo de siempre", () => {
    // Viernes 2026-08-28 + 3 días hábiles → miércoles 2026-09-02.
    expect(iso(calcularVencimientoPorUnidad("2026-08-28", 3, "dias-habiles")!)).toBe("2026-09-02");
    expect(iso(calcularVencimientoPorUnidad("2026-08-28", 3, "dias-calendario")!)).toBe(
      "2026-08-31",
    );
  });

  it("rechaza entradas inválidas en vez de inventar una fecha", () => {
    expect(calcularVencimientoPorUnidad("no-es-fecha", 2, "meses")).toBeNull();
    expect(calcularVencimientoPorUnidad("2026-01-15", 0, "meses")).toBeNull();
    expect(calcularVencimientoPorUnidad("2026-01-15", 999, "meses")).toBeNull();
  });

  it("diasHasta distingue vencido de vigente", () => {
    expect(diasHasta(new Date("2026-03-15T00:00:00"), new Date("2026-03-10T00:00:00"))).toBe(5);
    expect(diasHasta(new Date("2026-03-01T00:00:00"), new Date("2026-03-10T00:00:00"))).toBe(-9);
    expect(diasHasta(new Date("2026-03-10T00:00:00"), new Date("2026-03-10T00:00:00"))).toBe(0);
  });
});

describe("etiquetaPlazo", () => {
  it("concuerda singular y plural", () => {
    const base = PLAZOS_CIUDADANO[0];
    expect(etiquetaPlazo({ ...base, cantidad: 1, unidad: "meses" })).toBe("1 mes");
    expect(etiquetaPlazo({ ...base, cantidad: 2, unidad: "meses" })).toBe("2 meses");
    expect(etiquetaPlazo({ ...base, cantidad: 1, unidad: "anios" })).toBe("1 año");
    expect(etiquetaPlazo({ ...base, cantidad: 1, unidad: "dias-habiles" })).toBe("1 día hábil");
    expect(etiquetaPlazo({ ...base, cantidad: 10, unidad: "dias-habiles" })).toBe("10 días hábiles");
  });
});
