import { fechaTexto } from "@/lib/tiempo";
import type { DocumentoPropuesta } from "@/lib/honorarios";

/**
 * La propuesta como DOCUMENTO: lo que se imprime a PDF. Componente de
 * servidor puro (sin hooks) para que la vista previa y la impresión pinten
 * exactamente lo mismo. La estructura sigue el PDF que trajo el abogado
 * —membrete, objeto, servicios, honorarios, datos del cliente, requisitos,
 * advertencias, condiciones, firmas— porque ese formato ya lo entienden sus
 * clientes; lo que cambia es que los requisitos vienen citados de la fuente.
 */
export function DocumentoPropuestaVista({ doc }: { doc: DocumentoPropuesta }) {
  return (
    <article
      className="documento-imprimible mx-auto max-w-[820px] overflow-hidden rounded-xl border border-borde bg-white text-[12.5px] leading-[1.55] text-[#1c2a3d] shadow-papel print:rounded-none"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Membrete */}
      <header className="flex flex-wrap items-end justify-between gap-3 bg-marino px-9 py-5 text-white">
        <div>
          <div className="text-[19px] font-bold tracking-[-.2px]">{doc.membrete.firma}</div>
          <div className="mt-0.5 text-[11px] text-[#b9c9dc]">
            {doc.membrete.abogado} · {doc.membrete.colegiacion} · {doc.membrete.ciudad}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] font-bold tracking-[1.2px] text-dorado uppercase">Propuesta de honorarios</div>
          <div className="text-[11px] text-[#b9c9dc]">{doc.subtitulo}</div>
        </div>
      </header>
      <div className="h-[3px] bg-dorado" />

      <div className="px-9 py-7">
        <h1 className="text-center text-[18px] font-bold tracking-[-.2px] text-marino">{doc.titulo}</h1>
        <p className="mt-1 text-center text-[12.5px] text-texto-3">{doc.subtitulo}</p>

        <table className="mt-5 w-full border-collapse text-[12px]">
          <tbody>
            <tr>
              <Celda etiqueta>Cliente</Celda>
              <Celda>{doc.cliente.nombre}</Celda>
              <Celda etiqueta>Fecha</Celda>
              <Celda>{fechaTexto(doc.fechaIso)}</Celda>
            </tr>
            <tr>
              <Celda etiqueta>Atención</Celda>
              <Celda>{doc.cliente.atencion ?? "—"}</Celda>
              <Celda etiqueta>Referencia</Celda>
              <Celda>{doc.referencia || "—"}</Celda>
            </tr>
            {doc.cliente.rtn && (
              <tr>
                <Celda etiqueta>RTN</Celda>
                <Celda>{doc.cliente.rtn}</Celda>
                <Celda etiqueta />
                <Celda />
              </tr>
            )}
          </tbody>
        </table>

        <Seccion n={1} titulo="Objeto de la propuesta">
          <p>{doc.objeto}</p>
        </Seccion>

        <Seccion n={2} titulo="Servicios profesionales incluidos">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-marino text-left text-[10.5px] tracking-[.6px] text-white uppercase">
                <th className="w-10 px-2.5 py-2 text-center">No.</th>
                <th className="w-[34%] px-2.5 py-2">Servicio</th>
                <th className="px-2.5 py-2">Alcance</th>
              </tr>
            </thead>
            <tbody>
              {doc.servicios.map((s) => (
                <tr key={s.n} className="border-b border-borde align-top odd:bg-white even:bg-lienzo">
                  <td className="px-2.5 py-2 text-center font-bold text-dorado">{s.n}</td>
                  <td className="px-2.5 py-2 font-semibold">{s.titulo}</td>
                  <td className="px-2.5 py-2 text-texto-2">{s.alcance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Seccion>

        <Seccion n={3} titulo="Honorarios profesionales">
          <div className="flex overflow-hidden rounded-[8px] border-2 border-dorado">
            <div className="flex-1 bg-[#f7f2e6] px-4 py-3">
              <div className="text-[12.5px] font-bold text-marino">Total de honorarios profesionales</div>
              <div className="text-[10.5px] text-texto-3">Comprende la totalidad de los servicios detallados en la sección 2</div>
            </div>
            <div className="flex w-[40%] flex-col items-center justify-center bg-white px-4 py-3 text-center">
              <div className="text-[22px] font-bold text-marino">{doc.honorarios.monto}</div>
              <div className="text-[10.5px] text-texto-3">{doc.honorarios.letras}</div>
            </div>
          </div>
          <p className="mt-2.5">
            <b>Forma de pago:</b> {doc.honorarios.formaPago}.
            {doc.honorarios.notas ? ` ${doc.honorarios.notas}` : ""}
          </p>
        </Seccion>

        <Seccion n={4} titulo="Información que debe proporcionar el cliente">
          <p className="mb-2">Para iniciar la gestión se requiere que el cliente complete los datos siguientes:</p>
          <table className="w-full border-collapse text-[12px]">
            <tbody>
              {doc.datosCliente.map((d) => (
                <tr key={d} className="border-b border-borde">
                  <td className="w-[46%] bg-lienzo px-2.5 py-2 font-semibold">{d}</td>
                  <td className="px-2.5 py-2" />
                </tr>
              ))}
            </tbody>
          </table>
        </Seccion>

        <Seccion n={5} titulo="Requisitos documentales">
          <ul className="flex flex-col gap-1">
            {doc.requisitos.map((r, i) => (
              <li key={i} className="flex gap-2.5 border-b border-borde-suave py-1.5">
                <span className="mt-[3px] h-[13px] w-[13px] shrink-0 rounded-[3px] border-[1.5px] border-dorado" />
                <span>
                  {r.titulo}
                  {r.fuente && <span className="ml-1.5 text-[10.5px] text-texto-4">({r.fuente})</span>}
                </span>
              </li>
            ))}
          </ul>
          {doc.fuente?.nombre && doc.fuente.url && (
            <p className="mt-2.5 text-[11px] text-texto-3">
              Requisitos verificados con la fuente oficial: {doc.fuente.nombre}.
            </p>
          )}
          {doc.fuente?.pendiente && (
            <p className="mt-2.5 text-[11px] text-texto-3">{doc.fuente.pendiente}</p>
          )}
        </Seccion>

        {doc.advertencias.length > 0 && (
          <Seccion n={6} titulo="Advertencias importantes">
            <ol className="flex flex-col gap-1.5">
              {doc.advertencias.map((a, i) => (
                <li key={i} className="flex gap-3 rounded-[6px] border border-aviso-borde bg-aviso px-3 py-2">
                  <span className="font-bold text-dorado">{i + 1}</span>
                  <span className="text-aviso-cuerpo">{a}</span>
                </li>
              ))}
            </ol>
          </Seccion>
        )}

        <Seccion n={doc.advertencias.length > 0 ? 7 : 6} titulo="Condiciones de la propuesta">
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {doc.condiciones.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Seccion>

        <div className="mt-12 grid grid-cols-2 gap-10 border-t border-marino pt-3 text-center text-[11px]">
          <div>
            <div className="font-bold text-marino">{doc.membrete.abogado}</div>
            <div className="text-texto-3">
              {doc.membrete.colegiacion} — {doc.membrete.firma}
            </div>
          </div>
          <div>
            <div className="font-bold text-marino">Aceptación del cliente</div>
            <div className="text-texto-3">Nombre, firma y sello — Fecha: ____________________</div>
          </div>
        </div>
      </div>

      <footer className="flex justify-between border-t border-borde px-9 py-2.5 text-[10px] text-texto-4">
        <span>Propuesta de honorarios profesionales — {doc.subtitulo}</span>
        <span>Generada con Justihn</span>
      </footer>
    </article>
  );
}

function Seccion({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h2 className="mb-2.5 border-b-2 border-dorado bg-marino px-3 py-1.5 text-[12px] font-bold tracking-[.4px] text-white uppercase">
        {n}. {titulo}
      </h2>
      {children}
    </section>
  );
}

function Celda({ children, etiqueta }: { children?: React.ReactNode; etiqueta?: boolean }) {
  return (
    <td className={etiqueta ? "w-[16%] border border-borde bg-lienzo px-2.5 py-1.5 font-semibold" : "w-[34%] border border-borde px-2.5 py-1.5"}>
      {children}
    </td>
  );
}
