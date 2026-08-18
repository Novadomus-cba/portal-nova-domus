-- =====================================================================
-- estado.sql — Nova Domus
-- =====================================================================
-- Reemplaza a los documentos de estado escritos a mano. Correr al empezar
-- y al terminar cualquier sesión de trabajo sobre la base.
--
-- Uso:
--   psql "$CONNECTION_STRING" -f scripts/estado.sql
--   o pegar bloque por bloque en el MCP / SQL editor.
--
-- Para comparar los dos proyectos: correr el BLOQUE 6 en ambos y diffear
-- la salida. Cualquier diferencia entre vvwnyszcfindtuvojqgs (vigente) y
-- voowjwzlkhdknpapkhxc (rollback) significa que algo escribió en la base
-- huérfana y hay que reconciliar esa fila a mano — EXCEPTO
-- panel_agenda_snapshot/panel_inbox_snapshot, excluidas permanentemente
-- de esta comparación (ver BLOQUE 6): para esas dos, "reconciliar a mano"
-- es exactamente lo que NO hay que hacer.
-- =====================================================================


-- ---------------------------------------------------------------------
-- BLOQUE 1 — Estado general
-- ---------------------------------------------------------------------
\echo '== 1. GENERAL =='
select
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r')                       as tablas_public,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='v')                       as vistas_public,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='cuadrilla' and c.relkind='r')                    as tablas_cuadrilla,
  (select count(*) from pg_policies
     where schemaname in ('public','cuadrilla'))                       as politicas,
  (select count(*) from pg_type t join pg_namespace n on n.oid=t.typnamespace
     where n.nspname='public' and t.typtype='e')                       as enums,
  (select count(*) from auth.users)                                    as usuarios,
  pg_size_pretty(pg_database_size(current_database()))                 as tamanio;


-- ---------------------------------------------------------------------
-- BLOQUE 2 — Superficie de `anon` (lo que no debe crecer solo)
-- ---------------------------------------------------------------------
\echo '== 2a. GRANTS DE TABLA PARA anon =='
select table_schema, privilege_type, count(*) as cant,
       string_agg(table_name, ', ' order by table_name) as objetos
from information_schema.role_table_grants
where grantee='anon'
  and table_schema in ('public','cuadrilla')
  and privilege_type in ('SELECT','INSERT','UPDATE','DELETE','TRUNCATE')
group by 1,2
order by 1,2;
-- Esperado: SELECT en v_presupuesto_publico, v_presupuesto_items_publico,
-- casos_exito, marcas_respaldo. INSERT en presupuestos_comerciales,
-- presupuestos_items. NADA MAS.

\echo '== 2b. GRANTS DE COLUMNA PARA anon (un REVOKE de tabla no los borra) =='
-- OJO: filtrar REFERENCES. Viene de arrastre con casi cualquier grant y devuelve
-- 250+ filas de ruido que tapan lo que importa.
select table_name,
       privilege_type,
       string_agg(distinct column_name, ', ' order by column_name) as columnas
from information_schema.column_privileges
where grantee='anon'
  and table_schema in ('public','cuadrilla')
  and privilege_type in ('SELECT','INSERT','UPDATE','DELETE')
group by table_name, privilege_type
order by table_name, privilege_type;
-- Esperado: casos_exito y marcas_respaldo (SELECT), v_presupuesto_publico y
-- v_presupuesto_items_publico (SELECT), presupuestos_comerciales (SELECT id +
-- INSERT), presupuestos_items (INSERT).
--
-- `comerciales` SELECT(id, nombre) YA NO debería aparecer: era un resto
-- anterior a v_presupuesto_publico (que expone comercial_nombre por
-- SECURITY DEFINER), verificado el 14/08/2026 contra
-- Novadomuscba/presupuestos/index.html (solo consulta la vista) y revocado
-- ese mismo día. Si vuelve a aparecer, algo lo regrant.

\echo '== 2c. FUNCIONES SECURITY DEFINER Y QUIEN LAS EJECUTA =='
select p.proname,
       p.prosecdef                                        as security_definer,
       has_function_privilege('anon',          p.oid, 'EXECUTE') as anon,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated,
       has_function_privilege('public',        p.oid, 'EXECUTE') as publico
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
order by 1;
-- Esperado con anon=true: ninguna.
-- current_app_role() y current_comercial_id() con authenticated=true es correcto.


-- ---------------------------------------------------------------------
-- BLOQUE 3 — Jobs programados
-- ---------------------------------------------------------------------
\echo '== 3. pg_cron =='
select jobid, schedule, command, active
from cron.job
order by jobid;
-- Esperado — DISTINTO POR PROYECTO desde el 18/08/2026:
--   vvwnyszcfindtuvojqgs (vigente): 1 job activo, 'rentabilidad-semanal',
--     '0 18 * * 5' -> SELECT public.refresh_all_obra_balances().
--   voowjwzlkhdknpapkhxc (congelado): 0 jobs — desagendado el 18/08/2026 a propósito
--     (select cron.unschedule('rentabilidad-semanal')), para que no siguiera escribiendo
--     analisis_obra en la copia congelada. Si aparece un job ahí, algo lo reagendó — mirarlo.


