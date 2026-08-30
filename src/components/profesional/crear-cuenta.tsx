"use client";

/**
 * Puerta de cuenta de la vía A. El composer público deja la pregunta en el
 * store y trae aquí: la consulta NO se pierde, se muestra y se dispara sola al
 * entrar al chat.
 *
 * ⚠️ FASE 1 — todavía no hay autenticación real. Los campos son la maqueta del
 * formulario y el botón de continuar usa la sesión de demostración, para que
 * el recorrido siga siendo recorrible en la validación con abogados.
 *
 * TODO(auth): Supabase Auth (blueprint §4 y plataforma/CLAUDE.md §7.2) —
 * `signInWithOtp` / `signInWithPassword`, sesión en cookie y RLS por
 * `abogado_id`. Al cablearlo: quitar `JUSTIHN_DEMO_SESSION`, pasar las rutas
 * de la API a `role: "session"` y sustituir `continuar()` por el alta real,
 * conservando el `consultaPendiente` para redirigir al chat después del login.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { usePortal } from "@/store/portal";

export function PantallaCrearCuenta() {
  const router = useRouter();
  const consultaPendiente = usePortal((s) => s.consultaPendiente);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const [modo, setModo] = useState<"crear" | "entrar">("crear");

  // Se lee directo del store: con `skipHydration` el primer render del cliente
  // usa los valores iniciales (null, igual que el servidor) y `HidratarStore`
  // lo repuebla tras el mount. No hace falta copiarlo a estado local.
  const pregunta = consultaPendiente;

  const continuar = () => {
    mostrarToast("Alta simulada — así entrarías a Jus IA (demo de validación)");
    router.push("/abogados");
  };

  return (
    <div className="landing-contenido">
      <section className="mx-auto max-w-[440px] px-5 pt-[150px] pb-20 md:pt-[176px]">
        {pregunta && (
          <div className="glass-card mb-5 p-4">
            <p
              className="text-[11px] font-bold tracking-[1.4px] uppercase"
              style={{ color: "var(--mint)" }}
            >
              Tu pregunta te espera
            </p>
            <p className="mt-1.5 text-[13.5px] leading-[1.55]">“{pregunta}”</p>
          </div>
        )}

        <h1 className="font-display text-[27px] leading-[1.2] font-bold">
          {modo === "crear" ? "Crea tu cuenta para preguntar" : "Entra a tu cuenta"}
        </h1>
        <p className="mt-2 text-[13.5px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          {modo === "crear"
            ? "Gratis para empezar. Jus IA responde citando la sentencia o el artículo — y necesita saber quién pregunta para llevar la cuenta de tus consultas."
            : "Con tu correo y contraseña vuelves a donde lo dejaste."}
        </p>

        <form
          className="mt-6 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            continuar();
          }}
        >
          {modo === "crear" && (
            <Campo etiqueta="Nombre y apellido" tipo="text" nombre="nombre" />
          )}
          <Campo etiqueta="Correo" tipo="email" nombre="correo" />
          <Campo etiqueta="Contraseña" tipo="password" nombre="clave" />
          <button
            type="submit"
            className="mt-1 rounded-[12px] py-3 text-[14.5px] font-semibold text-white"
            style={{ background: "var(--turq)" }}
          >
            {modo === "crear" ? "Crear cuenta gratis" : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px]" style={{ color: "var(--muted)" }}>
          {modo === "crear" ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setModo(modo === "crear" ? "entrar" : "crear")}
            className="cursor-pointer font-semibold"
            style={{ color: "var(--mint)" }}
          >
            {modo === "crear" ? "Entrar" : "Crear una"}
          </button>
        </p>

        <div
          className="mt-6 flex items-start gap-2 rounded-[10px] border px-3.5 py-2.5 text-[12px] leading-[1.5]"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          <span className="mt-px shrink-0" style={{ color: "var(--mint)" }}>
            <Icono nombre="alerta" size={13} />
          </span>
          <span>
            Demo de validación: todavía no se crean cuentas de verdad ni se guardan tus
            datos. El botón te deja entrar al portal para que lo recorras.
          </span>
        </div>

        <p className="mt-5 text-center text-[12.5px]">
          <Link href="/para-abogados" style={{ color: "var(--muted)" }}>
            ← Volver a Justihn para abogados
          </Link>
        </p>
      </section>
    </div>
  );
}

function Campo({
  etiqueta,
  tipo,
  nombre,
}: {
  etiqueta: string;
  tipo: string;
  nombre: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold">{etiqueta}</span>
      <input
        type={tipo}
        name={nombre}
        autoComplete={tipo === "password" ? "current-password" : tipo}
        className="rounded-[10px] border border-borde bg-white px-3.5 py-2.5 text-[14px] text-marino outline-none focus:border-celeste"
      />
    </label>
  );
}
