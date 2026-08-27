import { describe, expect, it } from "vitest";
import { determinarViaCivil } from "./via-procesal";

describe("determinarViaCivil", () => {
  it("hasta L100,000 corresponde proceso abreviado y admite monitorio", () => {
    expect(determinarViaCivil(80_000)).toEqual({
      via: "abreviado",
      admiteMonitorio: true,
      sinAbogado: false,
    });
  });

  it("entre L100,001 y L200,000 es ordinario pero aún admite monitorio", () => {
    expect(determinarViaCivil(150_000)).toEqual({
      via: "ordinario",
      admiteMonitorio: true,
      sinAbogado: false,
    });
  });

  it("sobre L200,000 es ordinario sin vía monitoria", () => {
    expect(determinarViaCivil(350_000)).toEqual({
      via: "ordinario",
      admiteMonitorio: false,
      sinAbogado: false,
    });
  });

  it("bajo L5,000 el monitorio no exige abogado", () => {
    expect(determinarViaCivil(3_000)?.sinAbogado).toBe(true);
  });

  it("rechaza cuantías inválidas", () => {
    expect(determinarViaCivil(0)).toBeNull();
    expect(determinarViaCivil(-10)).toBeNull();
    expect(determinarViaCivil(Number.NaN)).toBeNull();
  });
});
