"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import {
  AvisoDorado,
  Boton,
  BotonVolver,
  Card,
  ChipMateria,
  Meta,
} from "@/components/ui/primitivos";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { PUBLICACIONES } from "@/data/gaceta";
import type { PublicacionGaceta } from "@/types/dominio";

export function DetallePublicacion({ publicacion }: { publicacion: PublicacionGaceta }) {
  const router = useRouter();
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntar = usePreguntarAJusIA();

  // "de La Gaceta" en la pregunta: el router demo la reconoce como consulta de
  // Gaceta para cualquier publicación, no solo las que traen palabra clave.
  const preguntarAJusIA = () =>
    preguntar(`¿Cómo afecta a mis casos la publicación de La Gaceta "${publicacion.titulo}"?`);

  return (
    <div className="mt-4">
      <BotonVolver onClick={() => router.push("/abogados/gaceta")}>Volver al digest</BotonVolver>

      {/* Mismo ancho que el banner del digest (1280): la columna principal se
          estira y la lateral queda fija — sin hueco a la derecha. */}
      <div className="grid max-w-[1280px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-7">
        <div className="flex items-center gap-2">
          <ChipMateria>{publicacion.materia}</ChipMateria>
          <Meta>{publicacion.meta}</Meta>
        </div>

        <h2 className="font-display mt-2.5 text-xl leading-[1.35] font-bold">
          {publicacion.titulo}
        </h2>

        <h3 className="mt-5 text-xs tracking-[.6px] text-texto-4 uppercase">
          Resumen de la publicación
        </h3>
        <p className="mt-2 text-sm leading-[1.75] whitespace-pre-line text-texto-2">
          {publicacion.resumen}
        </p>

        <AvisoDorado className="mt-4.5">
          <b>Impacto en tu práctica:</b> {publicacion.afecta}
        </AvisoDorado>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <BotonJusIA onClick={preguntarAJusIA}>
            Preguntar a Jus IA sobre esta publicación
          </BotonJusIA>
          <Boton
            onClick={() => {
              if (publicacion.fuenteUrl) window.open(publicacion.fuenteUrl, "_blank", "noopener");
              else mostrarToast("PDF oficial disponible al conectar el corpus de ENAG");
            }}
          >
            PDF oficial
          </Boton>
        </div>
      </Card>

      <TambienEnElDigest actual={publicacion} />
      </div>
    </div>
  );
}

/** Columna lateral: el resto del digest de la semana. Bajo `lg` cae debajo. */
function TambienEnElDigest({ actual }: { actual: PublicacionGaceta }) {
  const otras = PUBLICACIONES.filter((p) => p.id !== actual.id);
  if (otras.length === 0) return null;

  return (
    <aside>
      <h3 className="text-xs tracking-[.6px] text-texto-4 uppercase">
        También en el digest de esta semana
      </h3>
      <div className="mt-2.5 flex flex-col gap-3">
        {otras.map((p) => (
          <Link key={p.id} href={`/abogados/gaceta/${p.id}`} className="block text-marino">
            <Card interactiva className="px-4.5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <ChipMateria>{p.materia}</ChipMateria>
                <Meta>{p.meta.split("·")[1]?.trim()}</Meta>
              </div>
              <div className="font-display mt-2 text-[13.5px] leading-[1.4] font-semibold">
                {p.titulo}
              </div>
              <div className="mt-1.5 text-[12.5px] text-celeste">Ver publicación →</div>
            </Card>
          </Link>
        ))}
      </div>
    </aside>
  );
}
