"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, ChipMateria, Meta, PillMateria } from "@/components/ui/primitivos";
import { buscarSentencias, SENTENCIAS } from "@/data/sentencias";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";

const MATERIAS = ["Civil", "Laboral", "Penal", "Constitucional", "Contencioso Adm."];

/**
 * Búsqueda de jurisprudencia sobre el corpus. La búsqueda aplicada vive en la
 * URL (`?q=&materia=&organo=`): igual que una sentencia, una búsqueda es
 * compartible y sobrevive al refresh.
 *
 * TODO(data): el filtrado corre en cliente sobre el seed. En Fase 2 pasa a
 * `GET /api/jurisprudencia` con búsqueda full-text + pgvector sobre las 20,189
 * sentencias; el shape del resultado ya es el que consume esta vista.
 */
export function BuscadorJurisprudencia() {
  // `key` remonta el buscador cuando la URL cambia por fuera (back/forward,
  // link del Dashboard): el estado local de los campos se re-siembra de la URL.
  const params = useSearchParams();
  return <Buscador key={params.toString()} />;
}

function Buscador() {
  const router = useRouter();
  const params = useSearchParams();
  const aplicados = {
    termino: params.get("q") ?? "",
    materia: params.get("materia") ?? "todas",
    organo: params.get("organo") ?? "todos",
  };

  const [termino, setTermino] = useState(aplicados.termino);
  const [materia, setMateria] = useState(aplicados.materia);
  const [organo, setOrgano] = useState(aplicados.organo);
  const preguntar = usePreguntarAJusIA();

  const resultados = buscarSentencias(aplicados.termino, {
    materia: aplicados.materia,
    organo: aplicados.organo,
  });

  /** Aplica la búsqueda a la URL; `extra` permite que un chip filtre al vuelo. */
  const aplicar = (extra?: { materia?: string }) => {
    const materiaFinal = extra?.materia ?? materia;
    const p = new URLSearchParams();
    if (termino.trim()) p.set("q", termino.trim());
    if (materiaFinal !== "todas") p.set("materia", materiaFinal);
    if (organo !== "todos") p.set("organo", organo);
    const query = p.toString();
    router.replace(`/abogados/jurisprudencia${query ? `?${query}` : ""}`, { scroll: false });
  };

  const buscar = () => aplicar();

  const filtrarMateria = (m: string) => {
    const siguiente = aplicados.materia === m ? "todas" : m;
    setMateria(siguiente);
    aplicar({ materia: siguiente });
  };

  const limpiar = () => {
    setTermino("");
    setMateria("todas");
    setOrgano("todos");
    router.replace("/abogados/jurisprudencia", { scroll: false });
  };

  const hayFiltros =
    aplicados.termino !== "" || aplicados.materia !== "todas" || aplicados.organo !== "todos";

  return (
    <>
      <Card className="flex flex-wrap items-center gap-2.5 px-5 py-4.5">
        <input
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          placeholder={`Buscar en ${SENTENCIAS_TOTALES} sentencias con resumen oficial…`}
          aria-label="Buscar en jurisprudencia"
          className="min-w-[200px] flex-1 rounded-lg border border-borde px-3.5 py-2.5 text-sm text-marino outline-none focus:border-celeste"
        />
        <Select value={materia} onChange={setMateria} etiqueta="Materia">
          <option value="todas">Todas las materias</option>
          {MATERIAS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Select value={organo} onChange={setOrgano} etiqueta="Órgano">
          <option value="todos">Todos los órganos</option>
          <option value="salas">Salas CSJ</option>
          <option value="apelaciones">Cortes de Apelaciones</option>
        </Select>
        <Boton variante="marino" onClick={buscar} className="px-4.5">
          Buscar
        </Boton>
      </Card>

      <div className="mx-0.5 mt-3.5 flex flex-wrap items-center gap-2">
        {MATERIAS.map((m) => (
          <PillMateria
            key={m}
            nombre={m}
            activa={aplicados.materia === m}
            onToggle={() => filtrarMateria(m)}
          />
        ))}
      </div>

      <p className="mx-0.5 mt-3.5 mb-2.5 text-[12.5px] text-texto-3">
        {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"} ·{" "}
        <b className="text-exito">muestra real del corpus</b> (piloto de 100) ·{" "}
        {aplicados.termino ? "ordenados por relevancia" : "más recientes primero"}
        {aplicados.termino && (
          <>
            {" "}
            · búsqueda: <b>&laquo;{aplicados.termino}&raquo;</b>
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

      <div className="flex flex-col gap-3">
        {resultados.map((s) => (
          <Link key={s.id} href={`/abogados/jurisprudencia/${s.id}`} className="block text-marino">
            <Card interactiva className="px-5 py-4.5">
              <div className="flex flex-wrap items-center gap-2">
                <ChipMateria>{s.materia}</ChipMateria>
                <Meta>
                  {s.organo} · {s.fecha}
                </Meta>
                <span className="ml-auto font-mono text-[11px] text-texto-4">{s.expediente}</span>
              </div>
              <h3 className="font-display mt-2 text-[15.5px] font-semibold">
                <Resaltar texto={s.titulo} termino={aplicados.termino} />
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-texto-3">
                <Resaltar texto={s.resumen} termino={aplicados.termino} />
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-celeste">Ver sentencia íntegra →</span>
                <Meta>
                  Fallo: <b className="text-texto-2">{s.fallo}</b>
                </Meta>
              </div>
            </Card>
          </Link>
        ))}

        {resultados.length === 0 && (
          <Card className="px-5 py-8 text-center">
            <p className="text-[13px] text-texto-3">
              No hay sentencias que coincidan con esos filtros. Prueba con otros términos, amplía
              la materia — o deja que Jus IA busque por ti.
            </p>
            <BotonJusIA
              className="mt-4"
              onClick={() =>
                preguntar(
                  `Busca jurisprudencia sobre "${aplicados.termino || termino}" y explícame los criterios vigentes`,
                )
              }
            >
              Preguntar a Jus IA
            </BotonJusIA>
          </Card>
        )}
      </div>
    </>
  );
}

/** Total del corpus verificado en la API del PJ (`justihn/CLAUDE.md` §3 — corpus vivo, verificado 2026-08-26). */
const SENTENCIAS_TOTALES = (20202).toLocaleString("es-HN");

/** Resalta cada palabra buscada en el texto (sin distinguir mayúsculas). */
function Resaltar({ texto, termino }: { texto: string; termino: string }) {
  const palabras = termino
    .trim()
    .split(/\s+/)
    .filter(Boolean)
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
      className="rounded-lg border border-borde bg-white p-2.5 text-[13px] text-marino outline-none focus:border-celeste"
    >
      {children}
    </select>
  );
}

export { SENTENCIAS };
