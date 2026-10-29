// Sonic onboarding prototype. Plain JS, no build step.
(() => {
const $ = (s, el = document) => el.querySelector(s);
const screen = $('#screen'), sheet = $('#sheet'), backdrop = $('#sheetBackdrop'), toastEl = $('#toast'), phone = $('#phone');

const S = {
  os: 'android', lang: 'en', step: 'welcome',
  choice: 'all', sim: 1,
  perms: { contacts: false, notif: false, phone: false },
  ios: { lv: true, suc: true, visited: false }, name: 'Ananya', num: '98765 04120', fwdCopied: false, inDialer: false, testTries: 0, tab: 'del', worry: null,
};
const REQUIRED = () => S.os === 'ios' ? ['contacts'] : ['contacts', 'phone', 'notif'];

// Line icons (24px, stroke) instead of emoji, to match Onest and the illustrations.
const IP = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.4 5 2.7 5 5.8"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  signal: '<path d="M4 20v-3M9 20v-7M14 20V9M19 20V5"/>',
  scooter: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17h7l3-8h3M13 17 10 9H7"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/>',
  home: '<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',
  office: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  undo: '<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>',
  mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
  chevl: '<path d="M15 5l-7 7 7 7"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/>',
  chat: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/>',
  dial: '<circle cx="7" cy="6" r="1.2"/><circle cx="12" cy="6" r="1.2"/><circle cx="17" cy="6" r="1.2"/><circle cx="7" cy="11" r="1.2"/><circle cx="12" cy="11" r="1.2"/><circle cx="17" cy="11" r="1.2"/><circle cx="12" cy="16" r="1.2"/><path d="M9 20.5h6"/>',
  msg: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 11h10M7 14h6"/>',
  back: '<path d="M10 8L5 12l5 4"/><path d="M5 12h9a5 5 0 0 1 5 5v1"/>',
  bksp: '<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/>',
};
const ic = (k, sz = 20) => `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px">${IP[k]}</svg>`;
const NM = v => typeof v === 'string' ? v.replaceAll('Ananya', S.name || 'Ananya') : Array.isArray(v) ? v.map(NM) : v;
const T = k => NM(COPY[S.lang][k] ?? COPY.en[k] ?? k);

const FLOW = () => S.os === 'ios'
  ? ['welcome', 'you', 'choose', 'perms', 'voicemail', 'forward', 'test', 'live']
  : ['welcome', 'you', 'choose', 'perms', 'forward', 'test', 'live'];
const LABELS = { welcome: 'Welcome + explainer', what: 'What Sonic handles', you: 'Your name', choose: 'Choose which calls', perms: 'Permissions', voicemail: 'Turn off iPhone voicemail', forward: 'Call forwarding code', test: 'Test call', live: 'Sonic is live' };

// ---------- helpers ----------
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('on'), 1600); }
function openSheet(html) { sheet.innerHTML = '<div class="grab"></div>' + html; sheet.classList.add('on'); backdrop.classList.add('on'); }
function closeSheet() { sheet.classList.remove('on'); backdrop.classList.remove('on'); }
backdrop.onclick = () => { stopVideo(); closeSheet(); };
function go(step) { S.step = step; stopVideo(); stopAudio(); render(); }
function nextStep() { const f = FLOW(); go(f[Math.min(f.indexOf(S.step) + 1, f.length - 1)]); }
function prevStep() { const f = FLOW(); go(f[Math.max(f.indexOf(S.step) - 1, 0)]); }
function setHint(t) { $('#hint').textContent = t || 'Tap through like a real user. Buttons and toggles work.'; }
function copyText(t) { try { navigator.clipboard && navigator.clipboard.writeText(t).catch(() => {}); } catch (e) {} }

const SETUP = () => FLOW().filter(x => !['welcome', 'what', 'live'].includes(x));
function appbar(clip) {
  const f = SETUP(), i = f.indexOf(S.step);
  const back = `<button class="back" data-act="back" aria-label="Back">${ic('chevl', 22)}</button>`;
  if (i < 0) return `<div class="appbar">${back}</div>`;
  const pct = Math.round(((i + 1) / f.length) * 100);
  const count = `<span class="count">${T('step_of').replace('{a}', i + 1).replace('{b}', f.length)}</span>`;
  return `<div class="appbar">${back}<div class="progress"><i style="width:${pct}%"></i></div>${count}${clip ? listenBtn(clip) : ''}</div>`;
}

function listenBtn(clip) { return `<button class="listen" data-act="listen" data-clip="${clip}">${ic('speaker', 18)}<span>${T('listen')}</span></button>`; }
let audio = null;
function stopAudio() { if (audio) { audio.pause(); audio = null; } document.querySelectorAll('.listen.on').forEach(b => { b.classList.remove('on'); b.innerHTML = ic('speaker', 18) + '<span>' + T('listen') + '</span>'; }); }
function toggleListen(btn) {
  const was = btn.classList.contains('on'); stopAudio(); if (was) return;
  audio = new Audio(`../assets/help/${S.lang}_${btn.dataset.clip}.mp3`); audio.play().catch(() => {});
  btn.classList.add('on'); btn.innerHTML = ic('stop', 18) + '<span>' + T('stop') + '</span>';
  audio.onended = stopAudio;
}
function fwdClip() { return S.os === 'ios' ? 'forward_ios' : 'forward_and'; }

// ---------- screens ----------
const screens = {};

