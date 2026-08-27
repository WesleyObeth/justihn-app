"use client";

import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { SimboloJusIALinear } from "@/components/brand/logos";
import { Boton } from "@/components/ui/primitivos";
import { NOTIFICACIONES } from "@/data/catalogo";
import { usePortal, useNotifsSinLeer } from "@/store/portal";
import { cn } from "@/lib/utils";

export function PantallaNotificaciones() {
  const leidas = usePortal((s) => s.notifsLeidas);
  const leidasIds = usePortal((s) => s.notifsLeidasIds);
  const marcarLeidas = usePortal((s) => s.marcarNotifsLeidas);
  const marcarLeida = usePortal((s) => s.marcarNotifLeida);
  const sinLeer = useNotifsSinLeer();

  return (
    <>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="text-[13px] text-texto-3">
          {sinLeer > 0 ? (
            `${sinLeer} sin leer`
          ) : (
            <span className="font-semibold text-exito">✓ Todo al día</span>
          )}
        </div>
        <Boton onClick={marcarLeidas} className="px-3.5 py-2 text-[12.5px]">
          Marcar todas como leídas
        </Boton>
      </div>

      {GRUPOS.map(({ etiqueta, filtro }) => {
        const delGrupo = NOTIFICACIONES.filter(filtro);
        if (delGrupo.length === 0) return null;
        return (
          <div key={etiqueta} className="mb-4">
            <div className="mb-2 text-[10.5px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              {etiqueta}
            </div>
            <div className="flex flex-col gap-2.5">
              {delGrupo.map((n) => {
                const noLeida = !leidas && n.noLeidaPorDefecto && !leidasIds.includes(n.id);
                return (
            <Link
              key={n.id}
              href={n.destino}
              onClick={() => marcarLeida(n.id)}
              className={cn(
                "flex items-center gap-3.5 rounded-xl border bg-white px-4.5 py-3.5 text-marino hover:border-celeste hover:text-marino",
                noLeida ? "border-chip-borde" : "border-borde",
              )}
            >
              <span className="grid h-[34px] w-[34px] min-w-[34px] place-items-center rounded-[9px] bg-[#eef3f9] text-celeste">
                {n.icono === "ia" ? (
                  <SimboloJusIALinear size={15} />
                ) : (
                  <Icono nombre={n.icono as NombreIcono} size={15} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold">{n.titulo}</div>
                <div className="mt-0.5 text-[12.5px] text-texto-3">{n.meta}</div>
              </div>

              <span className="text-[11.5px] whitespace-nowrap text-texto-4">{n.cuando}</span>
                  {noLeida && (
                    <span
                      className="h-2 w-2 min-w-2 rounded-full bg-celeste"
                      aria-label="No leída"
                      role="img"
                    />
                  )}
                </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Agrupación por recencia a partir del `cuando` del seed. */
const GRUPOS = [
  { etiqueta: "Hoy", filtro: (n: { cuando: string }) => n.cuando.startsWith("hace") },
  { etiqueta: "Ayer", filtro: (n: { cuando: string }) => n.cuando === "ayer" },
  {
    etiqueta: "Anteriores",
    filtro: (n: { cuando: string }) => !n.cuando.startsWith("hace") && n.cuando !== "ayer",
  },
];
