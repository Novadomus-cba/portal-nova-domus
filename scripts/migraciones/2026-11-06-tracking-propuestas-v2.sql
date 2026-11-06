-- Tracking de propuestas v2 (2026-11-06)
-- Additive: the old inline snippet keeps inserting into propuesta_vistas unchanged.
--   * propuesta_vistas: visitor/session ids, recipient token, host, staff flag + derived
--     columns (documento, es_interno, es_bot) so the panel can drop noise.
--   * propuesta_eventos: insert-only engagement events (time on page, scroll, clicks, sections).
--   * propuesta_destinatarios: one opaque token per recipient (?r=<token>), created from the panel.
--   * Views rebuilt to count only real client opens.

begin;

-- 1. propuesta_vistas -----------------------------------------------------------------------
alter table public.propuesta_vistas
  add column if not exists visitante_id       text,
  add column if not exists sesion_id          uuid,
  add column if not exists destinatario_token text,
  add column if not exists host               text,
  add column if not exists es_staff           boolean not null default false,
  add column if not exists pausada            boolean not null default false,
  add column if not exists pantalla           text,
  add column if not exists idioma             text,
  add column if not exists zona_horaria       text;

alter table public.propuesta_vistas
  add column if not exists documento text generated always as (
    regexp_replace(coalesce(url_path, ''), '^.*/([^/]*?)(\.html)?( \[PAUSA\])?$', '\1')
  ) stored,
  -- Local files, Claude scratchpads, localhost and branch previews (<rama>.portalnovadomus.pages.dev)
  add column if not exists es_interno boolean generated always as (
    coalesce(url_path, '') ~ '^/[A-Za-z]:/'
    or coalesce(url_path, '') ~* '/(AppData|scratchpad|tmp)/'
    or coalesce(host, '') ~* '^(localhost|127\.0\.0\.1|\[::1\])(:|$)'
    or coalesce(host, '') ~* '^[^.]+\.portalnovadomus\.pages\.dev$'
  ) stored,
  add column if not exists es_bot boolean generated always as (
    coalesce(user_agent, '') ~* '(bot|crawl|spider|slurp|Read-Aloud|HeadlessChrome|Lighthouse|facebookexternalhit|WhatsApp|preview)'
  ) stored;

-- Anon can insert anything; keep payloads bounded.
alter table public.propuesta_vistas
  drop constraint if exists propuesta_vistas_limites,
  add constraint propuesta_vistas_limites check (
    length(coalesce(propuesta_codigo, ''))   <= 60
    and length(coalesce(url_path, ''))       <= 500
    and length(coalesce(referrer, ''))       <= 500
    and length(coalesce(user_agent, ''))     <= 500
    and length(coalesce(visitante_id, ''))   <= 64
    and length(coalesce(destinatario_token, '')) <= 32
    and length(coalesce(host, ''))           <= 120
    and length(coalesce(pantalla, ''))       <= 20
    and length(coalesce(idioma, ''))         <= 20
    and length(coalesce(zona_horaria, ''))   <= 60
  ) not valid;

create index if not exists propuesta_vistas_codigo_idx on public.propuesta_vistas (propuesta_codigo, abierta_en desc);
create index if not exists propuesta_vistas_token_idx  on public.propuesta_vistas (destinatario_token) where destinatario_token is not null;
create index if not exists propuesta_vistas_sesion_idx on public.propuesta_vistas (sesion_id) where sesion_id is not null;

-- 2. propuesta_eventos (insert-only from anon) ----------------------------------------------
create table if not exists public.propuesta_eventos (
  id               bigint generated always as identity primary key,
  sesion_id        uuid not null,
  propuesta_codigo text,
  tipo             text not null check (tipo in ('fin', 'click', 'seccion')),
  etiqueta         text check (length(etiqueta) <= 120),
  duracion_s       integer check (duracion_s between 0 and 86400),
  scroll_max_pct   smallint check (scroll_max_pct between 0 and 100),
  creado_en        timestamptz not null default now(),
  check (length(coalesce(propuesta_codigo, '')) <= 60)
);
create index if not exists propuesta_eventos_sesion_idx on public.propuesta_eventos (sesion_id);

alter table public.propuesta_eventos enable row level security;
revoke all on public.propuesta_eventos from anon, authenticated;
grant insert (sesion_id, propuesta_codigo, tipo, etiqueta, duracion_s, scroll_max_pct)
  on public.propuesta_eventos to anon, authenticated;
