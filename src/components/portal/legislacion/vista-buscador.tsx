"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, Rotulo } from "@/components/ui/primitivos";
import { CODIGOS_CARGADOS, getCodigo, TEMAS_LEGISLACION } from "@/data/legislacion";
import { LIMITE_SEMANTICO_ARTICULOS } from "@/lib/corpus/articulo";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";
import {
  CardArticulo,
  conteosConocidos,
  LineaEnPreparacion,
  ModoPill,
  pedir,
  rutaArticulo,
  type Modo,
  type RespuestaBusqueda,
} from "./comun";

/**
 * Vista BUSCADOR: una sola caja sobre los tres códigos. Sin consulta ni
 * código, propone por dónde empezar (temas y leer un código en orden); con
 * código, lista el articulado en orden; con consulta, resultados que se
 * leen sin salir de la lista («Leer aquí»).
 *
 * URL: `?vista=buscador&codigo=&q=&modo=&p=`.
 */
interface Aplicados {
  codigo: string | null;
  q: string;
  modo: Modo;
  pagina: number;
}

type Estado =
  | { clave: string; tipo: "listo"; datos: RespuestaBusqueda }
  | { clave: string; tipo: "error"; mensaje: string };

function leerAplicados(params: URLSearchParams): Aplicados {
  const pagina = Number(params.get("p"));
  const codigo = getCodigo(params.get("codigo"));
  return {
    codigo: codigo?.estado === "cargado" ? codigo.id : null,
    q: params.get("q") ?? "",
    modo: params.get("modo") === "semantica" ? "semantica" : "texto",
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
  };
}

function aQuery(a: Aplicados): string {
  const p = new URLSearchParams({ vista: "buscador" });
  if (a.codigo && a.modo === "texto") p.set("codigo", a.codigo);
  if (a.q.trim()) p.set("q", a.q.trim());
  if (a.modo === "semantica") p.set("modo", "semantica");
  if (a.pagina > 1 && a.modo === "texto") p.set("p", String(a.pagina));
  return `?${p.toString()}`;
}

