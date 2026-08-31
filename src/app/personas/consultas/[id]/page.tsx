import type { Metadata } from "next";
import { DetalleConsulta } from "@/components/personas/detalle-consulta";

export const metadata: Metadata = { title: "Mi consulta" };

/**
 * Ruta real, no estado (§1.1): el enlace a una consulta concreta funciona al
 * recargar. Es dinámica porque hoy las consultas viven en el store del
 * navegador — TODO(auth): con Supabase pasan a leerse en el servidor por
 * `persona_id`, y esta página podrá renderizarse sin esperar la hidratación.
 */
export default async function PaginaDetalleConsulta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetalleConsulta id={id} />;
}
