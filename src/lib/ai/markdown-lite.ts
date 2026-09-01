/**
 * Renderizador markdown-lite para las respuestas de Jus IA.
 *
 * El motor real escribe **negritas**, listas y a veces enlaces markdown; el
 * chat pintaba el texto crudo y el abogado veía los asteriscos (y una URL de
 * 120 caracteres desbordando la burbuja — visto en vivo el 2026-09-01).
 *
 * NO es un parser de markdown: es la lista corta de lo que el prompt permite
 * (`FORMATO_RESPUESTA` en citas.ts), aplicada SOBRE TEXTO YA ESCAPADO — regla
 * §3.3: nunca HTML de una fuente externa al DOM; solo sobreviven las marcas
 * que este archivo fabrica. Todo lo que el prompt prohíbe (tablas, encabezados
 * #, HTML) se queda como texto plano visible, que es la degradación honesta.
 */

export function renderMarkdownLite(texto: string): string {
  let t = texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // [etiqueta](url) → etiqueta. El prompt prohíbe enlaces en el texto, pero si
  // el modelo desobedece, la URL no debe ni pintarse ni desbordar: la fuente
  // ya vive en los chips de citas, enlazada y verificada contra la whitelist.
  t = t.replace(/\[([^\]\n]+)\]\((?:[^)\s]+)\)/g, "$1");

  // **negrita** — solo pares cerrados en la misma línea; un ** suelto (o el
  // texto a medio revelar por la máquina de escribir) se queda literal.
  t = t.replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>");

  // [n] = marcador de fuente numerada → superíndice discreto, mismo número
  // que lleva su chip de cita debajo.
  t = t.replace(/\[(\d{1,2})\]/g, '<sup class="text-celeste" style="font-size:10.5px">[$1]</sup>');

  return t;
}
