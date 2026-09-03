---
name: nova-domus-maestra
description: "Skill maestra de Nova Domus (NDWD SAS, Córdoba, Argentina). Conocimiento institucional, operativo y comercial: empresa, equipo, líneas de negocio, precios y márgenes (B2C/B2B, excepción HAVEN), ciclo de proyecto y de presupuesto, cuadrilla, inventario, selección de dispositivos y stack técnico. Usar SIEMPRE ante cualquier consulta sobre el negocio, presupuestos, márgenes, inventario, cuadrilla, obra, estrategia o gestión. Para identidad de marca (colores, logo, slogan) manda `nova-domus-identidad-marca`; para el estado de la base de datos manda `scripts/estado.sql` del repo, no esta skill."
---

# Nova Domus — Skill Maestra

> **Versión 3.4 — 03/09/2026.** Rebase de los 11 bloques de la sesión PY-2026-030
> ("La Pankana — Ruda Orpianesi", La Calera, 02–03/09/2026) sobre la **3.3**.
>
> **Aviso de rama.** Esos 11 bloques se habían aplicado por error sobre la 2.2, generando
> una rama paralela numerada "2.3 / 2.4" que es **posterior en fecha pero anterior en
> contenido**: perdía la excepción HAVEN, el IVA por ítem, la eliminación del techo B2B, el
> vencimiento a 15 días, la consolidación a un solo proyecto Supabase y el puntero de marca.
> **Esa rama queda descartada.** Si aparece un archivo que dice "Versión 2.3" o "2.4" con
> fecha de septiembre, no es más nuevo que este: es la rama muerta.
>
> Qué trae la 3.4 respecto de la 3.3:
> - **Corrige el piso B2B** (§3.2, §3.5): el piso del 20% es **margen sobre venta**
>   (`costo_ars / 0.80`), no markup sobre costo (`× 1.20`). La 3.3 declaraba lo contrario.
> - **Nuevas §9.1 a §9.9**: topología de relés/dimmers de punto de luz, tiras LED 24V,
>   Sensibo según el cerebro, cableado vs. inalámbrico en seguridad, lectura de planos,
>   kits de sensores, Omada vs. mesh doméstico, Starlink, dependencia real del WiFi.
> - **Nota UPS** en §9 y corrección del estándar de climatización a **Sensibo Air B2B**.
> - **§7.5**: correcciones de datos ya aplicadas en Supabase y verificadas con SELECT.
> - Regla de disponibilidad de proveedor en §6, regla de versión de skill en §0, y los dos
>   teléfonos diferenciados en §1.
>
> La 3.3 era: reescritura completa (v3.0) + auditoría de los 8 Projects (v3.1) + eliminación
> del techo de margen B2B (v3.2) + parche de IVA real y convención de unidades (v3.3).

---

## 0. DÓNDE VIVE LA VERDAD — leer antes que nada

Esta skill guarda **lo que no cambia solo**: reglas de negocio, fórmulas, criterios, ciclos.

**No guarda estado.** Nada de conteos de filas, "el módulo X está deployado", "quedan N ítems
sin clasificar". Ese tipo de dato se pudre en días y ya causó cuatro errores encadenados el
14–18/08/2026.

| Qué necesitás | Dónde está | Nunca acá |
|---|---|---|
| Estado real de la base (tablas, políticas, grants, jobs, divergencia) | `scripts/estado.sql` del repo `portal-nova-domus` — se corre, no se lee | conteos, "está deployado" |
| Decisiones técnicas y reglas de método | `DECISIONES.md` del repo, versionado con git | — |
| Identidad de marca: paleta, logo, tipografía, slogan, tono | skill `nova-domus-identidad-marca` (**tiene prioridad declarada**) | colores, slogan, descriptor |
| Cómo presentar un precio, manejar objeciones | skill `nova-domus-presupuestos-comercial` | — |
| Construir propuestas HTML | skill `nova-domus-propuestas-interactivas` | — |
| Benchmarking y decisiones de inversión comercial | skill `nova-domus-estrategia-comercial` | — |

**Regla anti-duplicación.** Si un dato ya vive en otra skill o en el repo, acá va un puntero, no
una copia. Un dato duplicado vuelve siempre por la copia que nadie corrigió: pasó con el slogan
viejo, con el diagnóstico del Storage y con el `project_id`.

**Regla de deriva de configuración.** Cuando cambia un `project_id`, una URL o una credencial, se
busca la cadena vieja en **todos** los vectores: repo, instrucciones de cada Claude Project,
archivos cargados a cada Project, skills instaladas, memoria de Claude, copias en Drive. El
incidente del 18/08 fueron 6 instancias en 4 sistemas distintos — el repo estaba limpio.

**⚠️ Las skills viven en instalaciones separadas que no se ven entre sí.** La app de Claude
(chat / Cowork) usa las skills del skill store de claude.ai. Claude Code usa las del **repo**,
como plugin. **Editar una no actualiza la otra.**

Caso testigo, y es la causa raíz de un incidente real: la línea 3.0 → 3.3 se construyó en chat el
18/08/2026 y se pegó a mano en el editor de claude.ai, porque `/mnt/skills/` es de solo lectura
desde el contenedor. **Nunca entró al repo.** El 03/09, Claude Code leyó la copia del repo —que
se había quedado en la 2.2 de julio— y construyó una 2.3/2.4 sobre esa base vieja. Dos líneas de
la misma skill evolucionando en paralelo, cada una ciega a la otra.

Reglas que salen de ahí:

1. **El repo es la fuente de verdad; la copia de claude.ai es un espejo.** Después de todo cambio,
   actualizar las dos el mismo día.
2. Antes de editar, verificar qué versión tiene **cada** instalación, no solo la que se está
   mirando.
3. Al comparar dos copias **gana el número de versión mayor, no la fecha más reciente**. Una copia
   de septiembre puede ser anterior en contenido a una de agosto.
4. **"No está en git" no significa "nunca existió".** Es literalmente el modo de falla de la regla
   de deriva de arriba: el 18/08 hubo 6 instancias del dato viejo en 4 sistemas distintos y el
   repo estaba limpio. Antes de declarar que algo no existe, revisar los seis vectores.

---

## 1. LA EMPRESA

**Nova Domus (NDWD SAS)**
- Rubro: integración tecnológica — smart home, redes, seguridad, AV, obra eléctrica
- Sede: Av. Colón 3835, Córdoba, Argentina
- CUIT: 30-71858914-9
- Web: nova-domus.com.ar · E-shop: novadomusdomotica.mitiendanube.com
- Contacto: admin@nova-domus.com.ar
- Teléfonos, **siempre diferenciados**: **351 674-7513** Agustín Davila (administración,
  representación, obras) · **351 864-3455** línea comercial / ventas
- Miembro de **CEDIA** desde 2024 · **Partner certificado Hikvision**
- Distribuidor oficial de **Philips Hue**

> Descriptor de categoría y slogan: ver skill `nova-domus-identidad-marca`. El descriptor
> vigente es **"INTEGRACIÓN TECNOLÓGICA"** y el slogan **"Del cable a la app"**. Las versiones
> viejas ("Domótica", "Habitamos espacios inteligentes") **no se usan más**.

### Equipo interno

| Nombre | Rol portal | Función real |
|--------|-----------|--------------|
| Agustín Davila | `admin` | Dueño y director. Arma los presupuestos de proyecto. Decisiones comerciales y técnicas. |
| Adolfo Davila | `admin` | Co-administrador. |
| Esteban Blanc | `supervisor` | Dirección de obra en campo. Cobra 3% sobre (jornales + almuerzos). |
| Lucas Cañete | `comercial` | Carga de jornales + gestión administrativa. Responsable de fotos para redes. |
| Maxi Wiersma | `comercial` | Ídem Lucas. |
| Mili Neris | `comercial` | Presupuestos menores. |
| Delia | `contable` | Contadora externa **con acceso al portal**. Impuestos, seguros, bancos. Debe ver el panel Gerencial. |
| **`obras@`** | `programacion` | **Cuenta compartida** de Martín + instaladores de campo. Sin cuentas individuales todavía. |

