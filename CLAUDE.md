# CLAUDE.md — Justihn · plataforma (portal de abogados)

> Cerebro técnico del portal. Manda en su dominio sobre `justihn/CLAUDE.md`
> (producto/negocio) y sigue `../../STACK-BLUEPRINT.md` (arquitectura de la agencia).
> Creado: **2026-08-25** · Última actualización: **2026-08-30** (auth:
> iniciar sesión + onboarding de abogado desde `design_handoff_auth`).

---

## 1. Qué es

Portal SaaS para abogados de Honduras: jurisprudencia, alertas de La Gaceta,
paso a paso de procesos, plantillas, leads del consultorio, calculadoras y
**Jus IA** — el asistente que responde **solo citando fuentes oficiales**.

- **Diseño (hifi, pixel-perfect):** `../design_handoff_portal/` — `README.md`
  (specs), `04 Justihn Portal Abogados.dc.html` (prototipo), tokens de marca y
  logos. Es la fuente de verdad visual: **no improvisar valores**.
- **Estado:** Fase 1 del blueprint (§4) — UI completa contra seed determinístico.
  Sin backend, sin claves: corre en cualquier lado con `pnpm dev`.
  **Refinado integral 2026-08-25/26:** las 13 pantallas revisadas una a una
  (filtros, deep-links en URL, estados vacíos que derivan a Jus IA, checklist
  de procesos, responder leads inline, caja de herramientas del litigante,
  menú de avatar reorganizado, habeas data en Configuración). Jus IA con chat
  centrado, titular dinámico, animaciones de pensando y borde aurora; botón
  canónico `BotonJusIA` (gradiente vivo) en toda acción de IA. **El seed de
  jurisprudencia es REAL** (12 sentencias del piloto del corpus, ver §8).
- **Rutas (decisión Wesley 2026-08-25):** el portal vive bajo **`/abogados`**
  (antes `/portal`; redirects permanentes en `next.config.ts`). La pantalla
  "Paso a paso" se renombró a **"Procesos"** (`/abogados/procesos`) y
  "Plantillas" a **"Modelos"** (`/abogados/modelos` — "modelo" es el término del
  gremio y el que se googlea; los identificadores internos `PLANTILLAS`/
  `plantillaId` no cambian). Ambos con redirect. La raíz del
  dominio queda **reservada para la vía B** (gente común: landing, consultorio,
  Informe Verifica, contenido SEO) — patrón Jusbrasil: lo público indexable en
  la raíz, el app de suscriptores bajo su prefijo.
