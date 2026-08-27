import type { Sentencia } from "@/types/dominio";

/**
 * Seed del corpus de jurisprudencia — SENTENCIAS REALES.
 *
 * Muestra de 12 sentencias del piloto del corpus (2026-08-26): extraídas de la
 * API oficial del PJ (`sij.poderjudicial.gob.hn:5006/api`) con su resumen del
 * CEDIJ, órgano, magistrado y fallo reales. El extracto es un fragmento del
 * texto oficial. Generado por `generar-seed.mjs` — no editar a mano: regenerar.
 *
 * TODO(data): reemplazar por la tabla `sentencias` de Supabase alimentada por
 * el scraper de escala (20,202 sentencias; ver justihn/CLAUDE.md backlog #3).
 */
export const SENTENCIAS: Sentencia[] = [
  {
      "id": "cl-528-24",
      "expediente": "CL-528-24",
      "materia": "Laboral",
      "organo": "Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés",
      "fecha": "22 may 2026",
      "fechaIso": "2026-05-22",
      "titulo": "Despido Injustificado Pago de Prestaciones e Indemnizaciones Laborales",
      "resumen": "Segunda instancia confirmó con lugar demanda laboral de emplazamiento para que el patrono pruebe la justa causa del despido, caso contrario sea condenado al pago de prestaciones sociales, más a título de daños y perjuicios el pago de los salarios dejados de percibir desde la fecha del despido injusto hasta la fecha en que deba…",
      "ponente": "Mag. Odalis Aleyda Nájera Medina",
      "fallo": "No ha lugar",
      "extracto": "Recurrente Estado de Honduras/Secretaria de Estado en el Despacho de Salud Recurrido Wilson Pablo Henriquez Martinez Tribunal de procedencia Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés Fecha de sentencia recurrida 26-06-2024 Motivo de la casación Violación de ley Falta de aplicación Interpretación errónea Hechos relevantes Segunda instancia confirmó con lugar demanda laboral de emplazamiento para que el patrono pruebe la justa causa del despido, caso contrario sea condenado al pago de prestaciones sociales, más a título de daños y perjuicios el pago de los salarios dejados de percibir desde la fecha del despido injusto hasta la fecha en que deba quedar firme la sentencia definitiva. Anonimizada No Fallo No ha lugar Tesauro Derecho Procesal Laboral Técnica del Recurso de Casación Indicación del precepto legal sustantivo de Orden Nacional No es suficiente la simple designación de la norma ¿Para efectos del recurso recurso de casación laboral que normas se consideran sustantivos? Respuesta al problema jurídico La que crea, reconoce, consagra derechos y obligaciones correlativas o en su defecto los extingue, por lo que la norma sustancial debe estar plenamente singularizada en el motivo y su adecuada explicación del concepto de la violación para que así resulte ser una proposición jurídica completa.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "cl-181-24",
      "expediente": "CL-181-24",
      "materia": "Laboral",
      "organo": "Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés",
      "fecha": "25 feb 2026",
      "fechaIso": "2026-02-25",
      "titulo": "Simulación de contratos por servicios profesionales Derecho a la permanencia",
      "resumen": "Segunda instancia confirmó con lugar la demanda ordinaria laboral para que en sentencia definitiva se declare la nulidad de la simulación de unos contratos de servicios profesionales, por ende que se declare por tiempo indefinido la relación laboral originada por la suscripción de varios contratos continuos e ininterrumpidos,…",
      "ponente": "Mag. Anny Belinda Ochoa Medrano",
      "fallo": "No ha lugar",
      "extracto": "Recurrente Estado de Honduras/Instituto Nacional de Migración Recurrido Elfy Albertina Paredes Sabillon y Noe Alejandro Gutierrez Irias Tribunal de procedencia Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés Fecha de sentencia recurrida 14-11-2023 Motivo de la casación Violación de ley Falta de aplicación Hechos relevantes Segunda instancia confirmó con lugar la demanda ordinaria laboral para que en sentencia definitiva se declare la nulidad de la simulación de unos contratos de servicios profesionales, por ende que se declare por tiempo indefinido la relación laboral originada por la suscripción de varios contratos continuos e ininterrumpidos, en aplicación estricta de lo preceptuado en el artículo 47 del Código del Trabajo en consecuencia conceder derechos que ostentan los empleados con carácter permanente.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "cl-15-24",
      "expediente": "CL-15-24",
      "materia": "Laboral",
      "organo": "Corte de Apelaciones del Trabajo de Tegucigalpa, Francisco Morazán",
      "fecha": "24 feb 2026",
      "fechaIso": "2026-02-24",
      "titulo": "Reintegro a su puesto de trabajo Derecho a la permanencia Reconocimiento e inscripción…",
      "resumen": "Segunda instancia confirmó los numerales 1, 3 y 4 demanda ordinaria laboral para el reintegro al puesto de trabajo en iguales o mejores condiciones por despido directo, ilegal e injustificado; reconocimiento de la permanencia en el cargo de oficial contable mediante Acuerdo en virtud de haberse desempeñado en el mismo puesto de…",
      "ponente": "Mag. Odalis Aleyda Nájera Medina",
      "fallo": "Nulidad Absoluta",
      "extracto": "Recurrente Estado de Honduras/Secretaria de Estado en el Despacho de Salud Recurrido Liliana Julissa Amador Castellanos Tribunal de procedencia Corte de Apelaciones del Trabajo de Tegucigalpa, Francisco Morazán Fecha de sentencia recurrida 29-08-2023 Hechos relevantes Segunda instancia confirmó los numerales 1, 3 y 4 demanda ordinaria laboral para el reintegro al puesto de trabajo en iguales o mejores condiciones por despido directo, ilegal e injustificado; reconocimiento de la permanencia en el cargo de oficial contable mediante Acuerdo en virtud de haberse desempeñado en el mismo puesto de trabajo de manera continua e ininterrumpida desde el día 01 de octubre del 2014 hasta la fecha, de conformidad con los artículos 24, 47, 48 y 52 del Código del Trabajo; reconocimiento de la relación laboral de forma indefinida al igual que el reconocimiento de la antigüedad en el cargo de oficial contable a partir de la firma del primer contrato es decir desde el día 01 de octubre del 2014; pago de la bonificación de vacaciones de los dos últimos años (2017-2019), en virtud que el objeto de la naturaleza de su puesto de trabajo era permanente; reconocimiento e inscripción al IHSS e INJUPEMP de acuerdo con el capítulo VI (seguridad social) de la carta magna y Ley Marco del Sistema de Protección Social; pago de los derechos Anonimizada No Fallo Nulidad Absoluta Tesauro Derecho Procesal Laboral Acceso a la Justicia Derecho fundamental que tiene toda persona La administración de justicia debe\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "cl-74-24",
      "expediente": "CL-74-24",
      "materia": "Laboral",
      "organo": "Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés",
      "fecha": "9 feb 2026",
      "fechaIso": "2026-02-09",
      "titulo": "Pago de derechos adquiridos Cesantia",
      "resumen": "Segunda instancia confirmó declarando sin lugar la demanda laboral para el pago del 75% de auxilio de cesantía que estable el artículo 120 inicio g) del Código del Trabajo.",
      "ponente": "Mag. Odalis Aleyda Nájera Medina",
      "fallo": "No ha lugar",
      "extracto": "Recurrente Glenda Xiomara Fuentes Oseguera, Emilson Fernely Morales Fuentes, Tomas Alejandro Morales Fuentes, Melvin Joel Morales Fuentes, Xiomara Alejandra Morales Fuentes, Quienes Actúan En Su Condición De Cónyuge E Hijos Respectivamente Del Difunto Señor Tomas Fernely Morales Medina (q.d.d.g.) Recurrido Finca Devonia S.A Tribunal de procedencia Corte de Apelaciones del Trabajo de San Pedro Sula, Cortés Fecha de sentencia recurrida 09-01-2024 Motivo de la casación Violación de ley Falta de aplicación Infracción de ley sustantiva laboral Por error de hecho derivado de falta de apreciación de determinada prueba Hechos relevantes Segunda instancia confirmó declarando sin lugar la demanda laboral para el pago del 75% de auxilio de cesantía que estable el artículo 120 inicio g) del Código del Trabajo.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "cc-249-22",
      "expediente": "CC-249-22",
      "materia": "Civil",
      "organo": "Corte Suprema de Justicia",
      "fecha": "10 mar 2026",
      "fechaIso": "2026-03-10",
      "titulo": "Causal de inadmisibilidad",
      "resumen": "Se interpuso Demanda vía proceso ordinario para el pago de una cantidad de dinero, declarándose con lugar se condena a la cantidad de seiscientos ochenta y seis mil seiscientos ochenta y tres Lempiras sesenta y dos centavos de Lempiras (L 686,683.62) cantidad que adeuda por concepto de arrendamiento de espacios publicitarios en…",
      "ponente": "Mag. Gaudy Alejandra Bustillo Martínez",
      "fallo": "Inadmisibilidad",
      "extracto": "Recurrente Sociedad Mercantil Denominada Aerolíneas Sosa S.A. de C.V Recurrido Corte Primera de Apelaciones de lo Civil del Departamento de Francisco Morazán Tribunal de procedencia No se indica Fecha de sentencia recurrida 07-06-2022 Motivo de la casación Impugnación por aplicación e interpretación de normas procesales La forma y contenido de la sentencia Hechos relevantes Se interpuso Demanda vía proceso ordinario para el pago de una cantidad de dinero, declarándose con lugar se condena a la cantidad de seiscientos ochenta y seis mil seiscientos ochenta y tres Lempiras sesenta y dos centavos de Lempiras (L 686,683.62) cantidad que adeuda por concepto de arrendamiento de espacios publicitarios en los cuatro aeropuertos de Honduras, quinientos ocho mil quinientos dieciséis Lempiras con veintiocho centavos de Lempiras (L 508,516.28) en concepto de intereses haciendo un total de un millón ciento noventa y cinco mil ciento noventa y nueve Lempiras con noventa centavos ( L.1,195,199.90) más los intereses que se generen hasta la ejecución de la sentencia. Sin lugar el recurso de Apelación y Casación.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "cc-39-22",
      "expediente": "CC-39-22",
      "materia": "Civil",
      "organo": "Corte Suprema de Justicia",
      "fecha": "4 feb 2026",
      "fechaIso": "2026-02-04",
      "titulo": "Carta de porte Causal de inadmisibilidad Contrato de Adhesión",
      "resumen": "En primera instancia se condena a la empresa transportista al pago de la suma de mil dólares distribuidos entre los demandantes, suma que se encuentra establecida en el contrato de transporte Bill Of Lading o conocimientos de embarque. Confirmado en segunda instancia. El recurrente alega que el pago ordenado ni siquiera…",
      "ponente": "Mag. Rubenia Esperanza Galeano Barralaga ",
      "fallo": "Inadmisibilidad",
      "extracto": "Recurrente Roger Alexander Portillo Nolasco y de la Sociedad Mercantil USA Honduras Express, S. de R.L Recurrido Chiquita Logistic Services Honduras, S. De R.l. Tribunal de procedencia No se indica Fecha de sentencia recurrida 15-11-2021 Motivo de la casación Impugnación por aplicación e interpretación de las normas de derecho Hechos relevantes En primera instancia se condena a la empresa transportista al pago de la suma de mil dólares distribuidos entre los demandantes, suma que se encuentra establecida en el contrato de transporte Bill Of Lading o conocimientos de embarque. Confirmado en segunda instancia. El recurrente alega que el pago ordenado ni siquiera establece valores indemnizatorios cercanos a la cantidad realmente erogada por los solicitantes, y que corresponden al valor de las mercancías declarado en aduana, así como el flete pagado a la demandada, ya que fija el monto de la indemnización en quinientos dólares los cuales corresponden al límite de responsabilidad pactado en un contrato de adhesión, que, dicho sea de paso, contiene clausulas fijadas de manera unilateral por el transportista y cuyas condiciones no son negociables. Se declara inadmisible por la Sala Civil.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "cp-227-22",
      "expediente": "CP-227-22",
      "materia": "Penal",
      "organo": "Tribunal de Sentencia de Tegucigalpa, Fco.Morazan",
      "fecha": "16 mar 2026",
      "fechaIso": "2026-03-16",
      "titulo": "Estafa Agravada Estafa Continuada",
      "resumen": "El Tribunal de Sentencia condenó al acusado por el delito de estafa agravada continuada en perjuicio de varias personas, derivado de la compraventa y construcción de cincuenta y tres (53) viviendas del proyecto habitacional “Ciudad del Ángel”. Estas casas presentaron fallas estructurales que obligaron a deshabilitar debido al…",
      "ponente": "Mag. Walter Raúl Miranda Sabio",
      "fallo": "No ha lugar",
      "extracto": "Recurrente Jose Santos Arias Chicas Recurrido Ministerio Público Tribunal de procedencia Tribunal de Sentencia de Tegucigalpa, Fco.Morazan Fecha de sentencia recurrida 21-10-2021 Motivo de la casación Casación por infracción de ley o de doctrina legal Aplicación indebida de la ley penal o doctrina legal Casación por quebrantamiento de forma Que las motivaciones sean insuficientes Que las motivaciones sean contradictorias Hechos relevantes El Tribunal de Sentencia condenó al acusado por el delito de estafa agravada continuada en perjuicio de varias personas, derivado de la compraventa y construcción de cincuenta y tres (53) viviendas del proyecto habitacional “Ciudad del Ángel”. Estas casas presentaron fallas estructurales que obligaron a deshabilitar debido al peligro inminente para la vida y seguridad de los compradores y sus cohabitantes. Ante esto, el apoderado del acusado interpuso un recurso de casación alegando la inexistencia de engaño, elemento esencial del ilícito de estafa. Sin embargo, la Sala de lo Penal resolvió declarar no ha lugar dicho recurso.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "cp-139-24",
      "expediente": "CP-139-24",
      "materia": "Penal",
      "organo": "Tribunal de Sentencia San Pedro Sula, Cortes",
      "fecha": "16 mar 2026",
      "fechaIso": "2026-03-16",
      "titulo": "Prevaricato Administrativo",
      "resumen": "El Tribunal de Sentencia condenó a la acusada por el delito de prevaricato culposo. La imputada, quien se desempeñaba en el cargo de jueza, se atribuyó facultades que no le competían al realizar una tasación de costas. Posteriormente, la Sala de lo Penal declaró sin lugar el recurso de casación y determinó la improcedencia de…",
      "ponente": "Mag. Walter Raúl Miranda Sabio",
      "fallo": "No ha lugar",
      "extracto": "Recurrente Ministerio Público Recurrido Jorge Alberto Rodríguez, Plutarco Rivera Castellanos y Catalina Sevilla Rodríguez Tribunal de procedencia Tribunal de Sentencia San Pedro Sula, Cortes Fecha de sentencia recurrida 25-07-2022 Motivo de la casación Casación por quebrantamiento de forma Que en la valoración de la prueba no se observaron las reglas de la sana critica Hechos relevantes El Tribunal de Sentencia condenó a la acusada por el delito de prevaricato culposo. La imputada, quien se desempeñaba en el cargo de jueza, se atribuyó facultades que no le competían al realizar una tasación de costas. Posteriormente, la Sala de lo Penal declaró sin lugar el recurso de casación y determinó la improcedencia de la aplicación retroactiva del Código Penal (Decreto 130-2017), ratificando su responsabilidad penal como autora del delito de prevaricato culposo en perjuicio de la Administración Pública. Anonimizada No Fallo No ha lugar Tesauro Derecho Procesal Penal Reglas de la Sana Crítica Contradicción Valoración probatoria resulta contradictoria con los hechos declarados probados ¿Cuándo no procede alegar contradicción en la valoración de los hechos probados? Respuesta al problema jurídico Esta Sala de lo Penal, subraya que los hechos probados , no reflejan la existencia de contradicción alguna, pues ambos hechos probados se refieren a planos distintos pero complementarios de la conducta atribuida.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "ca-120-24",
      "expediente": "CA-120-24",
      "materia": "Contencioso Adm.",
      "organo": "Corte de Apelaciones de lo Contencioso Administrativo de Tegucigalpa, Francisco Morazán",
      "fecha": "24 feb 2026",
      "fechaIso": "2026-02-24",
      "titulo": "Carrera Policial Policía sometido a proceso judicial",
      "resumen": "En primer instancia se declara sin lugar la acción interpuesta por el demandante que fue cancelado por despido del cargo de Policía con el Grado de Comisario de Policía, de la Dirección Nacional de Policía, procesado penalmente y condenado por los delitos de lesiones y daños, en segunda instancia se revoca la sentencia…",
      "ponente": "Mag. Odalis Aleyda Nájera Medina",
      "fallo": "Casa Totalmente",
      "extracto": "Recurrente Secretaría de Estado en el Despacho de Seguridad Recurrido Einar Maryino Moncada Martínez Tribunal de procedencia Corte de Apelaciones de lo Contencioso Administrativo de Tegucigalpa, Francisco Morazán Fecha de sentencia recurrida 13-05-2026 Motivo de la casación Los actos y garantías procesales cuando su infracción suponga la nulidad o produjera indefensión Impugnación por aplicación e interpretación de las normas de derecho Hechos relevantes En primer instancia se declara sin lugar la acción interpuesta por el demandante que fue cancelado por despido del cargo de Policía con el Grado de Comisario de Policía, de la Dirección Nacional de Policía, procesado penalmente y condenado por los delitos de lesiones y daños, en segunda instancia se revoca la sentencia ordenando su reintegro y el pago de salarios dejados de percibir.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "ca-49-24",
      "expediente": "CA-49-24",
      "materia": "Contencioso Adm.",
      "organo": "Corte de Apelaciones de lo Contencioso Administrativo de Tegucigalpa, Francisco Morazán",
      "fecha": "13 may 2026",
      "fechaIso": "2026-05-13",
      "titulo": "Materia Personal Formalidad del recurso",
      "resumen": "En primer instancia se declara procedente la la acción promovida por la demandante que se desempeñaba como oficial de nómina de la Secretaría de Educación por no estar conforme a derecho su acuerdo de cancelación (por el pago a empleado que había fallecido, acreditando que ella para suspender de planillas a alguien necesita le…",
      "ponente": "Mag. Roy Pineda Castro",
      "fallo": "Inadmisibilidad",
      "extracto": "Recurrente Secretaría de Estado en el Despacho de Educación Recurrido Claudia Patricia Ordoñez Vasquez Tribunal de procedencia Corte de Apelaciones de lo Contencioso Administrativo de Tegucigalpa, Francisco Morazán Fecha de sentencia recurrida 24-08-2023 Motivo de la casación Impugnación por aplicación e interpretación de normas procesales La forma y contenido de la sentencia Hechos relevantes En primer instancia se declara procedente la la acción promovida por la demandante que se desempeñaba como oficial de nómina de la Secretaría de Educación por no estar conforme a derecho su acuerdo de cancelación (por el pago a empleado que había fallecido, acreditando que ella para suspender de planillas a alguien necesita le sea comunicada con documentación). Se confirma en segunda instancia.La Sala declara inadmisible el recurso por no cumplir con los requisitos para su interposición Anonimizada No Fallo Inadmisibilidad Tesauro Derecho Procesal Administrativo Inadmisión de motivo de casación Incumplimiento de requisitos del escrito de casación Incumplimiento al requisito de claridad y precisión ¿Por qué se considera que el recurso de casación administrativo se aparta de la debida técnica en su interposición ? Respuesta al problema jurídico Recurrente incurre en el defecto técnico de no ser preciso en establecer si la infracción de las normas señaladas como violadas por el ad-quem, proviene de su falta de aplicación, aplicación indebida o interpretación errónea.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "ac-937-23",
      "expediente": "AC-937-23",
      "materia": "Constitucional",
      "organo": "Sala de lo Constitucional, CSJ",
      "fecha": "18 mar 2026",
      "fechaIso": "2026-03-18",
      "titulo": "Separación de hecho Convenio regulador",
      "resumen": "Interpuesto contra revocatoria de otorgamiento de solicitud de separación de hecho fundamentada la misma en la inexistencia de convenio regulador como presupuesto legal, considerando la Sala Constitucional, al emitir pronunciamiento sobre la procedencia sustantiva de la separación solicitada, por corresponder dicha valoración a…",
      "ponente": "Mag. Sonia Marlina Dubón Villeda",
      "fallo": "Otorgado",
      "extracto": "Recurrente Mario Alberto Maldonado Garcia Recurrido Corte de Apelaciones de lo Civil de San Pedro Sula, Cortés Tribunal de procedencia No se indica Fecha de sentencia recurrida 12-05-2023 Hechos relevantes Interpuesto contra revocatoria de otorgamiento de solicitud de separación de hecho fundamentada la misma en la inexistencia de convenio regulador como presupuesto legal, considerando la Sala Constitucional, al emitir pronunciamiento sobre la procedencia sustantiva de la separación solicitada, por corresponder dicha valoración a la jurisdicción ordinaria, se advierte que la decisión impugnada vulneró el derecho de acción y la garantía de tutela judicial efectiva al desestimar la demanda por una causa no prevista en la ley, introduciendo como requisito de procedencia la existencia de acuerdo entre los cónyuges sobre el convenio de regulación. Anonimizada No Fallo Otorgado Acto recurrido Denegatoria de petición de separación de hecho por la vía de proceso declarativo abreviado Tesauro Amparo Civil Derecho de Familia Separación de hecho Inexistencia de acuerdo entre los cónyuges respecto del convenio regulador constituye presupuesto legal para declarar la improcedencia de la solicitud de separación de hecho.\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
  {
      "id": "ac-1355-23",
      "expediente": "AC-1355-23",
      "materia": "Constitucional",
      "organo": "Sala de lo Constitucional, CSJ",
      "fecha": "18 mar 2026",
      "fechaIso": "2026-03-18",
      "titulo": "Honorarios Profesionales Prescripción de Honorarios Profesionales",
      "resumen": "Corte de Apelaciones confirmó resolución que declaró con lugar la impugnación de cobro de honorarios profesionales por considerarlos indebidos y por apreciar estar ya prescrita la acción de reclamo. Dicha Corte concluyó en la existencia de varis contratos de servicios profesionales perfeccionados por ambas partes a través de…",
      "ponente": "Mag. Wagner Vallecillo Paredes",
      "fallo": "Denegado",
      "extracto": "Recurrente Vania Waldyna Aguiluz Soliz Recurrido Corte Primera de Apelaciones de lo Civil, Francisco Morazán Tribunal de procedencia No se indica Fecha de sentencia recurrida 17-08-2023 Hechos relevantes Corte de Apelaciones confirmó resolución que declaró con lugar la impugnación de cobro de honorarios profesionales por considerarlos indebidos y por apreciar estar ya prescrita la acción de reclamo. Dicha Corte concluyó en la existencia de varis contratos de servicios profesionales perfeccionados por ambas partes a través de los pagos realizados por el Estado y bien recibidos por la recurrente; por lo que es procedente la oposición por parte de la Procuraduría General de la República. Anonimizada No Fallo Denegado Acto recurrido Se declaró sin lugar recurso de apelación y se confirmó resolución impugnada en el Reclamo de pago de Honorarios Profesionales, promovida por la profesional del derecho contra el Estado de Honduras, a través de la Secretaría de Estado en el Despacho de Infraestructura y Servicios Públicos (INSEP), antes (SOTRAVI).\n\n(Fragmento del texto oficial — corpus del PJ, piloto 2026-08-26. El producto final muestra la sentencia íntegra.)"
  },
];

export function getSentencia(id: string): Sentencia | undefined {
  return SENTENCIAS.find((s) => s.id === id);
}

/** Búsqueda por número de expediente escrito a mano ("CL-528", "cl 528 24"). */
export function buscarPorExpediente(fragmento: string): Sentencia | undefined {
  const limpio = fragmento.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!limpio) return undefined;
  return SENTENCIAS.find((s) => {
    const exp = s.expediente.toLowerCase().replace(/[^a-z0-9]/g, "");
    return exp.includes(limpio) || limpio.includes(exp);
  });
}

