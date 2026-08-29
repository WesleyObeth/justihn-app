"use client";

/**
 * Formulario del consultorio — compartido por la sección de la landing y el
 * portal ciudadano. `desdeLanding` aplica el patrón Jusbrasil: preguntar crea
 * la cuenta (demo) y te lleva a seguir tu consulta adentro.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/store/portal";
import type { Materia } from "@/types/dominio";

export const MATERIAS_CONSULTA: Materia[] = [
  "Laboral",
  "Civil",
  "Familia",
  "Mercantil",
  "Penal",
  "Contencioso Adm.",
];

export function FormularioPregunta({
  desdeLanding = false,
  claro = false,
}: {
  desdeLanding?: boolean;
  claro?: boolean;
}) {
  const router = useRouter();
  const preguntarConsultorio = usePortal((s) => s.preguntarConsultorio);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [materia, setMateria] = useState<Materia>("Laboral");
  const [ciudad, setCiudad] = useState("");
  const [pregunta, setPregunta] = useState("");

  const publicar = () => {
    const texto = pregunta.trim();
    if (texto.length < 15) {
      mostrarToast("Cuéntanos un poco más — mínimo unas dos líneas");
      return;
    }
    preguntarConsultorio(materia, ciudad.trim() || "Honduras", texto);
    setPregunta("");
    setCiudad("");
    if (desdeLanding) {
      mostrarToast("Tu cuenta gratis está lista (demo) — sigue tu consulta en tu portal");
      router.push("/persona/consultas");
      return;
    }
    mostrarToast("Pregunta publicada — los abogados de la materia ya pueden verla");
  };

  return (
    <div
      className={
        claro
          ? "glass-card p-5"
          : "rounded-2xl border border-borde bg-white p-5"
      }
    >
      <h3 className="font-display text-[16px] font-bold">Haz tu pregunta</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          Materia
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value as Materia)}
            className="rounded-lg border border-borde bg-white p-2.5 text-[13.5px] text-marino outline-none focus:border-celeste"
          >
            {MATERIAS_CONSULTA.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12.5px] text-texto-3">
          Ciudad (opcional)
          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej. Tegucigalpa"
            className="rounded-lg border border-borde bg-white px-3 py-2.5 text-[13.5px] text-marino outline-none focus:border-celeste"
          />
        </label>
      </div>
      <textarea
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
        rows={3}
        placeholder="Cuenta tu situación en tus palabras — sin nombres completos ni datos sensibles…"
        aria-label="Tu pregunta"
        className="mt-3 w-full resize-y rounded-lg border border-borde bg-white px-3.5 py-2.5 text-[13.5px] leading-[1.6] text-marino outline-none focus:border-celeste"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={publicar}
          className="cursor-pointer rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white"
          style={{ background: "var(--turq, #1584c7)" }}
        >
          Publicar pregunta gratis
        </button>
        <span className="text-[11.5px] text-texto-4">
          Pública y anónima — no publiques datos que te identifiquen.
        </span>
      </div>
    </div>
  );
}
