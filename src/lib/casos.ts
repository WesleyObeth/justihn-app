import { ACTOS_NOTARIALES, getActoNotarial } from "@/data/actos-notariales";
import { getTramite, TRAMITES } from "@/data/tramites";
import type { DocumentoCaso, TipoCaso } from "@/types/dominio";

/**
 * Lo que un caso sabe de su origen: nombre, checklist inicial y a dónde
 * enlaza. Un solo sitio para que «Nuevo caso», el detalle y la propuesta de
 * honorarios no se contradigan sobre qué es un `referenciaId`.
 */
export interface OrigenCaso {
  tipo: TipoCaso;
  referenciaId: string;
  nombre: string;
  resumen: string;
  materia: string;
  /** Checklist con el que nace el expediente. */
  documentos: DocumentoCaso[];
  /** Ruta de la guía o acto en la app, para leerla desde el caso. */
  href?: string;
  fuenteUrl?: string;
  fuenteNombre?: string;
  fuentePendiente?: string;
  requiereNotario: boolean;
}

export const TIPOS_CASO: { id: TipoCaso; etiqueta: string; descripcion: string }[] = [
  { id: "notarial", etiqueta: "Acto notarial", descripcion: "Matrimonio, auténticas, declaratoria de herederos" },
  { id: "tramite", etiqueta: "Trámite", descripcion: "Gestión ante una institución del Estado" },
  { id: "proceso", etiqueta: "Proceso judicial", descripcion: "Despido, pensión, divorcio, herencia" },
];

/** Opciones del selector de «Nuevo caso» para cada tipo. */
export function opcionesDeTipo(tipo: TipoCaso): { id: string; nombre: string; resumen: string }[] {
  if (tipo === "notarial") return ACTOS_NOTARIALES.map((a) => ({ id: a.id, nombre: a.nombre, resumen: a.resumen }));
  return TRAMITES.filter((t) => t.tipo === tipo).map((t) => ({ id: t.id, nombre: t.nombre, resumen: t.paraQuien }));
}

export function origenDeCaso(tipo: TipoCaso, referenciaId: string): OrigenCaso | null {
  if (tipo === "notarial") {
    const a = getActoNotarial(referenciaId);
    if (!a) return null;
    return {
      tipo,
      referenciaId,
      nombre: a.nombre,
      resumen: a.resumen,
      materia: a.materia,
      documentos: a.documentos.map((d) => ({
        titulo: d.obligatorio ? d.titulo : `Cuando aplique: ${d.titulo}`,
        fuente: d.fuente,
        recibido: false,
      })),
      fuenteUrl: a.fuenteUrl,
      fuenteNombre: a.fuenteNombre,
      fuentePendiente: a.fuentePendiente,
      requiereNotario: a.requiereNotario,
    };
  }
  const t = getTramite(referenciaId);
  if (!t) return null;
  return {
    tipo,
    referenciaId,
    nombre: t.nombre,
    resumen: t.paraQuien,
    materia: t.materia,
    documentos: t.requisitos.map((r) => ({ titulo: r, recibido: false })),
    href: `/tramites/${t.id}`,
    fuenteUrl: t.fuenteUrl,
    fuenteNombre: t.fuenteNombre,
    requiereNotario: t.pasos.some((p) => p.profesional === "notario"),
  };
}

export const ETIQUETA_ESTADO = {
  abierto: "Abierto",
  en_tramite: "En trámite",
  cerrado: "Cerrado",
} as const;

/** Días entre hoy (medianoche local) y un día ISO; negativo si ya pasó. */
export function diasHasta(fechaIso: string, hoy: Date): number {
  const [y, m, d] = fechaIso.split("-").map(Number);
  const fecha = new Date(y!, (m ?? 1) - 1, d ?? 1);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}
