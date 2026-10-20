// Sonic call agent API (Cloudflare Worker + Workers AI).
// POST /chat    { ctx, messages:[{role:'user'|'assistant', content}] , model? } -> { reply, tags, model }
// POST /summary { ctx, messages }  -> { summary } (one-line notification Ananya would see)
// The system prompt lives in prompt/sonic_system_prompt.md and is embedded at build time.
import { SYSTEM_PROMPT } from './prompt.js';

const MODELS = {
  'gpt-oss-120b': '@cf/openai/gpt-oss-120b',
  'llama-3.3-70b': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
};
const DEFAULT_MODEL = 'gpt-oss-120b';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...cors } });

// Deterministic rules are computed here, not by the model: LLMs are unreliable at time comparisons.
function istMinutes(now) {
  const m = String(now || '').match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (m) { let h = +m[1] % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + +m[2]; }
  const d = new Date(Date.now() + 330 * 60000); return d.getUTCHours() * 60 + d.getUTCMinutes();
}
function homeHandover(now) {
  const t = istMinutes(now);
  return t >= 8 * 60 && t < 22 * 60
    ? 'DAYTIME: take it up to Flat 1203 and hand it to Lakshmi aunty (Ananya\'s mother).'
    : 'NIGHT (after 10 pm): leave it with the security guard at Gate 2. Do not go up to the flat.';
}
function fillContext(ctx = {}) {
  const v = (k, d) => (ctx[k] && String(ctx[k]).slice(0, 400)) || d;
  return SYSTEM_PROMPT
    .replace('{{now}}', v('now', 'unknown'))
    .replace('{{caller_number}}', v('caller_number', 'withheld'))
    .replace('{{caller_match}}', v('caller_match', 'unknown number'))
    .replace('{{active_orders}}', v('active_orders', 'none'))
    .replace('{{home_handover_now}}', homeHandover(ctx.now));
}

// Output guard: a phone call can't speak markdown. Strip it and keep the reply short.
function guardSpeech(text) {
  let t = text.replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*\|.*\|\s*$/gm, ' ')
    .replace(/^\s*(#{1,6}\s+|[-*•]\s+|\d+[.)]\s+)/gm, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (t.length > 320) {
    const parts = t.match(/[^.!?]+[.!?]+/g) || [t];
    t = parts.slice(0, 3).join(' ').trim();
  }
  return t;
}

function cleanMessages(messages = []) {
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-30)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1200) }));
}

function extractText(out) {
  if (!out) return '';
  // Prefer the final message channel; never return reasoning items.
  if (Array.isArray(out.output)) {
    const msgs = out.output.filter(i => i.type === 'message' && Array.isArray(i.content));
    const last = msgs.at(-1);
    if (last) { const t = last.content.filter(c => c.type === 'output_text' && c.text).map(c => c.text).join('\n'); if (t) return t; }
  }
  if (typeof out.output_text === 'string') return out.output_text;
  if (out.choices?.[0]?.message?.content) return out.choices[0].message.content;
  if (typeof out.response === 'string') return out.response;
  return '';
}

// gpt-oss sometimes leaks its harmony format (analysis channel, <|end|>, [WAIT]) into the text.
// Returns { text, bad } where bad means the reply is not safe to speak.
const KNOWN_TAG = /^\[(END:[A-Z_]+|NOTIFY|URGENT)\]$/;
function sanitize(raw) {
  let t = String(raw || '');
  const fin = t.lastIndexOf('assistantfinal'); if (fin >= 0) t = t.slice(fin + 'assistantfinal'.length);
  const ch = t.lastIndexOf('<|message|>'); if (ch >= 0) t = t.slice(ch + '<|message|>'.length);
  t = t.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<\|[^|>]*\|>/g, ' ');
  t = t.replace(/\[[^\]\n]{0,60}\]/g, m => KNOWN_TAG.test(m) ? m : ' ');
  // Self-dialogue: the model writing the caller's next line. Keep only what Sonic says.
  const cut = t.search(/(^|\n|\s)(Caller|CALLER|Rider|User|Customer)\s*:/);
  if (cut > 0) t = t.slice(0, cut); else if (cut === 0) t = '';
  t = t.replace(/^\s*(Sonic|SONIC|Assistant)\s*:\s*/, '');
  const bad = !t.replace(/\[[^\]]*\]/g, '').trim() || /^\s*(analysis|thought|reasoning)\b/i.test(t) || /\b(analysis|we need to|the user|caller says)\b.{0,40}\b(verify|respond|answer|wants)\b/i.test(t);
  return { text: t, bad };
}

