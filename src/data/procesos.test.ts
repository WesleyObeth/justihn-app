import { describe, expect, it } from "vitest";
import { PROCESOS } from "./procesos";
import { PLANTILLAS } from "./catalogo";
import { getCodigo } from "./legislacion";
import { isFuenteOficial } from "@/lib/security/sanitize";

/**
 * «Sin fuente no hay paso» (regla #1), ahora comprobable: hasta el 2026-09-03
 * los pasos llevaban «art. ___» como marcador. Con los códigos cargados, cada
 * cita tiene que ABRIRSE: un artículo del portal (código cargado y número
 * real) o un PDF de un host oficial de la whitelist §3.3, en su página.
 */
const RUTA_ARTICULO = /^\/abogados\/legislacion\/([a-z-]+)\/(\d{1,4}(?:-[A-Z])?)$/;

describe("Procesos — cada paso cita una fuente abrible", () => {
  it("no queda ningún marcador «___» en el seed", () => {
    expect(JSON.stringify(PROCESOS)).not.toContain("___");
  });

  it("todo paso tiene al menos una cita y toda cita se puede abrir", () => {
    for (const p of PROCESOS) {
      for (const paso of p.pasos) {
        expect(paso.fuentes.length, `${p.id} · ${paso.titulo}`).toBeGreaterThan(0);
        for (const f of paso.fuentes) {
          const interna = f.url.match(RUTA_ARTICULO);
          if (interna) {
            const codigo = getCodigo(interna[1]);
            expect(codigo?.estado, `${p.id} · ${f.etiqueta}`).toBe("cargado");
          } else {
            expect(isFuenteOficial(f.url.split("#")[0]), `${p.id} · ${f.etiqueta} → ${f.url}`).toBe(true);
            // Un PDF de cientos de páginas se abre EN SU PÁGINA, o no se abre.
            if (f.url.endsWith(".pdf") || f.url.includes(".pdf#")) {
              expect(f.url, `${p.id} · ${f.etiqueta}`).toMatch(/#page=\d+$/);
            }
          }
          expect(f.etiqueta.length, f.url).toBeGreaterThan(8);
        }
      }
    }
  });

  it("cada proceso declara sus normas, un resumen y un modelo existente", () => {
    const ids = PROCESOS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PROCESOS) {
      expect(p.resumen.length, p.id).toBeGreaterThan(40);
      expect(p.fuentesOficiales.length, p.id).toBeGreaterThan(0);
      expect(p.pasos.length, p.id).toBeGreaterThanOrEqual(4);
      if (p.plantillaId) {
        expect(PLANTILLAS.some((pl) => pl.id === p.plantillaId), `${p.id} → ${p.plantillaId}`).toBe(true);
      }
    }
  });

  /**
   * El plazo es lo que hace perder un caso sin enterarse: si un paso lo
   * anuncia, tiene que decir de qué artículo sale.
   */
  it("todo plazo nombra su artículo", () => {
    for (const p of PROCESOS) {
      for (const paso of p.pasos) {
        if (paso.plazo) expect(paso.plazo, `${p.id} · ${paso.titulo}`).toMatch(/art\. \d/);
      }
    }
  });
});
