"use client";

/**
 * Bandeja del ciudadano. A diferencia de la del abogado —que es un seed fijo—
 * esta se DERIVA de lo que la persona hizo de verdad: las consultas que un
 * abogado ya respondió y los trámites que dejó a medias. Sin eso, la demo
 * abriría diciendo "respondieron tu consulta" a quien nunca preguntó, que es
 * exactamente la evidencia fabricada que prohíbe §4.5.
 *
 * Agrupa por ORIGEN y no por fecha: los avisos derivados no tienen sello de
 * tiempo real, y un "hace 2 h" inventado sería el mismo problema.
 */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { Boton } from "@/components/ui/primitivos";
import { NOVEDADES_PERSONA } from "@/data/persona";
import { TRAMITES } from "@/data/tramites";
import { usePortal, useNotifsSinLeer } from "@/store/portal";
import { cn } from "@/lib/utils";

interface AvisoPersona {
  id: string;
  icono: NombreIcono;
  titulo: string;
  meta: string;
  destino: string;
  noLeidaPorDefecto: boolean;
}

/**
 * Las tres fuentes de aviso, en el mismo orden que las preferencias de
 * Configuración — si se agrega una allá, aquí tiene que nacer su grupo.
 */
export function useAvisosPersona(): { etiqueta: string; avisos: AvisoPersona[] }[] {
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const pasosTramite = usePortal((s) => s.pasosTramite);

  const respuestas: AvisoPersona[] = preguntas.map((p) => {
    const suyas = respondidos[p.id] ?? [];
    const primera = suyas[0];
    return primera
      ? {
          id: `notif-p-resp-${p.id}`,
          icono: "leads" as const,
          titulo:
            suyas.length > 1
              ? `${suyas.length} abogados respondieron tu consulta de ${p.materia}`
              : `Un abogado respondió tu consulta de ${p.materia}`,
          meta: recortar(primera.texto, 88),
          destino: "/personas/consultas",
          // Lo único que cuenta para la insignia: es noticia de verdad.
          noLeidaPorDefecto: true,
        }
      : {
          id: `notif-p-pub-${p.id}`,
          icono: "enviar" as const,
          titulo: `Tu consulta de ${p.materia} está publicada`,
          meta: "Los abogados colegiados de esa materia ya pueden verla y responderte",
          destino: "/personas/consultas",
          noLeidaPorDefecto: false,
        };
  });

  // Solo los empezados y sin terminar: ni los intactos ni los completos son un
  // pendiente que recordar.
  const tramites: AvisoPersona[] = TRAMITES.flatMap((t) => {
    const hechos = (pasosTramite[t.id] ?? []).length;
    if (hechos === 0 || hechos >= t.pasos.length) return [];
    const faltan = t.pasos.length - hechos;
    return [
      {
        id: `notif-p-tramite-${t.id}`,
        icono: "pasos" as const,
        titulo: `Dejaste «${t.nombre}» a medias`,
        meta: `Te ${faltan === 1 ? "falta 1 paso" : `faltan ${faltan} pasos`} de ${t.pasos.length} — retómalo donde lo dejaste`,
        destino: `/personas/tramites/${t.id}`,
        noLeidaPorDefecto: false,
      },
    ];
  });

  const novedades: AvisoPersona[] = NOVEDADES_PERSONA.map((n) => ({
    id: n.id,
    icono: "bell" as const,
    titulo: n.titulo,
    meta: n.meta,
    destino: n.destino,
    noLeidaPorDefecto: n.noLeidaPorDefecto,
  }));

  return [
    { etiqueta: "Tus consultas", avisos: respuestas },
    { etiqueta: "Tus trámites", avisos: tramites },
    { etiqueta: "De Justihn", avisos: novedades },
  ];
}

/** Lista plana — lo que necesitan el contador de la insignia y "marcar todas". */
export function useTodosLosAvisos(): AvisoPersona[] {
  return useAvisosPersona().flatMap((g) => g.avisos);
}

export function NotificacionesPersona() {
  const grupos = useAvisosPersona();
  const todos = useTodosLosAvisos();
  const leidasIds = usePortal((s) => s.notifsLeidasIds);
  const marcarLeidas = usePortal((s) => s.marcarNotifsLeidas);
  const marcarLeida = usePortal((s) => s.marcarNotifLeida);
  const sinLeer = useNotifsSinLeer(todos);

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[24px] font-bold">Notificaciones</h1>
      <p className="mt-1 text-[13px] text-texto-3">
        Respuestas a tus consultas, trámites a medias y novedades. Eliges cuáles recibes en{" "}
        <Link href="/personas/configuracion">Configuración</Link>.
      </p>

      <div className="mt-5 mb-3.5 flex items-center justify-between">
        <div className="text-[13px] text-texto-3">
          {sinLeer > 0 ? (
            `${sinLeer} sin leer`
          ) : (
            <span className="font-semibold text-exito">✓ Todo al día</span>
          )}
        </div>
        {sinLeer > 0 && (
          <Boton
            onClick={() => marcarLeidas(todos.map((n) => n.id))}
            className="px-3.5 py-2 text-[12.5px]"
          >
            Marcar todas como leídas
          </Boton>
        )}
      </div>

      {grupos.map(({ etiqueta, avisos }) => {
        if (avisos.length === 0) return null;
        return (
          <div key={etiqueta} className="mb-4">
            <div className="mb-2 text-[10.5px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              {etiqueta}
            </div>
            <div className="flex flex-col gap-2.5">
              {avisos.map((n) => {
                const noLeida = n.noLeidaPorDefecto && !leidasIds.includes(n.id);
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
                      <Icono nombre={n.icono} size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-semibold">{n.titulo}</div>
                      <div className="mt-0.5 text-[12.5px] text-texto-3">{n.meta}</div>
                    </div>
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
    </div>
  );
}

function recortar(texto: string, max: number): string {
  return texto.length <= max ? texto : `${texto.slice(0, max).trimEnd()}…`;
}