Notas de datos:
- **Martín** no tiene cuenta individual: opera por la cuenta compartida `obras@`. Tiene fila en
  `comerciales` (id 6) **sin `user_id`, a propósito**.
- `programacion` **sí** lee `clientes` — decisión explícita, aun siendo cuenta compartida.

### Colaboradores y proveedores clave

| Nombre/Empresa | Rol |
|----------------|-----|
| Esteban (Seguridad Centro) | Hikvision |
| Denise (Masnet) | Networking, rack, UPS, fibra |
| Dystech | Control4, VSSL, Episode, Araknis, Triad |
| Homiq | Shelly, Home Assistant, coordinadores Zigbee SMLIGHT |

---

## 2. LÍNEAS DE NEGOCIO

### 2.1 Domótica y seguridad — proyectos de instalación (principal)
Llave en mano: materiales + mano de obra. Ticket típico **$2M – $10M ARS**.
Canales: mix parejo entre arquitectos/estudios, clientes directos y desarrolladoras.
Incluye domótica, redes, iluminación inteligente, videovigilancia, alarmas.

**Dos perfiles de proyecto, con tratamiento distinto:**
- **Domótica** — unidad única (vivienda, oficina, departamento).
- **Ecosistema Tecnológico Integral** — edificios y desarrollos, multi-torre, multi-unidad
  (ver 3.6, excepción HAVEN).

### 2.2 Obra eléctrica
- **Integrada**: infraestructura eléctrica dentro de un proyecto mayor de domótica.
- **Independiente**: proyecto eléctrico puro, con su propio ciclo de presupuesto y supervisión.

Cableado, tableros, tomas, protecciones, puesta a tierra. Requiere electricistas matriculados +
certificación por arquitectos. Misma estructura de márgenes que domótica.

### 2.3 Cerraduras digitales
Foco en **Yale**. Standalone o parte de un proyecto mayor. Misma estructura de márgenes.

### 2.4 Desarrollo de software a medida
Línea nueva. Sin estructura de costos definida.

### 2.5 E-commerce
Tiendanube. Marcas: Yale, Philips Hue, Shelly, WiZ, Control4. Venta sin instalación.

---

## 3. PRECIOS Y MÁRGENES

### 3.1 Presupuesto de proyecto de instalación

Materiales y mano de obra **siempre por separado** — nunca precio cerrado único.

- **Materiales**: solo productos principales. NO incluye herramientas ni viáticos de cuadrilla.
- **Mano de obra**: 20–30% sobre el costo de materiales según complejidad.

```
MO presupuestada     = Materiales × 30%
Costo total          = Materiales + MO presupuestada
Margen neto objetivo = 25–30% SOBRE el costo total
Precio al cliente    = Costo total × (1 + margen objetivo)
```

Ejemplo: materiales $1.000.000 + MO $300.000 = costo $1.300.000 → precio ~$1.625.000–$1.690.000.

### 3.2 Directiva fundamental del IVA

El IVA fluye entre débitos y créditos fiscales. **Todos los márgenes y comisiones se calculan
sobre valores SIN IVA.** El IVA solo aparece en el precio final al cliente.

**El `iva` es por ítem, no por marca.** Tres valores, verificados al 03/09/2026: **0.21**
(3.014 ítems) · **0.105** (493 ítems — bienes de capital e informática) · **0** (25 ítems —
servicios NOVA DOMUS). El reducido argentino es 10,5% = `0.105`.

La misma marca puede tener los dos: **13 marcas están partidas entre 0.21 y 0.105** — TP-Link
(58/196), Ubiquiti (45/115), Seagate (2/29), Eaton (27/28), WIZ (28/20), PHILIPS HUE (37/20),
Forza (10/17), Furukawa (138/17), HIKVISION (660/17), Fibra (51/14), Dahua (108/10), VARIOS (4/4),
NOVA DOMUS (3 en 0.21 + 25 en 0). El IVA reducido corresponde al **tipo de dispositivo**, no a la
marca. Por eso no se puede corregir ni clasificar por marca.

**Nunca usar 1.21 como constante en ninguna fórmula: siempre `(1 + iva_real)` leído de la fila.**

**Convención de unidades — declarar siempre la base.** Hay tres métricas que se llaman "margen"
sobre denominadores distintos, y no declararlo fue lo que hizo invisible el choque entre el
remarque 0,35, el descuento B2B del 25% y el piso del 20%:

- `remarque` = **markup sobre costo** = `(pvp − costo) / costo`
- "margen sobre venta" = `(pvp − costo) / pvp` = `r / (1 + r)`
- El **piso del 20%** del §3.5 es **margen sobre venta**, no markup sobre costo
  (**corregido el 03/09/2026** — la 3.3 declaraba lo contrario y por eso la fórmula del piso
  estaba mal; ver la nota de §3.5)
- **Todos los porcentajes se guardan en fracción (0–1)**, nunca en escala 0–100. El formateo a
  porcentaje es responsabilidad de la UI.

### 3.3 Costo y precio sugerido — dispositivos

```
costo_base = precio_sin_iva (USD)          ← ES EL COSTO. No se modifica nunca,
costo_ars  = precio_sin_iva × (1 + iva_real) × TC      salvo lista nueva del proveedor.
```

`costo_ars` se calcula **siempre sobre el valor con IVA**, nunca sobre el pelado.

**Si existe `precio_sugerido_manual`** (ARS, IVA ya incluido):
```
precio_sugerido_usd = precio_sugerido_manual / TC     ← NO dividir por (1 + iva)
```

**Si no existe:**
```
precio_sugerido_con_iva = precio_sin_iva × (1 + remarque) × (1 + iva_real)
```

**`remarque`** — es mark-up, no multiplicador: `precio = costo × (1 + remarque)` ✓
- Con precio de referencia oficial (web del fabricante):
  `remarque = (pvp_web_ars / (precio_sin_iva × (1 + iva_real) × TC)) − 1`
- Sin referencia: **`remarque = 0.35`** por defecto (incluye Yale) → margen sobre venta ~25,93%

### 3.4 B2C

```
precio_final_con_iva = precio_sugerido_con_iva × 0.95      (5% OFF siempre)
```

### 3.5 B2B

Objetivo 25% de descuento sobre el sugerido con IVA. **Piso del 20% de margen sobre venta.
Sin techo** — el tope del 30% se eliminó el 18/08/2026.

- Si el 25% deja el margen sobre venta ≥20% → aplicar 25%
- Si cae debajo del 20% → **no caer al precio B2C**; aplicar el piso exacto:
  `precio_final_con_iva = costo_ars / 0.80`  (equivale a `costo_ars × 1.25`)
- ⚠️ **OBSOLETO — pendiente de reemplazo por la guarda G2** (decisión §6.4 abierta al
  18/08/2026). **Ningún chat nuevo debe aplicar esta regla.** Si el remarque del ítem es
  **alto (>0.73)**, donde el 25% de descuento dejaría margen >30%: **no se capea.** Se cotiza como
  **20-25% de descuento sobre el precio B2C** (`precio_sugerido_con_iva × 0.95`) y el margen real
  flota más arriba.

> **CORREGIDO 03/09/2026.** Antes decía `precio_sin_iva × 1.20 × (1 + iva_real)`. Esa fórmula
> no da un margen del 20%: da un **markup** del 20% sobre costo, que sobre venta equivale a
> 16,67%. Convivía con la convención de MO del Paso 3 (`margen_mo = precio × 0.20`), que sí es
> 20% sobre venta, así que el resumen interno mezclaba dos bases y el margen del proyecto
> aparecía por debajo del piso cuando en realidad no lo estaba. Efecto práctico: sube ~4,2% el
> precio de todos los ítems que tocan el piso.

