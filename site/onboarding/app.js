// Sonic onboarding prototype. Plain JS, no build step.
(() => {
const $ = (s, el = document) => el.querySelector(s);
const screen = $('#screen'), sheet = $('#sheet'), backdrop = $('#sheetBackdrop'), toastEl = $('#toast'), phone = $('#phone');

const S = {
  os: 'android', lang: 'en', step: 'welcome',
  choice: 'unknown', sim: 1, network: 'Jio', wifiOff: false,
  perms: { screen: false, contacts: false, notif: false, phone: false },
  ios: { lv: true, suc: true }, fwdCopied: false, testTries: 0, tab: 'del', worry: null,
};
const T = k => (COPY[S.lang][k] ?? COPY.en[k] ?? k);

const FLOW = () => S.os === 'ios'
  ? ['welcome', 'what', 'choose', 'phone', 'perms', 'voicemail', 'forward', 'test', 'live']
  : ['welcome', 'what', 'choose', 'phone', 'perms', 'forward', 'test', 'live'];
const LABELS = { welcome: 'Welcome + explainer', what: 'What Sonic handles', choose: 'Choose which calls', phone: 'SIM + network', perms: 'Permissions', voicemail: 'Turn off iPhone voicemail', forward: 'Call forwarding code', test: 'Test call', live: 'Sonic is live' };

// ---------- helpers ----------
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('on'), 1600); }
function openSheet(html) { sheet.innerHTML = '<div class="grab"></div>' + html; sheet.classList.add('on'); backdrop.classList.add('on'); }
function closeSheet() { sheet.classList.remove('on'); backdrop.classList.remove('on'); }
backdrop.onclick = closeSheet;
function go(step) { S.step = step; stopVideo(); render(); }
function nextStep() { const f = FLOW(); go(f[Math.min(f.indexOf(S.step) + 1, f.length - 1)]); }
function prevStep() { const f = FLOW(); go(f[Math.max(f.indexOf(S.step) - 1, 0)]); }
function setHint(t) { $('#hint').textContent = t || 'Tap through like a real user. Buttons and toggles work.'; }
function copyText(t) { try { navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {}); } catch (e) {} }

const SETUP = () => FLOW().filter(x => !['welcome', 'what', 'test', 'live'].includes(x));
function stepKicker() {
  const f = SETUP(), i = f.indexOf(S.step);
  return S.lang === 'hi' ? `Step ${i + 1} / ${f.length}` : `Step ${i + 1} of ${f.length}`;
}
function appbar() {
  const f = SETUP(), i = f.indexOf(S.step);
  const pct = S.step === 'what' ? 4 : S.step === 'test' ? 100 : Math.round(((i + 1) / (f.length + 1)) * 100);
  return `<div class="appbar"><button class="back" data-act="back" aria-label="Back">‹</button><div class="progress"><i style="width:${pct}%"></i></div></div>`;
}

// ---------- screens ----------
const screens = {};

screens.welcome = () => `
  <div class="body" style="padding-top:26px">
    <p class="kicker">${T('w_kicker')}</p>
    <h1>${T('w_title')}</h1>
    <p class="lede">${T('w_lede')}</p>
    ${videoBlock()}
    <div class="row" style="align-items:center;gap:10px;margin-top:2px">
      <div class="ico p" style="width:34px;height:34px;border-radius:12px;font-size:16px">🛡️</div>
      <p class="small" style="margin:0">${T('w_trust')}</p>
    </div>
  </div>
  <div class="footer">
    <button class="cta" data-act="next">${T('w_cta')}</button>
    <button class="link" data-act="later">${T('w_how')}</button>
  </div>`;

screens.what = () => {
  const tabs = [['del', T('t_del'), '🛵'], ['spam', T('t_spam'), '🚫'], ['fam', T('t_fam'), '🏠']];
  const map = { del: ['del_h', 'del_p', 'del_b', 'g'], spam: ['spam_h', 'spam_p', 'spam_b', 'c'], fam: ['fam_h', 'fam_p', 'fam_b', 'a'] }[S.tab];
  const bubbles = T(map[2]).map(([w, t]) => `<div class="bub ${w === 'Sonic' ? 'sonic' : 'caller'}"><span class="who">${w}</span>${t}</div>`).join('');
  const worries = [1, 2, 3, 4].map(n => `<button class="chip ${S.worry === n ? 'on' : ''}" data-worry="${n}">${T('wq' + n)}</button>`).join('');
  return `${appbar()}
  <div class="body">
    <p class="kicker">${T('d_kicker')}</p>
    <h2>${T('d_title')}</h2>
    <div class="tabs">${tabs.map(([k, l, e]) => `<button class="tab ${S.tab === k ? 'on' : ''}" data-tab="${k}">${e} ${l}</button>`).join('')}</div>
    <div class="card">
      <div class="row"><div class="ico ${map[3]}">${tabs.find(t => t[0] === S.tab)[2]}</div><div><h3>${T(map[0])}</h3><p>${T(map[1])}</p></div></div>
      <div class="bubbles">${bubbles}</div>
    </div>
    <p class="small" style="margin:14px 0 4px;font-weight:700;color:#E4E4EC">${T('worries_h')}</p>
    <div class="chips">${worries}</div>
    ${S.worry ? `<div class="tip"><b>💡 ${T('wq' + S.worry)}</b>${T('wa' + S.worry)}</div>` : ''}
  </div>
  <div class="footer"><button class="cta" data-act="next">${T('continue')}</button></div>`;
};