screens.welcome = () => `
  <div class="body" style="padding-top:24px">
    <h1>${T('w_title')}</h1>
    <p class="lede">${T('w_lede')}</p>
    <div class="wrows">${T('w_rows').map(([i, h, p]) => `<div class="wrow"><div class="ico n">${ic(i)}</div><div><b>${h}</b><p>${p}</p></div></div>`).join('')}</div>
    <p class="rings">${T('d_rings')}</p>
    <div class="row" style="align-items:center;gap:10px;margin-top:14px">
      <div class="ico n" style="width:34px;height:34px;border-radius:12px">${ic('shield', 18)}</div>
      <p class="small" style="margin:0">${T('w_trust')}</p>
    </div>
  </div>
  <div class="footer">
    <button class="link watch" data-act="watch">${ic('speaker', 18)} ${T('w_watch')}</button>
    <button class="cta" data-act="next">${T('w_cta')}</button>
    <button class="link" data-act="later">${T('w_how')}</button>
  </div>`;

screens.what = () => {
  const jobs = [['scooter', 'g', 'del_h', 'del_b'], ['ban', 'c', 'spam_h', 'spam_b'], ['home', 'a', 'fam_h', 'fam_b']];
  const worries = ['3', '2b'].map(n => `<button class="chip ${S.worry === n ? 'on' : ''}" data-worry="${n}">${T('wq' + n)}</button>`).join('');
  return `${appbar()}
  <div class="body">
    <h2>${T('d_title')}</h2>
    <p class="lede">${T('d_rings')}</p>
    ${jobs.map(([icon, tone, h, bub]) => { const [w, t] = T(bub)[1]; const [cw, ct] = T(bub)[0]; return `<div class="job"><div class="ico ${tone}">${ic(icon)}</div><div><h3>${T(h)}</h3><p class="q"><span>${cw}:</span> ${ct}</p><p class="a"><span>${w}:</span> ${t}</p></div></div>`; }).join('')}
    <div class="chips" style="margin-top:12px">${worries}</div>
    ${S.worry ? `<div class="tip" id="worryTip"><b>${ic('bulb', 18)} ${T('wq' + S.worry)}</b>${T('wa' + S.worry)}</div>` : ''}
  </div>
  <div class="footer"><button class="cta" data-act="next">${T('d_cta')}</button></div>`;
};

screens.you = () => {
  const ios = S.os === 'ios';
  return `${appbar()}
  <div class="body">
    <h2>${T('you_title')}</h2>
    <label class="field"><span>${T('you_name')}</span><input id="youName" value="${S.name}" autocomplete="given-name" maxlength="24"></label>
    <p class="small" style="margin:14px 0 6px">${T('you_lede')}</p>
    <div class="bub sonic" style="max-width:100%"><span class="who">Sonic</span><span id="youLine">${T('x_line')}</span></div>
    ${ios ? `<label class="field" style="margin-top:18px"><span>${T('you_num')}</span><div class="numin"><b>+91</b><input id="youNum" value="${S.num}" inputmode="tel" maxlength="12"></div></label><p class="small" style="margin:6px 0 0">${T('you_num_ios')}</p>`
      : `<div class="simrow" style="margin-top:18px">${ic('mobile', 16)} <span>${T('you_num')}: <b>98xxx x4120</b> · ${T('you_num_and')}</span></div>`}
  </div>
  <div class="footer"><button class="cta" data-act="next" id="youNext" ${S.name.trim() ? '' : 'disabled'}>${T('continue')}</button></div>`;
};

screens.choose = () => {
  const f = T('c_f1');
  const opt = (k, h, p, badge, icon) => `
    <button class="opt ${S.choice === k ? 'sel' : ''}" data-choice="${k}">
      ${badge ? `<span class="badge">${T('c_rec')}</span>` : ''}
      <div class="row"><div class="ico ${k === 'all' ? 'p' : 'n'}">${ic(icon)}</div><div><h3>${T(h)}</h3><p>${T(p)}</p>${k === 'all' ? `<p class="hear">${T('c2_hear')}</p>` : `<p class="hear muted">${T('c1_saved')}</p>`}</div></div><span class="radio"></span>
    </button>`;
  return `${appbar()}
  <div class="body">
    <h2>${T('c_title')}</h2>
    <p class="lede">${T('c_lede')}</p>
    ${opt('all', 'c2_h', 'c2_p', true, 'users')}
    ${opt('unknown', 'c1_h', 'c1_p', false, 'help')}
    <p class="small">${T('c_change')}</p>
  </div>
  <div class="footer"><button class="cta" data-act="next">${T('continue')}</button></div>`;
};

screens.perms = () => {
  const list = S.os === 'ios' ? ['contacts', 'notif'] : ['contacts', 'phone', 'notif'];
  const ico = { contacts: ['n', 'users'], notif: ['a', 'bell'], phone: ['c', 'signal'] };
  const all = REQUIRED().every(k => S.perms[k]);
  return `${appbar('perms')}
  <div class="body">
    <h2>${T('r_title')}</h2>
    <p class="lede">${T('r_lede')}</p>
    <div class="card" style="padding:4px 16px">
      ${list.map(k => `
        <div class="lrow">
          <div class="ico ${ico[k][0]}">${ic(ico[k][1])}</div>
          <div class="t"><b>${T('r_' + k)}${k === 'notif' && S.os === 'ios' ? ` <small style="font-weight:600;color:#9C9CAA">· ${T('r_opt')}</small>` : ''}</b><span>${T(k === 'contacts' && S.choice === 'unknown' ? 'r_contacts_w2' : 'r_' + k + '_w')}</span></div>
          ${S.perms[k] ? `<span class="done-tick" aria-label="Allowed">${ic('check', 22)}</span>` : `<button class="pill-sm ghostpill" data-perm="${k}">${T('allow')}</button>`}
        </div>`).join('')}
    </div>
    <p class="capline">${ic('lock', 15)} ${T('r_never')}</p>
  </div>
  <div class="footer">${all ? `<button class="cta" data-act="next">${T('continue')}</button>` : `<button class="cta" data-act="allow-all">${T('r_all')}</button>`}</div>`;
};

