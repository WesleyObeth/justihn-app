"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, ChipMateria, Meta, Rotulo } from "@/components/ui/primitivos";
import { CODIGOS, CODIGOS_CARGADOS, getCodigo } from "@/data/legislacion";
import { LIMITE_SEMANTICO_ARTICULOS, type ArticuloCorpus } from "@/lib/corpus/articulo";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";
import type { Codigo } from "@/types/dominio";

/**
 * Legislación sobre el CORPUS REAL (conectada el 2026-09-03; hasta entonces
 * enseñaba seis síntesis del CPC escritas a mano — y dos estaban invertidas,
 * ver `data/legislacion.ts`). Cierra la promesa «legislación ilimitada» del
 * plan Base con los 2.162 artículos de los tres códigos del CEDIJ.
 *
 * La selección y la búsqueda viven en la URL (`?codigo=&q=&modo=&p=`): un
 * código abierto por una página concreta es compartible y sobrevive al
 * refresh. Cada cambio de URL dispara UNA petición a `/api/legislacion/buscar`.
 *
 * Dos modos, los de Jurisprudencia: por número o palabras —Postgres puro,
 * paginado, en el orden del código— y por significado —vectoriza la consulta
 * y trae hasta 12 artículos afines de los tres códigos, sin páginas.
 */
type Modo = "texto" | "semantica";

interface Aplicados {
  codigo: string;
  q: string;
  modo: Modo;
  pagina: number;
}

interface Respuesta {
  articulos: ArticuloCorpus[];
  total: number;
  pagina: number;
  porPagina: number;
  conteos: Record<string, number>;
  aviso?: string;
  modo: Modo;
}

type Estado =
  | { clave: string; tipo: "listo"; datos: Respuesta }
  | { clave: string; tipo: "error"; mensaje: string };

/** El último conteo por código, para que la columna no parpadee al remontar. */
let ultimosConteos: Record<string, number> | null = null;

function leerAplicados(params: URLSearchParams): Aplicados {
  const pagina = Number(params.get("p"));
  return {
    // `getCodigo` resuelve los alias viejos («cpc»).
    codigo: getCodigo(params.get("codigo"))?.id ?? CODIGOS_CARGADOS[0]!.id,
    q: params.get("q") ?? "",
    modo: params.get("modo") === "semantica" ? "semantica" : "texto",
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
  };
}

function aQuery(a: Aplicados): string {
  const p = new URLSearchParams();
  if (a.codigo !== CODIGOS_CARGADOS[0]!.id) p.set("codigo", a.codigo);
  if (a.q.trim()) p.set("q", a.q.trim());
  if (a.modo === "semantica") p.set("modo", "semantica");
  if (a.pagina > 1 && a.modo === "texto") p.set("p", String(a.pagina));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function PantallaLegislacion() {
  // `key` remonta la pantalla cuando la URL cambia por fuera (back/forward,
  // link de Calculadoras): el estado local se re-siembra de la URL.
  const params = useSearchParams();
  return <Pantalla key={params.toString()} />;
}

function Pantalla() {
  const router = useRouter();
  const params = useSearchParams();
  const aplicados = leerAplicados(params);
  const clave = aQuery(aplicados);
  const codigo = getCodigo(aplicados.codigo)!;
  const cargado = codigo.estado === "cargado";

  const [termino, setTermino] = useState(aplicados.q);
  const [modo, setModo] = useState<Modo>(aplicados.modo);
  const [estado, setEstado] = useState<Estado | null>(null);

  // Una petición por URL; `cargando` se deriva de la clave (§4.7.18). Un
  // código en preparación no pregunta nada: no hay tabla que responda.
  useEffect(() => {
    if (!cargado) return;
    const abortador = new AbortController();
    const a = leerAplicados(new URLSearchParams(clave));
    fetch("/api/legislacion/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: a.modo === "semantica" ? null : a.codigo,
        q: a.q,
        pagina: a.pagina,
        modo: a.modo,
      }),
      signal: abortador.signal,
    })
      .then(async (res) => {
        const cuerpo = (await res.json()) as Respuesta & { mensaje?: string };
        if (!res.ok) throw new Error(cuerpo.mensaje ?? `Error ${res.status}`);
        ultimosConteos = cuerpo.conteos;
        setEstado({ clave, tipo: "listo", datos: cuerpo });
      })
      .catch((error: unknown) => {
        if (abortador.signal.aborted) return;
        setEstado({
          clave,
          tipo: "error",
          mensaje: error instanceof Error ? error.message : "No se pudo buscar.",
        });
      });
    return () => abortador.abort();
  }, [clave, cargado]);

  const cargando = cargado && estado?.clave !== clave;
  const datos = estado?.tipo === "listo" ? estado.datos : null;
  const conteos = datos?.conteos ?? ultimosConteos;

  const navegar = (siguiente: Aplicados) =>
    router.replace(`/abogados/legislacion${aQuery(siguiente)}`, { scroll: false });

  const aplicar = (extra?: Partial<Aplicados>) =>
    navegar({ codigo: aplicados.codigo, q: termino, modo, pagina: 1, ...extra });

  const seleccionar = (id: string) => {
    setTermino("");
    navegar({ codigo: id, q: "", modo, pagina: 1 });
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    aplicar({ modo: m });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[300px_1fr]">
      {/* En móvil la columna de seis códigos empujaba los artículos seis
          tarjetas más abajo: ahí el código se elige en un select y la columna
          solo existe en escritorio. */}
      <SelectorCodigosMovil seleccionado={codigo.id} conteos={conteos} onSeleccionar={seleccionar} />
      <div className="hidden lg:block">
        <ColumnaCodigos seleccionado={codigo.id} conteos={conteos} onSeleccionar={seleccionar} />
      </div>

      {cargado ? (
        <CodigoCargado
          codigo={codigo}
          aplicados={aplicados}
          termino={termino}
          modo={modo}
          datos={datos}
          error={estado?.tipo === "error" ? estado.mensaje : null}
          cargando={cargando}
          onTermino={setTermino}
          onAplicar={aplicar}
          onModo={cambiarModo}
          onNavegar={navegar}
          onReintentar={() => router.refresh()}
        />
      ) : (
        <CodigoEnPreparacion codigo={codigo} />
      )}
    </div>
  );
}

