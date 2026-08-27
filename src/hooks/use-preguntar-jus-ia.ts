"use client";

/**
 * "Preguntar a Jus IA" desde cualquier vista. Único lugar que implementa el
 * gesto (lo usan sentencias, Gaceta, calculadoras, procesos, el buscador
 * global y el Dashboard).
 *
 * Por defecto deja la pregunta cargada en el composer — el abogado confirma
 * antes de gastar un crédito. Con `enviarDirecto` la consulta se dispara sola
 * al llegar al chat (para gestos que ya son la pregunta, como el brief).
 */
import { useRouter } from "next/navigation";
import { usePortal } from "@/store/portal";

export function usePreguntarAJusIA() {
  const router = useRouter();
  const nuevaConsulta = usePortal((s) => s.nuevaConsulta);
  const setBorrador = usePortal((s) => s.setBorrador);
  const setConsultaPendiente = usePortal((s) => s.setConsultaPendiente);

  return (pregunta: string, opts?: { enviarDirecto?: boolean }) => {
    nuevaConsulta();
    if (opts?.enviarDirecto) setConsultaPendiente(pregunta);
    else setBorrador(pregunta);
    router.push("/abogados");
  };
}
