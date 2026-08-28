"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icono } from "@/components/brand/iconos";
import { SENTENCIAS } from "@/data/sentencias";
import { PUBLICACIONES } from "@/data/gaceta";
import { PLANTILLAS } from "@/data/catalogo";
import { PROCESOS } from "@/data/procesos";
import { CODIGOS } from "@/data/legislacion";
import { usePreguntarAJusIA } from "@/hooks/use-preguntar-jus-ia";

interface Resultado {
  titulo: string;
  meta: string;
  destino: string;
}

/**
 * Índice estático de pantallas: el buscador también navega la app, no solo el
 * corpus. Las `claves` son sinónimos con los que un abogado buscaría la vista.
 */
const PANTALLAS: { titulo: string; destino: string; claves: string }[] = [
  { titulo: "Jus IA", destino: "/abogados", claves: "asistente consulta chat inteligencia" },
  { titulo: "Dashboard", destino: "/abogados/dashboard", claves: "inicio resumen actividad" },
  { titulo: "Jurisprudencia", destino: "/abogados/jurisprudencia", claves: "sentencias fallos csj salas" },
  { titulo: "Legislación", destino: "/abogados/legislacion", claves: "codigos leyes articulos cpc procesal decreto" },
  { titulo: "Procesos", destino: "/abogados/procesos", claves: "paso a paso guia tramite requisitos checklist" },
  { titulo: "Alertas de Gaceta", destino: "/abogados/gaceta", claves: "publicaciones digest decretos acuerdos" },
  { titulo: "Monitoreo de nombres", destino: "/abogados/monitoreo", claves: "vigilar nombres apariciones vigilancia clientes contraparte" },
  { titulo: "Modelos de escritos", destino: "/abogados/modelos", claves: "plantillas machote demanda escrito formato" },
  { titulo: "Leads del consultorio", destino: "/abogados/leads", claves: "consultorio clientes preguntas" },
  { titulo: "Calculadoras", destino: "/abogados/calculadoras", claves: "prestaciones cesantia preaviso aranceles honorarios" },
  { titulo: "Mi perfil", destino: "/abogados/perfil", claves: "validacion directorio colegiacion facturas" },
  { titulo: "Planes y suscripción", destino: "/abogados/planes", claves: "precios premium profesional pro base mejorar upgrade" },
  { titulo: "Configuración", destino: "/abogados/configuracion", claves: "cuenta contrasena whatsapp correo notificaciones" },
  { titulo: "Notificaciones", destino: "/abogados/notificaciones", claves: "avisos alertas" },
  { titulo: "Ayuda", destino: "/abogados/ayuda", claves: "soporte faq preguntas frecuentes whatsapp" },
];

/** Comparación sin tildes ni mayúsculas: "configuracion" encuentra "Configuración". */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Busca en vivo (≥2 caracteres) en jurisprudencia, Gaceta, modelos, procesos
 * y pantallas de la app. ⌘K / Ctrl-K enfoca el campo. Sin resultados, ofrece
 * llevar la búsqueda a Jus IA — una búsqueda fallida es una consulta en potencia.
 *
 * TODO(data): en Fase 2 pasa a un endpoint con búsqueda full-text sobre el
 * corpus real; el shape agrupado ya es el que consumirá la UI.
 */
