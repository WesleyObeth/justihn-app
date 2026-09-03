"use client";

import { useState } from "react";
import { Boton, Card, TituloSeccion, TogglePill } from "@/components/ui/primitivos";
import { PREFERENCIAS_NOTIFICACION } from "@/data/catalogo";
import { useMiPerfil } from "./proveedor-perfil";
import { usePortal, type PreferenciasNotificacion } from "@/store/portal";
import { useUpgrade } from "@/components/portal/marco";

export function PantallaConfiguracion() {
  const perfil = useMiPerfil();
  const prefs = usePortal((s) => s.prefs);
  const togglePreferencia = usePortal((s) => s.togglePreferencia);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const esPremium = usePortal((s) => s.plan) === "premium";
  const solicitarUpgrade = useUpgrade();

  const [cuenta, setCuenta] = useState({
    nombre: perfil.nombreCorto,
    correo: perfil.email,
    whatsapp: perfil.whatsapp,
  });
  // "Guardar" solo se habilita cuando la cuenta cambió respecto a lo guardado.
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
    <div className="flex flex-col gap-4">
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
      </Card>

      <Card className="p-6">
        <TituloSeccion className="text-base font-bold">Notificaciones</TituloSeccion>
        <div className="mt-2 flex flex-col">
          {PREFERENCIAS_NOTIFICACION.map((p) => {
            // "Monitoreo de nombres" es feature Pro: con plan Base el toggle
            // abre el upgrade en vez de fingir que activa algo.
            const esFeaturePremium = p.k === "nombres";
            const bloqueada = esFeaturePremium && !esPremium;
            return (
              <div
                key={p.k}
                className="flex items-center gap-3 border-b border-sutil py-3.5 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold">
                    {esFeaturePremium && esPremium ? "Monitoreo de nombres" : p.titulo}
                  </div>
                  <div className="mt-px text-xs text-texto-4">{p.desc}</div>
                </div>
                <TogglePill
                  activo={!bloqueada && prefs[p.k as keyof PreferenciasNotificacion]}
                  onToggle={() =>
                    bloqueada
                      ? solicitarUpgrade()
                      : togglePreferencia(p.k as keyof PreferenciasNotificacion)
                  }
                  etiqueta={p.titulo}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Habeas data (art. 182 constitucional) — regla de diseño legal del
          proyecto: el canal de revisión/supresión vive en la plataforma. */}
      <Card className="p-6">
        <TituloSeccion className="text-base font-bold">Privacidad y datos</TituloSeccion>
        <p className="mt-1.5 max-w-[560px] text-[12.5px] leading-[1.55] text-texto-3">
          Tienes derecho a acceder, revisar y pedir la supresión de tus datos personales
          (habeas data, art. 182 de la Constitución). Las solicitudes se atienden en un máximo
          de 72 horas hábiles.
        </p>
        <div className="mt-3.5 flex flex-wrap gap-2.5">
          <Boton
            className="px-4 py-2.5 text-[12.5px]"
            onClick={() => mostrarToast("Preparando tu archivo de datos — te llegará por correo")}
          >
            Descargar mis datos
          </Boton>
          <Boton
            className="px-4 py-2.5 text-[12.5px]"
            onClick={() =>
              mostrarToast("Solicitud registrada — te contactamos en 72 horas hábiles")
            }
          >
            Solicitar revisión o supresión
          </Boton>
        </div>
      </Card>

      <div className="flex justify-end">
        {/* TODO(data): persistir vía Server Action con `guard()` + Zod; hoy solo
            las preferencias viven en el store local. */}
        <Boton
          variante="marino"
          className="px-5.5 py-[11px] text-[13.5px]"
          disabled={!hayCambios}
          onClick={guardar}
        >
          Guardar cambios
        </Boton>
      </div>
    </div>
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
        className="rounded-lg border border-borde px-3 py-2.5 text-sm text-marino outline-none focus:border-celeste"
      />
    </label>
  );
}
