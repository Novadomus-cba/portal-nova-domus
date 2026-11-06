/*
 * Nova Domus — proposal open tracking (v2).
 *
 * Include at the end of every proposal, with a path relative to the file:
 *   <script src="../assets/propuesta-track.js" defer></script>
 * The proposal code comes from <meta name="py-codigo" content="PY-2026-NNN">.
 * Paused proposals add data-pausa to the tag.
 *
 * What it records (Supabase, anon insert-only):
 *   propuesta_vistas  one row per page load: code, path, host, referrer, user agent, screen,
 *                     language, time zone, browser id (localStorage), session id,
 *                     recipient token (?r=<token>, remembered per document), staff flag.
 *   propuesta_eventos 'fin' (seconds visible + max scroll %) when the page is hidden/closed,
 *                     'click' for links/buttons marked data-track or WhatsApp/mailto/tel,
 *                     'seccion' when a <details> with data-track (or an id) is opened.
 *
 * Staff: if the browser holds a portal session for this Supabase project (same host),
 * the open is flagged es_staff and excluded from client counts.
 * Opening the file locally (file://) records nothing.
 */
(function () {
  'use strict';
  try {
    if (location.protocol !== 'https:') return;

    var SUPABASE_URL = 'https://vvwnyszcfindtuvojqgs.supabase.co';
    var KEY = 'sb_publishable_zLCL1igTj-30B0THXMQqvQ_qXwgJBEP';
    var STORAGE_SESSION_KEY = 'sb-vvwnyszcfindtuvojqgs-auth-token';

    var tag = document.currentScript;
    var metaCodigo = document.querySelector('meta[name="py-codigo"]');
    var codigo = (metaCodigo && metaCodigo.content) || 'SIN-CODIGO';
    var pausada = !!(tag && tag.hasAttribute('data-pausa'));
    var documento = location.pathname.replace(/^.*\//, '').replace(/\.html$/, '') || 'index';

    function store(k, v) {
      try {
        if (v === undefined) return localStorage.getItem(k);
        localStorage.setItem(k, v);
      } catch (e) { return null; }
    }

    function uuid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }

    var visitanteId = store('nd_vid');
    if (!visitanteId) { visitanteId = uuid(); store('nd_vid', visitanteId); }
    var sesionId = uuid();

    // Recipient token: from the URL, otherwise the one this browser arrived with before.
    var tokenKey = 'nd_r_' + documento;
    var token = null;
    try { token = new URLSearchParams(location.search).get('r'); } catch (e) {}
    if (token && /^[a-z0-9]{6,16}$/.test(token)) store(tokenKey, token);
    else token = store(tokenKey);

    var esStaff = !!store(STORAGE_SESSION_KEY);

    function post(table, body) {
      return fetch(SUPABASE_URL + '/rest/v1/' + table, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          'apikey': KEY,
          'Authorization': 'Bearer ' + KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(body)
      });
    }

    function cut(s, n) { return s == null ? null : String(s).slice(0, n); }

    var base = {
      propuesta_codigo: cut(codigo, 60),
      url_path: cut(location.pathname, 500),
      referrer: cut(document.referrer || null, 500),
      user_agent: cut(navigator.userAgent, 500)
    };
    var vista = Object.assign({}, base, {
      visitante_id: visitanteId,
      sesion_id: sesionId,
      destinatario_token: token || null,
      host: cut(location.host, 120),
      es_staff: esStaff,
      pausada: pausada,
      pantalla: cut(screen.width + 'x' + screen.height, 20),
      idioma: cut(navigator.language || null, 20),
      zona_horaria: cut((Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || null, 60)
    });

    // If the schema is older than this script, fall back to the legacy payload so the open is
    // never lost.
    post('propuesta_vistas', vista).then(function (res) {
      if (!res.ok) {
        var legacy = Object.assign({}, base);
        if (pausada) legacy.url_path = cut(location.pathname + ' [PAUSA]', 500);
        return post('propuesta_vistas', legacy);
      }
    }).catch(function () {});

    function evento(tipo, extra) {
      try {
        post('propuesta_eventos', Object.assign({
          sesion_id: sesionId,
          propuesta_codigo: cut(codigo, 60),
          tipo: tipo
        }, extra)).catch(function () {});
      } catch (e) {}
    }

    // Time visible + scroll depth, sent once when the page goes to background or closes.
    var visibleMs = 0;
    var visibleDesde = document.visibilityState === 'visible' ? Date.now() : null;
    var scrollMax = 0;
    var finEnviado = false;

    function medirScroll() {
      var doc = document.documentElement;
      var alto = Math.max(doc.scrollHeight - window.innerHeight, 1);
      var pct = Math.min(100, Math.round((window.scrollY / alto) * 100));
      if (pct > scrollMax) scrollMax = pct;
    }
    window.addEventListener('scroll', medirScroll, { passive: true });

    function enviarFin() {
      if (visibleDesde) { visibleMs += Date.now() - visibleDesde; visibleDesde = null; }
      if (finEnviado || visibleMs < 1000) return;
      finEnviado = true;
      medirScroll();
      evento('fin', {
        duracion_s: Math.min(86400, Math.round(visibleMs / 1000)),
        scroll_max_pct: scrollMax
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        enviarFin();
      } else {
        visibleDesde = Date.now();
        // Coming back counts as a new reading; the next hide sends another 'fin'.
        finEnviado = false;
        visibleMs = 0;
      }
    });
    window.addEventListener('pagehide', enviarFin);

    // Clicks: explicit data-track, plus WhatsApp / mail / phone links.
    var clicksEnviados = {};
    document.addEventListener('click', function (ev) {
      var el = ev.target && ev.target.closest && ev.target.closest('[data-track], a[href]');
      if (!el || el.tagName === 'DETAILS') return; // sections are counted by the toggle handler
      var etiqueta = el.getAttribute('data-track');
      if (!etiqueta && el.tagName === 'A') {
        var href = el.getAttribute('href') || '';
        if (/wa\.me|whatsapp/i.test(href)) etiqueta = 'whatsapp';
        else if (/^mailto:/i.test(href)) etiqueta = 'email';
        else if (/^tel:/i.test(href)) etiqueta = 'telefono';
      }
      if (!etiqueta || clicksEnviados[etiqueta]) return;
      clicksEnviados[etiqueta] = true;
      evento('click', { etiqueta: cut(etiqueta, 120) });
    }, true);

    // Opened sections: <details data-track="..."> (falls back to its id).
    // <details open> in the markup also fires 'toggle' on load; ignore the first moments.
    var seccionesDesde = Date.now() + 1500;
    var seccionesEnviadas = {};
    document.addEventListener('toggle', function (ev) {
      var d = ev.target;
      if (!d || d.tagName !== 'DETAILS' || !d.open || Date.now() < seccionesDesde) return;
      var etiqueta = d.getAttribute('data-track') || d.id;
      if (!etiqueta || seccionesEnviadas[etiqueta]) return;
      seccionesEnviadas[etiqueta] = true;
      evento('seccion', { etiqueta: cut(etiqueta, 120) });
    }, true);
  } catch (e) {}
})();
