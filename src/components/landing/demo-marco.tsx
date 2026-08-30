"use client";

/**
 * Marco compartido de las secciones con demostración — lo usan la landing de
 * abogados y la ciudadana. Aquí vive SOLO el chrome (la ventana y el layout de
 * copy + producto); lo que va dentro lo pone cada landing con SUS seeds.
 *
 * Se reproducen como una grabación: al entrar en pantalla los pasos se revelan
 * en orden y se rearman al salir. Pero NO son video: el HTML trae el estado
 * final completo y la animación solo lo va destapando, así que el crawler lee
 * todo y sin JS se ve entero.
 */
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { useEnVista } from "@/hooks/use-en-vista";

/** Marco de ventana: enseña que lo de dentro es producto, no ilustración. */
export function Ventana({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  const { ref, enVista } = useEnVista<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`superficie-dia overflow-hidden rounded-[16px] border border-borde bg-white shadow-[0_18px_50px_rgba(13,33,68,.13)] ${enVista ? "demo-anim" : ""}`}
    >
      <div className="ventana-cabecera flex items-center gap-2 border-b px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--line)" }}
            />
          ))}
        </span>
        <span
          className="text-[10.5px] font-bold tracking-[1.2px] uppercase"
          style={{ color: "var(--muted)" }}
        >
          {etiqueta}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * Sección con demostración: copy a un lado, producto al otro. Alterna el lado
 * para que la página respire al bajar.
 */
export function SeccionDemo({
  id,
  eyebrow,
  titulo,
  descripcion,
  puntos,
  demo,
  invertida = false,
}: {
  id?: string;
  eyebrow: string;
  titulo: string;
  descripcion: string;
  puntos: { icono: NombreIcono; texto: string }[];
  demo: React.ReactNode;
  invertida?: boolean;
}) {
  return (
    <section id={id} className="mx-auto max-w-[1080px] scroll-mt-24 px-5 py-14">
      <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-2">
        <div className={invertida ? "lg:order-2" : undefined}>
          <p
            className="text-[11px] font-bold tracking-[2px] uppercase"
            style={{ color: "var(--mint)" }}
          >
            {eyebrow}
          </p>
          <h2 className="font-display mt-2 text-[clamp(22px,2.6vw,28px)] leading-[1.24] font-bold">
            {titulo}
          </h2>
          <p className="mt-3 text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
            {descripcion}
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {puntos.map((p) => (
              <li key={p.texto} className="flex gap-2.5 text-[13.5px] leading-[1.5]">
                <span className="mt-0.5 shrink-0" style={{ color: "var(--mint)" }}>
                  <Icono nombre={p.icono} size={15} strokeWidth={2.1} />
                </span>
                <span style={{ color: "var(--muted)" }}>{p.texto}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={invertida ? "lg:order-1" : undefined}>{demo}</div>
      </div>
    </section>
  );
}
