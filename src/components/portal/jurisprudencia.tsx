"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, ChipMateria, Meta, PillMateria } from "@/components/ui/primitivos";
import {
  LIMITE_SEMANTICO,
  MATERIAS_CORPUS,
  TIPOS_PROCESO,
  type TipoProcesoId,
} from "@/lib/corpus/catalogo";
import type { SentenciaCorpus } from "@/lib/corpus/sentencias";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { cn } from "@/lib/utils";

/**
 * Búsqueda de jurisprudencia sobre el CORPUS REAL (conectada el 2026-09-02;
 * hasta entonces filtraba los 12 seeds del piloto en cliente).
 *
 * La búsqueda aplicada vive en la URL (`?q=&materia=&proceso=&anio=&modo=&p=`):
 * una búsqueda es compartible y sobrevive al refresh, igual que una sentencia.
 * Cada cambio de URL dispara UNA petición a `/api/jurisprudencia/buscar`.
 *
 * Dos modos (§1.1): por palabras —Postgres puro, paginado, el de siempre— y por
 * significado —vectoriza la consulta y devuelve las 30 más afines, sin páginas.
 */
type Modo = "texto" | "semantica";

interface Aplicados {
  q: string;
  materia: string;
  proceso: TipoProcesoId | "todos";
  anio: number | null;
  modo: Modo;
  pagina: number;
}

interface Respuesta {
  resultados: SentenciaCorpus[];
  total: number;
  pagina: number;
  porPagina: number;
  totalCorpus: number;
  aviso?: string;
  modo: Modo;
}

type Estado =
  | { clave: string; tipo: "listo"; datos: Respuesta }
  | { clave: string; tipo: "error"; mensaje: string };

const ANIO_ACTUAL = 2026;
const ANIOS = Array.from({ length: ANIO_ACTUAL - 2000 + 1 }, (_, i) => ANIO_ACTUAL - i);

function leerAplicados(params: URLSearchParams): Aplicados {
  const proceso = params.get("proceso") ?? "todos";
  const anio = Number(params.get("anio"));
  const pagina = Number(params.get("p"));
  return {
    q: params.get("q") ?? "",
    materia: params.get("materia") ?? "todas",
    proceso: TIPOS_PROCESO.some((t) => t.id === proceso) ? (proceso as TipoProcesoId) : "todos",
    anio: Number.isInteger(anio) && anio >= 1980 ? anio : null,
    modo: params.get("modo") === "semantica" ? "semantica" : "texto",
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina : 1,
  };
}

