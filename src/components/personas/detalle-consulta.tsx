"use client";

/**
 * Detalle de una consulta.
 *
 * Existe por algo más que "ver más grande": la lista dejaba "Esperando a los
 * abogados…" como callejón sin salida, justo en el momento de más ansiedad.
 * Aquí esa espera tiene contenido — las guías verificadas de su materia y los
 * abogados de esa rama— así que la persona sale con algo aunque nadie haya
 * contestado todavía.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import { buscarAbogados } from "@/data/directorio";
import { getInstitucion, guiasDeMateria } from "@/data/tramites";
import { usePortal, useStoreHidratado } from "@/store/portal";

export function DetalleConsulta({ id }: { id: string }) {
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const hidratado = useStoreHidratado();

  const lead = preguntas.find((p) => p.id === id);

  // Antes de la rehidratación el store está vacío: enseñar "no existe" aquí
  // sería un 404 falso a quien recargue en esta pantalla (§0.6).
  if (!hidratado) return <Cargando />;
  if (!lead) notFound();

  const respuesta = respondidos[lead.id];
  const guias = guiasDeMateria(lead.materia).slice(0, 3);
  const abogados = buscarAbogados(lead.materia).slice(0, 2);

  return (
    <div className="max-w-[1180px]">
      <Link
        href="/personas/consultas"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-texto-3 hover:text-celeste"
      >
        <Icono nombre="atras" size={13} />
        Mis consultas
      </Link>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_312px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste">
                {lead.materia}
              </span>
              <span className="text-[12px] text-texto-4">
                {lead.ciudad} · {lead.cuando}
              </span>
              {respuesta ? (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-exito-bg px-2.5 py-[3px] text-[10.5px] font-bold text-exito">
                  <Icono nombre="check" size={9} strokeWidth={2.6} />
                  Respondida
                </span>
              ) : (
                <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-texto-4">
                  <Icono nombre="reloj" size={11} />
                  Esperando
                </span>
              )}
            </div>

            <h1 className="font-display mt-3 text-[19px] leading-[1.4] font-bold">
              {lead.pregunta}
            </h1>

            <p className="mt-3 text-[12px] leading-[1.6] text-texto-4">
              Tu consulta es pública y anónima: los abogados colegiados de {lead.materia.toLowerCase()}{" "}
              la ven sin saber quién eres.
            </p>

            {respuesta ? (
              <div className="mt-4 rounded-xl border-l-[3px] border-exito bg-exito-bg/40 px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-display grid h-9 w-9 shrink-0 place-items-center rounded-full bg-celeste text-[12px] font-semibold text-white">
                    {ABOGADA_DEMO.iniciales}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold">
                      {ABOGADA_DEMO.nombre}
                    </span>
                    <span className="block text-[11.5px] text-texto-4">
                      {ABOGADA_DEMO.colegiacion}
                    </span>
                  </span>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.65] whitespace-pre-line text-texto-2">
                  {respuesta}
                </p>
                <p className="mt-3 border-t border-exito/25 pt-3 text-[11.5px] leading-[1.55] text-texto-4">
                  Es orientación general sobre lo que preguntaste, no asesoría sobre tu caso: para
                  eso hace falta ver tus documentos.
                </p>
              </div>
            ) : (
              <QueSigue materia={lead.materia} />
            )}
          </div>

          <YaRespondidas materia={lead.materia} />
        </div>

        <aside className="flex flex-col gap-4">
          {guias.length > 0 && (
            <div className="rounded-2xl border border-borde bg-white p-5">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Guías de {lead.materia.toLowerCase()}
              </h2>
              <p className="mt-1 text-[12px] leading-[1.5] text-texto-3">
                Verificadas con su fuente oficial — puedes leerlas ahora.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {guias.map((g) => (
                  <Link
                    key={g.id}
                    href={`/personas/tramites/${g.id}`}
                    className="rounded-xl border border-borde px-3.5 py-3 text-marino hover:border-celeste"
                  >
                    <div className="text-[11px] font-bold tracking-[.6px] text-celeste uppercase">
                      {getInstitucion(g.institucionId)!.sigla}
                    </div>
                    <div className="mt-0.5 text-[13px] leading-[1.35] font-semibold">
                      {g.nombre}
                    </div>
                    <div className="mt-1 text-[11.5px] text-texto-4">
                      {g.pasos.length} pasos · {g.tasaCorta}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {abogados.length > 0 && (
            <div className="rounded-2xl border border-borde bg-white p-5">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Abogados de {lead.materia.toLowerCase()}
              </h2>
              <p className="mt-1 text-[12px] leading-[1.5] text-texto-3">
                Si quieres que alguien lleve tu caso, no solo que te oriente.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {abogados.map((a) => (
                  <div key={a.id} className="rounded-xl border border-borde px-3.5 py-3">
                    <div className="text-[13px] font-semibold">{a.nombre}</div>
                    <div className="text-[11.5px] text-texto-4">
                      {a.ciudad} · {a.anios} años
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={`/personas/directorio?materia=${encodeURIComponent(lead.materia)}`}
                className="mt-3 inline-block text-[12.5px]"
              >
                Ver el directorio →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/**
 * Consultas de la MISMA materia que ya tienen respuesta.
 *
 * Es lo más útil que se le puede dar a alguien esperando: puede que su duda ya
 * esté contestada ahí. Salen del seed del consultorio (`respuestaDemo`), las
 * mismas que ve el abogado — no es un "relacionadas" inventado por similitud
 * de texto, es el filtro por materia, que sí se puede sostener.
 */
