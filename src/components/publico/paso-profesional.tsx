import Link from "next/link";
import { Icono } from "@/components/brand/iconos";
import type { ProfesionalRequerido } from "@/data/tramites";
import type { Materia } from "@/types/dominio";

/**
 * Aviso inline dentro de un paso que exige profesional. Vive EN el paso, no en
 * una tarjeta al pie: el usuario lee "el notario elabora la escritura" y ahí
 * mismo tiene a dónde ir.
 *
 * Regla del componente: `notario` enruta al filtro de NOTARIOS del directorio,
 * nunca a la materia "Notarial" — la habilitación notarial es una credencial
 * aparte de la especialidad (ver `HabilitacionNotarial` en `data/directorio.ts`).
 */
export function AvisoProfesional({
  profesional,
  materia,
  enPortal = false,
}: {
  profesional: ProfesionalRequerido;
  /** Materia de la guía: define a qué abogados enruta el caso "abogado". */
  materia: Materia;
  enPortal?: boolean;
}) {
  const esNotario = profesional === "notario";

  const href = enPortal
    ? esNotario
      ? "/personas/directorio?notarios=1"
      : `/personas/directorio?materia=${encodeURIComponent(materia)}`
    : esNotario
      ? "/?notarios=1#directorio"
      : `/?materia=${encodeURIComponent(materia)}#directorio`;

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[10px] border border-chip-borde bg-chip px-3 py-2 text-[12.5px] leading-[1.5]">
      <span className="inline-flex items-center gap-1.5 font-semibold text-marino">
        <Icono nombre={esNotario ? "documento" : "juris"} size={13} strokeWidth={2} />
        {esNotario ? "Este paso lo autoriza un notario" : "Este paso requiere abogado"}
      </span>
      <Link href={href} className="font-semibold text-celeste hover:text-marino">
        {esNotario ? "Ver notarios" : `Ver abogados de ${materia.toLowerCase()}`} →
      </Link>
    </div>
  );
}

/**
 * Insignia de habilitación notarial para la tarjeta del directorio.
 * Dice "declarada", no "verificada", porque es la verdad: el Poder Judicial no
 * publica un padrón notarial consultable, así que nadie ha contrastado el
 * exequátur. Misma regla que las guías — sin fuente, no se afirma.
 */
export function InsigniaNotario({ verificado }: { verificado: boolean }) {
  return (
    <span
      title={
        verificado
          ? "Habilitación notarial verificada"
          : "Habilitación notarial declarada por el profesional; aún no contrastada con la Contraloría del Notariado"
      }
      className={
        verificado
          ? "inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10px] font-bold text-exito"
          : "inline-flex items-center gap-1 rounded-full bg-aviso px-2 py-[2px] text-[10px] font-bold text-aviso-texto"
      }
    >
      <Icono nombre="documento" size={9} strokeWidth={2.4} />
      {verificado ? "Notario" : "Notario (declarado)"}
    </span>
  );
}
