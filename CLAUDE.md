# CLAUDE.md — Justihn · plataforma (portal de abogados + sitio público)

> Cerebro técnico del producto. Manda en su dominio sobre `justihn/CLAUDE.md`
> (producto/negocio) y sigue `../../STACK-BLUEPRINT.md` (arquitectura de la agencia).
> Creado: **2026-08-25** · Última actualización: **2026-08-31** (portal
> ciudadano: shell gemelo, Notificaciones, plazos, Instituciones y
> Verificación — §1.2).
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

**Fuentes de verdad visuales** (no improvisar valores): `../design_handoff_portal/`
para el portal y `../design_handoff_auth/` para login y onboarding.

### 1.1 Portal de abogados — `/abogados` (15 pantallas)

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
- **Legislación** y **Monitoreo de nombres** existen para que la tabla de planes
  quede 100% respaldada por UI (estaban vendidas y no existían). Legislación
  muestra los artículos del CPC verificados contra el PDF oficial del PJ; los
  demás códigos aparecen "en preparación" — sin fuente no hay texto. Monitoreo
  hace el matching **en vivo** sobre el texto de las 12 sentencias del piloto
  (vigilados en el store, `nombresVigilados`, persistido con alta y baja), con
  disclaimer de homónimos y exclusión de materias reservadas.

### 1.2 Portal ciudadano — `/personas` (15 rutas)

El patrón Jusbrasil completo: la landing da la probadita y "crear cuenta gratis"
abre un portal con shell propio (persona demo Carlos Zelaya en `data/persona.ts`).
Inicio · Trámites (con **checklist persistido**, `pasosTramite` en el store) ·
Consultas · Instituciones (+ detalle) · Directorio · Calculadoras · Informe
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
- **Instituciones** (2026-08-31) es el pedido literal del socio: "ver todas las
  instituciones del Estado y los trámites de cada una — ej. el IP". El seed ya
  lo tenía (`INSTITUCIONES`, 9, todas con trámite). ⚠️ No contradice §1.3: allí
  se decidió no dar filtro por institución **en la home**, porque quien llega de
  Google busca "voy a abrir un negocio", no "un trámite de ONCAE". Dentro del
  portal sí hay quien ya sabe que su asunto es del IP. El campo `sitio` es
  **opcional a propósito**: solo se rellena si el host pasa la whitelist §3.3
  (6 de 9; MiAmbiente no responde, STSS y Registro Mercantil sin verificar), y
  `instituciones.test.ts` lo exige — antes ningún enlace que uno muerto.
- **Verificación son DOS pantallas, y la separación es la regla, no diseño.**
  **Mi nombre** vigila solo nombres propios; **Informe Verifica** mira a un
  tercero. Ofrecer vigilar a terceros en la primera convertiría el monitoreo en
  acoso, que es justo lo que prohíbe §5 del CLAUDE.md del producto. Las dos
  corren el MISMO motor real (`buscarApariciones` sobre el texto de las
  sentencias del piloto) y **el ciudadano tiene su propia lista**
  (`nombresVigiladosPersona`): compartir la del abogado le enseñaría sus
  clientes y contrapartes.
  Tres reglas de §5 están cableadas en la UI, no son copy: **homónimos
  siempre** —también cuando NO hay resultados, porque "sin apariciones" se lee
  como certificado y no lo es—, **usos prohibidos a la vista antes de buscar**,
  y **materias reservadas excluidas**. El informe completo (folio real, Registro
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

Grupo `(auth)`, shell propio sin navegación, del handoff `../design_handoff_auth/`.

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
  `../design_handoff_auth/justihn-logo-scene.jsx`). Cuatro actos en 6,8 s:
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

