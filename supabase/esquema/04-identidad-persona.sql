-- ═══════════════════════════════════════════════════════════════════════════
-- 04 · Número de identidad también en `personas`
--
-- Pedido de Wesley (2026-09-02): el alta ciudadana lo recoge tras el nombre,
-- porque el abogado que atienda el caso lo necesita para actuar por la
-- persona. Es OPCIONAL: quien solo viene a leer una guía de trámites no tiene
-- por qué entregar su documento, y el alta corta es lo que sostiene la vía B.
--
-- Mismas reglas que en `abogados` (esquema 03): 13 dígitos sin guiones, único
-- cuando existe, y fuera de cualquier vista pública. Aquí es aún más estricto:
-- `personas` no tiene ninguna vista pública, solo la lee su dueño.
-- ═══════════════════════════════════════════════════════════════════════════

alter table personas add column if not exists identidad text;

create unique index if not exists personas_identidad_idx on personas (identidad)
  where identidad is not null;

alter table personas drop constraint if exists personas_identidad_formato;
alter table personas add constraint personas_identidad_formato
  check (identidad is null or identidad ~ '^[0-9]{13}$');

/**
 * El trigger copia el DNI a `personas` (las dos vías lo mandan igual) y lo
 * borra de `raw_user_meta_data` en TODOS los casos, no solo en el del
 * abogado: los metadatos viajan dentro del JWT en cada petición y un
 * documento de identidad no tiene por qué pasearse ahí una vez guardado.
 */
create or replace function crear_persona_al_registrarse()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  nombre_completo text := coalesce(m ->> 'nombre', '');
  partes text[];
begin
  insert into personas (id, nombre, ciudad, whatsapp, identidad)
  values (
    new.id,
    nombre_completo,
    nullif(m ->> 'ciudad', ''),
    nullif(m ->> 'telefono', ''),
    nullif(m ->> 'identidad', '')
  )
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
  end if;

  if m ? 'identidad' then
    update auth.users set raw_user_meta_data = raw_user_meta_data - 'identidad'
    where id = new.id;
  end if;
  return new;
end $$;
