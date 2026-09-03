"use client";

import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Card, ChipMateria, Rotulo } from "@/components/ui/primitivos";
import { parrafosDe, type ArticuloCorpus } from "@/lib/corpus/articulo";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import type { Codigo } from "@/types/dominio";

interface Vecino {
  numero: string;
  rubrica: string | null;
}

/**
 * La ficha de un artículo. El texto es el oficial, párrafo a párrafo, y el
 * lateral dice de dónde sale (PDF y página), qué herramienta del portal lo
 * aplica y qué otros artículos del mismo código el portal ya usa.
 */
export function DetalleArticulo({
  articulo: a,
  codigo,
  vecinos,
}: {
  articulo: ArticuloCorpus;
  codigo: Codigo;
  vecinos: { anterior: Vecino | null; siguiente: Vecino | null };
}) {
  const preguntar = usePreguntarAJusIA();
  const destacado = codigo.destacados.find((d) => d.numero === a.numero);
  const titulo = a.rubrica ?? destacado?.titulo ?? null;
  const otros = codigo.destacados.filter((d) => d.numero !== a.numero);
  const listado = `/abogados/legislacion?codigo=${codigo.id}`;

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="p-6 sm:p-7">
        <Link href={listado} className="inline-flex items-center gap-1 text-[12.5px]">
          <Icono nombre="atras" size={12} />
          {codigo.nombre}
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="rounded-md bg-chip px-2.5 py-[3px] font-mono text-[12px] font-bold text-celeste">
            Art. {a.numero}
          </span>
          <ChipMateria>{codigo.materia}</ChipMateria>
          {a.pagina && <span className="text-[11.5px] text-texto-4">pág. {a.pagina} del PDF</span>}
        </div>
        <h2 className="font-display mt-2 text-[21px] leading-[1.3] font-bold">
          {titulo ?? `Artículo ${a.numero}`}
        </h2>
        {!a.rubrica && destacado && (
          <p className="mt-1 text-[12px] text-texto-4">
            Rótulo del portal — el texto oficial no titula este artículo.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3.5 text-[14px] leading-[1.7] text-texto-2">
          {parrafosDe(a.cuerpo).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-borde-suave pt-4">
          <a
            href={a.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12.5px]"
          >
            <Icono nombre="libro" size={12} strokeWidth={2} />
            Abrir en el PDF oficial{a.pagina ? ` (pág. ${a.pagina})` : ""}
          </a>
          <BotonJusIA
            compacto
            className="ml-auto"
            onClick={() =>
              preguntar(
                `¿Qué dice el artículo ${a.numero} del ${codigo.nombre} y cómo lo ha aplicado la Corte Suprema?`,
              )
            }
          >
            Preguntar sobre este artículo
          </BotonJusIA>
        </div>

        <nav
          aria-label="Artículos vecinos"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px]"
        >
          {vecinos.anterior ? (
            <Link href={`/abogados/legislacion/${codigo.id}/${vecinos.anterior.numero}`}>
              ← Art. {vecinos.anterior.numero}
              {vecinos.anterior.rubrica ? ` · ${vecinos.anterior.rubrica}` : ""}
            </Link>
          ) : (
            <span />
          )}
          {vecinos.siguiente && (
            <Link href={`/abogados/legislacion/${codigo.id}/${vecinos.siguiente.numero}`}>
              Art. {vecinos.siguiente.numero}
              {vecinos.siguiente.rubrica ? ` · ${vecinos.siguiente.rubrica}` : ""} →
            </Link>
          )}
        </nav>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="p-5">
          <Rotulo>Fuente oficial</Rotulo>
          <p className="mt-2 text-[13px] leading-[1.55] text-texto-2">
            Texto extraído del PDF que publica el CEDIJ del Poder Judicial: {codigo.nombre},{" "}
            {codigo.decreto}.
          </p>
          <a
            href={a.fuenteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-borde bg-lienzo px-3.5 py-2 text-[12.5px] font-medium text-marino hover:border-celeste hover:text-celeste"
          >
            <Icono nombre="libro" size={13} />
            PDF oficial{a.pagina ? `, pág. ${a.pagina}` : ""}
          </a>
          <p className="mt-3 text-[11.5px] leading-[1.5] text-texto-4">
            Las notas al pie del PDF (reformas, decretos) pueden aparecer pegadas al texto: así
            vienen en la capa de texto del documento oficial.
          </p>
        </Card>

        {destacado && (destacado.nota || destacado.herramienta) && (
          <Card className="p-5">
            <Rotulo>En el portal</Rotulo>
            {destacado.nota && (
              <p className="mt-2 text-[13px] leading-[1.55] text-texto-2">{destacado.nota}</p>
            )}
            {destacado.herramienta && (
              <Link
                href={destacado.herramienta.href}
                className="mt-3 inline-block text-[12.5px] font-medium"
              >
                {destacado.herramienta.etiqueta} →
              </Link>
            )}
          </Card>
        )}

        {otros.length > 0 && (
          <Card className="p-5">
            <Rotulo>Otros artículos que el portal aplica</Rotulo>
            <ul className="mt-2 flex flex-col gap-1.5">
              {otros.map((d) => (
                <li key={d.numero}>
                  <Link
                    href={`/abogados/legislacion/${codigo.id}/${d.numero}`}
                    className="inline-flex items-baseline gap-2 text-[13px] text-marino hover:text-celeste"
                  >
                    <span className="font-mono text-[11px] font-bold text-celeste">
                      Art. {d.numero}
                    </span>
                    {d.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Los cuatro artículos cuyo encabezado no existe en la capa de texto del PDF
 * (`ARTICULOS_SIN_TEXTO`): existen en el código, no en nuestra tabla. Decirlo
 * vale más que un 404.
 */
export function ArticuloSinTexto({ codigo, numero }: { codigo: Codigo; numero: string }) {
  return (
    <Card className="max-w-[720px] p-6 sm:p-7">
      <Link
        href={`/abogados/legislacion?codigo=${codigo.id}`}
        className="inline-flex items-center gap-1 text-[12.5px]"
      >
        <Icono nombre="atras" size={12} />
        {codigo.nombre}
      </Link>
      <div className="mt-3 flex items-center gap-2.5">
        <span className="rounded-md bg-chip px-2.5 py-[3px] font-mono text-[12px] font-bold text-celeste">
          Art. {numero}
        </span>
        <ChipMateria>{codigo.materia}</ChipMateria>
      </div>
      <h2 className="font-display mt-2 text-[21px] font-bold">Sin texto propio en la base</h2>
      <p className="mt-3 text-[14px] leading-[1.65] text-texto-2">
        El artículo {numero} existe en el {codigo.nombre}, pero su encabezado no está en la capa
        de texto del PDF oficial: al extraerlo, su contenido quedó dentro del artículo anterior.
        No se transcribe a mano — sin fuente legible no hay texto — así que se lee en el
        documento oficial.
      </p>
      {codigo.fuenteUrl && (
        <a
          href={codigo.fuenteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-borde bg-lienzo px-3.5 py-2 text-[12.5px] font-medium text-marino hover:border-celeste hover:text-celeste"
        >
          <Icono nombre="libro" size={13} />
          Abrir el PDF oficial
        </a>
      )}
    </Card>
  );
}
