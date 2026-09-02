import { describe, expect, it, beforeEach } from "vitest";
import { usePortal } from "./portal";
import { ABOGADA_DEMO } from "@/data/catalogo";
import { getFirmante, DIRECTORIO } from "@/data/directorio";

/**
 * El consultorio admite VARIAS respuestas por consulta (decisión Wesley
 * 2026-08-31, patrón Jusbrasil). Lo que se protege aquí es lo que antes fallaba
 * en silencio: con `Record<id, string>`, el segundo abogado en responder
 * borraba al primero — mientras el portal del abogado ya decía "tu respuesta +
 * N de otros abogados".
 */
describe("responderLead — varias respuestas por consulta", () => {
  beforeEach(() => {
    usePortal.setState({ leadsRespondidos: {} });
  });

  it("dos abogados distintos suman, no se pisan", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-1", "Orientación de la primera", ABOGADA_DEMO.id);
    responderLead("lead-1", "Orientación de la segunda", "gabriela-nunez");

    const respuestas = usePortal.getState().leadsRespondidos["lead-1"]!;
    expect(respuestas).toHaveLength(2);
    expect(respuestas.map((r) => r.abogadoId)).toEqual([ABOGADA_DEMO.id, "gabriela-nunez"]);
  });

  it("el mismo abogado reescribe la suya en vez de duplicarla", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-2", "Primer intento", ABOGADA_DEMO.id);
    responderLead("lead-2", "Corregida", ABOGADA_DEMO.id);

    const respuestas = usePortal.getState().leadsRespondidos["lead-2"]!;
    expect(respuestas).toHaveLength(1);
    expect(respuestas[0]!.texto).toBe("Corregida");
  });

  it("conserva el orden en que respondieron", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-3", "a", "carlos-mejia");
    responderLead("lead-3", "b", "roberto-pineda");
    responderLead("lead-3", "c", ABOGADA_DEMO.id);
    expect(usePortal.getState().leadsRespondidos["lead-3"]!.map((r) => r.texto)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("consultas distintas no se mezclan", () => {
    const { responderLead } = usePortal.getState();
    responderLead("lead-a", "de la A", ABOGADA_DEMO.id);
    responderLead("lead-b", "de la B", ABOGADA_DEMO.id);
    const estado = usePortal.getState().leadsRespondidos;
    expect(estado["lead-a"]![0]!.texto).toBe("de la A");
    expect(estado["lead-b"]![0]!.texto).toBe("de la B");
  });
});

/**
 * Cada respuesta guarda solo el `abogadoId`; la UI resuelve la firma. Si el
 * resolutor fallara, se mostraría una respuesta sin autor en una pantalla que
 * promete abogados colegiados — por eso el detalle no la pinta (§4.5).
 */
describe("getFirmante — quién firma cada respuesta", () => {
  it("resuelve a la abogada suscriptora, con su colegiación", () => {
    const f = getFirmante(ABOGADA_DEMO.id)!;
    expect(f.nombre).toBe(ABOGADA_DEMO.nombre);
    expect(f.colegiacion).toBeTruthy();
  });

  it("resuelve a cualquiera del directorio público", () => {
    for (const a of DIRECTORIO) {
      const f = getFirmante(a.id);
      expect(f?.nombre, a.id).toBe(a.nombre);
      expect(f?.iniciales, a.id).toBeTruthy();
    }
  });

  it("un id desconocido devuelve undefined en vez de inventar un nombre", () => {
    expect(getFirmante("no-existe")).toBeUndefined();
    expect(getFirmante("")).toBeUndefined();
  });
});

/**
 * Mensajes a un abogado. Viven dentro de Justihn a propósito (§4.5): sacar el
 * contacto a WhatsApp en el primer toque dejaría al abogado sin poder demostrar
 * cuántos contactos le trajo la plataforma.
 */
