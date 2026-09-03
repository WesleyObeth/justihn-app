import { describe, expect, it } from "vitest";
import { pareceNumeroArticulo, parrafosDe, parsearArticulo } from "./articulo";
import { filaAArticulo } from "./legislacion";
import {
  ALIAS_CODIGO,
  ARTICULOS_SIN_TEXTO,
  CODIGOS,
  CODIGOS_CARGADOS,
  getCodigo,
  getTema,
  TEMAS_LEGISLACION,
} from "@/data/legislacion";
import { isFuenteOficial } from "@/lib/security/sanitize";

/**
 * Textos tal como los devuelve la tabla `articulos` (2026-09-03). El CPC
 * trae rúbrica en mayúsculas, a veces con guion, con la nota al pie pegada
 * o con espacio antes del punto; Trabajo y Familia no traen rúbrica.
 */
const CPC_399 =
  "Artículo 399. - ÁMBITO DEL PROCESO ORDINARIO. 1. Se conocerán y se decidirán por los trámites del proceso ordinario, cualquiera que sea su cuantía, las demandas relativas a las siguientes materias: a) Tutela de derechos fundamentales.";
const CPC_400 =
  "Artículo 400. - ÁMBITO DEL PROCESO ABREVIADO.1\n\n1 Artículo 400.- Reformado por Decreto No.21 -2015.\n\n1. Se decidirá por los trámites del proceso abreviado.";
const CPC_676 =
  "Artículo 676. OBJETO . El proceso monitorio será el adecuado para la interposición de pretensiones cuyo fin sea únicamente el pago de una deuda de dinero.";
const CPC_657 = "Artículo 657. EJECUCIÓN FORZOSA DE LOS PRONUNCIAMIENTOS SOBRE MEDIDAS: Cuando proceda.";
const TRABAJO_120 =
  "Artículo 120. Si el contrato de trabajo por tiempo indeterminado concluye por razón de despido injustificado, el patrono deberá pagarle a éste un auxilio de cesantía.";
const TRABAJO_120A =
  "Artículo 120-A. Las microempresas definidas como toda unidad económica con un máximo de diez (10) empleados remunerados.";
const FAMILIA_24 =
  "Artículo 24. Las personas civilmente capaces que pretenden contraer matrimonio, lo manifestarán verbalmente o por escrito.";

describe("parsearArticulo — número, rúbrica y cuerpo", () => {
  it("separa la rúbrica del CPC y la deja en frase, con o sin guion", () => {
    expect(parsearArticulo(CPC_399)).toMatchObject({
      numero: "399",
      rubrica: "Ámbito del proceso ordinario",
    });
    expect(parsearArticulo(CPC_399).cuerpo.startsWith("1. Se conocerán")).toBe(true);
    expect(parsearArticulo(CPC_676)).toMatchObject({ numero: "676", rubrica: "Objeto" });
    expect(parsearArticulo(CPC_676).cuerpo.startsWith("El proceso monitorio")).toBe(true);
    expect(parsearArticulo(CPC_657).rubrica).toBe(
      "Ejecución forzosa de los pronunciamientos sobre medidas",
    );
  });

  it("la nota al pie pegada a la rúbrica no se cuela en ella", () => {
    const a = parsearArticulo(CPC_400);
    expect(a.rubrica).toBe("Ámbito del proceso abreviado");
    // La nota sigue en el cuerpo: es texto del documento oficial.
    expect(a.cuerpo).toContain("Reformado por Decreto");
  });

  /**
   * «Artículo 24. Las personas civilmente capaces…» empieza con mayúscula
   * pero NO es rúbrica: si el parser la tomara como tal, el cuerpo perdería su
   * primera frase.
   */
  it("un artículo sin rúbrica conserva el cuerpo entero", () => {
    expect(parsearArticulo(FAMILIA_24)).toMatchObject({ numero: "24", rubrica: null });
    expect(parsearArticulo(FAMILIA_24).cuerpo.startsWith("Las personas civilmente")).toBe(true);
    expect(parsearArticulo(TRABAJO_120).cuerpo.startsWith("Si el contrato")).toBe(true);
  });

  it("entiende los números con letra (120-A)", () => {
    expect(parsearArticulo(TRABAJO_120A).numero).toBe("120-A");
  });

  it("parte el cuerpo en párrafos por línea vacía", () => {
    // La nota al pie y el texto reformado: dos párrafos del documento oficial.
    expect(parrafosDe(parsearArticulo(CPC_400).cuerpo)).toHaveLength(2);
  });
});

describe("pareceNumeroArticulo — lo que un abogado teclea", () => {
  it("acepta el número solo, con «art» y con letra", () => {
    expect(pareceNumeroArticulo("120")).toBe("120");
    expect(pareceNumeroArticulo("art 120")).toBe("120");
    expect(pareceNumeroArticulo("Artículo 120-a")).toBe("120-A");
    expect(pareceNumeroArticulo("Art. 676.")).toBe("676");
  });

  it("no toma por número una búsqueda de palabras", () => {
    expect(pareceNumeroArticulo("cesantía")).toBeNull();
    expect(pareceNumeroArticulo("120 días")).toBeNull();
    expect(pareceNumeroArticulo("")).toBeNull();
  });
});

