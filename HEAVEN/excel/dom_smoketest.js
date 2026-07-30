// Smoke test for propuestas/haven.html's inline <script>: stubs a minimal DOM, loads the real
// script inside it, and exercises every reachable domToggle() combination × both tipologías,
// verifying the CAMBIO 3/4 linkage (bloque fijo + capa de unidad, segmented bar, incidence calc)
// never double-counts and always reconciles to the values already validated against the Excel.
const fs = require('fs');
const vm = require('vm');

function makeEl(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    value: '',
    dataset: {},
    style: {},
    classList: {
      _set: new Set(),
      add(...c) { c.forEach(x => this._set.add(x)); },
      remove(...c) { c.forEach(x => this._set.delete(x)); },
      toggle(c, force) { if (force === undefined) { this._set.has(c) ? this._set.delete(c) : this._set.add(c); } else { force ? this._set.add(c) : this._set.delete(c); } },
      contains(c) { return this._set.has(c); },
    },
    addEventListener() {},
    appendChild() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    getElementsByTagName() { return []; },
    offsetWidth: 100,
  };
}

const elements = new Map();
function getEl(id) {
  if (!elements.has(id)) elements.set(id, makeEl(id));
  return elements.get(id);
}

const documentStub = {
  getElementById(id) { return getEl(id); },
  querySelectorAll(sel) { return []; },
  querySelector(sel) { return null; },
  addEventListener() {},
  createElement() { return makeEl('tmp'); },
};

const sandbox = {
  document: documentStub,
  window: { matchMedia: () => ({ matches: false }) },
  performance: { now: () => 0 },
  requestAnimationFrame: (fn) => {},
  setTimeout: (fn) => {},
  console,
};
vm.createContext(sandbox);

