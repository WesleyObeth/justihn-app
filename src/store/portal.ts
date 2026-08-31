"use client";

/**
 * Estado compartido del portal (Blueprint §1: Zustand cuando el estado global
 * crece y tiene muchos suscriptores — aquí lo consumen shell, chat y 13 vistas).
 *
 * Persistencia en localStorage bajo `justihn-portal-v1` (misma clave que el
 * prototipo). Solo estado ligero de preferencia y borrador; nada sensible.
 *
 * SSR-safety (§0.6): `skipHydration` + hidratación explícita tras el mount, de
 * modo que el primer render del servidor y el del cliente coincidan.
 */
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ABOGADA_DEMO, CUOTA_BASE, NOTIFICACIONES } from "@/data/catalogo";
import { VIGILADOS_INICIALES, VIGILADOS_INICIALES_PERSONA } from "@/data/monitoreo";
import type {
  Lead,
  Materia,
  MensajeChat,
  NombreVigilado,
  PlanId,
  MensajeAbogado,
  RespuestaConsulta,
} from "@/types/dominio";

export interface PreferenciasNotificacion {
  digest: boolean;
  email: boolean;
  leads: boolean;
  nombres: boolean;
}

export type CicloPlan = "mensual" | "anual";

interface PortalState {
  plan: PlanId;
  /** Ciclo de pago del plan — el anual (−33%) es la táctica que esquiva el
   *  cobro recurrente sin BAC, por eso es estado real y no un adorno de UI. */
  cicloPlan: CicloPlan;
  iaUsadas: number;
  chat: MensajeChat[];
  conversacionActiva: string | null;
  pensando: boolean;
  pensandoMsg: string;
  borrador: string;
  subs: Record<Materia | string, boolean>;
  prefs: PreferenciasNotificacion;
  bannerValidacionOculto: boolean;
  /** Demo del loop de validación: al "subir" la constancia, el aviso desaparece
   *  en toda la app y el documento pasa a "en revisión". */
  constanciaSubida: boolean;
  /** Notificaciones leídas una a una (clic); convive con "marcar todas". */
  notifsLeidasIds: string[];
  sidebarColapsado: boolean;
  /** Drawer de navegación en pantallas pequeñas. No se persiste. */
  menuMovil: boolean;
  /** Consulta que otra pantalla dejó lista para que el chat la envíe al montar.
   *  No se persiste: vive solo el instante de la navegación. */
  consultaPendiente: string | null;
  /** Checklist del "paso a paso": índices completados por proceso. Persistido. */
  pasosHechos: Record<string, number[]>;
  /** Respuestas publicadas en el consultorio, por lead. Persistido. */
  /** Varias por consulta: el ciudadano compara antes de escribirle a uno. */
  leadsRespondidos: Record<string, RespuestaConsulta[]>;
  /** Nombres bajo monitoreo (feature Pro). Persistido. */
  nombresVigilados: NombreVigilado[];
  /**
   * Los del ciudadano van APARTE de los del abogado: comparten store pero no
   * lista. Mezclarlos le enseñaría a la persona los clientes y contrapartes
   * de la abogada demo — misma lección que las notificaciones.
   */
  nombresVigiladosPersona: NombreVigilado[];
  /** Mensajes que la persona ha enviado a abogados, por abogado. */
  mensajesAbogado: Record<string, MensajeAbogado[]>;
  /** Preguntas hechas desde el consultorio público (Vía B) — aparecen como
   *  leads en el portal de abogados: es el mismo flujo, visto de ambos lados. */
  preguntasPublico: Lead[];
  /** Checklist de trámites del portal ciudadano: pasos completados por trámite.
   *  Un trámite con avance = "en progreso" en el inicio de la persona. */
  pasosTramite: Record<string, number[]>;
  /** Preferencias de notificación del ciudadano. Persistido. */
  prefsPersona: Record<string, boolean>;
  escrito: { abierto: boolean; titulo: string; texto: string };
  toast: string;

