import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Invariantes de la vista previa social (lo que se ve al pegar un enlace en
 * WhatsApp). Son cosas que NO se notan leyendo el código ni abriendo la web:
 * solo aparecen al compartir el enlace, y para entonces ya lo vio el socio.
 *
 * 1. Sin `metadataBase` absoluto, Next emite el `og:image` relativo y
 *    WhatsApp no pinta miniatura ninguna — que es exactamente como estaba
 *    este proyecto antes (cero etiquetas Open Graph).
 * 2. Las tarjetas se leen a ~300px de ancho en el chat: un titular largo se
 *    corta o encoge hasta ser ilegible. Se topan aquí.
 * 3. WhatsApp recorta el título de la burbuja alrededor de los 65 caracteres
 *    y la descripción sobre los 160; pasado eso, la frase termina en "…".
 */

const RAIZ = join(process.cwd(), "src", "app");

function archivos(dir: string, nombre: string): string[] {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return archivos(ruta, nombre);
    return entrada === nombre ? [ruta] : [];
  });
}

/** Extrae el valor de una prop de texto de la tarjeta (`titulo="…"`). */
function prop(src: string, nombre: string): string | null {
  return new RegExp(`${nombre}="([^"]+)"`).exec(src)?.[1] ?? null;
}

describe("vista previa social (Open Graph)", () => {
  const tarjetas = archivos(RAIZ, "opengraph-image.tsx");

  it("hay una tarjeta por audiencia: la general, la ciudadana y la de abogados", () => {
    expect(tarjetas.length).toBe(3);
  });

  it("el layout raíz declara un metadataBase absoluto", () => {
    const raiz = readFileSync(join(RAIZ, "layout.tsx"), "utf8");
    expect(raiz).toMatch(/metadataBase:\s*new URL\(/);
    // El origen por defecto tiene que ser https: WhatsApp descarta http.
    expect(raiz).toMatch(/"https:\/\/[^"]+"/);
  });

  it("cada tarjeta declara medidas, tipo y texto alternativo", () => {
    for (const f of tarjetas) {
      const src = readFileSync(f, "utf8");
      expect(src, f).toMatch(/export const size = OG_SIZE/);
      expect(src, f).toMatch(/export const contentType = OG_CONTENT_TYPE/);
      expect(src, f).toMatch(/export const alt = "/);
    }
  });

  it("los titulares se leen en el chat: nada de frases largas", () => {
    for (const f of tarjetas) {
      const titulo = prop(readFileSync(f, "utf8"), "titulo");
      expect(titulo, f).toBeTruthy();
      // 48 caracteres ≈ dos líneas a 62px en un lienzo de 1200.
      expect(titulo!.length, `${f}: "${titulo}"`).toBeLessThanOrEqual(48);
    }
  });

  it("los sellos son tres y cortos — son chips, no frases", () => {
    for (const f of tarjetas) {
      const src = readFileSync(f, "utf8");
      const sellos = /sellos=\{\[([^\]]+)\]\}/
        .exec(src)?.[1]
        ?.match(/"([^"]+)"/g)
        ?.map((s) => s.slice(1, -1));
      expect(sellos, f).toHaveLength(3);
      for (const s of sellos!) expect(s.length, `${f}: "${s}"`).toBeLessThanOrEqual(24);
    }
  });

  it("los títulos y descripciones de las páginas compartibles no se truncan", () => {
    const compartibles = [
      join(RAIZ, "(landing)", "page.tsx"),
      join(RAIZ, "(profesional)", "para-abogados", "page.tsx"),
    ];
    for (const f of compartibles) {
      const src = readFileSync(f, "utf8");
      const titulo = /absolute:\s*"([^"]+)"/.exec(src)?.[1];
      const desc = /description:\s*\n?\s*"([^"]+)"/.exec(src)?.[1];
      expect(titulo, f).toBeTruthy();
      expect(titulo!.length, `${f}: "${titulo}"`).toBeLessThanOrEqual(70);
      expect(desc, f).toBeTruthy();
      expect(desc!.length, `${f}: "${desc}"`).toBeLessThanOrEqual(170);
    }
  });
});
