import { supabaseServidor } from "./servidor";
import type { Materia, PerfilAbogado, PlanId } from "@/types/dominio";

/**
 * El perfil del abogado de la SESIÓN, leído de la tabla `abogados`.
 *
 * Hasta el 2026-09-03 el portal entero se pintaba con `ABOGADA_DEMO`: quien
 * entraba con su cuenta veía «María Castillo» en la barra, en el saludo del
 * Dashboard y en el membrete de sus propuestas de honorarios. La fila ya
 * existía en Supabase desde el alta — solo que nadie la leía: `mi_destino()`
 * se usaba para decidir a qué portal entrar y ahí se acababa.
 *
 * Se lee en el SERVIDOR y baja por contexto (`ProveedorPerfil`), no con un
 * fetch en cliente: así el nombre llega en el primer HTML y no hay un
 * parpadeo de «María Castillo» antes del nombre verdadero.
 *
 * ⚠️ **Devuelve solo lo que la tabla sabe.** Lo que aún no tiene columna
 * —métricas del perfil, sobre todo— sigue viniendo del seed en `useMiPerfil()`,
 * y se marca ahí. Inventar un «4.9 de valoración» para una cuenta nueva es
 * exactamente lo que prohíbe §4.5.
 */
export type PerfilReal = Pick<
  PerfilAbogado,
  | "id"
  | "nombre"
  | "nombreCorto"
  | "iniciales"
  | "colegiacionNumero"
  | "ciudad"
  | "bio"
  | "especialidades"
  | "email"
  | "whatsapp"
  | "direccion"
  | "verificado"
> & { plan: PlanId };

/** Fila de `abogados` tal como la devuelve PostgREST. */
interface FilaAbogado {
  id: string;
  nombre: string;
  nombre_corto: string;
  iniciales: string;
  colegiacion_numero: string;
  ciudad: string;
  bio: string;
  materias: Materia[];
  email_publico: string | null;
  whatsapp: string | null;
  direccion: string | null;
  verificado: boolean;
  plan: string;
}

/** Los planes que el portal sabe pintar; cualquier otro cae a `gratis`. */
const PLANES: readonly PlanId[] = ["gratis", "profesional", "premium"];

export async function miPerfilAbogado(): Promise<PerfilReal | null> {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // RLS ya limita a la fila propia (`abogados_leer`); el filtro por id es
  // explícito de todos modos, para que la consulta se lea sola.
  const { data, error } = await supabase
    .from("abogados")
    .select(
      "id, nombre, nombre_corto, iniciales, colegiacion_numero, ciudad, bio, materias, email_publico, whatsapp, direccion, verificado, plan",
    )
    .eq("id", user.id)
    .maybeSingle<FilaAbogado>();

  // Sin ficha no hay perfil de abogado: es una cuenta de la vía B que abrió
  // `/abogados` por URL. No se inventa uno — el portal cae al demo y lo dice.
  if (error || !data) return null;

  return {
    id: data.id,
    nombre: data.nombre,
    nombreCorto: data.nombre_corto,
    iniciales: data.iniciales,
    colegiacionNumero: data.colegiacion_numero,
    ciudad: data.ciudad,
    bio: data.bio,
    especialidades: data.materias,
    email: data.email_publico ?? user.email ?? "",
    whatsapp: data.whatsapp ?? "",
    direccion: data.direccion ?? "",
    verificado: data.verificado,
    plan: (PLANES as readonly string[]).includes(data.plan) ? (data.plan as PlanId) : "gratis",
  };
}
