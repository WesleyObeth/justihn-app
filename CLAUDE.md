# CLAUDE.md — Justihn · plataforma (portal de abogados + sitio público)

> Cerebro técnico del producto. Manda en su dominio sobre `justihn/CLAUDE.md`
> (producto/negocio) y sigue `../../STACK-BLUEPRINT.md` (arquitectura de la agencia).
> Creado **2026-08-25** · Última actualización **2026-09-03**.
>
> **Cómo leerlo.** §0 es la foto de hoy: qué está vivo y qué no. §1 dice qué hay
> y dónde. §4 son las reglas que no se renegocian, y **§4.7 las trampas** — lo
> que costó horas descubrir y no se ve leyendo el código. §6 es por dónde seguir.
>
> ⚠️ **La numeración de secciones es contrato**: hay ~90 comentarios en `src/`
> que citan §4.5, §4.7.7, §4.7.18, §1.7, §7.2… Al reorganizar, no renumerar.
> (Las citas a §0.x, §3.1-§3.3 dentro del código son del **blueprint**, no de aquí.)

---

## 0. Estado hoy (2026-09-03)

**Ya no es mock-first.** Cinco pantallas leen datos reales de Supabase y el
resto sigue sobre seeds. Producción: **https://justihn.com** (repo
`github.com/WesleyObeth/justihn-app`, Vercel), en `noindex` a propósito (§6.5).

| Pieza | Estado |
|---|---|
| **Jus IA** | 🟢 En vivo. 19.742 sentencias · 150.600 fragmentos · 3.989 artículos, todo vectorizado. Cita o dice «no encontré fuentes» (§1.6) |
| **Jurisprudencia** | 🟢 Corpus real, dos modos de búsqueda, ficha por `record_id` (§1.7) |
| **Legislación** | 🟢 5 códigos, 3.989 artículos, ruta por artículo (§1.8) |
| **Procesos** | 🟢 4 procesos, cada paso citando artículos que se abren (§1.9) |
| **Gaceta** | 🟢 13 ediciones · 41 publicaciones de la ENAG. ⏳ Falta el cron diario (§1.10) |
| **Auth** | 🟢 Supabase Auth real: alta, confirmación por código, login, cierre de sesión (§1.4) |
| **Monitoreo / Mi nombre / Verifica** | 🟡 Buscan en el corpus real, pero la lista de vigilados vive en `localStorage` (§7.3) |
| **Leads, consultas, casos, propuestas** | 🔴 Solo `localStorage`: no sobreviven al cambio de dispositivo (§7.3) |

**Lo que sigue siendo seed:** el buscador global (⌘K), «Nuevo en tus materias»
del Dashboard, los tres demos de la landing y el perfil de la abogada demo. Son
vitrinas, no buscadores, y sus enlaces ya resuelven al corpus.

**Fuentes de verdad visuales** (no improvisar valores): `../logo/especificacion/`
— `logos-oficiales.md` (la geometría que los SVG solo materializan),
`marca-tipografia-colores.md` (los tokens **y el porqué de cada uno**) y los
handoffs `handoff-portal.md` y `handoff-auth.md`. Los prototipos `.dc.html` se
eliminaron el 2026-08-31: el producto los superó.

---

## 1. Qué es

Producto de dos vías sobre un mismo código:

- **Vía A — abogados** (`/abogados`): SaaS de suscripción. Jurisprudencia,
  legislación, alertas de La Gaceta, procesos con plazos, modelos de escritos,
  leads, calculadoras, monitoreo de nombres, expedientes y propuestas, y **Jus
  IA**, el asistente que responde **solo citando fuentes oficiales**.
- **Vía B — gente común** (`/` y `/personas`): guías de trámites y procesos,
  consultorio gratuito, directorio de abogados y calculadoras. Es la cara
  indexable del dominio y el funnel que alimenta los leads de la vía A.

### 1.1 Portal de abogados — `/abogados` (17 pantallas, 24 rutas)

Rutas reales, no estado: el deep-link a una sentencia, un artículo o una
publicación funciona y es compartible. Dashboard · Jus IA · **Despacho** (Mis
casos · Propuestas) · **Investigación** (Jurisprudencia · Legislación · Procesos
· Gaceta · Monitoreo · Modelos) · **Consultorio** (Leads · Calculadoras) ·
Notificaciones · Perfil · Planes · Configuración · Ayuda.

- **Nombres cerrados** (decisión Wesley 2026-08-25): vive bajo `/abogados`
  (antes `/portal`); «Paso a paso» → **Procesos**; «Plantillas» → **Modelos**
  (es el término del gremio y el que se googlea). Los identificadores internos
  (`PLANTILLAS`, `plantillaId`) no cambiaron: `plantillas` es nombre de tabla.
  Redirects permanentes en `next.config.ts`.
- **Regla del Dashboard:** nada inerte — toda card navega o dispara una acción.
  «Pendientes de hoy» usa `usePreguntarAJusIA(pregunta, { enviarDirecto })`, que
  deja la consulta enviándose al llegar al chat.
- **Jus IA:** chat en una sola columna centrada (~760px); el historial va en un
  panel lateral. El titular del hero sale del pool `TITULARES_HERO`
  (`data/jus-ia.ts`), elegido en cliente tras el mount. **«Nueva consulta»
  (izquierda) e «Historial» (derecha) van en la fila superior de la columna del
  chat — y se quedan ahí** (decisión Wesley 2026-09-02). Ese día se probaron y
  descartaron dos alternativas: una fila de acciones en la cabecera de página, y
  los dos como hijos desplegables de «Jus IA» en el sidebar (patrón Mercury).
  No volver a proponerlas sin un motivo nuevo.

