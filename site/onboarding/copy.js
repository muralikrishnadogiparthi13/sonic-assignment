// All user-facing copy. Rule for v2: one idea per line, readable in one go.
window.SONIC_NUMBER = '+91 80 6912 4407';
window.SONIC_RAW = '+918069124407';
window.FWD_CODE = '**004*' + window.SONIC_RAW + '#';
window.UNDO_CODE = '##004#';

window.COPY = {
en: {
  continue:'Continue', next:'Next', back:'Back', gotit:'Got it', done:'Done',
  // welcome
  w_title:'Missed a call?<br><span class="mark">Sonic picked it up.</span>',
  w_lede:'Your AI assistant for the calls you can\'t take.',
  w_play:'Watch how it works', w_len:'30 sec, with sound',
  w_cta:'Set up Sonic · about 3 min', w_how:'Later', w_rows:[['scooter','Delivery','Guides the rider to your gate with your instructions.'],['ban','Spam','Says no politely and hangs up. Shares nothing.'],['bell','Family','Takes the message. Urgent ones alert you right away.']], w_watch:'Watch how it works · 30 sec',
  w_trust:'Sonic always says it\'s your assistant. Never pretends to be you.',
  // what it does
  d_title:'Three kinds of calls, handled', d_rings:'Your phone rings first, every time. Sonic only answers calls you miss.', d_cta:'Set up Sonic · about 3 min',
  t_del:'Delivery', t_spam:'Spam', t_fam:'Family',
  del_h:'Guides the rider to you', del_p:'Right gate, your instructions. Only to the rider of your order.',
  spam_h:'Ends spam politely', spam_p:'Says no, hangs up, shares nothing.',
  fam_h:'Takes the message', fam_p:'If it\'s urgent, you get an alert right away.',
  del_b:[['Rider','Bhaiya, Palm Meadows kahan hai?'],['Sonic','Opposite the Cult gym on 14th Main. Use Gate 2, please.']],
  spam_b:[['Caller','Ma\'am, pre-approved loan at 10.5%...'],['Sonic','Thanks, Ananya isn\'t interested. Please don\'t call again.']],
  fam_b:[['Amma','Ask Ananya to call me, Nani fell.'],['Sonic','I\'m alerting Ananya right now as urgent.']],
  worries_h:'You might be wondering',
  wq1:'Will I still get my calls?', wa1:'Yes. Your phone rings first, every time. Sonic only answers if you don\'t pick up.',
  wq2:'Will it pretend to be me?', wa2:'Never. It always starts with "This is Sonic, Ananya\'s assistant."',
  wq3:'Does it cost extra?', wa3:'Usually no extra cost. A forwarded call is billed like any other call on your plan.',
  wq2b:'Can I turn it off?', wa2b:'Yes, anytime. Pause Sonic from Home, or dial ##004#.',
  // choose calls
  c_title:'Which calls should Sonic answer?',
  c_lede:'Your phone always rings first. Sonic only answers the calls you miss.',
  c2_h:'All calls I miss', c2_p:'Family, riders and strangers. Nobody is left unanswered.', c2_hear:'Family hear: "This is Sonic, Ananya\'s assistant."',
  c1_h:'Only unknown numbers', c1_p:'Strangers, spam and riders only.', c1_saved:'Saved contacts: Sonic hangs up quietly. They see a missed call, like today.',
  c_rec:'Recommended',
  c_f1:['Call','Rings on your phone','Missed','Sonic answers'],
  c_change:'After your first family call, Sonic will ask if you want to keep this.',
  // permissions
  r_title:'Let Sonic see your contacts', r_all:'Allow all', r_all_n:'Allow both',
  r_lede:'Your phone will show a box. Tap Allow.',
  r_contacts:'Contacts', r_contacts_w:'To greet family by name and spot strangers.', r_contacts_w2:'So Sonic knows your saved contacts and never answers them.',
  r_notif:'Notifications', r_notif_w:'To guide you in the Phone app, and for urgent alerts.',
  r_phone:'Phone', r_phone_w:'So Sonic knows which SIM gets your calls.',
  r_need:'Allow Contacts first', r_need_and:'Allow Contacts and Phone first', r_opt:'optional', r_settings:'Open Settings', r_settings_t:'Opens Settings → Apps → Sonic → Permissions',
  r_never:'Sonic never reads your SMS or OTPs. It never hears calls you pick up.',
  // voicemail
  v_title:'Change 2 iPhone settings',
  v_lede:'Your iPhone answers missed calls by itself. Change these 2 settings so Sonic can.',
  v_s1:'Live Voicemail', v_s1p:'Settings → Apps → Phone',
  v_s2:'Screen Unknown Callers', v_s2p:'Same page, a little lower',
  v_open:'Open Settings', v_back:'Done, both changed', v_again:'Show me again', v_cant:'I can\'t find these',
  v_cant_a:'No "Apps" in Settings? Your iPhone has iOS 17: open Settings → Phone instead. If one of the two settings isn\'t there, skip it. The test call at the end will check.', v_how:'Settings opens on Sonic\'s page. Go back to the main list, then tap Apps → Phone.', v_trap:'Leave "Call Forwarding" off. Our code sets it up so your phone still rings first.',
  // forwarding
  f_title:'Send missed calls to Sonic',
  f_lede:'Dial this code once. That\'s all.', f_then_i:['Open Phone, tap Keypad.','Touch and hold the empty box above the keys, tap Paste.','Press call. See "activated" or "successful"? Come back here.'], f_then_a:['Press the green call button.','See "activated" or "successful"? Come back here.'], f_tells:'This tells your network: if I don\'t pick up, send the call to Sonic.', f_undo_line:'Undo anytime: dial ##004#. If Sonic can\'t answer, the call just rings, like today.', f_type:'Or type it yourself',
  f_anim:['Someone calls','Your phone rings','You miss it','Sonic answers'],
  f_sim:'Use the SIM for', f_sim_ask:'If your phone asks which SIM, pick this one.', f_sim_change:'Not this number?',
  f_1:'Copy the code', f_1a:'Tap "Open dialer"', f_inside:'The purple part is your Sonic number.',
  f_2i:'Paste it in Phone and call', f_2ip:'Phone → Keypad → long-press → Paste.',
  f_2a:'Press call', f_2ap:'The code is already filled in.',
  f_3:'Wait for "activated"', f_3p:'Takes a few seconds. Then come back.',
  f_copy:'Copy', f_copied:'Copied', f_open_dialer:'Open dialer', f_open_phone:'Copy code & open Phone',
  f_undo:'Undo anytime: dial ##004#',
  f_down:'If Sonic can\'t answer, the call just rings, like today.',
  f_help:'It said "failed"',
  f_fail_h:'If it failed, try these', f_fail:['Turn off Wi-Fi calling, then dial again. It\'s the most common cause.','Check you\'re dialling from the SIM people call you on.','Still failing? Dial ##004#, then try the code again.'],
  f_ask_h:'Did you see "activated"?', f_ask_yes:'Yes', f_ask_no:'No, or not sure', fail_t:'Connection problem or invalid MMI code.',
  // test
  x_title:'Let\'s test it',
  x_lede:'We\'ll call this phone. When it rings, <b>press the red button</b>.', x_hold:'Keep your phone unlocked and in your hand.', x_slide:'If you see "slide to answer", don\'t slide. Sonic picks up after a few rings.', x_change:'Change', x_press:'Press red',
  x_cta:'Call me now', x_ring:'Calling...',
  x_dec:'Decline', x_acc:'Accept', x_test:'Sonic test call',
  x_pick:'You picked up. No problem. Try once more, and decline this time.',
  x_ok_h:'It works', x_ok_p:'Sonic just answered your test call. This is what your callers will hear:', x_f3:'Sonic will send you a summary after every call it takes.', x_f1:'Your phone still rings first, every time.', x_f2:'Turn it off anytime: dial ##004#.',
  x_line:'Hello, this is Sonic, Ananya\'s assistant. Ananya can\'t take the call right now. May I know who\'s calling?',
  x_finish:'Finish', x_noring:'It didn\'t ring', x_noring_h:'Usually one of these', x_noring_l:['Check we called the right number. Tap Change on the test screen.','The code didn\'t register. Dial it again.','iPhone: Live Voicemail or Screen Unknown Callers is still on.'], x_redo:'Fix it',
  // live
  l_title:'Sonic is on', l_lede:'Examples of what Sonic will send you after a call.', l_deliv:'Deliveries: Sonic will guide riders once you add your home and office.', l_tt:'Amma called · 2 min', l_tb:'Sonic took a message. Was this ok?', l_keep:'Keep', l_switch:'Switch to unknown only', l_foot:'Pause Sonic anytime from Home. Turn it off anytime: dial ##004#.', l_ex:'Example',
  l_n1t:'Urgent · Amma', l_n1b:'Amma called. She says it\'s urgent. Call her back.',
  l_n2t:'Delivery · Swiggy', l_n2b:'Rider sent to Gate 2, flat B-1203. 8:47 pm.',
  l_n3t:'Spam ended', l_n3b:'Loan offer. Nothing shared.',
  l_next_h:'One more thing for deliveries', l_next_p:'Add your home and office, and who can collect. 1 minute.', l_mode_u:'Answers: only unknown numbers', l_mode_a:'Answers: all calls you miss', l_mode_c:'Change anytime',
  l_next:'Add delivery details · 1 min', l_pause:'Pause Sonic anytime from Home.',
  // dialogs
  sys_screen_t:'Set Sonic as your default caller ID & spam app?', sys_screen_p:'Sonic will be able to see info about your calls.', set_default:'Set as default', cancel:'Cancel',
  sys_contacts_t:'Allow Sonic to access your contacts?', allow:'Allow', dont:'Don\'t allow',
  sys_notif_t:'Allow Sonic to send you notifications?',
  sys_phone_t:'Allow Sonic to make and manage phone calls?', sys_phone_p:'So Sonic knows which SIM gets your calls.',
  ios_contacts_t:'"Sonic" Would Like to Access Your Contacts', ios_contacts_p:'Sonic greets your family by name and spots strangers.',
  ios_notif_t:'"Sonic" Would Like to Send You Notifications', ios_notif_p:'Call summaries, and alerts when something is urgent.',
  carrier_ok_t:'Call forwarding', carrier_ok_p:'Registration was successful. Service: Voice. Call forwarding when unreachable, busy or no reply: activated.',
  hint_settings:'You\'re in iPhone Settings. Change both, then tap "Sonic" at the top left.',
  hint_dialer:'You\'re in the Phone app. Paste the code and press call.',
  la_title:'Sonic setup', la_pill:'Sonic · 3 steps', f_nonotif:'No helper will appear in the Phone app, so remember: press call, wait for "activated", come back.', la_ios_dial:['Touch and hold the top, tap Paste','Press the green call button','Wait for "activated", then come back'], la_and_dial:'Press the green call button. When you see "activated", tap here to come back.', la_back:'Back to Sonic',
  you_title:'What should Sonic call you?', you_lede:'Sonic says this to every caller:', you_name:'Your first name', you_num:'Your mobile number', you_num_ios:'iPhone doesn\'t let apps read your number, so please type it.', you_num_and:'From SIM 1', you_need:'Type your name first',
  toast_copied:'Code copied',
  step_of:'{a} of {b}', listen:'Listen', stop:'Stop',
  f_next_h:'What you\'ll see', f_next_i:['Paste, press call','"Activated" message','Come back here'], f_next_a:['Press call','"Activated" message','Come back here'],
  help:'Need help?', help_h:'We\'ll help you finish', help_listen:'Listen to the steps', help_wa:'Chat with us on WhatsApp', help_wa_t:'Opens a WhatsApp chat with Sonic support', help_fail:'It said "failed"',
  hint_paste:'Tap Paste', hint_ok:'Tap OK, then go back to Sonic', hint_call:'Now press the green button',
  vm_find:'Find these 2 settings',
  later_p:'Setup will wait for you on the Home screen. It takes about 3 minutes.',
  perm_need_h:'Sonic needs this to work', perm_need_p:'You can turn it off anytime in Settings.', try_again:'Try again', not_now:'Not now',
}};

