// auth-bridge.js
// Hasta el 14/08/2026 este archivo era un puente que intercambiaba la sesión del
// proyecto de auth central (Comercial) por un token corto válido en el proyecto
// de Cuadrilla/Obras, que era un proyecto Supabase separado. Obras se consolidó
// en Comercial ese día — ya no hay dos proyectos, y este archivo quedó solo con
// la lógica de sesión expirada, compartida entre módulos.

// ── SESIÓN EXPIRADA (compartido, 14/08/2026) ────────────────────
// Trigger genérico portado desde comercial/index.html (1B-3, a915562): un
// helper de fetch contra el proyecto de auth central (vvwnyszcfindtuvojqgs)
// llama a manejarSesionExpirada() cuando detecta que no hay sesión o que el
// server devuelve 401, en vez de caer a la anon key.
//
// Cada módulo que lo use debe tener en su HTML el mismo modal que ya existe
// en comercial/index.html (#modal-sesion / #modal-sesion-msg, con un botón
// que llame a irAReingresar()) — este archivo no inyecta DOM, solo la lógica.
//
// opts.hayTrabajoEnCurso / opts.backup son OPCIONALES: si un módulo tiene
// algo que perder (un carrito, un formulario a medio llenar), los pasa para
// respaldarlo antes de mostrar el modal. Sin ellos, se muestra el mensaje
// genérico de sesión cerrada. El backup de carrito de comercial NO se movió
// acá a propósito: es específico de su forma de estado, y en galeria hay un
// File seleccionado que no es serializable a JSON — cada módulo resuelve su
// propio backup, si lo necesita, y se lo pasa a esta función.
let _sesionExpiradaMostrada = false;

function manejarSesionExpirada(opts = {}) {
  if (_sesionExpiradaMostrada) return;
  _sesionExpiradaMostrada = true;
  const hayTrabajoEnCurso = typeof opts.hayTrabajoEnCurso === 'function' ? !!opts.hayTrabajoEnCurso() : false;
  if (hayTrabajoEnCurso && typeof opts.backup === 'function') opts.backup();
  const msgEl = document.getElementById('modal-sesion-msg');
  if (msgEl) {
    msgEl.textContent = hayTrabajoEnCurso
      ? 'Se cerró tu sesión, pero tu trabajo en curso quedó guardado. Reingresá para retomarlo donde lo dejaste.'
      : 'Se cerró tu sesión. Volvé a iniciar sesión para seguir trabajando.';
  }
  const modalEl = document.getElementById('modal-sesion');
  if (modalEl) modalEl.classList.add('open');
}

function cerrarModalSesion() {
  const modalEl = document.getElementById('modal-sesion');
  if (modalEl) modalEl.classList.remove('open');
  _sesionExpiradaMostrada = false;
}

function irAReingresar() {
  const next = encodeURIComponent(location.pathname + location.search);
  window.location.href = `/login?next=${next}`;
}