function YaRespondidas({ materia }: { materia: string }) {
  const ejemplos = LEADS.filter((l) => l.respuestaDemo && l.materia === materia).slice(0, 2);
  if (ejemplos.length === 0) return null;

  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <h2 className="font-display text-[15px] font-bold">
        Otras consultas de {materia.toLowerCase()} ya respondidas
      </h2>
      <p className="mt-1 text-[12.5px] text-texto-3">
        Puede que tu duda ya esté contestada aquí.
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {ejemplos.map((l) => (
          <div key={l.id} className="rounded-xl border border-borde px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] text-texto-4">{l.ciudad}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-exito">
                <Icono nombre="check" size={10} strokeWidth={2.6} />
                Respondida
              </span>
            </div>
            <p className="mt-1.5 text-[13.5px] leading-[1.55]">“{l.pregunta}”</p>
            <div className="mt-2.5 border-t border-borde pt-2.5">
              <div className="text-[11.5px] font-semibold text-marino">
                {ABOGADA_DEMO.nombre} · {ABOGADA_DEMO.colegiacion}
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.6] text-texto-3">{l.respuestaDemo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** La espera con contenido: qué pasa ahora y qué puede hacer entretanto. */
function QueSigue({ materia }: { materia: string }) {
  return (
    <div className="mt-4 rounded-xl bg-lienzo px-4 py-4">
      <div className="text-[13.5px] font-semibold">¿Y ahora qué?</div>
      <ol className="mt-2.5 flex flex-col gap-2">
        {[
          `Tu pregunta ya está publicada: los abogados de ${materia.toLowerCase()} la ven en su portal.`,
          "Cuando alguno responda, te avisamos y la respuesta aparece aquí mismo.",
          "Mientras tanto, las guías de tu materia están a la derecha — puede que resuelvan tu duda antes.",
        ].map((t, i) => (
          <li key={t} className="flex items-start gap-2.5 text-[12.5px] leading-[1.55] text-texto-2">
            <span className="grid h-[19px] w-[19px] min-w-[19px] place-items-center rounded-full bg-chip text-[10.5px] font-bold text-celeste">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Mientras el store se rehidrata. No dice "no existe": todavía no se sabe. */
function Cargando() {
  return (
    <div className="max-w-[720px]">
      <div className="h-4 w-32 animate-pulse rounded bg-sutil" />
      <div className="mt-4 rounded-2xl border border-borde bg-white p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-sutil" />
        <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-sutil" />
        <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-sutil" />
      </div>
    </div>
  );
}
