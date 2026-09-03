import { describe, expect, it } from "vitest";
import { formatearIdentidad, soloDigitos, validarIdentidad } from "./identidad";

/** Año fijo: la validación no puede depender de cuándo corran los tests (§4.5). */
const ANIO = 2026;

describe("formatearIdentidad", () => {
  it("pone los guiones en su sitio mientras se escribe", () => {
    expect(formatearIdentidad("0")).toBe("0");
    expect(formatearIdentidad("0801")).toBe("0801");
    expect(formatearIdentidad("08011990")).toBe("0801-1990");
    expect(formatearIdentidad("0801199012345")).toBe("0801-1990-12345");
  });

  it("limpia lo que se pega con guiones, espacios o puntos", () => {
    expect(formatearIdentidad("0801-1990-12345")).toBe("0801-1990-12345");
    expect(formatearIdentidad("0801 1990 12345")).toBe("0801-1990-12345");
    expect(formatearIdentidad("0801.1990.12345")).toBe("0801-1990-12345");
  });

  it("no deja escribir más de 13 dígitos", () => {
    expect(soloDigitos("08011990123456789")).toHaveLength(13);
    expect(formatearIdentidad("08011990123456789")).toBe("0801-1990-12345");
  });
});

describe("validarIdentidad", () => {
  it("acepta un número bien formado", () => {
    expect(validarIdentidad("0801-1990-12345", ANIO)).toBeNull();
    expect(validarIdentidad("1801-1975-00001", ANIO)).toBeNull();
    expect(validarIdentidad("0101-2008-99999", ANIO)).toBeNull();
  });

  it("exige los 13 dígitos", () => {
    expect(validarIdentidad("0801-1990-1234", ANIO)).toMatch(/13 dígitos/);
    expect(validarIdentidad("", ANIO)).toMatch(/13 dígitos/);
  });

  it("el departamento va del 01 al 18", () => {
    expect(validarIdentidad("0001-1990-12345", ANIO)).toMatch(/departamento/);
    expect(validarIdentidad("1901-1990-12345", ANIO)).toMatch(/departamento/);
    expect(validarIdentidad("9901-1990-12345", ANIO)).toMatch(/departamento/);
  });

  it("el municipio no puede ser 00", () => {
    expect(validarIdentidad("0800-1990-12345", ANIO)).toMatch(/municipio/);
  });

  /** Un colegiado nacido hace menos de 18 años es un dígito mal tecleado. */
  it("el año de nacimiento tiene que ser plausible", () => {
    expect(validarIdentidad("0801-2020-12345", ANIO)).toMatch(/año de nacimiento/);
    expect(validarIdentidad("0801-1899-12345", ANIO)).toMatch(/año de nacimiento/);
    expect(validarIdentidad("0801-2008-12345", ANIO)).toBeNull();
  });
});