screens.voicemail = () => `${appbar('voicemail')}
  <div class="body">
    <h2>${T('v_title')}</h2>
    <p class="lede">${T('v_lede')}</p>
    <p class="sub">${T('vm_find')}</p>
    <p class="small" style="margin:-2px 0 8px">${T('v_how')}</p>
    <div class="iosprev">
      <div class="iosrow"><span>Live Voicemail</span><span class="sw"><i class="on"></i>${ic('chevl', 14)}<i></i></span></div>
      <p class="path">${T('v_s1p')}</p>
      <div class="iosrow"><span>Screen Unknown Callers</span><span class="val">Never</span></div>
      <p class="path">${T('v_s2p')}</p>
    </div>
    <div class="trap">${ic('help', 18)}<span>${T('v_trap')}</span></div>
    <button class="link" data-act="vm-cant" style="padding-left:0">${T('v_cant')}</button>
  </div>
  <div class="footer">
    ${S.ios.visited ? `<button class="cta" data-act="next">${T('v_back')}</button><button class="link" data-act="open-settings">${T('v_again')}</button>` : `<button class="cta" data-act="open-settings">${T('v_open')}</button>`}
  </div>`;

function fwdAnim() {
  const a = T('f_anim');
  return `<div class="fanim" aria-hidden="true">
    <div class="fa-node n1"><div class="fa-ic">${ic('users', 18)}</div><span>${a[0]}</span></div>
    <div class="fa-line l1"></div>
    <div class="fa-node n2"><div class="fa-ic ring">${ic('mobile', 18)}</div><span>${a[1]}</span></div>
    <div class="fa-line l2"></div>
    <div class="fa-node n3"><div class="fa-ic miss">${ic('phone', 18)}</div><span>${a[2]}</span></div>
    <div class="fa-line l3"></div>
    <div class="fa-node n4"><div class="fa-ic son">${sonicMini()}</div><span>${a[3]}</span></div>
  </div>`;
}
function sonicMini() { return `<svg viewBox="0 0 24 24" width="18" height="18"><g fill="#F6B726">${[5, 9, 13, 17].map((x, k) => `<rect x="${x}" y="${12 - [3, 6, 4, 7][k]}" width="2.6" height="${[6, 12, 8, 14][k]}" rx="1.3"/>`).join('')}</g></svg>`; }
const codeHtml = () => `**004*<b class="num">${SONIC_RAW}</b>#`;

screens.forward = () => {
  const ios = S.os === 'ios';
  return `${appbar(fwdClip())}
  <div class="body">
    <h2>${T('f_title')}</h2>
    <div class="codecard big">
      <p class="lede" style="margin:0 0 10px">${T('f_lede')}</p>
      <div class="code"><span>${codeHtml()}</span></div>
      <p class="small" style="margin:10px 0 0">${T('f_tells')}</p>
      ${ios ? '' : `<div class="simline">${ic('mobile', 15)} From SIM ${S.sim} · ${S.sim === 1 ? '98xxx x4120' : '70xxx x8812'} <button class="link" data-act="sim-toggle">${T('x_change')}</button></div>`}
    </div>
    <ol class="steps tight">${T(ios ? 'f_then_i' : 'f_then_a').map(t => `<li><p>${t}</p></li>`).join('')}</ol>
    <p class="capline">${ic(!ios && !S.perms.notif ? 'bell' : 'undo', 15)} ${T(!ios && !S.perms.notif ? 'f_nonotif' : 'f_undo_line')}</p>
  </div>
  <div class="footer"><button class="cta" data-act="open-dialer">${ios ? T('f_open_phone') : T('f_open_dialer')}</button><button class="link helpl" data-act="help">${ic('help', 18)} ${T('help')}</button></div>`;
};

screens.test = () => `${appbar('test')}
  <div class="body">
    <h2>${T('x_title')}</h2>
    <p class="lede">${T('x_lede')}</p>
    <div class="callrow"><span>We'll call <b>${S.os === 'ios' ? '+91 ' + S.num : (S.sim === 1 ? '98xxx x4120' : '70xxx x8812')}</b></span><button class="link" data-act="change-num">${T('x_change')}</button></div>
    <div class="hero-red"><span class="redbtn big">${ic('phone', 44)}</span><b>${T('x_press')}</b></div>
    <p class="small center">${T('x_hold')}</p>
    ${S.os === 'ios' ? `<p class="small center">${T('x_slide')}</p>` : ''}
    ${S.testTries > 0 ? `<div class="tip">${T('x_pick')}</div>` : ''}
  </div>
  <div class="footer"><button class="cta" data-act="call-me">${T('x_cta')}</button><button class="link" data-act="noring">${T('x_noring')}</button></div>`;

