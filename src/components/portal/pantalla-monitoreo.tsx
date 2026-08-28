"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, ChipMateria, Meta, TituloSeccion } from "@/components/ui/primitivos";
import { buscarApariciones } from "@/data/monitoreo";
import { usePortal } from "@/store/portal";
import { useUpgrade } from "@/components/portal/marco";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import type { NombreVigilado } from "@/types/dominio";

const ETIQUETA_TIPO: Record<NombreVigilado["tipo"], string> = {
  propio: "Tu nombre",
  cliente: "Cliente",
  contraparte: "Contraparte",
};

/**
 * Monitoreo de nombres — el feature Pro que faltaba por materializar. El
 * matching corre EN VIVO sobre el texto oficial de las sentencias del piloto:
 * la demo demuestra el motor real, no lo finge. Copy honesto: se vigila lo
 * que el Estado publica, no movimientos de expedientes (eso no es público).
 */
export function PantallaMonitoreo() {
  const esPremium = usePortal((s) => s.plan) === "premium";
  const vigilados = usePortal((s) => s.nombresVigilados);
  const solicitarUpgrade = useUpgrade();

  return (
    <>
      {!esPremium && (
        <div
          className="mb-4.5 flex flex-wrap items-center gap-3.5 rounded-xl px-5 py-4 text-[#e8eef6]"
          style={{ background: "linear-gradient(90deg,#0d2144,#0a1830)" }}
        >
          <Icono nombre="candado" size={17} />
          <p className="min-w-[220px] flex-1 text-[13.5px]">
            El monitoreo de nombres es parte del plan <b>Premium</b>. Mira cómo funciona con esta
            demostración; para vigilar tus propios nombres, mejora tu plan.
          </p>
          <Boton variante="dorado" onClick={solicitarUpgrade} className="px-4 py-[9px]">
            Mejorar a Premium
          </Boton>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4">
          <FormularioVigilar esPremium={esPremium} />
          {vigilados.map((v) => (
            <CardVigilado key={v.id} vigilado={v} />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <ComoFunciona />
          <QueNoMonitorea />
        </div>
      </div>
    </>
  );
}

// ── Alta de un nombre ──────────────────────────────────────────────────────

function FormularioVigilar({ esPremium }: { esPremium: boolean }) {
  const vigilarNombre = usePortal((s) => s.vigilarNombre);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const solicitarUpgrade = useUpgrade();
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<NombreVigilado["tipo"]>("cliente");

  const vigilar = () => {
    const limpio = nombre.trim();
    if (limpio.length < 4) return;
    if (!esPremium) {
      solicitarUpgrade();
      return;
    }
    vigilarNombre(limpio, tipo);
    const encontradas = buscarApariciones(limpio).length;
    mostrarToast(
      encontradas > 0
        ? `"${limpio}" en vigilancia — ${encontradas} ${encontradas === 1 ? "aparición encontrada" : "apariciones encontradas"} en lo ya publicado`
        : `"${limpio}" en vigilancia — te avisamos apenas el PJ publique algo`,
    );
    setNombre("");
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-borde bg-white px-3.5 py-2.5 focus-within:border-celeste">
          <Icono nombre="buscar" size={15} className="shrink-0 text-texto-4" />
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && vigilar()}
            placeholder="Nombre completo de la persona o empresa…"
            aria-label="Nombre a vigilar"
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
          />
        </div>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as NombreVigilado["tipo"])}
          aria-label="Tipo de nombre"
          className="rounded-lg border border-borde bg-white p-2.5 text-[13px] text-marino outline-none focus:border-celeste"
        >
          <option value="cliente">Cliente</option>
          <option value="contraparte">Contraparte</option>
          <option value="propio">Mi nombre</option>
        </select>
        <Boton
          variante="marino"
          icono={esPremium ? undefined : "candado"}
          className="px-4 py-2.5 text-[13px]"
          onClick={vigilar}
        >
          Vigilar nombre
        </Boton>
      </div>
      <p className="mt-2.5 text-[11.5px] leading-[1.5] text-texto-4">
        Las coincidencias pueden ser <b>homónimos</b> — verifica siempre la identidad en el
        documento oficial antes de sacar conclusiones. Prohibido usarlo para acoso o
        discriminación; canal de habeas data en{" "}
        <Link href="/abogados/configuracion" className="text-celeste hover:text-marino">
          Configuración
        </Link>
        .
      </p>
    </Card>
  );
}

// ── Card de un nombre vigilado (matching real sobre el corpus) ─────────────

function CardVigilado({ vigilado }: { vigilado: NombreVigilado }) {
  const dejarDeVigilar = usePortal((s) => s.dejarDeVigilar);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntar = usePreguntarAJusIA();
  const apariciones = buscarApariciones(vigilado.nombre);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-display text-[15px] font-bold">{vigilado.nombre}</span>
        <span className="rounded-full bg-chip px-2.5 py-[3px] text-[10.5px] font-bold tracking-[.5px] text-celeste uppercase">
          {ETIQUETA_TIPO[vigilado.tipo]}
        </span>
        <span className="flex-1" />
        <span className="text-[12px] whitespace-nowrap text-texto-4">
          {apariciones.length}{" "}
          {apariciones.length === 1 ? "aparición" : "apariciones"} en lo publicado
        </span>
        <button
          type="button"
          onClick={() => {
            dejarDeVigilar(vigilado.id);
            mostrarToast(`"${vigilado.nombre}" ya no está en vigilancia`);
          }}
          aria-label={`Dejar de vigilar a ${vigilado.nombre}`}
          className="grid cursor-pointer place-items-center text-texto-4 hover:text-urgente"
        >
          <Icono nombre="cerrar" size={14} />
        </button>
      </div>

      {apariciones.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2.5">
          {apariciones.map(({ sentencia, rol }) => (
            <div key={sentencia.id} className="rounded-[10px] border border-borde px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <ChipMateria>{sentencia.materia}</ChipMateria>
                {rol && (
                  <span className="rounded-md bg-lienzo px-2 py-[2px] text-[10.5px] font-bold tracking-[.5px] text-texto-3 uppercase">
                    {rol}
                  </span>
                )}
                <Meta>
                  {sentencia.organo} · {sentencia.fecha}
                </Meta>
                <span className="ml-auto font-mono text-[11px] text-texto-4">
                  {sentencia.expediente}
                </span>
              </div>
              <div className="mt-1.5 text-[13.5px] font-medium">{sentencia.titulo}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={`/abogados/jurisprudencia/${sentencia.id}`}
                  className="text-[12.5px]"
                >
                  Ver sentencia íntegra →
                </Link>
                <BotonJusIA
                  compacto
                  onClick={() =>
                    preguntar(
                      `¿En qué contexto aparece ${vigilado.nombre} en la sentencia ${sentencia.expediente} y qué implicaciones tiene?`,
                    )
                  }
                >
                  Analizar la aparición
                </BotonJusIA>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2.5 rounded-[10px] bg-lienzo px-4 py-3 text-[13px] text-texto-3">
          <Icono nombre="check" size={14} strokeWidth={2.4} className="shrink-0 text-exito" />
          Sin apariciones en lo publicado — te avisamos apenas el Poder Judicial o La Gaceta
          publiquen algo con este nombre.
        </div>
      )}
    </Card>
  );
}

// ── Columna lateral ────────────────────────────────────────────────────────

function ComoFunciona() {
  const pasos = [
    "Registras los nombres que te importan: el tuyo, clientes, contrapartes",
    "Cada vez que el PJ publica sentencias nuevas (o sale La Gaceta), las cruzamos con tu lista",
    "Si hay coincidencia, te avisamos por WhatsApp y correo con el enlace al documento oficial",
  ];

  return (
    <Card className="p-5">
      <TituloSeccion>Cómo funciona</TituloSeccion>
      <ol className="mt-3 flex flex-col gap-2.5">
        {pasos.map((paso, i) => (
          <li
            key={paso}
            className="flex items-start gap-2.5 text-[12.5px] leading-[1.5] text-texto-2"
          >
            <span className="grid h-[20px] w-[20px] min-w-[20px] place-items-center rounded-full bg-chip text-[11px] font-bold text-celeste">
              {i + 1}
            </span>
            {paso}
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** Expectativas honestas — regla de venta del análisis: no inflar la promesa. */
function QueNoMonitorea() {
  return (
    <Card className="p-5">
      <TituloSeccion>Qué NO monitorea</TituloSeccion>
      <ul className="mt-3 flex flex-col gap-2 text-[12.5px] leading-[1.55] text-texto-3">
        <li className="flex items-start gap-2">
          <span className="mt-px grid shrink-0 place-items-center text-texto-4">
            <Icono nombre="alerta" size={12} />
          </span>
          Movimientos de expedientes en trámite — no son públicos en Honduras; vigilamos lo que
          el Estado publica, cuando lo publica.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-px grid shrink-0 place-items-center text-texto-4">
            <Icono nombre="alerta" size={12} />
          </span>
          Materias reservadas (niñez, violencia doméstica) — excluidas por diseño.
        </li>
      </ul>
    </Card>
  );
}
