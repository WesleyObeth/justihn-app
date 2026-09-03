import { describe, expect, it } from "vitest";
import { isFuenteOficial } from "@/lib/security/sanitize";
import { ACTOS_NOTARIALES } from "./actos-notariales";

/**
 * Sin fuente no hay texto (§4.5). Un acto notarial o cita el artículo que
 * exige cada documento, o dice que la norma está pendiente de cargar — nunca
 * afirma sin decir de dónde sale.
 */
describe("actos notariales", () => {
  it("cada acto tiene checklist, pasos y una fuente o una pendencia declarada", () => {
    for (const a of ACTOS_NOTARIALES) {
      expect(a.documentos.length, a.id).toBeGreaterThanOrEqual(3);
      expect(a.pasos.length, a.id).toBeGreaterThanOrEqual(2);
      expect(!!a.fuenteUrl || !!a.fuentePendiente, `${a.id} sin fuente ni pendencia`).toBe(true);
      expect(a.documentos.some((d) => d.obligatorio), a.id).toBe(true);
    }
  });

  it("toda fuente enlazada es un host oficial de la whitelist", () => {
    for (const a of ACTOS_NOTARIALES) {
      if (a.fuenteUrl) expect(isFuenteOficial(a.fuenteUrl), a.id).toBe(true);
    }
  });

  it("el matrimonio civil cita el Código de Familia en cada documento obligatorio", () => {
    const m = ACTOS_NOTARIALES.find((a) => a.id === "matrimonio-civil")!;
    expect(m.fuenteUrl).toMatch(/Codigo%20de%20Familia/);
    for (const d of m.documentos.filter((d) => d.obligatorio)) {
      expect(d.fuente, d.titulo).toMatch(/art/);
    }
  });

  it("la auténtica declara que el Código del Notariado está pendiente, en vez de inventar artículos", () => {
    const a = ACTOS_NOTARIALES.find((x) => x.id === "autentica")!;
    expect(a.fuentePendiente).toMatch(/Notariado/);
    expect(a.documentos.every((d) => !d.fuente)).toBe(true);
  });

  it("los ids no chocan con los de las guías de trámites", async () => {
    const { TRAMITES } = await import("./tramites");
    const ids = new Set(TRAMITES.map((t) => t.id));
    for (const a of ACTOS_NOTARIALES) expect(ids.has(a.id), a.id).toBe(false);
  });
});
