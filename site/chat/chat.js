// Sonic chat prototype. The reviewer plays the caller; Sonic (the Worker) speaks first.
(() => {
const $ = s => document.querySelector(s);
const feed = $('#feed'), input = $('#input'), sendBtn = $('#sendBtn'), endBtn = $('#endBtn');
let messages = [], ctx = null, live = false, busy = false, t0 = 0, timerId = null, current = null, tagsSeen = [];

const FLAG_TEXT = {
  URGENT: '🚨 Urgent alert sent to Ananya', NOTIFY: '🔔 Ananya notified (needs her action)',
  'END:URGENT': '🚨 Ended: urgent, Ananya alerted', 'END:NOTIFY': '🔔 Ended: Ananya needs to act',
  'END:MESSAGE': '📝 Ended: message taken', 'END:DELIVERY_DONE': '🛵 Ended: delivery guided',
  'END:SPAM': '📢 Ended: spam', 'END:SCAM': '🚨 Ended: scam attempt, suggest block',
  'END:SUSPICIOUS': '🕵️ Ended: unverified caller, nothing shared', 'END:WRONG_NUMBER': '↩️ Ended: wrong number',
};

// ----- scenario picker -----
const box = $('#scenarios');
let lastGroup = '';
SCENARIOS.forEach(s => {
  if (s.group !== lastGroup) { box.insertAdjacentHTML('beforeend', `<div class="sgroup">${s.group}</div>`); lastGroup = s.group; }
  const b = document.createElement('button');
  b.className = 'sc'; b.innerHTML = `<i>${s.icon}</i><span>${s.title}</span>`;
  b.onclick = () => pick(s, b);
  box.appendChild(b);
});
function setSelect(sel, val) {
  const el = $(sel); let opt = [...el.options].find(o => o.value === val);
  if (!opt) { opt = new Option(val, val); el.add(opt); }
  el.value = val;
}
function pick(s, btn) {
  document.querySelectorAll('.sc').forEach(x => x.classList.toggle('on', x === btn));
  current = s;
  setSelect('#ctxCaller', s.ctx.caller_match);
  setSelect('#ctxOrders', s.ctx.active_orders);
  setSelect('#ctxTime', s.ctx.now);
}

// ----- call lifecycle -----
function istNow() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function buildCtx() {
  const time = $('#ctxTime').value;
  const caller = $('#ctxCaller').value;
  return {
    now: time === 'now' ? istNow() + ' IST' : time,
    caller_number: current?.ctx.caller_number || (caller.startsWith('unknown') || caller.startsWith('reported') ? '+91 9' + Math.floor(1000 + Math.random() * 8999) + 'x xxxx' : '+91 98xxx x' + (1000 + caller.length * 37)),
    caller_match: caller,
    active_orders: $('#ctxOrders').value,
  };
}
function headerFor(c) {
  const m = c.caller_match;
  const saved = !m.startsWith('unknown') && !m.startsWith('reported');
  $('#callerName').textContent = saved ? m.split(',')[0] : c.caller_number;
  $('#callerMeta').textContent = (saved ? 'Saved contact · ' : m.startsWith('reported') ? '⚠️ ' + m + ' · ' : 'Unknown number · ') + c.now;
  $('#callerAvatar').textContent = saved ? m[0] : '?';
}

$('#startBtn').onclick = startCall;
async function startCall() {
  stopSpeak();
  ctx = buildCtx(); messages = []; tagsSeen = []; live = true;
  feed.innerHTML = ''; $('#flags').innerHTML = '';
  $('#summary').className = 'summary muted'; $('#summary').textContent = 'Call in progress...';
  headerFor(ctx);
  sys(`Call forwarded to Sonic · ${ctx.active_orders === 'none' ? 'no active orders' : 'active order: ' + ctx.active_orders}`);
  t0 = Date.now(); clearInterval(timerId);
  timerId = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#timer').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500);
  endBtn.disabled = false;
  renderTry();
  await agentTurn();
}

async function agentTurn() {
  busy = true; setInputs();
  const typing = document.createElement('div'); typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>';
  feed.appendChild(typing); scroll();
  try {
    const r = await fetch(SONIC_API + '/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ctx, messages }) });
    const d = await r.json();
    typing.remove();
    if (!r.ok || d.error) throw new Error(d.detail || d.error || r.status);
    messages.push({ role: 'assistant', content: d.reply + (d.tags?.length ? '\n' + d.tags.map(t => `[${t}]`).join('\n') : '') });
    bubble('sonic', d.reply);
    speak(d.reply);
    (d.tags || []).forEach(addFlag);
    if ((d.tags || []).some(t => t.startsWith('END:'))) return endCall(true);
  } catch (e) {
    typing.remove();
    const el = document.createElement('div'); el.className = 'err';
    el.textContent = 'Sonic could not reply (' + String(e.message || e).slice(0, 120) + '). Press Send again to retry.';
    feed.appendChild(el); scroll();
  } finally { busy = false; setInputs(); }
}

async function send(text) {
  text = (text || '').trim();
  if (!text || !live || busy) return;
  input.value = '';
  messages.push({ role: 'user', content: text });
  bubble('caller', text);
  await agentTurn();
}
$('#composer').onsubmit = e => { e.preventDefault(); if (!input.value.trim() && messages.at(-1)?.role === 'user') return agentTurn(); send(input.value); };
endBtn.onclick = () => endCall(false);

async function endCall(bySonic) {
  if (!live) return;
  live = false; clearInterval(timerId); endBtn.disabled = true; setInputs();
  sys(bySonic ? 'Sonic ended the call' : 'You hung up');
  $('#trysay').innerHTML = '';
  if (!messages.length) return;
  $('#summary').className = 'summary muted'; $('#summary').textContent = 'Writing summary...';
  try {
    const r = await fetch(SONIC_API + '/summary', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ctx, messages }) });
    const { summary } = await r.json();
    if (!summary) throw new Error('empty');
    const urgent = summary.priority === 'urgent';
    $('#summary').className = 'summary' + (urgent ? ' urgent' : '');
    $('#summary').innerHTML = `<div class="nt"><div class="dot">${urgent ? '!' : 'S'}</div><div><b></b><span></span></div></div>`;
    $('#summary b').textContent = summary.title || 'Call summary';
    $('#summary span').textContent = summary.body || '';
  } catch { $('#summary').textContent = 'Summary unavailable for this call.'; }
}

