/**
 * Cálculo orientativo de prestaciones por despido injustificado.
 *
 * Módulo canónico (§0.5): la calculadora del ciudadano, la del abogado, la demo
 * de la home y Jus IA dan el MISMO número — si vive en dos sitios, driftea.
 *
 * ⚠️ **Reescrito el 2026-08-31** para cerrar la deuda de §8: calculaba la
 * cesantía como `salario × años` y el preaviso como "1 mes / 2 meses", mientras
 * la guía de despido del propio producto publicaba la escalera literal del
 * Código del Trabajo. El producto se contradecía a sí mismo. Ahora sigue la
 * ley, verificada contra el PDF del CEDIJ el 2026-08-31:
 *
 *   · **Cesantía, art. 120**: 10 días de salario de 3 a 6 meses · 20 días de
 *     más de 6 y menos de 1 año · 1 mes por año después, proporcional en la
 *     fracción · «en ningún caso podrá exceder del salario de 25 meses».
 *   · **Preaviso, art. 116**: 24 horas si sirvió menos de 3 meses · 1 semana de
 *     3 a 6 · 2 semanas de 6 meses a 1 año · 1 mes de 1 a 2 años · 2 meses si
 *     más de 2. Si el patrono no lo dio, paga el equivalente (art. 118).
 *   · **Vacaciones, art. 346**: 10 días laborables tras 1 año · 12 tras 2 · 15
 *     tras 3 · 20 tras 4.
 *
 * ⚠️ El **décimo tercer y décimo cuarto mes NO están en el Código del Trabajo**
 * (comprobado: cero menciones en el texto oficial) — vienen de decretos aparte
 * que este proyecto todavía no ha verificado. Van marcados `verificado: false`
 * y FUERA del subtotal respaldado por la ley, en vez de quedar disueltos en un
 * total que parecería todo igual de firme.
 *
 * ⚙️ Sigue pendiente que el socio abogado lo contraste con la práctica real
 * (§7.6): esto respalda cada línea con su artículo, no sustituye esa revisión.
 */

/** Un renglón del desglose, con lo que lo respalda. */
export interface ConceptoPrestacion {
  clave: "cesantia" | "preaviso" | "vacaciones" | "decimos";
  etiqueta: string;
  monto: number;
  /** Cómo salió ese número, en la regla que lo produce. */
  detalle: string;
  /** Artículo que lo fija. Ausente = todavía sin fuente verificada. */
  articulo?: string;
  verificado: boolean;
}

export interface Prestaciones {
  conceptos: ConceptoPrestacion[];
  /** Suma de lo respaldado por el Código del Trabajo. */
  totalVerificado: number;
  /** Suma de todo, incluido lo que aún no tiene artículo. */
  total: number;
  /** Meses de antigüedad usados en el cálculo. */
  meses: number;
}

/** «En ningún caso podrá exceder dicho auxilio del salario de 25 meses» (120 d). */
const TOPE_MESES_CESANTIA = 25;
/** Art. 120-A: microempresa de hasta 10 empleados. */
const TOPE_MESES_CESANTIA_MICRO = 15;

const DIA = 30; // El salario mensual se divide entre 30 para el valor del día.

