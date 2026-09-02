-- ═══════════════════════════════════════════════════════════════════════════
-- Justihn · esquema de NEGOCIO — cuentas, consultorio, mensajes, monitoreo,
-- notificaciones, conversaciones de Jus IA y ledger de créditos.
--
-- Es la traducción literal de los seeds de `src/data/` y del estado
-- persistido de `src/store/portal.ts` (auditados como contrato el
-- 2026-09-02, plataforma/CLAUDE.md §6.1). Vive en el repo —a diferencia del
-- esquema del corpus, que vive en `justihn/automatizaciones/`— porque es la
-- app quien lo consume y quien lo migra.
--
-- Patrones heredados de 01-corpus.sql:
--   · RLS en TODAS las tablas; sin política no se lee ni se escribe.
--   · Grants explícitos: el proyecto tiene "exponer tablas nuevas" apagado.
--   · Las reglas del producto van DENTRO de la base (políticas, checks,
--     funciones), no en quien llama: una regla que dependa de que la app se
--     acuerde acaba olvidándose en alguna ruta.
--
-- Decisiones que este archivo fija (ver notas en cada tabla):
--   1. Una cuenta = una fila en `personas` (todo el mundo) + opcionalmente una
--      en `abogados`. El destino del login se resuelve por esa segunda fila.
--   2. La consulta del consultorio se INSERTA al crear la cuenta, no antes:
--      permitir inserts anónimos con la clave pública sería un canal de spam
--      que ningún rate limit de la API frena (la clave viaja en el navegador).
--   3. La cuota de Jus IA se debita en la base, atómica, con la cuota leída de
--      `planes` — nunca de un número que mande el cliente.
--   4. El historial del Informe Verifica (a quién consultó alguien) NO tiene
--      tabla: se queda en el navegador y se borra desde allí (§5).
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Dominios ───────────────────────────────────────────────────────────────
-- Las materias son las de `types/dominio.ts`; un valor fuera de la lista es
-- un error de datos, no una materia nueva.
do $$ begin
  create domain materia as text check (value in (
    'Civil','Laboral','Penal','Constitucional','Contencioso Adm.','Familia',
    'Mercantil','Notarial','Consumidor','DD.HH.'
  ));
exception when duplicate_object then null; end $$;

-- ── Planes (solo lo que la base necesita decidir) ──────────────────────────
/**
 * Precios, features y copy siguen en `data/catalogo.ts` (§4.4: un solo lugar
 * por dato). Aquí va ÚNICAMENTE la cuota de IA, porque `debitar_credito()`
 * tiene que leerla del lado seguro. `cuota_ia = null` = ilimitada.
 */
create table if not exists planes (
  id        text primary key check (id in ('gratis','profesional','premium')),
  cuota_ia  integer
);
insert into planes (id, cuota_ia) values ('gratis', 0), ('profesional', 60), ('premium', null)
  on conflict (id) do update set cuota_ia = excluded.cuota_ia;

-- ── Personas: TODA cuenta tiene una ───────────────────────────────────────
/**
 * `id` = `auth.users.id`. Se crea sola con el trigger de abajo al registrarse,
 * con el nombre que venga en `raw_user_meta_data.nombre`. El correo vive en
 * `auth.users`; no se duplica.
 */
create table if not exists personas (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null default '',
  ciudad      text,
  whatsapp    text,
  /** { respuestas: bool, tramites: bool, novedades: bool } — `prefsPersona`. */
  prefs       jsonb not null default '{"respuestas": true, "tramites": true, "novedades": false}',
  creado_en   timestamptz not null default now()
);

-- ── Abogados: la extensión del suscriptor ──────────────────────────────────
/**
 * Una fila, dos vistas (decisión 2026-09-02): el perfil privado del suscriptor
 * es esta tabla; la ficha pública del directorio es la vista `directorio`
 * de abajo, que expone SOLO columnas públicas. `slug` es el id legible de
 * las URLs (`/personas/directorio/maria-castillo`).
 */
