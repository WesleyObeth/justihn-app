"use client";

/**
 * Onboarding de abogado (handoff design_handoff_auth, `05 Justihn Onboarding
 * Abogado`): registro en 3 pasos + bienvenida, card blanco sobre el aurora
 * oscuro, y el splash del logo al entrar al portal.
 *
 * Vive en `/crear-cuenta` — ES la puerta de cuenta de la vía A: el composer de
 * la landing deja la `consultaPendiente` en el store y trae aquí; la pregunta
 * se muestra sobre el card y se dispara sola al llegar al chat (/abogados).
 *
 * ⚠️ FASE 1 — sin autenticación real: los pasos validan formato y el final usa
 * la sesión de demostración. La nota bajo el card lo dice.
 *
 * TODO(auth): Supabase Auth (blueprint §4, plataforma/CLAUDE.md §7.2) —
 * `signUp` en el paso 1 (sesión en cookie, RLS por `abogado_id`); el paso 2
 * sube la constancia a Storage y crea la fila en `documentos_validacion`; el
 * paso 3 persiste las materias como suscripciones de alertas. Conservar el
 * `consultaPendiente` para redirigir al chat después del alta real.
 */
import Link from "next/link";
import { useState } from "react";
import { LogoJustihn } from "@/components/brand/logos";
import { CheckCuadro } from "@/components/auth/iniciar-sesion";
import { SplashJustihn } from "@/components/auth/splash";
import { usePortal } from "@/store/portal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASOS = ["Cuenta", "Validación", "Materias"] as const;

/** Materias de ejercicio del registro — más amplias que las 6 del corpus CSJ:
 *  son áreas de práctica del gremio, para alertas y para el directorio. */
const MATERIAS_REGISTRO = [
  "Civil",
  "Penal",
  "Laboral",
  "Mercantil",
  "Familia",
  "Administrativo",
  "Tributario y fiscal",
  "Constitucional",
  "Notarial",
  "Ambiental",
  "Migratorio",
  "Propiedad intelectual",
  "Bancario",
  "Inmobiliario",
];

const DEPARTAMENTOS = [
  "Atlántida",
  "Choluteca",
  "Colón",
  "Comayagua",
  "Copán",
  "Cortés",
  "El Paraíso",
  "Francisco Morazán",
  "Gracias a Dios",
  "Intibucá",
  "Islas de la Bahía",
  "La Paz",
  "Lempira",
  "Ocotepeque",
  "Olancho",
  "Santa Bárbara",
  "Valle",
  "Yoro",
];

const NIVELES_FUERZA = [
  { label: "Muy débil", color: "#c0392b" },
  { label: "Débil", color: "#c0392b" },
  { label: "Aceptable", color: "#c99a3a" },
  { label: "Fuerte", color: "#2e7d43" },
  { label: "Muy fuerte", color: "#2e7d43" },
] as const;

