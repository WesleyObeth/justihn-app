import { describe, expect, it } from "vitest";
import { ABOGADA_DEMO } from "@/data/catalogo";
import { getTramite, TRAMITES } from "@/data/tramites";
import { ACTOS_NOTARIALES } from "@/data/actos-notariales";
import { armarPropuesta, enteroALetras, lempirasALetras, resolverOrigen } from "./honorarios";
import type { PropuestaHonorarios } from "@/types/dominio";

describe("enteroALetras", () => {
  it("los casos de la fórmula legal", () => {
    expect(enteroALetras(0)).toBe("cero");
    expect(enteroALetras(1)).toBe("un");
    expect(enteroALetras(16)).toBe("dieciséis");
    expect(enteroALetras(21)).toBe("veintiún");
    expect(enteroALetras(45)).toBe("cuarenta y cinco");
    expect(enteroALetras(100)).toBe("cien");
    expect(enteroALetras(101)).toBe("ciento un");
    expect(enteroALetras(500)).toBe("quinientos");
    expect(enteroALetras(1000)).toBe("mil");
    expect(enteroALetras(1500)).toBe("mil quinientos");
    expect(enteroALetras(18_000)).toBe("dieciocho mil");
    expect(enteroALetras(25_350)).toBe("veinticinco mil trescientos cincuenta");
    expect(enteroALetras(1_000_000)).toBe("un millón");
    expect(enteroALetras(2_500_000)).toBe("dos millones quinientos mil");
  });
});

describe("lempirasALetras", () => {
  it("«exactos» sin centavos, «con NN/100» con centavos — como en el PDF del abogado", () => {
    expect(lempirasALetras(18_000)).toBe("Dieciocho mil lempiras exactos");
    expect(lempirasALetras(1_500.5)).toBe("Mil quinientos lempiras con 50/100");
    expect(lempirasALetras(1)).toBe("Un lempira exactos");
  });
});

const base: PropuestaHonorarios = {
  id: "prop-1",
  abogadoId: ABOGADA_DEMO.id,
  origen: { tipo: "tramite", referenciaId: "abrir-rtn" },
  cliente: { nombre: "Distribuidora Ejemplo S. de R.L.", rtn: "08019999123456" },
  referencia: "RTN-2026-001",
  fechaIso: "2026-09-02",
  honorarios: 18_000,
  formaPago: "en un solo pago",
  creadoEn: "2026-09-02T10:00:00-06:00",
};

describe("armarPropuesta — se ARMA desde la guía, no se redacta", () => {
  it("los requisitos son los de la guía verificada, literales", () => {
    const doc = armarPropuesta(base, ABOGADA_DEMO)!;
    const guia = getTramite("abrir-rtn")!;
    expect(doc.requisitos.map((r) => r.titulo)).toEqual(guia.requisitos);
    expect(doc.servicios.map((s) => s.titulo)).toEqual(guia.pasos.map((p) => p.titulo));
    expect(doc.fuente?.url).toBe(guia.fuenteUrl);
  });

  it("el membrete sale del perfil del abogado y los honorarios van en cifra y en letras", () => {
    const doc = armarPropuesta(base, ABOGADA_DEMO)!;
    expect(doc.membrete.colegiacion).toContain(ABOGADA_DEMO.colegiacionNumero);
    expect(doc.honorarios.monto).toBe("L 18,000.00");
    expect(doc.honorarios.letras).toBe("Dieciocho mil lempiras exactos");
    expect(doc.condiciones[0]).toContain("L 18,000.00");
  });

  it("pide el DNI de la persona autorizada entre los datos del cliente", () => {
    const doc = armarPropuesta(base, ABOGADA_DEMO)!;
    expect(doc.datosCliente.some((d) => /DNI/.test(d))).toBe(true);
  });

  it("todo trámite del catálogo y todo acto notarial producen propuesta", () => {
    for (const t of TRAMITES) {
      expect(resolverOrigen(t.tipo, t.id), t.id).not.toBeNull();
    }
    for (const a of ACTOS_NOTARIALES) {
      const o = resolverOrigen("notarial", a.id)!;
      expect(o.servicios.length, a.id).toBeGreaterThan(0);
      expect(o.requisitos.length, a.id).toBeGreaterThan(0);
    }
  });

  it("un origen desconocido devuelve null en vez de un documento vacío", () => {
    expect(armarPropuesta({ ...base, origen: { tipo: "tramite", referenciaId: "no-existe" } }, ABOGADA_DEMO)).toBeNull();
  });
});
