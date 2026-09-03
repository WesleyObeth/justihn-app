-- ═══════════════════════════════════════════════════════════════════════════
-- 03 · Número de identidad (DNI) del abogado
--
-- Pedido de Wesley (2026-09-02): el paso 2 del onboarding lo recoge junto a la
-- colegiación, que son los dos números con los que el equipo contrasta el
-- carné contra el padrón del CAH. El número de colegiación solo se puede
-- teclear mal; el DNI da un segundo apoyo.
--
-- Se guardan SOLO los 13 dígitos, sin guiones: así la unicidad no depende de
-- cómo se escriba. La máscara vive en la UI (`lib/identidad.ts`).
--
-- ⚠️ Es dato personal y NO es público: no entra en la vista `directorio`, que
-- lista columnas una a una justo para que un campo nuevo no se publique por
-- descuido. Solo lo ve su dueño, por la política `abogados_leer`.
-- ═══════════════════════════════════════════════════════════════════════════

alter table abogados add column if not exists identidad text;

-- Un documento, una persona. `unique` deja pasar varios NULL, que es lo que
-- se quiere: el paso 2 del onboarding es opcional.
create unique index if not exists abogados_identidad_idx on abogados (identidad)
  where identidad is not null;

-- 13 dígitos exactos cuando existe. La regla vive en la base además de en la
-- UI: una fila mal formada entrando por otro camino no debería colarse.
alter table abogados drop constraint if exists abogados_identidad_formato;
alter table abogados add constraint abogados_identidad_formato
  check (identidad is null or identidad ~ '^[0-9]{13}$');

/**
 * El trigger de alta copia el DNI y, acto seguido, lo BORRA de
 * `raw_user_meta_data`. Los metadatos del usuario viajan dentro del JWT en
 * cada petición: una vez copiado a su tabla, mantenerlo ahí solo alarga la
 * vida de un dato personal sin ganar nada. El `update` sobre auth.users no
 * re-dispara este trigger, que es solo `after insert`.
 */
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
      id, slug, nombre, nombre_corto, iniciales, colegiacion_numero, identidad,
      ciudad, materias, alertas_materias, whatsapp
    ) values (
      new.id,
      slug_abogado(nombre_completo),
      nombre_completo,
      case when array_length(partes, 1) >= 3 then partes[1] || ' ' || partes[3]
           else array_to_string(partes, ' ') end,
      upper(left(partes[1], 1) || coalesce(left(partes[array_length(partes, 1)], 1), '')),
      coalesce(nullif(m ->> 'colegiacion_numero', ''), 'pendiente'),
      nullif(m ->> 'identidad', ''),
      coalesce(nullif(m ->> 'ciudad', ''), ''),
      coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(m -> 'materias', '[]'::jsonb)) x), '{}'),
      coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(m -> 'materias', '[]'::jsonb)) x), '{}'),
      nullif(m ->> 'telefono', '')
    )
    on conflict (id) do nothing;

    if m ? 'identidad' then
      update auth.users set raw_user_meta_data = raw_user_meta_data - 'identidad'
      where id = new.id;
    end if;
  end if;
  return new;
end $$;
