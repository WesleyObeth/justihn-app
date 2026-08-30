"use client";

import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { useEnVista } from "@/hooks/use-en-vista";
import { SimboloJusIA } from "@/components/brand/logos";
import { LEADS } from "@/data/catalogo";
import { PUBLICACIONES } from "@/data/gaceta";
import { SENTENCIAS } from "@/data/sentencias";

/**
 * Vistas de demostración del portal para la landing de abogados.
 *
 * Regla: **contenido real de los seeds**, no maquetas inventadas. La sentencia
 * que se cita es del piloto del corpus (API del Poder Judicial) con su
 * expediente, órgano y magistrada verdaderos; la alerta sale del seed de
 * Gaceta y el lead del consultorio, del mismo que alimenta /abogados/leads.
 * Si el seed cambia, estas vistas cambian con él — no pueden mentir.
 *
 * Se reproducen como una grabación: al entrar en pantalla los pasos se revelan
 * en orden (pregunta → pensando → respuesta → fuente) y se rearman al salir.
 * Pero NO son video: el HTML trae el estado final completo y la animación solo
 * lo va destapando, así que el crawler lee todo y sin JS se ve entero.
 */

/** Marco de ventana: enseña que lo de dentro es producto, no ilustración. */
function Ventana({
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
      className={`overflow-hidden rounded-[16px] border border-borde bg-white shadow-[0_18px_50px_rgba(13,33,68,.13)] ${enVista ? "demo-anim" : ""}`}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: "var(--line)", background: "rgba(248,250,252,.9)" }}
      >
        <span className="flex gap-1.5" aria-hidden>
          {["#e5e9ef", "#e5e9ef", "#e5e9ef"].map((c, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: c }} />
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

/** Jus IA respondiendo: la pregunta, la respuesta y la sentencia que la sostiene. */
export function DemoJusIA() {
  const s = SENTENCIAS.find((x) => x.expediente === "CL-528-24") ?? SENTENCIAS[0]!;

  return (
    <Ventana etiqueta="Jus IA">
      <div className="demo-paso demo-paso-1 flex justify-end">
        <p className="max-w-[85%] rounded-[12px] bg-chip px-3.5 py-2 text-[13px] leading-[1.5] text-marino">
          ¿En cuánto tiempo prescribe el reclamo por despido injustificado?
        </p>
      </div>

      {/* Fila de "pensando": aparece tras la pregunta y se va cuando llega la
          respuesta. Ocupa 0 de alto para no empujar el resto al desaparecer. */}
      <div className="demo-pensando pointer-events-none mt-2 flex h-0 items-center gap-1.5 text-[11.5px] text-texto-4">
        Buscando en jurisprudencia y Gaceta
        <span className="h-1 w-1 rounded-full bg-celeste" />
        <span className="h-1 w-1 rounded-full bg-celeste" />
        <span className="h-1 w-1 rounded-full bg-celeste" />
      </div>

      <div className="demo-paso demo-paso-2 mt-3 flex gap-2.5">
        <span className="mt-0.5 shrink-0">
          <SimboloJusIA size={18} variante="claro" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] leading-[1.55] text-texto-2">
            Dos meses desde la terminación del contrato, según el{" "}
            <b className="text-marino">artículo 864 del Código del Trabajo</b>. Si la
            separación fue por culpa del patrono (despido indirecto), el plazo del artículo
            865 es de un mes.
          </p>

          <div
            className="demo-paso demo-paso-3 mt-3 rounded-[10px] border px-3 py-2.5"
            style={{ borderColor: "var(--line)", background: "rgba(248,250,252,.75)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-bold tracking-[1px] text-celeste uppercase">
                Fuente citada
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10px] font-bold text-exito">
                <Icono nombre="check" size={9} strokeWidth={2.6} />
                Verificable
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.45] font-semibold text-marino">
              {s.expediente} · {s.titulo}
            </p>
            <p className="mt-1 text-[11.5px] leading-[1.45] text-texto-4">
              {s.organo} · {s.fecha} · {s.ponente}
            </p>
          </div>
        </div>
      </div>

      <p
        className="demo-paso demo-paso-4 mt-3 text-center text-[11px]"
        style={{ color: "var(--muted)" }}
      >
        Sin fuente no responde · el criterio jurídico es del profesional
      </p>
    </Ventana>
  );
}

/** Alertas de Gaceta: lo que se publicó y por qué te toca. */
export function DemoGaceta() {
  const publicaciones = PUBLICACIONES.slice(0, 2);

  return (
    <Ventana etiqueta="Alertas de La Gaceta">
      <div className="flex flex-col gap-2.5">
        {publicaciones.map((p, i) => (
          <div
            key={p.id}
            className={`demo-paso demo-paso-${i + 1} rounded-[10px] border px-3.5 py-3`}
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-chip px-2.5 py-[2px] text-[10.5px] font-semibold text-celeste">
                {p.materia}
              </span>
              {i === 0 && (
                <span className="rounded-full bg-aviso px-2.5 py-[2px] text-[10.5px] font-bold text-aviso-texto">
                  Nuevo
                </span>
              )}
              <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>
                {/* El seed guarda "La Gaceta Nº ______ · 19 ago 2026": el número
                    va en blanco hasta cargar la Gaceta real. En la demo se
                    muestra solo la fecha, porque ese "______" se leería como
                    una pantalla sin terminar. */}
                {p.meta.split("·").at(-1)?.trim()}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.45] font-semibold text-marino">
              {p.titulo}
            </p>
            <p className="mt-1 text-[11.5px] leading-[1.5] text-texto-4">{p.afecta}</p>
          </div>
        ))}
      </div>
    </Ventana>
  );
}

/** Leads: la consulta ciudadana que llega a la bandeja del abogado. */
export function DemoLeads() {
  const lead = LEADS[0]!;

  return (
    <Ventana etiqueta="Leads del consultorio">
      <div
        className="demo-paso demo-paso-1 rounded-[10px] border px-3.5 py-3"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-chip px-2.5 py-[2px] text-[10.5px] font-semibold text-celeste">
            {lead.materia}
          </span>
          {lead.nuevo && (
            <span className="rounded-full bg-exito-bg px-2.5 py-[2px] text-[10.5px] font-bold text-exito">
              Nuevo
            </span>
          )}
          <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>
            {lead.ciudad} · {lead.cuando}
          </span>
        </div>
        <p className="mt-2 text-[12.5px] leading-[1.55] text-texto-2">“{lead.pregunta}”</p>
        <div className="demo-paso demo-paso-2 mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px]" style={{ color: "var(--muted)" }}>
            {lead.respuestas === 1
              ? "1 abogado ya respondió"
              : `${lead.respuestas} abogados ya respondieron`}
          </span>
          <span
            className="rounded-[8px] px-3 py-1.5 text-[11.5px] font-semibold text-white"
            style={{ background: "var(--turq)" }}
          >
            Responder
          </span>
        </div>
      </div>
      <p
        className="demo-paso demo-paso-3 mt-2.5 text-center text-[11px]"
        style={{ color: "var(--muted)" }}
      >
        Responder en público es lo que te pone delante de quien busca abogado
      </p>
    </Ventana>
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
