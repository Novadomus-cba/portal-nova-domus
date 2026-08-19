// finance-utils.js
// Logica financiera compartida entre index.html (Panel Personal) y
// contable.html (Posicion Bancaria) para que el criterio de dias habiles /
// semaforo no se desincronice entre los dos. Reusable por cualquier modulo
// que necesite el mismo calculo.

function esFinDeSemana(date) {
  const day = date.getDay(); // 0=domingo, 6=sabado
  return day === 0 || day === 6;
}

// Suma n dias HABILES (excluye sabado/domingo, sin calendario de feriados —
// no pedido) a una fecha 'YYYY-MM-DD'. Devuelve 'YYYY-MM-DD'.
function addBusinessDays(fechaISO, n) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  let added = 0;
  while (added < n) {
    date.setDate(date.getDate() + 1);
    if (!esFinDeSemana(date)) added++;
  }
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// Suma calendario simple (para la ventana de referencia de 15 dias, que no es
// habil, es solo un rango informativo mas amplio).
function addCalendarDays(fechaISO, n) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// Regla vigente desde 2026-08-19 (reemplaza la version anterior con
// LIMITE_DESCUBIERTO fijo en el codigo, "no negociable" segun el kickoff
// original -- se renegocio con Agustin). El limite de descubierto ya no es
// una constante: se lee por cuenta desde la vista v_cuenta_limite_vigente en
// Supabase y el caller lo pasa como parametro. Si no hay fila vigente para la
// cuenta, el caller pasa limiteDescubierto=null -- no hay umbral conocido
// para ROJO, asi que el semaforo entero se devuelve null (no un color que
// nunca puede dar rojo).
// proyectado_2d_habiles = saldo_actual
//   - suma(monto de cheques EMITIDO/PENDIENTE con vencimiento hasta hoy+2 dias
//     habiles -- incluye los YA vencidos y no cobrados, no solo los que
//     vencen de hoy en adelante)
//   + suma(monto de cheques RECIBIDO/PENDIENTE con esa misma fecha de corte,
//     a favor -- misma ventana que los emitidos, no todos los recibidos
//     pendientes sin importar cuando se cobran).
// ROJO si ese proyectado cae bajo el limite de descubierto. AMARILLO si
// proyectado<0 sin llegar al limite (antes se miraba el signo de
// saldo_actual, no del proyectado -- un saldo_actual positivo con cheques
// emitidos pendientes que lo llevan a negativo ya no se mostraba VERDE).
// VERDE si proyectado>=0.
function calcularSemaforoFinanciero(saldoActual, chequesEmitidosPendientes, chequesRecibidosPendientes, hoyISO, limiteDescubierto) {
  const limiteVentana2d = addBusinessDays(hoyISO, 2);
  const chequesVentana2d = chequesEmitidosPendientes.filter(c =>
    c.fecha_efectivo <= limiteVentana2d
  );
  const totalVentana2d = chequesVentana2d.reduce((s, c) => s + Number(c.monto), 0);
  const chequesRecibidosVentana2d = chequesRecibidosPendientes.filter(c =>
    c.fecha_efectivo <= limiteVentana2d
  );
  const totalRecibidoVentana2d = chequesRecibidosVentana2d.reduce((s, c) => s + Number(c.monto), 0);
  const proyectado = saldoActual - totalVentana2d + totalRecibidoVentana2d;

  const semaforo = limiteDescubierto == null
    ? null
    : (proyectado < limiteDescubierto ? 'ROJO' : (proyectado < 0 ? 'AMARILLO' : 'VERDE'));

  return {
    semaforo,
    proyectado,
    totalVentana2d,
    chequesVentana2d,
    limiteVentana2dFecha: limiteVentana2d,
    limiteDescubierto,
  };
}

// Suma de importe en movimientos con fecha >= hoy-dias. `movimientos` debe
// venir con {fecha, importe} (fecha 'YYYY-MM-DD').
function netoEnVentana(movimientos, dias, hoyISO) {
  const desde = addCalendarDays(hoyISO, -dias);
  return movimientos
    .filter(m => m.fecha >= desde)
    .reduce((s, m) => s + Number(m.importe), 0);
}
