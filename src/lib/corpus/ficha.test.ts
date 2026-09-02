import { describe, expect, it } from "vitest";
import {
  normalizarNombre,
  parsearFicha,
  partesIndexables,
  rolDeParte,
  sinHueco,
  tituloDeFicha,
} from "./ficha";

/**
 * Fichas reales del CEDIJ, recortadas (CL-557-23 y RP-1760-22, capturadas el
 * 2026-09-02). El formato es el que devuelve `getHtml` pasado a texto plano:
 * rótulo + valor en una línea, bloques de varias líneas, y «Sentencia ·
 * @documento» al final en lugar del cuerpo.
 */
const LABORAL = `Centro Electrónico de Documentación e Información Judicial
 FICHA JURISPRUDENCIAL

 Sentencia CL-557-23

 Tema Despido Injustificado Nivelación salarial Reconocimiento de incremento salarial por contrato colectivo
 Tipo de proceso Casación
 Sub tipo de proceso Laboral
 Fecha de resolución 13-01-2026
 Magistrado ponente Roy Pineda Castro
 Materia Derecho Laboral
 Recurrente Alcaldia Municipal De San Pedro Sula
 Recurrido Iris Yasmin Perdomo Sandoval
 Tribunal de procedencia Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés
 Fecha de sentencia recurrida 01-11-2023
 Motivo de la casación Infracción de ley sustantiva laboral Por error de hecho

 Hechos relevantes Segunda instancia confirmó con lugar demanda por emplazamiento.
 Anonimizada No
 Fallo No ha lugar

 Tesauro
 Derecho Procesal Laboral
 Motivos de Casación
 Infracción Indirecta por Error de Hecho en la Apreciación de la Prueba
 ¿Cuales son los requisitos para que en casación se configure la violación de la ley?

 Respuesta al problema jurídico
 a)Existencia de falta o erronea apreciación de la prueba;
 b)La equivocada apreciación debe ser originada por error de hecho.

 Consideraciones de la sala
 ..."Que el cargo que antecede resulta inadmisible"...

 Legislación aplicada Artículo Sub Indice
 Código del Trabajo 769 numeral 5 b)

 Jerarquía Jurisprudencial Reiterativa
 Categoría No Definida
 Novedades No
 Vigencia Jurisprudencial Vigente

 Sentencia

 @documento`;

const CONSTITUCIONAL = `Centro Electrónico de Documentación e Información Judicial
 FICHA JURISPRUDENCIAL
 Sentencia RP-1760-22
 Tipo de proceso Revisión
 Sub tipo de proceso Penal
 Fecha de resolución 19-04-2023
 Magistrado ponente No se indica
 Materia Derecho Constitucional
 Recurrente Manuel De Jesús Barahona Ávila
 Recurrido Tribunal De Sentencia de Tegucigalpa, Francisco Morazán
 Tribunal de procedencia No se indica
 Fecha de sentencia recurrida 19-04-2023
 Hechos relevantes Revisión de sentencia condenatoria.
 Anonimizada No
 Fallo Inadmisibilidad
 Acto recurrido Revisión de sentencia condenatoria en aplicación del Principio de retroactividad

 Tesauro
 Recurso de Revisión
 Retroactividad de la ley penal
 Requisitos de Aplicación del principio Pro Homine
 ¿En relación a inadmisibilidad de recurso de revisión, cual es la finalidad?

 Respuesta al problema jurídico
 Establecimiento de procedimiento transitorio.

 Consideraciones de la sala
 ..."CONSIDERANDO: Que el artículo 96 constitucional establece..."

 Tesauro
 Debido Proceso
 Asistencia legal
 ¿Es exigible la asistencia legal efectiva?

 Respuesta al problema jurídico
 Sí, como garantía mínima.

 Consideraciones de la sala
 ..."la asistencia sea adecuada y efectiva"...

 Legislación aplicada Artículo Sub Indice
 Constitución de la República 96
 Ley Sobre Justicia Constitucional 119

 Jerarquía Jurisprudencial Reiterativa
 Vigencia Jurisprudencial Vigente
 Sentencia
 @documento`;

describe("parsearFicha — los rótulos de una línea", () => {
  const f = parsearFicha(LABORAL);

  it("lee el encabezado completo", () => {
    expect(f.tema).toContain("Despido Injustificado");
    expect(f.tipoProceso).toBe("Casación");
    expect(f.subTipoProceso).toBe("Laboral");
    expect(f.ponente).toBe("Roy Pineda Castro");
    expect(f.recurrente).toBe("Alcaldia Municipal De San Pedro Sula");
    expect(f.recurrido).toBe("Iris Yasmin Perdomo Sandoval");
    expect(f.tribunalProcedencia).toContain("San Pedro Sula");
    expect(f.motivo).toContain("Infracción de ley sustantiva");
    expect(f.hechos).toContain("Segunda instancia");
    expect(f.jerarquia).toBe("Reiterativa");
    expect(f.vigencia).toBe("Vigente");
  });

  /**
   * La columna `fallo` de la tabla dice «Publicada» en toda la muestra: el
   * fallo real solo existe en esta línea. Si el parser la perdiera, la UI
   * enseñaría el estado de publicación como si fuera la decisión.
   */
  it("el fallo real sale de la línea «Fallo», no del estado de publicación", () => {
    expect(f.fallo).toBe("No ha lugar");
    expect(parsearFicha(CONSTITUCIONAL).fallo).toBe("Inadmisibilidad");
  });

  it("«No se indica» es un hueco, no un dato", () => {
    const c = parsearFicha(CONSTITUCIONAL);
    expect(c.ponente).toBeNull();
    expect(c.tribunalProcedencia).toBeNull();
    expect(sinHueco("No indica")).toBeNull();
    expect(sinHueco(" Roy Pineda ")).toBe("Roy Pineda");
    expect(sinHueco("")).toBeNull();
  });

  it("el acto recurrido de los amparos se conserva", () => {
    expect(parsearFicha(CONSTITUCIONAL).actoRecurrido).toContain("retroactividad");
  });
});

