import type { Materia } from "@/types/dominio";

/**
 * Vertical de trámites administrativos por institución del Estado — el tema
 * grande del feedback del socio abogado (2026-08-29). Sirve a las DOS vías:
 * la gente común busca "cómo sacar el RTN"; el abogado lo usa de referencia.
 *
 * HONESTIDAD (regla #1): los pasos son orientación general; las tasas y
 * requisitos exactos van con marcadores "L ___" hasta que el socio verifique
 * cada trámite contra la fuente institucional. Cada guía lo declara.
 *
 * TODO(data): tablas `instituciones` + `tramites` + `pasos_tramite`,
 * contenido verificado por el socio (backlog #1b del producto).
 */

export interface Institucion {
  id: string;
  nombre: string;
  sigla: string;
  descripcion: string;
}

export interface PasoTramite {
  titulo: string;
  detalle: string;
}

export interface Tramite {
  id: string;
  nombre: string;
  /** "tramite" = gestión ante una institución · "proceso" = vía judicial
   *  (el socio los pidió como cosas distintas: "cómo hacer el proceso"). */
  tipo: "tramite" | "proceso";
  institucionId: string;
  /** A quién le sirve — la gente busca por su situación, no por la sigla. */
  paraQuien: string;
  resumen: string;
  /** Materia del directorio: qué abogado recomienda esta guía. */
  materia: Materia;
  pasos: PasoTramite[];
  requisitos: string[];
  tasa: string;
  nota?: string;
  /** Página oficial de la institución (host de la whitelist §3.3). Solo se
   *  llena cuando el dato fue verificado contra esa fuente. */
  fuenteUrl?: string;
  fuenteNombre?: string;
}

export const INSTITUCIONES: Institucion[] = [
  {
    id: "sar",
    nombre: "Servicio de Administración de Rentas",
    sigla: "SAR",
    descripcion: "Impuestos, RTN y facturación autorizada (CAI).",
  },
  {
    id: "ip",
    nombre: "Instituto de la Propiedad",
    sigla: "IP",
    descripcion: "Propiedad inmueble, tradición de dominio y registro vehicular.",
  },
  {
    id: "municipalidad",
    nombre: "Municipalidad (AMDC y demás alcaldías)",
    sigla: "Alcaldía",
    descripcion: "Permisos de operación de negocios y tasas municipales.",
  },
  {
    id: "arsa",
    nombre: "Agencia de Regulación Sanitaria",
    sigla: "ARSA",
    descripcion: "Licencias y permisos sanitarios de establecimientos y productos.",
  },
  {
    id: "miambiente",
    nombre: "Secretaría de Recursos Naturales y Ambiente",
    sigla: "MiAmbiente",
    descripcion: "Licencias ambientales por categoría de impacto.",
  },
  {
    id: "oncae",
    nombre: "Oficina Normativa de Contratación y Adquisiciones del Estado",
    sigla: "ONCAE",
    descripcion: "Registro de proveedores para venderle al Estado.",
  },
  {
    id: "poder-judicial",
    nombre: "Poder Judicial (juzgados)",
    sigla: "Juzgados",
    descripcion: "Demandas y procesos ante los juzgados de letras y de paz.",
  },
  {
    id: "trabajo",
    nombre: "Secretaría de Trabajo y Seguridad Social",
    sigla: "STSS",
    descripcion: "Conciliación laboral y reclamos administrativos antes de demandar.",
  },
  {
    id: "registro-mercantil",
    nombre: "Registro Mercantil (cámaras de comercio)",
    sigla: "CCIT/CCIC",
    descripcion: "Constitución e inscripción de sociedades y comerciantes.",
  },
];

