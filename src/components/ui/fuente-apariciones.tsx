/**
 * De DÓNDE salió una búsqueda por nombre. Lo enseñan las tres pantallas que
 * buscan nombres (Monitoreo, Mi nombre, Verifica): mientras la migración 03 no
 * esté pasada, responden sobre el piloto de 12 sentencias, y una respuesta
 * sobre 12 no puede presentarse como si fuera sobre 17.000 (§4.5).
 */
import type { FuenteApariciones } from "@/hooks/use-apariciones";

export function NotaFuenteApariciones({
  fuente,
  totalCorpus,
  className,
}: {
  fuente: FuenteApariciones;
  totalCorpus: number | null;
  className?: string;
}) {
  return (
    <p className={`text-[11.5px] leading-[1.55] text-texto-4 ${className ?? ""}`}>
      {fuente === "corpus" ? (
        <>
          Buscado como parte (recurrente o recurrido) en las{" "}
          <b className="text-texto-3">{(totalCorpus ?? 0).toLocaleString("es-HN")}</b> sentencias
          que publica el Poder Judicial, sin las materias reservadas.
        </>
      ) : (
        <>
          <b className="text-texto-3">Hoy busca en la muestra del piloto (12 sentencias).</b> La
          búsqueda por nombre en el corpus completo se activa con la columna de partes de la base
          (migración 03); hasta entonces, un «sin apariciones» solo habla de esas 12.
        </>
      )}
    </p>
  );
}
