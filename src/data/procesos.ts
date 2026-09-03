import type { FuenteCita, Proceso } from "@/types/dominio";

/**
 * El "paso a paso" de los cuatro procesos del portal de abogados, con TODAS
 * sus citas reales desde el 2026-09-03. Hasta entonces cada paso llevaba
 * «art. ___»: marcadores honestos mientras no hubiera códigos cargados.
 *
 * De dónde sale cada cita (todo verificado leyendo el texto, no de memoria):
 *  · Código del Trabajo, Código de Familia y Código Procesal Civil: los
 *    artículos de la tabla `articulos` (CEDIJ). La cita abre el artículo EN
 *    EL PORTAL (`/abogados/legislacion/<código>/<número>`), que a su vez
 *    enlaza el PDF oficial en su página.
 *  · Ley sobre Justicia Constitucional (Decreto 244-2003): PDF con texto del
 *    Tribunal Superior de Cuentas, 42 pp.; la cita abre la página.
 *  · Código de Comercio (Decreto 73-50): PDF con texto de e-Regulations
 *    Honduras (portal oficial de trámites), 418 pp. ⚠️ Edición sin las
 *    reformas recientes: se citan solo artículos estructurales (contenido de
 *    la escritura, fundación ante notario, plazo de inscripción), nunca los
 *    mínimos de socios o capital, que sí han cambiado.
 *  · e-Regulations: el procedimiento oficial de constitución de sociedad
 *    (33 pasos), el mismo que verifica la guía ciudadana.
 *
 * Documentos y notas de práctica son conocimiento general del gremio: el
 * socio abogado los valida (backlog #5). `procesos.test.ts` exige que cada
 * paso cite al menos una fuente abrible y que no quede ningún «___».
 *
 * TODO(data): tablas `procesos` + `pasos_proceso` + `citas_paso`.
 */
const EREG_SOCIEDAD = "https://honduras.eregulations.org/procedure/4/5?l=es";

const art = (codigoId: string, nombre: string) => (numero: string): FuenteCita => ({
  etiqueta: `${nombre}, art. ${numero}`,
  url: `/abogados/legislacion/${codigoId}/${numero}`,
});
const trabajo = art("codigo-trabajo", "Código del Trabajo");
const familia = art("codigo-familia", "Código de Familia");
const cpc = art("codigo-procesal-civil", "Código Procesal Civil");
// Desde el 2026-09-03 (tarde) la Ley y el Código de Comercio también están
// en la tabla `articulos`: la cita abre el artículo en el portal, que enlaza
// el PDF en su página. La página ya no se escribe a mano aquí.
const ljc = (numero: number, _pagina: number): FuenteCita =>
  art("ley-justicia-constitucional", "Ley sobre Justicia Constitucional")(String(numero));
const comercio = (numero: number, _pagina: number): FuenteCita =>
  art("codigo-comercio", "Código de Comercio")(String(numero));
const ereg: FuenteCita = {
  etiqueta: "e-Regulations Honduras — constitución de sociedad (33 pasos)",
  url: EREG_SOCIEDAD,
};

