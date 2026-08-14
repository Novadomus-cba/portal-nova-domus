# Kickoff — Continuación: consolidación Obras → Comercial (Opción A)

> Para retomar en un chat nuevo. Este documento reemplaza y actualiza el kickoff original de
> consolidación: la investigación ya se hizo, la ruta ya está decidida, y **la Fase 0 (backup
> verificado) ya se completó**. Lo que sigue es entrar a la Fase 1 sobre Comercial.
> Verificado contra las dos bases y contra `search_docs` de Supabase el 14/08/2026.

---

## 0. Dónde quedamos exactamente

**Decisión tomada por Agustín: Opción A — migrar Obras → Comercial (el proyecto se queda en
us-west-2). Confirmada, no hay que volver a evaluarla.**

**Fase 0 (backup verificado) — COMPLETADA el 14/08/2026.** WSL2 y Docker Desktop se instalaron sin
necesidad de reiniciar la PC (alcanzó con `wsl --install` sin admin explícito — el motor de WSL2
quedó operativo igual). Se hizo `pg_dump` completo (formato custom, `-Fc`) de los dos proyectos vía
Docker (`postgres:17`), se restauraron en un Postgres local descartable, y los conteos de filas de
las tablas clave coincidieron exactamente con los valores conocidos (`inventario`: 3.531,
`presupuestos_comerciales`: 97, `proyectos`: 25, `obras`: 15, `certificados`: 145, `recibos`: 147,
`cuadrilla.jornadas`: 1.728, `cuadrilla.tecnicos`: 26). El contenedor de verificación ya se borró.

