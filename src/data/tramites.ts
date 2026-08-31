import type { Materia } from "@/types/dominio";

/**
 * Vertical de trámites administrativos por institución del Estado — el tema
 * grande del feedback del socio abogado (2026-08-29). Sirve a las DOS vías:
 * la gente común busca "cómo sacar el RTN"; el abogado lo usa de referencia.
 *
 * HONESTIDAD (regla #1): todas las guías están VERIFICADAS contra su fuente
 * oficial (backlog #3c, cerrado 2026-08-29) — cada una lleva `fuenteUrl` y
 * `fuenteNombre`, que es lo que enciende el sello "Verificado con la fuente
 * oficial" en la UI. Ya no quedan marcadores "L ___": los montos, plazos y
 * artículos salen del portal institucional o del código citado. Al editar una
 * guía, o se mantiene la fuente o se quita el sello — nunca texto sin respaldo.
 *
 * TODO(data): tablas `instituciones` + `tramites` + `pasos_tramite`. Pendiente
 * de revisión del socio abogado: contraste de práctica real y actualización
 * de tarifas (las de las instituciones cambian sin aviso).
 */

export interface Institucion {
  id: string;
  nombre: string;
  sigla: string;
  descripcion: string;
  /**
   * Portal oficial. Opcional a propósito: solo se pone si el host está en la
   * whitelist §3.3 (`isFuenteOficial`), y hay instituciones cuyo sitio no
   * responde —MiAmbiente— o no se ha verificado. Antes un enlace muerto o a un
   * dominio sin comprobar, ninguno. `instituciones.test.ts` lo exige.
   */
  sitio?: string;
}

/**
 * Profesional que un paso concreto exige. Se marca SOLO cuando la fuente
 * oficial lo dice literalmente ("autenticadas por Notario", "a favor de un
 * profesional del derecho") — no por criterio propio.
 *
 * `notario` NO es lo mismo que un abogado de materia "Notarial": es una
 * credencial aparte (ver `HabilitacionNotarial` en `data/directorio.ts`), y
 * por eso la UI resuelve estos pasos con `buscarNotarios()`.
 */
export type ProfesionalRequerido = "notario" | "abogado";

