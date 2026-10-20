// Copies eval runs into site/evals/ for the results page.
import fs from 'node:fs';
const dir = new URL('../evals/runs/', import.meta.url);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const history = files.map((f, i) => { const r = JSON.parse(fs.readFileSync(new URL(f, dir))); return { run: i + 1, file: f, passed: r.filter(x => x.passed).length, total: r.length }; });
const latest = JSON.parse(fs.readFileSync(new URL(files.at(-1), dir)));
const sc = JSON.parse(fs.readFileSync(new URL('../evals/scenarios.json', import.meta.url)));
for (const r of latest) { const s = sc.find(x => x.id === r.id); r.caller_brief = s?.caller; r.must = s?.must; r.must_not = s?.must_not; }
const out = new URL('../site/evals/', import.meta.url);
fs.writeFileSync(new URL('data.json', out), JSON.stringify({ history, latest }, null, 1));
fs.copyFileSync(new URL('../evals/ITERATIONS.md', import.meta.url), new URL('ITERATIONS.md', out));
console.log(history.map(h => `run ${h.run}: ${h.passed}/${h.total}`).join(' · '));
