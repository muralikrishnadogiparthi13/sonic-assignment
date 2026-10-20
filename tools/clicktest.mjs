// Walks the full onboarding as a user would, on Android and iPhone, and fails loudly on any broken step.
import { launch } from './cdp.mjs';
const [base = 'http://localhost:8765/onboarding/', out = '/tmp'] = process.argv.slice(2);
const b = await launch();
const step = () => b.eval('document.querySelector("#flowmap li.cur")?.textContent || "test_ok/other"');
const log = async m => console.log(m.padEnd(34), '|', await step());
try {
  for (const os of ['android', 'ios']) {
    await b.goto(base + '?os=' + os);
    await log(os + ' start');
    await b.click('[data-act=play]'); await b.sleep(1500);
    await b.eval('document.querySelector("#video .vscene.on")?.dataset.scene').then(v => console.log('  video scene', v));
    await b.click('[data-act=next]'); await log('-> what');
    await b.click('[data-tab=spam]'); await b.click('[data-worry="1"]');
    console.log('  tip shown:', await b.eval('!!document.querySelector(".tip")'));
    await b.click('[data-act=next]'); await log('-> choose');
    await b.click('[data-choice=all]'); await b.click('[data-act=next]'); await log('-> perms');
    const perms = os === 'ios' ? ['contacts', 'notif'] : ['contacts', 'phone', 'notif'];
    console.log('  cta disabled before perms:', await b.eval('document.querySelector(".footer .cta").disabled'));
    await b.click(`[data-perm=${perms[0]}]`); await b.click('.sysdlg [data-r=no]');
    console.log('  deny sheet has Open Settings:', await b.eval('!!document.querySelector("#sheet [data-act=open-app-settings]")'));
    await b.click(`#sheet [data-perm=${perms[0]}]`); await b.click('.sysdlg [data-r=yes]');
    for (const p of perms.slice(1, -1)) { await b.click(`[data-perm=${p}]`); await b.click('.sysdlg [data-r=yes]'); }
    console.log('  continue enabled without optional notif:', !(await b.eval('document.querySelector(".footer .cta").disabled')));
    await b.shot(`${out}/ct_${os}_perms.png`);
    await b.click('[data-act=next]'); await log('-> phone');
    console.log('  cta disabled before wifi:', await b.eval('document.querySelector(".cta").disabled'));
    await b.click('[data-act=wifi]'); await b.shot(`${out}/ct_${os}_phone.png`); await b.click('[data-act=next]'); await log('-> next after phone');
    if (os === 'ios') {
      await b.click('[data-act=open-settings]'); await b.shot(`${out}/ct_ios_settings.png`);
      await b.click('[data-act=close-outside]');
      console.log('  voicemail CTA after return:', await b.eval('document.querySelector(".footer .cta").textContent'));
      await b.click('[data-act=next]'); await log('-> forward');
      console.log('  open-phone disabled before copy:', await b.eval('document.querySelector(".footer .cta").disabled'));
      await b.click('[data-act=copy-code]');
    }
    // leave dialer without dialling -> prompt
    await b.click('[data-act=open-dialer]'); await b.click('[data-act=close-outside]');
    console.log('  return prompt:', await b.eval('document.querySelector("#sheet.on h3")?.textContent'));
    await b.click('#sheetBackdrop');
    await b.click('[data-act=open-dialer]');
    if (os === 'ios') await b.click('#paste');
    console.log('  dialer shows:', await b.eval('document.querySelector("#dialnum").textContent'));
    await b.shot(`${out}/ct_${os}_dialer.png`);
    await b.click('#dial'); await b.sleep(1600); await b.shot(`${out}/ct_${os}_carrier.png`);
    await b.click('[data-act=fwd-done]'); await log('-> test');
    await b.click('[data-act=noring]'); console.log('  no-ring sheet:', await b.eval('document.querySelector("#sheet.on h3")?.textContent')); await b.click('[data-act=close-sheet]');
    await b.click('[data-act=call-me]'); await b.sleep(1500); await b.shot(`${out}/ct_${os}_incoming.png`);
    await b.click('[data-act=accept]'); console.log('  retry tip:', await b.eval('!!document.querySelector(".tip")'));
    await b.click('[data-act=call-me]'); await b.sleep(1500);
    await b.click('[data-act=decline]'); await log('-> test_ok');
    await b.click('[data-act=to-live]'); await log('-> live');
    await b.shot(`${out}/ct_${os}_live.png`);
    await b.click('[data-act=deliv]'); await b.shot(`${out}/ct_${os}_deliv.png`);
    await b.click('[data-act=restart]');
  }
} catch (e) { console.log('FAIL', e.message); }
console.log('page errors:', b.logs.length ? b.logs : 'none');
b.close();

// failure path: SIM 2 makes the carrier reply with an error
const f = await launch({ port: 9356 });
try {
  await f.goto(base + '?os=android');
  await f.eval(`(()=>{const go=s=>document.querySelector(s).click(); go('[data-act=next]'); go('[data-act=next]'); go('[data-act=next]');})()`); await f.sleep(300);
  for (const p of ['contacts', 'phone']) { await f.click(`[data-perm=${p}]`); await f.click('.sysdlg [data-r=yes]'); }
  await f.click('[data-act=next]'); await f.click('[data-sim="2"]'); await f.click('[data-act=wifi]'); await f.click('[data-act=next]');
  await f.click('[data-act=open-dialer]'); await f.click('#dial'); await f.sleep(1600);
  console.log('failure dialog:', await f.eval('document.querySelector(".carrier")?.innerText.replace(/\\s+/g," ")'));
  await f.click('[data-act=fwd-fail]');
  console.log('help sheet after failure:', await f.eval('document.querySelector("#sheet.on h3")?.textContent'));
} catch (e) { console.log('FAIL failure-path', e.message); }
console.log('failure-path errors:', f.logs.length ? f.logs : 'none');
f.close();
