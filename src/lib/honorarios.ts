import { getActoNotarial } from "@/data/actos-notariales";
import { getInstitucion, getTramite } from "@/data/tramites";
import { etiquetaColegiacion } from "@/data/catalogo";
import type { PerfilAbogado, PropuestaHonorarios, TipoCaso } from "@/types/dominio";

/**
 * Propuesta de honorarios generada desde el trámite.
 *
 * Nace el 2026-09-02 del primer feedback de un abogado externo: pagaba
 * US$20/mes de ChatGPT sobre todo para redactar propuestas como su PDF de la
 * UTOH (servicios por etapa, datos que aporta el cliente, requisitos
 * documentales, advertencias, condiciones). Todo eso menos los honorarios y
 * el cliente **ya está en el catálogo verificado**: la propuesta se ARMA
 * desde la guía, no se redacta. El argumento contra ChatGPT es literal: los
 * requisitos no se inventan, se citan.
 *
 * El store guarda solo lo que el abogado escribió (`PropuestaHonorarios`);
 * el documento se deriva aquí en cada render. Un solo dato de origen (§4.4):
 * si la guía corrige un requisito, la propuesta lo corrige también.
 */

export interface OrigenPropuesta {
  tipo: TipoCaso;
  referenciaId: string;
  nombre: string;
  /** «ante el Servicio de Administración de Rentas (SAR)» o «». */
  ante: string;
  servicios: { titulo: string; alcance: string }[];
  requisitos: { titulo: string; fuente?: string }[];
  advertencias: string[];
  fuenteUrl?: string;
  fuenteNombre?: string;
  fuentePendiente?: string;
}

/** Lo que la propuesta necesita saber de un trámite, proceso o acto notarial. */
export function resolverOrigen(tipo: TipoCaso, referenciaId: string): OrigenPropuesta | null {
  if (tipo === "notarial") {
    const acto = getActoNotarial(referenciaId);
    if (!acto) return null;
    return {
      tipo,
      referenciaId,
      nombre: acto.nombre,
      ante: "",
      servicios: acto.pasos.map((p) => ({
        titulo: p.titulo,
        alcance: p.fuente ? `${p.detalle} (${p.fuente}).` : p.detalle,
      })),
      requisitos: acto.documentos.map((d) => ({
        titulo: d.obligatorio ? d.titulo : `Cuando aplique: ${d.titulo}`,
        fuente: d.fuente,
      })),
      advertencias: (acto.plazos ?? []).map((p) => `${p.titulo}. ${p.detalle} (${p.fuente}).`),
      fuenteUrl: acto.fuenteUrl,
      fuenteNombre: acto.fuenteNombre,
      fuentePendiente: acto.fuentePendiente,
    };
  }
  const tramite = getTramite(referenciaId);
  if (!tramite) return null;
  const institucion = getInstitucion(tramite.institucionId);
  const advertencias: string[] = [];
  if (tramite.tasa) advertencias.push(`Tasas y costos oficiales: ${tramite.tasa}.`);
  if (tramite.nota) advertencias.push(tramite.nota);
  return {
    tipo,
    referenciaId,
    nombre: tramite.nombre,
    ante: institucion ? `ante ${institucion.nombre} (${institucion.sigla})` : "",
    servicios: tramite.pasos.map((p) => ({ titulo: p.titulo, alcance: p.detalle })),
    requisitos: tramite.requisitos.map((r) => ({ titulo: r })),
    advertencias,
    fuenteUrl: tramite.fuenteUrl,
    fuenteNombre: tramite.fuenteNombre,
  };
}

// ── Número a letras ────────────────────────────────────────────────────────

const UNIDADES = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
const ESPECIALES: Record<number, string> = {
  10: "diez", 11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
  16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve",
  20: "veinte", 21: "veintiún", 22: "veintidós", 23: "veintitrés", 24: "veinticuatro",
  25: "veinticinco", 26: "veintiséis", 27: "veintisiete", 28: "veintiocho", 29: "veintinueve",
};
const DECENAS = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

function menorDeMil(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cien";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CENTENAS[c]!);
  if (resto) {
    if (resto < 30 && resto >= 10) partes.push(ESPECIALES[resto]!);
    else if (resto < 10) partes.push(UNIDADES[resto]!);
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u ? `${DECENAS[d]} y ${UNIDADES[u]}` : DECENAS[d]!);
    }
  }
  return partes.join(" ");
}

