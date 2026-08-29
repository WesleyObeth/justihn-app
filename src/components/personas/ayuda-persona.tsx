"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono } from "@/components/brand/iconos";
import { Boton, Card, CardMarino, TituloSeccion } from "@/components/ui/primitivos";
import { usePortal } from "@/store/portal";

const FAQS_PERSONA = [
  {
    pregunta: "¿El consultorio de verdad es gratis?",
    respuesta:
      "Sí. Preguntas gratis y abogados colegiados responden en público con orientación general. Solo pagas si decides contratar a un abogado para llevar tu caso — y eso lo acuerdas directamente con él.",
  },
  {
    pregunta: "¿Quiénes responden mis preguntas?",
    respuesta:
      "Profesionales del derecho colegiados en el CAH. Los perfiles con insignia 'Validado' comprobaron su colegiación con documentos. Recuerda: la respuesta pública es orientación, no asesoría de tu caso concreto.",
  },
  {
    pregunta: "¿Las guías de trámites sustituyen a un abogado?",
    respuesta:
      "No — te explican el camino estándar (pasos, requisitos, dónde). Para casos con complicaciones (herencias en disputa, propiedades con gravámenes, despidos con contratos raros), un abogado te ahorra dinero y problemas.",
  },
  {
    pregunta: "¿Qué pasa con mis datos?",
    respuesta:
      "Son tuyos. Puedes descargarlos o pedir su supresión cuando quieras desde Configuración (habeas data, art. 182 de la Constitución). Tus preguntas del consultorio son públicas y anónimas — nunca publiques datos que te identifiquen.",
  },
  {
    pregunta: "¿Qué incluirá el plan de pago?",
    respuesta:
      "Está en definición: verificaciones de personas y propiedades, alertas sobre tu nombre y más herramientas de protección. Lo que hoy es gratis (guías, consultorio, calculadora) seguirá siendo gratis.",
  },
];

export function AyudaPersona() {
  const [abierta, setAbierta] = useState(-1);
  const mostrarToast = usePortal((s) => s.mostrarToast);

  return (
    <div className="flex max-w-[860px] flex-col gap-4" style={{ animation: "fadeUp .3s ease" }}>
      <h1 className="font-display text-[24px] font-bold">Ayuda</h1>

      <CardMarino className="flex flex-wrap items-center gap-4 px-6 py-5.5">
        <div className="flex-1">
          <TituloSeccion className="text-[16px] font-bold text-white">
            ¿Necesitas ayuda con la plataforma?
          </TituloSeccion>
          <p className="mt-1 text-[13px] text-sobre-marino-2">
            Soporte por WhatsApp de lunes a viernes, 8:00–17:00.
          </p>
        </div>
        <Boton
          variante="celeste"
          className="px-4.5 whitespace-nowrap"
          onClick={() => mostrarToast("Abriendo WhatsApp — soporte Justihn")}
        >
          Escribir por WhatsApp
        </Boton>
      </CardMarino>

      <Card className="px-6 py-2">
        {FAQS_PERSONA.map((faq, i) => {
          const estaAbierta = abierta === i;
          return (
            <div key={faq.pregunta} className="border-b border-sutil py-4 last:border-b-0">
              <button
                type="button"
                onClick={() => setAbierta(estaAbierta ? -1 : i)}
                aria-expanded={estaAbierta}
                className="flex w-full cursor-pointer items-center gap-2.5 text-left"
              >
                <span className="flex-1 text-sm font-semibold">{faq.pregunta}</span>
                <span
                  className="grid place-items-center text-texto-4 transition-transform duration-200"
                  style={{ transform: estaAbierta ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <Icono nombre="chevron" size={15} />
                </span>
              </button>
              {estaAbierta && (
                <p className="mt-2.5 max-w-[640px] text-[13.5px] leading-[1.6] text-texto-3">
                  {faq.respuesta}
                </p>
              )}
            </div>
          );
        })}
      </Card>

      <Card className="flex flex-wrap items-center gap-4 px-6 py-5">
        <div className="min-w-[220px] flex-1">
          <TituloSeccion className="text-[14.5px]">¿Tu duda es legal, no de la plataforma?</TituloSeccion>
          <p className="mt-1 text-[12.5px] text-texto-3">
            Pregunta gratis en el consultorio y un abogado colegiado te orienta.
          </p>
        </div>
        <Link
          href="/personas/consultas"
          className="rounded-xl bg-celeste px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-cruce"
        >
          Hacer una consulta
        </Link>
      </Card>
    </div>
  );
}
