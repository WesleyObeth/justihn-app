/**
 * "Lo que encuentras dentro" — **mosaico de nueve piezas**.
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
 * El reparto quedó así: **esta sección es el INVENTARIO** (qué hay) y **los
 * demos son la DEMOSTRACIÓN** (cómo se ve funcionando). Por eso aquí no hay
 * ninguna ventana.
 *
 * El mosaico —una celda ancha por fila, alternando de lado— da la jerarquía
 * que faltaba (Jus IA es el corazón del producto y ahora se ve) y una textura
 * que ninguna otra sección de la página tiene: los pilares de "Cómo cita" son
 * tres cards uniformes, los demos son ventanas, los planes tres columnas.
 *
 * **Sin encabezados de categoría** (decisión Wesley 2026-08-30): el orden
 * sigue agrupando por trabajo —investigar, vigilar, producir— pero sin
 * rotularlo. Tres titulares dentro de una sección que ya tiene el suyo hacían
 * cuatro niveles de jerarquía en el mismo bloque, y partían el mosaico en tres
 * rejillas sueltas en vez de una superficie continua.
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

/**
 * Las nueve, en un solo mosaico. El ORDEN sigue agrupando por trabajo
 * (investigar → vigilar → producir) aunque no se rotule, y las tres celdas
 * anchas caen una por fila alternando de lado: con 4 columnas, cada fila
 * suma exactamente 2+1+1, así que el mosaico teja sin huecos.
 */
const FUNCIONES: Funcion[] = [
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
    <div className="mt-9 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {FUNCIONES.map((f) => (
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
          <h3
            className={`mt-3.5 leading-[1.28] font-bold ${f.ancha ? "font-display text-[18px]" : "text-[14.5px]"}`}
          >
            {f.titulo}
          </h3>
          <p
            className={`mt-2 flex-1 leading-[1.6] ${f.ancha ? "text-[13.5px]" : "text-[12.5px]"}`}
            style={{ color: "var(--muted)" }}
          >
            {f.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
