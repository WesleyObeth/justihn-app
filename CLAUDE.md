# CLAUDE.md — Justihn · plataforma (portal de abogados + sitio público)

> Cerebro técnico del producto. Manda en su dominio sobre `justihn/CLAUDE.md`
> (producto/negocio) y sigue `../../STACK-BLUEPRINT.md` (arquitectura de la agencia).
> Creado: **2026-08-25** · Última actualización: **2026-08-30** (reorganización:
> §1 comprimida, trampas a §4.7; refinado final de los portales como pendiente #1).
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

### 1.2 Portal ciudadano — `/personas` (9 rutas)

El patrón Jusbrasil completo: la landing da la probadita y "crear cuenta gratis"
abre un portal con shell propio (sidebar marino gemelo del de abogados; persona
demo Carlos Zelaya en `data/persona.ts`). Inicio · Trámites (con **checklist
persistido**, `pasosTramite` en el store) · Consultas · Directorio · Calculadora ·
Plan · Perfil · Configuración · Ayuda.

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
   nada. **Al comprar el dominio se cambia en la constante `SITIO` y en ningún
   otro lado.** El `og:url` va **por página**: uno global en el layout haría que
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
    busca, y **por debajo de 980px el nav esconde los enlaces de texto y solo
    sobrevive ese botón**.

## 5. Comandos

```bash
pnpm dev          # http://localhost:3000
pnpm type-check   # tsc --noEmit
pnpm test         # Vitest (64 tests de invariantes)
pnpm build        # gate antes de cualquier entrega
```

**Gate de verificación (§5 del blueprint):** `lint` + `type-check` + `test` +
`build` verdes en cada incremento, más verificación visual con Playwright (y con
**WebKit** cuando se toque SVG, animación o layout fino: ahí es donde aparecen las
diferencias de motor de §4.7).

Los tests cubren lo que no se ve leyendo el código: el harness de seguridad
(inyección, enmascarado, hosts oficiales), el determinismo y honestidad del router
(expedientes reales / inexistentes / casos propios), prestaciones, plazos, vía
procesal, las 13 guías con fuente en la whitelist, los títulos de página, las
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
   (`HowTo`/`FAQPage` en las guías, que es lo que gana los rich snippets). Y
   `robots` sigue en **`noindex`** en el layout raíz: **quitarlo al lanzar**, o
   nada de esto rankea.
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
  respuestas y enseñara preguntas sin contestar) · contrastar las 13 guías contra
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
