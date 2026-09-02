import { describe, expect, it } from "vitest";
import { fechaCorta, filaASentencia } from "./sentencias";
import { MATERIAS_CORPUS, materiaDb, TIPOS_PROCESO } from "./catalogo";

/**
 * Una fila tal como la devuelve PostgREST (CL-557-23, 2026-09-02), con las dos
 * columnas que NO dicen lo que su nombre promete: `fallo` = «Publicada» y
 * `organo` = tribunal de procedencia.
 */
const FILA = {
  record_id: 21632,
  expediente: "CL-557-23",
  materia: "Derecho Laboral",
  organo: "Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés",
  magistrado: "Roy Pineda Castro",
  fecha_sentencia: "2026-01-13",
  proceso: "Casación · Laboral",
  resumen_cedij: "Segunda instancia confirmó con lugar demanda por emplazamiento.",
  fuente_url: "https://sij.poderjudicial.gob.hn/sentences/21632",
  texto: `FICHA JURISPRUDENCIAL
 Sentencia CL-557-23
 Tema Despido Injustificado Nivelación salarial
 Tipo de proceso Casación
 Magistrado ponente Roy Pineda Castro
 Recurrente Alcaldia Municipal De San Pedro Sula
 Recurrido Iris Yasmin Perdomo Sandoval
 Tribunal de procedencia Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés
 Hechos relevantes Segunda instancia confirmó con lugar demanda por emplazamiento.
 Fallo No ha lugar
 Tesauro
 Derecho Procesal Laboral
 Motivos de Casación
 Consideraciones de la sala
 ..."Que el cargo que antecede resulta inadmisible"...
 Sentencia
 @documento`,
};

describe("filaASentencia — el contrato del seed sobre la fila real", () => {
  const s = filaASentencia(FILA);

  it("el id es el record_id del CEDIJ y la cita abre el portal, no la API", () => {
    expect(s.id).toBe("21632");
    expect(s.recordId).toBe(21632);
    expect(s.fuenteUrl).toBe("https://sij.poderjudicial.gob.hn/sentences/21632");
    expect(s.fuenteUrl).not.toContain(":5006");
  });

  it("la materia se enseña con la etiqueta corta de la UI", () => {
    expect(s.materia).toBe("Laboral");
  });

  /**
   * `sentencias.fallo` guarda «Publicada» en el 100% de la muestra. Si se
   * enseñara tal cual, la card diría «Fallo: Publicada» en 17.000 sentencias.
   */
  it("el fallo sale de la ficha, nunca del estado de publicación", () => {
    expect(s.fallo).toBe("No ha lugar");
    expect(filaASentencia({ ...FILA, texto: "Sentencia X\n @documento" }).fallo).toBe(
      "No consta en la ficha",
    );
  });

  /**
   * `organo` de la tabla es el tribunal RECURRIDO. En una card, «Corte de
   * Apelaciones del Trabajo · 13 ene 2026» se lee como si esa corte hubiera
   * dictado la casación. Lo cierto de toda fila del corpus: la dictó la CSJ.
   */
  it("el órgano es la CSJ y la procedencia queda en la ficha, con su rótulo", () => {
    expect(s.organo).toBe("Corte Suprema de Justicia");
    expect(s.ficha.tribunalProcedencia).toContain("Corte de Apelaciones del Trabajo");
  });

  it("título del tema, resumen del CEDIJ y ponente de la ficha", () => {
    expect(s.titulo).toBe("Despido Injustificado Nivelación salarial");
    expect(s.resumen).toContain("Segunda instancia");
    expect(s.ponente).toBe("Roy Pineda Castro");
    expect(s.fecha).toBe("13 ene 2026");
    expect(s.fechaIso).toBe("2026-01-13");
  });

  it("sin ponente ni fecha, lo dice en vez de inventar", () => {
    const sin = filaASentencia({
      ...FILA,
      magistrado: "No se indica",
      fecha_sentencia: null,
      texto: "Magistrado ponente No indica\n Fallo Ha lugar",
    });
    expect(sin.ponente).toBe("No consta en la ficha");
    expect(sin.fecha).toBe("sin fecha");
  });
});

describe("catálogos", () => {
  it("cada materia del corpus tiene una etiqueta corta distinta", () => {
    const etiquetas = new Set(MATERIAS_CORPUS.map((m) => m.etiqueta));
    expect(etiquetas.size).toBe(MATERIAS_CORPUS.length);
    expect(materiaDb("Laboral")).toBe("Derecho Laboral");
    expect(materiaDb("Contencioso Adm.")).toBe("Contencioso Administrativo");
    expect(materiaDb("inventada")).toBeNull();
  });

  it("los tipos de proceso son los que el CEDIJ usa en `proceso`", () => {
    for (const t of TIPOS_PROCESO) expect(t.patron.length).toBeGreaterThan(3);
    expect(TIPOS_PROCESO.map((t) => t.id)).toContain("habeas");
  });

  it("fechaCorta no pasa por Date: «2026-01-13» es 13 ene, no 12 en otra zona", () => {
    expect(fechaCorta("2026-01-13")).toBe("13 ene 2026");
    expect(fechaCorta("2025-12-31T00:00:00")).toBe("31 dic 2025");
    expect(fechaCorta(null)).toBe("sin fecha");
  });
});
