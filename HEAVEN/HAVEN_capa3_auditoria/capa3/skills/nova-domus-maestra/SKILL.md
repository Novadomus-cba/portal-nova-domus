---
name: nova-domus-maestra
description: "Skill maestra de Nova Domus (NDWD SAS, Córdoba, Argentina). Consolidación de conocimiento institucional, operativo y comercial de todos los proyectos activos. Usar SIEMPRE ante cualquier consulta sobre el negocio, presupuestos, márgenes, inventario, cuadrilla, obra, estrategia o gestión."
---

# Nova Domus — Skill Maestra Consolidada
> Versión 2.3 — Septiembre 2026 — Sesión Pankana-Ruda (La Calera, 02/09/2026): agregadas
> §9.1 (tiras LED 24V, regla de los 90 W por efecto — no 240 W por dispositivo), §9.2
> (ubicación del módulo Shelly RGBW PM en caja de derivación dedicada + MO-DOM-DIM en vez de
> MO-DOM-DIN) y §9.3 (criterio Sensibo según el cerebro — corrige el default "Sensibo Air
> PRO" de la tabla de estándares obligatorios, ver nota de corrección ahí mismo). Agregada
> regla general de disponibilidad de proveedor en §6.
>
> Versión 2.2 — Julio 2026 — Renombrado "Mapa de Instalación e Integración" → **"Plano de
> Instalación e Integración"** en toda la skill (en Argentina "mapa" y "plano" son cosas
> distintas — este documento es un plano técnico, no un mapa). No confundir con "Planos de
> obra" (los PDF/imágenes del arquitecto — Bocas y Llaves, Iluminación, etc.), que son un
> concepto aparte. Tabla/bucket de Supabase también renombrados (ver sección 11).

---

## 1. LA EMPRESA

**Nova Domus (NDWD SAS)**
- Rubro: domótica e integración tecnológica — smart home, redes, seguridad, AV
- Sede: Av. Colón 3835, Córdoba, Argentina
- CUIT: 30-71858914-9
- Web: nova-domus.com.ar / E-shop: novadomusdomotica.mitiendanube.com
- Contacto: admin@nova-domus.com.ar · 351 864-3455
- Slogan: "Habitamos espacios inteligentes"
- Miembro de CEDIA

### Equipo interno

| Nombre | Rol portal | Función real |
|--------|-----------|--------------|
| Agustín Davila | admin | Dueño. Arma todos los presupuestos de proyectos. Decisiones comerciales y técnicas. |
| Esteban Blanc | supervisor | Dirección de obra en campo. 3% comisión sobre cuadrilla. |
| Lucas Cañete | comercial | Carga jornales + gestión administrativa. |
| Maxi Wiersma | comercial | Ídem Lucas. |
| Mili | comercial | Equipo comercial (presupuestos menores). |
| Adolfo | comercial | Equipo comercial. |
| Martín | comercial* | Programación / commissioning. Se factura por hora. |
| **Obras** (`obras@nova-domus.com.ar`) | **programacion** | **Cuenta compartida** para instalación y programación (Martín + instaladores de campo). Sin cuentas individuales por persona todavía. Acceso de solo lectura al módulo Plano de Instalación (ver 5.4 y 11). |

*Nota: Martín no tiene cuenta individual en el portal — su acceso operativo es a través de la
cuenta compartida `obras@nova-domus.com.ar` (rol `programacion`), no del rol `comercial` de la
fila de arriba. Se deja la fila original sin borrar por trazabilidad histórica.

### Colaboradores y proveedores clave

| Nombre/Empresa | Rol |
|----------------|-----|
| Delia (contadora externa) | Impuestos, seguros, bancos. Soporte importante. |
| Esteban (Seguridad Centro) | Proveedor Hikvision |
| Denise (Masnet) | Networking, rack, UPS, fibra |
| Dystech | Control4, VSSL, Episode, Araknis, Triad |
| Homiq | Shelly, Home Assistant |

---

## 2. LÍNEAS DE NEGOCIO

