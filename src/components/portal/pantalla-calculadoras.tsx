"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, Rotulo } from "@/components/ui/primitivos";
import { calcularPrestaciones } from "@/lib/prestaciones";
import { calcularVencimiento } from "@/lib/plazos";
import {
  determinarViaCivil,
  TOPE_ABREVIADO,
  TOPE_MONITORIO,
  TOPE_SIN_ABOGADO,
} from "@/lib/via-procesal";
import { fmtLempiras } from "@/lib/utils";
import { usePortal } from "@/store/portal";
import { useUpgrade } from "@/components/portal/marco";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";

/**
 * Caja de herramientas del litigante: prestaciones, plazos, vía procesal y
 * aranceles. Cada cálculo vive en su módulo canónico de `lib/` (§0.5) — la UI
 * y Jus IA dan siempre el mismo número.
 */
export function PantallaCalculadoras() {
  return (
    // Dos columnas flex (no filas de grid): las cards se apilan sin huecos
    // aunque tengan alturas distintas.
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <CalculadoraPrestaciones />
        <CalculadoraAranceles />
      </div>
      <div className="flex flex-col gap-4">
        <CalculadoraPlazos />
        <CalculadoraVia />
      </div>
    </div>
  );
}

// ── Prestaciones laborales ─────────────────────────────────────────────────

function CalculadoraPrestaciones() {
  const [salario, setSalario] = useState("15000");
  const [anios, setAnios] = useState("3");
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const abrirEscrito = usePortal((s) => s.abrirEscrito);
  const preguntar = usePreguntarAJusIA();

  const salarioNum = Number(salario);
  const aniosNum = Number(anios);
  const valido = salarioNum > 0 && aniosNum > 0;
  const resultado = calcularPrestaciones(salarioNum, aniosNum);

  const desglose = [
    "CÁLCULO DE PRESTACIONES LABORALES (estimación orientativa)",
    "",
    `Salario mensual: ${fmtLempiras(salarioNum || 0)}`,
    `Antigüedad: ${aniosNum || 0} años`,
    "",
    `Cesantía: ${fmtLempiras(resultado.cesantia)}`,
    `Preaviso: ${fmtLempiras(resultado.preaviso)}`,
    `Vacaciones y aguinaldos proporcionales: ${fmtLempiras(resultado.proporcionales)}`,
    `TOTAL ESTIMADO: ${fmtLempiras(resultado.total)}`,
    "",
    "[Validar contra el expediente y el Código del Trabajo vigente antes de presentar.]",
  ].join("\n");

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(desglose);
      mostrarToast("Desglose copiado al portapapeles");
    } catch {
      mostrarToast("No se pudo copiar — selecciona el texto manualmente");
    }
  };

  const preguntarAJusIA = () =>
    preguntar(
      `Calculé prestaciones laborales con salario mensual de ${fmtLempiras(salarioNum || 0)} y ${aniosNum || 0} años trabajados: total estimado ${fmtLempiras(resultado.total)}. ¿Qué otros conceptos podría reclamar y qué sentencias sustentan el cálculo?`,
    );

  return (
    <Card className="p-6">
      <h2 className="font-display text-[17px] font-bold">Prestaciones laborales</h2>
      <p className="mt-1 text-[12.5px] text-texto-3">
        Estimación orientativa según Código del Trabajo.{" "}
        <Link href="/abogados/gaceta/salario-minimo-2026" className="text-celeste">
          {"El salario mínimo cambió esta semana →"}
        </Link>
      </p>

      <div className="mt-4.5 flex flex-col gap-3.5">
        <CampoNumero etiqueta="Salario mensual (L)" value={salario} onChange={setSalario} min={0} />
        <CampoNumero etiqueta="Años trabajados" value={anios} onChange={setAnios} min={0} max={60} />
      </div>

      {valido ? (
        <div className="mt-4.5 flex flex-col gap-2 rounded-[10px] bg-lienzo p-4">
          <Fila etiqueta="Cesantía" valor={fmtLempiras(resultado.cesantia)} />
          <Fila etiqueta="Preaviso" valor={fmtLempiras(resultado.preaviso)} />
          <Fila
            etiqueta="Vacaciones + 13º y 14º proporcionales"
            valor={fmtLempiras(resultado.proporcionales)}
          />
          <div className="flex justify-between border-t border-borde pt-2 text-[14.5px]">
            <span className="font-semibold">Total estimado</span>
            <b className="text-celeste">{fmtLempiras(resultado.total)}</b>
          </div>
        </div>
      ) : (
        <div className="mt-4.5 rounded-[10px] bg-lienzo p-4 text-center text-[12.5px] text-texto-4">
          Ingresa salario y años trabajados para calcular.
        </div>
      )}

      <p className="mt-2.5 text-[11px] text-texto-4">
        Orientativo — no sustituye el cálculo del caso concreto.
      </p>

      <div className="mt-3.5 flex flex-wrap gap-2">
        <BotonJusIA compacto onClick={preguntarAJusIA}>
          Preguntar a Jus IA
        </BotonJusIA>
        <Boton className="px-3.5 py-2 text-[12.5px]" disabled={!valido} onClick={copiar}>
          Copiar desglose
        </Boton>
        <Boton
          className="px-3.5 py-2 text-[12.5px]"
          disabled={!valido}
          onClick={() => abrirEscrito("Cálculo de prestaciones — anexo", desglose)}
        >
          Insertar en escrito
        </Boton>
      </div>
    </Card>
  );
}

