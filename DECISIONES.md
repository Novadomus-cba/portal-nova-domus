# DECISIONES.md — Nova Domus

**Qué es este archivo:** las decisiones tomadas y las reglas que no caducan. Se lee entero al
empezar cualquier sesión de trabajo sobre la base o el portal.

**Qué NO es:** un reporte de estado. Acá no va ni un conteo de filas, ni "la Fase X está
deployada", ni "el working tree está sucio". Todo eso se consulta con `scripts/estado.sql` y con
`git status`, que tardan segundos y nunca mienten. **Un estado escrito en un .md es un estado
viejo.**

**Autoridad:** este archivo vive en el repo y se versiona con git. Si contradice a un documento
que llegó por chat, gana este. Si contradice a la base o al repo, **gana la base o el repo** —
y entonces este archivo se corrige en el mismo commit.

Última actualización: 14/08/2026

---

## 1. Reglas de método

Estas costaron errores reales. Están primero a propósito.

1. **Reverificar antes de concluir**, no solo antes de actuar. Con dos agentes en paralelo un
   snapshot caduca en minutos.
2. **Nunca una instrucción destructiva sobre un archivo del repo sin haber leído su contenido.**
   Quien no ve el filesystem pide el archivo antes de mandar borrarlo. Si una instrucción llega
   basada en un estado del repo que no coincide con lo que se ve, **parar y pedir confirmación** —
   no ejecutar. Esto pasó cuatro veces el 14/08 y las cuatro veces parar fue lo correcto.
3. **Un solo agente escribe en la base durante una ventana de migración; el otro solo lee.**
4. **Grant y política son capas independientes.** Verificar con `role_table_grants`,
   `column_privileges` y `pg_policies`.
5. **`REVOKE` de tabla no borra grants de columna** (`pg_attribute.attacl`). Y una columna nueva
   **no** queda cubierta si la tabla tiene ACLs de columna.
6. **`ALTER DEFAULT PRIVILEGES` con cada `revoke` masivo.** Aguantó el `pg_restore` de la
   consolidación, que era el riesgo principal.
7. **Los triggers no chequean `EXECUTE` al dispararse**, solo al crearse. Se puede revocar el
   `EXECUTE` de una función de trigger sin romper nada — probándolo antes en una transacción
   descartada.
8. **El MCP entra como `postgres` con `rolbypassrls`.** Para probar como otro rol:
   `begin; set local role …; set local request.jwt.claims = '…'; rollback;`. Se puede cambiar el
   claim varias veces en la misma transacción sin cambiar de rol.
9. **Contar 0 filas no prueba que una política funcione si la tabla está vacía.**
10. **Todo `SECURITY DEFINER` va con su `REVOKE EXECUTE FROM PUBLIC, anon`** y su `set search_path`.
11. **Nada de `DELETE`/`DROP` sin `SELECT` previo** y confirmación. Sin backups automáticos nada es
    reversible. Si hay que borrar, **guardar el contenido exacto en el comentario de la migración**.
12. **Lotes de ≤50 filas** en UPDATE masivos, con verificación de conteo entre lotes.
13. **Si algo rompería un flujo del equipo, parar y reportar antes de aplicar.**
14. **Al cambiar el comportamiento de una tabla que el front escribe, elegir el diseño que no pueda
    romperlo.** Ejemplo real: para dedupear `tipo_cambio` se usó `AFTER INSERT` que borra las
    anteriores, y no `BEFORE INSERT` devolviendo `NULL`, porque eso le habría devuelto un array
    vacío a PostgREST y el front podía tomarlo como error.
15. **Documentar en la base**, no solo en `.md`: los `COMMENT` viajan dentro del dump. Los hechos
    por tabla o por columna van a un `COMMENT`, no a un párrafo de un documento.
16. **Verificar el deploy leyendo el archivo servido**, con `fetch('/ruta?v='+Date.now())` y
    grepeando por **booleanos, no texto**. La extensión de Chrome bloquea objetos cuyo contenido
    *o nombre de clave* parezca una credencial (`bearer`, `auth`, query strings): usar etiquetas
    neutras y redactar tokens largos antes de devolver.
17. **Para verificar a qué host pega una página, usar `performance.getEntriesByType('resource')`**,
    no el tracker de red de la extensión.
18. **Grepear `auth-bridge.js` además del módulo.** Lo cargan 9 módulos y ahí viven las URLs y la
    publishable key.
