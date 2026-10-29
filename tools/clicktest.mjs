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
    await b.click('[data-act=watch]'); await b.sleep(1500);
    await b.eval('document.querySelector("#video .vscene.on")?.dataset.scene').then(v => console.log('  video scene', v)); await b.click('[data-act=close-video]');
    await log('-> (what merged into welcome)');
    console.log('  welcome rows:', await b.eval('document.querySelectorAll(".wrow").length'));

    await b.click('[data-act=next]'); await log('-> you'); await b.click('[data-act=next]'); await log('-> choose');
    await b.click('[data-choice=all]'); await b.click('[data-act=next]'); await log('-> perms');
    const perms = os === 'ios' ? ['contacts', 'notif'] : ['contacts', 'phone', 'notif'];
    console.log('  cta disabled before perms:', await b.eval('document.querySelector(".footer .cta").disabled'));
    await b.click(`[data-perm=${perms[0]}]`); await b.click('.sysdlg [data-r=no]');
    console.log('  deny sheet has Open Settings:', await b.eval('!!document.querySelector("#sheet [data-act=open-app-settings]")'));
    await b.click(`#sheet [data-perm=${perms[0]}]`); await b.click('.sysdlg [data-r=yes]');
    if (await b.eval('!!document.querySelector("[data-act=allow-all]")')) { await b.click('[data-act=allow-all]'); for (const p of perms.slice(1)) { await b.sleep(400); await b.click('.sysdlg [data-r=yes]'); } }
    console.log('  continue after allow all:', await b.eval('document.querySelector(".footer .cta").dataset.act'));
    await b.shot(`${out}/ct_${os}_perms.png`);
    await b.click('[data-act=next]'); await log('-> next after perms');
    if (os === 'ios') {
      await b.click('[data-act=open-settings]'); await b.shot(`${out}/ct_ios_settings.png`);
      await b.click('[data-act=close-outside]');
      console.log('  voicemail CTA after return:', await b.eval('document.querySelector(".footer .cta").textContent'));
      await b.click('[data-act=next]'); await log('-> forward');
      console.log('  one-tap CTA enabled before copy:', !(await b.eval('document.querySelector(".footer .cta").disabled')));
      await b.click('[data-act=listen]'); console.log('  listen playing:', await b.eval('!!document.querySelector(".listen.on")')); await b.click('[data-act=listen]');
      await b.click('[data-act=help]'); console.log('  help sheet:', await b.eval('document.querySelector("#sheet.on h3")?.textContent')); await b.click('#sheetBackdrop');
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
  for (const p of ['contacts', 'phone', 'notif']) { await f.click(`[data-perm=${p}]`); await f.click('.sysdlg [data-r=yes]'); }
  await f.click('[data-act=next]'); await f.click('[data-act=sim-toggle]');
  await f.click('[data-act=open-dialer]'); await f.click('#dial'); await f.sleep(1600);
  console.log('failure dialog:', await f.eval('document.querySelector(".carrier")?.innerText.replace(/\\s+/g," ")'));
  await f.click('[data-act=fwd-fail]');
  console.log('help sheet after failure:', await f.eval('document.querySelector("#sheet.on h3")?.textContent'));
} catch (e) { console.log('FAIL failure-path', e.message); }
console.log('failure-path errors:', f.logs.length ? f.logs : 'none');
f.close();
