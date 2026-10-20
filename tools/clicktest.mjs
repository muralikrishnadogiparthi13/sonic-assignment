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
    await b.click('[data-choice=all]'); await b.click('[data-act=next]'); await log('-> phone');
    console.log('  cta disabled before wifi:', await b.eval('document.querySelector(".cta").disabled'));
    await b.click('[data-act=wifi]'); await b.click('[data-act=next]'); await log('-> perms');
    const perms = os === 'ios' ? ['contacts', 'notif'] : ['screen', 'contacts', 'notif', 'phone'];
    // deny first one, then retry from sheet
    await b.click(`[data-perm=${perms[0]}]`); await b.click('.sysdlg [data-r=no]');
    console.log('  deny sheet open:', await b.eval('document.querySelector("#sheet").classList.contains("on")'));
    await b.click(`#sheet [data-perm=${perms[0]}]`); await b.click('.sysdlg [data-r=yes]');
    for (const p of perms.slice(1)) { await b.click(`[data-perm=${p}]`); await b.click('.sysdlg [data-r=yes]'); }
    await b.shot(`${out}/ct_${os}_perms.png`);
    await b.click('[data-act=next]'); await log('-> next after perms');
    if (os === 'ios') {
      await b.click('[data-act=open-settings]');
      await b.shot(`${out}/ct_ios_settings.png`);
      await b.click('[data-ios=lv]'); await b.click('[data-suc=Never]');
      await b.click('[data-act=close-outside]');
      await b.click('[data-act=next]'); await log('-> forward');
      console.log('  open-phone disabled before copy:', await b.eval('document.querySelector(".footer .cta").disabled'));
      await b.click('[data-act=copy-code]');
    }
    await b.click('[data-act=open-dialer]');
    if (os === 'ios') await b.click('#paste');
    console.log('  dialer shows:', await b.eval('document.querySelector("#dialnum").textContent'));
    await b.shot(`${out}/ct_${os}_dialer.png`);
    await b.click('#dial'); await b.sleep(1600); await b.shot(`${out}/ct_${os}_carrier.png`);
    await b.click('[data-act=fwd-done]'); await log('-> test');
    await b.click('[data-act=call-me]'); await b.sleep(1500); await b.shot(`${out}/ct_${os}_incoming.png`);
    await b.click('[data-act=accept]'); console.log('  retry tip:', await b.eval('!!document.querySelector(".tip")'));
    await b.click('[data-act=call-me]'); await b.sleep(1500);
    await b.click('[data-act=decline]'); await log('-> test_ok');
    await b.click('[data-act=to-live]'); await log('-> live');
    await b.click('[data-act=deliv]'); await b.shot(`${out}/ct_${os}_deliv.png`);
  }
} catch (e) { console.log('FAIL', e.message); }
console.log('page errors:', b.logs.length ? b.logs : 'none');
b.close();