19. **Avisar antes de tocar `comercial/index.html`.**
20. **Buscar procedimientos de plataforma en `search_docs` del MCP**, no de memoria. Corrigió dos
    errores reales: `supabase db dump` vs `pg_dump` directo, y el método de bajada de Storage.
21. **Código en inglés** (variables, funciones, comentarios). Español solo para UI visible al usuario.

---

## 2. Precios y márgenes

> Duplicado a propósito con la skill `nova-domus-maestra` para que este archivo sea autosuficiente.
> Si divergen, **la skill es la fuente** para reglas comerciales y hay que corregir acá.

### Directiva fundamental
El IVA fluye entre débitos y créditos fiscales. **Todos los márgenes y comisiones se calculan
sobre valores SIN IVA.** El IVA solo aparece en el precio final al cliente.

### Costo
```
costo_base = precio_sin_iva (USD)
costo_ars  = precio_sin_iva × 1.21 × TC        ← siempre sobre el valor con IVA, nunca sobre el pelado
```

`precio_sin_iva` **es el costo y no se toca**, salvo lista nueva del proveedor.

### Precio sugerido
Si existe `precio_sugerido_manual` (ya en ARS **con IVA**):
```
precio_sugerido_usd = precio_sugerido_manual / TC      ← NO dividir por 1.21
```

Si no existe:
```
precio_sugerido_con_iva = precio_sin_iva × (1 + remarque) × 1.21
```

**`remarque`:**
- Con precio de referencia oficial (web del fabricante):
  `remarque = (pvp_web_ars / (precio_sin_iva × 1.21 × TC)) − 1`
- Sin referencia: **`remarque = 0.35`** por defecto (incluye Yale) → margen sobre venta ~25,93%
- `remarque` es mark-up, no multiplicador: `precio = costo × (1 + remarque)` ✓

### B2C
```
precio_final_con_iva = precio_sugerido_con_iva × 0.95      (5% OFF siempre)
```

### B2B
Objetivo 25% de descuento sobre el sugerido con IVA, con el margen calculado **sobre `costo_ars`**
(nunca sobre el `precio_sin_iva` pelado) y acotado entre 20% y 30%:

- Si el 25% deja el margen en rango → aplicar 25%
- Si supera el 30% → ajustar para no pasar del 30%
- Si cae debajo del 20% → **no caer al precio B2C**; aplicar el piso exacto de 20%:
  `precio_final_con_iva = precio_sin_iva × 1.20 × 1.21`

**El aviso de margen ajustado es información interna/comercial.** Nunca aparece en documentos del
cliente: ahí va solo el precio final y el % de descuento aplicado.

### Dos métricas, no una
```
margen_sobre_venta  = (PVP_ars − costo_ars) / PVP_ars      ← para comisiones
markup_sobre_costo  = (PVP_ars / costo_ars) − 1            ← para descuentos
```

### Comisión
```
comision = margen_bruto_usd_sin_iva × 0.30
```
Nunca aplica sobre mano de obra, solo sobre dispositivos. Nunca aparece en el documento del
cliente ni en texto de WhatsApp.

### Proyectos de instalación
Materiales y mano de obra **siempre por separado**, nunca precio cerrado único.
MO presupuestada = materiales × 30%. Margen neto efectivo objetivo: 25–30% sobre el costo total.

### Excepción HAVEN (Grupo Calypso)
**Margen fijo del 27% sobre `costo_ars`**, solo para este proyecto:
```
precio_final_con_iva = costo_ars × 1.27
```
Reemplaza por completo las reglas B2B de 20/25/30%.

### Prerrogativa de Agustín
Puede fijar precios custom. Se calcula el margen resultante, se avisa si queda bajo el mínimo y se
registra como director-aprobado.

---

## 3. Ciclos de estado

**Proyectos:**
```
ENTREGADO → ACEPTADO / MODIFICACION_SOLICITADA → EN_OBRA → OBRA_ENTREGADA → FACTURADO
          → CERRADO / CANCELADO
```
`ENTREGADO` es el default de un proyecto nuevo: presupuesto entregado, esperando respuesta.

**Presupuestos comerciales:**
```
BORRADOR → ENVIADO → ACEPTADO → PAGADO → (copia a ventas)
                   ↘ RECHAZADO
                   ↘ VENCIDO
```

