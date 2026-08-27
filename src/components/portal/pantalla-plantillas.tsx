"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { Boton, Card } from "@/components/ui/primitivos";
import { ModalVistaPrevia } from "@/components/portal/modal-plantilla";
import { PLANTILLAS } from "@/data/catalogo";
import { PROCESOS } from "@/data/procesos";
import { usePortal } from "@/store/portal";
import { useUpgrade } from "@/components/portal/marco";
import { cn } from "@/lib/utils";
import type { Plantilla } from "@/types/dominio";

/** Comparación sin tildes ni mayúsculas. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function PantallaPlantillas() {
  const esPro = usePortal((s) => s.plan) === "pro";
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const solicitarUpgrade = useUpgrade();
  const router = useRouter();
  const params = useSearchParams();
  const [previa, setPrevia] = useState<Plantilla | null>(null);
  // Búsqueda y filtro viven en la URL (patrón jurisprudencia/Gaceta):
  // compartibles y sobreviven al refresh. El input mantiene estado local para
  // no perder el foco al teclear; la URL se actualiza con `replace`.
  const [termino, setTermino] = useState(params.get("q") ?? "");
  const materia = params.get("materia") ?? "todas";

  const actualizarUrl = (q: string, m: string) => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (m !== "todas") p.set("materia", m);
    const query = p.toString();
    router.replace(`/abogados/modelos${query ? `?${query}` : ""}`, { scroll: false });
  };

  const setMateria = (m: string) => actualizarUrl(termino, m);
  const buscarTermino = (q: string) => {
    setTermino(q);
    actualizarUrl(q, materia);
  };

  const materias = [...new Set(PLANTILLAS.map((p) => p.tipo))];
  const filtradas = PLANTILLAS.filter((p) => {
    const porMateria = materia === "todas" || p.tipo === materia;
    const t = normalizar(termino.trim());
    // Incluye la vista previa: el abogado busca por cláusula, no solo por título.
    const porTermino =
      !t || normalizar(`${p.nombre} ${p.desc} ${p.tipo} ${p.vistaPrevia}`).includes(t);
    return porMateria && porTermino;
  });

  return (
    <>
      {!esPro && (
        <div
          className="mb-4.5 flex flex-wrap items-center gap-3.5 rounded-xl px-5 py-4 text-[#e8eef6]"
          style={{ background: "linear-gradient(90deg,#0d2144,#0a1830)" }}
        >
          <Icono nombre="candado" size={17} />
          <p className="min-w-[220px] flex-1 text-[13.5px]">
            Los modelos de escritos son parte del plan <b>Pro</b>. Puedes verlos; para
            descargarlos y editarlos, mejora tu plan.
          </p>
          <Boton variante="dorado" onClick={solicitarUpgrade} className="px-4 py-[9px]">
            Mejorar a Pro
          </Boton>
        </div>
      )}

      {/* Buscador + filtros por materia: un abogado con 50 plantillas busca,
          no scrollea. */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-borde bg-white px-3.5 py-2.5 focus-within:border-celeste sm:max-w-[320px]">
          <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
          <input
            value={termino}
            onChange={(e) => buscarTermino(e.target.value)}
            placeholder="Buscar modelo…"
            aria-label="Buscar modelo"
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
          />
        </div>
        <FiltroChip activo={materia === "todas"} onClick={() => setMateria("todas")}>
          Todas ({PLANTILLAS.length})
        </FiltroChip>
        {materias.map((m) => (
          <FiltroChip key={m} activo={materia === m} onClick={() => setMateria(m)}>
            {m}
          </FiltroChip>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtradas.map((p) => {
          const proceso = PROCESOS.find((pr) => pr.plantillaId === p.id);
          return (
            <Card
              key={p.id}
              interactiva
              role="button"
              tabIndex={0}
              onClick={() => setPrevia(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPrevia(p);
                }
              }}
              className="relative flex flex-col p-4.5"
            >
              {!esPro && (
                <span className="absolute top-3 right-3 grid place-items-center text-texto-4">
                  <Icono nombre="candado" size={13} />
                </span>
              )}
              <div className="text-[11px] font-semibold tracking-[.6px] text-texto-4 uppercase">
                {p.tipo}
              </div>
              <div className="font-display mt-1.5 text-[15px] font-semibold">{p.nombre}</div>
              <div className="mt-1 flex-1 text-[12.5px] text-texto-3">{p.desc}</div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="text-[12px] text-celeste">Ver vista previa →</span>
                {proceso && (
                  <Link
                    href={`/abogados/procesos?proceso=${proceso.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11.5px] text-texto-4 hover:text-celeste"
                  >
                    Guía del proceso →
                  </Link>
                )}
              </div>
            </Card>
          );
        })}

        {/* Roadmap abierto: el gremio pide, el catálogo crece. Si hay una
            búsqueda sin resultados, la sugerencia registra ESE término. */}
        <button
          type="button"
          onClick={() =>
            mostrarToast(
              termino.trim()
                ? `Sugerencia registrada: «${termino.trim()}» — definirá el catálogo`
                : "¡Gracias! Las sugerencias definen qué modelos se suman al catálogo",
            )
          }
          className="grid min-h-[130px] cursor-pointer place-items-center rounded-xl border-2 border-dashed border-borde bg-transparent p-4.5 text-texto-4 hover:border-celeste hover:text-celeste"
        >
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Icono nombre="mas" size={18} />
            <span className="text-[13px] font-medium">Sugerir un modelo</span>
            <span className="text-[11.5px]">¿Te falta un escrito? Pídelo aquí</span>
          </span>
        </button>
      </div>

      {filtradas.length === 0 && (
        <Card className="mt-4 px-5 py-8 text-center text-[13px] text-texto-3">
          Ningún modelo coincide con «{termino.trim()}». Prueba con otro término o sugiere el
          modelo que te falta.
        </Card>
      )}

      <ModalVistaPrevia plantilla={previa} onCerrar={() => setPrevia(null)} />
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