### 2.1 Domótica y seguridad — proyectos de instalación (principal)
Proyectos llave en mano: Nova Domus provee materiales + mano de obra.
Ticket típico: **$2M – $10M ARS** por proyecto.
Canales: mix parejo entre arquitectos/estudios, clientes directos y desarrolladoras.
Incluye: domótica, redes, iluminación inteligente, videovigilancia, alarmas.

### 2.2 Obra eléctrica
Dos modalidades:
- **Integrada**: infraestructura eléctrica dentro de un proyecto mayor de domótica
- **Independiente**: proyecto eléctrico puro con su propio ciclo de presupuesto, control y supervisión

Incluye: cableado, tableros, tomas, protecciones (disyuntores, térmicas), puesta a tierra.
Requiere electricistas matriculados + certificación por arquitectos.
Misma estructura de márgenes que domótica.

### 2.3 Instalación de cerraduras digitales
Foco en Yale. Puede ser standalone o parte de un proyecto mayor.
Misma estructura de márgenes que domótica.

### 2.4 Desarrollo de software / apps a medida
Línea nueva, en desarrollo. Sin estructura de costos definida aún.

### 2.5 E-commerce
Tiendanube: novadomusdomotica.mitiendanube.com
Marcas: Yale, Philips Hue, Shelly, WiZ, Control4.
El cliente compra sin instalación.
Nova Domus es **distribuidor oficial de Philips Hue**.

---

## 3. ESTRUCTURA DE PRECIOS Y MÁRGENES

### 3.1 Presupuesto al cliente (proyectos de instalación)

Materiales y mano de obra se presentan **por separado** — nunca precio cerrado único.

**Materiales**: solo productos principales (Yale, Shelly, Hue, cableado de red, etc.). NO incluye herramientas ni viáticos de cuadrilla.

**Mano de obra**: 20–30% sobre el costo de materiales según complejidad.

### 3.2 Fórmula de costo y márgenes — proyectos de instalación

```
Mano de obra presupuestada = Materiales × 30%
Costo total = Materiales + MO presupuestada

Margen sobre dispositivos (Nova Domus): ~20%
Margen neto sobre MO (después de pagar técnicos): 20–30%
Margen neto efectivo objetivo: 25–30% SOBRE el costo total
Precio al cliente = Costo total × (1 + margen objetivo)
```

**Ejemplo:**
- Materiales: $1.000.000
- MO: $300.000 (30%)
- Costo total: $1.300.000
- Precio al cliente: ~$1.625.000–$1.690.000

### 3.3 Fórmula de precios — presupuestos comerciales (dispositivos)

**DIRECTIVA FUNDAMENTAL:** El IVA fluye entre débitos y créditos fiscales. Todos los márgenes y comisiones se calculan sobre valores SIN IVA. El IVA solo aparece en el precio final al cliente.

```
costo_base = precio_sin_iva (en USD)
costo_ars = precio_sin_iva × 1.21 × TC
```

**Si existe precio_sugerido_manual** (con IVA en ARS):
```
precio_sugerido_usd = precio_sugerido_manual / TC  ← NO dividir por 1.21
```

**Si NO existe precio_sugerido_manual:**
```
precio_sugerido_sin_iva_usd = precio_sin_iva × (1 + remarque)
precio_sugerido_con_iva_usd = precio_sin_iva × (1 + remarque) × 1.21
precio_sugerido_ars = precio_sin_iva × (1 + remarque) × 1.21 × TC
```

**Markup estándar sin precio de referencia:** remarque = 0.35 → margen sobre venta ~25.93%

### 3.4 Reglas B2C / B2B

**B2C:** precio_final = precio_sugerido_con_iva × 0.95 (5% OFF siempre)

**B2B:**
- Objetivo: 25% descuento sobre precio sugerido con IVA
- Margen mínimo: 20% / Margen máximo: 30%
- Si 25% mantiene margen entre 20–30% → aplicar 25%
- Si 25% supera 30% → ajustar para no pasar del 30%
- Si 25% baja del 20% → aplicar máximo posible manteniendo piso del 20%:
  `precio_final = precio_sin_iva × 1.20 × 1.21`
- Avisos de margen ajustado: **solo internos**, nunca en el documento del cliente

### 3.5 Dos métricas de rentabilidad

```
Margen sobre venta (para comisiones): (PVP_ars - costo_ars) / PVP_ars
Mark-up sobre costo (para descuentos): (PVP_ars / costo_ars) - 1
```

