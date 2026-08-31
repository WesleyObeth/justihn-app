import { describe, expect, it } from "vitest";
import { getInstitucion, INSTITUCIONES, TRAMITES } from "./tramites";
import { isFuenteOficial } from "@/lib/security/sanitize";

/**
 * Invariantes del catálogo por institución. La pantalla se construye sola a
 * partir del seed, así que lo que se rompe en silencio es la coherencia entre
 * los dos lados: una institución sin trámites saldría como card vacía, y un
 * `institucionId` inventado haría desaparecer la guía del catálogo sin que
 * nada falle.
 */
describe("instituciones", () => {
  it("ids únicos", () => {
    const ids = INSTITUCIONES.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ninguna queda como card vacía: todas tienen al menos un trámite", () => {
    const vacias = INSTITUCIONES.filter(
      (i) => !TRAMITES.some((t) => t.institucionId === i.id),
    ).map((i) => i.id);
    expect(vacias).toEqual([]);
  });

  it("todo trámite apunta a una institución que existe", () => {
    const huerfanos = TRAMITES.filter((t) => !getInstitucion(t.institucionId)).map((t) => t.id);
    expect(huerfanos).toEqual([]);
  });

  /**
   * El campo es opcional a propósito (MiAmbiente no responde, STSS y Registro
   * Mercantil sin verificar). Lo que no se admite es un enlace a un host que no
   * pasó la whitelist §3.3.
   */
  it("el portal oficial, cuando existe, está en la whitelist §3.3", () => {
    const fuera = INSTITUCIONES.filter((i) => i.sitio && !isFuenteOficial(i.sitio)).map(
      (i) => `${i.id} → ${i.sitio}`,
    );
    expect(fuera).toEqual([]);
  });

  it("sigla y descripción no van vacías (la card las muestra)", () => {
    for (const i of INSTITUCIONES) {
      expect(i.sigla.trim().length, i.id).toBeGreaterThan(0);
      expect(i.descripcion.trim().length, i.id).toBeGreaterThan(0);
      expect(i.nombre.trim().length, i.id).toBeGreaterThan(0);
    }
  });
});
