import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSentencia, SENTENCIAS } from "@/data/sentencias";
import {
  getRecordIdPorExpediente,
  getRelacionadas,
  getSentenciaCorpus,
} from "@/lib/corpus/sentencias";
import { DetalleSentencia } from "@/components/portal/detalle-sentencia";
import { BannerValidacion } from "@/components/portal/marco";
import { Card } from "@/components/ui/primitivos";
import type { Sentencia } from "@/types/dominio";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Ficha de una sentencia. Desde el 2026-09-02 el `id` es el `record_id` del
 * CEDIJ y la ficha sale del corpus real. Los slugs del piloto («cl-528-24»)
 * siguen enlazados desde el Dashboard, Jus IA y los demos: se resuelven por
 * expediente y redirigen a la ficha real; si la sentencia no está en la base
 * (reservada por §5, o aún no capturada), se enseña el seed como antes.
 */
const esRecordId = (id: string) => /^\d{1,7}$/.test(id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (esRecordId(id)) {
    const s = await getSentenciaCorpus(Number(id)).catch(() => null);
    return { title: s ? s.expediente : "Sentencia" };
  }
  const seed = getSentencia(id);
  return { title: seed ? seed.expediente : "Sentencia" };
}

export default async function PaginaSentencia({ params }: Props) {
  const { id } = await params;

  if (esRecordId(id)) {
    let sentencia: Awaited<ReturnType<typeof getSentenciaCorpus>>;
    try {
      sentencia = await getSentenciaCorpus(Number(id));
    } catch (error) {
      // Un corpus caído no es un 404: la sentencia existe, es la base la que
      // no contestó. Se dice, en vez de fingir que no hay nada.
      console.error("[jurisprudencia] el corpus no respondió:", error);
      return (
        <Marco>
          <Card className="px-5 py-8 text-center text-[13px] text-texto-3">
            El corpus no respondió. Vuelve a cargar la página en unos segundos.
          </Card>
        </Marco>
      );
    }
    if (!sentencia) notFound();
    const relacionadas = await getRelacionadas(sentencia).catch(() => []);
    return (
      <Marco>
        <DetalleSentencia sentencia={sentencia} relacionadas={relacionadas} />
      </Marco>
    );
  }

  const seed = getSentencia(id);
  if (!seed) notFound();

  const recordId = await getRecordIdPorExpediente(seed.expediente).catch(() => null);
  if (recordId) redirect(`/abogados/jurisprudencia/${recordId}`);

  return (
    <Marco>
      <DetalleSentencia sentencia={seed} relacionadas={relacionadasDelSeed(seed)} />
    </Marco>
  );
}

function relacionadasDelSeed(actual: Sentencia): Sentencia[] {
  const otras = SENTENCIAS.filter((s) => s.id !== actual.id);
  return [
    ...otras.filter((s) => s.materia === actual.materia),
    ...otras.filter((s) => s.materia !== actual.materia),
  ].slice(0, 3);
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BannerValidacion />
      <h1 className="wordmark mb-5 max-w-[1280px] text-[23px]">Jurisprudencia</h1>
      <div style={{ animation: "fadeUp .3s ease" }}>{children}</div>
    </>
  );
}