export interface PasoTramite {
  titulo: string;
  detalle: string;
  /** Si el paso exige un profesional, la guía lo dice EN el paso — no solo
   *  en una tarjeta al pie que el usuario ve cuando ya se atascó. */
  profesional?: ProfesionalRequerido;
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
  /** La `tasa` en una línea, para listas y tarjetas. NO es un dato nuevo:
   *  condensa lo ya verificado ("Gratuito", "L 300", "Desde L 341"). Al
   *  editar `tasa` hay que revisar esta — no pueden decir cosas distintas. */
  tasaCorta: string;
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
    sitio: "https://www.sar.gob.hn",
  },
  {
    id: "ip",
    nombre: "Instituto de la Propiedad",
    sigla: "IP",
    descripcion: "Propiedad inmueble, tradición de dominio y registro vehicular.",
    sitio: "https://www.ip.gob.hn",
  },
  {
    id: "municipalidad",
    nombre: "Municipalidad (AMDC y demás alcaldías)",
    sigla: "Alcaldía",
    descripcion: "Permisos de operación de negocios y tasas municipales.",
    sitio: "https://gac.amdc.hn",
  },
  {
    id: "arsa",
    nombre: "Agencia de Regulación Sanitaria",
    sigla: "ARSA",
    descripcion: "Licencias y permisos sanitarios de establecimientos y productos.",
    sitio: "https://arsa.gob.hn",
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
    sitio: "https://oncae.gob.hn",
  },
  {
    id: "poder-judicial",
    nombre: "Poder Judicial (juzgados)",
    sigla: "Juzgados",
    descripcion: "Demandas y procesos ante los juzgados de letras y de paz.",
    sitio: "https://www.poderjudicial.gob.hn",
  },
  {
    id: "trabajo",
    nombre: "Secretaría de Trabajo y Seguridad Social",
    sigla: "STSS",
    descripcion: "Conciliación laboral y reclamos administrativos antes de demandar.",
  },
  {
    id: "dgpc",
    nombre: "Dirección General de Protección al Consumidor",
    sigla: "DGPC",
    descripcion: "Denuncias por productos vencidos, defectuosos y mala prestación de servicios.",
    sitio: "https://sde.gob.hn/proteccion-al-consumidor/",
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
    tasaCorta: "Gratuito",
    nota: "La reposición del RTN también es gratis y se descarga desde la Oficina Virtual. Si vas a facturar, el RTN es solo el primer paso: sigue la autorización de facturación (CAI).",
    fuenteUrl: "https://www.sar.gob.hn/registro-tributario-nacional-rtn/",
    fuenteNombre: "SAR — Registro Tributario Nacional",
  },
  {
    id: "facturacion-cai",
    nombre: "Facturación con CAI",
    tipo: "tramite",
    institucionId: "sar",
    paraQuien: "Todo el que vende bienes o presta servicios y tiene que dar factura",
    resumen:
      "El SAR es tajante: todo contribuyente que transfiera bienes o preste servicios está obligado a emitir comprobante fiscal. Para poder imprimirlos necesitas una autorización con su CAI — y esa autorización dura como máximo un año: vencida, tus facturas pierden validez aunque te sobren talonarios.",
    materia: "Mercantil",
    pasos: [
      {
        titulo: "Revisa tu comportamiento tributario antes de pedir nada",
        detalle:
          "El SAR puede limitar, condicionar o rechazar la autorización según tu comportamiento tributario: datos actualizados en el RTN, cumplimiento de obligaciones formales y materiales, deudas líquidas firmes pendientes de pago y procedimientos que tengas abiertos (fiscalizaciones, cobros, requerimientos). El propio reglamento te manda a verificarlo ANTES de solicitar, para que no te rechacen (art. 63 del Acuerdo 481-2017).",
      },
      {
        titulo: "Inscríbete en el Régimen de Facturación",
        detalle:
          "Requisitos del art. 45: tener los datos al día en el RTN, estar al día en la presentación y pago de tus obligaciones, suscribir el contrato de adhesión y llenar el formulario del SAR. Al inscribirte declaras con precisión cuatro cosas: modalidad de impresión, qué comprobantes y documentos vas a emitir, tus establecimientos y tus puntos de emisión.",
      },
      {
        titulo: "Elige tu modalidad: imprenta o autoimpresor",
        detalle:
          "Por IMPRENTA: eliges una imprenta certificada en el Registro Fiscal de Imprentas y ella gestiona la autorización. Factura prevalorada, recibo por honorarios profesionales y constancia de donación solo pueden emitirse por esta vía. Por AUTOIMPRESOR: solicitas la autorización tú, de forma electrónica — por cada máquina registradora, o por cada sistema computarizado y tipo de documento.",
      },
      {
        titulo: "Solicita la autorización de impresión y vigencia (el CAI)",
        detalle:
          "La gestión es electrónica. La autorización se da por punto de emisión y por tipo de documento, fijando el rango de numeración correlativa. Puedes hacer una sola solicitud por punto de emisión hasta agotar los documentos autorizados, dentro de los DOS MESES previos a la fecha límite de emisión (art. 59).",
      },
      {
        titulo: "Verifica que la factura lleve todo lo que exige el art. 10",
        detalle:
          "Datos del emisor (RTN, nombre o razón social, nombre comercial, dirección de casa matriz y del establecimiento del punto de emisión, teléfono y correo del contrato de adhesión); la palabra «Factura»; el CAI; la fecha límite de emisión vigente; el rango autorizado vigente; el destino de los ejemplares (original al cliente, copia al emisor); y el correlativo de 16 dígitos NNN-NNN-NN-NNNNNNNN (establecimiento · punto de emisión · 01 = factura · ocho dígitos correlativos desde 00000001). Si es preimpresa, además los datos de la imprenta y su número de certificado.",
      },
      {
        titulo: "Renueva a tiempo y avisa de lo que no usaste",
        detalle:
          "La autorización se otorga por un plazo máximo de un (1) año; vencido, los documentos pierden validez y no pueden usarse (art. 62). Y hay una obligación que casi nadie cumple: comunicar al SAR los comprobantes NO utilizados dentro de los primeros 10 días hábiles del mes siguiente al vencimiento de la vigencia — o al cambiar tus datos, cerrar un establecimiento, dar de baja un punto de emisión, o por deterioro, robo o extravío (art. 42).",
      },
    ],
    requisitos: [
      "RTN con los datos actualizados",
      "Estar al día en la presentación y pago de obligaciones formales y materiales",
      "Contrato de adhesión suscrito",
      "Formulario de inscripción al Régimen de Facturación",
      "Declarar modalidad de impresión, tipos de comprobante, establecimientos y puntos de emisión",
      "Modalidad imprenta: imprenta seleccionada del Registro Fiscal de Imprentas",
      "Modalidad autoimpresor: cada máquina registradora o sistema computarizado registrado",
    ],
    tasa: "El Reglamento del Régimen de Facturación no fija tasa por la autorización: lo que se paga es la impresión a la imprenta certificada, o el sistema propio si eres autoimpresor",
    tasaCorta: "Sin tasa oficial",
    nota:
      "⏰ Emitir con la vigencia vencida es el error clásico: los comprobantes «perderán su validez y no podrán ser utilizados cuando se haya vencido el plazo de tiempo autorizado» (art. 62). Pide la renovación dentro de los 2 meses previos a la fecha límite.\n\n↩️ Si te rechazan la solicitud tienes un plazo perentorio de 10 días hábiles desde la comunicación para regularizar tu situación o pedir la verificación de la gestión (art. 64).\n\n📄 Marco legal: Acuerdo 481-2017 (Reglamento del Régimen de Facturación, Otros Documentos Fiscales y Registro Fiscal de Imprentas) y sus reformas — Acuerdos 609-2017, 725-2018 y 817-2018.",
    fuenteUrl: "https://www.sar.gob.hn/facturacion/",
    fuenteNombre: "SAR — Régimen de Facturación (Acuerdo 481-2017, texto en La Gaceta N.º 34,413)",
  },
  {
    id: "permiso-operacion",
    nombre: "Permiso de operación de negocio",
    tipo: "tramite",
    institucionId: "municipalidad",
    paraQuien: "Todo negocio con local o actividad en un municipio",
    resumen:
      "La alcaldía autoriza que tu negocio opere en su municipio. Esta guía sigue los requisitos oficiales de la AMDC (Distrito Central) — cada alcaldía tiene los suyos, pero el esquema se repite.",
    materia: "Mercantil",
    pasos: [
      {
        titulo: "Obtén la compatibilidad de uso del local",
        detalle:
          "La aprueba la Gerencia de Control de la Construcción; si tu negocio está en el Centro Histórico (entre el Puente del Guanacaste y El Obelisco), la aprueba la Gerencia del Centro Histórico.",
      },
      {
        titulo: "Regístrate primero en la Cámara de Comercio",
        detalle:
          "La alcaldía NO autoriza permisos a quien no esté inscrito o renovado en la cámara de comercio de su municipio (art. 31 de la Ley de Cámaras). La constancia se renueva cada 5 años.",
      },
      {
        titulo: "Llena la declaración jurada ICS F-01",
        detalle:
          "Formulario de Industria, Comercio y Servicio, sin manchones, tachaduras ni corrector, firmado por el propietario o representante legal — y con el croquis del lugar dibujado dentro del mismo formulario.",
      },
      {
        titulo: "Reúne solvencias y documentos del negocio",
        detalle:
          "Solvencia municipal vigente, estado de cuenta de bienes inmuebles al día del local donde operas, DNI del propietario, RTN si es sociedad y la escritura de constitución inscrita en el Registro Mercantil.",
      },
      {
        titulo: "Presenta el trámite y retira tu permiso",
        detalle:
          "En la ventanilla de atención al ciudadano de la alcaldía (en la AMDC, la ventanilla AER) o en línea. Pagas los impuestos y tasas correspondientes y retiras el permiso.",
      },
    ],
    requisitos: [
      "Compatibilidad de uso aprobada",
      "Formulario ICS F-01 firmado, con croquis del local",
      "Solvencia municipal vigente del propietario o representante",
      "Estado de cuenta de bienes inmuebles del local, al día",
      "DNI / pasaporte / carné de residente",
      "RTN (si es sociedad) y escritura inscrita en Registro Mercantil y Cámara",
      "Si va un gestor: carta poder autenticada FIRMADA POR EL PROPIETARIO (no por el gestor), su DNI y su solvencia",
    ],
    tasa: "Impuestos y tasas municipales según tu volumen de ventas declarado",
    tasaCorta: "Según tus ventas",
    nota:
      "Si estás registrado como MYPE (Decreto 145-2018 / 48-2022) presenta el certificado de SENPRENDE y la constancia vigente de SEFIN. Y ojo: la carta poder la firma el dueño, no quien hace la fila — es motivo común de rechazo.",
    fuenteUrl: "https://gac.amdc.hn/tramites/apertura-de-negocios/",
    fuenteNombre: "AMDC — Apertura de Negocio",
  },
  {
    id: "licencia-sanitaria",
    nombre: "Licencia y permiso sanitario (ARSA)",
    tipo: "tramite",
    institucionId: "arsa",
    paraQuien: "Pulperías, comedores, restaurantes, panaderías, carnicerías, supermercados, bodegas e industria de alimentos",
    resumen:
      "ARSA autoriza sanitariamente establecimientos y productos. Lo que casi nadie sabe antes de ir: la tarifa NO es una sola — depende del tipo de establecimiento, de sus metros cuadrados, de si pides la licencia por 2, 4 o 6 años, de si el trámite es en línea o presencial, y sobre todo de en cuántos días hábiles quieres la resolución. Elegir bien esas cuatro casillas puede dividir el costo entre cuatro.",
    materia: "Contencioso Adm.",
    pasos: [
      {
        titulo: "Ubica tu categoría y tu clase",
        detalle:
          "ARSA clasifica por actividad (almacenan/distribuyen · manipulan y expenden listos para consumo · procesan y envasan preenvasados) y luego por tipo de establecimiento y clase según tamaño: pulpería, abarrotería o tienda de conveniencia; glorieta, comedor o cafetería; restaurante (quiosco/troca vs. pequeño-mediano vs. grandes, buffet y franquicias); panadería; carnicería; supermercado; bodega; distribuidora; industria alimenticia; envasadoras de agua; bares y discotecas. La clase la define la superficie en m² (o el número de empleados, en la industria).",
      },
      {
        titulo: "Decide vigencia, modalidad y velocidad — ahí está el precio",
        detalle:
          "La licencia se otorga, a tu elección, por 2, 4 o 6 años. Y la tarifa vigente de ARSA se cruza con dos cosas más: EN LÍNEA sale sistemáticamente más barato que presencial (alrededor de 12% menos), y el precio sube según los días hábiles de resolución que pidas: 60, 40, 20 o 10. Ejemplos reales de licencia nueva por 2 años en línea — pulpería clase I: L 423.79 a 60 días, L 1,695.17 a 10 días. Comedor o cafetería tipo glorieta clase I: L 341.10 a 60 días. Restaurante pequeño-mediano: L 4,370.36 a 60 días, L 17,656.26 a 10 días.",
      },
      {
        titulo: "Arma la solicitud con el título exacto",
        detalle:
          "Se presenta una solicitud dirigida a la Agencia de Regulación Sanitaria cuyo título diga literalmente «SE SOLICITA LICENCIA SANITARIA», con: nombre y número de identidad del propietario o representante legal, razón social, nombre del establecimiento, dirección exacta con teléfono, fax y correo, actividades y horario de atención, el tiempo por el que la pides (2, 4 o 6 años), lugar, fecha y firma.",
      },
      {
        titulo: "Adjunta los documentos y paga con TGR-1",
        detalle:
          "Fotocopia de la escritura de constitución (sociedad o comerciante individual) debidamente inscrita, croquis de ubicación (cómo llegar), croquis de distribución de áreas internas y externas con fotografías del local, declaración jurada autenticada y la cuota de recuperación por servicios prestados. El pago va por el rubro «12199 - Tasas Varias» del formulario TGR-1.",
      },
      {
        titulo: "Presenta el expediente y espera el dictamen",
        detalle:
          "Entra por la ventanilla de Servicio de Atención al Ciudadano (o en línea por SOL-ARSA); Admisiones Legales verifica requisitos y, si falta algo, te notifican para subsanar. La Dirección de Alimentos y Bebidas hace el informe técnico y la Unidad Legal el dictamen y la resolución. ARSA atiende en Tegucigalpa, Comayagua, San Pedro Sula, La Ceiba, Choluteca, Danlí, Santa Rosa de Copán y Juticalpa.",
      },
      {
        titulo: "Si te dicen que no, tienes plazos cortos",
        detalle:
          "Ante un informe o dictamen no conforme puedes interponer recurso de reposición en un plazo no mayor a 10 días. Si te lo rechazan, tienes 10 días para apelar, o 60 días hábiles para ir a la vía judicial.",
      },
    ],
    requisitos: [
      "Solicitud titulada «SE SOLICITA LICENCIA SANITARIA» con todos los datos del establecimiento y el plazo pedido (2, 4 o 6 años)",
      "Fotocopia de la escritura de constitución de sociedad o de comerciante individual, inscrita",
      "Croquis de ubicación (cómo llegar al establecimiento)",
      "Croquis de distribución de áreas internas y externas + fotografías del local",
      "Declaración jurada debidamente autenticada",
      "Comprobante de la cuota de recuperación (TGR-1, rubro 12199 - Tasas Varias)",
      "Venta en la vía pública, además: carné de salud de manipulador, certificado del curso «Manipulación segura de los alimentos» de ARSA, constancia municipal de que el sitio puede destinarse a eso, y RTN",
    ],
    tasa: "Según la tabla vigente de ARSA: desde L 341.10 (comedor/cafetería clase I, 2 años, en línea, 60 días hábiles) hasta L 27,970.32 (supermercado o industria clase III, 6 años, presencial). Pulpería clase I: L 423.79 · Restaurante pequeño-mediano: L 4,370.36 (ambos 2 años, en línea, 60 días)",
    tasaCorta: "Desde L 341",
    nota:
      "🚀 La misma licencia cuesta hasta 4 veces más si la pides a 10 días hábiles en vez de 60, y siempre sale más barata en línea que presencial. Corre la calculadora oficial de ARSA con tus datos antes de presupuestar.\n\n🧑‍🍳 ¿Vas empezando desde tu casa, sin local independiente? Existe el Permiso Sanitario para Microempresa: L 200.00 y te habilita un año mientras obtienes tu licencia. El Registro Sanitario de producto de microempresa también cuesta L 200.00, dura 5 años, solo sirve para mercado nacional y NO es renovable — 6 meses antes de vencer hay que sacar el registro normal.\n\n📅 Vigencias: la licencia de venta de alimentos en la vía pública dura 1 año; el permiso sanitario temporal, 6 meses (renovable una sola vez, pidiéndolo 5 días antes de vencer).",
    fuenteUrl: "https://arsa.gob.hn/calculadora-de-alimentos-y-bebidas/",
    fuenteNombre: "ARSA — Calculadora oficial de tarifas + Guía de ayuda al ciudadano (Alimentos y Bebidas)",
  },
  {
    id: "licencia-ambiental",
    nombre: "Licencia ambiental",
    tipo: "tramite",
    institucionId: "miambiente",
    paraQuien: "Proyectos y negocios con impacto ambiental: construcción, industria, agro, minería, energía",
    resumen:
      "No es una licencia sino dos: primero la Operativa, que te deja empezar, y después la Funcional, que vale 5 años. Y hay tres cosas que sorprenden al que llega sin asesoría: necesitas contratar sí o sí un Prestador de Servicios Ambientales autorizado, tienes que publicar un aviso en el diario, y el precio no está en ninguna tabla — lo calcula el sistema en línea según tu proyecto.",
    materia: "Contencioso Adm.",
    pasos: [
      {
        titulo: "Regístrate en el Sistema en línea de Licenciamiento Ambiental",
        detalle:
          "Todo arranca en el sistema en línea de MiAmbiente (SERNA). Ahí se genera después el Reporte Oficial que fija cuánto vas a pagar.",
      },
      {
        titulo: "Contrata un Prestador de Servicios Ambientales (PSA) autorizado",
        detalle:
          "No es opcional: el PSA es el experto que elabora tu Plan de Gestión Ambiental y/o Estudio de Impacto Ambiental. MiAmbiente publica la lista de PSA autorizados, y el propio sistema te obliga a elegir uno de esa lista antes de continuar. Con él obtienes el pre-dictamen técnico del proyecto: costos, medidas de control ambiental y los requisitos de tu categoría.",
      },
      {
        titulo: "Paga: TGR-1, depósito de inspección y garantía bancaria",
        detalle:
          "Son tres pagos distintos. (1) El costo de la licencia: se anota el monto de «Inversión por Licenciamiento» del Reporte Oficial en la casilla 12209 «Otras Licencias» del formulario TGR-1 de SEFIN y se paga en cualquier banco. (2) El depósito para la primera visita de los inspectores de la DECA, en BANADESA, a la cuenta del Fondo Rotatorio de DECA 02-001-000131-0, por el monto de «Pago primera visita DECA». (3) Una garantía bancaria que respalda la Licencia Operativa, por el monto que indique el mismo reporte.",
      },
      {
        titulo: "Publica el aviso en el diario — y cuida los plazos",
        detalle:
          "El aviso de solicitud de licencia ambiental va en un octavo (1/8) de página en un diario de mayor circulación local y/o nacional, indicando el proyecto, su giro, su ubicación y la intención de solicitar la licencia. Debe publicarse 3 días consecutivos, y la solicitud se presenta dentro de los 5 días posteriores a la publicación: el recorte tiene una validez de 5 días hábiles y debe llevar el nombre del diario y la fecha.",
      },
      {
        titulo: "Solicita y retira la Licencia Operativa",
        detalle:
          "Con el Informe de Validación Ambiental y la Declaración Jurada del PSA, envías la solicitud por el sistema y luego la presentas en ventanilla con: escritura de constitución, RTN, DNI, recibo TGR-1 cancelado, comprobante del depósito, garantía bancaria, carta poder si aplica, el recorte de la publicación y el certificado de autenticidad de las fotocopias. Firmas el Contrato de Cumplimiento de Medidas de Mitigación o Control Ambiental y retiras la Licencia Operativa — que es temporal y pierde valor cuando salga la Funcional.",
      },
      {
        titulo: "Inspección de DECA y Licencia Funcional (5 años)",
        detalle:
          "Los inspectores de la DECA visitan el sitio: ahí se presenta el SINEIA F-02 y las constancias que apliquen a tu proyecto — ICF, factibilidad del INSEP, constancia de la UMA municipal, Instituto Hondureño de Antropología e Historia, credencial del alcalde. Después presentas en ventanilla la Solicitud de Licencia Funcional con el título de propiedad y el resumen del Plan de Gestión Ambiental, y retiras la licencia: vigencia de 5 años.",
      },
    ],
    requisitos: [
      "Registro en el Sistema en línea de Licenciamiento Ambiental",
      "Prestador de Servicios Ambientales (PSA) autorizado por MiAmbiente, elegido de su lista oficial",
      "Recibo TGR-1 cancelado (casilla 12209 «Otras Licencias») + comprobante del depósito a BANADESA + garantía bancaria",
      "Informe de Validación Ambiental y Declaración Jurada del PSA",
      "Escritura pública de constitución, RTN y documento de identidad (carta poder si actúa un representante)",
      "Recorte de la publicación del aviso (1/8 de página, 3 días consecutivos) y certificado de autenticidad de las fotocopias",
      "SINEIA F-02, título de propiedad y resumen del Plan de Gestión Ambiental",
      "Constancias según el proyecto: ICF, INSEP, UMA municipal, Instituto Hondureño de Antropología e Historia",
    ],
    tasa: "No hay tarifa fija publicada: el monto de «Inversión por Licenciamiento» y el «Pago primera visita DECA» los calcula el Sistema en línea de Licenciamiento Ambiental según tu proyecto, y se suman la garantía bancaria y los honorarios del PSA",
    tasaCorta: "Lo calcula el sistema",
    nota:
      "📊 La categoría manda. El Acuerdo Ministerial 016-2015 (Tabla de Categorización Ambiental) clasifica los proyectos en categorías 1 a 4 según su magnitud e impacto, y de ahí salen los estudios que te van a pedir. Las categorías 1 y 2 siguen exactamente la misma ruta de 16 pasos; lo que cambia es la profundidad técnica del trabajo del PSA.\n\n⚖️ Base legal: Ley General del Ambiente (art. 5), Acuerdo Ejecutivo 008-2015 (Reglamento del SINEIA), Acuerdo Ministerial 016-2015 (Tabla de Categorización, Anexo 3) y art. 60 de la Ley de Fortalecimiento de los Ingresos.\n\n⚠️ Verifica en MiAmbiente el número de cuenta de BANADESA y los formularios antes de pagar: el portal de trámites del Estado puede estar desactualizado.",
    fuenteUrl: "https://honduras.eregulations.org/procedure/373/586?l=es",
    fuenteNombre: "e-Regulations Honduras — Licencias Ambientales (MiAmbiente/SERNA, 16 pasos)",
  },
  {
    id: "inscripcion-oncae",
    nombre: "Inscripción como proveedor del Estado (ONCAE)",
    tipo: "tramite",
    institucionId: "oncae",
    paraQuien: "Empresas, comerciantes y profesionales que quieren venderle al Estado",
    resumen:
      "Para participar en licitaciones y concursos hay que estar certificado en el Registro de Proveedores del Estado. La certificación vale 3 años y cuesta L 400.00 — pero el expediente se rechaza por detalles notariales, no por el dinero: dos auténticas distintas, media firma y sello ORIGINAL en cada hoja, y un TGR-01 que debe ser del mes en que entregas.",
    materia: "Contencioso Adm.",
    pasos: [
      {
        titulo: "Identifica bajo qué figura te vas a inscribir",
        detalle:
          "ONCAE tiene cinco juegos de requisitos: persona natural, comerciante individual, sociedad mercantil, ONG (que solo puede inscribirse bajo el rubro CONSULTORÍA) y empresa extranjera (con escrituras apostilladas). Los documentos cambian bastante entre uno y otro.",
      },
      {
        titulo: "Llena los formularios RP",
        detalle:
          "F-1RP solicitud de inscripción · F-2RP información del solicitante, donde detallas el bien o servicio al que te quieres certificar · F-3RP carta poder (o poder en escritura pública) a favor de un profesional del derecho, adjuntando su carné vigente del Colegio de Abogados · F-5RP declaración jurada de no estar en las prohibiciones o inhabilidades de los artículos 15 y 16 de la Ley de Contratación del Estado (para sociedades, también el art. 439 del Código Penal, lavado de activos). Las personas jurídicas suman el F-4RP con la certificación de su composición social.",
        profesional: "abogado",
      },
      {
        titulo: "Ojo con las auténticas: son dos, y así es como se rechazan",
        detalle:
          "Una auténtica DE COPIAS, con la media firma y el sello del notario en CADA hoja, y otra auténtica DE FIRMAS para los formularios. La media firma y el sello deben ser originales — escaneados no se aceptan. Y la auténtica tiene que detallar cada documento: si autentica una copia de identidad, debe decir el nombre completo y el número correcto; si no, te lo requieren.",
      },
      {
        titulo: "Reúne solvencias, RTN y acreditación del rubro",
        detalle:
          "Solvencia fiscal del SAR verificable por código QR (a nombre de la empresa si eres comerciante o sociedad); DNI y RTN autenticados del representante legal y, en sociedades, DNI y RTN de TODOS los socios; escritura de constitución con su última modificación que contenga el capital social actual; permiso de operación municipal vigente; y la acreditación vigente de tu rubro (constancia de inscripción, licencia, permisos especiales, colegiación). Persona natural sin colegio profesional: título universitario autenticado, revalidado por Educación si es extranjero.",
      },
      {
        titulo: "Paga el TGR-01 del mes correcto",
        detalle:
          "L 400.00 a nombre de la Secretaría de Finanzas, código de institución 100, código 12121 «emisión, constancias, certificaciones y otros». El recibo debe ser del MISMO MES en que presentas la documentación: si llevas uno del mes anterior, te lo requieren de nuevo. Se genera en el sistema TGR-1 de SEFIN.",
      },
      {
        titulo: "Pre-registro en línea, cita y entrega presencial",
        detalle:
          "Haces el registro electrónico en el portal de ONCAE: el sistema genera tu número de expediente y tu cita. Después entregas la documentación EN FÍSICO en las oficinas de Registro de Proveedores — los expedientes de proveedores certificados no se crean por ticket ni por correo. Al presentar los papeles con el TGR-1 pagado te emiten la constancia en trámite de forma electrónica, y el expediente se sigue desde el portal.",
      },
      {
        titulo: "Si te hacen un requerimiento, corre el reloj",
        detalle:
          "Tienes 10 días hábiles desde la emisión del requerimiento para subsanar (art. 48 de la Ley de Procedimiento Administrativo). Se puede pedir prórroga, pero por escrito y presentada ANTES de la fecha de vencimiento.",
      },
    ],
    requisitos: [
      "Formularios F-1RP, F-2RP, F-3RP y F-5RP autenticados (F-4RP además, si eres persona jurídica)",
      "Dos auténticas: una de copias (media firma y sello original en cada hoja) y otra de firmas",
      "DNI y RTN autenticados del representante legal — y de todos los socios, en sociedades",
      "Escritura de constitución con su última modificación y escritura que acredite la representación legal",
      "Solvencia fiscal del SAR verificable por código QR",
      "Permiso de operación municipal vigente (comerciante individual y sociedad mercantil)",
      "Acreditación vigente del rubro: constancia, licencia, permiso especial o colegiación",
      "Recibo TGR-01 de L 400.00, del mes de presentación",
      "Carné vigente del Colegio de Abogados del profesional del derecho apoderado",
    ],
    tasa: "L 400.00 (TGR-01, SEFIN institución 100, código 12121) por la inscripción · L 200.00 para actualizar la certificación vigente o ampliar CUBS",
    tasaCorta: "L 400",
    nota:
      "📅 La inscripción en el Registro de Proveedores y Contratistas tiene una vigencia de 3 años.\n\n🏪 Si eres MIPYME también te dan constancia en trámite, y una vez inscrita recibes la Constancia de Inscripción MIPYME para Compras Menores.\n\n🧾 El registro es la puerta de entrada, no el final: cada proceso agrega sus propias bases. Los procedimientos de contratación del art. 38 de la Ley de Contratación del Estado son licitación pública, licitación privada, concurso público, concurso privado y contratación directa.\n\n📍 Registro de Proveedores: Col. Florencia Norte, Edificio EDUCRÉDITO 2.º nivel, contiguo al Colegio de Ingenieros Civiles, Tegucigalpa. Lunes a viernes, 8:00 a.m. a 4:00 p.m.",
    fuenteUrl: "https://oncae.gob.hn/como-ser-proveedor/requisitos-para-certificarse-como-proveedor-del-estado/",
    fuenteNombre: "ONCAE — Requisitos para certificarse como proveedor del Estado + preguntas frecuentes",
  },
  {
    id: "tradicion-dominio",
    nombre: "Tradición de dominio de un inmueble",
    tipo: "tramite",
    institucionId: "ip",
    paraQuien: "Quien compra, vende o hereda una casa o un terreno",
    resumen:
      "Firmar la escritura no te hace dueño frente a terceros: eso ocurre cuando el documento se inscribe en el Registro Inmueble del Instituto de la Propiedad. Y el registrador no inscribe nada hasta que estén pagados los impuestos de la operación — incluido uno que casi siempre sorprende al vendedor.",
    materia: "Notarial",
    pasos: [
      {
        titulo: "Antes de pagar: pide la constancia de libertad de gravamen",
        detalle:
          "Es el paso que evita el fraude de la doble venta y las hipotecas ocultas. La constancia de libertad de gravamen cuesta L 200.00; si quieres la historia completa del inmueble (todos los asientos registrales), pide la certificación íntegra por L 300.00. Existe además la certificación de gravámenes judiciales, L 200.00.",
      },
      {
        titulo: "Otorga la escritura pública ante notario",
        detalle:
          "El notario redacta y autoriza la escritura de compraventa. Ojo: el IP exige presentar la escritura de compra-venta ORIGINAL al inscribirla — no una copia.",
        profesional: "notario",
      },
      {
        titulo: "Paga los impuestos ANTES de ir al registro",
        detalle:
          "Para inscribir la compraventa hay que acompañar tres pagos: (1) las tasas registrales según el valor de la venta, (2) el Impuesto de Tradición sobre bienes inmuebles según el monto de la venta y (3) el impuesto de Ganancia de Capital — este último es del vendedor y es el que más veces frena una inscripción a última hora. Cuando corresponda, se adjunta también la constancia de valor catastral del inmueble.",
      },
      {
        titulo: "Presenta la escritura para inscripción de compra-venta",
        detalle:
          "Con la escritura original y los recibos, el Registro Inmueble inscribe la compraventa. Los pagos se hacen en las ventanillas de cobro del IP o en las instituciones bancarias autorizadas — conserva el recibo hasta que el trámite esté completado.",
      },
      {
        titulo: "Si lo que necesitas es el trámite de tradición de dominio",
        detalle:
          "Es un trámite registral distinto (por ejemplo, para ordenar la cadena de dominio de un inmueble heredado). Se presenta solicitud de tradición de dominio —adjuntando el testamento si es testamentaria—, recibo de pago de L 200.00 con su copia, y copias del DNI de los solicitantes. Si el inmueble está inscrito en otra circunscripción, se acompaña la certificación íntegra de la sentencia. Y si la solicitud la firma un profesional del derecho, debe acreditar su representación con poder o, en su defecto, carta poder.",
        profesional: "abogado",
      },
    ],
    requisitos: [
      "Escritura de compra-venta ORIGINAL",
      "Recibo de pago de tasas registrales, calculado sobre el valor de la venta",
      "Recibo del Impuesto de Tradición sobre bienes inmuebles, según el monto de la venta",
      "Comprobante de pago del impuesto de Ganancia de Capital",
      "Constancia de valor catastral del inmueble, cuando corresponda",
      "Para el trámite de tradición de dominio: solicitud, recibo de L 200.00 y copia, DNI de los solicitantes, testamento si es testamentaria, y poder o carta poder si actúa un abogado",
    ],
    tasa: "Tasa base registral L 200.00 (más L 1.50 por millar o fracción cuando el valor excede L 1,000.00) + Impuesto de Tradición del 1.5% del valor de la transacción (art. 53 de la Ley de Propiedad, según la tabla de tasas del IP)",
    tasaCorta: "L 200 + 1.5%",
    nota:
      "🏠 Si el inmueble viene de una herencia, el trámite registral es la posesión efectiva de herencia: L 200.00, con la certificación de sentencia original y copia legible (testamentaria o abintestato).\n\n⚠️ Para propiedades con valor superior a L 300,000.00 el IP aplica tasas proporcionales según la tabla registral vigente, y advierte que las tasas pueden modificarse — confirma el monto en ventanilla antes de presupuestar.",
    fuenteUrl: "https://www.ip.gob.hn/direcciones/registro-inmueble/tramites-inmueble",
    fuenteNombre: "IP — Dirección General de Registro Inmueble (requisitos y tabla de tasas)",
  },
  {
    id: "traspaso-vehiculo",
    nombre: "Traspaso de vehículo",
    tipo: "tramite",
    institucionId: "ip",
    paraQuien: "Quien compra, vende o hereda un carro o una moto",
    resumen:
      "El vehículo sigue siendo del vendedor ante la ley hasta que el traspaso se inscribe en el Registro Vehicular del IP. El trámite cuesta L 300.00 y gira alrededor de un solo papel: el formulario de tradición de dominio con las firmas autenticadas por notario.",
    materia: "Civil",
    pasos: [
      {
        titulo: "Pide la certificación del vehículo ANTES de pagar",
        detalle:
          "Las certificaciones oficiales de registro y las certificaciones íntegras o de tracto sucesivo las puede solicitar CUALQUIER persona — no hace falta ser el dueño. Ahí ves la cadena de propietarios y si el vehículo tiene anotaciones preventivas (bloqueos por prenda, orden judicial, robo o vehículo ilocalizable). Es el único paso que te protege de comprar un carro embargado.",
      },
      {
        titulo: "Identifica cuál de las 14 modalidades es la tuya",
        detalle:
          "El IP tiene 14 tipos de traspaso y cada uno pide su propio formulario. Los cuatro comunes: RV-RE-01 (persona natural a persona natural), RV-RE-02 (natural a jurídica), RV-RE-03 (jurídica a natural) y RV-RE-04 (jurídica a jurídica). Herencia, legado o donación usa el RV-RE-13. Se descargan en ip.gob.hn → Registro Vehicular → Formularios Preimpresos.",
      },
      {
        titulo: "Ten tu RTN registrado ante el IP (el requisito que nadie ve venir)",
        detalle:
          "El propietario debe tener su RTN declarado ante el Registro Vehicular con el Formulario IP-800: se acompaña con copia del DNI (o pasaporte vigente si eres extranjero), copia del certificado de RTN del SAR y copia de un recibo público — si no tienes recibo público, una constancia de vecindad. Si eres empresa, además la constitución y el poder del representante legal.",
      },
      {
        titulo: "Llena el formulario y autentica las firmas ante notario",
        detalle:
          "Firman el tradente (vendedor) y el adquiriente (comprador), y un notario autentica ambas firmas; alternativamente, el traspaso puede constar en instrumento público autorizado por notario. Excepción: no se exige certificado de autenticidad cuando la venta la hace una agencia o distribuidora de vehículos NUEVOS y es el primer registro; si el vehículo es usado, aunque lo venda la agencia, las firmas sí van autenticadas. También vale firmar el formulario presencialmente ante el funcionario registral, que deja constancia de ello en el documento.",
        profesional: "notario",
      },
      {
        titulo: "Presenta el expediente en el Registro Vehicular",
        detalle:
          "Lleva los documentos en original y fotocopia (el original se te devuelve); si prefieres, puedes presentar fotocopias autenticadas por notario en lugar de los originales. Quien se presente debe identificarse con tarjeta de identidad, carné de residencia vigente, pasaporte vigente y/o licencia de conducir vigente.",
      },
      {
        titulo: "Paga los L 300.00 en el banco, después del trámite",
        detalle:
          "El valor del traspaso es de L 300.00 y se paga en cualquier agencia bancaria DESPUÉS de haber realizado el traspaso en Registro Vehicular. La inscripción se perfecciona cuando se acredita el pago: se acompaña el recibo o formulario que lo pruebe (IP-160, recibo de pago de trámites vehiculares).",
      },
    ],
    requisitos: [
      "Formulario de tradición de dominio que corresponda: RV-RE-01 / 02 / 03 / 04, o RV-RE-13 si es herencia",
      "Firmas del vendedor (tradente) y del comprador (adquiriente) autenticadas por notario, o instrumento público notarial",
      "Identificación vigente de quien presenta el trámite: DNI, carné de residencia, pasaporte o licencia de conducir",
      "Todo en original y fotocopia (el original se devuelve) o fotocopias autenticadas por notario",
      "RTN del propietario declarado ante el IP con Formulario IP-800, si aún no lo está",
      "Recibo que acredite el pago de la tasa (IP-160)",
    ],
    tasa: "L 300.00 — se paga en cualquier agencia bancaria después de hacer el traspaso en Registro Vehicular",
    tasaCorta: "L 300",
    nota:
      "🏠 Si el vehículo viene de una herencia: no se presenta formulario de traspaso, sino la certificación de la sentencia de declaratoria de herederos (o instrumento público equivalente) inscrita en el Registro de Sentencias del IP. Y si los herederos quieren pasarlo a uno de ellos o a un tercero, primero lo inscriben a nombre de todos por cesión de derechos y después firman la tradición de dominio. En ese trámite el cambio del kit de placas se hace a la vez: hay que marcar ambos trámites en el formulario.\n\n💻 Casi todo el registro vehicular se puede tramitar por correo electrónico ante la Dirección General del Registro de la Propiedad Vehicular — salvo lo que implica entregar o retirar placas, que obligatoriamente es presencial.",
    fuenteUrl:
      "https://www.ip.gob.hn/direcciones/registro-vehicular/menu-registro-vehicular/tramites-registro-vehicular",
    fuenteNombre: "IP — Dirección General de Registro Vehicular (requisitos y formularios oficiales)",
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
        profesional: "notario",
      },
      {
        titulo: "Otorga la escritura pública de constitución",
        detalle:
          "El notario elabora la escritura con los datos fundamentales: socios, capital, tipo de sociedad y representación legal. Firmas, recibes el aviso de constitución y retiras el testimonio.",
        profesional: "notario",
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
    tasaCorta: "≈ L 2,040",
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
      "Dos datos que cambian todo y casi nadie conoce: tu reclamo por despido injustificado PRESCRIBE EN DOS MESES desde que terminó el contrato (art. 864 del Código del Trabajo), y la Procuraduría del Trabajo te asiste de forma absolutamente gratuita, dentro y fuera del juzgado (art. 641).",
    materia: "Laboral",
    pasos: [
      {
        titulo: "Cuenta los días: tienes 2 meses",
        detalle:
          "El art. 864 es tajante: los derechos y acciones de los trabajadores para reclamar contra los despidos injustificados prescriben en el término de dos (2) meses, contados a partir de la terminación del contrato. Si te separaste tú por culpa del patrono (despido indirecto), el plazo es aún más corto: un (1) mes desde que el patrono dio el motivo (art. 865).",
      },
      {
        titulo: "Reúne y guarda tu evidencia hoy",
        detalle:
          "Contrato, recibos de pago, carné, mensajes o carta del despido, fecha de ingreso y de salida, y nombres de compañeros que puedan declarar. Necesitas también el promedio de tus salarios de los últimos 6 meses: es la base con la que se calcula la indemnización (art. 123 b).",
      },
      {
        titulo: "Calcula tu auxilio de cesantía (art. 120)",
        detalle:
          "De 3 a 6 meses trabajados: 10 días de salario. Más de 6 meses y menos de un año: 20 días. Más de un año: un (1) mes de salario por cada año, y proporcional si la fracción no llega al año. Tope general: 25 meses de salario — 15 meses si el patrono es una microempresa de hasta 10 empleados (art. 120-A). Se paga aunque al día siguiente entres a trabajar con otro patrono.",
      },
      {
        titulo: "Y tu preaviso, que depende de la antigüedad (art. 116)",
        detalle:
          "El aviso previo es de 24 horas si serviste menos de 3 meses; 1 semana de 3 a 6 meses; 2 semanas de 6 meses a 1 año; 1 mes de 1 a 2 años; y 2 meses si serviste más de 2 años. Si el patrono no te lo dio, debe pagarte una cantidad equivalente a tu salario durante ese término (art. 118).",
      },
      {
        titulo: "Ve a la Procuraduría del Trabajo — es gratis",
        detalle:
          "La Procuraduría del Trabajo de la Secretaría de Trabajo presta a los trabajadores asistencia «absolutamente gratuita», judicial o extrajudicial, y cubre expresamente las indemnizaciones por despido, el cobro de salarios, vacaciones, horas extras, trabajo nocturno, días feriados y descuentos indebidos (art. 641). Además puede citar al patrono para avenirlos (art. 639) y, si acepta la propuesta conciliatoria, se levanta acta y el asunto concluye (art. 640). La Inspectoría General de Trabajo también interviene conciliatoriamente en los conflictos obrero-patronales (art. 614.III).",
      },
      {
        titulo: "Si no hay acuerdo, demanda ante el Juzgado de Letras del Trabajo",
        detalle:
          "Para litigar se requiere abogado en ejercicio, con dos excepciones importantes: las partes pueden actuar por sí mismas en los juicios de única instancia y en las audiencias de conciliación (art. 711). Y ojo con un detalle del art. 638: la Procuraduría puede negarse a representarte si pretendes que concurra al juicio junto con defensores particulares — o vas con ella, o vas con tu abogado.",
        profesional: "abogado",
      },
    ],
    requisitos: [
      "DNI vigente",
      "Contrato o prueba de la relación laboral (recibos, carné, mensajes)",
      "Fecha de ingreso, fecha del despido y motivo alegado",
      "Comprobantes del salario de los últimos 6 meses (base del cálculo, art. 123 b)",
      "Carta o constancia del despido, si la hay, y testigos",
    ],
    tasa: "La asistencia de la Procuraduría del Trabajo es absolutamente gratuita (art. 641). Si contratas abogado particular, sus honorarios",
    tasaCorta: "Procuraduría gratuita",
    nota:
      "⏳ DOS MESES. Es el plazo del art. 864 y corre desde que terminó el contrato — es la razón #1 por la que se pierden reclamos legítimos en Honduras.\n\n✍️ Cuidado con el finiquito: el preaviso, el auxilio de cesantía y la indemnización no pueden ser objeto de compensación, venta o cesión, ni ser embargados, salvo en la mitad por pensiones alimenticias (art. 123 a). Y es absolutamente nula la cláusula del contrato que pretenda interrumpir la continuidad de tus servicios (art. 123 d): la antigüedad no se «reinicia» por firmar contratos nuevos.\n\n🩺 La continuidad del trabajo no se interrumpe por enfermedad, vacaciones, huelga o paros legales (art. 123 c).",
    fuenteUrl: "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20del%20Trabajo%20(mayo%202018).pdf",
    fuenteNombre: "Código del Trabajo (edición CEDIJ, mayo 2018) — Poder Judicial de Honduras",
  },
  /**
   * Reclamo de consumo (2026-08-31). Nace del caso más común que el portal no
   * cubría: comprar algo vencido o que sale malo. Todo lo que afirma sale de
   * dos fuentes estatales verificadas el 2026-08-31:
   *  · Reglamento de la Ley (Acuerdo 084-2021, La Gaceta 35,807 del 27-dic-2021),
   *    PDF con texto en el Tribunal Superior de Cuentas — arts. 28, 31, 50 y la
   *    tabla de infracciones del art. 99.
   *  · La ficha de la DGPC en la Secretaría de Desarrollo Económico (canales,
   *    requisitos y gratuidad de la denuncia).
   * ⚠️ La LEY misma (Decreto 24-2008) está escaneada sin capa de texto en el
   * TSC: por eso esta guía cita sus artículos SOLO cuando el Reglamento los
   * transcribe, y enlaza como fuente el Reglamento, que sí es legible.
   */
  {
    id: "reclamo-consumidor",
    nombre: "Me vendieron algo vencido o defectuoso",
    tipo: "proceso",
    institucionId: "dgpc",
    paraQuien:
      "Cualquiera que compró un producto vencido, que salió malo, o que pagó por un servicio que no le cumplieron",
    resumen:
      "Vender un producto después de su fecha de vencimiento es una infracción MUY GRAVE —de 6 a 10 salarios mínimos la primera vez— y denunciarlo no te cuesta nada. Dos cosas que casi nadie sabe: el establecimiento está obligado a tener un libro de quejas a la vista en la caja, y si lo que compraste tiene desperfecto de fábrica tienes 30 días para reclamar y ellos 15 para cambiártelo o devolverte el dinero.",
    materia: "Consumidor",
    pasos: [
      {
        titulo: "No botes nada: la factura es tu caso",
        detalle:
          "Guarda el producto tal como está, con su empaque y su fecha de vencimiento visible, y sobre todo la factura o el comprobante. La DGPC pide expresamente «fotocopia de tarjeta de identidad y facturas que sustenten la denuncia»: sin comprobante de compra la denuncia se sostiene mucho peor. Tómale fotos ese mismo día — al producto, a la etiqueta con la fecha y al ticket.",
      },
      {
        titulo: "Pide el libro de quejas ahí mismo, antes de irte",
        detalle:
          "Todo establecimiento debe tener un libro de quejas, físico o digital, para que dejes asentada tu reclamación (art. 28 del Reglamento). Y no puede estar guardado en una oficina: el art. 31 obliga a exhibirlo «en las cercanías de los lugares de cobranza o atención al cliente», con un cartel en la línea de caja que avise que existe. Si te dicen que no hay o que no te lo pueden dar, eso también es denunciable — anota la hora y con quién hablaste.",
      },
      {
        titulo: "Si el producto salió defectuoso: 30 días tuyos, 15 días suyos",
        detalle:
          "Cuando reclamas al vendedor por un desperfecto de fábrica dentro de los treinta (30) días calendario de la compra, el proveedor debe darte el cambio en un plazo de quince (15) días calendario, por otro producto de idénticas características o de distintas del mismo valor, «en su defecto la devolución del dinero» (art. 50 del Reglamento). Ojo: no aplica si la falla la causaste tú.",
      },
      {
        titulo: "Producto vencido: es de las infracciones más graves que hay",
        detalle:
          "«Ofrecer o vender bienes con posterioridad a su fecha de vencimiento» está clasificado como infracción MUY GRAVE, con sanción de 6 a 10 salarios mínimos por primera vez (tabla de infracciones del Reglamento, referida al art. 20 numeral 13 de la Ley). Para graduar la multa se toma en cuenta el tipo y la cantidad de producto, el daño que pueda causar a la salud y la capacidad económica del establecimiento (art. 99). No es un descuido menor: si el producto es alimento o medicina, dilo en la denuncia.",
      },
      {
        titulo: "Denuncia ante la DGPC — es gratis y tienes cuatro vías",
        detalle:
          "La Dirección General de Protección al Consumidor recibe la denuncia sin costo: «este trámite no tiene costo para el ciudadano». Puedes hacerlo por la línea gratuita 115 (fijo o celular), por WhatsApp al 8863-1086, en línea desde la plataforma SDE-SOL, o presencialmente en sus oficinas. Lleva copia de tu identidad y las facturas, tus datos de contacto, los datos del establecimiento denunciado, el relato de lo que pasó y qué pides concretamente (cambio, devolución del dinero, o sanción).",
      },
      {
        titulo: "Si el monto es alto o hubo daño a la salud, habla con un abogado",
        detalle:
          "La denuncia administrativa busca sancionar al proveedor y que te repongan lo tuyo, pero no siempre resuelve una indemnización por el daño causado. Si el producto te enfermó, si el monto es importante, o si el establecimiento se niega después de la resolución, un abogado de consumo o civil te dice si conviene la vía judicial además de la administrativa.",
        profesional: "abogado",
      },
    ],
    requisitos: [
      "Fotocopia de tu tarjeta de identidad",
      "Factura o comprobante que sustente la denuncia",
      "El producto, con su empaque y la fecha de vencimiento visible",
      "Tus datos: nombre, identidad, dirección y teléfono",
      "Datos del establecimiento denunciado: nombre, dirección y teléfono",
      "Relato de lo ocurrido y qué pides (cambio, devolución o sanción)",
    ],
    tasa: "Gratuito. La DGPC lo dice expresamente: «este trámite no tiene costo para el ciudadano». Tampoco cuesta nada usar el libro de quejas del establecimiento.",
    tasaCorta: "Gratuito",
    nota: "El texto de la Ley de Protección al Consumidor (Decreto 24-2008) solo está publicado como PDF escaneado, así que esta guía cita sus artículos a través del Reglamento vigente (Acuerdo 084-2021), que sí es consultable.",
    fuenteUrl: "https://www.tsc.gob.hn/web/leyes/Acuerdo-084-2021.pdf",
    fuenteNombre:
      "Reglamento de la Ley de Protección al Consumidor (Acuerdo 084-2021), La Gaceta 35,807 — Tribunal Superior de Cuentas · canales y requisitos: DGPC (Secretaría de Desarrollo Económico)",
  },
  {
    id: "pension-alimenticia",
    nombre: "Pensión alimenticia: cómo pedirla o exigir su pago",
    tipo: "proceso",
    institucionId: "poder-judicial",
    paraQuien: "Madres, padres o tutores que necesitan fijar o cobrar la pensión de un hijo",
    resumen:
      "Es el proceso más accesible del sistema hondureño y casi nadie lo sabe: la demanda de alimentos se puede presentar VERBALMENTE ante el juzgado (art. 207-C del Código de Familia), con la sola partida de nacimiento el juez puede fijar pensión provisional (art. 210), y desde que admite la demanda puede avisar a migración para que el demandado no salga del país sin garantía (art. 210-A).",
    materia: "Familia",
    pasos: [
      {
        titulo: "Presenta la demanda — puede ser hablada",
        detalle:
          "La demanda de alimentos y su contestación pueden presentarse verbalmente o por escrito ante el juzgado competente. Si es verbal, el secretario levanta un acta que firman él y las partes; si es escrita y tiene defectos, el propio secretario la corrige en el acto. Y en el juicio de alimentos NO se admiten excepciones dilatorias — no hay forma de estirarlo con tecnicismos (art. 207-C).",
      },
      {
        titulo: "Si no tienes los documentos, el juzgado te los consigue gratis",
        detalle:
          "Si tu condición económica lo requiere y falta un documento que no estás en posibilidad de presentar, el juez —a solicitud tuya o de oficio— ordena a la autoridad correspondiente que lo expida GRATUITAMENTE y lo remita al despacho (art. 207-C). Quien demanda en favor de un menor puede ser su representante o incluso un simple guardador, probando esa circunstancia (art. 221).",
      },
      {
        titulo: "Pide la pensión provisional desde el primer día",
        detalle:
          "Con la sola presentación de la partida de nacimiento el juez puede acordar una pensión provisional dentro del trámite (art. 210). Y desde la admisión de la demanda, si hay prueba siquiera sumaria de la capacidad económica del demandado y de la obligación, puede ordenar alimentos provisionales y dar aviso inmediato a las autoridades migratorias para que el demandado no se ausente del país sin prestar garantía suficiente (art. 210-A).",
      },
      {
        titulo: "¿Y si dice que no gana nada? El juez tiene tres salidas",
        detalle:
          "(1) Ordenar al patrono que certifique los ingresos del demandado, y el patrono debe remitirla en 2 días hábiles so pena de responsabilidad penal. (2) Pedir a la administración tributaria la constancia de su última declaración de ingresos. (3) Si aun así no se acredita, fijarlos por estudio socioeconómico —patrimonio, posición social, costumbres— y, en todo caso, PRESUMIR que devenga al menos el salario mínimo promedio vigente de la actividad a la que se dedique (art. 207-D).",
      },
      {
        titulo: "Sabe qué incluye la pensión y cómo se paga",
        detalle:
          "Alimentos es todo lo indispensable para el desarrollo integral: sustento, habitación, vestido, asistencia médica, formación integral y educación (art. 207-A). También cubre los gastos del embarazo, el parto y sus consecuencias inmediatas (art. 207-B). Se fija en proporción a los recursos de quien la debe y las circunstancias de quien la recibe, y se paga por cuotas semanales, quincenales o mensuales ANTICIPADAS (art. 207). El monto puede modificarse si cambian las circunstancias de cualquiera de los dos (art. 220).",
      },
      {
        titulo: "Si no cumple: las consecuencias que la ley ya le impone",
        detalle:
          "Mientras el deudor no cumpla ni se allane a cumplir, NO será escuchado en su reclamación sobre la custodia y el cuidado personal del niño ni en el ejercicio de sus derechos sobre él (art. 207-F). Si estando ausente o presente rehúsa entregar los alimentos, responde por las deudas que cónyuge e hijos contraigan para cubrir esa necesidad, en la cuantía estrictamente necesaria (art. 216). Y si no está acreditada la paternidad, el padre está obligado a someterse a la prueba de ADN (art. 207-B).",
      },
    ],
    requisitos: [
      "Partida de nacimiento del menor (basta para pedir la pensión provisional, art. 210)",
      "DNI del solicitante y prueba de la representación o guarda, si demandas por un menor",
      "Datos del obligado: dónde trabaja, ingresos conocidos, bienes",
      "Comprobantes de los gastos del menor (educación, salud, alimentación)",
      "Si estás en imposibilidad económica de conseguir algún documento, pídelo al juzgado: se ordena su expedición gratuita",
    ],
    tasa: "El Código no fija tasa por el juicio de alimentos; la demanda puede presentarse verbalmente y sin escrito de abogado. Si contratas abogado particular, sus honorarios",
    tasaCorta: "Sin tasa judicial",
    nota:
      "⏱️ No se pueden reclamar alimentos pasados, salvo los SEIS MESES anteriores a la demanda, y solo si el alimentario tuvo que contraer deudas para vivir (art. 215). Demorar el reclamo cuesta dinero real.\n\n🚫 El derecho a pedir alimentos no puede renunciarse, cederse ni transmitirse por causa de muerte (art. 209): ningún «acuerdo» en el que la madre o el padre renuncia a la pensión del hijo es válido.\n\n🎓 La obligación no termina automáticamente a los 18: sigue si el hijo no ha terminado estudios superiores iniciados durante la minoría de edad y obtiene buenos rendimientos, o si es inválido (art. 217.6). Y perder o tener suspendida la patria potestad NO extingue la obligación alimentaria — solo la extingue la adopción por otra persona (art. 207-G).\n\n👨‍👩‍👧 Si hay varios obligados, el pago se reparte en proporción a su patrimonio, y en caso de urgencia el juez puede ordenar que uno lo cubra provisionalmente (art. 218).",
    fuenteUrl:
      "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20de%20Familia%20(Actualizado%20con%20Reformas%20Ley%20de%20Adopciones).pdf",
    fuenteNombre: "Código de Familia (edición CEDIJ, actualizada con reformas) — Poder Judicial de Honduras",
  },
  {
    id: "divorcio-ciudadano",
    nombre: "Divorcio: por mutuo acuerdo o por causal",
    tipo: "proceso",
    institucionId: "poder-judicial",
    paraQuien: "Personas casadas que quieren disolver el matrimonio",
    resumen:
      "Si ambos están de acuerdo y ya pasaron 2 años del matrimonio, el divorcio por mutuo consentimiento es asombrosamente rápido: sin hijos menores, el juez cita a audiencia el MISMO día de la solicitud y dicta sentencia de inmediato (arts. 243-245 del Código de Familia). Con hijos menores hay una segunda audiencia a los 15 días. Sin acuerdo, hay que invocar una causal y el reloj de un año empieza a correr.",
    materia: "Familia",
    pasos: [
      {
        titulo: "Confirma que califican para el mutuo consentimiento",
        detalle:
          "Se exige que hayan transcurrido dos (2) años desde que se celebró el matrimonio y que ambos cónyuges sean mayores de edad (art. 243). Si no se cumple, el camino es el divorcio contencioso por causal.",
      },
      {
        titulo: "Presenten la solicitud personalmente y por escrito",
        detalle:
          "Ante el juez competente del domicilio, acompañando: (1) certificaciones del Registro Civil que acrediten su edad y su calidad de casados, (2) certificación de las actas de nacimiento de los hijos menores, si los hay, y (3) la propuesta de convenio regulador, cuyo contenido debe ajustarse a lo que establece el Código Procesal Civil (art. 244).",
        profesional: "abogado",
      },
      {
        titulo: "Audiencia el mismo día — y sentencia inmediata si no hay hijos menores",
        detalle:
          "En la misma fecha de presentación, el juez los cita a una audiencia que se celebra de inmediato, donde les hace las reflexiones que considere oportunas sobre las consecuencias del divorcio. Si insisten y NO hay hijos menores ni incapacitados, dicta la sentencia en forma inmediata, pronunciándose además sobre el convenio regulador (art. 245).",
      },
      {
        titulo: "Con hijos menores: segunda audiencia a los 15 días",
        detalle:
          "El juez cita a una nueva audiencia que se celebra en quince (15) días. Dentro de ese plazo el Ministerio Público debe rendir opinión razonada sobre el convenio regulador, y el juez oirá a los hijos menores si tuvieren suficiente juicio (art. 246). Después dicta sentencia en la misma audiencia o dentro de los 5 días siguientes (art. 247).",
      },
      {
        titulo: "Inscripción: la sentencia no basta por sí sola",
        detalle:
          "Al declarar disuelto el matrimonio, el juez ordena inscribir la sentencia en el Registro Civil correspondiente y, cuando el convenio reparte inmuebles, mandar a inscribir la escritura de división en el Registro de la Propiedad Inmueble (art. 247). Sin esas inscripciones el divorcio no surte todos sus efectos frente a terceros.",
      },
      {
        titulo: "Si no hay acuerdo: causal, plazo y cónyuge inocente",
        detalle:
          "Las causales del art. 238 son ocho, entre ellas la infidelidad; los malos tratos físicos, psicológicos, sexuales, patrimoniales o económicos contra el cónyuge o los hijos; el abandono manifiesto por más de 2 años sin comunicación; la negativa injustificada a cumplir los deberes de asistencia, educación y alimentación; y la separación de hecho durante 2 años consecutivos. La acción solo la puede deducir el cónyuge inocente, salvo en la separación de hecho, que la puede pedir cualquiera (art. 239).",
      },
    ],
    requisitos: [
      "Certificaciones del Registro Civil de edad y calidad de casados",
      "Certificación de actas de nacimiento de los hijos menores, si los hay",
      "Propuesta de convenio regulador conforme al Código Procesal Civil",
      "DNI de ambos cónyuges",
      "Presentación personal y por escrito ante el juez del domicilio",
    ],
    tasa: "El Código no fija tasa por el proceso; los honorarios del abogado son el costo real",
    tasaCorta: "Sin tasa judicial",
    nota:
      "⏳ El divorcio contencioso tiene plazo: no puede entablarse después de UN (1) AÑO desde que se tuvo conocimiento de la causa, salvo infidelidad, malos tratos, abandono y adicciones (numerales 1, 2, 4 y 6), que pueden alegarse en cualquier tiempo mientras persistan los hechos (art. 240).\n\n🚫 No podrá declararse el divorcio si hubo reconciliación o vida marital entre los cónyuges, sea después de los hechos que lo autorizaban o después de la demanda (art. 241).\n\n👶 Presentada la demanda, el juez dicta provisionalmente las providencias necesarias para proteger los derechos de los hijos (art. 253). Y si la cónyuge descubre estar embarazada, debe comunicarlo por escrito en 7 días a su cónyuge o al juez (art. 242-A).\n\n💍 Si el convenio no se aprueba en todo o en parte, hay 10 días para presentar uno nuevo y el juez resuelve en 3 días (art. 248). El cónyuge inocente goza de pensión mientras esté imposibilitado de agenciarse ingresos y no contraiga nuevo matrimonio (art. 255).",
    fuenteUrl:
      "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20de%20Familia%20(Actualizado%20con%20Reformas%20Ley%20de%20Adopciones).pdf",
    fuenteNombre: "Código de Familia (edición CEDIJ, actualizada con reformas) — Poder Judicial de Honduras",
  },
  {
    id: "herencia-sucesion",
    nombre: "Herencia: cómo poner los bienes a tu nombre",
    tipo: "proceso",
    institucionId: "poder-judicial",
    paraQuien: "Familiares que heredan una casa, terreno, vehículo o cuentas de una persona fallecida",
    resumen:
      "Ser el hijo o el cónyuge no te hace dueño: hasta que hay una sentencia de declaratoria de herederos inscrita y los bienes se registran, la casa sigue a nombre del fallecido y no se puede vender ni hipotecar. La declaratoria se tramita todavía bajo el Código de Procedimientos Civiles de 1906, porque Honduras no ha aprobado su Ley de Jurisdicción Voluntaria (art. 919 del Código Procesal Civil).",
    materia: "Civil",
    pasos: [
      {
        titulo: "Reúne los documentos del fallecido y del vínculo",
        detalle:
          "Certificado de defunción, las partidas de nacimiento o de matrimonio que prueben el parentesco, y los títulos de los bienes: escrituras, folio real, matrícula del vehículo. Pide en el Instituto de la Propiedad la certificación íntegra del inmueble (L 300.00) para saber exactamente qué está inscrito y a nombre de quién.",
      },
      {
        titulo: "Verifica si dejó testamento",
        detalle:
          "Con testamento la sucesión es testamentaria y sigue lo que dispuso el causante; sin testamento es abintestato y la ley define quiénes heredan. Esa distinción se arrastra en todos los trámites posteriores: el Instituto de la Propiedad pide expresamente el testamento cuando la tradición de dominio es testamentaria.",
      },
      {
        titulo: "Tramita la declaratoria de herederos",
        detalle:
          "Es un acto de jurisdicción voluntaria. Como aún no existe la Ley de Jurisdicción Voluntaria, siguen vigentes las disposiciones del Código de Procedimientos Civiles de 1906, Libro IV «Actos Judiciales no Contenciosos» (art. 919 del CPC de 2018). El resultado es la sentencia de declaratoria de herederos, que es el documento con el que se mueve todo lo demás.",
        profesional: "abogado",
      },
      {
        titulo: "Inscribe la posesión efectiva de herencia en el Instituto de la Propiedad",
        detalle:
          "El trámite registral se llama posesión efectiva de herencia y cuesta L 200.00: se presenta la certificación de la sentencia original más una copia legible, sea testamentaria o abintestato. A partir de ahí el inmueble queda a nombre de los herederos.",
      },
      {
        titulo: "Si hay vehículo, tiene su propia ruta",
        detalle:
          "En el traspaso por herencia NO se presenta formulario de traspaso: se acompaña la certificación de la sentencia de declaratoria de herederos (o instrumento público equivalente) debidamente inscrita en el Registro de Sentencias del Instituto de la Propiedad. El trámite cuesta L 300.00 y el cambio del kit de placas se hace en el mismo procedimiento, marcando ambos trámites en el formulario.",
      },
      {
        titulo: "Para vender: primero a nombre de todos, después a quien decidan",
        detalle:
          "Si los herederos quieren pasar el bien a uno de ellos o a un tercero, primero deben inscribirlo a nombre de todos mediante una cesión de derechos y después suscribir la tradición de dominio a favor de la persona designada. Saltarse ese orden es el error que traba las ventas de bienes heredados.",
      },
      {
        titulo: "Si el bien no lo posee nadie, existe una vía más rápida",
        detalle:
          "El Código Procesal Civil prevé un proceso abreviado para que el juzgado ponga en posesión de los bienes a quien los adquirió por herencia, siempre que no estén siendo poseídos por nadie a título de dueño o usufructuario (art. 601.1). La demanda va con el documento que acredite fehacientemente la sucesión y una lista de testigos que declaren esa ausencia de poseedor (art. 602). El juzgado los oye, dicta auto y lo publica por edictos en la sede del tribunal y en lugares públicos del municipio, a costa del demandante, dando 30 días a quien crea tener mejor derecho; si nadie comparece, se confirma la posesión (art. 606).",
      },
    ],
    requisitos: [
      "Certificado de defunción",
      "Partidas de nacimiento o matrimonio que prueben el parentesco",
      "Testamento, si existe",
      "Escrituras, folio real o certificación íntegra de los inmuebles (L 300.00 en el IP)",
      "Sentencia de declaratoria de herederos, certificada — original y copia legible",
      "Para vehículos: esa misma certificación inscrita en el Registro de Sentencias del IP",
    ],
    tasa: "Posesión efectiva de herencia en el Registro Inmueble: L 200.00 · Traspaso de vehículo por herencia: L 300.00 · Certificación íntegra del inmueble: L 300.00 · Más los honorarios del abogado o notario que tramite la declaratoria",
    tasaCorta: "L 200 + L 300",
    nota:
      "⏳ Dejar la herencia sin tramitar por años multiplica el problema: se suman herederos (los que van falleciendo dejan a su vez sus propios herederos), se pierden documentos y el inmueble queda inmovilizado — no se puede vender ni hipotecar.\n\n📜 Dato de contexto: la declaratoria de herederos se rige todavía por un código de 1906 porque la Ley de Jurisdicción Voluntaria que el CPC de 2018 anunció nunca se aprobó (art. 919). Por eso conviene un profesional que conozca ese procedimiento antiguo.",
    fuenteUrl: "https://www.poderjudicial.gob.hn/Cedij/Cdigos/Codigo%20Procesal%20Civil%20(2018).pdf",
    fuenteNombre:
      "Código Procesal Civil (edición CEDIJ, 2018), arts. 601-606 y 919 — Poder Judicial · tasas del Instituto de la Propiedad",
  },
];