// ── Plazos procesales ──────────────────────────────────────────────────────

function CalculadoraPlazos() {
  const [fecha, setFecha] = useState("");
  const [dias, setDias] = useState("3");
  const [habiles, setHabiles] = useState(true);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntar = usePreguntarAJusIA();

  // Default: hoy (vacío en SSR — la fecha local no la conoce el servidor,
  // regla §5). El abogado ve resultado al instante y solo ajusta si hace falta.
  const hoyIso = useHoyIso();
  const fechaEfectiva = fecha || hoyIso;

  const diasNum = Number(dias);
  const vencimiento =
    fechaEfectiva && diasNum > 0 ? calcularVencimiento(fechaEfectiva, diasNum, habiles) : null;
  const cruda = vencimiento?.toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const etiquetaVencimiento = cruda ? cruda.charAt(0).toUpperCase() + cruda.slice(1) : undefined;

  return (
    <Card className="p-6">
      <h2 className="font-display text-[17px] font-bold">Plazos procesales</h2>
      <p className="mt-1 text-[12.5px] text-texto-3">
        ¿Cuándo vence? Cuenta desde el día siguiente a la notificación.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          Fecha de notificación
          <input
            type="date"
            value={fechaEfectiva}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-lg border border-borde px-3 py-2.5 text-sm text-marino outline-none focus:border-celeste"
          />
        </label>
        <CampoNumero etiqueta="Días de plazo" value={dias} onChange={setDias} min={1} max={365} />
      </div>

      <div className="mt-3 flex gap-2">
        <PillOpcion activo={habiles} onClick={() => setHabiles(true)}>
          Días hábiles
        </PillOpcion>
        <PillOpcion activo={!habiles} onClick={() => setHabiles(false)}>
          Días calendario
        </PillOpcion>
      </div>

      {vencimiento && etiquetaVencimiento ? (
        <div className="mt-4 rounded-[10px] border-l-[3px] border-celeste bg-lienzo px-4 py-3.5">
          <Rotulo className="text-celeste">Vence el</Rotulo>
          <div className="font-display mt-0.5 text-[17px] font-bold text-marino">
            {etiquetaVencimiento}
          </div>
          <p className="mt-1 text-[11px] text-texto-4">
            No descuenta feriados judiciales ni asuetos — verifícalos antes de confiar el plazo.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Boton
              className="px-3.5 py-2 text-[12.5px]"
              onClick={() =>
                mostrarToast("Recordatorio programado — te avisamos 2 días antes por WhatsApp")
              }
            >
              Crear recordatorio
            </Boton>
            <BotonJusIA
              compacto
              onClick={() =>
                preguntar(
                  `Tengo un plazo de ${dias} días ${habiles ? "hábiles" : "calendario"} notificado el ${fechaEfectiva}. ¿Qué feriados judiciales podrían moverlo y qué pasa si vence en día inhábil?`,
                )
              }
            >
              Preguntar a Jus IA
            </BotonJusIA>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[10px] bg-lienzo p-4 text-center text-[12.5px] text-texto-4">
          Elige la fecha de notificación y los días de plazo.
        </div>
      )}
    </Card>
  );
}