screens.choose = () => {
  const f = T('c_f1');
  const opt = (k, h, p, badge, flow) => `
    <button class="opt ${S.choice === k ? 'sel' : ''}" data-choice="${k}">
      ${badge ? `<span class="badge">${T('c_rec')}</span>` : ''}
      <h3>${T(h)}</h3><p>${T(p)}</p><span class="radio"></span>
      <div class="flowmini">${flow}</div>
    </button>`;
  const fUnknown = `<span>📞 ${S.lang === 'hi' ? 'Unknown number' : 'Unknown number'}</span><span class="arr">→</span><span>${f[1]}</span><span class="arr">→</span><span class="s">${f[3].split(':')[0]}: Sonic</span>`;
  const fAll = `<span>📞 ${f[0]}</span><span class="arr">→</span><span>${f[1]}</span><span class="arr">→</span><span class="you">${f[2]}</span><span class="s">${f[3]}</span>`;
  return `${appbar()}
  <div class="body">
    <p class="kicker">${stepKicker()}</p>
    <h2>${T('c_title')}</h2>
    <p class="lede">${T('c_lede')}</p>
    ${opt('unknown', 'c1_h', 'c1_p', true, fUnknown)}
    ${opt('all', 'c2_h', 'c2_p', false, fAll)}
    ${S.os === 'ios' ? `<div class="tip"><b>📱 iPhone</b>${T('c_ios')}</div>` : ''}
    <p class="small">${T('c_change')}</p>
  </div>
  <div class="footer"><button class="cta" data-act="next">${T('continue')}</button></div>`;
};

screens.phone = () => {
  const nets = ['Jio', 'Airtel', 'Vi', 'BSNL'];
  return `${appbar()}
  <div class="body">
    <p class="kicker">${stepKicker()}</p>
    <h2>${T('p_title')}</h2>
    <p class="lede">${T('p_lede')}</p>
    <div class="card">
      <div style="display:flex;gap:8px;margin-bottom:12px">
        ${[1, 2].map(n => `<button class="pill-sm ${S.sim === n ? 'on' : ''}" data-sim="${n}">${T('p_sim' + n)} · ${n === 1 ? '98xxx x4120' : '70xxx x8812'}</button>`).join('')}
      </div>
      <p class="small" style="margin:0 0 8px">${T('p_net')} ${S.os === 'android' ? `· <span class="done-tick">${T('p_detected')}</span>` : `· ${T('p_pick')}`}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${nets.map(n => `<button class="pill-sm ${S.network === n ? 'on' : ''}" data-net="${n}">${n}</button>`).join('')}
      </div>
    </div>
    <div class="tip">
      <b>📶 ${T('p_wifi_h')}</b>${T('p_wifi')}
      <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;background:#fff6;border-radius:14px;padding:8px 10px">
        <span style="font-weight:700">Wi-Fi calling</span>
        <button class="switch ${S.wifiOff ? '' : 'on'}" data-act="wifi" aria-label="Wi-Fi calling"></button>
      </div>
    </div>
  </div>
  <div class="footer"><button class="cta" data-act="next" ${S.wifiOff ? '' : 'disabled'}>${S.wifiOff ? T('continue') : T('p_wifi_need')}</button></div>`;
};

screens.perms = () => {
  const list = S.os === 'ios' ? ['contacts', 'notif'] : ['screen', 'contacts', 'notif', 'phone'];
  const ico = { screen: ['p', '📞'], contacts: ['g', '👥'], notif: ['a', '🔔'], phone: ['c', '📶'] };
  const all = list.every(k => S.perms[k]);
  return `${appbar()}
  <div class="body">
    <p class="kicker">${stepKicker()}</p>
    <h2>${T('r_title')}</h2>
    <p class="lede">${T('r_lede')}</p>
    <div class="card" style="padding:4px 16px">
      ${list.map(k => `
        <div class="lrow">
          <div class="ico ${ico[k][0]}">${ico[k][1]}</div>
          <div class="t"><b>${T('r_' + k)}</b><span>${T('r_' + k + '_w')}</span></div>
          ${S.perms[k] ? '<span class="done-tick">✓</span>' : `<button class="pill-sm on" data-perm="${k}">${T('allow')}</button>`}
        </div>`).join('')}
    </div>
    <div class="tip"><b>🔒 ${S.lang === 'hi' ? 'Bharosa' : 'Promise'}</b>${T('r_never')}</div>
  </div>
  <div class="footer"><button class="cta" data-act="next" ${all ? '' : 'disabled'}>${all ? T('continue') : T('r_need')}</button></div>`;
};