### 3.6 Mano de obra en presupuestos comerciales
- Con Factura A → MO con IVA 21%
- Sin Factura A → MO sin IVA
- Comisión NUNCA aplica sobre MO, solo sobre dispositivos

### 3.7 Comisión comercial
```
comision = margen_bruto_usd_sin_iva × 0.30
```
Siempre visible en el chat. **Nunca** en el documento del cliente ni en texto WhatsApp.

### 3.8 Prerrogativa de Agustín
Puede fijar precios custom (ej: precio pre-acordado con cliente). Se calcula el margen resultante, se avisa si está bajo el mínimo, se registra como director-aprobado.

---

## 4. CONDICIÓN FISCAL Y FACTURACIÓN

- **Condición:** Responsable Inscripto → factura con IVA 21%
- **Sistema:** directamente desde AFIP (sin software externo)
- **Comprobantes:** Factura A (a RI) o B (a consumidor final / monotributistas)
- **No hay software contable propio** — Delia lleva su registro externo

---

## 5. CICLO DE UN PROYECTO

### 5.1 Ciclo de cobro
1. **Anticipo de materiales**: el cliente paga los dispositivos antes de que Nova Domus los compre → flujo de caja positivo al inicio
2. **Certificados de MO**: se cobran por hitos/avance de obra (no todo al final)

### 5.2 Ciclo de estados
```
ENTREGADO → ACEPTADO / MODIFICACION_SOLICITADA → EN_OBRA → OBRA_ENTREGADA → FACTURADO → CERRADO / CANCELADO
```
"Entregado" dicho por el equipo = presupuesto entregado al cliente, esperando respuesta.

### 5.3 Ciclo de presupuestos comerciales
```
BORRADOR → ENVIADO → ACEPTADO → PAGADO → (copia a ventas)
                  ↘ RECHAZADO
                  ↘ VENCIDO (30 días)
```

### 5.4 Documentos disparados por estado ACEPTADO

Al pasar `proyectos.estado` a `ACEPTADO`, se disparan dos artefactos en simultáneo
(mismo trigger, distinto público — no son secuenciales, no llevan numeración de
"paso X luego paso Y" entre sí):

- **Paso 5a — Snapshot comercial**: congela los datos de venta ya existentes
  (proceso mecánico, ya implementado).
- **Paso 5b — Plano de Instalación e Integración**: documento técnico interno
  (NO público, NO cliente-facing, no va a GitHub Pages) para el equipo de
  instalación/programación. A diferencia del Snapshot, **no se autogenera por
  sistema** — el cambio de estado habilita/exige su creación, pero se arma en
  una sesión dedicada con Claude (mismo patrón que el primer caso, El Timbo:
  `el-timbo-mapa-instalacion-martin.html` — nombre de archivo histórico, previo
  al rename de terminología).

  Reglas fijas:
  - Siempre se arma a partir del detalle de dispositivos **ya aprobado en el
    Paso 3** (Resumen interno) de ese proyecto puntual — nunca se inventan
    cantidades nuevas acá.
  - Secciones obligatorias: topología de red (diagrama nodo/rama desde el
    router hasta cada sistema), distribución de rack U por U, plan de
    VLANs/WiFi, inventario de dispositivos por subsistema con detalle de
    integración a Home Assistant, reglas de programación, checklist de
    comisionado.
  - El `proyectos.numero` correlativo debe figurar tanto en este documento
    como en el HTML público (Paso 4).
  - Consumo: visible desde el módulo interno "Plano de Instalación" (ver 11),
    acceso restringido a roles `admin`, `supervisor` y `programacion` —
    nunca contiene precios, márgenes ni costos (eso vive exclusivamente en
    Comercial / Paso 3).
  - **No confundir con "Planos de obra"** (los PDF/imágenes del arquitecto —
    Bocas y Llaves, Iluminación, etc. — hoy en Drive, repositorio definitivo
    pendiente de decisión). Son dos conceptos distintos que conviven en el
    mismo módulo del portal: un Plano de Instalación por proyecto (topología/
    rack/VLANs) + una colección de Planos de obra (archivos del arquitecto).

---

