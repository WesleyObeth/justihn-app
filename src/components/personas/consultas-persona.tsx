"use client";

import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import { ABOGADA_DEMO } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import { FormularioPregunta } from "@/components/publico/formulario-pregunta";

/**
 * Mis consultas — el otro lado de la pantalla Leads del portal de abogados:
 * misma pregunta, mismo store; cuando el abogado responde allá, la persona lo
 * ve aquí.
 */
export function ConsultasPersona() {
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[24px] font-bold">Mis consultas</h1>
      <p className="mt-1 text-[13px] text-texto-3">
        Preguntas gratis, en público y sin datos sensibles — abogados colegiados responden.
      </p>

      <div className="mt-4">
        <FormularioPregunta />
      </div>

      <div className="mt-5 flex flex-col gap-3.5">
        {preguntas.map((p) => {
          const respuesta = respondidos[p.id];
          return (
            <div key={p.id} className="rounded-2xl border border-borde bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste">
                  {p.materia}
                </span>
                <span className="text-[12px] text-texto-4">
                  {p.ciudad} · {p.cuando}
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
              <p className="mt-2.5 text-[14px] leading-[1.6]">{p.pregunta}</p>

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
                      <div className="text-[10.5px] text-texto-4">{ABOGADA_DEMO.colegiacion}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.65] text-texto-2">{respuesta}</p>
                  <Link
                    href="/persona/abogados"
                    className="mt-2 inline-block text-[12.5px]"
                  >
                    ¿Quieres que lleve tu caso? Contacta desde el directorio →
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {preguntas.length === 0 && (
          <div className="rounded-2xl border border-borde bg-white px-6 py-9 text-center">
            <p className="text-[13.5px] text-texto-3">
              Aún no has hecho ninguna consulta. Escribe tu primera arriba — es gratis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