**Los dumps verificados quedaron en `C:\Users\agust\novadomus-paneles-backups\`**
(`comercial_20260814.dump`, `obras_20260814.dump`) — **fuera del repo git**, a propósito: el dump
de Comercial incluye `auth.users` con los hashes de contraseña de los 8 usuarios. **No subir esta
carpeta a git, no compartirla, no moverla a un lugar sincronizado.** Es de un solo uso para esta
migración — borrarla una vez que la Fase 2+ esté validada en Comercial.

**Hallazgo de tooling para reusar en la Fase 2:** la conexión directa (`db.<ref>.supabase.co`) es
IPv6-only y no sirve desde esta máquina/Docker. El *session pooler* sí funciona, pero **el host
`aws-0-<región>` no siempre es el correcto** — hay que probar `aws-0` y `aws-1` para cada proyecto.
Confirmado: **Comercial → `aws-1-us-west-2.pooler.supabase.com`**, **Obras →
`aws-1-sa-east-1.pooler.supabase.com`**, puerto 5432, usuario `postgres.<project-ref>`. La
contraseña de base (la misma para los dos proyectos, reseteada el 13/08) se pasa por
`$env:PGPASSWORD`, nunca en la connection string ni como argumento de línea de comando.

**Fase 1 — COMPLETADA 14/08/2026.** `pg_cron` y `btree_gist` (en `extensions`) instalados en
Comercial, schema `cuadrilla` creado.

**Fase 2 — COMPLETADA 14/08/2026.** Cero colisiones de nombres entre `public` de Obras y `public`
de Comercial (tablas, vistas, enums, funciones propias). Restore en dos pasos: schema-only primero
(`pg_restore --schema-only --schema=public --schema=cuadrilla --no-owner --no-privileges`), después
datos. El primer intento de carga de datos con `pg_restore --disable-triggers` falló: ese flag
necesita ser superuser (permission denied en los triggers de FK), y sin eso los datos se cargaron
en el orden equivocado y violaron foreign keys en 8 tablas. Se resolvió truncando esas 31 tablas y
recargando todo de una vez vía `psql --single-transaction` con
`SET session_replication_role = replica;` (el método real que indica la documentación oficial, no
`pg_restore --disable-triggers`). Conteos de fila verificados 1:1 contra Obras en las 31 tablas.
`refresh_all_obra_balances()` corrido una vez para recomputar saldos que los triggers no
recalcularon durante la carga. Comentarios (`COMMENT ON TABLE`) preservados. Secuencias identity
(`facturas_obra.id`, `tipo_cambio.id`) verificadas seguras.

**Hallazgo extra de Fase 2 (fuera del checklist original, encontrado por `get_advisors`):** las 9
funciones propias migradas (`apply_icc_adjustment`, `calculate_obra_balance`,
`refresh_all_obra_balances`, los 3 `trg_*_recalc_balance`, etc.) quedaron con `EXECUTE` abierto a
`anon`/`authenticated` vía RPC pública. Se revocó — **el primer intento de `REVOKE ... FROM anon,
authenticated` no alcanzó** porque Postgres ya les había otorgado `EXECUTE` vía el rol `PUBLIC` al
crear la función (default de Postgres); hubo que `REVOKE EXECUTE ... FROM PUBLIC` explícitamente.
Verificado que los triggers siguen disparando bien (no hace falta `EXECUTE` para que un trigger se
dispare por un INSERT/UPDATE normal).

**Fase 3 — COMPLETADA 14/08/2026 (la pieza central de todo el proyecto).** Las 110 políticas se
reescribieron con un único bloque `DO` en PL/pgSQL que recorre `pg_policies`, hace
`replace()` del fragmento literal del claim JWT por `public.current_app_role()`, y aplica el
cambio con `ALTER POLICY ... USING (...) WITH CHECK (...)` (no hizo falta `DROP`+`CREATE`: `ALTER
POLICY` permite cambiar la expresión sin tocar nombre/rol/comando). El bloque valida que las 110
efectivamente cambiaron (aborta si el `replace()` no matcheó algo) y que el conteo final es
exactamente 110. Verificado: 0 políticas con el claim JWT, 161 con `current_app_role()` (110
migradas + 51 propias de Comercial).

**Segundo hallazgo de grants (Fase 3, mismo patrón que el de Fase 2):** al probar los roles contra
`cuadrilla`, dio `permission denied for schema cuadrilla` — nunca se hizo `GRANT USAGE ON SCHEMA
cuadrilla` (el schema es nuevo, creado vacío en la Fase 1, sin el default privileges que sí tiene
`public`). Se replicó el patrón exacto de `public` (grants de tabla/secuencia para `authenticated`
y `service_role`, **nada para `anon`** — mismo criterio que Obras, que auditado tenía cero anon en
todo `cuadrilla`/`public` de ese lado — más `ALTER DEFAULT PRIVILEGES` para que las próximas
tablas de `cuadrilla` hereden lo mismo sin volver a olvidarse).

**Verificación por rol (regla 2/5), confirmada con los 8 usuarios reales de `user_profiles`:**
`comercial` ve `obras`/`tecnicos_tarifas`/`jornadas` pero NO `recibos` (0) — `contable` ve
`recibos` pero NO `jornadas`/`obras_rubros` (0) — `programacion` no ve nada de Obras (0 en las
tres tablas probadas, correcto: ningún módulo de Obras lo incluye) — `admin` ve todo — `anon`
recibe `permission denied` directo en `obras` (bloqueado en la capa de grant, ni siquiera llega a
evaluar la política). Los cinco resultados fueron los esperados.

**Fase 4 — COMPLETADA 14/08/2026.** `cron.timezone` en Comercial confirmado `GMT` (idéntico a
Obras, no hubo que convertir nada). Job `rentabilidad-semanal` recreado con el mismo cron string
(`0 18 * * 5`) y comando. Probado `select public.refresh_all_obra_balances()` manualmente, sin
error.

**Fase 5 — Edge Functions parcialmente completada 14/08/2026.** `cuadrilla` (health-check trivial)
y `analyze-image` (simplificada: se sacó el chequeo cross-proyecto contra
`vvwnyszcfindtuvojqgs.supabase.co` y se pasó a `verify_jwt: true` nativo, ya que ahora la función
vive en el mismo proyecto que emite el token) quedaron deployadas en Comercial.

**Pendiente manual — Agustín tiene que hacerlo:** configurar el secret `ANTHROPIC_API_KEY` en
Comercial (dashboard → Edge Functions → Secrets, mismo valor que ya tiene en Obras). No hay
herramienta MCP para setear secrets ni para leer el valor actual — es 100% manual. Sin este paso,
`analyze-image` en Comercial responde 500 en cualquier análisis de factura.

`exchange-jwt` **todavía no se borró** — se borra recién al final de la Fase 6, cuando el front ya
no la llame.

**Tercer hallazgo de grants/exposición (encontrado al empezar la Fase 6):** PostgREST solo expone
el schema `public` por defecto. Obras tenía `pgrst.db_schemas=public,cuadrilla` seteado a nivel de
rol (`alter role authenticator set ...`) — Comercial no. Sin esto, ningún fetch REST a
`cuadrilla.*` con header `Accept-Profile: cuadrilla` hubiera funcionado aunque el resto del código
estuviera perfecto. Se agregó `cuadrilla` a `pgrst.db_schemas` en Comercial + `notify pgrst,
'reload schema'`. Verificado en vivo contra el REST real: el error pasó de `PGRST205` (tabla no
encontrada en el schema cache) a `401` (no autorizado, esperable porque `anon` no tiene grants ahí
— correcto).

**Fase 6 en curso — front-end (11 archivos, ~51 referencias).** Patrón encontrado: cada archivo ya
tiene su propio `AUTH_URL`/`AUTH_KEY`/`authClient` apuntando a Comercial (para sus propias tablas)
Y por separado `SB_URL`/`CUADRILLA_URL` + `CUADRILLA_PUBLISHABLE_KEY` + `cuadrillaToken` (obtenido
antes vía `getCuadrillaToken(authClient)` → `exchange-jwt`) apuntando a Obras. **Estrategia de
mínimo diff, no reescritura completa:** en vez de tocar cada `fetch(...)`, se re-apunta
`SB_URL = AUTH_URL` y `CUADRILLA_PUBLISHABLE_KEY` → `AUTH_KEY` en la config de cada archivo, y
`cuadrillaToken` pasa a asignarse directo desde `session.access_token` (la sesión que cada archivo
ya obtiene de `authClient.auth.getSession()` en su propio `init()`) en vez de llamar a la función
puente. El resto del código (todas las llamadas `sbGet`/`sbPost`/etc.) no se toca.

**Fase 6 — COMPLETADA 14/08/2026.** Los 11 archivos (10 consumidores + `auth-bridge.js`) quedaron
migrados con el patrón de mínimo diff. Verificado con grep global: cero referencias a
`CUADRILLA_URL`/`CUADRILLA_PUBLISHABLE_KEY`/`getCuadrillaToken`/`getCuadrillaHeaders`/
`getCuadrillaClient`/`exchange-jwt`/`voowjwzlkhdknpapkhxc` en ningún `.html`/`.js` del repo.
`comercial/index.html` se tocó con confirmación explícita de Agustín (regla 11). `auth-bridge.js`
quedó solo con la lógica de sesión expirada — se borró todo el bloque de intercambio de token.

Detalle por archivo (todos con el mismo patrón: `SB_URL`/`CUADRILLA_URL`/`SUPA_URL`/`OBRAS_URL`
pasan a ser alias de `AUTH_URL`, `CUADRILLA_PUBLISHABLE_KEY` pasa a ser `AUTH_KEY`, y
`cuadrillaToken` se asigna directo desde `session.access_token` en vez de llamar a la función
puente):
- `icc.html`, `contable.html`, `cuadrilla/index.html`: sin sorpresas, patrón directo.
- `obras/facturas.html`: hubo que reordenar la declaración de `AUTH_URL` antes de `SB_URL` (el
  alias necesitaba que existiera primero). También se actualizó `ANALYZE_IMAGE_URL` para apuntar
  al proyecto consolidado.
- `gerencial/index.html`, `galeria/index.html`, `comercial/index.html`: usan `CUADRILLA_URL`/
  `OBRAS_URL` directamente (sin alias local), se reemplazó por `AUTH_URL`/`AUTH_KEY` en el punto de
  uso.
- `liquidacion/index.html`: el token se asignaba dentro de una cadena de promesas donde `session`
  ya no estaba en scope — se resolvió pidiendo la sesión de nuevo en ese punto (barato, sin riesgo).
- `obras/index.html`, `cuadrilla/index.html`, `liquidacion/index.html`: verificado que solo tocan
  vistas de `public` (`cuadrilla_jornadas`, `cuadrilla_tecnicos`, `cuadrilla_tarifas`, todas creadas
  junto con las 10 vistas migradas en Fase 2) — **no** tocan las tablas crudas de `cuadrilla.*`, así
  que no necesitan el header `Accept-Profile: cuadrilla`.
- `index.html`: no tenía `SB_URL` propio, usaba `getCuadrillaHeaders(client)` directo de
  `auth-bridge.js` en dos puntos (`cuadrillaGet` y `marcarRevisado`) — reescritos para pedir la
  sesión de `client` (el cliente de Comercial que ya tenía) y armar los headers a mano.

**Pendiente manual — Agustín tiene que hacerlo:** borrar la Edge Function `exchange-jwt` de Obras.
No hay herramienta MCP para borrar Edge Functions, y aunque la hubiera, un `DELETE` así se hace
después de confirmar en el navegador real que el front-end funciona (Fase 7), no antes. Hoy nada
la llama (grep global lo confirma), así que borrarla es seguro una vez verificado.

**Verificación estática de los 11 archivos (14/08/2026):** los bloques `<script>` de los 10 HTML
más `auth-bridge.js` pasan `node --check` sin errores — sintaxis JS válida en los 11. Esto **no**
reemplaza la prueba en navegador real (Fase 7): confirma que no hay errores de sintaxis, no que la
lógica funcione con sesión real.

**Fase 7 — pendiente, requiere a Agustín.** Esta sesión no tenía `claude-in-chrome` ni ninguna
herramienta de automatización de navegador conectada, y aunque la tuviera no debería loguearse con
contraseñas reales. Checklist concreta para probar en el portal real, por rol (al menos un módulo
por rol, siguiendo la tabla de roles de la sección de contexto original):

- **admin** (`a.davila@`/`adolfo.davila@`): abrir `obras/index.html` y `cuadrilla/index.html` —
  confirmar que cargan obras/tarifas/jornadas sin el error "Sin configuración Supabase" ni 401/403
  en la consola del navegador.
- **supervisor** (`e.blanc@`): `cuadrilla/index.html` — cargar/editar una jornada.
- **comercial** (`l.canete@`/`m.wiersma@`/`m.neris@`): `comercial/index.html` (¡el que más cuidado
  requiere!) — confirmar que carga inventario y que el flujo de presupuesto sigue andando;
  `gerencial/index.html` si aplica su acceso.
- **contable** (`contable@`): `contable.html` y `gerencial/index.html` — confirmar que carga
  categorías de egresos, cheques, planes de pago.
- **programacion** (`obras@`): `icc.html` si aplica, o el módulo que corresponda a ese rol.
- **En todos los casos**: abrir la consola del navegador (F12) y confirmar que no aparece ningún
  error de red a `voowjwzlkhdknpapkhxc.supabase.co` (si aparece, algo quedó sin migrar) ni ningún
  `401`/`403` inesperado contra `vvwnyszcfindtuvojqgs.supabase.co`.

**Fase 6 — DEPLOYADA Y VERIFICADA EN PRODUCCIÓN, 14/08/2026 21:46-21:52 UTC.** Commit `ca00834`
pusheado a `main` (autorizado por Agustín), Cloudflare Pages lo desplegó solo. Verificación en
`https://portalnovadomus.pages.dev` leyendo el archivo servido (con cache-buster, no el commit):
las 11 rutas devuelven contenido sin ninguna referencia a `voowjwzlkhdknpapkhxc`. Con sesión real
de Agustín (admin), `/cuadrilla/` confirmado pegándole solo a Comercial (`performance
.getEntriesByType('resource')`), consultando `cuadrilla_tecnicos`/`cuadrilla_tarifas` con el
filtro de vigencia correcto.

