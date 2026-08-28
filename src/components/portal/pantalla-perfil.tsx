"use client";

import Link from "next/link";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Icono } from "@/components/brand/iconos";
import { Boton, Card, ChipMateria, Rotulo, TituloSeccion } from "@/components/ui/primitivos";
import { ABOGADA_DEMO, DOCUMENTOS_VALIDACION, getPlan } from "@/data/catalogo";
import { usePortal, useCuota } from "@/store/portal";
import { useUpgrade } from "@/components/portal/marco";

export function PantallaPerfil() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] items-start gap-4">
      <div className="flex flex-col gap-4">
        <TarjetaPerfil />
        <TarjetaValidacion />
      </div>
      <div className="flex flex-col gap-4">
        <TarjetaPlan />
        <TarjetaPrioridadLeads />
        <TarjetaContacto />
      </div>
    </div>
  );
}

function TarjetaPerfil() {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const constanciaSubida = usePortal((s) => s.constanciaSubida);
  const [vistaPublica, setVistaPublica] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="font-display grid h-[72px] w-[72px] place-items-center rounded-full text-2xl font-semibold text-white"
          style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
        >
          {ABOGADA_DEMO.iniciales}
        </div>

        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold whitespace-nowrap">
              {ABOGADA_DEMO.nombre}
            </h2>
            {!ABOGADA_DEMO.verificado && (
              <span className="inline-flex items-center gap-[5px] rounded-full border border-aviso-borde bg-aviso px-2.5 py-[3px] text-[11px] font-semibold text-aviso-texto">
                <Icono nombre="reloj" size={11} strokeWidth={2.2} />
                {constanciaSubida ? "En revisión (1–2 días hábiles)" : "Verificación pendiente"}
              </span>
            )}
          </div>
          <p className="mt-[3px] text-[13px] text-texto-3">
            {ABOGADA_DEMO.colegiacion} · {ABOGADA_DEMO.ciudad}
          </p>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-texto-2">{ABOGADA_DEMO.bio}</p>
        </div>

        <div className="flex flex-col gap-2 self-start">
          <Link
            href="/abogados/configuracion"
            className="rounded-lg border border-borde bg-lienzo px-3.5 py-2 text-center text-[12.5px] whitespace-nowrap text-marino hover:border-celeste hover:text-celeste"
          >
            Editar perfil
          </Link>
          <button
            type="button"
            onClick={() => setVistaPublica(true)}
            className="cursor-pointer rounded-lg border border-borde bg-white px-3.5 py-2 text-[12.5px] whitespace-nowrap text-celeste hover:border-celeste"
          >
            Ver perfil público
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs tracking-[.4px] text-texto-3 uppercase">
          Especialidades visibles en el directorio
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ABOGADA_DEMO.especialidades.map((esp) => (
            <span
              key={esp}
              className="rounded-full bg-chip px-3 py-[5px] text-[12.5px] font-medium text-celeste"
            >
              {esp}
            </span>
          ))}
          <button
            type="button"
            onClick={() => mostrarToast("Directorio: máx. 3 especialidades visibles en tu plan")}
            className="cursor-pointer rounded-full border border-dashed border-[#c9d5e4] bg-white px-3 py-[5px] text-[12.5px] text-texto-3 hover:border-celeste hover:text-celeste"
          >
            + Agregar
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metrica valor={String(ABOGADA_DEMO.metricas.vistas)} etiqueta="Vistas del perfil (30 d)" />
        <Metrica valor={String(ABOGADA_DEMO.metricas.contactos)} etiqueta="Contactos recibidos" />
        <Metrica valor={ABOGADA_DEMO.metricas.valoracion} etiqueta="Valoración media" />
      </div>

      <ModalVistaPublica
        abierto={vistaPublica}
        onCerrar={() => setVistaPublica(false)}
        validado={constanciaSubida}
      />
    </Card>
  );
}

/**
 * Cómo ve el público el perfil en el directorio (Vía B): la insignia de
 * validado es el incentivo — se ve distinta con la constancia subida.
 */
