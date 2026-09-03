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
import { PERSONA_DEMO } from "@/data/persona";
import { VIGILADOS_INICIALES, VIGILADOS_INICIALES_PERSONA } from "@/data/monitoreo";
import type {
  Caso,
  DocumentoCaso,
  Lead,
  Materia,
  MensajeChat,
  PlazoCaso,
  PropuestaHonorarios,
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
  /** Leads que ESTE abogado ya abrió — «NUEVO» es estado del lector, no de la fila. */
  leadsVistosIds: string[];
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
  /**
   * A quién ha consultado en el Informe Verifica, para volver sin reescribir.
   * Vive SOLO en su navegador y se puede borrar: un registro de a quién
   * investiga alguien es de lo más sensible que guarda este producto (§5).
   */
  consultasVerifica: string[];
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
  /** Expedientes del despacho («Mis casos»). Persistido. */
  casos: Caso[];
  /** Propuestas de honorarios guardadas. Persistido. */
  propuestas: PropuestaHonorarios[];

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
  marcarLeadVisto: (id: string) => void;
  toggleSidebar: () => void;
  setMenuMovil: (abierto: boolean) => void;
  setConsultaPendiente: (consulta: string | null) => void;
  togglePasoHecho: (procesoId: string, indice: number) => void;
  reiniciarProceso: (procesoId: string) => void;
  responderLead: (leadId: string, respuesta: string, abogadoId?: string) => void;
  vigilarNombre: (nombre: string, tipo: NombreVigilado["tipo"]) => void;
  vigilarNombrePersona: (nombre: string, tipo?: "propio" | "familiar") => void;
  escribirAAbogado: (abogadoId: string, materia: Materia, texto: string) => void;
  registrarConsultaVerifica: (nombre: string) => void;
  olvidarConsultasVerifica: () => void;
  /** Habeas data de verdad (§5): borra una categoría, o todo. */
  borrarDatosPersona: (que: CategoriaDatos | "todo") => void;
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
  /** Devuelve el id del caso creado. */
  crearCaso: (
    datos: Pick<Caso, "cliente" | "tipo" | "referenciaId" | "titulo" | "notas"> & {
      documentos: DocumentoCaso[];
      plazos?: PlazoCaso[];
    },
  ) => string;
  actualizarCaso: (
    id: string,
    cambios: Partial<Pick<Caso, "estado" | "notas" | "cliente" | "propuestaId">>,
  ) => void;
  toggleDocumentoCaso: (casoId: string, indice: number) => void;
  agregarDocumentoCaso: (casoId: string, titulo: string) => void;
  agregarPlazoCaso: (casoId: string, titulo: string, fechaIso: string) => void;
  quitarPlazoCaso: (casoId: string, plazoId: string) => void;
  eliminarCaso: (id: string) => void;
  /** Devuelve el id (nuevo o el mismo si venía). */
  guardarPropuesta: (p: Omit<PropuestaHonorarios, "id" | "abogadoId" | "creadoEn"> & { id?: string }) => string;
  eliminarPropuesta: (id: string) => void;
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

/**
 * Las migraciones del estado persistido, exportadas para poder probarlas con
 * un estado en formato viejo sin pasar por `localStorage`.
 */
export function migrarPersistido(persistido: unknown, version: number): unknown {
  const s = persistido as
    | {
        plan?: string;
        leadsRespondidos?: Record<string, unknown>;
        mensajesAbogado?: Record<string, unknown>;
    preguntasPublico?: unknown[];
    casos?: unknown;
    propuestas?: unknown;
      }
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
          ? [{ abogadoId: ABOGADA_DEMO.id, texto: valor, creadoEn: new Date().toISOString() }]
          : Array.isArray(valor)
            ? valor
            : [],
      ]),
    );
  }
  if (version < 3) {
    const VIEJO = "demo-abogada-castillo";
    const renombrar = (r: unknown) =>
      r && typeof r === "object" && (r as { abogadoId?: string }).abogadoId === VIEJO
        ? { ...(r as object), abogadoId: ABOGADA_DEMO.id }
        : r;
    if (s.leadsRespondidos) {
      s.leadsRespondidos = Object.fromEntries(
        Object.entries(s.leadsRespondidos).map(([id, valor]) => [
          id,
          Array.isArray(valor) ? valor.map(renombrar) : valor,
        ]),
      );
    }
    if (s.mensajesAbogado && VIEJO in s.mensajesAbogado) {
      const { [VIEJO]: viejos, ...resto } = s.mensajesAbogado;
      const nuevos = resto[ABOGADA_DEMO.id];
      s.mensajesAbogado = {
        ...resto,
        [ABOGADA_DEMO.id]: [
          ...(Array.isArray(nuevos) ? nuevos : []),
          ...(Array.isArray(viejos) ? viejos.map(renombrar) : []),
        ],
      };
    }
  }
  /**
   * v4: el texto de pantalla («reciente») deja de vivir en el dato. Lo que
   * ya estaba guardado no trae instante: se le pone el de la migración, que es
   * la cota más honesta que se conoce (se escribió ANTES de ahora) — y es lo
   * que la pantalla decía hasta hoy. Los datos nuevos llevan su ISO real.
   */
  if (version < 4) {
    const ahora = new Date().toISOString();
    const conInstante = (x: unknown) => {
      const fila = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      const { cuando: _cuando, ...resto } = fila;
      return { ...resto, creadoEn: typeof fila.creadoEn === "string" ? fila.creadoEn : ahora };
    };
    const porClave = (r: unknown) =>
      r && typeof r === "object"
        ? Object.fromEntries(
            Object.entries(r as Record<string, unknown>).map(([k, lista]) => [
              k,
              Array.isArray(lista) ? lista.map(conInstante) : [],
            ]),
          )
        : {};
    if (s.leadsRespondidos) s.leadsRespondidos = porClave(s.leadsRespondidos);
    if (s.mensajesAbogado) s.mensajesAbogado = porClave(s.mensajesAbogado);
    if (Array.isArray(s.preguntasPublico)) s.preguntasPublico = s.preguntasPublico.map(conInstante);
  }

  // v5: la fila del lead sin estado de lector ni conteos.
  if (version < 5 && Array.isArray(s.preguntasPublico)) {
    s.preguntasPublico = s.preguntasPublico.map((x) => {
      const fila = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
      const { nuevo: _nuevo, respuestas: _respuestas, respuestaDemo: _demo, ...resto } = fila;
      return { ...resto, personaId: typeof fila.personaId === "string" ? fila.personaId : PERSONA_DEMO.id };
    });
  }

  // v6: Mis casos y propuestas de honorarios. Listas vacías si no existían.
  if (version < 6) {
    if (!Array.isArray(s.casos)) s.casos = [];
    if (!Array.isArray(s.propuestas)) s.propuestas = [];
  }

  return persistido;
}

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
      leadsVistosIds: [],
      sidebarColapsado: false,
      menuMovil: false,
      consultaPendiente: null,
      pasosHechos: {},
      leadsRespondidos: {},
      nombresVigilados: VIGILADOS_INICIALES,
      nombresVigiladosPersona: VIGILADOS_INICIALES_PERSONA,
      mensajesAbogado: {},
      consultasVerifica: [],
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
      marcarLeadVisto: (id) =>
        set((s) =>
          s.leadsVistosIds.includes(id) ? s : { leadsVistosIds: [...s.leadsVistosIds, id] },
        ),
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
          const mia: RespuestaConsulta = {
            abogadoId,
            texto: respuesta,
            creadoEn: new Date().toISOString(),
          };
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
      vigilarNombrePersona: (nombre, tipo = "propio") =>
        set((s) => {
          const id = `vigp-${nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}`;
          if (s.nombresVigiladosPersona.some((v) => v.id === id)) return s;
          return {
            nombresVigiladosPersona: [...s.nombresVigiladosPersona, { id, nombre, tipo }],
          };
        }),
      escribirAAbogado: (abogadoId, materia, texto) =>
        set((s) => ({
          mensajesAbogado: {
            ...s.mensajesAbogado,
            [abogadoId]: [
              ...(s.mensajesAbogado[abogadoId] ?? []),
              { abogadoId, materia, texto, creadoEn: new Date().toISOString() },
            ],
          },
        })),
      // Sin duplicados y con la última primero; se guardan 8 como mucho.
      registrarConsultaVerifica: (nombre) =>
        set((s) => {
          const limpio = nombre.trim();
          if (limpio.length < 4) return s;
          const resto = s.consultasVerifica.filter((n) => n.toLowerCase() !== limpio.toLowerCase());
          return { consultasVerifica: [limpio, ...resto].slice(0, 8) };
        }),
      olvidarConsultasVerifica: () => set({ consultasVerifica: [] }),
      borrarDatosPersona: (que) =>
        set(() => {
          const vacio = {
            consultas: { preguntasPublico: [], leadsRespondidos: {} },
            tramites: { pasosTramite: {} },
            vigilados: { nombresVigiladosPersona: [] },
            mensajes: { mensajesAbogado: {} },
            verifica: { consultasVerifica: [] },
          } as const;
          if (que === "todo") return Object.assign({}, ...Object.values(vacio));
          return vacio[que];
        }),
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
              creadoEn: new Date().toISOString(),
              pregunta,
              // Fase 1: un solo navegador, una sola persona. En Fase 2 la
              // consulta nace anónima y toma dueño al crear la cuenta (§7.2).
              personaId: PERSONA_DEMO.id,
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
      casos: [],
      propuestas: [],
      crearCaso: (datos) => {
        const id = `caso-${Date.now().toString(36)}`;
        const ahora = new Date().toISOString();
        set((s) => ({
          casos: [
            {
              id,
              abogadoId: ABOGADA_DEMO.id,
              cliente: datos.cliente,
              tipo: datos.tipo,
              referenciaId: datos.referenciaId,
              titulo: datos.titulo,
              estado: "abierto",
              documentos: datos.documentos,
              plazos: datos.plazos ?? [],
              notas: datos.notas,
              creadoEn: ahora,
              actualizadoEn: ahora,
            },
            ...s.casos,
          ],
        }));
        return id;
      },
      actualizarCaso: (id, cambios) =>
        set((s) => ({
          casos: s.casos.map((c) =>
            c.id === id ? { ...c, ...cambios, actualizadoEn: new Date().toISOString() } : c,
          ),
        })),
      toggleDocumentoCaso: (casoId, indice) =>
        set((s) => ({
          casos: s.casos.map((c) =>
            c.id === casoId
              ? {
                  ...c,
                  documentos: c.documentos.map((d, i) =>
                    i === indice ? { ...d, recibido: !d.recibido } : d,
                  ),
                  actualizadoEn: new Date().toISOString(),
                }
              : c,
          ),
        })),
      agregarDocumentoCaso: (casoId, titulo) =>
        set((s) => ({
          casos: s.casos.map((c) =>
            c.id === casoId
              ? { ...c, documentos: [...c.documentos, { titulo, recibido: false }] }
              : c,
          ),
        })),
      agregarPlazoCaso: (casoId, titulo, fechaIso) =>
        set((s) => ({
          casos: s.casos.map((c) =>
            c.id === casoId
              ? {
                  ...c,
                  plazos: [
                    ...c.plazos,
                    { id: `plazo-${Date.now().toString(36)}`, titulo, fechaIso },
                  ].sort((a, b) => a.fechaIso.localeCompare(b.fechaIso)),
                }
              : c,
          ),
        })),
      quitarPlazoCaso: (casoId, plazoId) =>
        set((s) => ({
          casos: s.casos.map((c) =>
            c.id === casoId ? { ...c, plazos: c.plazos.filter((p) => p.id !== plazoId) } : c,
          ),
        })),
      eliminarCaso: (id) => set((s) => ({ casos: s.casos.filter((c) => c.id !== id) })),
      guardarPropuesta: (p) => {
        const id = p.id ?? `prop-${Date.now().toString(36)}`;
        set((s) => {
          const existente = s.propuestas.find((x) => x.id === id);
          const fila: PropuestaHonorarios = {
            ...p,
            id,
            abogadoId: ABOGADA_DEMO.id,
            creadoEn: existente?.creadoEn ?? new Date().toISOString(),
          };
          return {
            propuestas: existente
              ? s.propuestas.map((x) => (x.id === id ? fila : x))
              : [fila, ...s.propuestas],
          };
        });
        return id;
      },
      eliminarPropuesta: (id) =>
        set((s) => ({
          propuestas: s.propuestas.filter((p) => p.id !== id),
          casos: s.casos.map((c) => (c.propuestaId === id ? { ...c, propuestaId: undefined } : c)),
        })),
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
       *  v3: la abogada demo pasó a tener UN id (`maria-castillo`, el de su
       *      ficha pública); el viejo `demo-abogada-castillo` vivía en las
       *      respuestas del consultorio y en las claves de `mensajesAbogado`.
       *  v4: `cuando` («reciente», texto de pantalla) pasó a `creadoEn` (ISO)
       *      en respuestas, mensajes y preguntas del consultorio.
       *  v5: `Lead` se quedó solo con la fila: fuera `nuevo` y `respuestas`
       *      (estado del lector y conteo derivado) y entra `personaId`.
       *  v6: nacen `casos` y `propuestas` (Mis casos + propuestas de
       *      honorarios). Solo hay que garantizar que existan como listas.
       */
      version: 6,
      migrate: migrarPersistido,
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
        consultasVerifica: s.consultasVerifica,
        preguntasPublico: s.preguntasPublico,
        pasosTramite: s.pasosTramite,
        prefsPersona: s.prefsPersona,
        notifsLeidasIds: s.notifsLeidasIds,
        leadsVistosIds: s.leadsVistosIds,
        sidebarColapsado: s.sidebarColapsado,
        casos: s.casos,
        propuestas: s.propuestas,
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
/** Las categorías de datos propios que la persona puede revisar y borrar. */
export type CategoriaDatos = "consultas" | "tramites" | "vigilados" | "mensajes" | "verifica";

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
