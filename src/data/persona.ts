/**
 * Persona demo del portal ciudadano (Vía B) — el espejo de ABOGADA_DEMO.
 * TODO(data): tabla `personas` (cuenta gratuita del público general).
 */
export const PERSONA_DEMO = {
  id: "persona-demo",
  nombre: "Carlos Zelaya",
  iniciales: "CZ",
  ciudad: "Tegucigalpa, M.D.C.",
  email: "carlos.zelaya@gmail.com",
  whatsapp: "+504 8888-0000",
  miembroDesde: "agosto 2026",
} as const;

/** Preferencias de notificación del ciudadano (espejo de las del abogado). */
export const PREFERENCIAS_PERSONA = [
  {
    k: "respuestas",
    titulo: "Respuestas a mis consultas",
    desc: "Cuando un abogado responde tu pregunta del consultorio",
  },
  {
    k: "tramites",
    titulo: "Recordatorios de mis trámites",
    desc: "Si dejas un trámite a medias, te recordamos retomarlo",
  },
  {
    k: "novedades",
    titulo: "Guías nuevas y novedades",
    desc: "Cuando publicamos guías de trámites que te pueden servir",
  },
] as const;

/**
 * Novedades de Justihn para el ciudadano — la única parte estática de su
 * bandeja. El resto se deriva EN VIVO de lo que la persona hizo (consultas
 * respondidas, trámites a medias): una notificación semilla que dijera "un
 * abogado respondió" a quien no ha preguntado sería fabricar evidencia (§4.5).
 *
 * TODO(data): tabla `novedades` — anuncios de producto con fecha de publicación.
 */
export const NOVEDADES_PERSONA = [
  {
    id: "notif-p-bienvenida",
    titulo: "Tu cuenta gratis está lista",
    meta: "Guías con tu avance guardado, consultorio y calculadoras — sin costo",
    destino: "/personas",
    /** Se estrena sin leer: es lo primero que la persona ve al entrar. */
    noLeidaPorDefecto: true,
  },
] as const;