const html = fs.readFileSync(process.argv[2] || 'propuestas/haven.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const main = scripts.reduce((a, b) => a.length >= b.length ? a : b);

vm.runInContext(main, sandbox, { filename: 'haven-inline.js' });
// top-level let/const bindings aren't own-properties of the context object; re-export them
// explicitly (executed in the same context, so the bindings are still in lexical scope here).
vm.runInContext(
  'globalThis.__EXPORTS__ = { DOM_PATHS, DOM_UNIDADES, DOM_VENTA, domSel, INVEST, BLOQUE_FIJO_TOTAL, ' +
  'domToggle, domPathKey, domTot, domEq, setDomTipo, renderDom, renderInvest, capaUnidadInfo };',
  sandbox
);
Object.assign(sandbox, sandbox.__EXPORTS__);

const { DOM_PATHS, DOM_UNIDADES, DOM_VENTA } = sandbox;

// ---- Exercise every reachable state from the state machine, both tipologías ----
const sequences = {
  base: [],
  u1a: ['u1a'],
  u2a: ['u1a', 'u2a'],
  cb: ['cb'],
  u3: ['u3'],
};
let failures = 0;
for (const tipo of ['1d', '2d']) {
  sandbox.setDomTipo(tipo);
  for (const [name, clicks] of Object.entries(sequences)) {
    // reset to base
    sandbox.domSel.u1a = false; sandbox.domSel.u2a = false; sandbox.domSel.cb = false; sandbox.domSel.u3 = false;
    sandbox.renderDom();
    for (const id of clicks) sandbox.domToggle(id);
    const key = sandbox.domPathKey();
    if (key !== name) { console.log(`FAIL sequence ${name} (${tipo}): domPathKey()=${key}`); failures++; continue; }
    const tot = sandbox.domTot(key), eq = sandbox.domEq(key), mo = tot - eq;
    const expectedTot = Math.ceil(DOM_PATHS[key][tipo].tot);
    const expectedEq = Math.ceil(DOM_PATHS[key][tipo].eq);
    if (tot !== expectedTot || eq !== expectedEq) {
      console.log(`FAIL rounding ${name} (${tipo}): tot=${tot} expected=${expectedTot} eq=${eq} expected=${expectedEq}`);
      failures++;
    }
    if (mo < 0) { console.log(`FAIL negative MO ${name} (${tipo}): ${mo}`); failures++; }
  }
}
console.log(`State-machine + rounding check: ${failures === 0 ? 'ALL OK (10/10 combinations)' : failures + ' FAILURES'}`);

// ---- Inversión linkage: bloque fijo + piloto + capa unidad reconciles per financiaCalypso key ----
let linkFailures = 0;
for (const u1aOn of [false, true]) {
  Object.assign(sandbox.domSel, { u1a: u1aOn, u2a: false, cb: false, u3: false });
  sandbox.renderInvest();
  const cu = sandbox.capaUnidadInfo();
  const expectedCalypsoKey = u1aOn ? 'u1a' : 'base';
  if (cu.calypsoKey !== expectedCalypsoKey) { console.log(`FAIL financiaCalypso u1a=${u1aOn}: got ${cu.calypsoKey}`); linkFailures++; }
  const bloqueFijo = sandbox.BLOQUE_FIJO_TOTAL;
  const piloto = 919.52 + 187.01; // equipo + mo de las 2 muestras (ver comentario en INVEST)
  const capaUnidad84 = DOM_PATHS[expectedCalypsoKey]['1d'].tot * DOM_UNIDADES;
  const fase1 = bloqueFijo + piloto + capaUnidad84;
  const expectedFase1 = u1aOn ? 238966 : 191417; // redondeado al entero, ver KICKOFF v7 seccion 7.1
  if (Math.abs(fase1 - expectedFase1) > 1) {
    console.log(`FAIL Fase1 reconciliation u1a=${u1aOn}: got ${fase1.toFixed(2)} expected ~${expectedFase1}`);
    linkFailures++;
  } else {
    console.log(`OK Fase1 (u1a=${u1aOn}): ${fase1.toFixed(2)} ~= ${expectedFase1}`);
  }
  // No N5 line double-counted: bloque fijo equipo must equal 77197.60 regardless of domSel
  const equipoFijo = sandbox.INVEST.filter(i => i.lineas && i.key !== 'unidad').reduce((a, b) => a + b.valor, 0);
  const expectedEquipoFijo = 19350.41 + 6428.48 + 919.52 + 20552.57 + 16570.38 + 13103.30 + 1192.46;
  if (Math.abs(equipoFijo - expectedEquipoFijo) > 0.01) {
    console.log(`FAIL bloque-fijo equipo sum: got ${equipoFijo.toFixed(2)} expected ${expectedEquipoFijo.toFixed(2)}`);
    linkFailures++;
  }
}
console.log(`Linkage/no-double-count check: ${linkFailures === 0 ? 'ALL OK' : linkFailures + ' FAILURES'}`);

// ---- Segmented bar sums to 100% for every explored escalón ----
let barFailures = 0;
for (const [name, clicks] of Object.entries(sequences)) {
  Object.assign(sandbox.domSel, { u1a: false, u2a: false, cb: false, u3: false });
  for (const id of clicks) sandbox.domToggle(id);
  sandbox.renderInvest();
  const bar = getEl('investBar');
  // reconstruct the pct list the same way renderInvest does, reading back dataset via regex on innerHTML
  const targets = [...bar.innerHTML.matchAll(/data-target="([\d.]+)"/g)].map(m => parseFloat(m[1]));
  const sum = targets.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.05) { console.log(`FAIL bar sum for ${name}: ${sum.toFixed(2)}%`); barFailures++; }
  else console.log(`OK bar sum for ${name}: ${sum.toFixed(2)}%`);
}
console.log(`Bar-sums-to-100% check: ${barFailures === 0 ? 'ALL OK' : barFailures + ' FAILURES'}`);

const totalFailures = failures + linkFailures + barFailures;
console.log(totalFailures === 0 ? '\n=== ALL CHECKS PASSED ===' : `\n=== ${totalFailures} TOTAL FAILURES ===`);
process.exit(totalFailures === 0 ? 0 : 1);
