import Link from "next/link";
import { LogoJustihn } from "@/components/brand/logos";

/**
 * Pie compartido de las dos landings. Es un **bloque marino a sangre**
 * (decisión Wesley 2026-08-30): antes era transparente sobre el aurora y la
 * página se deshilachaba al final en vez de cerrar. El color y los contrastes
 * viven en `.pie-aurora` (landing.css), no aquí, para que las dos audiencias
 * no puedan divergir.
 *
 * ⚠️ Nada de `style={{ color: … }}` dentro: los tonos claros de este bloque
 * los pone la clase, y un color inline le ganaría dejando texto marino sobre
 * marino. Los enlaces heredan (`.landing-aurora a { color: inherit }`), que
 * aquí juega a favor.
 */
export interface ColumnaPie {
  titulo: string;
  enlaces: { href: string; label: string }[];
}

export function PieAurora({
  descripcion,
  columnas,
  nota,
}: {
  descripcion: string;
  columnas: ColumnaPie[];
  /** Línea de cierre: aviso legal, copyright o habeas data. */
  nota: React.ReactNode;
}) {
  return (
    <footer className="pie-aurora mt-14">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-start justify-between gap-10 px-5 py-12">
        <div className="max-w-[380px]">
          <LogoJustihn size={26} variante="oscuro" textoPx={16} />
          <p className="pie-desc mt-3 text-[12.5px] leading-[1.65]">{descripcion}</p>
        </div>
        {columnas.map((col) => (
          <div key={col.titulo} className="flex flex-col gap-2 text-[12.5px]">
            <span className="pie-titulo text-[11px] font-semibold tracking-[1px] uppercase">
              {col.titulo}
            </span>
            {col.enlaces.map((e) =>
              // Las anclas de la propia página no pasan por el router.
              e.href.startsWith("#") ? (
                <a key={e.href} href={e.href} className="pie-enlace">
                  {e.label}
                </a>
              ) : (
                <Link key={e.href} href={e.href} className="pie-enlace">
                  {e.label}
                </Link>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="pie-linea border-t">
        <p className="mx-auto max-w-[1080px] px-5 py-5 text-[11.5px] leading-[1.6]">{nota}</p>
      </div>
    </footer>
  );
}
