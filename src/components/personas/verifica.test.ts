import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buscarApariciones } from "@/data/monitoreo";
import { SENTENCIAS } from "@/data/sentencias";

const RUTA = join(process.cwd(), "src/components/personas/verifica-persona.tsx");
const FUENTE = readFileSync(RUTA, "utf8");

/**
 * Sin comentarios: varios explican precisamente las reglas que se comprueban
 * (por qué NO hay semáforo, por ejemplo) y darían falsos positivos.
 */
const CODIGO = FUENTE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/**
 * §5 del CLAUDE.md del producto fija tres reglas para el Informe Verifica, y no
 * son copy decorativo: la pantalla decide a quién contrata o a quién le compra
 * una persona. Se comprueban sobre la fuente porque son texto en la UI, no
 * lógica — y un `git revert` descuidado las borraría sin que nada fallara.
 */
describe("Informe Verifica — las reglas de §5 siguen cableadas", () => {
  it("los usos prohibidos se ven ANTES de buscar, no en unos términos", () => {
    expect(FUENTE).toContain("Para verificar, no para perseguir");
    expect(FUENTE).toMatch(/acosar/);
    // El aviso se renderiza antes del formulario.
    expect(FUENTE.indexOf("<UsosProhibidos />")).toBeLessThan(FUENTE.indexOf("Nombre de la persona"));
  });

  it("el disclaimer de homónimos aparece TAMBIÉN sin resultados", () => {
    expect(FUENTE).toContain("Puede no ser la misma persona");
    // "Sin apariciones" se lee como certificado si no se desmiente.
    expect(FUENTE).toContain("Esto no acredita nada");
  });

  it("no hay semáforo de riesgo: no se etiqueta a una persona", () => {
    expect(CODIGO).not.toMatch(/sem[áa]foro/i);
    expect(CODIGO).not.toMatch(/riesgo (alto|medio|bajo)/i);
    expect(CODIGO).not.toMatch(/\bantecedentes penales\b/i);
  });

  it("el informe completo se presenta como pendiente, sin precio inventado", () => {
    expect(FUENTE).toContain("en preparación");
    expect(CODIGO).not.toMatch(/L\s?\d{2,}/); // ningún precio en la pantalla
  });
});

/**
 * El disclaimer pide "abre cada sentencia y contrasta". Si la UI no deja
 * abrirla, el texto exige algo imposible — que es como estaba antes.
 */
describe("cada aparición se puede abrir", () => {
  it("la fila es un control desplegable, no texto muerto", () => {
    expect(FUENTE).toContain('aria-expanded={abierta}');
  });

  it("al abrirla enseña con qué contrastar el homónimo", () => {
    for (const campo of ["s.resumen", "s.ponente", "s.fallo", "s.extracto"]) {
      expect(FUENTE, campo).toContain(campo);
    }
  });

  it("el corpus trae esos cuatro campos en todas las sentencias", () => {
    for (const s of SENTENCIAS) {
      expect(s.resumen.trim().length, s.expediente).toBeGreaterThan(0);
      expect(s.ponente.trim().length, s.expediente).toBeGreaterThan(0);
      expect(s.fallo.trim().length, s.expediente).toBeGreaterThan(0);
      expect(s.extracto.trim().length, s.expediente).toBeGreaterThan(0);
    }
  });
});

describe("el motor de búsqueda es el real", () => {
  it("encuentra una parte que sí está en el corpus", () => {
    expect(buscarApariciones("Estado de Honduras").length).toBeGreaterThan(0);
  });

  it("un nombre inexistente devuelve vacío, no resultados de relleno", () => {
    expect(buscarApariciones("Fulanito Inexistente Perez")).toEqual([]);
  });

  it("no busca con menos de 4 caracteres: evita barridos por iniciales", () => {
    expect(buscarApariciones("Ana")).toEqual([]);
    expect(buscarApariciones("")).toEqual([]);
  });
});