export function VistaBuscador() {
  const router = useRouter();
  const params = useSearchParams();
  const aplicados = leerAplicados(params);
  const clave = aQuery(aplicados);
  const hayConsulta = aplicados.q.trim() !== "";
  const pide = hayConsulta || aplicados.codigo !== null;

  const [termino, setTermino] = useState(aplicados.q);
  const [modo, setModo] = useState<Modo>(aplicados.modo);
  const [estado, setEstado] = useState<Estado | null>(null);
  const preguntar = usePreguntarAJusIA();

  useEffect(() => {
    if (!pide) return;
    const abortador = new AbortController();
    const a = leerAplicados(new URLSearchParams(clave));
    pedir<RespuestaBusqueda>(
      { codigo: a.modo === "semantica" ? null : a.codigo, q: a.q, pagina: a.pagina, modo: a.modo },
      abortador.signal,
    )
      .then((datos) => setEstado({ clave, tipo: "listo", datos }))
      .catch((error: unknown) => {
        if (abortador.signal.aborted) return;
        setEstado({ clave, tipo: "error", mensaje: error instanceof Error ? error.message : "No se pudo buscar." });
      });
    return () => abortador.abort();
  }, [clave, pide]);

  const cargando = pide && estado?.clave !== clave;
  const datos = estado?.tipo === "listo" && estado.clave === clave ? estado.datos : null;
  const conteos = datos?.conteos ?? conteosConocidos();
  const codigo = aplicados.codigo ? getCodigo(aplicados.codigo) : null;
  const enSemantica = aplicados.modo === "semantica";

  const navegar = (a: Aplicados) => router.replace(`/abogados/legislacion${aQuery(a)}`, { scroll: false });
  const aplicar = (extra?: Partial<Aplicados>) =>
    navegar({ codigo: aplicados.codigo, q: termino, modo, pagina: 1, ...extra });
  const cambiarModo = (m: Modo) => {
    setModo(m);
    aplicar({ modo: m });
  };
  const limpiar = () => {
    setTermino("");
    setModo("texto");
    navegar({ codigo: null, q: "", modo: "texto", pagina: 1 });
  };

  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.total / datos.porPagina)) : 1;
  const etiquetaCorta = (id: string) =>
    getCodigo(id)!.nombre.replace("Código ", "").replace("del ", "").replace("de ", "");

  return (
    <div className="flex flex-col gap-3.5">
      <Card className="px-5 py-4.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-11 min-w-[min(260px,100%)] flex-1 items-center gap-2 rounded-lg border border-borde bg-white px-3.5 focus-within:border-celeste">
            <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
            <input
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicar()}
              placeholder={
                enSemantica
                  ? "Describe la situación con tus palabras: «plazo para reclamar un despido»"
                  : "Número de artículo («120», «120-A») o palabras del texto…"
              }
              aria-label="Buscar en los códigos"
              maxLength={200}
              className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
            />
          </div>
          <Boton variante="marino" onClick={() => aplicar()} className="h-11 px-4.5">
            Buscar
          </Boton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-borde-suave pt-3">
          <span className="text-[11.5px] text-texto-4">Buscar</span>
          <ModoPill activo={modo === "texto"} onClick={() => cambiarModo("texto")}>
            por número o palabras
          </ModoPill>
          <ModoPill activo={modo === "semantica"} onClick={() => cambiarModo("semantica")}>
            por significado
          </ModoPill>
          <span className="mx-1 h-4 w-px bg-borde" aria-hidden="true" />
          <span className="text-[11.5px] text-texto-4">En</span>
          <ChipCodigo activo={aplicados.codigo === null} onClick={() => aplicar({ codigo: null })}>
            Los tres
          </ChipCodigo>
          {CODIGOS_CARGADOS.map((c) => (
            <ChipCodigo
              key={c.id}
              activo={aplicados.codigo === c.id}
              disabled={modo === "semantica"}
              onClick={() => aplicar({ codigo: c.id })}
            >
              {etiquetaCorta(c.id)}
              {conteos?.[c.id] ? (
                <span className="ml-1 opacity-70">{conteos[c.id]!.toLocaleString("es-HN")}</span>
              ) : null}
            </ChipCodigo>
          ))}
          <span className="text-[11.5px] leading-[1.5] text-texto-4">
            {modo === "texto"
              ? "— coincidencia exacta, con tildes; en el orden del código."
              : `— entiende la consulta; hasta ${LIMITE_SEMANTICO_ARTICULOS} artículos afines de los tres códigos.`}
          </span>
        </div>
      </Card>

      {!pide && (
        <>
          <div className="mt-2">
            <h3 className="font-display text-[15px] font-semibold">Empieza por lo que estás resolviendo</h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {TEMAS_LEGISLACION.map((t) => (
                <Link
                  key={t.id}
                  href={`/abogados/legislacion?vista=buscador&modo=semantica&q=${encodeURIComponent(t.titulo.toLowerCase())}`}
                  className="flex flex-col gap-1 rounded-xl border border-borde bg-white px-4 py-3.5 text-marino hover:border-celeste"
                >
                  <b className="text-[14px]">{t.titulo}</b>
                  <span className="text-[12px] text-texto-4">
                    {[...new Set(t.articulos.map((a) => getCodigo(a.codigoId)!.nombre))].join(" · ")}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {t.articulos.map((a) => (
                      <span
                        key={`${a.codigoId}/${a.numero}`}
                        className="rounded-[5px] bg-chip px-1.5 font-mono text-[10.5px] text-celeste"
                      >
                        {a.numero}
                      </span>
                    ))}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-display text-[15px] font-semibold">O lee un código en orden</h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {CODIGOS_CARGADOS.map((c) => (
                <Link
                  key={c.id}
                  href={`/abogados/legislacion?vista=buscador&codigo=${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-white px-4 py-3.5 text-[13.5px] font-semibold text-marino hover:border-celeste"
                >
                  {c.nombre}
                  <span className="text-[12px] font-medium text-texto-4">
                    {conteos?.[c.id] ? `${conteos[c.id]!.toLocaleString("es-HN")} artículos` : "artículo por artículo"}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-2.5">
              <LineaEnPreparacion />
            </div>
          </div>
        </>
      )}

      {pide && codigo && !hayConsulta && codigo.destacados.length > 0 && (
        <div className="mx-0.5">
          <Rotulo>Artículos que el portal ya aplica</Rotulo>
          <div className="mt-2 flex flex-wrap gap-2">
            {codigo.destacados.map((d) => (
              <Link
                key={d.numero}
                href={rutaArticulo({ codigoId: codigo.id, numero: d.numero })}
                title={d.nota}
                className="inline-flex items-center gap-2 rounded-full border border-borde bg-white px-3 py-[6px] text-[12.5px] text-marino hover:border-celeste"
              >
                <span className="font-mono text-[11px] font-bold text-celeste">Art. {d.numero}</span>
                {d.titulo}
              </Link>
            ))}
          </div>
        </div>
      )}

      {pide && (
        <p className="mx-0.5 min-h-[18px] text-[12.5px] text-texto-3" aria-live="polite">
          {cargando && !datos && "Leyendo el código…"}
          {datos && (
            <>
              <b className="text-marino">{datos.total.toLocaleString("es-HN")}</b>{" "}
              {datos.total === 1 ? "artículo" : "artículos"} ·{" "}
              <b className="text-exito">texto oficial del PDF del CEDIJ</b>
              {enSemantica
                ? " · ordenados por afinidad"
                : codigo
                  ? ` · en el orden del ${codigo.nombre}`
                  : " · en el orden de cada código"}
              {hayConsulta && (
                <>
                  {" "}
                  · búsqueda: <b>&laquo;{aplicados.q}&raquo;</b>
                </>
              )}
            </>
          )}
          <button type="button" onClick={limpiar} className="ml-2.5 cursor-pointer text-celeste hover:text-marino">
            Limpiar
          </button>
        </p>
      )}

      {datos?.aviso && <p className="mx-0.5 -mt-1.5 text-[12px] text-texto-4">{datos.aviso}</p>}

      {estado?.tipo === "error" && (
        <Card className="px-5 py-8 text-center">
          <p className="text-[13px] text-texto-3">{estado.mensaje}</p>
          <Boton className="mt-4" onClick={() => router.refresh()}>
            Reintentar
          </Boton>
        </Card>
      )}

      <div className={cn("flex flex-col gap-3", cargando && "opacity-60 transition-opacity")}>
        {datos?.articulos.map((a) => (
          <CardArticulo
            key={a.id}
            articulo={a}
            termino={enSemantica ? "" : aplicados.q}
            mostrarCodigo={!codigo || enSemantica}
            desplegable
          />
        ))}
        {datos && datos.articulos.length === 0 && (
          <Card className="px-5 py-8 text-center">
            <p className="text-[13px] text-texto-3">
              {datos.aviso
                ? "Ese número no tiene texto propio en la capa de texto del PDF."
                : enSemantica
                  ? "Ningún artículo se parece a lo que describes. Prueba con otras palabras."
                  : `Ningún artículo contiene «${aplicados.q}» tal cual. La búsqueda por palabras exige las tildes — o busca por significado.`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {!enSemantica && hayConsulta && !datos.aviso && (
                <Boton onClick={() => cambiarModo("semantica")}>Buscar por significado</Boton>
              )}
              <BotonJusIA onClick={() => preguntar(`¿Qué dice la legislación hondureña sobre "${aplicados.q || termino}"?`)}>
                Preguntar a Jus IA
              </BotonJusIA>
            </div>
          </Card>
        )}
      </div>

      {datos && !enSemantica && totalPaginas > 1 && (
        <nav aria-label="Páginas de artículos" className="mt-1 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-texto-3">
          <Boton disabled={aplicados.pagina <= 1 || cargando} onClick={() => navegar({ ...aplicados, pagina: aplicados.pagina - 1 })}>
            ← Anterior
          </Boton>
          <span>
            Página <b className="text-marino">{aplicados.pagina}</b> de {totalPaginas.toLocaleString("es-HN")}
          </span>
          <Boton disabled={aplicados.pagina >= totalPaginas || cargando} onClick={() => navegar({ ...aplicados, pagina: aplicados.pagina + 1 })}>
            Siguiente →
          </Boton>
        </nav>
      )}
    </div>
  );
}

function ChipCodigo({
  activo,
  disabled,
  onClick,
  children,
}: {
  activo: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-[5px] text-[12px] font-medium transition-colors disabled:cursor-default disabled:opacity-50",
        activo ? "border-celeste bg-celeste text-white" : "border-borde bg-white text-texto-3 hover:border-celeste hover:text-marino",
      )}
    >
      {children}
    </button>
  );
}