export function BuscadorGlobal() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const preguntar = usePreguntarAJusIA();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const termino = normalizar(q.trim());
  const hayTermino = termino.length >= 2;

  const grupos = useMemo(() => {
    if (!hayTermino) return [];

    const secciones: { seccion: string; items: Resultado[] }[] = [
      {
        seccion: "Jurisprudencia",
        items: SENTENCIAS.filter((s) =>
          normalizar(`${s.titulo} ${s.resumen} ${s.materia}`).includes(termino),
        )
          .slice(0, 3)
          .map((s) => ({
            titulo: s.titulo,
            meta: `${s.organo} · ${s.fecha}`,
            destino: `/abogados/jurisprudencia/${s.id}`,
          })),
      },
      {
        seccion: "Alertas de Gaceta",
        items: PUBLICACIONES.filter((p) => normalizar(p.titulo).includes(termino))
          .slice(0, 3)
          .map((p) => ({
            titulo: p.titulo,
            meta: "La Gaceta · agosto 2026",
            destino: `/abogados/gaceta/${p.id}`,
          })),
      },
      {
        seccion: "Legislación",
        items: CODIGOS.flatMap((c) =>
          c.articulos
            .filter((a) => normalizar(`${a.numero} ${a.titulo} ${a.sintesis}`).includes(termino))
            .map((a) => ({
              titulo: `Art. ${a.numero} — ${a.titulo}`,
              meta: `${c.nombre} · verificado`,
              destino: `/abogados/legislacion?codigo=${c.id}`,
            })),
        ).slice(0, 3),
      },
      {
        seccion: "Procesos",
        items: PROCESOS.filter((p) => normalizar(`${p.nombre} ${p.materia}`).includes(termino))
          .slice(0, 3)
          .map((p) => ({
            titulo: p.nombre,
            meta: `${p.materia} · ${p.pasos.length} pasos con fuente`,
            destino: `/abogados/procesos?proceso=${p.id}`,
          })),
      },
      {
        seccion: "Modelos",
        items: PLANTILLAS.filter((p) => normalizar(`${p.nombre} ${p.tipo}`).includes(termino))
          .slice(0, 3)
          .map((p) => ({
            titulo: p.nombre,
            meta: "Modelo editable · Premium",
            destino: "/abogados/modelos",
          })),
      },
      {
        seccion: "Ir a",
        items: PANTALLAS.filter((p) => normalizar(`${p.titulo} ${p.claves}`).includes(termino))
          .slice(0, 3)
          .map((p) => ({ titulo: p.titulo, meta: "Pantalla del portal", destino: p.destino })),
      },
    ];

    return secciones.filter((g) => g.items.length > 0);
  }, [termino, hayTermino]);

  const navegar = (destino: string) => {
    setQ("");
    setAbierto(false);
    router.push(destino);
  };

  const preguntarAJusIA = () => {
    const pregunta = q.trim();
    setQ("");
    setAbierto(false);
    preguntar(pregunta);
  };

  const sinResultados = hayTermino && grupos.length === 0;
  const mostrarPanel = abierto && (grupos.length > 0 || sinResultados);

  return (
    <div className="relative mx-3 mt-1 mb-2">
      <div className="flex items-center gap-2 rounded-[9px] border border-white/[0.12] bg-white/[0.07] px-3 py-2 focus-within:border-white/25">
        <Icono nombre="buscar" size={16} className="shrink-0 text-sobre-marino" />
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => window.setTimeout(() => setAbierto(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setAbierto(false);
            if (e.key === "Enter") {
              if (grupos[0]?.items[0]) navegar(grupos[0].items[0].destino);
              else if (sinResultados) preguntarAJusIA();
            }
          }}
          placeholder="Buscar en todo…"
          aria-label="Buscar en jurisprudencia, Gaceta, modelos, procesos y pantallas"
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[#e8eef6] outline-none placeholder:text-[#5f7ba0]"
        />
        <span className="rounded-[5px] border border-white/[0.15] px-[5px] py-px text-[10px] whitespace-nowrap text-[#5f7ba0]">
          ⌘K
        </span>
      </div>

      {mostrarPanel && (
        <div
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-[45] max-h-[340px] overflow-y-auto rounded-[10px] bg-white p-1.5"
          style={{ boxShadow: "var(--shadow-flotante)" }}
        >
          {grupos.map((grupo) => (
            <div key={grupo.seccion}>
              <div className="px-2.5 pt-2 pb-0.5 text-[10px] font-semibold tracking-[1.2px] text-texto-4 uppercase">
                {grupo.seccion}
              </div>
              {grupo.items.map((item) => (
                <button
                  key={`${grupo.seccion}-${item.titulo}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => navegar(item.destino)}
                  className="w-full cursor-pointer rounded-[7px] px-2.5 py-2 text-left hover:bg-[#eef3f9]"
                >
                  <div className="truncate text-[12.5px] font-semibold text-marino">
                    {item.titulo}
                  </div>
                  <div className="mt-px text-[11px] text-texto-4">{item.meta}</div>
                </button>
              ))}
            </div>
          ))}

          {sinResultados && (
            <div className="px-2.5 py-3">
              <div className="text-[12.5px] text-texto-3">
                Sin resultados para «{q.trim()}»
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={preguntarAJusIA}
                className="mt-2 w-full cursor-pointer rounded-lg bg-chip px-3 py-2 text-left text-[12.5px] font-semibold text-celeste hover:bg-[#d9ecf8]"
              >
                Preguntar a Jus IA →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
