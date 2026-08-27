"use client";

import Link from "next/link";
import { useState } from "react";
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { BotonJusIA } from "@/components/ia/boton-jus-ia";
import { Boton, Card, CardMarino, TituloSeccion } from "@/components/ui/primitivos";
import { FAQS } from "@/data/catalogo";
import { usePortal } from "@/store/portal";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";

const GUIAS: { titulo: string; desc: string; href: string; icono: NombreIcono }[] = [
  {
    titulo: "Primeros pasos con Jus IA",
    desc: "Pregunta y recibe respuestas con fuentes",
    href: "/abogados",
    icono: "libro",
  },
  {
    titulo: "Valida tu perfil",
    desc: "La insignia genera hasta 3× más contactos",
    href: "/abogados/perfil#validacion",
    icono: "perfil",
  },
  {
    titulo: "Planes y facturación",
    desc: "Base, Pro y pago anual con descuento",
    href: "/abogados/planes",
    icono: "planes",
  },
];

export function PantallaAyuda() {
  const [abierta, setAbierta] = useState(-1);
  const mostrarToast = usePortal((s) => s.mostrarToast);
  const preguntar = usePreguntarAJusIA();

  return (
    <div className="flex flex-col gap-4">
      <CardMarino className="flex flex-wrap items-center gap-4 px-6 py-5.5">
        <div className="flex-1">
          <TituloSeccion className="text-[17px] font-bold text-white">
            ¿Necesitas ayuda directa?
          </TituloSeccion>
          <p className="mt-1 text-[13px] text-sobre-marino-2">
            Soporte por WhatsApp de lunes a viernes, 8:00–17:00. Respondemos en menos de 1 hora
            hábil.
          </p>
        </div>
        {/* TODO(config): al fijar el número de soporte, esto pasa a un enlace
            wa.me real (validado como https:, §3.3). */}
        <Boton
          variante="celeste"
          className="px-4.5 whitespace-nowrap"
          onClick={() => mostrarToast("Abriendo WhatsApp — soporte Justihn")}
        >
          Escribir por WhatsApp
        </Boton>
      </CardMarino>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {GUIAS.map((g) => (
          <Link key={g.titulo} href={g.href} className="block text-marino">
            <Card interactiva className="flex h-full items-start gap-3 px-4.5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-chip text-celeste">
                <Icono nombre={g.icono} size={16} />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold">{g.titulo}</span>
                <span className="mt-0.5 block text-[12px] text-texto-3">{g.desc}</span>
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="px-6 py-2">
        {FAQS.map((faq, i) => {
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
          <TituloSeccion className="text-[14.5px]">¿No encontraste la respuesta?</TituloSeccion>
          <p className="mt-1 text-[12.5px] text-texto-3">
            Pregúntale a Jus IA sobre el portal — o sobre tu caso.
          </p>
        </div>
        <BotonJusIA
          onClick={() => preguntar("¿Qué más puedes hacer por mí?", { enviarDirecto: true })}
        >
          Preguntar a Jus IA
        </BotonJusIA>
      </Card>
    </div>
  );
}