drop policy if exists "anon inserta eventos" on public.propuesta_eventos;
create policy "anon inserta eventos" on public.propuesta_eventos
  for insert to anon, authenticated with check (true);

-- 3. propuesta_destinatarios ----------------------------------------------------------------
create table if not exists public.propuesta_destinatarios (
  token            text primary key check (token ~ '^[a-z0-9]{6,16}$'),
  propuesta_codigo text not null,
  url_base         text not null,
  destinatario     text not null check (length(destinatario) between 1 and 120),
  nota             text check (length(nota) <= 300),
  creado_por       uuid default auth.uid(),
  creado_en        timestamptz not null default now()
);
create index if not exists propuesta_destinatarios_codigo_idx on public.propuesta_destinatarios (propuesta_codigo);

alter table public.propuesta_destinatarios enable row level security;
revoke all on public.propuesta_destinatarios from anon, authenticated;
grant select, delete on public.propuesta_destinatarios to authenticated;
drop policy if exists "staff comercial lee destinatarios" on public.propuesta_destinatarios;
create policy "staff comercial lee destinatarios" on public.propuesta_destinatarios
  for select to authenticated using (current_app_role() in ('admin', 'comercial'));
drop policy if exists "admin borra destinatarios" on public.propuesta_destinatarios;
create policy "admin borra destinatarios" on public.propuesta_destinatarios
  for delete to authenticated using (current_app_role() = 'admin');