/**
 * Rutas de trámites — cómo se agrupan en la home ciudadana (decisión Wesley
 * 2026-08-30, tras comparar tres estructuras en un prototipo).
 *
 * Agrupan por **situación de vida**, no por institución: nadie busca "un
 * trámite de ONCAE", busca "voy a abrir un negocio". Y llevan **orden**,
 * porque en la vida real lo tienen — el RTN habilita el CAI y el CAI el
 * permiso de operación. Eso es justo lo que no se encuentra googleando: hay
 * que reconstruirlo leyendo tres portales del Estado.
 *
 * ⚠️ Un trámite fuera de toda ruta DESAPARECE de la home. Hay un test que lo
 * impide (`tramites.test.ts`): cada guía de tipo "tramite" pertenece a
 * exactamente una ruta.
 */
export interface PasoRuta {
  tramiteId: string;
  /** Por qué está aquí y en este lugar del orden. */
  nota: string;
  /** Solo aplica a algunos giros — se dibuja aparte, no como paso obligado. */
  condicional?: boolean;
}

export interface RutaTramite {
  id: string;
  etiqueta: string;
  titulo: string;
  intro: string;
  pasos: PasoRuta[];
}

export const RUTAS_TRAMITE: RutaTramite[] = [
  {
    id: "negocio",
    etiqueta: "Abrir un negocio",
    titulo: "De no tener nada a poder facturar",
    intro:
      "Van en este orden y cada uno pide el anterior. Los dos últimos, solo si tu giro los exige.",
    pasos: [
      { tramiteId: "abrir-rtn", nota: "Sin esto no puedes hacer lo que sigue" },
      { tramiteId: "facturacion-cai", nota: "Te habilita a emitir factura válida" },
      { tramiteId: "permiso-operacion", nota: "Lo pide tu alcaldía, y se renueva cada año" },
      { tramiteId: "licencia-sanitaria", nota: "Si manejas alimentos o bebidas", condicional: true },
      { tramiteId: "licencia-ambiental", nota: "Si tu actividad impacta el ambiente", condicional: true },
    ],
  },
  {
    id: "comprar",
    etiqueta: "Comprar o vender algo",
    titulo: "Que lo que compraste quede a tu nombre",
    intro:
      "Pagar no es ser dueño: mientras no se inscriba, el bien sigue registrado a nombre de otro.",
    pasos: [
      { tramiteId: "traspaso-vehiculo", nota: "Vehículos, en el Registro Vehicular" },
      { tramiteId: "tradicion-dominio", nota: "Casas y terrenos, en el Registro Inmueble" },
    ],
  },
  {
    id: "crecer",
    etiqueta: "Formalizar y vender al Estado",
    titulo: "De comerciante individual a empresa proveedora",
    intro:
      "El Estado solo compra a proveedores inscritos, y para inscribirte necesitas estar constituido.",
    pasos: [
      { tramiteId: "constituir-sociedad", nota: "Ante notario y Registro Mercantil" },
      { tramiteId: "inscripcion-oncae", nota: "Te habilita a participar en licitaciones" },
    ],
  },
];

