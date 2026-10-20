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
  if (typeof out.response === 'string') return out.response;
  if (typeof out.output_text === 'string') return out.output_text;
  // OpenAI Responses-style output (gpt-oss on Workers AI)
  if (Array.isArray(out.output)) {
    const parts = [];
    for (const item of out.output) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const c of item.content) if (c.type === 'output_text' && c.text) parts.push(c.text);
      }
    }
    if (parts.length) return parts.join('\n');
  }
  if (out.choices?.[0]?.message?.content) return out.choices[0].message.content;
  return '';
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
  const reply = guardSpeech(text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/\[(END:[A-Z_]+|NOTIFY|URGENT)\]/g, (_, t) => { tags.push(t); return ''; }));
  return { reply, tags };
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
        const raw = await runModel(env, modelKey, fillContext(body.ctx), msgs);
        const { reply, tags } = splitTags(raw || '');
        return json({ reply: reply || 'Sorry, the line isn\'t clear. Could you say that again?', tags, model: modelKey });
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
      return json({ error: 'model_error', detail: String(e && e.message || e).slice(0, 300) }, 502);
    }
  },
};