function saneado(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Cesantía del art. 120, con sus tres tramos y su tope. */
function cesantia(salario: number, meses: number, micro: boolean): ConceptoPrestacion {
  const dia = salario / DIA;
  let monto = 0;
  let detalle: string;

  if (meses < 3) {
    detalle = "Con menos de 3 meses de trabajo continuo no hay auxilio de cesantía.";
  } else if (meses <= 6) {
    monto = dia * 10;
    detalle = "De 3 a 6 meses: 10 días de salario.";
  } else if (meses < 12) {
    monto = dia * 20;
    detalle = "Más de 6 meses y menos de un año: 20 días de salario.";
  } else {
    const tope = micro ? TOPE_MESES_CESANTIA_MICRO : TOPE_MESES_CESANTIA;
    // Un mes por año, y proporcional en la fracción que no llega al año.
    const mesesComputables = Math.min(meses / 12, tope);
    monto = salario * mesesComputables;
    const anios = Math.floor(meses / 12);
    const resto = meses % 12;
    detalle =
      mesesComputables === tope
        ? `Un mes de salario por año, con el tope de ${tope} meses.`
        : `Un mes de salario por cada año (${anios}) más la parte proporcional${resto > 0 ? ` de ${resto} ${resto === 1 ? "mes" : "meses"}` : ""}.`;
  }

  return {
    clave: "cesantia",
    etiqueta: "Auxilio de cesantía",
    monto,
    detalle,
    articulo: micro ? "art. 120 y 120-A" : "art. 120",
    verificado: true,
  };
}

/** Preaviso del art. 116, pagadero si el patrono no lo dio (art. 118). */
function preaviso(salario: number, meses: number): ConceptoPrestacion {
  const dia = salario / DIA;
  let monto: number;
  let detalle: string;

  if (meses < 3) {
    monto = dia;
    detalle = "Menos de 3 meses: 24 horas de preaviso.";
  } else if (meses <= 6) {
    monto = dia * 7;
    detalle = "De 3 a 6 meses: una semana.";
  } else if (meses < 12) {
    monto = dia * 14;
    detalle = "De 6 meses a un año: dos semanas.";
  } else if (meses <= 24) {
    monto = salario;
    detalle = "De uno a dos años: un mes.";
  } else {
    monto = salario * 2;
    detalle = "Más de dos años: dos meses.";
  }

  return {
    clave: "preaviso",
    etiqueta: "Preaviso no dado",
    monto,
    detalle: `${detalle} Se paga solo si el patrono no te lo dio (art. 118).`,
    articulo: "art. 116",
    verificado: true,
  };
}

/** Vacaciones del art. 346, en días laborables por tramo de antigüedad. */
function vacaciones(salario: number, meses: number): ConceptoPrestacion {
  const dia = salario / DIA;
  const anios = Math.floor(meses / 12);
  const dias = anios >= 4 ? 20 : anios === 3 ? 15 : anios === 2 ? 12 : anios === 1 ? 10 : 0;

  return {
    clave: "vacaciones",
    etiqueta: "Vacaciones acumuladas",
    monto: dia * dias,
    detalle:
      dias === 0
        ? "El derecho a vacaciones nace después del primer año continuo."
        : `Tras ${anios} ${anios === 1 ? "año" : "años"} de servicio continuo: ${dias} días laborables.`,
    articulo: "art. 346",
    verificado: true,
  };
}

/**
 * Décimo tercer y décimo cuarto mes, proporcionales a los meses trabajados en
 * el año. NO salen del Código del Trabajo (cero menciones en el texto oficial):
 * van sin artículo y sin sumar al subtotal verificado.
 */
function decimos(salario: number, meses: number): ConceptoPrestacion {
  const mesesDelAnio = Math.min(meses, 12);
  const monto = (salario / 12) * mesesDelAnio * 2;
  return {
    clave: "decimos",
    etiqueta: "Décimo tercer y décimo cuarto mes",
    monto,
    detalle: `Proporcional a ${mesesDelAnio} ${mesesDelAnio === 1 ? "mes" : "meses"} del año. Vienen de decretos aparte del Código del Trabajo, que aún no hemos verificado.`,
    verificado: false,
  };
}

export function calcularPrestaciones(
  salarioMensual: number,
  mesesTrabajados: number,
  opciones: { microempresa?: boolean } = {},
): Prestaciones {
  const salario = saneado(salarioMensual);
  const meses = Math.floor(saneado(mesesTrabajados));

  const conceptos = [
    cesantia(salario, meses, opciones.microempresa === true),
    preaviso(salario, meses),
    vacaciones(salario, meses),
    decimos(salario, meses),
  ];

  return {
    conceptos,
    totalVerificado: conceptos.filter((c) => c.verificado).reduce((s, c) => s + c.monto, 0),
    total: conceptos.reduce((s, c) => s + c.monto, 0),
    meses,
  };
}

/** Años y meses → meses. La escalera de la ley se mide en meses, no en años. */
export function aMeses(anios: number, meses: number): number {
  return Math.max(0, Math.floor(saneado(anios)) * 12 + Math.floor(saneado(meses)));
}