export function getTramite(id: string): Tramite | undefined {
  return TRAMITES.find((t) => t.id === id);
}

/** Sin tildes ni mayúsculas: la gente escribe "tramite" y "rtn" en minúscula. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Busca una guía por lo que la persona escribiría. Mira `nombre`, `paraQuien`
 * y `resumen` —no los pasos— porque el buscador de Inicio muestra el resumen
 * como respuesta: si acertara por una palabra enterrada en el paso 4, el
 * resultado se vería sin relación con lo buscado.
 *
 * Vive aquí y no en la pantalla porque la usan dos (Inicio y Trámites): con
 * una copia en cada una, arreglar un fallo de búsqueda solo lo arreglaría en
 * la mitad de los sitios (§4.4).
 */
export function buscarGuias(termino: string): Tramite[] {
  const t = normalizar(termino.trim());
  if (!t) return [];
  return TRAMITES.filter((g) =>
    normalizar(`${g.nombre} ${g.paraQuien} ${g.resumen}`).includes(t),
  );
}

/**
 * Dónde cae una guía dentro de su ruta, si pertenece a alguna.
 *
 * `RUTAS_TRAMITE` ya sabe que el RTN habilita el CAI y el CAI el permiso de
 * operación — ese encadenamiento es "lo que no se encuentra googleando" (§1.3)
 * y hasta ahora solo se veía en la home pública: quien abría la guía desde el
 * portal terminaba el trámite sin enterarse de que había un siguiente.
 */