export const PROCESOS: Proceso[] = [
  {
    id: "demanda-despido-injustificado",
    plantillaId: "despido-injustificado",
    nombre: "Demanda por despido injustificado",
    materia: "Laboral",
    resumen:
      "El reclamo prescribe en DOS MESES desde que terminó el contrato (art. 864). Todo lo demás —prueba, cálculo, conciliación y demanda— cabe en ese plazo si se arranca el primer día.",
    fuentesOficiales: ["Código del Trabajo (CEDIJ, ed. mayo 2018)"],
    pasos: [
      {
        titulo: "Fija la fecha del despido y cuenta el plazo",
        detalle:
          "Los derechos y acciones para reclamar contra un despido injustificado prescriben en dos meses; si el trabajador se separó por culpa del patrono (despido indirecto), en un mes desde que el patrono dio motivo.",
        fuentes: [trabajo("864"), trabajo("865")],
        documentos: [
          "Carta o constancia del despido, si existe",
          "Mensajes, correos o testigos que fijen la fecha",
          "Fecha de ingreso y de salida, por escrito",
        ],
        plazo:
          "2 meses desde la terminación del contrato (art. 864) · 1 mes en el despido indirecto (art. 865).",
        nota: "De la fecha del despido corren la prescripción y todos los cálculos: fíjala con evidencia el primer día. Es la razón número uno por la que se pierden reclamos legítimos.",
      },
      {
        titulo: "Reúne la prueba de la relación laboral y el salario promedio",
        detalle:
          "La indemnización se calcula sobre el promedio de los salarios de los últimos seis meses, y la demanda debe traer la relación de los medios de prueba con que se acreditará la relación.",
        fuentes: [trabajo("123"), trabajo("703")],
        documentos: [
          "Contrato de trabajo o constancia laboral",
          "Recibos de pago de los últimos 6 meses (base del cálculo, art. 123 b)",
          "Carné, planillas, mensajes: todo lo que pruebe la relación",
          "Nombres de compañeros que puedan declarar",
        ],
        nota: "El preaviso, la cesantía y la indemnización no admiten compensación, venta ni embargo, salvo la mitad por pensiones alimenticias (art. 123 a); y es nula la cláusula que pretenda interrumpir la continuidad del servicio (art. 123 d).",
      },
      {
        titulo: "Calcula las prestaciones, cada concepto con su artículo",
        detalle:
          "Preaviso según antigüedad (24 horas a 2 meses), auxilio de cesantía por tramos con tope de 25 meses (15 en microempresa) y vacaciones por años de servicio.",
        fuentes: [trabajo("116"), trabajo("120"), trabajo("120-A"), trabajo("346")],
        documentos: ["Cálculo de prestaciones anexo (la calculadora del portal lo genera con su artículo)"],
        nota: "Usa la calculadora como estimación y valida cada cifra contra el expediente antes de plasmarla en la demanda: el juez la contrastará con los recibos.",
      },
      {
        titulo: "Intenta la conciliación en la Procuraduría del Trabajo",
        detalle:
          "La Procuraduría asiste al trabajador de forma absolutamente gratuita, judicial o extrajudicialmente; puede citar al patrono para avenir a las partes y, si acepta la propuesta, se levanta acta y el asunto concluye.",
        fuentes: [trabajo("641"), trabajo("639"), trabajo("640"), trabajo("638")],
        documentos: ["Cálculo de prestaciones como propuesta de arreglo", "Prueba de la relación laboral"],
        nota: "Si el trabajador va con la Procuraduría, esta puede negarse a concurrir a juicio junto con defensores particulares (art. 638): o va con ella o con su abogado, no con los dos.",
      },
      {
        titulo: "Presenta la demanda ante el Juzgado de Letras del Trabajo",
        detalle:
          "Por escrito, con juez destinatario, partes y representantes, domicilio, lo que se demanda con hechos precisos, relación de pruebas, cuantía cuando fije la competencia y fundamentos de derecho; tantas copias autenticadas como demandados.",
        fuentes: [trabajo("703"), trabajo("704"), trabajo("711")],
        documentos: [
          "Demanda (usa el modelo de este proceso)",
          "Copias autenticadas por el Secretario, una por demandado",
          "Cálculo de prestaciones anexo",
          "Pruebas documentales de la relación laboral",
        ],
        nota: "Para litigar se requiere abogado en ejercicio, salvo en los juicios de única instancia y en las audiencias de conciliación, donde las partes pueden actuar por sí mismas (art. 711).",
      },
      {
        titulo: "Audiencia de conciliación, prueba y fallo",
        detalle:
          "Dentro de las 24 horas siguientes a la contestación el juez señala la audiencia de conciliación, que se celebra dentro de los dos días siguientes. Si la conciliación fracasa, examina testigos y pruebas y falla en el acto, motivando oralmente.",
        fuentes: [trabajo("755"), trabajo("750"), trabajo("749")],
        documentos: ["Pliego de pruebas", "Testigos citados para la fecha", "Propuesta de conciliación con las cifras calculadas"],
        plazo: "Audiencia dentro de los 2 días siguientes al señalamiento (art. 755).",
        nota: "Si el demandante no comparece sin excusa legal la actuación sigue sin él; si falta el demandado, el juicio continúa sin nueva citación (art. 749). Llega con la propuesta ya calculada: buena parte de los casos se cierra aquí.",
      },
    ],
  },
  {
    id: "divorcio-mutuo-consentimiento",
    plantillaId: "divorcio-mutuo",
    nombre: "Divorcio por mutuo consentimiento",
    materia: "Familia",
    resumen:
      "Con dos años de matrimonio y ambos mayores de edad, el juez cita a audiencia el MISMO día de la solicitud y, sin hijos menores, dicta sentencia de inmediato (arts. 243-245). Con hijos menores hay una segunda audiencia a los 15 días.",
    fuentesOficiales: ["Código de Familia (CEDIJ, con reformas)", "Código Procesal Civil (CEDIJ, ed. 2018)"],
    pasos: [
      {
        titulo: "Verifica que califican para el mutuo consentimiento",
        detalle:
          "Transcurridos dos años desde la celebración del matrimonio, puede disolverse por consentimiento de los cónyuges si son mayores de edad. Si no se cumple, el camino es el divorcio contencioso por causal.",
        fuentes: [familia("243"), familia("240")],
        documentos: ["Certificación de matrimonio (fecha de celebración)", "Identidad de ambos cónyuges"],
        plazo: "Sin acuerdo, el contencioso no puede entablarse después de un año desde que se conoció la causa, con las excepciones del art. 240.",
        nota: "Confirma la fecha de matrimonio antes de citar a los cónyuges: con menos de dos años la solicitud conjunta no procede.",
      },
      {
        titulo: "Reúne los documentos de la solicitud",
        detalle:
          "Certificaciones del Registro Civil que acrediten la edad y la calidad de casados, certificación de las actas de nacimiento de los hijos menores si los hay, y la propuesta de convenio regulador.",
        fuentes: [familia("244")],
        documentos: [
          "Certificaciones del RNP de edad y de matrimonio",
          "Certificación de actas de nacimiento de los hijos menores",
          "Tarjetas de identidad de ambos cónyuges",
          "Inventario de bienes comunes, si los hay",
        ],
        nota: "Pide las certificaciones cerca de la presentación y revisa que los nombres coincidan exactamente entre documentos: una discrepancia obliga a rectificar antes de presentar.",
      },
      {
        titulo: "Redacta el convenio regulador",
        detalle:
          "Su contenido debe ajustarse al Código Procesal Civil, que exige acumular a la pretensión principal las de alimentos, guarda y cuidado de los hijos, patria potestad y separación de bienes gananciales.",
        fuentes: [familia("244"), cpc("652")],
        documentos: [
          "Convenio regulador firmado por ambos cónyuges",
          "Propuesta de pensión alimenticia",
          "Acuerdo de guarda y régimen de visitas",
          "Reparto de bienes gananciales",
        ],
        nota: "El convenio incompleto es la causa más común de tropiezo: si la sentencia no lo aprueba en todo o en parte, el juez da 10 días para una nueva propuesta y resuelve en 3 (art. 248). Cúbrelo entero aunque no haya conflicto.",
      },
      {
        titulo: "Presenta la solicitud, personalmente y por escrito",
        detalle:
          "Ante el juez competente del domicilio de los cónyuges. En el divorcio de común acuerdo ambos pueden valerse de una sola defensa y representación.",
        fuentes: [familia("244"), cpc("631")],
        documentos: [
          "Solicitud conjunta (usa el modelo de este proceso)",
          "Los documentos del paso anterior",
          "Poder, si actúa un solo apoderado por ambos (art. 631.2)",
        ],
        nota: "La presentación es personal: la solicitud la firman y presentan los dos cónyuges, no basta el apoderado.",
      },
      {
        titulo: "Audiencia inmediata, y segunda audiencia si hay hijos menores",
        detalle:
          "El mismo día de la presentación el juez cita a una audiencia inmediata y expone las consecuencias del divorcio. Sin hijos menores ni incapacitados, dicta sentencia en el acto. Con ellos, cita a una nueva audiencia en 15 días, con opinión del Ministerio Público sobre el convenio.",
        fuentes: [familia("245"), familia("246")],
        documentos: ["Tarjetas de identidad de ambos cónyuges", "Convenio regulador"],
        plazo: "Segunda audiencia a los 15 días cuando hay hijos menores (art. 246).",
        nota: "La ratificación es personalísima: la incomparecencia de un cónyuge deja la audiencia sin efecto. Prepara a los clientes para las «reflexiones» del juez, que son parte del acto.",
      },
      {
        titulo: "Sentencia, convenio e inscripciones",
        detalle:
          "En la misma audiencia o dentro de cinco días el juez declara disuelto el matrimonio, se pronuncia sobre el convenio y ordena inscribir la sentencia en el Registro Civil y, si hay inmuebles, la escritura de división en el Registro de la Propiedad.",
        fuentes: [familia("247"), familia("248"), cpc("654")],
        documentos: ["Certificación de la sentencia firme para las inscripciones"],
        plazo: "Sentencia en la audiencia o dentro de 5 días (art. 247).",
        nota: "Hasta las inscripciones el divorcio no surte todos sus efectos frente a terceros. Contra la sentencia proceden apelación y casación (art. 654).",
      },
    ],
  },
  {
    id: "constitucion-sociedad-mercantil",
    plantillaId: "constitucion-sociedad",
    nombre: "Constitución de una sociedad mercantil",
    materia: "Mercantil",
    resumen:
      "Escritura ante notario, inscripción en el Registro Mercantil dentro de los 15 días siguientes y el arranque fiscal y patronal: 33 pasos oficiales que toman entre 34 y 54 días.",
    fuentesOficiales: ["Código de Comercio (e-Regulations, Decreto 73-50)", "e-Regulations Honduras (trámite oficial, 33 pasos)"],
    pasos: [
      {
        titulo: "Define la sociedad y prepara la escritura",
        detalle:
          "La escritura constitutiva debe contener, entre otros, los socios, la clase de sociedad, su finalidad, la razón social, la duración, el capital y lo que aporta cada socio, el domicilio, la forma de administración y las facultades de los administradores, y quiénes llevan la firma social.",
        fuentes: [comercio(14, 5), comercio(94, 25)],
        documentos: [
          "Identidad y RTN de los socios",
          "Proyecto de estatutos (usa el modelo de este proceso)",
          "Definición del representante legal y sus facultades",
        ],
        nota: "Define desde la escritura al representante legal y sus límites (art. 14, X y XI): cambiarlo después exige nueva escritura e inscripción.",
      },
      {
        titulo: "Deposita el capital y obtén el certificado",
        detalle:
          "En la fundación simultánea, las aportaciones en dinero se hacen mediante endoso y entrega del certificado de depósito en una institución de crédito, o de un cheque certificado; el notario da fe de ello.",
        fuentes: [comercio(95, 26), ereg],
        documentos: ["Nota del notario para el certificado de depósito", "Certificado de depósito del capital a nombre de la sociedad"],
        nota: "Las aportaciones en especie quedan en poder de la sociedad dos años y responden por la diferencia si se sobrevaloraron (art. 96).",
      },
      {
        titulo: "Otorga la escritura pública ante notario",
        detalle:
          "La sociedad anónima puede constituirse por fundación simultánea, con la comparecencia ante notario de quienes otorgan la escritura social. Se firma, se recibe el aviso de constitución y se retira el testimonio.",
        fuentes: [comercio(93, 25), ereg],
        documentos: ["Certificado de depósito", "Proyecto de estatutos aprobado por los socios", "Testimonio de la escritura"],
      },
      {
        titulo: "Inscribe la sociedad en el Registro Mercantil",
        detalle:
          "Si la escritura no se presenta a inscripción dentro de los quince días siguientes a su otorgamiento, cualquier socio puede gestionarla judicial o administrativamente. Se calcula y paga la tasa registral, se solicita la inscripción y se retira la matrícula.",
        fuentes: [comercio(18, 7), comercio(17, 7), ereg],
        documentos: ["Testimonio de la escritura", "Formulario de inscripción", "Comprobante de la tasa registral"],
        plazo: "15 días desde el otorgamiento para presentar la escritura a inscripción (art. 18).",
        nota: "La sociedad no inscrita que actúa como tal tiene personalidad frente a terceros, pero con el régimen del art. 17. En la CCIC la consulta pública posterior es por número de matrícula, no por nombre: guarda ese dato.",
      },
      {
        titulo: "RTN, afiliación a la cámara y arranque",
        detalle:
          "El registro de todo comerciante en la Cámara de Comercio es obligatorio. Con la matrícula se tramita el RTN de la sociedad, la autorización de libros, el permiso de operación municipal y la inscripción patronal en IHSS, INFOP y RAP.",
        fuentes: [comercio(384, 97), ereg],
        documentos: [
          "Escritura inscrita y matrícula",
          "RTN del representante legal",
          "Formularios del SAR, la alcaldía y el IHSS",
        ],
        nota: "Sin RTN la sociedad no factura: es el paso que suele trabar el arranque. Confirma cifras vigentes de tasas antes de presupuestar: el portal oficial arrastra montos del antiguo DEI.",
      },
    ],
  },
  {
    id: "recurso-amparo",
    plantillaId: "recurso-amparo",
    nombre: "Recurso de amparo",
    materia: "Constitucional",
    resumen:
      "Procede contra resoluciones, actos y hechos de los Poderes del Estado; se interpone dentro de los DOS MESES siguientes a la última notificación (art. 48) y es inadmisible cuando se alega mera legalidad o el acto fue consentido (art. 46).",
    fuentesOficiales: ["Ley sobre Justicia Constitucional (TSC, Decreto 244-2003)"],
    pasos: [
      {
        titulo: "Verifica la procedencia y la admisibilidad",
        detalle:
          "Procede contra resoluciones, actos y hechos de los Poderes del Estado, incluidas las entidades descentralizadas y las que actúan por delegación. Es inadmisible cuando se alegan violaciones de mera legalidad, cuando el acto fue consentido por no ejercitar en tiempo los recursos, o cuando quedan expeditos recursos en la vía contencioso-administrativa.",
        fuentes: [ljc(42, 16), ljc(46, 16)],
        documentos: ["Resolución, acto o notificación reclamada", "Evidencia del agotamiento de la vía previa"],
        nota: "Identifica el derecho constitucional concreto y el acto preciso: el amparo genérico o de mera legalidad se rechaza de plano.",
      },
      {
        titulo: "Cuenta el plazo: dos meses",
        detalle:
          "La acción debe presentarse dentro de los dos meses siguientes a la fecha de la última notificación al afectado, o de aquella en que tuvo conocimiento de la acción u omisión.",
        fuentes: [ljc(48, 17)],
        documentos: ["Constancia de la fecha de notificación o de conocimiento del acto"],
        plazo: "2 meses desde la última notificación o el conocimiento del acto (art. 48).",
      },
      {
        titulo: "Determina el órgano competente",
        detalle:
          "La Sala de lo Constitucional conoce, entre otros, del amparo por violaciones cometidas por el Presidente y los Secretarios de Estado, las Cortes de Apelaciones, el TSC, la PGR y el TSE. El amparo se interpone ante el órgano jurisdiccional competente según la Ley.",
        fuentes: [ljc(9, 4), ljc(47, 17)],
        nota: "Revisa los arts. 9 a 12 según la autoridad recurrida: presentar ante el órgano equivocado consume días del plazo de dos meses.",
      },
      {
        titulo: "Redacta e interpón el escrito",
        detalle:
          "Por escrito, con el órgano ante el que se presenta y los demás requisitos del art. 49. Puede ejercerla cualquier persona natural o jurídica, e interponerla el agraviado o cualquier otra persona civilmente capaz sin necesidad de poder. Si faltan datos esenciales, el órgano concede tres días hábiles para corregir.",
        fuentes: [ljc(49, 17), ljc(44, 16), ljc(50, 18)],
        documentos: ["Recurso de amparo (usa el modelo de este proceso)", "Copias para la autoridad recurrida", "Documentos que prueban el acto y su fecha"],
        plazo: "3 días hábiles para enmendar deficiencias; si no, inadmisible (art. 50).",
      },
      {
        titulo: "Pide la suspensión del acto si el daño sería irreparable",
        detalle:
          "Las medidas cautelares, incluida la suspensión provisional del acto reclamado, pueden decretarse en el auto de admisión o en cualquier estado antes de sentencia, a instancia de parte y bajo responsabilidad del peticionario: cuando peligre la integridad del reclamante o la ejecución haga inútil el amparo.",
        fuentes: [ljc(57, 21), ljc(58, 21), ljc(59, 21)],
        nota: "Pídela en el mismo escrito con el fundamento del art. 59: una suspensión tardía no repara lo ejecutado.",
      },
      {
        titulo: "Informe de la autoridad y vista al recurrente",
        detalle:
          "Admitida la demanda, se pide a la autoridad los antecedentes o un informe circunstanciado, bajo juramento, en un plazo que no excede de cinco días hábiles; si no lo remite, auto de apremio con 24 horas. Recibido, se da vista de 48 horas al recurrente para formalizar por escrito.",
        fuentes: [ljc(52, 19), ljc(53, 19), ljc(54, 20)],
        documentos: ["Escrito de formalización, listo antes de la vista"],
        plazo: "Informe hasta 5 días hábiles (art. 52) · vista de 48 horas para formalizar (art. 54).",
        nota: "Si el recurrente no formaliza en las 48 horas, se sobreseen las diligencias sin más trámite (art. 54): ten el escrito preparado desde la interposición.",
      },
      {
        titulo: "Prueba y dictamen fiscal",
        detalle:
          "El órgano puede abrir a pruebas, de oficio o a instancia de parte, por hasta ocho días hábiles ampliables en cuatro. Evacuadas, se da vista al fiscal por 48 horas y se dicta sentencia dentro de los cinco días hábiles siguientes.",
        fuentes: [ljc(55, 20), ljc(56, 20)],
        documentos: ["Pruebas ofrecidas con su relación al derecho vulnerado"],
        plazo: "Prueba: 8 días hábiles, ampliables en 4 (art. 55) · sentencia en 5 días hábiles tras el dictamen fiscal (art. 56).",
      },
      {
        titulo: "Sentencia y cumplimiento",
        detalle:
          "La sentencia otorga o deniega el amparo; la que lo otorga identifica a la autoridad y el acto que no obliga al peticionario. El responsable del agravio debe cumplirla apenas la conozca; si no, se remite certificación al Ministerio Público. La denegatoria deja a salvo las acciones civiles o penales.",
        fuentes: [ljc(63, 22), ljc(64, 23), ljc(65, 23), ljc(67, 24)],
        nota: "Cuando el amparo se ejercitó por una omisión, la sentencia ordena realizar el acto omitido (art. 64): pide expresamente esa consecuencia en el petitorio.",
      },
    ],
  },
];

export function getProceso(id: string): Proceso | undefined {
  return PROCESOS.find((p) => p.id === id);
}