// Notes beside the phone, for reviewers: three bullets and the user's worry per screen.
window.NOTES = {
  welcome:{h:'Who I designed for',b:['A busy professional, and that person\'s parent who mostly uses WhatsApp. If the parent can finish alone, everyone can: one job and one green button per screen, plain words, a Listen button on hard steps.','The three jobs fit on one screen, so a first-time user knows what Sonic does before any setup. The 30 sec explainer is optional, in a sheet.','"Your phone rings first, every time" is in bold here because it is the first fear, and the brief names it.'],w:'"Will I still get my important calls?"'},
  you:{h:'Ask only what Sonic says out loud',b:['Sonic introduces itself as "[name]\'s assistant", so the name is the one thing it must ask. The exact greeting updates as you type.','Android reads the number from the SIM. iPhone cannot, so it asks; the test call at the end checks it.','Home and office addresses come after Sonic is live, so setup stays short.'],w:'"Why does it need my name?" Because callers hear it.'},
  choose:{h:'Default: all calls I miss',b:['Family calls are one of Sonic\'s three jobs, so the default includes them, and the card shows exactly what family will hear.','"Only unknown numbers" with carrier forwarding: the missed call still reaches Sonic\'s number, Sonic sees a saved contact and hangs up quietly, so the caller sees a missed call, like today.','After the first family call, Sonic asks once whether to keep this mode, so the default is checked against real use.'],w:'"If Amma calls and I miss it, does a bot talk to her?"'},
  perms:{h:'Prepare them for the popup',b:['Non-tech users often deny system popups out of fear, so the first line says: "Your phone will show a box. Tap Allow."','One "Allow all" button chains the dialogs; the per-row buttons are the fallback after a denial, with a calm Try again sheet.','Notifications are required on Android because they carry the setup guide while the user is in the Phone app.'],w:'"Will it read my OTPs?" Answered under the list.'},
  voicemail:{h:'Show the settings before they go looking',b:['Live Voicemail and Screen Unknown Callers answer missed calls on the iPhone, so Sonic never gets them. The screen shows both as they look in Settings.','iOS can only open Sonic\'s own settings page, so the screen says how to get to Phone, with the iOS 17 path in "I can\'t find these".','It warns against the switch people flip by mistake: Call Forwarding, which would stop the phone ringing.'],w:'"Where is this setting? Will I break something?"'},
  forward:{h:'The hard step: code first, one line of why',b:['The brief says "copy the Sonic number and dial it". Dialling the bare number would only call Sonic, so the user dials a code with the number inside it, in purple, and one line says what it does.','Outside the app Sonic cannot draw on other apps or see what the user does. Steps travel as a static Live Activity (Dynamic Island; Lock Screen only on iPhones without one) or an Android notification, and nothing is confirmed until they come back.','Later on Android, the app could run the code itself with the Phone permission (USSD), with the dialer as fallback.'],w:'"Is this code safe? Can I undo it?" Undo is shown before they dial.'},
  test:{h:'Prove it on their own phone',b:['The test is the real situation: Sonic calls, you press red, Sonic picks up. The red button is the biggest thing on the screen, because colour is easier than the word "decline".','The number is shown with Change, and "It didn\'t ring" checks the number first, then the code, then iPhone settings.','On iPhone, a locked phone shows "slide to answer", so the screen says not to slide.'],w:'"How do I know it actually works?"'},
  live:{h:'Show the payoff, and keep earning trust',b:['Examples are labelled as examples. Delivery is shown as a status, because it only works after addresses are added.','The "Was this ok?" card is the first-week check: after the first family call, the user confirms or switches mode.','Pause and undo are on the last line, so the user leaves feeling in control.'],w:'"Can I turn it off?"'}
};