function ModalVistaPublica({
  abierto,
  onCerrar,
  validado,
}: {
  abierto: boolean;
  onCerrar: () => void;
  validado: boolean;
}) {
  const mostrarToast = usePortal((s) => s.mostrarToast);

  return (
    <Dialog.Root open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(10,24,48,.55)]" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[420px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white"
          style={{ boxShadow: "var(--shadow-modal)", animation: "fadeUp .25s ease" }}
        >
          <Dialog.Title className="sr-only">Vista pública de tu perfil</Dialog.Title>
          <div className="bg-lienzo px-6 py-2.5 text-center text-[11px] font-semibold tracking-[1px] text-texto-4 uppercase">
            Así te ve quien busca abogado
          </div>

          <div className="px-7 py-6">
            <div className="flex items-center gap-4">
              <div
                className="font-display grid h-[64px] w-[64px] place-items-center rounded-full text-xl font-semibold text-white"
                style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
              >
                {ABOGADA_DEMO.iniciales}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[17px] font-bold text-marino">
                    {ABOGADA_DEMO.nombre}
                  </span>
                  {validado ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[3px] text-[10.5px] font-bold text-exito">
                      <Icono nombre="check" size={10} strokeWidth={2.6} />
                      Validado
                    </span>
                  ) : (
                    <span className="rounded-full border border-aviso-borde bg-aviso px-2 py-[3px] text-[10.5px] font-semibold text-aviso-texto">
                      Sin validar
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[12.5px] text-texto-3">
                  {ABOGADA_DEMO.ciudad} · ★ {ABOGADA_DEMO.metricas.valoracion} ·{" "}
                  {ABOGADA_DEMO.metricas.contactos} contactos
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {ABOGADA_DEMO.especialidades.map((esp) => (
                <ChipMateria key={esp}>{esp}</ChipMateria>
              ))}
            </div>

            <p className="mt-3 text-[13px] leading-[1.6] text-texto-2">{ABOGADA_DEMO.bio}</p>

            <Boton
              variante="celeste"
              className="mt-4.5 w-full py-[11px]"
              onClick={() => mostrarToast("Así inicia el contacto un cliente del directorio")}
            >
              Contactar por WhatsApp
            </Boton>
            {!validado && (
              <p className="mt-2.5 text-center text-[11.5px] text-texto-4">
                La insignia de validado genera hasta 3× más contactos — sube tu constancia CAH.
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Metrica({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="rounded-[10px] bg-lienzo p-3.5">
      <div className="font-display text-[22px] font-bold">{valor}</div>
      <div className="text-[11.5px] text-texto-3">{etiqueta}</div>
    </div>
  );
}

function TarjetaValidacion() {
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const constanciaSubida = usePortal((s) => s.constanciaSubida);
  const subirConstancia = usePortal((s) => s.subirConstancia);
  const recibidos =
    DOCUMENTOS_VALIDACION.filter((d) => d.estado === "recibido").length +
    (constanciaSubida ? 1 : 0);

  return (
    <Card id="validacion" className="scroll-mt-6 p-6">
      <div className="flex items-baseline gap-2.5">
        <TituloSeccion className="text-base font-bold">Validación profesional</TituloSeccion>
        <span className="text-xs text-texto-4">
          {recibidos} de {DOCUMENTOS_VALIDACION.length} documentos recibidos
        </span>
      </div>
      <p className="mt-1 text-[12.5px] leading-[1.5] text-texto-3">
        Un perfil validado aparece con insignia en el directorio y genera hasta 3× más contactos.
        Revisamos los documentos en 1–2 días hábiles.
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        {DOCUMENTOS_VALIDACION.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-[10px] border border-borde px-3.5 py-3"
          >
            <span className="grid place-items-center text-texto-4">
              <Icono nombre="documento" size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold">{doc.nombre}</div>
              <div className="mt-px text-[11.5px] text-texto-4">{doc.meta}</div>
            </div>

            {doc.estado === "recibido" ? (
              <span className="inline-flex items-center gap-[5px] rounded-full bg-exito-bg px-2.5 py-1 text-[11.5px] font-semibold text-exito">
                <Icono nombre="check" size={11} strokeWidth={2.4} />
                Recibido
              </span>
            ) : constanciaSubida ? (
              <span className="inline-flex items-center gap-[5px] rounded-full border border-aviso-borde bg-aviso px-2.5 py-1 text-[11.5px] font-semibold text-aviso-texto">
                <Icono nombre="reloj" size={11} strokeWidth={2.2} />
                En revisión
              </span>
            ) : (
              <Boton
                variante="marino"
                icono="subir"
                className="px-3.5 py-2 text-xs"
                onClick={() => {
                  subirConstancia();
                  mostrarToast("Documento recibido — lo revisamos en 1–2 días hábiles");
                }}
              >
                Subir documento
              </Boton>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TarjetaPlan() {
  const cuota = useCuota();
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const ciclo = usePortal((s) => s.cicloPlan);
  const info = getPlan(usePortal((s) => s.plan));
  const etiquetaPrecio = info
    ? ciclo === "anual"
      ? `${info.precioAnualEtiqueta}/año`
      : `${info.precioEtiqueta}/mes`
    : "";

  return (
    <Card className="overflow-hidden p-0">
      <div
        className="px-5 py-4.5 text-white"
        style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
      >
        <Rotulo className="text-sobre-marino">Tu plan</Rotulo>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="font-display text-[22px] font-bold">
            {cuota.esPremium ? "Premium" : "Profesional"}
          </div>
          <div className="text-[13px] text-sobre-marino-2">{etiquetaPrecio}</div>
        </div>
        <div className="mt-0.5 text-[11.5px] text-sobre-marino">
          {ciclo === "anual"
            ? "Pago anual — se renueva el 1 de septiembre de 2027"
            : "Se renueva el 1 de septiembre de 2026"}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex justify-between text-xs text-texto-3">
          <span>Jus IA este mes</span>
          <b className="text-marino">{cuota.etiqueta}</b>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-sutil">
          <div
            className="h-full rounded bg-celeste transition-[width]"
            style={{ width: `${cuota.porcentaje}%` }}
          />
        </div>

        <div className="mt-3.5 flex items-center gap-2.5 text-[12.5px] text-texto-3">
          <Icono nombre="card" size={15} />
          VISA terminada en 4821
        </div>

        <div className="mt-3.5 flex gap-2">
          <Link
            href="/abogados/planes"
            className="flex-1 rounded-lg bg-marino py-[9px] text-center text-[12.5px] font-semibold text-white hover:bg-celeste hover:text-white"
          >
            Cambiar plan
          </Link>
          <Boton
            className="flex-1 py-[9px] text-[12.5px]"
            onClick={() =>
              mostrarToast("El historial de facturas llega con la facturación real")
            }
          >
            Ver facturas
          </Boton>
        </div>
      </div>
    </Card>
  );
}

function TarjetaPrioridadLeads() {
  const esPremium = usePortal((s) => s.plan) === "premium";
  const solicitarUpgrade = useUpgrade();
  if (esPremium) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Icono nombre="candado" size={15} />
        <TituloSeccion className="text-[14.5px]">Prioridad en leads</TituloSeccion>
      </div>
      <p className="mt-2 text-[12.5px] leading-[1.55] text-texto-3">
        Con Premium, tu perfil aparece primero cuando alguien busca tu especialidad y recibes los leads
        del consultorio antes que nadie.
      </p>
      <Boton variante="marino" className="mt-3.5 w-full py-2.5" onClick={solicitarUpgrade}>
        Ver plan Premium
      </Boton>
    </Card>
  );
}

function TarjetaContacto() {
  return (
    <Card className="p-5">
      <TituloSeccion className="text-[14.5px]">Contacto público</TituloSeccion>
      <div className="mt-3 flex flex-col gap-[9px] text-[12.5px] text-texto-2">
        <LineaContacto icono="correo">{ABOGADA_DEMO.email}</LineaContacto>
        <LineaContacto icono="telefono">{ABOGADA_DEMO.whatsapp} (WhatsApp)</LineaContacto>
        <LineaContacto icono="ubicacion">{ABOGADA_DEMO.direccion}</LineaContacto>
      </div>
    </Card>
  );
}

function LineaContacto({
  icono,
  children,
}: {
  icono: "correo" | "telefono" | "ubicacion";
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-[9px]">
      <span className="grid place-items-center text-texto-4">
        <Icono nombre={icono} size={14} />
      </span>
      {children}
    </div>
  );
}
