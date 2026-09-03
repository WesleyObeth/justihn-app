import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ARTICULOS_SIN_TEXTO, getCodigo } from "@/data/legislacion";
import { getArticulo, getVecinos } from "@/lib/corpus/legislacion";
import { DetalleArticulo, ArticuloSinTexto } from "@/components/portal/detalle-articulo";
import { BannerValidacion } from "@/components/portal/marco";
import { Card } from "@/components/ui/primitivos";

interface Props {
  params: Promise<{ codigo: string; numero: string }>;
}

/**
 * Un artículo de un código, como ruta real: «el art. 120 del Código del
 * Trabajo» es algo que un abogado se manda a sí mismo o le pega a un colega,
 * y merece una URL igual que una sentencia. El texto sale de la tabla
 * `articulos`; la fuente es el PDF oficial abierto en su página.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo, numero } = await params;
  const c = getCodigo(codigo);
  return { title: c ? `Art. ${decodeURIComponent(numero)} · ${c.nombre}` : "Legislación" };
}

export default async function PaginaArticulo({ params }: Props) {
  const { codigo: codigoId, numero: numeroCrudo } = await params;
  const numero = decodeURIComponent(numeroCrudo);
  const codigo = getCodigo(codigoId);
  if (!codigo) notFound();
  // Los alias viejos («cpc») redirigen a la ruta canónica.
  if (codigo.id !== codigoId) redirect(`/abogados/legislacion/${codigo.id}/${numeroCrudo}`);
  if (codigo.estado !== "cargado") notFound();

  let articulo: Awaited<ReturnType<typeof getArticulo>>;
  try {
    articulo = await getArticulo(codigo.id, numero);
  } catch (error) {
    // Un corpus caído no es un 404: el artículo existe, es la base la que
    // no contestó. Se dice, en vez de fingir que no hay nada.
    console.error("[legislacion] el corpus no respondió:", error);
    return (
      <Marco>
        <Card className="px-5 py-8 text-center text-[13px] text-texto-3">
          El corpus no respondió. Vuelve a cargar la página en unos segundos.
        </Card>
      </Marco>
    );
  }

  if (!articulo) {
    if (ARTICULOS_SIN_TEXTO[codigo.id]?.includes(numero.toUpperCase())) {
      return (
        <Marco>
          <ArticuloSinTexto codigo={codigo} numero={numero.toUpperCase()} />
        </Marco>
      );
    }
    notFound();
  }

  const vecinos =
    articulo.orden !== null
      ? await getVecinos(codigo.id, articulo.orden).catch(() => ({ anterior: null, siguiente: null }))
      : { anterior: null, siguiente: null };

  return (
    <Marco>
      <DetalleArticulo articulo={articulo} codigo={codigo} vecinos={vecinos} />
    </Marco>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BannerValidacion />
      <h1 className="wordmark mb-5 max-w-[1280px] text-[23px]">Legislación</h1>
      <div className="max-w-[1280px]" style={{ animation: "fadeUp .3s ease" }}>
        {children}
      </div>
    </>
  );
}
