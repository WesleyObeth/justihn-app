"use client";

/**
 * Iniciar sesión (handoff design_handoff_auth, `06 Justihn Iniciar Sesion`):
 * card glass sobre el aurora oscuro, con recuperación de contraseña y el
 * splash del logo al entrar.
 *
 * **Una sola pantalla para las DOS vías** (decisión Wesley 2026-08-30). Es una
 * sola base de cuentas: dos logins significarían duplicar recuperación,
 * enlaces mágicos, rate limit y errores, y sobre todo obligarían a la persona
 * a acertar por qué puerta se registró — quien elige mal ve "no existe esa
 * cuenta" y se va creyendo que perdió su registro. **El registro sí es
 * distinto** (el abogado aporta colegiación, materias y solvencia; la persona,
 * nombre y correo), y por eso `?tipo=` solo decide el copy, a qué alta manda y
 * a qué portal entra — nunca lo que se le pide para entrar.
 *
 * ⚠️ FASE 1 — sin autenticación real: valida formato y entra con la sesión de
 * demostración. Como no hay cuenta que consultar, el destino sale del origen
 * (`?tipo=persona`); en Fase 2 lo decide la cuenta y el parámetro sobra.
 *
 * TODO(auth): Supabase Auth (blueprint §4, plataforma/CLAUDE.md §7.2) —
 * `signInWithPassword` + `resetPasswordForEmail` para "¿La olvidaste?", sesión
 * en cookie y RLS por `abogado_id`. Al cablearlo, `entrar()` deja de ser
 * simulado y el destino se resuelve consultando el perfil: si la cuenta tiene
 * ficha de abogado va a `/abogados`, si no a `/personas`. El splash y la
 * navegación quedan igual.
 */
import Link from "next/link";
import { useState } from "react";
import { LogoJustihn } from "@/components/brand/logos";
import { SplashJustihn } from "@/components/auth/splash";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Vista = "login" | "recuperar" | "enviado" | "splash";

/** `esPersona` lo resuelve la página en el SERVIDOR (ver `page.tsx`): así el
 *  HTML ya llega con el copy correcto y no se ve el del abogado un instante. */