## 6. COMPRA DE MATERIALES Y PROVEEDORES

- Varios distribuidores que **compiten por precio** (no hay proveedor exclusivo)
- Precios en **dólar oficial BNA o dólar blue** según proveedor; excepcionalmente en ARS
- Los presupuestos deben registrar el **tipo de cambio al momento de la compra**
- Forma de pago: mix según proveedor (contado, cuenta corriente, tarjeta)
- No se importa directamente ni se compra en MercadoLibre
- TC BNA: consultar `https://api.bluelytics.com.ar/v2/latest` → campo `official.value_sell`
- **La disponibilidad real del proveedor le gana al ahorro teórico.** Verificar stock antes
  de blindar un SKU en un presupuesto, especialmente si es la variante más económica de una
  línea — caso real: Sensibo Sky vs. Air B2B, ver §9.3.

---

## 7. INVENTARIO Y STOCK

### 7.1 Stock actual
- **Cerraduras Yale**: stock propio en depósito → reponer cuando baja
- **Resto** (Shelly, Hue, WiZ, materiales eléctricos): a pedido, se compra con anticipo del cliente

### 7.2 Qué se trackea
Solo dispositivos (Yale, Shelly, Hue, WiZ, Control4, EZVIZ, Hikvision, Ubiquiti, etc.).
No incluye materiales eléctricos menores ni herramientas de cuadrilla.
Hoy registrado en planilla Excel/Sheets → el portal lo reemplaza.

### 7.3 Supabase — tabla inventario
Campos clave: `id` (PK entero), `sku` (string), `nombre`, `marca`, `grupo`, `precio_sin_iva` (USD sin IVA — **NUNCA modificar salvo nueva lista del proveedor**), `iva` (default 0.21), `remarque` (markup), `precio_sugerido_manual` (ARS con IVA, nullable).

**Búsqueda:** usar `ILIKE '%keyword%'` en nombre y marca. Buscar por SKU como string, no entero.

---

## 8. CUADRILLA — REGLAS OPERATIVAS

- Semana laboral: **viernes a jueves** (técnicos reportan el viernes)
- Mínimo facturable: **6 horas por jornada**
- Campos: `jornal, almuerzo, traslados, peaje, km, otros, adelantos, compras, detalle`
- `neto = jornal + viáticos + otros + compras - adelantos` (compras son reembolsables)
- Esteban cobra **3% sobre (jornales + almuerzos)** del período

### Acceso por rol
| Módulo | admin | supervisor | comercial |
|--------|-------|------------|-----------|
| Carga de jornales | ✅ | ✅ | ✅ (solo carga) |
| Reportes / histórico | ✅ | ✅ | ❌ |
| Liquidación | ✅ | ✅ | ❌ |

### Liquidación semanal
- Período libre (selector inicio/fin, no semanas fijas)
- Campos manuales: Compras/Otros + KM/Peajes
- Total supervisor: pre-llenado automático (3% sobre jornales+almuerzos + manuales), editable
- **Costo Nova Domus** = neto cuadrilla + total supervisor

---

## 9. SELECCIÓN DE DISPOSITIVOS — JERARQUÍA TÉCNICA

**Protocolo (orden estricto):**
1. **Zigbee** — primera opción siempre (HA SkyConnect + HA Green, red mesh local, <100ms)
2. **WiFi Gen4** — si no hay variante Zigbee
3. **WiFi Gen3** — fallback
4. **Z-Wave — DESCARTADO SIEMPRE** (sin preguntar; solo informar que existía)

**Estándares obligatorios por proyecto:**

| Estándar | Cuándo aplica |
|----------|--------------|
| UPS | Todo proyecto con domótica o seguridad |
| Shelly Wall Display 4" | Proyectos chicos/medianos |
| Shelly Wall Display XL | Proyectos grandes |
| Rack de infraestructura | Proyectos grandes |
| Sensibo Air B2B | 1 por split en proyectos con climatización — **corregido 02/09/2026**, antes decía "Sensibo Air PRO"; criterio técnico y motivo del cambio en §9.3 |
| Teclado de alarma + sirena interior | Departamentos (obligatorio) |
| Sirena exterior | Viviendas completas (obligatoria) |

