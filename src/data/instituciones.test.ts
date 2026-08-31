import { describe, expect, it } from "vitest";
import {
  buscarInstituciones,
  getInstitucion,
  INSTITUCIONES,
  materiasDeInstitucion,
  TRAMITES,
} from "./tramites";
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

/**
 * La sigla se pinta ENTERA. La card la recortaba con `slice(0, 4)` y convertía
 * «ONCAE» en «ONCA» y «MiAmbiente» en «MiAm» — una sigla a medias no identifica
 * a nadie, y en un catálogo de oficinas del Estado eso es un error de dato.
 */
describe("siglas", () => {
  it("ninguna sigla necesita recorte para leerse", () => {
    for (const i of INSTITUCIONES) {
      expect(i.sigla.length, `${i.id}: "${i.sigla}"`).toBeLessThanOrEqual(12);
      expect(i.sigla.trim(), i.id).toBe(i.sigla);
    }
  });

  it("las siglas no se repiten entre instituciones", () => {
    const siglas = INSTITUCIONES.map((i) => i.sigla.toLowerCase());
    expect(new Set(siglas).size).toBe(siglas.length);
  });
});

describe("buscarInstituciones", () => {
  it("encuentra por sigla, por nombre y por lo que hace", () => {
    expect(buscarInstituciones("SAR").map((i) => i.id)).toContain("sar");
    expect(buscarInstituciones("propiedad").map((i) => i.id)).toContain("ip");
    expect(buscarInstituciones("impuestos").map((i) => i.id)).toContain("sar");
  });

  it("sin término devuelve todas — la pantalla abre con el catálogo completo", () => {
    expect(buscarInstituciones("")).toHaveLength(INSTITUCIONES.length);
    expect(buscarInstituciones("   ")).toHaveLength(INSTITUCIONES.length);
  });

  it("lo inexistente devuelve vacío, no resultados de relleno", () => {
    expect(buscarInstituciones("zzzz")).toEqual([]);
  });
});

describe("materiasDeInstitucion", () => {
  it("sale de sus trámites y no se repite", () => {
    for (const i of INSTITUCIONES) {
      const materias = materiasDeInstitucion(i.id);
      expect(new Set(materias).size, i.id).toBe(materias.length);
      for (const m of materias) {
        expect(
          TRAMITES.some((t) => t.institucionId === i.id && t.materia === m),
          `${i.id} → ${m}`,
        ).toBe(true);
      }
    }
  });
});