- **Pantalla nueva 2026-08-26 — Legislación (`/abogados/legislacion`):** cierra la
  promesa "legislación ilimitada" del plan Base (estaba vendida y no existía).
  Muestra REAL del CPC: artículos verificados contra el PDF oficial del PJ en el
  PoC del monitorio (399–400, 676–685, 782–783) con síntesis propia — nunca texto
  fingido; los demás códigos aparecen "en preparación" (sin fuente no hay texto).
  Seed en `data/legislacion.ts` (contrato de `codigos`+`articulos_codigo`, seam
  del scraper de legislación PJ — backlog #3/#5). Deep-link `?codigo=`, entrada
  en sidebar y en el buscador global (indexa artículos), cross-link con la
  calculadora de vía procesal.
- **Pantalla nueva 2026-08-26 — Monitoreo de nombres (`/abogados/monitoreo`, Pro):**
  materializa el último feature Pro que era solo un toggle. El matching corre EN
  VIVO sobre el texto oficial de las 12 sentencias del piloto (los vigilados
  iniciales son partes reales: Wilson P. Henríquez → CL-528-24; Estado de
  Honduras → 4 apariciones) con rol inferido del encabezado del extracto.
  Vigilados en el store (`nombresVigilados`, persistido, alta/baja); gating Pro
  patrón Modelos; disclaimer de homónimos + exclusión de materias reservadas
  (reglas legales día 1); copy honesto "vigilamos lo que el Estado publica".
  Seed/motor en `data/monitoreo.ts`. Con estas dos el portal tiene **15
  pantallas** y la tabla de planes queda 100% respaldada por UI.
- **Dashboard (decisión Wesley 2026-08-25):** la vista de `/abogados/dashboard`
  se llama "Dashboard" (título, sidebar y metadata). Regla de
  la pantalla: nada inerte — toda card navega o dispara una acción. Su
  "Pendientes de hoy" usa `usePreguntarAJusIA(pregunta, { enviarDirecto })`,
  que deja la consulta enviándose al llegar al chat.
- **Jus IA (decisión Wesley 2026-08-25):** chat en una sola columna centrada
  (~760px); el historial vive en un panel lateral (slide-over), no en columna
  fija. El titular del hero es dinámico: una frase del pool `TITULARES_HERO`
  (`data/jus-ia.ts`) por carga, elegida en cliente tras el mount — unas llevan
  el nombre y otras no.

- **🌐 VÍA B CONSTRUIDA (2026-08-29, decisión Wesley tras el feedback del socio):**
  el sitio público para la gente común vive en la **raíz** (grupo de rutas
  `src/app/(publico)/`, shell propio header+footer en `components/publico/`):
  Home con buscador · **/tramites** (9 guías de 7 instituciones — la lista del
  socio: RTN, CAI, permiso de operación, ARSA, ambiental, ONCAE, tradición de
  dominio, traspaso vehicular, constitución de sociedad; seed `data/tramites.ts`,
  tasas con marcadores "L ___" hasta verificación del socio) · **/directorio**
  (abogados por materia, `data/directorio.ts` — María Castillo es EL MISMO seed
  del portal; Premium aparece primero) · **/consultorio** (pregunta pública →
  entra a `preguntasPublico` del store → **aparece como lead en
  /abogados/leads**, y la respuesta del abogado aparece pública — la
  integración Vía A ↔ Vía B en vivo) · **/calculadora-prestaciones** (usa el
  mismo `lib/prestaciones`, §0.5). Cada guía de trámite recomienda abogados de
  su materia (funnel guía→lead). Planes público: Gratis + pago "en definición".
- **🏛️ PORTAL CIUDADANO `/personas` (2026-08-29, decisión Wesley):** el patrón
  Jusbrasil completo — la landing da la probadita y "crear cuenta gratis" abre
  un portal con shell propio (`components/personas/`, sidebar marino gemelo del
  de abogados; persona demo Carlos Zelaya, `data/persona.ts`). Pantallas:
  Inicio · Trámites (guías completas con **checklist persistido**,
  `pasosTramite` en el store) · Mis consultas (form + respuestas de abogados)
  · Encuentra abogado · Calculadora · Mi plan (Gratis + pago en definición).
  **Gates de la landing:** el detalle de trámite muestra solo el paso 1 (resto
  difuminado) → CTA `/personas/tramites/[id]`; preguntar en el consultorio
  "crea la cuenta" y redirige a `/personas/consultas`. Los componentes públicos
  compartidos aceptan `enPortal` para rutas/wrapper. **Menú del avatar**
  (patrón abogados) con Mi perfil (actividad real del store), Configuración
  (cuenta + prefs `prefsPersona` + habeas data) y Ayuda (FAQ ciudadana) —
  9 rutas en el portal ciudadano.
  **Renombrado 2026-08-29:** era `/persona` (singular) y su pantalla de
  búsqueda era `/persona/abogados`. Ahora **`/personas`** —para leer como
  pareja de `/abogados`, las dos vías del producto, y para coincidir con
  `components/personas/`— y **`/personas/directorio`**, que mata la colisión
  de `/abogados` significando a la vez el portal de suscriptores y una
  pantalla del ciudadano. El label de la UI sigue siendo "Encuentra abogado".
  Redirects 308 en `next.config.ts` para las cuatro formas viejas.
  `data/persona.ts` se queda en singular: es UNA persona demo, no la audiencia.
- **💼 LANDING DE LA VÍA A — `/para-abogados` (2026-08-29):** el "Para
  abogados" del header ya no tira al portal: ahora hay una página que VENDE
  antes de dejar entrar. Grupo `(profesional)` con shell aurora propio
  (`components/profesional/landing-profesional.tsx`); `NavAurora` quedó
  parametrizada (`enlaces`/`secundario`/`cta`) porque la misma superficie
  sirve a las dos audiencias. Secciones: hero · **cómo cita** (el diferencial
  contra un chatbot: sin fuente no hay respuesta · solo fuentes del Estado ·
  derecho hondureño) · 8 capacidades mapeadas a pantallas que EXISTEN ·
  **leads** (el funnel vía B → vía A, con las materias reales del seed) ·
  planes desde `data/catalogo.ts` con el ancla L25 y el anual −33% · CTA.
  **Ruta:** `/para-abogados`, no `/profesional` — el plan intermedio se llama
  "Profesional" (`PlanId`), así que esa URL habría chocado con el nombre del
  tier. Entradas: nav de la landing, "Soy abogado" del shell público y la
  sección de abogados de la home.
  ⚠️ **Regla de esta página: no promete lo que el portal no hace hoy.** No
  anuncia cifras de sentencias mientras el corpus no esté indexado. En la
  misma pasada se corrigió la home, que afirmaba "Jus IA responde citando las
  20,202 sentencias del corpus oficial" con 12 en el seed y el motor apagado.
  **Refinado 2026-08-29 (sesión con Wesley), en este orden:**
  - **Hero = composer de Jus IA** (`composer-jus-ia.tsx`), gemelo del buscador
    ciudadano: la caja no busca, pregunta. Enter envía · Shift+Enter salta
    línea · 3 chips de arranque de **materias y fuentes distintas** (Código del
    Trabajo · CPC + jurisprudencia · IP), elegidos para enseñar alcance, no
    frecuencia. Titular al patrón Jusbrasil ("Tu investigación jurídica empieza
    en Justihn") y subtítulo que dice **qué se puede preguntar** — ahí el
    lenguaje de inventario SÍ trabaja, porque está encima de la caja.
  - **Puerta de cuenta:** escribir es libre; al ENVIAR se pasa por
    **`/crear-cuenta`** (`crear-cuenta.tsx`). La pregunta se guarda en el store
    ANTES de navegar, la pantalla la muestra ("Tu pregunta te espera") y se
    dispara sola al llegar al chat. Se gatea en enviar y no en la primera
    tecla: cortar a media escritura se siente roto.
  - **Anillo de bienvenida** (`.borde-aurora--intro`): el borde aurora se
    enciende, dura ~4 s y se apaga solo; al recargar vuelve. Es animación CSS,
    así que reinicia con el montaje sin estado ni temporizadores.
  - **Tres secciones con demostración** (`demos.tsx`) — Jus IA · Gaceta ·
    Leads — con **datos reales de los seeds**, no maquetas: la sentencia citada
    es CL-528-24 del piloto, con su órgano y magistrada verdaderos. Se
    **reproducen** al entrar en vista (pregunta → pensando → respuesta →
    fuente) y se rearman al salir. No son video a propósito: el HTML conserva
    el texto para el crawler y las vistas siguen atadas al seed.
  - **CTA final oscuro**, único bloque marino de la página. Su titular ("Tu
    próxima búsqueda ya no empieza en Google") evita el paralelo tentador con
    la referencia —"tu próximo cliente ya está preguntando"— porque los leads
    del consultorio son seed: sería la misma sobreventa del corpus.

  **End-to-end 2026-08-30 (sesión con Wesley):**
  - **Encabezado canónico** (`Encabezado` en `landing-profesional.tsx`): las
    secciones centradas (Cómo cita · Qué incluye · Planes · FAQ) llevan el
    mismo patrón eyebrow + título + bajada — antes cada una tenía jerarquía
    distinta y Capacidades ni subtítulo tenía. Las secciones de demo conservan
    su eyebrow a la izquierda.
  - **Planes rediseñados:** (a) las TRES cards llevan siempre la línea bajo el
    precio (pago = anual −33% · Gratis = "para siempre — sin tarjeta") para
    que las features arranquen a la misma altura; (b) tagline `resumen` por
    plan, nuevo campo en `Plan`/`data/catalogo.ts` (fuente única); (c) features
    acumulativas ("Todo lo del plan X, y además:"); (d) el plan **recomendado** destacado con
    anillo por box-shadow — NO border-2, que encogería el contenido 1px y
    desalinearía las cards. **Desde 2026-08-30 el recomendado es Profesional**
    (decisión Wesley; antes Premium): es el escalón de entrada al pago y queda
    en la card del medio, el patrón clásico de pricing. `destacado` en
    `data/catalogo.ts` es la ÚNICA fuente — de ahí salen la insignia, el
    realce y el imán en la landing, en la black, en la card puente de la home
    ciudadana y en la pantalla de planes del portal; (e) los CTAs van a `/crear-cuenta` (antes
    `/abogados/planes`, que saltaba la puerta de cuenta); (f) nota del ancla
    L25 + anual bajo el grid. El subtítulo ya no dice "todo el contenido está
    en todos los planes" — la card Gratis dice "búsqueda limitada" y se
    contradecía a sí misma.
  - **Sección FAQ** (`#faq`, entre Planes y el CTA final): 6 preguntas con
    `<details>` nativo (server-rendered, cero JS, el crawler lee todo), copy
    `FAQ_LANDING` local a la landing — NO reutiliza `FAQS` del catálogo, que
    son dudas de uso interno del portal. Precios interpolados de
    `PLANES`/`OFERTA`, nada escrito a mano. En la nav ("Preguntas") y el footer.
  - **Footer:** enlaces de sección a anclas de esta página (un visitante sin
    cuenta no cae dentro del portal por accidente; "Portal" sí queda como
    entrada deliberada) + fila de cierre con copyright.
    **Unificado 2026-08-30 en `components/landing/pie-aurora.tsx`**, que usan
    las DOS landings (y la black): mismo pie, distinto contenido por props.
    Es un **bloque marino a sangre** (decisión Wesley) — transparente, la
    página se deshilachaba sobre el aurora en vez de cerrar. Los tonos viven
    en `.pie-aurora` (landing.css) y NO se ponen inline: un color inline le
    ganaría a la clase y dejaría texto marino sobre marino.
  ⚠️ **Trampa de esta landing:** `.landing-aurora a { color: inherit }` le gana
  por especificidad a `text-white` de Tailwind. Cualquier utilidad de color
  sobre un `<a>` de la landing se pierde en silencio — el color va **inline**.
  Pasó con los botones del CTA (texto marino sobre azul, ilegible).

- **🎨 LAS PÁGINAS PÚBLICAS INTERIORES USAN EL SHELL AURORA (2026-08-30):**
  el detalle de trámite y la calculadora tenían cabecera blanca y fondo plano,
  así que abrir una guía desde la home se sentía como **salir del sitio**.
  Ahora `(publico)/layout.tsx` monta el mismo `FondoAurora` + `NavAurora` +
  `PieAurora` que la home; `HeaderPublico`/`FooterPublico` quedan sin uso.
  - **Se coló una superficie con "Contactar por WhatsApp"** que la limpieza
    anterior no tocó (esas páginas usan tiras propias, no `TarjetaAbogado`):
    corregidas las tres públicas + la vista previa del perfil en el portal,
    que enseñaba al abogado un botón que los ciudadanos ya no ven.
  - ⚠️ **La trampa del shell, otra vez:** al entrar bajo `.landing-aurora`,
    tres `<Link>` con `text-white` perdieron el color y quedaron con el texto
    invisible sobre su fondo oscuro ("Ir al consultorio" entre ellos). Regla:
    **al mover una página al shell aurora, revisar todo `text-white` sobre
    `<a>`** — el color va inline.

- **👤 LA CARD OFICIAL DEL ABOGADO — `components/publico/tarjeta-abogado.tsx`
  (2026-08-30, elegida entre prototipos: "la card que habla"):** es la que ve
  una persona al decidir a quién contratar, así que vive en UN solo sitio y la
  usan la home, el directorio público y el del portal ciudadano.
  Orden = orden de la duda: **materias** (lo primero que se busca; el nombre
  aún no dice nada) → quién es (ciudad, años) → **credenciales** (colegiación
  validada / en trámite + habilitación notarial) → **su voz**: un fragmento de
  una respuesta suya en el consultorio → la acción, con su nombre.
  - **La cita es el diferencial.** Deja juzgar CÓMO explica antes de
    escribirle, y ningún competidor puede copiarla sin un consultorio detrás.
    **Pero solo donde se decide:** la card tiene variante **`compacta`**
    (decisión Wesley) que la home usa para meter TRES por fila, cambiando la
    cita por el resumen de especialidad. La home es vitrina —enseña que hay
    abogados y de qué materia—; la cita es munición para decidir y va entera
    en el directorio completo. Clamparla a dos líneas la cortaría a media
    frase, que es peor que no ponerla.
    ⚠️ `TODO(data)`: sale de su última respuesta destacada en `leads`, NO de un
    campo que el abogado redacte — si lo escribe él, vuelve a ser marketing.
  - **Fuera "★ valoración"** de TODAS las superficies públicas (eran 5: home,
    directorio público, guías de trámites, calculadora y trámites del portal
    ciudadano). No existe sistema de reseñas: ese número no lo producía nadie
    y aquí decide a quién contrata alguien. Se sustituye por años de ejercicio,
    que sí es verificable. El campo `valoracion` sigue en el seed porque el
    panel del abogado lo muestra como métrica propia — anotado ahí.
  - **Fuera los conteos** (contactos, respuestas): vanidad. Uno con 34
    respuestas no es mejor que uno con 12, y contarlas premiaría publicar por
    publicar.
  - **Fuera "Contactar por WhatsApp".** Sacaba el contacto de Justihn en el
    primer toque: sin registro, sin trazabilidad y sin poder demostrarle al
    abogado cuántos contactos le trajo la plataforma — que es lo que sostiene
    que pague. Ahora **"Consultar con [nombre]"**; WhatsApp llega después,
    cuando ya hay conversación. `TODO(fase 2)`: abrir una consulta DIRIGIDA
    (mismo circuito del consultorio, con destinatario).

- **🔍 REFINADO DE LA HOME CIUDADANA (2026-08-30, auditoría + ajustes):**
  - **Procesos habla el mismo idioma que Trámites**: pasa de 4 cards en grid a
    la misma `FilaTramite`, pero **sin el riel numerado** — despido, pensión,
    divorcio y herencia no se encadenan entre sí y numerarlos inventaría un
    orden. Se unifica el lenguaje visual, no el significado (861 → 656px).
  - **La página ya no termina dos veces:** la cross-sell "Para profesionales
    del derecho" iba DESPUÉS del CTA oscuro, así que el cierre se deshinchaba
    y la última impresión de un ciudadano era una oferta que no es para él.
    Ahora va antes.
  - **El eyebrow "Guías de trámites" se repetía** en el demo y en la sección;
    el del demo pasa a "Dentro de una guía".
  - **Directorio:** el subtítulo afirmaba "Perfiles con insignia de validado"
    y una de las tres cards no la lleva (`verificado: false` en el seed) —
    ahora **describe qué significa** la insignia. Y se enseñan **los cinco**
    perfiles en vez de tres: esconder dos tras una cuenta fingía que hay más
    de lo que hay, así que se quitó "Ver todo el directorio", que además metía
    al visitante dentro del portal sin pasar por el alta.
  - **Consultorio compactado:** el formulario era una card DENTRO de la card.
    `FormularioPregunta` gana `sinMarco` para vivir dentro de un contenedor
    que ya pone marco y titular (984 → 889px).

- **💬 CONSULTORIO: la conversación primero (2026-08-30, elegido de un
  prototipo de tres):** la sección `#consultorio` abre con un **intercambio
  real** —consulta ciudadana + respuesta firmada por la colegiada, con su
  número CAH y sus materias— y el formulario va debajo. El obstáculo aquí no
  es que la persona no sepa dónde escribir: es que no cree que alguien vaya a
  responderle. Si el visitante ya preguntó en esta sesión, se muestra SU
  consulta en vez del ejemplo.
  - ⚠️ **Hallazgo de fondo:** `leadsRespondidos` arranca vacío, así que la
    sección prometía "te responde un abogado colegiado" y enseñaba preguntas
    SIN contestar — probaba lo contrario de su título. Se añadió
    **`respuestaDemo`** a los leads del seed (orientaciones generales, sin
    citar artículos sin verificar). ⚙️ **Pendiente del socio: revisarlas.**
  - **Fuera el demo duplicado.** El bloque *"Tu duda, respondida por un
    abogado colegiado"* repetía esta sección y además fallaba el criterio de
    los demos —enseñar lo que hay DETRÁS de la cuenta gratis—, porque
    preguntar es gratis SIN cuenta. Lo sustituye **"Los trámites no se hacen
    de una sentada"** (`DemoMisTramites`): el panel con el avance guardado,
    que es lo único genuinamente tras la cuenta y no vivía en ningún otro
    sitio de la home. Responde la pregunta que provoca la card del plan: si
    todo es gratis, ¿para qué me registro?
  - **Publicar pasa por la puerta de cuenta** (2026-08-30): la consulta se
    guarda primero y el visitante va a `/crear-cuenta?tipo=persona&desde=consultorio`,
    que lo reconoce ("Tu consulta ya está publicada"), cambia el titular a
    "Sigue tu consulta" y al terminar lo deja en `/personas/consultas` con la
    pregunta ahí. Antes saltaba directo al portal y se saltaba el alta entera.
    Hace pareja con el composer de la vía A. ⚠️ La consulta se publica ANTES
    del alta: al cablear Supabase hay que asignarle dueño en cuanto exista la
    cuenta, y decidir qué pasa si el visitante la abandona (hoy queda
    publicada y anónima, que es lo que la sección promete).
  - También se quitaron dos salidas que competían con el paso siguiente: "Ver
    todas las consultas del consultorio" y el enlace al directorio bajo las
    guías de procesos (cada guía ya cierra recomendando abogado de su materia).

- **🗺️ TRÁMITES EN RUTAS, no en 9 cards (2026-08-30, decisión Wesley tras
  comparar tres estructuras en un prototipo):** la sección `#tramites` de la
  home agrupa las guías por **situación de vida** —Abrir un negocio · Comprar
  o vender · Formalizar y vender al Estado— y las muestra **numeradas y
  encadenadas** con un riel: el RTN habilita el CAI, el CAI el permiso de
  operación. Ese orden es lo que no se encuentra googleando (hay que
  reconstruirlo leyendo tres portales del Estado) y es la promesa del producto
  hecha visible: asesoría, no directorio de links.
  - **Se ve una ruta a la vez** (arranca en "Abrir un negocio") y los chips
    cambian de categoría. ⚠️ **Filtran OCULTANDO, no montando**: las tres se
    renderizan siempre y el chip activo esconde las otras con `hidden`. Si se
    montara solo la activa, 4 de las 9 guías dejarían de existir para el
    crawler — y en esta página eso ya costó un incidente (130 → 7.452
    caracteres). Verificado: las 3 rutas y las 9 guías, con sus costos, salen
    en el HTML del servidor aunque solo se vea una.
  - **Buscar rompe el orden a propósito:** con término, resultados planos —
    quien escribe "RTN" quiere su guía, no la ruta entera. Sin término, rutas.
  - **Fuera el filtro por institución.** Pensaba como burócrata: nadie busca
    "un trámite de ONCAE", busca "voy a abrir un negocio".
  - **`tasaCorta` nuevo en el seed** (§0.5): la `tasa` verificada condensada a
    una línea ("Gratuito", "L 300", "Desde L 341"). No es dato nuevo — al
    editar `tasa` hay que revisarla, no pueden decir cosas distintas.
  - **`RUTAS_TRAMITE` vive en `data/tramites.ts`**, junto a lo que agrupa.
    ⚠️ Una guía fuera de toda ruta **desaparece de la home** aunque exista en
    el seed y en su URL: invisible leyendo el código, así que `tramites.test.ts`
    lo topa (cada trámite en exactamente una ruta, sin repetir, sin inventar
    ids, sin colar procesos judiciales, y todas con `tasaCorta`).

- **🏠 HOME CIUDADANA REESTRUCTURADA como la de abogados (2026-08-30, pedido
  de Wesley):** la vía B pasa a tener la misma arquitectura persuasiva de
  `/para-abogados`, **manteniendo el hero intacto**. Se suman: encabezado a
  las puertas de entrada, **3 secciones con demostración**, **plan** y **FAQ**
  ciudadano y **CTA final oscuro**.
  **Recorte 2026-08-30 (Wesley):** los 3 pilares "Por qué confiar" existieron
  y **se quitaron** — la home llegaba larga y ese argumento ya lo repiten el
  sello de fuente de cada guía y el FAQ. Y las cuatro cards de "¿Qué necesitas
  resolver hoy?" **dejaron de navegar**: eran enlaces con "Empezar →" que
  competían con las secciones reales de justo debajo, así que el visitante
  decidía dos veces lo mismo. Llevan `glass-card--estatica`, que les quita el
  hover que levanta la card — en algo no clicable ese gesto promete un clic
  que no existe. Las 4 secciones interactivas de verdad (Trámites,
  Procesos, Consultorio, Directorio) **se conservan** — son la sustancia del
  producto y el motor SEO; los demos van ANTES y enseñan lo que hay detrás de
  la cuenta gratis (que es lo que la landing gatea), no lo mismo dos veces.
  - **Marco de demo compartido** en `components/landing/demo-marco.tsx`
    (`Ventana` + `SeccionDemo`), extraído de `profesional/demos.tsx` — las dos
    landings usan el mismo chrome y cada una pone su contenido.
  - **`components/publico/demos-personas.tsx`** con la misma regla de la vía A
    (**datos reales del seed, nunca maquetas**): guía del RTN con checklist
    (verificada contra el SAR) · consulta del `LEADS` respondida por la
    colegiada del directorio · cálculo hecho por **`lib/prestaciones`**, el
    mismo módulo de la calculadora real (§0.5) — si la fórmula cambia, la demo
    cambia con ella y no puede quedar enseñando una cifra que el producto ya
    no da.
  - **Planes: UNA card y es gratis** (decisión Wesley). Tres cards inventarían
    una decisión que la persona no tiene. El plan de pago que pidió el socio
    se nombra al pie con **las mismas palabras que usa el portal ciudadano**
    ("en definición"), para que las dos pantallas no se contradigan.
    **Rediseñada 2026-08-30** siguiendo una referencia que pasó Wesley (la
    card de plan de Sonriprev): dos columnas separadas por una línea —promesa,
    precio grande y CTA a la izquierda; "Incluido" con divisores y la nota del
    plan de pago a la derecha—. Se lee "cuánto" y luego "qué", que es el orden
    de la duda. ⚠️ **La referencia usa escasez** ("los primeros 200 aseguran
    estas condiciones") y eso NO se copió: sería inventarse un cupo que no
    existe. El gancho es la gratuidad, que sí es verdad.
  - ⚠️ **Honestidad:** el copy de la demo de calculadora NO dice "usa el
    Código del Trabajo" ni "el mismo número que vería tu abogado" — sería
    sobreventa mientras `lib/prestaciones` siga sin validar con el socio y
    contradiga la escalera literal que ya publica la guía de despido (ver
    §8, deuda conocida). Dice "desglose orientativo".
  - **SSR verificado: 7.452 → 12.597 caracteres** de texto en el HTML del
    servidor. Todo lo nuevo lo lee el crawler (la home ya tuvo un incidente de
    contenido invisible — ver la nota de `useSearchParams` bajo Suspense).

- **⤵️ DESPLAZAMIENTO SUAVE A LAS ANCLAS —
  `components/landing/desplazamiento-suave.tsx` (2026-08-30):** al pulsar un
  enlace del nav (o del pie, o cualquier ancla de la página) la página baja o
  sube animada y la sección de destino da un **destello** de 1,4 s
  (`.destello-ancla`, pseudo-elemento con halo celeste). El destello no es
  adorno: al frenar el scroll no siempre está claro qué bloque pediste.
  - ⚠️ **Va en JS y NO con `html { scroll-behavior: smooth }`**, que era lo
    obvio: esa regla es global y alcanza también al salto al principio que
    hace Next al cambiar de ruta — en una home de 8.000px, abrir un trámite se
    volvería un scroll animado de varios segundos. Aquí se interceptan solo
    las anclas de la propia página (`#x` y `/#x` estando en `/`), respetando
    los atajos del navegador (⌘/ctrl/shift-clic). Verificado: cambiar de ruta
    sigue siendo instantáneo.
  - Se detiene 96px por debajo del borde para que la nav fija no tape el
    encabezado, actualiza el hash con `pushState` (que no desplaza) y con
    `prefers-reduced-motion` salta directo y sin destello.

- **🧲 BOTÓN MAGNÉTICO (GSAP) — `components/landing/magnetico.tsx` (2026-08-30):**
  los elementos con clase **`.magnetic`** se van hacia el cursor (factor
  **0.35**) con `gsap.quickTo` y ease **`elastic.out(1,0.4)`**, y vuelven a
  0,0 en `pointerleave`. `BotonesMagneticos` se monta una vez por shell de
  landing (clara, black y ciudadana) y trabaja sobre el DOM con delegación +
  `MutationObserver`: un botón se vuelve magnético con solo añadirle la clase,
  sin envolverlo ni pasarle props. GSAP entra por **import dinámico** (es
  decoración; no debe pesar en el primer render de una landing que se mide por
  SEO) y el efecto **se apaga** con `prefers-reduced-motion` y sin
  `(hover:hover) and (pointer:fine)` — en táctil el botón se escaparía justo
  al tocarlo. **Va SOLO en los botones azules sólidos** (decisión Wesley
  2026-08-30): CTA del nav · enviar del composer · plan destacado · CTA del
  cierre. En un botón de solo borde el imán no se lee como intención sino como
  que el botón tiembla, y si todo se mueve el efecto deja de señalar la acción
  principal porque ya no distingue a nadie. Hay auditoría hecha: los 4 con
  imán son `rgb(21,132,199)` y ningún botón azul quedó sin él.
  ⚠️ **Trampa:** GSAP escribe `transform`; si el elemento ya tiene un `:hover`
  con transform (la `.glass-card` sube 2px, `.btn-celeste` −1px) una de las dos
  animaciones se pierde en silencio. `magnetico.test.ts` lo topa.

- **📲 VISTA PREVIA EN WHATSAPP — tarjetas Open Graph (2026-08-30):** el sitio
  **no tenía NINGUNA etiqueta Open Graph** (cero `og:*`), así que cada enlace
  compartido salía como burbuja de texto pelado, sin miniatura — justo el
  enlace que Wesley y el socio pasan a abogados. Resuelto con:
  - **`metadataBase`** en el layout raíz (constante `SITIO`, con
    `NEXT_PUBLIC_SITIO_URL` como override). Sin esto Next emite el `og:image`
    relativo y WhatsApp no pinta nada. **Al comprar el dominio se cambia AHÍ
    y en ningún otro lado.**
  - **Tres tarjetas 1200×630** generadas con `next/og` en el BUILD (rutas
    estáticas, ~150 KB c/u — WhatsApp descarta las imágenes pesadas): la
    general (`app/opengraph-image.tsx`, la heredan portal/auth/trámites), la
    ciudadana (`(landing)/`) y la de abogados (`(profesional)/para-abogados/`).
    Componente único en **`lib/og/tarjeta.tsx`** — fondo marino del login,
    lockup oficial, titular, bajada y tres sellos de prueba.
  - **Fuentes en `app/_og-fuentes/` (TTF, OFL).** satori **no lee woff2**, que
    es lo único que deja `next/font` en el build: por eso van versionadas.
  - **`og:url` por página, no global** — un `og:url` fijo en el layout haría
    que toda página compartida se canonizara como la home. Lo declaran las dos
    landings; el resto no emite ninguno y vale el enlace que se pegó.
  - `noindex` **no** afecta esto: el rastreador de WhatsApp lee las Open Graph
    igual. Son cosas distintas.
  - **`app/og.test.ts`** (6 tests) fija lo que no se ve leyendo el código: que
    exista `metadataBase` https, que haya una tarjeta por audiencia con
    medidas/alt, y que titulares (≤48), sellos (≤24) y los títulos y
    descripciones compartibles (≤70/≤170) no se corten en la burbuja.

- **🗂️ "LO QUE ENCUENTRAS DENTRO" — mosaico de nueve piezas
  (`components/profesional/capacidades.tsx`, 2026-08-30, tres rondas):**
  con una celda ancha por fila que alterna de lado. **Sin encabezados de
  categoría** (decisión Wesley): el orden sigue agrupando por trabajo
  —investigar → vigilar → producir— pero sin rotularlo; tres titulares dentro
  de una sección que ya tiene el suyo hacían cuatro niveles de jerarquía en el
  mismo bloque y partían el mosaico en tres rejillas sueltas.
  - Arregla tres cosas del muro de 8 cards iguales que había antes: **no
    incluía Jus IA** (el corazón del producto), llamaba a cada función por el
    nombre de su pantalla en vez de por el trabajo que resuelve, y no daba
    ninguna jerarquía.
  - ⚠️ **Por qué NO lleva panel de producto**, aunque una ronda intermedia lo
    tuvo (patrón de una referencia de Wesley): la página quedaba con **CUATRO
    secciones seguidas con ventana** —esta y los tres demos— y las tres
    ventanas de aquí enseñaban Jus IA, Gaceta y Leads, que son exactamente los
    tres demos de después. No era parecido: era lo mismo dos veces. **Reparto
    definitivo: esta sección es el INVENTARIO, los demos son la DEMOSTRACIÓN.**
  - La celda ancha alterna de posición por fila (izq · der · izq): con la ancha
    siempre al principio, las tres filas se leerían idénticas. Con 4 columnas
    cada fila suma 2+1+1, así que teja sin huecos (verificado 3+3+3).
  - **Sin estado ni interacción** — componente de servidor, así que las nueve
    funciones llegan íntegras al HTML sin depender de hidratación.
  - ⚙️ **Capturas del portal: diferidas a propósito** — una captura driftea en
    cuanto cambia una pantalla, no le da texto al crawler, y la UI se moverá
    mucho al entrar Supabase. Se reevalúa entonces, y con script de captura
    commiteado (ver §6.5b).

- **🌑 LANDING BLACK — `/para-abogados-black` (2026-08-30):** la MISMA landing
  de la vía A en tema oscuro, para comparar con Wesley cuál versión queda.
  Cero duplicación: la página reutiliza `LandingProfesional` tal cual y el
  tema lo hace `.landing-aurora--black` (landing.css) remapeando los tokens
  (`--ink/--muted/--card/--line/--mint` + `--color-texto-4`) sobre el aurora
  noche del login; shell propio en `(profesional-black)/layout.tsx` con
  `NavAurora logoVariante="oscuro"` (prop nuevo) y enlace "Versión clara" de
  vuelta a `/para-abogados`. **Patrón `superficie-dia`** (composer del hero +
  ventanas de demo): en la landing clara son cards blancas con los tokens
  claros re-anclados; en black van en **glass oscuro** (decisión Wesley
  2026-08-30) — la regla `.landing-aurora--black .superficie-dia` les gana a
  las utilidades Tailwind del componente y remapea TODOS los tokens interiores
  (`--color-marino/texto-2/chip/exito…`), con los fondos internos de las
  ventanas como clases (`ventana-cabecera`, `caja-panel`) y un fix
  `polygon[fill="#0d2144"]` para aclarar el símbolo de Jus IA. Cuando se elija
  una versión, borrar la otra ruta (o convertirla en redirect).

- **🔐 AUTH CONSTRUIDO — `/iniciar-sesion` + `/crear-cuenta` (2026-08-30):**
  las dos pantallas del handoff **`../design_handoff_auth/`** (Claude Design,
  copiado del Desktop de Wesley — es la fuente de verdad visual de auth),
  recreadas pixel-perfect en el grupo **`(auth)`** con shell propio y sin
  navegación.
  ⚗️ **Prueba en curso (2026-08-30):** el shell usa la **aurora CLARA** de las
  landings, no la variante noche del handoff — Wesley quiere comparar. Las
  tarjetas se adaptaron a fondo claro (blanca en vez de glass oscuro, inputs
  `input-dia`, logo `claro`, sombras recalibradas). **Camino de vuelta:**
  revertir ese único commit — `landing-aurora--noche` + `FondoAurora
  variante="noche"` y `.input-noche` siguen en el CSS a propósito.
  - **`/iniciar-sesion`** (`components/auth/iniciar-sesion.tsx`): card glass
    oscuro con login, recuperar contraseña y "enlace enviado".
  - **`/crear-cuenta`** (`components/auth/onboarding.tsx`): **reemplaza la
    maqueta anterior** (misma URL, se borró `profesional/crear-cuenta.tsx`).
    Onboarding en 3 pasos (Cuenta con medidor de fuerza · Validación CAH
    opcional con dropzone · Materias en chips, 14 áreas de práctica — más
    amplias que las 6 del corpus) + bienvenida con resumen y checklist. La
    **`consultaPendiente` del composer se conserva**: se muestra sobre el card
    ("Tu pregunta te espera") y se dispara al llegar al chat, igual que antes.
  - **Escena del logo — el libro que se abre** (`components/auth/escena-logo.tsx`,
    portada del archivo **`../design_handoff_auth/justihn-logo-scene.jsx`**,
    que Wesley pasó después y está copiado ahí). Cuatro actos en **6,8 s**: Cerrado 1,4 s (libro cerrado y
    centrado) · Apertura 1,6 s (páginas a ±26° y nace el cruce) · Nombre 2,2 s
    (se revela el wordmark) · Final 1,6 s (respiración y fade). Los tiempos van
    en **porcentaje de un ciclo único** en `auth.css`, para que el bucle sea
    una animación por elemento y los actos no puedan desincronizarse.
    - El símbolo **se corre a la izquierda como consecuencia** de que el
      wordmark ocupe sitio (el grupo está centrado y el ancho del nombre crece
      de 0), no con un desplazamiento en píxeles: si cambia la fuente o el
      tamaño, el encuadre se recentra solo.
    - ⚠️ **Lo que el archivo tiene y la descripción no dejaba ver: las dos
      páginas ARRANCAN SUPERPUESTAS** (misma `x = 24 − W/2 = 18,15`) y se
      separan ±7 al girar. Ese es el libro cerrado de verdad — una sola forma
      visible—, no dos barras juntas. Se consigue con `translateX(±7)
      rotate(±26°)` sobre `transform-origin: 24px 21px`, que es idéntico a
      mover la `x` y girar sobre el centro nuevo, y **termina exactamente en la
      geometría oficial** (−26° en 17,21 · +26° en 31,21). Verificado.
    - Easings del archivo, portados como curvas cúbicas: `easeOutCubic` en el
      fade de entrada, **`easeOutBack`** en la apertura (el rebote) y
      `easeInOutQuart` en el recentrado, el wordmark y el fade final. Los
      tiempos van en porcentaje de un ciclo de 6,8 s para que el bucle sea una
      animación por elemento y los actos no se desincronicen.
    - El lienzo se construye a la **escala intrínseca del archivo** (símbolo
      200 · hueco 28 · wordmark 560 = lockup 788) y se reduce con `zoom`, para
      que el desplazamiento de **294px** siga siendo exactamente medio lockup.
    - `SplashJustihn` hace **una sola pasada** y navega a los 5 s — justo al
      cerrar el tercer acto, con el nombre ya revelado y antes del fade del
      cuarto. `bucle` lo repite (escaparate). Con reduced-motion se muestra el
      logo abierto y el nombre, sin movimiento. La geometría del handoff resultó idéntica a la
    oficial de `brand/logos.tsx`, y sus fuentes (Space Grotesk títulos +
    Instrument Sans UI) son las que el proyecto ya tenía — cero tokens nuevos.
  - **🔗 LOGIN COMPARTIDO POR LAS DOS VÍAS (2026-08-30, decisión Wesley):**
    `/iniciar-sesion` sirve a abogados y a personas. Es UNA base de cuentas:
    dos logins duplicarían recuperación, enlaces mágicos, rate limit y errores,
    y sobre todo obligarían a acertar por qué puerta se registró uno — quien
    elige mal ve "no existe esa cuenta" y se va creyendo que perdió su
    registro. **El alta sí es distinta** y por eso `?tipo=persona` solo cambia
    el copy, el placeholder del correo, a qué alta manda y a qué portal entra;
    nunca lo que se pide para entrar. En **Fase 2 el parámetro sobra**: el
    destino lo resuelve la cuenta (¿tiene ficha de abogado? → `/abogados`).
  - **Alta ciudadana corta** (`components/auth/registro-persona.tsx`, en
    `/crear-cuenta?tipo=persona`): nombre, correo y contraseña. El abogado pasa
    por tres pasos porque el producto necesita colegiación, materias y
    solvencia; a un ciudadano eso lo espantaría y su portal no usa ninguno de
    esos datos. `components/auth/alta.tsx` es la puerta única que elige
    formulario — una sola URL, haciendo pareja con el login.
  - **El `?tipo=` se lee en el SERVIDOR** (`searchParams` de la page), no con
    un hook de cliente: leerlo en cliente hacía que el HTML llegara siempre
    con la variante del abogado y se viera un parpadeo del stepper antes de
    cambiar al formulario corto. A cambio las dos rutas se sirven dinámicas
    (`ƒ`), que en pantallas de auth sin SEO no cuesta nada. Tampoco se usa
    `useSearchParams`: ese hook bajo Suspense vació el HTML de la home (ver el
    incidente de SSR). **`hooks/use-busqueda-url.ts`** queda para el cliente
    —lo usa el filtro del directorio— unificando el helper que estaba
    duplicado en `secciones.tsx`.
  - **Honestidad Fase 1:** ambas pantallas validan formato y entran con la
    sesión demo; nota visible bajo el card ("todavía no se crean cuentas
    reales") y `TODO(auth)` con el cableado Supabase exacto en cada archivo.
  - **La nav de las landings (corregido 2026-08-30):** el botón lleno es
    **"Crear cuenta gratis"** en las DOS, e **"Iniciar sesión"** va como enlace
    de texto (`login` en `NavAurora`). `/para-abogados` lo tenía al revés —
    su botón más prominente servía a quien ya era cliente, en una página que
    existe para convertir abogados nuevos. Dos razones: el botón lleno es para
    la acción que la página busca, y **por debajo de 980px el nav esconde los
    enlaces de texto y solo sobrevive ese botón** (verificado a 7 anchos).
  - El CTA de la nav de `/para-abogados` pasó de "Entrar al portal"
    (→ `/abogados` directo) a la puerta de cuenta. La
    entrada directa al portal —la de enseñárselo al socio— vive en el pie
    ("Abogados → Portal"); el botón "Ver el portal por dentro" que estaba en
    el CTA final **se quitó** (decisión Wesley 2026-08-30): competía con el
    botón azul y ofrecía entrar sin cuenta justo donde se pide crearla.
  - Trampa de contraste: `.landing-aurora--noche a` pinta los links
    celeste-claro — dentro del card BLANCO del onboarding serían ilegibles;
    `.card-dia` los devuelve al celeste de marca.

- **🎨 MARCA — favicon y lockup corregidos (2026-08-29):** el favicon no era
  el símbolo oficial sino una versión aparte, con **otra geometría** (barras más
  gordas y encimadas), **sin el cruce** `#0e5f92` y con un
  `prefers-color-scheme: dark` que le volvía la barra izquierda casi blanca.
  Ahora `src/app/icon.svg` ES `logo/justihn-icon.svg`, con el viewBox recortado
  a la tinta (`4.1 1.1 39.9 39.9`) para llenar la pestaña; sin adaptación a modo
  oscuro — el logo no cambia de color, a costa de que la barra marina quede
  tenue en pestaña oscura. `favicon.ico` se genera del mismo SVG (16/32/48/64/128,
  alfa 0) y `logo/justihn-favicon.svg` se mantiene igual para que no drifteen.
  ⚠️ **Rompe la ficha de marca**, que pedía la variante favicon "sin cruce" a
  ≤20px: se prioriza que la pestaña se vea como el logo.
  **Lockup:** el gap del nav de la landing (11px) no coincidía con el de
  `LogoJustihn` (7px). Ambos a **5px**, medido sobre el render a 4× contando
  columnas con tinta: 9.2px de hueco visual en los dos. El símbolo aporta ~2.4px
  de aire propio dentro de su viewBox — descontarlo es lo que faltaba.

- **✨ LANDING AURORA (2026-08-29):** la home se movió al grupo `(landing)` con
  shell propio estilo Jusbrasil: fondo aurora WebGL (three.js, shader FBM
  replicado verbatim de otro proyecto de Wesley — solo se adaptaron los vec3 a
  la marca: navy #0a1830 · celeste #1584c7 · claro #7cc7f0) + nav fija glassy
  con estado sólido al scroll. Módulo en `components/landing/` (aurora.ts,
  fondo-aurora.tsx con fallback sin-WebGL/reduced-motion, nav-aurora.tsx,
  landing.css scopeado bajo .landing-aurora). Stacking: fondo z-0 ·
  canvas+scrim z-1 · contenido z-2 · nav z-100. Las páginas públicas
  interiores conservan el shell claro de `(publico)`.
  **Secciones en la landing (2026-08-29, decisión Wesley):** trámites,
  consultorio y directorio dejaron de ser páginas propias y viven como
  SECCIONES interactivas de la home (`components/landing/secciones.tsx`, ids
  `#tramites/#consultorio/#directorio`, nav y footer con anclas). El buscador
  del hero y el de la sección comparten estado (buscar arriba filtra abajo y
  hace scroll). Las rutas viejas redirigen a su ancla; sobreviven como página
  el detalle `/tramites/[id]` (SEO + gate de cuenta) y la calculadora.
  ⚡ **SSR arreglado (2026-08-29):** la home salía casi VACÍA en el HTML —
  13.627 bytes de los que el único texto era el `<title>` y el menú; cero
  apariciones de "RTN", "despido", "divorcio". La causa no era "es client
  component" (el nav también lo es y sí salía): toda la landing iba dentro de un
  `<Suspense fallback={null}>` y `SeccionDirectorio` llamaba `useSearchParams()`
  para leer `?materia=`/`?notarios=1`; ese hook bajo un Suspense hace que Next
  abandone el prerenderizado del subárbol y emita el fallback. Se cambió a
  `useSyncExternalStore` sobre `window.location.search` (servidor "" · cliente el
  valor real) y se quitó el Suspense. **Resultado: 130 → 7.452 caracteres de
  texto.** Regla para la próxima pantalla pública: `useSearchParams` bajo
  Suspense = contenido invisible para Google.
  **Procesos legales ciudadanos (2026-08-29, pedido del socio):** `tramites.ts`
  gana `tipo: "tramite" | "proceso"` y 4 guías judiciales — me despidieron
  (Laboral, el ejemplo que pidió), pensión alimenticia, divorcio y herencia —
  con instituciones nuevas (Juzgados, STSS). Viven en la sección `#procesos`
  de la landing y comparten TODA la UI (detalle con gate, checklist del
  portal, buscador). Cada guía cierra con el abogado de esa materia:
  contacto directo + "Buscar abogado de [materia]" →
  `/?materia=X#directorio` (el directorio lee el filtro de la URL). El portal
  ciudadano separa ambos con un toggle Todos/Trámites/Procesos.

## 2. Stack (pins reales)

Next.js 16.3 (App Router) · React 19.2 · TypeScript 5.9 · Tailwind v4 ·
Zustand 5 (persist) · Zod 4 · Radix Dialog · Vitest 4 · pnpm.

Instalados y listos para Fase 2, aún sin cablear: `@anthropic-ai/sdk`,
`@upstash/ratelimit`, `@tanstack/react-query`, `lucide-react`.

## 3. Mapa del código

| Ruta | Qué vive ahí |
|---|---|
| `src/app/abogados/` | Las 13 vistas como **rutas reales** (no estado, a diferencia del prototipo): deep-link a una sentencia o publicación funciona y es compartible |
| `src/app/api/ia/consultar/` | Único endpoint. Todo pasa por `guard()` antes de gastar nada |
| `src/lib/security/` | **El harness (§3 del blueprint).** `api-guard` · `rate-limit` · `sanitize` · `ai-safety`. Toda superficie de servidor lo consume; no reinventar por ruta |
| `src/lib/ai/` | `router-demo` (Fase 1, determinístico) · `motor-claude` (Fase 2, apagado) · `tipos` (el contrato que cumplen ambos) |
| `src/data/` | Seeds = **contrato literal** de las tablas Supabase futuras. Cada archivo lleva su `TODO(data)` con la fuente real |
| `src/store/portal.ts` | Zustand + persist en `justihn-portal-v1` (misma clave del prototipo) |
| `src/hooks/` | `use-saludo` (franja + titular del hero — único lugar que los decide) · `use-preguntar-jus-ia` (prefill o `enviarDirecto` + navegar al chat; lo usan todas las pantallas) · `use-jus-ia` |
| `src/components/ia/` | Chat de Jus IA + `boton-jus-ia.tsx` (botón canónico de la acción de IA — gradiente vivo, único lugar que define su look) |
| `src/components/brand/` | Logos e iconografía con la **geometría oficial** del handoff |
| `src/components/ui/primitivos.tsx` | Primitivos patrón shadcn, copiados y personalizables |

## 4. Reglas propias de este proyecto

1. **Sin fuente no hay respuesta.** Es la promesa del producto, no una
   optimización: `motor-claude.ts` prefiere decir "no encontré fuentes" antes
   que responder de memoria. No relajar esto para "que se vea mejor la demo".
2. **Todo dato externo es DATO, nunca instrucción.** Sentencias con OCR, PDFs
   de Gaceta y documentos que sube el abogado pasan por `wrapExternalData()`
   antes de tocar un prompt (§3.2). Cubierto por tests.
3. **Fallar cerrado.** Rutas `role: "session"` devuelven 401 mientras Supabase
   Auth no esté cableado. Nunca "pasa por ahora".
4. **Un solo lugar por dato de dominio.** Precios en `data/catalogo.ts`, cálculo
   laboral en `lib/prestaciones.ts`. Si la UI y Jus IA dan números distintos,
   es un bug de duplicación.
5. **Determinismo/SSR.** Nada de `Date.now()`/`Math.random()` en carga de módulo.
   El saludo por hora y el store persistido se hidratan **tras el mount**.
6. **Fidelidad de marca.** Geometría de logos fija; el cruce `#0e5f92` solo vive
   dentro del símbolo y en el hover de botones celestes — nunca como color de
   interfaz suelto.

## 5. Comandos

```bash
pnpm dev          # http://localhost:3000
pnpm type-check   # tsc --noEmit
pnpm test         # Vitest (51 tests de invariantes)
pnpm build        # gate antes de cualquier entrega
```

**Gate de verificación (§5 del blueprint):** `lint` + `type-check` + `test` +
`build` verdes en cada incremento, más verificación visual con Playwright. Los
tests cubren lo crítico: el harness de seguridad (inyección, enmascarado, hosts
oficiales), el determinismo y honestidad del router (expedientes reales /
inexistentes / casos propios), prestaciones, plazos y vía procesal. Se sumaron
2026-08-29: **`data/tramites.test.ts`** (las 13 guías con fuente en la
whitelist, cero marcadores pendientes, y que un paso de notario resuelva a un
notario habilitado y no a un abogado de materia "Notarial") y
**`app/titulos.test.ts`** (ninguna página nombra la marca sin `absolute`, para
que la pestaña no diga "Justihn" dos veces — error invisible leyendo el código,
que se coló en tres páginas a la vez).

## 6. Pendientes — próxima sesión (en orden)

1. [x] ✅ **Validación y refinado integral** (2026-08-26): las 15 pantallas
   revisadas una a una con Wesley (escritorio + móvil, 0 overflow), fechas
   vivas, deep-links en URL en todas las vistas, orden/búsqueda honestos en
   jurisprudencia, y 2 pantallas nuevas (Legislación, Monitoreo).
2. [x] ✅ **DEPLOY EN VERCEL** (2026-08-26): **https://justihn-app.vercel.app**
   — repo `github.com/WesleyObeth/justihn-app` (main), env
   `JUSTIHN_DEMO_SESSION=1` en Vercel. Verificado en producción: rutas 200,
   redirects `/portal`→`/abogados`, headers de seguridad, `noindex` de
   validación (quitar al lanzar) y el chat de Jus IA respondiendo con citas.
3. [x] ✅ **GATE ABIERTO — el socio abogado revisó el sistema (2026-08-29).**
   Su feedback no pide cambios a lo construido: pide AGREGADOS (detalle en
   justihn/CLAUDE.md backlog #1b). Lo relevante para este repo: (a) un vertical
   nuevo de **trámites administrativos por institución del Estado** (IP, ARSA,
   MiAmbiente, ONCAE, SAR, municipalidades — permiso de operación, licencia
   sanitaria/ambiental, tradición de dominio, CAI, RTN, traspaso de vehículos),
   pariente de la pantalla Procesos pero de fuente institucional, no judicial;
   (b) la **vía B toma forma**: directorio de abogados por materia + guías
   ciudadanas que recomiendan abogado (funnel guía→lead) + **plan gratuito y
   plan pago para el público** (cambio al modelo original); (c) Modelos validada
   con roadmap de catálogo creciente. Las entidades nuevas (instituciones,
   trámites, directorio público, planes vía B) se diseñan mock-first ANTES de
   congelar el esquema completo.
4. **Crear el proyecto Supabase** (solo DB al inicio) y cambiar el destino del
   workflow del corpus de Data Table → Postgres + embeddings pgvector (el
   esquema SQL ya está diseñado; ver justihn/CLAUDE.md backlog #3). Los seeds
   del portal de abogados quedaron validados; decidir si las tablas nuevas del
   feedback entran al esquema inicial o en una migración posterior.
5. [x] ✅ **LAS 13 GUÍAS DE TRÁMITES VERIFICADAS** (2026-08-29, backlog #3c
   cerrado). `src/data/tramites.ts` ya no tiene marcadores "L ___": las 13
   guías llevan `fuenteUrl`/`fuenteNombre` y encienden el sello "Verificado
   con la fuente oficial". Hosts nuevos en la whitelist de
   `lib/security/sanitize.ts`: `ip.gob.hn`, `arsa.gob.hn`, `oncae.gob.hn`,
   `honducompras.gob.hn`. Detalle de fuentes y muros en justihn/CLAUDE.md §3.
   **Regla de edición desde ahora:** al tocar una guía, o se mantiene su
   fuente, o se quita el sello — nunca texto sin respaldo.
   ⚠️ **Deuda que dejó la verificación:** `lib/prestaciones.ts` calcula el
   preaviso como "1 mes si <2 años, 2 meses si ≥2" y la cesantía sin los
   tramos cortos, pero la guía de despido ya publica la escalera literal del
   Código del Trabajo — preaviso art. 116 (24 h · 1 semana · 2 semanas ·
   1 mes · 2 meses) y cesantía art. 120 (10 días de 3-6 meses · 20 días de
   6-12 · 1 mes por año después, tope 25 meses, 15 si el patrono es
   microempresa de ≤10 empleados, art. 120-A). **Hoy la calculadora
   contradice a la guía dentro del mismo producto.** No se corrigió porque
   el cálculo laboral está gated a la validación del socio (§7.6); el texto
   oficial ya está localizado, así que es un cambio corto.

5b. **🎨 SEGUIR REFINANDO LAS LANDINGS** (en curso con Wesley, 2026-08-29).
   Lo hecho hoy queda arriba, en el bloque de `/para-abogados`. Lo que sigue
   sobre la mesa, sin orden fijo:
   - **Más demos con seed real**: los candidatos naturales son *Calculadoras*
     (prestaciones, con el resultado que da `lib/prestaciones`) y *Modelos de
     escritos*. El patrón ya está: `SeccionDemo` + una vista en `demos.tsx`.
   - **La home ciudadana no tiene demos todavía** — el patrón es reutilizable.
   - **SEO de la vía B**: no hay `sitemap.xml` ni datos estructurados
     (`HowTo`/`FAQPage` en las guías de trámites, que es lo que gana los rich
     snippets). Y `robots` sigue en `noindex` en el layout raíz: **acordarse de
     quitarlo al lanzar**, o nada de esto rankea.
   - **Video real del portal**: hoy los demos son animación HTML a propósito
     (siguen al seed, pesan bytes, el crawler lee el texto). Cuando la UI se
     estabilice tras Supabase, grabar footage real con Playwright sí aporta.
   - **CTA de WhatsApp**: la referencia de Wesley lo lleva; Justihn no tiene
     número configurado y no se inventó un enlace muerto.
   - **`prestaciones.ts` sigue contradiciendo a la guía de despido** (ver el
     punto 5 de esta lista): si se toca la landing laboral, cuidado con
     publicar dos cifras distintas del mismo cálculo.

6. **Cron `launchd` en la Mac** para el scraper de escala (20,202 sentencias,
   ~1,000/noche) — el VPS no alcanza la API del PJ (geo-bloqueo). No depende
   del gate: el destino provisional (Data Table de n8n) sigue válido.
7. **Pantallas futuras tras validar con abogados reales** (decisión Wesley
   2026-08-26): "Mis casos" (+agenda de plazos integrada) es la #16 priorizada
   — gancho de retención/uso diario; referidos como card, no pantalla. No
   construir hasta tener feedback de la validación (backlog #4 del producto).

## 7. Qué falta para Fase 2 (en orden)

1. **Corpus** — scraper n8n de la API del PJ (`searchFreeRecords` →
   `getRecord`/`getHtml`) → Postgres + embeddings pgvector. Es el bloqueante de
   todo lo demás: sin corpus, Jus IA real no puede encenderse.
2. **Supabase Auth + RLS** por `abogado_id` → cambiar las rutas a
   `role: "session"` y quitar `JUSTIHN_DEMO_SESSION`.
3. **Ledger de créditos** — `debitarCreditos()` en `api-guard.ts` es hoy un seam
   vacío: implementarlo como RPC atómico (decremento + auditoría en una
   transacción) y devolver 402 al agotarse.
4. **Rate limit distribuido** — configurar Upstash antes del go-live.
5. **Pagos** — mismo cuello de BAC que Sonriprev; el pago anual único lo esquiva.
6. **Validar el cálculo laboral** con el socio abogado antes de que un
   profesional lo use en un caso real (`lib/prestaciones.ts` lleva el aviso).

## 8. Deuda conocida

- **Las sentencias del seed son REALES desde 2026-08-26**: 12 del piloto del
  corpus (API del PJ), con resumen CEDIJ, órgano, magistrado y fallo reales;
  el extracto es un fragmento del texto oficial. `data/sentencias.ts` se genera
  con `generar-seed.mjs` (scratchpad del piloto) — regenerar, no editar a mano.
  Los expedientes `CAS-…` que persisten en brief/adjuntos son los **casos
  propios de la abogada demo**, no sentencias publicadas (el router los trata
  como tales).
- Los `art. ___` de los procesos son marcadores deliberados hasta cargar los
  códigos (backlog #5 del proyecto).
- Login y onboarding EXISTEN desde 2026-08-30 (`/iniciar-sesion`,
  `/crear-cuenta`) pero son maqueta: validan formato y entran con la sesión
  demo — el portal sigue sin auth real hasta cablear Supabase (§7.2).
- Responsive móvil **base** hecho (2026-08-25): header con hamburguesa + drawer
  (`HeaderMovil`/`CapaMenuMovil` en `sidebar.tsx`, corte en `lg`) y grids
  apilados en todas las vistas. Falta pulido fino (tablas del chat, editor de
  escritos en pantallas muy chicas).
