"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import {
  Card,
  CardMarino,
  ChipMateria,
  PillMateria,
  Rotulo,
  TituloSeccion,
} from "@/components/ui/primitivos";
import { DIGEST, PUBLICACIONES } from "@/data/gaceta";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";

/**
 * `expandido` (deep-link `?digest=1` desde el Dashboard): la card despliega
 * las publicaciones de la semana — el digest se LEE aquí, no es solo un banner.
 * El título es la semana que CUBREN sus publicaciones (derivada del seed), no
 * la semana del calendario.
 */
export function DigestSemanal({ expandido = false }: { expandido?: boolean }) {
  const preguntar = usePreguntarAJusIA();

  return (
    <CardMarino className="flex flex-wrap items-center gap-4 p-6">
      <div className="min-w-[240px] flex-1">
        <Rotulo className="text-sobre-marino">Digest semanal</Rotulo>
        <h2 className="font-display mt-1.5 text-[21px] font-bold">{DIGEST.titulo}</h2>
        <p className="mt-1 text-[13px] text-sobre-marino-2">{DIGEST.detalle}</p>
      </div>
      <BotonJusIA
        onClick={() =>
          preguntar(
            "Resúmeme las publicaciones de La Gaceta de esta semana en mis materias y dime cuáles afectan mis casos activos",
            { enviarDirecto: true },
          )
        }
      >
        Resumir con Jus IA
      </BotonJusIA>

      {expandido && (
        <div className="w-full basis-full border-t border-white/12 pt-3">
          {PUBLICACIONES.map((p) => (
            <Link
              key={p.id}
              href={`/abogados/gaceta/${p.id}`}
              className="group flex items-baseline gap-3 border-b border-white/8 py-2.5 text-sobre-marino-2 last:border-b-0 hover:text-white"
            >
              <span className="min-w-[86px] text-[11px] tracking-[.5px] text-sobre-marino-2/70 uppercase">
                {p.materia}
              </span>
              <span className="flex-1 text-[13px] font-medium">{p.titulo}</span>
              <span className="text-[12px] whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                Ver →
              </span>
            </Link>
          ))}
        </div>
      )}
    </CardMarino>
  );
}

