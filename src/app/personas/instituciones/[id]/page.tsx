import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetalleInstitucion } from "@/components/personas/detalle-institucion";
import { getInstitucion, INSTITUCIONES } from "@/data/tramites";

export function generateStaticParams() {
  return INSTITUCIONES.map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const inst = getInstitucion(id);
  return { title: inst ? inst.nombre : "Institución" };
}

export default async function PaginaInstitucion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const institucion = getInstitucion(id);
  if (!institucion) notFound();
  return <DetalleInstitucion institucion={institucion} />;
}
