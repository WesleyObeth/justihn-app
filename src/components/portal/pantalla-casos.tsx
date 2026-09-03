"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { Cuando } from "@/components/ui/cuando";
import { Card, ChipMateria, Meta } from "@/components/ui/primitivos";
import { useHoy } from "@/hooks/use-saludo";
import { diasHasta, ETIQUETA_ESTADO, origenDeCaso } from "@/lib/casos";
import { mostrarIdentidad } from "@/lib/identidad";
import { usePortal, useStoreHidratado } from "@/store/portal";
import { cn } from "@/lib/utils";
import type { Caso } from "@/types/dominio";

type Filtro = "todos" | Caso["estado"];

/**
 * Mis casos — el expediente por cliente. Pantalla #16, que estaba diferida
 * «hasta validar con abogados reales»; la validación llegó el 2026-09-02:
 * «si el sistema digitalizara los expedientes notariales sería excelente».
 *
 * Es una pantalla de trabajo, no de consulta: lo que importa es qué falta
 * (documentos sin recibir) y qué vence (plazos). Las dos cosas van en la card.
 */
export function PantallaCasos() {
  const hidratado = useStoreHidratado();
  const casos = usePortal((s) => s.casos);
  const hoy = useHoy();
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const visibles = casos.filter((c) => filtro === "todos" || c.estado === filtro);
  const cuenta = (e: Filtro) => (e === "todos" ? casos.length : casos.filter((c) => c.estado === e).length);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-texto-3">
          Un expediente por cliente: qué documentos faltan, qué plazos vencen, y la propuesta de
          honorarios enlazada.
        </p>
        <Link
          href="/abogados/casos/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-marino px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-marino-hondo"
        >
          <Icono nombre="mas" size={13} strokeWidth={2.4} />
          Nuevo caso
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["todos", "abierto", "en_tramite", "cerrado"] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              filtro === f
                ? "border-celeste bg-celeste text-white"
                : "border-borde bg-white text-texto-2 hover:border-celeste",
            )}
          >
            {f === "todos" ? "Todos" : ETIQUETA_ESTADO[f]} ({cuenta(f)})
          </button>
        ))}
      </div>

      {hidratado && casos.length === 0 && (
        <Card className="px-6 py-10 text-center">
          <p className="font-display text-[16px] font-bold">Todavía no tienes casos</p>
          <p className="mx-auto mt-1.5 max-w-[460px] text-[13px] leading-[1.6] text-texto-3">
            Al abrir uno, el checklist de documentos se llena solo desde la guía verificada del
            trámite o del acto notarial. Después marcas lo que el cliente ya entregó y anotas los
            plazos que hay que vigilar.
          </p>
          <Link
            href="/abogados/casos/nuevo"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-marino px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-marino-hondo"
          >
            <Icono nombre="mas" size={13} strokeWidth={2.4} />
            Abrir el primer caso
          </Link>
        </Card>
      )}

      {hidratado && casos.length > 0 && visibles.length === 0 && (
        <Card className="px-6 py-8 text-center text-[13px] text-texto-3">
          No hay casos en ese estado.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {visibles.map((c) => (
          <TarjetaCaso key={c.id} caso={c} hoy={hoy} />
        ))}
      </div>
    </>
  );
}

function TarjetaCaso({ caso, hoy }: { caso: Caso; hoy: Date | null }) {
  const origen = origenDeCaso(caso.tipo, caso.referenciaId);
  const recibidos = caso.documentos.filter((d) => d.recibido).length;
  const total = caso.documentos.length;
  const proximo = caso.plazos[0];
  const dias = proximo && hoy ? diasHasta(proximo.fechaIso, hoy) : null;

  return (
    <Link href={`/abogados/casos/${caso.id}`} className="block text-marino">
      <Card interactiva className="px-5 py-4.5">
        <div className="flex flex-wrap items-center gap-2">
          {origen && <ChipMateria>{origen.materia}</ChipMateria>}
          <Meta>{origen?.nombre ?? caso.titulo}</Meta>
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
        <h3 className="font-display mt-2 text-[15.5px] font-semibold">{caso.cliente.nombre}</h3>
        <p className="mt-0.5 text-[12.5px] text-texto-3">
          {caso.cliente.identidad ? `DNI ${mostrarIdentidad(caso.cliente.identidad)} · ` : ""}
          {caso.titulo}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded bg-sutil">
            <div
              className="h-full rounded bg-celeste"
              style={{ width: total ? `${(recibidos / total) * 100}%` : "0%" }}
            />
          </div>
          <Meta className="whitespace-nowrap">
            {recibidos}/{total} documentos
          </Meta>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3 text-[12px]">
          {proximo ? (
            <span className={cn(dias !== null && dias <= 3 ? "font-semibold text-urgente" : "text-texto-3")}>
              {proximo.titulo}
              {dias !== null && (
                <> · {dias < 0 ? `venció hace ${-dias} d` : dias === 0 ? "vence hoy" : `vence en ${dias} d`}</>
              )}
            </span>
          ) : (
            <span className="text-texto-4">Sin plazos anotados</span>
          )}
          <Meta>
            <Cuando iso={caso.actualizadoEn} />
          </Meta>
        </div>
      </Card>
    </Link>
  );
}