**Cuatro fixes adicionales, encontrados en la verificación en vivo del 14/08 (mismo commit
`ca00834`):**
1. `gerencial/index.html` (`sbObras`/`sbObrasPatch`): ya no caen a la anon key ni mandan un token
   nulo — si no hay `cuadrillaToken` o el server devuelve 401, llaman a `manejarSesionExpirada()`
   (de `auth-bridge.js`) y tiran. Se agregó el modal `#modal-sesion` (CSS + HTML) a este archivo,
   que no lo tenía.
2. `gerencial/index.html` (`sbAuth`): mismo criterio, se sacó el fallback `|| AUTH_KEY`.
3. `galeria/index.html` (`fetchJson`): mismo patrón en las dos ramas (Obras y Comercial). Se
   agregó el mismo modal. No se portó el backup de carrito de `comercial/index.html` a propósito
   (galeria tiene un `File` seleccionado no serializable).
4. `comercial/index.html:1593`: `addDays(30)` → `addDays(15)` en `guardarPresupuesto()` — el
   front mandaba `fecha_vencimiento` explícito en el INSERT, así que el default de columna
   corregido en la base (`current_date + '15 days'`) quedaba inerte para presupuestos nuevos. Los
   97 presupuestos existentes quedan a 30 días — decisión de Agustín, ya documentada en el
   `COMMENT` de la columna.

