"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, ChipMateria, Meta, Rotulo, TituloSeccion } from "@/components/ui/primitivos";
import { ABOGADA_DEMO, LEADS } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import { useUpgrade } from "@/components/portal/marco";
import { cn } from "@/lib/utils";
import type { Lead } from "@/types/dominio";

/**
 * Consultas del consultorio gratuito — la Vía B del modelo: la persona
 * pregunta gratis, el abogado Pro responde en público y esa respuesta es su
 * vitrina. Pantalla de trabajo: filtrar → responder inline → medir contactos.
 */
export function PantallaLeads() {
  const esPremium = usePortal((s) => s.plan) === "premium";
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const router = useRouter();
  const params = useSearchParams();
  // Filtros en la URL (patrón del portal): una notificación puede aterrizar
  // en `?materia=Laboral` y el filtro es compartible.
  const filtroMateria = params.get("materia") ?? "todas";
  const soloNuevos = params.get("pendientes") === "1";

  const setFiltros = (materia: string, pendientes: boolean) => {
    const p = new URLSearchParams();
    if (materia !== "todas") p.set("materia", materia);
    if (pendientes) p.set("pendientes", "1");
    const query = p.toString();
    router.replace(`/abogados/leads${query ? `?${query}` : ""}`, { scroll: false });
  };

  const materias = [...new Set(LEADS.map((l) => l.materia))];
  const filtrados = LEADS.filter((l) => {
    const porMateria = filtroMateria === "todas" || l.materia === filtroMateria;
    const porNuevo = !soloNuevos || (l.nuevo && !respondidos[l.id]);
    return porMateria && porNuevo;
  });
  const nuevosSinResponder = LEADS.filter((l) => l.nuevo && !respondidos[l.id]).length;

  return (
    <>
      <p className="mb-3.5 text-[13px] text-texto-3">
        Consultas del consultorio gratuito en tus especialidades.{" "}
        {esPremium
          ? "Con tu plan Premium respondes con prioridad — tu respuesta pública es tu vitrina."
          : "Responder públicamente requiere plan Premium."}
      </p>

      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <FiltroChip
          activo={filtroMateria === "todas"}
          onClick={() => setFiltros("todas", soloNuevos)}
        >
          Todas ({LEADS.length})
        </FiltroChip>
        {materias.map((m) => (
          <FiltroChip key={m} activo={filtroMateria === m} onClick={() => setFiltros(m, soloNuevos)}>
            {m} ({LEADS.filter((l) => l.materia === m).length})
          </FiltroChip>
        ))}
        <span className="mx-1 h-5 w-px bg-borde" />
        <FiltroChip activo={soloNuevos} onClick={() => setFiltros(filtroMateria, !soloNuevos)}>
          Sin responder ({nuevosSinResponder})
        </FiltroChip>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-3">
          {filtrados.map((lead) => (
            <CardLead key={lead.id} lead={lead} esPremium={esPremium} />
          ))}
          {filtrados.length === 0 && (
            <Card className="px-5 py-8 text-center text-[13px] text-texto-3">
              No hay consultas con esos filtros. Cuando alguien pregunte en tus especialidades,
              aparecerá aquí y te avisaremos.
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <TuDesempeno />
          {!esPremium && <CardPrioridad />}
          <ComoFunciona />
        </div>
      </div>
    </>
  );
}

// ── Card de lead con respuesta inline ──────────────────────────────────────

function CardLead({ lead, esPremium }: { lead: Lead; esPremium: boolean }) {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const responderLead = usePortal((s) => s.responderLead);
  const solicitarUpgrade = useUpgrade();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");

  const miRespuesta = respondidos[lead.id];

  const responder = () => {
    if (!esPremium) {
      solicitarUpgrade();
      return;
    }
    setAbierto((v) => !v);
  };

  const publicar = () => {
    const respuesta = texto.trim();
    if (!respuesta) return;
    responderLead(lead.id, respuesta);
    setAbierto(false);
    setTexto("");
    mostrarToast("Tu respuesta se publicó en el consultorio");
  };

  /** Andamiaje del borrador: estructura profesional con [corchetes] — el
   *  criterio jurídico lo pone el abogado, no la demo. */
  const borradorJusIA = () => {
    setTexto(
      `Hola, gracias por tu consulta. En términos generales, en materia ${lead.materia.toLowerCase()} [orientación general — completa con tu criterio]. Ten presente que los plazos legales corren desde [___] y conviene no dejarlos vencer. Para darte una respuesta precisa necesitaría revisar [documentos del caso]. Puedes contactarme desde mi perfil del directorio para una consulta formal.`,
    );
  };

  return (
    <Card className="px-5 py-4.5">
      <div className="flex flex-wrap items-center gap-2">
        <ChipMateria>{lead.materia}</ChipMateria>
        <Meta>
          {lead.ciudad} · {lead.cuando}
        </Meta>
        {lead.nuevo && !miRespuesta && (
          <span className="rounded-full bg-celeste px-2 py-0.5 text-[10.5px] font-bold text-white">
            NUEVO
          </span>
        )}
        {miRespuesta && (
          <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-0.5 text-[10.5px] font-bold text-exito">
            <Icono nombre="check" size={10} strokeWidth={2.6} />
            RESPONDIDA
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-[1.55]">{lead.pregunta}</p>

      {miRespuesta ? (
        <div className="mt-3 rounded-[10px] border-l-[3px] border-exito bg-exito-bg/60 px-4 py-3">
          <Rotulo className="text-exito">Tu respuesta pública</Rotulo>
          <p className="mt-1 text-[13px] leading-[1.55] text-texto-2">{miRespuesta}</p>
        </div>
      ) : (
        abierto && (
          <div className="mt-3 rounded-[10px] border border-borde bg-lienzo p-3.5">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={4}
              placeholder="Escribe una orientación general y cierra invitando al contacto — tu respuesta pública es tu carta de presentación…"
              aria-label={`Respuesta a la consulta de ${lead.ciudad}`}
              className="w-full resize-y rounded-lg border border-borde bg-white px-3.5 py-2.5 text-[13.5px] leading-[1.6] text-marino outline-none focus:border-celeste"
            />
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <BotonJusIA compacto onClick={borradorJusIA}>
                Borrador con Jus IA
              </BotonJusIA>
              <span className="flex-1" />
              <Boton className="px-3.5 py-2 text-[12.5px]" onClick={() => setAbierto(false)}>
                Cancelar
              </Boton>
              <Boton
                variante="celeste"
                className="px-4 py-2 text-[12.5px]"
                disabled={!texto.trim()}
                onClick={publicar}
              >
                Publicar respuesta
              </Boton>
            </div>
            <p className="mt-2 text-[11px] text-texto-4">
              Orientación general, no asesoría del caso concreto — la consulta formal ocurre
              fuera del consultorio.
            </p>
          </div>
        )
      )}

      <div className="mt-3 flex items-center gap-2.5">
        {!miRespuesta && (
          <Boton onClick={responder} className="px-3.5 py-2 text-[12.5px]">
            {esPremium ? (abierto ? "Cerrar" : "Responder") : "Responder (Premium)"}
          </Boton>
        )}
        <span className="text-xs text-texto-4">{etiquetaRespuestas(lead, miRespuesta)}</span>
      </div>
    </Card>
  );
}

/** Conteo de respuestas con gramática correcta y sin contar la tuya como "de otros". */
function etiquetaRespuestas(lead: Lead, miRespuesta: string | undefined): string {
  if (miRespuesta) {
    return lead.respuestas === 0
      ? "Tu respuesta es la primera"
      : `Tu respuesta + ${lead.respuestas} de otros abogados`;
  }
  if (lead.respuestas === 0) return "Sin respuestas aún — sé el primero";
  if (lead.respuestas === 1) return "1 respuesta de otro abogado";
  return `${lead.respuestas} respuestas de otros abogados`;
}

// ── Columna lateral ────────────────────────────────────────────────────────

function TuDesempeno() {
  const respondidos = usePortal((s) => s.leadsRespondidos);
  const respuestas = Object.keys(respondidos).length;

  return (
    <Card className="p-5">
      <TituloSeccion>Tu desempeño en el consultorio</TituloSeccion>
      <div className="mt-3 flex flex-col gap-2 text-[13px]">
        <FilaStat etiqueta="Respuestas publicadas" valor={String(respuestas)} />
        <FilaStat
          etiqueta="Contactos recibidos (30 d)"
          valor={String(ABOGADA_DEMO.metricas.contactos)}
        />
        <FilaStat etiqueta="Valoración media" valor={ABOGADA_DEMO.metricas.valoracion} />
      </div>
      <p className="mt-3 border-t border-borde-suave pt-2.5 text-[11.5px] leading-[1.5] text-texto-4">
        Los leads llegan por tus especialidades ({ABOGADA_DEMO.especialidades.join(" · ")}) —{" "}
        <Link href="/abogados/perfil" className="text-celeste hover:text-marino">
          edítalas en tu perfil
        </Link>
        .
      </p>
    </Card>
  );
}

function FilaStat({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-texto-3">{etiqueta}</span>
      <b>{valor}</b>
    </div>
  );
}

function CardPrioridad() {
  const solicitarUpgrade = useUpgrade();

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Icono nombre="candado" size={15} />
        <TituloSeccion className="text-[14.5px]">Prioridad en leads</TituloSeccion>
      </div>
      <p className="mt-2 text-[12.5px] leading-[1.55] text-texto-3">
        Con Premium respondes públicamente, recibes los leads antes que nadie y tu perfil aparece
        primero en el directorio de tu especialidad.
      </p>
      <Boton variante="marino" className="mt-3.5 w-full py-2.5" onClick={solicitarUpgrade}>
        Ver plan Premium
      </Boton>
    </Card>
  );
}

/** El funnel explicado en 3 pasos — para que el valor del consultorio se entienda solo. */
function ComoFunciona() {
  const pasos = [
    "Una persona pregunta gratis en el consultorio",
    "Tu respuesta pública muestra tu criterio — es tu vitrina",
    "Quien pregunta (y quien lee) te contacta desde el directorio",
  ];

  return (
    <Card className="p-5">
      <TituloSeccion>Cómo funciona</TituloSeccion>
      <ol className="mt-3 flex flex-col gap-2.5">
        {pasos.map((paso, i) => (
          <li key={paso} className="flex items-start gap-2.5 text-[12.5px] leading-[1.5] text-texto-2">
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

function FiltroChip({
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
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-[7px] text-[12.5px] font-medium transition-colors",
        activo
          ? "border-celeste bg-celeste text-white"
          : "border-borde bg-white text-texto-3 hover:border-celeste",
      )}
    >
      {children}
    </button>
  );
}
