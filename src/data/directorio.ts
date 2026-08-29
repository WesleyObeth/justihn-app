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
/**
 * Habilitación notarial. En Honduras ser notario NO es una especialidad del
 * derecho sino una credencial aparte: el Instituto de la Propiedad exige al
 * notario que tramita electrónicamente DOS carnés distintos, el del Colegio de
 * Abogados y el de la Contraloría del Notariado (Notas Importantes 2 del
 * Registro Vehicular). Por eso vive fuera de `materias` — un abogado de
 * materia "Notarial" no es, por ese solo hecho, notario habilitado.
 */
export interface HabilitacionNotarial {
  /** Nº de exequátur declarado por el profesional. */
  exequatur: string;
  /**
   * ¿Contrastado contra la Contraloría del Notariado?
   * Hoy siempre `false`: el Poder Judicial no publica un padrón notarial
   * consultable, así que la habilitación es DECLARADA, no verificada. La UI
   * tiene que decirlo — misma regla que las guías: sin fuente, no se afirma.
   * ⚙️ Pendiente del socio: cómo se comprueba una habilitación vigente.
   */
  verificado: boolean;
}

export interface AbogadoDirectorio {
  id: string;
  nombre: string;
  iniciales: string;
  ciudad: string;
  /** Áreas de práctica. NO confundir con la habilitación notarial. */
  materias: Materia[];
  bio: string;
  valoracion: string;
  contactos: number;
  validado: boolean;
  /** Premium = prioridad en el directorio (feature del plan). */
  premium: boolean;
  /** Credencial de notario, independiente de `materias`. */
  notario?: HabilitacionNotarial;
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
    notario: { exequatur: "N-2014-0731", verificado: false },
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
    // Es notario aunque su práctica esté en Civil y Familia: la credencial no
    // se deduce de la materia. Este perfil existe justamente para probarlo.
    notario: { exequatur: "N-2011-0288", verificado: false },
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

/**
 * Notarios habilitados. Se usa donde un PASO del trámite exige notario
 * (escritura pública, autenticación de firmas) — nunca `buscarAbogados`, que
 * filtra por área de práctica y devolvería abogados sin habilitación.
 */
export function buscarNotarios(): AbogadoDirectorio[] {
  return ordenar(DIRECTORIO.filter((a) => Boolean(a.notario)));
}

/** Premium primero (feature del plan), luego por valoración. */
export function buscarAbogados(materia?: Materia | "todas"): AbogadoDirectorio[] {
  return ordenar(
    !materia || materia === "todas"
      ? DIRECTORIO
      : DIRECTORIO.filter((a) => a.materias.includes(materia)),
  );
}

/** Orden único del directorio: Premium primero, luego valoración. */
function ordenar(lista: AbogadoDirectorio[]): AbogadoDirectorio[] {
  return [...lista].sort(
    (a, b) => Number(b.premium) - Number(a.premium) || Number(b.valoracion) - Number(a.valoracion),
  );
}