export const TRAMITES: Tramite[] = [
  {
    id: "abrir-rtn",
    nombre: "Cómo abrir un RTN",
    tipo: "tramite",
    institucionId: "sar",
    paraQuien: "Cualquier persona que empieza a trabajar, facturar o abrir un negocio",
    resumen:
      "El Registro Tributario Nacional es tu identidad ante el SAR — es, en palabras del propio SAR, un documento esencial para cualquier transacción comercial o legal en Honduras.",
    materia: "Mercantil",
    pasos: [
      {
        titulo: "Identifica qué tipo de RTN te toca",
        detalle:
          "El SAR distingue cuatro: persona natural SIN obligaciones (no realizas actividad económica), persona natural CON obligaciones (trabajas por tu cuenta), comerciante individual (constituido por escritura pública) y persona jurídica (empresas y organizaciones).",
      },
      {
        titulo: "Reúne tu identificación",
        detalle:
          "DNI vigente (original y copia) y el comprobante de domicilio que te pidan; para comerciante individual o persona jurídica, la escritura de constitución. Los requisitos exactos por tipo están en las fichas que publica el SAR.",
      },
      {
        titulo: "Haz la preinscripción en la Oficina Virtual",
        detalle:
          "En oficinavirtual.sar.gob.hn llenas la solicitud en línea; el SAR llama a esta modalidad 'virtual-presencial'. También puedes hacer todo presencial en una oficina del SAR.",
      },
      {
        titulo: "Recoge tu certificado de RTN",
        detalle:
          "Tras la preinscripción te presentas a la oficina del SAR a retirar el certificado. La primera emisión es de entrega inmediata.",
      },
    ],
    requisitos: [
      "DNI vigente (original y copia)",
      "Comprobante de domicilio",
      "Formulario de declaración jurada de inscripción",
      "Escritura de constitución (comerciante individual o persona jurídica)",
    ],
    tasa: "Gratuito — el SAR confirma que el trámite no tiene costo",
    nota: "La reposición del RTN también es gratis y se descarga desde la Oficina Virtual. Si vas a facturar, el RTN es solo el primer paso: sigue la autorización de facturación (CAI).",
    fuenteUrl: "https://www.sar.gob.hn/registro-tributario-nacional-rtn/",
    fuenteNombre: "SAR — Registro Tributario Nacional",
  },
  {
    id: "facturacion-cai",
    nombre: "Facturación con CAI",
    tipo: "tramite",
    institucionId: "sar",
    paraQuien: "Negocios y profesionales que emiten facturas",
    resumen:
      "El Código de Autorización de Impresión habilita tu facturación ante el SAR: sin CAI vigente, tus facturas no son válidas fiscalmente.",
    materia: "Mercantil",
    pasos: [
      { titulo: "Ten tu RTN y obligaciones al día", detalle: "El SAR verifica tu situación tributaria antes de autorizar." },
      { titulo: "Solicita la autorización de facturación", detalle: "Por la Oficina Virtual del SAR o con una imprenta autorizada, según tu modalidad (talonario, impresión o factura electrónica)." },
      { titulo: "Emite dentro de la vigencia", detalle: "El CAI vence: controla la fecha límite de emisión y renueva a tiempo." },
    ],
    requisitos: ["RTN", "Obligaciones tributarias al día", "[Verificar modalidad y plazos vigentes]"],
    tasa: "L ___ (según modalidad e imprenta)",
    nota: "Emitir con CAI vencido genera multas — es de los errores más comunes en negocios pequeños.",
  },
  {
    id: "permiso-operacion",
    nombre: "Permiso de operación de negocio",
    tipo: "tramite",
    institucionId: "municipalidad",
    paraQuien: "Todo negocio con local o actividad en un municipio",
    resumen:
      "La alcaldía autoriza la operación del negocio en su municipio y cobra la tasa anual correspondiente según tu volumen de ventas.",
    materia: "Mercantil",
    pasos: [
      { titulo: "Reúne los documentos del negocio", detalle: "RTN, DNI del propietario o representante, y constancias que pida tu alcaldía (solvencia municipal, contrato de local)." },
      { titulo: "Presenta la solicitud en la alcaldía", detalle: "Ventanilla de permisos de operación del municipio donde opera el negocio; declara tu volumen de ventas." },
      { titulo: "Paga la tasa y recibe el permiso", detalle: "El permiso es anual — se renueva cada enero con la declaración jurada de volumen de ventas." },
    ],
    requisitos: ["RTN del negocio", "DNI del propietario", "Solvencia municipal", "[Cada alcaldía agrega requisitos propios]"],
    tasa: "L ___ (tabla municipal, según volumen de ventas)",
    nota: "Rubros regulados (alimentos, salud) necesitan además el permiso sanitario de ARSA antes de operar.",
  },
  {
    id: "licencia-sanitaria",
    nombre: "Licencia y permiso sanitario",
    tipo: "tramite",
    institucionId: "arsa",
    paraQuien: "Negocios de alimentos, farmacias, clínicas y productos de consumo",
    resumen:
      "ARSA autoriza sanitariamente establecimientos y productos: sin licencia sanitaria vigente, el negocio regulado no puede operar legalmente.",
    materia: "Contencioso Adm.",
    pasos: [
      { titulo: "Identifica tu categoría", detalle: "Establecimiento (cafetería, farmacia, clínica) o producto (alimentos, cosméticos, medicamentos) — cada uno tiene su vía." },
      { titulo: "Prepara el expediente", detalle: "Formulario de solicitud, RTN, permiso de operación, croquis del local y los documentos técnicos de tu categoría." },
      { titulo: "Solicita ante ARSA y recibe inspección", detalle: "ARSA revisa el expediente e inspecciona el establecimiento antes de emitir la licencia." },
    ],
    requisitos: ["RTN y permiso de operación", "Croquis del establecimiento", "[Documentos técnicos según categoría — verificar con ARSA]"],
    tasa: "L ___ (según categoría)",
    nota: "La licencia tiene vigencia limitada — programa la renovación antes del vencimiento.",
  },
  {
    id: "licencia-ambiental",
    nombre: "Licencia ambiental",
    tipo: "tramite",
    institucionId: "miambiente",
    paraQuien: "Proyectos y negocios con impacto ambiental (construcción, industria, agro)",
    resumen:
      "MiAmbiente clasifica los proyectos por categoría de impacto y emite la licencia ambiental que exige la ley antes de operar o construir.",
    materia: "Contencioso Adm.",
    pasos: [
      { titulo: "Determina la categoría del proyecto", detalle: "La tabla de categorización ambiental clasifica el impacto (de menor a mayor) — define los estudios que te pedirán." },
      { titulo: "Prepara los estudios ambientales", detalle: "Según la categoría: desde formularios simples hasta estudios de impacto ambiental elaborados por prestadores registrados." },
      { titulo: "Solicita la licencia y atiende la evaluación", detalle: "MiAmbiente evalúa, puede inspeccionar y emite la licencia con las medidas de control que debes cumplir." },
    ],
    requisitos: ["Documentos legales del proyecto y del predio", "Estudios según categoría", "[Verificar categorización vigente]"],
    tasa: "L ___ (según categoría del proyecto)",
    nota: "Operar sin licencia ambiental expone a multas y cierre — y es de los trámites donde más ayuda un abogado administrativo.",
  },
  {
    id: "inscripcion-oncae",
    nombre: "Inscripción como proveedor del Estado (ONCAE)",
    tipo: "tramite",
    institucionId: "oncae",
    paraQuien: "Empresas y profesionales que quieren venderle al Estado",
    resumen:
      "Para participar en compras y licitaciones públicas necesitas estar inscrito en el registro de proveedores del Estado que administra la ONCAE.",
    materia: "Contencioso Adm.",
    pasos: [
      { titulo: "Ten tu situación legal y tributaria al día", detalle: "RTN, permisos vigentes y solvencias — el registro valida que puedas contratar con el Estado." },
      { titulo: "Regístrate en la plataforma de la ONCAE", detalle: "Crea el perfil de proveedor con tus documentos legales, financieros y de experiencia." },
      { titulo: "Mantén el registro vigente", detalle: "Actualiza documentos y solvencias — un registro vencido te saca de las licitaciones." },
    ],
    requisitos: ["RTN y solvencias", "Documentos legales de la empresa", "[Verificar documentos vigentes con ONCAE]"],
    tasa: "L ___",
    nota: "Las bases de cada licitación agregan requisitos propios — el registro es la puerta de entrada, no el final.",
  },
  {
    id: "tradicion-dominio",
    nombre: "Tradición de dominio de un inmueble",
    tipo: "tramite",
    institucionId: "ip",
    paraQuien: "Quien compra, vende o hereda una propiedad",
    resumen:
      "La compraventa no termina con la escritura: la propiedad cambia de dueño ante terceros cuando la tradición de dominio se inscribe en el Instituto de la Propiedad.",
    materia: "Notarial",
    pasos: [
      { titulo: "Verifica el folio real ANTES de comprar", detalle: "Confirma quién es el dueño registral y si hay gravámenes o anotaciones — el error más caro es saltarse este paso." },
      { titulo: "Otorga la escritura pública", detalle: "Ante notario, con el pago de los impuestos de la transacción (tradición de bienes inmuebles y tasas registrales)." },
      { titulo: "Inscribe la escritura en el IP", detalle: "Presenta el testimonio de la escritura en el registro correspondiente; la inscripción en el folio real te hace dueño ante terceros." },
    ],
    requisitos: ["Escritura pública", "Constancias fiscales y pago de impuestos", "[Verificar tasas registrales vigentes]"],
    tasa: "L ___ (impuesto de tradición + tasas registrales)",
    nota: "Los fraudes de doble venta se evitan en el paso 1 — un abogado o notario revisa el folio real antes de que pagues.",
  },
  {
    id: "traspaso-vehiculo",
    nombre: "Traspaso de vehículo",
    tipo: "tramite",
    institucionId: "ip",
    paraQuien: "Quien compra o vende un carro o moto usados",
    resumen:
      "El vehículo sigue a nombre del vendedor hasta que el traspaso se inscribe en el registro vehicular — con las multas y responsabilidades que eso implica.",
    materia: "Civil",
    pasos: [
      { titulo: "Verifica el estado del vehículo", detalle: "Matrícula al día, sin multas pendientes ni gravámenes — pide la constancia antes de pagar." },
      { titulo: "Formaliza la compraventa", detalle: "Documento de traspaso autenticado ante notario, con DNI de ambas partes." },
      { titulo: "Inscribe el traspaso en el registro vehicular", detalle: "Presenta el documento y paga las tasas; el vehículo queda a tu nombre y las obligaciones dejan de ser del vendedor." },
    ],
    requisitos: ["DNI de comprador y vendedor", "Boleta de revisión y matrícula al día", "[Verificar tasas vigentes del registro]"],
    tasa: "L ___ (según valor del vehículo)",
    nota: "Comprar sin traspasar es la fuente clásica de problemas: multas ajenas, embargos y hasta vehículos con reporte.",
  },
  {
    id: "constituir-sociedad",
    nombre: "Constitución de una sociedad",
    tipo: "tramite",
    institucionId: "registro-mercantil",
    paraQuien: "Socios que quieren formalizar una empresa (S. de R.L. o S.A.)",
    resumen:
      "Formalizar una empresa en Honduras no es un trámite: son 33 pasos oficiales ante notario, banco, Registro Mercantil, SAR, alcaldía, IHSS, INFOP y RAP. Toma entre 34 y 54 días. Esta guía te ordena el camino por etapas.",
    materia: "Mercantil",
    pasos: [
      {
        titulo: "Deposita el capital y obtén el certificado",
        detalle:
          "El notario emite la nota para el certificado de depósito y depositas el aporte en numerario en un banco del sistema. Con ese certificado arranca todo lo demás.",
      },
      {
        titulo: "Otorga la escritura pública de constitución",
        detalle:
          "El notario elabora la escritura con los datos fundamentales: socios, capital, tipo de sociedad y representación legal. Firmas, recibes el aviso de constitución y retiras el testimonio.",
      },
      {
        titulo: "Inscribe la sociedad en el Registro Mercantil",
        detalle:
          "Calculas y pagas la tasa registral, solicitas la inscripción y retiras la matrícula. Aquí la sociedad empieza a existir frente a terceros.",
      },
      {
        titulo: "Saca el RTN de la sociedad y la afiliación a la cámara",
        detalle:
          "Con la matrícula tramitas el registro tributario de la empresa y la afiliación a la cámara de comercio, ambos gestionados en el Registro Mercantil.",
      },
      {
        titulo: "Autoriza tus libros contables",
        detalle:
          "Compras los libros, solicitas su autorización en la alcaldía, pagas en el banco y los retiras autorizados.",
      },
      {
        titulo: "Obtén el permiso de operación municipal",
        detalle:
          "En la alcaldía: constancia de compatibilidad de uso de suelo, solicitud del permiso, pago de impuestos y retiro del permiso de operación.",
      },
      {
        titulo: "Inscríbete como patrono: IHSS, INFOP y RAP",
        detalle:
          "Si vas a tener empleados: inscripción patronal en el IHSS (número patronal y planilla), afiliación al INFOP e inscripción al RAP. Sin esto no puedes contratar en regla.",
      },
    ],
    requisitos: [
      "Documento de identidad de los socios (te lo piden en casi todos los pasos)",
      "RTN personal del representante",
      "Certificado de depósito del capital",
      "Testimonio de la escritura pública",
      "Carta de poder si actúa un representante",
      "Formularios: inscripción tributaria, inscripción patronal IHSS, planilla y RAP",
    ],
    tasa: "≈ L 2,040 en tasas oficiales (sin honorarios de abogado ni notario)",
    nota:
      "⏱️ Cuenta con 34 a 54 días. Ojo: los montos y formularios del portal oficial pueden estar desactualizados (el antiguo DEI hoy es el SAR) — confirma cifras vigentes antes de presupuestar.",
    fuenteUrl: "https://honduras.eregulations.org/procedure/4/5?l=es",
    fuenteNombre: "e-Regulations Honduras — Sociedad mercantil (33 pasos)",
  },
  // ── Procesos legales (vía judicial) — pedido del socio: "proceso laboral,
  // me despidieron, ejemplos". Mismos campos: la UI y el checklist se
  // reutilizan; `tipo: "proceso"` los separa en la navegación.
  {
    id: "despido-injustificado",
    nombre: "Me despidieron: cómo reclamar",
    tipo: "proceso",
    institucionId: "trabajo",
    paraQuien: "Trabajadores despedidos sin causa justificada o sin pago de prestaciones",
    resumen:
      "Si te despidieron sin causa justificada, la ley te reconoce cesantía, preaviso y proporcionales. El camino empieza gratis en la Secretaría de Trabajo y, si no hay acuerdo, sigue en el juzgado laboral.",
    materia: "Laboral",
    pasos: [
      {
        titulo: "Reúne y guarda tu evidencia HOY",
        detalle:
          "Contrato, recibos de pago, carné, mensajes o carta del despido, nombres de compañeros que puedan declarar. Sin prueba de la relación laboral el reclamo se complica.",
      },
      {
        titulo: "Calcula lo que te corresponde",
        detalle:
          "Cesantía, preaviso, vacaciones y aguinaldos proporcionales según tu salario y antigüedad — con ese número negocias, no a ciegas.",
      },
      {
        titulo: "Reclama en la Secretaría de Trabajo (gratis)",
        detalle:
          "Presenta tu reclamo en la inspectoría del trabajo de tu ciudad: citan al patrono a una audiencia de conciliación. Muchos casos se resuelven aquí, sin juicio y sin costo.",
      },
      {
        titulo: "Si no hay acuerdo, demanda en el juzgado laboral",
        detalle:
          "Con un profesional del derecho se presenta la demanda ordinaria laboral ante el Juzgado de Letras del Trabajo, con el cálculo y las pruebas que reuniste.",
      },
      {
        titulo: "Audiencia, sentencia y cobro",
        detalle:
          "El juzgado cita a audiencia; si la sentencia te favorece, ordena el pago de prestaciones y los salarios dejados de percibir hasta que quede firme.",
      },
    ],
    requisitos: [
      "DNI vigente",
      "Contrato o prueba de la relación laboral (recibos, carné, mensajes)",
      "Fecha de ingreso, salario y fecha del despido",
      "[Verificar el plazo de prescripción vigente del Código del Trabajo]",
    ],
    tasa: "Conciliación en Trabajo: gratis · Demanda: honorarios del abogado",
    nota:
      "⏳ Los reclamos laborales PRESCRIBEN: no dejes pasar el tiempo. Y ojo — firmar un finiquito por menos de lo que te toca puede cerrarte la puerta.",
  },
  {
    id: "pension-alimenticia",
    nombre: "Pensión alimenticia: cómo pedirla o exigir su pago",
    tipo: "proceso",
    institucionId: "poder-judicial",
    paraQuien: "Madres, padres o tutores que necesitan fijar o cobrar la pensión de un hijo",
    resumen:
      "La pensión alimenticia es un derecho del hijo, no de quien la reclama. Se puede fijar por acuerdo o por juzgado, y si el obligado no paga, existen medidas para hacerla cumplir.",
    materia: "Familia",
    pasos: [
      {
        titulo: "Reúne los documentos del vínculo y de los gastos",
        detalle:
          "Partida de nacimiento del menor, tu DNI y comprobantes de gastos (colegiatura, salud, alimentación) — sustentan el monto que pides.",
      },
      {
        titulo: "Intenta el acuerdo (conciliación)",
        detalle:
          "Se puede acordar el monto y la forma de pago ante el juzgado de familia o con asistencia legal; el acuerdo homologado tiene fuerza de sentencia.",
      },
      {
        titulo: "Si no hay acuerdo, demanda de alimentos",
        detalle:
          "Se presenta ante el juzgado de familia del domicilio del menor; el juzgado puede fijar una pensión provisional mientras dura el proceso.",
      },
      {
        titulo: "Ejecuta si no cumple",
        detalle:
          "Con la pensión fijada y el incumplimiento probado, se solicitan medidas de apremio para hacerla efectiva (retención de salario y otras que la ley prevé).",
      },
    ],
    requisitos: [
      "Partida de nacimiento del menor",
      "DNI del solicitante",
      "Comprobantes de gastos del menor",
      "Datos e ingresos del obligado (si los conoces)",
      "[Verificar requisitos del juzgado de familia correspondiente]",
    ],
    tasa: "Honorarios del abogado · [tasas judiciales por verificar]",
    nota:
      "Guarda constancia de cada pago recibido o incumplido: es la prueba con la que se ejecuta después.",
  },
  {
    id: "divorcio-ciudadano",
    nombre: "Divorcio: por mutuo acuerdo o por causal",
    tipo: "proceso",
    institucionId: "poder-judicial",
    paraQuien: "Personas casadas que quieren disolver el matrimonio",
    resumen:
      "Si ambos están de acuerdo, el divorcio por mutuo consentimiento es el camino más rápido y barato. Si no hay acuerdo, hay que invocar una causal y el proceso es más largo.",
    materia: "Familia",
    pasos: [
      {
        titulo: "Reúne los documentos del matrimonio y de los hijos",
        detalle:
          "Certificación de matrimonio, DNI de ambos y partidas de nacimiento de los hijos si los hay.",
      },
      {
        titulo: "Acuerden lo esencial antes de ir al juzgado",
        detalle:
          "Guarda y cuidado de los hijos, pensión alimenticia y reparto de bienes. Ese acuerdo (convenio regulador) es el corazón del divorcio por mutuo consentimiento.",
      },
      {
        titulo: "Presenten la solicitud conjunta",
        detalle:
          "Con auxilio de profesional del derecho, ante el juzgado de familia; se acompaña el convenio regulador firmado por ambos.",
      },
      {
        titulo: "Audiencia, sentencia e inscripción",
        detalle:
          "Ratifican su voluntad ante el juez; dictada la sentencia, se inscribe en el Registro Nacional de las Personas para que surta efectos.",
      },
    ],
    requisitos: [
      "Certificación de matrimonio",
      "DNI de ambos cónyuges",
      "Partidas de nacimiento de los hijos (si aplica)",
      "Convenio regulador (mutuo consentimiento)",
      "[Verificar requisitos vigentes del juzgado]",
    ],
    tasa: "Honorarios del abogado · [tasas por verificar]",
    nota:
      "Sin acuerdo, el divorcio por causal exige probar los hechos y toma mucho más tiempo — casi siempre conviene negociar primero.",
  },
  {
    id: "herencia-sucesion",
    nombre: "Herencia: cómo poner los bienes a tu nombre",
    tipo: "proceso",
    institucionId: "poder-judicial",
    paraQuien: "Familiares que heredan una casa, terreno o cuentas de una persona fallecida",
    resumen:
      "Heredar no basta con ser familiar: hasta que se declaren los herederos y se inscriba la partición, los bienes siguen a nombre del fallecido y no se pueden vender ni hipotecar.",
    materia: "Civil",
    pasos: [
      {
        titulo: "Reúne los documentos del fallecido y del vínculo",
        detalle:
          "Certificado de defunción, partidas de nacimiento o matrimonio que prueben el parentesco, y los títulos de los bienes (escrituras, folio real).",
      },
      {
        titulo: "Verifica si dejó testamento",
        detalle:
          "Con testamento, la sucesión sigue lo que dispuso; sin testamento, la ley define quiénes heredan y en qué proporción.",
      },
      {
        titulo: "Tramita la declaratoria de herederos",
        detalle:
          "Se promueve ante juzgado o por vía notarial según el caso; ahí queda oficialmente reconocido quién hereda.",
      },
      {
        titulo: "Inscribe los bienes a nombre de los herederos",
        detalle:
          "Con la declaratoria y la partición, se inscribe en el Instituto de la Propiedad — hasta ese momento no puedes vender ni hipotecar el inmueble.",
      },
    ],
    requisitos: [
      "Certificado de defunción",
      "Documentos que prueben el parentesco",
      "Escrituras o folio real de los bienes",
      "Testamento (si existe)",
      "[Verificar impuestos y tasas vigentes]",
    ],
    tasa: "Honorarios del abogado o notario · [tasas registrales por verificar]",
    nota:
      "Dejar la herencia sin tramitar por años multiplica el problema: se suman herederos, se pierden documentos y el inmueble queda inmovilizado.",
  },
];

export function getTramite(id: string): Tramite | undefined {
  return TRAMITES.find((t) => t.id === id);
}

export function getInstitucion(id: string): Institucion | undefined {
  return INSTITUCIONES.find((i) => i.id === id);
}