create table if not exists abogados (
  id                  uuid primary key references personas (id) on delete cascade,
  slug                text not null unique,
  nombre              text not null,
  nombre_corto        text not null,
  iniciales           text not null,
  colegiacion_numero  text not null,
  ciudad              text not null,
  bio                 text not null default '',
  /** Áreas de práctica (`especialidades`). NO es la habilitación notarial. */
  materias            materia[] not null default '{}',
  /** Materias con alertas de Gaceta activas (`subs` del store). */
  alertas_materias    materia[] not null default '{}',
  /** Datos de contacto: privados hasta que la persona ya conversó (§4.5). */
  email_publico       text,
  whatsapp            text,
  direccion           text,
  anios_ejercicio     integer not null default 0 check (anios_ejercicio >= 0),
  /** Habilitación notarial DECLARADA (el PJ no publica padrón). */
  notario             boolean not null default false,
  /**
   * Validación CAH. Solo la pone el equipo tras revisar la constancia; hay
   * test en la app que impide marcar `verificado: true` a mano en los seeds
   * y aquí la política de update no deja tocarla al propio abogado.
   */
  verificado          boolean not null default false,
  plan                text not null default 'gratis' references planes (id),
  ciclo_plan          text not null default 'mensual' check (ciclo_plan in ('mensual','anual')),
  /** { digest, email, leads, nombres } — `prefs` del store. */
  prefs               jsonb not null default '{"digest": true, "email": true, "leads": true, "nombres": true}',
  creado_en           timestamptz not null default now()
);
create index if not exists abogados_materias_idx on abogados using gin (materias);

/**
 * Ficha pública del abogado. `security_definer` A PROPÓSITO (al revés que
 * `corpus_estado`): esta vista existe para saltarse el RLS de `abogados`,
 * que solo deja leer la propia fila, y exponer al público ÚNICAMENTE las
 * columnas de la vitrina — sin correo, WhatsApp, dirección ni prefs. Es lo
 * que hace que `anon` pueda ver el directorio sin ver contactos.
 */
create or replace view directorio as
  select id, slug, nombre, iniciales, ciudad, bio, materias, anios_ejercicio,
         notario, verificado, (plan = 'premium') as premium, creado_en
  from abogados;

-- ── Documentos de validación (constancia CAH) ─────────────────────────────
create table if not exists documentos_validacion (
  id           uuid primary key default gen_random_uuid(),
  abogado_id   uuid not null references abogados (id) on delete cascade,
  nombre       text not null,
  /** Ruta en el bucket privado `constancias` (ver Storage al final). */
  storage_path text not null,
  estado       text not null default 'pendiente' check (estado in ('pendiente','recibido','rechazado')),
  creado_en    timestamptz not null default now()
);

-- ── Consultorio: leads y respuestas ───────────────────────────────────────
/**
 * `Lead` tal como quedó el 2026-09-02: solo la fila. `nuevo` está en
 * `leads_vistos`; el conteo de respuestas se deriva.
 */
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid references personas (id) on delete set null,
  materia     materia not null,
  ciudad      text not null,
  pregunta    text not null check (char_length(pregunta) between 20 and 2000),
  creado_en   timestamptz not null default now()
);
create index if not exists leads_materia_idx on leads (materia, creado_en desc);

/**
 * Varias por consulta (decisión 2026-08-31): un abogado, UNA respuesta por
 * lead (la reescribe, no la duplica) — es lo que hace `responderLead`.
 */
create table if not exists respuestas_consulta (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads (id) on delete cascade,
  abogado_id  uuid not null references abogados (id) on delete cascade,
  texto       text not null check (char_length(texto) between 20 and 4000),
  creado_en   timestamptz not null default now(),
  unique (lead_id, abogado_id)
);

/** «NUEVO» es estado del lector: qué leads abrió cada abogado. */
create table if not exists leads_vistos (
  abogado_id  uuid not null references abogados (id) on delete cascade,
  lead_id     uuid not null references leads (id) on delete cascade,
  visto_en    timestamptz not null default now(),
  primary key (abogado_id, lead_id)
);

-- ── Mensajes persona → abogado ────────────────────────────────────────────
/**
 * Dentro de Justihn (§4.5): así el abogado puede ver cuántos contactos le
 * trajo la plataforma. RLS a las dos puntas: lo leen remitente y destinatario.
 */
create table if not exists mensajes_abogado (
  id          uuid primary key default gen_random_uuid(),
  abogado_id  uuid not null references abogados (id) on delete cascade,
  persona_id  uuid not null references personas (id) on delete cascade,
  materia     materia not null,
  texto       text not null check (char_length(texto) between 10 and 4000),
  creado_en   timestamptz not null default now()
);
create index if not exists mensajes_abogado_idx on mensajes_abogado (abogado_id, creado_en desc);

