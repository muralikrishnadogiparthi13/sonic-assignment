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
  w_play:'Watch how it works', w_len:'40 sec, with sound',
  w_cta:'Set up Sonic · 2 min', w_how:'Later',
  w_trust:'Sonic always says it\'s your assistant. Never pretends to be you.',
  // what it does
  d_title:'Three kinds of calls, handled',
  t_del:'Delivery', t_spam:'Spam', t_fam:'Family',
  del_h:'Guides the rider to you', del_p:'Right gate, your instructions. Only to the rider of your order.',
  spam_h:'Ends spam politely', spam_p:'Says no, hangs up, shares nothing.',
  fam_h:'Takes the message', fam_p:'If it\'s urgent, you get an alert right away.',
  del_b:[['Rider','Bhaiya, Palm Meadows kahan hai?'],['Sonic','Opposite the Cult gym on 14th Main. Use Gate 2, please.']],
  spam_b:[['Caller','Ma\'am, pre-approved loan at 10.5%...'],['Sonic','Thanks, she isn\'t interested. Please don\'t call again.']],
  fam_b:[['Amma','Tell her to call me, Nani fell.'],['Sonic','I\'m alerting Ananya right now as urgent.']],
  worries_h:'You might be wondering',
  wq1:'Will I still get my calls?', wa1:'Yes. Your phone rings first, every time. Sonic only answers if you don\'t pick up.',
  wq2:'Will it pretend to be me?', wa2:'Never. It always starts with "This is Sonic, Ananya\'s assistant."',
  wq3:'Does it cost extra?', wa3:'Not on most unlimited plans. A forwarded call counts as a normal call on your plan.',
  wq2b:'Can I turn it off?', wa2b:'Yes, anytime. Pause Sonic from Home, or dial ##004#.',
  // choose calls
  c_title:'Which calls should Sonic answer?',
  c_lede:'Your phone always rings first. Sonic only answers the calls you miss.',
  c2_h:'All calls I miss', c2_p:'Family, riders and strangers. Nobody is left unanswered.',
  c1_h:'Only unknown numbers', c1_p:'Saved contacts just get a missed call, like today.',
  c_rec:'Recommended',
  c_f1:['Call','Rings on your phone','Missed','Sonic answers'],
  c_change:'You can change this anytime.',
  // permissions
  r_title:'Allow what Sonic needs',
  r_lede:'Your phone will show a box. Tap Allow.',
  r_contacts:'Contacts', r_contacts_w:'To greet family by name and spot strangers.',
  r_notif:'Notifications', r_notif_w:'For call summaries and urgent alerts.',
  r_phone:'Phone', r_phone_w:'So Sonic knows which SIM gets your calls.',
  r_need:'Allow Contacts first', r_need_and:'Allow Contacts and Phone first', r_opt:'optional', r_settings:'Open Settings', r_settings_t:'Opens Settings → Apps → Sonic → Permissions',
  r_never:'Sonic never reads your SMS or OTPs. It never hears calls you pick up.',
  // voicemail
  v_title:'Turn off 2 iPhone settings',
  v_lede:'Your iPhone answers missed calls by itself. Change these 2 settings so Sonic can.',
  v_s1:'Live Voicemail', v_s1p:'Settings → Apps → Phone → Off',
  v_s2:'Screen Unknown Callers', v_s2p:'Settings → Apps → Phone → Never',
  v_open:'Open Settings', v_back:'Done, both are off', v_again:'Show me again', v_cant:'I can\'t find these',
  v_cant_a:'Older iPhones don\'t have them. That\'s fine. The test call at the end will check.',
  // forwarding
  f_title:'Send missed calls to Sonic',
  f_lede:'Dial this code once. That\'s all.', f_then_i:'In Phone, touch and hold the top of the keypad, tap Paste, then press call.', f_then_a:'Press the green call button.', f_act:'Your phone shows "activated". Then come back here.', f_type:'Or type it yourself',
  f_anim:['Someone calls','Your phone rings','You miss it','Sonic answers'],
  f_sim:'Dialling from', f_sim_change:'Change',
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
  x_lede:'We\'ll call this phone. When it rings, <b>press the red button</b>.', x_hold:'Keep this phone in your hand.', x_press:'Press red',
  x_cta:'Call me now', x_ring:'Calling...',
  x_dec:'Decline', x_acc:'Accept', x_test:'Sonic test call',
  x_pick:'You picked up. No problem. Try once more, and decline this time.',
  x_ok_h:'It works', x_ok_p:'You pressed red, and Sonic answered. This is what your callers will hear:', x_f1:'Your phone still rings first, every time.', x_f2:'Turn it off anytime: dial ##004#.',
  x_line:'Hello, this is Sonic, Ananya\'s assistant. She can\'t take the call right now. May I know who\'s calling?',
  x_finish:'Finish', x_noring:'It didn\'t ring', x_noring_h:'Usually one of these', x_noring_l:['The code didn\'t register. Dial it again.','iPhone: Live Voicemail or Screen Unknown Callers is still on.'], x_redo:'Fix it',
  // live
  l_title:'Sonic is on', l_lede:'Examples of what Sonic will send you after a call.', l_ex:'Example',
  l_n1t:'Urgent · Amma', l_n1b:'Amma called. She says it\'s urgent. Call her back.',
  l_n2t:'Delivery · Swiggy', l_n2b:'Rider sent to Gate 2, flat B-1203. 8:47 pm.',
  l_n3t:'Spam ended', l_n3b:'Loan offer. Nothing shared.',
  l_next_h:'One more thing for deliveries', l_next_p:'Add your home and office, and who can collect. 1 minute.', l_mode_u:'Answers: only unknown numbers', l_mode_a:'Answers: all calls you miss', l_mode_c:'Change anytime',
  l_next:'Add delivery details', l_pause:'Pause Sonic anytime from Home.',
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
  toast_copied:'Code copied',
  step_of:'{a} of {b}', listen:'Listen', stop:'Stop',
  f_next_h:'What you\'ll see', f_next_i:['Paste, press call','"Activated" message','Come back here'], f_next_a:['Press call','"Activated" message','Come back here'],
  help:'Need help?', help_h:'We\'ll help you finish', help_listen:'Listen to the steps', help_wa:'Chat with us on WhatsApp', help_wa_t:'Opens a WhatsApp chat with Sonic support', help_fail:'It said "failed"',
  hint_paste:'Tap Paste', hint_ok:'Tap OK, then go back to Sonic', hint_call:'Now press the green button',
  vm_find:'Find these 2 settings',
  perm_need_h:'Sonic needs this to work', perm_need_p:'You can turn it off anytime in Settings.', try_again:'Try again', not_now:'Not now',
}};

