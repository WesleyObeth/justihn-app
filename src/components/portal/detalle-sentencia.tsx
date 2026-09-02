"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, BotonVolver, Card, ChipMateria, Meta, Rotulo } from "@/components/ui/primitivos";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import type { FichaJurisprudencial } from "@/lib/corpus/ficha";
import type { Sentencia } from "@/types/dominio";

/**
 * Lo que la ficha del corpus añade al contrato del seed. Es opcional porque los
 * 12 seeds del piloto siguen sirviendo cuando la sentencia no está en la base.
 */
type SentenciaMostrable = Sentencia & {
  proceso?: string | null;
  ficha?: FichaJurisprudencial;
};

export function DetalleSentencia({
  sentencia,
  relacionadas,
}: {
  sentencia: SentenciaMostrable;
  relacionadas: Sentencia[];
}) {
  const router = useRouter();
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntar = usePreguntarAJusIA();
  const ficha = sentencia.ficha;

  // La pregunta lleva el EXPEDIENTE: así Jus IA reconoce la sentencia y
  // responde con su tarjeta y resumen reales, no con la respuesta genérica.
  const preguntarAJusIA = () =>
    preguntar(
      `Explícame el criterio de la sentencia ${sentencia.expediente} y cómo aplicarlo a mi caso`,
    );

  const copiarCita = async () => {
    // Con ficha, quien resolvió es la CSJ y el proceso dice qué sala: eso es lo
    // que se cita. `organo` del seed era el tribunal de procedencia.
    const cita = ficha
      ? `${sentencia.expediente}, Corte Suprema de Justicia de Honduras${sentencia.proceso ? ` (${sentencia.proceso})` : ""}, ${sentencia.fecha}. Ponente: ${sentencia.ponente}.`
      : `${sentencia.expediente}, ${sentencia.organo}, ${sentencia.fecha}. Ponente: ${sentencia.ponente}.`;
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
          <div className="flex flex-wrap items-center gap-2">
            <ChipMateria>{sentencia.materia}</ChipMateria>
            <Meta>
              {sentencia.proceso ?? sentencia.organo} · {sentencia.fecha}
            </Meta>
            {ficha?.vigencia && (
              <Meta className="rounded-md bg-exito-bg px-1.5 py-[2px] font-semibold text-exito">
                {ficha.vigencia}
              </Meta>
            )}
          </div>

          <h2 className="font-display mt-2.5 text-xl leading-[1.35] font-bold">
            {sentencia.titulo}
          </h2>

          <div className="mt-4.5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
            <Ficha etiqueta="Expediente" valor={sentencia.expediente} mono />
            <Ficha etiqueta="Ponente" valor={sentencia.ponente} />
            <Ficha etiqueta="Fallo" valor={sentencia.fallo} />
          </div>

          {ficha && (
            <div className="mt-2.5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
              {ficha.recurrente && <Ficha etiqueta="Recurrente" valor={ficha.recurrente} />}
              {ficha.recurrido && <Ficha etiqueta="Recurrido" valor={ficha.recurrido} />}
              <Ficha
                etiqueta="Tribunal de procedencia"
                valor={ficha.tribunalProcedencia ?? "No consta en la ficha"}
                apagado={!ficha.tribunalProcedencia}
              />
              {ficha.fechaSentenciaRecurrida && (
                <Ficha etiqueta="Sentencia recurrida" valor={ficha.fechaSentenciaRecurrida} />
              )}
              {ficha.jerarquia && (
                <Ficha etiqueta="Jerarquía jurisprudencial" valor={ficha.jerarquia} />
              )}
            </div>
          )}

          {/* El resumen del CEDIJ viene con la sentencia en la API del PJ — es
              el diferencial del corpus y merece jerarquía propia. */}
          {sentencia.resumen && (
            <div className="mt-5 rounded-[10px] border-l-[3px] border-celeste bg-lienzo px-4.5 py-3.5">
              <Rotulo className="text-celeste">Hechos relevantes · resumen del CEDIJ</Rotulo>
              <p className="mt-1.5 text-[13.5px] leading-[1.65] text-texto-2">
                {sentencia.resumen}
              </p>
            </div>
          )}

          {ficha?.motivo && (
            <p className="mt-3.5 text-[12.5px] leading-[1.6] text-texto-3">
              <b className="text-texto-2">Motivo de la casación:</b> {ficha.motivo}
            </p>
          )}
          {ficha?.actoRecurrido && (
            <p className="mt-2 text-[12.5px] leading-[1.6] text-texto-3">
              <b className="text-texto-2">Acto recurrido:</b> {ficha.actoRecurrido}
            </p>
          )}

          {ficha ? (
            <Problemas ficha={ficha} />
          ) : (
            <>
              <h3 className="mt-5.5 text-xs tracking-[.6px] text-texto-4 uppercase">
                Extracto del criterio
              </h3>
              <p className="mt-2 text-sm leading-[1.75] whitespace-pre-line text-texto-2">
                {sentencia.extracto}
              </p>
            </>
          )}

          {ficha && ficha.legislacion.length > 0 && (
            <>
              <h3 className="mt-5.5 text-xs tracking-[.6px] text-texto-4 uppercase">
                Legislación aplicada
              </h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {ficha.legislacion.map((norma) => (
                  <li
                    key={norma}
                    className="rounded-md border border-borde bg-white px-2.5 py-1 text-[12.5px] text-texto-2"
                  >
                    {norma}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-5.5 flex flex-wrap gap-2.5">
            <BotonJusIA onClick={preguntarAJusIA}>
              Preguntar a Jus IA sobre esta sentencia
            </BotonJusIA>
            <Boton onClick={copiarCita}>Copiar cita</Boton>
            {sentencia.fuenteUrl ? (
              <a
                href={sentencia.fuenteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-borde bg-white px-4 py-2.5 text-[13px] text-marino hover:border-celeste"
              >
                Abrir en el portal del Poder Judicial ↗
              </a>
            ) : (
              <Boton
                onClick={() => mostrarToast("Enlace oficial disponible al conectar el corpus")}
              >
                Documento oficial
              </Boton>
            )}
          </div>

          {ficha && (
            <p className="mt-4 text-[11.5px] leading-[1.55] text-texto-4">
              Esta es la ficha jurisprudencial que redacta el CEDIJ sobre la sentencia; el texto
              íntegro del fallo se consulta en el portal del Poder Judicial con el enlace de arriba.
            </p>
          )}
        </Card>

        <Relacionadas relacionadas={relacionadas} />
      </div>
    </div>
  );
}

/**
 * Los problemas jurídicos de la ficha: ruta del tesauro, la pregunta que la
 * sala respondió, su respuesta y las consideraciones textuales. Es la parte que
 * un abogado lee de verdad — el resto del encabezado ya lo tiene el expediente.
 */
function Problemas({ ficha }: { ficha: FichaJurisprudencial }) {
  if (ficha.problemas.length === 0) return null;
  return (
    <div className="mt-5.5 flex flex-col gap-4">
      {ficha.problemas.map((p, i) => (
        <section key={i} className="rounded-[10px] border border-borde px-4.5 py-4">
          {p.tesauro.length > 0 && (
            <p className="text-[11.5px] leading-[1.6] text-texto-4">
              {p.tesauro.map((nivel, j) => (
                <span key={j}>
                  {j > 0 && <span className="mx-1.5 text-borde">›</span>}
                  {nivel}
                </span>
              ))}
            </p>
          )}
          {p.pregunta && (
            <h3 className="font-display mt-1.5 text-[15px] leading-[1.4] font-semibold">
              {p.pregunta}
            </h3>
          )}
          {p.respuesta && (
            <div className="mt-3">
              <Rotulo className="text-celeste">Respuesta al problema jurídico</Rotulo>
              <p className="mt-1 text-[13.5px] leading-[1.65] text-texto-2">{p.respuesta}</p>
            </div>
          )}
          {p.consideraciones && (
            <div className="mt-3">
              <Rotulo>Consideraciones de la sala</Rotulo>
              <blockquote className="mt-1 border-l-2 border-borde pl-3.5 text-[13px] leading-[1.75] text-texto-2">
                {p.consideraciones}
              </blockquote>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

/**
 * Columna lateral. Con el corpus: lo último de la misma materia y tipo de
 * proceso. Con el seed: las demás del piloto. Bajo `lg` cae debajo.
 */
function Relacionadas({ relacionadas }: { relacionadas: Sentencia[] }) {
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
              <div className="mt-1 text-[11.5px] text-texto-4">
                {(s as SentenciaMostrable).proceso ?? s.organo}
              </div>
              <div className="mt-1.5 text-[12.5px] text-celeste">Ver sentencia →</div>
            </Card>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function Ficha({
  etiqueta,
  valor,
  mono,
  apagado,
}: {
  etiqueta: string;
  valor: string;
  mono?: boolean;
  apagado?: boolean;
}) {
  return (
    <div className="rounded-[9px] bg-lienzo px-3.5 py-[11px]">
      <div className="text-[10.5px] tracking-[.6px] text-texto-4 uppercase">{etiqueta}</div>
      <div
        className={`mt-0.5 text-[13px] font-semibold ${mono ? "font-mono" : ""} ${apagado ? "text-texto-4" : ""}`}
      >
        {valor}
      </div>
    </div>
  );
}