**Shelly y Philips Hue son complementarios:**
- Shelly: retrofit de interruptores existentes, circuitos de pared
- Hue: iluminación nueva con necesidad de color/escenas
- Un mismo proyecto puede tener ambos, integrados a Home Assistant vía Hue Bridge

### 9.1 Tiras LED 24V — regla de los 90 W

El umbral que separa RGBW PM de 0/1-10V **no es el límite de potencia del dispositivo**
(240 W nominal del Plus RGBW PM) — es **90 W por efecto**, después del derating obligatorio.

**Derating obligatorio:** estos módulos van en tablero o caja cerrada. El datasheet declara
40°C de ambiente máximo, y un gabinete cerrado en verano de Córdoba lo supera. Diseñar
siempre al 75% del nominal, nunca al 100%:

| Módulo | Inventario | Nominal (datasheet) | Techo de diseño (75%) |
|---|---|---|---|
| Shelly Plus RGBW PM | id 399, ~USD 29,97 s/IVA | 4 canales, 4A/canal, 10A total, 24V DC → 96 W/canal, 240 W/dispositivo | 72 W/canal, 180 W/dispositivo |
| Shelly Dimmer 0/1-10V PM Gen3 | id 400, ~USD 32,90 | comanda el driver por señal analógica — la corriente NO pasa por el módulo, sin límite propio | limitado por la fuente, no por el módulo |
| Shelly Pro RGBWW PM | id 411, ~USD 76,65 | DIN, 5 canales, 6A/canal, 16A total → 144 W/canal, 384 W nominal | uso puntual — no es el estándar de esta regla |

Nota de remarque: el 0/1-10V (id 400) tiene remarque 0,80 con `precio_sugerido_manual`
cargado — dispara la alerta de remarque alto (§3.4/§13) y es legítimo, sale del PVP igual.

**Regla de decisión — por efecto, no por dispositivo:**

| Efecto | Elegir | Motivo |
|---|---|---|
| ≤ 72 W | RGBW PM, 1 canal — agrupar 4 efectos por dispositivo | ~USD 22/efecto — acá el RGBW PM gana 4 a 1 |
| 72–90 W | RGBW PM, 2 canales — máx. 2 efectos por dispositivo | último tramo donde el RGBW PM sigue siendo la opción |
| 90–180 W | Dimmer 0/1-10V sobre driver dimerizable | desde acá el RGBW PM necesita dispositivo dedicado (USD 89,71/efecto); el 0/10 sale similar (USD 92,64) pero es mejor técnicamente: sin carga por el módulo, sin límite de potencia, sin riesgo térmico, conserva medición de consumo |
| > 180 W | 0/1-10V obligatorio | dos RGBW PM en paralelo sobre la misma carga cuesta el doble y es mala praxis |

**Contar efectos, no tiras ni fuentes.** Un efecto es un circuito que se comanda como
unidad. El agrupamiento en dispositivos respeta planta y tablero: no se agrupan efectos de
plantas distintas en un mismo módulo.

**Dependencia externa:** el 0/10 exige fuente dimerizable 0-10V, y la fuente es del
proveedor de iluminación, no de Nova Domus. Se pide SIEMPRE por consulta formal al estudio,
nunca se asume — es un pedido sin riesgo: si lo niegan, se vuelve a RGBW PM dedicado y el
presupuesto se mueve ~3%.

### 9.2 Ubicación del módulo y mano de obra correspondiente

El Plus RGBW PM **no es riel DIN**: es un módulo de embutir de 42×37×12mm con bornes a
tornillo. Va del lado del tablero (ahí está la fuente 24V), pero en una **caja de
derivación plástica dedicada montada al lado del tablero**, no dentro del gabinete
metálico:

- **WiFi**: varios módulos WiFi dentro de un gabinete metálico cerrado es un problema real
  de señal — la caja plástica lo resuelve.
- **Calor**: el calor lo generan las fuentes, no los módulos. Separarlos da el margen
  térmico que pide el derating del 75% (§9.1).
- **Acceso**: se revisa o cambia un módulo sin abrir el tablero de potencia.

