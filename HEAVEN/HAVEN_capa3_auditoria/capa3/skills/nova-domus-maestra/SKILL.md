---
name: nova-domus-maestra
description: "Skill maestra de Nova Domus (NDWD SAS, Córdoba, Argentina). Consolidación de conocimiento institucional, operativo y comercial de todos los proyectos activos. Usar SIEMPRE ante cualquier consulta sobre el negocio, presupuestos, márgenes, inventario, cuadrilla, obra, estrategia o gestión."
---

# Nova Domus — Skill Maestra Consolidada
> Versión 2.4 — Septiembre 2026 — Sesión PY-2026-030 "La Pankana - Ruda Orpianesi" (La
> Calera, 02-03/09/2026). **Reemplaza la versión 2.3**, que tenía mal el bloque de
> topología de módulos de iluminación (mezclaba el criterio de relés de punto de luz con
> el de tiras LED 24V bajo un mismo §9.2). Cambios: **corrige** el piso de margen B2B en
> §3.4 (era markup sobre costo, no margen sobre venta — agrega §3.9); **corrige y separa**
> la topología de relés/dimmers de punto de luz (§9.1, nueva) de la de tiras LED 24V
> (§9.2, reescrita); **corrige** el default cableado-gana-por-costo en seguridad (§9.4);
> **corrige** la composición de los kits de sensores Shelly (§9.6). Agrega §9.3 (addenda
> Sensibo), §9.5 (lectura de planos), §9.7 (Omada vs. Deco), §9.8 (Starlink), §9.9
> (dependencia real del WiFi), nota UPS en §9, y §7.4 (correcciones de datos ya aplicadas
> en Supabase).
>
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
- Margen mínimo: 20% / Margen máximo: 30% — **siempre sobre venta** (ver §3.5), nunca
  sobre costo
- Si 25% mantiene margen entre 20–30% s/venta → aplicar 25%
- Si 25% supera 30% s/venta → ajustar para no pasar del 30%
- Si 25% baja del 20% s/venta → aplicar el piso:
  `precio_final = precio_sin_iva × (1 + iva) / 0.80`
  **(CORREGIDO 03/09/2026 — antes decía `precio_sin_iva × 1.20 × 1.21`. Esa fórmula no da
  un margen del 20%: da un *markup* del 20% sobre costo, que sobre venta equivale a
  16,67%. Convivía con la convención de MO del Paso 3 (`margen_mo = precio × 0.20`), que
  sí es 20% sobre venta — el resumen interno mezclaba dos bases y el margen del proyecto
  aparecía por debajo del piso cuando en realidad no lo estaba. La fórmula correcta,
  `/ 0.80`, equivale a costo × 1,25. Efecto práctico: sube ~4% el precio de todos los
  ítems que tocan el piso.)**
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

### 3.9 Piso B2B en la práctica

En el resumen interno del Paso 3 mostrar **siempre dos columnas de margen — s/costo y
s/venta** — para que no vuelva a pasar la confusión de §3.4. La que gobierna las
decisiones es s/venta.

Con el remarque por defecto de 0,35 el objetivo de 25% de descuento casi nunca alcanza a
bajar hasta el piso, así que casi todo el equipamiento de terceros (TP-Link/Omada,
Hikvision, NVR, videoportero, Sensibo, UPS, rack GLC, discos Seagate) termina en el piso y
recibe menos descuento que el 25% nominal. Es esperable, no es un bug — y es
estrictamente interno: nunca se le aclara al cliente que no se llegó al 25%.

Caso testigo PY-2026-030: margen de equipo 18,2% → 20,2% s/venta tras la corrección;
margen del proyecto completo 18,8% → 20,1%.

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

### 7.4 Correcciones de datos aplicadas (02/09/2026 — sesión PY-2026-030)

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

**Nota UPS — el argumento comercial real:** las cámaras PoE y el grabador siguen
funcionando en un corte de luz **no** por ser PoE, sino porque el switch que las alimenta
está sobre el UPS. Sin UPS se apagan igual que todo lo demás. Es el argumento que
justifica el UPS y evita que el cliente lo lea como un adicional caprichoso — es un error
frecuente atribuirlo al PoE. Dimensionar siempre a la carga real del rack.

**Shelly y Philips Hue son complementarios:**
- Shelly: retrofit de interruptores existentes, circuitos de pared
- Hue: iluminación nueva con necesidad de color/escenas
- Un mismo proyecto puede tener ambos, integrados a Home Assistant vía Hue Bridge

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
cargado — dispara la alerta de remarque alto (§3.4/§13) y es legítimo, sale del PVP igual.

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
entran en la base del % de programación. MO-DOM-SENS (USD 27,82) es exclusivo de
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
Gen4 sobre Zigbee (malla propia, independiente del WiFi) contra 20 sobre WiFi — 11
módulos de tira de la línea Plus/Pro (§9.2, que NO son Zigbee), más 6 Sensibo y la
pantalla. Los sensores BLU van por Bluetooth con gateway y la alarma tiene radio propia;
cámaras y grabador son cableados. O sea ~60-65% Zigbee, no 80%.

Y los módulos de tira son WiFi **y** van en el tablero, que es justo donde la cobertura es
peor: es un argumento **a favor** de la red profesional (§9.7), no en contra. Decir el
número real es más creíble que exagerar.

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
| 1 | EZVIZ — remarque desactualizado con TC actual (~$1.498) | Pendiente. **Corregido 03/09/2026:** no forzar siempre el máximo descuento — aplicar las reglas B2B normales (§3.4/§3.9): objetivo 25% de descuento, piso 20% de margen **sobre venta** (`precio_sin_iva × (1+iva) / 0.80`), igual que cualquier otra marca. |
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
