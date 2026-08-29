import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetalleTramite } from "@/components/publico/tramites";
import { getTramite, TRAMITES } from "@/data/tramites";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return TRAMITES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tramite = getTramite(id);
  return {
    title: tramite ? tramite.nombre : "Trámite",
    description: tramite?.resumen,
  };
}

export default async function PaginaTramite({ params }: Props) {
  const { id } = await params;
  const tramite = getTramite(id);
  if (!tramite) notFound();
  return <DetalleTramite tramite={tramite} />;
}
