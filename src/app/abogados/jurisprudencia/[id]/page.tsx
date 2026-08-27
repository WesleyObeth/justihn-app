import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSentencia, SENTENCIAS } from "@/data/sentencias";
import { DetalleSentencia } from "@/components/portal/detalle-sentencia";
import { BannerValidacion } from "@/components/portal/marco";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return SENTENCIAS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sentencia = getSentencia(id);
  return { title: sentencia ? sentencia.expediente : "Sentencia" };
}

export default async function PaginaSentencia({ params }: Props) {
  const { id } = await params;
  const sentencia = getSentencia(id);
  if (!sentencia) notFound();

  return (
    <>
      <BannerValidacion />
      <h1 className="wordmark mb-5 max-w-[1280px] text-[23px]">Jurisprudencia</h1>
      <div style={{ animation: "fadeUp .3s ease" }}>
        <DetalleSentencia sentencia={sentencia} />
      </div>
    </>
  );
}