screens.voicemail = () => `${appbar()}
  <div class="body">
    <p class="kicker">${stepKicker()}</p>
    <h2>${T('v_title')}</h2>
    <p class="lede">${T('v_lede')}</p>
    <div class="card"><div class="flowmini" style="margin:0"><span>📞 ${S.lang === 'hi' ? 'Missed call' : 'Missed call'}</span><span class="arr">→</span><span style="text-decoration:line-through;opacity:.6">iPhone voicemail</span><span class="arr">→</span><span class="s">Sonic</span></div></div>
    <ol class="steps">
      <li class="${S.ios.lv ? '' : 'ok'}"><b>${T('v_s1')}</b><p>${T('v_s1p')}</p></li>
      <li class="${S.ios.suc ? '' : 'ok'}"><b>${T('v_s2')}</b><p>${T('v_s2p')}</p></li>
    </ol>
    <button class="link" data-act="vm-cant" style="padding-left:0">${T('v_cant')}</button>
  </div>
  <div class="footer">
    ${(!S.ios.lv && !S.ios.suc) ? `<button class="cta" data-act="next">${T('continue')}</button>` : `<button class="cta" data-act="open-settings">${T('v_open')}</button>`}
  </div>`;

screens.forward = () => {
  const ios = S.os === 'ios';
  return `${appbar()}
  <div class="body">
    <p class="kicker">${stepKicker()}</p>
    <h2>${T('f_title')}</h2>
    <p class="lede">${T('f_lede')}</p>
    <div class="numcard">
      <p class="small" style="margin:0 0 2px;color:#C9B6FF">${T('f_your')}</p>
      <div class="n">${SONIC_NUMBER}</div>
      <p class="small" style="margin:4px 0 0">${T('f_your_s')}</p>
    </div>
    <ol class="steps">
      <li class="${S.fwdCopied ? 'ok' : ''}"><b>${T('f_1')}</b><p>${T('f_1p')}</p>
        <div class="code"><span>${FWD_CODE}</span><button class="copy" data-act="copy-code">${S.fwdCopied ? T('f_copied') + ' ✓' : T('f_copy')}</button></div>
      </li>
      <li><b>${ios ? T('f_2i') : T('f_2a')}</b><p>${ios ? T('f_2ip') : T('f_2ap')}</p></li>
      <li><b>${T('f_3')}</b><p>${T('f_3p')}</p></li>
    </ol>
    <div class="tip"><b>↩️ ${S.lang === 'hi' ? 'Kabhi bhi band' : 'Undo anytime'}</b>${T('f_safe')}</div>
    <button class="link" data-act="fwd-help" style="padding-left:0">${T('f_help')}</button>
  </div>
  <div class="footer"><button class="cta" data-act="open-dialer" ${S.fwdCopied || !ios ? '' : 'disabled'}>${ios ? T('f_open_phone') : T('f_open_dialer')}</button></div>`;
};

screens.test = () => `${appbar()}
  <div class="body">
    <p class="kicker">${T('x_kicker')}</p>
    <h2>${T('x_title')}</h2>
    <p class="lede">${T('x_lede')}</p>
    <div class="card" style="text-align:center;padding:22px">
      <div style="width:120px;height:80px;margin:0 auto">${svg(sonicOrb(160, 100, 40), "transparent")}</div>
      <p class="small" style="margin:8px 0 0">${S.lang === 'hi' ? 'Aapka phone: ' : 'Calling your phone: '}<b style="color:#fff">${S.sim === 1 ? '98xxx x4120' : '70xxx x8812'}</b></p>
    </div>
    ${S.testTries > 0 ? `<div class="tip"><b>👍</b>${T('x_pick')}</div>` : ''}
  </div>
  <div class="footer"><button class="cta" data-act="call-me">${T('x_cta')}</button></div>`;

screens.test_ok = () => `
  <div class="body" style="padding-top:30px">
    <div style="width:64px;height:64px;border-radius:20px;background:var(--green);display:grid;place-items:center;font-size:34px;color:#fff;font-weight:800;margin-bottom:14px">✓</div>
    <h2>${T('x_ok_h')}</h2>
    <p class="lede">${T('x_ok_p')}</p>
    <div class="bubbles"><div class="bub sonic" style="max-width:100%"><span class="who">Sonic</span>${T('x_line')}</div></div>
    <p class="small" style="margin-top:14px">${S.lang === 'hi' ? 'Yahi aawaz aapke callers sunenge. Voice baad mein Settings mein badal sakte hain.' : 'This is what your callers will hear. You can change the voice later in Settings.'}</p>
  </div>
  <div class="footer"><button class="cta" data-act="to-live">${T('x_finish')}</button></div>`;

screens.live = () => `
  <div class="body" style="padding-top:26px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="width:12px;height:12px;border-radius:50%;background:var(--green);box-shadow:0 0 0 6px rgba(34,195,94,.2)"></span><span class="kicker" style="margin:0;color:var(--green)">LIVE</span></div>
    <h1>${T('l_title')}</h1>
    <p class="lede">${T('l_lede')}</p>
    <div class="notif urg"><div class="dot">!</div><div><b>${T('l_n1t')}</b><p>${T('l_n1b')}</p></div></div>
    <div class="notif"><div class="dot">🛵</div><div><b>${T('l_n2t')}</b><p>${T('l_n2b')}</p></div></div>
    <div class="notif"><div class="dot" style="background:#3a3a42">🚫</div><div><b>${T('l_n3t')}</b><p>${T('l_n3b')}</p></div></div>
    <div class="card" style="margin-top:14px;border-color:#3a3157;background:#211B33">
      <h3>${T('l_next_h')}</h3><p>${T('l_next_p')}</p>
    </div>
    <p class="small">${T('l_pause')}</p>
  </div>
  <div class="footer"><button class="cta" data-act="deliv">${T('l_next')}</button><button class="link" data-act="restart">${S.lang === 'hi' ? 'Prototype dobara shuru karein' : 'Restart prototype'}</button></div>`;

