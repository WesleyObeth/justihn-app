"use client";

/**
 * "Mi nombre" — el monitoreo visto desde el ciudadano.
 *
 * Es el mismo motor del abogado (`buscarApariciones` sobre el texto oficial de
 * las sentencias del piloto) con dos diferencias que importan:
 *  1. Solo vigila nombres PROPIOS. En la vía B no hay clientes ni contrapartes,
 *     y ofrecer vigilar a terceros aquí convertiría la función en acoso — la
 *     verificación de otra persona vive en Informe Verifica, con sus reglas.
 *  2. Se vende como enterarse, no como estar limpio: "sin apariciones" NO es un
 *     certificado de antecedentes, y la UI lo dice.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { buscarApariciones } from "@/data/monitoreo";
import { PERSONA_DEMO } from "@/data/persona";
import { usePortal } from "@/store/portal";
import type { NombreVigilado } from "@/types/dominio";

export function MonitoreoPersona() {
  const vigilados = usePortal((s) => s.nombresVigiladosPersona);

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[24px] font-bold">Mi nombre</h1>
      <p className="mt-1 max-w-[640px] text-[13px] leading-[1.6] text-texto-3">
        Te avisamos si tu nombre aparece en algo que el Estado publique — sentencias del Poder
        Judicial y La Gaceta. Sirve para enterarte a tiempo, no para demostrar que estás limpio.
      </p>

      <FormularioVigilar />

      <div className="mt-4 flex flex-col gap-3.5">
        {vigilados.map((v) => (
          <CardVigilado key={v.id} vigilado={v} />
        ))}
        {vigilados.length === 0 && (
          <div className="rounded-2xl border border-borde bg-white px-6 py-9 text-center text-[13.5px] text-texto-3">
            No estás vigilando ningún nombre. Agrega el tuyo arriba.
          </div>
        )}
      </div>

      <QueNoEs />
    </div>
  );
}

function FormularioVigilar() {
  const vigilar = usePortal((s) => s.vigilarNombrePersona);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [nombre, setNombre] = useState("");

  const enviar = () => {
    const limpio = nombre.trim();
    if (limpio.length < 4) return;
    vigilar(limpio);
    setNombre("");
    mostrarToast(`Vigilando "${limpio}" — te avisamos si aparece`);
  };

  return (
    <div className="mt-5 rounded-2xl border border-borde bg-white p-5">
      <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
        Nombre completo, como aparece en tu identidad
        <div className="flex flex-wrap gap-2.5">
          <input
            value={nombre}
            maxLength={120}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enviar();
            }}
            placeholder={`Ej. ${PERSONA_DEMO.nombre}`}
            className="h-[42px] min-w-[min(280px,100%)] flex-1 rounded-lg border border-borde px-3 text-sm text-marino outline-none focus:border-celeste"
          />
          <button
            type="button"
            onClick={enviar}
            disabled={nombre.trim().length < 4}
            className="h-[42px] cursor-pointer rounded-lg bg-celeste px-4 text-[13px] font-semibold text-white hover:bg-cruce disabled:cursor-not-allowed disabled:opacity-45"
          >
            Vigilar
          </button>
        </div>
      </label>
      <p className="mt-2 text-[11.5px] leading-[1.55] text-texto-4">
        Vigila el tuyo o el de tu familia. Para revisar a alguien con quien vas a hacer un
        negocio, usa el <Link href="/personas/verifica">Informe Verifica</Link>.
      </p>
    </div>
  );
}

function CardVigilado({ vigilado }: { vigilado: NombreVigilado }) {
  const dejarDeVigilar = usePortal((s) => s.dejarDeVigilarPersona);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const apariciones = buscarApariciones(vigilado.nombre);

  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[15px] font-semibold">{vigilado.nombre}</span>
        <span className="flex-1" />
        <span className="text-[12px] whitespace-nowrap text-texto-4">
          {apariciones.length} {apariciones.length === 1 ? "aparición" : "apariciones"} en lo
          publicado
        </span>
        <button
          type="button"
          onClick={() => {
            dejarDeVigilar(vigilado.id);
            mostrarToast(`"${vigilado.nombre}" ya no está en vigilancia`);
          }}
          aria-label={`Dejar de vigilar a ${vigilado.nombre}`}
          className="grid h-6 w-6 cursor-pointer place-items-center rounded text-texto-4 hover:text-urgente"
        >
          <Icono nombre="cerrar" size={14} />
        </button>
      </div>

      {apariciones.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2.5">
          {apariciones.map(({ sentencia, rol }) => (
            <div key={sentencia.id} className="rounded-[10px] border border-borde px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-texto-4">
                <span className="rounded-full bg-chip px-2.5 py-[2px] font-medium text-celeste">
                  {sentencia.materia}
                </span>
                {rol && <span className="font-semibold text-texto-3">{rol}</span>}
                <span>
                  {sentencia.organo} · {sentencia.fecha}
                </span>
                <span className="ml-auto font-mono">{sentencia.expediente}</span>
              </div>
              <div className="mt-1.5 text-[13.5px] leading-[1.5] font-medium">
                {sentencia.titulo}
              </div>
              <p className="mt-2 text-[11.5px] leading-[1.55] text-texto-4">
                Puede tratarse de otra persona con tu mismo nombre. Antes de dar nada por hecho,
                abre la sentencia y compruébalo.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex items-start gap-2.5 rounded-[10px] bg-lienzo px-4 py-3 text-[13px] leading-[1.55] text-texto-3">
          <Icono nombre="check" size={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-exito" />
          <span>
            Sin apariciones en lo que el Estado publica. Te avisamos apenas salga algo con este
            nombre.
          </span>
        </div>
      )}
    </div>
  );
}

/** Expectativas honestas: lo que este producto NO puede darte. */
function QueNoEs() {
  return (
    <div className="mt-5 rounded-2xl border border-borde bg-white p-5">
      <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
        Qué NO es esto
      </h2>
      <ul className="mt-3 flex flex-col gap-2.5 text-[12.5px] leading-[1.6] text-texto-3">
        {[
          "No es una constancia de antecedentes. Que no aparezcas aquí no acredita nada ante nadie: eso lo emiten la Policía y el Poder Judicial.",
          "No vigila expedientes en trámite. En Honduras no son públicos — solo vemos lo que el Estado publica, cuando lo publica.",
          "No incluye materias reservadas (niñez, violencia doméstica): están excluidas por diseño.",
          "Los nombres se repiten. Una coincidencia no es una prueba; hay que abrir el documento y comprobarlo.",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <span className="mt-px shrink-0 text-texto-4">
              <Icono nombre="alerta" size={12} />
            </span>
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-3.5 border-t border-borde pt-3 text-[11.5px] leading-[1.6] text-texto-4">
        Puedes pedir la revisión o supresión de tus datos cuando quieras (habeas data, art. 182 de
        la Constitución) desde <Link href="/personas/configuracion">Configuración</Link>.
      </p>
    </div>
  );
}