export function PantallaIniciarSesion({ esPersona = false }: { esPersona?: boolean }) {
  // Solo personaliza; nunca cambia lo que se pide para entrar.
  const destino = esPersona ? "/personas" : "/abogados";
  const altaHref = esPersona ? "/crear-cuenta?tipo=persona" : "/crear-cuenta";
  // Hasta el placeholder delata la audiencia: "nombre@bufete.hn" le dice a un
  // ciudadano que se equivocó de sitio.
  const ejemploCorreo = esPersona ? "tucorreo@ejemplo.com" : "nombre@bufete.hn";

  const [vista, setVista] = useState<Vista>("login");
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState("");

  const emailOk = EMAIL_RE.test(correo);

  const entrar = () => {
    if (!emailOk) return setError("Ingresa un correo electrónico válido.");
    if (!pass) return setError("Escribe tu contraseña.");
    setError("");
    setVista("splash");
  };

  const enviarEnlace = () => {
    if (!emailOk) {
      setVista("recuperar");
      return setError("Ingresa un correo electrónico válido.");
    }
    setError("");
    setVista("enviado");
  };

  const ir = (v: Vista) => {
    setError("");
    setVista(v);
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div
        className="auth-fadeup-card card-dia w-full max-w-[420px] rounded-[20px] border bg-white px-9 pt-[38px] pb-[30px] text-marino max-sm:px-6"
        style={{ borderColor: "var(--line)", boxShadow: "0 24px 64px rgba(13,33,68,.16)" }}
      >
        <LogoJustihn size={36} variante="claro" textoPx={22} />

        {vista === "login" && (
          <div className="auth-fadeup">
            <h1 className="font-display mt-6 text-[24px] font-bold tracking-[-.3px]">
              Inicia sesión
            </h1>
            <p className="mt-[5px] text-[13.5px]" style={{ color: "#5a6b82" }}>
              {esPersona
                ? "Tus trámites y tus consultas te esperan."
                : "Tu jurisprudencia y Jus IA te esperan."}
            </p>
            <form
              className="mt-6 flex flex-col gap-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                entrar();
              }}
            >
              <CampoAuth
                etiqueta="Correo electrónico"
                tipo="email"
                nombre="correo"
                placeholder={ejemploCorreo}
                valor={correo}
                onCambio={(v) => {
                  setCorreo(v);
                  setError("");
                }}
              />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-pass"
                    className="text-[12.5px] font-semibold"
                    style={{ color: "#33475e" }}
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => ir("recuperar")}
                    className="cursor-pointer text-[12px] font-semibold transition-colors hover:text-celeste"
                    style={{ color: "var(--color-celeste)" }}
                  >
                    ¿La olvidaste?
                  </button>
                </div>
                <div className="relative flex">
                  <input
                    id="auth-pass"
                    type={verPass ? "text" : "password"}
                    name="clave"
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    value={pass}
                    onChange={(e) => {
                      setPass(e.target.value);
                      setError("");
                    }}
                    className="input-dia flex-1 rounded-[10px] border py-3 pr-11 pl-3.5 text-[14px] text-marino outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPass(!verPass)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[12px] font-semibold transition-colors select-none hover:text-celeste"
                    style={{ color: "#8095ad" }}
                  >
                    {verPass ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecordar(!recordar)}
                className="flex cursor-pointer items-center gap-2.5 select-none"
              >
                <CheckCuadro marcado={recordar} bordeApagado="#b9c8da" fondoApagado="#fff" />
                <span className="text-[13px]" style={{ color: "#5a6b82" }}>
                  Mantener la sesión iniciada
                </span>
              </button>
              {error && <ErrorAuth mensaje={error} />}
              <button
                type="submit"
                className="btn-celeste mt-0.5 cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold"
              >
                Iniciar sesión
              </button>
              <p className="text-center text-[13px]" style={{ color: "#5a6b82" }}>
                ¿Aún no tienes cuenta?{" "}
                <Link href={altaHref} className="font-semibold">
                  Crear cuenta
                </Link>
              </p>
            </form>
          </div>
        )}

        {vista === "recuperar" && (
          <div className="auth-fadeup">
            <h1 className="font-display mt-6 text-[24px] font-bold tracking-[-.3px]">
              Recupera tu contraseña
            </h1>
            <p className="mt-[5px] text-[13.5px] leading-[1.55]" style={{ color: "#5a6b82" }}>
              Te enviaremos un enlace para crear una nueva.
            </p>
            <form
              className="mt-6 flex flex-col gap-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                enviarEnlace();
              }}
            >
              <CampoAuth
                etiqueta="Correo electrónico"
                tipo="email"
                nombre="correo"
                placeholder={ejemploCorreo}
                valor={correo}
                onCambio={(v) => {
                  setCorreo(v);
                  setError("");
                }}
              />
              {error && <ErrorAuth mensaje={error} />}
              <button
                type="submit"
                className="btn-celeste cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold"
              >
                Enviar enlace
              </button>
              <button
                type="button"
                onClick={() => ir("login")}
                className="cursor-pointer text-center text-[13px] transition-colors select-none hover:text-celeste"
                style={{ color: "#8095ad" }}
              >
                ← Volver a iniciar sesión
              </button>
            </form>
          </div>
        )}

        {vista === "enviado" && (
          <div className="auth-fadeup flex flex-col items-center pt-5 pb-1 text-center">
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg,#1584c7,#0e5f92)",
                boxShadow: "0 10px 28px rgba(21,132,199,.45)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                <path d="M4.5 7 L12 12.5 L19.5 7" />
              </svg>
            </div>
            <h1 className="font-display mt-4 text-[21px] font-bold tracking-[-.3px]">
              Revisa tu correo
            </h1>
            <p
              className="mt-1.5 max-w-[300px] text-[13.5px] leading-[1.6]"
              style={{ color: "#5a6b82" }}
            >
              Enviamos un enlace de recuperación a <b className="text-marino">{correo}</b>.
              Expira en 30 minutos.
            </p>
            <button
              type="button"
              onClick={() => ir("login")}
              className="btn-celeste mt-[22px] w-full cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold"
            >
              Volver a iniciar sesión
            </button>
            <button
              type="button"
              onClick={enviarEnlace}
              className="mt-3 cursor-pointer text-[12.5px] transition-colors select-none hover:text-celeste"
              style={{ color: "#8095ad" }}
            >
              ¿No llegó? Reenviar
            </button>
          </div>
        )}
      </div>

      {vista === "splash" && <SplashJustihn destino={destino} />}

      <p className="relative mt-4 text-[11.5px]" style={{ color: "var(--muted)" }}>
        Demo de validación — todavía no se crean cuentas ni sesiones reales.
      </p>
      <p className="relative mt-2 text-[12px]" style={{ color: "var(--muted)" }}>
        © 2026 Justihn · Honduras
      </p>
    </section>
  );
}

/** Campo de texto de las pantallas de auth. */
function CampoAuth({
  etiqueta,
  tipo,
  nombre,
  placeholder,
  valor,
  onCambio,
}: {
  etiqueta: string;
  tipo: string;
  nombre: string;
  placeholder: string;
  valor: string;
  onCambio: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: "#33475e" }}>
        {etiqueta}
      </span>
      <input
        type={tipo}
        name={nombre}
        autoComplete={tipo}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="input-dia rounded-[10px] border px-3.5 py-3 text-[14px] text-marino outline-none"
      />
    </label>
  );
}

function ErrorAuth({ mensaje }: { mensaje: string }) {
  return (
    <div
      className="rounded-[10px] border px-3.5 py-2.5 text-[12.5px]"
      style={{ background: "#fdf1ef", borderColor: "#f2c8c2", color: "#a33b2e" }}
      role="alert"
    >
      {mensaje}
    </div>
  );
}

/** Checkbox custom 17px del handoff — compartido por login y onboarding. */
export function CheckCuadro({
  marcado,
  bordeApagado,
  fondoApagado = "transparent",
  className,
}: {
  marcado: boolean;
  bordeApagado: string;
  fondoApagado?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`grid h-[17px] w-[17px] min-w-[17px] place-items-center rounded-[5px] border-[1.5px] transition-all duration-150 ${className ?? ""}`}
      style={
        marcado
          ? { borderColor: "#1584c7", background: "#1584c7" }
          : { borderColor: bordeApagado, background: fondoApagado }
      }
    >
      {marcado && (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.5 12.5 L10 18 L19.5 7" />
        </svg>
      )}
    </span>
  );
}