  setPlan: (plan: PlanId, ciclo?: CicloPlan) => void;
  setBorrador: (texto: string) => void;
  agregarMensaje: (mensaje: MensajeChat) => void;
  setPensando: (pensando: boolean, mensaje?: string) => void;
  consumirCuota: () => void;
  nuevaConsulta: () => void;
  cargarConversacion: (id: string, mensajes: MensajeChat[]) => void;
  toggleMateria: (materia: string) => void;
  togglePreferencia: (clave: keyof PreferenciasNotificacion) => void;
  ocultarBannerValidacion: () => void;
  subirConstancia: () => void;
  marcarNotifsLeidas: (ids: string[]) => void;
  marcarNotifLeida: (id: string) => void;
  toggleSidebar: () => void;
  setMenuMovil: (abierto: boolean) => void;
  setConsultaPendiente: (consulta: string | null) => void;
  togglePasoHecho: (procesoId: string, indice: number) => void;
  reiniciarProceso: (procesoId: string) => void;
  responderLead: (leadId: string, respuesta: string, abogadoId?: string) => void;
  vigilarNombre: (nombre: string, tipo: NombreVigilado["tipo"]) => void;
  vigilarNombrePersona: (nombre: string) => void;
  escribirAAbogado: (abogadoId: string, materia: Materia, texto: string) => void;
  dejarDeVigilarPersona: (id: string) => void;
  dejarDeVigilar: (id: string) => void;
  preguntarConsultorio: (materia: Materia, ciudad: string, pregunta: string) => void;
  togglePasoTramite: (tramiteId: string, indice: number) => void;
  togglePrefPersona: (clave: string) => void;
  abrirEscrito: (titulo: string, texto: string) => void;
  setTextoEscrito: (texto: string) => void;
  cerrarEscrito: () => void;
  mostrarToast: (mensaje: string) => void;
  ocultarToast: () => void;
}

// Coherente con ABOGADA_DEMO.especialidades (Laboral · Civil · Familia):
// sus materias de práctica arrancan suscritas.
const SUBS_INICIALES: Record<string, boolean> = {
  Laboral: true,
  Civil: true,
  Familia: true,
  Penal: false,
  Constitucional: false,
  "Contencioso Adm.": false,
};

