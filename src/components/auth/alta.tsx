"use client";

/**
 * Puerta única de alta: `/crear-cuenta` para el abogado (el onboarding de tres
 * pasos) y `/crear-cuenta?tipo=persona` para la vía B (un formulario corto).
 *
 * Una sola URL con dos formularios, no dos rutas: hace pareja con el login,
 * que sí es compartido. Lo que cambia es lo que el producto necesita saber de
 * cada uno — no dónde se registra.
 */
import { PantallaOnboarding } from "@/components/auth/onboarding";
import { RegistroPersona } from "@/components/auth/registro-persona";
import { useParametroUrl } from "@/hooks/use-busqueda-url";

export function PantallaAlta() {
  return useParametroUrl("tipo") === "persona" ? <RegistroPersona /> : <PantallaOnboarding />;
}
