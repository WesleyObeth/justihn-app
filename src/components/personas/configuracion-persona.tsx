"use client";

/**
 * Configuración del ciudadano.
 *
 * Lo que la distingue de la del abogado: **el habeas data aquí es funcional, no
 * un aviso**. §5 del CLAUDE.md del producto lo exige desde el día 1 — "canal de
 * supresión/revisión funcional desde la plataforma" —, y la pantalla lo
 * prometía con dos botones que solo enseñaban un toast. Ahora enseña QUÉ guarda
 * de verdad, con su cuenta, y deja borrar cada cosa o descargarlo todo.
 *
 * Los datos salen del store, así que la lista no puede desfasarse: si mañana se
 * guarda algo nuevo, aparece aquí o el test lo topa.
 */
import { useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { Boton, Card, TituloSeccion, TogglePill } from "@/components/ui/primitivos";
import { PERSONA_DEMO, PREFERENCIAS_PERSONA } from "@/data/persona";
import { TRAMITES } from "@/data/tramites";
import { usePortal, type CategoriaDatos } from "@/store/portal";

export function ConfiguracionPersona() {
  const prefs = usePortal((s) => s.prefsPersona);
  const togglePrefPersona = usePortal((s) => s.togglePrefPersona);
  const mostrarToast = usePortal((s) => s.mostrarToast);

  // El seed es `as const`, así que sin el tipo explícito React infiere los
  // literales y ningún otro texto entra en el campo.
  const [cuenta, setCuenta] = useState<{ nombre: string; correo: string; whatsapp: string }>({
    nombre: PERSONA_DEMO.nombre,
    correo: PERSONA_DEMO.email,
    whatsapp: PERSONA_DEMO.whatsapp,
  });
  const [guardada, setGuardada] = useState(cuenta);
  const hayCambios =
    cuenta.nombre !== guardada.nombre ||
    cuenta.correo !== guardada.correo ||
    cuenta.whatsapp !== guardada.whatsapp;

  const guardar = () => {
    setGuardada(cuenta);
    mostrarToast("Cambios guardados");
  };

  return (
    <div className="flex max-w-[900px] flex-col gap-4" style={{ animation: "fadeUp .3s ease" }}>
      <h1 className="font-display text-[24px] font-bold">Configuración</h1>

      <Card className="p-6">
        <TituloSeccion className="text-base font-bold">Cuenta</TituloSeccion>
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Campo
            etiqueta="Nombre completo"
            value={cuenta.nombre}
            onChange={(v) => setCuenta({ ...cuenta, nombre: v })}
          />
          <Campo
            etiqueta="Correo"
            type="email"
            value={cuenta.correo}
            onChange={(v) => setCuenta({ ...cuenta, correo: v })}
          />
          <Campo
            etiqueta="WhatsApp"
            type="tel"
            value={cuenta.whatsapp}
            onChange={(v) => setCuenta({ ...cuenta, whatsapp: v })}
          />
          <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
            Contraseña
            <button
              type="button"
              onClick={() => mostrarToast("Te enviamos un enlace de cambio a tu correo")}
              className="cursor-pointer rounded-lg border border-borde bg-lienzo px-3 py-2.5 text-left text-[13px] text-marino hover:border-celeste"
            >
              Cambiar contraseña…
            </button>
          </label>
        </div>

        {/* El botón vive DENTRO de su card: los interruptores de abajo guardan
            solos, y al pie de la página parecía que nada se guardaba sin él. */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-borde pt-4">
          <Boton variante="celeste" onClick={guardar} disabled={!hayCambios}>
            Guardar cambios
          </Boton>
          <span className="text-[12px] text-texto-4">
            {hayCambios ? "Tienes cambios sin guardar" : "Todo guardado"}
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <TituloSeccion className="text-base font-bold">Notificaciones</TituloSeccion>
        {/* Antes no decía POR DÓNDE avisa, teniendo los dos canales arriba. */}
        <p className="mt-1 text-[12.5px] leading-[1.6] text-texto-3">
          Te llegan a <b className="text-marino">{guardada.correo}</b> y a tu WhatsApp{" "}
          <b className="text-marino">{guardada.whatsapp}</b>, y siempre quedan en{" "}
          <a href="/personas/notificaciones">tus avisos</a>.
        </p>
        <div className="mt-3.5 flex flex-col">
          {PREFERENCIAS_PERSONA.map((p) => (
            <div
              key={p.k}
              className="flex items-center gap-4 border-b border-borde-suave py-3.5 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold">{p.titulo}</div>
                <p className="mt-0.5 text-[12.5px] leading-[1.5] text-texto-3">{p.desc}</p>
              </div>
              <TogglePill
                activo={prefs[p.k] === true}
                onToggle={() => togglePrefPersona(p.k)}
                etiqueta={p.titulo}
              />
            </div>
          ))}
        </div>
      </Card>

      <MisDatos />
    </div>
  );
}

/**
 * Habeas data funcional.
 *
 * Las cifras se derivan del store: es exactamente lo que Justihn guarda de esta
 * persona hoy. Cada categoría se borra por separado porque no todo pesa igual —
 * el historial del Informe Verifica (a quién consultó) es lo más sensible y
 * puede querer borrarlo sin perder el avance de sus trámites.
 */
function MisDatos() {
  const preguntas = usePortal((s) => s.preguntasPublico);
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const vigilados = usePortal((s) => s.nombresVigiladosPersona);
  const mensajes = usePortal((s) => s.mensajesAbogado);
  const consultasVerifica = usePortal((s) => s.consultasVerifica);
  const borrar = usePortal((s) => s.borrarDatosPersona);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [confirmando, setConfirmando] = useState(false);

  const enProgreso = TRAMITES.filter((t) => (pasosTramite[t.id] ?? []).length > 0).length;
  const totalMensajes = Object.values(mensajes).reduce((n, m) => n + m.length, 0);

  const categorias: {
    clave: CategoriaDatos;
    icono: NombreIcono;
    titulo: string;
    detalle: string;
    cuenta: number;
  }[] = [
    {
      clave: "consultas",
      icono: "leads",
      titulo: "Tus consultas del consultorio",
      detalle: "La pregunta y las respuestas que te dieron. Se publican sin tu nombre.",
      cuenta: preguntas.length,
    },
    {
      clave: "tramites",
      icono: "pasos",
      titulo: "El avance de tus trámites",
      detalle: "Qué pasos marcaste como hechos en cada guía.",
      cuenta: enProgreso,
    },
    {
      clave: "vigilados",
      icono: "bell",
      titulo: "Nombres que vigilas",
      detalle: "El tuyo y el de tu familia, para avisarte si aparecen.",
      cuenta: vigilados.length,
    },
    {
      clave: "mensajes",
      icono: "correo",
      titulo: "Mensajes a abogados",
      detalle: "Lo que les escribiste desde su perfil.",
      cuenta: totalMensajes,
    },
    {
      clave: "verifica",
      icono: "buscar",
      titulo: "A quién consultaste en Informe Verifica",
      detalle: "Solo se guarda en este navegador y no sale de aquí.",
      cuenta: consultasVerifica.length,
    },
  ];

  const total = categorias.reduce((n, c) => n + c.cuenta, 0);

  /** Descarga real, no un aviso: el derecho de acceso se ejerce aquí mismo. */
  const descargar = () => {
    const datos = {
      generado: new Date().toISOString(),
      cuenta: { nombre: PERSONA_DEMO.nombre, correo: PERSONA_DEMO.email },
      consultas: preguntas,
      tramitesConAvance: pasosTramite,
      nombresVigilados: vigilados,
      mensajesAAbogados: mensajes,
      consultasVerifica,
      nota: "Datos de tu cuenta de Justihn. Demo de validación: hoy salen de tu navegador.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "mis-datos-justihn.json";
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast("Descargamos tus datos en un archivo");
  };

  return (
    <Card className="p-6">
      <TituloSeccion className="text-base font-bold">Privacidad y datos</TituloSeccion>
      <p className="mt-1 text-[12.5px] leading-[1.6] text-texto-3">
        Tienes derecho a acceder, revisar y pedir la supresión de tus datos personales (habeas
        data, art. 182 de la Constitución). Esto es todo lo que Justihn guarda de ti:
      </p>

      <div className="mt-3.5 flex flex-col">
        {categorias.map((c) => (
          <div
            key={c.clave}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-borde-suave py-3.5 last:border-b-0"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lienzo text-texto-4">
              <Icono nombre={c.icono} size={14} />
            </span>
            <div className="min-w-[min(240px,100%)] flex-1">
              <div className="text-[13.5px] font-semibold">
                {c.titulo}{" "}
                <span className={c.cuenta > 0 ? "text-celeste" : "text-texto-4"}>
                  ({c.cuenta})
                </span>
              </div>
              <p className="mt-0.5 text-[12px] leading-[1.5] text-texto-3">{c.detalle}</p>
            </div>
            <button
              type="button"
              disabled={c.cuenta === 0}
              onClick={() => {
                borrar(c.clave);
                mostrarToast(`Borramos: ${c.titulo.toLowerCase()}`);
              }}
              className="cursor-pointer rounded-lg border border-borde bg-lienzo px-3.5 py-2 text-[12.5px] font-medium text-marino hover:border-celeste disabled:cursor-not-allowed disabled:opacity-40"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-borde pt-4">
        <Boton onClick={descargar}>Descargar mis datos</Boton>
        {confirmando ? (
          <>
            <button
              type="button"
              onClick={() => {
                borrar("todo");
                setConfirmando(false);
                mostrarToast("Borramos todos tus datos de este navegador");
              }}
              className="cursor-pointer rounded-lg bg-urgente px-4 py-2.5 text-[13px] font-semibold text-white hover:opacity-90"
            >
              Sí, borrar todo
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="cursor-pointer text-[12.5px] font-medium text-texto-3 hover:text-marino"
            >
              Cancelar
            </button>
          </>
        ) : (
          /* Borrar todo pide confirmación; borrar una categoría no. Deshacer no
             existe, y el peso del error es muy distinto. */
          <button
            type="button"
            disabled={total === 0}
            onClick={() => setConfirmando(true)}
            className="cursor-pointer rounded-lg border border-urgente/40 px-4 py-2.5 text-[13px] font-medium text-urgente hover:bg-[rgba(214,69,56,.06)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Borrar todos mis datos
          </button>
        )}
      </div>

      <p className="mt-3 text-[11.5px] leading-[1.6] text-texto-4">
        Demo de validación: hoy todo esto vive en tu navegador, así que borrarlo lo borra de
        verdad y al instante. Cuando Justihn abra las cuentas, la supresión se atiende en un
        máximo de 72 horas hábiles.
      </p>
    </Card>
  );
}

function Campo({
  etiqueta,
  value,
  onChange,
  type = "text",
}: {
  etiqueta: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
      {etiqueta}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-borde px-3 py-2.5 text-[13px] text-marino outline-none focus:border-celeste"
      />
    </label>
  );
}