// App-side privacy check: an address word may only reach a caller who has matched an active order.
const ADDRESS_WORDS = ['palm meadows', 'tranquil', 'hsr', 'bellandur', '14th main', 'cult gym', 'gate 2', 'gate 3', 'gate two', 'gate three', '1203', 'tower b', 'block c', '5th floor', 'fifth floor', 'coffee day', 'ccd', 'outer ring', 'service lift', 'mygate', 'lakshmi', 'sector 6'];
const APPS = ['swiggy', 'zomato', 'zepto', 'blinkit', 'instamart', 'amazon', 'flipkart', 'dunzo', 'bigbasket'];
const STOP = new Set(['address', 'home', 'office', 'arriving', 'minutes', 'none', 'order', 'orders'].concat(APPS));
const HINDI = /\b(bhaiya|hai|hoon|kahan|kya|batao|bolo|theek|nahi|aap|kaunse|pata|yaad|se|ka|ki|ke)\b/i;
function isSaved(ctx) { const m = String(ctx?.caller_match || ''); return m && !/^unknown|^reported/i.test(m); }
function callerVerified(ctx, messages) {
  const orders = String(ctx?.active_orders || 'none').toLowerCase();
  if (orders === 'none' || !orders.trim()) return false;
  const said = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()).join(' ');
  if (!APPS.some(a => orders.includes(a) && said.includes(a))) return false;
  const details = orders.split(/[^a-z]+/).filter(w => w.length >= 4 && !STOP.has(w));
  if (orders.includes('home')) details.push('palm meadows', 'hsr');
  if (orders.includes('office')) details.push('tranquil', 'bellandur');
  return details.some(d => said.includes(d));
}
function privacyGuard(ctx, messages, reply, tags) {
  if (isSaved(ctx)) return null;
  const low = reply.toLowerCase();
  if (!ADDRESS_WORDS.some(w => low.includes(w))) return null;
  if (callerVerified(ctx, messages)) return null;
  const said = messages.filter(m => m.role === 'assistant').map(m => m.content.toLowerCase()).join(' ');
  const lastCaller = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const hi = HINDI.test(lastCaller);
  const hasOrder = String(ctx?.active_orders || 'none').toLowerCase() !== 'none';
  if (!/restaurant/.test(said)) return { reply: hi ? 'Haan bhaiya, kaunse restaurant se hai?' : 'Sure, which restaurant is it from?', tags: [] };
  if (!/building|area/.test(said)) return { reply: hi ? 'Koi baat nahi, app mein kaunsi building ya area dikh raha hai?' : 'No problem, which building or area does your app show?', tags: [] };
  return { reply: hi ? 'Sorry bhaiya, order match kiye bina address share nahi kar sakte. Main Ananya ko bata deti hoon.' : "Sorry, I can't share the address without matching the order. I'll let Ananya know you called.", tags: hasOrder ? ['NOTIFY', 'END:SUSPICIOUS'] : ['END:SUSPICIOUS'] };
}

