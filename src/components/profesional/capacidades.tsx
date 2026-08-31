/**
 * "Lo que encuentras dentro" — **mosaico agrupado en tres categorías**.
 *
 * Historia corta de por qué es así (2026-08-30, tres rondas con Wesley):
 * empezó siendo un muro de 8 cards iguales; pasó por una versión con panel de
 * producto a la derecha (patrón de referencia), y esa se descartó por un
 * motivo que solo se ve mirando la página entera:
 *
 *   **Había CUATRO secciones seguidas con ventana de producto** — esta y los
 *   tres demos de debajo — y las tres ventanas de aquí enseñaban Jus IA,
 *   Gaceta y Leads, que son exactamente los tres demos que vienen después.
 *   No era parecido: era lo mismo, dos veces.
 *
 * El reparto quedó así: **esta sección es el INVENTARIO** (qué hay, agrupado
 * por el trabajo que resuelve) y **los demos son la DEMOSTRACIÓN** (cómo se
 * ve funcionando). Por eso aquí no hay ninguna ventana.
 *
 * El mosaico —una celda ancha por fila, alternando de lado— da la jerarquía
 * que faltaba (Jus IA es el corazón del producto y ahora se ve) y una textura
 * que ninguna otra sección de la página tiene: los pilares de "Cómo cita" son
 * tres cards uniformes, los demos son ventanas, los planes tres columnas.
 *
 * Sin estado ni interacción: es un componente de servidor, así que las nueve
 * funciones llegan íntegras al HTML sin depender de hidratación.
 */
import { Icono, type NombreIcono } from "@/components/brand/iconos";
import { SimboloJusIA } from "@/components/brand/logos";

type IconoCap = NombreIcono | "jus-ia";

interface Funcion {
  icono: IconoCap;
  titulo: string;
  desc: string;
  /** Ocupa el doble de ancho: la pieza que manda en su fila. */
  ancha?: boolean;
}

interface Categoria {
  id: string;
  etiqueta: string;
  sub: string;
  funciones: Funcion[];
}

/**
 * La celda ancha alterna de posición por fila (izquierda · derecha ·
 * izquierda). Es lo que convierte tres rejillas en un mosaico: con la ancha
 * siempre al principio, las tres filas se leerían idénticas.
 */
const CATEGORIAS: Categoria[] = [
  {
    id: "investigar",
    etiqueta: "Investigar con fuente",
    sub: "Lo que antes era una tarde entre PDFs",
    funciones: [
      {
        icono: "jus-ia",
        titulo: "Jus IA responde citando",
        desc: "Preguntas en lenguaje normal y recibes la sentencia o el artículo que sostiene la respuesta. Si no encuentra la fuente lo dice, en vez de rellenar el hueco — que es lo que separa a Justihn de un chatbot.",
        ancha: true,
      },
      {
        icono: "juris",
        titulo: "Jurisprudencia del CSJ",
        desc: "Con el resumen del CEDIJ, órgano, magistrado y fallo, filtrada por materia.",
      },
      {
        icono: "libro",
        titulo: "Legislación vigente",
        desc: "Códigos y artículos con síntesis y enlace al PDF oficial del Poder Judicial.",
      },
    ],
  },
  {
    id: "vigilar",
    etiqueta: "No perder nada de vista",
    sub: "Lo que se pierde por enterarse tarde",
    funciones: [
      {
        icono: "gaceta",
        titulo: "Alertas de La Gaceta",
        desc: "Por materia, con el efecto práctico y no solo el titular del acuerdo.",
      },
      {
        icono: "perfil",
        titulo: "Monitoreo de nombres",
        desc: "Te avisa si un nombre que vigilas aparece en lo que el Estado publica.",
      },
      {
        icono: "pasos",
        titulo: "Procesos con sus plazos",
        desc: "El camino procesal paso por paso, con su checklist, para no dejar vencer un término por descuido.",
        ancha: true,
      },
    ],
  },
  {
    id: "producir",
    etiqueta: "Producir y conseguir clientes",
    sub: "Del escrito al cliente siguiente",
    funciones: [
      {
        icono: "leads",
        titulo: "Leads del consultorio",
        desc: "Las consultas que la gente hace en el lado público llegan con su materia y su ciudad. Cada guía de trámite recomienda un abogado de esa materia, y cada consulta sin responder es un cliente esperando.",
        ancha: true,
      },
      {
        icono: "plantillas",
        titulo: "Modelos de escritos",
        desc: "Demandas y escritos editables como punto de partida, no como plantilla ciega.",
      },
      {
        icono: "calc",
        titulo: "Calculadoras del litigante",
        desc: "Prestaciones, cómputo de plazos y vía procesal según la cuantía.",
      },
    ],
  },
];

function IconoFn({ nombre, ancha }: { nombre: IconoCap; ancha?: boolean }) {
  const size = ancha ? 22 : 17;
  return nombre === "jus-ia" ? (
    <SimboloJusIA size={size + 2} variante="claro" />
  ) : (
    <Icono nombre={nombre} size={size} />
  );
}

export function Capacidades() {
  return (
    <div className="mt-9 flex flex-col gap-9">
      {CATEGORIAS.map((c) => (
        <div key={c.id}>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h3 className="font-display text-[17px] font-bold">{c.etiqueta}</h3>
            <span className="text-[13px]" style={{ color: "var(--muted)" }}>
              {c.sub}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {c.funciones.map((f) => (
              <div
                key={f.titulo}
                className={`glass-card flex flex-col p-5 ${f.ancha ? "sm:col-span-2" : ""}`}
                style={
                  f.ancha
                    ? {
                        borderColor: "rgba(21,132,199,.34)",
                        background:
                          "linear-gradient(155deg, rgba(21,132,199,.09), rgba(255,255,255,.72) 58%)",
                      }
                    : undefined
                }
              >
                <span
                  className={`grid place-items-center rounded-xl ${f.ancha ? "h-11 w-11" : "h-9 w-9"}`}
                  style={{ background: "rgba(21,132,199,.12)", color: "var(--mint)" }}
                >
                  <IconoFn nombre={f.icono} ancha={f.ancha} />
                </span>
                <h4
                  className={`mt-3.5 leading-[1.28] font-bold ${f.ancha ? "font-display text-[18px]" : "text-[14.5px]"}`}
                >
                  {f.titulo}
                </h4>
                <p
                  className={`mt-2 flex-1 leading-[1.6] ${f.ancha ? "text-[13.5px]" : "text-[12.5px]"}`}
                  style={{ color: "var(--muted)" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
