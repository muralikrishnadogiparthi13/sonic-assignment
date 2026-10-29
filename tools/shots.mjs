// Captures 2x screenshots of each onboarding screen (phone only) into site/assets/screens/.
import { launch } from './cdp.mjs';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:8765/onboarding/';
const out = new URL('../site/assets/screens/', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const b = await launch({ width: 1300, height: 950 });
await b.send('Emulation.setDeviceMetricsOverride', { width: 1300, height: 950, deviceScaleFactor: 2, mobile: false });
async function phoneShot(name) {
  await b.sleep(400);
  const r = await b.eval('(()=>{const e=document.querySelector("#phone").getBoundingClientRect();return {x:e.x,y:e.y,w:e.width,h:e.height}})()');
  const s = await b.send('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  fs.writeFileSync(out + name + '.png', Buffer.from(s.result.data, 'base64'));
}
const steps = ['welcome', 'what', 'choose', 'perms', 'forward', 'test', 'test_ok', 'live'];
for (const st of steps) { await b.goto(base + '?os=android&lang=en&step=' + st); await b.eval('document.fonts.ready'); await phoneShot('android_' + st); }
await b.goto(base + '?os=ios&step=voicemail'); await phoneShot('ios_voicemail');
await b.goto(base + '?os=ios&step=forward'); await phoneShot('ios_forward');
await b.goto(base + '?os=ios&step=voicemail'); await b.click('[data-act=open-settings]'); await phoneShot('ios_settings');
await b.goto(base + '?os=android&step=forward'); await b.click('[data-act=open-dialer]'); await b.click('#dial'); await b.sleep(1600); await phoneShot('android_carrier');
await b.goto(base + '?step=test'); await b.click('[data-act=call-me]'); await b.sleep(1500); await phoneShot('android_incoming');
console.log(fs.readdirSync(out).join(' '));
b.close();