// ---------- explainer video (voiceover + illustrated scenes) ----------
const SCENES = [
  { art: artMeeting, dur: 4 }, { art: artSonic, dur: 9 }, { art: artRider, dur: 8 },
  { art: artSpam, dur: 8 }, { art: artFamily, dur: 7 }, { art: artSetup, dur: 5 },
];
const CAPS = {
  en: ['Stuck in a meeting, phone won\'t stop ringing?', 'Sonic answers as your assistant. Never as you.', 'Lost rider? Right gate, your instructions.', 'Loan and card calls: ended politely.', 'Family: message taken, urgent ones alert you.', 'Setup takes about 2 minutes.'],
  hi: ['Meeting mein ho, phone baj raha hai?', 'Sonic aapke assistant ki tarah baat karta hai.', 'Rider bhatka? Sahi gate, aapki instructions.', 'Loan, card calls: politely mana.', 'Ghar se call: message, urgent ho toh alert.', 'Setup mein bas 2 minute.'],
};
let vid = null;
function videoBlock() {
  return `<div class="video" id="video">
    ${SCENES.map((s, i) => `<div class="vscene ${i === 0 ? 'on' : ''}" data-scene="${i}"><div class="vart">${s.art()}</div><div class="cap">${CAPS[S.lang][i]}</div></div>`).join('')}
    <i class="vbar" id="vbar"></i>
    <button class="play" data-act="play"><span>▶ ${T('w_play')}</span></button>
  </div>`;
}
function stopVideo() { if (vid) { vid.audio.pause(); clearInterval(vid.timer); vid = null; } }
function playVideo() {
  stopVideo();
  const v = $('#video'); if (!v) return;
  $('.play', v).style.display = 'none';
  let i = 0; const total = SCENES.length;
  vid = { audio: new Audio(), timer: null };
  const show = n => v.querySelectorAll('.vscene').forEach((el, k) => el.classList.toggle('on', k === n));
  const playScene = () => {
    if (!vid) return;
    if (i >= total) { stopVideo(); $('#vbar').style.width = '100%'; const b = $('.play', v); b.style.display = ''; b.innerHTML = '<span>↻ Replay</span>'; return; }
    show(i);
    vid.audio.src = `../assets/vo/${S.lang}_${i + 1}.mp3`;
    vid.audio.play().catch(() => {});
    const started = Date.now(), fallback = SCENES[i].dur * 1000;
    clearInterval(vid.timer);
    vid.timer = setInterval(() => {
      if (!vid) return;
      const a = vid.audio, d = (a.duration && isFinite(a.duration)) ? a.duration * 1000 : fallback;
      const el = a.duration ? a.currentTime * 1000 : Date.now() - started;
      $('#vbar').style.width = (((i + Math.min(el / d, 1)) / total) * 100) + '%';
      if ((a.ended) || (!a.duration && Date.now() - started > fallback)) { clearInterval(vid.timer); i++; setTimeout(playScene, 350); }
    }, 100);
  };
  playScene();
}

