// Embeds prompt/sonic_system_prompt.md into src/prompt.js so the Worker and the repo always use the same text.
import fs from 'node:fs';
const md = fs.readFileSync(new URL('../prompt/sonic_system_prompt.md', import.meta.url), 'utf8');
// Drop the human-only header note (lines starting with '>') before the first '---'
const body = md.split('\n').filter(l => !l.startsWith('>')).join('\n');
fs.writeFileSync(new URL('./src/prompt.js', import.meta.url), 'export const SYSTEM_PROMPT = ' + JSON.stringify(body) + ';\n');
console.log('prompt chars', body.length);
