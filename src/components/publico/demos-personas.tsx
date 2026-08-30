"use client";

/**
 * Demostraciones de la landing ciudadana — el equivalente de las de abogados,
 * con la misma regla: **contenido real de los seeds**, nunca maquetas.
 *
 * Qué enseñan: lo que hay DETRÁS de la cuenta gratis. La landing muestra el
 * primer paso de cada guía y difumina el resto; estas ventanas enseñan la guía
 * entera con su checklist, la consulta ya respondida por una abogada colegiada
 * y el cálculo de prestaciones con su número. Es el mismo papel que cumplen
 * las demos del portal en la vía A — con la diferencia de que aquí entrar no
 * cuesta nada, y eso es justo el argumento.
 *
 * Si el seed cambia, estas vistas cambian con él: la guía es la del RTN
 * (verificada contra el SAR), la consulta sale del mismo `LEADS` que alimenta
 * la bandeja del abogado, y el cálculo lo hace `lib/prestaciones` — el mismo
 * módulo de la calculadora real, así que no puede dar otro número.
 */
import { Icono } from "@/components/brand/iconos";
import { Ventana } from "@/components/landing/demo-marco";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import { TRAMITES } from "@/data/tramites";
import { calcularPrestaciones } from "@/lib/prestaciones";
import { fmtLempiras } from "@/lib/utils";

