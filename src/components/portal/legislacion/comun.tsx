"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Card, ChipMateria, Meta, Rotulo } from "@/components/ui/primitivos";
import { CODIGOS, getCodigo } from "@/data/legislacion";
import { parrafosDe, type ArticuloCorpus } from "@/lib/corpus/articulo";
import type { EntradaIndice } from "@/lib/corpus/legislacion";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";
import type { Codigo } from "@/types/dominio";

/**
 * Lo que comparten las tres vistas de Legislación (prototipos en el portal,
 * 2026-09-03: Buscador · Lector · Temas). Cuando Wesley elija una, las otras
 * dos se borran y esto se pliega dentro de la ganadora.
 */
export const VISTAS = ["buscador", "lector", "temas"] as const;
export type Vista = (typeof VISTAS)[number];
export type Modo = "texto" | "semantica";

export function leerVista(v: string | null): Vista {
  return (VISTAS as readonly string[]).includes(v ?? "") ? (v as Vista) : "buscador";
}

export interface RespuestaBusqueda {
  articulos: ArticuloCorpus[];
  total: number;
  pagina: number;
  porPagina: number;
  conteos: Record<string, number>;
  aviso?: string;
  modo: string;
}

export interface RespuestaIndice {
  indice: EntradaIndice[];
  conteos: Record<string, number>;
}

/** El último conteo por código, para que ninguna vista parpadee al remontar. */
let ultimosConteos: Record<string, number> | null = null;
export const conteosConocidos = () => ultimosConteos;

/** Una petición a la API de legislación; lanza con el mensaje del servidor. */
export async function pedir<T extends { conteos?: Record<string, number> }>(
  cuerpo: Record<string, unknown>,
  signal: AbortSignal,
): Promise<T> {
  const res = await fetch("/api/legislacion/buscar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
    signal,
  });
  const json = (await res.json()) as T & { mensaje?: string };
  if (!res.ok) throw new Error(json.mensaje ?? `Error ${res.status}`);
  if (json.conteos) ultimosConteos = json.conteos;
  return json;
}

export function tituloDe(a: ArticuloCorpus): string | null {
  return a.rubrica ?? getCodigo(a.codigoId)?.destacados.find((d) => d.numero === a.numero)?.titulo ?? null;
}

export function preguntaSobre(a: ArticuloCorpus): string {
  return `¿Qué dice el artículo ${a.numero} del ${a.codigoNombre} y cómo lo ha aplicado la Corte Suprema?`;
}

export const rutaArticulo = (a: { codigoId: string; numero: string }) =>
  `/abogados/legislacion/${a.codigoId}/${a.numero}`;

// ── Conmutador de prototipos (temporal) ────────────────────────────────────

export function ConmutadorVistas({ vista }: { vista: Vista }) {
  const etiquetas: Record<Vista, { nombre: string; tesis: string }> = {
    buscador: {
      nombre: "Buscador",
      tesis: "Una caja sobre los tres códigos; los resultados se leen sin salir de la lista.",
    },
    lector: {
      nombre: "Lector",
      tesis: "El código se lee como un libro: índice a la izquierda, artículo a la derecha.",
    },
    temas: {
      nombre: "Temas",
      tesis: "La entrada es la situación, no el código: cada tema junta sus artículos y su herramienta.",
    },
  };
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-borde-fuerte bg-white/60 px-3.5 py-2.5">
      <Rotulo className="mr-1">Prototipo</Rotulo>
      {VISTAS.map((v) => (
        <Link
          key={v}
          href={`/abogados/legislacion?vista=${v}`}
          aria-current={v === vista ? "page" : undefined}
          className={cn(
            "rounded-full border px-3 py-[5px] text-[12px] font-medium transition-colors",
            v === vista
              ? "border-marino bg-marino text-white hover:text-white"
              : "border-borde bg-white text-texto-3 hover:border-celeste hover:text-marino",
          )}
        >
          {etiquetas[v].nombre}
        </Link>
      ))}
      <span className="text-[12px] text-texto-4">{etiquetas[vista].tesis}</span>
    </div>
  );
}

// ── Piezas ─────────────────────────────────────────────────────────────────

