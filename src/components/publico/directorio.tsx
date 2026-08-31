"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { buscarAbogados, buscarNotarios, DIRECTORIO } from "@/data/directorio";
import { TarjetaAbogado } from "@/components/publico/tarjeta-abogado";
import type { Materia } from "@/types/dominio";
import { cn } from "@/lib/utils";

/** Directorio público: abogados por materia. La prioridad Premium se nota. */
export function PantallaDirectorio({ enPortal = false }: { enPortal?: boolean }) {
  const base = enPortal ? "/personas/directorio" : "/directorio";
  const rutaConsultorio = enPortal ? "/personas/consultas" : "/consultorio";
  const router = useRouter();
  const params = useSearchParams();
  // `?notarios=1` llega desde un paso de trámite que exige notario.
  const soloNotarios = params.get("notarios") === "1";
  const materia = (params.get("materia") as Materia | null) ?? "todas";

  const materias = [...new Set(DIRECTORIO.flatMap((a) => a.materias))];
  const abogados = soloNotarios ? buscarNotarios() : buscarAbogados(materia as Materia | "todas");

  const setMateria = (m: string) => {
    router.replace(m === "todas" ? base : `${base}?materia=${encodeURIComponent(m)}`, {
      scroll: false,
    });
  };
  const verNotarios = () => router.replace(`${base}?notarios=1`, { scroll: false });

  return (
    <div className={enPortal ? "max-w-[1080px]" : "mx-auto max-w-[1140px] px-4 py-8 md:px-6"}>
      <h1 className="font-display text-[26px] font-bold">Encuentra abogado</h1>
      <p className="mt-1 text-[13.5px] text-texto-3">
        Profesionales del derecho por materia y ciudad. Los perfiles con insignia están
        validados con su colegiación al día.
      </p>
      {soloNotarios && (
        <p className="mt-2 rounded-[10px] border border-aviso-borde bg-aviso px-3.5 py-2.5 text-[12.5px] leading-[1.55] text-aviso-cuerpo">
          Ser notario no es una especialidad: es una habilitación aparte del Colegio de
          Abogados. Aquí la habilitación es <b>declarada por el profesional</b> — todavía
          no la contrastamos con la Contraloría del Notariado. Pídele su carné antes de
          firmar.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <ChipMateriaFiltro
          activo={!soloNotarios && materia === "todas"}
          onClick={() => setMateria("todas")}
        >
          Todas
        </ChipMateriaFiltro>
        <ChipMateriaFiltro activo={soloNotarios} onClick={verNotarios}>
          Notarios
        </ChipMateriaFiltro>
        {materias.map((m) => (
          <ChipMateriaFiltro
            key={m}
            activo={!soloNotarios && materia === m}
            onClick={() => setMateria(m)}
          >
            {m}
          </ChipMateriaFiltro>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {abogados.map((a) => (
          <TarjetaAbogado key={a.id} abogado={a} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-borde bg-white p-6">
        <div className="min-w-[240px] flex-1">
          <h2 className="font-display text-[16px] font-bold">¿No sabes qué materia necesitas?</h2>
          <p className="mt-1 text-[13px] text-texto-3">
            Cuenta tu situación en el consultorio gratuito y un abogado te orienta.
          </p>
        </div>
        <Link
          href={rutaConsultorio}
          className="rounded-xl bg-marino px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-celeste hover:text-white"
        >
          Ir al consultorio
        </Link>
      </div>
    </div>
  );
}

function ChipMateriaFiltro({
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
