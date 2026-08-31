import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(process.cwd(), "src", "components");
const PUBLICO = join(RAIZ, "publico");
const PERSONAS = join(RAIZ, "personas");

/** Tokens y clases que SOLO existen dentro de `landing.css`. */
const SOLO_LANDING = ["var(--turq)", "var(--muted)", "var(--ink)", "var(--line)", "glass-card"];

/** Superficie propia: lo que hace que una card se vea como una card. */
const SUPERFICIE_PROPIA = ["border-borde", "bg-white", "rounded-2xl", "rounded-xl"];

function archivos(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(dir, f));
}

/** Qué componentes de `publico/` importa el portal ciudadano. */
function compartidosConElPortal(): string[] {
  const usados = new Set<string>();
  for (const f of archivos(PERSONAS)) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/@\/components\/publico\/([a-z-]+)/g)) {
      usados.add(join(PUBLICO, `${m[1]}.tsx`));
    }
  }
  return [...usados];
}

/**
 * `landing.css` se importa en los layouts públicos, pero NO en `/personas` ni
 * `/abogados`. Un componente compartido que se apoye solo en sus clases se
 * queda sin estilo dentro del portal, y el fallo es invisible leyendo el
 * código: pasó con la card del abogado —botón blanco sobre blanco y card sin
 * borde, sin radio y sin fondo— y con `var(--turq)` antes.
 */
describe("componentes compartidos con el portal", () => {
  it("hay componentes de publico/ que el portal reutiliza (si no, este test sobra)", () => {
    expect(compartidosConElPortal().length).toBeGreaterThan(0);
  });

  it("ninguno se apoya SOLO en clases de landing.css", () => {
    for (const ruta of compartidosConElPortal()) {
      const src = readFileSync(ruta, "utf8");
      // Quitar comentarios: varios explican precisamente esta trampa.
      const codigo = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      for (const token of SOLO_LANDING) {
        if (!codigo.includes(token)) continue;
        const tieneRespaldo = SUPERFICIE_PROPIA.some((c) => codigo.includes(c));
        expect(
          tieneRespaldo,
          `${ruta.split("/").pop()} usa "${token}", que solo existe en landing.css, y no da superficie propia con tokens del tema`,
        ).toBe(true);
      }
    }
  });

  it("la card del abogado no vuelve a depender de --turq para su color", () => {
    const codigo = readFileSync(join(PUBLICO, "tarjeta-abogado.tsx"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    expect(codigo).not.toContain("var(--turq)");
    expect(codigo).toContain("bg-celeste");
  });
});
