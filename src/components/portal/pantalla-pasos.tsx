"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, ChipMateria, EnlaceFuente, Rotulo } from "@/components/ui/primitivos";
import { ModalVistaPrevia } from "@/components/portal/modal-plantilla";
import { PROCESOS } from "@/data/procesos";
import { PLANTILLAS } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";
import type { Plantilla } from "@/types/dominio";

/**
 * El "paso a paso" es checklist, no solo guía: cada paso se marca como hecho
 * (persistido por proceso) y el proceso enlaza el modelo del escrito que lo
 * materializa — investigar y hacer en la misma pantalla.
 */
export function PantallaPasos() {
  // La selección vive en la URL (`?proceso=`): deep-link desde Plantillas o el
  // buscador, compartible, y back/forward navegan entre procesos.
  const router = useRouter();
  const params = useSearchParams();
  const seleccionado = PROCESOS.find((p) => p.id === params.get("proceso"))?.id ?? PROCESOS[0]!.id;
  const [pasoAbierto, setPasoAbierto] = useState<number | null>(null);

  const seleccionar = (id: string) => {
    setPasoAbierto(null);
    router.replace(`/abogados/procesos?proceso=${id}`, { scroll: false });
  };
  const [previa, setPrevia] = useState<Plantilla | null>(null);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const pasosHechos = usePortal((s) => s.pasosHechos);
  const togglePasoHecho = usePortal((s) => s.togglePasoHecho);
  const reiniciarProceso = usePortal((s) => s.reiniciarProceso);
  const preguntar = usePreguntarAJusIA();

  const proceso = PROCESOS.find((p) => p.id === seleccionado)!;
  const hechos = pasosHechos[proceso.id] ?? [];
  const plantilla = PLANTILLAS.find((p) => p.id === proceso.plantillaId) ?? null;

  const preguntarAJusIA = () =>
    preguntar(
      `¿Qué debo tener en cuenta al tramitar "${proceso.nombre}" y qué fuentes sustentan cada paso?`,
    );

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[300px_1fr]">
      <div className="flex flex-col gap-2">
        {PROCESOS.map((p) => {
          const avance = (pasosHechos[p.id] ?? []).length;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => seleccionar(p.id)}
              aria-pressed={p.id === seleccionado}
              className={cn(
                "cursor-pointer rounded-[10px] border bg-white px-4 py-3.5 text-left hover:border-celeste",
                p.id === seleccionado
                  ? "border-celeste shadow-[0_2px_10px_rgba(21,132,199,.12)]"
                  : "border-borde",
              )}
            >
              <div className="text-[13.5px] font-semibold">{p.nombre}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-texto-4">
                <span>
                  {p.materia} · {p.pasos.length} pasos
                </span>
                {avance > 0 && (
                  <span className="font-semibold text-celeste">
                    {avance}/{p.pasos.length}
                  </span>
                )}
              </div>
              {avance > 0 && (
                <div className="mt-2 h-1 overflow-hidden rounded bg-sutil">
                  <div
                    className="h-full rounded bg-celeste transition-[width]"
                    style={{ width: `${(avance / p.pasos.length) * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[19px] font-bold">{proceso.nombre}</h2>
                <ChipMateria>{proceso.materia}</ChipMateria>
              </div>
              <p className="mt-1 text-[13px] text-texto-3">
                Marca los pasos a medida que avanzas — cada uno enlaza el artículo o sentencia
                que lo sustenta.
              </p>
            </div>
            <BotonJusIA compacto onClick={preguntarAJusIA}>
              Preguntar a Jus IA
            </BotonJusIA>
          </div>

          {/* Progreso del proceso */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded bg-sutil">
              <div
                className="h-full rounded bg-celeste transition-[width]"
                style={{ width: `${(hechos.length / proceso.pasos.length) * 100}%` }}
              />
            </div>
            <span className="text-[12px] whitespace-nowrap text-texto-3">
              {hechos.length} de {proceso.pasos.length} completados
            </span>
            {hechos.length > 0 && (
              <button
                type="button"
                onClick={() => reiniciarProceso(proceso.id)}
                className="cursor-pointer text-[12px] text-celeste hover:text-marino"
              >
                Reiniciar
              </button>
            )}
          </div>

          <ol className="mt-3 flex flex-col">
            {proceso.pasos.map((paso, i) => {
              const hecho = hechos.includes(i);
              const abierto = pasoAbierto === i;
              const hayDetalle = Boolean(paso.documentos?.length || paso.plazo || paso.nota);
              return (
                <li
                  key={paso.titulo}
                  className="flex gap-3.5 border-b border-borde-suave py-3.5 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => togglePasoHecho(proceso.id, i)}
                    aria-pressed={hecho}
                    aria-label={hecho ? `Desmarcar: ${paso.titulo}` : `Marcar hecho: ${paso.titulo}`}
                    className={cn(
                      "grid h-[26px] w-[26px] min-w-[26px] cursor-pointer place-items-center rounded-full border text-[12.5px] font-bold transition-colors",
                      hecho
                        ? "border-celeste bg-celeste text-white"
                        : "border-chip-borde bg-chip text-celeste hover:border-celeste",
                    )}
                  >
                    {hecho ? <Icono nombre="check" size={13} strokeWidth={2.6} /> : i + 1}
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => hayDetalle && setPasoAbierto(abierto ? null : i)}
                      aria-expanded={abierto}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 text-left",
                        hayDetalle && "cursor-pointer",
                        hecho && "opacity-55",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn("block text-sm font-semibold", hecho && "line-through")}
                        >
                          {paso.titulo}
                        </span>
                        <span className="mt-[3px] block text-[13px] leading-[1.55] text-texto-3">
                          {paso.detalle}
                        </span>
                      </span>
                      {hayDetalle && (
                        <span
                          className={cn(
                            "mt-1 grid shrink-0 place-items-center text-texto-4 transition-transform",
                            abierto && "rotate-180",
                          )}
                        >
                          <Icono nombre="chevron" size={15} />
                        </span>
                      )}
                    </button>

                    <EnlaceFuente
                      href={paso.fuenteUrl}
                      onClick={() => mostrarToast("Abriendo la fuente oficial…")}
                    >
                      {paso.fuente}
                    </EnlaceFuente>

                    {abierto && (
                      <div
                        className="mt-3 flex flex-col gap-3 rounded-[10px] bg-lienzo p-4"
                        style={{ animation: "fadeUp .2s ease" }}
                      >
                        {paso.documentos && paso.documentos.length > 0 && (
                          <div>
                            <Rotulo className="text-texto-4">Documentos necesarios</Rotulo>
                            <ul className="mt-1.5 flex flex-col gap-1">
                              {paso.documentos.map((doc) => (
                                <li
                                  key={doc}
                                  className="flex items-start gap-2 text-[13px] text-texto-2"
                                >
                                  <span className="mt-px grid shrink-0 place-items-center text-celeste">
                                    <Icono nombre="documento" size={13} />
                                  </span>
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {paso.plazo && (
                          <div className="flex items-start gap-2 text-[13px] text-texto-2">
                            <span className="mt-px grid shrink-0 place-items-center text-texto-4">
                              <Icono nombre="reloj" size={13} />
                            </span>
                            <span>
                              <b>Plazo:</b> {paso.plazo}
                            </span>
                          </div>
                        )}

                        {paso.nota && (
                          <div className="flex items-start gap-2 text-[13px] leading-[1.55] text-aviso-cuerpo">
                            <span className="mt-px grid shrink-0 place-items-center text-dorado">
                              <Icono nombre="alerta" size={13} />
                            </span>
                            <span>
                              <b>En la práctica:</b> {paso.nota}
                            </span>
                          </div>
                        )}

                        <div>
                          <BotonJusIA
                            compacto
                            onClick={() =>
                              preguntar(
                                `En el proceso "${proceso.nombre}", explícame el paso "${paso.titulo}": requisitos, plazos y errores comunes`,
                              )
                            }
                          >
                            Preguntar sobre este paso
                          </BotonJusIA>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Cierre del loop investigar → hacer → redactar: al completar el
              checklist, el siguiente paso natural es generar el escrito. */}
          {hechos.length === proceso.pasos.length && (
            <div
              className="mt-4 flex flex-wrap items-center gap-3 rounded-[10px] border-l-[3px] border-exito bg-exito-bg/60 px-4 py-3.5"
              style={{ animation: "fadeUp .25s ease" }}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-exito text-white">
                <Icono nombre="check" size={15} strokeWidth={2.6} />
              </span>
              <div className="min-w-[200px] flex-1">
                <div className="text-[13.5px] font-semibold text-marino">Proceso completado</div>
                <p className="text-[12.5px] text-texto-3">
                  {plantilla
                    ? "Siguiente paso: genera el escrito con el modelo de este proceso."
                    : "Pregúntale a Jus IA qué sigue tras la tramitación."}
                </p>
              </div>
              {plantilla ? (
                <Boton
                  variante="celeste"
                  className="px-4 py-2 text-[12.5px]"
                  onClick={() => setPrevia(plantilla)}
                >
                  Generar el escrito
                </Boton>
              ) : (
                <BotonJusIA
                  compacto
                  onClick={() =>
                    preguntar(
                      `Completé todos los pasos de "${proceso.nombre}". ¿Qué sigue después y qué plazos debo vigilar?`,
                    )
                  }
                >
                  Preguntar a Jus IA
                </BotonJusIA>
              )}
            </div>
          )}
        </Card>

        {plantilla && (
          <Card className="flex flex-wrap items-center gap-4 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-chip text-celeste">
              <Icono nombre="plantillas" size={18} />
            </span>
            <div className="min-w-[220px] flex-1">
              <Rotulo className="text-texto-4">Modelo de este proceso</Rotulo>
              <div className="font-display mt-0.5 text-[14.5px] font-semibold text-marino">
                {plantilla.nombre}
              </div>
              <div className="mt-px text-[12.5px] text-texto-3">{plantilla.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => setPrevia(plantilla)}
              className="cursor-pointer rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[13px] font-medium text-marino hover:border-celeste hover:text-celeste"
            >
              Ver vista previa
            </button>
          </Card>
        )}
      </div>

      <ModalVistaPrevia plantilla={previa} onCerrar={() => setPrevia(null)} />
    </div>
  );
}