**Consecuencia de costeo:** el trabajo es módulo-en-caja, no armado de riel DIN → corresponde
**MO-DOM-DIM (USD 59,74)**, NO MO-DOM-DIN (USD 95,22). MO-DOM-DIN se reserva para
dispositivos realmente DIN: Shelly Pro 2PM, Pro RGBWW PM, Pro Dimmer. Sumar al BOM la caja
de derivación y su organización como ítem propio, nunca escondida en el precio del módulo.

**Observación técnica a trasladar al estudio cuando corresponda:** un circuito de 135 W a
24V son 5,6A, y con la fuente en tablero la corrida de DC hasta la tira puede ser larga. La
caída de tensión en 24V es severa; si hay corridas largas, el problema es la sección del
cable de DC (incumbencia del proveedor de iluminación), no el módulo de comando.

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

⚠️ **Decisión de Agustín (sep 2026):** en la práctica se cotiza el **id 325 (Air B2B)**,
porque los proveedores no están trayendo el Sky y no vale el riesgo de faltante de stock
(regla general en §6). Esto corrige el default "Sensibo Air PRO" que tenía la tabla de
estándares obligatorios de este mismo capítulo.

Nota de precios: el Air B2B (174,74) está a solo USD 5 del Air PRO (180). Si el cliente pide
específicamente "Air", cotizar directo el PRO.

---

## 10. FINANZAS Y ADMINISTRACIÓN

- **Cuentas**: varias separadas — empresa, personal, USD
- **Cobro a clientes**: mix según cliente (transferencia, cheque/e-cheq, efectivo)
- **Contadora Delia**: maneja impuestos, seguros y bancos — soporte clave
- **Flujo de caja interno**: hoy informal/intuitivo → el portal lo formaliza progresivamente
- **No hay software contable propio**

---

## 11. STACK TÉCNICO

### Portal interno (portalnovadomus.pages.dev)
- Frontend: HTML + CSS + JS vanilla, un archivo por módulo, mobile-first
- Auth + Comercial/Inventario: Supabase `vvwnyszcfindtuvojqgs`
- Cuadrilla/Obras: Supabase `voowjwzlkhdknpapkhxc`
- Hosting: Cloudflare Pages (deploy por push a GitHub)
- Código en inglés; UI en español
- Fetch: siempre `.text()` + `JSON.parse()`, nunca `.json()` directamente
- CDN Supabase: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

### Panel comercial (presupuestos)
- GitHub Pages: `https://novadomuscba.github.io/presupuestos/panel.html`
- Link cliente: `https://novadomuscba.github.io/presupuestos/?id={ID}`
- TC BNA API: `https://api.bluelytics.com.ar/v2/latest`

### Plano de Instalación + Planos de obra (módulo nuevo — construido, en QA)
- Carpeta portal: `plano-instalacion/index.html`
- Objetivo: que Martín/instaladores/Agustín vean el Plano de Instalación (5b) y los
  Planos de obra (Bocas y Llaves, Iluminación, etc.) de cualquier proyecto en curso, en
  cualquier momento — no solo al entregarlo una vez.
- Acceso: Supabase Auth existente, cuenta compartida `obras@nova-domus.com.ar`
  (rol `programacion`, solo lectura en este módulo) + `admin` + `supervisor`
  (lectura y escritura). NO usa enlace/contraseña compartida por fuera del sistema de auth.
- Alcance confirmado: **solo topología (Plano de Instalación) + Planos de obra — nada de
  precios/márgenes/costos** (eso es exclusivo del módulo Comercial).
- Supabase (proyecto `vvwnyszcfindtuvojqgs`):
  - Tabla `proyectos_planos_instalacion (id, proyecto_id → proyectos.id, storage_path,
    version, generado_por, generado_en, notas)` — RLS: lectura admin/supervisor/programacion,
    escritura solo admin/supervisor.
  - Bucket privado `planos-instalacion` (solo `text/html`, 10MB) — mismo criterio de RLS.
    (Bucket viejo `mapas-instalacion`, de la primera versión antes del rename, quedó vacío y
    huérfano — pendiente borrarlo a mano desde el dashboard de Supabase, no se puede por SQL.)