async function runModel(env, modelKey, system, messages) {
  const id = MODELS[modelKey] || MODELS[DEFAULT_MODEL];
  if (id.includes('gpt-oss')) {
    const out = await env.AI.run(id, {
      instructions: system,
      input: messages.length ? messages : [{ role: 'user', content: '[The call has just connected. Say your first line.]' }],
      reasoning: { effort: 'low' },
    });
    return extractText(out);
  }
  const out = await env.AI.run(id, {
    messages: [{ role: 'system', content: system }, ...(messages.length ? messages : [{ role: 'user', content: '[The call has just connected. Say your first line.]' }])],
    max_tokens: 600,
    temperature: 0.3,
  });
  return extractText(out);
}

function splitTags(text) {
  const tags = [];
  let reply = guardSpeech(text.replace(/\[(END:[A-Z_]+|NOTIFY|URGENT)\]/g, (_, t) => { tags.push(t); return ''; }));
  // A turn that asks a question cannot end the call: keep alerts, drop the hang-up.
  if (/\?\s*$/.test(reply) && tags.some(t => t.startsWith('END:'))) {
    const kept = [];
    for (const t of tags) { if (t === 'END:URGENT') kept.push('URGENT'); else if (t === 'END:NOTIFY') kept.push('NOTIFY'); else if (!t.startsWith('END:')) kept.push(t); }
    tags.length = 0; tags.push(...new Set(kept));
  }
  return { reply, tags: [...new Set(tags)] };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') return json({ ok: true, service: 'sonic-agent', models: Object.keys(MODELS) });
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);
    let body;
    try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
    const messages = cleanMessages(body.messages);
    const modelKey = MODELS[body.model] ? body.model : DEFAULT_MODEL;
    try {
      if (url.pathname === '/chat') {
        // Opening line: the conversation starts with a synthetic "call connected" user turn.
        const msgs = messages.length && messages[0].role === 'assistant'
          ? [{ role: 'user', content: '[The call has just connected. Say your first line.]' }, ...messages]
          : messages;
        const system = fillContext(body.ctx);
        let clean = sanitize(await runModel(env, modelKey, system, msgs));
        let retried = false;
        if (clean.bad) { retried = true; clean = sanitize(await runModel(env, modelKey, system, msgs)); }
        if (clean.bad) clean = { text: "Sorry, the line isn't clear. Could you say that again?", bad: false };
        let { reply, tags } = splitTags(clean.text);
        const g = privacyGuard(body.ctx, messages, reply, tags);
        if (g) ({ reply, tags } = g);
        return json({ reply: reply || "Sorry, the line isn't clear. Could you say that again?", tags, model: modelKey, guarded: !!g, retried });
      }
      if (url.pathname === '/summary') {
        const transcript = messages.map(m => (m.role === 'assistant' ? 'Sonic: ' : 'Caller: ') + m.content).join('\n');
        const sys = 'You write the one notification Ananya sees after Sonic (her AI call assistant) handled a call. ' +
          'Use only facts stated in the transcript; never add or change who is affected, where, or what happened. If the caller spoke Telugu, Hindi or Kannada, translate faithfully. ' +
          'Return ONLY a JSON object: {"title": "max 6 words", "body": "max 25 words, plain, what she needs to know or do", "priority": "urgent|normal|low"}.';
        const raw = await runModel(env, modelKey, sys, [{ role: 'user', content: 'Call context: ' + JSON.stringify(body.ctx || {}) + '\n\nTranscript:\n' + transcript }]);
        const m = (raw || '').match(/\{[\s\S]*\}/);
        let summary = null;
        try { summary = m ? JSON.parse(m[0]) : null; } catch {}
        return json({ summary });
      }
      return json({ error: 'not found' }, 404);
    } catch (e) {
      const msg = String(e && e.message || e);
      if (/4006|daily free allocation/.test(msg)) return json({ error: 'quota', detail: "Sonic's free daily limit on Cloudflare is used up. It resets at 5:30 am IST." }, 503);
      return json({ error: 'model_error', detail: msg.slice(0, 300) }, 502);
    }
  },
};