**Por qué se eliminó el techo** (justificación de la regla marcada OBSOLETA arriba — revisar
junto con la decisión §6.4)**:** un remarque alto sale del PVP oficial del fabricante, así que
cobrar cerca de ese precio es cobrar a mercado, no cobrar caro. El cliente nunca ve el margen,
solo el descuento sobre lista — con el tope recibía un descuento *más grande* justo en los ítems
donde había más aire. Y cotizar como % off del B2C da un descuento consistente entre ítems,
mientras que el tope lo hacía variar de forma errática, lo cual sí se ve en el documento.

**ALERTA DE REMARQUE ALTO** (reemplaza la función de límite de daño que cumplía el techo sin
querer): si `remarque > 0.73` el precio **no** se ajusta, pero se avisa antes de cotizar —
*"este ítem tiene remarque de X%, verificá el precio de referencia antes de mandar"*. Un remarque
alto por error sale de un costo mal cargado o un precio web mal leído, y sin el techo ese error
sale a la calle completo. Caso testigo: `YALE DOOR CLOSER 2065 S VIS`, remarque 172% sin precio
manual. Al 18/08/2026 hay 26 ítems activos sobre 0.73, casi todos Yale y Shelly de línea
principal. Fechar siempre el precio de referencia: un remarque que envejece es el pendiente de
EZVIZ.

**Margen objetivo manual:** para remarques puntualmente muy altos, Agustín puede fijar un margen
objetivo más agresivo caso por caso (ej. Shelly Presence Gen4, remarque 75% → margen 50%). No es
automático; se registra como director-aprobado.

El aviso de margen ajustado es **información interna**. Nunca en documentos del cliente: ahí va
solo el precio final y el % de descuento.

**El piso en la práctica.** En el resumen interno del Paso 3 mostrar **siempre dos columnas de
margen — s/costo y s/venta** — para que no vuelva a pasar la confusión de arriba. La que
gobierna las decisiones es **s/venta**.

Con el remarque por defecto de 0,35 el objetivo del 25% de descuento casi nunca alcanza a bajar
hasta el piso, así que casi todo el equipamiento de terceros (TP-Link/Omada, Hikvision, NVR,
videoportero, Sensibo, UPS, rack, discos) termina **en el piso** y recibe menos descuento que el
25% nominal. Es esperable, no es un bug — y es estrictamente interno: nunca se le aclara al
cliente que no se llegó al 25%.

⚠️ **El % de descuento que se le muestra al cliente se calcula contra el sugerido, y el sugerido
depende del `iva_real`.** En un ítem al 10,5% calculado con 1.21 el sugerido sale 9,5% inflado y
el descuento exhibido queda al doble del real (ej. ER605: 15,4% exhibido contra 7,4% real). El
precio final no cambia si el ítem toca el piso, pero el documento del cliente miente. Es la razón
concreta por la que nunca se hardcodea 1.21 (§3.2).

Caso testigo PY-2026-030: margen de equipo 18,2% → 20,2% s/venta tras la corrección; margen del
proyecto completo 18,8% → 20,1%.

### 3.6 Excepción HAVEN (Grupo Calypso)

**Margen fijo del 27% sobre `costo_ars`, uniforme para todos los ítems.** Reemplaza por completo
las reglas B2B de §3.5 (objetivo 25% / piso 20%).

```
precio_final_con_iva = costo_ars × 1.27
```

Declarar la base, como manda §3.2: el 27% de HAVEN es **markup sobre costo**, que equivale a
**21,26% de margen sobre venta**. No confundirlo con el piso del 20% s/venta de §3.5.

### 3.7 Las dos métricas de rentabilidad

```
margen_sobre_venta = (PVP_ars − costo_ars) / PVP_ars     ← para comisiones
markup_sobre_costo = (PVP_ars / costo_ars) − 1           ← para descuentos
```

### 3.8 Programación y comisionado

Se cobra como **línea aparte**, no dentro de mano de obra:

```
programacion = (equipo con IVA + mano de obra) × 0.10
```

### 3.9 Mano de obra en presupuestos comerciales
- Con Factura A → MO con IVA 21%
- Sin Factura A → MO sin IVA
- La comisión **nunca** aplica sobre MO, solo sobre dispositivos

### 3.10 Comisión comercial

```
comision = (precio_venta_sin_iva - costo_sin_iva) × 0.30
```

El 30% de la **diferencia** entre venta y costo, ambos SIN IVA, como monto absoluto en USD.
**No se aplica sobre un porcentaje**: ni sobre el % de markup ni sobre el % de margen.

Visible en el chat. **Nunca** en el documento del cliente ni en texto de WhatsApp.

### 3.11 Prerrogativa de Agustín
Puede fijar precios custom. Se calcula el margen resultante, se avisa si queda bajo el mínimo y
se registra como director-aprobado.

---

## 4. CONDICIÓN FISCAL

- **Responsable Inscripto** → factura con IVA 21%
- Facturación **directamente desde AFIP**, sin software externo
- Factura A (a RI) o B (consumidor final / monotributistas)
- Sin software contable propio — Delia lleva registro externo

---

## 5. CICLO DE UN PROYECTO

### 5.1 Ciclo de cobro
1. **Anticipo de materiales** — el cliente paga los dispositivos antes de que Nova Domus los
   compre → flujo de caja positivo al inicio.
2. **Certificados de MO** — se cobran por hitos/avance, no todo al final.

### 5.2 Ciclo de estados de proyecto

```
ENTREGADO → ACEPTADO / MODIFICACION_SOLICITADA → EN_OBRA → OBRA_ENTREGADA
          → FACTURADO → CERRADO / CANCELADO
```

`ENTREGADO` es el default de un proyecto nuevo: presupuesto entregado, esperando respuesta.

### 5.3 Ciclo de presupuestos comerciales

```
BORRADOR → ENVIADO → ACEPTADO → PAGADO → (copia a ventas)
                   ↘ RECHAZADO
                   ↘ VENCIDO (15 días)
```

**Vencimiento: 15 días.** Los presupuestos ya emitidos antes de la corrección quedan a 30 días y
**no se backfillean** — el cliente tiene una fecha impresa. El vencimiento funciona como recurso
comercial de urgencia, no como corte real.

### 5.4 Documentos disparados por el estado ACEPTADO

Al pasar `proyectos.estado` a `ACEPTADO` se habilitan dos artefactos en simultáneo — mismo
disparador, distinto público, **no son secuenciales**:

- **Paso 5a — Snapshot comercial**: congela los datos de venta existentes. Mecánico, ya
  implementado.
- **Paso 5b — Plano de Instalación e Integración**: documento técnico **interno** (no público, no
  cliente-facing, no va a GitHub Pages) para instalación/programación. **No se autogenera**: el
  cambio de estado lo habilita, pero se arma en una sesión dedicada con Claude.

Reglas fijas del Plano de Instalación:
- Se arma a partir del detalle de dispositivos **ya aprobado en el Paso 3** (Resumen interno) de
  ese proyecto. **Nunca se inventan cantidades nuevas.**
- Secciones obligatorias: topología de red (nodo/rama desde el router hasta cada sistema),
  distribución de rack U por U, plan de VLANs/WiFi, inventario por subsistema con detalle de
  integración a Home Assistant, reglas de programación, checklist de comisionado.
- El `proyectos.numero` correlativo va tanto acá como en el HTML público (Paso 4).
- Acceso restringido a `admin`, `supervisor` y `programacion`. **Nunca contiene precios,
  márgenes ni costos** — eso vive exclusivamente en Comercial / Paso 3.

> **Terminología.** "Plano de Instalación e Integración" (documento técnico de Nova Domus) es
> distinto de **"Planos de obra"** (los PDF/imágenes del arquitecto: Bocas y Llaves, Iluminación,
> etc.). En Argentina "mapa" y "plano" no son sinónimos: este documento es un plano. Los dos
> conceptos conviven en el mismo módulo del portal.

