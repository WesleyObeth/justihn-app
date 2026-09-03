# CLAUDE.md — Justihn · plataforma (portal de abogados + sitio público)

> Cerebro técnico del producto. Manda en su dominio sobre `justihn/CLAUDE.md`
> (producto/negocio) y sigue `../../STACK-BLUEPRINT.md` (arquitectura de la agencia).
> Creado: **2026-08-25** · Última actualización: **2026-09-03** (Legislación
> sobre las tablas reales — §1.8 — y Procesos concluida: cada paso cita su
> artículo, sin marcadores — §1.9).
>
> **Cómo leerlo:** §1 dice qué hay y dónde. §4 son las reglas que no se
> renegocian, y **§4.7 las trampas** — lo que costó horas descubrir y no se ve
> leyendo el código. Antes de tocar una landing o una pantalla pública, leer §4.7.

---

## 1. Qué es

Producto de dos vías sobre un mismo código:

- **Vía A — abogados** (`/abogados`): SaaS de suscripción. Jurisprudencia,
  legislación, alertas de La Gaceta, procesos con plazos, modelos de escritos,
  leads, calculadoras, monitoreo de nombres y **Jus IA**, el asistente que
  responde **solo citando fuentes oficiales**.
- **Vía B — gente común** (`/` y `/personas`): guías de trámites y procesos,
  consultorio gratuito, directorio de abogados y calculadora de prestaciones.
  Es la cara indexable del dominio y el funnel que alimenta los leads de la vía A.

**Estado: Fase 1 del blueprint (§4) — mock-first.** La UI completa corre contra
seeds deterministas, sin backend ni claves (`pnpm dev` y listo). Los seeds **son
el contrato literal** de las tablas Supabase de Fase 2. Deployado en
**https://justihn-app.vercel.app** (repo `github.com/WesleyObeth/justihn-app`,
env `JUSTIHN_DEMO_SESSION=1`, `noindex` hasta lanzar).

**Fuentes de verdad visuales** (no improvisar valores): **`../logo/especificacion/`**
— `logos-oficiales.md` (la geometría, que los SVG solo materializan),
`marca-tipografia-colores.md` (los tokens **y el porqué de cada uno**) y los dos
handoffs de Claude Design, `handoff-portal.md` y `handoff-auth.md`.
⚠️ Las carpetas `design_handoff_portal/` y `design_handoff_auth/` **se eliminaron
el 2026-08-31**: sus prototipos `.dc.html` (260 KB) y su runtime (72 KB) eran la
maqueta de partida y el producto los superó — solo ese día se refinaron diez
pantallas. Se conservaron los 40 KB de especificación, que sí es viva.

### 1.1 Portal de abogados — `/abogados` (15 pantallas + Despacho, §1.1b)

Rutas reales, no estado: el deep-link a una sentencia o a una publicación
funciona y es compartible. Dashboard · Jus IA · Jurisprudencia · Legislación ·
Gaceta · Procesos · Modelos · Leads · Calculadoras · Monitoreo · Notificaciones ·
Perfil · Planes · Configuración · Ayuda.

- **Nombres cerrados** (decisión Wesley 2026-08-25): vive bajo `/abogados` (antes
  `/portal`); "Paso a paso" → **Procesos**; "Plantillas" → **Modelos** (es el
  término del gremio y el que se googlea). Los identificadores internos
  (`PLANTILLAS`, `plantillaId`) no cambiaron. Redirects permanentes en
  `next.config.ts`.
- **Regla del Dashboard:** nada inerte — toda card navega o dispara una acción.
  "Pendientes de hoy" usa `usePreguntarAJusIA(pregunta, { enviarDirecto })`, que
  deja la consulta enviándose al llegar al chat.
- **Jus IA:** chat en una sola columna centrada (~760px); el historial va en un
  panel lateral, no en columna fija. El titular del hero sale del pool
  `TITULARES_HERO` (`data/jus-ia.ts`), elegido en cliente tras el mount.
  **«Nueva consulta» (izquierda) e «Historial» (derecha) van en la fila
  superior de la columna del chat — y se quedan ahí** (decisión Wesley
  2026-09-02). Ese día se probaron dos alternativas y las descartó: una fila
  de acciones en la cabecera de la página (ancho 1280, con el título de la
  consulta actual) y los dos como hijos desplegables de «Jus IA» en el
  sidebar, patrón Mercury. No volver a proponerlas sin un motivo nuevo.
- **Jurisprudencia busca sobre el corpus real desde el 2026-09-02** (§1.7):
  dos modos, filtros de materia/proceso/año, paginación con conteo exacto y
  ficha por `record_id`. **Legislación** y **Monitoreo de nombres** existen
  para que la tabla de planes quede 100% respaldada por UI (estaban vendidas y
  no existían). **Legislación lee los 3.989 artículos reales** de `codigos` +
  `articulos` desde el 2026-09-03 (§1.8; cinco códigos desde esa tarde,
  §1.9); Civil y Penal aparecen «en preparación» diciendo POR QUÉ — sin
  fuente no hay texto. Monitoreo pregunta al corpus por `/api/corpus/apariciones`
  (vigilados en el store, `nombresVigilados`, persistido con alta y baja), con
  disclaimer de homónimos y exclusión de materias reservadas; mientras la
  migración 03 no esté pasada, responde sobre el piloto **y lo dice** (§1.7).

### 1.1b Despacho — Mis casos y Propuestas de honorarios (2026-09-02)

