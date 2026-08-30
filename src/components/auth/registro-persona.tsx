"use client";

/**
 * Alta de una persona (vía B). Es deliberadamente CORTA: nombre, correo y
 * contraseña. El abogado pasa por tres pasos porque el producto necesita su
 * colegiación, sus materias y su constancia; a un ciudadano que solo quiere
 * saber qué papeles lleva al SAR pedirle eso lo espantaría — y no serviría
 * para nada, porque su portal no usa ninguno de esos datos.
 *
 * El **login sí es compartido** (`/iniciar-sesion`): una sola base de cuentas.
 * Lo que se separa es el alta, no la entrada.
 *
 * ⚠️ FASE 1 — no crea cuentas: valida formato y entra con la sesión demo.
 *
 * TODO(auth): Supabase Auth — `signUp({ email, password })` + fila en
 * `personas` con el nombre; sin ficha de abogado, que es lo que después hace
 * que el login resuelva el destino a `/personas`. Conservar el redirect al
 * portal tras el alta.
 */
import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { CheckCuadro } from "@/components/auth/iniciar-sesion";
import { SplashJustihn } from "@/components/auth/splash";
import { LogoJustihn } from "@/components/brand/logos";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INCLUYE = [
  "Las guías completas, con su fuente oficial",
  "El checklist de tus trámites, guardado",
  "Consultas ilimitadas al consultorio",
];

export function RegistroPersona() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState("");
  const [entrando, setEntrando] = useState(false);

  const enviar = () => {
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (!EMAIL_RE.test(correo)) return setError("Ingresa un correo electrónico válido.");
    if (pass.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (!acepta) return setError("Debes aceptar los términos para continuar.");
    setError("");
    setEntrando(true);
  };

  const limpiar = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setError("");
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="relative mb-[26px]">
        <LogoJustihn size={34} variante="claro" textoPx={24} />
      </div>

      <div
        className="auth-fadeup-card card-dia relative w-full max-w-[440px] rounded-[18px] border bg-white px-9 pt-[34px] pb-[30px] text-marino max-sm:px-6"
        style={{ borderColor: "var(--line)", boxShadow: "0 24px 64px rgba(13,33,68,.16)" }}
      >
        <h1 className="font-display text-[23px] font-bold tracking-[-.3px]">
          Crea tu cuenta gratis
        </h1>
        <p className="mt-[5px] text-[13.5px] leading-[1.55]" style={{ color: "#5a6b82" }}>
          Sin tarjeta y sin caducidad. Es lo único que te vamos a pedir.
        </p>

        <ul className="mt-4 flex flex-col gap-1.5">
          {INCLUYE.map((t) => (
            <li key={t} className="flex gap-2 text-[12.5px]" style={{ color: "#5a6b82" }}>
              <span className="mt-px shrink-0 text-celeste">
                <Icono nombre="check" size={13} strokeWidth={2.6} />
              </span>
              {t}
            </li>
          ))}
        </ul>

        <form
          className="mt-5 flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
        >
          <Campo
            etiqueta="Nombre"
            tipo="text"
            nombre="nombre"
            placeholder="Ej. Carlos Zelaya"
            valor={nombre}
            onCambio={limpiar(setNombre)}
          />
          <Campo
            etiqueta="Correo electrónico"
            tipo="email"
            nombre="correo"
            placeholder="tucorreo@ejemplo.com"
            valor={correo}
            onCambio={limpiar(setCorreo)}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="rp-pass"
              className="text-[12.5px] font-semibold"
              style={{ color: "#33475e" }}
            >
              Contraseña
            </label>
            <div className="relative flex">
              <input
                id="rp-pass"
                type={verPass ? "text" : "password"}
                name="clave"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setError("");
                }}
                className="input-dia flex-1 rounded-[10px] border py-[11px] pr-11 pl-3.5 text-[14px] text-marino outline-none"
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
            onClick={() => {
              setAcepta(!acepta);
              setError("");
            }}
            className="mt-0.5 flex cursor-pointer items-start gap-2.5 text-left"
          >
            <CheckCuadro
              marcado={acepta}
              bordeApagado="#b9c8da"
              fondoApagado="#fff"
              className="mt-px"
            />
            <span className="text-[12.5px] leading-[1.5]" style={{ color: "#5a6b82" }}>
              Acepto los <a href="#">Términos de servicio</a> y la{" "}
              <a href="#">Política de privacidad</a>.
            </span>
          </button>

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
            className="btn-marino mt-1 cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold"
          >
            Crear cuenta gratis
          </button>
          <p className="text-center text-[13px]" style={{ color: "#5a6b82" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/iniciar-sesion?tipo=persona" className="font-semibold">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>

      {entrando && <SplashJustihn destino="/personas" />}

      <p className="relative mt-4 text-[11.5px]" style={{ color: "var(--muted)" }}>
        Demo de validación — todavía no se crean cuentas ni se guardan tus datos.
      </p>
      <p className="relative mt-2 text-[12px]" style={{ color: "var(--muted)" }}>
        ¿Eres abogado?{" "}
        <Link href="/crear-cuenta" className="font-semibold">
          Crea tu cuenta profesional
        </Link>
      </p>
    </section>
  );
}

function Campo({
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
        autoComplete={tipo === "email" ? "email" : "name"}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="input-dia rounded-[10px] border px-3.5 py-[11px] text-[14px] text-marino outline-none"
      />
    </label>
  );
}