// ── Vía procesal por cuantía ───────────────────────────────────────────────

/** Umbrales verificados contra el PDF oficial del CPC (2018) — PoC del proyecto. */
function CalculadoraVia() {
  const [cuantia, setCuantia] = useState("");
  const preguntar = usePreguntarAJusIA();
  const via = determinarViaCivil(Number(cuantia));

  return (
    <Card className="p-6">
      <h2 className="font-display text-[17px] font-bold">¿Qué vía procesal corresponde?</h2>
      <p className="mt-1 text-[12.5px] text-texto-3">
        Materia civil, según la cuantía del asunto (CPC, arts. 399–400 y 676–685).
      </p>

      <div className="mt-4">
        <CampoNumero etiqueta="Cuantía del asunto (L)" value={cuantia} onChange={setCuantia} min={0} />
      </div>

      {via ? (
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="rounded-[10px] border-l-[3px] border-celeste bg-lienzo px-4 py-3">
            <Rotulo className="text-celeste">Vía declarativa</Rotulo>
            <div className="font-display mt-0.5 text-[15.5px] font-bold text-marino">
              Proceso {via.via === "abreviado" ? "abreviado" : "ordinario"}
            </div>
            <p className="mt-0.5 text-[11.5px] text-texto-4">
              {via.via === "abreviado"
                ? `Cuantía hasta ${fmtLempiras(TOPE_ABREVIADO)} (arts. 399–400, reforma Decreto 21-2015)`
                : `Cuantía mayor a ${fmtLempiras(TOPE_ABREVIADO)} (arts. 399–400)`}
            </p>
          </div>

          {via.admiteMonitorio && (
            <div className="rounded-[10px] border border-borde bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-marino">
                <Icono nombre="check" size={13} strokeWidth={2.4} className="text-exito" />
                Si es deuda líquida y exigible, cabe proceso monitorio
              </div>
              <p className="mt-0.5 text-[11.5px] text-texto-4">
                Hasta {fmtLempiras(TOPE_MONITORIO)} (arts. 676–685)
                {via.sinAbogado &&
                  ` · bajo ${fmtLempiras(TOPE_SIN_ABOGADO)} no exige profesional del derecho`}
                .
              </p>
            </div>
          )}

          <BotonJusIA
            compacto
            className="self-start"
            onClick={() =>
              preguntar(
                `Para una cuantía de ${fmtLempiras(Number(cuantia))} en materia civil, ¿qué pasos siguen en el proceso ${via.via === "abreviado" ? "abreviado" : "ordinario"}${via.admiteMonitorio ? " y cuándo me conviene optar por el monitorio" : ""}?`,
              )
            }
          >
            Preguntar a Jus IA
          </BotonJusIA>
        </div>
      ) : (
        <div className="mt-4 rounded-[10px] bg-lienzo p-4 text-center text-[12.5px] text-texto-4">
          Ingresa la cuantía para orientar la vía.
        </div>
      )}

      <p className="mt-2.5 text-[11px] text-texto-4">
        Umbrales verificados contra el PDF oficial del CPC (2018) —{" "}
        <Link href="/abogados/legislacion?codigo=cpc">ver los artículos</Link>. Orientativo —
        revisa el caso concreto.
      </p>
    </Card>
  );
}

// ── Aranceles (Pro) ────────────────────────────────────────────────────────

/**
 * Con plan Base se muestra desenfocada (patrón de conversión). Con Pro, el
 * formulario queda habilitado pero el cálculo espera el arancel oficial
 * (Decreto 82-96) — honestidad de demo: sin fuente no hay número.
 */
