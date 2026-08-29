import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetalleTramitePersona } from "@/components/personas/tramites-persona";
import { getTramite, TRAMITES } from "@/data/tramites";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return TRAMITES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: getTramite(id)?.nombre ?? "Trámite" };
}

export default async function PaginaTramitePersona({ params }: Props) {
  const { id } = await params;
  const tramite = getTramite(id);
  if (!tramite) notFound();
  return <DetalleTramitePersona tramite={tramite} />;
}
