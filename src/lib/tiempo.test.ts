import { describe, expect, it } from "vitest";
import { fechaCorta, fechaLarga, formatearRelativo, grupoRecencia } from "./tiempo";

/** Martes 2 de septiembre de 2026, 11:00 hora local. */
const AHORA = new Date(2026, 8, 2, 11, 0, 0);
const hace = (ms: number) => new Date(AHORA.getTime() - ms).toISOString();
const MIN = 60_000;
const H = 60 * MIN;

describe("formatearRelativo", () => {
  it("minutos y horas mientras sea hoy", () => {
    expect(formatearRelativo(hace(20_000), AHORA)).toBe("hace un momento");
    expect(formatearRelativo(hace(5 * MIN), AHORA)).toBe("hace 5 min");
    expect(formatearRelativo(hace(2 * H), AHORA)).toBe("hace 2 h");
    expect(formatearRelativo(hace(10 * H), AHORA)).toBe("hace 10 h");
  });

  it("«ayer» es el día de calendario anterior, no 24 horas", () => {
    // 11:00 de hoy − 12 h = 23:00 de ayer: no son 24 h, pero ES ayer.
    expect(formatearRelativo(hace(12 * H), AHORA)).toBe("ayer");
    expect(formatearRelativo(new Date(2026, 8, 1, 23, 59).toISOString(), AHORA)).toBe("ayer");
    expect(formatearRelativo(new Date(2026, 8, 1, 0, 0).toISOString(), AHORA)).toBe("ayer");
  });

  it("días hasta la semana, y después la fecha", () => {
    expect(formatearRelativo(new Date(2026, 8, 0, 9, 0).toISOString(), AHORA)).toBe("hace 2 días");
    expect(formatearRelativo(new Date(2026, 7, 27, 9, 0).toISOString(), AHORA)).toBe("hace 6 días");
    expect(formatearRelativo(new Date(2026, 7, 26, 9, 0).toISOString(), AHORA)).toBe("26 ago");
    expect(formatearRelativo(new Date(2026, 7, 21, 10, 0).toISOString(), AHORA)).toBe("21 ago");
    expect(formatearRelativo(new Date(2025, 11, 3, 10, 0).toISOString(), AHORA)).toBe("3 dic 2025");
  });

  it("un dato futuro (reloj adelantado) no dice «hace -3 min»", () => {
    expect(formatearRelativo(hace(-3 * MIN), AHORA)).toBe("hace un momento");
  });

  it("una fecha inválida no revienta la pantalla", () => {
    expect(formatearRelativo("reciente", AHORA)).toBe("");
  });
});

describe("grupoRecencia", () => {
  it("agrupa por día de calendario", () => {
    expect(grupoRecencia(hace(2 * H), AHORA)).toBe("hoy");
    expect(grupoRecencia(hace(12 * H), AHORA)).toBe("ayer");
    expect(grupoRecencia(new Date(2026, 8, 0, 9, 0).toISOString(), AHORA)).toBe("anteriores");
    expect(grupoRecencia(hace(-3 * MIN), AHORA)).toBe("hoy");
  });
});

describe("fechas legibles", () => {
  it("corta omite el año en curso y larga lleva la hora", () => {
    const iso = new Date(2026, 7, 21, 9, 5).toISOString();
    expect(fechaCorta(iso, AHORA)).toBe("21 ago");
    expect(fechaLarga(iso)).toBe("21 ago 2026, 09:05");
  });
});
