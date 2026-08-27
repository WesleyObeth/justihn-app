"use client";

/**
 * Vista previa de un modelo de escrito, abierta a todos los planes: hace
 * tangible qué se desbloquea con Pro en lugar de mostrar solo un candado.
 * La usan la pantalla de Modelos y el "paso a paso" (modelo del proceso).
 */
import * as Dialog from "@radix-ui/react-dialog";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, ChipMateria } from "@/components/ui/primitivos";
import { usePortal } from "@/store/portal";
import { useUpgrade } from "@/components/portal/marco";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";
import type { Plantilla } from "@/types/dominio";

export function ModalVistaPrevia({
  plantilla,
  onCerrar,
}: {
  plantilla: Plantilla | null;
  onCerrar: () => void;
}) {
  const esPro = usePortal((s) => s.plan) === "pro";
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const solicitarUpgrade = useUpgrade();
  const preguntar = usePreguntarAJusIA();

  const descargar = (nombre: string) => {
    onCerrar();
    if (esPro) mostrarToast(`Modelo "${nombre}" descargado — listo para editar`);
    else solicitarUpgrade();
  };

  /** Jus IA genera el borrador con las citas — se abre el editor de escritos. */
  const adaptar = (nombre: string) => {
    onCerrar();
    preguntar(`Redacta un borrador basado en el modelo "${nombre}" adaptado a mi caso`, {
      enviarDirecto: true,
    });
  };

  return (
    <Dialog.Root open={plantilla !== null} onOpenChange={(v) => !v && onCerrar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(10,24,48,.55)]" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[86vh] w-[560px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white"
          style={{ boxShadow: "var(--shadow-modal)", animation: "fadeUp .25s ease" }}
        >
          {plantilla && (
            <>
              <div className="px-7 pt-6">
                <div className="flex items-center gap-2">
                  <ChipMateria>{plantilla.tipo}</ChipMateria>
                  <span className="text-[11px] text-texto-4">Modelo de escrito</span>
                </div>
                <Dialog.Title className="font-display mt-2 text-[19px] leading-[1.3] font-bold text-marino">
                  {plantilla.nombre}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[12.5px] text-texto-3">
                  {plantilla.desc} Completa los datos entre [corchetes] al editarla.
                </Dialog.Description>
              </div>

              <div className="relative mx-7 mt-4 min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-borde bg-lienzo px-5 py-4">
                <span className="absolute top-2.5 right-3 rounded-full border border-borde bg-white px-2.5 py-[3px] text-[10px] font-bold tracking-[1px] text-texto-4 uppercase">
                  Vista previa
                </span>
                <p className="font-mono text-[12px] leading-[1.8] whitespace-pre-line text-texto-2">
                  {plantilla.vistaPrevia}
                </p>
                <p className="mt-3 text-[11.5px] text-texto-4">
                  … el documento completo incluye petitorio, fundamentos de derecho y anexos.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 px-7 py-5">
                <Boton variante="suave" className="py-[11px]" onClick={onCerrar}>
                  Cerrar
                </Boton>
                <BotonJusIA className="flex-1 py-[11px]" onClick={() => adaptar(plantilla.nombre)}>
                  Adaptar con Jus IA
                </BotonJusIA>
                <Boton
                  variante="marino"
                  icono={esPro ? undefined : "candado"}
                  className="flex-1 py-[11px]"
                  onClick={() => descargar(plantilla.nombre)}
                >
                  {esPro ? "Descargar" : "Editar con Pro"}
                </Boton>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
