"use client";

/**
 * Informe Verifica — verificar a alguien ANTES de firmar (comprar un terreno,
 * alquilar, contratar, asociarse).
 *
 * Tres reglas de §5 del CLAUDE.md del producto están cableadas en la UI, no
 * son copy decorativo:
 *  · disclaimer de homónimos SIEMPRE, junto a cada resultado;
 *  · usos prohibidos a la vista antes de buscar (no acoso, no discriminación);
 *  · se vende como verificación, no como vigilancia.
 *
 * Y una regla de §4.5: la parte que HOY funciona es la búsqueda en sentencias
 * publicadas —motor real sobre el corpus—; folio real y Registro Mercantil
 * exigen cuenta institucional (SURE/CCIT) que aún no existe, así que aparecen
 * como lo que son, en preparación, y no como una promesa cobrada por
 * adelantado. TODO(data): al abrir esas cuentas, el informe pasa a completo.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { buscarApariciones, type Aparicion } from "@/data/monitoreo";

export function VerificaPersona() {
  const [nombre, setNombre] = useState("");
  const [consultado, setConsultado] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Aparicion[]>([]);

  const buscar = () => {
    const limpio = nombre.trim();
    if (limpio.length < 4) return;
    setResultados(buscarApariciones(limpio));
    setConsultado(limpio);
  };

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[24px] font-bold">Informe Verifica</h1>
      <p className="mt-1 max-w-[650px] text-[13px] leading-[1.6] text-texto-3">
        Antes de comprar un terreno, alquilar, contratar o asociarte: mira qué hay publicado
        sobre esa persona o empresa en las fuentes del Estado.
      </p>

      <UsosProhibidos />

      <div className="mt-4 rounded-2xl border border-borde bg-white p-5">
        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          Nombre de la persona o empresa
          <div className="flex flex-wrap gap-2.5">
            <input
              value={nombre}
              maxLength={120}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") buscar();
              }}
              placeholder="Ej. Estado de Honduras"
              className="h-[42px] min-w-[min(280px,100%)] flex-1 rounded-lg border border-borde px-3 text-sm text-marino outline-none focus:border-celeste"
            />
            <button
              type="button"
              onClick={buscar}
              disabled={nombre.trim().length < 4}
              className="h-[42px] cursor-pointer rounded-lg bg-celeste px-4 text-[13px] font-semibold text-white hover:bg-cruce disabled:cursor-not-allowed disabled:opacity-45"
            >
              Buscar
            </button>
          </div>
        </label>
        <p className="mt-2 text-[11.5px] leading-[1.55] text-texto-4">
          Busca en las sentencias que el Poder Judicial publica. Es gratis y no se le avisa a
          nadie que lo buscaste.
        </p>
      </div>

      {consultado && <Resultado nombre={consultado} apariciones={resultados} />}

      <InformeCompleto />
    </div>
  );
}

/** A la vista ANTES de buscar, no escondido en unos términos. */
function UsosProhibidos() {
  return (
    <div className="mt-4 flex gap-3 rounded-xl border border-[rgba(201,154,58,.35)] bg-[rgba(201,154,58,.08)] px-4 py-3.5">
      <span className="mt-0.5 shrink-0 text-dorado">
        <Icono nombre="alerta" size={15} />
      </span>
      <p className="text-[12.5px] leading-[1.6] text-texto-2">
        <b>Para verificar, no para perseguir.</b> Está prohibido usar esto para acosar a alguien
        o para descartar candidatos por su historial: en Honduras nadie pierde derechos por
        aparecer en un expediente. Lo que ves aquí es información que el Estado ya publicó.
      </p>
    </div>
  );
}

function Resultado({ nombre, apariciones }: { nombre: string; apariciones: Aparicion[] }) {
  const hay = apariciones.length > 0;

  return (
    <div className="mt-4 rounded-2xl border border-borde bg-white p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
            hay ? "bg-[rgba(201,154,58,.16)] text-dorado" : "bg-exito-bg text-exito"
          }`}
        >
          <Icono nombre={hay ? "alerta" : "check"} size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold">{nombre}</div>
          <div className="text-[12.5px] text-texto-3">
            {hay
              ? `${apariciones.length} ${apariciones.length === 1 ? "aparición" : "apariciones"} en sentencias publicadas`
              : "Sin apariciones en las sentencias publicadas"}
          </div>
        </div>
      </div>

      {/* El disclaimer de homónimos va SIEMPRE, no solo cuando hay resultados:
          "sin apariciones" también se malinterpreta como un certificado. */}
      <p className="mt-3 rounded-[10px] bg-lienzo px-4 py-3 text-[12px] leading-[1.6] text-texto-3">
        {hay ? (
          <>
            <b>Puede no ser la misma persona.</b> Los nombres se repiten y el corpus no trae
            documento de identidad: abre cada sentencia y contrasta antes de sacar conclusiones.
          </>
        ) : (
          <>
            <b>Esto no acredita nada.</b> Que no aparezca solo dice que no está en lo que el
            Estado publica: puede tener un proceso en trámite —que no es público— o figurar con
            otro nombre.
          </>
        )}
      </p>

      {hay && (
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
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.55] text-texto-3">
                {sentencia.resumen}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3.5 border-t border-borde pt-3 text-[12.5px]">
        <Link href="/personas/directorio">
          ¿Vas a firmar algo? Consulta con un abogado antes →
        </Link>
      </div>
    </div>
  );
}

/** Lo que falta para el informe completo — dicho como pendiente, no como oferta. */
function InformeCompleto() {
  return (
    <div className="mt-5 rounded-2xl border-2 border-dashed border-borde bg-white/70 p-5">
      <span className="text-[11px] font-semibold tracking-[1.2px] text-dorado uppercase">
        Informe completo — en preparación
      </span>
      <p className="mt-2 max-w-[640px] text-[13px] leading-[1.65] text-texto-3">
        La búsqueda en sentencias ya funciona y es gratis. Para el informe completo faltan tres
        registros que hoy exigen cuenta institucional, y sin ellos no lo ofrecemos:
      </p>
      <ul className="mt-3 flex flex-col gap-2 text-[12.5px] leading-[1.55] text-texto-3">
        {[
          ["Folio real de un inmueble", "Instituto de la Propiedad (SURE) — exige cuenta"],
          ["Situación de una empresa", "Registro Mercantil — la consulta pública es por número de matrícula, no por nombre"],
          ["Vigilancia por 30 días", "avisa si sale algo nuevo después de tu consulta"],
        ].map(([que, por]) => (
          <li key={que} className="flex items-start gap-2">
            <span className="mt-px shrink-0 text-texto-4">
              <Icono nombre="candado" size={12} />
            </span>
            <span>
              <b className="text-marino">{que}</b> — {por}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 border-t border-borde pt-3 text-[11.5px] leading-[1.6] text-texto-4">
        Será de pago único, sin suscripción. El precio se define con el gremio; lo que hoy es
        gratis seguirá siéndolo.
      </p>
    </div>
  );
}
