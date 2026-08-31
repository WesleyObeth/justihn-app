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
  /** Años de ejercicio — señal verificable, a diferencia de una estrella. */
  anios: number;
  /** Tiempo típico de respuesta ("el mismo día", "en 2 días"). */
  responde: string;
  /**
   * Fragmento de una respuesta suya en el consultorio. Es la prueba que
   * ninguna insignia da: deja juzgar CÓMO explica antes de escribirle.
   * ⚠️ TODO(data): sale de su última respuesta destacada en `leads`, NO de un
   * campo que el abogado escriba — si lo redacta él, vuelve a ser marketing.
   */
  cita: string;
  enLinea: boolean;
  /**
   * ⚠️ En desuso en las superficies públicas desde 2026-08-30: no existe
   * sistema de reseñas, así que este número no lo produce nadie. Se conserva
   * porque el panel del abogado aún lo muestra como métrica propia.
   */
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
    anios: 12,
    responde: "el mismo día",
    cita:
      "El plazo corre desde que terminó el contrato, no desde que te pagaron. Dos meses.",
    enLinea: true,
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
    anios: 15,
    responde: "en 1 día",
    cita:
      "Antes de firmar el pacto social decide quién administra: cambiarlo después cuesta otra escritura.",
    enLinea: true,
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
    anios: 9,
    responde: "en 2 días",
    cita:
      "La licencia ambiental no se pide al final: si arrancas sin ella, la multa la fija MiAmbiente por día.",
    enLinea: false,
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
    anios: 18,
    responde: "el mismo día",
    cita:
      "Pídeme el folio real antes de dar un adelanto. La mitad de mi trabajo es evitar ese pleito.",
    enLinea: true,
    valoracion: "4.6",
    contactos: 9,
    validado: true,
    premium: false,
    // Es notario aunque su práctica esté en Civil y Familia: la credencial no
    // se deduce de la materia. Este perfil existe justamente para probarlo.
    notario: { exequatur: "N-2011-0288", verificado: false },
  },
  {
    id: "gabriela-nunez",
    nombre: "Abg. Gabriela Núñez",
    iniciales: "GN",
    ciudad: "San Pedro Sula",
    materias: ["Consumidor", "Civil"],
    bio: "Reclamos de consumo y garantías: productos vencidos o defectuosos, cobros indebidos y servicios que no cumplieron lo prometido.",
    anios: 11,
    responde: "en 24 horas",
    cita:
      "Antes de pelear, pide el libro de quejas y deja constancia ahí. Ese asiento vale más que diez llamadas al gerente.",
    enLinea: true,
    valoracion: "4.8",
    contactos: 11,
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
    anios: 7,
    responde: "en horas",
    cita:
      "Si te citan a declarar, no vayas solo. Puedes pedir asistencia antes de decir una palabra.",
    enLinea: true,
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
