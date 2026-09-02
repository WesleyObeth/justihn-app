import { describe, expect, it } from "vitest";
import { ABOGADA_DEMO } from "@/data/catalogo";
import { DIRECTORIO, getFirmante } from "@/data/directorio";
import { migrarPersistido } from "./portal";

/**
 * El store se persiste desde el primer día: cada cambio de forma tiene que
 * migrar lo que ya vive en navegadores ajenos. Estas pruebas corren las
 * migraciones reales del `persist` sobre un estado con el formato viejo.
 */
const migrar = (estado: unknown, desde: number) =>
  migrarPersistido(estado, desde) as Record<string, unknown>;

describe("v3 — un solo id para la abogada demo", () => {
  const VIEJO = "demo-abogada-castillo";

  it("la ficha pública y el perfil del suscriptor son la misma fila", () => {
    expect(DIRECTORIO[0]!.id).toBe(ABOGADA_DEMO.id);
    expect(ABOGADA_DEMO.id).not.toBe(VIEJO);
    // Y el firmante sigue aportando la colegiación, que el directorio no publica.
    expect(getFirmante(ABOGADA_DEMO.id)?.colegiacion).toBe(ABOGADA_DEMO.colegiacion);
  });

  it("renombra el id viejo en las respuestas del consultorio", () => {
    const s = migrar(
      {
        leadsRespondidos: {
          "lead-1": [
            { abogadoId: VIEJO, texto: "mía", cuando: "reciente" },
            { abogadoId: "gabriela-nunez", texto: "de otra", cuando: "reciente" },
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
          [VIEJO]: [{ abogadoId: VIEJO, materia: "Laboral", texto: "viejo", cuando: "hoy" }],
          [ABOGADA_DEMO.id]: [
            { abogadoId: ABOGADA_DEMO.id, materia: "Civil", texto: "nuevo", cuando: "hoy" },
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

  it("un estado ya migrado pasa intacto", () => {
    const entrada = { leadsRespondidos: {}, mensajesAbogado: {}, plan: "premium" };
    expect(migrar(structuredClone(entrada), 3)).toEqual(entrada);
  });
});
