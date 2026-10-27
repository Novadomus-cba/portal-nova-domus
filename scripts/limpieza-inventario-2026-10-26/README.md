# Limpieza de `inventario` — 26/10/2026

Kickoff "Búsqueda de inventario + Instrucciones + Limpieza urgente" (vivienda Gonzalo). Proyecto
Supabase `vvwnyszcfindtuvojqgs`. Esquema aprobado por Agustín: dry-run → CSV → se aplican **solo los
casos seguros** → los ambiguos los decide él. Nunca DELETE.

`inventario` no tiene columnas `fuente` ni `fecha_actualizacion` (solo `updated_at`): el registro de
esta limpieza son estos archivos.

## Antes / después (activos: 4.602)

| Corrección | Antes | Aplicado | Después |
|---|---|---|---|
| `sku_mo` NULL | 2.763 | 204 + 54 racks (26/10) · 87 discos, ronda 1: 1.795, ronda 2: 623 (27/10) | **0** |
| `grupo` NULL | 332 | 74 (26/10) · 258 (27/10) | **0** |
| `margen_fijo` NULL | 1.060 | 1.019 (copia de `remarque`) | 41 (sin `remarque` tampoco) |
| `margen_fijo` ≠ `remarque` | 29 | 29 (27/10; gobierna `remarque`) | **0** |
| Proveedor `Sin asignar`/NULL | 993 | 799 por marca (27/10) | 194, a propósito: marcas sin distribuidor conocido |
| Duplicados de SKU | — | 0 | — |

Los ambiguos se decidieron con Agustín por bloques el 27/10. Lo que nombra proveedores o márgenes
(pasos 8 y 9) vive solo en el repo privado.

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

| Archivo | Dónde | Qué es |
|---|---|---|
| `01`–`07` (CSV) | privado | aplicables y ambiguos por corrección, con `decision_agustin` completada |
| `13_sku_mo_ronda1_aplicados.csv` / `14_sku_mo_ronda2_aplicados.csv` | privado | detalle fila por fila de las rondas de `sku_mo` |
| `15_proveedor_*` / `16_margen_*` | privado | pasos 8 y 9: SQL, rollback e ids (nombran proveedores y márgenes) |
| `08`, `09`, `12`, `13`, `14` (`*_ids.txt`) | acá | ids tocados por cada paso |
| `10_aplicar.sql` | acá | lo que se ejecutó (pasos 1–7 y 10; 8 y 9 solo referenciados) |
| `11_rollback.sql` | acá | deshace `10_aplicar.sql` |