function aQuery(a: Aplicados): string {
  const p = new URLSearchParams();
  if (a.q.trim()) p.set("q", a.q.trim());
  if (a.materia !== "todas") p.set("materia", a.materia);
  if (a.proceso !== "todos") p.set("proceso", a.proceso);
  if (a.anio) p.set("anio", String(a.anio));
  if (a.modo === "semantica") p.set("modo", "semantica");
  if (a.pagina > 1 && a.modo === "texto") p.set("p", String(a.pagina));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function BuscadorJurisprudencia() {
  // `key` remonta el buscador cuando la URL cambia por fuera (back/forward,
  // link del Dashboard): el estado local de los campos se re-siembra de la URL.
  const params = useSearchParams();
  return <Buscador key={params.toString()} />;
}

function Buscador() {
  const router = useRouter();
  const params = useSearchParams();
  const aplicados = leerAplicados(params);
  const clave = aQuery(aplicados);

  const [termino, setTermino] = useState(aplicados.q);
  const [materia, setMateria] = useState(aplicados.materia);
  const [proceso, setProceso] = useState<Aplicados["proceso"]>(aplicados.proceso);
  const [anio, setAnio] = useState<number | null>(aplicados.anio);
  const [modo, setModo] = useState<Modo>(aplicados.modo);
  const [estado, setEstado] = useState<Estado | null>(null);
  const preguntar = usePreguntarAJusIA();

  // Una petición por URL. `cargando` se DERIVA (la clave del último resultado
  // frente a la actual): así no hay `setState` síncrono dentro del efecto,
  // que es lo que el lint del proyecto prohíbe (§4.7.18).
  useEffect(() => {
    const abortador = new AbortController();
    const a = leerAplicados(new URLSearchParams(clave));
    fetch("/api/jurisprudencia/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: a.q,
        materia: a.materia,
        proceso: a.proceso,
        anio: a.anio,
        pagina: a.pagina,
        modo: a.modo,
      }),
      signal: abortador.signal,
    })
      .then(async (res) => {
        const cuerpo = (await res.json()) as Respuesta & { mensaje?: string };
        if (!res.ok) throw new Error(cuerpo.mensaje ?? `Error ${res.status}`);
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
  }, [clave]);

  const cargando = estado?.clave !== clave;
  const datos = estado?.tipo === "listo" ? estado.datos : null;

  const navegar = (siguiente: Aplicados) =>
    router.replace(`/abogados/jurisprudencia${aQuery(siguiente)}`, { scroll: false });

  /** Aplica los campos a la URL; `extra` permite que un chip filtre al vuelo. */
  const aplicar = (extra?: Partial<Aplicados>) =>
    navegar({
      q: termino,
      materia,
      proceso,
      anio,
      modo,
      pagina: 1,
      ...extra,
    });

  const filtrarMateria = (m: string) => {
    const siguiente = aplicados.materia === m ? "todas" : m;
    setMateria(siguiente);
    aplicar({ materia: siguiente });
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    aplicar({ modo: m });
  };

  const limpiar = () => {
    setTermino("");
    setMateria("todas");
    setProceso("todos");
    setAnio(null);
    router.replace("/abogados/jurisprudencia", { scroll: false });
  };

  const hayFiltros =
    aplicados.q !== "" ||
    aplicados.materia !== "todas" ||
    aplicados.proceso !== "todos" ||
    aplicados.anio !== null;

  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.total / datos.porPagina)) : 1;
  const enSemantica = aplicados.modo === "semantica";

  return (
    <>
      <Card className="px-5 py-4.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aplicar()}
            placeholder={
              enSemantica
                ? "Describe el caso con tus palabras: «despido de una trabajadora embarazada»"
                : `Buscar por tema, palabras del resumen o expediente${datos ? ` en ${datos.totalCorpus.toLocaleString("es-HN")} sentencias` : ""}…`
            }
            aria-label="Buscar en jurisprudencia"
            maxLength={200}
            className="h-10 min-w-[min(240px,100%)] flex-1 rounded-lg border border-borde px-3.5 text-sm text-marino outline-none focus:border-celeste"
          />
          <Select value={materia} onChange={setMateria} etiqueta="Materia">
            <option value="todas">Todas las materias</option>
            {MATERIAS_CORPUS.map((m) => (
              <option key={m.etiqueta} value={m.etiqueta}>
                {m.etiqueta}
              </option>
            ))}
          </Select>
          <Select
            value={proceso}
            onChange={(v) => setProceso(v as Aplicados["proceso"])}
            etiqueta="Tipo de proceso"
          >
            <option value="todos">Todos los procesos</option>
            {TIPOS_PROCESO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.etiqueta}
              </option>
            ))}
          </Select>
          <Select
            value={anio ? String(anio) : "todos"}
            onChange={(v) => setAnio(v === "todos" ? null : Number(v))}
            etiqueta="Año"
          >
            <option value="todos">Cualquier año</option>
            {ANIOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Boton variante="marino" onClick={() => aplicar()} className="h-10 px-4.5">
            Buscar
          </Boton>
        </div>

        {/* El modo es parte del buscador, no un ajuste escondido: cambia qué
            significa «buscar» y cómo se ordena lo que sale. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-borde-suave pt-3">
          <span className="text-[11.5px] text-texto-4">Buscar</span>
          <ModoPill activo={modo === "texto"} onClick={() => cambiarModo("texto")}>
            por palabras
          </ModoPill>
          <ModoPill activo={modo === "semantica"} onClick={() => cambiarModo("semantica")}>
            por significado
          </ModoPill>
          <span className="text-[11.5px] leading-[1.5] text-texto-4">
            {modo === "texto"
              ? "— coincidencia exacta en el resumen oficial y el expediente; las más recientes primero."
              : `— entiende la consulta y trae hasta ${LIMITE_SEMANTICO} sentencias afines, ordenadas por afinidad.`}
          </span>
        </div>
      </Card>

      <div className="mx-0.5 mt-3.5 flex flex-wrap items-center gap-2">
        {MATERIAS_CORPUS.map((m) => (
          <PillMateria
            key={m.etiqueta}
            nombre={m.etiqueta}
            activa={aplicados.materia === m.etiqueta}
            onToggle={() => filtrarMateria(m.etiqueta)}
          />
        ))}
      </div>

      <p
        className="mx-0.5 mt-3.5 mb-2.5 min-h-[18px] text-[12.5px] text-texto-3"
        aria-live="polite"
      >
        {cargando && !datos && "Buscando en el corpus…"}
        {datos && (
          <>
            <b className="text-marino">{datos.total.toLocaleString("es-HN")}</b>{" "}
            {datos.total === 1 ? "resultado" : "resultados"}
            {cargando && " · actualizando…"} · <b className="text-exito">corpus real del CEDIJ</b> ·{" "}
            {datos.totalCorpus.toLocaleString("es-HN")} sentencias publicadas ·{" "}
            {enSemantica ? "ordenadas por afinidad" : "más recientes primero"}
            {aplicados.q && (
              <>
                {" "}
                · búsqueda: <b>&laquo;{aplicados.q}&raquo;</b>
              </>
            )}
          </>
        )}
        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="ml-2.5 cursor-pointer text-celeste hover:text-marino"
          >
            Limpiar filtros
          </button>
        )}
      </p>

      {datos?.aviso && <p className="mx-0.5 mb-2.5 text-[12px] text-texto-4">{datos.aviso}</p>}

      {estado?.tipo === "error" && (
        <Card className="px-5 py-8 text-center">
          <p className="text-[13px] text-texto-3">{estado.mensaje}</p>
          <Boton className="mt-4" onClick={() => router.refresh()}>
            Reintentar
          </Boton>
        </Card>
      )}

      <div className={cn("flex flex-col gap-3", cargando && "opacity-60 transition-opacity")}>
        {datos?.resultados.map((s) => (
          <Link key={s.id} href={`/abogados/jurisprudencia/${s.id}`} className="block text-marino">
            <Card interactiva className="px-5 py-4.5">
              <div className="flex flex-wrap items-center gap-2">
                <ChipMateria>{s.materia}</ChipMateria>
                <Meta>
                  {s.proceso ?? s.organo} · {s.fecha}
                </Meta>
                {s.similitud !== undefined && (
                  <Meta className="rounded-md bg-lienzo px-1.5 py-[2px] text-texto-3">
                    afinidad {Math.round(s.similitud * 100)}%
                  </Meta>
                )}
                <span className="ml-auto font-mono text-[11px] text-texto-4">{s.expediente}</span>
              </div>
              <h3 className="font-display mt-2 text-[15.5px] leading-[1.35] font-semibold">
                <Resaltar texto={s.titulo} termino={enSemantica ? "" : aplicados.q} />
              </h3>
              <p className="mt-1.5 line-clamp-3 text-[13px] leading-[1.55] text-texto-3">
                <Resaltar texto={s.resumen} termino={enSemantica ? "" : aplicados.q} />
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[12.5px] text-celeste">Ver ficha y consideraciones →</span>
                <Meta>
                  Fallo: <b className="text-texto-2">{s.fallo}</b>
                </Meta>
              </div>
            </Card>
          </Link>
        ))}

        {datos && datos.resultados.length === 0 && (
          <Card className="px-5 py-8 text-center">
            <p className="text-[13px] text-texto-3">
              No hay sentencias que coincidan con esos filtros.
              {enSemantica
                ? " Prueba con otras palabras o amplía la materia."
                : " Prueba con otros términos, amplía la materia — o busca por significado, que entiende la consulta aunque no use las mismas palabras."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {!enSemantica && aplicados.q && (
                <Boton onClick={() => cambiarModo("semantica")}>Buscar por significado</Boton>
              )}
              <BotonJusIA
                onClick={() =>
                  preguntar(
                    `Busca jurisprudencia sobre "${aplicados.q || termino}" y explícame los criterios vigentes`,
                  )
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
          aria-label="Páginas de resultados"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-texto-3"
        >
          <Boton
            disabled={aplicados.pagina <= 1 || cargando}
            onClick={() => navegar({ ...aplicados, pagina: aplicados.pagina - 1 })}
          >
            ← Anterior
          </Boton>
          <span>
            Página <b className="text-marino">{aplicados.pagina}</b> de{" "}
            {totalPaginas.toLocaleString("es-HN")}
          </span>
          <Boton
            disabled={aplicados.pagina >= totalPaginas || cargando}
            onClick={() => navegar({ ...aplicados, pagina: aplicados.pagina + 1 })}
          >
            Siguiente →
          </Boton>
        </nav>
      )}
    </>
  );
}

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

/** Resalta cada palabra buscada en el texto (sin distinguir mayúsculas). */
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

function Select({
  value,
  onChange,
  etiqueta,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={etiqueta}
      // Altura explícita: Chromium fuerza `line-height: normal` en <select> y
      // no se iguala con el input por interlineado (§4.7.7).
      className="h-10 rounded-lg border border-borde bg-white px-2.5 text-[13px] text-marino outline-none focus:border-celeste"
    >
      {children}
    </select>
  );
}
