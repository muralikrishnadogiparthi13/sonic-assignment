// Builds site/chat/scenarios.js from evals/scenarios.json so the chat picker and the eval suite use the same calls.
import fs from 'node:fs';
const sc = JSON.parse(fs.readFileSync(new URL('../evals/scenarios.json', import.meta.url)));
const ICON = { Delivery: '🛵', Spam: '📢', Scam: '🚨', Family: '🏠', Friend: '💬', Work: '💼', Unknown: '❓', Edge: '🧪' };
const out = sc.map(s => ({ id: s.id, group: s.group, icon: ICON[s.group] || '📞', title: s.title, ctx: s.ctx, try: s.try || [] }));
fs.writeFileSync(new URL('../site/chat/scenarios.js', import.meta.url), 'window.SCENARIOS = ' + JSON.stringify(out, null, 1) + ';\n');
console.log(out.length, 'scenarios');
