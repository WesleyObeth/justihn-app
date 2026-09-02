"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoJustihn } from "@/components/brand/logos";
import { mensajeAuth, supabaseNavegador } from "@/lib/supabase/cliente";

/** Contraseña nueva tras el enlace de recuperación. Misma card que el login. */
export function RestablecerContrasena() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [otra, setOtra] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  const guardar = async () => {
    if (pass.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (pass !== otra) return setError("Las dos contraseñas no coinciden.");
    setError("");
    setGuardando(true);
    const supabase = supabaseNavegador();
    const { error: e } = await supabase.auth.updateUser({ password: pass });
    setGuardando(false);
    if (e) return setError(mensajeAuth(e.code, "No se pudo guardar la contraseña. Pide un enlace nuevo."));
    setListo(true);
    const { data } = await supabase.rpc("mi_destino");
    setTimeout(() => router.push(data === "abogados" ? "/abogados" : "/personas"), 1200);
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div
        className="auth-fadeup-card card-dia w-full max-w-[420px] rounded-[20px] border bg-white px-9 pt-[38px] pb-[30px] text-marino max-sm:px-6"
        style={{ borderColor: "var(--line)", boxShadow: "0 24px 64px rgba(13,33,68,.16)" }}
      >
        <LogoJustihn size={36} variante="claro" textoPx={22} />
        <h1 className="font-display mt-6 text-[24px] font-bold tracking-[-.3px]">
          {listo ? "Contraseña guardada" : "Crea una contraseña nueva"}
        </h1>
        <p className="mt-[5px] text-[13.5px]" style={{ color: "#5a6b82" }}>
          {listo ? "Entrando a tu portal…" : "Mínimo 8 caracteres. Solo tú la conoces."}
        </p>
        {!listo && (
          <form
            className="mt-6 flex flex-col gap-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              void guardar();
            }}
          >
            <Campo etiqueta="Contraseña nueva" valor={pass} onCambio={(v) => { setPass(v); setError(""); }} />
            <Campo etiqueta="Repítela" valor={otra} onCambio={(v) => { setOtra(v); setError(""); }} />
            {error && (
              <div
                className="rounded-[10px] border px-3.5 py-2.5 text-[12.5px]"
                style={{ background: "#fdf1ef", borderColor: "#f2c8c2", color: "#a33b2e" }}
                role="alert"
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={guardando}
              className="btn-celeste mt-0.5 cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Campo({ etiqueta, valor, onCambio }: { etiqueta: string; valor: string; onCambio: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: "#33475e" }}>
        {etiqueta}
      </span>
      <input
        type="password"
        autoComplete="new-password"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="input-dia rounded-[10px] border px-3.5 py-3 text-[14px] text-marino outline-none"
      />
    </label>
  );
}
