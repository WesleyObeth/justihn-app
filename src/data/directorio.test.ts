import { describe, expect, it } from "vitest";
import { ciudadesDelDirectorio, DIRECTORIO, filtrarDirectorio } from "./directorio";

/**
 * El filtro del directorio combina materia, ciudad, texto y notarios, y ordena
 * Premium primero. Vive en `data/` y no en la pantalla porque ese orden es una
 * regla de negocio: en la UI, otra superficie podría ordenarlo distinto.
 */
describe("filtrarDirectorio", () => {
  it("sin filtros devuelve el directorio entero", () => {
    expect(filtrarDirectorio({})).toHaveLength(DIRECTORIO.length);
  });

  it("filtra por materia", () => {
    for (const a of filtrarDirectorio({ materia: "Consumidor" })) {
      expect(a.materias).toContain("Consumidor");
    }
    expect(filtrarDirectorio({ materia: "Consumidor" }).length).toBeGreaterThan(0);
  });

  it("filtra por ciudad, y solo ofrece ciudades que existen", () => {
    for (const c of ciudadesDelDirectorio()) {
      const encontrados = filtrarDirectorio({ ciudad: c });
      expect(encontrados.length, c).toBeGreaterThan(0);
      for (const a of encontrados) expect(a.ciudad).toBe(c);
    }
  });

  it("el texto busca por nombre, ciudad, bio y materias — sin tildes", () => {
    expect(filtrarDirectorio({ q: "consumidor" }).length).toBeGreaterThan(0);
    expect(filtrarDirectorio({ q: "NUNEZ" }).map((a) => a.id)).toContain("gabriela-nunez");
    expect(filtrarDirectorio({ q: "núñez" }).map((a) => a.id)).toContain("gabriela-nunez");
  });

  it("combina los filtros en vez de aplicar solo el último", () => {
    const soloMateria = filtrarDirectorio({ materia: "Civil" });
    const conCiudad = filtrarDirectorio({ materia: "Civil", ciudad: "La Ceiba" });
    expect(conCiudad.length).toBeLessThanOrEqual(soloMateria.length);
    for (const a of conCiudad) {
      expect(a.materias).toContain("Civil");
      expect(a.ciudad).toBe("La Ceiba");
    }
  });

  it("solo notarios devuelve únicamente perfiles con habilitación", () => {
    const notarios = filtrarDirectorio({ soloNotarios: true });
    expect(notarios.length).toBeGreaterThan(0);
    for (const a of notarios) expect(a.notario, a.nombre).toBeTruthy();
  });

  it("una combinación imposible devuelve vacío, no el directorio entero", () => {
    expect(filtrarDirectorio({ q: "zzzz" })).toEqual([]);
  });

  it("los Premium van primero", () => {
    const orden = filtrarDirectorio({}).map((a) => a.premium);
    const primerNoPremium = orden.indexOf(false);
    if (primerNoPremium >= 0) {
      expect(orden.slice(primerNoPremium).every((p) => !p)).toBe(true);
    }
  });
});