-- Creating goes through this function so the token is generated server-side.
create or replace function public.crear_link_propuesta(p_codigo text, p_url text, p_destinatario text, p_nota text default null)
returns table (token text, url text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_base  text;
begin
  -- Portal users go through PostgREST (session_user = authenticator) and need admin/comercial;
  -- a direct database session (Supabase MCP / SQL editor) is already privileged.
  if session_user = 'authenticator' and coalesce(current_app_role(), '') not in ('admin', 'comercial') then
    raise exception 'Sin permiso para crear links de propuestas';
  end if;
  if coalesce(trim(p_destinatario), '') = '' then
    raise exception 'Falta el destinatario';
  end if;
  if p_url !~* '^https://(novadomus-cba\.github\.io/portal-nova-domus|portalnovadomus\.pages\.dev)/' then
    raise exception 'La URL tiene que ser de GitHub Pages o de portalnovadomus.pages.dev';
  end if;

  v_base := regexp_replace(p_url, '[?#].*$', '');
  loop
    v_token := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    exit when not exists (select 1 from propuesta_destinatarios d where d.token = v_token);
  end loop;

  insert into propuesta_destinatarios (token, propuesta_codigo, url_base, destinatario, nota)
  values (v_token, trim(p_codigo), v_base, trim(p_destinatario), nullif(trim(p_nota), ''));

  return query select v_token, v_base || '?r=' || v_token;
end;
$$;
revoke all on function public.crear_link_propuesta(text, text, text, text) from public, anon;
grant execute on function public.crear_link_propuesta(text, text, text, text) to authenticated;

-- 4. Views ----------------------------------------------------------------------------------
-- Real client opens only: no local files, previews, bots or logged-in staff.
create or replace view public.v_propuesta_aperturas as
select
  v.id,
  v.propuesta_codigo,
  v.documento,
  v.abierta_en,
  v.host,
  v.visitante_id,
  v.sesion_id,
  v.destinatario_token,
  d.destinatario,
  case
    when v.user_agent ~* 'iPhone'              then 'iPhone'
    when v.user_agent ~* 'iPad'                then 'iPad'
    when v.user_agent ~* 'Android.*Mobile'     then 'Android'
    when v.user_agent ~* 'Android'             then 'Android tablet'
    when v.user_agent ~* 'Windows'             then 'Windows'
    when v.user_agent ~* 'Macintosh|Mac OS X'  then 'Mac'
    else 'Otro'
  end as dispositivo,
  v.pantalla,
  v.referrer,
  f.duracion_s,
  f.scroll_max_pct,
  c.clicks
from public.propuesta_vistas v
left join public.propuesta_destinatarios d on d.token = v.destinatario_token
left join lateral (
  select max(e.duracion_s) as duracion_s, max(e.scroll_max_pct) as scroll_max_pct
  from public.propuesta_eventos e
  where v.sesion_id is not null and e.sesion_id = v.sesion_id and e.tipo = 'fin'
) f on true
left join lateral (
  select array_agg(distinct e.etiqueta) as clicks
  from public.propuesta_eventos e
  where v.sesion_id is not null and e.sesion_id = v.sesion_id and e.tipo in ('click', 'seccion')
) c on true
where not v.es_interno
  and not v.es_bot
  and not v.es_staff
  and not v.pausada
  and coalesce(current_app_role(), '') <> 'tecnico';

-- Same columns as before (panel + snapshot cron depend on them), new ones appended.
create or replace view public.v_seguimiento_propuestas as
select
  p.id as proyecto_id,
  p.numero,
  p.nombre,
  p.estado,
  p.html_url,
  p.created_at as propuesta_registrada_en,
  count(a.id) as aperturas_totales,
  min(a.abierta_en) as primera_apertura,
  max(a.abierta_en) as ultima_apertura,
  case
    when count(a.id) = 0 then 'NUNCA_ABIERTA'
    when max(a.abierta_en) < now() - interval '7 days' then 'SIN_ACTIVIDAD_RECIENTE'
    else 'ACTIVA'
  end as estado_seguimiento,
  count(distinct a.visitante_id) as visitantes_unicos,
  count(distinct a.destinatario) as destinatarios_que_abrieron,
  coalesce(sum(a.duracion_s), 0)::integer as segundos_totales,
  max(a.scroll_max_pct) as scroll_max_pct,
  (select count(*) from public.propuesta_destinatarios d where d.propuesta_codigo = p.numero) as links_generados
from public.proyectos p
left join public.v_propuesta_aperturas a on a.propuesta_codigo = p.numero
where p.html_url is not null
  and coalesce(current_app_role(), '') <> 'tecnico'
group by p.id, p.numero, p.nombre, p.estado, p.html_url, p.created_at;

-- Per recipient: who opened, how often, from how many browsers (more than 1 = forwarded).
create or replace view public.v_seguimiento_destinatarios as
select
  d.token,
  d.propuesta_codigo,
  d.destinatario,
  d.nota,
  d.url_base || '?r=' || d.token as url,
  d.creado_en,
  count(a.id) as aperturas,
  count(distinct a.visitante_id) as navegadores,
  min(a.abierta_en) as primera_apertura,
  max(a.abierta_en) as ultima_apertura,
  coalesce(sum(a.duracion_s), 0)::integer as segundos_totales,
  max(a.scroll_max_pct) as scroll_max_pct,
  (array_agg(a.dispositivo order by a.abierta_en desc) filter (where a.id is not null))[1] as ultimo_dispositivo
from public.propuesta_destinatarios d
left join public.v_propuesta_aperturas a on a.destinatario_token = d.token
where coalesce(current_app_role(), '') in ('admin', 'comercial', '')
group by d.token, d.propuesta_codigo, d.destinatario, d.nota, d.url_base, d.creado_en;

-- v_propuestas_frias: same output, but the "last open" signal now ignores noise.
create or replace view public.v_propuestas_frias with (security_invoker = on) as
with senal as (
  select p.numero, p.nombre, p.cliente, p.total_usd, p.html_url,
    p.created_at::date as entregado,
    p.ultimo_contacto_en::date as ultimo_contacto,
    p.ultimo_contacto_nota,
    (select max(a.abierta_en)::date from public.v_propuesta_aperturas a where a.propuesta_codigo = p.numero) as ultima_vista,
    (select count(*) from public.v_propuesta_aperturas a where a.propuesta_codigo = p.numero) as vistas
  from public.proyectos p
  where p.estado = 'ENTREGADO' and p.pausa_automatica
)
select numero, nombre, cliente, total_usd, html_url, entregado, ultima_vista, vistas,
  ultimo_contacto, ultimo_contacto_nota,
  greatest(coalesce(ultima_vista, entregado), coalesce(ultimo_contacto, entregado)) as ultima_senal,
  case
    when coalesce(ultimo_contacto, '-infinity'::date) >= coalesce(ultima_vista, '-infinity'::date) and ultimo_contacto is not null then 'contacto'
    when ultima_vista is not null then 'apertura'
    else 'sin señal desde la entrega'
  end as origen_senal,
  current_date - greatest(coalesce(ultima_vista, entregado), coalesce(ultimo_contacto, entregado)) as dias_frio
from senal
order by current_date - greatest(coalesce(ultima_vista, entregado), coalesce(ultimo_contacto, entregado)) desc;

revoke all on public.v_propuesta_aperturas, public.v_seguimiento_destinatarios from anon;
grant select on public.v_propuesta_aperturas, public.v_seguimiento_destinatarios to authenticated;

commit;
