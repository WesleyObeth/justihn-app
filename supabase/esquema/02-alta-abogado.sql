-- ═══════════════════════════════════════════════════════════════════════════
-- 02 · Alta del abogado desde el registro, y materias de ejercicio abiertas
--
-- Por qué un trigger y no un insert desde la app: con la confirmación de
-- correo activa, `signUp` NO devuelve sesión hasta que la persona pincha el
-- enlace — y sin sesión la app no puede insertar en `abogados` (RLS). Así
-- que el onboarding manda todo en `raw_user_meta_data` y la base crea las
-- dos filas en el mismo instante que la cuenta. La constancia CAH sí se sube
-- después, con sesión (el banner «Completar validación» del portal).
--
-- Y las materias: el registro ofrece 14 áreas de práctica (Tributario,
-- Ambiental, Migratorio…), más amplias que las 10 del corpus. `materias` y
-- `alertas_materias` pasan a `text[]`; el dominio `materia` se queda para
-- leads, respuestas y mensajes, que sí viven en las materias del corpus.
-- ═══════════════════════════════════════════════════════════════════════════

alter table abogados alter column materias         type text[] using materias::text[];
alter table abogados alter column alertas_materias type text[] using alertas_materias::text[];

/** «Abg. María Castillo» → «maria-castillo»; con sufijo si ya existe. */
create or replace function slug_abogado(nombre text)
returns text language plpgsql as $$
declare
  base text;
  candidato text;
  n integer := 1;
begin
  base := lower(regexp_replace(regexp_replace(nombre, '^\s*(abg|abog|lic|dr|dra)\.?\s+', '', 'i'), '\s+', ' ', 'g'));
  base := translate(base, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN');
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := trim(both '-' from base);
  if base = '' then base := 'abogado'; end if;
  candidato := base;
  while exists (select 1 from abogados where slug = candidato) loop
    n := n + 1;
    candidato := base || '-' || n;
  end loop;
  return candidato;
end $$;

create or replace function crear_persona_al_registrarse()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  nombre_completo text := coalesce(m ->> 'nombre', '');
  partes text[];
begin
  insert into personas (id, nombre, ciudad, whatsapp)
  values (new.id, nombre_completo, nullif(m ->> 'ciudad', ''), nullif(m ->> 'telefono', ''))
  on conflict (id) do nothing;

  if m ->> 'tipo' = 'abogado' then
    partes := regexp_split_to_array(trim(regexp_replace(nombre_completo, '^\s*(abg|abog|lic|dr|dra)\.?\s+', '', 'i')), '\s+');
    insert into abogados (
      id, slug, nombre, nombre_corto, iniciales, colegiacion_numero, ciudad,
      materias, alertas_materias, whatsapp
    ) values (
      new.id,
      slug_abogado(nombre_completo),
      nombre_completo,
      -- «María Castillo»: primer nombre + primer apellido, si los hay.
      case when array_length(partes, 1) >= 3 then partes[1] || ' ' || partes[3]
           else array_to_string(partes, ' ') end,
      upper(left(partes[1], 1) || coalesce(left(partes[array_length(partes, 1)], 1), '')),
      coalesce(nullif(m ->> 'colegiacion_numero', ''), 'pendiente'),
      coalesce(nullif(m ->> 'ciudad', ''), ''),
      coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(m -> 'materias', '[]'::jsonb)) x), '{}'),
      coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(m -> 'materias', '[]'::jsonb)) x), '{}'),
      nullif(m ->> 'telefono', '')
    )
    on conflict (id) do nothing;
  end if;
  return new;
end $$;
