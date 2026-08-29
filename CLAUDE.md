# CLAUDE.md — Justihn · plataforma (portal de abogados)

> Cerebro técnico del portal. Manda en su dominio sobre `justihn/CLAUDE.md`
> (producto/negocio) y sigue `../../STACK-BLUEPRINT.md` (arquitectura de la agencia).
> Creado: **2026-08-25**.

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
- **🏛️ PORTAL CIUDADANO `/persona` (2026-08-29, decisión Wesley):** el patrón
  Jusbrasil completo — la landing da la probadita y "crear cuenta gratis" abre
  un portal con shell propio (`components/personas/`, sidebar marino gemelo del
  de abogados; persona demo Carlos Zelaya, `data/persona.ts`). Pantallas:
  Inicio · Trámites (guías completas con **checklist persistido**,
  `pasosTramite` en el store) · Mis consultas (form + respuestas de abogados)
  · Encuentra abogado · Calculadora · Mi plan (Gratis + pago en definición).
  **Gates de la landing:** el detalle de trámite muestra solo el paso 1 (resto
  difuminado) → CTA `/persona/tramites/[id]`; preguntar en el consultorio
  "crea la cuenta" y redirige a `/persona/consultas`. Los componentes públicos
  compartidos aceptan `enPortal` para rutas/wrapper. **Menú del avatar**
  (patrón abogados) con Mi perfil (actividad real del store), Configuración
  (cuenta + prefs `prefsPersona` + habeas data) y Ayuda (FAQ ciudadana) —
  9 rutas en el portal ciudadano.
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
pnpm test         # Vitest (36 tests de invariantes)
pnpm build        # gate antes de cualquier entrega
```

**Gate de verificación (§5 del blueprint):** `lint` + `type-check` + `test` +
`build` verdes en cada incremento, más verificación visual con Playwright. Los
tests cubren lo crítico: el harness de seguridad (inyección, enmascarado, hosts
oficiales), el determinismo y honestidad del router (expedientes reales /
inexistentes / casos propios), prestaciones, plazos y vía procesal.

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
5. **Cron `launchd` en la Mac** para el scraper de escala (20,202 sentencias,
   ~1,000/noche) — el VPS no alcanza la API del PJ (geo-bloqueo). No depende
   del gate: el destino provisional (Data Table de n8n) sigue válido.
6. **Pantallas futuras tras validar con abogados reales** (decisión Wesley
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
- No hay pantalla de login: el portal asume sesión demo.
- Responsive móvil **base** hecho (2026-08-25): header con hamburguesa + drawer
  (`HeaderMovil`/`CapaMenuMovil` en `sidebar.tsx`, corte en `lg`) y grids
  apilados en todas las vistas. Falta pulido fino (tablas del chat, editor de
  escritos en pantallas muy chicas).