function CalculadoraAranceles() {
  const esPro = usePortal((s) => s.plan) === "pro";
  const solicitarUpgrade = useUpgrade();
  const preguntar = usePreguntarAJusIA();
  const [cuantia, setCuantia] = useState("");

  if (!esPro) {
    return (
      <Card className="relative overflow-hidden p-6">
        <div className="flex items-center gap-2">
          <Icono nombre="candado" size={15} />
          <h2 className="font-display text-[17px] font-bold">Aranceles del abogado</h2>
        </div>
        <p className="mt-1 text-[12.5px] text-texto-3">
          Honorarios mínimos según el Arancel del Profesional del Derecho (Decreto 82-96).
        </p>

        <div aria-hidden className="mt-4.5 pointer-events-none opacity-55 blur-[3px]">
          <div className="flex flex-col gap-3.5">
            <CampoNumero etiqueta="Cuantía del asunto (L)" value="" onChange={() => {}} deshabilitado />
            <CampoNumero etiqueta="Tipo de actuación" value="" onChange={() => {}} deshabilitado />
            <div className="h-16 rounded-[10px] bg-lienzo" />
          </div>
        </div>

        <div className="absolute right-6 bottom-6 left-6">
          <Boton variante="marino" className="w-full py-[11px]" onClick={solicitarUpgrade}>
            Desbloquear con Premium
          </Boton>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-[17px] font-bold">Aranceles del abogado</h2>
      <p className="mt-1 text-[12.5px] text-texto-3">
        Honorarios mínimos según el Arancel del Profesional del Derecho (Decreto 82-96).
      </p>

      <div className="mt-4.5 flex flex-col gap-3.5">
        <CampoNumero etiqueta="Cuantía del asunto (L)" value={cuantia} onChange={setCuantia} min={0} />
      </div>

      <div className="mt-4 rounded-[10px] border border-aviso-borde bg-aviso px-4 py-3.5 text-[12.5px] leading-[1.55] text-aviso-cuerpo">
        <b>El cálculo se enciende al cargar el arancel oficial.</b> El Decreto 82-96 se obtiene
        de La Gaceta con el CAH — sin la fuente oficial, esta herramienta no inventa montos.
      </div>

      <BotonJusIA
        compacto
        className="mt-3.5"
        onClick={() =>
          preguntar(
            `¿Cómo se calculan los honorarios mínimos del Arancel del Profesional del Derecho (Decreto 82-96) para una cuantía de ${fmtLempiras(Number(cuantia) || 0)}?`,
          )
        }
      >
        Preguntar a Jus IA
      </BotonJusIA>
    </Card>
  );
}

// ── Fecha de hoy (patrón use-saludo: vacía en SSR, real tras el mount) ─────

let hoyMemo: string | null = null;
const SIN_SUSCRIPCION = () => () => {};

function snapshotHoy(): string {
  if (hoyMemo === null) {
    const hoy = new Date();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    hoyMemo = `${hoy.getFullYear()}-${mm}-${dd}`;
  }
  return hoyMemo;
}

function useHoyIso(): string {
  return useSyncExternalStore(SIN_SUSCRIPCION, snapshotHoy, () => "");
}

// ── Primitivos locales ─────────────────────────────────────────────────────

function CampoNumero({
  etiqueta,
  value,
  onChange,
  min,
  max,
  deshabilitado,
}: {
  etiqueta: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  deshabilitado?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
      {etiqueta}
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={deshabilitado}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-borde px-3 py-2.5 text-sm text-marino outline-none focus:border-celeste"
      />
    </label>
  );
}

function PillOpcion({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={
        activo
          ? "cursor-pointer rounded-full border border-celeste bg-celeste px-3.5 py-[7px] text-[12.5px] font-medium text-white"
          : "cursor-pointer rounded-full border border-borde bg-white px-3.5 py-[7px] text-[12.5px] font-medium text-texto-3 hover:border-celeste"
      }
    >
      {children}
    </button>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <span className="text-texto-3">{etiqueta}</span>
      <b className="whitespace-nowrap">{valor}</b>
    </div>
  );
}