**Vencimiento: 15 días.** El default de la columna y el front ya coinciden en 15 días
(`comercial/index.html:1593`, `addDays(15)`, commit `ca00834` del 14/08/2026). No tocar la leyenda
de "15 días" del documento público, que ya es correcta.

Los 97 presupuestos ya emitidos **quedan a 30 días y no se backfillean**: 26 pasarían de vigentes a
vencidos y el cliente tiene una fecha impresa. El vencimiento funciona como recurso comercial de
urgencia, no como corte real.

---

## 4. Base de datos y portal

| Tema | Decisión |
|---|---|
| **Un solo proyecto Supabase** | `vvwnyszcfindtuvojqgs`. La consolidación Obras → Comercial (Opción A) se ejecutó el 14/08/2026. `voowjwzlkhdknpapkhxc` queda como **rollback, solo lectura, no se borra** |
| **Rollback del proyecto viejo** | Es de **solo lectura**. La migración `20260814223240_mitigacion_corte_revocar_escritura_authenticated` (14/08 22:32 UTC) dejó a `authenticated` con solo `SELECT` en `voowjwzlkhdknpapkhxc` (36 objetos `public` + 6 `cuadrilla`, tablas y vistas). Cierra la vía de escritura de una pestaña con código pre-deploy: aunque consiga token por `exchange-jwt`, cualquier `INSERT`/`UPDATE`/`DELETE` muere en `permission denied`. **Consecuencia: el rollback ya no es de un paso** — para volver a apuntar el front a Obras hay que revertir esa migración primero |
| **Plan Free** | Se queda. Un dump manual tomado minutos antes de un corte es mejor que un backup diario con hasta 24 h de atraso. Se acepta perder log de 7 días, protección de contraseñas filtradas y la red de seguridad de un daño silencioso descubierto días después |
| **Método de backup** | `supabase db dump` en 3 archivos (`--role-only`, schema, `--use-copy --data-only`). **No `pg_dump` directo**: incluye internos de Supabase y falla al restaurar. Requiere Docker |
| **Backup de Storage** | El dump captura `storage.objects` (metadata) pero **no los binarios**. Se bajan aparte. `supabase storage cp` y `functions delete` requieren un **personal access token de cuenta** (no de proyecto): para volúmenes chicos conviene el dashboard antes que crear un PAT |
| **Resolución de rol** | `current_app_role()`, que lee `user_profiles` por `auth.uid()`. **Ya no existe el claim `app_role` del JWT** |
| **Vistas públicas** | `SECURITY DEFINER` a propósito: es el mecanismo que permite cerrar las tablas base. Los `ERROR` del linter sobre `v_presupuesto_publico`, `v_presupuesto_items_publico` y `vidriera_publica` son **falsos positivos conocidos** |
| **INSERT de `anon` en presupuestos** | Abiertos. Riesgo aceptado: escritura de basura, no fuga |
| **Clave `anon`** | No se rota: está diseñada para ser pública |
| **`tipo_cambio`** | No es histórico — el histórico vive a nivel documento. Una sola fila, dedupe por trigger `AFTER INSERT`, `fuente` default `bluelytics`. `supervisor` puede escribirlo: es un dato de mercado, no una decisión de negocio |
| **El dólar `blue`** | Desactivado, no borrado. Nada lo consume: el inventario es todo `USD OFICIAL` |
| **`clientes` y `canales`** | Los revendedores **no** son clientes: van a `canales`, y `canal_id` cuelga del **proyecto**, no del cliente (el canal es por operación). Los estudios (Fanesi-Navarro, JAD) **sí** son clientes: gestionan los pagos. **Sin tabla `contactos`** |
| **Lectura de `clientes`** | `admin`, `contable`, `comercial`, `supervisor` y **`programacion`** (decisión explícita, aun siendo cuenta compartida). Escritura: `admin` y `comercial` |
| **`inventario`** | Escritura solo `admin` |
| **Horas de mano de obra** | Opcionales. Las estima el área técnica informalmente y las carga el comercial. El área técnica no tiene ni tendrá acceso al portal comercial |
| **Borrado de certificados/recibos** | Solo en `BORRADOR` y `ENVIADO`. En `PAGADO` se anula |
| **Gerencial** | Delia (`contable`) debe verlo. Va a reescribirse por completo |
| **Inventario y presupuestos** | 100% Supabase (`inventario`, `proyectos`, `proyectos_items`, `cotizaciones`). No se usa INVENTARIO.xlsx de Drive ni se generan Excel como entregable de presupuesto |