export const usePortal = create<PortalState>()(
  persist(
    (set) => ({
      plan: "profesional",
      cicloPlan: "mensual",
      iaUsadas: 34,
      chat: [],
      conversacionActiva: null,
      pensando: false,
      pensandoMsg: "",
      borrador: "",
      subs: SUBS_INICIALES,
      prefs: { digest: true, email: true, leads: true, nombres: false },
      bannerValidacionOculto: false,
      constanciaSubida: false,
      notifsLeidasIds: [],
      sidebarColapsado: false,
      menuMovil: false,
      consultaPendiente: null,
      pasosHechos: {},
      leadsRespondidos: {},
      nombresVigilados: VIGILADOS_INICIALES,
      nombresVigiladosPersona: VIGILADOS_INICIALES_PERSONA,
      mensajesAbogado: {},
      preguntasPublico: [],
      pasosTramite: {},
      prefsPersona: { respuestas: true, tramites: true, novedades: false },
      escrito: { abierto: false, titulo: "", texto: "" },
      toast: "",

      setPlan: (plan, ciclo) => set((s) => ({ plan, cicloPlan: ciclo ?? s.cicloPlan })),
      setBorrador: (borrador) => set({ borrador }),
      agregarMensaje: (mensaje) => set((s) => ({ chat: [...s.chat, mensaje] })),
      setPensando: (pensando, mensaje) =>
        set((s) => ({ pensando, pensandoMsg: mensaje ?? s.pensandoMsg })),
      consumirCuota: () =>
        set((s) => (s.plan === "premium" ? s : { iaUsadas: Math.min(CUOTA_BASE, s.iaUsadas + 1) })),
      nuevaConsulta: () =>
        set({ chat: [], conversacionActiva: null, borrador: "", pensando: false }),
      cargarConversacion: (id, mensajes) =>
        set({ chat: mensajes, conversacionActiva: id, pensando: false, borrador: "" }),
      toggleMateria: (materia) =>
        set((s) => ({ subs: { ...s.subs, [materia]: !s.subs[materia] } })),
      togglePreferencia: (clave) =>
        set((s) => ({ prefs: { ...s.prefs, [clave]: !s.prefs[clave] } })),
      ocultarBannerValidacion: () => set({ bannerValidacionOculto: true }),
      subirConstancia: () => set({ constanciaSubida: true }),
      marcarNotifsLeidas: (ids) =>
        set((s) => ({ notifsLeidasIds: [...new Set([...s.notifsLeidasIds, ...ids])] })),
      marcarNotifLeida: (id) =>
        set((s) =>
          s.notifsLeidasIds.includes(id) ? s : { notifsLeidasIds: [...s.notifsLeidasIds, id] },
        ),
      toggleSidebar: () => set((s) => ({ sidebarColapsado: !s.sidebarColapsado })),
      setMenuMovil: (menuMovil) => set({ menuMovil }),
      setConsultaPendiente: (consultaPendiente) => set({ consultaPendiente }),
      togglePasoHecho: (procesoId, indice) =>
        set((s) => {
          const actuales = s.pasosHechos[procesoId] ?? [];
          const siguientes = actuales.includes(indice)
            ? actuales.filter((i) => i !== indice)
            : [...actuales, indice];
          return { pasosHechos: { ...s.pasosHechos, [procesoId]: siguientes } };
        }),
      reiniciarProceso: (procesoId) =>
        set((s) => ({ pasosHechos: { ...s.pasosHechos, [procesoId]: [] } })),
      // Añade, no reemplaza. Un mismo abogado reescribe LA SUYA; otro abogado
      // suma la propia — que es lo que el portal del abogado ya prometía.
      responderLead: (leadId, respuesta, abogadoId = ABOGADA_DEMO.id) =>
        set((s) => {
          const previas = s.leadsRespondidos[leadId] ?? [];
          const mia: RespuestaConsulta = { abogadoId, texto: respuesta, cuando: "reciente" };
          const yaEstaba = previas.some((r) => r.abogadoId === abogadoId);
          return {
            leadsRespondidos: {
              ...s.leadsRespondidos,
              [leadId]: yaEstaba
                ? previas.map((r) => (r.abogadoId === abogadoId ? mia : r))
                : [...previas, mia],
            },
          };
        }),
      // id = slug del nombre: determinista y evita duplicados por diseño.
      vigilarNombre: (nombre, tipo) =>
        set((s) => {
          const id = `vig-${nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}`;
          if (s.nombresVigilados.some((v) => v.id === id)) return s;
          return { nombresVigilados: [...s.nombresVigilados, { id, nombre, tipo }] };
        }),
      dejarDeVigilar: (id) =>
        set((s) => ({ nombresVigilados: s.nombresVigilados.filter((v) => v.id !== id) })),
      // La persona solo vigila nombres "propios": los suyos y los de su familia.
      // No hay clientes ni contrapartes en la vía B.
      vigilarNombrePersona: (nombre) =>
        set((s) => {
          const id = `vigp-${nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}`;
          if (s.nombresVigiladosPersona.some((v) => v.id === id)) return s;
          return {
            nombresVigiladosPersona: [
              ...s.nombresVigiladosPersona,
              { id, nombre, tipo: "propio" as const },
            ],
          };
        }),
      escribirAAbogado: (abogadoId, materia, texto) =>
        set((s) => ({
          mensajesAbogado: {
            ...s.mensajesAbogado,
            [abogadoId]: [
              ...(s.mensajesAbogado[abogadoId] ?? []),
              { abogadoId, materia, texto, cuando: "reciente" },
            ],
          },
        })),
      dejarDeVigilarPersona: (id) =>
        set((s) => ({
          nombresVigiladosPersona: s.nombresVigiladosPersona.filter((v) => v.id !== id),
        })),
      preguntarConsultorio: (materia, ciudad, pregunta) =>
        set((s) => ({
          preguntasPublico: [
            {
              id: `pub-${Date.now()}`,
              materia,
              ciudad,
              cuando: "reciente",
              nuevo: true,
              respuestas: 0,
              pregunta,
            },
            ...s.preguntasPublico,
          ],
        })),
      togglePasoTramite: (tramiteId, indice) =>
        set((s) => {
          const actuales = s.pasosTramite[tramiteId] ?? [];
          const siguientes = actuales.includes(indice)
            ? actuales.filter((i) => i !== indice)
            : [...actuales, indice];
          return { pasosTramite: { ...s.pasosTramite, [tramiteId]: siguientes } };
        }),
      togglePrefPersona: (clave) =>
        set((s) => ({ prefsPersona: { ...s.prefsPersona, [clave]: !s.prefsPersona[clave] } })),
      abrirEscrito: (titulo, texto) => set({ escrito: { abierto: true, titulo, texto } }),
      setTextoEscrito: (texto) => set((s) => ({ escrito: { ...s.escrito, texto } })),
      cerrarEscrito: () => set((s) => ({ escrito: { ...s.escrito, abierto: false } })),
      mostrarToast: (toast) => set({ toast }),
      ocultarToast: () => set({ toast: "" }),
    }),
    {
      name: "justihn-portal-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      /**
       * Migraciones encadenadas, de la más vieja a la más nueva.
       *  v1: los ids de plan (base→profesional, pro→premium) al fijar la marca.
       *  v2: `leadsRespondidos` pasó de `Record<id, string>` a una LISTA de
       *      respuestas. Sin esto, un navegador con datos previos haría `.map`
       *      sobre un string y la pantalla reventaría — el store se persiste
       *      desde el primer día, así que hay gente con el formato viejo.
       */
      version: 2,
      migrate: (persistido, version) => {
        const s = persistido as
          | { plan?: string; leadsRespondidos?: Record<string, unknown> }
          | undefined;
        if (!s) return persistido;

        if (version < 1) {
          if (s.plan === "base") s.plan = "profesional";
          if (s.plan === "pro") s.plan = "premium";
        }

        if (version < 2 && s.leadsRespondidos) {
          s.leadsRespondidos = Object.fromEntries(
            Object.entries(s.leadsRespondidos).map(([id, valor]) => [
              id,
              typeof valor === "string"
                ? [{ abogadoId: ABOGADA_DEMO.id, texto: valor, cuando: "reciente" }]
                : Array.isArray(valor)
                  ? valor
                  : [],
            ]),
          );
        }
        return persistido;
      },
      partialize: (s) => ({
        plan: s.plan,
        cicloPlan: s.cicloPlan,
        iaUsadas: s.iaUsadas,
        chat: s.chat,
        conversacionActiva: s.conversacionActiva,
        subs: s.subs,
        prefs: s.prefs,
        bannerValidacionOculto: s.bannerValidacionOculto,
        constanciaSubida: s.constanciaSubida,
        pasosHechos: s.pasosHechos,
        leadsRespondidos: s.leadsRespondidos,
        nombresVigilados: s.nombresVigilados,
        nombresVigiladosPersona: s.nombresVigiladosPersona,
        mensajesAbogado: s.mensajesAbogado,
        preguntasPublico: s.preguntasPublico,
        pasosTramite: s.pasosTramite,
        prefsPersona: s.prefsPersona,
        notifsLeidasIds: s.notifsLeidasIds,
        sidebarColapsado: s.sidebarColapsado,
      }),
    },
  ),
);