Nacen del **primer feedback de un abogado externo** (ver `justihn/CLAUDE.md`
backlog #4, #10 y #11): pagaba US$20/mes de ChatGPT sobre todo para redactar
propuestas de honorarios, y pidió «digitalizar los expedientes notariales».
Sección nueva del sidebar, **Despacho**, entre Dashboard e Investigación: lo
que el abogado gestiona, no lo que consulta.

- **Mis casos** (`/abogados/casos`, `+ /nuevo`, `+ /[id]`): el expediente por
  cliente. Nace de un **acto notarial** (`data/actos-notariales.ts`: matrimonio
  civil, auténtica, declaratoria de herederos), de un **trámite** o de un
  **proceso** del catálogo, y **el checklist de documentos se llena desde la
  fuente verificada** al crearlo; desde ahí es del caso (si la guía cambia, un
  expediente abierto no pierde lo que el cliente ya entregó). Tres bloques de
  trabajo —documentos con progreso, plazos con días restantes por `useHoy`,
  notas— y lateral con cliente (DNI con máscara, opcional), origen con su
  fuente, estado y la propuesta enlazada. `lib/casos.ts` es el único sitio que
  sabe qué es un `referenciaId`. Store `casos` (v6), busca por id tras
  `useStoreHidratado` (§1.2: sin eso, 404 falso al recargar).
- **Propuestas de honorarios** (`/abogados/propuestas`, `+ /nueva`, `+ /[id]`):
  el abogado elige de qué nace, pone honorarios, forma de pago y cliente, y el
  documento **se ARMA desde la guía** (`lib/honorarios.ts`): alcance por
  etapas = pasos, requisitos = requisitos con su artículo, advertencias = tasa
  y nota, condiciones estándar, membrete del perfil. Cifra y letras («Dieciocho
  mil lempiras exactos», `lempirasALetras`, con tests). El store guarda SOLO
  lo que escribió; el documento se deriva en cada render (§4.4). **Descargar
  en PDF = `window.print()`** con `print:hidden` en sidebar, header, banner y
  barra, y `print:overflow-visible` en el layout (sin eso el `h-screen` +
  scroll interno cortaba a una página); `@page` carta en `globals.css`. La
  vista previa es libre; guardar y descargar son **Premium** (es la función
  que justifica el plan frente a ChatGPT). Desde un caso llega prellenada
  (`?caso=`) y al guardar se enlaza.
- **Modelos notariales** (auténtica de firma, de copia, acta de matrimonio):
  borradores de estructura, `desc` lo dice, para revisión del socio. La
  pantalla Modelos abre con la card «Propuesta de honorarios desde un trámite».
- ⚠️ **Sin fuente no hay texto, también aquí.** El matrimonio cita los arts.
  21, 24-30 del Código de Familia (verificados en los artículos parseados de
  `automatizaciones/legislacion/`). La auténtica declara `fuentePendiente`: el
  Código del Notariado (Decreto 353-2005) no está en ninguna fuente estatal
  legible que hayamos podido verificar. El divorcio por mutuo consentimiento
  es JUDICIAL (art. 244: «al Juez»), así que entra como proceso, no como acto.
  `actos-notariales.test.ts` exige fuente o pendencia declarada en cada acto.
- **Verificado E2E en Chromium** con una cuenta real de prueba (login →
  caso notarial con 10 documentos → marcar → plazo → propuesta prellenada con
  «Quince mil lempiras exactos» y «art. 24» → guardar → PDF sin interfaz →
  el caso enlaza la propuesta), y móvil sin desborde.
- ⚙️ Pendiente: **nombre de la firma** separado del nombre del abogado en el
  membrete (hoy repite «Abg. María Castillo»); columna `firma` en `abogados`
  cuando el perfil se edite. Y el Dashboard aún no deriva «Pendientes de
  hoy» de los plazos de los casos (sigue sobre `BRIEF`).

### 1.2 Portal ciudadano — `/personas` (17 rutas)

El patrón Jusbrasil completo: la landing da la probadita y "crear cuenta gratis"
abre un portal con shell propio (persona demo Carlos Zelaya en `data/persona.ts`).
Inicio · Trámites (con **checklist persistido**, `pasosTramite` en el store) ·
Consultas (+ detalle) · Instituciones (+ detalle) · Directorio (+ perfil) · Calculadoras · Informe
Verifica · Mi nombre · Notificaciones · Plan · Perfil · Configuración · Ayuda.
El sidebar los agrupa en **Mis gestiones · Herramientas · Verificación**.

**Notificaciones y la calculadora de plazos nacen el 2026-08-31** cerrando dos
promesas que ya estaban hechas y no existían:

- **Notificaciones se DERIVA del store**, no es un seed como la del abogado: las
  consultas ya respondidas, las publicadas a la espera y los trámites empezados
  y sin terminar. Una notificación semilla diciendo "un abogado respondió tu
  consulta" a quien nunca preguntó sería justo la evidencia fabricada que
  prohíbe §4.5; solo la bienvenida es estática, y es cierta. Agrupa por **origen
  y no por fecha** porque lo derivado no tiene sello de tiempo real. Configuración
  llevaba desde el principio tres interruptores sin destino, y es el mecanismo de
  retorno de la vía B: la persona pregunta y se va. Va en el **menú del avatar**
  (decisión Wesley), con un punto sobre el avatar — sin él la insignia solo se
  vería abriendo el menú, y con la barra colapsada no se vería nunca.
- **Inicio toma la ESTRUCTURA del Dashboard del abogado, no sus contenidos**
  (refinado 2026-08-31): entrada arriba · fila de 3 métricas · grid con triaje a
  la izquierda y destacado a la derecha · accesos rápidos al pie. Lo que cambia
  es qué va dentro, porque las audiencias no se parecen: el abogado entra a
  trabajar y mide su producción (cuota de IA, búsquedas, alertas); el ciudadano
  llega con UN problema y necesita saber qué dejó a medias y cuánto tiempo le
  queda.
  - **La entrada es un buscador por problema**, no un composer de IA. Los
    resultados salen **en la propia pantalla** (mandarlo a una lista con filtros
    es pedirle que decida otra vez) y **sin coincidencia ofrece el consultorio**
    con lo escrito. El motor es `buscarGuias` en `data/tramites.ts`, **compartido
    con la pantalla Trámites**, donde estaba duplicado en su filtro.
  - **Las métricas son de su gestión** (trámites en curso · consultas · guías
    disponibles) y con la cuenta nueva dos valen cero: muestran «—» y la
    invitación, porque un cero seco es un tablero diciendo que no has hecho nada.
  - **"Tus pendientes" se deriva del MISMO `useAvisosPersona`** que alimenta
    Notificaciones — con dos derivaciones, la campana y el tablero podrían
    contradecirse. Descarta el grupo "De Justihn": una novedad no es un pendiente.
  - **El destacado oscuro es un PLAZO, no un digest** (`data/plazos.ts`, art. 864):
    es lo que le hace perder el caso sin enterarse, y ya está verificado.
  - **Accesos rápidos** resuelve que Instituciones, Verifica y Mi nombre no se
    descubrían desde Inicio; son **4, no 6** (decisión Wesley) — se fueron las
    dos que ya tienen otra puerta en la misma pantalla: "Mis consultas" es una
    card entera arriba y a Calculadoras lleva el botón del destacado oscuro.
    **La card "Tu plan" se quitó** (decisión Wesley): duplicaba el menú del
    avatar, que es donde vive el plan.
  - **La pantalla son DOS rejillas, no una** (decisión Wesley: alinear "Lo que
    otros preguntan" con "Lo que viene"). Con una sola, cada columna apila lo
    suyo y la última card de cada lado empieza donde acabe la anterior — que
    depende del contenido: medido, había **121px de desfase con la cuenta vacía
    y 157px con datos**, así que ninguna altura fija los arregla a la vez. En su
    propia fila quedan alineadas por construcción. `items-stretch` iguala las
    columnas de arriba, y **"Mis trámites" NO lleva `flex-1`** a propósito:
    estirarla metía el hueco dentro de la card (un rectángulo blanco vacío) en
    vez de dejarlo entre cards, donde se lee como aire.
  - **"Lo que viene"** (decisión Wesley: partir Accesos rápidos en dos) NO es un
    anuncio de marketing: sus tres puntos son ítems del backlog con su bloqueo
    real detrás — Informe Verifica completo (depende de cuentas SURE/CCIT), más
    guías (alquiler y depósito, bloqueada porque el texto de la Ley de
    Inquilinato no está en fuente estatal legible) y el plan de pago que define
    el socio. **Sin fechas a propósito**: prometer una es lo que prohíbe §4.5, y
    lo dice en la propia card. El único compromiso que repite es el que sí está
    tomado: lo gratis sigue gratis. Lleva el `flex-1` que cierra la columna
    derecha a la altura de la izquierda.
- **El estado vacío del consultorio enseña en vez de esperar.** Decía "Aún no
  has preguntado nada"; ahora muestra un intercambio REAL ya respondido y
  firmado con su colegiación (`respuestaDemo` del seed). El obstáculo del
  ciudadano no es no saber dónde escribir: es no creer que alguien le responda —
  mismo criterio que la sección consultorio de la home (§1.3). El componente no
  se comparte con aquella porque pintan sobre temas distintos (shell aurora vs
  portal); lo que se comparte es la fuente y el criterio. Y **"Lo que otros
  preguntan"** es el eco de "Leads en tu especialidad" visto desde el ciudadano:
  enseña que el consultorio se usa sin inventar un contador de actividad.
- **Trámites separa trámites de procesos** (refinado 2026-08-31): eran 14 cards
  en una parrilla plana donde un divorcio y un RTN se veían igual, y la única
  señal de que son cosas distintas era un chip que había que pulsar. Ahora van
  en dos secciones con su conteo — y solo se parte cuando el filtro de tipo está
  en "Todos": con "Procesos" activo, un encabezado "Procesos legales" sobre la
  única lista sería ruido. `tramites.test.ts` exige que los dos tipos cubran el
  catálogo entero: un tercer tipo desaparecería de la pantalla en silencio
  (mismo fallo que §4.7.12 describe para `RUTAS_TRAMITE`).
  - **El filtro estaba invertido**: el buscador medía 230px y el select de
    institución 480 — lo secundario era el doble que lo principal. Ahora el
    buscador se lleva el espacio sobrante y el select baja a 220px.
  - **Los tres controles iban a 42/41/40px.** Un `<select>` no se iguala por
    interlineado (§4.7.7): los tres llevan **altura explícita** (`h-10`).
  - **Cada institución muestra su conteo y se deshabilita en 0**, calculado
    sobre lo ya filtrado por tipo. Antes "Procesos" + "SAR" dejaba la parrilla
    en blanco sin avisar.
  - **Sin resultados hay pantalla, no vacío**: mensaje, "Ver todas las guías" y
    el consultorio — porque puede que la guía no exista todavía.
  - **La card muestra pasos y `tasaCorta`**, que estaba en el seed sin usarse:
    "cuánto me cuesta" obligaba a abrir la guía para saberlo.
- **El detalle de una guía pone lo PRÁCTICO antes que el procedimiento**
  (refinado 2026-08-31). Requisitos, costo y el sello de fuente estaban **al
  final**, después de seis pasos largos — y son justo lo que hay que saber
  ANTES de salir de casa. Ahora van arriba; los pasos, después.
  - **El checklist no se veía marcable**: el círculo numerado ES el control,
    pero se leía como numeración. Ahora la sección lo dice ("Marca lo que ya
    hiciste"), el número **se cambia por un check al pasar por encima**, y
    **toda la fila es clicable** — a un objetivo de 26px se le apunta mal, sobre
    todo en un teléfono. ⚠️ El aviso de profesional va FUERA del botón: lleva su
    propio enlace, y un enlace dentro de un botón no se puede activar.
  - **La ruta se hace visible** (`getContextoRuta`): que el RTN habilita el CAI
    y el CAI el permiso es "lo que no se encuentra googleando" (§1.3) y solo
    existía en la home pública — quien abría la guía desde el portal terminaba
    sin enterarse de que había un siguiente. La columna lateral muestra los 5
    pasos de la ruta, marca en verde los que ya completó, y **completar ofrece
    el siguiente**. Los procesos judiciales no pertenecen a ninguna ruta y la
    pantalla no se la inventa; hay test.
  - La institución del encabezado **enlaza a su pantalla**, que ahora existe.
- **Cada consulta tiene su ruta** (`/personas/consultas/[id]`, 2026-08-31).
  No existe para "verla más grande": la lista dejaba «Esperando a los
  abogados…» como callejón sin salida, justo en el momento de más ansiedad.
  El detalle le da contenido a esa espera — **las guías verificadas de su
  materia** y **otras consultas de la misma materia ya respondidas** (filtro por
  materia sobre el seed, no un "relacionadas" inventado por parecido de texto),
  así que la persona sale con algo aunque nadie haya contestado.
  ⚠️ **`useStoreHidratado()`** nace aquí y es obligatorio en cualquier pantalla
  que busque un registro POR ID: con `skipHydration`, el primer render ve el
  store vacío y `notFound()` dispararía un **404 falso** a quien recargue.
  Mismo patrón `useSyncExternalStore` de `use-saludo.ts`.
  En la lista, el formulario **se pliega cuando ya hay consultas** (lo que
  importa entonces es seguirlas) y **se cierra solo al publicar**: guarda
  cuántas consultas había al abrirse, no un booleano, así que publicar lo cierra
  sin un efecto — que además no pasaría el lint (§4.7.18).
- **Configuración: el habeas data pasa a ser FUNCIONAL** (2026-08-31). §5 del
  CLAUDE.md del producto lo exige desde el día 1 —"canal de supresión/revisión
  funcional desde la plataforma"— y la pantalla lo prometía con dos botones que
  solo enseñaban un toast. Ahora lista **lo que Justihn guarda de verdad**, con
  su cuenta derivada del store (consultas · avance de trámites · nombres
  vigilados · mensajes a abogados · a quién consultó en Verifica), **borra por
  categoría** —el historial de Verifica es lo más sensible y puede querer irse
  sin perder el avance de los trámites— y **descarga un JSON de verdad**.
  "Borrar todo" pide confirmación; una categoría no: no hay deshacer y el peso
  del error es muy distinto. `borrarDatosPersona` no toca los datos del abogado,
  que son otra audiencia en el mismo store (hay test). Y las notificaciones
  **dicen por dónde llegan** — correo y WhatsApp de la cuenta —, que era el dato
  que faltaba teniendo los dos campos justo arriba.
- **Plan y Mi perfil** (refinadas 2026-08-31). En Plan, lo incluido **se deriva
  de los seeds** (`TRAMITES.length`, `INSTITUCIONES`, `DIRECTORIO`): escrito a
  mano se había quedado viejo — decía "calculadora de prestaciones" en singular
  con dos ya hechas, y no nombraba Instituciones, Verifica ni Mi nombre. Se suma
  **"Lo que llevas usado"**, porque un plan sin uso al lado es una lista de
  promesas. **Card de Jus IA** (decisión Wesley): se anuncia **sin fecha y sin
  precio**, y diciendo POR QUÉ no está — el motor existe pero se niega a
  responder sin corpus, y anunciarlo como si funcionara rompería en la pantalla
  que lo vende justo la promesa que lo distingue.
  **Mi perfil** toma la estructura del perfil del abogado con una diferencia que
  manda: **el del abogado es PÚBLICO y el del ciudadano no.** El abogado gestiona
  una vitrina (sube su carné, elige materias visibles, mide vistas del
  directorio); la persona no aparece en ninguna parte, y saberlo la tranquiliza —
  por eso "Tu perfil no es público" es una card con el mismo peso que las demás,
  no letra pequeña al pie. Y **sus métricas enlazan**: en el abogado son
  indicadores de negocio, aquí son la puerta a lo que dejó a medias.
- **Cada abogado tiene perfil, y desde ahí se le escribe**
  (`/personas/directorio/[id]`, 2026-08-31). El mensaje se envía **dentro de
  Justihn**, no a WhatsApp: §4.5 ya decía que sacar el contacto en el primer
  toque deja al abogado sin poder demostrar cuántos le trajo la plataforma —
  que es lo que sostiene que pague. El formulario pide **materia además del
  texto** (el abogado necesita saber de qué le hablan), exige un par de líneas,
  y **dice que hoy el mensaje se guarda en el navegador**: no promete un envío
  que aún no existe. Store: `mensajesAbogado`.
  ⚠️ **Dos bugs de la misma causa**, encontrados al revisar: `landing.css` se
  importa en los layouts públicos pero **NO en `/personas` ni `/abogados`**, y
  la card del abogado se apoyaba en él. El botón "Consultar con X" llevaba
  `background: var(--turq)` → en el portal quedaba **sin fondo, blanco sobre
  blanco, invisible**; y el contenedor usaba `.glass-card` → **sin borde, sin
  radio, sin fondo y sin sombra**, desnudo sobre el lienzo. Esta card vive en
  TRES superficies, así que su apariencia sale de tokens del tema; `.glass-card`
  se conserva **delante** de ellos para que la landing siga ganando y mantenga
  su efecto glass (medido: portal 1px/16px/blanco · landing 1px translúcido/18px
  /72% con sombra). `superficies-compartidas.test.ts` lo topa: recorre lo que
  `personas/` importa de `publico/` y exige superficie propia — verificado que
  falla con el código viejo.
  Filtros: se suman **buscador** (nombre, ciudad, bio y materias, sin tildes) y
  **ciudad**; cada materia lleva su conteo y se deshabilita en 0; **notarios va
  en fila aparte** porque ser notario NO es una materia, y mezclarlos los hacía
  parecer lo mismo. Todo vive en la URL, así que un enlace filtrado es
  compartible. `filtrarDirectorio` está en `data/` porque el orden —Premium
  primero— es regla de negocio, no de pantalla.
- **Instituciones** (2026-08-31) es el pedido literal del socio: "ver todas las
  instituciones del Estado y los trámites de cada una — ej. el IP". El seed ya
  lo tenía (`INSTITUCIONES`, 9, todas con trámite). ⚠️ No contradice §1.3: allí
  se decidió no dar filtro por institución **en la home**, porque quien llega de
  Google busca "voy a abrir un negocio", no "un trámite de ONCAE". Dentro del
  portal sí hay quien ya sabe que su asunto es del IP. El campo `sitio` es
  **opcional a propósito**: solo se rellena si el host pasa la whitelist §3.3
  (6 de 9; MiAmbiente no responde, STSS y Registro Mercantil sin verificar), y
  `instituciones.test.ts` lo exige — antes ningún enlace que uno muerto.
  **Refinada 2026-08-31.** La card metía la sigla en un cuadro con
  `slice(0, 4)`: convertía **«ONCAE» en «ONCA»** y «MiAmbiente» en «MiAm» — una
  sigla a medias no identifica a nadie, y encima repetía un dato que ya estaba
  dos líneas más abajo. Ahora va **entera y como rótulo**, igual que en la card
  de guía, con test que impide siglas irrepresentables o repetidas. Se suman
  buscador (`buscarInstituciones`, por sigla, nombre o por lo que hace — la
  gente escribe "impuestos", no "SAR"), estado sin resultados que empuja al
  buscador de trámites, y en el pie de cada card el nº de guías, si tiene portal
  y **cuántas tiene en curso**. El detalle gana columna lateral: portal oficial,
  materias que cubre (derivadas de sus trámites), otras instituciones y el
  consultorio. Cuando NO hay portal **se dice por qué**: el hueco solo se lee
  como descuido si no se explica.
- **Verificación son DOS pantallas, y la separación es la regla, no diseño.**
  **Mi nombre** vigila solo nombres propios; **Informe Verifica** mira a un
  tercero. Ofrecer vigilar a terceros en la primera convertiría el monitoreo en
  acoso, que es justo lo que prohíbe §5 del CLAUDE.md del producto. Las dos
  corren el MISMO motor real (`buscarApariciones` sobre el texto de las
  sentencias del piloto) y **el ciudadano tiene su propia lista**
  (`nombresVigiladosPersona`): compartir la del abogado le enseñaría sus
  clientes y contrapartes.
  **Mi nombre, refinada 2026-08-31:** arrastraba la misma contradicción que
  Verifica —el disclaimer pedía "abre la sentencia y compruébalo" sin poder
  abrirla—, así que el desplegable se **extrajo a `aparicion.tsx` y lo usan las
  dos**: con dos copias, arreglar una dejaría a la otra pidiendo lo imposible
  (hay test). El disclaimer pasa a **una vez por nombre, no por fila**: repetido
  en cada aparición se volvía ruido y se dejaba de leer, que es lo contrario de
  lo que un disclaimer busca. Se suman la **relación** al vigilar (Mío / De mi
  familia — lo único que separa vigilar de acosar, y por eso no hay opción para
  terceros), un resumen lateral y **"Cómo te avisamos"**, que enlaza a
  Notificaciones y Configuración: antes decía "te avisamos" sin decir por dónde
  ni dónde se elige.
  Tres reglas de §5 están cableadas en la UI, no son copy: **homónimos
  siempre** —también cuando NO hay resultados, porque "sin apariciones" se lee
  como certificado y no lo es—, **usos prohibidos a la vista antes de buscar**,
  y **materias reservadas excluidas**. `verifica.test.ts` las comprueba sobre la
  fuente: son texto en la UI, no lógica, y un revert descuidado las borraría sin
  que nada fallara.
  **Refinado 2026-08-31.** El disclaimer decía "abre cada sentencia y contrasta"
  y **no había forma de abrirla**: el texto exigía algo que la pantalla no
  permitía. Ahora cada aparición se despliega con el resumen del CEDIJ, quién
  firmó, el fallo y el fragmento del texto oficial — que es con lo que se
  descarta un homónimo. ⚠️ Ninguna sentencia del piloto trae `fuenteUrl` aunque
  el tipo diga "toda cita debe poder abrirse": **se dice que el enlace llega con
  el corpus**, en vez de dejar un enlace muerto. Se suman filtro por materia
  (cuando hay más de una) e **historial de consultas**, que se guarda solo en
  ese navegador y **se puede borrar** — un registro de a quién investiga alguien
  es de lo más sensible que guarda este producto.
  ⚠️ **Sin semáforo de riesgo**, aunque el modelo de negocio lo mencione: un
  rojo/verde sobre una persona por aparecer en sentencias la etiqueta, y en
  Honduras nadie pierde derechos por figurar en un expediente. Se muestra QUÉ
  hay y EN QUÉ CALIDAD aparece; la conclusión la saca quien lee. Hay test. El informe completo (folio real, Registro
  Mercantil, vigilancia 30 días) aparece **en preparación**: depende de cuentas
  SURE/CCIT que no existen, así que no se cobra por adelantado ni se le pone
  precio (§4.5).
- **Reclamo de consumo** (2026-08-31, guía 14ª) cierra el hueco más grande que
  tenía la vía B: comprar algo vencido o defectuoso. `consumidor` no aparecía en
  ningún archivo del proyecto, y **la materia `Consumidor` no existía**, así que
  la guía no habría podido recomendar abogado — el funnel guía→lead se cortaba.
  Nacen con ella la materia, la institución `dgpc` y un perfil de esa rama;
  `tramites.test.ts` ya lo exigía y falló antes de que existiera.
  ⚠️ **La Ley (Decreto 24-2008) está escaneada sin capa de texto** en el TSC, así
  que la guía cita sus artículos SOLO donde el Reglamento vigente los transcribe
  (Acuerdo 084-2021, La Gaceta 35,807), que sí es legible y es la `fuenteUrl`.
  Verificado textualmente: arts. 28 y 31 (libro de quejas exhibido en caja),
  art. 50 (30 días para reclamar, 15 para cambiar o devolver el dinero) y la
  tabla del art. 99 (vender vencido = MUY GRAVE, 6-10 salarios mínimos).
- **La calculadora de plazos NO es la del abogado con otro nombre.** La suya pide
  "días de plazo", que un ciudadano no sabe: aquí elige el **hecho** que le pasó
  y el plazo lo pone la ley. Los tres salen de guías ya verificadas
  (`data/plazos.ts` → `art. 864` y `865` del Código del Trabajo, `art. 240` del
  Código de Familia, contrastados contra los PDF del CEDIJ el 2026-08-31).
  El número vive en la prosa de la guía **y** como dato aquí, así que
  `plazos.test.ts` exige que el artículo citado aparezca en el texto de esa guía
  — es lo que impide que diverjan (misma lógica que §4.7.13).

**El shell es gemelo del de abogados, no parecido** (2026-08-31): misma columna
marina **colapsable** (236px ↔ 68px), navegación **agrupada por categorías** y
**drawer** en móvil. Tres decisiones detrás:
- **Comparte `sidebarColapsado` del store** con el portal de abogados, así que la
  preferencia se persiste una sola vez. No es un descuido: nadie es las dos
  audiencias a la vez, y duplicar la clave daría dos memorias del mismo gesto.
- **Colapsada, las categorías se leen como separadores** (una línea de 24px), no
  como rótulos: a 68px no hay ancho para el texto, y sin nada los seis iconos
  quedaban en una lista plana.
- **"Mi plan" salió de la nav al menú del avatar**, donde lo tiene el abogado.
  Ahí ya se anunciaba "Plan Gratis" sin ser un enlace — un texto muerto que
  ahora lleva a `/personas/plan`. La nav queda en 5 enlaces y 2 categorías.

Móvil dejó de ser chips deslizables en cabecera marina: es la misma cabecera
blanca con hamburguesa del portal de abogados. La mecánica del drawer (Escape,
clic al fondo, cierre al navegar) vive UNA vez en `DrawerMenuMovil`
(`portal/sidebar.tsx`) y los dos portales le pasan su propio sidebar.

**Nombres cerrados (2026-08-29):** `/personas` en plural, para leer como pareja
de `/abogados`; y su buscador es `/personas/directorio`, no `/personas/abogados`
— esa forma hacía que `/abogados` significara a la vez el portal de suscriptores
y una pantalla del ciudadano. El label de la UI sigue siendo "Encuentra abogado",
y `data/persona.ts` se queda en singular porque es UNA persona demo. Redirects
308 para las cuatro formas viejas.

### 1.3 Páginas públicas

**Home ciudadana `/`** — grupo `(landing)`, shell aurora. Hero con buscador ·
4 puertas de entrada (no navegan: ver §3) · 3 demos · Trámites en rutas ·
Procesos · Consultorio · Directorio · Plan gratis · FAQ · CTA · cross-sell a la
vía A.

- **Trámites agrupados por situación de vida** (Abrir un negocio · Comprar o
  vender · Formalizar y vender al Estado), **numerados y encadenados** con un
  riel: el RTN habilita el CAI, el CAI el permiso de operación. Ese orden es lo
  que no se encuentra googleando y es la promesa del producto hecha visible.
  Se ve una ruta a la vez; buscar rompe el orden a propósito (resultados planos:
  quien escribe "RTN" quiere su guía, no la ruta). No hay filtro por institución
  — nadie busca "un trámite de ONCAE", busca "voy a abrir un negocio".
- **Procesos** usa la misma `FilaTramite` pero **sin el riel numerado**: despido,
  pensión, divorcio y herencia no se encadenan y numerarlos inventaría un orden.
- **Consultorio: la conversación primero.** Abre con un intercambio real
  (consulta + respuesta firmada por la colegiada, con su número CAH) y el
  formulario debajo. El obstáculo no es no saber dónde escribir: es no creer que
  alguien vaya a responder. Si el visitante ya preguntó en esta sesión, se
  muestra SU consulta. Publicar pasa por `/crear-cuenta?tipo=persona&desde=consultorio`.
- **Directorio:** los cinco perfiles, sin esconder ninguno tras una cuenta.

**Landing de abogados `/para-abogados`** — grupo `(profesional)`. Hero con
**composer de Jus IA** (la caja no busca, pregunta; Enter envía, Shift+Enter
salta línea, 3 chips de materias y fuentes distintas para enseñar alcance) ·
Cómo cita · Lo que encuentras dentro · 3 demos · Planes · FAQ · CTA oscuro.

- **La URL es `/para-abogados`, no `/profesional`** — el plan intermedio se llama
  "Profesional" (`PlanId`) y habría chocado con el nombre del tier.
- **Puerta de cuenta:** escribir es libre; al ENVIAR se pasa por `/crear-cuenta`.
  Se gatea en enviar y no en la primera tecla: cortar a media escritura se
  siente roto. La pregunta se guarda en el store ANTES de navegar y se dispara
  sola al llegar al chat.
- **Anillo de bienvenida** (`.borde-aurora--intro`): el borde aurora se enciende
  ~4 s y se apaga solo. Es animación CSS, así que reinicia con el montaje sin
  estado ni temporizadores.
- **Los tres demos** (`demos.tsx`) usan **datos reales de los seeds**, no
  maquetas: la sentencia citada es CL-528-24 del piloto, con su órgano y
  magistrada verdaderos. Se reproducen al entrar en vista y se rearman al salir.
  No son video a propósito: el HTML conserva el texto para el crawler.
- **"Lo que encuentras dentro"** (`capacidades.tsx`) es un **mosaico de nueve
  piezas** con una celda ancha por fila alternando de lado, **sin encabezados de
  categoría** y **sin ventana de producto**. El reparto es deliberado: **esta
  sección es el INVENTARIO, los demos son la DEMOSTRACIÓN**. Una ronda intermedia
  sí tuvo panel y dejaba la página con cuatro secciones seguidas con ventana,
  enseñando los mismos Jus IA / Gaceta / Leads que los demos de debajo. Con 4
  columnas cada fila suma 2+1+1, así que teja sin huecos. Es componente de
  servidor: las nueve funciones llegan al HTML sin depender de hidratación.

**`/para-abogados-black`** — la MISMA landing en tema oscuro, para que Wesley
elija. Cero duplicación: reutiliza `LandingProfesional` tal cual y el tema lo
hace `.landing-aurora--black` remapeando los tokens sobre el aurora noche.
El **patrón `superficie-dia`** (composer del hero + ventanas de demo) son cards
blancas en la landing clara y **glass oscuro** en la black: la regla
`.landing-aurora--black .superficie-dia` les gana a las utilidades Tailwind del
componente y remapea todos los tokens interiores.
⚙️ **Cuando se elija una versión, borrar la otra ruta** (o convertirla en redirect).

**Interiores** (`/tramites/[id]`, `/calculadora-prestaciones`) — grupo `(publico)`,
**mismo shell aurora que la home** desde 2026-08-30: antes tenían cabecera blanca
y fondo plano, así que abrir una guía se sentía como salir del sitio.

**Shell compartido:** `FondoAurora` (three.js, shader FBM; navy #0a1830 · celeste
#1584c7 · claro #7cc7f0) + `NavAurora` (parametrizada: `enlaces`/`secundario`/
`cta`/`login`/`logoVariante`) + `PieAurora` (un pie, distinto contenido por
props; bloque marino a sangre). Stacking: fondo z-0 · canvas+scrim z-1 ·
contenido z-2 · nav z-100.

### 1.4 Auth — `/iniciar-sesion` + `/crear-cuenta`

Grupo `(auth)`, shell propio sin navegación, del handoff
`../logo/especificacion/handoff-auth.md`.

- **Un solo login para las dos vías** (decisión Wesley 2026-08-30). Es UNA base
  de cuentas: dos logins duplicarían recuperación, enlaces mágicos, rate limit y
  errores, y obligarían a acertar por qué puerta te registraste — quien elige mal
  ve "no existe esa cuenta" y se va creyendo que perdió su registro. `?tipo=persona`
  solo cambia copy y destino, **nunca lo que se pide para entrar**. En Fase 2 el
  parámetro sobra: lo resuelve la cuenta (¿tiene ficha de abogado? → `/abogados`).
- **El alta sí es distinta.** Abogado: 3 pasos (cuenta con medidor de fuerza ·
  validación CAH opcional con dropzone · materias en chips, 14 áreas) + bienvenida.
  Ciudadano: nombre, correo y contraseña. `alta.tsx` es la puerta única que elige
  formulario. El abogado pasa por tres pasos porque el producto necesita
  colegiación y materias; a un ciudadano eso lo espantaría y su portal no usa
  ninguno de esos datos.
- **`?tipo=` se lee en el SERVIDOR** (`searchParams` de la page), no con un hook
  de cliente: en cliente el HTML llegaba siempre con la variante del abogado y se
  veía un parpadeo del stepper. A cambio las dos rutas se sirven dinámicas, que
  en pantallas sin SEO no cuesta nada.
- **`next` validado** — ver §4.7.
- **Escena del logo: el libro que se abre** (`escena-logo.tsx`, portada de
  `../logo/especificacion/justihn-logo-scene.jsx`). Cuatro actos en 6,8 s:
  Cerrado 1,4 s · Apertura 1,6 s (páginas a ±26°, nace el cruce) · Nombre 2,2 s ·
  Final 1,6 s. Los tiempos van en **porcentaje de un ciclo único** en `auth.css`,
  para que el bucle sea una animación por elemento y los actos no se
  desincronicen. Easings del archivo portados a curvas cúbicas (`easeOutBack` en
  la apertura). El símbolo **se corre a la izquierda como consecuencia** de que
  el wordmark ocupe sitio, no con un desplazamiento en píxeles: si cambia la
  fuente, el encuadre se recentra solo. Las dos páginas **arrancan superpuestas**
  (misma `x = 24 − W/2 = 18,15`) y se separan ±7 al girar — ese es el libro
  cerrado de verdad, una sola forma visible. `SplashJustihn` hace una pasada y
  navega a los 5 s, justo al cerrar el tercer acto. Con reduced-motion se muestra
  el logo abierto, sin movimiento.
  ⚠️ **`ancho` es un MÁXIMO, no una medida.** El lockup se dibuja a la escala
  intrínseca del archivo (788) y se reduce con `scale`, así que un ancho fijo no
  sabe nada del teléfono: a 520px en una pantalla de 390 se cortaba por los dos
  lados **y daba scroll horizontal a la página**, que además lo descuadraba —
  la vista podía quedar desplazada y el símbolo aparecía fuera de sitio. Ahora
  se recorta a `innerWidth − 40` midiendo tras el mount (no en carga de módulo,
  §4.5), y el overlay del splash lleva `overflow-hidden` para no ser nunca el
  origen de ese scroll. Verificado a 320/390/430/768/1280 en Chromium y WebKit.
- ⚗️ **Prueba en curso:** el shell usa la **aurora CLARA** de las landings, no la
  variante noche del handoff — Wesley quiere comparar. **Camino de vuelta:**
  revertir ese único commit; `landing-aurora--noche`, `FondoAurora variante="noche"`
  y `.input-noche` siguen en el CSS a propósito.

### 1.6 Jus IA — el motor real, encendido el 2026-09-01

Dejó de ser una promesa escrita y apagada: **responde citando sentencias reales
del CEDIJ**, cada una con enlace a su ficha en el portal del Poder Judicial.

**Cómo probarlo:** `pnpm dev` → `http://localhost:3000/abogados`. Consultas que
funcionan bien hoy (probadas, 8 citas cada una): prestaciones por despido
injustificado · amparo por debido proceso · reintegro del trabajador ·
requisitos de la ejecución hipotecaria · prescripción de un pagaré. Y para
enseñar el diferencial, preguntar algo fuera del corpus ("régimen fiscal de las
criptomonedas en Islandia"): responde **"no encontré fuentes"** en vez de
inventar, que es lo que ningún asistente genérico hace.

**El camino:** `api/ia/consultar` → `recuperarDelCorpus` → embedding de la
consulta (OpenAI) → RPC `buscar_corpus` en Supabase → `wrapExternalData` sobre
cada fragmento → modelo → respuesta con citas.

- **La recuperación es UNA, compartida por los dos motores** (`lib/corpus/`).
  Si viviera dentro de cada motor, el otro tendría su copia y una de las dos
  acabaría sin el filtro de materias reservadas. Cambiar de modelo generador no
  puede cambiar qué fuentes se traen ni qué filtros legales se aplican.
- **`motor-openai.ts` es el banco de pruebas, no el reemplazo.** Existe porque
  encender con Claude exigía una segunda clave y una segunda factura, y lo que
  había que validar primero no era qué modelo redacta mejor: era si la
  recuperación trae las sentencias correctas. El destino sigue siendo Claude
  (`JUSTIHN_MOTOR_IA=claude`).
- **Una cita por sentencia**, no por fragmento (`distinct on` en el RPC). La
  unidad de cita es la sentencia: a un abogado no le sirven cinco trozos del
  mismo fallo. Y un ranking plano se llenaría con la sentencia más larga, que
  por tener más fragmentos tiene más billetes en la rifa.
- **Umbral 0,45, medido** (2026-09-01, sobre 2.009 sentencias): lo pertinente
  puntúa 0,53–0,69 y lo ajeno no pasa de 0,34. Con el 0,3 inicial, "criptomonedas
  en Islandia" devolvía **cinco citas de jurisprudencia hondureña** — el modelo
  decía correctamente que no sabía, pero la respuesta salía con cinco enlaces
  debajo, con el aspecto de estar respaldada (§4.5).
- ⚠️ **La cita apunta a `sij.poderjudicial.gob.hn/sentences/{id}`, no a la API.**
  `api/getHtml?id=` devuelve JSON (`{status, message, body:"<html>"}`), así que
  quien pinchaba una cita veía un volcado. **"Toda cita debe poder abrirse" es
  la promesa que separa esto de ChatGPT**, y una cita que abre JSON la incumple
  igual que una inventada. La ruta humana la declara la propia SPA del CEDIJ
  (`path:"sentences/:id"` en su bundle).
- ⚠️ **"No se indica" es un hueco, no un dato.** El CEDIJ lo usa de relleno en
  el **52% de los órganos** y el 29% de los magistrados; `filter(Boolean)` lo
  dejaba pasar porque no es cadena vacía, y las citas salían como
  «AC-834-22 · No se indica · 2025». Se normaliza a NULL al ingerir **y** se
  filtra otra vez en `recuperar.ts`: la base ya tiene filas viejas, y una cita
  mal formada es lo primero que se ve del producto.

**Límite conocido — EN CIERRE (2026-09-01):** preguntas de LEGISLACIÓN ("¿qué
artículo regula la cesantía?") contestan apoyándose en sentencias que citan el
artículo — pueden acertar de rebote. El cierre ya está construido en las dos
puntas:
- **App:** `recuperarDelCorpus` busca también en `buscar_legislacion` (misma
  vectorización, la norma va antes que su aplicación en las citas; la cita del
  artículo abre el PDF oficial en su página con `#page=N`). Mientras el RPC no
  exista, degrada a "solo jurisprudencia" con un aviso único — verificado.
- **Pipeline:** `justihn/automatizaciones/legislacion/` — descarga, extracción
  y parser con tests (2.162 artículos: Trabajo 875 · Familia 357 · CPC 930,
  contrastados con los artículos de las guías). El Penal de 1983 NO se carga:
  derogado desde 2020.

**Lo único que falta** es el gate de siempre: pasar
`automatizaciones/legislacion/esquema/01-legislacion.sql` en el editor SQL de
Supabase (Wesley) y correr `node ingesta.mjs && node embeddings.mjs` (~US$0,02).

### 1.7 Jurisprudencia sobre el corpus real — conectada el 2026-09-02

La pantalla dejó de ser vitrina de 12 seeds: busca sobre las **18.314
sentencias legibles** (19.742 menos las 1.428 reservadas por §5, que RLS
esconde a la clave `anon`). Todo pasa por `guard()`; nada gasta LLM.

- **Dos modos, decididos al arrancar la sesión.** *Por palabras* (por defecto):
  Postgres puro —ILIKE sobre el resumen del CEDIJ y el expediente, AND entre
  palabras—, conteo exacto, 20 por página, más recientes primero. *Por
  significado*: vectoriza la consulta (~US$0,00002) y usa el MISMO RPC
  `buscar_corpus` que Jus IA; hasta 30 afines ordenadas por afinidad, sin
  páginas — un ranking semántico no tiene «página 7», y la UI lo dice. El modo
  semántico lleva techo global propio (3.000/día) porque no es gratis.
- **`sentencias.texto` NO es la sentencia: es la FICHA JURISPRUDENCIAL** del
  CEDIJ (verificado sobre 400 filas: las 400 terminan en «Sentencia ·
  @documento»). `lib/corpus/ficha.ts` la parsea —rótulos de una línea y bloques
  Tesauro / Respuesta / Consideraciones / Legislación aplicada, repetibles (1,5
  problemas jurídicos por ficha)— y extrae fallo, partes, tesauro y legislación
  en **400 de 400**. Se parsea en la app, no en la base: un solo dato de origen.
- ⚠️ **Dos columnas mienten con su nombre.** `fallo` guarda el estado de
  publicación («Publicada» en el 100% de la muestra): el fallo real solo vive
  en la línea «Fallo …» de la ficha. Y `organo` es el **tribunal de
  procedencia** (la instancia recurrida), no quien resolvió: en una card se
  leería como si la Corte de Apelaciones hubiera dictado la casación. Toda
  sentencia del corpus la dictó la CSJ; la procedencia va en la ficha, con su
  rótulo. Hay test para las dos.
- **El título se deriva**: solo el 3% de las fichas trae «Tema». Para el resto,
  la ruta del tesauro del primer problema sin su primer nivel (la rama); último
  recurso, proceso + expediente. Nunca texto inventado.
- **Umbral semántico 0,45, remedido sobre el corpus completo.** Con 0,35,
  «criptomonedas en Islandia» devolvía 15 sentencias hondureñas (0,36–0,40):
  sobre 17.000 fichas el ruido sube a 0,40; lo pertinente sigue en 0,58–0,70.
- **El CEDIJ tiene sentencias publicadas dos veces** (CL-463-01: `record_id`
  1173 y 1224, misma fecha). Se colapsan por expediente + fecha en lo que se
  enseña; el conteo total no se toca.
- **Los slugs del piloto siguen vivos** (`/abogados/jurisprudencia/cl-528-24`,
  enlazados desde Dashboard, Jus IA y demos): la ruta resuelve el expediente en
  la base y redirige al `record_id`; si no está (reservada o sin capturar),
  enseña el seed como antes.
- **Búsqueda por nombre (Monitoreo · Mi nombre · Verifica): gateada por la
  migración `03-partes.sql`.** ILIKE sobre `texto` NO sirve: medido, un término
  inexistente tarda 2,2 s (barrido secuencial de 192 MB — el índice trigram de
  `01-corpus.sql` no responde o no llegó a crearse) y cae por `statement
  timeout` a los 3 s. La columna `partes` (recurrente + recurrido normalizados,
  la escribe `partes.mjs`) lo vuelve instantáneo. ✅ **Migración pasada y
  columna rellena el 2026-09-02** (19.742 filas, 0 sin partes): las tres
  pantallas ya responden sobre el corpus. Si alguna vez la columna faltara, el
  endpoint responde `disponible: false`, el hook cae al piloto y las pantallas
  dicen de dónde salió la respuesta (`NotaFuenteApariciones`); un error de red
  se enseña como error, nunca como «sin apariciones». La app detecta sola la
  columna (deja de recibir `42703`): cero cambios de código.
- ⚠️ **Rellenar `partes` destapó un falso positivo grave de §5** (mismo día):
  la señal «delito sexual» tenía `autor` sin límite de palabra y una ventana
  de 60 caracteres entre sujeto y «violación», así que «la sentencia
  **acusada** y la ley, demostrando con claridad la **violación**» —fórmula de
  toda casación técnica— reservaba **756 casaciones laborales** (entre ellas
  CL-528-24, la del demo), 139 amparos y 13 contencioso: 1.009 sentencias
  invisibles para Jus IA y el buscador. Regla reescrita en `reserva.mjs`
  (sujeto SEGUIDO de «por/de violación», exclusión de «violación de ley / de
  los deberes / de domicilio…», listas «delitos de rapto, violación y…», y
  señales explícitas: agresión, hostigamiento, acoso, «delito sexual»,
  «indemnidad sexual»), medida en seco sobre las 19.742 fichas locales antes
  de aplicarla y auditadas una a una las 101 penales liberadas. Resultado:
  **1.009 liberadas · 14 reservadas nuevas** (todas hostigamiento o agresión
  sexual) · reservadas 2.423 → **1.428 (7,2%)**.
- **Un resultado por nombre para toda la pantalla** (`useAparicionesDe`): la
  columna lateral y cada card salen del mismo dato; con dos derivaciones
  podrían contradecirse. Caché por nombre a nivel de módulo.

### 1.8 Legislación sobre las tablas reales — conectada el 2026-09-03

La pantalla dejó de enseñar seis síntesis del CPC escritas a mano: lee los
**2.162 artículos** de `codigos` + `articulos` (Trabajo 875 · Familia 357 ·
Procesal Civil 930, cada uno con la página del PDF oficial). Mismo reparto
que Jurisprudencia: `api/legislacion/buscar` tras `guard()`, dos modos, y
**cada artículo es una ruta real** (`/abogados/legislacion/[codigo]/[numero]`)
con su texto, el PDF abierto en su página, los vecinos por posición y la
herramienta del portal que lo aplica.

- **Dos modos.** *Por número o palabras*: si la consulta parece un número
  («120», «art 120-A») va directo al artículo; si no, ILIKE con AND sobre el
  texto, **en el orden del código** (un código se lee en orden, no por
  fecha), 20 por página, y **sin consulta lista el código entero** — es la
  forma de leerlo, no solo de buscar en él. Medido: 0,15 s sin índice
  trigram (2.162 filas de ~1 KB). *Por significado*: el MISMO RPC
  `buscar_legislacion` que Jus IA, sobre los tres códigos a la vez (el RPC no
  filtra por código), hasta 12 por afinidad, techo global propio (3.000/día).
- **Umbral 0,45, medido otra vez sobre los artículos** (2026-09-03):
  pertinentes 0,51–0,71 · ajenas 0,19–0,33. Un solo número para Jus IA,
  Jurisprudencia y Legislación porque el modelo de embeddings es uno.
- ⚠️ **El seed tenía dos artículos INVERTIDOS.** Decía que el art. 399 del
  CPC era el proceso abreviado (tope L100.000) y el 400 el ordinario. El PDF
  oficial dice lo contrario: **399 = ámbito del ordinario, 400 = ámbito del
  abreviado** (reformado por Decreto 21-2015). Estuvo así desde el 2026-08-25
  enlazado desde Calculadoras. Es la razón de que la pantalla ya no enseñe
  síntesis: enseña el texto, y el seed solo guarda los **destacados** (los
  artículos que otra pantalla ya aplica) con número, rótulo, nota y
  herramienta.
- ⚠️ **Los ids del seed no eran los de la tabla** (`cpc` vs
  `codigo-procesal-civil`): la pantalla habría preguntado por un código
  inexistente. El seed ahora usa los ids de `articulos.mjs` y `ALIAS_CODIGO`
  resuelve los enlaces viejos (`?codigo=cpc` y `/legislacion/cpc/40`
  redirigen). `legislacion.test.ts` fija los tres ids cargados.
- **Solo el CPC trae rúbricas** («Artículo 676. OBJETO .», «Artículo 399. -
  ÁMBITO DEL…», con la nota al pie pegada «ABREVIADO.1»): `parsearArticulo`
  (`lib/corpus/articulo.ts`, puro) las separa y las pasa a frase; en 400
  fichas del CPC, 363 la traen. Trabajo y Familia no titulan: la card enseña
  el número y, si es destacado, el rótulo del portal **diciendo que es del
  portal**. Sin rúbrica ni destacado, solo el número: nunca un título inventado.
- **ILIKE no ignora tildes** («cesantia» no encuentra «cesantía»). El estado
  vacío lo dice y ofrece el modo por significado, que sí lo entiende.
- **Cuatro artículos existen en el código y no en la tabla** (Trabajo 527 y
  529 · CPC 40 y 420: el encabezado no está en la capa de texto del PDF —
  `automatizaciones/legislacion/README.md`). `ARTICULOS_SIN_TEXTO` hace que
  buscarlos o abrir su ruta explique el hueco con enlace al PDF, en vez de
  «no existe» o un 404.
- **Móvil: la columna de seis códigos se vuelve un `<select>`**; con la
  columna, los artículos quedaban seis tarjetas más abajo.
- Se quitó el botón «Avisarme cuando esté» de los códigos en preparación:
  enseñaba un toast y no avisaba a nadie (§4.5).
- ⚠️ Trampa de E2E: el buscador global lleva `aria-label="Buscar en
  jurisprudencia, …"` y la pantalla `aria-label="Buscar en {código}"` — un
  selector `[aria-label^='Buscar en']` pulsa el global y acaba en una
  sentencia. En el recorrido, el campo se localiza por `placeholder`.
- Verificado en Chromium (escritorio y 390px, 24 comprobaciones, 0 errores
  de JS) con una cuenta de prueba creada y borrada por la API admin de
  Supabase. **WebKit no pudo iniciar sesión en `localhost` por http** (la
  cookie de sesión no se guarda): queda por comprobar sobre `justihn.com`.

### 1.9 Procesos — concluida el 2026-09-03: cada paso cita su artículo

Los cuatro procesos (despido · divorcio por mutuo consentimiento · sociedad
mercantil · amparo) llevaban «art. ___» desde el 25 de agosto: marcadores
honestos mientras no hubiera códigos cargados. Ahora **cada paso cita una o
varias fuentes que se ABREN**: los artículos de Trabajo, Familia y CPC abren
el artículo en el portal (`/abogados/legislacion/<código>/<número>`, §1.8);
las leyes que no están en la tabla abren el PDF oficial **en su página**.

- **Contrato nuevo**: `PasoProceso.fuentes: FuenteCita[]` (etiqueta + url)
  sustituye a `fuente`/`fuenteUrl`; `Proceso` gana `resumen` (el dato que
  decide si es este proceso: el plazo, la audiencia inmediata…) y
  `fuentesOficiales` (el sello de la cabecera). Tabla futura `citas_paso`.
- **Dos fuentes nuevas del Estado, verificadas el 2026-09-03**:
  **Ley sobre Justicia Constitucional** (Decreto 244-2003) en el TSC
  (`tsc.gob.hn/web/leyes/Ley Sobre Justicia Constitucional (07).pdf`, 42 pp.
  con texto) — amparo: procedencia 42, inadmisibilidad 46, plazo de DOS
  MESES 48, escrito 49, enmienda 50, informe 52-54, prueba 55-56, cautelares
  57-59, sentencia 63-67. Y el **Código de Comercio** (Decreto 73-50) en
  e-Regulations (`/media/codigo del comercio.pdf`, 418 pp. con texto). ⚠️ Es
  una edición sin las reformas recientes: se citan solo artículos
  estructurales (14 contenido de la escritura, 93 fundación ante notario,
  95 certificado de depósito, 18 quince días para inscribir, 384 registro
  en la Cámara), nunca mínimos de socios o capital, que han cambiado. El
  Banco Central también lo publica, pero su servidor no respondió.
- **Despido**: 864/865 (prescripción), 123 (salario promedio, reglas de la
  indemnización), 116/120/120-A/346 (prestaciones → calculadora), 638-641
  (Procuraduría gratuita, avenimiento, acta), 703/704/711 (demanda, copias,
  abogado), 755/750/749 (audiencia en 2 días, conciliación y fallo en el
  acto, incomparecencia). **Divorcio**: Familia 243-248 + CPC 631.2 (una
  sola defensa), 652 (acumulación en el convenio), 654 (recursos).
- `procesos.test.ts`: ningún «___», toda cita interna apunta a un código
  cargado con número real, toda externa es host de la whitelist y, si es
  PDF, lleva `#page=`; todo plazo nombra su artículo; el modelo existe.
- Se quitó el toast «Abriendo la fuente oficial…» que salía cuando el paso
  no tenía enlace: prometía abrir algo que no abría (§4.5).
- **Procesos entra en el plan Profesional** («Procesos paso a paso, cada
  paso con su artículo»): cierra el pendiente §6.6. Es contenido, y el modelo
  es «todo el corpus para todos los de pago, escalera por cuota de IA».
- ✅ **La Ley y el Código de Comercio son los códigos 4 y 5 de Legislación
  (misma tarde).** Motivo medido: Jus IA recuperaba bien despido y divorcio,
  pero para el amparo traía artículos del CPC y del Trabajo (0,58–0,62) y
  para la escritura de una sociedad artículos ajenos (0,50–0,55) — por
  encima del umbral, es decir, citas que no venían al caso. La pantalla y el
  asistente sabían cosas distintas. Ahora las citas de Procesos abren el
  artículo en el portal (`ljc()`/`comercio()` ya no llevan página a mano).
  - **Pipeline** (`automatizaciones/legislacion/`, README §«Los dos estilos
    nuevos»): cada código puede declarar su `patron` de encabezado (la Ley:
    «ARTÍCULO 48.-» y «ARTÍCULO 5.» sin guion, a mitad de línea; Comercio:
    «Articulo º 14» y siete con el signo de grado «°»). El PDF de Comercio
    imprime dos veces el 418 y el 1662 (erratas del origen): se renumera el
    primero SOLO en códigos con patrón propio, y se reporta. Un `\f` a mitad
    de línea ahora cuenta la página desde el encabezado. Los tres del CEDIJ
    salen idénticos salvo 157 textos que pierden un guion suelto tras el
    número («Artículo 49. - PREJUDICIALIDAD» → «Artículo 49. PREJUDICIALIDAD»).
  - **Resultado**: Ley 124/124 · Comercio 1.703 (faltan en el ORIGEN el 1000
    y 1236-1245: `ARTICULOS_SIN_TEXTO`). `Codigo.advertencia` avisa en la
    cabecera y en cada artículo que la edición de Comercio no incorpora
    reformas recientes; `legislacion.test.ts` fija los cinco ids y exige esa
    advertencia.
- ⚙️ Pendiente del socio: validar documentos y notas de práctica (son
  conocimiento del gremio, no texto de ley).

**Confirmación del correo por CÓDIGO, no por enlace** (decisión Wesley
2026-09-02, patrón Jusbrasil): el enlace saca a la persona del alta y la deja
en otra pestaña; el código la mantiene en la misma pantalla y termina con
sesión abierta ahí mismo. Lo canjea `verifyOtp(type: "signup")` en
`components/auth/codigo-correo.tsx`. ⚠️ **`LONGITUD_CODIGO` tiene que coincidir
con «Email OTP Length» del proyecto de Supabase**: el proyecto nació en 8 y la
UI dibujaba 6, así que la casilla se llenaba antes de tiempo y se verificaba un
código truncado. Hoy los dos están en 6. Las plantillas de correo con la marca
viven en `supabase/correos/`.

**El paso 2 del onboarding pide el número de identidad** (pedido de Wesley
2026-09-02), junto a la colegiación: son los dos números con los que el equipo
contrasta el carné contra el padrón del CAH, y el de colegiación solo se puede
teclear mal. `lib/identidad.ts` pone la máscara y valida los tramos del DNI
hondureño —departamento 01-18, municipio distinto de 00, año de nacimiento
plausible— con 8 tests. Es **opcional**, como todo el paso: exigirlo
contradiría el «Puedes hacerlo después» de la propia pantalla. Se guarda sin
guiones, con índice único, y **no entra en la vista `directorio`**: es dato
personal (`supabase/esquema/03-identidad.sql`, que además lo borra de
`raw_user_meta_data` tras copiarlo, para que no viaje en el JWT).
⚠️ **El paso 2 no pintaba ningún error** —solo lo hacían el 1 y el 3—, así que
al validar la identidad el botón bloqueaba en silencio. Al añadir una
validación a un paso, comprobar que ese paso tiene dónde enseñarla.

**El alta ciudadana también pide el número de identidad**, justo tras el
nombre (pedido de Wesley 2026-09-02): el abogado que atienda el caso lo
necesita para actuar por la persona. Es **opcional** y lo dice bajo el campo,
porque quien solo viene a leer una guía de trámites no tiene por qué entregar
su documento, y el alta corta es lo que sostiene la vía B. ⚠️ El copy prometía
que el correo era «lo único que te vamos a pedir»: dejaba de ser cierto y se
cambió. `personas.identidad` y `abogados.identidad` comparten reglas —13
dígitos sin guiones, índice único, fuera de toda vista pública— y el trigger
borra el dato de `raw_user_meta_data` en las dos vías, para que un documento
de identidad no viaje dentro del JWT en cada petición.

**Los dos portales cierran sesión de verdad** (2026-09-02): el botón ya existía
en el menú del avatar y solo enseñaba un aviso de demostración. Ahora hace
`signOut`, `router.replace` **al login** (`/iniciar-sesion`, con `?tipo=persona`
desde el portal ciudadano; decisión Wesley 2026-09-02, antes iba a la landing)
y `router.refresh()`. Los
tres pasos hacen falta: el primero borra las cookies que lee el proxy, el
segundo saca el portal del historial y el tercero invalida el caché de rutas
de Next, sin el cual se puede volver a pintar una pantalla ya renderizada con
la sesión anterior.

**El logo de las pantallas de auth vuelve a su landing** (pedido de Wesley
2026-09-02): el onboarding a `/para-abogados`, el alta ciudadana y el
restablecer a `/`, y el login a la que corresponda a su vía.

⚠️ **El splash bloquea el scroll del documento mientras dura** (`splash.tsx`):
es `fixed` y se recorta solo, pero la página de auth de debajo mide más que la
ventana y se podía arrastrar la escena para ver la card asomando. Restaura el
valor anterior al desmontar, no lo pone a `""`.

### 1.5 Marca

- **Card «Papel» en los dos portales** (decisión Wesley 2026-09-02, «si no me
  gusta, lo revertimos»). Se compararon cuatro tratamientos sobre el Dashboard
  real —Actual · Vidrio · Papel · Trazo— en un prototipo intercambiable:
  https://claude.ai/code/artifact/0ed80186-a4da-44c8-aac4-deb6e36c1cce.
  Papel = sin borde visible, radio 16, sombra tonal marina en dos capas
  (`--shadow-papel`), y la interactiva se levanta 1px al pasar el mouse. Motivo:
  sobre el lienzo Cielo el borde gris de 1px se perdía y las cards no se
  separaban del fondo. Vidrio (glass) se descartó por costo de GPU en listas
  largas y contraste en pantallas baratas. Vive en UN sitio: el primitivo
  `Card` de `ui/primitivos.tsx` (+ 2 tokens en `globals.css`); revertir es ese
  bloque.

- **Favicon:** `src/app/icon.svg` **ES** `logo/justihn-icon.svg`, con el viewBox
  recortado a la tinta (`4.1 1.1 39.9 39.9`) y sin adaptación a modo oscuro — el
  logo no cambia de color. ⚠️ Rompe a propósito la ficha de marca (que pedía la
  variante "sin cruce" a ≤20px): se prioriza que la pestaña se vea como el logo.
  `favicon.ico` se genera del mismo SVG.
- **Lockup:** gap de **5px** en el nav y en `LogoJustihn` — medido sobre el render
  a 4× contando columnas con tinta (9.2px de hueco visual). El símbolo aporta
  ~2.4px de aire propio dentro de su viewBox; descontarlo es lo que faltaba.
- **Tarjetas Open Graph:** tres 1200×630 generadas con `next/og` **en el build**
  (~150 KB c/u — WhatsApp descarta las pesadas): la general, la ciudadana y la de
  abogados. Componente único en `lib/og/tarjeta.tsx`. Ver §4.7 para las trampas.

---

## 2. Stack (pins reales)

Next.js 16.3 (App Router) · React 19.2 · TypeScript 5.9 · Tailwind v4 ·
Zustand 5 (persist) · Zod 4 · Radix Dialog · Vitest 4 · pnpm. GSAP por import
dinámico (solo decoración).

Instalados y listos para Fase 2, aún sin cablear: `@anthropic-ai/sdk`,
`@upstash/ratelimit`, `@tanstack/react-query`, `lucide-react`.

## 3. Mapa del código

| Ruta | Qué vive ahí |
|---|---|
| `src/app/abogados/` · `src/app/personas/` | Los dos portales, cada pantalla una **ruta real** (no estado) |
| `src/app/(landing)/` · `(profesional)/` · `(profesional-black)/` · `(publico)/` · `(auth)/` | Las superficies públicas, cada grupo con su shell |
| `src/app/api/` | `ia/consultar` (Jus IA) · `jurisprudencia/buscar` (dos modos, §1.7) · `legislacion/buscar` (dos modos, §1.8) · `corpus/apariciones` (nombre como parte). Todo pasa por `guard()` antes de gastar nada |
| `src/lib/security/` | **El harness (§3 del blueprint).** `api-guard` · `rate-limit` · `sanitize` · `ai-safety`. Toda superficie de servidor lo consume; no reinventar por ruta |
| `src/lib/ai/` | `router-demo` (Fase 1, determinístico) · `motor-claude` y `motor-openai` (Fase 2, **encendidos**) · `sin-fuentes` (la negativa, en un solo sitio) · `tipos` (el contrato que cumplen los tres) |
| `src/lib/corpus/` | **El RAG y el buscador.** `supabase` (RPC con la clave `anon`) · `embeddings` (vectoriza la consulta) · `recuperar` (**una sola recuperación para los dos motores** — ver §1.6) · `ficha` (parser de la ficha del CEDIJ) · `catalogo` (materias/procesos, puro, lo importa la pantalla) · `sentencias` (búsqueda, ficha por id, apariciones por nombre — §1.7) · `articulo` (puro: parser de rúbricas y números) · `legislacion` (búsqueda, artículo, vecinos — §1.8) |
| `src/lib/og/tarjeta.tsx` | El componente único de las tres tarjetas sociales |
| `src/data/` | Seeds = **contrato literal** de las tablas Supabase futuras. Cada archivo lleva su `TODO(data)` con la fuente real |
| `src/store/portal.ts` | Zustand + persist en `justihn-portal-v1` (misma clave del prototipo) |
| `src/hooks/` | `use-saludo` · `use-preguntar-jus-ia` (prefill o `enviarDirecto` + navegar al chat) · `use-jus-ia` · `use-busqueda-url` (leer la query en cliente sin romper el SSR) · `use-en-vista` |
| `src/components/landing/` | Lo compartido por las tres landings: `fondo-aurora` · `nav-aurora` · `pie-aurora` · `demo-marco` · `magnetico` · `desplazamiento-suave` · `secciones` · `landing.css` |
| `src/components/publico/tarjeta-abogado.tsx` | **La card oficial del abogado** — un solo sitio, tres superficies (ver §4.5) |
| `src/components/ia/` | Chat de Jus IA + `boton-jus-ia.tsx` (botón canónico de la acción de IA) |
| `src/components/brand/` | Logos e iconografía con la **geometría oficial** del handoff |
| `src/components/ui/primitivos.tsx` | Primitivos patrón shadcn, copiados y personalizables |

## 4. Reglas propias de este proyecto

1. **Sin fuente no hay respuesta.** Es la promesa del producto, no una
   optimización: `motor-claude.ts` prefiere decir "no encontré fuentes" antes que
   responder de memoria. No relajar esto para "que se vea mejor la demo".
2. **Todo dato externo es DATO, nunca instrucción.** Sentencias con OCR, PDFs de
   Gaceta y documentos que sube el abogado pasan por `wrapExternalData()` antes de
   tocar un prompt (§3.2 del blueprint). Cubierto por tests.
3. **Fallar cerrado.** Rutas `role: "session"` devuelven 401 mientras Supabase Auth
   no esté cableado. Nunca "pasa por ahora".
3.5. **Una consulta admite VARIAS respuestas** (decisión Wesley 2026-08-31,
   patrón Jusbrasil): cualquier abogado Premium puede responder y la persona
   compara antes de escribirle a uno. No es un reparto de leads — asignar la
   consulta al primero dejaría al ciudadano con quien llegó primero, y dejaría
   sin vitrina a los demás, que es el argumento de por qué se paga Premium.
   `leadsRespondidos` es `Record<id, RespuestaConsulta[]>`; **era un solo
   `string`**, así que el segundo abogado en responder borraba al primero
   mientras el portal del abogado ya decía "tu respuesta + N de otros abogados".
   Cada respuesta guarda solo `abogadoId` y `getFirmante()` la resuelve —
   **sin autor identificable no se pinta** (§4.5), y cada una lleva SU botón de
   contacto, porque un único botón al pie obligaría a recordar cuál convenció.
   ⚠️ El store va por **`version: 2` con migración encadenada**: hay navegadores
   con el formato viejo y `.map` sobre un string revienta la pantalla.
4. **Un solo lugar por dato de dominio.** Precios en `data/catalogo.ts` (incluido
   `destacado`, que decide insignia, realce e imán en las cuatro superficies donde
   aparecen planes); cálculo laboral en `lib/prestaciones.ts`. Si la UI y Jus IA
   dan números distintos, es un bug de duplicación.
5. **Determinismo/SSR.** Nada de `Date.now()`/`Math.random()` en carga de módulo.
   El saludo por hora y el store persistido se hidratan **tras el mount**.
6. **Fidelidad de marca.** Geometría de logos fija; el cruce `#0e5f92` solo vive
   dentro del símbolo y en el hover de botones celestes — nunca como color de
   interfaz suelto.

### 4.5 No fabricar pruebas (la regla que más ha corregido código)

Lo público decide a quién contrata una persona y a qué se suscribe un abogado.
Nada que sugiera evidencia puede salir de la nada:

- **Fuera "★ valoración"** de todas las superficies públicas (estaba en cinco):
  no existe sistema de reseñas, ese número no lo producía nadie. Se sustituye por
  **años de ejercicio**, que sí es verificable. El campo `valoracion` sigue en el
  seed solo porque el panel del abogado lo muestra como métrica propia.
- **Fuera los conteos** (contactos, respuestas): vanidad. Uno con 34 respuestas no
  es mejor que uno con 12, y contarlas premiaría publicar por publicar.
- **La cita de la card** sale de una respuesta real del abogado en el consultorio,
  **no de un campo que él redacte** — si lo escribe él, vuelve a ser marketing.
  Es el diferencial: deja juzgar CÓMO explica antes de escribirle, y nadie puede
  copiarla sin un consultorio detrás. Va entera en el directorio (donde se decide)
  y la variante `compacta` la cambia por el resumen en la home (donde solo se
  enseña que hay abogados).
- **Nada de "Contactar por WhatsApp" en el primer toque:** sacaba el contacto de
  Justihn sin registro ni trazabilidad, y sin poder demostrarle al abogado cuántos
  contactos le trajo la plataforma — que es lo que sostiene que pague. Es
  **"Consultar con [nombre]"**; WhatsApp llega cuando ya hay conversación.
- **No prometer inventario que no existe.** La landing no anuncia cifras de
  sentencias mientras el corpus no esté indexado (la home llegó a afirmar que Jus
  IA citaba "las 20.202 sentencias" con 12 en el seed y el motor apagado). El
  lenguaje de inventario solo trabaja encima del composer, diciendo qué se puede
  preguntar.
- **No copiar la escasez de las referencias** ("los primeros 200 aseguran estas
  condiciones"): sería inventarse un cupo. El gancho es la gratuidad, que sí es verdad.
- **Sin fuente no hay sello.** Al tocar una guía de trámite, o se mantiene su
  `fuenteUrl`, o se quita el sello "Verificado con la fuente oficial".

### 4.6 Una salida por decisión

Cada bloque empuja al paso siguiente y nada compite con él. Se quitaron por esto:
"Ver todas las consultas del consultorio", el enlace al directorio bajo las guías
(cada guía ya cierra recomendando abogado de su materia), "Ver todo el directorio",
"Ver el portal por dentro" en el CTA final (ofrecía entrar sin cuenta justo donde
se pide crearla), y el "Empezar →" de las cuatro puertas de la home (competían con
las secciones reales de justo debajo, así que el visitante decidía dos veces lo
mismo; llevan `glass-card--estatica`, sin el hover que promete un clic que no existe).

La página tampoco termina dos veces: la cross-sell a la vía A va **antes** del CTA
oscuro, no después.

### 4.7 Trampas verificadas (leer antes de tocar una landing)

1. **`.landing-aurora a { color: inherit }` le gana por especificidad a
   `text-white` de Tailwind.** Cualquier utilidad de color sobre un `<a>` de una
   landing se pierde en silencio — **el color va inline**. Ha mordido tres veces
   (botones del CTA, "Conocer Justihn para abogados", "Ir al consultorio"). Al
   mover una página al shell aurora, **revisar todo `text-white` sobre `<a>`**.
2. **`useSearchParams` bajo `<Suspense>` = contenido invisible para Google.** Ese
   hook hace que Next abandone el prerenderizado del subárbol y emita el fallback:
   la home llegó a servir 130 caracteres de texto en vez de 7.452. Se lee la query
   con `useSyncExternalStore` sobre `window.location.search` (`hooks/use-busqueda-url.ts`),
   o en el servidor con `searchParams` de la page.
3. **Los filtros ocultan, no montan.** Las tres rutas de trámites se renderizan
   siempre y el chip activo esconde las otras con `hidden`. Si se montara solo la
   activa, 4 de las 9 guías dejarían de existir para el crawler.
4. **Un `<a>` con transform propio pierde una animación.** GSAP escribe `transform`
   para el imán magnético; si el elemento ya tiene un `:hover` con transform
   (`.glass-card` sube 2px, `.btn-celeste` −1px), una de las dos se pierde en
   silencio. `magnetico.test.ts` lo topa.
5. **Longitudes dentro de un SVG dependen del motor.** `translateX(7px)` se
   interpreta como unidades del viewBox o como píxeles CSS según el navegador — el
   logo salía torcido en Safari. La separación va en la propiedad de geometría
   **`x`** (siempre unidades del viewBox), con el giro sobre el centro de cada
   pieza (`transform-box: fill-box` + `50% 50%`). Y **`zoom` no es estándar** y
   escala el texto de otra manera: para reducir un lienzo, `transform: scale`.
6. **satori (`next/og`) no lee woff2**, que es lo único que deja `next/font` en el
   build — por eso las fuentes van versionadas en TTF (`app/_og-fuentes/`, OFL).
   Y sin **`metadataBase`** Next emite el `og:image` relativo y WhatsApp no pinta
   nada. El origen vive en la constante **`SITIO`** (`app/layout.tsx`) y en ningún
   otro lado: es **`https://justihn.com`** desde el 2026-08-30, con
   `NEXT_PUBLIC_SITIO_URL` como override para previsualizaciones. Mientras estuvo
   en la URL de Vercel, compartir el dominio nuevo pedía la miniatura al viejo. El `og:url` va **por página**: uno global en el layout haría que
   toda página compartida se canonizara como la home. `noindex` no afecta a esto
   — el rastreador de WhatsApp lee las Open Graph igual.
7. **Chromium fuerza `line-height: normal !important` en `<select>`.** Dos campos
   contiguos (input + select) no se igualan tocando el interlineado: hay que darles
   **altura explícita**. Pasó en el formulario del consultorio (40 vs 42,3px) y en
   el onboarding (44 vs 45px).
8. **El `next` del alta se valida** (`destinoSeguro()` en
   `app/(auth)/crear-cuenta/page.tsx`): debe empezar por `/personas` y no por `//`.
   **No quitarlo** — sin él es un redirect abierto colgando de un formulario que
   pide correo y contraseña, justo donde sirve para mandar a alguien a una página
   falsa después de escribir sus datos.
9. **Área táctil = 24×24 (WCAG 2.5.8), con los enlaces dentro de una frase
   exentos** — ahí el tamaño lo manda el texto. Un listón de 32px da falsos
   positivos. El toggle "Ver" de la contraseña está en posición absoluta: se
   agranda con `right-3 → right-1 + px-2`, que compensa los 8px exactos sin mover
   el texto.
10. **El desplazamiento suave va en JS, no en `html { scroll-behavior: smooth }`.**
    Esa regla es global y alcanza también al salto al principio que hace Next al
    cambiar de ruta: en una home de 8.000px, abrir un trámite se volvería un scroll
    animado de varios segundos. `desplazamiento-suave.tsx` intercepta solo las
    anclas de la propia página, respeta ⌘/ctrl/shift-clic, frena 96px antes para
    que la nav no tape el encabezado y da un destello de 1,4 s en el destino.
11. **Los colores del pie van en `.pie-aurora` (landing.css), no inline** — un
    color inline le ganaría a la clase y dejaría texto marino sobre marino.
12. **Una guía fuera de `RUTAS_TRAMITE` desaparece de la home** aunque exista en
    el seed y en su URL. Es invisible leyendo el código, así que `tramites.test.ts`
    lo topa (cada trámite en exactamente una ruta, sin repetir, sin inventar ids,
    sin colar procesos judiciales, y todas con `tasaCorta`).
13b. **Un conteo de guías escrito a mano se queda viejo al nacer la 14ª.** La
    tarjeta social de la home decía "13 guías con fuente" y el número vive en
    `TRAMITES.length`: ahora se deriva del seed. `og.test.ts` acepta plantillas
    además de comillas por eso — si vuelve a aceptar solo `"..."`, el sello
    derivado desaparece del conteo y el test miente.
13. **`tasaCorta` y `tasa` no pueden decir cosas distintas** — la corta es la
    verificada condensada a una línea, no un dato nuevo. Al editar una, revisar la otra.
14. **Ninguna página nombra la marca sin `absolute`**, o la pestaña dice "Justihn"
    dos veces. Se coló en tres páginas a la vez; `app/titulos.test.ts` lo topa.
15. **El imán magnético va SOLO en los botones azules sólidos** (nav, enviar del
    composer, plan destacado, CTA de cierre). En un botón de solo borde no se lee
    como intención sino como que el botón tiembla, y si todo se mueve el efecto
    deja de señalar la acción principal. Se apaga con `prefers-reduced-motion` y
    sin `(hover:hover) and (pointer:fine)` — en táctil el botón se escaparía al tocarlo.
16. **El botón lleno de la nav es "Crear cuenta gratis", no "Iniciar sesión"** en
    las dos landings. Dos razones: el botón lleno es para la acción que la página
    busca, y por debajo de 980px el nav esconde los enlaces de texto — lo que
    queda visible es ese botón más el menú de móvil (siguiente punto).
17. **El menú de móvil (`<980px`) es lo único que da acceso a las secciones y al
    cambio de audiencia** en un teléfono. Hasta el 2026-08-30 no existía: el nav
    era logo + "Crear cuenta gratis" y punto, así que ni se llegaba a una sección
    ni había puerta a la otra vía. Tres cosas que se rompen fácil al tocarlo:
    - La regla base `.nav-burger { display: none }` tiene que ir **antes** del
      `@media (max-width: 980px)` que la pone en `flex`: misma especificidad, gana
      la última. Con el orden invertido el botón no aparece nunca — y el fallo se
      ve solo en móvil.
    - El panel se **oculta con `display:none`, no se desmonta** (misma regla que
      los filtros de trámites): así el crawler conserva los enlaces y el foco no
      entra en un menú cerrado.
    - **No bloquea el scroll del body** a propósito. Con `overflow:hidden`, el
      clic en un ancla se pisaría a sí mismo: `desplazamiento-suave.tsx` escucha
      en `document` y corre ANTES de que React aplique el cierre, así que su
      `scrollTo` no movería nada.
18. **Un `setState` dentro de un `useEffect` no pasa el lint** (`react-hooks/
    set-state-in-effect`), y es el reflejo natural para resolver "hoy" o la hora
    local tras el mount. El mecanismo del proyecto es **`useSyncExternalStore`
    con el valor memoizado** (`hooks/use-saludo.ts`: `useSaludoPorHora`,
    `useTitularJusIA`, `useSemanaActual`, `useHoy`) — sirve el valor neutro en
    SSR y el real después, sin render en cascada. Al necesitar un dato que solo
    el navegador conoce, añadir un snapshot ahí en vez de un efecto.
19. **Un componente reutilizado en dos superficies no puede traer su `<h1>`
    fijo.** `CalculadoraPublica` es el título de `/calculadora-prestaciones`,
    pero dentro de `/personas/calculadora` convive con la de plazos: dejaba dos
    h1 y titulaba la pantalla "Calculadoras" con "¿Te despidieron?". Baja a `h2`
    con `enPortal`. Al montar un componente público dentro de un portal,
    revisar su encabezado.
20. **`min-w-[Npx]` sobre un `flex-1` desborda en pantallas estrechas.** El
    mínimo es rígido: a 320px la card de cross-sell de la home se salía 9px (19 en
    WebKit, que reserva más barra de scroll). Se escribe **`min-w-[min(Npx,100%)]`**,
    que conserva el punto de envoltura en anchos medios sin forzar el estrecho.
    ⚙️ Quedan varios `min-w-[180..240px] flex-1` en los portales — revisar en el
    refinado del pendiente #1.
21. **Un tiempo relativo («hace 2 h») nunca se guarda ni se calcula en
    servidor.** El servidor no sabe la hora del visitante y un `Date.now()`
    en SSR es un mismatch de hidratación esperando. El dato es `creadoEn`
    (ISO) y lo pinta `<Cuando iso>`: fecha corta en SSR, relativo tras el
    mount vía `useAhora()`. Agrupar por recencia (Notificaciones) usa
    `grupoRecencia(iso, ahora)` con el mismo reloj; sin reloj todo cae en
    «Anteriores» y se reparte al hidratar. Si una pantalla nueva necesita
    «hace X», no inventar otro formateador: `lib/tiempo.ts` es el único.

## 5. Comandos

```bash
pnpm dev          # http://localhost:3000
pnpm type-check   # tsc --noEmit
pnpm test         # Vitest (262 tests de invariantes)
pnpm build        # gate antes de cualquier entrega
```

**Gate de verificación (§5 del blueprint):** `lint` + `type-check` + `test` +
`build` verdes en cada incremento, más verificación visual con Playwright (y con
**WebKit** cuando se toque SVG, animación o layout fino: ahí es donde aparecen las
diferencias de motor de §4.7).

Los tests cubren lo que no se ve leyendo el código: el harness de seguridad
(inyección, enmascarado, hosts oficiales), el determinismo y honestidad del router
(expedientes reales / inexistentes / casos propios), prestaciones, plazos, vía
procesal, las 14 guías con fuente en la whitelist, los plazos legales (que su artículo
siga en el texto de su guía, y el cálculo por meses/años en bisiestos y meses
cortos), las instituciones (ninguna card vacía, ningún `institucionId` huérfano,
ningún portal fuera de la whitelist), el buscador de guías (que encuentre por
las palabras del ciudadano, sin tildes, y que toda guía sea alcanzable), los
títulos de página, las
rutas de trámites, las colisiones de transform del imán, y el parser de la ficha
del CEDIJ (fallo real vs estado de publicación, partes, problemas múltiples,
título derivado) con el mapeo fila → `Sentencia`, y el de los artículos
(rúbricas del CPC con nota al pie pegada, números con letra, el catálogo de
códigos como contrato de la tabla `codigos` y los alias viejos).

**Recorridos E2E** (2026-08-30): los scripts de los tres caminos de un visitante
viven en el scratchpad de la sesión, no commiteados — dependen del servidor de
desarrollo. Encontraron dos defectos que solo se ven recorriendo: el gate de
cuenta que se saltaba el alta y las áreas táctiles (ambos en §4.7). Estado verde:
33 comprobaciones de recorrido, 0 desbordes y 0 errores de JS en móvil y
escritorio en Chromium y WebKit, 21 enlaces internos vivos, un solo `h1` por
página, y la home sirviendo **11.462 caracteres de texto sin JS**.

## 6. Pendientes — próxima sesión (en orden)

> **Foto al cerrar el 2026-09-02:** 🎉 **EL CORPUS ESTÁ COMPLETO Y EN VIVO.**
> 19.742 sentencias · 150.600 fragmentos, TODOS vectorizados (~US$1,25 total) ·
> 2.423 reservadas por §5 (12,3%) · + 2.162 artículos de legislación. Jus IA
> responde en **justihn.com** con el motor real: Upstash conectado (interlock
> verde), techo diario armado, rate limit probado en producción (429 al nº 21),
> y la negativa honesta verificada en vivo. El launchd nocturno quedó
> descargado: el corpus pasa a mantenimiento con el **refresco semanal** de
> `tareas-desde-la-mac.md` §1b (captura de lo nuevo + espejo de retiradas).

0. [x] ✅ **CORPUS COMPLETO Y EN VIVO (2026-09-02).** Lo que este punto pedía
   quedó hecho: captura terminada (19.742 de 20.232 — las ~490 restantes viven
   en páginas que la paginación profunda de la API devuelve vacías; el refresco
   semanal las recogerá cuando el listado las sirva), variables en Vercel,
   Upstash del Marketplace conectado (alias `KV_*`), límite de gasto en OpenAI
   (US$50) y disco de Supabase en 8 GB con ~6 libres.
   **Las tres averías de la carga masiva y sus defensas** (ya en el código,
   las hereda la próxima fuente grande — La Gaceta):
   - **La API devuelve páginas vacías por hipo Y tiene huecos de paginación
     profunda** (398-404 vacías con la 405 llena): el scraper reintenta 3
     veces y luego SALTA la página; el fin solo se declara pasado el total.
   - **El WAL de Postgres crece más rápido que el autoscaling del disco de
     Supabase** en cargas masivas (error 53100 con el disco "vacío"): pausa
     de 1,5 s entre lotes de embeddings.
   - **El índice HNSW encarece cada insert a medida que crece** (statement
     timeout 57014 a los ~40k vectores): las escrituras van en tandas de 50
     con reintento.

1. **🔎 REFINADO FINAL DE LOS DOS PORTALES — `/abogados` (15 pantallas) y
   `/personas` (17 rutas) — ANTES de congelar el esquema de Fase 2** (decisión
   Wesley 2026-08-30; entonces se decía "antes de Supabase" — el proyecto ya
   existe por el corpus, pero las tablas de NEGOCIO —abogados, leads, planes—
   siguen sin crearse y los seeds siguen siendo su contrato).
   Va primero por un motivo técnico, no de gusto: **los seeds son el contrato
   literal del esquema**. Si el refinado cambia un dato, renombra un campo o
   descubre que falta uno, ahora cuesta una línea; con las tablas ya creadas
   cuesta una migración. Las landings y auth quedaron cerradas el 2026-08-30
   (E2E en §5), así que esto es lo único que queda de Fase 1.
   Qué mirar, por orden de riesgo:
   - **Los seeds como esquema:** ¿algún campo del portal no existiría en la
     tabla? ¿Alguno sobra? ¿Nombres consistentes entre `data/*.ts` (hoy conviven
     `plantillaId` con la pantalla llamada Modelos)? Esto es lo que congela.
   - **Las entidades nuevas del feedback del socio** (instituciones, trámites por
     institución, directorio público, planes vía B): decidir si entran al esquema
     inicial o a una migración — y si necesitan pantalla mock-first primero.
   - **Recorrido de las 24 pantallas** con el patrón que ya funcionó: escritorio
     y móvil, deep-links, estados vacíos, y que nada prometa lo que no hace (§4.5).
   - **Lo que el E2E dejó fuera:** los portales solo se tocaron de refilón — el
     recorrido cubrió las cinco pantallas públicas.

   **Auditoría de los seeds como esquema — primera pasada (2026-09-02).**
   Se leyó `types/dominio.ts`, los 15 seeds de `data/` y el estado persistido
   del store con la pregunta «¿esto sería una columna?». Lo que se corrigió y
   lo que queda decidido:
   - ✅ **Un solo id para la abogada demo.** Tenía dos (`demo-abogada-castillo`
     en el perfil, `maria-castillo` en el directorio) y `getFirmante` hacía de
     puente. En `abogados` hay UNA fila: perfil del suscriptor y ficha pública
     son dos vistas. Unificado en `maria-castillo` (también el `usuarioId` del
     modo demo en `api-guard`), con **migración v3 del store** para lo
     persistido en navegadores ajenos y `store/migraciones.test.ts`.
   - ✅ **`validado` → `verificado`** en `AbogadoDirectorio`: era la misma
     validación CAH que `PerfilAbogado.verificado` con otro nombre — dos nombres
     para un dato son una migración esperando.
   - ✅ **`Sentencia` ya no es «tabla»: es VISTA.** La tabla real existe
     (`01-corpus.sql`) y no tiene `titulo`, `ponente`, `fallo` ni `extracto`:
     se derivan de la ficha (§1.7). El comentario del tipo lo dice ahora, y lo
     mismo `PerfilAbogado` respecto de `AbogadoDirectorio` (`metricas` se
     deriva; `valoracion` no tiene productor y no será columna).
   - ✅ **`cuando` → `creadoEn` (ISO 8601) en `Lead`, `RespuestaConsulta`,
     `MensajeAbogado`, `Notificacion` y `ConversacionGuardada`** (hecho
     2026-09-02, segunda pasada). Era el hallazgo más grande: el dato guardaba
     el texto de pantalla («hace 2 h», «reciente», «Vie 21») y Notificaciones
     agrupaba por `startsWith("hace")`. Ahora el instante es la columna y el
     relativo es una VISTA: `lib/tiempo.ts` (puro, recibe `ahora`, con tests
     de tramos y del «ayer» por día de calendario), `useAhora()` en
     `use-saludo.ts` (mismo patrón `useSyncExternalStore`) y `<Cuando iso>`
     (`ui/cuando.tsx`), que sirve la fecha corta en SSR y el relativo tras el
     mount, con `<time dateTime>` y la fecha completa en el `title`. Los
     seeds llevan instantes FIJOS en hora de Honduras — con el tiempo dirán
     «hace 3 semanas», que es la verdad de un seed. **Migración v4 del store**
     con test: lo persistido sin instante recibe el de la migración (la cota
     honesta: se escribió antes de ahora). Verificado en Chromium: Hoy / Ayer
     / Anteriores se reparten por reloj y no hay errores de hidratación.
   - ✅ **`Lead` es solo la fila** (2026-09-02, tercera pasada): id · materia
     · ciudad · pregunta · `creadoEn` · `personaId` (null = anónima, §7.2).
     Lo que sobraba se fue a su sitio: `nuevo` → `leadsVistosIds` en el store
     (estado del lector, como `notifsLeidasIds`; abrir «Responder» lo apaga,
     y el Dashboard cuenta los no abiertos y sin respuesta propia);
     `respuestas` → se deriva; y **`respuestaDemo` → `RESPUESTAS_SEED`**,
     filas de `respuestas_consulta` con autor y fecha. **`respuestasDe(id,
     store)` es el ÚNICO sitio que junta seed y store** — el abogado y el
     ciudadano ven la misma lista (hay test), y si el mismo abogado
     reescribió la suya manda la del store. Consecuencia visible: las
     laborales las firma la abogada demo (su portal las ve RESPONDIDAS) y
     las otras dos, abogados del directorio de esa materia — antes las cuatro
     vitrinas del ciudadano pintaban a `ABOGADA_DEMO` a mano, así que una
     respuesta de otro abogado habría salido firmada por ella. Ahora la
     firma se resuelve del `abogadoId` (`FirmaRespuesta`, y `credencial()`:
     colegiación si la publica; si no, ciudad y años). Store v5 con test.
   - ✅ **Cadenas compuestas partidas** (mismo día): `PublicacionGaceta.meta`
     → `numeroGaceta: string | null` + `fechaIso` (el «Nº ______» era un
     marcador de maqueta; `etiquetaPublicacion()` arma «La Gaceta · 19 ago
     2026» y pondrá el número cuando exista); `PerfilAbogado.colegiacion` →
     `colegiacionNumero` + `etiquetaColegiacion()`; `PERSONA_DEMO.miembroDesde`
     → `creadoEn` + `mesAnio()`. ⚠️ `fechaTexto()` parsea el día a mano: un
     `new Date("2026-08-19")` es medianoche UTC y en Honduras (UTC−6) la
     Gaceta del 19 salía fechada el 18. Hay test.
   - ✅ **`NombreVigilado.id`** anotado en el tipo: hoy slug (`vig-<slug>`),
     en la tabla uuid con unicidad por (dueño, nombre normalizado). Sin
     cambio de UI.
   - 📌 **`Proceso.plantillaId` se queda** aunque la pantalla se llame Modelos:
     `plantillas` es el nombre de tabla; «Modelos» es el término del gremio en
     la UI (decisión ya tomada el 2026-08-25).
   - 📌 **`ItemBrief` (el brief del Dashboard) no tiene tabla detrás**: depende
     de «Mis casos», que está diferida hasta validar con abogados reales. Al
     crear el esquema, o nace `casos` o el brief se deriva de Gaceta + leads y
     pierde la fila «ACTUAR». Decidir con el feedback del backlog #4.
   - ✅ **Legislación conectada a las tablas reales (2026-09-03)** — §1.8.
     De paso, el seed pasó de «muestra» a **catálogo + destacados** y se
     corrigió el 399/400 invertido.
   - ⏳ **Reestructurar Legislación** (pedido de Wesley 2026-09-03). Los tres
     prototipos —Buscador · Lector · Temas— viven en un Artifact con el shell
     del portal y datos reales, NO en el portal (se construyeron ahí por
     error y se revirtieron el mismo día):
     https://claude.ai/code/artifact/a7a10a59-7fc4-4d8e-9d07-0bde0cac98b5.
     Al elegir, se construye esa estructura sobre lo ya conectado (§1.8).
2. [x] ✅ **JURISPRUDENCIA CONECTADA AL CORPUS REAL (2026-09-02)** — §1.7.
   Las dos búsquedas (palabras + significado), filtros reales, paginación con
   conteo exacto, ficha por `record_id` con la ficha del CEDIJ parseada, y
   Monitoreo / Mi nombre / Verifica preguntando al corpus. Verificado en
   Chromium y WebKit, escritorio y móvil, sin errores de JS ni desbordes.
2b. [x] ✅ **Migración 03 pasada y `partes` rellena (2026-09-02, Wesley +
   `partes.mjs`).** Monitoreo, Mi nombre y Verifica responden sobre el corpus
   en producción (verificado: «Wilson Pablo Henríquez» → CL-528-24 como
   recurrido). `partes.mjs` lleva reintentos desde la primera corrida, que se
   cayó a mitad con `EADDRNOTAVAIL`. Queda en el refresco semanal (§1b).
   **De paso se corrigió la regla de §5** (§1.7): 1.009 sentencias liberadas.
2c. **Después de la migración:** el buscador global (⌘K), «Nuevo en tus
   materias» del Dashboard y los tres demos de la landing siguen sobre el seed
   de 12 — son vitrinas, no buscadores, y sus enlaces ya resuelven al corpus.
   Candidatos a conectarse cuando se refine el Dashboard (§6.1).
4. **Elegir entre `/para-abogados` y `/para-abogados-black`** y borrar la ruta
   perdedora (o convertirla en redirect) — ⏸️ **aplazado a propósito** (Wesley
   2026-08-30): es una comparación visual que no bloquea nada. Ídem con la prueba
   de la aurora clara en auth (§1.4).
5. **SEO de la vía B:** no hay `sitemap.xml` ni datos estructurados
   (`HowTo`/`FAQPage` en las guías, que es lo que gana los rich snippets).
   🚦 **El `noindex` del layout raíz se mantiene a propósito hasta cablear
   Supabase** (decisión Wesley 2026-08-30, con el dominio ya comprado): el sitio
   es accesible y compartible por enlace, pero fuera de Google — hoy el login
   entra con cualquier correo y Jus IA está apagado sin corpus, así que un
   visitante que llegara de una búsqueda se registraría en algo que no existe, y
   sin sitemap el primer rastreo se desaprovecha. **Quitarlo es una línea**, y el
   momento de hacerlo es el mismo en que el alta empiece a crear cuentas de verdad.
6. [x] ✅ **Procesos entra en Profesional** (2026-09-03, §1.9). Y la pantalla
   quedó concluida: cada paso cita su artículo real.
7. **Más demos con seed real** si se sigue refinando: los candidatos son
   Calculadoras y Modelos de escritos. El patrón está: `SeccionDemo` + una vista.
   **Video real del portal**: hoy los demos son animación HTML a propósito (siguen
   al seed y el crawler lee el texto); cuando la UI se estabilice tras Supabase,
   grabar footage con Playwright sí aporta. **CTA de WhatsApp**: Justihn no tiene
   número configurado y no se inventó un enlace muerto.
8. **Pantallas futuras tras validar con abogados reales** (decisión Wesley
   2026-08-26): "Mis casos" (+agenda de plazos) es la #16 priorizada — gancho de
   retención; referidos como card, no pantalla. No construir hasta tener el
   feedback (backlog #4 del producto).

## 7. Qué falta para Fase 2 (en orden)

1. [x] ✅ **Corpus — COMPLETO el 2026-09-02.** El proyecto Supabase
   (`eemgphtiywxwrqwpylkv`) con `sentencias` + `sentencia_chunks` (pgvector,
   HNSW) y el RPC `buscar_corpus`. **19.742 sentencias · 150.600 fragmentos,
   todos vectorizados** (las ~490 restantes viven en los huecos de paginación
   de la API — las recoge el refresco semanal, `tareas-desde-la-mac.md` §1b,
   que además **espeja las retiradas del CEDIJ**: decisión Wesley 2026-09-01).
   El launchd nocturno está descargado.
   - **Credenciales:** la `anon` va en `.env.local` (`NEXT_PUBLIC_*`, ignorada
     por git). ⚠️ La `service_role` **NUNCA** entra en este repo: se deploya a
     Vercel y un `NEXT_PUBLIC_` la publicaría en el bundle. Vive en
     `automatizaciones/corpus-csj/.env`, fuera de git.
   - **Los fragmentos guardan posición, no texto** (`inicio`/`largo` sobre
     `sentencias.texto`; el RPC extrae con `substring`). Ahorra ~192 MB, pero la
     razón de peso es otra: con texto propio, un cambio en la limpieza del HTML
     dejaría al fragmento citando una versión que ya no coincide con su
     documento — justo lo que §4.1 promete que no pasa.
   - ⚠️ **§5 no estaba excluyendo nada, y falló DOS veces.** (1) Filtraba por
     materia, y el CEDIJ clasifica por rama del derecho: una violación en
     perjuicio de menor llega como "Derecho Penal". (2) Reescrita sobre el
     contenido, seguía dejando pasar **CP-429-19**, cuyo resumen dice llanamente
     «el delito de violación» — se publicó una condena por violación de una
     víctima de 16 años **con el nombre completo del condenado**, hasta que una
     consulta de prueba la sacó. La trampa: **"violación" a secas no sirve como
     señal** (en derecho es "violación de ley" — marca el 43% del corpus); lo
     que disambigua es la palabra que la acompaña. Hoy reserva el ~17,6%
     (`reserva.mjs`, 9 pruebas incluida la regresión de CP-429-19).
     **Verificado con la clave `anon`:** la reservada devuelve `[]` y escribir
     da 401.
     **(3) Y falló una TERCERA vez, al revés (2026-09-02):** la alternativa
     por sujeto (`autor` sin `\b`, ventana de 60 caracteres) reservaba las
     casaciones técnicas laborales por «la sentencia acusada … la violación».
     1.009 sentencias legítimas ocultas hasta que rellenar `partes` sacó
     CL-528-24 como «delito sexual». Detalle y regla nueva en §1.7; hoy
     reserva el 7,2%. Lección: **toda regla de §5 se mide en seco sobre las
     fichas locales (`salida/`) antes de aplicarla**, en las dos direcciones.
     ⚙️ **Decisión que el socio debe confirmar:** ahora se reservan TODOS los
     delitos sexuales, no solo los que mencionan a un menor. Es más amplio que
     la letra de §5 (niñez · violencia doméstica · procesos bajo reserva); el
     motivo es que en una condena por delito sexual la víctima es identificable
     por el expediente aunque no se la nombre, y el corpus no dice su edad de
     forma fiable. Cuesta ~8% de la jurisprudencia penal del buscador.
   - **`reevaluar-reserva.mjs`** reaplica la regla a lo ya cargado sin volver a
     ingerir: la regla va a cambiar más veces, y rehacer el corpus entero para
     mover un booleano tocaría los fragmentos y sus embeddings, que ya están
     pagados.
2. **Supabase Auth + RLS** por `abogado_id` → cambiar las rutas a `role: "session"`
   y quitar `JUSTIHN_DEMO_SESSION`. Cada archivo de auth lleva su `TODO(auth)` con
   el cableado exacto. ⚠️ La consulta del consultorio **se publica antes del alta**:
   hay que asignarle dueño en cuanto exista la cuenta, y decidir qué pasa si el
   visitante la abandona (hoy queda publicada y anónima, que es lo que la sección
   promete).
3. **Ledger de créditos** — `debitarCreditos()` en `api-guard.ts` es hoy un seam
   vacío: implementarlo como RPC atómico (decremento + auditoría en una
   transacción) y devolver 402 al agotarse.
4. **Rate limit distribuido** — configurar Upstash antes del go-live.
5. **Pagos** — mismo cuello de BAC que Sonriprev; el pago anual único lo esquiva.
6. **Validar el cálculo laboral** con el socio antes de que un profesional lo use
   en un caso real (`lib/prestaciones.ts` lleva el aviso).

## 8. Deuda conocida

- ✅ **Resuelta 2026-08-31 — `lib/prestaciones.ts` ya no contradice a la guía.**
  Calculaba la cesantía como `salario × años` y el preaviso como "1 mes / 2
  meses", mientras la guía de despido publicaba la escalera literal de la ley:
  el producto se contradecía a sí mismo. Reescrito contra el **PDF del CEDIJ,
  verificado artículo por artículo**: cesantía art. 120 (10 días de 3-6 meses ·
  20 días de 6-12 · 1 mes por año después, proporcional en la fracción · tope de
  25 meses, 15 en microempresa por art. 120-A), preaviso art. 116 (24 h · 1
  semana · 2 semanas · 1 mes · 2 meses) y vacaciones art. 346 (10/12/15/20 días
  laborables por tramo). Devuelve **conceptos con su artículo**, no tres cifras
  sueltas, y la entrada pasa a **años + meses** porque la escalera se mide en
  meses. ⚠️ **El 13º y 14º NO están en el Código del Trabajo** (cero menciones
  en el texto oficial): van `verificado: false`, sin artículo y **fuera del
  subtotal respaldado por la ley**, en vez de disolverse en un total que
  parecería todo igual de firme. 14 tests fijan cada tramo.
  ⚙️ Sigue pendiente que el socio lo contraste con la práctica (§7.6): esto
  respalda cada línea con su artículo, no sustituye esa revisión.
- **Las sentencias del seed son REALES** (12 del piloto del corpus, con resumen
  CEDIJ, órgano, magistrado y fallo verdaderos; el extracto es un fragmento del
  texto oficial). `data/sentencias.ts` se genera con `generar-seed.mjs` —
  regenerar, no editar a mano. Los expedientes `CAS-…` de brief y adjuntos son los
  **casos propios de la abogada demo**, no sentencias publicadas.
- ✅ **Resuelta 2026-09-03 — los `art. ___` de los procesos ya no existen**:
  cada paso cita artículos reales (§1.9), con test que impide que vuelvan.
- **Login y onboarding son maqueta:** validan formato y **entran con cualquier
  correo y contraseña** usando la sesión demo. Hay nota visible bajo el card y
  `TODO(auth)` en cada archivo. El E2E del 2026-08-30 lo confirma como
  comportamiento esperado, no como fallo.
- ⚙️ **Pendientes del socio abogado:** revisar las `respuestaDemo` de los leads
  (orientaciones generales que se añadieron para que el consultorio no prometiera
  respuestas y enseñara preguntas sin contestar) · contrastar las 14 guías contra
  la práctica real y vigilar las tarifas (la de ARSA es una tabla viva) · decir
  cómo se comprueba una habilitación notarial vigente (el PJ no publica padrón, así
  que hoy el exequátur del directorio es **declarado, no verificado**, y la UI lo
  dice; ningún perfil puede marcarse `verificado: true` — hay test que lo impide).
- Responsive móvil **base** hecho: header con hamburguesa + drawer
  (`HeaderMovil`/`CapaMenuMovil` en `sidebar.tsx`, corte en `lg`) y grids apilados.
  Falta pulido fino (tablas del chat, editor de escritos en pantallas muy chicas).
- ⚙️ **Capturas del portal en la landing: diferidas a propósito** — una captura
  driftea en cuanto cambia una pantalla, no le da texto al crawler, y la UI se
  moverá mucho al entrar Supabase. Se reevalúa entonces, con script de captura
  commiteado.