**Despacho — Mis casos y Propuestas** (2026-09-02) nace del **primer feedback de
un abogado externo** (`justihn/CLAUDE.md` backlog #4, #10, #11): pagaba US$20/mes
de ChatGPT sobre todo para redactar propuestas de honorarios, y pidió
«digitalizar los expedientes notariales».

- **Mis casos** (`/abogados/casos`, `+ /nuevo`, `+ /[id]`): el expediente por
  cliente. Nace de un **acto notarial** (`data/actos-notariales.ts`), un
  **trámite** o un **proceso** del catálogo, y **el checklist se llena desde la
  fuente verificada** al crearlo; desde ahí es del caso (si la guía cambia, un
  expediente abierto no pierde lo que el cliente ya entregó). `lib/casos.ts` es
  el único sitio que sabe qué es un `referenciaId`.
- **Propuestas** (`/abogados/propuestas`, `+ /nueva`, `+ /[id]`): el abogado
  pone honorarios, forma de pago y cliente; el documento **se ARMA desde la
  guía** (`lib/honorarios.ts`): alcance = pasos, requisitos con su artículo,
  advertencias = tasa y nota, membrete del perfil. Cifra y letras
  (`lempirasALetras`, con tests). El store guarda SOLO lo escrito; el documento
  se deriva en cada render (§4.4). **PDF = `window.print()`** con `print:hidden`
  en sidebar/header/banner y `print:overflow-visible` en el layout (sin eso el
  `h-screen` + scroll interno cortaba a una página); `@page` carta en
  `globals.css`. Vista previa libre; guardar y descargar son **Premium**.
- ⚠️ **Sin fuente no hay texto, también aquí.** El matrimonio cita arts. 21,
  24-30 del Código de Familia; la auténtica declara `fuentePendiente` (el Código
  del Notariado no está en fuente estatal legible); el divorcio por mutuo
  consentimiento es JUDICIAL (art. 244), así que es proceso, no acto notarial.
  `actos-notariales.test.ts` exige fuente o pendencia declarada en cada acto.
- ⚙️ Pendiente: **nombre de la firma** separado del nombre del abogado en el
  membrete (hoy repite «Abg. María Castillo»). Y el Dashboard aún no deriva
  «Pendientes de hoy» de los plazos de los casos (sigue sobre `BRIEF`).

### 1.2 Portal ciudadano — `/personas` (13 pantallas, 17 rutas)

El patrón Jusbrasil: la landing da la probadita y «crear cuenta gratis» abre un
portal con shell propio. Inicio · Trámites · Consultas (+ detalle) ·
Instituciones (+ detalle) · Directorio (+ perfil) · Calculadoras · Informe
Verifica · Mi nombre · Notificaciones · Plan · Perfil · Configuración · Ayuda.
El sidebar los agrupa en **Mis gestiones · Herramientas · Verificación**.

**El shell es gemelo del de abogados, no parecido**: misma columna marina
colapsable (236px ↔ 68px), navegación por categorías y drawer en móvil.
**Comparte `sidebarColapsado`** con el portal de abogados: nadie es las dos
audiencias a la vez, y duplicar la clave daría dos memorias del mismo gesto.
Colapsada, las categorías se leen como separadores (24px), no como rótulos. La
mecánica del drawer (Escape, clic al fondo, cierre al navegar) vive UNA vez en
`DrawerMenuMovil` (`portal/sidebar.tsx`) y los dos portales le pasan su sidebar.

Decisiones que mandan en esta vía:

- **Nada se deriva dos veces.** «Tus pendientes» de Inicio y Notificaciones
  salen del MISMO `useAvisosPersona`; con dos derivaciones, la campana y el
  tablero podrían contradecirse. **Notificaciones se DERIVA del store**, no es
  un seed como la del abogado: una notificación semilla diciendo «un abogado
  respondió tu consulta» a quien nunca preguntó sería la evidencia fabricada que
  prohíbe §4.5. Agrupa por **origen y no por fecha** porque lo derivado no tiene
  sello de tiempo real. Va en el menú del avatar, con punto sobre el avatar
  (decisión Wesley): sin él la insignia no se vería con la barra colapsada.
- **Inicio toma la ESTRUCTURA del Dashboard del abogado, no sus contenidos.**
  El abogado entra a trabajar y mide su producción; el ciudadano llega con UN
  problema y necesita saber qué dejó a medias y cuánto tiempo le queda. Por eso
  la entrada es un **buscador por problema** (no un composer de IA), los
  resultados salen en la propia pantalla, y sin coincidencia ofrece el
  consultorio con lo escrito. El motor es `buscarGuias` (`data/tramites.ts`),
  **compartido con la pantalla Trámites**. Las métricas son de su gestión y con
  cuenta nueva muestran «—», no un cero seco. El destacado oscuro es un **PLAZO**
  verificado (`data/plazos.ts`, art. 864), no un digest.
- **La pantalla de Inicio son DOS rejillas, no una** (decisión Wesley). Con una
  sola, la última card de cada columna arranca donde acabe la anterior: medido,
  **121px de desfase con la cuenta vacía y 157px con datos**, así que ninguna
  altura fija los arregla a la vez. `items-stretch` iguala las columnas de
  arriba, y «Mis trámites» **no lleva `flex-1`** a propósito: estirarla metía el
  hueco dentro de la card en vez de dejarlo entre cards.
- **«Lo que viene» no es marketing**: sus tres puntos son ítems del backlog con
  su bloqueo real detrás, y **sin fechas** — prometer una es lo que prohíbe §4.5.
- **Los estados vacíos enseñan en vez de esperar.** El consultorio muestra un
  intercambio real ya respondido y firmado con su colegiación: el obstáculo del
  ciudadano no es no saber dónde escribir, es no creer que alguien le responda.
- **Trámites separa trámites de procesos** en dos secciones con su conteo, y
  solo cuando el filtro de tipo está en «Todos». `tramites.test.ts` exige que
  los dos tipos cubran el catálogo entero: un tercer tipo desaparecería de la
  pantalla en silencio (mismo fallo que §4.7.12).
- **El detalle de una guía pone lo PRÁCTICO antes que el procedimiento**:
  requisitos, costo y sello de fuente arriba; los pasos, después. El checklist
  dice que es marcable, el número se cambia por un check al pasar por encima y
  **toda la fila es clicable** (a 26px se apunta mal en un teléfono). ⚠️ El aviso
  de profesional va FUERA del botón: lleva su propio enlace, y un enlace dentro
  de un botón no se puede activar. **La ruta se hace visible**
  (`getContextoRuta`): que el RTN habilita el CAI y el CAI el permiso es «lo que
  no se encuentra googleando»; los procesos judiciales no pertenecen a ninguna
  ruta y la pantalla no se la inventa (hay test).
- **Cada consulta tiene su ruta** (`/personas/consultas/[id]`). No existe para
  «verla más grande»: la lista dejaba «Esperando a los abogados…» como callejón
  sin salida en el momento de más ansiedad. El detalle le da contenido a esa
  espera con guías de su materia y otras consultas ya respondidas.
  ⚠️ **`useStoreHidratado()` es obligatorio en cualquier pantalla que busque un
  registro POR ID**: con `skipHydration`, el primer render ve el store vacío y
  `notFound()` dispararía un **404 falso** a quien recargue.
- **Configuración: el habeas data es FUNCIONAL** (§5 del CLAUDE.md del producto
  lo exige desde el día 1). Lista lo que Justihn guarda de verdad con su cuenta
  derivada del store, **borra por categoría** —el historial de Verifica es lo más
  sensible y puede querer irse sin perder el avance de los trámites— y descarga
  un JSON real. «Borrar todo» pide confirmación; una categoría no: no hay
  deshacer y el peso del error es distinto. `borrarDatosPersona` no toca los
  datos del abogado (hay test).
- **Plan y Mi perfil.** Lo incluido en Plan **se deriva de los seeds**
  (`TRAMITES.length`, `INSTITUCIONES`, `DIRECTORIO`): escrito a mano se quedaba
  viejo. **El perfil del abogado es PÚBLICO y el del ciudadano no**, y saberlo
  tranquiliza: «Tu perfil no es público» es una card con el mismo peso que las
  demás, no letra pequeña al pie.
- **Cada abogado tiene perfil y desde ahí se le escribe**
  (`/personas/directorio/[id]`). El mensaje se envía **dentro de Justihn**, no a
  WhatsApp (§4.5): sacar el contacto en el primer toque deja al abogado sin poder
  demostrar cuántos le trajo la plataforma, que es lo que sostiene que pague.
  Filtros (buscador, ciudad, materia con conteo) viven en la URL, así que un
  enlace filtrado es compartible. **Notarios va en fila aparte**: ser notario no
  es una materia. `filtrarDirectorio` está en `data/` porque el orden —Premium
  primero— es regla de negocio, no de pantalla.
  ⚠️ **Trampa de superficie compartida**: `landing.css` se importa en los
  layouts públicos pero **NO en `/personas` ni `/abogados`**. La card del abogado
  se apoyaba en él: el botón quedaba blanco sobre blanco y el contenedor sin
  borde ni sombra. Esta card vive en TRES superficies, así que su apariencia sale
  de tokens del tema, con `.glass-card` **delante** para que la landing conserve
  su glass. `superficies-compartidas.test.ts` recorre lo que `personas/` importa
  de `publico/` y exige superficie propia.
- **Instituciones** es el pedido literal del socio: «ver todas las instituciones
  del Estado y los trámites de cada una». ⚠️ No contradice §1.3: allí se decidió
  no dar filtro por institución **en la home**, porque quien llega de Google
  busca «voy a abrir un negocio». Dentro del portal sí hay quien ya sabe que su
  asunto es del IP. El campo `sitio` es **opcional a propósito**: solo se rellena
  si el host pasa la whitelist §3.3 (6 de 9), y `instituciones.test.ts` lo exige
  — antes ningún enlace que uno muerto. La sigla va **entera y como rótulo**:
  `slice(0, 4)` convertía «ONCAE» en «ONCA» (hay test).
- **Verificación son DOS pantallas, y la separación es la regla, no diseño.**
  **Mi nombre** vigila solo nombres propios (con **relación**: Mío / De mi
  familia); **Informe Verifica** mira a un tercero. Ofrecer vigilar a terceros en
  la primera convertiría el monitoreo en acoso (§5 del producto). El ciudadano
  tiene su propia lista (`nombresVigiladosPersona`): compartir la del abogado le
  enseñaría sus clientes y contrapartes. El desplegable de una aparición vive
  UNA vez en `aparicion.tsx` y lo usan las dos (con dos copias, arreglar una
  dejaría a la otra pidiendo lo imposible).
  Tres reglas de §5 están **cableadas en la UI**: homónimos siempre —también
  cuando NO hay resultados, porque «sin apariciones» se lee como certificado y no
  lo es—, usos prohibidos a la vista antes de buscar, y materias reservadas
  excluidas. `verifica.test.ts` las comprueba sobre la fuente: son texto, no
  lógica, y un revert descuidado las borraría sin que nada fallara.
  ⚠️ **Sin semáforo de riesgo**, aunque el modelo de negocio lo mencione: un
  rojo/verde sobre una persona por aparecer en sentencias la etiqueta, y en
  Honduras nadie pierde derechos por figurar en un expediente. Se muestra QUÉ hay
  y EN QUÉ CALIDAD aparece (hay test). El informe completo (folio real, Registro
  Mercantil, vigilancia 30 días) está **en preparación**: depende de cuentas
  SURE/CCIT que no existen, así que no se cobra por adelantado (§4.5).
- **Reclamo de consumo** (guía 14ª) cerró el hueco más grande de la vía B.
  Nacieron con ella la materia `Consumidor`, la institución `dgpc` y un perfil de
  esa rama, porque sin materia la guía no podía recomendar abogado y el funnel
  guía→lead se cortaba. ⚠️ **La Ley (Decreto 24-2008) está escaneada sin capa de
  texto**: la guía cita sus artículos SOLO donde el Reglamento vigente los
  transcribe (Acuerdo 084-2021), que sí es legible y es la `fuenteUrl`.
- **La calculadora de plazos NO es la del abogado con otro nombre.** La suya pide
  «días de plazo», que un ciudadano no sabe: aquí elige el **hecho** y el plazo lo
  pone la ley. `plazos.test.ts` exige que el artículo citado aparezca en el texto
  de esa guía — es lo que impide que diverjan (misma lógica que §4.7.13).

**Nombres cerrados (2026-08-29):** `/personas` en plural, para leer como pareja
de `/abogados`; y su buscador es `/personas/directorio`, no `/personas/abogados`
— esa forma hacía que `/abogados` significara a la vez el portal de suscriptores
y una pantalla del ciudadano. Redirects 308 para las cuatro formas viejas.

### 1.3 Páginas públicas

**Home ciudadana `/`** — grupo `(landing)`, shell aurora. Hero con buscador ·
4 puertas de entrada (no navegan: §4.6) · 3 demos · Trámites en rutas · Procesos
· Consultorio · Directorio · Plan gratis · FAQ · CTA · cross-sell a la vía A.

- **Trámites agrupados por situación de vida** (Abrir un negocio · Comprar o
  vender · Formalizar y vender al Estado), **numerados y encadenados** con un
  riel: el RTN habilita el CAI, el CAI el permiso. Ese orden es lo que no se
  encuentra googleando y es la promesa del producto hecha visible. Buscar rompe
  el orden a propósito: quien escribe «RTN» quiere su guía, no la ruta. No hay
  filtro por institución — nadie busca «un trámite de ONCAE».
- **Procesos** usa la misma `FilaTramite` pero **sin riel numerado**: despido,
  pensión, divorcio y herencia no se encadenan y numerarlos inventaría un orden.
- **Consultorio: la conversación primero.** Abre con un intercambio real
  (consulta + respuesta firmada por la colegiada, con su número CAH) y el
  formulario debajo. Publicar pasa por `/crear-cuenta?tipo=persona&desde=consultorio`.
- **Directorio:** los cinco perfiles, sin esconder ninguno tras una cuenta.

**Landing de abogados `/para-abogados`** — grupo `(profesional)`. Hero con
**composer de Jus IA** (la caja no busca, pregunta) · Cómo cita · Lo que
encuentras dentro · 3 demos · Planes · FAQ · CTA oscuro.

- **La URL es `/para-abogados`, no `/profesional`** — el plan intermedio se llama
  «Profesional» (`PlanId`) y habría chocado con el nombre del tier.
- **Puerta de cuenta:** escribir es libre; al ENVIAR se pasa por `/crear-cuenta`.
  Se gatea en enviar y no en la primera tecla: cortar a media escritura se siente
  roto. La pregunta se guarda en el store ANTES de navegar y se dispara sola al
  llegar al chat.
- **Los tres demos** (`demos.tsx`) usan **datos reales de los seeds**: la
  sentencia citada es CL-528-24 del piloto, con su órgano y magistrada
  verdaderos. No son video a propósito: el HTML conserva el texto para el crawler.
- **«Lo que encuentras dentro»** (`capacidades.tsx`) es un mosaico de nueve
  piezas **sin ventana de producto**: esta sección es el INVENTARIO, los demos son
  la DEMOSTRACIÓN. Es componente de servidor: las nueve llegan al HTML sin
  depender de hidratación.

**`/para-abogados-black`** — la MISMA landing en tema oscuro, para que Wesley
elija. Cero duplicación: reutiliza `LandingProfesional` y el tema lo hace
`.landing-aurora--black` remapeando tokens. El **patrón `superficie-dia`**
(composer del hero + ventanas de demo) son cards blancas en la clara y glass
oscuro en la black. ⚙️ Al elegir, borrar la ruta perdedora (§6.4).

**Interiores** (`/tramites/[id]`, `/calculadora-prestaciones`) — grupo
`(publico)`, **mismo shell aurora que la home**: antes tenían cabecera blanca y
fondo plano, así que abrir una guía se sentía como salir del sitio.

**Shell compartido:** `FondoAurora` (three.js, shader FBM; navy #0a1830 ·
celeste #1584c7 · claro #7cc7f0) + `NavAurora` (parametrizada) + `PieAurora`.
Stacking: fondo z-0 · canvas+scrim z-1 · contenido z-2 · nav z-100.

### 1.4 Auth — `/iniciar-sesion` + `/crear-cuenta`

Grupo `(auth)`, shell propio sin navegación. **Cableado a Supabase Auth el
2026-09-02**: alta real, confirmación por código, login con destino por cuenta y
cierre de sesión de verdad.

- **Un solo login para las dos vías** (decisión Wesley 2026-08-30). Es UNA base
  de cuentas: dos logins duplicarían recuperación, enlaces mágicos, rate limit y
  errores, y obligarían a acertar por qué puerta te registraste — quien elige mal
  ve «no existe esa cuenta» y se va creyendo que perdió su registro.
  `?tipo=persona` solo cambia copy y destino, **nunca lo que se pide para
  entrar**. El destino real lo decide la CUENTA (`mi_destino()`: ¿tiene ficha de
  abogado?), y `next` (validado) gana si venía de una ruta concreta.
- **El alta sí es distinta.** Abogado: 3 pasos (cuenta con medidor de fuerza ·
  validación CAH opcional con dropzone · materias en chips) + bienvenida.
  Ciudadano: nombre, identidad opcional, correo y contraseña. `alta.tsx` es la
  puerta única que elige formulario. El abogado pasa por tres pasos porque el
  producto necesita colegiación y materias; a un ciudadano eso lo espantaría.
- **`?tipo=` se lee en el SERVIDOR** (`searchParams` de la page), no con un hook
  de cliente: en cliente el HTML llegaba siempre con la variante del abogado y se
  veía un parpadeo del stepper.
- **`next` validado** — ver §4.7.8. No quitarlo.
- **Confirmación del correo por CÓDIGO, no por enlace** (decisión Wesley
  2026-09-02, patrón Jusbrasil): el enlace saca a la persona del alta y la deja
  en otra pestaña; el código la mantiene en la misma pantalla y termina con
  sesión abierta ahí mismo. Lo canja `verifyOtp(type: "signup")` en
  `components/auth/codigo-correo.tsx`. ⚠️ **`LONGITUD_CODIGO` tiene que coincidir
  con «Email OTP Length» del proyecto de Supabase**: el proyecto nació en 8 y la
  UI dibujaba 6, así que se verificaba un código truncado. Hoy los dos están en
  6. Plantillas de correo con la marca en `supabase/correos/`.
- **El número de identidad es opcional en las dos vías** (pedido de Wesley
  2026-09-02). En el abogado va en el paso 2 junto a la colegiación: son los dos
  números con los que se contrasta el carné contra el padrón del CAH. En el
  ciudadano, tras el nombre: el abogado que atienda el caso lo necesita para
  actuar por él. `lib/identidad.ts` pone máscara y valida los tramos del DNI
  hondureño (departamento 01-18, municipio ≠ 00, año plausible) con 8 tests. Se
  guarda sin guiones, con índice único, **fuera de toda vista pública**, y el
  trigger lo borra de `raw_user_meta_data` para que no viaje en el JWT.
  ⚠️ **El paso 2 del onboarding no pintaba ningún error** —solo lo hacían el 1 y
  el 3—, así que al validar la identidad el botón bloqueaba en silencio. Al
  añadir una validación a un paso, comprobar que ese paso tiene dónde enseñarla.
- **Cierre de sesión real** en los dos portales: `signOut` + `router.replace` al
  login (`?tipo=persona` desde el ciudadano) + `router.refresh()`. Los tres pasos
  hacen falta: el primero borra las cookies que lee el proxy, el segundo saca el
  portal del historial y el tercero invalida el caché de rutas de Next, sin el
  cual se puede volver a pintar una pantalla con la sesión anterior.
- **El logo de auth vuelve a su landing**: el onboarding a `/para-abogados`, el
  alta ciudadana y el restablecer a `/`, y el login a la que corresponda.

**Escena del logo: el libro que se abre** (`escena-logo.tsx`, portada de
`../logo/especificacion/justihn-logo-scene.jsx`). Cuatro actos en 6,8 s: Cerrado
1,4 s · Apertura 1,6 s (páginas a ±26°, nace el cruce) · Nombre 2,2 s · Final
1,6 s. Los tiempos van en **porcentaje de un ciclo único** en `auth.css`, para
que el bucle sea una animación por elemento y los actos no se desincronicen. El
símbolo **se corre a la izquierda como consecuencia** de que el wordmark ocupe
sitio, no con un desplazamiento en píxeles: si cambia la fuente, el encuadre se
recentra solo. Las dos páginas **arrancan superpuestas** y se separan ±7 al
girar — ese es el libro cerrado de verdad. Con reduced-motion se muestra el logo
abierto, sin movimiento.

- **`SplashJustihn` solo en las DOS ALTAS** (decisión Wesley 2026-09-03): una
  pasada y al portal a los 5 s. El **login entra directo**, sin splash: quien ya
  tiene cuenta quiere llegar, no ver la bienvenida cada vez (medido: 1,4 s del
  clic al portal).
- ⚠️ **`ancho` es un MÁXIMO, no una medida.** El lockup se dibuja a la escala
  intrínseca del archivo (788) y se reduce con `scale`: a 520px en una pantalla
  de 390 se cortaba por los dos lados **y daba scroll horizontal a la página**.
  Se recorta a `innerWidth − 40` midiendo tras el mount (§4.5 determinismo), y el
  overlay lleva `overflow-hidden`. Verificado a 320/390/430/768/1280.
- ⚠️ **El splash bloquea el scroll del documento mientras dura**: es `fixed` y se
  recorta solo, pero la página de auth de debajo mide más que la ventana y se
  podía arrastrar la escena para ver la card asomando. Restaura el valor anterior
  al desmontar, no lo pone a `""`.
- ⚗️ **Prueba en curso:** el shell usa la **aurora CLARA** de las landings, no la
  variante noche del handoff — Wesley quiere comparar. **Camino de vuelta:**
  revertir ese único commit; `landing-aurora--noche`, `FondoAurora
  variante="noche"` y `.input-noche` siguen en el CSS a propósito.

### 1.5 Marca

- **Card «Papel» en los dos portales** (decisión Wesley 2026-09-02). Se
  compararon cuatro tratamientos sobre el Dashboard real —Actual · Vidrio ·
  Papel · Trazo— en un prototipo intercambiable:
  https://claude.ai/code/artifact/0ed80186-a4da-44c8-aac4-deb6e36c1cce.
  Papel = sin borde visible, radio 16, sombra tonal marina en dos capas
  (`--shadow-papel`), y la interactiva se levanta 1px al pasar el mouse. Motivo:
  sobre el lienzo Cielo el borde gris de 1px se perdía. Vidrio se descartó por
  costo de GPU en listas largas y contraste en pantallas baratas. Vive en UN
  sitio: el primitivo `Card` (+ 2 tokens en `globals.css`); revertir es ese bloque.
- **La burbuja del usuario en Jus IA también es «Papel»** (2026-09-03). Era
  `#e9eff6` y Wesley la rechazó por gris: sobre el lienzo Cielo, que arranca en
  `#d8e9f8`, un gris azulado del mismo valor no contrasta — se lee sucio en vez
  de leerse como superficie. Se compararon cinco tratamientos sobre el hilo
  real; blanco es el único que en este lienzo **sube** de valor, y además empareja
  con el composer, que ya es blanco con sombra. El chip celeste (`--chip`,
  `#e7f3fa`) se descartó midiendo: a media conversación el lienzo vale `#ecf3fa`
  y la burbuja desaparecería. ⚠️ El adjunto va DENTRO de la burbuja y era blanco:
  pasa a `bg-lienzo` con borde. ⚙️ La **demo de la landing usa `bg-chip`** para
  esta misma burbuja y ahí sí funciona (el fondo es la ventana blanca): las dos
  superficies divergen a propósito.
- **Favicon:** `src/app/icon.svg` **ES** `logo/justihn-icon.svg`, con el viewBox
  recortado a la tinta (`4.1 1.1 39.9 39.9`) y sin adaptación a modo oscuro — el
  logo no cambia de color. ⚠️ Rompe a propósito la ficha de marca (que pedía la
  variante «sin cruce» a ≤20px): se prioriza que la pestaña se vea como el logo.
- **Lockup:** gap de **5px** en el nav y en `LogoJustihn` — medido sobre el
  render a 4× contando columnas con tinta (9.2px de hueco visual). El símbolo
  aporta ~2.4px de aire propio dentro de su viewBox; descontarlo es lo que faltaba.
- **Tarjetas Open Graph:** tres 1200×630 generadas con `next/og` **en el build**
  (~150 KB c/u — WhatsApp descarta las pesadas). Componente único en
  `lib/og/tarjeta.tsx`. Trampas en §4.7.6 y §4.7.13b.

### 1.6 Jus IA — el motor real, encendido el 2026-09-01

**Responde citando sentencias y artículos reales**, cada uno con enlace a su
fuente. **El camino:** `api/ia/consultar` → `recuperarDelCorpus` → embedding de
la consulta (OpenAI) → RPC `buscar_corpus` + `buscar_legislacion` en Supabase →
`wrapExternalData` sobre cada fragmento → modelo → respuesta con citas.

**Cómo probarlo:** `pnpm dev` → `/abogados`. Consultas que funcionan bien:
prestaciones por despido · plazo del amparo · escritura de constitución de
sociedad · prescripción de un pagaré · requisitos de la ejecución hipotecaria. Y
para enseñar el diferencial, algo fuera del corpus («régimen fiscal de las
criptomonedas en Islandia»): responde **«no encontré fuentes»** en vez de
inventar, que es lo que ningún asistente genérico hace.

- **La recuperación es UNA, compartida por los dos motores** (`lib/corpus/`). Si
  viviera dentro de cada motor, el otro tendría su copia y una de las dos acabaría
  sin el filtro de materias reservadas. Cambiar de modelo generador no puede
  cambiar qué fuentes se traen ni qué filtros legales se aplican.
- **`motor-openai.ts` es el banco de pruebas, no el reemplazo.** El destino sigue
  siendo Claude (`JUSTIHN_MOTOR_IA=claude`).
- **La norma va ANTES que su aplicación** en las citas: si el art. 120 responde
  la consulta, es la primera cita y las sentencias lo acompañan. No se mezclan
  por score: un fragmento de 1.200 chars y un artículo completo no puntúan igual.
  Legislación se pide con límite 8, no 4: los artículos pertinentes puntúan
  apretados y el canónico quedaba fuera. ⚙️ El arreglo fino es trocear los
  artículos largos como a las sentencias.
- **Una cita por sentencia**, no por fragmento (`distinct on` en el RPC). La
  unidad de cita es la sentencia; y un ranking plano se llenaría con la sentencia
  más larga, que por tener más fragmentos tiene más billetes en la rifa.
- ⚠️ **La cita apunta a `sij.poderjudicial.gob.hn/sentences/{id}`, no a la API.**
  `api/getHtml?id=` devuelve JSON, así que quien pinchaba una cita veía un
  volcado. «Toda cita debe poder abrirse» es la promesa que separa esto de
  ChatGPT, y una cita que abre JSON la incumple igual que una inventada.

### 1.7 Jurisprudencia sobre el corpus real (2026-09-02)

Busca sobre las **18.314 sentencias legibles** (19.742 menos las 1.428
reservadas por §5, que RLS esconde a la clave `anon`). Todo pasa por `guard()`;
el modo por palabras no gasta LLM.

- **Dos modos.** *Por palabras* (por defecto): Postgres puro —ILIKE sobre el
  resumen del CEDIJ y el expediente, AND entre palabras—, conteo exacto, 20 por
  página, más recientes primero. *Por significado*: vectoriza la consulta
  (~US$0,00002) y usa el MISMO RPC que Jus IA; hasta 30 por afinidad, sin páginas
  — un ranking semántico no tiene «página 7», y la UI lo dice. Techo global
  propio (3.000/día) porque no es gratis.
- **`sentencias.texto` NO es la sentencia: es la FICHA JURISPRUDENCIAL** del
  CEDIJ (verificado sobre 400 filas). `lib/corpus/ficha.ts` la parsea y extrae
  fallo, partes, tesauro y legislación en **400 de 400**. Se parsea en la app, no
  en la base: un solo dato de origen.
- ⚠️ **Dos columnas mienten con su nombre.** `fallo` guarda el estado de
  publicación («Publicada» en el 100% de la muestra): el fallo real solo vive en
  la línea «Fallo …» de la ficha. Y `organo` es el **tribunal de procedencia**,
  no quien resolvió: en una card se leería como si la Corte de Apelaciones
  hubiera dictado la casación. Toda sentencia del corpus la dictó la CSJ. Hay
  test para las dos.
- ⚠️ **«No se indica» es un hueco, no un dato.** El CEDIJ lo usa de relleno en el
  52% de los órganos y el 29% de los magistrados; `filter(Boolean)` lo dejaba
  pasar y las citas salían como «AC-834-22 · No se indica · 2025». Se normaliza a
  NULL al ingerir **y** se filtra otra vez al recuperar: la base ya tiene filas
  viejas, y una cita mal formada es lo primero que se ve del producto.
- **El título se deriva**: solo el 3% de las fichas trae «Tema». Para el resto,
  la ruta del tesauro sin su primer nivel; último recurso, proceso + expediente.
  Nunca texto inventado.
- **El CEDIJ tiene sentencias publicadas dos veces** (CL-463-01: `record_id` 1173
  y 1224). Se colapsan por expediente + fecha en lo que se enseña; el conteo total
  no se toca.
- **Los slugs del piloto siguen vivos** (`/abogados/jurisprudencia/cl-528-24`):
  la ruta resuelve el expediente en la base y redirige al `record_id`; si no está,
  enseña el seed.
- **Búsqueda por nombre** (Monitoreo · Mi nombre · Verifica) va sobre la columna
  `partes` (migración `03-partes.sql`, rellena el 2026-09-02: 19.742 filas).
  ILIKE sobre `texto` NO sirve: medido, un término inexistente tarda 2,2 s y cae
  por `statement timeout`. Si la columna faltara, el endpoint responde
  `disponible: false`, el hook cae al piloto y las pantallas dicen de dónde salió
  la respuesta; un error de red se enseña como error, nunca como «sin apariciones».
- **Un resultado por nombre para toda la pantalla** (`useAparicionesDe`): la
  columna lateral y cada card salen del mismo dato. Caché por nombre a nivel de
  módulo.

### 1.8 Legislación sobre las tablas reales (2026-09-03)

Lee los **3.989 artículos** de `codigos` + `articulos`, cada uno con su página
del PDF oficial. `api/legislacion/buscar` tras `guard()`, dos modos, y **cada
artículo es una ruta real** (`/abogados/legislacion/[codigo]/[numero]`) con su
texto, el PDF abierto en su página, los vecinos por posición y la herramienta del
portal que lo aplica.

| Código cargado | Artículos | Fuente |
|---|---|---|
| Código del Trabajo | 875 | CEDIJ |
| Código de Familia | 357 | CEDIJ |
| Código Procesal Civil | 930 | CEDIJ |
| Ley sobre Justicia Constitucional | 124 | TSC |
| Código de Comercio | 1.703 | e-Regulations ⚠️ |

Civil y Penal aparecen «en preparación» **diciendo POR QUÉ** — el CEDIJ no
publica el Civil y del Penal solo publica el de 1983, derogado desde 2020.

- **Dos modos.** *Por número o palabras*: si la consulta parece un número («120»,
  «art 120-A») va directo al artículo; si no, ILIKE con AND, **en el orden del
  código** (un código se lee en orden, no por fecha), y **sin consulta lista el
  código entero** — es la forma de leerlo, no solo de buscar en él. Medido: 0,15 s
  sin índice trigram. *Por significado*: el MISMO RPC que Jus IA, sobre todos los
  códigos a la vez, hasta 12 por afinidad.
- ⚠️ **El Código de Comercio es una edición SIN las reformas recientes**: los
  mínimos de socios y capital han cambiado. `Codigo.advertencia` lo dice en la
  cabecera y en cada artículo, y `legislacion.test.ts` exige esa advertencia.
  Sirve para la estructura; las cifras se contrastan con La Gaceta.
- ⚠️ **El seed tenía dos artículos INVERTIDOS** desde el 2026-08-25, enlazados
  desde Calculadoras: decía que el art. 399 del CPC era el abreviado y el 400 el
  ordinario, y el PDF dice lo contrario (**399 = ordinario, 400 = abreviado**,
  reformado por Decreto 21-2015). Es la razón de que la pantalla ya no enseñe
  síntesis: enseña el texto, y el seed solo guarda los **destacados** (los
  artículos que otra pantalla ya aplica) con número, rótulo, nota y herramienta.
- ⚠️ **Los ids del seed deben ser los de la tabla** (`codigo-procesal-civil`, no
  `cpc`): con el id viejo la pantalla preguntaba por un código inexistente.
  `ALIAS_CODIGO` resuelve los enlaces viejos; el test fija los cinco ids.
- **Solo el CPC trae rúbricas**: `parsearArticulo` (`lib/corpus/articulo.ts`,
  puro) las separa y las pasa a frase (363 de 400). Trabajo y Familia no titulan:
  la card enseña el número y, si es destacado, el rótulo del portal **diciendo
  que es del portal**. Nunca un título inventado.
- **ILIKE no ignora tildes** («cesantia» no encuentra «cesantía»). El estado
  vacío lo dice y ofrece el modo por significado, que sí lo entiende.
- **`ARTICULOS_SIN_TEXTO`**: 4 artículos del CEDIJ cuyo encabezado no está en la
  capa de texto del PDF (Trabajo 527, 529 · CPC 40, 420) y 11 que **faltan en el
  origen** de e-Regulations (Comercio 1000 y 1236-1245). Buscarlos o abrir su
  ruta explica el hueco con enlace al PDF, en vez de «no existe» o un 404.
- **Móvil: la columna de códigos se vuelve un `<select>`**; con la columna, los
  artículos quedaban seis tarjetas más abajo.
- ⏳ **Reestructurar la pantalla** — pendiente §6.2, con tres prototipos ya hechos.

### 1.9 Procesos — cada paso cita su artículo (2026-09-03)

Los cuatro procesos (despido · divorcio por mutuo consentimiento · sociedad
mercantil · amparo) llevaban «art. ___» desde agosto: marcadores honestos
mientras no hubiera códigos cargados. Ahora **cada paso cita fuentes que se
ABREN**: los artículos de códigos cargados abren el artículo en el portal (§1.8);
lo demás abre el PDF oficial **en su página**.

- **Contrato**: `PasoProceso.fuentes: FuenteCita[]` (etiqueta + url) sustituye a
  `fuente`/`fuenteUrl`; `Proceso` gana `resumen` (el dato que decide si es este
  proceso) y `fuentesOficiales` (el sello de la cabecera). Tabla futura `citas_paso`.
- `procesos.test.ts`: ningún «___», toda cita interna apunta a un código cargado
  con número real, toda externa es host de la whitelist y, si es PDF, lleva
  `#page=`; todo plazo nombra su artículo; el modelo existe.
- **Entra en el plan Profesional** («Procesos paso a paso, cada paso con su
  artículo»). Es contenido, y el modelo es «todo el corpus para todos los de
  pago, escalera por cuota de IA».
- **Por qué se cargaron los códigos 4 y 5**: medido, Jus IA recuperaba bien
  despido y divorcio, pero para el amparo traía artículos del CPC y del Trabajo
  (0,58–0,62) y para la escritura de una sociedad, artículos ajenos (0,50–0,55) —
  por encima del umbral, es decir, citas que no venían al caso. La pantalla y el
  asistente sabían cosas distintas. Con la Ley y el Comercio cargados, el amparo
  recupera LJC 46/48/49/50 y la sociedad, Comercio 14/92/93/94.
- ⚙️ Pendiente del socio: validar documentos y notas de práctica (conocimiento
  del gremio, no texto de ley).

### 1.10 Alertas de Gaceta — en vivo desde la ENAG (2026-09-03)

Lee `gacetas` + `publicaciones_gaceta`, que llena `capturar.py` desde la Mac con
los PDF de la ENAG (`automatizaciones/gaceta/`, con su README). **Sin datos, la
pantalla lo dice y enseña la maqueta**: sin migración («maqueta de
demostración») y con tablas vacías («conectada, sin ediciones capturadas»).

- **Fuente**: `enag.gob.hn` (⚠️ **sin `www`**, que rechaza la conexión) →
  listado por mes → `/viewdocument/{id}` sirve el PDF sin login. La portada lleva
  el SUMARIO con emisor, documentos y rangos de página. La ENAG **publica con
  retraso**: el listado llega hasta donde el portal ha subido.
- **Una publicación = un bloque de emisor del sumario**, con su rango de páginas,
  tipo, materia SOLO con regla clara (en agosto, 1 de 41 — casi nada de lo que
  publica el Estado cabe en una materia del abogado, y la pantalla lo dice) y un
  `extracto` desde donde arranca en su página. La cita abre el PDF **en esa
  página**. El «Avance» (anuncio de la siguiente edición) se guarda y no se lista.
  La Sección B (avisos legales) se guarda íntegra en `gacetas.texto_b` para
  Monitoreo; aún no se busca desde la app (§7.3).
- **Lo que se quitó a propósito (§4.5):** el «impacto en tu práctica» redactado a
  mano y el conteo «afectan tus casos activos» — nadie produce ese dato. Y el
  digest ya no dice «enviado también por WhatsApp».
- **Un solo hook** (`useGaceta`) alimenta la pantalla y la línea del Dashboard:
  con datos reales cuentan lo mismo; sin ellos, el Dashboard dice «Maqueta: …».
  `/abogados/gaceta/[id]`: id numérico → publicación real; slug → seed.
- ⚠️ **La librería NO recuerda que la tabla no existe**: comprueba en cada
  petición. Se cacheó una vez y, tras pasar la migración en caliente, el servidor
  en marcha seguía enseñando la maqueta.
- ⏳ Falta el **cron diario** (`tareas-desde-la-mac.md` §4). ⚠️ En la terminal de
  Wesley `python3` es el de Anaconda: `pypdf` se instaló ahí.

---

## 2. Stack (pins reales)

Next.js 16.3 (App Router) · React 19.2 · TypeScript 5.9 · Tailwind v4 · Zustand 5
(persist) · Zod 4 · Radix Dialog · Vitest 4 · pnpm · `@supabase/ssr` ·
`@upstash/ratelimit`. GSAP por import dinámico (solo decoración).

Instalados y aún sin cablear: `@anthropic-ai/sdk`, `@tanstack/react-query`,
`lucide-react`.

## 3. Mapa del código

| Ruta | Qué vive ahí |
|---|---|
| `src/app/abogados/` · `src/app/personas/` | Los dos portales, cada pantalla una **ruta real** (no estado) |
| `src/app/(landing)/` · `(profesional)/` · `(profesional-black)/` · `(publico)/` · `(auth)/` | Las superficies públicas, cada grupo con su shell |
| `src/app/api/` | `ia/consultar` (§1.6) · `jurisprudencia/buscar` (§1.7) · `legislacion/buscar` (§1.8) · `gaceta/publicaciones` (§1.10) · `corpus/apariciones`. **Todo pasa por `guard()` antes de gastar nada** |
| `src/proxy.ts` | Proxy de Next 16: refresca la sesión en cada petición y cierra `/abogados` y `/personas` a quien no la tiene |
| `src/lib/security/` | **El harness (§3 del blueprint).** `api-guard` · `rate-limit` · `sanitize` (con la whitelist de hosts oficiales) · `ai-safety`. No reinventar por ruta |
| `src/lib/supabase/` | `cliente` (navegador) · `servidor` (con `usuarioActual()`, que **verifica** el token, no lo lee de la cookie) |
| `src/lib/ai/` | `router-demo` (determinístico) · `motor-claude` y `motor-openai` (**encendidos**) · `sin-fuentes` (la negativa, en un solo sitio) · `tipos` |
| `src/lib/corpus/` | **El RAG y los buscadores.** `supabase` (RPC con la clave `anon`) · `embeddings` · `recuperar` (**una sola recuperación para los dos motores**) · `ficha` (parser del CEDIJ) · `articulo` (parser de rúbricas, puro) · `catalogo` (puro, lo importa la pantalla) · `sentencias` · `legislacion` · `gaceta` |
| `src/data/` | 12 seeds = **contrato literal** de las tablas futuras. Cada archivo lleva su `TODO(data)` |
| `src/store/portal.ts` | Zustand + persist en `justihn-portal-v1`, **v6** con migraciones encadenadas y test |
| `src/hooks/` | `use-saludo` (`useHoy`, `useAhora`, `useSemanaActual`) · `use-preguntar-jus-ia` · `use-jus-ia` · `use-apariciones` · `use-gaceta` · `use-busqueda-url` · `use-en-vista` |
| `src/components/landing/` | Lo compartido por las tres landings + `landing.css` (⚠️ NO se importa en los portales) |
| `src/components/publico/tarjeta-abogado.tsx` | **La card oficial del abogado** — un solo sitio, tres superficies (§4.5) |
| `src/components/ui/primitivos.tsx` | Primitivos patrón shadcn. `Card` lleva el tratamiento Papel (§1.5) |
| `supabase/esquema/` · `../automatizaciones/*/esquema/` | Los SQL que Wesley pasa a mano: negocio, identidad, corpus, legislación, gaceta |

## 4. Reglas propias de este proyecto

1. **Sin fuente no hay respuesta.** Es la promesa del producto, no una
   optimización: el motor prefiere decir «no encontré fuentes» antes que
   responder de memoria. No relajar esto para «que se vea mejor la demo».
2. **Todo dato externo es DATO, nunca instrucción.** Fichas del CEDIJ, PDFs de
   Gaceta y documentos que sube el abogado pasan por `wrapExternalData()` antes
   de tocar un prompt (§3.2 del blueprint). Cubierto por tests.
3. **Fallar cerrado.** Las rutas `role: "session"` devuelven 401 sin sesión
   verificada, y el proxy redirige al login. No hay modo demo: se retiró con
   Supabase Auth. Nunca «pasa por ahora».
3.5. **Una consulta admite VARIAS respuestas** (decisión Wesley 2026-08-31,
   patrón Jusbrasil): cualquier abogado Premium puede responder y la persona
   compara antes de escribirle a uno. No es un reparto de leads — asignar la
   consulta al primero dejaría al ciudadano con quien llegó primero, y dejaría
   sin vitrina a los demás, que es el argumento de por qué se paga Premium.
   Cada respuesta guarda solo `abogadoId` y `getFirmante()` lo resuelve: **sin
   autor identificable no se pinta** (§4.5), y cada una lleva SU botón de
   contacto. `respuestasDe(id, store)` es el ÚNICO sitio que junta seed y store,
   así que el abogado y el ciudadano ven la misma lista (hay test).
4. **Un solo lugar por dato de dominio.** Precios en `data/catalogo.ts` (incluido
   `destacado`, que decide insignia, realce e imán en las cuatro superficies con
   planes); cálculo laboral en `lib/prestaciones.ts`; tiempo relativo en
   `lib/tiempo.ts`. Si la UI y Jus IA dan números distintos, es un bug de
   duplicación.
5. **Determinismo/SSR.** Nada de `Date.now()`/`Math.random()` en carga de módulo.
   El saludo por hora y el store persistido se hidratan **tras el mount**.
6. **Fidelidad de marca.** Geometría de logos fija; el cruce `#0e5f92` solo vive
   dentro del símbolo y en el hover de botones celestes — nunca como color de
   interfaz suelto.

**Umbral semántico: 0,45, y es UNO solo** para Jus IA, Jurisprudencia y
Legislación, porque el modelo de embeddings es uno
(`text-embedding-3-small`). Medido tres veces sobre poblaciones distintas:
pertinentes 0,51–0,77 · ajenas 0,19–0,40. Con el 0,3 inicial, «criptomonedas en
Islandia» devolvía cinco citas de jurisprudencia hondureña: el modelo decía
correctamente que no sabía, pero la respuesta salía con cinco enlaces debajo, con
el aspecto de estar respaldada (§4.5). ⚠️ **Descartar de más es preferible a
citar de más**: una respuesta con menos fuentes se nota y se puede reformular;
una que cita algo que no viene al caso parece correcta y no se nota.

### 4.5 No fabricar pruebas (la regla que más ha corregido código)

Lo público decide a quién contrata una persona y a qué se suscribe un abogado.
Nada que sugiera evidencia puede salir de la nada:

- **Fuera «★ valoración»** de todas las superficies públicas (estaba en cinco):
  no existe sistema de reseñas, ese número no lo producía nadie. Se sustituye por
  **años de ejercicio**, que sí es verificable.
- **Fuera los conteos** (contactos, respuestas): vanidad. Uno con 34 respuestas
  no es mejor que uno con 12, y contarlas premiaría publicar por publicar.
- **La cita de la card** sale de una respuesta real del abogado en el
  consultorio, **no de un campo que él redacte** — si lo escribe él, vuelve a ser
  marketing. Es el diferencial: deja juzgar CÓMO explica antes de escribirle, y
  nadie puede copiarla sin un consultorio detrás.
- **Nada de «Contactar por WhatsApp» en el primer toque:** sacaba el contacto de
  Justihn sin registro ni trazabilidad. Es **«Consultar con [nombre]»**;
  WhatsApp llega cuando ya hay conversación.
- **No prometer inventario que no existe.** La landing no anuncia cifras de
  sentencias mientras el corpus no las respalde (llegó a afirmar que Jus IA
  citaba «las 20.202 sentencias» con 12 en el seed y el motor apagado).
- **No copiar la escasez de las referencias** («los primeros 200 aseguran estas
  condiciones»): sería inventarse un cupo. El gancho es la gratuidad, que sí es
  verdad.
- **Sin fuente no hay sello.** Al tocar una guía, o se mantiene su `fuenteUrl`, o
  se quita el sello «Verificado con la fuente oficial».
- **Un botón que solo enseña un toast es una promesa falsa.** Se han quitado
  cuatro por esto: «Avisarme cuando esté» de los códigos, «Abriendo la fuente
  oficial…» de Procesos, el «impacto en tu práctica» de Gaceta y el «enviado
  también por WhatsApp» del digest.

### 4.6 Una salida por decisión

Cada bloque empuja al paso siguiente y nada compite con él. Se quitaron por esto:
«Ver todas las consultas del consultorio», el enlace al directorio bajo las guías
(cada guía ya cierra recomendando abogado de su materia), «Ver todo el
directorio», «Ver el portal por dentro» en el CTA final (ofrecía entrar sin
cuenta justo donde se pide crearla), y el «Empezar →» de las cuatro puertas de la
home (competían con las secciones reales de justo debajo; llevan
`glass-card--estatica`, sin el hover que promete un clic que no existe).

La página tampoco termina dos veces: la cross-sell a la vía A va **antes** del
CTA oscuro, no después.

### 4.7 Trampas verificadas (leer antes de tocar una landing)

1. **`.landing-aurora a { color: inherit }` le gana por especificidad a
   `text-white` de Tailwind.** Cualquier utilidad de color sobre un `<a>` de una
   landing se pierde en silencio — **el color va inline**. Ha mordido tres veces.
   Al mover una página al shell aurora, **revisar todo `text-white` sobre `<a>`**.
2. **`useSearchParams` bajo `<Suspense>` = contenido invisible para Google.** Ese
   hook hace que Next abandone el prerenderizado del subárbol y emita el fallback:
   la home llegó a servir 130 caracteres de texto en vez de 7.452. Se lee la query
   con `useSyncExternalStore` sobre `window.location.search`
   (`hooks/use-busqueda-url.ts`), o en el servidor con `searchParams` de la page.
3. **Los filtros ocultan, no montan.** Las tres rutas de trámites se renderizan
   siempre y el chip activo esconde las otras con `hidden`. Si se montara solo la
   activa, 4 de las 9 guías dejarían de existir para el crawler.
4. **Un `<a>` con transform propio pierde una animación.** GSAP escribe
   `transform` para el imán magnético; si el elemento ya tiene un `:hover` con
   transform, una de las dos se pierde en silencio. `magnetico.test.ts` lo topa.
5. **Longitudes dentro de un SVG dependen del motor.** `translateX(7px)` se
   interpreta como unidades del viewBox o como píxeles CSS según el navegador — el
   logo salía torcido en Safari. La separación va en la propiedad de geometría
   **`x`**, con el giro sobre el centro de cada pieza (`transform-box: fill-box`).
   Y **`zoom` no es estándar**: para reducir un lienzo, `transform: scale`.
6. **satori (`next/og`) no lee woff2**, que es lo único que deja `next/font` en el
   build — por eso las fuentes van versionadas en TTF (`app/_og-fuentes/`, OFL).
   Y sin **`metadataBase`** Next emite el `og:image` relativo y WhatsApp no pinta
   nada. El origen vive en la constante **`SITIO`** (`app/layout.tsx`) y en ningún
   otro lado: **`https://justihn.com`**, con `NEXT_PUBLIC_SITIO_URL` como override.
   El `og:url` va **por página**: uno global haría que toda página compartida se
   canonizara como la home. `noindex` no afecta a esto.
7. **Chromium fuerza `line-height: normal !important` en `<select>`.** Dos campos
   contiguos (input + select) no se igualan tocando el interlineado: hay que
   darles **altura explícita**. Pasó en el consultorio (40 vs 42,3px), en el
   onboarding (44 vs 45px) y en los filtros de Trámites (42/41/40px).
8. **El `next` del alta se valida** (`destinoSeguro()`): debe empezar por
   `/personas` y no por `//`. **No quitarlo** — sin él es un redirect abierto
   colgando de un formulario que pide correo y contraseña, justo donde sirve para
   mandar a alguien a una página falsa después de escribir sus datos.
9. **Área táctil = 24×24 (WCAG 2.5.8), con los enlaces dentro de una frase
   exentos** — ahí el tamaño lo manda el texto. Un listón de 32px da falsos
   positivos. El toggle «Ver» de la contraseña se agranda con `right-3 → right-1
   + px-2`, que compensa los 8px exactos sin mover el texto.
10. **El desplazamiento suave va en JS, no en `html { scroll-behavior: smooth }`.**
    Esa regla es global y alcanza también al salto al principio que hace Next al
    cambiar de ruta: en una home de 8.000px, abrir un trámite se volvería un
    scroll animado de varios segundos. `desplazamiento-suave.tsx` intercepta solo
    las anclas de la propia página, respeta ⌘/ctrl/shift-clic y frena 96px antes.
11. **Los colores del pie van en `.pie-aurora` (landing.css), no inline** — un
    color inline le ganaría a la clase y dejaría texto marino sobre marino.
12. **Una guía fuera de `RUTAS_TRAMITE` desaparece de la home** aunque exista en
    el seed y en su URL. Es invisible leyendo el código, así que
    `tramites.test.ts` lo topa (cada trámite en exactamente una ruta, sin
    repetir, sin inventar ids, sin colar procesos judiciales, todas con `tasaCorta`).
13. **`tasaCorta` y `tasa` no pueden decir cosas distintas** — la corta es la
    verificada condensada a una línea, no un dato nuevo. Al editar una, revisar
    la otra.
13b. **Un conteo escrito a mano se queda viejo al nacer el elemento 14.** La
    tarjeta social decía «13 guías con fuente» y el número vive en
    `TRAMITES.length`: ahora se deriva del seed. `og.test.ts` acepta plantillas
    además de comillas por eso — si vuelve a aceptar solo `"..."`, el sello
    derivado desaparece del conteo y el test miente.
14. **Ninguna página nombra la marca sin `absolute`**, o la pestaña dice
    «Justihn» dos veces. Se coló en tres páginas a la vez; `titulos.test.ts` lo topa.
15. **El imán magnético va SOLO en los botones azules sólidos** (nav, enviar del
    composer, plan destacado, CTA de cierre). En un botón de solo borde no se lee
    como intención sino como que el botón tiembla, y si todo se mueve el efecto
    deja de señalar la acción principal. Se apaga con `prefers-reduced-motion` y
    sin `(hover:hover) and (pointer:fine)` — en táctil el botón se escaparía al tocarlo.
16. **El botón lleno de la nav es «Crear cuenta gratis», no «Iniciar sesión»** en
    las dos landings: el botón lleno es para la acción que la página busca, y por
    debajo de 980px lo que queda visible es ese botón más el menú de móvil.
17. **El menú de móvil (`<980px`) es lo único que da acceso a las secciones y al
    cambio de audiencia** en un teléfono. Tres cosas que se rompen fácil:
    - La regla base `.nav-burger { display: none }` tiene que ir **antes** del
      `@media (max-width: 980px)` que la pone en `flex`: misma especificidad,
      gana la última. Con el orden invertido el botón no aparece nunca, y el
      fallo se ve solo en móvil.
    - El panel se **oculta con `display:none`, no se desmonta**: así el crawler
      conserva los enlaces y el foco no entra en un menú cerrado.
    - **No bloquea el scroll del body** a propósito: con `overflow:hidden`, el
      clic en un ancla se pisaría a sí mismo.
18. **Un `setState` dentro de un `useEffect` no pasa el lint**
    (`react-hooks/set-state-in-effect`), y es el reflejo natural para resolver
    «hoy» o la hora local tras el mount. El mecanismo del proyecto es
    **`useSyncExternalStore` con el valor memoizado** (`hooks/use-saludo.ts`) —
    sirve el valor neutro en SSR y el real después, sin render en cascada. Al
    necesitar un dato que solo el navegador conoce, añadir un snapshot ahí.
    Para el estado de carga de un `fetch`, **derivarlo** comparando la clave del
    último resultado con la actual, en vez de un `setState` de «cargando».
19. **Un componente reutilizado en dos superficies no puede traer su `<h1>`
    fijo.** `CalculadoraPublica` titula `/calculadora-prestaciones`, pero dentro
    de `/personas/calculadora` convive con la de plazos: dejaba dos h1. Baja a
    `h2` con `enPortal`. Al montar un componente público dentro de un portal,
    revisar su encabezado.
20. **`min-w-[Npx]` sobre un `flex-1` desborda en pantallas estrechas.** El
    mínimo es rígido: a 320px la card de cross-sell se salía 9px (19 en WebKit,
    que reserva más barra de scroll). Se escribe **`min-w-[min(Npx,100%)]`**.
    ⚙️ Quedan varios `min-w-[180..240px] flex-1` en los portales.
21. **Un tiempo relativo («hace 2 h») nunca se guarda ni se calcula en
    servidor.** El servidor no sabe la hora del visitante y un `Date.now()` en
    SSR es un mismatch de hidratación esperando. El dato es `creadoEn` (ISO) y lo
    pinta `<Cuando iso>`: fecha corta en SSR, relativo tras el mount vía
    `useAhora()`. `lib/tiempo.ts` es el único formateador.
    ⚠️ `fechaTexto()` parsea el día a mano: un `new Date("2026-08-19")` es
    medianoche UTC y en Honduras (UTC−6) la Gaceta del 19 salía fechada el 18.
22. **Un selector por `aria-label` puede pulsar el buscador global.** El de ⌘K
    lleva `aria-label="Buscar en jurisprudencia, …"` y las pantallas «Buscar en
    {algo}»: en un E2E, `[aria-label^='Buscar en']` acaba en otra pantalla.
    Localizar los campos por `placeholder`.

## 5. Comandos y verificación

```bash
pnpm dev          # http://localhost:3000
pnpm lint
pnpm type-check   # tsc --noEmit
pnpm test         # Vitest — 265 tests en 29 archivos
pnpm build        # gate antes de cualquier entrega
```

**Gate (§5 del blueprint):** `lint` + `type-check` + `test` + `build` verdes en
cada incremento, más verificación visual con Playwright (y con **WebKit** cuando
se toque SVG, animación o layout fino: ahí aparecen las diferencias de motor).

Los tests cubren lo que no se ve leyendo el código: el harness de seguridad
(inyección, enmascarado, hosts oficiales), el determinismo y honestidad del
router, prestaciones, plazos, vía procesal, las 14 guías con fuente en la
whitelist, las instituciones, el buscador de guías, los títulos de página, las
rutas de trámites, las colisiones del imán, las migraciones del store, los actos
notariales, los procesos (ninguna cita muerta), el parser de la ficha del CEDIJ y
el de los artículos, y el mapeo de La Gaceta (la Sección B va detrás de la A).

**E2E con cuenta real** (patrón desde 2026-09-02): crear la cuenta con la API
admin de Supabase (`POST /auth/v1/admin/users` con `email_confirm: true`, la
`service_role` está en `automatizaciones/corpus-csj/.env`), recorrer, y
**borrarla al terminar**. Los scripts viven en el scratchpad de la sesión, no
commiteados: dependen del servidor de desarrollo.
⚠️ **WebKit no guarda la cookie de sesión en `http://localhost`**, así que el
login se queda esperando: verificar WebKit contra `justihn.com` o decir que la
pantalla se verificó solo en Chromium.

---

## 6. Pendientes — por dónde seguir

1. **🔎 REFINADO DE LOS DOS PORTALES antes de congelar el esquema de negocio**
   (decisión Wesley 2026-08-30). Va primero por un motivo técnico, no de gusto:
   **los seeds son el contrato literal del esquema**. Si el refinado cambia un
   dato o descubre que falta uno, ahora cuesta una línea; con las tablas creadas
   cuesta una migración. Qué mirar: campos que no existirían en la tabla o que
   sobran · las entidades del feedback del socio (instituciones, trámites por
   institución, directorio público, planes de la vía B) · recorrido de las 30
   pantallas en escritorio y móvil, deep-links, estados vacíos y que nada prometa
   lo que no hace (§4.5).

   **Auditoría de seeds — ya hecha (2026-09-02/03), no repetir:** un solo id para
   la abogada demo (v3 del store) · `validado` → `verificado` · `Sentencia` es
   VISTA, no tabla · **`cuando` → `creadoEn` (ISO)** en Lead, RespuestaConsulta,
   MensajeAbogado, Notificacion y ConversacionGuardada, con `lib/tiempo.ts` y
   `<Cuando>` (v4) · `Lead` es solo la fila, con `leadsVistosIds` y
   `RESPUESTAS_SEED` aparte (v5) · cadenas compuestas partidas
   (`numeroGaceta`+`fechaIso`, `colegiacionNumero`, `creadoEn`) · `NombreVigilado.id`
   anotado como uuid futuro.
   📌 **Decisiones tomadas:** `Proceso.plantillaId` se queda (`plantillas` es
   nombre de tabla, «Modelos» es el término de la UI). `ItemBrief` no tiene tabla
   detrás: al crear el esquema, o nace de `casos` o el brief se deriva de Gaceta +
   leads y pierde la fila «ACTUAR».

2. **Reestructurar Legislación** (pedido de Wesley 2026-09-03). Tres prototipos
   —Buscador · Lector · Temas— con el shell del portal y datos reales, en un
   Artifact, **no en el portal** (se construyeron ahí por error y se revirtieron
   el mismo día): https://claude.ai/code/artifact/a7a10a59-7fc4-4d8e-9d07-0bde0cac98b5.
   Al elegir, se construye esa estructura sobre lo ya conectado (§1.8).
   ⚙️ Si gana el Buscador, sus tiles de tema deben enlazar a la lista curada: por
   significado, «cobro de una deuda» no pone el art. 676 primero.

3. **Monitoreo de verdad** (§7.3): tabla de vigilados en Supabase, buscar también
   en la Sección B de La Gaceta (donde salen los emplazamientos antes que en
   ninguna sentencia: 391 menciones de «Juzgado de Letras» en 13 ediciones) y el
   cruce semanal que escribe alertas. Mientras no exista, el copy no debe
   prometer aviso por WhatsApp.

4. **Elegir entre `/para-abogados` y `/para-abogados-black`** y borrar la ruta
   perdedora — ⏸️ aplazado a propósito: es una comparación visual que no bloquea
   nada. Ídem con la prueba de la aurora clara en auth (§1.4).

5. **SEO de la vía B:** no hay `sitemap.xml` ni datos estructurados
   (`HowTo`/`FAQPage` en las guías, que es lo que gana los rich snippets).
   🚦 **El `noindex` del layout raíz se mantiene hasta que el producto esté
   completo** (decisión Wesley 2026-08-30). Quitarlo es una línea, y el momento
   es cuando lo que la persona hace dentro sobreviva a su navegador (§7.3).

6. **Conectar las vitrinas que siguen en seed:** buscador global (⌘K), «Nuevo en
   tus materias» del Dashboard y los tres demos de la landing. Sus enlaces ya
   resuelven al corpus; son vitrinas, no buscadores.

7. **Más demos con seed real** si se sigue refinando: Calculadoras y Modelos. El
   patrón está: `SeccionDemo` + una vista. **Video real del portal**: cuando la UI
   se estabilice, grabar footage con Playwright sí aporta. **CTA de WhatsApp**:
   Justihn no tiene número configurado y no se inventó un enlace muerto.

## 7. Qué falta para Fase 2

1. [x] ✅ **Corpus completo (2026-09-02).** Proyecto Supabase
   `eemgphtiywxwrqwpylkv`: `sentencias` + `sentencia_chunks` (pgvector, HNSW) +
   RPC `buscar_corpus`; `codigos` + `articulos` + `buscar_legislacion`; `gacetas`
   + `publicaciones_gaceta`. Mantenimiento: refresco semanal desde la Mac
   (`tareas-desde-la-mac.md` §1b) que **espeja las retiradas del CEDIJ**.
   - **Credenciales:** la `anon` va en `.env.local`. ⚠️ La `service_role`
     **NUNCA** entra en este repo: se deploya a Vercel y un `NEXT_PUBLIC_` la
     publicaría en el bundle. Vive en `automatizaciones/corpus-csj/.env`.
   - **Los fragmentos guardan posición, no texto** (`inicio`/`largo` sobre
     `sentencias.texto`). Ahorra ~192 MB, pero la razón de peso es otra: con
     texto propio, un cambio en la limpieza del HTML dejaría al fragmento citando
     una versión que ya no coincide con su documento.
   - **Tres averías de la carga masiva y sus defensas** (las hereda cualquier
     fuente grande futura): la API devuelve páginas vacías por hipo y tiene huecos
     de paginación profunda → reintentar 3 veces y SALTAR, declarando el fin solo
     pasado el total · el WAL de Postgres crece más rápido que el autoscaling del
     disco (error 53100 con el disco «vacío») → pausa de 1,5 s entre lotes · el
     índice HNSW encarece cada insert al crecer (timeout 57014 a los ~40k
     vectores) → escrituras en tandas de 50 con reintento.
2. [x] ✅ **Supabase Auth + proxy (2026-09-02).** Alta, confirmación por código,
   login con destino por cuenta, cierre de sesión y RLS. El modo demo se retiró.
3. **⭐ Las tablas de NEGOCIO — el pendiente grande.** Todo lo que la persona y el
   abogado *hacen* sigue en `localStorage`: consultas del consultorio, respuestas,
   leads, casos, propuestas, nombres vigilados, mensajes a abogados y avance de
   trámites. Consecuencias: no sobrevive al cambio de dispositivo, no hay nada que
   cruzar para las alertas de Monitoreo, y el consultorio no puede conectar de
   verdad a la persona con el abogado. `supabase/esquema/01-negocio.sql` ya define
   `personas`, `abogados`, `leads`, `respuestas_consulta` y `documentos_validacion`;
   faltan `casos`, `propuestas`, `nombres_vigilados`, `mensajes` y `citas_paso`, y
   falta que la app lea y escriba en todas ellas con RLS por dueño.
   ⚠️ La consulta del consultorio **se publica antes del alta**: hay que asignarle
   dueño en cuanto exista la cuenta, y decidir qué pasa si el visitante la
   abandona (hoy queda publicada y anónima, que es lo que la sección promete).
4. **Ledger de créditos** — `debitarCreditos()` en `api-guard.ts` es hoy un seam
   vacío: implementarlo como RPC atómico (decremento + auditoría en una
   transacción) y devolver 402 al agotarse.
5. **Pagos** — mismo cuello de BAC que Sonriprev; el pago anual único lo esquiva.
6. **Validar el cálculo laboral con el socio** antes de que un profesional lo use
   en un caso real (`lib/prestaciones.ts` lleva el aviso).

## 8. Deuda conocida

- **§5 (materias reservadas) ha fallado TRES veces, en las dos direcciones.**
  (1) Filtraba por materia, y el CEDIJ clasifica por rama del derecho: una
  violación en perjuicio de menor llega como «Derecho Penal», así que no excluía
  nada. (2) Reescrita sobre el contenido, dejaba pasar **CP-429-19**, una condena
  por violación de una víctima de 16 años **con el nombre completo del
  condenado**. (3) Al corregirla, la señal por sujeto reservó **1.009 casaciones
  laborales legítimas** por la fórmula «la sentencia acusada … la violación».
  La trampa de fondo: **«violación» a secas no sirve como señal** — en derecho es
  «violación de ley» y marca el 43% del corpus; lo que disambigua es la palabra
  que la acompaña. Hoy reserva el **7,2%** (`reserva.mjs`, con la regresión de
  CP-429-19 entre sus pruebas). **Lección: toda regla de §5 se mide en seco sobre
  las fichas locales antes de aplicarla, en las dos direcciones.**
  `reevaluar-reserva.mjs` la reaplica a lo ya cargado sin volver a ingerir ni
  tocar los embeddings, que ya están pagados.
  ⚙️ **Decisión que el socio debe confirmar:** se reservan TODOS los delitos
  sexuales, no solo los que mencionan a un menor. Es más amplio que la letra de
  §5; el motivo es que en una condena por delito sexual la víctima es
  identificable por el expediente aunque no se la nombre. Cuesta ~8% de la
  jurisprudencia penal del buscador.
- **Las sentencias del seed son REALES** (12 del piloto, con resumen CEDIJ,
  órgano, magistrado y fallo verdaderos). `data/sentencias.ts` se genera con
  `generar-seed.mjs` — regenerar, no editar a mano. Los expedientes `CAS-…` de
  brief y adjuntos son los **casos propios de la abogada demo**, no sentencias
  publicadas.
- **`lib/prestaciones.ts` está verificado artículo por artículo** contra el PDF
  del CEDIJ: cesantía art. 120, preaviso art. 116, vacaciones art. 346. Devuelve
  **conceptos con su artículo**, no tres cifras sueltas, y la entrada es **años +
  meses** porque la escalera se mide en meses. ⚠️ **El 13º y 14º NO están en el
  Código del Trabajo** (cero menciones en el texto oficial): van
  `verificado: false`, sin artículo y **fuera del subtotal respaldado por la ley**.
- ⚙️ **Pendientes del socio abogado:** revisar las respuestas demo de los leads ·
  contrastar las 14 guías contra la práctica real y vigilar las tarifas (la de
  ARSA es una tabla viva) · validar documentos y notas de práctica de Procesos ·
  ampliar las reglas de materia de La Gaceta · decir cómo se comprueba una
  habilitación notarial vigente (el PJ no publica padrón, así que hoy el
  exequátur del directorio es **declarado, no verificado**, y la UI lo dice;
  ningún perfil puede marcarse `verificado: true` — hay test que lo impide).
- **Responsive móvil base hecho**, falta pulido fino (tablas del chat, editor de
  escritos en pantallas muy chicas).
- ⚙️ **Capturas del portal en la landing: diferidas a propósito** — una captura
  driftea en cuanto cambia una pantalla, no le da texto al crawler, y la UI se
  moverá al conectar las tablas de negocio. Se reevalúa entonces.
