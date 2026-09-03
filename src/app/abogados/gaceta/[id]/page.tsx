import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicacion } from "@/data/gaceta";
import { getMismaGaceta, getPublicacionReal } from "@/lib/corpus/gaceta";
import { DetallePublicacion } from "@/components/portal/detalle-publicacion";
import { DetallePublicacionReal } from "@/components/portal/detalle-publicacion-real";
import { BannerValidacion } from "@/components/portal/marco";
import { DigestSemanal } from "@/components/portal/pantalla-gaceta";
import { Card } from "@/components/ui/primitivos";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Desde el 2026-09-03 el `id` numérico es una publicación REAL de
 * `publicaciones_gaceta`; los slugs del seed («salario-minimo-2026») siguen
 * sirviendo la maqueta mientras la migración no esté pasada.
 */
const esReal = (id: string) => /^\d{1,9}$/.test(id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (esReal(id)) {
    const p = await getPublicacionReal(Number(id)).catch(() => null);
    return { title: p ? p.titulo : "Publicación" };
  }
  const publicacion = getPublicacion(id);
  return { title: publicacion ? publicacion.titulo : "Publicación" };
}

export default async function PaginaPublicacion({ params }: Props) {
  const { id } = await params;

  if (esReal(id)) {
    let p: Awaited<ReturnType<typeof getPublicacionReal>>;
    try {
      p = await getPublicacionReal(Number(id));
    } catch (error) {
      console.error("[gaceta] la base no respondió:", error);
      return (
        <Marco>
          <Card className="px-5 py-8 text-center text-[13px] text-texto-3">La Gaceta no respondió. Vuelve a cargar la página en unos segundos.</Card>
        </Marco>
      );
    }
    if (!p) notFound();
    const otras = await getMismaGaceta(p.gacetaNumero, p.id).catch(() => []);
    return (
      <Marco>
        <DetallePublicacionReal publicacion={p} otras={otras.filter((o) => o.tipo !== "Avance")} />
      </Marco>
    );
  }

  const publicacion = getPublicacion(id);
  if (!publicacion) notFound();
  return (
    <Marco>
      <DigestSemanal />
      <DetallePublicacion publicacion={publicacion} />
    </Marco>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BannerValidacion />
      <h1 className="wordmark mb-5 max-w-[1280px] text-[23px]">Alertas de Gaceta</h1>
      <div className="max-w-[1280px]" style={{ animation: "fadeUp .3s ease" }}>
        {children}
      </div>
    </>
  );
}
