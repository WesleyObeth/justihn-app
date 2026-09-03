"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { Card, ChipMateria, Rotulo } from "@/components/ui/primitivos";
import { CODIGOS_CARGADOS, getCodigo } from "@/data/legislacion";
import { pareceNumeroArticulo, type ArticuloCorpus } from "@/lib/corpus/articulo";
import type { EntradaIndice } from "@/lib/corpus/legislacion";
import { cn } from "@/lib/utils";
import {
  conteosConocidos,
  CuerpoArticulo,
  LineaEnPreparacion,
  NotaPortal,
  pedir,
  PieArticulo,
  tituloDe,
  type RespuestaBusqueda,
  type RespuestaIndice,
} from "./comun";

/**
 * Vista LECTOR: el código se lee como un libro. Selector de código arriba,
 * índice completo a la izquierda (los que el portal aplica, fijados) y el
 * artículo abierto a la derecha, con anterior y siguiente.
 *
 * URL: `?vista=lector&codigo=&art=`. El filtro del índice es local: busca en
 * número, rúbrica y arranque; para el texto entero manda al Buscador.
 */
const indicesCargados = new Map<string, EntradaIndice[]>();

export function VistaLector() {
  const params = useSearchParams();
  const codigo = getCodigo(params.get("codigo"))?.estado === "cargado" ? getCodigo(params.get("codigo"))!.id : CODIGOS_CARGADOS[0]!.id;
  return <Lector key={codigo} codigoId={codigo} artPedido={params.get("art")} />;
}