// Illustrations: simple flat SVG in Nova's palette (pastel bg, dark phone, coral caller, purple Sonic).
function svg(inner, bg) { return `<svg viewBox="0 0 320 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="${bg}"/>${inner}</svg>`; }
function person(x, y, skin, top, hair) { return `<g transform="translate(${x},${y})"><circle cx="0" cy="0" r="16" fill="${skin}"/><path d="M-16 -2 Q-16 -20 0 -20 Q16 -20 16 -2 Q10 -12 0 -12 Q-10 -12 -16 -2Z" fill="${hair}"/><path d="M-26 46 Q-26 20 0 20 Q26 20 26 46Z" fill="${top}"/></g>`; }
function phoneIcon(x, y, ring) { return `<g transform="translate(${x},${y})"><rect x="-14" y="-24" width="28" height="48" rx="6" fill="#151518"/><rect x="-11" y="-19" width="22" height="34" rx="3" fill="${ring ? '#F58C7E' : '#26262C'}"/>${ring ? '<path d="M18 -18 q6 6 0 12 M23 -23 q11 11 0 22" stroke="#F58C7E" stroke-width="3" fill="none" stroke-linecap="round"/>' : ''}</g>`; }
function bubble(x, y, w, txt, fill, color) { return `<g transform="translate(${x},${y})"><rect width="${w}" height="26" rx="13" fill="${fill}"/><text x="${w / 2}" y="17" text-anchor="middle" font-family="Onest,sans-serif" font-size="11" font-weight="700" fill="${color}">${txt}</text></g>`; }
function sonicOrb(x, y, r = 22) { return `<g transform="translate(${x},${y})"><circle r="${r + 8}" fill="#8551FF" opacity=".18"/><circle r="${r}" fill="#8551FF"/><g fill="#F6B726">${[-10, -4, 2, 8].map((dx, k) => `<rect x="${dx - 2}" y="${-[5, 9, 6, 10][k]}" width="4" height="${[10, 18, 12, 20][k]}" rx="2"/>`).join('')}</g></g>`; }
function artMeeting() { return svg(`<rect x="40" y="110" width="240" height="14" rx="7" fill="#c9e6d2"/>${person(100, 70, '#C68B64', '#2B2245', '#2a1a12')}${person(220, 70, '#E2B48C', '#18A04B', '#3b2a1e')}${person(160, 62, '#B9784F', '#F6B726', '#1a120c')}${phoneIcon(160, 150, true)}${bubble(186, 132, 70, 'ring ring', '#fff', '#F58C7E')}`, '#DDF3E4'); }
function artSonic() { return svg(`${phoneIcon(90, 100, true)}<path d="M112 100 H190" stroke="#8551FF" stroke-width="3" stroke-dasharray="6 6"/>${sonicOrb(220, 100, 26)}${bubble(150, 40, 150, 'Hi, this is Sonic, her assistant', '#8551FF', '#fff')}`, '#EDE6FF'); }
function artRider() { return svg(`<rect x="0" y="140" width="320" height="60" fill="#f2d4b8"/><g transform="translate(70,120)"><circle cx="-18" cy="22" r="12" fill="#151518"/><circle cx="34" cy="22" r="12" fill="#151518"/><path d="M-18 22 L4 2 L34 22" stroke="#151518" stroke-width="5" fill="none"/><rect x="-6" y="-18" width="26" height="22" rx="4" fill="#F58C7E"/></g>${person(76, 70, '#B9784F', '#F58C7E', '#151518')}<g transform="translate(230,60)"><rect x="-30" y="0" width="60" height="80" fill="#fff" stroke="#e7c9ad"/><rect x="-10" y="50" width="20" height="30" fill="#8551FF"/><text x="0" y="-6" text-anchor="middle" font-family="Onest" font-weight="800" font-size="12" fill="#3B2E0C">GATE 2</text></g>${bubble(120, 26, 120, 'Gate 2, opp. Cult gym', '#8551FF', '#fff')}`, '#FFE9D6'); }
function artSpam() { return svg(`${phoneIcon(110, 100, true)}${bubble(30, 30, 130, 'Pre-approved loan...', '#F58C7E', '#2b0f0b')}${sonicOrb(220, 100, 24)}${bubble(160, 150, 150, 'Not interested, thanks', '#8551FF', '#fff')}<g transform="translate(110,100)"><circle r="30" fill="none" stroke="#FF5A5F" stroke-width="5"/><path d="M-21 21 L21 -21" stroke="#FF5A5F" stroke-width="5"/></g>`, '#FFE3E3'); }
function artFamily() { return svg(`${person(80, 80, '#C68B64', '#F6B726', '#d9d9d9')}${bubble(30, 22, 140, 'Tell her to call me', '#F58C7E', '#2b0f0b')}<path d="M110 100 H180" stroke="#8551FF" stroke-width="3" stroke-dasharray="6 6"/>${sonicOrb(205, 100, 22)}<g transform="translate(270,98)"><rect x="-26" y="-36" width="52" height="72" rx="10" fill="#151518"/><rect x="-21" y="-28" width="42" height="18" rx="5" fill="#FF5A5F"/><text x="0" y="-15" text-anchor="middle" font-family="Onest" font-weight="800" font-size="8" fill="#fff">URGENT</text><rect x="-21" y="-6" width="42" height="6" rx="3" fill="#33333B"/><rect x="-21" y="4" width="30" height="6" rx="3" fill="#33333B"/></g>`, '#FFF4CF'); }
function artSetup() { return svg(`<g transform="translate(160,100)"><rect x="-46" y="-80" width="92" height="160" rx="16" fill="#151518"/><rect x="-36" y="-50" width="72" height="10" rx="5" fill="#2D2D33"/><rect x="-36" y="-50" width="50" height="10" rx="5" fill="#F6B726"/>${[0, 1, 2].map(k => `<g transform="translate(-30,${-22 + k * 26})"><circle r="8" fill="${k < 2 ? '#22C35E' : '#33333B'}"/><rect x="14" y="-4" width="${44 - k * 6}" height="8" rx="4" fill="#33333B"/></g>`).join('')}<rect x="-36" y="50" width="72" height="18" rx="9" fill="#22C35E"/></g><text x="250" y="105" font-family="Onest" font-weight="800" font-size="30" fill="#18A04B">2 min</text>`, '#DDF3E4'); }

// ---------- "outside the app" scenes ----------
function outside(html, hint) { const o = document.createElement('div'); o.className = 'outside'; o.innerHTML = `<button class="breadcrumb" data-act="close-outside">${T('back_to')}</button>` + html; phone.appendChild(o); phone.classList.add('out'); setHint(hint); return o; }
function closeOutside() { phone.querySelectorAll('.outside,.sysdlg').forEach(n => n.remove()); phone.classList.remove('out', 'out-light'); setHint(); render(); }

