import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicacion, PUBLICACIONES } from "@/data/gaceta";
import { DetallePublicacion } from "@/components/portal/detalle-publicacion";
import { BannerValidacion } from "@/components/portal/marco";
import { DigestSemanal } from "@/components/portal/pantalla-gaceta";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PUBLICACIONES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const publicacion = getPublicacion(id);
  return { title: publicacion ? publicacion.titulo : "Publicación" };
}

export default async function PaginaPublicacion({ params }: Props) {
  const { id } = await params;
  const publicacion = getPublicacion(id);
  if (!publicacion) notFound();

  return (
    <>
      <BannerValidacion />
      <h1 className="wordmark mb-5 max-w-[1280px] text-[23px]">Alertas de Gaceta</h1>
      <div className="max-w-[1280px]" style={{ animation: "fadeUp .3s ease" }}>
        <DigestSemanal />
        <DetallePublicacion publicacion={publicacion} />
      </div>
    </>
  );
}