- Planos de obra: hoy en Google Drive (Workspace pago, carpeta raíz
  `1rgzzZmxFjNuU2cPLTI3qOPMn86Kfp2MF`). Repositorio definitivo (Drive por
  dominio vs. migración a Supabase Storage) **pendiente de definir** — la sección
  correspondiente en el módulo hoy es un placeholder ("Planos del proyecto —
  repositorio en definición, próximamente").

### Estado de módulos del portal
| Módulo | Estado |
|--------|--------|
| Auth / login | ✅ Completo |
| Index / dashboard | ✅ Completo |
| Cuadrilla | 🔶 Funcional, faltan reportes y validaciones |
| Liquidación | 🔶 Funcional, falta exportación PDF |
| Obras | 🔶 Base construida, falta ciclo de estados completo |
| Comercial | 🔶 Base construida, falta PDF presupuesto y lista de precios |
| Inventario | ❌ No iniciado |
| Dashboard gerencial | ❌ No iniciado |
| Plano de Instalación + Planos de obra | 🔶 Construido y desplegado, sin ningún Plano cargado todavía (QA en curso). Planos de obra: solo placeholder, repositorio pendiente. |

---

## 12. IDENTIDAD DE MARCA

**Paleta de color:**
- `#141e61` — azul oscuro principal
- `#787a91` — gris azulado
- `#0b132b` — negro azulado profundo
- `#fdfbf0` — blanco cálido
- `#c8a96e` — gold (portal interno)

**Design system portal:** `--bg:#0d0f12 / --surface:#151821 / --border:#232733 / --accent:#c8a96e`

---

## 13. PROBLEMAS CONOCIDOS Y DECISIONES TOMADAS

| # | Problema | Estado / Resolución |
|---|----------|---------------------|
| 1 | EZVIZ — remarque desactualizado con TC actual (~$1.498) | Pendiente. Mientras tanto: máximo descuento posible manteniendo 20% margen. |
| 2 | tipo_linea en DB solo acepta `'DISPOSITIVO'` o `'SERVICIO'` (uppercase) | Confirmado. Rechaza `'MO'`, `'MANO_DE_OBRA'`, lowercase. |
| 3 | Campos numéricos en líneas SERVICIO | Usar `0` (no NULL) para todos los campos de precio/costo. |
| 4 | cotizaciones — columna `updated_at` ✓ / `fecha_actualizacion` ✗ (no existe) | Confirmado. |
| 5 | SKUs duplicados en inventario (ej: Shelly Wall Display XL) | Flagear para cleanup manual. |
| 6 | precio_sugerido_manual ya incluye IVA en ARS | `precio_sugerido_usd = precio_sugerido_manual / TC` — NO dividir por 1.21. |
| 7 | Venta parcial de presupuesto | Siempre confirmar qué ítems exactos se incluyen antes de registrar. |
| 8 | remarque es mark-up, no multiplicador directo | `precio = costo × (1 + remarque)` ✓ / `precio = costo × remarque` ✗ |
| 9 | Yale XTR 226-2.0 (id 631, SKU 16471) | Flagueado como descontinuado. Pendiente decisión eliminar/desactivar. |
| 10 | Repositorio de Planos de obra (Drive vs. Supabase Storage) | Pendiente. Workspace pago disponible, evaluar compartir por dominio vs. migrar. |
| 11 | Bucket huérfano `mapas-instalacion` (pre-rename), vacío | Pendiente borrar a mano desde el dashboard de Supabase (no se puede por SQL — protección `storage.protect_delete()`). |

---

## 14. TONO Y ESTILO OPERATIVO

- Español rioplatense, voseo, informal, directo
- El equipo trabaja desde el celular → respuestas concisas
- Números siempre sin centavos, redondeados para arriba (ceil)
- Información interna (márgenes, comisiones, alertas B2B) → solo en el chat, nunca en documentos del cliente ni texto WhatsApp
- Si algo no cierra → avisar antes de continuar
- Cuando hay ambigüedad → presentar opciones estructuradas para que el usuario confirme
- Una vez establecida la dirección → ejecutar autónomamente sin pedir confirmación paso a paso
- Correcciones de workflow → aceptar y aplicar como regla permanente

---

*Consolidado: 24/07/2026 — Fuentes: Proyecto Portal, Proyecto Comercial, Proyecto Gerencial*
