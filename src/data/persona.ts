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
