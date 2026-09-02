"use client";

/**
 * "Mi nombre" — el monitoreo visto desde el ciudadano.
 *
 * Es el mismo motor del abogado (`/api/corpus/apariciones`: el nombre como
 * parte en las sentencias publicadas del corpus real) con dos diferencias que
 * importan:
 *  1. Solo vigila nombres PROPIOS o de su familia. Ofrecer vigilar a un tercero
 *     aquí convertiría la función en acoso — mirar a otro es el Informe
 *     Verifica, que tiene sus reglas (§5).
 *  2. Se vende como enterarse, no como estar limpio: "sin apariciones" NO es un
 *     certificado de antecedentes, y la UI lo dice.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { NotaFuenteApariciones } from "@/components/ui/fuente-apariciones";
import {
  totalApariciones,
  useAparicionesDe,
  type EstadoApariciones,
} from "@/hooks/use-apariciones";
import { PERSONA_DEMO } from "@/data/persona";
import { usePortal } from "@/store/portal";
import { cn } from "@/lib/utils";
import type { NombreVigilado } from "@/types/dominio";
import { FilaAparicion } from "./aparicion";

export function MonitoreoPersona() {
  const vigilados = usePortal((s) => s.nombresVigiladosPersona);
  // Un resultado por nombre para toda la pantalla: la columna lateral y cada
  // card salen del MISMO dato — con dos derivaciones podrían contradecirse.
  const porNombre = useAparicionesDe(vigilados.map((v) => v.nombre));
  const total = totalApariciones(porNombre);
  const resuelto = Object.values(porNombre).find((e) => e.estado === "listo");
  const pendientes = Object.values(porNombre).some((e) => e.estado === "cargando");

  return (
    <div className="max-w-[1180px]">
      <h1 className="font-display text-[24px] font-bold">Mi nombre</h1>
      <p className="mt-1 max-w-[660px] text-[13px] leading-[1.6] text-texto-3">
        Te avisamos si tu nombre aparece en algo que el Estado publique — sentencias del Poder
        Judicial y La Gaceta. Sirve para enterarte a tiempo, no para demostrar que estás limpio.
      </p>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_312px]">
        <div className="flex flex-col gap-4">
          <FormularioVigilar />

          {resuelto && (
            <NotaFuenteApariciones
              fuente={resuelto.fuente}
              totalCorpus={resuelto.totalCorpus}
              className="mx-0.5"
            />
          )}

          {vigilados.map((v) => (
            <CardVigilado key={v.id} vigilado={v} estado={porNombre[v.nombre]!} />
          ))}

          {vigilados.length === 0 && (
            <div className="rounded-2xl border border-borde bg-white px-6 py-9 text-center">
              <p className="text-[14px] font-semibold">No estás vigilando ningún nombre</p>
              <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-[1.6] text-texto-3">
                Agrega el tuyo arriba. Te avisamos si aparece en algo que el Estado publique.
              </p>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
              En vigilancia
            </h2>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="font-display text-[26px] leading-none font-bold">
                {vigilados.length}
              </span>
              <span className="text-[12.5px] text-texto-3">
                {vigilados.length === 1 ? "nombre" : "nombres"}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-texto-3">
              {pendientes
                ? "Buscando en lo que el Estado publica…"
                : total === 0
                  ? "Sin apariciones por ahora en lo que el Estado publica."
                  : `${total} ${total === 1 ? "aparición encontrada" : "apariciones encontradas"} en lo publicado.`}
            </p>
          </div>

          <ComoAvisamos />
          <QueNoEs />
        </aside>
      </div>
    </div>
  );
}

function FormularioVigilar() {
  const vigilar = usePortal((s) => s.vigilarNombrePersona);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"propio" | "familiar">("propio");

  const enviar = () => {
    const limpio = nombre.trim();
    if (limpio.length < 4) return;
    vigilar(limpio, tipo);
    setNombre("");
    mostrarToast(`Vigilando "${limpio}" — te avisamos si aparece`);
  };

  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <h2 className="font-display text-[15px] font-bold">Agregar un nombre</h2>
      <label className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-texto-3">
        Nombre completo, como aparece en la identidad
        <div className="flex flex-wrap gap-2.5">
          <input
            value={nombre}
            maxLength={120}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enviar();
            }}
            placeholder={`Ej. ${PERSONA_DEMO.nombre}`}
            className="h-[42px] min-w-[min(260px,100%)] flex-1 rounded-lg border border-borde px-3 text-sm text-marino outline-none focus:border-celeste"
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

      {/* La relación es lo único que separa vigilar del acoso: aquí solo caben
          el propio nombre y el de la familia. */}
      <fieldset className="mt-3">
        <legend className="text-[12px] text-texto-3">¿De quién es?</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(
            [
              ["propio", "Mío"],
              ["familiar", "De mi familia"],
            ] as const
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={tipo === valor}
              onClick={() => setTipo(valor)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                tipo === valor
                  ? "border-celeste bg-celeste text-white"
                  : "border-borde bg-white text-texto-3 hover:border-celeste hover:text-marino",
              )}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="mt-3 text-[11.5px] leading-[1.55] text-texto-4">
        Solo el tuyo o el de tu familia. Para revisar a alguien con quien vas a hacer un negocio,
        usa el <Link href="/personas/verifica">Informe Verifica</Link>.
      </p>
    </div>
  );
}