// ----- UI helpers -----
function bubble(who, text) {
  const el = document.createElement('div'); el.className = 'msg ' + who;
  el.innerHTML = `<span class="lbl">${who === 'sonic' ? 'Sonic' : 'You (caller)'}</span>`;
  el.appendChild(document.createTextNode(text));
  feed.appendChild(el); scroll();
}
function sys(t) { const el = document.createElement('div'); el.className = 'msg sys'; el.textContent = t; feed.appendChild(el); scroll(); }
function addFlag(tag) {
  if (tagsSeen.includes(tag)) return; tagsSeen.push(tag);
  const el = document.createElement('div'); el.className = 'msg flag'; el.textContent = FLAG_TEXT[tag] || tag; feed.appendChild(el);
  const chip = document.createElement('div'); chip.className = 'flagchip ' + tag.replace('END:', ''); chip.textContent = FLAG_TEXT[tag] || tag; $('#flags').appendChild(chip);
  scroll();
}
function scroll() { feed.scrollTop = feed.scrollHeight; }
function setInputs() { input.disabled = !live; sendBtn.disabled = !live || busy; if (live && !busy) input.focus(); }
function renderTry() {
  const t = current?.try || [];
  $('#trysay').innerHTML = t.length ? t.map(x => `<button type="button">“${x.replace(/</g, '&lt;')}”</button>`).join('') : '';
  [...$('#trysay').children].forEach((b, i) => b.onclick = () => { input.value = t[i]; input.focus(); });
}

// ----- voice (optional, browser-native) -----
function speak(text) {
  if (!$('#speak').checked || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = speechSynthesis.getVoices().find(v => /en[-_]IN/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /hi[-_]IN/i.test(v.lang));
  if (v) u.voice = v; u.lang = v?.lang || 'en-IN'; u.rate = 1.02;
  speechSynthesis.speak(u);
}
function stopSpeak() { try { speechSynthesis.cancel(); } catch {} }
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) $('#micBtn').style.display = 'none';
else {
  let rec = null;
  $('#micBtn').onclick = () => {
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = 'en-IN'; rec.interimResults = true;
    $('#micBtn').classList.add('on');
    rec.onresult = e => { input.value = [...e.results].map(r => r[0].transcript).join(' '); };
    rec.onend = () => { $('#micBtn').classList.remove('on'); rec = null; if (input.value.trim()) send(input.value); };
    rec.start();
  };
}

// persona modal
$('#personaBtn').onclick = () => $('#persona').hidden = false;
$('#personaClose').onclick = () => $('#persona').hidden = true;
$('#persona').onclick = e => { if (e.target.id === 'persona') $('#persona').hidden = true; };

// deep link: ?s=D3
const qs = new URLSearchParams(location.search).get('s');
const first = SCENARIOS.find(s => s.id === qs) || SCENARIOS[0];
pick(first, [...document.querySelectorAll('.sc')][SCENARIOS.indexOf(first)]);
})();