function openIOSSettings() {
  const sw = (k, on) => `<button class="ios-switch ${on ? '' : 'off'}" data-ios="${k}"></button>`;
  const o = outside(`<div class="ios-settings">
    <div class="nav"><span>‹ Apps</span><b style="color:#000">Phone</b><span style="width:40px"></span></div>
    <div class="ios-group">
      <div class="ios-row">My Number <span class="val">+91 98xxx x4120</span></div>
    </div>
    <div class="ios-group">
      <div class="ios-row">Call Forwarding <span class="val">Off ›</span></div>
      <div class="ios-row">Call Waiting <span class="val">On ›</span></div>
    </div>
    <div class="ios-group">
      <div class="ios-row ${S.ios.lv ? 'target' : ''}">Live Voicemail ${sw('lv', S.ios.lv)}</div>
    </div>
    <p class="ios-foot">Callers who reach voicemail see a live transcript on your screen.</p>
    <div class="ios-group">
      <div class="ios-row ${S.ios.suc ? 'target' : ''}">Screen Unknown Callers <span class="val">${S.ios.suc ? 'Ask Reason for Calling' : 'Never'} </span></div>
      <div class="ios-row" style="padding:0">
        ${['Never', 'Ask Reason for Calling', 'Silence'].map(v => `<button data-suc="${v}" style="flex:1;border:0;background:${(S.ios.suc ? 'Ask Reason for Calling' : 'Never') === v ? '#E5F0FF' : '#fff'};padding:10px 4px;font-size:12px;color:#0A84FF;font-weight:600">${v}</button>`).join('')}
      </div>
    </div>
    <div class="ios-group"><div class="ios-row">Blocked Contacts <span class="val">›</span></div><div class="ios-row">SMS/Call Reporting <span class="val">›</span></div></div>
  </div>`, T('hint_settings'));
  phone.classList.add('out-light');
  o.addEventListener('click', e => {
    const k = e.target.closest('[data-ios]'); const s = e.target.closest('[data-suc]');
    if (k) { S.ios[k.dataset.ios] = !S.ios[k.dataset.ios]; o.remove(); openIOSSettings(); }
    if (s) { S.ios.suc = s.dataset.suc !== 'Never'; o.remove(); openIOSSettings(); }
  });
}

function openDialer() {
  const ios = S.os === 'ios';
  let num = ios ? '' : FWD_CODE;
  const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
  const o = outside(`<div class="dialer ${ios ? 'ios' : 'android'}">
      <div class="dial-num" id="dialnum">${num}</div>
      ${ios ? `<button class="paste-pop" id="paste">${S.fwdCopied ? 'Paste' : '(copy the code first)'}</button>` : '<div style="height:36px"></div>'}
      <div class="keys">${keys.map(([k, s]) => `<button class="key" data-k="${k}">${k}<small>${s}</small></button>`).join('')}</div>
      <button class="callbtn" id="dial"><svg viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg></button>
    </div>`, T('hint_dialer'));
  const disp = $('#dialnum', o);
  o.addEventListener('click', e => {
    const k = e.target.closest('[data-k]');
    if (k) { num += k.dataset.k; disp.textContent = num; }
    if (e.target.id === 'paste' && S.fwdCopied) { num = FWD_CODE; disp.textContent = num; e.target.style.visibility = 'hidden'; }
    if (e.target.closest('#dial')) {
      if (num.replace(/\s/g, '') !== FWD_CODE) { toast(ios ? 'Paste the code first' : 'Code changed. Tap back and try again'); return; }
      carrierResult(o);
    }
  });
}
function carrierResult(o) {
  const ios = S.os === 'ios';
  const c = document.createElement('div'); c.className = 'carrier';
  c.innerHTML = `<div class="box ${ios ? '' : 'android'}"><p class="small" style="margin:0 0 10px;color:#aaa">${S.network} · ${ios ? 'Sending...' : 'USSD code running...'}</p></div>`;
  o.appendChild(c);
  setTimeout(() => {
    c.innerHTML = `<div class="box ${ios ? '' : 'android'}"><h4>${T('carrier_ok_t')}</h4><p>${T('carrier_ok_p')}</p><div style="text-align:${ios ? 'center' : 'right'}"><button data-act="fwd-done">OK</button></div></div>`;
  }, 1300);
}

function incomingCall() {
  const o = outside(`<div class="incoming">
    <div class="who"><p class="small" style="color:#ccc;margin:0 0 6px">${S.os === 'ios' ? 'mobile' : 'Incoming call'}</p><b>${T('x_test')}</b><span style="color:#ccc">+91 80 6912 4400</span></div>
    <div class="acts">
      <div><button class="rbtn dec" data-act="decline"><svg viewBox="0 0 24 24" fill="#fff" style="transform:rotate(135deg)"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg></button>${T('x_dec')}</div>
      <div><button class="rbtn acc pulse" data-act="accept"><svg viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg></button>${T('x_acc')}</div>
    </div></div>`, S.lang === 'hi' ? 'Asli missed call jaisa: cut kijiye.' : 'Do what you\'d do with a call you can\'t take: decline it.');
  $('.breadcrumb', o).remove();
}