**Cerrado sin cambios:** el repo `novadomus-presupuestos` (documento público de presupuesto,
GitHub Pages, fuera de este repo) apunta a `vvwnyszcfindtuvojqgs` (Comercial) — siempre fue su
proyecto, la consolidación no lo afecta.

**Pendiente, no soy quien lo puede cerrar:**
- El modal de sesión expirada en `gerencial/index.html`/`galeria/index.html` no se puede probar
  con una sesión válida (los dos caminos se ven idénticos hasta que la sesión caduca de verdad).
  Verificado por lectura de código; falta la prueba visual real, en una ventana que no le corte
  el trabajo a nadie.
- **Storage — RESUELTO 14/08/2026 (123 de 126 objetos).** Los 2 buckets públicos (`galeria`: 5
  objetos, `productos`: 118 objetos) se descargaron completos vía la API pública de Storage
  (`.../storage/v1/object/public/{bucket}/{path}`) a
  `C:\Users\agust\novadomus-paneles-backups\storage_20260814\` (34 MB), **verificado por tamaño
  contra `storage.objects.metadata`, 123/123 coinciden** — no es solo "se descargó", se comparó.
  Manifiesto de origen en `storage_manifest_20260814.json` en la misma carpeta.
  **Quedan 3 objetos sin backup**: el bucket `planos-instalacion` (privado, 3 archivos HTML chicos
  de planos de instalación, ~91 KB en total) exige sesión real de `admin`/`supervisor`/
  `programacion` vía RLS — no descargable sin credenciales de usuario. Bajo impacto (3 archivos
  chicos, no son fotos irreemplazables), pendiente de que alguien con sesión los baje a mano desde
  el dashboard si se quiere backup 100% completo antes de la Fase 8. `mapas-instalacion` está
  vacío (0 objetos), no aplica.

**Recién después de resolver Storage:**
1. Borrar la Edge Function `exchange-jwt` de Obras (dashboard, manual).
2. Fase 8: definir con Agustín la ventana de corte y cuántos días se deja pausado (no borrado) el
   proyecto Obras como red de salida.
u Obras.

---

## 1. Lo que ya se investigó y no hay que repetir

Las dos preguntas que definían el tamaño del proyecto (sección 9 del kickoff original) ya se
respondieron, verificado contra las bases el 14/08/2026:

### 1.1 Las 110 políticas de Obras (`public`+`cuadrilla`) — hallazgo clave

**Las 110, sin una sola excepción, usan el mismo patrón textual:**
```sql
(( select auth.jwt() ) ->> 'app_role'::text)
```
Cero usan `current_app_role()`. Cero usan otra cosa. Ningún cuerpo de función (de las ~199 propias
de Obras) referencia `app_role` — el claim se usa solo en políticas RLS, en ningún trigger ni
función.

`current_app_role()` (la función que ya usa Comercial) es:
```sql
create or replace function public.current_app_role()
 returns text language sql stable security definer set search_path to 'public'
