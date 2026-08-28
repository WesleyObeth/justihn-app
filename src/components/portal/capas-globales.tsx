"use client";

/**
 * Capas que flotan sobre todas las pantallas: toast, modal de mejora de plan y
 * el editor de escritos. Viven en el layout del portal para que sobrevivan a la
 * navegación entre rutas (un borrador abierto no se pierde al cambiar de vista).
 */
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { SimboloJusIALinear } from "@/components/brand/logos";
import { Boton } from "@/components/ui/primitivos";
import { usePortal } from "@/store/portal";
import { OFERTA, getPlan } from "@/data/catalogo";

const DURACION_TOAST = 2600;

export function Toast() {
  const toast = usePortal((s) => s.toast);
  const ocultarToast = usePortal((s) => s.ocultarToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(ocultarToast, DURACION_TOAST);
    return () => window.clearTimeout(id);
  }, [toast, ocultarToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[26px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-[9px] rounded-[10px] bg-marino px-5 py-3 text-[13.5px] text-white"
      style={{ boxShadow: "var(--shadow-toast)", animation: "fadeUp .25s ease" }}
    >
      <Icono nombre="check" size={14} strokeWidth={2.4} className="text-[#7ac98f]" />
      {toast}
    </div>
  );
}

/** Modal de mejora a Pro. Se abre desde toda función bloqueada del plan Base. */
export function ModalUpgrade({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const planPremium = getPlan("premium")!;

  return (
    <Dialog.Root open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(10,24,48,.55)]" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[440px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8"
          style={{ boxShadow: "var(--shadow-modal)", animation: "fadeUp .25s ease" }}
        >
          <div
            className="grid h-11 w-11 place-items-center rounded-xl"
            style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
          >
            <Icono nombre="candado" size={20} className="text-dorado" />
          </div>

          <Dialog.Title className="wordmark mt-3.5 text-[21px]">
            Mejora a Justihn Premium
          </Dialog.Title>
          <Dialog.Description className="mt-1.5 text-[13.5px] leading-[1.55] text-texto-3">
            Todo lo del plan Profesional, más:
          </Dialog.Description>

          <ul className="mt-3.5 flex flex-col gap-[9px]">
            {planPremium.features.map((f) => (
              <li key={f} className="flex gap-2 text-[13.5px]">
                <span className="text-celeste">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-baseline gap-2 rounded-[10px] bg-lienzo px-4 py-3.5">
            <span className="font-display text-2xl font-bold">{planPremium.precioEtiqueta}</span>
            <span className="text-[12.5px] text-texto-3">
              /mes · o {planPremium.precioAnualEtiqueta} al año ({OFERTA.descuentoAnual})
            </span>
          </div>

          <div className="mt-4.5 flex gap-2.5">
            <Boton variante="suave" className="flex-1 py-[11px]" onClick={onCerrar}>
              Ahora no
            </Boton>
            <Boton
              variante="marino"
              className="flex-[1.4] py-[11px]"
              onClick={() => {
                onCerrar();
                router.push("/abogados/planes");
              }}
            >
              Ver planes
            </Boton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Editor de escritos (slide-over). El borrador es del profesional: se abre
 * editable, con la advertencia de responsabilidad siempre visible — Jus IA
 * asiste, no firma.
 */
export function EditorEscrito() {
  const escrito = usePortal((s) => s.escrito);
  const setTexto = usePortal((s) => s.setTextoEscrito);
  const cerrar = usePortal((s) => s.cerrarEscrito);
  const mostrarToast = usePortal((s) => s.mostrarToast);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(escrito.texto);
      mostrarToast("Escrito copiado al portapapeles");
    } catch {
      mostrarToast("No se pudo copiar — selecciona el texto manualmente");
    }
  };

  return (
    <Dialog.Root open={escrito.abierto} onOpenChange={(v) => !v && cerrar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[54] bg-[rgba(10,24,48,.25)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-0 right-0 bottom-0 z-[55] flex w-[540px] max-w-[94vw] flex-col bg-white"
          style={{ boxShadow: "var(--shadow-lateral)", animation: "fadeUp .25s ease" }}
        >
          <div
            className="flex items-center gap-3 px-5 py-4 text-white"
            style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
          >
            <SimboloJusIALinear size={18} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-display truncate text-[15px] font-bold">
                {escrito.titulo}
              </Dialog.Title>
              <div className="text-[11px] text-sobre-marino">
                Borrador generado por Jus IA · citas verificadas incluidas
              </div>
            </div>
            <Dialog.Close
              className="grid cursor-pointer place-items-center text-sobre-marino hover:text-white"
              aria-label="Cerrar editor"
            >
              <Icono nombre="cerrar" size={16} strokeWidth={2} />
            </Dialog.Close>
          </div>

          <div className="border-b border-aviso-borde bg-aviso px-5 py-[9px] text-[12px] text-aviso-cuerpo">
            Revisa y completa los datos entre [corchetes] antes de presentar. La responsabilidad
            del escrito es del profesional.
          </div>

          <textarea
            value={escrito.texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Cuerpo del escrito"
            className="flex-1 resize-none border-none bg-white px-6 py-5 text-[13.5px] leading-[1.75] text-marino outline-none"
          />

          <div className="flex gap-2.5 border-t border-borde px-5 py-3.5">
            <Boton variante="marino" className="flex-1 py-[11px]" onClick={copiar}>
              Copiar escrito
            </Boton>
            <Boton
              variante="suave"
              className="flex-1 py-[11px]"
              onClick={() => mostrarToast("Descargando borrador .docx…")}
            >
              Descargar .docx
            </Boton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
