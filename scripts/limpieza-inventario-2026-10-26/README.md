# Limpieza de `inventario` — 26/10/2026

Kickoff "Búsqueda de inventario + Instrucciones + Limpieza urgente" (vivienda Gonzalo). Proyecto
Supabase `vvwnyszcfindtuvojqgs`. Esquema aprobado por Agustín: dry-run → CSV → se aplican **solo los
casos seguros** → los ambiguos los decide él. Nunca DELETE.

`inventario` no tiene columnas `fuente` ni `fecha_actualizacion` (solo `updated_at`): el registro de
esta limpieza son estos archivos.

## Antes / después (activos: 4.602)

| Corrección | Antes | Aplicado | Después | Ambiguos para Agustín |
|---|---|---|---|---|
| `sku_mo` NULL | 2.763 | 204 + 54 racks | 2.505 | `02_sku_mo_ambiguos.csv` (con columna `sugerido`) |
| `grupo` NULL | 332 | 74 | 258 | `04_grupo_ambiguos.csv` |
| `margen_fijo` NULL | 1.060 | 1.019 (copia de `remarque`) | 41 (sin `remarque` tampoco) | — |
| `margen_fijo` ≠ `remarque` | 29 | 0 | 29 | `06_margen_fijo_divergente.csv` |
| Proveedor `Sin asignar`/NULL | 993 | 0 | 993 | `07_proveedor_sin_asignar.csv` (por marca, con propuesta) |
| Duplicados de SKU | — | 0 | — | `05_duplicados_sku.csv` |

## Criterios de lo aplicado

- **`sku_mo` por grupo + nombre**: solo grupos donde el `sku_mo` dominante cubre ≥95% de las filas
  que ya lo tienen (UPS, NVR, DVR, ROUTER, ACCESS POINT, ANTENA/CPE), y además el nombre tiene que
  decir el tipo de equipo y no ser accesorio. Los grupos no son limpios: ACCESS POINT tenía switches
  Aruba y transceivers; UPS tenía baterías, kits de rack, tarjetas SNMP, un software y dos mini UPS
  portátiles de 12 W. Todo eso quedó afuera, en ambiguos.
- **`sku_mo` por fila hermana**: otra fila activa con el mismo SKU normalizado (`inventario_sku_norm`)
  y un único `sku_mo` (ej. murales GLC de Air Computers ← Masnet, SG2210P ← TL-SG2210P).
- **`sku_mo` de racks (paso 4)**: grupo RACK, nombre que empieza con MURAL/RACK, medida en U, sin
  palabras de accesorio.
- **`grupo`**: fila hermana o prefijo de nombre (MURAL/RACK/ACC.RACK → RACK, F.O. → FIBRA OPTICA,
  ^NVR, ^SWITCH, ^ROUTER, ^AP, ^UPS, ^CABLE), solo hacia valores de grupo que ya existen.
- **`margen_fijo`**: copia de `remarque` donde era NULL (regla 12 de `nova-domus-maestra` §13). Los 29
  divergentes no se tocan: no está decidido cuál gobierna.

## Hallazgos

- **No hay duplicados reales del mismo proveedor.** Los 7 grupos que aparecían eran productos
  distintos que la normalización de SKU confundía (`B4-HD2-.3` 0,3 m vs `B4-HD2-3` 3 m; `U-POE` 15 W
  vs `U-POE+` 30 W). Se corrigió `inventario_sku_norm` para conservar `.` y `+` (migración
  `fix_inventario_sku_norm_keep_dot_plus`). Queda un caso de carga: ids 1860/1862, dos cámaras
  `iDS-2CD8A47G0` con lentes distintas (8–32 vs 2,8–12) cuyo SKU difiere solo por `/` contra espacio.
- Los duplicados entre proveedores (Masnet / Air Computers, 18 grupos) son legítimos y no se tocan.
- `DISCOS` tiene 26 filas en `MO-NA` mientras el tarifario tiene `MO-VID-DISCO` (USD 12): no se
  propagó ninguno de los dos; decidir.
- Fotos pendientes entre ítems ya cotizados en `proyectos_items`: Hikvision 7, Shelly 2, TP-Link 2,
  GLC 2, Episode 2, Furukawa 2, Rackmatik 1, Eaton 1, VSSL 1 — para un kickoff de sourcing aparte.

## Archivos

**Los CSV no están en este repo** (es público y tienen costos, `remarque`/`margen_fijo` y proveedores):
viven en el repo privado `Novadomus-cba/nova-domus-skills`, carpeta `datos/limpieza-inventario-2026-10-26/`.
Acá quedan el SQL ejecutado, el rollback y los ids.

| Archivo | Qué es |
|---|---|
| `01_sku_mo_aplicable.csv` | 204 filas aplicadas (antes/después + criterio) |
| `02_sku_mo_ambiguos.csv` | 2.505 sin `sku_mo`, con `sugerido` por patrón de nombre y columna `decision_agustin` |
| `03_grupo_aplicable.csv` | 74 filas aplicadas |
| `04_grupo_ambiguos.csv` | 258 sin grupo |
| `05_duplicados_sku.csv` | duplicados por SKU normalizado, marcando mismo proveedor / entre proveedores |
| `06_margen_fijo_divergente.csv` | 29 con `margen_fijo` ≠ `remarque` |
| `07_proveedor_sin_asignar.csv` | por marca, con propuesta donde la marca tiene proveedor único conocido |
| `08_margen_fijo_copiado_ids.txt` / `09_sku_mo_racks_ids.txt` | ids tocados (rollback) |
| `10_aplicar.sql` | lo que se ejecutó |
| `11_rollback.sql` | deshace todo lo de `10_aplicar.sql` |

Para completar un ambiguo: llenar `decision_agustin` en el CSV y pasárselo a Claude Code.