as $function$ select role from public.user_profiles where id = auth.uid() $function$
```
Mismo tipo de valor devuelto (`admin`/`supervisor`/`comercial`/`contable`/`programacion`).

**Conclusión: la reescritura de las 110 políticas es una sustitución de texto mecánica** —
tomar cada fila de `pg_policies`, reemplazar el fragmento del claim por `public.current_app_role()`,
regenerar `DROP POLICY` + `CREATE POLICY`. No es 110 decisiones de negocio, es un script de una
sola pasada. Esto tira abajo el riesgo que el kickoff original marcaba como "el trabajo de base
más grande de toda la migración".

*(Nota menor: el kickoff original decía "111 políticas". El número real en `public`+`cuadrilla` es
110; hay 2 políticas internas de `pg_cron` en el schema `cron` que no son parte del sistema de
roles de la app. Diferencia irrelevante, no cambia nada del plan.)*

### 1.2 Procedimiento oficial de migración (Supabase `search_docs`, verificado hoy)

- Camino soportado: `supabase db dump` (roles-only, luego schema, luego data con `--use-copy
  --data-only`, excluyendo `storage.buckets_vectors`/`storage.vector_indexes`), y restauración con
  `psql --single-transaction --variable ON_ERROR_STOP=1`, con `session_replication_role = replica`
  durante la carga de datos para no disparar triggers dos veces.
- **Auth**: `auth.users` migra completo, con hashes, vía el dump. **Pero si el proyecto destino
  usa un JWT secret distinto, los tokens existentes mueren y todo el mundo se re-loguea.** Si se
  reutiliza el JWT secret original, los tokens siguen valiendo, pero eso **regenera las claves
  `anon`/`service_role`** del destino — de todos modos disruptivo. Esto no aplica a la Opción A:
  Comercial ya tiene los 8 usuarios y no se toca su auth.
- **Storage**: las filas de `storage.objects` (metadata) sí viajan en el dump de datos, pero **los
  archivos reales no** — hace falta un script Node.js aparte, objeto por objeto. Tampoco aplica a
  la Opción A: Comercial ya tiene los 4 buckets / 126 objetos y no se tocan.
- Si `auth`/`storage` tienen triggers o RLS custom, el dump no los reproduce — hay que restaurarlos
  aparte con `supabase db diff --linked --schema auth,storage`. No aplica: nuestras 110 políticas
  viven en `public`/`cuadrilla`, no en `auth`/`storage`.
- `supabase_vault`: el backup nunca incluye la root key. **Verificado: `vault.secrets` en Obras
  está vacío** — no hay ninguna root key que copiar.

### 1.3 Detalles técnicos ya verificados, listos para el plan

| Ítem | Hallazgo |
|---|---|
| `btree_gist` en Obras | Instalado en schema `public`. Lo usa **una sola constraint**: `cuadrilla.tecnicos_tarifas` → `una_tarifa_vigente_por_tecnico` (`EXCLUDE USING gist (tecnico_id WITH =, daterange(fecha_desde, coalesce(fecha_hasta,'9999-12-31')) WITH &&) DEFERRABLE INITIALLY DEFERRED`). Hay que instalar la extensión en `extensions` en Comercial (no en `public`) **antes** de crear esa constraint. |
| `btree_gist`/`pg_cron` en Comercial | Ninguna de las dos instalada hoy (`installed_version: null`), pero ambas disponibles para instalar. |
| Identidades (`GENERATED ALWAYS AS IDENTITY`) | Solo 2 tablas: `facturas_obra.id` y `tipo_cambio.id`. Únicas donde hay que revisar/ajustar la secuencia después del restore (`setval` al `max(id)`). |
| `pg_cron` job | `rentabilidad-semanal`, `schedule = '0 18 * * 5'`, `command = SELECT public.refresh_all_obra_balances()`, activo. `cron.timezone = GMT` (=UTC) → corre 18:00 UTC = **15:00 hora Argentina**, todos los viernes. Copiar el cron string tal cual preserva el horario real; no reinterpretar "18:00" como hora local. |
| Edge Function `cuadrilla` | Trivial: solo devuelve un health-check HTML estático (`"Nova Domus OK"`). Redeploy directo, sin cambios. |
| Edge Function `analyze-image` | Tiene un hack de auth cross-proyecto: valida la sesión llamando a mano a `https://vvwnyszcfindtuvojqgs.supabase.co/auth/v1/user` (Comercial) con un anon key hardcodeado, porque hoy el login vive en otro proyecto que la función. **Al consolidar, esto se simplifica**: eliminar ese bloque y pasar a `verify_jwt: true` nativo (la función queda en el mismo proyecto que emite el token). Hay que reconfigurar el secret `ANTHROPIC_API_KEY` en el destino. |
| Edge Function `exchange-jwt` | Se elimina, pero **al final**, recién cuando el front ya no la llame (ver Fase 6) — borrarla antes rompe el puente en producción. |
| Front-end afectado | **11 archivos de código** (no docs), **51 referencias** a `CUADRILLA_URL` / `cuadrillaToken` / `exchange-jwt` / `CUADRILLA_PUBLISHABLE_KEY`: `auth-bridge.js` (13), `gerencial/index.html` (6), `contable.html`, `galeria/index.html`, `cuadrilla/index.html`, `obras/index.html`, `liquidacion/index.html`, `obras/facturas.html` (4 c/u), `comercial/index.html`, `icc.html` (3 c/u), `index.html` (2). `auth-bridge.js` concentra un tercio — candidato natural para centralizar el cambio. |
| Org / proyectos | Org única: `admin@nova-domus.com.ar's Org` (`gadsfdppmfrywlmwshea`). 2 proyectos activos: `obras-novadomus` (`voowjwzlkhdknpapkhxc`, sa-east-1) y el de Comercial (`vvwnyszcfindtuvojqgs`, us-west-2). Plan Free en ambos → tope de 2 proyectos activos, sin margen para un tercero de prueba sin pausar uno o pagar Pro. |
| Tooling local (máquina de Agustín) | Sin `pg_dump`/`psql`/`docker`/CLI de Supabase instalados. Sí hay `node`/`npm` (se puede correr el CLI de Supabase vía `npx supabase` sin instalación permanente), `winget` y `choco` disponibles. |