/** Guía de trámite por dentro: los pasos con su checklist y la tasa real. */
export function DemoGuiaTramite() {
  const t = TRAMITES.find((x) => x.id === "abrir-rtn") ?? TRAMITES[0]!;
  const pasos = t.pasos.slice(0, 3);

  return (
    <Ventana etiqueta={t.nombre}>
      <div className="demo-paso demo-paso-1 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-chip px-2.5 py-[2px] text-[10.5px] font-semibold text-celeste">
          SAR
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2.5 py-[2px] text-[10px] font-bold text-exito">
          <Icono nombre="check" size={9} strokeWidth={2.6} />
          Verificado con la fuente oficial
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {pasos.map((p, i) => {
          // Los dos primeros van marcados: el checklist se guarda, y esa es
          // la diferencia entre leer una guía y estar haciéndola.
          const hecho = i < 2;
          return (
            <div
              key={p.titulo}
              className={`demo-paso demo-paso-${i + 1} caja-panel flex gap-2.5 rounded-[10px] border px-3 py-2.5`}
            >
              <span
                aria-hidden
                className="mt-px grid h-[17px] w-[17px] min-w-[17px] place-items-center rounded-[5px] border-[1.5px]"
                style={
                  hecho
                    ? { borderColor: "var(--color-celeste)", background: "var(--color-celeste)" }
                    : { borderColor: "var(--line)" }
                }
              >
                {hecho && (
                  <Icono nombre="check" size={10} strokeWidth={3} className="text-white" />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-[12.5px] leading-[1.4] font-semibold ${hecho ? "text-texto-4 line-through" : "text-marino"}`}
                >
                  {i + 1}. {p.titulo}
                </p>
                {!hecho && (
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-[1.5] text-texto-4">
                    {p.detalle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="demo-paso demo-paso-4 mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px]" style={{ color: "var(--muted)" }}>
          {t.pasos.length} pasos · {t.requisitos.length} requisitos
        </span>
        <span className="text-[11.5px] font-bold text-exito">Gratuito</span>
      </div>
    </Ventana>
  );
}

/** Consultorio: la pregunta de una persona y la respuesta de una colegiada. */
export function DemoConsultorio() {
  const lead = LEADS.find((l) => l.materia === "Familia") ?? LEADS[0]!;

  return (
    <Ventana etiqueta="Consultorio gratuito">
      <div className="demo-paso demo-paso-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-chip px-2.5 py-[2px] text-[10.5px] font-semibold text-celeste">
            {lead.materia}
          </span>
          <span className="text-[10.5px]" style={{ color: "var(--muted)" }}>
            {lead.ciudad} · {lead.cuando}
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-[1.55] text-texto-2">“{lead.pregunta}”</p>
      </div>

      {/* Mientras "llega" la respuesta. Alto 0 para no empujar nada al irse. */}
      <div className="demo-pensando pointer-events-none mt-2 flex h-0 items-center gap-1.5 text-[11.5px] text-texto-4">
        Un abogado está respondiendo
        <span className="h-1 w-1 rounded-full bg-celeste" />
        <span className="h-1 w-1 rounded-full bg-celeste" />
        <span className="h-1 w-1 rounded-full bg-celeste" />
      </div>

      <div className="demo-paso demo-paso-2 caja-panel mt-3 rounded-[10px] border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10.5px] font-bold text-white"
            style={{ background: "var(--color-celeste)" }}
          >
            {ABOGADA_DEMO.iniciales}
          </span>
          <div className="min-w-0">
            <p className="text-[12px] leading-[1.3] font-semibold text-marino">
              {ABOGADA_DEMO.nombre}
            </p>
            <p className="text-[10.5px] leading-[1.3] text-texto-4">
              {ABOGADA_DEMO.colegiacion} · {ABOGADA_DEMO.especialidades.join(" · ")}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[12.5px] leading-[1.55] text-texto-2">
          Puedes pedir la ejecución de la pensión ante el mismo juzgado que dictó la
          resolución. Lleva el acta o la sentencia y el detalle de los meses no pagados —
          el juez puede ordenar retención del salario.
        </p>
      </div>

      <p
        className="demo-paso demo-paso-3 mt-2.5 text-center text-[11px]"
        style={{ color: "var(--muted)" }}
      >
        Preguntar es gratis · orientación pública, no sustituye asesoría sobre tu caso
      </p>
    </Ventana>
  );
}

/**
 * Calculadora de prestaciones con un caso concreto. El número lo produce
 * `calcularPrestaciones`, el MISMO módulo de la calculadora real (§0.5): si
 * alguien cambia la fórmula, esta demo cambia con ella — no puede quedar
 * enseñando una cifra que el producto ya no da.
 */
const SALARIO_EJEMPLO = 15_000;
const ANIOS_EJEMPLO = 4;

export function DemoCalculadora() {
  const p = calcularPrestaciones(SALARIO_EJEMPLO, ANIOS_EJEMPLO);
  const filas = [
    { etiqueta: "Auxilio de cesantía", valor: p.cesantia },
    { etiqueta: "Preaviso", valor: p.preaviso },
    { etiqueta: "Vacaciones y aguinaldo proporcionales", valor: p.proporcionales },
  ];

  return (
    <Ventana etiqueta="Calculadora de prestaciones">
      <div className="demo-paso demo-paso-1 grid grid-cols-2 gap-2">
        <div className="caja-panel rounded-[10px] border px-3 py-2">
          <p className="text-[10.5px] text-texto-4">Salario mensual</p>
          <p className="mt-0.5 text-[14px] font-bold text-marino">
            {fmtLempiras(SALARIO_EJEMPLO)}
          </p>
        </div>
        <div className="caja-panel rounded-[10px] border px-3 py-2">
          <p className="text-[10.5px] text-texto-4">Años trabajados</p>
          <p className="mt-0.5 text-[14px] font-bold text-marino">{ANIOS_EJEMPLO}</p>
        </div>
      </div>

      <div className="demo-paso demo-paso-2 mt-3 flex flex-col gap-1.5">
        {filas.map((f) => (
          <div key={f.etiqueta} className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] leading-[1.4] text-texto-4">{f.etiqueta}</span>
            <span className="shrink-0 text-[12.5px] font-semibold text-marino">
              {fmtLempiras(f.valor)}
            </span>
          </div>
        ))}
      </div>

      <div
        className="demo-paso demo-paso-3 mt-3 flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5"
        style={{ background: "var(--color-chip)" }}
      >
        <span className="text-[12px] font-semibold text-marino">Te corresponde</span>
        <span className="font-display text-[19px] leading-none font-bold text-celeste">
          {fmtLempiras(p.total)}
        </span>
      </div>

      <p
        className="demo-paso demo-paso-4 mt-2.5 text-center text-[11px]"
        style={{ color: "var(--muted)" }}
      >
        Cálculo orientativo · un abogado laboral revisa tu caso si quieres reclamar
      </p>
    </Ventana>
  );
}
