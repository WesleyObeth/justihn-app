"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { buscarAbogados, buscarNotarios, DIRECTORIO } from "@/data/directorio";
import { InsigniaNotario } from "@/components/publico/paso-profesional";
import { usePortal } from "@/store/portal";
import type { Materia } from "@/types/dominio";
import { cn } from "@/lib/utils";

/** Directorio público: abogados por materia. La prioridad Premium se nota. */
export function PantallaDirectorio({ enPortal = false }: { enPortal?: boolean }) {
  const base = enPortal ? "/persona/abogados" : "/directorio";
  const rutaConsultorio = enPortal ? "/persona/consultas" : "/consultorio";
  const router = useRouter();
  const params = useSearchParams();
  const mostrarToast = usePortal((s) => s.mostrarToast);
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

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {abogados.map((a) => (
          <div key={a.id} className="flex flex-col rounded-2xl border border-borde bg-white p-5">
            <div className="flex items-center gap-3.5">
              <span
                className="font-display grid h-[52px] w-[52px] place-items-center rounded-full text-[17px] font-semibold text-white"
                style={{ background: "linear-gradient(180deg,#0d2144,#0a1830)" }}
              >
                {a.iniciales}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[14.5px] font-bold">{a.nombre}</span>
                  {a.validado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10px] font-bold text-exito">
                      <Icono nombre="check" size={9} strokeWidth={2.6} />
                      Validado
                    </span>
                  )}
                  {a.notario && <InsigniaNotario verificado={a.notario.verificado} />}
                </div>
                <div className="text-[12px] text-texto-4">
                  {a.ciudad} · ★ {a.valoracion} · {a.contactos} contactos
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.materias.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-chip px-2.5 py-[3px] text-[11.5px] font-medium text-celeste"
                >
                  {m}
                </span>
              ))}
            </div>

            <p className="mt-2.5 flex-1 text-[12.5px] leading-[1.6] text-texto-3">{a.bio}</p>

            <button
              type="button"
              onClick={() =>
                mostrarToast(`Así inicia el contacto con ${a.nombre} (demo de validación)`)
              }
              className="mt-4 w-full cursor-pointer rounded-lg bg-celeste py-2.5 text-[13px] font-semibold text-white hover:bg-cruce"
            >
              Contactar por WhatsApp
            </button>
          </div>
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
