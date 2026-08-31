import type { Metadata } from "next";
import { DetalleAbogado } from "@/components/personas/detalle-abogado";
import { DIRECTORIO } from "@/data/directorio";

export function generateStaticParams() {
  return DIRECTORIO.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = DIRECTORIO.find((x) => x.id === id);
  return { title: a ? a.nombre : "Abogado" };
}

export default async function PaginaDetalleAbogado({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetalleAbogado id={id} />;
}