// ── Columna de códigos ─────────────────────────────────────────────────────

function SelectorCodigosMovil({
  seleccionado,
  conteos,
  onSeleccionar,
}: {
  seleccionado: string;
  conteos: Record<string, number> | null;
  onSeleccionar: (id: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 lg:hidden">
      <span className="text-[11px] font-semibold tracking-[1.4px] text-texto-4 uppercase">
        Código
      </span>
      <select
        value={seleccionado}
        onChange={(e) => onSeleccionar(e.target.value)}
        aria-label="Elegir código"
        // Altura explícita (§4.7.7).
        className="h-11 rounded-lg border border-borde bg-white px-3 text-[13.5px] font-medium text-marino outline-none focus:border-celeste"
      >
        {CODIGOS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
            {c.estado === "cargado"
              ? conteos?.[c.id]
                ? ` · ${conteos[c.id]!.toLocaleString("es-HN")} artículos`
                : " · cargado"
              : " · pronto"}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColumnaCodigos({
  seleccionado,
  conteos,
  onSeleccionar,
}: {
  seleccionado: string;
  conteos: Record<string, number> | null;
  onSeleccionar: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {CODIGOS.map((c) => {
        const n = conteos?.[c.id];
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSeleccionar(c.id)}
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
              {c.estado === "cargado" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10px] font-bold text-exito">
                  <Icono nombre="check" size={9} strokeWidth={2.6} />
                  CARGADO
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
            {c.estado === "cargado" && (
              <div className="mt-1 text-[11.5px] text-texto-3">
                {n !== undefined ? (
                  <>
                    <b className="text-marino">{n.toLocaleString("es-HN")}</b> artículos con página
                    del PDF
                  </>
                ) : (
                  "artículo por artículo, con página del PDF"
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Código cargado ─────────────────────────────────────────────────────────

function CodigoCargado({
  codigo,
  aplicados,
  termino,
  modo,
  datos,
  error,
  cargando,
  onTermino,
  onAplicar,
  onModo,
  onNavegar,
  onReintentar,
}: {
  codigo: Codigo;
  aplicados: Aplicados;
  termino: string;
  modo: Modo;
  datos: Respuesta | null;
  error: string | null;
  cargando: boolean;
  onTermino: (v: string) => void;
  onAplicar: (extra?: Partial<Aplicados>) => void;
  onModo: (m: Modo) => void;
  onNavegar: (a: Aplicados) => void;
  onReintentar: () => void;
}) {
  const preguntar = usePreguntarAJusIA();
  const enSemantica = aplicados.modo === "semantica";
  const hayBusqueda = aplicados.q.trim() !== "";
  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.total / datos.porPagina)) : 1;
  const totalCodigo = datos?.conteos[codigo.id];

  const limpiar = () => {
    onTermino("");
    onNavegar({ codigo: codigo.id, q: "", modo: "texto", pagina: 1 });
  };

  return (
    <div className="flex flex-col gap-3.5">
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

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="flex h-10 min-w-[min(240px,100%)] flex-1 items-center gap-2 rounded-lg border border-borde bg-white px-3.5 focus-within:border-celeste">
            <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
            <input
              value={termino}
              onChange={(e) => onTermino(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAplicar()}
              placeholder={
                enSemantica
                  ? "Describe lo que buscas: «plazo para reclamar un despido»"
                  : `Número de artículo («120», «120-A») o palabras del texto${totalCodigo ? ` en ${totalCodigo.toLocaleString("es-HN")} artículos` : ""}…`
              }
              aria-label={`Buscar en ${codigo.nombre}`}
              maxLength={200}
              className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
            />
          </div>
          <Boton variante="marino" onClick={() => onAplicar()} className="h-10 px-4.5">
            Buscar
          </Boton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-borde-suave pt-3">
          <span className="text-[11.5px] text-texto-4">Buscar</span>
          <ModoPill activo={modo === "texto"} onClick={() => onModo("texto")}>
            por número o palabras
          </ModoPill>
          <ModoPill activo={modo === "semantica"} onClick={() => onModo("semantica")}>
            por significado
          </ModoPill>
          <span className="text-[11.5px] leading-[1.5] text-texto-4">
            {modo === "texto"
              ? `— coincidencia exacta en el texto de este código (con tildes); en el orden del articulado.`
              : `— entiende la consulta y trae hasta ${LIMITE_SEMANTICO_ARTICULOS} artículos afines de los ${CODIGOS_CARGADOS.length} códigos cargados.`}
          </span>
        </div>
      </Card>

      {codigo.advertencia && (
        <p className="mx-0.5 rounded-r-[10px] border-l-[3px] border-dorado bg-aviso px-4 py-2.5 text-[12.5px] leading-[1.5] text-aviso-cuerpo">
          <b>Sobre esta edición.</b> {codigo.advertencia}
        </p>
      )}

      {!hayBusqueda && !enSemantica && codigo.destacados.length > 0 && (
        <div className="mx-0.5">
          <Rotulo>Artículos que el portal ya aplica</Rotulo>
          <div className="mt-2 flex flex-wrap gap-2">
            {codigo.destacados.map((d) => (
              <Link
                key={d.numero}
                href={`/abogados/legislacion/${codigo.id}/${d.numero}`}
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

      <p className="mx-0.5 min-h-[18px] text-[12.5px] text-texto-3" aria-live="polite">
        {cargando && !datos && "Leyendo el código…"}
        {datos && (
          <>
            <b className="text-marino">{datos.total.toLocaleString("es-HN")}</b>{" "}
            {datos.total === 1 ? "artículo" : "artículos"}
            {cargando && " · actualizando…"} ·{" "}
            <b className="text-exito">texto oficial del PDF del CEDIJ</b>
            {enSemantica
              ? " · ordenados por afinidad"
              : hayBusqueda
                ? ` · en el orden del ${codigo.nombre}`
                : ` · el ${codigo.nombre} completo, en orden`}
            {hayBusqueda && (
              <>
                {" "}
                · búsqueda: <b>&laquo;{aplicados.q}&raquo;</b>
              </>
            )}
          </>
        )}
        {(hayBusqueda || enSemantica) && (
          <button
            type="button"
            onClick={limpiar}
            className="ml-2.5 cursor-pointer text-celeste hover:text-marino"
          >
            Limpiar
          </button>
        )}
      </p>

      {datos?.aviso && (
        <p className="mx-0.5 -mt-1.5 text-[12px] text-texto-4">
          {datos.aviso}
          {datos.total === 0 && codigo.fuenteUrl && (
            <>
              {" "}
              <a href={codigo.fuenteUrl} target="_blank" rel="noopener noreferrer">
                Abrir el PDF oficial
              </a>
            </>
          )}
        </p>
      )}

      {error && (
        <Card className="px-5 py-8 text-center">
          <p className="text-[13px] text-texto-3">{error}</p>
          <Boton className="mt-4" onClick={onReintentar}>
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
            mostrarCodigo={enSemantica}
            titulo={
              a.rubrica ??
              getCodigo(a.codigoId)?.destacados.find((d) => d.numero === a.numero)?.titulo ??
              null
            }
            onPreguntar={() =>
              preguntar(
                `¿Qué dice el artículo ${a.numero} del ${a.codigoNombre} y cómo lo ha aplicado la Corte Suprema?`,
              )
            }
          />
        ))}

        {datos && datos.articulos.length === 0 && (
          <Card className="px-5 py-8 text-center">
            <p className="text-[13px] text-texto-3">
              {datos.aviso
                ? "Ese número no tiene texto propio en la capa de texto del PDF."
                : enSemantica
                  ? "Ningún artículo de los códigos cargados se parece a lo que describes. Prueba con otras palabras."
                  : `Ningún artículo del ${codigo.nombre} contiene «${aplicados.q}» tal cual. La búsqueda por palabras exige las tildes — o busca por significado, que entiende la consulta aunque no use las mismas palabras.`}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {!enSemantica && hayBusqueda && !datos.aviso && (
                <Boton onClick={() => onModo("semantica")}>Buscar por significado</Boton>
              )}
              <BotonJusIA
                onClick={() =>
                  preguntar(`¿Qué dice el ${codigo.nombre} sobre "${aplicados.q || termino}"?`)
                }
              >
                Preguntar a Jus IA
              </BotonJusIA>
            </div>
          </Card>
        )}
      </div>

      {datos && !enSemantica && totalPaginas > 1 && (
        <nav
          aria-label="Páginas de artículos"
          className="mt-1 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-texto-3"
        >
          <Boton
            disabled={aplicados.pagina <= 1 || cargando}
            onClick={() => onNavegar({ ...aplicados, pagina: aplicados.pagina - 1 })}
          >
            ← Anterior
          </Boton>
          <span>
            Página <b className="text-marino">{aplicados.pagina}</b> de{" "}
            {totalPaginas.toLocaleString("es-HN")}
          </span>
          <Boton
            disabled={aplicados.pagina >= totalPaginas || cargando}
            onClick={() => onNavegar({ ...aplicados, pagina: aplicados.pagina + 1 })}
          >
            Siguiente →
          </Boton>
        </nav>
      )}
    </div>
  );
}

function CardArticulo({
  articulo: a,
  termino,
  mostrarCodigo,
  titulo,
  onPreguntar,
}: {
  articulo: ArticuloCorpus;
  termino: string;
  mostrarCodigo: boolean;
  titulo: string | null;
  onPreguntar: () => void;
}) {
  const ruta = `/abogados/legislacion/${a.codigoId}/${a.numero}`;
  return (
    <Card className="px-5 py-4.5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={ruta}
          className="rounded-md bg-chip px-2.5 py-[3px] font-mono text-[11.5px] font-bold text-celeste"
        >
          Art. {a.numero}
        </Link>
        {titulo && (
          <h3 className="font-display text-[15px] leading-[1.35] font-semibold">
            <Link href={ruta} className="text-marino">
              {titulo}
            </Link>
          </h3>
        )}
        {mostrarCodigo && <Meta>{a.codigoNombre}</Meta>}
        {a.similitud !== undefined && (
          <Meta className="rounded-md bg-lienzo px-1.5 py-[2px] text-texto-3">
            afinidad {Math.round(a.similitud * 100)}%
          </Meta>
        )}
        {a.pagina && <span className="ml-auto text-[11px] text-texto-4">pág. {a.pagina} del PDF</span>}
      </div>
      <p className="mt-2 line-clamp-4 text-[13px] leading-[1.6] text-texto-2">
        <Resaltar texto={a.cuerpo} termino={termino} />
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href={ruta} className="text-[12.5px]">
          Leer el artículo completo →
        </Link>
        <a
          href={a.fuenteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] text-texto-3 hover:text-celeste"
        >
          <Icono nombre="libro" size={11} strokeWidth={2} />
          Abrir en el PDF oficial{a.pagina ? ` (pág. ${a.pagina})` : ""}
        </a>
        <BotonJusIA compacto className="ml-auto" onClick={onPreguntar}>
          Preguntar sobre este artículo
        </BotonJusIA>
      </div>
    </Card>
  );
}

// ── Código en preparación ──────────────────────────────────────────────────

/** Sin fuente estatal legible no hay texto (regla #1), y el hueco se explica (§4.5). */
function CodigoEnPreparacion({ codigo }: { codigo: Codigo }) {
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
          {codigo.motivoPendiente ??
            "Este código se carga desde una fuente oficial del Estado. No mostramos texto que no podamos citar — es la promesa del producto."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <BotonJusIA
          compacto
          onClick={() =>
            preguntar(
              `¿Qué ha dicho la jurisprudencia sobre la aplicación del ${codigo.nombre} en mi materia?`,
            )
          }
        >
          Preguntar a Jus IA
        </BotonJusIA>
      </div>
    </Card>
  );
}

// ── Piezas ─────────────────────────────────────────────────────────────────

function ModoPill({
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
        "cursor-pointer rounded-full border px-3 py-[5px] text-[12px] font-medium transition-colors",
        activo
          ? "border-marino bg-marino text-white"
          : "border-borde bg-white text-texto-3 hover:border-celeste hover:text-marino",
      )}
    >
      {children}
    </button>
  );
}

/** Resalta cada palabra buscada (sin distinguir mayúsculas). */
function Resaltar({ texto, termino }: { texto: string; termino: string }) {
  const palabras = termino
    .trim()
    .split(/\s+/)
    .filter((p) => p.length >= 2)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (palabras.length === 0) return <>{texto}</>;
  const partes = texto.split(new RegExp(`(${palabras.join("|")})`, "gi"));
  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[3px] bg-[#fdeeb8] px-0.5 text-inherit">
            {parte}
          </mark>
        ) : (
          parte
        ),
      )}
    </>
  );
}
