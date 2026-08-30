import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * El botón magnético escribe `transform` sobre el elemento con GSAP. Si ese
 * elemento YA tiene un `:hover` que usa transform —la card glass de la landing
 * sube 2px— las dos animaciones pelean por la misma propiedad y una se pierde
 * en silencio: no hay error, simplemente el efecto deja de verse.
 *
 * Es exactamente el tipo de fallo que no se nota leyendo el código ni en una
 * captura, así que se topa aquí.
 */

const SRC = join(process.cwd(), "src");

function tsx(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const ruta = join(dir, e);
    if (statSync(ruta).isDirectory()) return tsx(ruta);
    return e.endsWith(".tsx") ? [ruta] : [];
  });
}

/** Clases con transform propio en `:hover` — no pueden ser magnéticas. */
const CON_TRANSFORM_PROPIO = ["glass-card", "btn-celeste"];

describe("botón magnético", () => {
  const archivos = tsx(SRC).map((f) => [f, readFileSync(f, "utf8")] as const);

  it("hay elementos marcados como magnéticos", () => {
    const usos = archivos.filter(([, src]) => /className="[^"]*\bmagnetic\b/.test(src));
    expect(usos.length).toBeGreaterThan(0);
  });

  it("ninguno comparte elemento con una clase que ya anime transform", () => {
    const choques: string[] = [];
    for (const [f, src] of archivos) {
      for (const cls of src.match(/className="[^"]*"/g) ?? []) {
        if (!/\bmagnetic\b/.test(cls)) continue;
        for (const conflictiva of CON_TRANSFORM_PROPIO) {
          if (new RegExp(`\\b${conflictiva}\\b`).test(cls)) {
            choques.push(`${f.replace(SRC, "")}: ${cls}`);
          }
        }
      }
    }
    expect(choques).toEqual([]);
  });

  it("el efecto se apaga con reduced-motion y sin puntero fino", () => {
    const src = readFileSync(join(SRC, "components", "landing", "magnetico.tsx"), "utf8");
    expect(src).toMatch(/\(hover: hover\) and \(pointer: fine\)/);
    expect(src).toMatch(/prefers-reduced-motion: reduce/);
  });
});
