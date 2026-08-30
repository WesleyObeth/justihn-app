import { describe, expect, it } from "vitest";
import { buscarAbogados, buscarNotarios, DIRECTORIO } from "@/data/directorio";
import { RUTAS_TRAMITE, TRAMITES } from "@/data/tramites";
import { isFuenteOficial } from "@/lib/security/sanitize";

/**
 * Invariantes del vertical de trámites. Protegen dos promesas del producto:
 * (1) el sello "Verificado con la fuente oficial" solo se enciende con una
 * fuente real del Estado, y (2) un paso que exige notario resuelve a un
 * notario habilitado, no a un abogado de materia "Notarial".
 */

describe("guías de trámites — sello de fuente oficial", () => {
  it("las 13 guías están verificadas contra una fuente", () => {
    const sinFuente = TRAMITES.filter((t) => !t.fuenteUrl);
    expect(sinFuente.map((t) => t.id)).toEqual([]);
  });

  it("toda fuente citada es un host oficial de la whitelist §3.3", () => {
    const noOficiales = TRAMITES.filter((t) => !isFuenteOficial(t.fuenteUrl));
    expect(noOficiales.map((t) => t.id)).toEqual([]);
  });

  it("una guía con fuente siempre nombra esa fuente", () => {
    for (const t of TRAMITES) {
      if (t.fuenteUrl) expect(t.fuenteNombre, t.id).toBeTruthy();
    }
  });

  it("no quedan marcadores de dato pendiente en tasas ni requisitos", () => {
    for (const t of TRAMITES) {
      expect(t.tasa, t.id).not.toMatch(/L ___|\[Verificar/);
      for (const r of t.requisitos) expect(r, t.id).not.toMatch(/L ___|\[Verificar/);
    }
  });
});

describe("pasos que exigen profesional", () => {
  const conProfesional = TRAMITES.flatMap((t) =>
    t.pasos.filter((p) => p.profesional).map((p) => ({ tramite: t.id, paso: p })),
  );

  it("hay pasos marcados (si esto falla, el funnel guía→lead se apagó)", () => {
    expect(conProfesional.length).toBeGreaterThan(0);
  });

  it("todo paso de notario menciona al notario en su texto", () => {
    // La marca se pone porque la FUENTE lo dice, no por criterio propio:
    // si el texto no habla de notario ni de firmas autenticadas, sobra.
    for (const { tramite, paso } of conProfesional) {
      if (paso.profesional !== "notario") continue;
      expect(`${paso.titulo} ${paso.detalle}`.toLowerCase(), `${tramite} · ${paso.titulo}`).toMatch(
        /notari/,
      );
    }
  });

  it("cada paso de notario tiene a quién enrutar", () => {
    const hayNotarios = buscarNotarios().length > 0;
    const necesitaNotario = conProfesional.some((x) => x.paso.profesional === "notario");
    expect(necesitaNotario && hayNotarios).toBe(true);
  });

  it("cada paso de abogado tiene abogados de la materia de su guía", () => {
    for (const { tramite, paso } of conProfesional) {
      if (paso.profesional !== "abogado") continue;
      const materia = TRAMITES.find((t) => t.id === tramite)!.materia;
      expect(buscarAbogados(materia).length, `${tramite} · ${materia}`).toBeGreaterThan(0);
    }
  });
});

describe("notario ≠ materia (la credencial no se deduce de la especialidad)", () => {
  it("buscarNotarios solo devuelve perfiles con habilitación", () => {
    for (const a of buscarNotarios()) expect(a.notario, a.nombre).toBeTruthy();
  });

  it("tener la materia «Notarial» NO convierte a alguien en notario", () => {
    // Y al revés: hay notarios que no listan «Notarial» entre sus materias.
    const notariosSinLaMateria = buscarNotarios().filter(
      (a) => !a.materias.includes("Notarial"),
    );
    expect(notariosSinLaMateria.length).toBeGreaterThan(0);
  });

  it("ninguna habilitación se declara verificada mientras no haya padrón consultable", () => {
    // El Poder Judicial no publica un padrón notarial: nadie contrastó el
    // exequátur. Poner `verificado: true` sería afirmar sin fuente.
    for (const a of DIRECTORIO) {
      if (a.notario) expect(a.notario.verificado, a.nombre).toBe(false);
    }
  });

  it("toda habilitación declara su exequátur", () => {
    for (const a of DIRECTORIO) {
      if (a.notario) expect(a.notario.exequatur, a.nombre).toMatch(/\S/);
    }
  });
});

/**
 * La home ciudadana muestra los trámites AGRUPADOS EN RUTAS, no como lista
 * plana. Consecuencia: una guía que no esté en ninguna ruta existe en el seed
 * y en su URL, pero **desaparece de la home** — nadie la encuentra navegando.
 * Es invisible leyendo el código y no rompe nada, así que se topa aquí.
 */
describe("rutas de trámites de la home", () => {
  const administrativos = TRAMITES.filter((t) => t.tipo === "tramite");
  const enRutas = RUTAS_TRAMITE.flatMap((r) => r.pasos.map((p) => p.tramiteId));

  it("cada trámite administrativo está en alguna ruta", () => {
    const huerfanos = administrativos.filter((t) => !enRutas.includes(t.id));
    expect(huerfanos.map((t) => t.id)).toEqual([]);
  });

  it("ninguna ruta repite un trámite ni apunta a uno inexistente", () => {
    expect(enRutas.length).toBe(new Set(enRutas).size);
    const inventados = enRutas.filter((id) => !TRAMITES.some((t) => t.id === id));
    expect(inventados).toEqual([]);
  });

  it("las rutas no incluyen procesos judiciales — esos van en su sección", () => {
    const procesos = TRAMITES.filter((t) => t.tipo === "proceso").map((t) => t.id);
    expect(enRutas.filter((id) => procesos.includes(id))).toEqual([]);
  });

  it("toda guía lleva su costo resumido para la fila", () => {
    const sinCorta = TRAMITES.filter((t) => !t.tasaCorta?.trim());
    expect(sinCorta.map((t) => t.id)).toEqual([]);
  });
});