screens.test_ok = () => `
  <div class="body" style="padding-top:30px">
    <div style="width:64px;height:64px;border-radius:20px;background:var(--green);display:grid;place-items:center;color:#fff;margin-bottom:14px">${ic('check', 34)}</div>
    <h2>${T('x_ok_h')}</h2>
    <p class="lede">${T('x_ok_p')}</p>
    <div class="bubbles"><div class="bub sonic" style="max-width:100%"><span class="who">Sonic</span>${T('x_line')}</div></div>
    <div class="facts"><div>${ic('mobile', 18)} ${T('x_f1')}</div><div>${ic('undo', 18)} ${T('x_f2')}</div><div>${ic('bell', 18)} ${T('x_f3')}</div></div>
    
  </div>
  <div class="footer"><button class="cta" data-act="to-live">${T('x_finish')}</button></div>`;

screens.live = () => `
  <div class="body" style="padding-top:26px">
    <h1 class="livehead"><span class="livedot" aria-hidden="true"></span>${T('l_title')}</h1>
    <p class="lede">${T('l_lede')}</p>
    <div class="notif urg"><div class="dot">${ic('bell', 16)}</div><div><span class="ex">${T('l_ex')}</span><b>${T('l_n1t')}</b><p>${T('l_n1b')}</p></div></div>
    <div class="notif"><div class="dot" style="background:#3a3a42">${ic('ban', 16)}</div><div><span class="ex">${T('l_ex')}</span><b>${T('l_n3t')}</b><p>${T('l_n3b')}</p></div></div>
    <div class="notif"><div class="dot" style="background:#3a3a42">${ic('users', 16)}</div><div><span class="ex">${T('l_ex')}</span><b>${T('l_tt')}</b><p>${T('l_tb')}</p><div class="tt"><button class="pill-sm ghostpill">${T('l_keep')}</button><button class="pill-sm ghostpill">${T('l_switch')}</button></div></div></div>
    <p class="capline">${ic('scooter', 15)} ${T('l_deliv')}</p>
    <div class="nextcard">
      <h3 style="margin:0 0 4px;font-size:16px">${T('l_next_h')}</h3><p class="small" style="margin:0 0 12px;color:#C9C9D3">${T('l_next_p')}</p>
      <button class="cta2" data-act="deliv">${T('l_next')}</button>
    </div>
    <p class="small">${T('l_foot')}</p>
  </div>
  <div class="footer"><button class="link" data-act="restart">Restart prototype</button></div>`;