---

## 6. COMPRAS Y PROVEEDORES

- Varios distribuidores que **compiten por precio** — no hay proveedor exclusivo
- Precios en **dólar oficial BNA**; excepcionalmente en ARS. El inventario está todo en
  `USD OFICIAL`: el dólar blue quedó **desactivado** (no borrado) porque nada lo consume
- Los presupuestos registran el **tipo de cambio al momento de la compra**
- Pago: mix según proveedor (contado, cuenta corriente, tarjeta)
- No se importa directamente ni se compra en MercadoLibre
- TC BNA: `https://api.bluelytics.com.ar/v2/latest` → `official.value_sell`
- **La disponibilidad real del proveedor le gana al ahorro teórico.** Verificar stock antes de
  blindar un SKU en un presupuesto, sobre todo si es la variante más económica de una línea.
  Caso real: Sensibo Sky vs. Air B2B, ver §9.3.

---

## 7. INVENTARIO

### 7.1 Stock
- **Cerraduras Yale**: stock propio en depósito, se repone cuando baja
- **Resto** (Shelly, Hue, WiZ, materiales eléctricos): a pedido, con anticipo del cliente

### 7.2 Qué se trackea
Solo dispositivos (Yale, Shelly, Hue, WiZ, Control4, EZVIZ, Hikvision, Ubiquiti, TP-Link,
Furukawa, Dahua, Gabitel…). No incluye materiales eléctricos menores ni herramientas.

### 7.3 Regla de flujo — importante

**Todo el pricing y el trabajo de proyecto va directo a Supabase**, tablas `inventario`,
`proyectos`, `proyectos_items`, `cotizaciones`.

**NO usar `INVENTARIO.xlsx` de Drive. NO generar archivos Excel como entregable de presupuesto.**
Los proyectos de cliente se cargan en `proyectos` / `proyectos_items`.

### 7.4 Campos clave de `inventario`
`id` (PK entero) · `sku` (string) · `nombre` · `marca` · `grupo` · `estado` (texto, default
`activo`, admite `discontinuado`) · `precio_sin_iva` (USD sin IVA, **nunca modificar salvo lista
nueva**) · `iva` (default `0.21`; también `0.105` y `0` — es **por ítem, no por marca**, ver §3.2) ·
`remarque` · `precio_sugerido_manual` (ARS con IVA, nullable) · `sku_mo` (referencia al tarifario
de mano de obra).

**Búsqueda:** `ILIKE '%keyword%'` en nombre y marca. El SKU se busca **como string**, no entero.

### 7.5 Correcciones de datos aplicadas (02/09/2026 — sesión PY-2026-030)

Proyecto `vvwnyszcfindtuvojqgs`, el único vigente. Todas verificadas con SELECT posterior
— para que la skill no contradiga la base:

- `inventario.sku_mo` = `'MO-DOM-DIN'` en los 15 dispositivos Pro/DIN de comando: ids 409,
  410, 411, 412, 413, 414, 415, 416, 418, 419, 420, 430, 431, 432, 433. Los 5 medidores
  (365, 366, 417, 421, 422) quedaron en `MO-DOM-MED`, porque ahí el trabajo real es
  colocar bobinas CT, no armar módulo. El add-on id 408 queda en `MO-NA`.
- `inventario.sku_mo` = `'MO-DOM-CORE'` en los 4 Home Assistant Strong i5: ids 2923 a
  2926 (tenían el campo en NULL, era un hueco de datos).
- `inventario.caracteristicas_principales` de los ids 360 y 361 actualizado con la
  composición real de cada kit (ver §9.6) y el ahorro contra comprar suelto.
- ER7212PC (id 1448) sigue marcado `estado='descontinuado'`. Reemplazo: ER605 + OC200
  como dos ítems separados. El ER605 no tiene PoE, así que todo el PoE sale del switch —
  dimensionar el switch contando cámaras + APs + coordinador Zigbee + videoportero.
  Ojo con el IVA: el **ER605 (id 1449) está al 10,5%** y el **OC200 (id 1495) al 21%** —
  el reemplazo cruza las dos tasas, así que se lee `iva` por fila (§3.2).

Divergencia conocida, **sin resolver**: los sensores BLU y los dos kits (ids 360, 361, 373, 374)
tienen `sku_mo = 'MO-DOM-SENS'` cargado en la base, mientras que la regla de §9.6 dice que en
obra los sensores no llevan MO de instalación. Hoy la regla vive solo en la prosa. Definir si se
documenta como divergencia intencional o se corrige el dato (ver §13, pendiente 10).

---

## 8. CUADRILLA — REGLAS OPERATIVAS

- Semana laboral: **viernes a jueves** (los técnicos reportan el viernes)
- Mínimo facturable: **6 horas por jornada**, incrementos de 30 minutos
- Campos: `jornal, almuerzo, traslados, peaje, km, otros, adelantos, compras, detalle`
- `neto = jornal + viáticos + otros + compras − adelantos` (las compras son reembolsables)
- **Esteban cobra 3% sobre (jornales + almuerzos)** del período
- Alertas de solapamiento al cargar

### Costo real de obra
El costo se **recalcula desde los componentes** (jornal + almuerzo + traslados + peaje + otros),
no se lee de un campo agregado. El trigger `calculate_obra_balance()` ya lo implementa
correctamente, incluyendo el 3% de Esteban.

### Liquidación semanal
- Período libre (selector inicio/fin), no semanas fijas
- Campos manuales: Compras/Otros + KM/Peajes
- Total supervisor pre-llenado automático (3% + manuales), editable
- **Costo Nova Domus** = neto cuadrilla + total supervisor

### Acceso por rol
| Módulo | `admin` | `supervisor` | `comercial` | `contable` | `programacion` |
|---|---|---|---|---|---|
| Carga de jornales | ✅ | ✅ | ✅ (solo carga) | ❌ | ❌ |
| Reportes / histórico | ✅ | ✅ | ❌ | ✅ | ❌ |
| Liquidación | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 9. SELECCIÓN DE DISPOSITIVOS — JERARQUÍA TÉCNICA

**Protocolo, orden estricto:**
1. **Zigbee** — primera opción siempre (red mesh local, <100ms)
2. **WiFi Gen4** — si no hay variante Zigbee
3. **WiFi Gen3** — fallback
4. **Z-Wave — DESCARTADO SIEMPRE**, sin preguntar. Solo informar que existía.

**Coordinadores Zigbee:** HA SkyConnect / HA Green en proyectos de unidad única. En despliegues
multi-torre, **SMLIGHT SLZB-06p10** (Ethernet + PoE), uno por instancia.

**Estándares obligatorios por proyecto:**

| Estándar | Cuándo aplica |
|---|---|
| UPS | Todo proyecto con domótica o seguridad |
| Shelly Wall Display 4" | Proyectos chicos/medianos |
| Shelly Wall Display XL | Proyectos grandes |
| Rack de infraestructura | Proyectos grandes |
| Sensibo Air B2B | 1 por split en proyectos con climatización — **corregido 02/09/2026**, antes decía "Air PRO"; criterio y motivo en §9.3 |
| Teclado de alarma + sirena interior | Departamentos (obligatorio) |
| Sirena exterior | Viviendas completas (obligatoria) |

**Nota UPS — el argumento comercial real:** las cámaras PoE y el grabador siguen
funcionando en un corte de luz **no** por ser PoE, sino porque el switch que las alimenta
está sobre el UPS. Sin UPS se apagan igual que todo lo demás. Es el argumento que
justifica el UPS y evita que el cliente lo lea como un adicional caprichoso — es un error
frecuente atribuirlo al PoE. Dimensionar siempre a la carga real del rack.

**Shelly y Philips Hue son complementarios**, no alternativos:
- **Shelly**: retrofit de interruptores existentes, circuitos de pared
- **Hue**: iluminación nueva con necesidad de color/escenas
- Un mismo proyecto puede llevar los dos, integrados a Home Assistant vía Hue Bridge