-- ---------------------------------------------------------------------
-- BLOQUE 4 — Storage (los binarios NO estan en el dump)
-- ---------------------------------------------------------------------
\echo '== 4. STORAGE =='
select b.name as bucket,
       b.public,
       count(o.id) as objetos,
       pg_size_pretty(coalesce(sum((o.metadata->>'size')::bigint),0)) as peso,
       max(o.created_at)::date as ultimo
from storage.buckets b
left join storage.objects o on o.bucket_id = b.id
group by b.name, b.public
order by count(o.id) desc;


-- ---------------------------------------------------------------------
-- BLOQUE 5 — Actividad reciente (para detectar escrituras inesperadas)
-- ---------------------------------------------------------------------
\echo '== 5. ULTIMAS ESCRITURAS =='
select 'cuadrilla.jornadas' as tabla, max(created_at) as ultima from cuadrilla.jornadas
union all select 'certificados',  max(created_at) from public.certificados
union all select 'recibos',       max(created_at) from public.recibos
union all select 'obras',         max(greatest(coalesce(created_at,'-infinity'::timestamptz),
                                               coalesce(updated_at,'-infinity'::timestamptz)))
            from public.obras
order by 1;
-- Ojo: esto NO reemplaza mirar los logs. Una escritura puede tocar una tabla
-- sin columna de fecha. Para eso: query_logs sobre source='edge_logs' filtrando
-- request.method in ('POST','PATCH','PUT','DELETE').


-- ---------------------------------------------------------------------
-- BLOQUE 6 — Conteo de filas por tabla  (EL BLOQUE DE DIVERGENCIA)
-- ---------------------------------------------------------------------
\echo '== 6. FILAS POR TABLA =='
select table_schema||'.'||table_name as tabla,
       (xpath('/row/c/text()',
              query_to_xml(format('select count(*) c from %I.%I', table_schema, table_name),
                           false, true, '')))[1]::text::bigint as filas
from information_schema.tables
where table_schema in ('public','cuadrilla')
  and table_type = 'BASE TABLE'
order by 1;

-- Baseline de las 31 tablas compartidas, tomado el 14/08/2026 22:05 UTC con
-- conteos IDENTICOS en los dos proyectos:
--
--   cuadrilla.jornadas 1728 · cuadrilla.liquidaciones_tecnico 0
--   cuadrilla.semanas_liquidacion 47 · cuadrilla.tecnicos 26
--   cuadrilla.tecnicos_tarifas 44 · analisis_obra 136 · categorias_egresos 35
--   certificados 145 · certificados_items 297 · cheques 14 · cuadrillas 6
--   cuentas_bancarias 3 · egresos_generales 0 · facturas_obra 0 · icc_registros 7
--   materiales_compras 0 · movimientos_bancarios 423 · obras 15 · obras_rubros 92
--   observador_movimientos 88 · panel_agenda_snapshot 1 · panel_financiero_resumen 0
--   panel_inbox_snapshot 19 · planes_pago 0 · planes_pago_cuotas 0
--   plantilla_costos_fijos 15 · recibos 147 · recibos_cobros 0 · recibos_lineas 439
--   tarifario_base 239 · tipo_cambio 1
--
-- EXCLUSION PERMANENTE (desde 18/08/2026): panel_agenda_snapshot y panel_inbox_snapshot quedan
-- FUERA de la comparación de divergencia para siempre, no solo mientras dure un problema. Son
-- snapshots derivados de una sincronización de Gmail/Calendar que corre por proyecto y nunca se
-- copian entre bases: aunque se corrija el Project de Claude.ai que hoy escribe en el
-- voowjwzlkhdknpapkhxc congelado (project_id viejo en sus instrucciones, escribiendo como
-- `postgres`, no cubierto por el revoke de `authenticated` — ver DECISIONES.md §8), el resultado
-- no es que las dos bases vuelvan a coincidir: el viejo queda fijo en 27/2 (o lo que tenga en ese
-- momento) y el vigente sigue creciendo con su propia sincronización, cada uno con su fuente. Para
-- estas dos tablas, ver una diferencia es lo esperado, no una señal de alerta — no reconciliar a
-- mano, no re-investigar desde este lado.


-- ---------------------------------------------------------------------
-- BLOQUE 7 — Linter
-- ---------------------------------------------------------------------
-- No es SQL: correr get_advisors(type='security') por MCP o mirar el
-- Advisor del dashboard.
--
-- Esperado y ya explicado en DECISIONES.md §4:
--   3 ERROR  security_definer_view (v_presupuesto_publico,
--            v_presupuesto_items_publico, vidriera_publica) -> falsos positivos
--   2 WARN   current_app_role() / current_comercial_id() ejecutables por
--            authenticated -> correcto, es el mecanismo de resolucion de rol
--   1 WARN   leaked password protection deshabilitada -> funcion de Pro
--
-- CUALQUIER OTRA COSA ES NUEVA Y HAY QUE MIRARLA.
