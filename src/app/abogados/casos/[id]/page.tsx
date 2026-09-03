import type { Metadata } from "next";
import { Vista } from "@/components/portal/marco";
import { DetalleCaso } from "@/components/portal/detalle-caso";

export const metadata: Metadata = { title: "Caso" };

/**
 * Los casos viven hoy en el navegador (Fase 1): la página no puede resolver el
 * id en el servidor. `DetalleCaso` espera la hidratación y enseña «no está en
 * este navegador» en vez de un 404 falso (§1.2 del CLAUDE.md técnico).
 */
export default async function PaginaCaso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Vista titulo="Caso">
      <DetalleCaso id={id} />
    </Vista>
  );
}