**Stack de referencia:** TP-Link Omada (redes) · Hikvision (CCTV, alarmas, intercomunicadores,
HikCentral) · Yale (cerraduras digitales, standalone) · Shelly + Home Assistant + Zigbee
(iluminación y confort) · Sensibo (clima).

**Arquitectura multi-unidad:** Home Assistant **federado** — una instancia por torre, no
centralizado.

### 9.1 Topología de instalación — relés y dimmers de punto de luz

**CORREGIDO 03/09/2026** — si una versión anterior de esta skill sugería que el relé va
en la boca de iluminación como regla general, o que "cada llave lleva su Shelly en la
caja" sin más matiz, estaba mal/incompleto. Criterio real:

- **Por defecto, el relé/dimmer va en la caja de llave**, detrás de la llave. Es el caso
  habitual y cubre la gran mayoría de los puntos de una obra.
- **Regla de oro: un solo módulo por caja.** En caja argentina estándar 10x5 la
  profundidad admite uno. Probado en obra: dos módulos en una 10x5 generan mucho calor y
  no queda bien en términos de seguridad eléctrica. Un módulo comanda hasta 2 efectos
  (2PM), así que una llave de 1 o 2 teclas se resuelve con un solo módulo detrás de ella.
- **Excepción, no habitual:** cuando el módulo no entra en la caja de llave — llave con
  más de 2 efectos, o con más de un efecto dimerizable (cada dimmer es un módulo, no
  entran dos en una 10x5). Ahí los relés/dimmers se mudan a la **boca de iluminación**
  (la que da inicio al efecto, desde donde se contactan todos los artefactos que se
  comandan juntos), y en la caja de llave puede quedar el i4 como entrada.
- **Recomendación habitual al cliente y al estudio:** sumar llaves de luz para que
  ninguna caja pase de 2 efectos. Así todo queda detrás de la llave, se evita el i4 y se
  evita mudar módulos a la boca. Conviene plantearlo antes del replanteo.
- Si igual hay que meter más de un módulo en una caja, pedírselo al electricista **antes
  de cerrar paredes**:
  - Mampostería → doble fondo de caja, o caja 10x10 con bastidor 10x5 tapando la otra
    mitad con tapa ciega y luego yeso para que no se note.
  - Construcción en seco → dejar la caja 10x5 **sin fondo** para poder "colgar" los
    módulos detrás.

**Fase y neutro — el pedido más urgente:** pedirle al electricista bajar neutro junto con
el retorno a TODA caja de llave. Con el módulo detrás de la llave el neutro ahí es
imprescindible, y también lo es donde va un i4. Cuesta prácticamente nada en obra y es
carísimo corregirlo después de cerrar paredes. Tiene que quedar destacado en todo
documento cliente-facing, no escondido en un acordeón.

### 9.2 Tiras LED 24V — regla de los 90 W

**Distinto de §9.1**: esto es exclusivamente para tiras LED sobre driver/fuente 24V, no
para relés de punto de luz.

El umbral que separa RGBW PM de 0/1-10V **no es el límite de potencia del dispositivo**
(240 W nominal del Plus RGBW PM) — es **90 W por efecto**, después del derating
obligatorio.

**Derating obligatorio:** estos módulos van en tablero o caja cerrada. El datasheet
declara 40°C de ambiente máximo, y un gabinete cerrado en verano de Córdoba lo supera.
Diseñar siempre al 75% del nominal, nunca al 100%:

| Módulo | Inventario | Nominal (datasheet) | Techo de diseño (75%) |
|---|---|---|---|
| Shelly Plus RGBW PM | id 399, ~USD 29,97 s/IVA | 4 canales, 4A/canal, 10A total, 24V DC → 96 W/canal, 240 W/dispositivo | 72 W/canal, 180 W/dispositivo |
| Shelly Dimmer 0/1-10V PM Gen3 | id 400, ~USD 32,90 | comanda el driver por señal analógica — la corriente NO pasa por el módulo, sin límite propio | limitado por la fuente, no por el módulo |
| Shelly Pro Dimmer 0/1-10V PM (DIN) | id 415, ~USD 102,37 | ídem, versión DIN | ídem |
| Shelly Pro RGBWW PM | id 411, ~USD 76,65 | DIN, 5 canales, 6A/canal, 16A total → 144 W/canal, 384 W nominal | uso puntual — ver nota de planta abajo, "más canales" no es "más rinde" |

Nota de remarque: el 0/1-10V (id 400) tiene remarque 0,80 con `precio_sugerido_manual`
cargado — dispara la alerta de remarque alto (§3.5) y es legítimo, sale del PVP igual.

**Regla de decisión — por efecto, no por dispositivo:**

| Efecto | Elegir | Motivo |
|---|---|---|
| ≤ 72 W | RGBW PM, 1 canal — agrupar 4 efectos por dispositivo | ~USD 22/efecto — acá el RGBW PM gana 4 a 1 |
| 72–90 W | RGBW PM, 2 canales — máx. 2 efectos por dispositivo | último tramo donde el RGBW PM sigue siendo la opción |
| 90–180 W | Dimmer 0/1-10V sobre driver dimerizable | desde acá el RGBW PM necesita dispositivo dedicado (USD 89,71/efecto); el 0/10 sale similar (USD 92,64) pero es mejor técnicamente: sin carga por el módulo, sin límite de potencia, sin riesgo térmico, conserva medición de consumo |
| > 180 W | 0/1-10V obligatorio | dos RGBW PM en paralelo sobre la misma carga cuesta el doble y es mala praxis |

⚠️ **Los 5 canales del Pro no compran nada por sí solos.** Lo que limita el agrupamiento
no es la cantidad de canales sino **la planta**: no se agrupan efectos de plantas
distintas en un mismo módulo. Verificado en PY-2026-030: 23 efectos chicos repartidos 12
en PB y 11 en PA dan 6 dispositivos tanto con Plus (4 canales) como con Pro (5 canales), y
el Pro costaba USD 280 más por el mismo resultado.

**Configuración óptima:** Plus RGBW PM en caja plástica dedicada para los efectos chicos,
y Pro DIN solo para los de alta potencia (>90 W), donde son pocos módulos y el DIN sí
rinde.

**Contar efectos, no tiras ni fuentes.** Un efecto es un circuito que se comanda como
unidad.

**Ubicación:** como las fuentes de 24V van remotas en tablero, estos módulos **no** van
detrás de la llave (a diferencia de los relés/dimmers de §9.1). Van en tablero o, mejor,
en una **caja de derivación plástica dedicada al lado**: resuelve el WiFi (varios módulos
WiFi dentro de un gabinete metálico cerrado es un problema real de señal), los separa del
calor de las fuentes (el margen térmico que pide el derating del 75%), y se accede sin
abrir el tablero de potencia. Se define en la visita técnica.

**MO:** el Plus RGBW PM no es riel DIN (42×37×12mm, bornes a tornillo) →
**MO-DOM-DIM (USD 59,74)**. Toda la línea Pro DIN (RGBWW PM, Dimmer 0/1-10V PM) →
**MO-DOM-DIN (USD 95,22)**.

**Dependencia externa:** el 0/10 exige fuente dimerizable 0-10V, y la fuente es del
proveedor de iluminación, no de Nova Domus. Se pide SIEMPRE por consulta formal al
estudio, nunca se asume — es un pedido sin riesgo: si lo niegan, se vuelve a RGBW PM
dedicado y el presupuesto se mueve ~3%.

**Observación técnica a trasladar al estudio cuando corresponda:** un circuito de 135 W a
24V son 5,6A, y la caída de tensión en DC es severa en corridas largas. Si el replanteo
muestra tiradas largas, el problema es la sección del cable de DC (incumbencia del
proveedor de iluminación), no el módulo de comando.