export function getContextoRuta(tramiteId: string):
  | {
      ruta: RutaTramite;
      indice: number;
      total: number;
      anterior?: { tramite: Tramite; nota: string };
      siguiente?: { tramite: Tramite; nota: string; condicional: boolean };
    }
  | undefined {
  for (const ruta of RUTAS_TRAMITE) {
    const indice = ruta.pasos.findIndex((p) => p.tramiteId === tramiteId);
    if (indice < 0) continue;
    const enlazar = (i: number) => {
      const paso = ruta.pasos[i];
      if (!paso) return undefined;
      const tramite = TRAMITES.find((t) => t.id === paso.tramiteId);
      return tramite ? { tramite, nota: paso.nota, condicional: paso.condicional === true } : undefined;
    };
    return {
      ruta,
      indice,
      total: ruta.pasos.length,
      anterior: enlazar(indice - 1),
      siguiente: enlazar(indice + 1),
    };
  }
  return undefined;
}

/** Guías de una materia — conecta una consulta del consultorio con el contenido
 *  verificado que habla de su tema. */
export function guiasDeMateria(materia: Materia): Tramite[] {
  return TRAMITES.filter((t) => t.materia === materia);
}

/** Busca una institución por sigla, nombre o lo que hace — mismo criterio que
 *  `buscarGuias`: la gente escribe "impuestos", no "SAR". */
export function buscarInstituciones(termino: string): Institucion[] {
  const t = normalizar(termino.trim());
  if (!t) return INSTITUCIONES;
  return INSTITUCIONES.filter((i) =>
    normalizar(`${i.sigla} ${i.nombre} ${i.descripcion}`).includes(t),
  );
}

/** Las materias que cubre una institución, deducidas de sus trámites. */
export function materiasDeInstitucion(institucionId: string): Materia[] {
  return [
    ...new Set(TRAMITES.filter((t) => t.institucionId === institucionId).map((t) => t.materia)),
  ];
}

export function getInstitucion(id: string): Institucion | undefined {
  return INSTITUCIONES.find((i) => i.id === id);
}