/** Entero a letras en español, hasta los millones — lo que cabe en unos honorarios. */
export function enteroALetras(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  if (n === 0) return "cero";
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (millones) partes.push(millones === 1 ? "un millón" : `${enteroALetras(millones)} millones`);
  if (miles) partes.push(miles === 1 ? "mil" : `${menorDeMil(miles)} mil`);
  if (resto) partes.push(menorDeMil(resto));
  return partes.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * «Dieciocho mil lempiras exactos» · «Mil quinientos lempiras con 50/100».
 * Es la fórmula que se usa en los documentos legales hondureños, y la que
 * traía el PDF del abogado.
 */
export function lempirasALetras(monto: number): string {
  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);
  const letras = enteroALetras(entero);
  const texto = `${letras.charAt(0).toUpperCase()}${letras.slice(1)} ${entero === 1 ? "lempira" : "lempiras"}`;
  return centavos ? `${texto} con ${String(centavos).padStart(2, "0")}/100` : `${texto} exactos`;
}

/** «L 18,000.00» — el formato de los documentos, no el de la calculadora. */
export function formatearLempiras(monto: number): string {
  return `L ${monto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── El documento ───────────────────────────────────────────────────────────

export interface DocumentoPropuesta {
  membrete: { firma: string; abogado: string; colegiacion: string; ciudad: string };
  titulo: string;
  subtitulo: string;
  cliente: PropuestaHonorarios["cliente"];
  referencia: string;
  fechaIso: string;
  objeto: string;
  servicios: { n: number; titulo: string; alcance: string }[];
  honorarios: { monto: string; letras: string; formaPago: string; notas?: string };
  datosCliente: string[];
  requisitos: { titulo: string; fuente?: string }[];
  advertencias: string[];
  condiciones: string[];
  fuente?: { url?: string; nombre?: string; pendiente?: string };
}

/**
 * Datos que el cliente tiene que aportar para que la gestión arranque. Son
 * los del PDF de referencia, que a su vez son los que piden las
 * instituciones; el DNI de la persona autorizada es el que motivó pedirlo en
 * el alta (2026-09-02).
 */
const DATOS_CLIENTE_BASE = [
  "Nombre completo o razón social",
  "RTN",
  "Dirección",
  "Persona autorizada a presentar y retirar documentos",
  "Número de identidad (DNI) de la persona autorizada",
  "Correo electrónico autorizado (a nombre del titular)",
  "Teléfono de contacto",
];

export function armarPropuesta(
  p: PropuestaHonorarios,
  abogado: Pick<PerfilAbogado, "nombre" | "colegiacionNumero" | "ciudad">,
  nombreFirma = abogado.nombre,
): DocumentoPropuesta | null {
  const origen = resolverOrigen(p.origen.tipo, p.origen.referenciaId);
  if (!origen) return null;

  const condiciones = [
    `Los honorarios ascienden a ${formatearLempiras(p.honorarios)} y se cancelan ${p.formaPago}.`,
    "El plazo de gestión comienza a correr una vez recibida la totalidad de la información y la documentación requerida.",
    origen.tipo === "notarial"
      ? "El profesional responde por la debida autorización del acto conforme a la ley; no por hechos ajenos que impidan su celebración."
      : "Los tiempos de resolución dependen de la institución; el profesional responde por la debida presentación y seguimiento del expediente, no por el plazo institucional.",
    "Cualquier gestión distinta a la descrita en la sección de servicios será cotizada por separado.",
  ];

  return {
    membrete: {
      firma: nombreFirma,
      abogado: abogado.nombre,
      colegiacion: etiquetaColegiacion(abogado.colegiacionNumero),
      ciudad: abogado.ciudad,
    },
    titulo: "Propuesta de honorarios profesionales",
    subtitulo: [origen.nombre, origen.ante].filter(Boolean).join(" "),
    cliente: p.cliente,
    referencia: p.referencia,
    fechaIso: p.fechaIso,
    objeto: `Se presenta propuesta de honorarios profesionales para la gestión integral de ${origen.nombre.toLowerCase()}${origen.ante ? ` ${origen.ante}` : ""}, comprendiendo la preparación de la documentación habilitante, la presentación de la solicitud y el seguimiento hasta su conclusión.`,
    servicios: origen.servicios.map((s, i) => ({ n: i + 1, ...s })),
    honorarios: {
      monto: formatearLempiras(p.honorarios),
      letras: lempirasALetras(p.honorarios),
      formaPago: p.formaPago,
      notas: p.notas,
    },
    datosCliente: DATOS_CLIENTE_BASE,
    requisitos: origen.requisitos,
    advertencias: origen.advertencias,
    condiciones,
    fuente: origen.fuenteUrl || origen.fuentePendiente
      ? { url: origen.fuenteUrl, nombre: origen.fuenteNombre, pendiente: origen.fuentePendiente }
      : undefined,
  };
}
