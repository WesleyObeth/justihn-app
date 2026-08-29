import { ABOGADA_DEMO } from "@/data/catalogo";
import type { Materia } from "@/types/dominio";

/**
 * Directorio público de abogados por materia — "la base de abogados por rama"
 * del feedback del socio (2026-08-29). Es la cara pública de la Vía B: la
 * gente encuentra abogado por materia; el abogado Premium aparece primero.
 *
 * María Castillo es LA MISMA abogada del portal (mismo seed): lo que edita en
 * su perfil es lo que el público ve aquí — esa es la integración entre vías.
 * Los demás perfiles son de demostración.
 *
 * TODO(data): vista pública de la tabla `abogados` (perfil del suscriptor),
 * ordenada por plan (prioridad Premium) + valoración.
 */
export interface AbogadoDirectorio {
  id: string;
  nombre: string;
  iniciales: string;
  ciudad: string;
  materias: Materia[];
  bio: string;
  valoracion: string;
  contactos: number;
  validado: boolean;
  /** Premium = prioridad en el directorio (feature del plan). */
  premium: boolean;
}

export const DIRECTORIO: AbogadoDirectorio[] = [
  {
    id: "maria-castillo",
    nombre: ABOGADA_DEMO.nombre,
    iniciales: ABOGADA_DEMO.iniciales,
    ciudad: ABOGADA_DEMO.ciudad,
    materias: ABOGADA_DEMO.especialidades,
    bio: ABOGADA_DEMO.bio,
    valoracion: ABOGADA_DEMO.metricas.valoracion,
    contactos: ABOGADA_DEMO.metricas.contactos,
    validado: false,
    premium: false,
  },
  {
    id: "carlos-mejia",
    nombre: "Abg. Carlos Mejía",
    iniciales: "CM",
    ciudad: "Tegucigalpa, M.D.C.",
    materias: ["Mercantil", "Notarial"],
    bio: "Constitución de sociedades, contratos y notariado. Acompaño negocios desde el pacto social hasta el permiso de operación.",
    valoracion: "4.8",
    contactos: 21,
    validado: true,
    premium: true,
  },
  {
    id: "lucia-fernandez",
    nombre: "Abg. Lucía Fernández",
    iniciales: "LF",
    ciudad: "San Pedro Sula",
    materias: ["Contencioso Adm."],
    bio: "Licencias ambientales y sanitarias, permisos y litigios contra la administración. 9 años ante MiAmbiente y ARSA.",
    valoracion: "4.7",
    contactos: 14,
    validado: true,
    premium: true,
  },
  {
    id: "roberto-pineda",
    nombre: "Abg. Roberto Pineda",
    iniciales: "RP",
    ciudad: "La Ceiba",
    materias: ["Civil", "Familia"],
    bio: "Propiedad, herencias y familia. Reviso el folio real antes de que firmes — la mitad de mi trabajo es evitar pleitos.",
    valoracion: "4.6",
    contactos: 9,
    validado: true,
    premium: false,
  },
  {
    id: "ana-varela",
    nombre: "Abg. Ana Varela",
    iniciales: "AV",
    ciudad: "Tegucigalpa, M.D.C.",
    materias: ["Penal"],
    bio: "Defensa penal y acompañamiento en denuncias. Atención de urgencias.",
    valoracion: "4.9",
    contactos: 17,
    validado: true,
    premium: false,
  },
];

/** Premium primero (feature del plan), luego por valoración. */
export function buscarAbogados(materia?: Materia | "todas"): AbogadoDirectorio[] {
  const filtrados =
    !materia || materia === "todas"
      ? DIRECTORIO
      : DIRECTORIO.filter((a) => a.materias.includes(materia));
  return [...filtrados].sort(
    (a, b) => Number(b.premium) - Number(a.premium) || Number(b.valoracion) - Number(a.valoracion),
  );
}