// ---------- system permission dialogs ----------
function sysDialog(k) {
  const ios = S.os === 'ios';
  const d = document.createElement('div'); d.className = 'sysdlg';
  const t = {
    screen: [T('sys_screen_t'), T('sys_screen_p'), T('cancel'), T('set_default')],
    contacts: ios ? [T('ios_contacts_t'), T('ios_contacts_p'), T('dont'), T('allow')] : [T('sys_contacts_t'), '', T('dont'), T('allow')],
    notif: ios ? [T('ios_notif_t'), T('ios_notif_p'), T('dont'), T('allow')] : [T('sys_notif_t'), '', T('dont'), T('allow')],
    phone: [T('sys_phone_t'), T('sys_phone_p'), T('dont'), T('allow')],
  }[k];
  d.innerHTML = `<div class="box ${ios ? 'ios' : ''}">${ios ? '' : '<div style="font-size:22px;margin-bottom:8px">' + ({ screen: '📞', contacts: '👥', notif: '🔔', phone: '📶' }[k]) + '</div>'}<h4>${t[0]}</h4>${t[1] ? `<p>${t[1]}</p>` : ''}<div class="acts"><button data-r="no">${t[2]}</button><button data-r="yes">${t[3]}</button></div></div>`;
  phone.appendChild(d);
  d.addEventListener('click', e => {
    const r = e.target.closest('[data-r]'); if (!r) return;
    d.remove();
    if (r.dataset.r === 'yes') { S.perms[k] = true; render(); }
    else openSheet(`<h3 style="margin:0 0 6px">${S.lang === 'hi' ? 'Iske bina Sonic kaam nahi karega' : 'Sonic needs this to work'}</h3><p class="small" style="font-size:14px">${T('r_' + k + '_w')}</p><p class="small">${S.lang === 'hi' ? 'Aap ise kabhi bhi Settings mein band kar sakte hain.' : 'You can turn it off anytime in Settings.'}</p><div class="footer" style="padding:10px 0 0"><button class="cta" data-perm="${k}">${S.lang === 'hi' ? 'Dobara try karein' : 'Try again'}</button><button class="link" data-act="close-sheet">${S.lang === 'hi' ? 'Abhi nahi' : 'Not now'}</button></div>`);
  });
}

// ---------- notes panel ----------
function renderNotes() {
  const key = S.step === 'test_ok' ? 'test' : S.step;
  const n = NOTES[key];
  $('#notesBody').innerHTML = n ? `<h3>${n.h}</h3><ul>${n.b.map(x => `<li>${x}</li>`).join('')}</ul><div class="worry">😟 ${n.w}</div>` : '';
  const f = FLOW(); const cur = f.indexOf(key);
  const all = ['welcome', 'what', 'choose', 'phone', 'perms', 'voicemail', 'forward', 'test', 'live'];
  $('#flowmap').innerHTML = `<div class="notes-head">Flow (${S.os === 'ios' ? 'iPhone' : 'Android'})</div><ol>${all.map((s, i) => {
    const inFlow = f.includes(s); const idx = f.indexOf(s);
    const cls = !inFlow ? 'skip' : s === key ? 'cur' : idx < cur ? 'done' : '';
    return `<li class="${cls}"><i>${inFlow ? (idx < cur ? '✓' : idx + 1) : '–'}</i>${LABELS[s]}${!inFlow ? ' (iPhone only)' : ''}</li>`;
  }).join('')}</ol>`;
}

// ---------- render + events ----------
const BGS = { welcome: '#EAF6EE', what: '#FFF1E4', choose: '#EFEAFF', phone: '#FFF7D6', perms: '#EAF6EE', voicemail: '#FFE9E6', forward: '#EFEAFF', test: '#FFF1E4', test_ok: '#EAF6EE', live: '#EAF6EE' };
function render() {
  screen.innerHTML = screens[S.step]();
  document.body.style.background = BGS[S.step] || '#EAF6EE';
  renderNotes();
  try { localStorage.setItem('sonic_proto', JSON.stringify({ os: S.os, lang: S.lang })); } catch (e) {}
}