/**
 * Si el store ya se rehidrató desde `localStorage`.
 *
 * Con `skipHydration` el primer render del cliente ve el estado inicial, así
 * que una pantalla que busca un registro POR ID no puede distinguir "todavía no
 * cargó" de "no existe" — y enseñaría un 404 falso durante un instante a quien
 * recargue en el detalle de su consulta. `useSyncExternalStore` sobre
 * `onFinishHydration` es el mecanismo previsto (el mismo patrón de
 * `hooks/use-saludo.ts`), y devuelve `false` en SSR.
 */
export function useStoreHidratado(): boolean {
  return useSyncExternalStore(
    (alCambiar) => usePortal.persist.onFinishHydration(alCambiar),
    () => usePortal.persist.hasHydrated(),
    () => false,
  );
}

/**
 * Notificaciones sin leer — un único lugar para la insignia del menú y la
 * vista. Recibe la lista porque cada portal tiene la suya: los ids del abogado
 * y los del ciudadano conviven en `notifsLeidasIds` sin pisarse, y así "marcar
 * todas" en un portal no silencia las del otro.
 */
export function useNotifsSinLeer(
  lista: { id: string; noLeidaPorDefecto: boolean }[] = NOTIFICACIONES,
): number {
  const ids = usePortal((s) => s.notifsLeidasIds);
  return lista.filter((n) => n.noLeidaPorDefecto && !ids.includes(n.id)).length;
}

/** Cuota derivada — un único lugar decide qué significa "ilimitada". */
export function useCuota() {
  const plan = usePortal((s) => s.plan);
  const usadas = usePortal((s) => s.iaUsadas);
  const esPremium = plan === "premium";
  return {
    esPremium,
    usadas,
    max: CUOTA_BASE,
    restantes: esPremium ? null : Math.max(0, CUOTA_BASE - usadas),
    etiqueta: esPremium ? "Ilimitada" : `${usadas}/${CUOTA_BASE}`,
    etiquetaLarga: esPremium ? "Ilimitada" : `${usadas} / ${CUOTA_BASE}`,
    porcentaje: esPremium ? 18 : Math.round((usadas / CUOTA_BASE) * 100),
  };
}
