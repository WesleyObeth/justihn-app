/**
 * Vía procesal civil según la cuantía — módulo canónico (§0.5).
 *
 * Umbrales VERIFICADOS contra el PDF oficial del Código Procesal Civil (2018)
 * en el PoC del proyecto (`justihn/CLAUDE.md` §4): abreviado ≤ L100,000 por
 * reforma del Decreto 21-2015 (arts. 399–400); monitorio disponible para
 * deudas líquidas y exigibles hasta L200,000 (arts. 676–685), sin necesidad
 * de abogado bajo L5,000.
 */
export const TOPE_ABREVIADO = 100_000;
export const TOPE_MONITORIO = 200_000;
export const TOPE_SIN_ABOGADO = 5_000;

export interface ViaProcesal {
  /** Vía declarativa que corresponde por cuantía. */
  via: "abreviado" | "ordinario";
  /** La deuda líquida y exigible además admite proceso monitorio. */
  admiteMonitorio: boolean;
  /** En monitorio, bajo este monto no se exige profesional del derecho. */
  sinAbogado: boolean;
}

export function determinarViaCivil(cuantia: number): ViaProcesal | null {
  if (!Number.isFinite(cuantia) || cuantia <= 0) return null;
  return {
    via: cuantia <= TOPE_ABREVIADO ? "abreviado" : "ordinario",
    admiteMonitorio: cuantia <= TOPE_MONITORIO,
    sinAbogado: cuantia < TOPE_SIN_ABOGADO,
  };
}
