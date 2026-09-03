"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentoPropuestaVista } from "@/components/portal/documento-propuesta";
import { useUpgrade } from "@/components/portal/marco";
import { Boton, BotonVolver, Card, Rotulo } from "@/components/ui/primitivos";
import { useHoy } from "@/hooks/use-saludo";
import { opcionesDeTipo, TIPOS_CASO } from "@/lib/casos";
import { armarPropuesta } from "@/lib/honorarios";
import { useMiPerfil } from "./proveedor-perfil";
import { usePortal, useStoreHidratado } from "@/store/portal";
import { cn } from "@/lib/utils";
import type { PropuestaHonorarios, TipoCaso } from "@/types/dominio";

const FORMAS_PAGO = [
  "en un solo pago",
  "50% al inicio y 50% a la entrega",
  "en tres pagos iguales",
  "contra entrega del permiso o resolución",
];

/**
 * Nueva propuesta: el abogado elige de qué nace, pone honorarios y cliente, y
 * ve el documento armarse debajo en vivo. Si viene desde un caso
 * (`?caso=`), el origen y el cliente ya llegan puestos y al guardar se enlaza.
 *
 * Guardar y descargar son Premium (es la función que justifica el plan frente
 * a los US$20 de ChatGPT); armar la vista previa es libre, porque enseña el
 * valor antes de pedir el pago (§4.5: la demo no promete, muestra).
 */
