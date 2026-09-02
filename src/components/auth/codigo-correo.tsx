"use client";

import { useRef, useState } from "react";
import { mensajeAuth, supabaseNavegador } from "@/lib/supabase/cliente";

/**
 * Confirmación del correo por CÓDIGO de seis dígitos, no por enlace (decisión
 * Wesley 2026-09-02, patrón Jusbrasil): el enlace saca a la persona del alta
 * y la deja en otra pestaña; el código la mantiene en la misma pantalla y
 * termina con sesión abierta aquí mismo.
 *
 * El código lo manda la plantilla «Confirm signup» de Supabase con
 * `{{ .Token }}` (ver `supabase/correos/confirmar-registro.html`); esta
 * pantalla lo canjea con `verifyOtp(type: "signup")`. Seis casillas que se
 * comportan como un solo campo: pegar el código entero lo reparte, borrar
 * retrocede, y al completar se verifica solo.
 */
export function CodigoCorreo({
  correo,
  onVerificado,
}: {
  correo: string;
  /** Con la sesión ya abierta. */
  onVerificado: () => void;
}) {
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const casillas = useRef<(HTMLInputElement | null)[]>([]);

  const verificar = async (codigo: string) => {
    setOcupado(true);
    setError("");
    const { data, error: e } = await supabaseNavegador().auth.verifyOtp({
      email: correo,
      token: codigo,
      type: "signup",
    });
    setOcupado(false);
    if (e || !data.session) {
      setDigitos(Array(6).fill(""));
      casillas.current[0]?.focus();
      return setError(mensajeAuth(e?.code, "Ese código no es válido o ya venció. Pide uno nuevo."));
    }
    onVerificado();
  };

  const escribir = (i: number, valor: string) => {
    const limpio = valor.replace(/\D/g, "");
    if (!limpio) {
      setDigitos((d) => d.map((x, k) => (k === i ? "" : x)));
      return;
    }
    // Pegar «872611» en cualquier casilla reparte los seis.
    const siguientes = [...digitos];
    for (let k = 0; k < limpio.length && i + k < 6; k++) siguientes[i + k] = limpio[k]!;
    setDigitos(siguientes);
    const ultimo = Math.min(i + limpio.length, 5);
    casillas.current[ultimo]?.focus();
    if (siguientes.every((d) => d !== "")) void verificar(siguientes.join(""));
  };

  const tecla = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digitos[i] && i > 0) casillas.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) casillas.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) casillas.current[i + 1]?.focus();
  };

  const reenviar = async () => {
    setError("");
    const { error: e } = await supabaseNavegador().auth.resend({ type: "signup", email: correo });
    if (e) return setError(mensajeAuth(e.code, "No se pudo reenviar. Espera un minuto."));
    setReenviado(true);
  };

  return (
    <div className="mt-[22px] w-full text-left">
      <p className="text-[13.5px] leading-[1.55]" style={{ color: "#33475e" }}>
        Te enviamos un <b className="text-marino">código de 6 dígitos</b> a{" "}
        <b className="text-marino">{correo}</b>. Escríbelo aquí para confirmar tu cuenta.
      </p>
      <div className="mt-3.5 flex justify-between gap-2" role="group" aria-label="Código de confirmación">
        {digitos.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              casillas.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={6}
            value={d}
            disabled={ocupado}
            aria-label={`Dígito ${i + 1}`}
            onChange={(e) => escribir(i, e.target.value)}
            onKeyDown={(e) => tecla(i, e)}
            onFocus={(e) => e.target.select()}
            className="input-dia h-[52px] w-full rounded-[10px] border text-center font-mono text-[22px] font-semibold text-marino outline-none disabled:opacity-60"
          />
        ))}
      </div>
      {error && (
        <div
          className="mt-3 rounded-[10px] border px-3.5 py-2.5 text-[12.5px]"
          style={{ background: "#fdf1ef", borderColor: "#f2c8c2", color: "#a33b2e" }}
          role="alert"
        >
          {error}
        </div>
      )}
      <p className="mt-3 text-[12.5px]" style={{ color: "#8095ad" }}>
        {ocupado ? (
          "Verificando…"
        ) : reenviado ? (
          "Código reenviado. Revisa también la carpeta de spam."
        ) : (
          <>
            ¿No llegó?{" "}
            <button
              type="button"
              onClick={() => void reenviar()}
              className="cursor-pointer font-semibold hover:text-celeste"
              style={{ color: "var(--color-celeste)" }}
            >
              Reenviar código
            </button>
          </>
        )}
      </p>
    </div>
  );
}
