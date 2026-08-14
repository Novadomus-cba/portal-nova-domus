// auth-bridge.js
// Puente de autenticacion: intercambia la sesion del proyecto de auth central
// (vvwnyszcfindtuvojqgs) por un token corto valido en el proyecto de Cuadrilla/Obras
// (voowjwzlkhdknpapkhxc). Reusable por cualquier modulo que necesite pegarle a esa base.

const CUADRILLA_URL = 'https://voowjwzlkhdknpapkhxc.supabase.co';
const CUADRILLA_PUBLISHABLE_KEY = 'sb_publishable_Okp100SpYnETZpDyUbyy0w_r9pW8Qm8';

let _cuadrillaToken = null;
let _cuadrillaTokenExpiresAt = 0;
let _cuadrillaExchangePromise = null;

async function _exchangeCuadrillaToken(authClient) {
  const { data: { session } } = await authClient.auth.getSession();
  if (!session) {
    throw new Error('No hay sesion activa en el proyecto de auth central');
  }

  const res = await fetch(`${CUADRILLA_URL}/functions/v1/exchange-jwt`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: CUADRILLA_PUBLISHABLE_KEY,
    },
  });
  const text = await res.text();
  const data = JSON.parse(text); // regla del proyecto: nunca .json() directo
  if (!res.ok) throw new Error(data.error || 'Fallo el intercambio de token');

  _cuadrillaToken = data.access_token;
  _cuadrillaTokenExpiresAt = Date.now() + data.expires_in * 1000;
  return _cuadrillaToken;
}

/**
 * Devuelve un token corto valido en voowjwzlkhdknpapkhxc, obtenido a partir de
 * la sesion activa en el proyecto de auth central. Cachea el token y solo
 * vuelve a pedirlo cuando esta por vencer (o si todavia no se pidio nunca).
 * @param {object} authClient - cliente de Supabase ya creado contra vvwnyszcfindtuvojqgs
 */
async function getCuadrillaToken(authClient) {
  if (_cuadrillaToken && Date.now() < _cuadrillaTokenExpiresAt - 60000) {
    return _cuadrillaToken;
  }
  if (!_cuadrillaExchangePromise) {
    _cuadrillaExchangePromise = _exchangeCuadrillaToken(authClient).finally(() => {
      _cuadrillaExchangePromise = null;
    });
  }
  return _cuadrillaExchangePromise;
}

/**
 * Headers listos para pegarle directamente a /rest/v1/... de voowjwzlkhdknpapkhxc.
 * @param {object} authClient
 * @param {object} [extra] - headers adicionales (Content-Type, Prefer, etc.)
 */
async function getCuadrillaHeaders(authClient, extra) {
  const token = await getCuadrillaToken(authClient);
  return Object.assign(
    { apikey: CUADRILLA_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    extra || {}
  );
}

/**
 * Cliente de supabase-js contra voowjwzlkhdknpapkhxc, para modulos que
 * prefieran ese estilo en vez de fetch crudo.
 * @param {object} authClient
 */
async function getCuadrillaClient(authClient) {
  const token = await getCuadrillaToken(authClient);
  const { createClient } = supabase; // global de @supabase/supabase-js via CDN
  return createClient(CUADRILLA_URL, CUADRILLA_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

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