export function buscarSentencias(
  termino: string,
  filtros: { materia?: string; organo?: string } = {},
): Sentencia[] {
  // Palabras sueltas con AND: "despido prestaciones" encuentra la sentencia
  // que contiene ambas aunque no formen una frase literal.
  const palabras = termino.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const filtradas = SENTENCIAS.filter((s) => {
    if (filtros.materia && filtros.materia !== "todas" && s.materia !== filtros.materia) {
      return false;
    }
    // La CSJ aparece con dos nombres en el corpus real: "…, CSJ" y "Corte Suprema de Justicia".
    if (filtros.organo === "salas" && !/CSJ|Corte Suprema/.test(s.organo)) return false;
    if (filtros.organo === "apelaciones" && !/Apelaciones|Tribunal/.test(s.organo)) return false;
    if (palabras.length === 0) return true;
    const texto =
      `${s.titulo} ${s.resumen} ${s.materia} ${s.expediente} ${s.organo}`.toLowerCase();
    return palabras.every((p) => texto.includes(p));
  });

  // Sin término: más recientes primero. Con término: relevancia simple
  // (título > expediente > resto), con la fecha como desempate.
  if (palabras.length === 0) {
    return [...filtradas].sort((a, b) => b.fechaIso.localeCompare(a.fechaIso));
  }
  const relevancia = (s: Sentencia) => {
    const titulo = s.titulo.toLowerCase();
    const expediente = s.expediente.toLowerCase();
    const resto = `${s.resumen} ${s.materia} ${s.organo}`.toLowerCase();
    let puntos = 0;
    for (const p of palabras) {
      if (titulo.includes(p)) puntos += 3;
      if (expediente.includes(p)) puntos += 2;
      if (resto.includes(p)) puntos += 1;
    }
    return puntos;
  };
  return [...filtradas].sort(
    (a, b) => relevancia(b) - relevancia(a) || b.fechaIso.localeCompare(a.fechaIso),
  );
}