function fuerzaPass(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

export function PantallaOnboarding() {
  const consultaPendiente = usePortal((s) => s.consultaPendiente);

  const [step, setStep] = useState(1); // 1–4; 5 = splash
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [depto, setDepto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [colegiacion, setColegiacion] = useState("");
  const [archivo, setArchivo] = useState<string | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [error, setError] = useState("");

  const limpiar = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setError("");
  };

  const irPaso2 = () => {
    if (!nombre.trim()) return setError("Escribe tu nombre completo.");
    if (!EMAIL_RE.test(correo)) return setError("Ingresa un correo electrónico válido.");
    if (pass.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (!acepta) return setError("Debes aceptar los términos para continuar.");
    setError("");
    setStep(2);
  };

  const irPaso4 = () => {
    if (sel.length === 0) return setError("Elige al menos una materia para tus alertas.");
    setError("");
    setStep(4);
  };

  const f = fuerzaPass(pass);
  const nivel = NIVELES_FUERZA[f]!;
  const primerNombre = nombre.trim().split(/\s+/)[0] || "abogado";
  const validacionEnviada = !!archivo || !!colegiacion;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="relative mb-[26px] flex flex-col items-center gap-4">
        <LogoJustihn size={34} variante="oscuro" textoPx={24} />
        {consultaPendiente && step < 4 && (
          <div
            className="max-w-[480px] rounded-[12px] border px-4 py-2.5 text-center"
            style={{
              background: "rgba(255,255,255,.07)",
              borderColor: "rgba(255,255,255,.16)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              className="text-[10.5px] font-bold tracking-[1.4px] uppercase"
              style={{ color: "#5fb0e0" }}
            >
              Tu pregunta te espera
            </p>
            <p className="mt-1 text-[12.5px] leading-[1.5]" style={{ color: "#c6d6e8" }}>
              “{consultaPendiente}”
            </p>
          </div>
        )}
      </div>

      <div
        className="auth-fadeup-card card-dia relative w-full max-w-[520px] rounded-[18px] bg-white px-9 pt-[34px] pb-[30px] text-marino max-sm:px-6"
        style={{ boxShadow: "0 24px 64px rgba(5,12,26,.45)" }}
      >
        {step < 4 && <Stepper step={step} />}

        {step === 1 && (
          <div className="auth-fadeup">
            <h1 className="font-display text-[23px] font-bold tracking-[-.3px]">
              Crea tu cuenta
            </h1>
            <p className="mt-[5px] text-[13.5px] leading-[1.55]" style={{ color: "#5a6b82" }}>
              Empieza gratis. Jurisprudencia, alertas de La Gaceta y Jus IA en un solo
              lugar.
            </p>
            <form
              className="mt-[22px] flex flex-col gap-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                irPaso2();
              }}
            >
              <CampoDia
                etiqueta="Nombre completo"
                tipo="text"
                nombre="nombre"
                placeholder="Ej. María Castillo Zelaya"
                valor={nombre}
                onCambio={limpiar(setNombre)}
              />
              <CampoDia
                etiqueta="Correo electrónico"
                tipo="email"
                nombre="correo"
                placeholder="nombre@bufete.hn"
                valor={correo}
                onCambio={limpiar(setCorreo)}
              />
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ob-pass"
                  className="text-[12.5px] font-semibold"
                  style={{ color: "#33475e" }}
                >
                  Contraseña
                </label>
                <div className="relative flex">
                  <input
                    id="ob-pass"
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
                {pass.length > 0 && (
                  <div className="mt-0.5 flex items-center gap-2">
                    <div
                      className="h-1 flex-1 overflow-hidden rounded-[4px]"
                      style={{ background: "#e9eef5" }}
                    >
                      <div
                        className="h-full rounded-[4px] transition-all duration-250"
                        style={{ width: `${f * 25}%`, background: nivel.color }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-semibold whitespace-nowrap"
                      style={{ color: nivel.color }}
                    >
                      {nivel.label}
                    </span>
                  </div>
                )}
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
              {error && <ErrorDia mensaje={error} />}
              <button
                type="submit"
                className="btn-marino mt-1 cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold"
              >
                Continuar
              </button>
              <p className="text-center text-[13px]" style={{ color: "#5a6b82" }}>
                ¿Ya tienes cuenta?{" "}
                <Link href="/iniciar-sesion" className="font-semibold">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="auth-fadeup">
            <h1 className="font-display text-[23px] font-bold tracking-[-.3px]">
              Valida tu perfil profesional
            </h1>
            <p className="mt-[5px] text-[13.5px] leading-[1.55]" style={{ color: "#5a6b82" }}>
              Un perfil validado con el CAH genera hasta{" "}
              <b className="text-marino">3× más contactos</b> de clientes. Puedes hacerlo
              después.
            </p>
            <div className="mt-[22px] flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <CampoDia
                  etiqueta="Teléfono"
                  tipo="tel"
                  nombre="telefono"
                  placeholder="+504 9999-9999"
                  valor={telefono}
                  onCambio={limpiar(setTelefono)}
                />
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-semibold" style={{ color: "#33475e" }}>
                    Departamento
                  </span>
                  <select
                    value={depto}
                    onChange={(e) => setDepto(e.target.value)}
                    className="input-dia rounded-[10px] border bg-white px-2.5 py-[11px] text-[14px] text-marino outline-none"
                  >
                    <option value="">Selecciona…</option>
                    {DEPARTAMENTOS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <CampoDia
                etiqueta="Ciudad"
                tipo="text"
                nombre="ciudad"
                placeholder="Ej. Tegucigalpa"
                valor={ciudad}
                onCambio={limpiar(setCiudad)}
              />
              <CampoDia
                etiqueta="Nº de colegiación CAH"
                tipo="text"
                nombre="colegiacion"
                placeholder="Ej. 12345"
                valor={colegiacion}
                onCambio={limpiar(setColegiacion)}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold" style={{ color: "#33475e" }}>
                  Constancia de solvencia CAH{" "}
                  <span className="font-normal" style={{ color: "#8095ad" }}>
                    (PDF o imagen)
                  </span>
                </span>
                {!archivo ? (
                  <label
                    htmlFor="ob-file"
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-[12px] border-[1.5px] border-dashed px-4 py-[26px] text-center transition-colors hover:border-celeste hover:bg-[#f4f9fd]"
                    style={{ borderColor: "#b9c8da" }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1584c7"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 16 V4" />
                      <path d="M7 9 L12 4 L17 9" />
                      <path d="M4 16 v3 a1.5 1.5 0 0 0 1.5 1.5 h13 a1.5 1.5 0 0 0 1.5-1.5 v-3" />
                    </svg>
                    <span className="text-[13px]" style={{ color: "#33475e" }}>
                      <b className="text-celeste">Haz clic para subir</b> o arrastra el
                      archivo aquí
                    </span>
                    <span className="text-[11.5px]" style={{ color: "#8095ad" }}>
                      Máx. 10 MB
                    </span>
                  </label>
                ) : (
                  <div
                    className="flex items-center gap-3 rounded-[12px] border px-4 py-[13px]"
                    style={{ borderColor: "#cfe3d2", background: "#f2f9f3" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2e7d43"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 12.5 L11 15.5 L16.5 9.5" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p
                        className="overflow-hidden text-[13px] font-semibold text-ellipsis whitespace-nowrap"
                        style={{ color: "#245c34" }}
                      >
                        {archivo}
                      </p>
                      <p className="text-[11.5px]" style={{ color: "#5a7c64" }}>
                        Listo para enviar a revisión
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setArchivo(null)}
                      aria-label="Quitar archivo"
                      className="grid cursor-pointer place-items-center transition-colors hover:text-[#a33b2e]"
                      style={{ color: "#8095ad" }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                )}
                <input
                  id="ob-file"
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const fl = e.target.files?.[0];
                    if (fl) setArchivo(fl.name);
                  }}
                />
              </div>
              <div
                className="flex gap-2.5 rounded-[10px] px-3.5 py-[11px] text-[12px] leading-[1.55]"
                style={{ background: "#f4f6f9", color: "#5a6b82" }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1584c7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="mt-px min-w-[15px]"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v.01" />
                  <path d="M12 11v5" />
                </svg>
                <span>
                  La revisión toma 1–2 días hábiles. Mientras tanto puedes usar Justihn con
                  normalidad.
                </span>
              </div>
              <div className="mt-1 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setArchivo(null);
                    setColegiacion("");
                    setError("");
                    setStep(3);
                  }}
                  className="flex-1 cursor-pointer rounded-[10px] border bg-white py-[13px] text-[14px] font-semibold transition-colors hover:text-marino"
                  style={{ borderColor: "#d5dde8", color: "#5a6b82" }}
                >
                  Lo haré después
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(3);
                  }}
                  className="btn-marino flex-[1.4] cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold"
                >
                  Continuar
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="cursor-pointer text-center text-[13px] transition-colors select-none hover:text-celeste"
                style={{ color: "#8095ad" }}
              >
                ← Atrás
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="auth-fadeup">
            <h1 className="font-display text-[23px] font-bold tracking-[-.3px]">
              ¿Cuáles son tus materias?
            </h1>
            <p className="mt-[5px] text-[13.5px] leading-[1.55]" style={{ color: "#5a6b82" }}>
              Personalizamos tus alertas de La Gaceta y los resultados de jurisprudencia.
              Elige al menos una.
            </p>
            <div className="mt-[22px] flex flex-wrap gap-[9px]">
              {MATERIAS_REGISTRO.map((m) => {
                const on = sel.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSel(on ? sel.filter((x) => x !== m) : [...sel, m]);
                      setError("");
                    }}
                    className="cursor-pointer rounded-[22px] border-[1.5px] px-[15px] py-2 text-[13px] transition-all duration-150 select-none hover:border-celeste"
                    style={
                      on
                        ? {
                            borderColor: "#1584c7",
                            background: "#e9f4fb",
                            color: "#0e5f92",
                            fontWeight: 600,
                          }
                        : {
                            borderColor: "#d5dde8",
                            background: "#fff",
                            color: "#33475e",
                            fontWeight: 500,
                          }
                    }
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <p className="mt-3.5 text-[12px]" style={{ color: "#8095ad" }}>
              {sel.length === 0
                ? "Ninguna seleccionada aún"
                : `${sel.length} de ${MATERIAS_REGISTRO.length} seleccionadas`}
            </p>
            {error && (
              <div className="mt-3">
                <ErrorDia mensaje={error} />
              </div>
            )}
            <div className="mt-[18px] flex flex-col gap-3">
              <button
                type="button"
                onClick={irPaso4}
                className="btn-marino cursor-pointer rounded-[10px] border-none py-[13px] text-[14.5px] font-semibold"
              >
                Finalizar
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
                className="cursor-pointer text-center text-[13px] transition-colors select-none hover:text-celeste"
                style={{ color: "#8095ad" }}
              >
                ← Atrás
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="auth-fadeup flex flex-col items-center pt-2 pb-1 text-center">
            <div
              className="grid h-[72px] w-[72px] place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg,#1584c7,#0e5f92)",
                boxShadow: "0 10px 28px rgba(21,132,199,.35)",
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4.5 12.5 L10 18 L19.5 7" />
              </svg>
            </div>
            <h1 className="font-display mt-[18px] text-[24px] font-bold tracking-[-.3px]">
              ¡Bienvenido a Justihn, {primerNombre}!
            </h1>
            <p
              className="mt-1.5 max-w-[380px] text-[13.5px] leading-[1.6]"
              style={{ color: "#5a6b82" }}
            >
              Tu cuenta está lista en el plan <b className="text-marino">Gratis</b>. Podrás
              ver los planes dentro del portal cuando quieras.
            </p>
            <div className="mt-[22px] flex w-full flex-col gap-2 text-left">
              <FilaResumen
                ok
                texto={`Cuenta creada con ${correo || "tu correo"}`}
                tag="Listo"
              />
              {validacionEnviada ? (
                <FilaResumen ok texto="Validación CAH enviada a revisión" tag="1–2 días" />
              ) : (
                <FilaResumen ok={false} texto="Validación CAH pendiente" tag="Después" />
              )}
              <FilaResumen
                ok
                texto={`${sel.length} ${sel.length === 1 ? "materia suscrita" : "materias suscritas"} para alertas`}
                tag="Listo"
              />
            </div>
            <div className="mt-5 w-full text-left">
              <p
                className="text-[11px] font-semibold tracking-[1.4px] uppercase"
                style={{ color: "#8095ad" }}
              >
                Primeros pasos en tu portal
              </p>
              <div className="mt-2.5 flex flex-col gap-2">
                {[
                  "Haz tu primera búsqueda de jurisprudencia",
                  "Pregúntale algo a Jus IA — siempre cita su fuente",
                  "Revisa las alertas de La Gaceta en tus materias",
                ].map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-[11px] rounded-[10px] border px-3.5 py-[11px]"
                    style={{ borderColor: "#e3e9f0" }}
                  >
                    <span
                      aria-hidden
                      className="h-[17px] w-[17px] min-w-[17px] rounded-[5px] border-[1.5px]"
                      style={{ borderColor: "#b9c8da" }}
                    />
                    <span className="text-[13px]" style={{ color: "#33475e" }}>
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="btn-marino mt-[22px] w-full cursor-pointer rounded-[10px] border-none py-3.5 text-[15px] font-semibold"
            >
              Entrar al portal
            </button>
          </div>
        )}
      </div>

      {step === 5 && <SplashJustihn />}

      <p className="relative mt-4 text-[11.5px]" style={{ color: "#5f7ba0" }}>
        Demo de validación — todavía no se crean cuentas ni se guardan tus datos.
      </p>
      <p className="relative mt-2 text-[12px]" style={{ color: "#5f7ba0" }}>
        © 2026 Justihn · Honduras
      </p>
    </section>
  );
}

/** Stepper de 3 pasos: círculo 28px + label + líneas conectoras que se pintan. */
function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-[26px] flex items-center">
      {PASOS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const act = step === n;
        return (
          <div key={label} className="contents">
            <div className="flex min-w-[74px] flex-col items-center gap-1.5">
              <div
                className="grid h-7 w-7 place-items-center rounded-full border-[1.5px] text-[12.5px] font-bold transition-all duration-250"
                style={{
                  background: done ? "#1584c7" : act ? "#0d2144" : "#fff",
                  color: done || act ? "#fff" : "#8095ad",
                  borderColor: done ? "#1584c7" : act ? "#0d2144" : "#d5dde8",
                }}
              >
                {done ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4.5 12.5 L10 18 L19.5 7" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className="text-[11px] font-semibold"
                style={{ color: act ? "#0d2144" : done ? "#1584c7" : "#8095ad" }}
              >
                {label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div
                className="mx-1 mb-5 h-0.5 flex-1 rounded-[2px]"
                style={{ background: step > n ? "#1584c7" : "#e3e9f0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Campo de texto sobre el card blanco. */
function CampoDia({
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
        autoComplete={tipo === "email" ? "email" : "off"}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="input-dia rounded-[10px] border px-3.5 py-[11px] text-[14px] text-marino outline-none"
      />
    </label>
  );
}

function ErrorDia({ mensaje }: { mensaje: string }) {
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

function FilaResumen({ ok, texto, tag }: { ok: boolean; texto: string; tag: string }) {
  return (
    <div
      className="flex items-center gap-[11px] rounded-[10px] px-3.5 py-[11px]"
      style={{ background: "#f4f6f9" }}
    >
      <span
        aria-hidden
        className="h-[9px] w-[9px] min-w-[9px] rounded-full"
        style={{ background: ok ? "#2e7d43" : "#c99a3a" }}
      />
      <span className="flex-1 text-[13px]" style={{ color: "#33475e" }}>
        {texto}
      </span>
      <span
        className="rounded-[14px] px-[9px] py-0.5 text-[11px] font-semibold"
        style={
          ok
            ? { background: "#e8f3ea", color: "#2e7d43" }
            : { background: "#faf3e2", color: "#8a6d2a" }
        }
      >
        {tag}
      </span>
    </div>
  );
}