---

## 5. Datos legacy — no se backfillean

Decisión firme, se mantiene salvo instrucción explícita en contrario:

- **394 líneas de `recibos_lineas` con `cantidad = 1`** (valor por defecto). Los totales de
  `monto_pesos` sí son correctos y son los únicos confiables.
- **38 `obras_rubros` sin `tarifario_base_id`**
- **158 `certificados_items` sin rubro**
- **57 líneas de mano de obra sin snapshot**
- **Certificados viejos sin ítems**

---

## 6. Roles y personas

| Rol | Quién |
|---|---|
| `admin` | Agustín (`a.davila@`), Adolfo (`adolfo.davila@`) |
| `supervisor` | Esteban Blanc (`e.blanc@`) — dirección de obra. 3% sobre jornales + almuerzos |
| `comercial` | Lucas Cañete (`l.canete@`), Maxi Wiersma (`m.wiersma@`), Mili Neris (`m.neris@`) |
| `contable` | Delia (`contable@`) |
| `programacion` | cuenta **compartida** `obras@` — Martín + instaladores |

Martín tiene fila en `comerciales` (id 6) **sin `user_id`, a propósito**.

---

## 7. Repos y hosting

- **`Novadomus-cba/portal-nova-domus`** → Cloudflare Pages, `https://portalnovadomus.pages.dev`.
  HTML/CSS/JS vanilla, un archivo por módulo, mobile-first. Fetch con `.text()` + `JSON.parse()`
  (nunca `.json()` directo). Login en `/login`. **Cloudflare sirve `index.html` con 200 para rutas
  inexistentes** (SPA fallback): tenerlo en cuenta al validar rutas.
- **`Novadomuscba/presupuestos`** → GitHub Pages. Solo `index.html`: el link público del
  presupuesto (`?id=X`). **No se puede borrar**: los 97 presupuestos emitidos apuntan ahí.

---

## 8. Contradicciones conocidas, pendientes de corregir

| Dónde | Qué dice | Qué corresponde |
|---|---|---|
| `nova-domus-maestra` SKILL.md línea 199 | `VENCIDO (30 días)` | **15 días.** Las skills `presupuestos-comercial` (l. 59) y `propuestas-interactivas` (l. 212) ya dicen 15. La maestra se consolidó el 24/07, antes de la decisión |
| `proyectos_planos_instalacion` id 1 | URL de Google Drive en `storage_path` | Debería ser una ruta de bucket, o un campo aparte |
| `nova-domus-maestra` §13 item 11 | bucket `mapas-instalacion` huérfano | Confirmado vacío (0 objetos). Se borra a mano desde el dashboard: `storage.protect_delete()` impide hacerlo por SQL |

**Ya resueltas (se sacan de esta lista cuando se confirman, no antes):**
- `comercial/index.html:1593` — `addDays(30)` → `addDays(15)`. Commit `ca00834`, 14/08/2026.
- Grant de `anon` sobre `comerciales` (`SELECT(id, nombre)`) — confirmado resto de antes de
  `v_presupuesto_publico` (el público solo consulta la vista, nunca `/rest/v1/comerciales`
  directo) y revocado el 14/08/2026.

**Pendientes operativos (no bloquean nada, quedan para cuando haya un rato):**
- Las 3 Edge Functions de `voowjwzlkhdknpapkhxc` (`exchange-jwt`, `cuadrilla`, `analyze-image`)
  siguen `ACTIVE` — el borrado no se ejecutó todavía. **Ya no es urgente**: la escritura está
  cerrada por grants (ver fila de "Rollback del proyecto viejo" en §4), verificado con un INSERT
  de prueba que murió en `permission denied`, y `function_edge_logs` no tiene hits nuevos desde
  las 21:22:44 UTC del 14/08. Sigue valiendo la pena borrarlas por la **lectura**: con
  `exchange-jwt` vivo, una pestaña con código pre-deploy puede leer del proyecto huérfano y
  mostrar datos desactualizados sin ningún error visible — sin el puente, ese camino termina en
  el modal de sesión expirada. Fuentes archivadas fuera de Supabase
  (`novadomus-paneles-backups/fase8-ventana-de-corte_20260814/`). Se borran por dashboard cuando
  haya tiempo.
- Aviso pendiente al equipo: Ctrl+Shift+R antes de arrancar el lunes.