export function ModoPill({
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
export function Resaltar({ texto, termino }: { texto: string; termino: string }) {
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

/** Un trozo del cuerpo alrededor de la primera palabra buscada. */
function fragmentoAlrededor(texto: string, termino: string): string {
  const primera = termino.trim().split(/\s+/)[0] ?? "";
  const i = primera ? texto.toLowerCase().indexOf(primera.toLowerCase()) : -1;
  if (i < 0) return texto;
  const ini = Math.max(0, i - 100);
  return (ini > 0 ? "…" : "") + texto.slice(ini);
}

export function CuerpoArticulo({ a }: { a: ArticuloCorpus }) {
  return (
    <div className="flex flex-col gap-3 text-[13.5px] leading-[1.7] text-texto-2">
      {parrafosDe(a.cuerpo).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export function PieArticulo({ a, compacto }: { a: ArticuloCorpus; compacto?: boolean }) {
  const preguntar = usePreguntarAJusIA();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <a
        href={a.fuenteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[12px] text-texto-3 hover:text-celeste"
      >
        <Icono nombre="libro" size={11} strokeWidth={2} />
        Abrir en el PDF oficial{a.pagina ? ` (pág. ${a.pagina})` : ""}
      </a>
      <BotonJusIA compacto={compacto ?? true} className="ml-auto" onClick={() => preguntar(preguntaSobre(a))}>
        Preguntar sobre este artículo
      </BotonJusIA>
    </div>
  );
}

/** «En el portal»: la nota verificada y la herramienta del destacado, si lo es. */
export function NotaPortal({ a, className }: { a: ArticuloCorpus; className?: string }) {
  const d = getCodigo(a.codigoId)?.destacados.find((x) => x.numero === a.numero);
  if (!d || (!d.nota && !d.herramienta)) return null;
  return (
    <div
      className={cn(
        "rounded-r-[10px] border-l-[3px] border-dorado bg-aviso px-4 py-2.5 text-[12.5px] leading-[1.5] text-aviso-cuerpo",
        className,
      )}
    >
      <b>En el portal.</b> {d.nota}{" "}
      {d.herramienta && (
        <Link href={d.herramienta.href} className="font-medium">
          {d.herramienta.etiqueta} →
        </Link>
      )}
    </div>
  );
}

/**
 * La card de un artículo en una lista. Con `desplegable`, «Leer aquí» abre el
 * texto entero dentro de la card — la vista Buscador lee sin salir de la lista.
 */
export function CardArticulo({
  articulo: a,
  termino,
  mostrarCodigo,
  desplegable,
}: {
  articulo: ArticuloCorpus;
  termino: string;
  mostrarCodigo: boolean;
  desplegable?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const ruta = rutaArticulo(a);
  const titulo = tituloDe(a);
  return (
    <Card className="px-5 py-4.5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={ruta} className="rounded-md bg-chip px-2.5 py-[3px] font-mono text-[11.5px] font-bold text-celeste">
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

      {abierto ? (
        <div className="mt-3 flex flex-col gap-3">
          <CuerpoArticulo a={a} />
          <NotaPortal a={a} />
        </div>
      ) : (
        <p className="mt-2 line-clamp-4 text-[13px] leading-[1.6] text-texto-2">
          <Resaltar texto={termino ? fragmentoAlrededor(a.cuerpo, termino) : a.cuerpo} termino={termino} />
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {desplegable ? (
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="cursor-pointer text-[12.5px] font-medium text-celeste hover:text-marino"
          >
            {abierto ? "Cerrar ▴" : "Leer aquí ▾"}
          </button>
        ) : null}
        <Link href={ruta} className="text-[12.5px]">
          {desplegable ? "Abrir la ficha →" : "Leer el artículo completo →"}
        </Link>
        <PieArticulo a={a} />
      </div>
    </Card>
  );
}

/** Sin fuente estatal legible no hay texto (regla #1), y el hueco se explica (§4.5). */
export function CodigoEnPreparacion({ codigo }: { codigo: Codigo }) {
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
        <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.6] text-texto-2">{codigo.motivoPendiente}</p>
      </div>
      <div className="mt-4">
        <BotonJusIA
          compacto
          onClick={() =>
            preguntar(`¿Qué ha dicho la jurisprudencia sobre la aplicación del ${codigo.nombre} en mi materia?`)
          }
        >
          Preguntar a Jus IA
        </BotonJusIA>
      </div>
    </Card>
  );
}

/** Los tres códigos sin fuente, en una línea, con el motivo al pasar por encima. */
export function LineaEnPreparacion() {
  const pendientes = CODIGOS.filter((c) => c.estado === "preparacion");
  return (
    <p className="text-[12px] text-texto-4">
      En preparación:{" "}
      {pendientes.map((c, i) => (
        <span key={c.id}>
          <abbr title={c.motivoPendiente} className="cursor-help no-underline decoration-dotted underline-offset-2 hover:underline">
            {c.nombre}
          </abbr>
          {i < pendientes.length - 1 ? " · " : ""}
        </span>
      ))}
    </p>
  );
}