phone.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-tab],[data-worry],[data-choice],[data-sim],[data-net],[data-perm]');
  if (!t) return;
  const d = t.dataset;
  if (d.tab) { S.tab = d.tab; return render(); }
  if (d.worry) { S.worry = S.worry === +d.worry ? null : +d.worry; return render(); }
  if (d.choice) { S.choice = d.choice; return render(); }
  if (d.sim) { S.sim = +d.sim; return render(); }
  if (d.net) { S.network = d.net; return render(); }
  if (d.perm) { closeSheet(); return sysDialog(d.perm); }
  switch (d.act) {
    case 'next': return nextStep();
    case 'back': return prevStep();
    case 'later': return openSheet(`<h3 style="margin:0 0 6px">${S.lang === 'hi' ? 'Koi baat nahi' : 'No problem'}</h3><p class="small" style="font-size:14px">${S.lang === 'hi' ? 'Hum kal shaam 7 baje ek reminder bhejenge. Setup kabhi bhi Home se shuru kar sakte hain.' : 'We\'ll send one reminder tomorrow at 7 pm. You can start setup anytime from Home.'}</p><div class="footer" style="padding:10px 0 0"><button class="cta" data-act="close-sheet-next">${S.lang === 'hi' ? 'Nahi, abhi kar leta hoon' : 'Actually, let\'s do it now'}</button><button class="link" data-act="close-sheet">OK</button></div>`);
    case 'close-sheet': return closeSheet();
    case 'close-sheet-next': closeSheet(); return nextStep();
    case 'play': return playVideo();
    case 'wifi': S.wifiOff = !S.wifiOff; return render();
    case 'vm-cant': return openSheet(`<p style="font-size:15px;line-height:1.45">${T('v_cant_a')}</p><div class="footer" style="padding:10px 0 0"><button class="cta" data-act="vm-skip">${T('continue')}</button></div>`);
    case 'vm-skip': closeSheet(); S.ios.lv = false; S.ios.suc = false; return nextStep();
    case 'open-settings': return openIOSSettings();
    case 'close-outside': return closeOutside();
    case 'copy-code': S.fwdCopied = true; copyText(FWD_CODE); toast(T('toast_copied')); return render();
    case 'open-dialer': if (S.os === 'android') S.fwdCopied = true; return openDialer();
    case 'fwd-help': return openSheet(`<h3 style="margin:0 0 10px">${T('f_fail_h')}</h3><ol class="steps">${T('f_fail').map(x => `<li><p style="margin:5px 0 0">${x}</p></li>`).join('')}</ol><div class="footer" style="padding:0"><button class="cta" data-act="close-sheet">${T('gotit')}</button></div>`);
    case 'fwd-done': closeOutside(); toast('✓ ' + (S.lang === 'hi' ? 'Forwarding chalu' : 'Forwarding on')); return go('test');
    case 'call-me': {
      const b = t; b.disabled = true; b.textContent = T('x_ring');
      return setTimeout(incomingCall, 1200);
    }
    case 'decline': closeOutside(); return go('test_ok');
    case 'accept': closeOutside(); S.testTries++; return render();
    case 'to-live': return go('live');
    case 'restart': return restart();
    case 'deliv': return openSheet(`
      <h3 style="margin:0 0 4px">${S.lang === 'hi' ? 'Delivery instructions' : 'Delivery instructions'}</h3>
      <p class="small" style="margin:0 0 12px">${S.lang === 'hi' ? 'Sonic yeh sirf us rider ko batata hai jiska order active hai.' : 'Sonic shares these only with the rider of an active order, for that address only.'}</p>
      <div class="card"><div class="row"><div class="ico g">🏠</div><div><h3>Home · HSR Layout</h3><p>Flat B-1203, Palm Meadows. Opp. Cult gym, Gate 2.</p><p style="margin-top:6px;color:#fff"><b>8 am to 10 pm:</b> hand it to Amma (Lakshmi) at the flat.<br><b>After 10 pm:</b> leave it with the security guard.</p></div></div></div>
      <div class="card"><div class="row"><div class="ico p">🏢</div><div><h3>Office · Bellandur</h3><p>Tranquil Tech Park, Block C. Gate 3 for bikes.</p><p style="margin-top:6px;color:#fff">Leave at Block C reception shelf. I'll come down.</p></div></div></div>
      <div class="tip"><b>🔐 OTP</b>${S.lang === 'hi' ? 'Sonic kabhi OTP nahi batata. Rider maange toh aapko turant notification aata hai.' : 'Sonic never reads out your OTP. If a rider asks, you get a notification right away.'}</div>
      <div class="footer" style="padding:4px 0 0"><button class="cta" data-act="close-sheet">${T('done')}</button></div>`);
  }
});

function restart() { Object.assign(S, { step: 'welcome', choice: 'unknown', sim: 1, wifiOff: false, perms: { screen: false, contacts: false, notif: false, phone: false }, ios: { lv: true, suc: true }, fwdCopied: false, testTries: 0, tab: 'del', worry: null }); closeSheet(); closeOutside(); }

document.querySelectorAll('[data-os]').forEach(b => b.onclick = () => {
  S.os = b.dataset.os; document.querySelectorAll('[data-os]').forEach(x => x.classList.toggle('on', x === b));
  S.network = S.os === 'ios' ? S.network : 'Jio';
  if (!FLOW().includes(S.step) && S.step !== 'test_ok') S.step = 'perms';
  closeOutside();
});
document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
  S.lang = b.dataset.lang; document.querySelectorAll('[data-lang]').forEach(x => x.classList.toggle('on', x === b)); stopVideo(); render();
});
$('#restart').onclick = restart;
$('#toggleNotes').onclick = () => { const n = $('#notes'); n.classList.toggle('hidden'); $('#toggleNotes').textContent = n.classList.contains('hidden') ? 'Show notes' : 'Hide notes'; };

// deep links for reviewers: ?os=ios&lang=hi&step=forward
const q = new URLSearchParams(location.search);
if (q.get('os') === 'ios') { S.os = 'ios'; document.querySelectorAll('[data-os]').forEach(x => x.classList.toggle('on', x.dataset.os === 'ios')); }
if (q.get('lang') === 'hi') { S.lang = 'hi'; document.querySelectorAll('[data-lang]').forEach(x => x.classList.toggle('on', x.dataset.lang === 'hi')); }
if (q.get('step') && screens[q.get('step')]) S.step = q.get('step');
const tick = () => { const d = new Date(); $('#clock').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };
tick(); setInterval(tick, 30000);
render();
})();
