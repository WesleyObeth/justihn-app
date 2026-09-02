"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { SimboloJusIALinear } from "@/components/brand/logos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Card, CardMarino, ChipMateria, TituloSeccion } from "@/components/ui/primitivos";
import { BannerValidacion } from "@/components/portal/marco";
import { usePortal, useCuota } from "@/store/portal";
import { ABOGADA_DEMO, ACTIVIDAD_RECIENTE, LEADS } from "@/data/catalogo";
import { PUBLICACIONES } from "@/data/gaceta";
import { SENTENCIAS } from "@/data/sentencias";
import { BRIEF, HISTORIAL } from "@/data/jus-ia";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { useSaludoPorHora, useSemanaActual } from "@/hooks/use-saludo";

/**
 * Dashboard del portal (ruta `/abogados/dashboard`; renombrado de "Inicio"
 * por decisión Wesley 2026-08-25). Regla de la pantalla: nada inerte — toda
 * card navega o dispara una acción.
 */
export function PantallaInicio() {
  const franja = useSaludoPorHora();
  const semana = useSemanaActual();
  const apellido = ABOGADA_DEMO.nombreCorto.split(" ")[1];
  // Derivado del mismo seed que "Nuevo en tus materias": un solo lugar por dato.
  const especialidades = new Set<string>(ABOGADA_DEMO.especialidades);
  const novedades = SENTENCIAS.filter((s) => especialidades.has(s.materia)).length;

  return (
    <>
      <BannerValidacion />
      <div className="max-w-[1280px]" style={{ animation: "fadeUp .3s ease" }}>
        <h1 className="font-display text-[26px] font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-texto-3">
          {franja && `${franja}, abogada ${apellido} — `}
          {semana && `${semana} · `}
          <Link href="/abogados/jurisprudencia">{novedades} novedades en tus materias</Link>
        </p>

        <ComposerRapido />

        <Metricas />

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-4">
            <PendientesDeHoy />
            <ActividadReciente />
            <NuevoEnTusMaterias />
          </div>

          <div className="flex flex-col gap-4">
            <CardMarino className="p-5">
              <TituloSeccion className="text-[#e8eef6]">Digest de Gaceta</TituloSeccion>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-sobre-marino-2">
                Tu resumen semanal está listo: {PUBLICACIONES.length} publicaciones en{" "}
                {listarMaterias(PUBLICACIONES.map((p) => p.materia))}.
              </p>
              <Link
                href="/abogados/gaceta?digest=1"
                className="mt-3.5 inline-block rounded-lg bg-celeste px-3.5 py-[9px] text-[13px] font-semibold text-white hover:bg-[#0d6ba3] hover:text-white"
              >
                Leer digest
              </Link>
            </CardMarino>

            <RetomarInvestigacion />

            <LeadsRecientes />

            {/* flex-1: estira la última card para que ambas columnas cierren
                a la misma altura. */}
            <Card className="flex flex-1 flex-col p-5">
              <TituloSeccion>Accesos rápidos</TituloSeccion>
              <div className="mt-3 grid flex-1 grid-cols-2 content-start gap-2.5">
                <AccesoRapido href="/abogados" icono="ia">
                  Preguntar a Jus IA
                </AccesoRapido>
                <AccesoRapido href="/abogados/procesos" icono="pasos">
                  Procesos
                </AccesoRapido>
                <AccesoRapido href="/abogados/calculadoras" icono="calc">
                  Calculadoras
                </AccesoRapido>
                <AccesoRapido href="/abogados/modelos" icono="plantillas">
                  Modelos
                </AccesoRapido>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Composer rápido ────────────────────────────────────────────────────────

/**
 * La acción nº 1 del producto, disponible desde el aterrizaje: la consulta
 * viaja al chat y se envía sola (`enviarDirecto`). Mismo borde aurora del
 * composer real para que se reconozca como "hablar con Jus IA".
 */
function ComposerRapido() {
  const [texto, setTexto] = useState("");
  const preguntar = usePreguntarAJusIA();

  const enviar = () => {
    const consulta = texto.trim();
    if (!consulta) return;
    preguntar(consulta, { enviarDirecto: true });
  };

  return (
    <div
      className="relative mt-5 flex items-center gap-3 rounded-[14px] border border-borde-fuerte bg-white py-2 pr-2 pl-4"
      style={{ boxShadow: "var(--shadow-composer-sm)" }}
    >
      <span aria-hidden className="borde-aurora" />
      <SimboloJusIALinear size={16} className="shrink-0 text-celeste" />
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && enviar()}
        placeholder="Pregúntale a Jus IA — responde solo con fuentes oficiales…"
        aria-label="Pregúntale a Jus IA"
        className="min-w-0 flex-1 border-none bg-transparent text-sm text-marino outline-none"
      />
      <button
        type="button"
        onClick={enviar}
        disabled={!texto.trim()}
        aria-label="Enviar consulta"
        className="grid h-8 w-8 min-w-8 cursor-pointer place-items-center rounded-[9px] border-none bg-celeste text-white hover:bg-cruce disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Icono nombre="enviar" size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
}

// ── Métricas ───────────────────────────────────────────────────────────────

/** La cuota de Jus IA es la métrica protagonista; las tres cards navegan. */
function Metricas() {
  const cuota = useCuota();
  const subs = usePortal((s) => s.subs);
  const suscritas = Object.values(subs).filter(Boolean).length;

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Link href="/abogados/planes" className="text-marino">
        <Card interactiva className="h-full px-5 py-4.5">
          <div className="text-xs tracking-[.4px] text-texto-3 uppercase">Consultas a Jus IA</div>
          <div className="font-display mt-1.5 text-[30px] font-bold">{cuota.etiquetaLarga}</div>
          {!cuota.esPremium && (
            <div className="mt-2 h-1.5 overflow-hidden rounded bg-sutil">
              <div
                className="h-full rounded bg-celeste transition-[width]"
                style={{ width: `${cuota.porcentaje}%` }}
              />
            </div>
          )}
          <div className="mt-1.5 text-xs text-texto-3">
            {cuota.esPremium ? "Plan Premium · sin límite" : "Se renueva el 1 de septiembre"}
          </div>
        </Card>
      </Link>

      <Link href="/abogados/jurisprudencia" className="text-marino">
        <Card interactiva className="h-full px-5 py-4.5">
          <div className="text-xs tracking-[.4px] text-texto-3 uppercase">Búsquedas este mes</div>
          <div className="font-display mt-1.5 text-[30px] font-bold">128</div>
          <div className="mt-0.5 text-xs text-celeste">Ilimitadas en tu plan</div>
        </Card>
      </Link>

      <Link href="/abogados/gaceta" className="text-marino">
        <Card interactiva className="h-full px-5 py-4.5">
          <div className="text-xs tracking-[.4px] text-texto-3 uppercase">Alertas de Gaceta</div>
          <div className="font-display mt-1.5 text-[30px] font-bold">3</div>
          <div className="mt-0.5 text-xs text-texto-3">
            {suscritas} {suscritas === 1 ? "materia suscrita" : "materias suscritas"}
          </div>
        </Card>
      </Link>
    </div>
  );
}

// ── Pendientes de hoy (triaje del brief) ───────────────────────────────────

const COLORES_VEREDICTO: Record<string, React.CSSProperties> = {
  ACTUAR: { color: "#c0392b", background: "#faeae8" },
  REVISAR: { color: "#8a6d2a", background: "#faf3e2" },
  INFO: { color: "#0e5f92", background: "#e7f3fa" },
};

function PendientesDeHoy() {
  const preguntar = usePreguntarAJusIA();

  return (
    <Card className="p-5">
      <div className="flex items-baseline gap-2.5">
        <TituloSeccion>Pendientes de hoy</TituloSeccion>
        <span className="text-[11.5px] text-texto-4">triaje de tus casos, Gaceta y leads</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {BRIEF.map((item) => (
          // La fila entera dispara la acción (el botón interno queda como
          // affordance visible y vía de teclado; stopPropagation evita el doble
          // disparo al clickearlo).
          <div
            key={item.id}
            onClick={() => preguntar(item.pregunta, { enviarDirecto: true })}
            className="flex cursor-pointer flex-wrap items-center gap-3 rounded-[11px] border border-borde px-3.5 py-[11px] transition-colors hover:border-celeste"
          >
            <span
              className="rounded-md px-[9px] py-1 text-[10px] font-bold tracking-[.8px] whitespace-nowrap"
              style={COLORES_VEREDICTO[item.veredicto]}
            >
              {item.veredicto}
            </span>
            <div className="min-w-[180px] flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[11px] text-texto-4">{item.referencia}</span>
                {item.urgencia && (
                  <span className="text-[11px] font-bold text-urgente">{item.urgencia}</span>
                )}
              </div>
              <div className="mt-px truncate text-[13px] font-semibold">{item.titulo}</div>
            </div>
            <span onClick={(e) => e.stopPropagation()}>
              {/* Ancho fijo: los tres verbos son distintos pero los botones alinean igual. */}
              <BotonJusIA
                compacto
                className="w-[168px] whitespace-nowrap"
                onClick={() => preguntar(item.pregunta, { enviarDirecto: true })}
              >
                {item.accion}
              </BotonJusIA>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Actividad reciente ─────────────────────────────────────────────────────

function ActividadReciente() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <TituloSeccion>Actividad reciente</TituloSeccion>
        <Link href="/abogados/jurisprudencia" className="text-[12.5px]">
          Ver jurisprudencia →
        </Link>
      </div>
      <div className="mt-2.5 flex flex-col">
        {ACTIVIDAD_RECIENTE.map((item) => (
          <Link
            key={item.title}
            href={item.destino}
            className="group flex items-baseline gap-3 border-b border-borde-suave py-[11px] text-marino last:border-b-0"
          >
            <span className="min-w-[52px] text-[11px] text-texto-4">{item.when}</span>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium group-hover:text-celeste">{item.title}</div>
              <div className="mt-0.5 text-xs text-texto-3">{item.meta}</div>
            </div>
            <span className="text-texto-4 opacity-0 transition-opacity group-hover:opacity-100">
              →
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// ── Nuevo en tus materias ──────────────────────────────────────────────────

/**
 * Jurisprudencia reciente filtrada por las especialidades del perfil — el
 * corazón del producto presente en el Dashboard, con deep-link a cada fallo.
 */
function NuevoEnTusMaterias() {
  const especialidades = new Set<string>(ABOGADA_DEMO.especialidades);
  const recientes = SENTENCIAS.filter((s) => especialidades.has(s.materia)).slice(0, 2);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <TituloSeccion>Nuevo en tus materias</TituloSeccion>
        <span className="text-[11.5px] text-texto-4">
          {ABOGADA_DEMO.especialidades.join(" · ")}
        </span>
      </div>

      <div className="mt-2.5 flex flex-col">
        {recientes.map((s) => (
          <Link
            key={s.id}
            href={`/abogados/jurisprudencia/${s.id}`}
            className="group border-b border-borde-suave py-[11px] text-marino last:border-b-0 last:pb-1"
          >
            <div className="flex items-center gap-2">
              <ChipMateria>{s.materia}</ChipMateria>
              <span className="text-[11px] text-texto-4">
                {s.organo} · {s.fecha}
              </span>
            </div>
            <div className="mt-1.5 text-[13.5px] font-medium group-hover:text-celeste">
              {s.titulo}
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-texto-3">{s.resumen}</p>
          </Link>
        ))}
      </div>

      <Link href="/abogados/jurisprudencia" className="mt-2.5 inline-block text-[12.5px]">
        Buscar en todo el corpus →
      </Link>
    </Card>
  );
}

// ── Retomar investigación ──────────────────────────────────────────────────

/** Últimas conversaciones con Jus IA: un clic y se reabren en el chat. */
function RetomarInvestigacion() {
  const router = useRouter();
  const cargar = usePortal((s) => s.cargarConversacion);
  const recientes = HISTORIAL.slice(0, 2);

  const abrir = (conv: (typeof HISTORIAL)[number]) => {
    cargar(conv.id, conv.mensajes);
    router.push("/abogados");
  };

  return (
    <Card className="p-5">
      <TituloSeccion>Retomar investigación</TituloSeccion>
      <div className="mt-3 flex flex-col gap-2">
        {recientes.map((conv) => {
          const fuentes = conv.mensajes.at(-1)?.citas?.length ?? 0;
          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => abrir(conv)}
              className="cursor-pointer rounded-[10px] border border-borde px-3.5 py-2.5 text-left hover:border-celeste"
            >
              <div className="truncate text-[13px] font-semibold text-marino">{conv.titulo}</div>
              <div className="mt-0.5 text-[11.5px] text-texto-4">
                {conv.fecha} · {fuentes} fuentes citadas
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ── Leads recientes (Vía B) ────────────────────────────────────────────────

function LeadsRecientes() {
  const recientes = LEADS.slice(0, 2);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <TituloSeccion>Leads en tu especialidad</TituloSeccion>
        <span className="rounded-full bg-celeste px-2 py-0.5 text-[10.5px] font-bold text-white">
          {recientes.filter((l) => l.nuevo).length} nuevos
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {recientes.map((lead) => (
          <Link
            key={lead.id}
            href="/abogados/leads"
            className="block rounded-[10px] border border-borde px-3.5 py-2.5 text-marino hover:border-celeste"
          >
            <div className="flex items-center gap-2">
              <ChipMateria>{lead.materia}</ChipMateria>
              <span className="text-[11px] text-texto-4">
                {lead.ciudad} · {lead.cuando}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.5] text-texto-2">
              {lead.pregunta}
            </p>
          </Link>
        ))}
      </div>

      <Link href="/abogados/leads" className="mt-3 inline-block text-[12.5px]">
        Ver el consultorio →
      </Link>
    </Card>
  );
}

/** "Laboral y Civil" / "Laboral, Civil y Penal" — materias únicas en prosa. */
function listarMaterias(materias: string[]): string {
  const unicas = [...new Set(materias)];
  return unicas.length > 1
    ? `${unicas.slice(0, -1).join(", ")} y ${unicas.at(-1)}`
    : (unicas[0] ?? "");
}

function AccesoRapido({
  href,
  icono,
  children,
}: {
  href: string;
  icono: "ia" | "pasos" | "calc" | "plantillas";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-[10px] border border-borde bg-lienzo px-3.5 py-3 text-[12.5px] font-medium text-marino hover:border-celeste hover:text-celeste"
    >
      <span className="grid shrink-0 place-items-center text-texto-4">
        {icono === "ia" ? <SimboloJusIALinear size={15} /> : <Icono nombre={icono} size={15} />}
      </span>
      {children}
    </Link>
  );
}
