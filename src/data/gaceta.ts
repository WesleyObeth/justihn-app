import type { PublicacionGaceta } from "@/types/dominio";

/**
 * Seed de alertas de La Gaceta.
 *
 * TODO(data): tabla `publicaciones_gaceta`, alimentada por el workflow n8n que
 * recorre `enag.gob.hn/index.php/gaceta-digital/{año}/{mes}` y descarga el PDF
 * por `/viewdocument/{id}` (la ruta `/download` exige login). El campo `afecta`
 * lo produce Jus IA cruzando la publicación con las materias suscritas del
 * abogado — es la capa de valor sobre el dato crudo.
 */
export const PUBLICACIONES: PublicacionGaceta[] = [
  {
    id: "salario-minimo-2026",
    materia: "Laboral",
    titulo: "Acuerdo — tabla de salario mínimo por actividad económica",
    meta: "La Gaceta Nº ______ · 19 ago 2026",
    fechaIso: "2026-08-19",
    resumen:
      "Fija la nueva tabla de salario mínimo por actividad económica y tamaño de empresa, vigente a partir de su publicación. Incluye los montos base para el cálculo de prestaciones e indemnizaciones.\n\n(Resumen de demostración — el producto final muestra el texto oficial íntegro.)",
    afecta:
      "Actualiza el salario base de cálculo en tus 2 casos laborales activos y en la calculadora de prestaciones.",
  },
  {
    id: "reforma-arrendamiento-2026",
    materia: "Civil",
    titulo: "Decreto — reforma a disposiciones sobre arrendamiento",
    meta: "La Gaceta Nº ______ · 18 ago 2026",
    fechaIso: "2026-08-18",
    resumen:
      "Reforma los plazos de preaviso para la terminación del contrato de arrendamiento y las causales de desahucio. Aplica a contratos celebrados después de su vigencia.\n\n(Resumen de demostración.)",
    afecta:
      "Revisa los contratos de arrendamiento de tus clientes firmados este año: el preaviso cambió.",
  },
  {
    id: "reglamento-teletrabajo-2026",
    materia: "Laboral",
    titulo: "Reglamento — teletrabajo en el sector privado",
    meta: "La Gaceta Nº ______ · 18 ago 2026",
    fechaIso: "2026-08-18",
    resumen:
      "Regula la jornada en teletrabajo, la reversibilidad del acuerdo y las obligaciones del empleador en equipo y conectividad. Establece plazo de adecuación de 6 meses.\n\n(Resumen de demostración.)",
    afecta:
      "Afecta directamente a 2 de tus casos laborales activos con modalidad de trabajo remoto.",
  },
  {
    id: "fe-errata-11-ago",
    materia: "Civil",
    titulo: "Fe de errata — publicación del 11 de agosto",
    meta: "La Gaceta Nº ______ · 17 ago 2026",
    fechaIso: "2026-08-17",
    resumen:
      "Corrige errores materiales en la publicación del 11 de agosto relativa a disposiciones registrales. Prevalece el texto corregido.\n\n(Resumen de demostración.)",
    afecta:
      "Si citaste la publicación del 11 de agosto en algún escrito, verifica el texto corregido.",
  },
  {
    id: "comisiones-higiene-2026",
    materia: "Laboral",
    titulo: "Acuerdo ministerial — comisiones de higiene y seguridad",
    meta: "La Gaceta Nº ______ · 17 ago 2026",
    fechaIso: "2026-08-17",
    resumen:
      "Actualiza la integración y funciones de las comisiones mixtas de higiene y seguridad en centros de trabajo con más de 10 empleados.\n\n(Resumen de demostración.)",
    afecta: "Relevante para tus clientes empresa: el plazo de conformación es de 90 días.",
  },
];

export function getPublicacion(id: string): PublicacionGaceta | undefined {
  return PUBLICACIONES.find((p) => p.id === id);
}

/**
 * Semana que cubre el digest, derivada de las fechas de sus publicaciones —
 * un digest cubre SU semana, no la del calendario. Determinista (sale del
 * seed, no de `Date.now()`), así que es segura en SSR.
 */
function semanaDelDigest(): string {
  const ultima = PUBLICACIONES.map((p) => p.fechaIso).sort().at(-1)!;
  const [y, m, d] = ultima.split("-").map(Number);
  const fecha = new Date(y!, m! - 1, d!);
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  const mes = (dt: Date) => dt.toLocaleDateString("es-HN", { month: "long" });
  return lunes.getMonth() === domingo.getMonth()
    ? `Semana del ${lunes.getDate()} al ${domingo.getDate()} de ${mes(domingo)}`
    : `Semana del ${lunes.getDate()} de ${mes(lunes)} al ${domingo.getDate()} de ${mes(domingo)}`;
}

export const DIGEST = {
  titulo: semanaDelDigest(),
  detalle: `${PUBLICACIONES.length} publicaciones en tus materias suscritas · enviado también por WhatsApp`,
} as const;
