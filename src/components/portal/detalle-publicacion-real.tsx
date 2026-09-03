"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { BotonVolver, Card, ChipMateria, Meta, Rotulo } from "@/components/ui/primitivos";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { fechaTexto } from "@/lib/tiempo";
import type { PublicacionReal } from "@/lib/corpus/gaceta";

/**
 * Una publicación real de La Gaceta: emisor, título, extracto oficial y el
 * PDF en su página. No hay «impacto en tu práctica» redactado por nadie: eso
 * lo pregunta el abogado a Jus IA con el texto delante (§4.5).
 */
export function DetallePublicacionReal({ publicacion: p, otras }: { publicacion: PublicacionReal; otras: PublicacionReal[] }) {
  const router = useRouter();
  const preguntar = usePreguntarAJusIA();

  return (
    <div className="mt-4">
      <BotonVolver onClick={() => router.push("/abogados/gaceta")}>Volver a las alertas</BotonVolver>
      <div className="grid max-w-[1280px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-7">
          <div className="flex flex-wrap items-center gap-2">
            {p.materia && <ChipMateria>{p.materia}</ChipMateria>}
            {p.tipo && <Meta className="rounded-md bg-sutil px-1.5 py-[2px]">{p.tipo}</Meta>}
            <Meta>
              La Gaceta Nº {p.gacetaEtiqueta} · {fechaTexto(p.fechaIso)}
              {p.paginaInicio ? ` · Sección ${p.seccion}, págs. ${p.paginaInicio}${p.paginaFin && p.paginaFin !== p.paginaInicio ? `–${p.paginaFin}` : ""}` : ""}
            </Meta>
          </div>
          {p.emisor && <Rotulo className="mt-3 text-texto-3">{p.emisor}</Rotulo>}
          <h2 className="font-display mt-1.5 text-xl leading-[1.35] font-bold">{p.titulo}</h2>

          {p.extracto ? (
            <>
              <h3 className="mt-5 text-xs tracking-[.6px] text-texto-4 uppercase">Así empieza en el Diario Oficial</h3>
              <p className="mt-2 text-sm leading-[1.75] text-texto-2">{p.extracto}…</p>
            </>
          ) : (
            <p className="mt-5 text-[13px] text-texto-3">El sumario de esta edición no permitió ubicar la página: ábrela en el PDF oficial.</p>
          )}

          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href={p.fuenteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[13px] font-medium text-marino hover:border-celeste hover:text-celeste"
            >
              <Icono nombre="libro" size={13} />
              Leer completa en el PDF oficial{p.paginaInicio ? ` (pág. ${p.paginaInicio})` : ""}
            </a>
            <BotonJusIA
              onClick={() =>
                preguntar(
                  `En La Gaceta Nº ${p.gacetaEtiqueta} del ${fechaTexto(p.fechaIso)}, ${p.emisor ?? "el Estado"} publicó «${p.titulo}». Así empieza: «${(p.extracto ?? "").slice(0, 500)}». ¿Qué regula, a quién obliga y qué debo revisar en mis casos?`,
                )
              }
            >
              Preguntar a Jus IA sobre esta publicación
            </BotonJusIA>
          </div>
        </Card>

        {otras.length > 0 && (
          <aside>
            <h3 className="text-xs tracking-[.6px] text-texto-4 uppercase">También en esta edición</h3>
            <div className="mt-2.5 flex flex-col gap-3">
              {otras.map((o) => (
                <Link key={o.id} href={`/abogados/gaceta/${o.id}`} className="block text-marino">
                  <Card interactiva className="px-4.5 py-4">
                    {o.emisor && <Rotulo className="text-texto-4">{o.emisor}</Rotulo>}
                    <div className="font-display mt-1 text-[13.5px] leading-[1.4] font-semibold">{o.titulo}</div>
                    <div className="mt-1.5 text-[12.5px] text-celeste">Ver publicación →</div>
                  </Card>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
