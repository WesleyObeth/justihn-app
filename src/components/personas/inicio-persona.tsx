"use client";

import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { TRAMITES } from "@/data/tramites";
import { PERSONA_DEMO } from "@/data/persona";
import { usePortal } from "@/store/portal";
import { useSaludoPorHora } from "@/hooks/use-saludo";

/** Inicio del portal ciudadano: sus consultas, sus trámites y las puertas. */
export function InicioPersona() {
  const franja = useSaludoPorHora();
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const pasosTramite = usePortal((s) => s.pasosTramite);

  const enProgreso = TRAMITES.filter((t) => (pasosTramite[t.id] ?? []).length > 0);
  const respondidas = preguntas.filter((p) => respondidos[p.id]).length;

  return (
    <div className="max-w-[1080px]" style={{ animation: "fadeUp .3s ease" }}>
      <h1 className="font-display text-[24px] font-bold">
        {franja ? `${franja}, ` : "Hola, "}
        {PERSONA_DEMO.nombre.split(" ")[0]}
      </h1>
      <p className="mt-1 text-[13px] text-texto-3">
        Tu cuenta gratuita: guías con avance guardado, consultas a abogados y calculadoras.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          {/* Mis consultas */}
          <div className="rounded-2xl border border-borde bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Mis consultas
              </h2>
              <Link href="/persona/consultas" className="text-[12.5px]">
                Ver todas →
              </Link>
            </div>
            {preguntas.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2.5">
                {preguntas.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    href="/persona/consultas"
                    className="rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-chip px-2.5 py-[2px] text-[11px] font-medium text-celeste">
                        {p.materia}
                      </span>
                      {respondidos[p.id] ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-exito">
                          <Icono nombre="check" size={10} strokeWidth={2.6} />
                          Respondida
                        </span>
                      ) : (
                        <span className="text-[11px] text-texto-4">Esperando respuesta…</span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.55] text-texto-2">
                      {p.pregunta}
                    </p>
                  </Link>
                ))}
                {respondidas > 0 && (
                  <p className="text-[12px] text-exito">
                    ✓ {respondidas} {respondidas === 1 ? "consulta respondida" : "consultas respondidas"} por abogados
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-lienzo px-4 py-5 text-center">
                <p className="text-[13px] text-texto-3">
                  Aún no has preguntado nada — es gratis y un abogado colegiado te orienta.
                </p>
                <Link
                  href="/persona/consultas"
                  className="mt-3 inline-block rounded-lg bg-celeste px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-cruce"
                >
                  Hacer mi primera consulta
                </Link>
              </div>
            )}
          </div>

          {/* Trámites en progreso */}
          <div className="rounded-2xl border border-borde bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Mis trámites
              </h2>
              <Link href="/persona/tramites" className="text-[12.5px]">
                Ver todos →
              </Link>
            </div>
            {enProgreso.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2.5">
                {enProgreso.slice(0, 3).map((t) => {
                  const hechos = (pasosTramite[t.id] ?? []).length;
                  return (
                    <Link
                      key={t.id}
                      href={`/persona/tramites/${t.id}`}
                      className="rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13.5px] font-semibold">{t.nombre}</span>
                        <span className="text-[11.5px] whitespace-nowrap text-celeste">
                          {hechos}/{t.pasos.length} pasos
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded bg-sutil">
                        <div
                          className="h-full rounded bg-celeste transition-[width]"
                          style={{ width: `${(hechos / t.pasos.length) * 100}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-texto-3">
                Abre una guía y marca tu avance — aquí verás tus trámites en progreso.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Acceso
            href="/persona/tramites"
            icono="pasos"
            titulo="Guías de trámites"
            desc={`${TRAMITES.length} trámites paso a paso con tu avance guardado`}
          />
          <Acceso
            href="/persona/calculadora"
            icono="calc"
            titulo="¿Te despidieron?"
            desc="Calcula tus prestaciones según el Código del Trabajo"
          />
          <Acceso
            href="/persona/abogados"
            icono="perfil"
            titulo="Encuentra abogado"
            desc="Por materia y ciudad, con perfiles validados"
          />
          <div className="rounded-2xl border border-borde bg-white p-5">
            <div className="text-[11px] font-semibold tracking-[1px] text-texto-4 uppercase">
              Tu plan
            </div>
            <div className="font-display mt-1 text-[18px] font-bold">Gratis</div>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
              Guías, consultorio y calculadoras sin costo. El plan de pago está en definición.
            </p>
            <Link href="/persona/plan" className="mt-2 inline-block text-[12.5px]">
              Ver mi plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Acceso({
  href,
  icono,
  titulo,
  desc,
}: {
  href: string;
  icono: NombreIcono;
  titulo: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3.5 rounded-2xl border border-borde bg-white p-5 text-marino hover:border-celeste"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-chip text-celeste">
        <Icono nombre={icono} size={17} />
      </span>
      <span>
        <span className="font-display block text-[15px] font-bold">{titulo}</span>
        <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-texto-3">{desc}</span>
      </span>
    </Link>
  );
}