// Notes beside the phone, for reviewers. Written as my reasoning: the user's worry, and the choice it led to.
window.NOTES = {
  welcome:{h:'Who I designed for',b:['Two people: a busy professional in Bengaluru, and that person\'s parent in a smaller town who uses a phone for WhatsApp and calls, and little else. If the parent can finish setup alone, everyone can.','So every screen follows five rules: one job and one green button per screen; plain words, no "permissions", "USSD" or "MMI"; show what they will see before they leave the app; a Listen button that reads the steps aloud on every hard step; and say how to undo before asking for anything.','The welcome line is the moment Sonic is for: a call you missed, already handled.'],w:'"Is this some app that will mess with my calls?"'},
  what:{h:'Show real calls, not features',b:['One tab per call type, each a two-line call. People understand an assistant faster from what it says than from a feature list.','The worries are tap-to-open, so the screen stays short for people who don\'t need them. Three worries only: missing calls, cost, and turning it off. The cost answer is my assumption about Indian unlimited plans; I would verify it with the telecom partner before launch.'],w:'"Will I still get my calls?" is answered here, before any setup.'},
  choose:{h:'Default: all calls I miss',b:['Family calls are one of Sonic\'s three jobs. If the default skipped saved contacts, most people would never see that job work, so I recommend "All calls I miss".','The first line answers the biggest fear: your phone always rings first.','Each option has an icon and one line, so someone who doesn\'t read every word can still choose.'],w:'"If Amma calls and I miss it, does a bot talk to her?" Only if you choose so, and it tells her it\'s your assistant.'},
  perms:{h:'Prepare them for the popup',b:['Non-tech users often deny system popups out of fear. So the first line says it plainly: "Your phone will show a box. Tap Allow."','One line of why for each, in their terms ("to greet family by name"), not ours.','Only the required ones block the button. If someone taps "Don\'t allow", they get a calm sheet with Try again, not a dead end.'],w:'"Will it read my OTPs?" The promise card answers it before they ask.'},
  voicemail:{h:'Show the switch before they go looking for it',b:['iPhone\'s Live Voicemail and Screen Unknown Callers answer missed calls before forwarding can, so Sonic never gets them.','The screen shows the two switches exactly as they look in Settings. Inside Settings, a checklist at the bottom ticks off as they go, and step 3 tells them how to come back.','The app can\'t read these settings, so the test call at the end is the real check. "I can\'t find these" is an exit, not a dead end.'],w:'"Where is this setting? I\'ll break something."'},
  forward:{h:'Call forwarding, shown before it is asked for',b:['The animation explains the whole idea in four beats: someone calls, your phone rings, you miss it, Sonic answers.','One green button copies the code and opens the Phone app. In the dialer, a pulsing hint points at the next tap: Paste, then the green button.','"What you\'ll see" previews the three things that happen outside the app, so nothing feels like an error. "Need help?" offers the steps as audio, a WhatsApp chat, or fixes if it failed.','The brief says "copy the Sonic number and dial it". Dialling the bare number would only call Sonic, so the user copies a code with the number inside it, in purple, and the screen says so.'],w:'"Is this code safe? I\'ve heard of forwarding scams." Undo is shown before they dial.'},
  test:{h:'Prove it on their own phone',b:['The test is the real situation: Sonic calls, you press the red button, Sonic picks up.','The instruction names the colour of the button, not the word "decline". Colour is easier than vocabulary.','Accepting by mistake is fine: "try once more". Success shows the exact line the caller heard.'],w:'"How do I know it actually works?"'},
  live:{h:'Show the payoff',b:['Three sample notifications, one per call type, so they know what to expect tomorrow.','Delivery details are the next step, not part of setup, so setup stays at about 2 minutes.'],w:'"Can I turn it off?" Pause from Home, or dial ##004#.'}
};
