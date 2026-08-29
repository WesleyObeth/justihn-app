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
    institucionId: "sar",
    paraQuien: "Cualquier persona que empieza a trabajar, facturar o abrir un negocio",
    resumen:
      "El Registro Tributario Nacional es tu identidad ante el SAR — lo necesitas para facturar, abrir cuentas de negocio y casi cualquier trámite económico.",
    materia: "Mercantil",
    pasos: [
      {
        titulo: "Reúne tu identificación",
        detalle: "DNI vigente (personas naturales) o escritura de constitución (comerciantes y sociedades).",
      },
      {
        titulo: "Solicita la inscripción ante el SAR",
        detalle: "Presencial en una oficina del SAR o por la Oficina Virtual, llenando el formulario de inscripción.",
      },
      {
        titulo: "Recibe tu RTN",
        detalle: "El SAR emite el RTN numérico; guárdalo — te lo pedirán en todo trámite económico.",
      },
    ],
    requisitos: ["DNI vigente", "Datos de tu actividad económica", "[Verificar requisitos vigentes con el SAR]"],
    tasa: "Sin costo (persona natural)",
    nota: "Si vas a facturar, el RTN es solo el primer paso — sigue la autorización de facturación (CAI).",
  },
  {
    id: "facturacion-cai",
    nombre: "Facturación con CAI",
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
    institucionId: "registro-mercantil",
    paraQuien: "Socios que quieren formalizar una empresa (S. de R.L. o S.A.)",
    resumen:
      "La sociedad nace con la escritura pública y existe frente a terceros cuando se inscribe en el Registro Mercantil — después vienen RTN, permisos y facturación.",
    materia: "Mercantil",
    pasos: [
      { titulo: "Define el tipo social y el pacto", detalle: "S. de R.L. o S.A., capital, socios y administración — es la estructura legal de tu negocio por años." },
      { titulo: "Otorga la escritura ante notario", detalle: "La escritura de constitución con los estatutos de la sociedad." },
      { titulo: "Inscribe en el Registro Mercantil", detalle: "En la cámara de comercio de tu jurisdicción (CCIT en Tegucigalpa, CCIC en Cortés)." },
      { titulo: "Activa la vida fiscal", detalle: "RTN de la sociedad, permiso de operación y facturación CAI — los otros trámites de esta guía." },
    ],
    requisitos: ["DNI de los socios", "Capital según tipo social", "[Verificar montos y aranceles vigentes]"],
    tasa: "L ___ (notario + registro)",
    nota: "El pacto social mal diseñado cuesta caro al crecer o al pelearse los socios — aquí el abogado mercantil vale cada lempira.",
  },
];

export function getTramite(id: string): Tramite | undefined {
  return TRAMITES.find((t) => t.id === id);
}

export function getInstitucion(id: string): Institucion | undefined {
  return INSTITUCIONES.find((i) => i.id === id);
}