-- ── Nombres vigilados ─────────────────────────────────────────────────────
/**
 * Un solo dueño (persona o abogado: son la misma cuenta). La regla de §5 va
 * en la política de insert: `cliente`/`contraparte` solo si el dueño tiene
 * ficha de abogado — un ciudadano no puede vigilar a terceros.
 */
create table if not exists nombres_vigilados (
  id                  uuid primary key default gen_random_uuid(),
  dueno_id            uuid not null references personas (id) on delete cascade,
  nombre              text not null check (char_length(nombre) between 3 and 120),
  /** = `normalizarNombre` de lib/corpus/ficha.ts (minúsculas, sin tildes). */
  nombre_normalizado  text not null,
  tipo                text not null check (tipo in ('propio','familiar','cliente','contraparte')),
  creado_en           timestamptz not null default now(),
  unique (dueno_id, nombre_normalizado)
);

-- ── Notificaciones ────────────────────────────────────────────────────────
create table if not exists notificaciones (
  id          uuid primary key default gen_random_uuid(),
  dueno_id    uuid not null references personas (id) on delete cascade,
  icono       text not null check (icono in ('gaceta','leads','bell','ia','card')),
  titulo      text not null,
  meta        text not null default '',
  destino     text not null,
  creado_en   timestamptz not null default now(),
  /** null = sin leer. El «leído» es por usuario porque la fila ya es por usuario. */
  leida_en    timestamptz
);
create index if not exists notificaciones_idx on notificaciones (dueno_id, creado_en desc);

-- ── Conversaciones con Jus IA ─────────────────────────────────────────────
/**
 * `MensajeChat` tiene citas, tabla, tarjeta, chips, escrito… — la forma la
 * decide la UI y cambia con ella, así que el mensaje va como `contenido`
 * jsonb y no como veinte columnas que habría que migrar cada vez.
 */
create table if not exists conversaciones (
  id          uuid primary key default gen_random_uuid(),
  dueno_id    uuid not null references personas (id) on delete cascade,
  titulo      text not null,
  creado_en   timestamptz not null default now()
);
create table if not exists mensajes_conversacion (
  id               uuid primary key default gen_random_uuid(),
  conversacion_id  uuid not null references conversaciones (id) on delete cascade,
  orden            integer not null,
  who              text not null check (who in ('u','a')),
  contenido        jsonb not null,
  creado_en        timestamptz not null default now(),
  unique (conversacion_id, orden)
);
create index if not exists conversaciones_idx on conversaciones (dueno_id, creado_en desc);

-- ── Checklists (procesos del abogado, trámites del ciudadano) ─────────────
create table if not exists avances_checklist (
  dueno_id   uuid not null references personas (id) on delete cascade,
  tipo       text not null check (tipo in ('proceso','tramite')),
  item_id    text not null,
  indices    integer[] not null default '{}',
  actualizado timestamptz not null default now(),
  primary key (dueno_id, tipo, item_id)
);

-- ── Ledger de créditos de Jus IA ──────────────────────────────────────────
/**
 * Una fila por cuenta y mes. `debitar_credito()` es la ÚNICA forma de subir
 * `usadas`: lee la cuota del plan, incrementa y devuelve lo que queda, todo
 * en una sentencia (atómico). `guard()` la llama antes de gastar un token.
 */
create table if not exists creditos_ia (
  dueno_id   uuid not null references personas (id) on delete cascade,
  periodo    text not null,               -- 'YYYY-MM'
  usadas     integer not null default 0,
  primary key (dueno_id, periodo)
);

