"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton, BotonVolver, Card, Rotulo } from "@/components/ui/primitivos";
import { opcionesDeTipo, origenDeCaso, TIPOS_CASO } from "@/lib/casos";
import { formatearIdentidad, soloDigitos, validarIdentidad } from "@/lib/identidad";
import { usePortal } from "@/store/portal";
import { cn } from "@/lib/utils";
import type { TipoCaso } from "@/types/dominio";

/**
 * Abrir un caso: tipo → acto/trámite/proceso → cliente. El checklist nace del
 * origen y desde ese momento es del expediente. La identidad del cliente es
 * opcional aquí igual que en el alta (§1.4): un caso puede abrirse con una
 * llamada, antes de tener el documento a la vista.
 */
export function NuevoCaso() {
  const router = useRouter();
  const crearCaso = usePortal((s) => s.crearCaso);
  const mostrarToast = usePortal((s) => s.mostrarToast);

  const [tipo, setTipo] = useState<TipoCaso>("notarial");
  const [referenciaId, setReferenciaId] = useState("");
  const [nombre, setNombre] = useState("");
  const [identidad, setIdentidad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  const opciones = opcionesDeTipo(tipo);
  const origen = referenciaId ? origenDeCaso(tipo, referenciaId) : null;

  const cambiarTipo = (t: TipoCaso) => {
    setTipo(t);
    setReferenciaId("");
    setError("");
  };

  const crear = () => {
    if (!referenciaId || !origen) return setError("Elige de qué nace el caso.");
    if (nombre.trim().length < 3) return setError("Escribe el nombre del cliente.");
    const problema = identidad ? validarIdentidad(identidad) : null;
    if (problema) return setError(problema);
    const id = crearCaso({
      cliente: {
        nombre: nombre.trim(),
        identidad: identidad ? soloDigitos(identidad) : undefined,
        telefono: telefono.trim() || undefined,
        correo: correo.trim() || undefined,
      },
      tipo,
      referenciaId,
      titulo: origen.nombre,
      notas: notas.trim(),
      documentos: origen.documentos,
    });
    mostrarToast(`Caso abierto con ${origen.documentos.length} documentos en el checklist`);
    router.push(`/abogados/casos/${id}`);
  };

  return (
    <div className="max-w-[820px]">
      <BotonVolver onClick={() => router.push("/abogados/casos")}>Mis casos</BotonVolver>

      <Card className="mt-3 p-6">
        <Rotulo>1 · De qué nace el caso</Rotulo>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {TIPOS_CASO.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => cambiarTipo(t.id)}
              className={cn(
                "cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors",
                tipo === t.id ? "border-celeste bg-chip" : "border-borde bg-white hover:border-celeste",
              )}
            >
              <span className="block text-[13.5px] font-semibold">{t.etiqueta}</span>
              <span className="mt-0.5 block text-[12px] text-texto-3">{t.descripcion}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {opciones.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setReferenciaId(o.id);
                setError("");
              }}
              className={cn(
                "cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors",
                referenciaId === o.id ? "border-celeste bg-chip" : "border-borde bg-white hover:border-celeste",
              )}
            >
              <span className="block text-[13.5px] font-semibold">{o.nombre}</span>
              <span className="mt-0.5 line-clamp-2 block text-[12px] text-texto-3">{o.resumen}</span>
            </button>
          ))}
        </div>

        {origen && (
          <div className="mt-4 rounded-[10px] border-l-[3px] border-celeste bg-lienzo px-4 py-3 text-[12.5px] text-texto-2">
            El expediente nacerá con <b>{origen.documentos.length} documentos</b> en el checklist
            {origen.fuenteNombre ? `, tomados de ${origen.fuenteNombre}` : ""}.
            {origen.requiereNotario && (
              <>
                {" "}
                <b>Requiere exequátur notarial vigente.</b>
              </>
            )}
            {origen.fuentePendiente && (
              <span className="mt-1 block text-texto-3">{origen.fuentePendiente}</span>
            )}
          </div>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <Rotulo>2 · El cliente</Rotulo>
        <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre completo o razón social" valor={nombre} onCambio={setNombre} placeholder="Ej. Distribuidora Ejemplo S. de R.L." />
          <Campo
            etiqueta="Número de identidad (opcional)"
            valor={identidad}
            onCambio={(v) => setIdentidad(formatearIdentidad(v))}
            placeholder="0801-1990-12345"
          />
          <Campo etiqueta="Teléfono (opcional)" valor={telefono} onCambio={setTelefono} placeholder="+504 9999-9999" />
          <Campo etiqueta="Correo (opcional)" valor={correo} onCambio={setCorreo} placeholder="cliente@ejemplo.com" tipo="email" />
        </div>
        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-texto-2">Notas del caso</span>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Cómo llegó, qué urge, qué acordaron…"
            className="rounded-lg border border-borde bg-white px-3.5 py-2.5 text-[13.5px] text-marino outline-none focus:border-celeste"
          />
        </label>

        {error && (
          <div className="mt-3 rounded-[10px] border border-[#f2c8c2] bg-[#fdf1ef] px-3.5 py-2.5 text-[12.5px] text-[#a33b2e]" role="alert">
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Boton variante="marino" onClick={crear} className="px-5">
            Abrir caso
          </Boton>
          <span className="text-[12px] text-texto-4">
            Hoy el expediente se guarda en este navegador; con la cuenta, en tu despacho.
          </span>
        </div>
      </Card>
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  onCambio,
  placeholder,
  tipo = "text",
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  placeholder: string;
  tipo?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-texto-2">{etiqueta}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-borde bg-white px-3.5 text-[13.5px] text-marino outline-none focus:border-celeste"
      />
    </label>
  );
}
