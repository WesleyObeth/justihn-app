"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { Cuando } from "@/components/ui/cuando";
import { Boton, BotonVolver, Card, ChipMateria, EnlaceFuente, Meta, Rotulo } from "@/components/ui/primitivos";
import { useHoy } from "@/hooks/use-saludo";
import { diasHasta, ETIQUETA_ESTADO, origenDeCaso } from "@/lib/casos";
import { mostrarIdentidad } from "@/lib/identidad";
import { formatearLempiras } from "@/lib/honorarios";
import { fechaTexto } from "@/lib/tiempo";
import { usePortal, useStoreHidratado } from "@/store/portal";
import { cn } from "@/lib/utils";

/**
 * El expediente. Tres bloques de trabajo —documentos, plazos, notas— y a la
 * derecha lo que lo rodea: cliente, origen con su fuente, propuesta de
 * honorarios y estado.
 *
 * ⚠️ Busca por id en el store: `useStoreHidratado` es obligatorio o el primer
 * render vería la lista vacía y enseñaría «no encontrado» a quien recargue.
 */
export function DetalleCaso({ id }: { id: string }) {
  const router = useRouter();
  const hidratado = useStoreHidratado();
  const caso = usePortal((s) => s.casos.find((c) => c.id === id));
  const propuesta = usePortal((s) => s.propuestas.find((p) => p.id === caso?.propuestaId));
  const actualizarCaso = usePortal((s) => s.actualizarCaso);
  const toggleDocumento = usePortal((s) => s.toggleDocumentoCaso);
  const agregarDocumento = usePortal((s) => s.agregarDocumentoCaso);
  const agregarPlazo = usePortal((s) => s.agregarPlazoCaso);
  const quitarPlazo = usePortal((s) => s.quitarPlazoCaso);
  const eliminarCaso = usePortal((s) => s.eliminarCaso);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const hoy = useHoy();

  const [nuevoDoc, setNuevoDoc] = useState("");
  const [plazoTitulo, setPlazoTitulo] = useState("");
  const [plazoFecha, setPlazoFecha] = useState("");
  const [notas, setNotas] = useState<string | null>(null);

  if (!hidratado) return null;
  if (!caso) {
    return (
      <Card className="px-6 py-10 text-center">
        <p className="font-display text-[16px] font-bold">Ese caso no está en este navegador</p>
        <p className="mt-1.5 text-[13px] text-texto-3">
          Hoy los expedientes se guardan localmente. Con la cuenta viajarán contigo.
        </p>
        <Link href="/abogados/casos" className="mt-4 inline-block text-[13px] font-semibold text-celeste">
          Volver a Mis casos →
        </Link>
      </Card>
    );
  }

  const origen = origenDeCaso(caso.tipo, caso.referenciaId);
  const recibidos = caso.documentos.filter((d) => d.recibido).length;

  const guardarNotas = () => {
    if (notas !== null && notas !== caso.notas) {
      actualizarCaso(caso.id, { notas });
      mostrarToast("Notas guardadas");
    }
  };

  const anadirPlazo = () => {
    if (!plazoTitulo.trim() || !plazoFecha) return;
    agregarPlazo(caso.id, plazoTitulo.trim(), plazoFecha);
    setPlazoTitulo("");
    setPlazoFecha("");
  };

  return (
    <div className="mt-1">
      <BotonVolver onClick={() => router.push("/abogados/casos")}>Mis casos</BotonVolver>

      <div className="mt-3 grid max-w-[1280px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          {/* Documentos */}
          <Card className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-[16px] font-bold">Documentos del expediente</h2>
              <Meta>
                {recibidos} de {caso.documentos.length} recibidos
              </Meta>
            </div>
            <p className="mt-1 text-[12.5px] text-texto-3">
              Marca lo que el cliente ya entregó. El checklist nació de la fuente oficial
              {origen?.fuentePendiente ? ", salvo donde la norma aún no está cargada" : ""}.
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded bg-sutil">
              <div
                className="h-full rounded bg-celeste transition-[width]"
                style={{ width: caso.documentos.length ? `${(recibidos / caso.documentos.length) * 100}%` : "0%" }}
              />
            </div>
            <ul className="mt-3.5 flex flex-col gap-1.5">
              {caso.documentos.map((d, i) => (
                <li key={`${d.titulo}-${i}`}>
                  <button
                    type="button"
                    onClick={() => toggleDocumento(caso.id, i)}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition-colors",
                      d.recibido ? "border-exito-bg bg-exito-bg/50" : "border-borde-suave bg-white hover:border-celeste",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border-[1.5px]",
                        d.recibido ? "border-exito bg-exito text-white" : "border-borde-fuerte",
                      )}
                    >
                      {d.recibido && <Icono nombre="check" size={11} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[13.5px]", d.recibido && "text-texto-3 line-through")}>
                        {d.titulo}
                      </span>
                      {d.fuente && <span className="block text-[11px] text-texto-4">{d.fuente}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (nuevoDoc.trim()) {
                  agregarDocumento(caso.id, nuevoDoc.trim());
                  setNuevoDoc("");
                }
              }}
            >
              <input
                value={nuevoDoc}
                onChange={(e) => setNuevoDoc(e.target.value)}
                placeholder="Añadir un documento propio de este caso…"
                className="h-10 flex-1 rounded-lg border border-borde bg-white px-3.5 text-[13px] text-marino outline-none focus:border-celeste"
              />
              <Boton type="submit" className="px-3.5">
                Añadir
              </Boton>
            </form>
          </Card>

          {/* Plazos */}
          <Card className="p-6">
            <h2 className="font-display text-[16px] font-bold">Plazos a vigilar</h2>
            <p className="mt-1 text-[12.5px] text-texto-3">
              Lo que hace perder un caso sin enterarse. Los de la ley están en la guía; aquí anotas
              los tuyos: audiencias, vencimientos, citas en la institución.
            </p>
            {caso.plazos.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {caso.plazos.map((p) => {
                  const dias = hoy ? diasHasta(p.fechaIso, hoy) : null;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 rounded-[10px] border border-borde-suave bg-white px-3.5 py-2.5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium">{p.titulo}</span>
                        <span className="block text-[11.5px] text-texto-4">{fechaTexto(p.fechaIso)}</span>
                      </span>
                      {dias !== null && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                            dias < 0
                              ? "bg-sutil text-texto-3"
                              : dias <= 3
                                ? "bg-urgente-bg text-urgente"
                                : "bg-chip text-celeste",
                          )}
                        >
                          {dias < 0 ? `hace ${-dias} d` : dias === 0 ? "hoy" : `en ${dias} d`}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => quitarPlazo(caso.id, p.id)}
                        aria-label={`Quitar plazo ${p.titulo}`}
                        className="cursor-pointer rounded-md p-1 text-texto-4 hover:bg-sutil hover:text-marino"
                      >
                        <Icono nombre="cerrar" size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                anadirPlazo();
              }}
            >
              <input
                value={plazoTitulo}
                onChange={(e) => setPlazoTitulo(e.target.value)}
                placeholder="Ej. Audiencia de conciliación"
                className="h-10 min-w-[min(220px,100%)] flex-1 rounded-lg border border-borde bg-white px-3.5 text-[13px] text-marino outline-none focus:border-celeste"
              />
              <input
                type="date"
                value={plazoFecha}
                onChange={(e) => setPlazoFecha(e.target.value)}
                aria-label="Fecha del plazo"
                className="h-10 rounded-lg border border-borde bg-white px-3 text-[13px] text-marino outline-none focus:border-celeste"
              />
              <Boton type="submit" className="px-3.5" disabled={!plazoTitulo.trim() || !plazoFecha}>
                Anotar plazo
              </Boton>
            </form>
          </Card>

          {/* Notas */}
          <Card className="p-6">
            <h2 className="font-display text-[16px] font-bold">Notas</h2>
            <textarea
              value={notas ?? caso.notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={guardarNotas}
              rows={5}
              placeholder="Lo que no cabe en un checklist: acuerdos, llamadas, lo que el cliente teme…"
              className="mt-2.5 w-full resize-y rounded-lg border border-borde bg-white px-3.5 py-2.5 text-[13.5px] leading-[1.6] text-marino outline-none focus:border-celeste"
            />
            <p className="mt-1.5 text-[11.5px] text-texto-4">Se guardan al salir del campo.</p>
          </Card>
        </div>

        {/* Lateral */}
        <aside className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              {origen && <ChipMateria>{origen.materia}</ChipMateria>}
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                  caso.estado === "cerrado"
                    ? "bg-sutil text-texto-3"
                    : caso.estado === "en_tramite"
                      ? "bg-chip text-celeste"
                      : "bg-exito-bg text-exito",
                )}
              >
                {ETIQUETA_ESTADO[caso.estado]}
              </span>
            </div>
            <h2 className="font-display mt-2 text-[17px] leading-[1.3] font-bold">{caso.cliente.nombre}</h2>
            <dl className="mt-2.5 flex flex-col gap-1 text-[12.5px]">
              {caso.cliente.identidad && (
                <div className="flex justify-between gap-3">
                  <dt className="text-texto-4">Identidad</dt>
                  <dd className="font-mono">{mostrarIdentidad(caso.cliente.identidad)}</dd>
                </div>
              )}
              {caso.cliente.telefono && (
                <div className="flex justify-between gap-3">
                  <dt className="text-texto-4">Teléfono</dt>
                  <dd>{caso.cliente.telefono}</dd>
                </div>
              )}
              {caso.cliente.correo && (
                <div className="flex justify-between gap-3">
                  <dt className="text-texto-4">Correo</dt>
                  <dd className="truncate">{caso.cliente.correo}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-texto-4">Abierto</dt>
                <dd>
                  <Cuando iso={caso.creadoEn} />
                </dd>
              </div>
            </dl>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {caso.estado !== "en_tramite" && caso.estado !== "cerrado" && (
                <Boton variante="celeste" className="px-3.5 py-2 text-[12.5px]" onClick={() => actualizarCaso(caso.id, { estado: "en_tramite" })}>
                  Pasar a «en trámite»
                </Boton>
              )}
              {caso.estado !== "cerrado" ? (
                <Boton className="px-3.5 py-2 text-[12.5px]" onClick={() => actualizarCaso(caso.id, { estado: "cerrado" })}>
                  Cerrar caso
                </Boton>
              ) : (
                <Boton className="px-3.5 py-2 text-[12.5px]" onClick={() => actualizarCaso(caso.id, { estado: "abierto" })}>
                  Reabrir
                </Boton>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <Rotulo>Origen del expediente</Rotulo>
            <p className="mt-1.5 text-[13.5px] font-semibold">{origen?.nombre ?? caso.titulo}</p>
            {origen?.resumen && <p className="mt-1 text-[12.5px] text-texto-3">{origen.resumen}</p>}
            {origen?.href && (
              <Link href={origen.href} className="mt-2 inline-block text-[12.5px] font-semibold text-celeste">
                Leer la guía completa →
              </Link>
            )}
            {origen?.fuenteUrl && (
              <EnlaceFuente href={origen.fuenteUrl}>{origen.fuenteNombre ?? "Fuente oficial"}</EnlaceFuente>
            )}
            {origen?.fuentePendiente && (
              <p className="mt-2 rounded-[8px] bg-aviso px-3 py-2 text-[11.5px] leading-[1.5] text-aviso-cuerpo">
                {origen.fuentePendiente}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <Rotulo>Propuesta de honorarios</Rotulo>
            {propuesta ? (
              <>
                <p className="mt-1.5 text-[13.5px]">
                  <b>{formatearLempiras(propuesta.honorarios)}</b> · {propuesta.formaPago}
                </p>
                <p className="text-[12px] text-texto-4">
                  Ref. {propuesta.referencia} · {fechaTexto(propuesta.fechaIso)}
                </p>
                <Link
                  href={`/abogados/propuestas/${propuesta.id}`}
                  className="mt-2 inline-block text-[12.5px] font-semibold text-celeste"
                >
                  Abrir y descargar en PDF →
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1.5 text-[12.5px] text-texto-3">
                  Se arma desde este mismo trámite: alcance, requisitos con fuente y condiciones.
                  Tú pones los honorarios.
                </p>
                <Link
                  href={`/abogados/propuestas/nueva?caso=${caso.id}`}
                  className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-marino px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-marino-hondo"
                >
                  Generar propuesta
                </Link>
              </>
            )}
          </Card>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Eliminar este caso? No se puede deshacer.")) {
                eliminarCaso(caso.id);
                router.push("/abogados/casos");
              }
            }}
            className="cursor-pointer text-left text-[12px] text-texto-4 hover:text-urgente"
          >
            Eliminar caso
          </button>
        </aside>
      </div>
    </div>
  );
}
