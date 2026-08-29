"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import type { Materia } from "@/types/dominio";

const MATERIAS_CONSULTA: Materia[] = [
  "Laboral",
  "Civil",
  "Familia",
  "Mercantil",
  "Penal",
  "Contencioso Adm.",
];

/**
 * Consultorio público (Vía B). LA INTEGRACIÓN: tu pregunta entra al mismo
 * store que alimenta la pantalla Leads del portal de abogados, y la respuesta
 * que el abogado publica allá aparece aquí — un solo flujo, dos caras.
 */
export function PantallaConsultorio() {
  const preguntasPublico = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const preguntas = [...preguntasPublico, ...LEADS];

  return (
    <div className="mx-auto max-w-[1140px] px-4 py-8 md:px-6">
      <h1 className="font-display text-[26px] font-bold">Consultorio legal gratuito</h1>
      <p className="mt-1 max-w-[640px] text-[13.5px] leading-[1.6] text-texto-3">
        Pregunta gratis y un abogado colegiado te orienta en público. La orientación es general —
        para tu caso concreto, contacta al abogado desde su perfil.
      </p>

      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <FormularioPregunta />

          <h2 className="font-display mt-2 text-[17px] font-bold">Preguntas recientes</h2>
          {preguntas.map((lead) => {
            const respuesta = respondidos[lead.id];
            return (
              <div key={lead.id} className="rounded-2xl border border-borde bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste">
                    {lead.materia}
                  </span>
                  <span className="text-[12px] text-texto-4">
                    {lead.ciudad} · {lead.cuando}
                  </span>
                  {respuesta ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[3px] text-[10.5px] font-bold text-exito">
                      <Icono nombre="check" size={9} strokeWidth={2.6} />
                      Respondida
                    </span>
                  ) : (
                    <span className="ml-auto text-[11.5px] text-texto-4">
                      Esperando a los abogados…
                    </span>
                  )}
                </div>
                <p className="mt-2.5 text-[14px] leading-[1.6]">{lead.pregunta}</p>

                {respuesta && (
                  <div className="mt-3 rounded-xl border-l-[3px] border-exito bg-exito-bg/50 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-display grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold text-white"
                        style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
                      >
                        {ABOGADA_DEMO.iniciales}
                      </span>
                      <div>
                        <div className="text-[12.5px] font-bold">{ABOGADA_DEMO.nombre}</div>
                        <div className="text-[10.5px] text-texto-4">
                          {ABOGADA_DEMO.colegiacion}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] leading-[1.65] text-texto-2">{respuesta}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              Cómo funciona
            </h2>
            <ol className="mt-3 flex flex-col gap-2.5">
              {[
                "Escribes tu pregunta — sin nombres completos ni datos sensibles",
                "Abogados colegiados de esa materia la ven y responden en público",
                "Si necesitas llevar tu caso, contactas al abogado que te convenció",
              ].map((paso, i) => (
                <li key={paso} className="flex items-start gap-2.5 text-[12.5px] leading-[1.55] text-texto-2">
                  <span className="grid h-[20px] w-[20px] min-w-[20px] place-items-center rounded-full bg-chip text-[11px] font-bold text-celeste">
                    {i + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>

          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
          >
            <h2 className="font-display text-[15px] font-bold">¿Eres abogado?</h2>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-sobre-marino-2">
              Estas preguntas llegan como leads a tu portal — responder en público es tu
              vitrina ante quien busca abogado.
            </p>
            <Link
              href="/abogados/leads"
              className="mt-3 inline-block rounded-lg bg-celeste px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
            >
              Responder desde el portal
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FormularioPregunta() {
  const preguntarConsultorio = usePortal((s) => s.preguntarConsultorio);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [materia, setMateria] = useState<Materia>("Laboral");
  const [ciudad, setCiudad] = useState("");
  const [pregunta, setPregunta] = useState("");

  const publicar = () => {
    const texto = pregunta.trim();
    if (texto.length < 15) {
      mostrarToast("Cuéntanos un poco más — mínimo unas dos líneas");
      return;
    }
    preguntarConsultorio(materia, ciudad.trim() || "Honduras", texto);
    setPregunta("");
    setCiudad("");
    mostrarToast("Pregunta publicada — los abogados de la materia ya pueden verla");
  };

  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <h2 className="font-display text-[16px] font-bold">Haz tu pregunta</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          Materia
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value as Materia)}
            className="rounded-lg border border-borde bg-white p-2.5 text-[13.5px] text-marino outline-none focus:border-celeste"
          >
            {MATERIAS_CONSULTA.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          Ciudad (opcional)
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej. Tegucigalpa"
            className="rounded-lg border border-borde px-3 py-2.5 text-[13.5px] text-marino outline-none focus:border-celeste"
          />
        </label>
      </div>
      <textarea
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
        rows={3}
        placeholder="Cuenta tu situación en tus palabras — sin nombres completos ni datos sensibles…"
        aria-label="Tu pregunta"
        className="mt-3 w-full resize-y rounded-lg border border-borde px-3.5 py-2.5 text-[13.5px] leading-[1.6] text-marino outline-none focus:border-celeste"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={publicar}
          className="cursor-pointer rounded-xl bg-celeste px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-cruce"
        >
          Publicar pregunta gratis
        </button>
        <span className="text-[11.5px] text-texto-4">
          Pública y anónima — no publiques datos que te identifiquen.
        </span>
      </div>
    </div>
  );
}
