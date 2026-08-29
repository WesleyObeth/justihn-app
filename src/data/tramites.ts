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