### 9.3 Climatización — qué Sensibo según el cerebro

La integración de Sensibo en Home Assistant es **cloud en todos los modelos**: depende de
internet y de que la API de Sensibo responda. Cuando el cerebro es HA, no se paga nada por
"mejor integración".

| Modelo | Inventario | Suma sobre el Sky | Aporta |
|---|---|---|---|
| Sensibo Sky | id 324, ~USD 146,40 | — | control IR + temperatura/humedad — alcanza con HA como cerebro |
| Sensibo Air B2B | id 325, ~USD 174,74 | +USD 28,34 | HomeKit (irrelevante con HA), BLE, mejor chipset, compat. con Room Sensor propio |
| Sensibo Air PRO | id 326, ~USD 180,00 | +USD 33,60 (+USD 5,26 sobre el Air B2B) | sensor de calidad de aire (no se usa para climatizar) |

Técnicamente alcanza el Sky: HomeKit es irrelevante, la calidad de aire no climatiza, y la
temperatura la leen los Shelly BLU H&T (más barato y local). Hay reportes en HA de que el
**Air PRO no expone Climate React**, que Sky y Air sí exponen — el modelo más caro no es el
mejor integrado.

⚠️ **Decisión de Agustín (sep 2026), caso testigo PY-2026-030:** en la práctica se cotiza
el **id 325 (Air B2B)**, porque los proveedores no están trayendo el Sky y no vale el
riesgo de faltante de stock — regla general que prima por encima del criterio técnico de
arriba, ver §6. Esto corrige el default "Sensibo Air PRO" que tenía la tabla de
estándares obligatorios de este mismo capítulo.

Nota de precios: el Air B2B (174,74) está a solo USD 5 del Air PRO (180). Si el cliente pide
específicamente "Air", cotizar directo el PRO.

### 9.4 Seguridad: cableado vs. inalámbrico — mirar la obra, no el equipo

**CORREGIDO 03/09/2026** — si esta skill sugería que el cableado gana por costo, estaba
mal por incompleto.

En costo de **equipo** el cableado parece ganar por lejos: 27 aberturas dan ~USD 340 en
cableado contra ~USD 1.593 en inalámbrico. Pero el cableado arrastra mucha más plata de
**obra**: el cable de cada tirada más lo que cobra el electricista por canalizar y pasar
todas esas corridas. En el total de obra NO compensa.

**Criterio real de Nova Domus:** se recomienda **inalámbrico por defecto** — menos obra, y
hoy los inalámbricos tienen cada vez más funciones. Se cotiza cableado únicamente donde el
**plano lo especifica**, porque el plano prevalece sobre nuestra sugerencia; donde el
plano no dice nada, va inalámbrico.

Cómo se le explica al cliente: cotizamos lo que pide el plano, y si el estudio acepta
revisarlo, el inalámbrico probablemente baje el costo total de obra — no el nuestro, el
de ellos.

### 9.5 Lectura de planos — identificación de sensores y conflicto plano vs. planilla

**"Sensor barrera":** en planos de señales débiles de estudios de arquitectura de
Córdoba, la etiqueta "sensor barrera" con un cuadrado sobre el muro en cada abertura
significa detector tipo **cortina** (PIR de haz plano que cubre el plano del vano),
**no** contacto magnético. Se especifica cuando la carpintería es de vidrio grande o
corrediza.

| SKU | Tipo | Precio aprox. |
|---|---|---|
| DS-PDC15-EG2 | cortina, cableado, 15m | ~USD 12,60 |
| DS-PDC10AM-EG2-WB | inalámbrico IP65 | ~USD 59 |
| DS-PDC10DM-EG2-WB | inalámbrico doble tecnología | ~USD 68 |

La etiqueta **"S.V."** con caja 5x5 a h:7cm de cielorraso es un PIR volumétrico de techo.

Central híbrida recomendada: **DS-PWA96-M2H-WB** (16 zonas cableadas en placa + 80
inalámbricas + 4G, ~USD 318) — en la práctica más barata que DS-PHA64-LP + 4 expansores y
además trae 4G.

⚠️ Verificar stock real con el proveedor antes de blindar cualquier SKU de esta familia
(mismo criterio de §6).

**Conflicto plano vs. planilla:** cuando el legajo tiene planos de iluminación Y una
planilla de luminarias que no cierran entre sí, la fuente de verdad para el BOM es
**siempre el plano**. Las discrepancias se listan en un PDF de consultas al estudio,
preguntando explícitamente qué documento prevalece, pero no bloquean el presupuesto.

Corolario: para nuestro BOM el modelo de luminaria no importa; importa el efecto a
comandar y si es dimerizable o no. Un código de catálogo faltante no impide cotizar el
Shelly, solo deja sin definir si va relé o dimmer. Criterio por defecto: todo efecto sin
especificación de control se cotiza como **switch (1PM Mini Gen4)** y queda flaggeado; el
ajuste posterior es de ~USD 30 por punto, no un replanteo de rubro.

### 9.6 Kits de sensores Shelly — composición real y alcance acotado

**CORREGIDO 03/09/2026** — si esta skill decía que los dos kits traen 3+3, estaba mal:

| Kit | Inventario | Composición |
|---|---|---|
| Kit de Seguridad Shelly | id 360, ~USD 121,36 | 3 movimiento + 3 puerta |
| Kit XL | id 361, ~USD 163,83 | 5 movimiento + 5 puerta |
| BLU Motion (suelto) | id 374, ~USD 25,87 | — |
| BLU Door Window (suelto) | id 373, ~USD 21,73 | — |

**Método:** nunca cotizar un kit por ambiente. Contar la necesidad real de cada tipo y
recién ahí resolver la combinación más barata de kits + sueltos. Contra comprar suelto,
el XL ahorra ~USD 74 (163,83 contra 238,00) y el común solo ~USD 21 (121,36 contra
142,80): el XL es casi siempre la mejor compra, arrancar por ahí.

Caso testigo PY-2026-030 (14 movimiento + 9 puerta): 2 XL + 4 BLU Motion = USD 431,14,
contra USD 462 de 1 XL + 1 común + sueltos, USD 475 de 2 XL + 1 común, y USD 484 de 1 XL +
todo suelto. Bonus: cuando los kits dejan un sensor de sobra, ese sobrante ya cubre el 10%
de repuesto.

**Alcance acotado** de la automatización por sensores: va **solo** en baños/toilettes,
lavaderos, pasillos/pasos, cajas de escalera, hall de ingreso y cochera si está cubierta.
**No** en dormitorios, estar, comedor, cocina ni oficinas — no es necesario y encarece sin
aportar. Conteo: movimiento + puerta en ambientes cerrados; solo movimiento en
circulaciones abiertas.

**MO:** en obra (PY) los sensores **no** llevan MO de instalación, se pegan y nada más; sí
entran en la base del % de programación (§3.8). MO-DOM-SENS (USD 27,82) es exclusivo de
Presupuestos Comerciales de compra suelta.

### 9.7 Redes: Omada vs. mesh doméstico (Deco)

Cuando el cliente propone usar un mesh doméstico que ya tiene, la respuesta **no** es "no
sirve": es compatible y funciona, y Nova Domus ha usado Deco en viviendas ya habitadas
donde no se podía llevar cable. Para una casa **en obra** se mantiene la recomendación de
Omada, con estos argumentos concretos y verificables, en orden de fuerza:

1. **Supervivencia a cortes de luz** — el más fuerte. Los EAP de Omada se alimentan por
   PoE desde el switch, y el switch está sobre el UPS: en un corte, toda la red WiFi sigue
   de pie junto con cámaras y grabador. Cada unidad Deco necesita su propio toma de 220V
   en su ubicación, sobre los circuitos de la casa: en un corte se apaga todo el WiFi
   salvo, como máximo, la unidad enchufada al rack.
2. **Tomas.** PoE significa un tomacorriente menos por punto de AP que pedirle al
   electricista.
