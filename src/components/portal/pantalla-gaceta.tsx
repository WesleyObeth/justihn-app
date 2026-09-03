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
import { DIGEST, PUBLICACIONES, etiquetaPublicacion } from "@/data/gaceta";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { useGaceta } from "@/hooks/use-gaceta";
import { fechaTexto } from "@/lib/tiempo";
import type { PublicacionReal, ResultadoGaceta } from "@/lib/corpus/gaceta";
import { Boton, Meta } from "@/components/ui/primitivos";
import { cn } from "@/lib/utils";

/**
 * Alertas de Gaceta sobre las tablas REALES (`gacetas` + `publicaciones_gaceta`,
 * conectadas el 2026-09-03). Un solo hook (`useGaceta`) alimenta esta pantalla
 * y el digest del Dashboard. Mientras la migración `01-gaceta.sql` no esté
 * pasada, la API responde `disponible: false` y se enseña la maqueta de seed
 * DICIENDO que es la maqueta — nunca como si fuera el Diario Oficial.
 */
export function PantallaGaceta() {
  const estado = useGaceta({ dias: 30 });
  if (estado.tipo === "cargando") {
    return <p className="text-[13px] text-texto-4">Leyendo las últimas ediciones de La Gaceta…</p>;
  }
  if (estado.tipo === "error") {
    return (
      <Card className="px-5 py-8 text-center">
        <p className="text-[13px] text-texto-3">{estado.mensaje}</p>
      </Card>
    );
  }
  if (!estado.datos.disponible) {
    return (
      <>
        <p className="mb-3 rounded-r-[10px] border-l-[3px] border-dorado bg-aviso px-4 py-2.5 text-[12.5px] leading-[1.5] text-aviso-cuerpo">
          <b>Maqueta de demostración.</b> La Gaceta en vivo se enciende al pasar la migración
          <code className="mx-1 rounded bg-white/60 px-1">automatizaciones/gaceta/esquema/01-gaceta.sql</code>
          y correr la captura desde la Mac; hasta entonces estas publicaciones son de ejemplo.
        </p>
        <PantallaGacetaSeed />
      </>
    );
  }
  return <GacetaReal datos={estado.datos} />;
}