describe("parsearFicha — los bloques", () => {
  it("un problema jurídico: tesauro sin la pregunta, respuesta y consideraciones", () => {
    const [p] = parsearFicha(LABORAL).problemas;
    expect(p!.tesauro).toEqual([
      "Derecho Procesal Laboral",
      "Motivos de Casación",
      "Infracción Indirecta por Error de Hecho en la Apreciación de la Prueba",
    ]);
    expect(p!.pregunta).toMatch(/^¿Cuales son los requisitos/);
    expect(p!.respuesta).toContain("a)Existencia de falta");
    expect(p!.respuesta).toContain("b)La equivocada apreciación");
    expect(p!.consideraciones).toContain("resulta inadmisible");
  });

  /**
   * Una ficha trae en promedio 1,5 problemas (594 tesauros en 400 fichas).
   * Colapsarlos en uno mezclaría la respuesta de un problema con las
   * consideraciones de otro.
   */
  it("cada «Tesauro» abre un problema jurídico nuevo", () => {
    const { problemas } = parsearFicha(CONSTITUCIONAL);
    expect(problemas).toHaveLength(2);
    expect(problemas[0]!.tesauro[0]).toBe("Recurso de Revisión");
    expect(problemas[0]!.respuesta).toContain("procedimiento transitorio");
    expect(problemas[1]!.tesauro).toEqual(["Debido Proceso", "Asistencia legal"]);
    expect(problemas[1]!.respuesta).toBe("Sí, como garantía mínima.");
    expect(problemas[1]!.consideraciones).toContain("adecuada y efectiva");
  });

  it("la legislación aplicada es una línea por norma, sin el rótulo", () => {
    expect(parsearFicha(LABORAL).legislacion).toEqual(["Código del Trabajo 769 numeral 5 b)"]);
    expect(parsearFicha(CONSTITUCIONAL).legislacion).toEqual([
      "Constitución de la República 96",
      "Ley Sobre Justicia Constitucional 119",
    ]);
  });

  it("«Sentencia · @documento» no contamina ningún bloque", () => {
    const f = parsearFicha(LABORAL);
    expect(JSON.stringify(f)).not.toContain("@documento");
  });
});

describe("tituloDeFicha", () => {
  const respaldo = { expediente: "RP-1760-22", proceso: "Revisión · Penal" };

  it("con «Tema», el tema manda", () => {
    expect(tituloDeFicha(parsearFicha(LABORAL), respaldo)).toMatch(/^Despido Injustificado/);
  });

  /**
   * El 97% de las fichas no trae «Tema»: el tesauro del primer problema es lo
   * que el CEDIJ redactó como clasificación, y se salta la rama («Derecho
   * Procesal Laboral») cuando la ruta tiene más de dos niveles.
   */
  it("sin «Tema», la ruta del tesauro sin su primer nivel", () => {
    expect(tituloDeFicha(parsearFicha(CONSTITUCIONAL), respaldo)).toBe(
      "Retroactividad de la ley penal · Requisitos de Aplicación del principio Pro Homine",
    );
  });

  it("sin tesauro, el proceso y el expediente — nunca un texto inventado", () => {
    const vacia = parsearFicha("Sentencia X\n Fallo Ha lugar \n Sentencia\n @documento");
    expect(tituloDeFicha(vacia, respaldo)).toBe("Revisión · Penal · RP-1760-22");
  });

  it("recorta títulos largos en un espacio, con puntos suspensivos", () => {
    const largo = parsearFicha(`Tema ${"palabra ".repeat(40)}`);
    const t = tituloDeFicha(largo, respaldo);
    expect(t.length).toBeLessThanOrEqual(111);
    expect(t.endsWith("…")).toBe(true);
    expect(t).not.toMatch(/ …$/);
  });
});

describe("partes y roles", () => {
  it("normaliza tildes, mayúsculas y espacios en los dos lados", () => {
    expect(normalizarNombre("  Wilson  Pablo HENRÍQUEZ ")).toBe("wilson pablo henriquez");
    expect(normalizarNombre("Chiquita Logistic, S. De R.l.")).toBe("chiquita logistic s de r l");
  });

  it("indexa solo recurrente y recurrido, normalizados", () => {
    expect(partesIndexables(parsearFicha(LABORAL))).toBe(
      "alcaldia municipal de san pedro sula · iris yasmin perdomo sandoval",
    );
    expect(partesIndexables(parsearFicha("Fallo Ha lugar"))).toBeNull();
  });

  it("dice en qué calidad aparece un nombre, o null si no es parte", () => {
    const f = parsearFicha(LABORAL);
    expect(rolDeParte(f, "Iris Yasmín Perdomo")).toBe("Recurrido");
    expect(rolDeParte(f, "alcaldía municipal")).toBe("Recurrente");
    expect(rolDeParte(f, "Roy Pineda")).toBeNull();
  });
});
