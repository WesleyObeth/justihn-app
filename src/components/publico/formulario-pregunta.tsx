"use client";

/**
 * Formulario del consultorio — compartido por la sección de la landing y el
 * portal ciudadano.
 *
 * `desdeLanding` aplica el patrón Jusbrasil y hace pareja con el composer de
 * la vía A: la consulta se PUBLICA primero (queda en el store) y luego se
 * pasa por la puerta de cuenta; el alta la reconoce por `?desde=consultorio`,
 * lo dice, y al terminar deja al visitante en sus consultas. Antes saltaba
 * directo al portal y se saltaba el alta entera.
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
    // Umbral bajo a propósito: pedía 15 caracteres y rebotaba preguntas
    // legítimas como "sacar rtn?". Una duda corta es respondible —y el
    // abogado puede repreguntar—; rebotar a quien sí quería preguntar cuesta
    // más que recibir una consulta escueta. Solo se frena lo que no es
    // pregunta ("hola", "?").
    if (texto.length < 6) {
      mostrarToast("Escribe tu pregunta — con una línea basta");
      return;
    }
    preguntarConsultorio(materia, ciudad.trim() || "Honduras", texto);
    setPregunta("");
    setCiudad("");
    if (desdeLanding) {
      mostrarToast("Consulta publicada — crea tu cuenta gratis para seguir la respuesta");
      router.push("/crear-cuenta?tipo=persona&desde=consultorio");
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
        placeholder="¿Qué necesitas saber? Ej. cómo saco el RTN — sin nombres completos ni datos sensibles"
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
