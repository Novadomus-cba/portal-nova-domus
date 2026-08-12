// finance-utils.js
// Logica financiera compartida entre index.html (Panel Personal) y
// contable.html (Posicion Bancaria) para que el criterio de dias habiles /
// semaforo no se desincronice entre los dos. Reusable por cualquier modulo
// que necesite el mismo calculo.

const LIMITE_DESCUBIERTO = -4500000;

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

// Regla acordada con Agustin (no negociable, ver kickoff):
// proyectado_2d_habiles = saldo_actual - suma(monto de cheques EMITIDO/PENDIENTE
// que vencen entre hoy y hoy+2 dias habiles, ambos inclusive).
// ROJO si ese proyectado cae bajo el limite de descubierto (manda sobre el
// signo de saldo_actual). AMARILLO si saldo_actual<0 sin llegar al limite.
// VERDE si saldo_actual>=0. Solo EMITIDO entra en la cuenta -- RECIBIDO se
// gestiona aparte al depositarlo.
function calcularSemaforoFinanciero(saldoActual, chequesEmitidosPendientes, hoyISO) {
  const limiteVentana2d = addBusinessDays(hoyISO, 2);
  const chequesVentana2d = chequesEmitidosPendientes.filter(c =>
    c.fecha_efectivo >= hoyISO && c.fecha_efectivo <= limiteVentana2d
  );
  const totalVentana2d = chequesVentana2d.reduce((s, c) => s + Number(c.monto), 0);
  const proyectado = saldoActual - totalVentana2d;

  const semaforo = proyectado < LIMITE_DESCUBIERTO ? 'ROJO' : (saldoActual < 0 ? 'AMARILLO' : 'VERDE');

  return {
    semaforo,
    proyectado,
    totalVentana2d,
    chequesVentana2d,
    limiteVentana2dFecha: limiteVentana2d,
    limiteDescubierto: LIMITE_DESCUBIERTO,
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