function GacetaReal({ datos }: { datos: ResultadoGaceta }) {
  const router = useRouter();
  const params = useSearchParams();
  const subs = usePortal((s) => s.subs);
  const preguntar = usePreguntarAJusIA();
  const filtro = params.get("materia") ?? "todas";
  const setFiltro = (m: string) => {
    const p = new URLSearchParams(params);
    if (m === "todas") p.delete("materia");
    else p.set("materia", m);
    const query = p.toString();
    router.replace(`/abogados/gaceta${query ? `?${query}` : ""}`, { scroll: false });
  };

  // El «Avance» es el anuncio de la ENAG de lo que trae la siguiente edición:
  // no es una publicación del Estado y no se lista.
  const todas = datos.publicaciones.filter((p) => p.tipo !== "Avance");
  const materias = [...new Set(todas.map((p) => p.materia).filter((m): m is NonNullable<typeof m> => !!m))];
  const sinMateria = todas.filter((p) => !p.materia).length;
  const visibles =
    filtro === "todas" ? todas : filtro === "sin-materia" ? todas.filter((p) => !p.materia) : todas.filter((p) => p.materia === filtro);
  const enMisMaterias = todas.filter((p) => p.materia && subs[p.materia]).length;
  const porGaceta = new Map<number, PublicacionReal[]>();
  for (const p of visibles) porGaceta.set(p.gacetaNumero, [...(porGaceta.get(p.gacetaNumero) ?? []), p]);
  const gacetaDe = (n: number) => datos.gacetas.find((g) => g.numero === n);
  const ultima = datos.gacetas[0];

  return (
    <>
      <CardMarino className="flex flex-wrap items-center gap-4 p-6">
        <div className="min-w-[240px] flex-1">
          <Rotulo className="text-sobre-marino">Diario Oficial · en vivo</Rotulo>
          <h2 className="font-display mt-1.5 text-[21px] font-bold">
            {todas.length} publicaciones en {datos.gacetas.length} ediciones
          </h2>
          <p className="mt-1 text-[13px] text-sobre-marino-2">
            Desde el {fechaTexto(datos.desdeIso)}
            {ultima ? ` hasta la Nº ${ultima.etiqueta} del ${fechaTexto(ultima.fechaIso)}` : ""} ·{" "}
            {enMisMaterias} en tus materias suscritas · Sección A, con el PDF oficial en su página.
          </p>
        </div>
        <BotonJusIA
          onClick={() =>
            preguntar(
              `Resúmeme lo publicado en La Gaceta desde el ${fechaTexto(datos.desdeIso)}: ${todas
                .slice(0, 12)
                .map((p) => `${p.emisor ?? "—"}: ${p.titulo}`)
                .join("; ")}. ¿Cuáles afectan la práctica laboral, civil y de familia?`,
              { enviarDirecto: true },
            )
          }
        >
          Resumir con Jus IA
        </BotonJusIA>
      </CardMarino>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FiltroChip activo={filtro === "todas"} onClick={() => setFiltro("todas")}>
          Todas ({todas.length})
        </FiltroChip>
        {materias.map((m) => (
          <FiltroChip key={m} activo={filtro === m} onClick={() => setFiltro(m)}>
            {m} ({todas.filter((p) => p.materia === m).length})
          </FiltroChip>
        ))}
        {sinMateria > 0 && (
          <FiltroChip activo={filtro === "sin-materia"} onClick={() => setFiltro("sin-materia")}>
            Sin materia asignada ({sinMateria})
          </FiltroChip>
        )}
        <span className="text-[11.5px] text-texto-4">
          — la materia se asigna solo con regla clara (Trabajo → Laboral, CNBS → Mercantil…); el resto se lee por emisor.
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4">
          {[...porGaceta.entries()].map(([numero, pubs]) => {
            const g = gacetaDe(numero);
            return (
              <section key={numero}>
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-[15px] font-semibold">La Gaceta Nº {pubs[0]!.gacetaEtiqueta}</h3>
                  <Meta>{fechaTexto(pubs[0]!.fechaIso)}</Meta>
                  {g && (
                    <a href={g.urlPdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px]">
                      <Icono nombre="libro" size={11} strokeWidth={2} />
                      PDF íntegro · {g.paginas} pp
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {pubs.map((p) => (
                    <Card key={p.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {p.emisor && <Rotulo className="text-texto-3">{p.emisor}</Rotulo>}
                        {p.tipo && <Meta className="rounded-md bg-sutil px-1.5 py-[2px]">{p.tipo}</Meta>}
                        {p.materia && <ChipMateria>{p.materia}</ChipMateria>}
                        {p.paginaInicio && (
                          <span className="ml-auto text-[11px] text-texto-4">
                            págs. A.{p.paginaInicio}
                            {p.paginaFin && p.paginaFin !== p.paginaInicio ? `–${p.paginaFin}` : ""}
                          </span>
                        )}
                      </div>
                      <Link href={`/abogados/gaceta/${p.id}`} className="mt-1.5 block text-[14.5px] font-semibold text-marino hover:text-celeste">
                        {p.titulo}
                      </Link>
                      {p.extracto && <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.55] text-texto-3">{p.extracto}</p>}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px]">
                        <Link href={`/abogados/gaceta/${p.id}`}>Ver publicación →</Link>
                        <a href={p.fuenteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-texto-3 hover:text-celeste">
                          <Icono nombre="libro" size={11} strokeWidth={2} />
                          PDF oficial{p.paginaInicio ? ` (pág. ${p.paginaInicio})` : ""}
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
          {visibles.length === 0 && (
            <Card className="px-5 py-8 text-center text-[13px] text-texto-3">
              Ninguna publicación con ese filtro en el periodo.
              <div className="mt-3">
                <Boton onClick={() => setFiltro("todas")}>Ver todas</Boton>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <TituloSeccion>En números</TituloSeccion>
            <div className="mt-3 flex flex-col gap-2 text-[13px]">
              <Fila etiqueta="Ediciones capturadas" valor={String(datos.gacetas.length)} />
              <Fila etiqueta="Publicaciones (Sección A)" valor={String(todas.length)} />
              {materias.map((m) => (
                <Fila key={m} etiqueta={m} valor={String(todas.filter((p) => p.materia === m).length)} />
              ))}
              <div className="flex items-center justify-between border-t border-borde-suave pt-2">
                <span className="text-texto-3">En tus materias suscritas</span>
                <b className="text-dorado">{enMisMaterias}</b>
              </div>
            </div>
          </Card>
          <MateriasSuscritas />
          <Card className="p-5">
            <TituloSeccion>Ediciones</TituloSeccion>
            <div className="mt-2.5 flex flex-col">
              {datos.gacetas.map((g) => (
                <a
                  key={g.numero}
                  href={g.urlPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border-b border-borde-suave py-2 text-[13px] text-marino last:border-b-0 hover:text-celeste"
                >
                  <span>
                    Nº {g.etiqueta} · {fechaTexto(g.fechaIso)}
                  </span>
                  <span className="text-[11.5px] text-texto-4">{g.paginas} pp · PDF</span>
                </a>
              ))}
            </div>
            <p className="mt-2.5 text-[11.5px] leading-[1.5] text-texto-4">
              La ENAG publica con retraso: el listado llega hasta la última edición que el portal muestra.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

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

export function PantallaGacetaSeed() {
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
                      <div className="mt-[3px] text-[12.5px] text-texto-3">{etiquetaPublicacion(p)}</div>
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