3. **Backhaul y hormigón.** El Deco XE75 usa la banda de 6GHz como enlace entre unidades,
   y a mayor frecuencia peor penetración: en varios niveles con losa de hormigón la malla
   por aire rinde poco. Con backhaul por Ethernet anda bien, pero eso exige el mismo
   cableado UTP que ya se especificó, así que la ventaja de "no cablear" desaparece.
4. **Segmentación.** Omada separa por VLAN el tráfico de domótica y seguridad del de
   invitados desde un solo controlador; el mesh doméstico no.
5. El switch PoE se necesita igual para las cámaras: el Deco no da PoE.

**Nomenclatura a corregir con cuidado:** "EX75" no existe. Existe el **Deco XE75**
(sistema mesh tri-banda AXE5400, 3 puertos Gigabit por unidad, modo router o AP, backhaul
Ethernet opcional) y el **Archer AXE75 / AX75** (routers sueltos). Si el cliente dice
"mesh" y "los tengo" en plural, son Deco XE75.

### 9.8 Starlink: dos cosas a prever siempre

1. Starlink trabaja con **IP compartida (CGNAT)**: no se puede abrir un puerto hacia
   afuera. El acceso remoto al sistema se resuelve por túnel o servicio de acceso remoto
   (gratis o muy barato), pero hay que preverlo y decírselo al cliente de entrada. Con
   fibra de la calle no pasa.
2. El cable de Starlink es propietario y su conector es grueso: el corrugado tiene que ser
   generoso, con 3/4" no entra.

Para fibra de calle: corrugado con las menos curvas posibles y tanza guía, para que el
instalador de internet pase su propia fibra.

### 9.9 Cuánto del sistema depende realmente del WiFi

No sobrestimar el "casi nada depende del WiFi". Cuenta real de PY-2026-030: 35 módulos
Gen4 sobre Zigbee (malla propia, independiente del WiFi) contra 20 sobre WiFi
⚠️ (la enumeración que sigue suma 18, no 20 — reverificar el conteo contra el Paso 3 del
proyecto antes de usar el número en una propuesta; ver §13, pendiente 11) — 11
módulos de tira de la línea Plus/Pro (§9.2, que NO son Zigbee), más 6 Sensibo y la
pantalla. Los sensores BLU van por Bluetooth con gateway y la alarma tiene radio propia;
cámaras y grabador son cableados. O sea ~60-65% Zigbee, no 80%.

Y los módulos de tira son WiFi **y** van en el tablero, que es justo donde la cobertura es
peor: es un argumento **a favor** de la red profesional (§9.7), no en contra. Decir el
número real es más creíble que exagerar.

---

## 10. FINANZAS Y ADMINISTRACIÓN

- **Cuentas** separadas: empresa, personal, USD
- **Cobro**: mix según cliente (transferencia, cheque/e-cheq, efectivo)
- **Delia** (`contable`) maneja impuestos, seguros y bancos, y tiene acceso al portal
- Sin software contable propio
- El flujo de caja se formaliza progresivamente en el portal

---

## 11. STACK TÉCNICO

### Portal interno — `portalnovadomus.pages.dev`
- Frontend: **HTML + CSS + JS vanilla**, un archivo por módulo, mobile-first
- Hosting: **Cloudflare Pages**, deploy automático por push al repo
  `Novadomus-cba/portal-nova-domus`
- **Código en inglés** (variables, funciones, comentarios). **UI en español.**
- Fetch: siempre `.text()` + `JSON.parse()`, **nunca `.json()` directo**
- CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- `auth-bridge.js` lo cargan varios módulos: ahí viven las URLs, la publishable key y
  `manejarSesionExpirada()`. Al tocar auth, grepear también este archivo, no solo el módulo.
- Cloudflare sirve `index.html` con 200 para rutas inexistentes (fallback SPA): tenerlo en cuenta
  al validar rutas.

### Base de datos — UN SOLO PROYECTO SUPABASE

- **`vvwnyszcfindtuvojqgs`** — único proyecto vigente. Contiene **todo**: Auth, Comercial,
  Inventario, Obras, Certificados, Recibos, Análisis, Tarifario, Gerencial y el schema
  `cuadrilla` (jornadas).
- **`voowjwzlkhdknpapkhxc`** — copia congelada de rollback del 14/08/2026. **SOLO LECTURA. Nunca
  escribir, tampoco vía MCP de Supabase.** Se va a pausar: no asumir que responde.

La consolidación de los dos proyectos se ejecutó el 14/08/2026. Para el estado real de la base
(tablas, políticas, grants, jobs, divergencia) **correr `scripts/estado.sql`** — no confiar en
ningún documento.

Job programado: `rentabilidad-semanal` (`0 18 * * 5` → `refresh_all_obra_balances()`), en el
proyecto vigente únicamente.

### Panel comercial (presupuestos públicos)
- Repo `Novadomuscba/presupuestos` → GitHub Pages. **No se puede borrar**: los presupuestos ya
  emitidos apuntan ahí.
- Link al cliente: `https://novadomuscba.github.io/presupuestos/?id={ID}`
- El nombre del comercial sale de la vista `v_presupuesto_publico` (`SECURITY DEFINER`), no de
  una lectura directa de `comerciales`.

### Plano de Instalación + Planos de obra
- Carpeta del portal: `plano-instalacion/index.html`
- Objetivo: que Martín, los instaladores y Agustín vean el Plano de Instalación (5b) y los Planos
  de obra de cualquier proyecto en curso, en cualquier momento
- Acceso vía Supabase Auth: `obras@` (`programacion`, solo lectura) + `admin` y `supervisor`
  (lectura y escritura). **No** usa enlace ni contraseña por fuera del sistema de auth
- Alcance: solo topología y planos. **Nada de precios, márgenes ni costos**
- Tabla `proyectos_planos_instalacion (id, proyecto_id, storage_path, version, generado_por,
  generado_en, notas)` — RLS: lectura `admin`/`supervisor`/`programacion`, escritura
  `admin`/`supervisor`
- Bucket privado `planos-instalacion` (solo `text/html`, 10 MB). Los HTML son **artefactos
  derivados** de `proyectos_items`: si se pierden, se regeneran
- **Planos de obra**: hoy en Google Drive (Workspace pago, carpeta raíz
  `1rgzzZmxFjNuU2cPLTI3qOPMn86Kfp2MF`). Repositorio definitivo (Drive por dominio vs. Supabase
  Storage) **pendiente de definir**

### Herramientas de trabajo con Claude
- **MCP de Supabase**: acceso directo para queries, migraciones y verificación. Entra como
  `postgres` — **ignora RLS y grants**, así que un `project_id` mal configurado escribe donde no
  debe sin ninguna barrera.
- **No hay conector de GitHub ni de Cloudflare Pages**: no se puede ver historial de deploys,
  logs de build ni código fuente del repo. Para eso, Claude Code con el repo local.
- Para inspección visual del portal en vivo como usuario logueado: **claude-in-chrome**.
- Verificar un deploy leyendo el **archivo servido**, no el local:
  `fetch('/ruta?v='+Date.now())`, grepeando por booleanos.

---

## 12. IDENTIDAD DE MARCA

**No está acá.** Vive en la skill `nova-domus-identidad-marca`, que tiene **prioridad declarada**
sobre cualquier dato de marca de esta skill o de la memoria.

Ahí están: paleta con hex y usos, tipografía, los archivos vectoriales reales del logo (nunca
recrear el isotipo), descriptor de categoría, slogan, promesa de cierre de obra, tono de voz,
iconografía y reglas de co-branding.

Dos datos que se repetían mal y conviene tener presentes: el descriptor es **"INTEGRACIÓN
TECNOLÓGICA"** (no "Domótica") y el slogan es **"Del cable a la app"** (no "Habitamos espacios
inteligentes"). Cualquier otra cosa de marca, ir a la skill.

---