export function NuevaPropuesta() {
  const router = useRouter();
  const params = useSearchParams();
  const hidratado = useStoreHidratado();
  const casoId = params.get("caso") ?? undefined;
  const caso = usePortal((s) => s.casos.find((c) => c.id === casoId));
  const perfil = useMiPerfil();
  const guardarPropuesta = usePortal((s) => s.guardarPropuesta);
  const actualizarCaso = usePortal((s) => s.actualizarCaso);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const esPremium = usePortal((s) => s.plan) === "premium";
  const solicitarUpgrade = useUpgrade();
  const hoy = useHoy();

  const [tipo, setTipo] = useState<TipoCaso>(caso?.tipo ?? (params.get("tipo") as TipoCaso | null) ?? "tramite");
  const [referenciaId, setReferenciaId] = useState(caso?.referenciaId ?? params.get("tramite") ?? "");
  const [nombre, setNombre] = useState(caso?.cliente.nombre ?? "");
  const [rtn, setRtn] = useState("");
  const [atencion, setAtencion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [honorarios, setHonorarios] = useState("");
  const [formaPago, setFormaPago] = useState(FORMAS_PAGO[0]!);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  // El caso puede llegar después de la hidratación: se siembra una vez.
  const [sembrado, setSembrado] = useState(false);
  if (hidratado && caso && !sembrado) {
    setSembrado(true);
    setTipo(caso.tipo);
    setReferenciaId(caso.referenciaId);
    setNombre(caso.cliente.nombre);
  }

  const fechaIso = useMemo(() => {
    const d = hoy ?? new Date(2026, 0, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [hoy]);

  const monto = Number(honorarios.replace(/[^\d.]/g, ""));
  const borrador: PropuestaHonorarios = {
    id: "borrador",
    abogadoId: perfil.id,
    casoId,
    origen: { tipo, referenciaId },
    cliente: { nombre: nombre.trim() || "[Cliente]", rtn: rtn.trim() || undefined, atencion: atencion.trim() || undefined },
    referencia: referencia.trim(),
    fechaIso,
    honorarios: Number.isFinite(monto) ? monto : 0,
    formaPago,
    notas: notas.trim() || undefined,
    creadoEn: "",
  };
  const doc = referenciaId ? armarPropuesta(borrador, perfil) : null;

  const guardar = () => {
    if (!referenciaId) return setError("Elige el trámite, proceso o acto.");
    if (nombre.trim().length < 3) return setError("Escribe el nombre del cliente.");
    if (!(monto > 0)) return setError("Escribe los honorarios en lempiras.");
    setError("");
    if (!esPremium) return solicitarUpgrade();
    const { id: _id, creadoEn: _c, ...datos } = borrador;
    const id = guardarPropuesta(datos);
    if (casoId) actualizarCaso(casoId, { propuestaId: id });
    mostrarToast("Propuesta guardada");
    router.push(`/abogados/propuestas/${id}`);
  };

  return (
    <div className="max-w-[1280px]">
      <BotonVolver onClick={() => router.push(casoId ? `/abogados/casos/${casoId}` : "/abogados/propuestas")}>
        {casoId ? "Volver al caso" : "Propuestas"}
      </BotonVolver>

      <div className="mt-3 grid grid-cols-1 items-start gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <Rotulo>1 · De qué nace</Rotulo>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TIPOS_CASO.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTipo(t.id);
                    setReferenciaId("");
                  }}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-medium",
                    tipo === t.id ? "border-celeste bg-celeste text-white" : "border-borde bg-white hover:border-celeste",
                  )}
                >
                  {t.etiqueta}
                </button>
              ))}
            </div>
            <select
              value={referenciaId}
              onChange={(e) => setReferenciaId(e.target.value)}
              aria-label="Trámite, proceso o acto"
              className="mt-2.5 h-10 w-full rounded-lg border border-borde bg-white px-3 text-[13px] text-marino outline-none focus:border-celeste"
            >
              <option value="">Elige…</option>
              {opcionesDeTipo(tipo).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </Card>

          <Card className="p-5">
            <Rotulo>2 · Cliente y referencia</Rotulo>
            <div className="mt-2 flex flex-col gap-2.5">
              <Campo etiqueta="Cliente o importador" valor={nombre} onCambio={setNombre} placeholder="Nombre o razón social" />
              <div className="grid grid-cols-2 gap-2.5">
                <Campo etiqueta="RTN (opcional)" valor={rtn} onCambio={setRtn} placeholder="0801…" />
                <Campo etiqueta="Atención (opcional)" valor={atencion} onCambio={setAtencion} placeholder="Gerente general" />
              </div>
              <Campo etiqueta="Referencia interna (opcional)" valor={referencia} onCambio={setReferencia} placeholder="PROP-2026-014" />
            </div>
          </Card>

          <Card className="p-5">
            <Rotulo>3 · Honorarios</Rotulo>
            <div className="mt-2 flex flex-col gap-2.5">
              <Campo etiqueta="Total en lempiras" valor={honorarios} onCambio={setHonorarios} placeholder="18000" inputMode="decimal" />
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-texto-2">Forma de pago</span>
                <select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value)}
                  className="h-10 rounded-lg border border-borde bg-white px-3 text-[13px] text-marino outline-none focus:border-celeste"
                >
                  {FORMAS_PAGO.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-texto-2">Nota sobre los honorarios (opcional)</span>
                <input
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="No incluye tasas ni timbres."
                  className="h-10 rounded-lg border border-borde bg-white px-3.5 text-[13px] text-marino outline-none focus:border-celeste"
                />
              </label>
            </div>
            {error && (
              <div className="mt-3 rounded-[10px] border border-[#f2c8c2] bg-[#fdf1ef] px-3.5 py-2.5 text-[12.5px] text-[#a33b2e]" role="alert">
                {error}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Boton variante="marino" onClick={guardar} className="px-5" icono={esPremium ? undefined : "candado"}>
                {esPremium ? "Guardar y descargar" : "Guardar con Premium"}
              </Boton>
            </div>
            <p className="mt-2 text-[11.5px] text-texto-4">
              La vista previa es libre. Guardar, enlazar al caso y descargar en PDF son del plan Premium.
            </p>
          </Card>
        </div>

        <div className="min-w-0">
          {doc ? (
            <DocumentoPropuestaVista doc={doc} />
          ) : (
            <Card className="px-6 py-14 text-center text-[13px] text-texto-3">
              Elige un trámite, proceso o acto notarial y la propuesta se arma aquí con sus
              requisitos citados de la fuente oficial.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  onCambio,
  placeholder,
  inputMode,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  placeholder: string;
  inputMode?: "decimal" | "text";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-texto-2">{etiqueta}</span>
      <input
        value={valor}
        inputMode={inputMode}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-borde bg-white px-3.5 text-[13px] text-marino outline-none focus:border-celeste"
      />
    </label>
  );
}
