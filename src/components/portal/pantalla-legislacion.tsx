"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, ChipMateria, Rotulo } from "@/components/ui/primitivos";
import { CODIGOS } from "@/data/legislacion";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";

/**
 * Legislación consolidada — cierra la promesa "legislación ilimitada" del plan
 * Base (todo el corpus para todos, sin gating). La muestra del CPC es real
 * (artículos verificados contra el PDF oficial del PJ); los demás códigos se
 * muestran "en preparación" con honestidad: sin fuente cargada no hay texto.
 */
export function PantallaLegislacion() {
  // La selección vive en la URL (`?codigo=`) — patrón de Procesos: deep-link
  // compartible y back/forward entre códigos.
  const router = useRouter();
  const params = useSearchParams();
  const seleccionado = CODIGOS.find((c) => c.id === params.get("codigo"))?.id ?? CODIGOS[0]!.id;
  const [filtro, setFiltro] = useState("");

  const seleccionar = (id: string) => {
    setFiltro("");
    router.replace(`/abogados/legislacion?codigo=${id}`, { scroll: false });
  };

  const codigo = CODIGOS.find((c) => c.id === seleccionado)!;

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[300px_1fr]">
      <div className="flex flex-col gap-2">
        {CODIGOS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => seleccionar(c.id)}
            aria-pressed={c.id === seleccionado}
            className={cn(
              "cursor-pointer rounded-[10px] border bg-white px-4 py-3.5 text-left hover:border-celeste",
              c.id === seleccionado
                ? "border-celeste shadow-[0_2px_10px_rgba(21,132,199,.12)]"
                : "border-borde",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13.5px] font-semibold">{c.nombre}</span>
              {c.estado === "muestra" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10px] font-bold text-exito">
                  <Icono nombre="check" size={9} strokeWidth={2.6} />
                  MUESTRA
                </span>
              ) : (
                <span className="rounded-full border border-borde bg-lienzo px-2 py-[2px] text-[10px] font-semibold text-texto-4">
                  PRONTO
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11.5px] text-texto-4">
              {c.materia} · {c.decreto}
            </div>
          </button>
        ))}
      </div>

      {codigo.estado === "muestra" ? (
        <CodigoCargado codigo={codigo} filtro={filtro} onFiltro={setFiltro} />
      ) : (
        <CodigoEnPreparacion codigo={codigo} />
      )}
    </div>
  );
}

// ── Código con muestra verificada ──────────────────────────────────────────

function CodigoCargado({
  codigo,
  filtro,
  onFiltro,
}: {
  codigo: (typeof CODIGOS)[number];
  filtro: string;
  onFiltro: (v: string) => void;
}) {
  const preguntar = usePreguntarAJusIA();

  const t = filtro.trim().toLowerCase();
  const articulos = t
    ? codigo.articulos.filter((a) =>
        `${a.numero} ${a.titulo} ${a.sintesis} ${a.nota ?? ""}`.toLowerCase().includes(t),
      )
    : codigo.articulos;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[19px] font-bold">{codigo.nombre}</h2>
            <ChipMateria>{codigo.materia}</ChipMateria>
          </div>
          <p className="mt-1 text-[13px] text-texto-3">
            {codigo.decreto} · {codigo.descripcion}
          </p>
        </div>
        {codigo.fuenteUrl && (
          <a
            href={codigo.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-borde bg-lienzo px-3.5 py-2 text-[12.5px] font-medium whitespace-nowrap text-marino hover:border-celeste hover:text-celeste"
          >
            <Icono nombre="libro" size={13} />
            PDF oficial íntegro
          </a>
        )}
      </div>

      <div className="mt-4 flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-borde bg-white px-3.5 py-2.5 focus-within:border-celeste sm:max-w-[340px]">
        <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
        <input
          value={filtro}
          onChange={(e) => onFiltro(e.target.value)}
          placeholder="Buscar en los artículos de la muestra…"
          aria-label={`Buscar en ${codigo.nombre}`}
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
        />
      </div>

      <p className="mt-3 text-[12px] text-texto-4">
        Muestra de {codigo.articulos.length} bloques ·{" "}
        <b className="text-exito">verificados contra el PDF oficial del PJ</b> · las síntesis son
        orientativas — el texto íntegro llega con la carga del código.
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {articulos.map((a) => (
          <div key={a.numero} className="rounded-[11px] border border-borde px-4.5 py-4">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="rounded-md bg-chip px-2.5 py-[3px] font-mono text-[11.5px] font-bold text-celeste">
                Art. {a.numero}
              </span>
              <span className="text-[14px] font-semibold">{a.titulo}</span>
            </div>
            <p className="mt-2 text-[13px] leading-[1.6] text-texto-2">{a.sintesis}</p>
            {a.nota && (
              <div className="mt-2 flex items-start gap-2 text-[12.5px] leading-[1.5] text-aviso-cuerpo">
                <span className="mt-px grid shrink-0 place-items-center text-dorado">
                  <Icono nombre="alerta" size={12} />
                </span>
                {a.nota}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <BotonJusIA
                compacto
                onClick={() =>
                  preguntar(
                    `¿Qué dice el artículo ${a.numero} del ${codigo.nombre} (${a.titulo.toLowerCase()}) y cómo se aplica en la práctica?`,
                  )
                }
              >
                Preguntar sobre este artículo
              </BotonJusIA>
              {a.herramienta && (
                <Link href={a.herramienta.href} className="text-[12.5px]">
                  {a.herramienta.etiqueta} →
                </Link>
              )}
            </div>
          </div>
        ))}

        {articulos.length === 0 && (
          <div className="rounded-[11px] bg-lienzo px-5 py-8 text-center">
            <p className="text-[13px] text-texto-3">
              Ningún artículo de la muestra menciona «{filtro.trim()}». El código completo será
              buscable al cargarse — mientras tanto, Jus IA puede orientarte.
            </p>
            <BotonJusIA
              className="mt-4"
              onClick={() =>
                preguntar(`¿Qué dice el ${codigo.nombre} sobre "${filtro.trim()}"?`)
              }
            >
              Preguntar a Jus IA
            </BotonJusIA>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Código en preparación ──────────────────────────────────────────────────

/** Honestidad de demo (regla #1): sin la fuente cargada no se muestra texto. */
function CodigoEnPreparacion({ codigo }: { codigo: (typeof CODIGOS)[number] }) {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntar = usePreguntarAJusIA();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-[19px] font-bold">{codigo.nombre}</h2>
        <ChipMateria>{codigo.materia}</ChipMateria>
      </div>
      <p className="mt-1 text-[13px] text-texto-3">
        {codigo.decreto} · {codigo.descripcion}
      </p>

      <div className="mt-5 rounded-[10px] border-l-[3px] border-celeste bg-lienzo px-4.5 py-4">
        <Rotulo className="text-celeste">En preparación</Rotulo>
        <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.6] text-texto-2">
          Este código se carga desde la fuente oficial del Poder Judicial
          (legislacion.poderjudicial.gob.hn) con el corpus completo. No mostramos texto que no
          podamos citar — es la promesa del producto.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <BotonJusIA
          compacto
          onClick={() =>
            preguntar(`¿Qué materias regula el ${codigo.nombre} y qué debo saber para mi práctica?`)
          }
        >
          Preguntar a Jus IA
        </BotonJusIA>
        <Boton
          className="px-3.5 py-2 text-[12.5px]"
          onClick={() => mostrarToast(`Te avisamos cuando el ${codigo.nombre} esté cargado`)}
        >
          Avisarme cuando esté
        </Boton>
      </div>
    </Card>
  );
}
