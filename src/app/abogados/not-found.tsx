import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada" };

/**
 * 404 dentro del shell del portal: lo disparan los deep-links a sentencias o
 * publicaciones que no existen. Como el enlace compartible es un feature del
 * producto, su fallo también lleva la marca y ofrece camino de vuelta.
 */
export default function NoEncontrada() {
  return (
    <div className="grid h-full place-items-center" style={{ animation: "fadeUp .3s ease" }}>
      <div className="max-w-[440px] text-center">
        <div className="font-display text-[52px] font-bold text-celeste">404</div>
        <h1 className="font-display mt-1 text-[21px] font-bold text-marino">
          No encontramos esta página
        </h1>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-texto-3">
          El enlace puede estar vencido o el documento aún no está en el corpus de demostración.
          Prueba buscarlo de nuevo desde estas secciones:
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/abogados/jurisprudencia"
            className="rounded-lg bg-marino px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-celeste hover:text-white"
          >
            Ir a Jurisprudencia
          </Link>
          <Link
            href="/abogados/gaceta"
            className="rounded-lg border border-borde bg-white px-4 py-2.5 text-[13px] text-marino hover:border-celeste hover:text-celeste"
          >
            Alertas de Gaceta
          </Link>
          <Link
            href="/abogados"
            className="rounded-lg border border-borde bg-white px-4 py-2.5 text-[13px] text-marino hover:border-celeste hover:text-celeste"
          >
            Preguntar a Jus IA
          </Link>
        </div>
      </div>
    </div>
  );
}
