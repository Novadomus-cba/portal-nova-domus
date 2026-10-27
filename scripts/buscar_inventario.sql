-- buscar_inventario — búsqueda única de productos en `inventario` (migración create_buscar_inventario, 26/10/2026).
--
-- Por qué existe: el 26/10/2026 (vivienda Gonzalo) se declararon "no cargados" EAP610, EAP650,
-- TL-SG2210P y murales GLC que estaban activos. Se buscaba solo en `nombre`, y el 74% de los activos
-- no tiene el SKU en el nombre (Masnet carga el modelo solo en `sku`). Regla: toda búsqueda de
-- producto pasa por esta función; un resultado vacío no prueba que el ítem no exista.
--
-- Uso:  select * from buscar_inventario('EAP610');
--       select * from buscar_inventario('mural glc 9U', solo_activos => false, lim => 20);
--
-- Match por cualquiera de: todas las palabras en `busqueda` (tsvector marca+nombre+sku+características),
-- alguna palabra como prefijo, SKU normalizado exacto o contenido (sin guiones/espacios, sin prefijo
-- TL-/GLC-), o similitud trigram sobre nombre+sku (>= 0.5).
-- Orden: puntaje redondeado, proveedor habitual de la marca, puntaje fino, precio asc.
-- Sin índice trigram a propósito: word_similarity() como función no usa índice, y con ~4.600 filas
-- cada búsqueda tarda ~0,4 s (medido el 26/10/2026). Revisar si `inventario` crece un orden de magnitud.

create or replace function public.inventario_sku_norm(s text)
returns text
language sql
immutable
parallel safe
set search_path = public
as $$
  select nullif(regexp_replace(regexp_replace(upper(coalesce(s, '')), '^(TL|GLC)-', ''), '[^A-Z0-9.+]', '', 'g'), '')
$$;

-- Conserva . y + (migración fix_inventario_sku_norm_keep_dot_plus, mismo día): sin ellos B4-HD2-.3 (0,3 m)
-- quedaba igual a B4-HD2-3 (3 m) y U-POE (15 W) igual a U-POE+ (30 W).
comment on function public.inventario_sku_norm(text) is
  'SKU normalizado para comparar entre proveedores: mayúsculas, sin prefijo TL-/GLC-, solo A-Z0-9 . +. Conserva . y + porque distinguen productos (B4-HD2-.3 vs B4-HD2-3, U-POE vs U-POE+). Usado por buscar_inventario.';

create or replace function public.buscar_inventario(
  q text,
  solo_activos boolean default true,
  lim int default 50
)
returns table (
  id bigint, marca text, proveedor text, grupo text, nombre text, sku text,
  precio_sin_iva numeric, iva numeric, remarque numeric, precio_sugerido_manual numeric,
  sku_mo text, tarifa_mo_usd numeric, estado text, tiene_foto boolean,
  duplicados_sku int, rank real
)
language sql
stable
security invoker
set search_path = public
as $$
with p as (
  select q as q_raw,
         public.inventario_sku_norm(q) as qn,
         lower(trim(q)) as ql,
         (select string_agg(t || ':*', ' | ')
            from regexp_split_to_table(lower(q), '[^a-z0-9áéíóúñü]+') t
           where t <> '') as tq
),
dup as (
  select public.inventario_sku_norm(i.sku) as k, count(*)::int as n
    from inventario i
   where i.estado = 'activo' and public.inventario_sku_norm(i.sku) is not null
   group by 1
),
m as (
  select i.*, public.inventario_sku_norm(i.sku) as skn, p.*,
    (p.tq is not null and i.busqueda @@ to_tsquery('simple', p.tq)) as any_terms,
    (i.busqueda @@ websearch_to_tsquery('simple', p.q_raw)) as all_terms,
    coalesce(public.inventario_sku_norm(i.sku) = p.qn, false) as sku_exact,
    coalesce(length(p.qn) >= 3 and public.inventario_sku_norm(i.sku) like '%' || p.qn || '%', false) as sku_part,
    case when p.tq is not null then ts_rank(i.busqueda, to_tsquery('simple', p.tq)) else 0 end as tr,
    word_similarity(p.ql, lower(i.nombre || ' ' || coalesce(i.sku, ''))) as ws
  from inventario i
  cross join p
  where (not solo_activos or i.estado = 'activo')
),
s as (
  select m.*,
    (case when sku_exact then 10 else 0 end
     + case when sku_part then 3 else 0 end
     + case when all_terms then 2 else 0 end
     + tr * 10 + ws)::real as sc,
    -- Proveedor habitual por marca (instrucciones del Project, tabla de proveedores).
    case
      when m.proveedor = case upper(m.marca)
          when 'TP-LINK' then 'Masnet' when 'GLC' then 'Masnet' when 'FURUKAWA' then 'Masnet'
          when 'EATON' then 'Masnet' when 'SEAGATE' then 'Masnet'
          when 'SHELLY' then 'Homiq' when 'HOME ASSISTANT' then 'Homiq' when 'SMLIGHT' then 'Homiq'
          when 'CONTROL4' then 'Dystech' when 'EPISODE' then 'Dystech' when 'TRIAD' then 'Dystech'
          when 'VSSL' then 'Dystech' when 'ARAKNIS' then 'Dystech'
          when 'HIKVISION' then 'Seguridad Centro'
        end then 2
      when upper(m.marca) = 'HIKVISION' and m.proveedor = 'Dinavision' then 1
      else 0
    end as pref
  from m
  where any_terms or all_terms or sku_exact or sku_part or ws >= 0.5
)
select s.id, s.marca, s.proveedor, s.grupo, s.nombre, s.sku,
       s.precio_sin_iva, s.iva, s.remarque, s.precio_sugerido_manual,
       s.sku_mo, t.tarifa_usd, s.estado,
       (s.imagen_estado = 'cargada' and s.imagen_url is not null),
       d.n, s.sc
from s
left join mano_obra_tarifario t on t.sku_mo = s.sku_mo
left join dup d on d.k = s.skn
order by round(s.sc::numeric, 0) desc, s.pref desc, s.sc desc, s.precio_sin_iva asc nulls last
limit lim
$$;

comment on function public.buscar_inventario(text, boolean, int) is
  'Búsqueda única de productos (busqueda tsvector + SKU normalizado + trigram). Trae tarifa_mo_usd, tiene_foto y duplicados_sku. Ver scripts/buscar_inventario.sql.';

revoke all on function public.inventario_sku_norm(text) from public, anon;
revoke all on function public.buscar_inventario(text, boolean, int) from public, anon;
grant execute on function public.inventario_sku_norm(text) to authenticated, service_role;
grant execute on function public.buscar_inventario(text, boolean, int) to authenticated, service_role;