describe("escribirAAbogado", () => {
  beforeEach(() => {
    usePortal.setState({ mensajesAbogado: {} });
  });

  it("guarda el mensaje bajo su abogado, con la materia del caso", () => {
    usePortal.getState().escribirAAbogado("gabriela-nunez", "Consumidor", "Producto vencido");
    const m = usePortal.getState().mensajesAbogado["gabriela-nunez"]!;
    expect(m).toHaveLength(1);
    expect(m[0]!.materia).toBe("Consumidor");
    expect(m[0]!.texto).toBe("Producto vencido");
  });

  it("acumula la conversación en vez de reemplazarla", () => {
    const { escribirAAbogado } = usePortal.getState();
    escribirAAbogado("gabriela-nunez", "Consumidor", "Primero");
    escribirAAbogado("gabriela-nunez", "Civil", "Segundo");
    expect(usePortal.getState().mensajesAbogado["gabriela-nunez"]!.map((x) => x.texto)).toEqual([
      "Primero",
      "Segundo",
    ]);
  });

  it("no mezcla los de un abogado con los de otro", () => {
    const { escribirAAbogado } = usePortal.getState();
    escribirAAbogado("gabriela-nunez", "Consumidor", "Para Gabriela");
    escribirAAbogado("carlos-mejia", "Mercantil", "Para Carlos");
    const estado = usePortal.getState().mensajesAbogado;
    expect(estado["gabriela-nunez"]).toHaveLength(1);
    expect(estado["carlos-mejia"]![0]!.texto).toBe("Para Carlos");
  });
});

/**
 * Habeas data funcional (§5 del CLAUDE.md del producto): el canal de supresión
 * tiene que BORRAR, no enseñar un aviso. Y por categoría, porque no todo pesa
 * igual — el historial del Informe Verifica (a quién consultó) puede querer
 * borrarse sin perder el avance de los trámites.
 */
describe("borrarDatosPersona", () => {
  const sembrar = () =>
    usePortal.setState({
      preguntasPublico: [
        {
          id: "pub-1",
          materia: "Consumidor",
          ciudad: "Tegucigalpa",
          creadoEn: "2026-09-01T10:00:00-06:00",
          nuevo: true,
          respuestas: 0,
          pregunta: "Producto vencido",
        },
      ],
      leadsRespondidos: { "pub-1": [{ abogadoId: ABOGADA_DEMO.id, texto: "x", creadoEn: "2026-09-01T10:00:00-06:00" }] },
      pasosTramite: { "abrir-rtn": [0, 1] },
      nombresVigiladosPersona: [{ id: "v1", nombre: "Carlos Zelaya", tipo: "propio" }],
      mensajesAbogado: {
        "gabriela-nunez": [
          { abogadoId: "gabriela-nunez", materia: "Consumidor", texto: "hola", creadoEn: "2026-09-01T10:00:00-06:00" },
        ],
      },
      consultasVerifica: ["Estado de Honduras"],
    });

  beforeEach(sembrar);

  it("borra SOLO la categoría pedida", () => {
    usePortal.getState().borrarDatosPersona("verifica");
    const s = usePortal.getState();
    expect(s.consultasVerifica).toEqual([]);
    // Lo demás sigue intacto.
    expect(s.preguntasPublico).toHaveLength(1);
    expect(s.pasosTramite["abrir-rtn"]).toEqual([0, 1]);
    expect(s.nombresVigiladosPersona).toHaveLength(1);
  });

  it("borrar consultas se lleva también sus respuestas", () => {
    usePortal.getState().borrarDatosPersona("consultas");
    const s = usePortal.getState();
    expect(s.preguntasPublico).toEqual([]);
    expect(s.leadsRespondidos).toEqual({});
  });

  it("cada categoría se puede borrar por su cuenta", () => {
    for (const categoria of ["tramites", "vigilados", "mensajes"] as const) {
      sembrar();
      usePortal.getState().borrarDatosPersona(categoria);
      const s = usePortal.getState();
      if (categoria === "tramites") expect(s.pasosTramite).toEqual({});
      if (categoria === "vigilados") expect(s.nombresVigiladosPersona).toEqual([]);
      if (categoria === "mensajes") expect(s.mensajesAbogado).toEqual({});
      // Y nunca se lleva por delante lo que no se pidió.
      expect(s.consultasVerifica, categoria).toEqual(["Estado de Honduras"]);
    }
  });

  it('"todo" no deja nada de la persona', () => {
    usePortal.getState().borrarDatosPersona("todo");
    const s = usePortal.getState();
    expect(s.preguntasPublico).toEqual([]);
    expect(s.leadsRespondidos).toEqual({});
    expect(s.pasosTramite).toEqual({});
    expect(s.nombresVigiladosPersona).toEqual([]);
    expect(s.mensajesAbogado).toEqual({});
    expect(s.consultasVerifica).toEqual([]);
  });

  it("no toca los datos del abogado: son otra audiencia", () => {
    usePortal.setState({
      nombresVigilados: [{ id: "vig-x", nombre: "Cliente del abogado", tipo: "cliente" }],
    });
    usePortal.getState().borrarDatosPersona("todo");
    expect(usePortal.getState().nombresVigilados).toHaveLength(1);
  });
});
