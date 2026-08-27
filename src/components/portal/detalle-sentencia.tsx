"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, BotonVolver, Card, ChipMateria, Meta, Rotulo } from "@/components/ui/primitivos";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import { SENTENCIAS } from "@/data/sentencias";
import type { Sentencia } from "@/types/dominio";

export function DetalleSentencia({ sentencia }: { sentencia: Sentencia }) {
  const router = useRouter();
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntar = usePreguntarAJusIA();

  // La pregunta lleva el EXPEDIENTE: así Jus IA reconoce la sentencia y
  // responde con su tarjeta y resumen reales, no con la respuesta genérica.
  const preguntarAJusIA = () =>
    preguntar(
      `Explícame el criterio de la sentencia ${sentencia.expediente} y cómo aplicarlo a mi caso`,
    );

  const copiarCita = async () => {
    const cita = `${sentencia.expediente}, ${sentencia.organo}, ${sentencia.fecha}. Ponente: ${sentencia.ponente}.`;
    try {
      await navigator.clipboard.writeText(cita);
      mostrarToast("Cita copiada al portapapeles");
    } catch {
      mostrarToast("No se pudo copiar — selecciona el texto manualmente");
    }
  };

  return (
    <div className="mt-4">
      <BotonVolver onClick={() => router.push("/abogados/jurisprudencia")}>
        Volver a resultados
      </BotonVolver>

      {/* Columna principal estirada + lateral fija: sin hueco a la derecha
          (mismo patrón que el detalle de publicación). */}
      <div className="grid max-w-[1280px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-7">
        <div className="flex items-center gap-2">
          <ChipMateria>{sentencia.materia}</ChipMateria>
          <Meta>
            {sentencia.organo} · {sentencia.fecha}
          </Meta>
        </div>

        <h2 className="font-display mt-2.5 text-xl leading-[1.35] font-bold">{sentencia.titulo}</h2>

        <div className="mt-4.5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
          <Ficha etiqueta="Expediente" valor={sentencia.expediente} mono />
          <Ficha etiqueta="Ponente" valor={sentencia.ponente} />
          <Ficha etiqueta="Fallo" valor={sentencia.fallo} />
        </div>

        {/* El resumen del CEDIJ viene con la sentencia en la API del PJ — es
            el diferencial del corpus y merece jerarquía propia. */}
        <div className="mt-5 rounded-[10px] border-l-[3px] border-celeste bg-lienzo px-4.5 py-3.5">
          <Rotulo className="text-celeste">Resumen oficial · CEDIJ</Rotulo>
          <p className="mt-1.5 text-[13.5px] leading-[1.65] text-texto-2">{sentencia.resumen}</p>
        </div>

        <h3 className="mt-5.5 text-xs tracking-[.6px] text-texto-4 uppercase">
          Extracto del criterio
        </h3>
        <p className="mt-2 text-sm leading-[1.75] whitespace-pre-line text-texto-2">
          {sentencia.extracto}
        </p>

        <div className="mt-5.5 flex flex-wrap gap-2.5">
          <BotonJusIA onClick={preguntarAJusIA}>Preguntar a Jus IA sobre esta sentencia</BotonJusIA>
          <Boton onClick={copiarCita}>Copiar cita</Boton>
          <Boton
            onClick={() => {
              if (sentencia.fuenteUrl) window.open(sentencia.fuenteUrl, "_blank", "noopener");
              else mostrarToast("PDF oficial disponible al conectar el corpus de la CSJ");
            }}
          >
            PDF oficial
          </Boton>
        </div>
      </Card>

      <Relacionadas actual={sentencia} />
      </div>
    </div>
  );
}

/**
 * Columna lateral: sentencias de la misma materia primero, completada con las
 * demás recientes. Bajo `lg` cae debajo de la sentencia.
 */
function Relacionadas({ actual }: { actual: Sentencia }) {
  const otras = SENTENCIAS.filter((s) => s.id !== actual.id);
  const relacionadas = [
    ...otras.filter((s) => s.materia === actual.materia),
    ...otras.filter((s) => s.materia !== actual.materia),
  ].slice(0, 3);

  if (relacionadas.length === 0) return null;

  return (
    <aside>
      <h3 className="text-xs tracking-[.6px] text-texto-4 uppercase">Sentencias relacionadas</h3>
      <div className="mt-2.5 flex flex-col gap-3">
        {relacionadas.map((s) => (
          <Link key={s.id} href={`/abogados/jurisprudencia/${s.id}`} className="block text-marino">
            <Card interactiva className="px-4.5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <ChipMateria>{s.materia}</ChipMateria>
                <Meta>{s.fecha}</Meta>
              </div>
              <div className="font-display mt-2 text-[13.5px] leading-[1.4] font-semibold">
                {s.titulo}
              </div>
              <div className="mt-1 text-[11.5px] text-texto-4">{s.organo}</div>
              <div className="mt-1.5 text-[12.5px] text-celeste">Ver sentencia →</div>
            </Card>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function Ficha({ etiqueta, valor, mono }: { etiqueta: string; valor: string; mono?: boolean }) {
  return (
    <div className="rounded-[9px] bg-lienzo px-3.5 py-[11px]">
      <div className="text-[10.5px] tracking-[.6px] text-texto-4 uppercase">{etiqueta}</div>
      <div className={`mt-0.5 text-[13px] font-semibold ${mono ? "font-mono" : ""}`}>{valor}</div>
    </div>
  );
}
