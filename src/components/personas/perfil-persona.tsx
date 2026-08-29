"use client";

import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import { PERSONA_DEMO } from "@/data/persona";
import { TRAMITES } from "@/data/tramites";
import { usePortal } from "@/store/portal";

/** Perfil del ciudadano: sus datos y su actividad real (store compartido). */
export function PerfilPersona() {
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const pasosTramite = usePortal((s) => s.pasosTramite);

  const respondidas = preguntas.filter((p) => respondidos[p.id]).length;
  const enProgreso = TRAMITES.filter(
    (t) => (pasosTramite[t.id] ?? []).length > 0 && (pasosTramite[t.id] ?? []).length < t.pasos.length,
  ).length;
  const completados = TRAMITES.filter(
    (t) => (pasosTramite[t.id] ?? []).length === t.pasos.length,
  ).length;

  return (
    <div className="max-w-[860px]" style={{ animation: "fadeUp .3s ease" }}>
      <h1 className="font-display text-[24px] font-bold">Mi perfil</h1>

      <div className="mt-4 rounded-2xl border border-borde bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-display grid h-[68px] w-[68px] place-items-center rounded-full bg-celeste text-[22px] font-semibold text-white">
            {PERSONA_DEMO.iniciales}
          </span>
          <div className="min-w-[220px] flex-1">
            <div className="font-display text-[19px] font-bold">{PERSONA_DEMO.nombre}</div>
            <div className="mt-0.5 text-[13px] text-texto-3">
              {PERSONA_DEMO.ciudad} · miembro desde {PERSONA_DEMO.miembroDesde}
            </div>
            <span className="mt-2 inline-block rounded-full bg-chip px-2.5 py-[3px] text-[11px] font-bold text-celeste">
              PLAN GRATIS
            </span>
          </div>
          <Link
            href="/personas/configuracion"
            className="rounded-lg border border-borde bg-lienzo px-3.5 py-2 text-[12.5px] font-medium whitespace-nowrap text-marino hover:border-celeste hover:text-celeste"
          >
            Editar mis datos
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-[9px] text-[13px] text-texto-2">
          <div className="flex items-center gap-2.5">
            <Icono nombre="correo" size={14} className="text-texto-4" />
            {PERSONA_DEMO.email}
          </div>
          <div className="flex items-center gap-2.5">
            <Icono nombre="telefono" size={14} className="text-texto-4" />
            {PERSONA_DEMO.whatsapp} (WhatsApp)
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-borde bg-white p-6">
        <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
          Mi actividad
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat valor={preguntas.length} etiqueta="Consultas hechas" href="/personas/consultas" />
          <Stat valor={respondidas} etiqueta="Respondidas por abogados" href="/personas/consultas" />
          <Stat valor={enProgreso} etiqueta="Trámites en progreso" href="/personas/tramites" />
          <Stat valor={completados} etiqueta="Trámites completados" href="/personas/tramites" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-borde bg-white p-6">
        <div className="min-w-[240px] flex-1">
          <h2 className="font-display text-[15px] font-bold">Tus datos son tuyos</h2>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
            Descarga o pide la supresión de tus datos cuando quieras (habeas data, art. 182 de
            la Constitución).
          </p>
        </div>
        <Link
          href="/personas/configuracion"
          className="rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[12.5px] font-medium text-marino hover:border-celeste"
        >
          Privacidad y datos
        </Link>
      </div>
    </div>
  );
}

function Stat({ valor, etiqueta, href }: { valor: number; etiqueta: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl bg-lienzo p-4 text-marino hover:bg-chip">
      <div className="font-display text-[24px] font-bold">{valor}</div>
      <div className="mt-0.5 text-[11.5px] leading-[1.4] text-texto-3">{etiqueta}</div>
    </Link>
  );
}
