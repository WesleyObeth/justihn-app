"use client";

import Link from "next/link";
/**
 * **La card oficial del abogado** (elegida por Wesley 2026-08-30 entre tres
 * prototipos: "la card que habla"). Es la que ve una persona cuando busca a
 * quién contratar, así que vive en un solo sitio y la usan todas las
 * superficies públicas — la home, el directorio público y el del portal
 * ciudadano. Si cambia, cambian todas.
 *
 * Qué lleva y por qué, en el orden en que llega la duda:
 *   1. **Materias** — lo primero que se busca. El nombre todavía no dice nada.
 *   2. **Quién es** — ciudad y años de ejercicio.
 *   3. **Credenciales** — colegiación validada / en trámite, y la habilitación
 *      notarial, que es una credencial aparte (ver `HabilitacionNotarial`).
 *   4. **Su voz** — un fragmento de una respuesta suya en el consultorio. Es
 *      el diferencial: deja juzgar CÓMO explica antes de escribirle, y crea el
 *      círculo del producto (responder en público es lo que trae clientes).
 *   5. **La acción** — con su nombre, porque se le escribe a una persona.
 *
 * **`compacta`** (decisión Wesley 2026-08-30): en la home caben TRES por fila
 * y la cita se cambia por el resumen de especialidad. La home es vitrina —
 * enseña que hay abogados y de qué materia; la cita es munición para DECIDIR,
 * y ahí sí va entera, en el directorio completo. Además una cita clampada a
 * dos líneas se cortaría a media frase, que es peor que no ponerla.
 *
 * ⚠️ Lo que NO lleva, a propósito:
 *   - **★ valoración** — no existe sistema de reseñas: ese número no lo
 *     produce nadie. Prueba fabricada, y aquí decide a quién contrata alguien.
 *   - **Nº de contactos ni de respuestas** — vanidad: uno con 34 respuestas no
 *     es mejor que uno con 12, y contarlas premiaría publicar por publicar.
 *   - **WhatsApp directo** — sacaba el contacto de Justihn en el primer toque:
 *     sin registro, sin trazabilidad, y sin poder demostrarle al abogado
 *     cuántos contactos le trajo la plataforma, que es lo que sostiene que
 *     pague. WhatsApp llega después, cuando ya hay conversación.
 */
import { Icono } from "@/components/brand/iconos";
import { InsigniaNotario } from "@/components/publico/paso-profesional";
import { usePortal } from "@/store/portal";
import type { AbogadoDirectorio } from "@/data/directorio";

function primerNombre(nombre: string) {
  return nombre.replace(/^Abg\.\s*/, "").split(" ")[0];
}

export function TarjetaAbogado({
  abogado: a,
  compacta = false,
  href,
}: {
  abogado: AbogadoDirectorio;
  compacta?: boolean;
  /**
   * Perfil al que lleva la acción. Solo existe dentro del portal
   * (`/personas/directorio/[id]`): en la home no hay detalle, así que allí la
   * card mantiene su aviso de demo en vez de enlazar a una ruta inexistente.
   */
  href?: string;
}) {
  const mostrarToast = usePortal((s) => s.mostrarToast);

  return (
    /* ⚠️ `glass-card` está definida en `landing.css`, y ese archivo NO se
       carga en el portal: allí la card se quedaba sin borde, sin radio, sin
       fondo y sin sombra — desnuda sobre el lienzo. Las clases del tema van
       DESPUÉS para darle superficie propia en las tres superficies; en la
       landing, `.glass-card` sigue ganando y conserva su efecto glass. */
    <div
      className={`glass-card flex flex-col rounded-2xl border border-borde bg-white ${compacta ? "p-4.5" : "p-5"}`}
    >
      <div className="flex flex-wrap gap-1.5">
        {a.materias.map((m) => (
          <span
            key={m}
            className="rounded-full px-2.5 py-[3px] text-[11.5px] font-medium"
            style={{ background: "rgba(21,132,199,.1)", color: "var(--mint)" }}
          >
            {m}
          </span>
        ))}
      </div>

      <div className={`flex items-center gap-3 ${compacta ? "mt-3" : "mt-3.5"}`}>
        <span
          className="font-display grid shrink-0 place-items-center rounded-full font-semibold text-white"
          style={{
            width: compacta ? 40 : 46,
            height: compacta ? 40 : 46,
            fontSize: compacta ? 13 : 15,
            background: "linear-gradient(180deg,#0d2144,#0a1830)",
          }}
        >
          {a.iniciales}
        </span>
        <div className="min-w-0">
          <span
            className={`block leading-[1.25] font-bold ${compacta ? "text-[14px]" : "text-[15px]"}`}
          >
            {a.nombre}
          </span>
          <span className="text-[11.5px] text-texto-3">
            {a.ciudad} · {a.anios} años
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {a.verificado ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-exito-bg px-2 py-[2px] text-[10.5px] font-bold text-exito">
            <Icono nombre="check" size={9} strokeWidth={2.8} />
            Colegiación validada
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10.5px] font-semibold"
            style={{ background: "var(--color-aviso)", color: "var(--color-aviso-texto)" }}
          >
            Validación en trámite
          </span>
        )}
        {a.notario && <InsigniaNotario verificado={a.notario.verificado} />}
      </div>

      {compacta ? (
        <p className="mt-3 flex-1 text-[12.5px] leading-[1.55] text-texto-3">{a.bio}</p>
      ) : (
        <blockquote
          className="mt-4 flex-1 rounded-[12px] border-l-[3px] border-celeste py-2.5 pr-3 pl-3.5 text-[13px] leading-[1.6] text-marino"
          style={{ background: "rgba(21,132,199,.06)" }}
        >
          “{a.cita}”
          <footer className="mt-1.5 text-[11px] text-texto-3">
            De una respuesta suya en el consultorio
          </footer>
        </blockquote>
      )}

      {/* Con perfil, la acción NAVEGA a él: ahí está el formulario que le
          escribe dentro de Justihn. Sin perfil (la home), se queda en el aviso
          de demo — no se enlaza a una ruta que no existe.
          ⚠️ El fondo llevaba `var(--turq)`, y esa variable SOLO existe en
          `landing.css`: en el portal el botón se quedaba sin fondo, blanco
          sobre blanco e invisible. Esta card vive en tres superficies, así que
          su color sale del tema global. */}
      {href ? (
        <Link
          href={href}
          className={`block w-full cursor-pointer rounded-lg bg-celeste text-center font-semibold text-white hover:bg-cruce hover:text-white ${compacta ? "mt-3.5 py-2 text-[12.5px]" : "mt-4 py-2.5 text-[13px]"}`}
        >
          Consultar con {primerNombre(a.nombre)}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() =>
            mostrarToast(
              `Así le escribes a ${a.nombre} desde Justihn — su respuesta queda pública (demo de validación)`,
            )
          }
          className={`w-full cursor-pointer rounded-lg bg-celeste font-semibold text-white hover:bg-cruce hover:text-white ${compacta ? "mt-3.5 py-2 text-[12.5px]" : "mt-4 py-2.5 text-[13px]"}`}
        >
          Consultar con {primerNombre(a.nombre)}
        </button>
      )}
      <p className="mt-2 text-center text-[11px] text-texto-3">
        Suele responder {a.responde}
        {compacta ? "" : ` · ${a.enLinea ? "en línea y presencial" : "presencial"}`}
      </p>
    </div>
  );
}
