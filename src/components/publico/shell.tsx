"use client";

/**
 * Shell del sitio público (Vía B — gente común): header de navegación simple
 * y footer con las guardas legales. Sin sidebar ni sesión: esto es la cara
 * indexable del dominio; el portal de suscriptores vive bajo /abogados.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoJustihn } from "@/components/brand/logos";
import { cn } from "@/lib/utils";

const NAV_PUBLICA = [
  { href: "/tramites", label: "Trámites" },
  { href: "/consultorio", label: "Consultorio" },
  { href: "/directorio", label: "Encuentra abogado" },
];

export function HeaderPublico() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 md:px-6">
        <Link href="/" aria-label="Justihn — inicio" className="mr-1">
          <LogoJustihn size={30} textoPx={18} />
        </Link>

        <nav aria-label="Navegación pública" className="flex items-center gap-1">
          {NAV_PUBLICA.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13.5px] font-medium",
                pathname.startsWith(item.href)
                  ? "bg-chip text-celeste"
                  : "text-texto-2 hover:bg-lienzo hover:text-marino",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <span className="flex-1" />

        <Link
          href="/abogados"
          className="rounded-lg px-3 py-2 text-[12.5px] font-medium whitespace-nowrap text-texto-2 hover:bg-lienzo hover:text-marino"
        >
          Soy abogado
        </Link>
        <Link
          href="/persona"
          className="rounded-lg bg-celeste px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap text-white hover:bg-cruce"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </header>
  );
}

export function FooterPublico() {
  return (
    <footer className="mt-14 border-t border-borde bg-white">
      <div className="mx-auto flex max-w-[1140px] flex-wrap items-start justify-between gap-6 px-4 py-8 md:px-6">
        <div className="max-w-[420px]">
          <LogoJustihn size={26} textoPx={16} />
          <p className="mt-2.5 text-[12.5px] leading-[1.6] text-texto-3">
            Orientación legal con fuentes oficiales para Honduras. Justihn no es un bufete: las
            guías son orientación general y no sustituyen la asesoría de un profesional del
            derecho sobre tu caso concreto.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-[12.5px]">
          <span className="text-[11px] font-semibold tracking-[1px] text-texto-4 uppercase">
            Para ti
          </span>
          <Link href="/tramites">Guías de trámites</Link>
          <Link href="/consultorio">Consultorio gratuito</Link>
          <Link href="/directorio">Encuentra abogado</Link>
        </div>
        <div className="flex flex-col gap-1.5 text-[12.5px]">
          <span className="text-[11px] font-semibold tracking-[1px] text-texto-4 uppercase">
            Abogados
          </span>
          <Link href="/abogados">Portal de abogados</Link>
          <Link href="/abogados/planes">Planes</Link>
        </div>
      </div>
      <div className="border-t border-borde-suave">
        <p className="mx-auto max-w-[1140px] px-4 py-3.5 text-[11.5px] text-texto-4 md:px-6">
          Tienes derecho a revisar y pedir la supresión de tus datos (habeas data, art. 182 de la
          Constitución) — escríbenos y respondemos en 72 horas hábiles. · Justihn (demo de
          validación)
        </p>
      </div>
    </footer>
  );
}
