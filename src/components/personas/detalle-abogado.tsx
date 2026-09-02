"use client";

/**
 * Perfil de un abogado, con el formulario que le escribe.
 *
 * El mensaje se envía DENTRO de Justihn a propósito (§4.5): sacar el contacto
 * a WhatsApp en el primer toque dejaría al abogado sin poder demostrar cuántos
 * contactos le trajo la plataforma — que es lo que sostiene que pague. Por eso
 * el botón de la card dice "Consultar con X" y aterriza aquí.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { DIRECTORIO, filtrarDirectorio, type AbogadoDirectorio } from "@/data/directorio";
import { getInstitucion, guiasDeMateria } from "@/data/tramites";
import { usePortal } from "@/store/portal";
import type { Materia } from "@/types/dominio";

export function DetalleAbogado({ id }: { id: string }) {
  const abogado = DIRECTORIO.find((a) => a.id === id);
  // El directorio es un seed, no estado del navegador: aquí no hace falta
  // esperar la hidratación como en el detalle de una consulta.
  if (!abogado) notFound();
  return <Perfil abogado={abogado} />;
}

function Perfil({ abogado: a }: { abogado: AbogadoDirectorio }) {
  const guias = a.materias.flatMap((m) => guiasDeMateria(m)).slice(0, 3);
  const otros = filtrarDirectorio({ materia: a.materias[0] })
    .filter((x) => x.id !== a.id)
    .slice(0, 3);

  return (
    <div className="max-w-[1180px]">
      <Link
        href="/personas/directorio"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-texto-3 hover:text-celeste"
      >
        <Icono nombre="atras" size={13} />
        Encuentra abogado
      </Link>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-6">
            <div className="flex flex-wrap items-start gap-4">
              <span
                className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-full text-[17px] font-semibold text-white"
                style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
              >
                {a.iniciales}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-[22px] leading-[1.25] font-bold">{a.nombre}</h1>
                <p className="mt-0.5 text-[13px] text-texto-3">
                  {a.ciudad} · {a.anios} años de ejercicio · suele responder {a.responde}
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {a.materias.map((m) => (
                <Link
                  key={m}
                  href={`/personas/directorio?materia=${encodeURIComponent(m)}`}
                  className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste hover:bg-chip-borde"
                >
                  {m}
                </Link>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {a.verificado ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2.5 py-[3px] text-[11px] font-bold text-exito">
                  <Icono nombre="check" size={10} strokeWidth={2.8} />
                  Colegiación validada
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
                  style={{ background: "var(--color-aviso)", color: "var(--color-aviso-texto)" }}
                >
                  Validación en trámite
                </span>
              )}
              {a.notario && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
                  style={{ background: "var(--color-aviso)", color: "var(--color-aviso-texto)" }}
                >
                  <Icono nombre="documento" size={10} />
                  Notario · exequátur {a.notario.exequatur} (declarado)
                </span>
              )}
            </div>

            <p className="mt-4 text-[13.5px] leading-[1.65] text-texto-2">{a.bio}</p>

            <blockquote className="mt-4 rounded-xl border-l-[3px] border-celeste bg-chip/60 py-3 pr-4 pl-4 text-[13.5px] leading-[1.6] text-marino">
              “{a.cita}”
              <footer className="mt-1.5 text-[11.5px] text-texto-3">
                De una respuesta suya en el consultorio
              </footer>
            </blockquote>

            {a.notario && !a.notario.verificado && (
              /* Regla del seed: el PJ no publica padrón notarial, así que el
                 exequátur es DECLARADO. Decirlo aquí, no solo en un test. */
              <p className="mt-3 text-[11.5px] leading-[1.55] text-texto-4">
                La habilitación notarial es un dato declarado por el profesional: el Poder
                Judicial no publica un padrón consultable, así que Justihn no la ha verificado.
                Pídele su carné del Colegio y el de la Contraloría del Notariado.
              </p>
            )}
          </div>

          <Escribirle abogado={a} />
        </div>

        <aside className="flex flex-col gap-4">
          {guias.length > 0 && (
            <div className="rounded-2xl border border-borde bg-white p-5">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Guías de sus materias
              </h2>
              <p className="mt-1 text-[12px] leading-[1.5] text-texto-3">
                Léelas antes de escribirle: llegarás con la pregunta más clara.
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
                  </Link>
                ))}
              </div>
            </div>
          )}

          {otros.length > 0 && (
            <div className="rounded-2xl border border-borde bg-white p-5">
              <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                Otros de {a.materias[0]!.toLowerCase()}
              </h2>
              <p className="mt-1 text-[12px] leading-[1.5] text-texto-3">
                Compara antes de decidir — no tienes que quedarte con el primero.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {otros.map((o) => (
                  <Link
                    key={o.id}
                    href={`/personas/directorio/${o.id}`}
                    className="flex items-center gap-2.5 rounded-xl border border-borde px-3.5 py-2.5 text-marino hover:border-celeste"
                  >
                    <span
                      className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                      style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
                    >
                      {o.iniciales}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-semibold">{o.nombre}</span>
                      <span className="block text-[11px] text-texto-4">
                        {o.ciudad} · {o.anios} años
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/**
 * El formulario que le escribe.
 *
 * Pide la materia además del texto porque el abogado necesita saber de qué le
 * hablan antes de abrirlo — y porque su respuesta depende de eso. Arranca en la
 * primera materia del abogado, que es el caso más probable.
 */
function Escribirle({ abogado: a }: { abogado: AbogadoDirectorio }) {
  const escribirAAbogado = usePortal((s) => s.escribirAAbogado);
  const mensajesAbogado = usePortal((s) => s.mensajesAbogado);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [materia, setMateria] = useState<Materia>(a.materias[0]!);
  const [texto, setTexto] = useState("");

  const enviados = mensajesAbogado[a.id] ?? [];
  const primerNombre = a.nombre.replace(/^Abg\.\s*/, "").split(" ")[0];
  const listo = texto.trim().length >= 20;

  const enviar = () => {
    if (!listo) return;
    escribirAAbogado(a.id, materia, texto.trim());
    setTexto("");
    mostrarToast(`Tu mensaje salió para ${a.nombre}`);
  };

  return (
    <div className="rounded-2xl border border-borde bg-white p-6">
      <h2 className="font-display text-[17px] font-bold">Escríbele a {primerNombre}</h2>
      <p className="mt-1 text-[13px] leading-[1.6] text-texto-3">
        Cuéntale tu caso en pocas líneas. A diferencia del consultorio, esto es privado: solo lo
        lee {primerNombre}.
      </p>

      {enviados.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-2.5">
          {enviados.map((m, i) => (
            <div
              key={`${m.creadoEn}-${i}`}
              className="rounded-xl border-l-[3px] border-exito bg-exito-bg/40 px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                <span className="rounded-full bg-white px-2 py-[2px] font-medium text-celeste">
                  {m.materia}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-exito">
                  <Icono nombre="check" size={10} strokeWidth={2.6} />
                  Enviado
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-texto-2">{m.texto}</p>
            </div>
          ))}
          <p className="text-[11.5px] leading-[1.55] text-texto-4">
            {primerNombre} suele responder {a.responde}. Te avisamos aquí cuando conteste.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          ¿De qué es tu caso?
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value as Materia)}
            className="h-10 w-full rounded-lg border border-borde bg-white px-3 text-[13px] text-marino outline-none focus:border-celeste sm:max-w-[260px]"
          >
            {a.materias.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          Tu mensaje
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            maxLength={1200}
            placeholder={`Ej. Compré un producto vencido en un supermercado y no me lo quieren cambiar. Ya dejé constancia en el libro de quejas. ¿Puede ayudarme a reclamar?`}
            className="w-full resize-y rounded-lg border border-borde bg-white px-3.5 py-2.5 text-[13.5px] leading-[1.6] text-marino outline-none focus:border-celeste"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={enviar}
            disabled={!listo}
            className="cursor-pointer rounded-lg bg-celeste px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-cruce disabled:cursor-not-allowed disabled:opacity-45"
          >
            Enviar mensaje
          </button>
          <span className="text-[11.5px] text-texto-4">
            {texto.trim().length < 20
              ? "Escribe al menos un par de líneas para que pueda orientarte"
              : `${texto.trim().length} caracteres`}
          </span>
        </div>

        {/* No prometemos lo que no hay: hoy el mensaje se guarda en tu
            navegador. TODO(auth): con Supabase le llega al abogado y él
            responde desde su portal. */}
        <p className="text-[11.5px] leading-[1.55] text-texto-4">
          Demo de validación: por ahora el mensaje se guarda aquí, en tu navegador. Cuando
          Justihn abra las cuentas de verdad, le llegará a {primerNombre} y su respuesta
          aparecerá en esta misma pantalla. Nunca escribas datos que no quieras compartir.
        </p>
      </div>
    </div>
  );
}
