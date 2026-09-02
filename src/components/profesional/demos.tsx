"use client";

import { fechaTexto } from "@/lib/tiempo";
import { Cuando } from "@/components/ui/cuando";
import { Icono } from "@/components/brand/iconos";
import { SeccionDemo, Ventana } from "@/components/landing/demo-marco";
import { SimboloJusIA } from "@/components/brand/logos";
import { LEADS, respuestasDe } from "@/data/catalogo";
import { PUBLICACIONES, etiquetaPublicacion } from "@/data/gaceta";
import { SENTENCIAS } from "@/data/sentencias";

// La landing de abogados sigue importando `SeccionDemo` desde aquí.
export { SeccionDemo };

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

          <div className="caja-panel demo-paso demo-paso-3 mt-3 rounded-[10px] border px-3 py-2.5">
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

/**
 * Alertas de Gaceta: lo que se publicó y por qué te toca. Tres para que la
 * ventana quede a la altura de las otras dos demos y para que se vea que la
 * bandeja llega filtrada por materia, no con una alerta suelta.
 */
export function DemoGaceta() {
  const publicaciones = PUBLICACIONES.slice(0, 3);

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
                {/* Solo la fecha: el número de Gaceta es `null` en el seed hasta
                    cargar la Gaceta real, y «La Gaceta · fecha» aquí sería ruido. */}
                {fechaTexto(p.fechaIso)}
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

/**
 * Leads: las consultas ciudadanas que llegan a la bandeja del abogado.
 *
 * Van DOS y no una por dos razones: la ventana queda a la altura de las otras
 * dos demos (con una sola se veía media sección vacía al lado del copy), y
 * son el argumento de la sección — la segunda no tiene ninguna respuesta
 * todavía, que es literalmente "un cliente esperando".
 */
export function DemoLeads() {
  const leads = LEADS.slice(0, 2);

  return (
    <Ventana etiqueta="Leads del consultorio">
      <div className="flex flex-col gap-2.5">
        {leads.map((lead, i) => (
          <div
            key={lead.id}
            className={`demo-paso demo-paso-${i + 1} rounded-[10px] border px-3.5 py-3`}
            style={{ borderColor: "var(--line)" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-chip px-2.5 py-[2px] text-[10.5px] font-semibold text-celeste">
                {lead.materia}
              </span>
              {i === 0 && (
                <span className="rounded-full bg-exito-bg px-2.5 py-[2px] text-[10.5px] font-bold text-exito">
                  Nuevo
                </span>
              )}
              <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>
                {lead.ciudad} · <Cuando iso={lead.creadoEn} />
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-texto-2">
              “{lead.pregunta}”
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {respuestasDe(lead.id, {}).length === 0
                  ? "Nadie ha respondido todavía"
                  : respuestasDe(lead.id, {}).length === 1
                    ? "1 abogado ya respondió"
                    : `${respuestasDe(lead.id, {}).length} abogados ya respondieron`}
              </span>
              <span
                className="rounded-[8px] px-3 py-1.5 text-[11.5px] font-semibold text-white"
                style={{ background: "var(--turq)" }}
              >
                Responder
              </span>
            </div>
          </div>
        ))}
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