## 13. PROBLEMAS CONOCIDOS Y DECISIONES

### Datos legacy que NO se backfillean
Decisión firme del 13/08/2026. Rellenarlos sería inventar un dato indistinguible de uno real.

- **`recibos_lineas.cantidad`**: la columna tiene default 1 y el formulario nunca la persistía,
  así que la mayoría de las líneas históricas quedaron en 1. **Los montos (`monto_pesos`) siempre
  se guardaron bien**, así que los totales facturados al cliente están correctos — el error era
  solo la columna "Cant" del documento impreso. Los 2 casos ya parchados a mano (Campo Chico
  Nº19, Chacras 3 Nº32) quedan como están.
- **`obras_rubros` sin `tarifario_base_id`**, **`certificados_items` sin rubro**, **líneas de MO
  sin snapshot**, **certificados viejos sin ítems**: se dejan.

### Reglas de datos confirmadas
| # | Tema | Regla |
|---|---|---|
| 1 | `tipo_linea` | Solo `'DISPOSITIVO'` o `'SERVICIO'`, **uppercase**. Rechaza `'MO'`, `'MANO_DE_OBRA'`, minúsculas. |
| 2 | Campos numéricos en líneas `SERVICIO` | Usar `0`, **no NULL**. |
| 3 | `cotizaciones` | La columna es `updated_at`. `fecha_actualizacion` **no existe**. |
| 4 | `precio_sugerido_manual` | Ya incluye IVA en ARS → dividir por TC, **no** por 1.21. |
| 5 | `remarque` | Es mark-up: `costo × (1 + remarque)`. |
| 6 | Venta parcial de presupuesto | Confirmar **qué ítems exactos** se incluyen antes de registrar. |
| 7 | `clientes` vs `canales` | Los revendedores **no** son clientes: van a `canales`, y `canal_id` cuelga del **proyecto**, no del cliente (el canal es por operación). Los estudios (Fanesi-Navarro, JAD) **sí** son clientes: gestionan los pagos. **No hay tabla `contactos`.** |
| 8 | `tipo_cambio` | **Serie histórica append-only**, dedupe por `(fuente, fecha)` — un valor por día por fuente. Es dato de mercado: `supervisor` puede escribir, **`DELETE` revocado a `authenticated`**. El snapshot a nivel documento (`proyectos.cotizacion_oficial_snapshot`, `proyectos_items.remarque_snapshot`, `presupuestos_items.*`) sigue existiendo y responde **otra** pregunta: qué se cobró, no cuánto valía el mercado. **Nunca derivar la serie de mercado de los snapshots de documento.** |
| 9 | Borrado de certificados/recibos | Solo en `BORRADOR` y `ENVIADO`. En `PAGADO` se **anula**, no se borra. |
| 10 | Escritura en `inventario` | Solo `admin`. |
| 11 | Discontinuados | **Nunca se borra un registro.** En `inventario` se marca `estado = 'descontinuado'`; en el tarifario, `activo = false` + `referencia_codigo` al reemplazo. Un ítem borrado rompe los presupuestos históricos que lo referencian. |

**Por qué cambió la regla 8:** la tabla tenía una sola fila con un trigger que borraba las
anteriores. El `id 84` significa que hubo 83 inserts previos y los 83 se borraron. Sin serie no hay
forma de reconstruir con qué tipo de cambio se calculó un remarque, que es la causa raíz del
proyecto de saneamiento de precios.

### Pendientes abiertos
| # | Qué | Estado |
|---|---|---|
| 1 | EZVIZ con remarque desactualizado | **Corregido 03/09/2026:** no forzar el máximo descuento. Se aplican las reglas B2B normales de §3.5 — objetivo 25%, piso 20% de margen **sobre venta** (`costo_ars / 0.80`) — igual que cualquier otra marca. Sigue pendiente actualizar el remarque contra la lista y el TC del día. |
| 2 | SKUs duplicados y vacíos en inventario | Cleanup manual pendiente. |
| 3 | Cobertura de `sku_mo` | Buena parte de los ítems activos no tiene tarifa de MO asociada, concentrado en ACCESORIOS, RACK, FIBRA ÓPTICA, CABLE, LICENCIAS. Falta definir el criterio de mapeo. |
| 4 | Repositorio de Planos de obra | Drive vs. Supabase Storage, pendiente. |
| 5 | Bucket huérfano `mapas-instalacion` | Vacío (pre-rename). Se borra a mano desde el dashboard: `storage.protect_delete()` lo impide por SQL. |
| 6 | Routing `/gerencial` sin barra final | Servía una página vieja. Verificar contra el archivo servido antes de asumir el estado. |
| 7 | Panel Gerencial | Va a **reescribirse por completo**. Mientras la fuente de ingresos esté vacía va a mostrar números catastróficos que son reales, no un bug. |
| 8 | Rotación de credenciales | `service_role` y `ANTHROPIC_API_KEY` quedaron duplicadas entre proyectos. Rotar y dejar una sola. |
| 9 | Remarque de Sensibo Air B2B (id 325) | Tiene `remarque = 0.50` contra `0.37` de los ids 324 y 326. Resultado: el Air B2B sale a ~USD 262 de sugerido y el Air PRO —más caro de costo— a ~USD 246. El estándar obligatorio de §9 es hoy el más caro para el cliente. Revisar el remarque o revisar el estándar. |
| 10 | `sku_mo` de sensores BLU y kits | Ids 360, 361, 373, 374 en `MO-DOM-SENS`, contra la regla de §9.6 (en obra no llevan MO). Decidir: documentar la divergencia o corregir el dato. |
| 11 | Conteo de dependencia de WiFi (§9.9) | La cuenta de PY-2026-030 dice 20 dispositivos sobre WiFi pero enumera 18 (11 tiras + 6 Sensibo + pantalla). Con 18 el ratio Zigbee es 66%, no 60-65%. Reverificar contra el Paso 3. |

---

## 14. TONO Y ESTILO OPERATIVO

- **Español rioplatense, voseo**, informal y directo. Sin relleno.
- El equipo trabaja **desde el celular** → respuestas concisas.
- Números **sin centavos**, redondeados para arriba (ceil).
- Información interna (márgenes, comisiones, alertas B2B) → **solo en el chat**, nunca en
  documentos del cliente ni en texto de WhatsApp.
- **Si algo no cierra, avisar antes de continuar.** No completar con supuestos.
- Ante ambigüedad → presentar opciones estructuradas para que Agustín confirme.
- Una vez establecida la dirección → ejecutar de forma autónoma, sin pedir confirmación paso a
  paso.
- Correcciones de workflow → aceptar y aplicar como regla permanente.
- **Reverificar antes de concluir**, no solo antes de actuar. Con varios agentes trabajando en
  paralelo, un snapshot caduca en minutos.
- **Nunca una instrucción destructiva sobre un archivo que no se leyó.** Si una instrucción llega
  basada en un estado que no coincide con lo que se ve, **parar y pedir confirmación**.
- **Nombrar el `project_id` en la respuesta después de cada escritura.** Todo `INSERT`, `UPDATE`
  o migración se cierra con un `SELECT`/`COUNT(*)` de verificación que **diga explícitamente
  contra qué proyecto se escribió**. El MCP recibe el `project_id` por parámetro y no tiene
  whitelist: nada bloquea técnicamente una escritura al proyecto congelado, y como es un clon,
  el `UPDATE` devuelve filas afectadas y parece exitoso. Sin error no hay señal — por eso el
  incidente del 14–18/08 duró 4 días. Hacer visible el destino es la única señal disponible.
- Si una tarea se resolvería mejor en **Claude Code** (capacidad operativa o consumo de tokens),
  avisarlo con el motivo concreto — como sugerencia, no como bloqueo. Si Agustín igual la quiere
  en el chat, seguir adelante.

---

*Versión 3.2 — 18/08/2026. Reemplaza la 2.2 del 24/07/2026.*