export function PantallaGaceta() {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const router = useRouter();
  const params = useSearchParams();
  // El filtro vive en la URL (patrón jurisprudencia): compartible y sobrevive
  // al refresh; convive con el deep-link `?digest=1`.
  const filtro = params.get("materia") ?? "todas";
  const digestAbierto = params.get("digest") === "1";

  const setFiltro = (m: string) => {
    const p = new URLSearchParams(params);
    if (m === "todas") p.delete("materia");
    else p.set("materia", m);
    const query = p.toString();
    router.replace(`/abogados/gaceta${query ? `?${query}` : ""}`, { scroll: false });
  };

  const materias = [...new Set(PUBLICACIONES.map((p) => p.materia))];
  const publicaciones =
    filtro === "todas" ? PUBLICACIONES : PUBLICACIONES.filter((p) => p.materia === filtro);

  return (
    <>
      <DigestSemanal expandido={digestAbierto} />

      {/* Los filtros van fuera de la grilla: así la primera card de cada
          columna arranca a la misma altura. */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FiltroChip activo={filtro === "todas"} onClick={() => setFiltro("todas")}>
          Todas ({PUBLICACIONES.length})
        </FiltroChip>
        {materias.map((m) => (
          <FiltroChip key={m} activo={filtro === m} onClick={() => setFiltro(m)}>
            {m} ({PUBLICACIONES.filter((p) => p.materia === m).length})
          </FiltroChip>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ── Columna principal: publicaciones ── */}
        <div>
          <div className="flex flex-col gap-3">
            {publicaciones.map((p) => (
              <Link key={p.id} href={`/abogados/gaceta/${p.id}`} className="block text-marino">
                <Card interactiva className="px-5 py-4">
                  <div className="flex items-baseline gap-3.5">
                    <ChipMateria>{p.materia}</ChipMateria>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{p.titulo}</div>
                      <div className="mt-[3px] text-[12.5px] text-texto-3">{p.meta}</div>
                    </div>
                    <span className="text-[12.5px] whitespace-nowrap text-celeste">
                      Ver publicación →
                    </span>
                  </div>
                  {/* Impacto como señal, no banner: una línea con el punto dorado. */}
                  <div className="mt-2 flex items-start gap-2 border-t border-borde-suave pt-2.5 text-[12.5px] leading-[1.5] text-texto-2">
                    <span className="mt-px grid shrink-0 place-items-center text-dorado">
                      <Icono nombre="alerta" size={13} />
                    </span>
                    <span className="line-clamp-1">{p.afecta}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Columna lateral ── */}
        <div className="flex flex-col gap-4">
          <EstaSemanaEnNumeros />
          <MateriasSuscritas />
          <SemanasAnteriores
            onAbrir={() => mostrarToast("El archivo histórico llega con el corpus real de ENAG")}
          />
        </div>
      </div>
    </>
  );
}

function FiltroChip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-[7px] text-[12.5px] font-medium transition-colors",
        activo
          ? "border-celeste bg-celeste text-white"
          : "border-borde bg-white text-texto-3 hover:border-celeste",
      )}
    >
      {children}
    </button>
  );
}

/** Lo primero que un abogado quiere saber: qué cayó y cuánto le toca. */
function EstaSemanaEnNumeros() {
  const materias = [...new Set(PUBLICACIONES.map((p) => p.materia))];
  const conImpacto = PUBLICACIONES.filter((p) => p.afecta.toLowerCase().includes("caso")).length;

  return (
    <Card className="p-5">
      <TituloSeccion>Esta semana en números</TituloSeccion>
      <div className="mt-3 flex flex-col gap-2 text-[13px]">
        <Fila etiqueta="Publicaciones en tus materias" valor={String(PUBLICACIONES.length)} />
        {materias.map((m) => (
          <Fila
            key={m}
            etiqueta={m}
            valor={String(PUBLICACIONES.filter((p) => p.materia === m).length)}
          />
        ))}
        <div className="flex items-center justify-between border-t border-borde-suave pt-2">
          <span className="text-texto-3">Afectan tus casos activos</span>
          <b className="text-dorado">{conImpacto}</b>
        </div>
      </div>
    </Card>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-texto-3">{etiqueta}</span>
      <b>{valor}</b>
    </div>
  );
}

function MateriasSuscritas() {
  const subs = usePortal((s) => s.subs);
  const toggleMateria = usePortal((s) => s.toggleMateria);
  const mostrarToast = usePortal((s) => s.mostrarToast);

  const toggleConAviso = (materia: string, activa: boolean) => {
    toggleMateria(materia);
    mostrarToast(
      activa
        ? `Alertas de ${materia} desactivadas`
        : `Alertas de ${materia} activadas — por correo y digest semanal`,
    );
  };

  return (
    <Card className="p-5">
      <TituloSeccion>Mis materias suscritas</TituloSeccion>
      <p className="mt-1 text-[11.5px] leading-[1.5] text-texto-4">
        Definen tu digest, tus alertas y el triaje del Dashboard.
      </p>
      {/* Grilla 2×3: celdas parejas, sin pills huérfanas al envolver. */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* Suscritas primero: lo activo se lee de un vistazo. */}
        {Object.entries(subs)
          .sort(([, a], [, b]) => Number(b) - Number(a))
          .map(([materia, activa]) => (
            <PillMateria
              key={materia}
              nombre={materia}
              activa={activa}
              onToggle={() => toggleConAviso(materia, activa)}
              className="w-full px-2 text-center text-[12px] whitespace-nowrap"
            />
          ))}
      </div>
    </Card>
  );
}

/** TODO(data): el archivo real sale del scraper de ENAG (2015→2026). */
function SemanasAnteriores({ onAbrir }: { onAbrir: () => void }) {
  const semanas = [
    { rango: "10 – 16 de agosto", publicaciones: 4 },
    { rango: "3 – 9 de agosto", publicaciones: 6 },
    { rango: "27 jul – 2 de agosto", publicaciones: 3 },
  ];

  return (
    <Card className="p-5">
      <TituloSeccion>Semanas anteriores</TituloSeccion>
      <div className="mt-2.5 flex flex-col">
        {semanas.map((s) => (
          <button
            key={s.rango}
            type="button"
            onClick={onAbrir}
            className="flex cursor-pointer items-center justify-between border-b border-borde-suave py-2.5 text-left text-[13px] last:border-b-0 hover:text-celeste"
          >
            <span>Semana del {s.rango}</span>
            <span className="text-[11.5px] text-texto-4">{s.publicaciones} publicaciones</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
