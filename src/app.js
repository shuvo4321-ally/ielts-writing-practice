(function () {
'use strict';
const D = window.W;
const TASKS = D.T1.concat(D.T2);
const BY = {}; TASKS.forEach(t => { BY[t.id] = t; });
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ETYPE = {}; D.G.etypes.forEach(e => { ETYPE[e[0]] = e[1]; });

/* ================================================================ saved state (this browser only) */
const KEY = 'ielts-writing-lab-v1';
let S = { done: {}, a: {}, draft: {}, self: {}, timer: {} };
try { const raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) Object.keys(S).forEach(k => { if (raw[k]) S[k] = raw[k]; }); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const stepState = (t, key) => { const a = S.a[t.id] || (S.a[t.id] = {}); return a[key] || (a[key] = {}); };
const markDone = (t, key) => { const d = S.done[t.id] || (S.done[t.id] = {}); if (!d[key]) { d[key] = true; save(); renderRail(); } };
const isDone = (t, key) => !!(S.done[t.id] && S.done[t.id][key]);

function seedOf(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function shuffled(arr, seed) {
  const a = arr.slice(); let x = seedOf(seed) || 1;
  const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

const STEPS1 = [['lang', 'Language'], ['read', 'Read the data'], ['over', 'Overview'], ['group', 'Group'], ['cloze', 'Complete'], ['write', 'Write'], ['cmp', 'Compare']];
const STEPS2 = [['lang', 'Ideas'], ['decode', 'Decode'], ['plan', 'Plan'], ['up', 'Upgrade'], ['order', 'Order'], ['write', 'Write'], ['cmp', 'Compare']];
const stepsOf = t => (t.task === 1 ? STEPS1 : STEPS2);
const doneCount = t => stepsOf(t).filter(s => isDone(t, s[0])).length;
const minWords = t => (t.task === 1 ? 150 : 250);

/* ================================================================ charts */
const PAL = ['#14365A', '#C9A227', '#2E7D32', '#B23A2E', '#5B4B9A', '#2C6E9B', '#6B7785', '#C2571A', '#0E8C8C', '#8A5A2B'];
const fmt = n => String(Math.round(n * 100) / 100);
const svgWrap = (w, h, inner, cls) => `<svg viewBox="0 0 ${w} ${h}" role="img"${cls ? ' class="' + cls + '"' : ''}>${inner}</svg>`;
function axisScale(max, min) {
  const span = max - min, raw = span / 5, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
  const st = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  return { step: st, top: Math.ceil(max / st - 1e-9) * st, bot: Math.floor(min / st + 1e-9) * st };
}
function wrapLabel(s, max) {
  const words = String(s).split(' '), lines = []; let cur = '';
  words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
  if (cur) lines.push(cur); return lines;
}
const legendHTML = v => `<div class="legend">${v.series.map((s, i) => `<span><i style="background:${PAL[i % PAL.length]}"></i>${esc(s.name)}</span>`).join('')}</div>`;
function gridAxes(v, W, H, L, R, T, B, sc) {
  const ph = H - T - B, n = Math.round((sc.top - sc.bot) / sc.step); let g = '';
  const Y = val => T + ph - (val - sc.bot) / (sc.top - sc.bot) * ph;
  for (let i = 0; i <= n; i++) { const val = sc.bot + i * sc.step; g += `<line x1="${L}" x2="${W - R}" y1="${Y(val)}" y2="${Y(val)}" stroke="#DDE3E8"/><text x="${L - 8}" y="${Y(val) + 4}" text-anchor="end" font-size="13">${fmt(val)}</text>`; }
  g += `<line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" stroke="#555"/><line x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" stroke="#555"/>`;
  if (v.ytitle) g += `<text transform="translate(16 ${T + ph / 2}) rotate(-90)" text-anchor="middle" font-size="13" font-weight="600">${esc(v.ytitle)}</text>`;
  if (v.xtitle) g += `<text x="${L + (W - L - R) / 2}" y="${H - 6}" text-anchor="middle" font-size="13" font-weight="600">${esc(v.xtitle)}</text>`;
  return { g, Y };
}
function lineSVG(v) {
  const W = 680, H = 370, L = 66, R = 24, T = 16, B = 62, pw = W - L - R, n = v.x.length;
  const all = []; v.series.forEach(s => s.values.forEach(x => all.push(x)));
  const sc = axisScale(Math.max.apply(null, all), v.ymin != null ? v.ymin : Math.min(0, Math.min.apply(null, all)));
  const { g, Y } = gridAxes(v, W, H, L, R, T, B, sc), X = i => L + (n === 1 ? pw / 2 : i * pw / (n - 1));
  let out = g; const skip = n > 11 ? Math.ceil(n / 11) : 1;
  v.x.forEach((lab, i) => { if (i % skip === 0) out += `<line x1="${X(i)}" x2="${X(i)}" y1="${H - B}" y2="${H - B + 5}" stroke="#555"/><text x="${X(i)}" y="${H - B + 20}" text-anchor="middle" font-size="13">${esc(lab)}</text>`; });
  v.series.forEach((s, k) => {
    const c = PAL[k % PAL.length];
    out += `<polyline fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round" points="${s.values.map((val, i) => X(i) + ',' + Y(val)).join(' ')}"/>`;
    s.values.forEach((val, i) => { out += `<circle cx="${X(i)}" cy="${Y(val)}" r="3.6" fill="#fff" stroke="${c}" stroke-width="2"/>`; });
  });
  return svgWrap(W, H, out);
}
function barSVG(v) {
  const W = 680, H = 380, L = 66, R = 20, T = 16, B = 76, pw = W - L - R, n = v.x.length, k = v.series.length;
  const all = []; v.series.forEach(s => s.values.forEach(x => all.push(x)));
  const sc = axisScale(Math.max.apply(null, all), 0);
  const { g, Y } = gridAxes(v, W, H, L, R, T, B, sc), gw = pw / n, bw = gw * 0.74 / k;
  let out = g;
  v.x.forEach((lab, i) => {
    v.series.forEach((s, j) => {
      const x = L + i * gw + gw * 0.13 + j * bw, y = Y(s.values[j === undefined ? 0 : i]), h = Y(0) - y;
      out += `<rect x="${x}" y="${y}" width="${bw - 1}" height="${Math.max(h, 0)}" fill="${PAL[j % PAL.length]}"/>`;
    });
    const lines = wrapLabel(lab, n > 6 ? 11 : 16);
    out += `<text text-anchor="middle" font-size="12.5">${lines.map((ln, q) => `<tspan x="${L + i * gw + gw / 2}" y="${H - B + 18 + q * 15}">${esc(ln)}</tspan>`).join('')}</text>`;
  });
  return svgWrap(W, H, out);
}
function pieSVG(c, unit) {
  const W = 300, H = 280, cx = 150, cy = 140, r = 105, total = c.slices.reduce((a, s) => a + s[1], 0);
  let ang = -Math.PI / 2, out = '';
  c.slices.forEach((s, i) => {
    const frac = s[1] / total, a2 = ang + frac * 2 * Math.PI, col = PAL[i % PAL.length];
    const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang), x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    out += frac >= 0.9999 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>` : `<path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z" fill="${col}" stroke="#fff" stroke-width="2"/>`;
    const mid = (ang + a2) / 2, inside = frac >= 0.065, rr = inside ? r * 0.66 : r + 15;
    out += `<text x="${cx + rr * Math.cos(mid)}" y="${cy + rr * Math.sin(mid) + 4}" text-anchor="middle" font-size="13" font-weight="700" fill="${inside ? '#fff' : '#333'}" style="fill:${inside ? '#fff' : '#333'}">${fmt(s[1])}${unit || ''}</text>`;
    ang = a2;
  });
  return svgWrap(W, H, out);
}
const MAPK = { bld: ['#D6DCE5', '#5A6773'], house: ['#EAD9C2', '#8A6B3E'], shop: ['#F2D2D0', '#A5473E'], park: ['#CBE6C1', '#5E8F52'], field: ['#EFE8B8', '#A99A3A'], water: ['#B9D9F1', '#4A86B5'], road: ['#C8C2B4', '#C8C2B4'], hall: ['#DCD3EC', '#6B5BA0'], sand: ['#F3E6BF', '#C2A85A'], rail: ['#BBBBBB', '#666666'] };
function mapSVG(m) {
  let out = `<rect x="0" y="0" width="100" height="64" fill="#F4F7EF" stroke="#9AA6A0" stroke-width=".4"/>`;
  m.items.forEach(it => {
    const [k, x, y, w, h, lab] = it;
    if (k === 'tree') { out += `<circle cx="${x}" cy="${y}" r="${w}" fill="#8DC37C" stroke="#4E8A3F" stroke-width=".3"/>`; return; }
    const c = MAPK[k] || MAPK.bld;
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c[0]}" stroke="${c[1]}" stroke-width="${k === 'road' ? 0 : .35}"${k === 'rail' ? ' stroke-dasharray="1.5 1"' : ''}/>`;
    if (lab) {
      const lines = lab.split('|'), fs = 2.3, cxm = x + w / 2, top = y + h / 2 - (lines.length - 1) * fs * 0.55 + fs * 0.35;
      out += `<text text-anchor="middle" font-size="${fs}" font-weight="600" style="fill:#2a2a2a">${lines.map((ln, q) => `<tspan x="${cxm}" y="${top + q * fs * 1.1}">${esc(ln)}</tspan>`).join('')}</text>`;
    }
  });
  out += `<g transform="translate(96 16)"><path d="M0 -5 L2 1 L0 -.5 L-2 1 Z" fill="#333"/><text y="5" text-anchor="middle" font-size="2.6" font-weight="700" style="fill:#333">N</text></g>`;
  return svgWrap(100, 64, out);
}
function cycleSVG(steps) {
  const W = 680, H = 440, cx = W / 2, cy = H / 2, rx = 250, ry = 162, n = steps.length, nw = 178, nh = 60; let out = '';
  out += `<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#14365A"/></marker></defs>`;
  const P = i => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; };
  for (let i = 0; i < n; i++) {
    const a1 = -Math.PI / 2 + (i + 0.17) * 2 * Math.PI / n, a2 = -Math.PI / 2 + (i + 0.83) * 2 * Math.PI / n;
    out += `<path d="M${cx + rx * Math.cos(a1)} ${cy + ry * Math.sin(a1)} A${rx} ${ry} 0 0 1 ${cx + rx * Math.cos(a2)} ${cy + ry * Math.sin(a2)}" fill="none" stroke="#14365A" stroke-width="2" marker-end="url(#ah)"/>`;
  }
  steps.forEach((s, i) => {
    const [x, y] = P(i), label = Array.isArray(s) ? s[0] : s, lines = wrapLabel(label, 24);
    out += `<rect x="${x - nw / 2}" y="${y - nh / 2}" width="${nw}" height="${nh}" fill="#fff" stroke="#14365A" stroke-width="1.6"/><text text-anchor="middle" font-size="13.5" font-weight="600">${lines.map((ln, q) => `<tspan x="${x}" y="${y + 5 - (lines.length - 1) * 8 + q * 16}">${esc(ln)}</tspan>`).join('')}</text>`;
  });
  return svgWrap(W, H, out);
}
function flowHTML(steps) {
  return '<div class="flow">' + steps.map((s, i) => {
    const label = Array.isArray(s) ? s[0] : s, sub = Array.isArray(s) && s[1] ? `<small>${esc(s[1])}</small>` : '';
    return `<div class="node">${esc(label)}${sub}</div>` + (i < steps.length - 1 ? '<div class="arr">→</div>' : '');
  }).join('') + '</div>';
}
function exactHTML(v) {
  if (v.type === 'line' || v.type === 'bar') {
    return `<details class="exact"><summary>Show the exact figures</summary><div class="tablewrap"><table><tr><th></th>${v.series.map(s => `<th class="num">${esc(s.name)}</th>`).join('')}</tr>` +
      v.x.map((lab, i) => `<tr><td class="k">${esc(lab)}</td>${v.series.map(s => `<td class="num">${fmt(s.values[i])}</td>`).join('')}</tr>`).join('') + '</table></div></details>';
  }
  if (v.type === 'pie') {
    return `<details class="exact"><summary>Show the exact figures</summary>${v.charts.map(c => `<p><b>${esc(c.title)}</b>: ${c.slices.map(s => esc(s[0]) + ' ' + fmt(s[1]) + (v.unit || '')).join(' · ')}</p>`).join('')}</details>`;
  }
  return '';
}
function visualHTML(v) {
  const title = v.title ? `<div class="vt">${esc(v.title)}</div>` : '';
  if (v.type === 'line') return `<div class="visual">${title}<div class="scroll">${lineSVG(v)}</div>${legendHTML(v)}${exactHTML(v)}</div>`;
  if (v.type === 'bar') return `<div class="visual">${title}<div class="scroll">${barSVG(v)}</div>${legendHTML(v)}${exactHTML(v)}</div>`;
  if (v.type === 'pie') {
    return `<div class="visual">${title}<div class="pies">${v.charts.map(c => `<div class="pie"><div class="vt">${esc(c.title)}</div>${pieSVG(c, v.unit)}<div class="legend">${c.slices.map((s, i) => `<span><i style="background:${PAL[i % PAL.length]}"></i>${esc(s[0])}</span>`).join('')}</div></div>`).join('')}</div>${exactHTML(v)}</div>`;
  }
  if (v.type === 'table') {
    const num = s => /^[\d.,%$£€+\-\s]+$/.test(String(s)) && String(s).trim() !== '';
    return `<div class="visual">${title}<div class="tablewrap"><table><tr>${v.head.map((h, i) => `<th${i ? ' class="num"' : ''}>${esc(h)}</th>`).join('')}</tr>` +
      v.rows.map(r => `<tr>${r.map((c, i) => `<td class="${i === 0 ? 'k' : num(c) ? 'num' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('') + `</table></div>${v.note ? `<p class="small" style="margin:4px 0 0">${esc(v.note)}</p>` : ''}</div>`;
  }
  if (v.type === 'map') {
    return `<div class="visual">${title}<div class="maps">${[v.before, v.after].map(m => `<div><div class="vt">${esc(m.title)}</div><div class="scroll">${mapSVG(m)}</div></div>`).join('')}</div></div>`;
  }
  if (v.type === 'process') return `<div class="visual">${title}${v.kind === 'cycle' ? `<div class="scroll">${cycleSVG(v.steps)}</div>` : flowHTML(v.steps)}</div>`;
  return '';
}
const visualsOf = t => (t.visuals || (t.visual ? [t.visual] : []));
function taskCard(t, open) {
  const lim = `Time: about ${t.minutes} minutes · Write at least ${minWords(t)} words`;
  return `<details class="taskcard"${open ? ' open' : ''}><summary>The task</summary><div class="tc"><div class="lim">${lim}</div><div class="prompt">${t.prompt}</div>${visualsOf(t).map(visualHTML).join('')}</div></details>`;
}

/* ================================================================ routing + rail */
const work = $('#work'), rail = $('#rail');
let route = { page: 'home', id: null, step: null };
function parseHash() {
  const h = (location.hash || '#home').slice(1).split('/');
  if (BY[h[0]]) { const t = BY[h[0]], ks = stepsOf(t).map(s => s[0]); return { page: 'task', id: h[0], step: ks.indexOf(h[1]) >= 0 ? h[1] : 'lang' }; }
  return { page: h[0] === 'toolkit' ? 'toolkit' : 'home' };
}
function go(hash) { if (location.hash === hash) { route = parseHash(); render(); } else location.hash = hash; }
function renderRail() {
  const item = t => {
    const c = doneCount(t), done = c === 7;
    return `<a class="rt${done ? ' done' : ''}${route.id === t.id ? ' on' : ''}" href="#${t.id}"><span class="n">${t.id.slice(-2)}</span><span>${esc(t.short)}<span class="ty">${esc(t.label)}</span></span><span class="st">${done ? '✓' : c + '/7'}</span></a>`;
  };
  const tot = TASKS.length * 7, dn = TASKS.reduce((a, t) => a + doneCount(t), 0);
  rail.innerHTML = `<a class="nv${route.page === 'home' ? ' on' : ''}" href="#home">Home</a><a class="nv${route.page === 'toolkit' ? ' on' : ''}" href="#toolkit">Toolkit</a>` +
    `<div class="rg"><span>Task 1 · ${D.T1.length}</span><span>${D.T1.filter(t => doneCount(t) === 7).length} done</span></div>${D.T1.map(item).join('')}` +
    `<div class="rg"><span>Task 2 · ${D.T2.length}</span><span>${D.T2.filter(t => doneCount(t) === 7).length} done</span></div>${D.T2.map(item).join('')}`;
  $('#progfill').style.width = Math.round(dn / tot * 100) + '%';
  $('#progtxt').textContent = TASKS.filter(t => doneCount(t) === 7).length + ' / ' + TASKS.length + ' tasks complete';
}
let lastTask = null;
function render() {
  const before = lastTask; route = parseHash(); document.body.classList.remove('railopen');
  if (route.page === 'task') renderTask(); else if (route.page === 'toolkit') renderToolkit(); else renderHome();
  renderRail(); lastTask = route.page === 'task' ? route.id : null;
  if (route.page === 'task' && before === route.id) { const s = $('.stepper'); if (s) s.scrollIntoView(); } else window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);

/* ================================================================ home + toolkit */
function renderHome() {
  const list = arr => `<div class="tl">${arr.map(t => { const c = doneCount(t); return `<a class="${c === 7 ? 'done' : ''}" href="#${t.id}"><span class="n">${t.id.slice(-2)}</span><span>${esc(t.short)}<span class="small" style="display:block">${esc(t.label)}</span></span><span class="st">${c === 7 ? '✓' : c + '/7'}</span></a>`; }).join('')}</div>`;
  work.innerHTML = `<div class="hero"><h1>IELTS Writing Workbench</h1><div class="sub">20 Task 1 reports and 20 Task 2 essays. Each one has its own data, topic, exercises and band 9 model answer.</div>
<p>You do not read a model and move on. Every task is a <b>seven-step workbench</b>, and each step asks you to answer in a different way: select, group, fill gaps from a bank, tap words, match, upgrade, put in order, and finally write.</p>
<div class="actions"><a class="primary" style="text-decoration:none" href="#t1-01">Start Task 1 · 01</a><a class="ghost" style="text-decoration:none" href="#t2-01">Start Task 2 · 01</a><a class="ghost" style="text-decoration:none" href="#toolkit">Open the Toolkit</a></div></div>
<h2>The seven steps</h2><div class="cols">
<div class="card edge"><h3>Task 1 (report)</h3><ol><li><b>Language:</b> the plan, the exact data and the words for this task.</li><li><b>Read the data:</b> choose the 3 key features out of 7 statements.</li><li><b>Overview:</b> choose the 2 sentences that make a real overview.</li><li><b>Group:</b> sort the data into the groups you would write about.</li><li><b>Complete:</b> rebuild a band 9 paragraph from a word bank.</li><li><b>Write:</b> your own report, with a timer and live checks.</li><li><b>Compare:</b> your report beside the model, then score yourself.</li></ol></div>
<div class="card edge"><h3>Task 2 (essay)</h3><ol><li><b>Ideas:</b> an idea bank with examples, and the vocabulary for the topic.</li><li><b>Decode:</b> tap the task words in the question and name the essay type.</li><li><b>Plan:</b> choose the best thesis and match ideas to examples.</li><li><b>Upgrade:</b> pick the band 9 rewrite of three weak sentences.</li><li><b>Order:</b> rebuild a scrambled body paragraph.</li><li><b>Write:</b> your own essay, with a timer and live checks.</li><li><b>Compare:</b> your essay beside the model, then score yourself.</li></ol></div></div>
<div class="box warn"><span class="lab">An honest note</span><p style="margin:0">The checks in the Write step count words, paragraphs, figures and linking words. They <b>cannot</b> judge your ideas or grammar the way an examiner does. That is why the Compare step has you score yourself against the four band descriptors.</p></div>
<h2>Task 1 · ${D.T1.length} reports</h2>${list(D.T1)}<h2>Task 2 · ${D.T2.length} essays</h2>${list(D.T2)}
<p class="small">Your answers, drafts and scores are saved in this browser only.</p>`;
}
function renderToolkit() {
  const G = D.G;
  const crit = rows => `<div class="tablewrap"><table><tr><th>Band</th>${rows.map(r => `<th>${esc(r[1])}</th>`).join('')}</tr>` + [9, 8, 7, 6, 5].map(b => `<tr><td class="k">${b}</td>${rows.map(r => `<td>${esc(r[2][b])}</td>`).join('')}</tr>`).join('') + '</table></div>';
  work.innerHTML = `<div class="hero"><h1>Toolkit</h1><div class="sub">The reference pages for every task.</div></div>
<h2>How Writing is marked</h2><p>Four criteria, equally weighted. Each is scored from 0 to 9, and the average is your Writing band. Task 2 counts twice as much as Task 1 in the final Writing score. The tables below are plain-English summaries, not the official wording.</p>
<h3>Task 1</h3>${crit(G.crit1)}<h3>Task 2</h3>${crit(G.crit2)}
<h2>Task 1: language for each chart type</h2><div class="tablewrap"><table><tr><th>Use</th><th>Words and phrases</th><th>Example</th></tr>${G.charts.map(r => `<tr><td class="k">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table></div>
<h2>Task 1: the four-paragraph plan</h2><div class="box tech"><span class="lab">Structure</span><ol>${G.plan.map(p => `<li><b>${p[0]}.</b> ${p[1]}</li>`).join('')}</ol></div>
<h2>Task 2: structure for each essay type</h2>${Object.keys(G.skeleton).map(k => `<div class="box same"><span class="lab">${esc(G.skeleton[k][0])}</span><ol>${G.skeleton[k][1].map(x => `<li>${x}</li>`).join('')}</ol></div>`).join('')}
<h2>Task 2: linking words</h2><div class="tablewrap"><table><tr><th>Use</th><th>Words</th></tr>${G.linkers.map(r => `<tr><td class="k">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table></div>
<div class="box tech"><span class="lab">Hedging (careful claims)</span><p>${G.hedging}</p></div>
<h2>Seven mistakes that cost bands</h2><div class="tablewrap"><table><tr><th>Mistake</th><th>What to do</th></tr>${G.mistakes.map(r => `<tr><td class="k">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table></div>`;
}

/* ================================================================ task page */
let curTask = null, curStep = null;
function renderTask() {
  const t = BY[route.id]; curTask = t; curStep = route.step;
  const steps = stepsOf(t);
  const head = `<div class="taskhead"><span class="pnum">Task ${t.task} · ${t.id.slice(-2)}</span><span class="ptype">${esc(t.label)}</span><div class="ptitle">${esc(t.title)}</div></div>`;
  const stepper = `<div class="stepper" role="tablist">${steps.map((s, i) => `<button type="button" role="tab" class="${s[0] === curStep ? 'on' : ''}${isDone(t, s[0]) ? ' done' : ''}" data-act="step" data-s="${s[0]}"><span class="ci">${isDone(t, s[0]) && s[0] !== curStep ? '✓' : i + 1}</span>${s[1]}</button>`).join('')}</div>`;
  work.innerHTML = head + taskCard(t, t.task === 2 || ['lang', 'read', 'group', 'write'].indexOf(curStep) >= 0) + stepper + '<div class="stepbody" id="stepbody"></div>';
  renderStep();
}
function renderStep() {
  const t = curTask, body = $('#stepbody'); if (!body) return;
  const fn = { lang: stepLang, read: stepRead, over: stepOver, group: stepGroup, cloze: stepCloze, decode: stepDecode, plan: stepPlan, up: stepUp, order: stepOrder, write: stepWrite, cmp: stepCmp }[curStep];
  body.innerHTML = fn(t) + stepNav(t);
  if (curStep === 'write') startWriteUI(t);
  $$('.stepper button').forEach(b => { const k = b.dataset.s; b.classList.toggle('on', k === curStep); b.classList.toggle('done', isDone(t, k)); const ci = $('.ci', b); const i = stepsOf(t).findIndex(s => s[0] === k); ci.textContent = isDone(t, k) && k !== curStep ? '✓' : i + 1; });
}
function stepNav(t) {
  const ks = stepsOf(t).map(s => s[0]), i = ks.indexOf(curStep);
  return `<div class="stepnav">${i > 0 ? `<button type="button" class="ghost" data-act="step" data-s="${ks[i - 1]}">← ${stepsOf(t)[i - 1][1]}</button>` : '<span></span>'}${i < ks.length - 1 ? `<button type="button" class="primary" data-act="step" data-s="${ks[i + 1]}">${stepsOf(t)[i + 1][1]} →</button>` : '<span></span>'}</div>`;
}
const vocabTable = v => `<div class="tablewrap"><table><tr><th>Word or phrase</th><th>How to use it in this task</th></tr>${v.map(r => `<tr><td class="k">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table></div>`;

/* ---------------- step 1: language / ideas */
function stepLang(t) {
  if (t.task === 1) {
    return `<h2>Language and plan</h2><p>Before you work with the data, see how this report is built and which words it needs.</p>
<div class="box tech"><span class="lab">Plan for this report</span><ol>${t.plan.map(p => `<li>${p}</li>`).join('')}</ol></div>
<h3>Vocabulary for this task</h3>${vocabTable(t.vocab)}
<div class="actions"><button type="button" class="${isDone(t, 'lang') ? 'ghost' : 'primary'}" data-act="markread">${isDone(t, 'lang') ? '✓ Marked as read' : 'I have read this'}</button><span class="small">The exact figures are under the chart in the task box above.</span></div>`;
  }
  const sk = D.G.skeleton[t.etype];
  const groups = {}; t.ideas.forEach(i => { (groups[i[0]] = groups[i[0]] || []).push(i); });
  return `<h2>Ideas and language</h2><p>Spend two minutes here before you write anything. A good essay is built from ideas and examples you already have.</p>
<div class="box same"><span class="lab">${esc(sk[0])}: structure</span><ol>${sk[1].map(x => `<li>${x}</li>`).join('')}</ol></div>
<h3>Idea bank</h3>${Object.keys(groups).map(g => `<h4 class="sidehd">${esc(g)}</h4><div class="tablewrap"><table><tr><th style="width:48%">Idea</th><th>Example you could use</th></tr>${groups[g].map(i => `<tr><td>${i[1]}</td><td>${i[2]}</td></tr>`).join('')}</table></div>`).join('')}
<h3>Vocabulary for this topic</h3>${vocabTable(t.vocab)}
<div class="actions"><button type="button" class="${isDone(t, 'lang') ? 'ghost' : 'primary'}" data-act="markread">${isDone(t, 'lang') ? '✓ Marked as read' : 'I have read this'}</button></div>`;
}

/* ---------------- multi-select steps (read the data, overview) */
function multiPick(t, key, list, need, isKey, tagOf, instr) {
  const st = stepState(t, key), sel = st.sel || [], chk = !!st.chk;
  let h = `<p>${instr}</p>`;
  list.forEach((it, i) => {
    const on = sel.indexOf(i) >= 0, kk = isKey(it); let cls = 'opt';
    if (chk) { if (on && kk) cls += ' ok'; else if (on) cls += ' no'; else if (kk) cls += ' miss'; } else if (on) cls += ' sel';
    h += `<button type="button" class="${cls}" data-act="sel" data-key="${key}" data-i="${i}"${chk ? ' disabled' : ''}><span class="bx"></span><span>${chk ? `<span class="tagk ${tagOf(it)[0]}">${tagOf(it)[1]}</span>` : ''}${esc(it[0])}</span></button>`;
    if (chk) h += `<div class="why ${kk ? 'ok' : 'no'}">${it[2]}</div>`;
  });
  if (chk) {
    const hits = sel.filter(i => isKey(list[i])).length, cls = hits === need ? 'good' : hits >= need - 1 ? 'mid' : 'low';
    h += `<div class="result ${cls}">You chose ${hits} of the ${need} best. ${hits === need ? 'Exactly right.' : 'Read the reasons above, then try again.'}</div><div class="actions"><button type="button" class="ghost" data-act="retry" data-key="${key}">Try again</button></div>`;
  } else {
    h += `<div class="actions"><button type="button" class="primary" data-act="check" data-key="${key}"${sel.length === need ? '' : ' disabled'}>Check (${sel.length} / ${need} chosen)</button></div>`;
  }
  return h;
}
function stepRead(t) {
  const tags = { key: ['key', 'key feature'], detail: ['detail', 'true, but only a detail'], false: ['false', 'not accurate'] };
  return '<h2>Read the data</h2>' + multiPick(t, 'read', t.read, 3, it => it[1] === 'key', it => tags[it[1]], 'Seven statements describe this data. <b>Choose the three that are key features</b>: accurate and important enough to be in your report. Some are true but too small; some are wrong.');
}
function stepOver(t) {
  return '<h2>Overview</h2>' + multiPick(t, 'over', t.overview, 2, it => it[1], it => it[1] ? ['key', 'good overview'] : ['false', 'weak'], 'An overview gives the main trends or differences with <b>no detailed figures</b>. Six sentences are offered. <b>Choose the two that would make a strong overview.</b>');
}

/* ---------------- group step */
function stepGroup(t) {
  const g = t.group, st = stepState(t, 'group'), as = st.as || {}, chk = !!st.chk;
  let h = `<h2>Group the data</h2><p>${g.instr}</p>`;
  g.items.forEach((it, i) => {
    const sel = as[i], right = chk ? sel === it[1] : null;
    h += `<div class="grow${chk ? (right ? ' ok' : ' no') : ''}"><span class="gt">${esc(it[0])}</span><span class="seg">${g.names.map((n, gi) => `<button type="button" class="${sel === gi ? 'on' : ''}" data-act="assign" data-i="${i}" data-g="${gi}"${chk ? ' disabled' : ''}>${esc(n)}</button>`).join('')}</span>${chk && !right ? `<span class="gw">Belongs with: <b>${esc(g.names[it[1]])}</b></span>` : ''}</div>`;
  });
  if (chk) {
    const ok = g.items.filter((it, i) => as[i] === it[1]).length;
    h += `<div class="result ${ok === g.items.length ? 'good' : ok >= g.items.length - 1 ? 'mid' : 'low'}">${ok} of ${g.items.length} in the right group.</div><div class="box tech"><span class="lab">Why this grouping</span><p>${g.note}</p></div><div class="actions"><button type="button" class="ghost" data-act="retry" data-key="group">Try again</button></div>`;
  } else {
    const n = Object.keys(as).length;
    h += `<div class="actions"><button type="button" class="primary" data-act="check" data-key="group"${n === g.items.length ? '' : ' disabled'}>Check (${n} / ${g.items.length} placed)</button></div>`;
  }
  return h;
}

/* ---------------- cloze step */
function stepCloze(t) {
  const c = t.cloze, st = stepState(t, 'cloze'), n = c.words.length;
  if (!st.bank) { st.bank = shuffled(c.words.concat(c.extra || []), t.id + 'bank'); st.f = c.words.map(() => -1); st.act = 0; }
  const chk = !!st.chk, used = new Set(st.f);
  let body = '';
  c.segs.forEach((seg, i) => {
    body += esc(seg).replace(/\n\n/g, '</p><p>');
    if (i < n) {
      const chip = st.f[i], txt = chip >= 0 ? st.bank[chip] : '      ';
      let cls = 'gapb' + (chip >= 0 ? ' fill' : '') + (!chk && st.act === i ? ' act' : '');
      if (chk) cls += st.bank[chip] === c.words[i] ? ' ok' : ' no';
      body += `<button type="button" class="${cls}" data-act="gap" data-i="${i}"${chk ? ' disabled' : ''} aria-label="Gap ${i + 1}">${esc(txt)}</button>`;
    }
  });
  let h = `<h2>Complete the paragraph</h2><p>This is a paragraph of the band 9 model with ${n} words removed. Tap a gap, then tap a word from the bank. Tap a filled gap to take the word out. <b>${(c.extra || []).length} words in the bank are not needed.</b></p>
<div class="cloze"><p>${body}</p></div><div class="bank">${st.bank.map((w, i) => `<button type="button" data-act="bank" data-i="${i}"${used.has(i) || chk ? ' disabled' : ''}>${esc(w)}</button>`).join('')}</div>`;
  if (chk) {
    const ok = c.words.filter((w, i) => st.bank[st.f[i]] === w).length;
    h += `<div class="result ${ok === n ? 'good' : ok >= n - 2 ? 'mid' : 'low'}">${ok} of ${n} correct.${ok < n ? ' The right words, in order: <b>' + c.words.map(esc).join(' · ') + '</b>' : ''}</div>${c.note ? `<div class="box tech"><span class="lab">What to notice</span><p>${c.note}</p></div>` : ''}<div class="actions"><button type="button" class="ghost" data-act="retry" data-key="cloze">Try again</button></div>`;
  } else {
    const filled = st.f.filter(x => x >= 0).length;
    h += `<div class="actions"><button type="button" class="primary" data-act="check" data-key="cloze"${filled === n ? '' : ' disabled'}>Check (${filled} / ${n} filled)</button></div>`;
  }
  return h;
}

/* ---------------- decode step (Task 2) */
function stepDecode(t) {
  const d = t.decode, st = stepState(t, 'decode'), tap = st.t || [], chk = !!st.chk;
  const spanHit = {}; d.toks.forEach((k, i) => { if (k[1] >= 0 && tap.indexOf(i) >= 0) spanHit[k[1]] = true; });
  let h = `<h2>Decode the question</h2><p>Tap the words that tell you <b>what to write about</b> and <b>what to do with it</b>: the topic and the task words. Then name the essay type.</p><div class="toks">`;
  d.toks.forEach((k, i) => {
    const on = tap.indexOf(i) >= 0; let cls = 'tok' + (on ? ' on' : '');
    if (chk) { if (k[1] >= 0 && on) cls = 'tok hit on'; else if (k[1] >= 0 && !spanHit[k[1]]) cls = 'tok miss'; else if (k[1] >= 0) cls = 'tok hit'; else if (on) cls = 'tok stray'; }
    h += `${i && !/^[.,;:!?)]/.test(k[0]) ? ' ' : ''}<button type="button" class="${cls}" data-act="tok" data-i="${i}"${chk ? ' disabled' : ''}>${esc(k[0])}</button>`;
  });
  h += '</div><h3>What type of essay is this?</h3>';
  D.G.etypes.forEach(e => {
    const on = st.ty === e[0]; let cls = 'opt radio' + (on ? ' sel' : '');
    if (chk) { if (on && e[0] === t.etype) cls = 'opt radio ok'; else if (on) cls = 'opt radio no'; else if (e[0] === t.etype) cls = 'opt radio miss'; }
    h += `<button type="button" class="${cls}" data-act="etype" data-v="${e[0]}"${chk ? ' disabled' : ''}><span class="bx"></span><span>${esc(e[1])}</span></button>`;
  });
  if (chk) {
    const hits = Object.keys(spanHit).length, tot = d.n, stray = tap.filter(i => d.toks[i][1] < 0).length, tyOk = st.ty === t.etype;
    h += `<div class="result ${hits === tot && tyOk ? 'good' : hits >= tot - 1 ? 'mid' : 'low'}">You found ${hits} of ${tot} key parts (green), with ${stray} stray tap${stray === 1 ? '' : 's'}. Essay type: ${tyOk ? 'correct' : 'it is <b>' + esc(ETYPE[t.etype]) + '</b>'}.</div><div class="box tech"><span class="lab">How to read this question</span><p>${d.why}</p></div><div class="actions"><button type="button" class="ghost" data-act="retry" data-key="decode">Try again</button></div>`;
  } else {
    h += `<div class="actions"><button type="button" class="primary" data-act="check" data-key="decode"${tap.length && st.ty ? '' : ' disabled'}>Check</button></div>`;
  }
  return h;
}

/* ---------------- plan step (thesis + matching) */
function stepPlan(t) {
  const p = t.plan, st = stepState(t, 'plan'), chk = !!st.chk, m = st.m || {};
  const ex = shuffled(p.pairs.map((x, i) => i), t.id + 'm');
  let h = `<h2>Plan the essay</h2><h3>1. Choose the best thesis (your answer to the question)</h3>`;
  p.thesis.forEach((o, i) => {
    const on = st.th === i; let cls = 'opt radio' + (on ? ' sel' : '');
    if (chk) { if (on && i === p.ans) cls = 'opt radio ok'; else if (on) cls = 'opt radio no'; else if (i === p.ans) cls = 'opt radio miss'; }
    h += `<button type="button" class="${cls}" data-act="thesis" data-i="${i}"${chk ? ' disabled' : ''}><span class="bx"></span><span>${esc(o)}</span></button>`;
  });
  if (chk) h += `<div class="why ${st.th === p.ans ? 'ok' : 'no'}">${p.why}</div>`;
  h += `<h3>2. Match each main idea to the example that supports it</h3><p class="small">Each example proves one idea only. Choose from the list in each row.</p>`;
  p.pairs.forEach((pr, i) => {
    const sel = m[i], right = chk ? sel === i : null;
    h += `<div class="mrow${chk ? (right ? ' ok' : ' no') : ''}"><span>${pr[0]}</span><select class="sel" data-act="match" data-i="${i}"${chk ? ' disabled' : ''}><option value="">Choose the example…</option>${ex.map(j => `<option value="${j}"${sel === j ? ' selected' : ''}>${esc(p.pairs[j][1])}</option>`).join('')}</select>${chk && !right ? `<span class="mw">Better match: <b>${p.pairs[i][1]}</b></span>` : ''}</div>`;
  });
  if (chk) {
    const ok = p.pairs.filter((x, i) => m[i] === i).length + (st.th === p.ans ? 1 : 0);
    h += `<div class="result ${ok === 4 ? 'good' : ok >= 3 ? 'mid' : 'low'}">${ok} of 4 correct.</div><div class="box tech"><span class="lab">Why these match</span><p>${p.note}</p></div><div class="actions"><button type="button" class="ghost" data-act="retry" data-key="plan">Try again</button></div>`;
  } else {
    const ready = st.th != null && p.pairs.every((x, i) => m[i] !== undefined);
    h += `<div class="actions"><button type="button" class="primary" data-act="check" data-key="plan"${ready ? '' : ' disabled'}>Check</button></div>`;
  }
  return h;
}

/* ---------------- upgrade step (rewrite weak sentences) */
function stepUp(t) {
  const st = stepState(t, 'up'), chk = !!st.chk, pick = st.p || {};
  let h = `<h2>Upgrade the sentence</h2><p>Each sentence is a typical band 6 sentence from this topic. <b>Choose the rewrite that a band 9 writer would use.</b></p>`;
  t.upgrade.forEach((u, qi) => {
    h += `<h3 style="font-family:var(--f-text);font-weight:400"><span class="chip gold">Band 6</span>${esc(u[0])}</h3>`;
    u[1].forEach((o, i) => {
      const on = pick[qi] === i; let cls = 'opt radio' + (on ? ' sel' : '');
      if (chk) { if (on && i === u[2]) cls = 'opt radio ok'; else if (on) cls = 'opt radio no'; else if (i === u[2]) cls = 'opt radio miss'; }
      h += `<button type="button" class="${cls}" data-act="up" data-q="${qi}" data-i="${i}"${chk ? ' disabled' : ''}><span class="bx"></span><span>${esc(o)}</span></button>`;
    });
    if (chk) h += `<div class="why ${pick[qi] === u[2] ? 'ok' : 'no'}">${u[3]}</div>`;
  });
  if (chk) {
    const ok = t.upgrade.filter((u, q) => pick[q] === u[2]).length;
    h += `<div class="result ${ok === 3 ? 'good' : ok === 2 ? 'mid' : 'low'}">${ok} of 3 correct.</div><div class="actions"><button type="button" class="ghost" data-act="retry" data-key="up">Try again</button></div>`;
  } else {
    h += `<div class="actions"><button type="button" class="primary" data-act="check" data-key="up"${t.upgrade.every((u, q) => pick[q] !== undefined) ? '' : ' disabled'}>Check</button></div>`;
  }
  return h;
}

/* ---------------- order step */
function stepOrder(t) {
  const o = t.order, st = stepState(t, 'order'), n = o.sents.length, chk = !!st.chk;
  if (!st.o) { let p = shuffled(o.sents.map((s, i) => i), t.id + 'ord'); if (p.every((v, i) => v === i)) p.reverse(); st.o = p; }
  let h = `<h2>Put the paragraph in order</h2><p>These sentences are a body paragraph from the model answer, scrambled. <b>Drag them, or use the arrows,</b> to rebuild the paragraph.</p><ul class="ordl" id="ordl">`;
  st.o.forEach((si, pos) => {
    const ok = chk ? si === pos : null;
    h += `<li draggable="${chk ? 'false' : 'true'}" data-pos="${pos}" class="${chk ? (ok ? 'ok' : 'no2') : ''}"><span class="no">${pos + 1}</span><span>${esc(o.sents[si])}</span><span class="mv">${chk ? '' : `<button type="button" data-act="mv" data-pos="${pos}" data-d="-1" aria-label="Move up"${pos === 0 ? ' disabled' : ''}>↑</button><button type="button" data-act="mv" data-pos="${pos}" data-d="1" aria-label="Move down"${pos === n - 1 ? ' disabled' : ''}>↓</button>`}</span></li>`;
  });
  h += '</ul>';
  if (chk) {
    const ok = st.o.filter((si, pos) => si === pos).length;
    h += `<div class="result ${ok === n ? 'good' : ok >= n - 2 ? 'mid' : 'low'}">${ok} of ${n} in the right place.</div><div class="box get"><span class="lab">The correct paragraph</span><p>${o.sents.map(esc).join(' ')}</p></div><div class="box tech"><span class="lab">How the paragraph works</span><p>${o.note}</p></div><div class="actions"><button type="button" class="ghost" data-act="retry" data-key="order">Try again</button></div>`;
  } else h += `<div class="actions"><button type="button" class="primary" data-act="check" data-key="order">Check the order</button></div>`;
  return h;
}

/* ---------------- write step */
const STOP = new Set('about above after again against also although always another because been before being between both cannot could does doing during each either every from further have having here however into itself just more most much must only other over rather should since some such than that their them then there these they this those through under until very were what when where which while will with would your people their there which'.split(' '));
const wordsOf = s => (s.match(/[A-Za-z0-9'’%-]+/g) || []);
function writeChecks(t, text) {
  const words = wordsOf(text), n = words.length, paras = text.split(/\n\s*\n/).filter(p => p.trim()), low = text.toLowerCase(), out = [];
  const add = (cls, h) => out.push([cls, h]), min = minWords(t);
  add(n >= min ? 'ok' : n >= min - 20 ? 'warn' : 'no', `<b>Length:</b> ${n} words. ${n >= min ? (n > min + 90 ? 'Long: you may be spending time you need elsewhere.' : 'Meets the minimum.') : 'The minimum is ' + min + '.'}`);
  add(paras.length >= (t.task === 1 ? 3 : 4) && paras.length <= 6 ? 'ok' : 'warn', `<b>Paragraphs:</b> ${paras.length}. ${t.task === 1 ? 'Aim for 3 or 4: introduction and overview, then 2 body paragraphs.' : 'Aim for 4 or 5: introduction, 2 body paragraphs, conclusion.'}`);
  const q = wordsOf(t.prompt.replace(/<[^>]+>/g, '')).map(w => w.toLowerCase()), tw = words.map(w => w.toLowerCase()); let copied = false;
  for (let i = 0; i + 8 <= tw.length && !copied; i++) { const g = tw.slice(i, i + 8).join(' '); for (let j = 0; j + 8 <= q.length; j++) if (q.slice(j, j + 8).join(' ') === g) { copied = true; break; } }
  add(copied ? 'warn' : 'ok', `<b>Copying:</b> ${copied ? 'eight or more words in a row are copied from the question. Paraphrase them.' : 'no long copied phrases.'}`);
  if (t.task === 1) {
    const vt = visualsOf(t).map(v => v.type);
    const ov = /\b(overall|in general|generally|in summary|to sum up|as a whole|it is clear|it can be seen|the most (striking|noticeable|significant)|the main (trend|feature|difference))\b/i.test(text);
    add(ov ? 'ok' : 'no', `<b>Overview:</b> ${ov ? 'found an overview signal.' : 'no overview found. Write 2 sentences starting with <i>Overall,</i>.'}`);
    if (vt.some(x => ['line', 'bar', 'pie', 'table'].indexOf(x) >= 0)) {
      const nums = (text.match(/\d[\d.,]*/g) || []).length;
      add(nums >= 6 && nums <= 36 ? 'ok' : 'warn', `<b>Figures:</b> ${nums}. ${nums < 6 ? 'Support your points with selected figures.' : nums > 36 ? 'Too many. Select the key ones.' : 'A sensible number.'}`);
      const cmp = (low.match(/\b(whereas|while|compared with|compared to|in contrast|by contrast|than|twice|half|third|quarter|double|unlike|similar|the same as|highest|lowest|most|least|ahead|behind|below|above|faster|slower|higher|lower|larger|smaller|more|fewer|less|times as|respectively)\b/g) || []).length;
      add(cmp >= 3 ? 'ok' : 'warn', `<b>Comparisons:</b> ${cmp} comparison words. ${cmp >= 3 ? '' : 'Compare items, not just list them.'}`);
    }
    if (vt.indexOf('map') >= 0) { const c = (low.match(/\b(replaced|converted|demolished|cleared|extended|built|constructed|added|removed|relocated|remained|unchanged|new|north|south|east|west|next to|opposite)\b/g) || []).length; add(c >= 8 ? 'ok' : 'warn', `<b>Map language:</b> ${c} change or location words. ${c >= 8 ? '' : 'Describe what changed and where.'}`); }
    if (vt.indexOf('process') >= 0) { const sq = (low.match(/\b(first|firstly|next|then|after that|following this|once|before|subsequently|finally|meanwhile|at the same time)\b/g) || []).length; const pa = (low.match(/\b(is|are|was|were|been)\s+\w+(ed|en)\b/g) || []).length; add(sq >= 3 ? 'ok' : 'warn', `<b>Sequence words:</b> ${sq}. ${sq >= 3 ? '' : 'Show the order of stages.'}`); if (!visualsOf(t).some(v => v.kind === 'cycle')) add(pa >= 3 ? 'ok' : 'warn', `<b>Passive voice:</b> about ${pa} passive verbs. ${pa >= 3 ? '' : 'Manufacturing processes are mostly passive: <i>is heated, are collected</i>.'}`); }
    add(/\b(i think|i believe|in my opinion|i feel|i would|personally)\b/i.test(text) ? 'no' : 'ok', '<b>Opinion:</b> ' + (/\b(i think|i believe|in my opinion|i feel|i would|personally)\b/i.test(text) ? 'Task 1 has no opinions. Remove them.' : 'none, as it should be.'));
  } else {
    const first = (paras[0] || '').toLowerCase(), last = (paras[paras.length - 1] || '').toLowerCase();
    const parts = t.etype === 'problem' || t.etype === 'twopart' || (t.etype === 'advdis' && !/outweigh/i.test(t.prompt));
    const posOp = /(in my opinion|i (firmly |strongly |largely |partly |would )?(believe|agree|disagree|argue|think|am convinced|feel)|this essay|my view|i would say|to my mind|in my view|on balance|outweigh|overall)/.test(first);
    const pos = parts ? (posOp || /(cause|problem|solution|reason|effect|measure|step|advantage|disadvantage|benefit|drawback|can be (reduced|solved|tackled|eased)|several|two main|will include|should)/.test(first)) : posOp;
    add(pos ? 'ok' : 'warn', `<b>${parts ? 'Answers both parts' : 'Position'}:</b> ${pos ? (parts ? 'the introduction signals what you will answer.' : 'stated in the introduction.') : (parts ? 'the introduction does not say what you will cover. Mention the causes/problems and the solutions/effects.' : 'not clear in the first paragraph. Say what you think there.')}`);
    add(/(in conclusion|to conclude|to sum up|in summary|overall|taking everything|all things considered)/.test(last) ? 'ok' : 'warn', '<b>Conclusion:</b> ' + (/(in conclusion|to conclude|to sum up|in summary|overall|taking everything|all things considered)/.test(last) ? 'a conclusion signal found.' : 'the last paragraph does not signal a conclusion.'));
    const ex = (low.match(/\b(for example|for instance|such as|a case in point|to illustrate|take )/g) || []).length;
    add(ex >= 1 ? 'ok' : 'warn', `<b>Examples:</b> ${ex} example signal${ex === 1 ? '' : 's'}. ${ex >= 1 ? 'Make sure each body paragraph has a specific example, with or without a signal phrase.' : 'No example signals found. Back each body paragraph with a specific example.'}`);
    const L = ['moreover', 'furthermore', 'in addition', 'however', 'nevertheless', 'nonetheless', 'whereas', 'while ', 'although', 'despite', 'consequently', 'therefore', 'as a result', 'admittedly', 'on the other hand', 'in contrast', 'by contrast', 'for example', 'for instance', 'this leads to', 'in conclusion', 'besides', 'first,', 'second,', 'finally', 'in particular', 'not only', 'thus', 'since ', 'because', 'also ', 'yet ', 'otherwise', 'which ', 'a second', 'a third', 'most importantly', 'so that', 'provided that', 'on release'];
    const lk = L.filter(x => low.indexOf(x) >= 0).length;
    add(lk >= 4 ? 'ok' : 'warn', `<b>Linking words:</b> ${lk} different ones. ${lk >= 4 ? 'Good variety.' : 'Aim for 4 or more, used naturally.'}`);
    const hg = (low.match(/\b(may|might|could|can|tend to|tends to|is likely to|are likely to|arguably|appears to|seems to|to some extent|in many cases|many |some |often|largely|usually|frequently|rarely|sometimes|generally)\b/g) || []).length;
    add(hg >= 2 ? 'ok' : 'warn', `<b>Careful claims:</b> ${hg} hedging words. ${hg >= 2 ? '' : 'Soften absolute claims with <i>may, tend to, many</i>.'}`);
    const I = (text.match(/\bI\b/g) || []).length; add(I <= 8 ? 'ok' : 'warn', `<b>Use of “I”:</b> ${I}. ${I <= 8 ? '' : 'Too many. Use impersonal structures.'}`);
    add(/\b\w+['’](t|s|re|ve|ll|d|m)\b/.test(text.replace(/['’]s\b/g, '')) ? 'warn' : 'ok', '<b>Contractions:</b> ' + (/\b\w+['’](t|s|re|ve|ll|d|m)\b/.test(text.replace(/['’]s\b/g, '')) ? 'found one. Write <i>do not</i>, not <i>don’t</i>.' : 'none, good.'));
    const cnt = {}, topic = new Set(q.map(w => w.replace(/s$/, ''))); tw.forEach(w => { if (w.length >= 5 && !STOP.has(w) && !topic.has(w.replace(/s$/, ''))) cnt[w] = (cnt[w] || 0) + 1; });
    const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    add(top && cnt[top] >= 8 ? 'warn' : 'ok', `<b>Repetition:</b> ${top && cnt[top] >= 8 ? '“' + esc(top) + '” appears ' + cnt[top] + ' times. Vary it.' : 'no word (other than the topic words) is badly overused.'}`);
    const short = paras.filter(p => wordsOf(p).length < 25).length; add(short > 1 ? 'warn' : 'ok', `<b>Paragraph size:</b> ${short > 1 ? 'more than one very short paragraph. Body paragraphs need about 80 to 100 words.' : 'looks balanced.'}`);
  }
  return out;
}
const tm = t => { const x = S.timer[t.id]; return x && x.start ? x : null; };
const clock = s => { s = Math.max(0, s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
function stepWrite(t) {
  const txt = S.draft[t.id] || '', min = minWords(t), n = wordsOf(txt).length;
  return `<h2>Write it yourself</h2><p>${t.task === 1 ? 'Write your report on this data.' : 'Write your essay.'} You have <b>${t.minutes} minutes</b>. Your draft is saved as you type.</p>
<div class="wrap2"><div><textarea id="wbox" class="wbox" spellcheck="true" placeholder="Start writing here. Leave a blank line between paragraphs.">${esc(txt)}</textarea>
<div class="actions"><button type="button" class="primary" data-act="wcheck">Check my draft</button><button type="button" class="ghost" data-act="wclear">Clear</button><span id="wsaved" class="small"></span></div><ul class="checks" id="wchecks"></ul></div>
<div class="side"><div class="timer" id="timerbox"><span class="tt" id="tt">${t.minutes}:00</span><button type="button" class="ghost sm" data-act="tstart" id="tbtn">Start timer</button></div>
<div class="meter${n >= min ? ' ok' : ''}" id="wmeter"><div class="big"><b id="wn">${n}</b><span> / ${min} words</span></div><div class="bar"><i id="wbar" style="width:${Math.min(100, n / min * 100)}%"></i></div><div class="small" id="wsub"></div></div>
<div class="box tech" style="margin:0"><span class="lab">While you write</span><p class="small" style="margin:0">${t.task === 1 ? 'Paraphrase the question. Overview with no numbers. Group the data. Compare, do not list.' : 'State your position early. One main idea per paragraph. A specific example in each body paragraph.'}</p></div></div></div>`;
}
let tickId = null;
function startWriteUI(t) {
  const box = $('#wbox'); if (!box) return;
  const upd = () => {
    const txt = box.value, n = wordsOf(txt).length, min = minWords(t), paras = txt.split(/\n\s*\n/).filter(p => p.trim()).length, sents = (txt.match(/[^.!?]+[.!?]+/g) || []).length;
    $('#wn').textContent = n; $('#wbar').style.width = Math.min(100, n / min * 100) + '%'; $('#wmeter').classList.toggle('ok', n >= min);
    $('#wsub').textContent = paras + ' paragraph' + (paras === 1 ? '' : 's') + ' · ' + sents + ' sentence' + (sents === 1 ? '' : 's') + (sents ? ' · ' + Math.round(n / sents) + ' words per sentence' : '');
    S.draft[t.id] = txt; save(); $('#wsaved').textContent = 'Saved'; if (n >= min) markDone(t, 'write');
  };
  let to = null; box.addEventListener('input', () => { clearTimeout(to); to = setTimeout(upd, 250); }); upd(); $('#wsaved').textContent = '';
  const draw = () => {
    const x = tm(t), tt = $('#tt'); if (!tt) return;
    if (!x) { tt.textContent = t.minutes + ':00'; $('#timerbox').classList.remove('low'); $('#tbtn').textContent = 'Start timer'; return; }
    const left = t.minutes * 60 - Math.floor((Date.now() - x.start) / 1000);
    tt.textContent = left > 0 ? clock(left) : 'Time is up'; $('#timerbox').classList.toggle('low', left <= 120); $('#tbtn').textContent = 'Stop timer';
  };
  clearInterval(tickId); draw(); tickId = setInterval(draw, 1000);
}

/* ---------------- compare step */
const para = s => String(s).split(/\n\s*\n/).filter(p => p.trim());
function highlightFaults(text, faults) {
  let h = esc(text);
  faults.forEach(f => { const p = esc(f[0]); const i = h.indexOf(p); if (i >= 0) h = h.slice(0, i) + '<span class="fault">' + p + '</span>' + h.slice(i + p.length); });
  return h;
}
function stepCmp(t) {
  const mine = para(S.draft[t.id] || ''), self = S.self[t.id] || {}, crit = t.task === 1 ? D.G.crit1 : D.G.crit2, b7 = t.band7;
  let h = `<h2>Compare and score yourself</h2><div class="cmp"><div class="pane mine"><h3>Your ${t.task === 1 ? 'report' : 'essay'}</h3>${mine.length ? mine.map(p => `<p>${esc(p)}</p>`).join('') : `<p class="empty">You have not written anything yet. <a href="#${t.id}/write">Go to the Write step</a>.</p>`}</div>
<div class="pane model"><h3>Band 9 model</h3>${t.model.map(p => `<p>${esc(p)}</p>`).join('')}</div></div>`;
  h += `<h3>Why the model scores 9</h3><div class="cols">${crit.map(c => `<div class="card edge"><b>${esc(c[1])}</b><p style="margin:6px 0 0;font-size:15.5px">${t.notes[c[0]]}</p></div>`).join('')}</div>`;
  h += `<h3>Band 7 → band 9, one paragraph</h3><p class="small">The band 7 version of paragraph ${b7.para + 1}. Faults are marked in pink.</p><div class="band7"><p>${highlightFaults(b7.text, b7.faults)}</p></div>
<div class="tablewrap"><table><tr><th>Faulty</th><th>Better</th><th>Why</th></tr>${b7.faults.map(f => `<tr><td><span class="fault">${esc(f[0])}</span></td><td><span class="fix">${esc(f[1])}</span></td><td>${f[2]}</td></tr>`).join('')}</table></div>
<div class="band7" style="border-left-color:var(--same-edge)"><p><span class="chip">Band 9</span> ${esc(t.model[b7.para])}</p></div>`;
  h += `<h3>Score yourself</h3><p>Read your own ${t.task === 1 ? 'report' : 'essay'} against each descriptor. Be strict: examiners are.</p><div class="tablewrap"><table class="selft"><tr><th>Criterion</th><th>Your band</th></tr>` +
    crit.map(c => `<tr><td class="k">${esc(c[1])}</td><td><span class="seg">${[5, 6, 7, 8, 9].map(b => `<button type="button" class="${self[c[0]] === b ? 'on' : ''}" data-act="self" data-c="${c[0]}" data-b="${b}">${b}</button>`).join('')}</span>${self[c[0]] ? `<div class="descr">${esc(c[2][self[c[0]]])}</div>` : ''}</td></tr>`).join('') + '</table></div>';
  const vals = crit.map(c => self[c[0]]).filter(Boolean);
  if (vals.length === 4) {
    const avg = vals.reduce((a, b) => a + b, 0) / 4, band = Math.floor(avg * 2 + 0.5 + 1e-9) / 2;
    h += `<div class="result good"><div class="final"><span class="big">${band.toFixed(1)}</span><span>Your self-assessed band for this ${t.task === 1 ? 'report' : 'essay'}. Examiners usually score a little lower than candidates expect, so check the weakest criterion first.</span></div></div>`;
  } else h += `<p class="small">Choose a band for all four criteria to see your overall score.</p>`;
  const i = TASKS.indexOf(t), next = TASKS[i + 1];
  h += `<div class="actions">${next ? `<a class="primary" style="text-decoration:none" href="#${next.id}">Next task: ${esc(next.short)} →</a>` : ''}<a class="ghost" style="text-decoration:none" href="#home">All tasks</a></div>`;
  return h;
}

/* ================================================================ events */
work.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const t = curTask, a = b.dataset.act; if (!t && a !== 'x') return;
  const key = b.dataset.key, d = b.dataset;
  if (a === 'step') { go('#' + t.id + '/' + d.s); return; }
  if (a === 'markread') { markDone(t, 'lang'); renderStep(); return; }
  if (a === 'sel') { const st = stepState(t, key), need = key === 'read' ? 3 : 2, i = +d.i, s = st.sel || (st.sel = []), at = s.indexOf(i); if (at >= 0) s.splice(at, 1); else if (s.length < need) s.push(i); save(); renderStep(); return; }
  if (a === 'check') {
    const st = stepState(t, key); st.chk = true; save(); markDone(t, key === 'read' ? 'read' : key); renderStep(); return;
  }
  if (a === 'retry') { delete S.a[t.id][key]; save(); renderStep(); return; }
  if (a === 'assign') { const st = stepState(t, 'group'); (st.as || (st.as = {}))[+d.i] = +d.g; save(); renderStep(); return; }
  if (a === 'gap') { const st = stepState(t, 'cloze'), i = +d.i; if (st.f[i] >= 0) { st.f[i] = -1; st.act = i; } else st.act = i; save(); renderStep(); return; }
  if (a === 'bank') {
    const st = stepState(t, 'cloze'), c = t.cloze; let g = st.act;
    if (g == null || g < 0 || st.f[g] >= 0) g = st.f.indexOf(-1); if (g < 0) return;
    st.f[g] = +d.i; const nx = st.f.indexOf(-1); st.act = nx; save(); renderStep(); return;
  }
  if (a === 'tok') { const st = stepState(t, 'decode'), i = +d.i, s = st.t || (st.t = []), at = s.indexOf(i); if (at >= 0) s.splice(at, 1); else s.push(i); save(); renderStep(); return; }
  if (a === 'etype') { stepState(t, 'decode').ty = d.v; save(); renderStep(); return; }
  if (a === 'thesis') { stepState(t, 'plan').th = +d.i; save(); renderStep(); return; }
  if (a === 'up') { const st = stepState(t, 'up'); (st.p || (st.p = {}))[+d.q] = +d.i; save(); renderStep(); return; }
  if (a === 'mv') {
    const st = stepState(t, 'order'), p = +d.pos, q = p + +d.d; if (q < 0 || q >= st.o.length) return;
    const x = st.o[p]; st.o[p] = st.o[q]; st.o[q] = x; save(); renderStep(); return;
  }
  if (a === 'tstart') { if (tm(t)) delete S.timer[t.id]; else S.timer[t.id] = { start: Date.now() }; save(); startWriteUI(t); return; }
  if (a === 'wclear') { const box = $('#wbox'); if (box && box.value && !confirm('Clear your draft?')) return; if (box) { box.value = ''; S.draft[t.id] = ''; save(); renderStep(); } return; }
  if (a === 'wcheck') {
    const list = writeChecks(t, $('#wbox').value);
    $('#wchecks').innerHTML = list.map(c => `<li class="${c[0]}"><span>${c[1]}</span></li>`).join(''); return;
  }
  if (a === 'self') { const s = S.self[t.id] || (S.self[t.id] = {}); s[d.c] = +d.b; save(); const crit = t.task === 1 ? D.G.crit1 : D.G.crit2; if (crit.every(c => s[c[0]])) markDone(t, 'cmp'); renderStep(); return; }
});
work.addEventListener('change', e => {
  const s = e.target.closest('[data-act="match"]'); if (!s || !curTask) return;
  const st = stepState(curTask, 'plan'); (st.m || (st.m = {}))[+s.dataset.i] = s.value === '' ? undefined : +s.value; if (s.value === '') delete st.m[+s.dataset.i]; save(); renderStep();
});
/* drag and drop for the order step */
let dragPos = null;
work.addEventListener('dragstart', e => { const li = e.target.closest('.ordl li'); if (!li) return; dragPos = +li.dataset.pos; li.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(dragPos)); } catch (x) {} });
work.addEventListener('dragover', e => { const li = e.target.closest('.ordl li'); if (!li || dragPos == null) return; e.preventDefault(); $$('.ordl li.over').forEach(x => x.classList.remove('over')); li.classList.add('over'); });
work.addEventListener('drop', e => {
  const li = e.target.closest('.ordl li'); if (!li || dragPos == null) return; e.preventDefault();
  const to = +li.dataset.pos, st = stepState(curTask, 'order'), x = st.o.splice(dragPos, 1)[0]; st.o.splice(to, 0, x); dragPos = null; save(); renderStep();
});
work.addEventListener('dragend', () => { dragPos = null; $$('.ordl li').forEach(x => x.classList.remove('drag', 'over')); });
$('#menubtn').addEventListener('click', () => document.body.classList.toggle('railopen'));
document.addEventListener('click', e => { if (document.body.classList.contains('railopen') && !e.target.closest('#rail') && !e.target.closest('#menubtn')) document.body.classList.remove('railopen'); });

render();
})();