const ETIQUETA_TIPO: Record<string, string> = {
  propio: "Tu nombre",
  familiar: "De tu familia",
};

function CardVigilado({
  vigilado,
  estado,
}: {
  vigilado: NombreVigilado;
  estado: EstadoApariciones;
}) {
  const dejarDeVigilar = usePortal((s) => s.dejarDeVigilarPersona);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const apariciones = estado.estado === "listo" ? estado.apariciones : [];

  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[15px] font-semibold">{vigilado.nombre}</span>
        <span className="rounded-full bg-chip px-2.5 py-[3px] text-[10.5px] font-bold tracking-[.5px] text-celeste uppercase">
          {ETIQUETA_TIPO[vigilado.tipo] ?? "Vigilado"}
        </span>
        <span className="flex-1" />
        <span className="text-[12px] whitespace-nowrap text-texto-4">
          {estado.estado === "cargando" && "buscando…"}
          {estado.estado === "error" && "sin respuesta"}
          {estado.estado === "listo" &&
            `${apariciones.length} ${apariciones.length === 1 ? "aparición" : "apariciones"}`}
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

      {estado.estado === "cargando" && (
        <div className="mt-3 rounded-[10px] bg-lienzo px-4 py-3 text-[13px] text-texto-3">
          Buscando «{vigilado.nombre}» en las sentencias publicadas…
        </div>
      )}
      {estado.estado === "error" && (
        <div className="mt-3 rounded-[10px] bg-lienzo px-4 py-3 text-[13px] leading-[1.55] text-texto-3">
          No pudimos consultar el corpus ahora mismo. No significa que no haya nada: significa que
          no pudimos buscar. Vuelve a cargar la página en unos segundos.
        </div>
      )}
      {estado.estado === "listo" && apariciones.length > 0 && (
        <>
          {/* Una vez por nombre, no por fila: repetido en cada aparición se
              volvía ruido y se dejaba de leer, que es lo contrario de lo que
              un disclaimer tiene que conseguir. */}
          <p className="mt-3 rounded-[10px] bg-lienzo px-4 py-3 text-[12px] leading-[1.6] text-texto-3">
            <b>Puede tratarse de otra persona con tu mismo nombre.</b> Los nombres se repiten y el
            corpus no trae documento de identidad: abre cada una y contrasta las partes y las fechas
            antes de dar nada por hecho.
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            {apariciones.map((a) => (
              <FilaAparicion key={a.sentencia.id} aparicion={a} />
            ))}
          </div>
        </>
      )}
      {estado.estado === "listo" && apariciones.length === 0 && (
        <div className="mt-3 flex items-start gap-2.5 rounded-[10px] bg-lienzo px-4 py-3 text-[13px] leading-[1.55] text-texto-3">
          <Icono
            nombre="check"
            size={14}
            strokeWidth={2.4}
            className="mt-0.5 shrink-0 text-exito"
          />
          <span>
            Sin apariciones en lo que el Estado publica. Te avisamos apenas salga algo con este
            nombre.
          </span>
        </div>
      )}
    </div>
  );
}

/** Antes decía "te avisamos" sin decir por dónde ni dónde se configura. */
function ComoAvisamos() {
  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
      <h2 className="text-[11px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
        Cómo te avisamos
      </h2>
      <ol className="mt-3 flex flex-col gap-2.5">
        {[
          "Cada vez que el Poder Judicial publica sentencias nuevas, las cruzamos con tus nombres.",
          "Si hay coincidencia, te llega un aviso y la aparición sale aquí.",
        ].map((t, i) => (
          <li
            key={t}
            className="flex items-start gap-2.5 text-[12.5px] leading-[1.55] text-texto-2"
          >
            <span className="grid h-[19px] w-[19px] min-w-[19px] place-items-center rounded-full bg-chip text-[10.5px] font-bold text-celeste">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-borde pt-3 text-[12.5px]">
        <Link href="/personas/notificaciones">Ver mis avisos →</Link>
        <Link href="/personas/configuracion" className="text-texto-3 hover:text-celeste">
          Elegir cuáles recibo
        </Link>
      </div>
    </div>
  );
}

/** Expectativas honestas: lo que este producto NO puede darte. */
function QueNoEs() {
  return (
    <div className="rounded-2xl border border-borde bg-white p-5">
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