---

## 2. El plan completo aprobado (sin cambios respecto de la sesión anterior)

Guardado también en `C:\Users\agust\.claude\plans\kickoff-consolidaci-n-reflective-tide.md` (puede
haberse limpiado entre sesiones de plan mode — este documento es la copia durable).

### Fase 0 — Backup verificado (prerrequisito absoluto, bloqueante) — **COMPLETADA 14/08/2026**

Decisión de Agustín: hacer un `pg_dump` manual de los dos proyectos y restaurarlo en un entorno de
prueba para verificar que sirve, en vez de pasar a Pro. Se instaló WSL2 + Docker Desktop (sin
necesidad de reiniciar la PC), se corrió `pg_dump -Fc` de los dos proyectos vía un contenedor
`postgres:17` (conectando por el *session pooler* — la conexión directa es IPv6-only y no sirve
desde esta red/Docker; el host correcto resultó ser `aws-1-<región>.pooler.supabase.com` para los
dos proyectos, no `aws-0`), se restauraron en un Postgres local descartable, y los conteos de
filas de las tablas clave coincidieron exactamente con los valores conocidos. Contenedor de
verificación ya eliminado.

**Dumps verificados en `C:\Users\agust\novadomus-paneles-backups\` (`comercial_20260814.dump`,
`obras_20260814.dump`) — fuera del repo git a propósito, porque el de Comercial incluye
`auth.users` con hashes de contraseña. No commitear, no compartir.**

Reusar para la Fase 2: el mismo patrón de conexión (`aws-1-us-west-2.pooler.supabase.com` para
Comercial, `aws-1-sa-east-1.pooler.supabase.com` para Obras, puerto 5432, usuario
`postgres.<project-ref>`, password vía `$env:PGPASSWORD`) sirve para el `supabase db dump`/`psql`
real de la migración.

### Fase 1 — Preparar el destino (Comercial), solo DDL de soporte

1. Instalar `pg_cron`.
2. Instalar `btree_gist` **en el schema `extensions`** (no en `public`).
3. Crear el schema `cuadrilla`.

### Fase 2 — Dump y restore de Obras → Comercial

`supabase db dump` (roles/schema/data) + `psql --single-transaction` con
`session_replication_role = replica` durante la carga. Alcance: 26 tablas de `public` + 5 de
`cuadrilla` + 8 enums + ~199 funciones propias + 10 vistas (`security_invoker`) + los `COMMENT`
existentes (preservarlos). Orden: extensiones → tipos/enums → tablas → datos (triggers
desactivados) → constraints (incluida la exclusion constraint de `tecnicos_tarifas`) → políticas
(ver Fase 3, no las crudas del dump) → vistas → funciones. **No migrar** `auth.*` ni `storage.*`.

### Fase 3 — Reescribir las 110 políticas

Generar el DDL desde `pg_policies` de Obras, reemplazar el fragmento del claim JWT por
`public.current_app_role()`, aplicar como `DROP POLICY` + `CREATE POLICY` vía `apply_migration`.
Verificar con `begin; set local role authenticated; set local request.jwt.claims = '...';
rollback;` para cada uno de los 5 roles contra una muestra de tablas de cada módulo.

### Fase 4 — pg_cron

Recrear `rentabilidad-semanal` con el mismo cron string y comando. Confirmar que `cron.timezone`
en Comercial también quede en `GMT` tras instalar la extensión (verificar, no asumir).

### Fase 5 — Edge Functions

`cuadrilla` redeploy tal cual. `analyze-image` redeploy simplificando el auth cross-proyecto a
`verify_jwt: true` nativo + reconfigurar `ANTHROPIC_API_KEY`. `exchange-jwt` se borra al final,
después de la Fase 6.

### Fase 6 — Front-end (11 archivos, ~51 referencias)

Reemplazar `CUADRILLA_URL`/`cuadrillaToken`/`CUADRILLA_PUBLISHABLE_KEY` por el cliente único de
Comercial en los 11 archivos listados en la tabla de la sección 1.3. **Avisar antes de tocar
`comercial/index.html`** (ya hubo dos agentes editándolo en paralelo).

### Fase 7 — Verificación por rol

Para cada uno de los 5 roles, confirmar en el portal real (no solo por SQL) qué ve y qué no ve,
en al menos un módulo por rol.

### Fase 8 — Cutover y rollback

Ventana fuera de lunes-viernes. No borrar el proyecto Obras durante la validación — dejarlo
pausado como red de salida. Definir con Agustín cuántos días se mantiene antes del borrado
definitivo.

## Fuera de alcance (confirmado innecesario para Opción A)

- Migración de `auth.users`/`auth.identities` — se quedan en Comercial.
- Migración de Storage (buckets/objetos) — se quedan en Comercial.
- Vault root key — `vault.secrets` en Obras está vacío.

## Verificación end-to-end

- Contar políticas post-migración y confirmar 110, todas con `current_app_role()`, cero con
  `app_role`.
- Repetir la auditoría de grants por default en Comercial después del restore (un
  `pg_dump`/`pg_restore` puede reintroducir los grants por default del schema).
- `get_advisors` (security + performance) sobre Comercial al final de cada fase de DDL.
- Probar el cron job manualmente antes de esperar al viernes.
- Smoke test del portal completo por los 5 roles, con `claude-in-chrome` donde sea posible sin
  ingresar contraseñas.

---

## 3. Reglas de trabajo que siguen aplicando (del kickoff original, sin cambios)

1. Ningún handoff se toma como dado — verificar contra la base o el sitio antes de actuar.
2. El MCP se conecta como `postgres` con `rolbypassrls = true`. Probar con
   `begin; set local role …; set local request.jwt.claims = '…'; rollback;`.
3. Grant y política son capas independientes — verificar con `role_table_grants`,
   `column_privileges` y `pg_policies`.
4. `ALTER DEFAULT PRIVILEGES` junto con cada `revoke` masivo — verificar de nuevo en el destino
   después de la migración.
5. Verificar los dos lados: que el rol autorizado pueda y que el no autorizado no pueda.
6. Nada de `DELETE`/`DROP` sin `SELECT` previo y confirmación de Agustín.
7. Documentar en la base (`COMMENT`), no solo en `.md` — preservarlos en la migración.
8. Si algo rompería un flujo del equipo, parar y reportar antes de aplicar.
9. Al cambiar el comportamiento de una tabla que el front escribe, elegir el diseño que no pueda
   romper el front.
10. Verificar el deploy leyendo el archivo servido, no el reporte del commit.
11. Avisar antes de tocar `comercial/index.html`.

## 4. Primer turno sugerido al retomar

1. Confirmar `wsl --status` y seguir con la instalación de Docker Desktop.
2. Completar la Fase 0 (dump + restore de verificación en el Postgres local descartable).
3. Recién después, entrar a la Fase 1 sobre Comercial.

Si algo de este documento no coincide con la base, gana la base.
