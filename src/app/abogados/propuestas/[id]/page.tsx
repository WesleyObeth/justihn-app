import type { Metadata } from "next";
import { BannerValidacion } from "@/components/portal/marco";
import { DetallePropuesta } from "@/components/portal/pantalla-propuestas";

export const metadata: Metadata = { title: "Propuesta de honorarios" };

/** Sin `Vista`: el h1 de la página no debe salir en el PDF; el documento trae el suyo. */
export default async function PaginaPropuesta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <BannerValidacion />
      <h1 className="wordmark mb-5 max-w-[1280px] text-[23px] print:hidden">Propuesta de honorarios</h1>
      <DetallePropuesta id={id} />
    </>
  );
}