### 1.5 Marca

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
| `src/app/api/ia/consultar/` | Único endpoint. Todo pasa por `guard()` antes de gastar nada |
| `src/lib/security/` | **El harness (§3 del blueprint).** `api-guard` · `rate-limit` · `sanitize` · `ai-safety`. Toda superficie de servidor lo consume; no reinventar por ruta |
| `src/lib/ai/` | `router-demo` (Fase 1, determinístico) · `motor-claude` (Fase 2, apagado) · `tipos` (el contrato que cumplen ambos) |
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

## 5. Comandos

```bash
pnpm dev          # http://localhost:3000
pnpm type-check   # tsc --noEmit
pnpm test         # Vitest (91 tests de invariantes)
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
rutas de trámites y las colisiones de transform del imán.

**Recorridos E2E** (2026-08-30): los scripts de los tres caminos de un visitante
viven en el scratchpad de la sesión, no commiteados — dependen del servidor de
desarrollo. Encontraron dos defectos que solo se ven recorriendo: el gate de
cuenta que se saltaba el alta y las áreas táctiles (ambos en §4.7). Estado verde:
33 comprobaciones de recorrido, 0 desbordes y 0 errores de JS en móvil y
escritorio en Chromium y WebKit, 21 enlaces internos vivos, un solo `h1` por
página, y la home sirviendo **11.462 caracteres de texto sin JS**.

## 6. Pendientes — próxima sesión (en orden)

1. **🔎 REFINADO FINAL DE LOS DOS PORTALES — `/abogados` (15 pantallas) y
   `/personas` (9 rutas) — ANTES de Supabase** (decisión Wesley 2026-08-30).
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
2. **Crear el proyecto Supabase** (solo DB al inicio) y cambiar el destino del
   workflow del corpus de Data Table → Postgres + embeddings pgvector (el esquema
   SQL ya está diseñado; ver justihn/CLAUDE.md backlog #3). Entra **después** del
   punto 1: los seeds validados por el socio más lo que salga del refinado son el
   contrato del esquema.
3. **Cron `launchd` en la Mac** para el scraper de escala (20.202 sentencias,
   ~1.000/noche) — el VPS no alcanza la API del PJ (geo-bloqueo). No depende de
   nada: el destino provisional (Data Table de n8n) sigue válido, así que puede
   avanzar en paralelo a todo lo demás.
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
6. **Decidir en qué plan entra "Procesos"** (`data/catalogo.ts`): la pantalla
   existe y la landing la vende, pero la tabla de planes no dice desde cuál se
   tiene. Antes de cobrar.
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

1. **Corpus** — scraper n8n de la API del PJ (`searchFreeRecords` →
   `getRecord`/`getHtml`) → Postgres + embeddings pgvector. Es el bloqueante de
   todo lo demás: sin corpus, Jus IA real no puede encenderse.
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

- **`lib/prestaciones.ts` contradice a la guía de despido dentro del mismo
  producto.** Calcula el preaviso como "1 mes si <2 años, 2 meses si ≥2" y la
  cesantía sin los tramos cortos, pero la guía ya publica la escalera literal del
  Código del Trabajo: preaviso art. 116 (24 h · 1 semana · 2 semanas · 1 mes ·
  2 meses) y cesantía art. 120 (10 días de 3-6 meses · 20 días de 6-12 · 1 mes por
  año después, tope 25 meses; 15 si el patrono es microempresa de ≤10 empleados,
  art. 120-A). No se corrigió porque el cálculo está gated a la validación del
  socio (§7.6), pero el texto oficial ya está localizado: es un cambio corto.
- **Las sentencias del seed son REALES** (12 del piloto del corpus, con resumen
  CEDIJ, órgano, magistrado y fallo verdaderos; el extracto es un fragmento del
  texto oficial). `data/sentencias.ts` se genera con `generar-seed.mjs` —
  regenerar, no editar a mano. Los expedientes `CAS-…` de brief y adjuntos son los
  **casos propios de la abogada demo**, no sentencias publicadas.
- Los `art. ___` de los procesos son marcadores deliberados hasta cargar los
  códigos (backlog #5 del proyecto).
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
