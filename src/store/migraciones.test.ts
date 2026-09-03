import { describe, expect, it } from "vitest";
import { ABOGADA_DEMO, etiquetaColegiacion } from "@/data/catalogo";
import { DIRECTORIO, getFirmante } from "@/data/directorio";
import { migrarPersistido } from "./portal";

/**
 * El store se persiste desde el primer día: cada cambio de forma tiene que
 * migrar lo que ya vive en navegadores ajenos. Estas pruebas corren las
 * migraciones reales del `persist` sobre un estado con el formato viejo.
 */
const migrar = (estado: unknown, desde: number) =>
  migrarPersistido(estado, desde) as Record<string, unknown>;

describe("v6 — Mis casos y propuestas", () => {
  it("garantiza las dos listas sin tocar lo demás", () => {
    const s = migrar({ plan: "premium", casos: "basura" }, 5);
    expect(s.casos).toEqual([]);
    expect(s.propuestas).toEqual([]);
    expect(s.plan).toBe("premium");
  });
  it("respeta listas que ya existieran", () => {
    const s = migrar({ casos: [{ id: "c1" }], propuestas: [] }, 5);
    expect(s.casos).toEqual([{ id: "c1" }]);
  });
});

describe("v5 — el lead es solo la fila", () => {
  it("quita nuevo/respuestas/respuestaDemo de las preguntas persistidas y pone dueño", () => {
    const s = migrar(
      {
        preguntasPublico: [
          { id: "pub-1", materia: "Laboral", ciudad: "Tela", creadoEn: "2026-09-01T10:00:00-06:00", nuevo: true, respuestas: 0, pregunta: "p" },
        ],
      },
      4,
    );
    const p = (s.preguntasPublico as Record<string, unknown>[])[0]!;
    expect(p).not.toHaveProperty("nuevo");
    expect(p).not.toHaveProperty("respuestas");
    expect(p.personaId).toBe("persona-demo");
    expect(p.pregunta).toBe("p");
  });
});

describe("v4 — «cuando» (texto de pantalla) pasa a «creadoEn» (ISO)", () => {
  it("renombra el campo en respuestas, mensajes y preguntas, y no deja ninguno sin instante", () => {
    const s = migrar(
      {
        leadsRespondidos: { "lead-1": [{ abogadoId: ABOGADA_DEMO.id, texto: "x", cuando: "reciente" }] },
        mensajesAbogado: { "gabriela-nunez": [{ abogadoId: "gabriela-nunez", materia: "Civil", texto: "m", cuando: "reciente" }] },
        preguntasPublico: [{ id: "pub-1", materia: "Laboral", ciudad: "Tela", cuando: "reciente", nuevo: true, respuestas: 0, pregunta: "p" }],
      },
      3,
    );
    const r = (s.leadsRespondidos as Record<string, Record<string, unknown>[]>)["lead-1"]![0]!;
    const m = (s.mensajesAbogado as Record<string, Record<string, unknown>[]>)["gabriela-nunez"]![0]!;
    const p = (s.preguntasPublico as Record<string, unknown>[])[0]!;
    for (const fila of [r, m, p]) {
      expect(fila).not.toHaveProperty("cuando");
      expect(Number.isNaN(new Date(fila.creadoEn as string).getTime())).toBe(false);
    }
    expect(p.pregunta).toBe("p");
  });

  it("respeta un creadoEn que ya existiera", () => {
    const s = migrar(
      { preguntasPublico: [{ id: "pub-1", creadoEn: "2026-08-01T00:00:00Z", cuando: "ayer" }] },
      3,
    );
    expect((s.preguntasPublico as { creadoEn: string }[])[0]!.creadoEn).toBe("2026-08-01T00:00:00Z");
  });
});

describe("v3 — un solo id para la abogada demo", () => {
  const VIEJO = "demo-abogada-castillo";

  it("la ficha pública y el perfil del suscriptor son la misma fila", () => {
    expect(DIRECTORIO[0]!.id).toBe(ABOGADA_DEMO.id);
    expect(ABOGADA_DEMO.id).not.toBe(VIEJO);
    // Y el firmante sigue aportando la colegiación, que el directorio no publica.
    expect(getFirmante(ABOGADA_DEMO.id)?.colegiacion).toBe(etiquetaColegiacion(ABOGADA_DEMO.colegiacionNumero));
  });

  it("renombra el id viejo en las respuestas del consultorio", () => {
    const s = migrar(
      {
        leadsRespondidos: {
          "lead-1": [
            { abogadoId: VIEJO, texto: "mía", creadoEn: "2026-09-01T10:00:00-06:00" },
            { abogadoId: "gabriela-nunez", texto: "de otra", creadoEn: "2026-09-01T10:00:00-06:00" },
          ],
        },
      },
      2,
    );
    const r = (s.leadsRespondidos as Record<string, { abogadoId: string }[]>)["lead-1"]!;
    expect(r.map((x) => x.abogadoId)).toEqual([ABOGADA_DEMO.id, "gabriela-nunez"]);
  });

  it("funde los mensajes guardados bajo el id viejo con los del nuevo, sin perder ninguno", () => {
    const s = migrar(
      {
        mensajesAbogado: {
          [VIEJO]: [{ abogadoId: VIEJO, materia: "Laboral", texto: "viejo", creadoEn: "2026-09-01T10:00:00-06:00" }],
          [ABOGADA_DEMO.id]: [
            { abogadoId: ABOGADA_DEMO.id, materia: "Civil", texto: "nuevo", creadoEn: "2026-09-01T10:00:00-06:00" },
          ],
        },
      },
      2,
    );
    const m = s.mensajesAbogado as Record<string, { abogadoId: string; texto: string }[]>;
    expect(m[VIEJO]).toBeUndefined();
    expect(m[ABOGADA_DEMO.id]!.map((x) => x.texto)).toEqual(["nuevo", "viejo"]);
    expect(m[ABOGADA_DEMO.id]!.every((x) => x.abogadoId === ABOGADA_DEMO.id)).toBe(true);
  });

  it("un estado ya migrado pasa intacto (salvo las listas que v6 garantiza)", () => {
    const entrada = { leadsRespondidos: {}, mensajesAbogado: {}, plan: "premium" };
    expect(migrar(structuredClone(entrada), 3)).toEqual({ ...entrada, casos: [], propuestas: [] });
  });
});