// ---------- explainer video (voiceover + illustrated scenes) ----------
const SCENES = [
  { art: artMeeting, dur: 4 }, { art: artSonic, dur: 9 }, { art: artRider, dur: 8 },
  { art: artSpam, dur: 8 }, { art: artFamily, dur: 7 }, { art: artSetup, dur: 5 },
];
const CAPS = {
  en: ['Stuck in a meeting, phone won\'t stop ringing?', 'Sonic answers the calls you miss. As your assistant, never as you.', 'Lost rider? The right gate, and your instructions.', 'Loan and card calls: a polite no, nothing shared.', 'Family: message taken. Urgent ones alert you.', 'Setup takes about 3 minutes.'],
};
let vid = null;
function videoBlock() {
  return `<div class="video" id="video">
    ${SCENES.map((s, i) => `<div class="vscene ${i === 1 ? 'on' : ''}" data-scene="${i}"><div class="vart">${s.art()}</div><div class="cap">${CAPS.en[i]}</div></div>`).join('')}
    <i class="vbar" id="vbar"></i>
    <button class="play" data-act="play" aria-label="${T('w_play')}"><span class="pbtn"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span></button>
  </div>`;
}
function stopVideo() { if (vid) { vid.audio.pause(); clearInterval(vid.timer); vid = null; } }
function playVideo() {
  stopVideo();
  const v = $('#video'); if (!v) return;
  $('.play', v).style.display = 'none'; v.classList.add('playing');
  let i = 0; const total = SCENES.length;
  vid = { audio: new Audio(), timer: null };
  const show = n => v.querySelectorAll('.vscene').forEach((el, k) => el.classList.toggle('on', k === n));
  const playScene = () => {
    if (!vid) return;
    if (i >= total) { stopVideo(); $('#vbar').style.width = '100%'; const b = $('.play', v); b.style.display = ''; b.innerHTML = '<span class="pbtn">' + ic('undo', 20) + '</span>'; return; }
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
// Explainer scenes: the app's own parts (phone, Sonic orb, chat bubbles, cards) on one dark surface. No people.
const BG = '#1A1A1F';
function chip(x, y, w, txt, fill, color, h = 26) { return `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/><text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" font-family="Onest,sans-serif" font-size="11" font-weight="700" fill="${color}">${txt}</text></g>`; }
function say(x, y, w, who, txt, sonic) { return `<g transform="translate(${x},${y})"><rect width="${w}" height="40" rx="12" fill="${sonic ? '#8551FF' : '#F58C7E'}"/><text x="12" y="16" font-family="Onest,sans-serif" font-size="9" font-weight="700" fill="${sonic ? '#E6DCFF' : '#5a2219'}">${who}</text><text x="12" y="31" font-family="Onest,sans-serif" font-size="11.5" font-weight="600" fill="${sonic ? '#fff' : '#2b0f0b'}">${txt}</text></g>`; }
function card(x, y, w, h) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#26262C" stroke="#33333B"/>`; }
function glyph(x, y, k, color, sz = 18) { return `<g transform="translate(${x},${y}) scale(${sz / 24})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IP[k]}</g>`; }
function artMeeting() { return svg(`${card(70, 30, 180, 140)}${glyph(88, 46, 'phone', '#F58C7E', 20)}<text x="116" y="61" font-family="Onest" font-size="12" font-weight="700" fill="#fff">Incoming call</text><text x="88" y="92" font-family="Onest" font-size="15" font-weight="800" fill="#fff">+91 70xxx x2231</text><text x="88" y="110" font-family="Onest" font-size="11" fill="#9C9CAA">Ringing for the 3rd time</text>${chip(88, 126, 144, 'You: in a meeting', '#3A2E10', '#F6B726')}`, BG); }
function artSonic() { return svg(`${phoneIcon(70, 104, true)}<path d="M92 104 H200" stroke="#8551FF" stroke-width="3" stroke-dasharray="6 6"/>${sonicOrb(232, 104, 24)}${chip(104, 36, 196, 'Hi, this is Sonic, Ananya\'s assistant', '#8551FF', '#fff', 28)}${chip(150, 154, 120, 'Never pretends to be you', '#26262C', '#C9C9D3')}`, BG); }
function artRider() { return svg(`${say(24, 34, 196, 'RIDER', 'Bhaiya, Palm Meadows kahan hai?', false)}${say(100, 86, 196, 'SONIC', 'Opposite Cult gym. Use Gate 2.', true)}${chip(24, 146, 150, 'Leave it with the guard', '#173524', '#9CF0BC')}${glyph(188, 150, 'scooter', '#7EE2A4', 20)}`, BG); }
function artSpam() { return svg(`${say(24, 34, 196, 'CALLER', 'Pre-approved loan at 10.5%...', false)}${say(100, 86, 196, 'SONIC', 'Not interested, thanks.', true)}${chip(24, 146, 176, 'Spam ended · nothing shared', '#26262C', '#C9C9D3')}${glyph(208, 150, 'ban', '#FF5A5F', 20)}`, BG); }
function artFamily() { return svg(`${say(24, 26, 196, 'AMMA', 'Ask Ananya to call me. Urgent.', false)}${say(100, 76, 196, 'SONIC', 'I\'m alerting Ananya right now.', true)}<g>${card(40, 130, 240, 50)}<rect x="52" y="141" width="28" height="28" rx="8" fill="#FF5A5F"/>${glyph(57, 146, 'bell', '#fff', 18)}<text x="90" y="152" font-family="Onest" font-size="12" font-weight="800" fill="#fff">Urgent · Amma</text><text x="90" y="168" font-family="Onest" font-size="11" fill="#C9C9D3">Call her back.</text></g>`, BG); }
function artSetup() { return svg(`${card(60, 24, 200, 152)}${['Choose calls', 'Allow contacts', 'Dial one code', 'Test call'].map((t, k) => `<g transform="translate(78,${44 + k * 30})"><circle cx="9" cy="9" r="9" fill="#22C35E"/>${glyph(2, 2, 'check', '#fff', 14)}<text x="28" y="13" font-family="Onest" font-size="12.5" font-weight="700" fill="#fff">${t}</text></g>`).join('')}${chip(176, 150, 70, 'about 3 min', '#173524', '#9CF0BC', 22)}`, BG); }

// ---------- "outside the app" scenes ----------
// Sonic can't draw on other apps. iPhone: a Live Activity at the top. Android: an ongoing notification.
function liveAct(items) {
  return `<div class="di" data-act="di-toggle" role="status"><div class="di-pill">${sonicMini()}<span>${T('la_pill')}</span></div><div class="di-list">${items.map((t, i) => `<div class="la-i"><i>${i + 1}</i>${t}</div>`).join('')}</div></div>`;
}
function andNote(text) {
  setTimeout(() => document.querySelector('.an')?.classList.add('gone'), 4500);
  return `<div class="an" role="status"><div class="an-h"><span class="an-ic">${sonicMini()}</span>Sonic · ${T('la_title')} · now</div><p>${text}</p><button data-act="close-outside">${T('la_back')}</button></div>`;
}
function outside(html, hint) { const o = document.createElement('div'); o.className = 'outside' + (S.os === 'android' ? ' and' : ''); o.innerHTML = (S.os === 'android' ? '' : `<button class="breadcrumb" data-act="close-outside"><svg viewBox="0 0 10 10" width="8" height="8"><path d="M8 1L2 5l6 4z" fill="currentColor"/></svg> Sonic</button>`) + html; phone.appendChild(o); phone.classList.add('out'); setHint(hint); return o; }
function closeOutside() { phone.querySelectorAll('.outside,.sysdlg').forEach(n => n.remove()); phone.classList.remove('out', 'out-light'); setHint(); render(); }

function openIOSSettings() {
  const sw = (k, on) => `<button class="ios-switch ${on ? '' : 'off'}" data-ios="${k}"></button>`;
  const o = outside(`${liveAct(['Turn off Live Voicemail', 'Set Screen Unknown Callers to Never', 'Tap "Sonic" at the top left'])}<div class="ios-settings">
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
      ${['Never', 'Ask Reason for Calling', 'Silence'].map(v => `<button class="ios-opt" data-suc="${v}">${v}${(S.ios.suc ? 'Ask Reason for Calling' : 'Never') === v ? `<span class="tick">${ic('check', 18)}</span>` : ''}</button>`).join('')}
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
  S.inDialer = true;
  const ios = S.os === 'ios';
  let num = ios ? '' : FWD_CODE;
  const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
  const o = outside(`${ios ? liveAct(T('la_ios_dial')) : andNote(T('la_and_dial'))}<div class="dialer ${ios ? 'ios' : 'android'}">
      <div class="dial-num" id="dialnum">${num}</div>
      ${ios ? `<button class="paste-pop" id="paste">Paste</button>` : '<div style="height:36px"></div>'}
      <div class="keys">${keys.map(([k, s]) => `<button class="key" data-k="${k}">${k}<small>${s}</small></button>`).join('')}</div>
      <div class="dialrow"><span></span><button class="callbtn" id="dial"><svg viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg></button><button class="bksp" id="bksp" aria-label="Delete">${ic('bksp', 26)}</button></div>
    </div>`, T('hint_dialer'));
  const disp = $('#dialnum', o);
  const callHint = () => {};
  o.addEventListener('click', e => {
    const k = e.target.closest('[data-k]');
    if (k) { num += k.dataset.k; disp.textContent = num; }
    if (e.target.closest('#bksp')) { num = num.slice(0, -1); disp.textContent = num; }
    if (e.target.id === 'paste' && S.fwdCopied) { num = FWD_CODE; disp.textContent = num; e.target.style.visibility = 'hidden'; callHint(); }
    if (e.target.closest('#dial')) {
      if (num.replace(/\s/g, '') !== FWD_CODE) { toast(!num ? ('Paste the code first') : ('Code doesn\'t match. Clear it with Delete and paste again')); return; }
      carrierResult(o);
    }
  });
}
function carrierResult(o) {
  const ios = S.os === 'ios';
  const c = document.createElement('div'); c.className = 'carrier';
  c.innerHTML = `<div class="box ${ios ? '' : 'android'}"><p class="small" style="margin:0 0 10px;color:#aaa">${ios ? 'Sending...' : 'USSD code running...'}</p></div>`;
  o.appendChild(c);
  setTimeout(() => {
    c.innerHTML = S.sim === 2
      ? `<div class="box ${ios ? '' : 'android'}"><h4>${T('carrier_ok_t')}</h4><p>${T('fail_t')}</p><div style="text-align:${ios ? 'center' : 'right'}"><button data-act="fwd-fail">OK</button></div></div>`
      : `<div class="box ${ios ? '' : 'android'}"><h4>${T('carrier_ok_t')}</h4><p>${T('carrier_ok_p').replace('activated', '<b class="act">activated</b>')}</p><div style="text-align:${ios ? 'center' : 'right'}"><button data-act="fwd-done">OK</button></div></div>`;
  }, 1300);
}

function incomingCall() {
  const o = outside(`<div class="incoming">
    <div class="who"><p class="small" style="color:#ccc;margin:0 0 6px">${S.os === 'ios' ? 'mobile' : 'Incoming call'}</p><b>${T('x_test')}</b><span style="color:#ccc">+91 80 6912 4400</span></div>
    <div class="acts">
      <div><button class="rbtn dec pulse-red" data-act="decline"><svg viewBox="0 0 24 24" fill="#fff" style="transform:rotate(135deg)"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg></button>${T('x_dec')}</div>
      <div><button class="rbtn acc" data-act="accept"><svg viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg></button>${T('x_acc')}</div>
    </div></div>`, 'Do what you\'d do with a call you can\'t take: decline it.');
  $('.breadcrumb', o)?.remove();
}

// ---------- system permission dialogs ----------
function sysDialog(k) {
  const ios = S.os === 'ios';
  const d = document.createElement('div'); d.className = 'sysdlg';
  const t = {
    contacts: ios ? [T('ios_contacts_t'), T('ios_contacts_p'), T('dont'), T('allow')] : [T('sys_contacts_t'), '', T('dont'), T('allow')],
    notif: ios ? [T('ios_notif_t'), T('ios_notif_p'), T('dont'), T('allow')] : [T('sys_notif_t'), '', T('dont'), T('allow')],
    phone: [T('sys_phone_t'), T('sys_phone_p'), T('dont'), T('allow')],
  }[k];
  d.innerHTML = `<div class="box ${ios ? 'ios' : ''}">${ios ? '' : '<div style="margin-bottom:8px;color:#A7C7FF">' + ic({ contacts: 'users', notif: 'bell', phone: 'signal' }[k], 24) + '</div>'}<h4>${t[0]}</h4>${t[1] ? `<p>${t[1]}</p>` : ''}<div class="acts"><button data-r="no">${t[2]}</button><button data-r="yes">${t[3]}</button></div></div>`;
  phone.appendChild(d);
  d.addEventListener('click', e => {
    const r = e.target.closest('[data-r]'); if (!r) return;
    d.remove();
    if (r.dataset.r === 'yes') { S.perms[k] = true; render(); const n = (S.queue || []).shift(); if (n) setTimeout(() => sysDialog(n), 250); }
    else { S.queue = []; openSheet(`<h3 style="margin:0 0 6px">${T('perm_need_h')}</h3><p class="small" style="font-size:14px">${T('r_' + k + '_w')}</p><p class="small">${T('perm_need_p')}</p><div class="footer" style="padding:10px 0 0"><button class="cta" data-perm="${k}">${T('try_again')}</button><button class="link" data-act="open-app-settings">${T('r_settings')}</button><button class="link" data-act="close-sheet">${T('not_now')}</button></div>`); }
  });
}

// ---------- notes panel ----------
function renderNotes() {
  const key = S.step === 'test_ok' ? 'test' : S.step;
  const n = NOTES[key];
  $('#notesBody').innerHTML = n ? `<h3>${n.h}</h3><ul>${n.b.map(x => `<li>${x}</li>`).join('')}</ul><div class="worry"><b>User worry:</b> ${n.w}</div>` : '';
  const f = FLOW(); const cur = f.indexOf(key);
  const all = ['welcome', 'what', 'you', 'choose', 'perms', 'voicemail', 'forward', 'test', 'live'];
  $('#flowmap').innerHTML = `<div class="notes-head">Flow (${S.os === 'ios' ? 'iPhone' : 'Android'})</div><ol>${all.map((s, i) => {
    const inFlow = f.includes(s); const idx = f.indexOf(s);
    const cls = !inFlow ? 'skip' : s === key ? 'cur' : idx < cur ? 'done' : '';
    return `<li class="${cls}"><i>${inFlow ? (idx < cur ? ic('check', 13) : idx + 1) : '–'}</i>${LABELS[s]}${!inFlow ? ' (iPhone only)' : ''}</li>`;
  }).join('')}</ol>`;
}

// ---------- render + events ----------
const BGS = { welcome: '#EAF6EE', what: '#FFF1E4', choose: '#EFEAFF', perms: '#EAF6EE', voicemail: '#FFE9E6', forward: '#EFEAFF', test: '#FFF1E4', test_ok: '#EAF6EE', live: '#EAF6EE' };
function render() {
  screen.innerHTML = screens[S.step]();
  const yn = $('#youName');
  if (yn) yn.oninput = () => { S.name = yn.value.trim(); $('#youLine').textContent = T('x_line'); $('#youNext').disabled = !S.name; };
  const yu = $('#youNum'); if (yu) yu.oninput = () => { S.num = yu.value; };
  document.body.style.background = BGS[S.step] || '#EAF6EE';
  renderNotes();
  try { localStorage.setItem('sonic_proto', JSON.stringify({ os: S.os })); } catch (e) {}
}

phone.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-tab],[data-worry],[data-choice],[data-perm]');
  if (!t) return;
  const d = t.dataset;
  if (d.tab) { S.tab = d.tab; return render(); }
  if (d.worry) { S.worry = S.worry === d.worry ? null : d.worry; render(); const tip = $('#worryTip'); if (tip) tip.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
  if (d.choice) { S.choice = d.choice; return render(); }
  if (d.perm) { closeSheet(); return sysDialog(d.perm); }
  switch (d.act) {
    case 'next': return nextStep();
    case 'back': return prevStep();
    case 'later': return openSheet(`<h3 style="margin:0 0 6px">No problem</h3><p class="small" style="font-size:14px">${T('later_p')}</p><div class="footer" style="padding:10px 0 0"><button class="cta" data-act="close-sheet-next">${'Actually, let\'s do it now'}</button><button class="link" data-act="close-sheet">OK</button></div>`);
    case 'close-sheet': return closeSheet();
    case 'close-sheet-next': closeSheet(); return nextStep();
    case 'play': return playVideo();
    case 'change-num': return go('you');
    case 'di-toggle': return t.classList.toggle('open');
    case 'watch': openSheet(`${videoBlock()}<div class="footer" style="padding:6px 0 0"><button class="link" data-act="close-video">${T('gotit')}</button></div>`); return playVideo();
    case 'close-video': stopVideo(); return closeSheet();
    case 'allow-all': { S.queue = (S.os === 'ios' ? ['contacts', 'notif'] : ['contacts', 'phone', 'notif']).filter(k => !S.perms[k]); const k = S.queue.shift(); return k && sysDialog(k); }
    case 'listen': return toggleListen(t);
    case 'help': return openSheet(`<h3 style="margin:0 0 14px">${T('help_h')}</h3>
      <div class="helplist">
        <button class="helpbtn" data-act="help-listen">${ic('speaker', 20)} ${T('help_listen')}</button>
        <button class="helpbtn" data-act="help-wa">${ic('chat', 20)} ${T('help_wa')}</button>
        <button class="helpbtn" data-act="fwd-help">${ic('help', 20)} ${T('help_fail')}</button>
      </div>
      <p class="small" style="margin:16px 0 6px">${T('f_type')}</p>
      <div class="bigcode">**004*<b>${SONIC_RAW}</b>#</div>
      <div class="footer" style="padding:6px 0 0"><button class="link" data-act="close-sheet">${T('gotit')}</button></div>`);
    case 'help-listen': { closeSheet(); const b = phone.querySelector('.listen'); return b && toggleListen(b); }
    case 'help-wa': closeSheet(); return toast(T('help_wa_t'));
    case 'sim-toggle': S.sim = S.sim === 1 ? 2 : 1; return render();
    case 'vm-cant': return openSheet(`<p style="font-size:15px;line-height:1.45">${T('v_cant_a')}</p><div class="footer" style="padding:10px 0 0"><button class="cta" data-act="vm-skip">${T('continue')}</button></div>`);
    case 'vm-skip': closeSheet(); return nextStep();
    case 'open-settings': S.ios.visited = true; return openIOSSettings();
    case 'close-outside': {
      const fromDialer = S.inDialer && S.step === 'forward'; S.inDialer = false; closeOutside();
      if (fromDialer) openSheet(`<h3 style="margin:0 0 12px">${T('f_ask_h')}</h3><div class="footer" style="padding:0"><button class="cta" data-act="fwd-yes">${T('f_ask_yes')}</button><button class="link" data-act="fwd-help">${T('f_ask_no')}</button></div>`);
      return;
    }
    case 'fwd-yes': closeSheet(); return go('test');
    case 'fwd-fail': S.inDialer = false; closeOutside(); return showFail();
    case 'fwd-help': closeSheet(); return showFail();
    case 'open-app-settings': closeSheet(); return toast(T('r_settings_t'));
    case 'noring': return openSheet(`<h3 style="margin:0 0 10px">${T('x_noring_h')}</h3><ol class="steps">${T('x_noring_l').map(x => `<li><p style="margin:5px 0 0">${x}</p></li>`).join('')}</ol><div class="footer" style="padding:0"><button class="cta" data-act="redo-fwd">${T('x_redo')}</button><button class="link" data-act="close-sheet">${T('gotit')}</button></div>`);
    case 'redo-fwd': closeSheet(); return go(S.os === 'ios' ? 'voicemail' : 'forward');
    case 'copy-code': S.fwdCopied = true; copyText(FWD_CODE); toast(T('toast_copied')); return render();
    case 'open-dialer': if (!S.fwdCopied) { S.fwdCopied = true; copyText(FWD_CODE); } return openDialer();
    case 'fwd-done': S.inDialer = false; closeOutside(); toast('Forwarding is on'); return go('test');
    case 'call-me': {
      const b = t; b.disabled = true; b.textContent = T('x_ring');
      return setTimeout(incomingCall, 1200);
    }
    case 'decline': closeOutside(); return go('test_ok');
    case 'accept': closeOutside(); S.testTries++; return render();
    case 'to-live': return go('live');
    case 'restart': return restart();
    case 'deliv': return openSheet(`
      <h3 style="margin:0 0 4px">${'Delivery instructions'}</h3>
      <p class="small" style="margin:0 0 12px">${'Sonic shares these only with the rider of an active order, for that address only.'}</p>
      <div class="card"><div class="row"><div class="ico g">${ic('home')}</div><div><h3>Home · HSR Layout</h3><p>Flat B-1203, Palm Meadows. Opp. Cult gym, Gate 2.</p><p style="margin-top:6px;color:#fff"><b>8 am to 10 pm:</b> hand it to Amma (Lakshmi) at the flat.<br><b>After 10 pm:</b> leave it with the security guard.</p></div></div></div>
      <div class="card"><div class="row"><div class="ico p">${ic('office')}</div><div><h3>Office · Bellandur</h3><p>Tranquil Tech Park, Block C. Gate 3 for bikes.</p><p style="margin-top:6px;color:#fff">Leave at Block C reception shelf. I'll pick it up from reception.</p></div></div></div>
      <div class="tip"><b>${ic('lock', 18)} OTP</b>${'Sonic never reads out your OTP. If a rider asks, you get a notification right away.'}</div>
      <div class="footer" style="padding:4px 0 0"><button class="cta" data-act="close-sheet">${T('done')}</button></div>`);
  }
});

function showFail() { openSheet(`<h3 style="margin:0 0 10px">${T('f_fail_h')}</h3><ol class="steps">${T('f_fail').map(x => `<li><p style="margin:5px 0 0">${x}</p></li>`).join('')}</ol><div class="footer" style="padding:0"><button class="cta" data-act="close-sheet">${T('gotit')}</button></div>`); }
function restart() { Object.assign(S, { step: 'welcome', choice: 'all', sim: 1, name: 'Ananya', perms: { contacts: false, notif: false, phone: false }, ios: { lv: true, suc: true, visited: false }, inDialer: false, fwdCopied: false, testTries: 0, tab: 'del', worry: null }); closeSheet(); closeOutside(); }

document.querySelectorAll('[data-os]').forEach(b => b.onclick = () => {
  S.os = b.dataset.os; document.querySelectorAll('[data-os]').forEach(x => x.classList.toggle('on', x === b));
  if (!FLOW().includes(S.step) && S.step !== 'test_ok') S.step = 'perms';
  closeOutside();
});
$('#restart').onclick = restart;
$('#toggleNotes').onclick = () => { const n = $('#notes'); n.classList.toggle('hidden'); $('#toggleNotes').textContent = n.classList.contains('hidden') ? 'Show notes' : 'Hide notes'; };

// remembered phone + language, then deep links for reviewers: ?os=ios&lang=hi&step=forward
try { const saved = JSON.parse(localStorage.getItem('sonic_proto') || '{}'); if (saved.os === 'ios') S.os = 'ios'; } catch (e) {}
document.querySelectorAll('[data-os]').forEach(x => x.classList.toggle('on', x.dataset.os === S.os));
const q = new URLSearchParams(location.search);
if (q.get('os') === 'android') { S.os = 'android'; document.querySelectorAll('[data-os]').forEach(x => x.classList.toggle('on', x.dataset.os === 'android')); }
if (q.get('os') === 'ios') { S.os = 'ios'; document.querySelectorAll('[data-os]').forEach(x => x.classList.toggle('on', x.dataset.os === 'ios')); }
if (q.get('step') && screens[q.get('step')]) S.step = q.get('step');
const tick = () => { const d = new Date(); $('#clock').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };
tick(); setInterval(tick, 30000);
render();
})();