function Lector({ codigoId, artPedido }: { codigoId: string; artPedido: string | null }) {
  const router = useRouter();
  const codigo = getCodigo(codigoId)!;
  const [indice, setIndice] = useState<EntradaIndice[] | null>(() => indicesCargados.get(codigoId) ?? null);
  const [errorIndice, setErrorIndice] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [lectura, setLectura] = useState<{ numero: string; articulo: ArticuloCorpus | null; error?: string } | null>(null);

  useEffect(() => {
    if (indicesCargados.has(codigoId)) return;
    const abortador = new AbortController();
    pedir<RespuestaIndice>({ codigo: codigoId, modo: "indice" }, abortador.signal)
      .then((r) => {
        indicesCargados.set(codigoId, r.indice);
        setIndice(r.indice);
      })
      .catch((e: unknown) => {
        if (!abortador.signal.aborted) setErrorIndice(e instanceof Error ? e.message : "No se pudo leer el índice.");
      });
    return () => abortador.abort();
  }, [codigoId]);

  const numeroActual = artPedido ? pareceNumeroArticulo(artPedido) : null;
  const numero = numeroActual ?? indice?.[0]?.numero ?? null;

  useEffect(() => {
    if (!numero) return;
    const abortador = new AbortController();
    pedir<RespuestaBusqueda>({ codigo: codigoId, q: numero, modo: "texto" }, abortador.signal)
      .then((r) => setLectura({ numero, articulo: r.articulos[0] ?? null, error: r.aviso }))
      .catch((e: unknown) => {
        if (!abortador.signal.aborted) setLectura({ numero, articulo: null, error: e instanceof Error ? e.message : "No se pudo leer." });
      });
    return () => abortador.abort();
  }, [codigoId, numero]);

  const conteos = conteosConocidos();
  const ir = (n: string) => router.replace(`/abogados/legislacion?vista=lector&codigo=${codigoId}&art=${encodeURIComponent(n)}`, { scroll: false });

  const n = pareceNumeroArticulo(filtro);
  const t = filtro.trim().toLowerCase();
  const visibles = (indice ?? []).filter((e) =>
    !t ? true : n ? e.numero === n : `${e.numero} ${e.rubrica ?? ""} ${e.arranque}`.toLowerCase().includes(t),
  );
  const fijados = t ? [] : visibles.filter((e) => codigo.destacados.some((d) => d.numero === e.numero));
  const i = indice?.findIndex((e) => e.numero === numero) ?? -1;
  const anterior = i > 0 ? indice![i - 1] : null;
  const siguiente = i >= 0 && indice && i < indice.length - 1 ? indice[i + 1] : null;
  const cargandoLectura = numero !== null && lectura?.numero !== numero;
  const a = lectura?.numero === numero ? lectura.articulo : null;
  const rotuloDe = (e: EntradaIndice) => e.rubrica ?? codigo.destacados.find((d) => d.numero === e.numero)?.titulo ?? null;
  // El artículo puede llegar ANTES que el índice: el título no depende de él.
  const tituloLectura = a ? tituloDe(a) : null;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-0.5 rounded-[11px] bg-sutil p-1" role="tablist" aria-label="Código">
          {CODIGOS_CARGADOS.map((c) => (
            <Link
              key={c.id}
              role="tab"
              aria-selected={c.id === codigoId}
              href={`/abogados/legislacion?vista=lector&codigo=${c.id}`}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold text-texto-3 hover:text-marino",
                c.id === codigoId && "bg-white text-marino shadow-papel",
              )}
            >
              {c.nombre}
              {conteos?.[c.id] && (
                <span className="text-[11.5px] font-medium text-texto-4 tabular-nums">{conteos[c.id]!.toLocaleString("es-HN")}</span>
              )}
            </Link>
          ))}
        </div>
        <LineaEnPreparacion />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="flex max-h-[360px] flex-col overflow-hidden lg:sticky lg:top-4 lg:max-h-[calc(100vh-120px)]">
          <div className="mx-3.5 mt-3.5 mb-2 flex h-9 items-center gap-2 rounded-lg border border-borde bg-white px-3 focus-within:border-celeste">
            <Icono nombre="buscar" size={14} className="shrink-0 text-texto-4" />
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Ir al art. («120») o filtrar el índice"
              aria-label="Ir al artículo o filtrar el índice"
              className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-marino outline-none"
            />
          </div>
          <div className="overflow-auto px-2 pb-2.5">
            {errorIndice && <p className="px-3 py-4 text-[12.5px] text-texto-3">{errorIndice}</p>}
            {!indice && !errorIndice && <p className="px-3 py-4 text-[12.5px] text-texto-4">Leyendo el índice…</p>}
            {fijados.length > 0 && (
              <>
                <Rotulo className="px-3 pt-2.5 pb-1.5">Los que el portal aplica</Rotulo>
                {fijados.map((e) => (
                  <ItemIndice key={`f-${e.numero}`} e={e} rotulo={rotuloDe(e)} actual={e.numero === numero} onClick={() => ir(e.numero)} />
                ))}
                <Rotulo className="px-3 pt-3 pb-1.5">Todo el articulado</Rotulo>
              </>
            )}
            {visibles.map((e) => (
              <ItemIndice key={e.numero} e={e} rotulo={rotuloDe(e)} actual={e.numero === numero} onClick={() => ir(e.numero)} />
            ))}
            {indice && t && visibles.length === 0 && (
              <div className="px-3 py-5 text-center text-[12.5px] text-texto-3">
                Nada en el índice con «{filtro.trim()}».{" "}
                <Link href={`/abogados/legislacion?vista=buscador&codigo=${codigoId}&q=${encodeURIComponent(filtro.trim())}`}>
                  Buscar en el texto completo →
                </Link>
              </div>
            )}
          </div>
        </Card>

        <Card className={cn("min-h-[420px] px-7 py-6", cargandoLectura && "opacity-60 transition-opacity")}>
          {a ? (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-md bg-chip px-2.5 py-[3px] font-mono text-[12px] font-bold text-celeste">Art. {a.numero}</span>
                <ChipMateria>{codigo.materia}</ChipMateria>
                <span className="text-[11.5px] text-texto-4">
                  {codigo.nombre}
                  {a.pagina ? ` · pág. ${a.pagina} del PDF` : ""}
                </span>
              </div>
              <h2 className="font-display mt-2.5 text-[21px] leading-[1.3] font-bold">{tituloLectura ?? `Artículo ${a.numero}`}</h2>
              {!a.rubrica && tituloLectura && (
                <p className="mt-1 text-[12px] text-texto-4">Rótulo del portal — el texto oficial no titula este artículo.</p>
              )}
              <div className="mt-4">
                <CuerpoArticulo a={a} />
              </div>
              <NotaPortal a={a} className="mt-4" />
              <div className="mt-5 border-t border-borde-suave pt-4">
                <PieArticulo a={a} />
              </div>
              <nav aria-label="Artículos vecinos" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
                {anterior ? (
                  <button type="button" onClick={() => ir(anterior.numero)} className="cursor-pointer text-celeste hover:text-marino">
                    ← Art. {anterior.numero}
                    {rotuloDe(anterior) ? ` · ${rotuloDe(anterior)}` : ""}
                  </button>
                ) : (
                  <span />
                )}
                {siguiente && (
                  <button type="button" onClick={() => ir(siguiente.numero)} className="cursor-pointer text-celeste hover:text-marino">
                    Art. {siguiente.numero}
                    {rotuloDe(siguiente) ? ` · ${rotuloDe(siguiente)}` : ""} →
                  </button>
                )}
              </nav>
            </>
          ) : lectura?.numero === numero && lectura.error ? (
            <p className="text-[13px] text-texto-3">{lectura.error}</p>
          ) : (
            <p className="text-[13px] text-texto-4">{numero ? "Leyendo el artículo…" : "Elige un artículo del índice."}</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function ItemIndice({ e, rotulo, actual, onClick }: { e: EntradaIndice; rotulo: string | null; actual: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-current={actual}
      onClick={onClick}
      className={cn(
        "grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-baseline gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-texto-2 hover:bg-sutil",
        actual && "bg-chip text-marino",
      )}
    >
      <span className="rounded-[5px] bg-chip px-1.5 py-[1px] font-mono text-[11px] font-bold text-celeste">{e.numero}</span>
      <span className="truncate">{rotulo ?? <i className="text-texto-4 not-italic">{e.arranque}…</i>}</span>
      <span className="text-[11px] text-texto-4 tabular-nums">{e.pagina ? `p. ${e.pagina}` : ""}</span>
    </button>
  );
}