describe("filaAArticulo — la fila real sobre el contrato de la UI", () => {
  const fila = {
    id: 1671,
    codigo_id: "codigo-trabajo",
    numero: "120",
    orden: 120,
    pagina: 48,
    texto: TRABAJO_120,
    codigos: {
      nombre: "Código del Trabajo",
      fuente_url: "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20del%20Trabajo%20(mayo%202018).pdf",
    },
  };

  it("la cita abre el PDF oficial en su página", () => {
    const a = filaAArticulo(fila);
    expect(a.fuenteUrl.endsWith("#page=48")).toBe(true);
    expect(isFuenteOficial(a.fuenteUrl.split("#")[0]!)).toBe(true);
    expect(a.codigoNombre).toBe("Código del Trabajo");
  });

  it("sin página, la cita abre el PDF sin ancla en vez de una página falsa", () => {
    expect(filaAArticulo({ ...fila, pagina: null }).fuenteUrl).not.toContain("#page");
  });
});

describe("el catálogo de códigos como contrato de la tabla `codigos`", () => {
  /**
   * Los ids de los cargados son los del pipeline de ingesta
   * (`automatizaciones/legislacion/articulos.mjs`). El seed viejo decía «cpc»
   * y la pantalla habría preguntado por un código inexistente.
   */
  it("los cargados son exactamente los tres códigos ingeridos", () => {
    expect(CODIGOS_CARGADOS.map((c) => c.id).sort()).toEqual([
      "codigo-familia",
      "codigo-procesal-civil",
      "codigo-trabajo",
    ]);
  });

  it("todo código cargado tiene su PDF oficial en la whitelist §3.3", () => {
    for (const c of CODIGOS_CARGADOS) {
      expect(c.fuenteUrl, c.id).toBeTruthy();
      expect(isFuenteOficial(c.fuenteUrl), c.id).toBe(true);
    }
  });

  it("todo código en preparación dice por qué no está (§4.5)", () => {
    for (const c of CODIGOS.filter((x) => x.estado === "preparacion")) {
      expect(c.motivoPendiente, c.id).toBeTruthy();
      expect(c.fuenteUrl, c.id).toBeUndefined();
      expect(c.destacados, c.id).toHaveLength(0);
    }
  });

  it("los destacados son artículos únicos con número real, no rangos", () => {
    for (const c of CODIGOS) {
      const numeros = c.destacados.map((d) => d.numero);
      expect(new Set(numeros).size, c.id).toBe(numeros.length);
      for (const n of numeros) expect(n, `${c.id} ${n}`).toMatch(/^\d{1,4}(-[A-Z])?$/);
    }
  });

  it("los alias viejos resuelven al id de la tabla", () => {
    expect(getCodigo("cpc")?.id).toBe("codigo-procesal-civil");
    expect(Object.values(ALIAS_CODIGO).every((id) => CODIGOS.some((c) => c.id === id))).toBe(true);
    expect(getCodigo("no-existe")).toBeUndefined();
  });

  it("los artículos sin texto pertenecen a códigos cargados y no son destacados", () => {
    for (const [codigoId, numeros] of Object.entries(ARTICULOS_SIN_TEXTO)) {
      const c = getCodigo(codigoId);
      expect(c?.estado, codigoId).toBe("cargado");
      for (const n of numeros) {
        expect(c!.destacados.some((d) => d.numero === n), `${codigoId} ${n}`).toBe(false);
      }
    }
  });
});

describe("los temas — la entrada por situación (vista Temas)", () => {
  it("cada tema apunta a códigos cargados y a números reales, sin repetir", () => {
    for (const t of TEMAS_LEGISLACION) {
      expect(t.articulos.length, t.id).toBeGreaterThan(0);
      const claves = t.articulos.map((a) => `${a.codigoId}/${a.numero}`);
      expect(new Set(claves).size, t.id).toBe(claves.length);
      for (const a of t.articulos) {
        expect(getCodigo(a.codigoId)?.estado, `${t.id} ${a.codigoId}`).toBe("cargado");
        expect(a.numero, `${t.id} ${a.numero}`).toMatch(/^\d{1,4}(-[A-Z])?$/);
        expect(ARTICULOS_SIN_TEXTO[a.codigoId] ?? [], `${t.id} ${a.numero}`).not.toContain(a.numero);
      }
    }
  });

  it("ids únicos, herramienta dentro del portal y detalle escrito", () => {
    expect(new Set(TEMAS_LEGISLACION.map((t) => t.id)).size).toBe(TEMAS_LEGISLACION.length);
    for (const t of TEMAS_LEGISLACION) {
      expect(t.herramienta.href, t.id).toMatch(/^\/abogados\//);
      expect(t.detalle.length, t.id).toBeGreaterThan(20);
    }
    expect(getTema("despido")?.titulo).toBe("Despido y prestaciones");
    expect(getTema("no-existe")).toBeUndefined();
  });
});
