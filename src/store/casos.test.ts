import { beforeEach, describe, expect, it } from "vitest";
import { ACTOS_NOTARIALES } from "@/data/actos-notariales";
import { origenDeCaso, opcionesDeTipo, diasHasta } from "@/lib/casos";
import { usePortal } from "./portal";

/**
 * Mis casos (2026-09-02): el expediente nace con el checklist del origen y
 * desde ahí es del caso; la propuesta se enlaza y se desenlaza con él.
 */
describe("casos — el expediente por cliente", () => {
  beforeEach(() => usePortal.setState({ casos: [], propuestas: [] }));

  it("nace con el checklist del acto notarial, sin nada recibido", () => {
    const origen = origenDeCaso("notarial", "matrimonio-civil")!;
    const id = usePortal.getState().crearCaso({
      cliente: { nombre: "Ana y Luis" },
      tipo: "notarial",
      referenciaId: "matrimonio-civil",
      titulo: origen.nombre,
      notas: "",
      documentos: origen.documentos,
    });
    const c = usePortal.getState().casos.find((x) => x.id === id)!;
    expect(c.estado).toBe("abierto");
    expect(c.documentos.length).toBe(ACTOS_NOTARIALES.find((a) => a.id === "matrimonio-civil")!.documentos.length);
    expect(c.documentos.every((d) => !d.recibido)).toBe(true);
    // Los opcionales se distinguen en el título, no se ocultan.
    expect(c.documentos.some((d) => d.titulo.startsWith("Cuando aplique:"))).toBe(true);
  });

  it("marca documentos, anota plazos ordenados y cambia de estado", () => {
    const origen = origenDeCaso("tramite", "abrir-rtn")!;
    const id = usePortal.getState().crearCaso({
      cliente: { nombre: "Comercial X" },
      tipo: "tramite",
      referenciaId: "abrir-rtn",
      titulo: origen.nombre,
      notas: "",
      documentos: origen.documentos,
    });
    const s = usePortal.getState();
    s.toggleDocumentoCaso(id, 0);
    s.agregarPlazoCaso(id, "Cita SAR", "2026-10-05");
    s.agregarPlazoCaso(id, "Entregar formulario", "2026-09-20");
    s.actualizarCaso(id, { estado: "en_tramite" });
    const c = usePortal.getState().casos.find((x) => x.id === id)!;
    expect(c.documentos[0]!.recibido).toBe(true);
    expect(c.plazos.map((p) => p.fechaIso)).toEqual(["2026-09-20", "2026-10-05"]);
    expect(c.estado).toBe("en_tramite");
  });

  it("la propuesta se enlaza al caso y al borrarla el caso queda sin enlace, no roto", () => {
    const origen = origenDeCaso("proceso", "divorcio-ciudadano")!;
    const casoId = usePortal.getState().crearCaso({
      cliente: { nombre: "Cliente" },
      tipo: "proceso",
      referenciaId: "divorcio-ciudadano",
      titulo: origen.nombre,
      notas: "",
      documentos: origen.documentos,
    });
    const propId = usePortal.getState().guardarPropuesta({
      casoId,
      origen: { tipo: "proceso", referenciaId: "divorcio-ciudadano" },
      cliente: { nombre: "Cliente" },
      referencia: "P-1",
      fechaIso: "2026-09-02",
      honorarios: 12_000,
      formaPago: "en un solo pago",
    });
    usePortal.getState().actualizarCaso(casoId, { propuestaId: propId });
    expect(usePortal.getState().casos[0]!.propuestaId).toBe(propId);
    usePortal.getState().eliminarPropuesta(propId);
    expect(usePortal.getState().propuestas).toHaveLength(0);
    expect(usePortal.getState().casos[0]!.propuestaId).toBeUndefined();
  });

  it("guardar con el mismo id reescribe en vez de duplicar", () => {
    const base = {
      origen: { tipo: "tramite" as const, referenciaId: "abrir-rtn" },
      cliente: { nombre: "A" },
      referencia: "",
      fechaIso: "2026-09-02",
      honorarios: 1000,
      formaPago: "en un solo pago",
    };
    const id = usePortal.getState().guardarPropuesta(base);
    usePortal.getState().guardarPropuesta({ ...base, id, honorarios: 2000 });
    expect(usePortal.getState().propuestas).toHaveLength(1);
    expect(usePortal.getState().propuestas[0]!.honorarios).toBe(2000);
  });
});

describe("origen de un caso", () => {
  it("cada tipo ofrece opciones y todas resuelven", () => {
    for (const tipo of ["notarial", "tramite", "proceso"] as const) {
      const ops = opcionesDeTipo(tipo);
      expect(ops.length, tipo).toBeGreaterThan(0);
      for (const o of ops) expect(origenDeCaso(tipo, o.id), o.id).not.toBeNull();
    }
  });
  it("un id ajeno al tipo no resuelve", () => {
    expect(origenDeCaso("notarial", "abrir-rtn")).toBeNull();
    expect(origenDeCaso("tramite", "matrimonio-civil")).toBeNull();
  });
  it("diasHasta cuenta días de calendario", () => {
    const hoy = new Date(2026, 8, 2);
    expect(diasHasta("2026-09-02", hoy)).toBe(0);
    expect(diasHasta("2026-09-05", hoy)).toBe(3);
    expect(diasHasta("2026-08-30", hoy)).toBe(-3);
  });
});
