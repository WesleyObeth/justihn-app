"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { DocumentoPropuestaVista } from "@/components/portal/documento-propuesta";
import { Boton, BotonVolver, Card, Meta } from "@/components/ui/primitivos";
import { ABOGADA_DEMO } from "@/data/catalogo";
import { armarPropuesta, formatearLempiras, resolverOrigen } from "@/lib/honorarios";
import { fechaTexto } from "@/lib/tiempo";
import { usePortal, useStoreHidratado } from "@/store/portal";

/** Lista de propuestas guardadas. */
export function PantallaPropuestas() {
  const hidratado = useStoreHidratado();
  const propuestas = usePortal((s) => s.propuestas);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-texto-3">
          Propuestas de honorarios armadas desde el trámite: los requisitos van citados de la
          fuente oficial; tú solo pones el precio.
        </p>
        <Link
          href="/abogados/propuestas/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-marino px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-marino-hondo"
        >
          <Icono nombre="mas" size={13} strokeWidth={2.4} />
          Nueva propuesta
        </Link>
      </div>

      {hidratado && propuestas.length === 0 && (
        <Card className="px-6 py-10 text-center">
          <p className="font-display text-[16px] font-bold">Todavía no has guardado propuestas</p>
          <p className="mx-auto mt-1.5 max-w-[480px] text-[13px] leading-[1.6] text-texto-3">
            Elige un trámite o un acto notarial, escribe los honorarios y el cliente, y el
            documento se arma con alcance, requisitos, advertencias y condiciones. Sale en PDF con
            tu membrete.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {propuestas.map((p) => {
          const origen = resolverOrigen(p.origen.tipo, p.origen.referenciaId);
          return (
            <Link key={p.id} href={`/abogados/propuestas/${p.id}`} className="block text-marino">
              <Card interactiva className="px-5 py-4.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Meta>{origen?.nombre ?? "Propuesta"}</Meta>
                  <span className="ml-auto font-mono text-[11px] text-texto-4">{p.referencia}</span>
                </div>
                <h3 className="font-display mt-2 text-[15.5px] font-semibold">{p.cliente.nombre}</h3>
                <div className="mt-2 flex items-center justify-between gap-3 text-[12.5px]">
                  <span>
                    <b>{formatearLempiras(p.honorarios)}</b> · {p.formaPago}
                  </span>
                  <Meta>{fechaTexto(p.fechaIso)}</Meta>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

/** Una propuesta guardada: el documento, y encima la barra para imprimirla. */
export function DetallePropuesta({ id }: { id: string }) {
  const router = useRouter();
  const hidratado = useStoreHidratado();
  const propuesta = usePortal((s) => s.propuestas.find((p) => p.id === id));
  const eliminar = usePortal((s) => s.eliminarPropuesta);
  const mostrarToast = usePortal((s) => s.mostrarToast);

  if (!hidratado) return null;
  if (!propuesta) {
    return (
      <Card className="px-6 py-10 text-center">
        <p className="font-display text-[16px] font-bold">Esa propuesta no está en este navegador</p>
        <Link href="/abogados/propuestas" className="mt-4 inline-block text-[13px] font-semibold text-celeste">
          Volver a Propuestas →
        </Link>
      </Card>
    );
  }
  const doc = armarPropuesta(propuesta, ABOGADA_DEMO);
  if (!doc) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5 print:hidden">
        <BotonVolver onClick={() => router.push(propuesta.casoId ? `/abogados/casos/${propuesta.casoId}` : "/abogados/propuestas")}>
          {propuesta.casoId ? "Volver al caso" : "Propuestas"}
        </BotonVolver>
        <span className="flex-1" />
        <Boton variante="marino" className="px-4" onClick={() => window.print()}>
          Descargar en PDF
        </Boton>
        <Boton
          className="px-3.5"
          onClick={() => {
            if (window.confirm("¿Eliminar esta propuesta?")) {
              eliminar(propuesta.id);
              mostrarToast("Propuesta eliminada");
              router.push("/abogados/propuestas");
            }
          }}
        >
          Eliminar
        </Boton>
      </div>
      <p className="mb-3 text-[12px] text-texto-4 print:hidden">
        «Descargar en PDF» abre el diálogo de impresión del navegador: elige «Guardar como PDF».
        Sale en carta, con tu membrete y sin la interfaz.
      </p>
      <DocumentoPropuestaVista doc={doc} />
    </div>
  );
}
