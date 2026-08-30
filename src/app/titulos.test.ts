import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * El layout raíz define `template: "%s · Justihn"`, así que Next le añade la
 * marca a cada título de página. Si el título de la página TAMBIÉN la nombra,
 * la pestaña acaba diciendo "Justihn — … · Justihn".
 *
 * Es un error invisible leyendo el código —hay que abrir la pestaña para
 * verlo— y ya ocurrió en tres páginas a la vez. Este test lo cierra: nombrar
 * la marca está permitido, pero solo con `title: { absolute: … }`, que es la
 * forma de decirle a Next que no aplique la plantilla.
 */

function paginas(dir: string): string[] {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return paginas(ruta);
    return entrada === "page.tsx" || entrada === "layout.tsx" ? [ruta] : [];
  });
}

const RAIZ = join(process.cwd(), "src", "app");
const LAYOUT_RAIZ = join(RAIZ, "layout.tsx");

describe("títulos de pestaña", () => {
  const archivos = paginas(RAIZ).filter((f) => f !== LAYOUT_RAIZ);

  it("encuentra las páginas de la app", () => {
    expect(archivos.length).toBeGreaterThan(20);
  });

  it("ninguna página nombra la marca sin marcar el título como absoluto", () => {
    const duplicados = archivos.filter((f) => {
      const src = readFileSync(f, "utf8");
      // Se miran solo las líneas de `title:`, no el cuerpo del componente.
      const lineas = src.split("\n").filter((l) => /title:/.test(l));
      return lineas.some((l) => /Justihn/i.test(l) && !/absolute/.test(l));
    });
    expect(duplicados.map((f) => f.replace(RAIZ, ""))).toEqual([]);
  });

  it("el layout raíz sigue aportando la marca con su plantilla", () => {
    const raiz = readFileSync(LAYOUT_RAIZ, "utf8");
    expect(raiz).toMatch(/template:\s*"%s · Justihn"/);
  });
});