create or replace function debitar_credito(costo integer default 1)
returns table (ok boolean, usadas integer, cuota integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  yo        uuid := auth.uid();
  mi_cuota  integer;
  mes       text := to_char(now(), 'YYYY-MM');
  actuales  integer;
begin
  if yo is null then
    return query select false, 0, 0; return;
  end if;
  -- Sin ficha de abogado la cuota es la del plan gratis (0): el ciudadano no
  -- gasta IA en Fase 2 mientras el plan pago de la vía B no exista.
  select p.cuota_ia into mi_cuota
    from abogados a join planes p on p.id = a.plan where a.id = yo;
  if not found then mi_cuota := 0; end if;

  insert into creditos_ia (dueno_id, periodo, usadas) values (yo, mes, 0)
    on conflict (dueno_id, periodo) do nothing;
  select c.usadas into actuales from creditos_ia c
    where c.dueno_id = yo and c.periodo = mes for update;

  if mi_cuota is not null and actuales + costo > mi_cuota then
    return query select false, actuales, mi_cuota; return;
  end if;
  update creditos_ia set usadas = usadas + costo
    where dueno_id = yo and periodo = mes returning creditos_ia.usadas into actuales;
  return query select true, actuales, mi_cuota;
end $$;

/** Cuota y uso del mes, para pintar «34 / 60» sin debitar nada. */
create or replace function mi_cuota()
returns table (usadas integer, cuota integer, plan text)
language sql security definer set search_path = public stable as $$
  select coalesce(c.usadas, 0), p.cuota_ia, coalesce(a.plan, 'gratis')
  from personas per
  left join abogados a on a.id = per.id
  left join planes p on p.id = coalesce(a.plan, 'gratis')
  left join creditos_ia c on c.dueno_id = per.id and c.periodo = to_char(now(), 'YYYY-MM')
  where per.id = auth.uid();
$$;

/** ¿A qué portal va esta cuenta? Lo decide la ficha de abogado, no un `?tipo=`. */
create or replace function mi_destino()
returns text language sql security definer set search_path = public stable as $$
  select case when exists (select 1 from abogados where id = auth.uid())
              then 'abogados' else 'personas' end;
$$;

-- ── Alta automática de la persona al registrarse ──────────────────────────
create or replace function crear_persona_al_registrarse()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into personas (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_registrarse on auth.users;
create trigger al_registrarse
  after insert on auth.users
  for each row execute function crear_persona_al_registrarse();

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table personas              enable row level security;
alter table abogados              enable row level security;
alter table documentos_validacion enable row level security;
alter table leads                 enable row level security;
alter table respuestas_consulta   enable row level security;
alter table leads_vistos          enable row level security;
alter table mensajes_abogado      enable row level security;
alter table nombres_vigilados     enable row level security;
alter table notificaciones        enable row level security;
alter table conversaciones        enable row level security;
alter table mensajes_conversacion enable row level security;
alter table avances_checklist     enable row level security;
alter table creditos_ia           enable row level security;
alter table planes                enable row level security;

-- personas: solo la propia.
drop policy if exists personas_propia on personas;
create policy personas_propia on personas
  for all using (id = auth.uid()) with check (id = auth.uid());

-- abogados: solo la propia; `verificado` y `plan` NO los cambia el abogado
-- (el plan lo cambia el pago, la verificación el equipo).
drop policy if exists abogados_leer on abogados;
create policy abogados_leer on abogados for select using (id = auth.uid());
drop policy if exists abogados_crear on abogados;
create policy abogados_crear on abogados for insert
  with check (id = auth.uid() and verificado = false and plan = 'gratis');
drop policy if exists abogados_editar on abogados;
create policy abogados_editar on abogados for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and verificado = (select verificado from abogados a where a.id = auth.uid())
    and plan       = (select plan       from abogados a where a.id = auth.uid())
  );

-- documentos: los suyos.
drop policy if exists documentos_propios on documentos_validacion;
create policy documentos_propios on documentos_validacion
  for all using (abogado_id = auth.uid()) with check (abogado_id = auth.uid());

-- leads: públicos para leer (es el consultorio); insertar solo con cuenta
-- (decisión 2). La persona puede borrar los suyos (habeas data).
drop policy if exists leads_publicos on leads;
create policy leads_publicos on leads for select using (true);
drop policy if exists leads_crear on leads;
create policy leads_crear on leads for insert
  with check (auth.uid() is not null and persona_id = auth.uid());
drop policy if exists leads_borrar on leads;
create policy leads_borrar on leads for delete using (persona_id = auth.uid());

-- respuestas: públicas; escribe solo un abogado PREMIUM (regla del producto),
-- y solo la suya.
drop policy if exists respuestas_publicas on respuestas_consulta;
create policy respuestas_publicas on respuestas_consulta for select using (true);
drop policy if exists respuestas_escribir on respuestas_consulta;
create policy respuestas_escribir on respuestas_consulta for insert
  with check (
    abogado_id = auth.uid()
    and exists (select 1 from abogados a where a.id = auth.uid() and a.plan = 'premium')
  );
drop policy if exists respuestas_editar on respuestas_consulta;
create policy respuestas_editar on respuestas_consulta for update
  using (abogado_id = auth.uid()) with check (abogado_id = auth.uid());
drop policy if exists respuestas_borrar on respuestas_consulta;
create policy respuestas_borrar on respuestas_consulta for delete using (abogado_id = auth.uid());

drop policy if exists leads_vistos_propios on leads_vistos;
create policy leads_vistos_propios on leads_vistos
  for all using (abogado_id = auth.uid()) with check (abogado_id = auth.uid());

-- mensajes: los leen las dos puntas; los escribe la persona.
drop policy if exists mensajes_leer on mensajes_abogado;
create policy mensajes_leer on mensajes_abogado for select
  using (persona_id = auth.uid() or abogado_id = auth.uid());
drop policy if exists mensajes_escribir on mensajes_abogado;
create policy mensajes_escribir on mensajes_abogado for insert
  with check (persona_id = auth.uid());
drop policy if exists mensajes_borrar on mensajes_abogado;
create policy mensajes_borrar on mensajes_abogado for delete using (persona_id = auth.uid());

-- vigilados: los propios; terceros solo con ficha de abogado (§5).
drop policy if exists vigilados_leer on nombres_vigilados;
create policy vigilados_leer on nombres_vigilados for select using (dueno_id = auth.uid());
drop policy if exists vigilados_crear on nombres_vigilados;
create policy vigilados_crear on nombres_vigilados for insert
  with check (
    dueno_id = auth.uid()
    and (tipo in ('propio','familiar')
         or exists (select 1 from abogados a where a.id = auth.uid()))
  );
drop policy if exists vigilados_borrar on nombres_vigilados;
create policy vigilados_borrar on nombres_vigilados for delete using (dueno_id = auth.uid());

-- notificaciones: las propias; solo se marca leída (no se inventan desde la app).
drop policy if exists notifs_leer on notificaciones;
create policy notifs_leer on notificaciones for select using (dueno_id = auth.uid());
drop policy if exists notifs_marcar on notificaciones;
create policy notifs_marcar on notificaciones for update
  using (dueno_id = auth.uid()) with check (dueno_id = auth.uid());

-- conversaciones y mensajes: propios.
drop policy if exists conv_propias on conversaciones;
create policy conv_propias on conversaciones
  for all using (dueno_id = auth.uid()) with check (dueno_id = auth.uid());
drop policy if exists msg_conv_propios on mensajes_conversacion;
create policy msg_conv_propios on mensajes_conversacion
  for all using (exists (select 1 from conversaciones c where c.id = conversacion_id and c.dueno_id = auth.uid()))
  with check (exists (select 1 from conversaciones c where c.id = conversacion_id and c.dueno_id = auth.uid()));

drop policy if exists checklist_propio on avances_checklist;
create policy checklist_propio on avances_checklist
  for all using (dueno_id = auth.uid()) with check (dueno_id = auth.uid());

-- créditos: solo lectura de lo propio; escribe la función.
drop policy if exists creditos_leer on creditos_ia;
create policy creditos_leer on creditos_ia for select using (dueno_id = auth.uid());

drop policy if exists planes_publicos on planes;
create policy planes_publicos on planes for select using (true);

-- ── Grants (el proyecto no expone tablas automáticamente) ─────────────────
grant usage on schema public to anon, authenticated, service_role;

grant select on directorio, leads, respuestas_consulta, planes to anon, authenticated;

grant select, insert, update, delete on
  personas, abogados, documentos_validacion, leads, respuestas_consulta,
  leads_vistos, mensajes_abogado, nombres_vigilados, notificaciones,
  conversaciones, mensajes_conversacion, avances_checklist
to authenticated;
grant select on creditos_ia to authenticated;

grant execute on function debitar_credito(integer) to authenticated;
grant execute on function mi_cuota() to authenticated;
grant execute on function mi_destino() to authenticated;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- ── Storage: constancias del CAH (bucket privado) ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('constancias', 'constancias', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

-- Cada abogado sube y lee SOLO dentro de su carpeta `<uid>/…`.
drop policy if exists constancias_subir on storage.objects;
create policy constancias_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'constancias' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists constancias_leer on storage.objects;
create policy constancias_leer on storage.objects for select to authenticated
  using (bucket_id = 'constancias' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists constancias_borrar on storage.objects;
create policy constancias_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'constancias' and (storage.foldername(name))[1] = auth.uid()::text);
