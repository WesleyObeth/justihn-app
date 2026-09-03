"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, Rotulo } from "@/components/ui/primitivos";
import { CODIGOS_CARGADOS, getCodigo, getTema, TEMAS_LEGISLACION } from "@/data/legislacion";
import type { ArticuloCorpus } from "@/lib/corpus/articulo";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";
import { conteosConocidos, CuerpoArticulo, LineaEnPreparacion, pedir, PieArticulo, rutaArticulo, tituloDe, type RespuestaBusqueda } from "./comun";

/**
 * Vista TEMAS: la entrada es la situación que el abogado resuelve, no el
 * código. Cada tema junta los artículos que la regulan aunque vivan en
 * códigos distintos, con la nota verificada, el texto plegable y, al lado,
 * la herramienta del portal que los aplica y las fuentes.
 *
 * URL: `?vista=temas&tema=`.
 */
export function VistaTemas() {
  const params = useSearchParams();
  const tema = getTema(params.get("tema")) ?? TEMAS_LEGISLACION[0]!;
  return <Temas key={tema.id} temaId={tema.id} />;
}

function Temas({ temaId }: { temaId: string }) {
  const router = useRouter();
  const tema = getTema(temaId)!;
  const preguntar = usePreguntarAJusIA();
  const [estado, setEstado] = useState<{ articulos: ArticuloCorpus[] } | { error: string } | null>(null);
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set([`${tema.articulos[0]!.codigoId}/${tema.articulos[0]!.numero}`]));
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const abortador = new AbortController();
    pedir<RespuestaBusqueda>({ modo: "tema", tema: temaId }, abortador.signal)
      .then((r) => setEstado({ articulos: r.articulos }))
      .catch((e: unknown) => {
        if (!abortador.signal.aborted) setEstado({ error: e instanceof Error ? e.message : "No se pudo leer." });
      });
    return () => abortador.abort();
  }, [temaId]);

  const conteos = conteosConocidos();
  const articulos = estado && "articulos" in estado ? estado.articulos : null;
  const codigosDelTema = [...new Set(tema.articulos.map((a) => a.codigoId))].map((id) => getCodigo(id)!);
  const alternar = (k: string) =>
    setAbiertos((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const buscar = () => {
    if (busqueda.trim()) router.push(`/abogados/legislacion?vista=buscador&q=${encodeURIComponent(busqueda.trim())}`);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 items-end gap-3 lg:grid-cols-[1fr_auto]">
        <div>
          <h2 className="font-display text-[18px] font-bold">¿Qué estás resolviendo?</h2>
          <p className="mt-1 max-w-[62ch] text-[13px] text-texto-3">
            Cada situación junta los artículos que la regulan, aunque estén en códigos distintos, y la herramienta del
            portal que los aplica. Para lo que no está aquí, busca en los tres códigos.
          </p>
        </div>
        <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-borde bg-white px-3.5 focus-within:border-celeste lg:w-[320px]">
          <Icono nombre="buscar" size={14} className="shrink-0 text-texto-4" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Buscar en los tres códigos…"
            aria-label="Buscar en los tres códigos"
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-marino outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {TEMAS_LEGISLACION.map((t) => (
          <Link
            key={t.id}
            href={`/abogados/legislacion?vista=temas&tema=${t.id}`}
            aria-current={t.id === temaId ? "page" : undefined}
            className={cn(
              "flex min-h-[104px] flex-col gap-1.5 rounded-xl border bg-white px-4 py-3.5 text-marino hover:border-celeste",
              t.id === temaId ? "border-celeste shadow-[0_0_0_2px_var(--color-chip)]" : "border-borde",
            )}
          >
            <b className="text-[14px] leading-[1.3]">{t.titulo}</b>
            <span className="text-[11.5px] text-texto-4">
              {[...new Set(t.articulos.map((a) => getCodigo(a.codigoId)!.nombre))].join(" · ")}
            </span>
            <span className="mt-auto text-[12px] text-texto-3">
              <em className="font-mono font-bold text-celeste not-italic">{t.articulos.length}</em> artículos ·{" "}
              {t.herramienta.etiqueta}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[1fr_300px]">
        <Card className="py-1.5">
          {estado && "error" in estado && (
            <div className="px-5 py-8 text-center text-[13px] text-texto-3">
              {estado.error}
              <div className="mt-3">
                <Boton onClick={() => router.refresh()}>Reintentar</Boton>
              </div>
            </div>
          )}
          {!estado && <p className="px-5 py-8 text-center text-[13px] text-texto-4">Leyendo los artículos…</p>}
          {articulos?.map((a, idx) => {
            const k = `${a.codigoId}/${a.numero}`;
            const d = getCodigo(a.codigoId)?.destacados.find((x) => x.numero === a.numero);
            const abierto = abiertos.has(k);
            return (
              <div key={k} className={cn("grid grid-cols-[auto_1fr] items-start gap-x-3.5 gap-y-2 px-5 py-3.5", idx > 0 && "border-t border-borde-suave")}>
                <Link href={rutaArticulo(a)} className="mt-0.5 rounded-md bg-chip px-2.5 py-[3px] font-mono text-[11.5px] font-bold text-celeste">
                  Art. {a.numero}
                </Link>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-[14px]">{tituloDe(a) ?? `Artículo ${a.numero}`}</b>
                    <span className="text-[11.5px] text-texto-4">
                      {a.codigoNombre}
                      {a.pagina ? ` · pág. ${a.pagina}` : ""}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-texto-3">{d?.nota ?? `${a.cuerpo.replace(/\s+/g, " ").slice(0, 140)}…`}</p>
                  <button type="button" onClick={() => alternar(k)} className="mt-1.5 cursor-pointer text-[12.5px] font-medium text-celeste hover:text-marino">
                    {abierto ? "Cerrar el texto ▴" : "Leer el texto oficial ▾"}
                  </button>
                </div>
                {abierto && (
                  <div className="col-start-2 flex flex-col gap-3">
                    <CuerpoArticulo a={a} />
                    <PieArticulo a={a} />
                  </div>
                )}
              </div>
            );
          })}
        </Card>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-4">
          <Card className="px-4.5 py-4">
            <Rotulo>Herramienta</Rotulo>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-texto-2">{tema.detalle}</p>
            <Link href={tema.herramienta.href} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-celeste px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-cruce hover:text-white">
              {tema.herramienta.etiqueta} →
            </Link>
          </Card>
          <Card className="px-4.5 py-4">
            <Rotulo>Fuentes</Rotulo>
            <ul className="mt-2 flex flex-col gap-1.5 text-[13px]">
              {codigosDelTema.map((c) => (
                <li key={c.id}>
                  <a href={c.fuenteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                    <Icono nombre="libro" size={12} strokeWidth={2} />
                    {c.nombre}
                  </a>
                  <span className="text-[11.5px] text-texto-4"> · {c.decreto}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="px-4.5 py-4">
            <Rotulo>Jus IA</Rotulo>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-texto-2">
              Pregunta cómo ha aplicado la Corte Suprema estos artículos: responde citando sentencias reales.
            </p>
            <BotonJusIA
              compacto
              className="mt-3"
              onClick={() =>
                preguntar(
                  `Sobre ${tema.titulo.toLowerCase()}: ¿cómo ha aplicado la Corte Suprema los artículos ${tema.articulos.map((a) => a.numero).join(", ")} del ${codigosDelTema.map((c) => c.nombre).join(" y del ")}?`,
                )
              }
            >
              Preguntar sobre este tema
            </BotonJusIA>
          </Card>
        </aside>
      </div>

      <div className="mt-2">
        <h3 className="font-display text-[14px] font-semibold">Leer un código en orden</h3>
        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {CODIGOS_CARGADOS.map((c) => (
            <Link
              key={c.id}
              href={`/abogados/legislacion?vista=lector&codigo=${c.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-white px-4 py-3 text-[13.5px] font-semibold text-marino hover:border-celeste"
            >
              {c.nombre}
              <span className="text-[12px] font-medium text-texto-4">
                {conteos?.[c.id] ? `${conteos[c.id]!.toLocaleString("es-HN")} artículos` : "en orden"}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-2.5">
          <LineaEnPreparacion />
        </div>
      </div>
    </div>
  );
}
