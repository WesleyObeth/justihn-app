"use client";

/**
 * Mi perfil (ciudadano) — adapta la estructura del perfil del abogado
 * (identidad + acciones a la izquierda, plan y datos a la derecha) pero con
 * una diferencia que manda sobre todo lo demás:
 *
 * **el perfil del abogado es PÚBLICO y el del ciudadano no.** El abogado
 * gestiona una vitrina: sube su carné, elige qué materias se ven, mide vistas
 * del directorio. La persona no aparece en ninguna parte, y saberlo la
 * tranquiliza — por eso el bloque de privacidad no es letra pequeña al pie,
 * sino una card con el mismo peso que las demás.
 *
 * Sus métricas, además, ENLAZAN: en el abogado son indicadores de su negocio;
 * aquí son la puerta a lo que la persona dejó a medias.
 */
import { mesAnio } from "@/lib/tiempo";
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { PERSONA_DEMO } from "@/data/persona";
import { TRAMITES } from "@/data/tramites";
import { usePortal } from "@/store/portal";

export function PerfilPersona() {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntas = usePortal((s) => s.preguntasPublico);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const pasosTramite = usePortal((s) => s.pasosTramite);
  const vigilados = usePortal((s) => s.nombresVigiladosPersona);
  const mensajes = usePortal((s) => s.mensajesAbogado);

  const respondidas = preguntas.filter((p) => respondidos[p.id]?.length).length;
  const enCurso = TRAMITES.filter((t) => {
    const h = (pasosTramite[t.id] ?? []).length;
    return h > 0 && h < t.pasos.length;
  }).length;
  const completos = TRAMITES.filter(
    (t) => (pasosTramite[t.id] ?? []).length === t.pasos.length,
  ).length;
  const escritos = Object.values(mensajes).reduce((n, m) => n + m.length, 0);

  return (
    <div className="max-w-[1180px]">
      <h1 className="font-display text-[24px] font-bold">Mi perfil</h1>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-6">
            <div className="flex flex-wrap items-start gap-4">
              <span className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-full bg-celeste text-[18px] font-semibold text-white">
                {PERSONA_DEMO.iniciales}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[20px] leading-tight font-bold">
                  {PERSONA_DEMO.nombre}
                </h2>
                <p className="mt-0.5 text-[12.5px] text-texto-3">
                  {PERSONA_DEMO.ciudad} · miembro desde {mesAnio(PERSONA_DEMO.creadoEn)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => mostrarToast("Editar tus datos llega con las cuentas de la Fase 2")}
                className="cursor-pointer rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[13px] font-medium text-marino hover:border-celeste"
              >
                Editar mis datos
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-borde pt-4">
              <Campo icono="correo" rotulo="Correo">
                {PERSONA_DEMO.email}
              </Campo>
              <Campo icono="telefono" rotulo="WhatsApp">
                {PERSONA_DEMO.whatsapp}
              </Campo>
            </div>

            <p className="mt-3.5 text-[11.5px] leading-[1.55] text-texto-4">
              Son tus datos de contacto para que te avisemos. No se muestran a nadie: cuando
              preguntas en el consultorio, tu consulta se publica{" "}
              <b className="text-texto-3">sin tu nombre</b>.
            </p>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              Mi actividad
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Metrica
                href="/personas/consultas"
                valor={preguntas.length}
                etiqueta="consultas hechas"
              />
              <Metrica
                href="/personas/consultas"
                valor={respondidas}
                etiqueta="respondidas"
                acento={respondidas > 0}
              />
              <Metrica href="/personas/tramites" valor={enCurso} etiqueta="trámites en curso" />
              <Metrica
                href="/personas/tramites"
                valor={completos}
                etiqueta="trámites terminados"
                acento={completos > 0}
              />
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Metrica
                href="/personas/monitoreo"
                valor={vigilados.length}
                etiqueta="nombres vigilados"
              />
              <Metrica
                href="/personas/directorio"
                valor={escritos}
                etiqueta="abogados contactados"
              />
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              Tu plan
            </h2>
            <div className="font-display mt-1.5 text-[20px] font-bold">Gratis</div>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-texto-3">
              Sin cuota y sin tarjeta. El plan de pago está en definición.
            </p>
            <Link
              href="/personas/plan"
              className="mt-3 inline-block rounded-lg bg-celeste px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-cruce hover:text-white"
            >
              Ver qué incluye
            </Link>
          </div>

          {/* Con el mismo peso que las demás, no como letra pequeña: es la
              diferencia con el perfil del abogado, que sí es una vitrina. */}
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="font-display text-[15px] font-bold">Tu perfil no es público</h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-[12.5px] leading-[1.6] text-texto-3">
              {[
                "No apareces en ningún directorio ni buscador de Justihn.",
                "Tus consultas del consultorio se publican sin tu nombre.",
                "Lo que consultas en el Informe Verifica no sale de tu navegador.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-exito">
                    <Icono nombre="check" size={12} strokeWidth={2.6} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="font-display text-[15px] font-bold">Tus datos son tuyos</h2>
            <p className="mt-1.5 text-[12.5px] leading-[1.6] text-texto-3">
              Puedes descargarlos o pedir su supresión cuando quieras (habeas data, art. 182 de
              la Constitución). Respondemos en 72 horas hábiles.
            </p>
            <Link
              href="/personas/configuracion"
              className="mt-3 inline-block rounded-lg border border-borde bg-lienzo px-4 py-2.5 text-[12.5px] font-medium text-marino hover:border-celeste"
            >
              Privacidad y datos
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Campo({
  icono,
  rotulo,
  children,
}: {
  icono: NombreIcono;
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lienzo text-texto-4">
        <Icono nombre={icono} size={14} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] text-texto-4">{rotulo}</span>
        <span className="block truncate text-[13.5px]">{children}</span>
      </span>
    </div>
  );
}

/** Enlazan: aquí una métrica es la puerta a lo que quedó a medias. */
function Metrica({
  href,
  valor,
  etiqueta,
  acento,
}: {
  href: string;
  valor: number;
  etiqueta: string;
  acento?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-borde px-4 py-3 text-marino hover:border-celeste"
    >
      <div
        className={`font-display text-[22px] leading-none font-bold ${acento && valor > 0 ? "text-exito" : ""}`}
      >
        {valor}
      </div>
      <div className="mt-1 text-[11.5px] leading-[1.35] text-texto-3">{etiqueta}</div>
    </Link>
  );
}
