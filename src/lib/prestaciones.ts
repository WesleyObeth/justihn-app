/**
 * Cálculo orientativo de prestaciones laborales.
 *
 * Módulo canónico (§0.5): la calculadora de la UI y la respuesta de Jus IA
 * deben dar el mismo número — si viven en dos sitios, driftean.
 *
 * ⚠️ Los coeficientes son los del prototipo de demostración. Antes del go-live
 * hay que validarlos contra el Código del Trabajo vigente con el socio abogado
 * (backlog #5): un cálculo laboral equivocado en manos de un profesional es un
 * riesgo real, no un detalle de UI.
 */
export interface Prestaciones {
  cesantia: number;
  preaviso: number;
  proporcionales: number;
  total: number;
}

/** Tope de años computables para cesantía. */
const TOPE_ANIOS_CESANTIA = 25;

export function calcularPrestaciones(salarioMensual: number, anios: number): Prestaciones {
  const salario = Number.isFinite(salarioMensual) && salarioMensual > 0 ? salarioMensual : 0;
  const antiguedad = Number.isFinite(anios) && anios > 0 ? anios : 0;

  const cesantia = salario * Math.min(antiguedad, TOPE_ANIOS_CESANTIA);
  const preaviso = antiguedad >= 2 ? salario * 2 : salario;
  const proporcionales = salario * 0.6;

  return {
    cesantia,
    preaviso,
    proporcionales,
    total: cesantia + preaviso + proporcionales,
  };
}
