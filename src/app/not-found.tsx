import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada" };

/** 404 fuera del portal (rutas sin shell). El portal tiene el suyo propio. */
export default function NoEncontrada() {
  return (
    <div className="grid min-h-screen place-items-center bg-lienzo text-marino">
      <div className="max-w-[420px] px-6 text-center">
        <div className="font-display text-[52px] font-bold text-celeste">404</div>
        <h1 className="font-display mt-1 text-[21px] font-bold">No encontramos esta página</h1>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-texto-3">
          El enlace puede estar mal escrito o haber vencido.
        </p>
        <Link
          href="/abogados"
          className="mt-5 inline-block rounded-lg bg-marino px-4.5 py-2.5 text-[13px] font-semibold text-white hover:bg-celeste hover:text-white"
        >
          Ir al portal
        </Link>
      </div>
    </div>
  );
}
