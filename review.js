// Builds REVIEW.md: every word a person can see in ZigZag Mind, in one place, for clinician review.
// Text is read from index.html itself (constants + every rendered screen), so it can't drift.
// Run: npm run review    (review.test.js fails if REVIEW.md is out of date)
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const FILE=path.join(__dirname,'index.html'), OUT=path.join(__dirname,'REVIEW.md');
const FIXED_NOW=Date.UTC(2026,0,15,15,0,0);

function boot(){
  const dom=new JSDOM(fs.readFileSync(FILE,'utf8'),{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
    w.scrollTo=()=>{}; w.scrollBy=()=>{};
    const RealDate=w.Date;
    class FixedDate extends RealDate { constructor(...a){ super(...(a.length?a:[FIXED_NOW])); } static now(){ return FIXED_NOW; } }
    w.Date=FixedDate; w.performance.now=()=>0;
    w.Intl=new Proxy(w.Intl,{get:(t,k)=>k==='DateTimeFormat'?function(){ return { resolvedOptions:()=>({timeZone:'America/Chicago'}), format:()=>'' }; }:t[k]});
  }});
  const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.eval('prefs.onboarded=true');
  return w;
}

// Turn the rendered app into readable lines: headings, text, buttons, links (with where they go).
const BLOCKS='h1,h2,h3,p,li,label,legend,dt,dd,button,a,.ybar p,.lbl,.meta,.cap,.legend span,.tm,.lb,.count,.big,.for,.zh';
function lines(w, root){
  const doc=w.document, out=[], seen=new Set();
  const clean=s=>s.replace(/\s+/g,' ').trim();
  const walk=el=>{
    for(const n of el.childNodes){
      if(n.nodeType!==1) continue;
      if(n.matches('textarea,script,svg,[aria-hidden="true"]')) continue;
      if(n.matches('.rating')){ out.push('- Rating buttons: 0 to 10'); continue; }
      if(n.matches('button,a')){
        const c=n.cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach(x=>x.remove());
        c.querySelectorAll('.cap,.meta').forEach(x=>x.insertAdjacentText('beforebegin',' — '));
        const t=clean(c.textContent), aria=n.getAttribute('aria-label'), href=n.getAttribute('href');
        const kind=n.tagName==='A'?`Link${href?` → \`${href.replace(/body=[^&]*/,m=>'body='+decodeURIComponent(m.slice(5)))}\``:''}`:'Button';
        const label=t||aria||'';
        if(label){ out.push(`- **${kind}:** ${label}${aria&&t&&aria!==t?` _(screen reader: "${aria}")_`:''}`); }
        continue;
      }
      if(n.matches('input')){ const p=n.getAttribute('placeholder'); out.push(`- **Text box**${n.getAttribute('aria-label')?` "${n.getAttribute('aria-label')}"`:''}${p?` (hint: "${p}")`:''}`); continue; }
      if(n.matches('h1,h2,h3') || n.id==='screen-title'){ const t=clean(n.textContent); if(t) out.push(`- **Heading:** ${t}`); continue; }
      const hasOwnText=[...n.childNodes].some(c=>c.nodeType===3 && c.textContent.trim());
      if(hasOwnText && n.matches(BLOCKS+',div,span')){ const t=clean(n.textContent); if(t && !seen.has(n)){ out.push(`- ${t}`); seen.add(n); } continue; }
      walk(n);
    }
  };
  walk(root||doc.getElementById('app'));
  return out;
}

function screenText(w, setup){
  w.eval(`lastRendered=null; ui=freshUi(); session={...initialSession}; ${setup}; render();`);
  return lines(w);
}

const md=[];
const H=(lvl,t)=>md.push('', '#'.repeat(lvl)+' '+t, '');
const P=t=>md.push(t);
const list=a=>a.forEach(x=>md.push(`- ${x}`));
const code=x=>'`'+x+'`';

const w=boot();
const G=x=>w.eval(x);

P('# ZigZag Mind: clinician review pack');
P('');
P('Every safety rule, phrase list, crisis-screen string, intervention, and piece of flow copy in the app, word for word, so a licensed clinician can review it in one place.');
P('');
P('**Generated from `index.html` by `npm run review`. Do not edit by hand.** If the app\'s wording changes, the tests fail until this file is regenerated.');
P('');
P('How to read screen text: each screen is listed top to bottom as it appears on a phone. **Button** and **Link** lines are things a person can tap. Links show where they go (`tel:` opens the phone dialer, `sms:` opens Messages with the text shown). ZigZag Mind never calls or texts anyone itself.');

H(2,'1. Escalation rules');
P('Safety level lives only for the current visit and is **never saved**. Levels: GREEN (default), YELLOW (elevated), RED (crisis).');
P('');
list([
  `**Free-text check.** Every free-text box (except My Plan fields, which are exempt) is checked when submitted. Text is lowercased, apostrophes removed, and everything that isn't a letter or number becomes a space. If it contains any RED phrase → RED. Otherwise, any YELLOW phrase → YELLOW. Otherwise GREEN. Matching is on whole words/phrases.`,
  `**RED** stops everything (flows, games, check-ins) and opens the crisis screen immediately. Nothing from that moment is saved: no outcome, and no activity entry (no "hard moment", "reached out" or "used my plan") is recorded from any crisis screen or while RED. The one exception is required by design: grounding from "What would help right now?" saves \`{state:"crisis-no", interventionId:"grounding", before:null, after:null}\`.`,
  `**YELLOW** shows the support bar ("You don't have to handle this alone." · Call 988 · Talk to someone) on every non-crisis screen for the rest of the visit, and the suggestion engine offers connection, the person's own plan, grounding, or a change of space first.`,
  `**Automatic YELLOW:** tapping "I still feel bad" twice in a visit (a game answered "No" counts as one), or giving a 9 or 10 rating (before or after) twice in a visit.`,
  `**Tapping Help** (top right of every screen) or **"I don't feel safe"** → RED crisis screen. One tap, no confirmation.`,
  `**Crisis question:** "Are you in danger of hurting yourself or someone else right now?" Yes or I'm not sure → full crisis screen (RED). No → YELLOW, "What would help right now?" (talk to someone / open my plan / do something grounding), then "Do you feel safer than a few minutes ago?" Yes → Home (YELLOW). No or Not sure → full crisis screen (RED).`,
  `**Leaving RED** is only possible through "That's not what I meant — go back" on the first crisis screen, No on the danger question, or Yes on "Do you feel safer". Each leads to YELLOW. Nothing ever returns to GREEN in the same visit (a reload starts a new visit at GREEN).`,
  `**OWNER-APPROVED INTERIM, pending clinician:** on the full crisis screen (after Yes / I'm not sure), "That's not what I meant — go back" goes to "Do you feel safer than a few minutes ago?" instead of Home.`,
  `**Calling or texting** from the "What would help" screen moves straight to "Do you feel safer" in the same tap, before the phone app opens.`,
  `**Human First** (this visit only, never saved): after 2 taps on "Something else", or 2 finished steps without "That helped" (a game answered "No" counts), ask once: "Would talking to a person help more than another answer?" Call someone · Text someone · Be around people (→ Change the scene, Somewhere to go) · Not right now. Never shown over a crisis screen.`,
  `**Warm line** (Connect): ${G('WARMLINE.name')}, ${code(G('WARMLINE.tel'))}. "${G('WARMLINE.hours')} ${G('WARMLINE.about')}" Hours are display text only; the button is never disabled by the clock. "${G('WARMLINE.elsewhere')}" → ${code(G('WARMLINE.elsewhereUrl'))}.`,
  `**First launch:** onboarding never blocks the crisis screens. Leaving a crisis screen during onboarding returns to onboarding at YELLOW.`,
  `**Outside the US** (guessed from the phone's time zone, then language; can be set in Settings): adds "Find a helpline in your country" (findahelpline.com) under 988. 911 and 988 are never hidden.`,
]);

H(2,'2. Safety phrase lists');
H(3,`RED phrases (${G('RED_PHRASES.length')}) → crisis screen`);
P('The last 13 (from "kms" to "hurt somebody", including harm-to-others phrases) are **OWNER-APPROVED INTERIM, pending clinician**. Full results: docs/SAFETY_TEST_MATRIX.md.');
list(G('RED_PHRASES').map(x=>`"${x}"`));
H(3,`YELLOW phrases (${G('YELLOW_PHRASES.length')}) → support bar for the rest of the visit`);
list(G('YELLOW_PHRASES').map(x=>`"${x}"`));

H(2,'3. Crisis contacts and prepared messages');
list(Object.entries(G('LINKS')).map(([k,v])=>`${code(k)}: ${code(v)}`));
P('');
P(`Prepared text message to a trusted person: "${G('HARD_TIME_MSG')}"`);

H(2,'4. Crisis screens');
P('Shown with a trusted person in My Plan (example name "Jordan") unless noted. The Help button is in the top bar of every screen in the app.');
const withPerson='ACTIONS.loadSample()';
const crisisCases=[
  ['Crisis (first screen)', `${withPerson}; session.safetyLevel="RED"; session.screen="crisis"`],
  ['Full crisis screen (Yes / I\'m not sure)', `${withPerson}; session.safetyLevel="RED"; session.screen="crisis-full"; ui.placesOpen=true`],
  ['Full crisis screen, nobody in My Plan yet', `ACTIONS.deleteAll(); session.safetyLevel="RED"; session.screen="crisis-full"; ui.placesOpen=true`],
  ['"What would help right now?" (No)', `${withPerson}; session.safetyLevel="YELLOW"; session.yellow=true; session.screen="crisis-no"; ui.talkOpen=true`],
  ['"Do you feel safer?"', `${withPerson}; session.safetyLevel="YELLOW"; session.yellow=true; session.screen="safety-check"`],
  ['Talk to someone', `${withPerson}; session.safetyLevel="YELLOW"; session.yellow=true; session.screen="talk"`],
  ['Crisis, outside the US', `${withPerson}; prefs.country="other"; session.safetyLevel="RED"; session.screen="crisis"`],
];
for(const [name,setup] of crisisCases){ H(3,name); md.push(...screenText(w,setup)); w.eval('prefs.country="auto"'); }
H(3,'YELLOW support bar (shown above every non-crisis screen once YELLOW)');
w.eval(`ui=freshUi(); session={...initialSession, yellow:true, safetyLevel:"YELLOW", screen:"home"}; render();`);
md.push(...lines(w, w.document.querySelector('.ybar')));

H(2,'5. Intervention library');
for(const i of G('INTERVENTION_LIBRARY')){
  H(3,`${i.name} (${code(i.id)})`);
  list([`Button: "${i.tryLabel}"`, `Description: "${i.description}"`, `For: ${i.states.join(', ')} · about ${Math.round(i.durationSec/60*10)/10} min${i.needsMobility?' · needs moving around':''}`]);
  P(''); P('Steps:'); i.steps.forEach((s,n)=>md.push(`${n+1}. ${s}`));
}
H(3,'Engine messages (the line shown with a suggestion)');
{ const src=G('interventionEngine.toString()');
  const msgs=[...new Set([...src.matchAll(/"([A-Z][^"]*[.!?])"|`([^`]*helped you before\.)`/g)].map(m=>m[1]||m[2]))].filter(m=>!/^No eligible/.test(m));
  list(msgs.map(m=>`"${m.replace('${i.name}','[name]')}"`)); }
H(3,'Engine order');
P('Filter by state → filter by intensity → never repeat the last pick → if YELLOW: connection, then the person\'s own plan items, then grounding, then fresh air (no trying new things) → every 4th start tries something not yet tried this visit → rank by average drop in rating (2+ rated uses) → match to the person\'s plan → first eligible. Shown as an offer ("Walking helped you before."), never a promise.');

H(2,'6. Other fixed copy');
H(3,'Before-rating headings, by state'); list(Object.entries(G('BEFORE_HEAD')).map(([k,[a,b]])=>`${k}: "${a}"${b?` / "${b}"`:''}`));
H(3,'Craving: waiting-it-out checklist'); list(G('CRAVING_STEPS').map(([,t])=>`"${t}"`));
H(3,'5-4-3-2-1 grounding prompts'); list(G('GROUND').map(x=>`"${x.text}"`));
H(3,`"What's still true?" statements (one at a time; That's true / Not true for me; ends after ${G('STILL_TRUE_ENOUGH')} true)`); list(G('STILL_TRUE').map(x=>`"${x}"`));
H(3,'Suggestions from My Plan'); list(Object.entries(G('SUGGESTION_TEXT')).map(([k,v])=>`${k}: "${v}"`));
H(3,'"Things that help me" choices'); list(G('HELP_CHIPS').map(([,l])=>`"${l}"`));
H(3,'Home: "Or tell me what\'s happening" buttons (label → flow it opens)');
G('ui=freshUi(); session={...initialSession, screen:"home"}; render();');
list([...w.document.querySelectorAll('.sits .sit')].map(b=>`"${b.textContent}" → ${code(b.dataset.arg===undefined?b.dataset.act:b.dataset.act+':'+b.dataset.arg)}`));
P('');
P('Changed for review: the craving button now reads "I have an urge to use (drink or drugs)" (was "I want to use"). It still opens the same craving flow (`flow:craving`).');
H(3,'My Plan sections'); list(G('PLAN_SECTIONS').map(([,t,,hint])=>`"${t}"${hint?` (hint: "${hint}")`:''}`));

H(3,'Get out of my head: every game screen, in play order');
P('No points, no levels, no scores. Each game ends with "Did the intensity change?" Yes / A little / No (or Skip). Yes and A little record the change; No records it, counts like "I still feel bad" (twice in a visit turns on the support bar), and the next suggestion is a different step.');
const gameShots=[
  ['Color hunt, part 1','g-color','distraction_color_hunt',''],
  ['Color hunt, part 2','g-color','distraction_color_hunt','ui.gamePart=1; ui.gameDots=[false,false,false];'],
  ['Around me','g-around','distraction_around_me',''],
  ['Rapid categories, part 1 (then cities, then foods)','g-cats','distraction_categories',''],
  ['Memory snap, shapes shown for 5 seconds','g-memory','distraction_memory',''],
  ['Memory snap, choose','g-memory','distraction_memory','ui.memPhase="pick";'],
  ['Memory snap, reveal','g-memory','distraction_memory','ui.memPhase="reveal";'],
  ['Pattern break','g-pattern','distraction_pattern','ui.patPlaying=true;'],
  ['Pattern break, finished','g-pattern','distraction_pattern','ui.patDone=true;'],
  ['60-second challenge','focus','distraction_60_second',''],
  ['End of every game','game-check','distraction_color_hunt','']
];
for(const [label,screen,id,extra] of gameShots){
  P(''); P(`_${label}_`); P('');
  md.push(...screenText(w, `session.currentState="distraction"; session.currentInterventionId=${JSON.stringify(id)}; resetGame(${JSON.stringify(id)}); ${extra} session.screen=${JSON.stringify(screen)}; stopGameTimers(); ${extra}`));
  w.eval('stopGameTimers()');
}
P('');
P('Pattern break messages: "Watch." while it plays, "Your turn." after, "Let\'s watch it again." after a missed tap (it replays; there is no fail state).');
P('');
P('60-second challenge, when the minute is up: "You beat the timer."');

H(3,'Getting help (HELP_IS_STRENGTH) and Helping others (HELPING_OTHERS)');
P('About shows both in full. My Plan (professionals section) shows the first sentence + "Read more". Never on Home, crisis/Help screens or Calm.');
P(''); P(`"${G('HELP_IS_STRENGTH')}"`); P(''); P(`"${G('HELPING_OTHERS')}"`);
H(3,'"Do something kind" (optional step in I feel low; never first or only)');
P('Messages opens only when the person taps; they send it. Nothing is kept about who was messaged or what was said, and kind acts are never counted. "Thank you for ___" goes through the safety check.');
list([`Messages to choose from: ${G('KIND_WORDS').map(x=>`"${x}"`).join(' · ')}`, `Without a phone: ${G('KIND_OFFLINE').map(x=>`"${x}"`).join(' · ')}`]);
for(const [label,screen,extra] of [['Start','kind',''],['Who comes to mind?','kind-person',''],['What would you like to say?','kind-word','ui.kindPerson=0; ui.kindWord=3;'],['Ready to send','kind-send','ui.kindPerson=0; ui.kindText="Thinking of you";'],['Without my phone','kind-offline','']]){
  P(''); P(`_${label}_`); P('');
  md.push(...screenText(w, `${withPerson}; session.currentState="low"; session.currentInterventionId="kind_act"; ${extra} session.screen=${JSON.stringify(screen)}`));
}

H(3,'Code word (6.8)');
P('Set up on a good day from My Plan → Set up with your people. The person picks who gets it and a word (3 neutral suggestions, or their own; anything alarming is refused). Messages opens with the setup text; the person sends it. Saved only after "Yes, I sent it". Once set, "Send my code word to [name]" (the word only) appears on the YELLOW bar, the crisis screen, the full crisis screen, "What would help right now?" (which moves to "Do you feel safer?" in the same tap), Talk to someone and Connect.');
P(''); P(`Setup text: "${G('codeWordSetupMsg("[name]","[word]")')}"`);
P(''); P(`Suggested words: ${G('CODE_WORDS').map(w=>`"${w}"`).join(' · ')}`);
P(''); P('Own word refused if alarming: "Pick something that sounds ordinary, so it\'s safe if someone else sees your phone."');
for(const [label,screen,extra] of [['Who should get your code word?','cw-person',''],['Pick a word','cw-word','ui.cwPerson=0; ui.cwOptions=["lighthouse","blue kite","pineapple"]; ui.cwWord="lighthouse";'],['Your message','cw-send','ui.cwPerson=0; ui.cwFinal="lighthouse";']]){
  P(''); P(`_${label}_`); P('');
  md.push(...screenText(w, `${withPerson}; ${extra} session.screen=${JSON.stringify(screen)}`));
}

H(3,'Supporter guide (6.9, zigzagmind.com/support)');
P('A static page for the people in someone\'s plan: no scripts, no storage, no tracking. Shared from My Plan ("Share the supporter guide" next to each trusted person; only the address is shared). Word for word:');
{ const g=new JSDOM(fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8')).window.document;
  P(''); P(`**Heading:** ${g.querySelector('h1').textContent}`);
  for(const sec of g.querySelectorAll('main section')){
    P(''); P(`**${sec.querySelector('h2').textContent}**`);
    sec.querySelectorAll('p, button').forEach(x=>{ const t=x.textContent.replace(/\s+/g,' ').trim(); if(t) P(`- ${x.tagName==='BUTTON'?'**Button:** ':''}${t}`); });
    sec.querySelectorAll('a[href]').forEach(x=>P(`- **Link → \`${x.getAttribute('href')}\`:** ${x.textContent.trim()}`));
  }
  P(''); P(`Footer: "${g.querySelector('footer').textContent.trim()}"`); }

H(3,'I need my plan (6.12)');
P('The essentials, read-only, from the same plan: Do this first · Reach a person (code word first) · Places I can go · My time and distance plan · What I want to remember · 988 · 911. Opens from "I need my plan now" in My Plan and "Open my plan" on the crisis screens.');
list(Object.entries(G('FIRST_STEP')).map(([k,v])=>`Do this first, if "${k}" is first in things that help: "${v}"`).concat([`Otherwise: "${G('FIRST_STEP_DEFAULT')}"`]));

H(3,'Time and distance plan (6.11)');
P('Replaces "Making my space safer" in My Plan. Three questions, answered only in the person\'s own words. ZigZag Mind gives no examples and never suggests a means. Plan fields are not run through the safety check. Old "safer space" text moves into the first answer.');
list(G('TD_FIELDS').map(([,t,h])=>`"${t}"${h?` (hint: "${h}")`:''}`));
P(''); P(`Optional prepared text ("Ask [name]"): "${G('TD_ASK')}"`);

H(3,'Check-in reminders (6.10)');
P('The person asks someone (My Plan → Set up with your people → Check-in reminders). Messages or the share sheet opens with the ask and a link to the guide with only their first name (`?for=`; letters, spaces and hyphens, 20 characters max). Saved after "Yes, I sent it" as who was asked. On the guide, the supporter picks Gentle (weekly for 4 weeks, then monthly for 5 months: 9 reminders) or Close (every 3 days for 2 weeks, then weekly for 6 weeks: 10 reminders). Their phone builds a calendar file; nothing is sent or stored.');
P(''); P(`The ask: "${G('CHECKIN_ASK')}"`);
P(''); P('Each reminder: "Check in on [first name]" (or "Check in on your person"), 6pm, with: "A short, no-pressure message is enough. Ideas: Thinking of you. No need to reply. · Want to grab food this week? · How\'s your week going?"');
P(''); P('On the guide when a name is given: "[name] would like you to check in now and then." After a choice: "[Gentle/Close] reminders are ready. Open the file to add them to your calendar."');

H(3,'Let\'s Zig + real-world steps (6.17)');
P('**Let\'s Zig** is a simple product rule, not a clinical method: after "I still feel bad" or a game\'s "No", the next suggestion comes from a different channel when one is available. After a recent rating of 8 or more, BODY, SPACE and PEOPLE steps come first. Safety routing always comes first: RED stops everything, and the YELLOW order (connection, own plan, grounding, fresh air) still wins.');
list(Object.entries(G('CHANNEL_OF')).reduce((m,[id,c])=>{ (m[c]=m[c]||[]).push(id); return m; },{}) ? Object.entries(Object.entries(G('CHANNEL_OF')).reduce((m,[id,c])=>{ (m[c]=m[c]||[]).push(id); return m; },{})).map(([c,ids])=>`${code(c)}: ${ids.join(', ')}`) : []);
P(''); P('After "didn\'t help": "Okay. That wasn\'t it. / Let\'s Zig." then one of: '+Object.values(G('CHANNEL_LINE')).map(x=>`"${x}"`).join(' · '));
P(''); P(`Framing on "I don\'t know what I need" and the recommendation screen: "${G('TEN_PERCENT')}"`);
P(''); P('About: "When something isn\'t helping, ZigZag doesn\'t tell you to try harder. It helps you try a different direction." / "Don\'t fight the feeling. Change one variable."');
P(''); P('**Ending** (after "That helped", "I\'m good for now", and at the end of the steps below): "You\'re ready." / "You can put me away for a few minutes." / [Put the phone down]. Returns Home; never suggests anything.');
P(''); P('**Borrow ten minutes**: "You don\'t have to decide the rest of your day." / "Just borrow the next ten minutes." Options: '+G('BORROW_OPTIONS').map(([,b,l])=>`${b} ("${l}")`).join(' · ')+'. Optional 10-minute timer; "Leave any time." Ends: "The ten minutes are yours."');
P(''); P('**What\'s also true** (both lines safety-checked; nothing saved): "What\'s the sentence your brain keeps repeating?" then "What\'s also true?" Optional examples: '+G('TS_EXAMPLES').map(x=>`"${x}"`).join(' · '));
P(''); P('**A kinder voice**: "If someone you cared about felt like this, what would you tell them?" '+G('STRANGER_OPTIONS').map(x=>`"${x}"`).join(' · ')+' → "You can give yourself the same."');
P(''); P(`**Find something alive**: "Find something alive." / "Do you have a pet nearby?" Yes: "${G('ALIVE_PET')}" No: "${G('ALIVE_OUTSIDE')}" → "You spent a moment noticing something outside yourself."`);
P(''); P('**Ridiculous mode** (Get out of my head only; hidden in YELLOW and after any crisis screen this visit; two per visit): "Make this less serious. Just for a moment." '+G('RIDICULOUS_LINES').map(x=>`"${x}"`).join(' · ')+' → "Okay. Back to reality."');
P(''); P('**Find something real** (Calm): '+G('TOUCH_PROMPTS').map(x=>`"${x}"`).join(' · ')+'. Optional textures: '+G('TEXTURES').join(', ')+'. With an anchor in My Plan: "Do you have your anchor nearby?" Yes: "Hold it for a moment." No: "Find something else you can safely hold." Ends: "You found something real."');

H(3,'Find something (owner handoff)');
P('One photo mission at a time (the person decides what they found; the camera is optional; no AI, no image analysis, nothing uploaded; photos kept only on Keep, in "Things I noticed" in My Plan). On Change the scene ("Find something worth looking at" / "One thing. A photo if you want.") and as a SENSE step the engine can pick.');
P(''); P(`"${G('FS_LEAD')}" / [mission] / "${G('FS_SAFE')}" / [Start] / "${G('FS_PRIVATE')}" / [No camera? Just look] [Try another] [I\'m done]`);
list(G('PHOTO_MISSIONS').map(m=>`${m.id}: "${m.prompt}"`));
P(''); P(`With one of the person\'s own things: "Find something from one of your things: [thing]."`);
P(''); P(`No camera: "${G('FS_NOCAM[0]')}" / "${G('FS_NOCAM[1]')}" [I found something] [Try something else]. After: "${G('FS_FOUND')}" / "${G('FS_CAPTION')} Optional." (safety-checked) [Keep it] [Try another] [I\'m done] / "How do I feel now?" → "Kept in Things I noticed." → "${G('PUT_DOWN_NOW')}" [I\'m done]`);
P(''); P('Things I noticed: "Only on this phone. Not a feed, not shared." Each photo can be deleted (asks once). "Something that\'s yours" (used by the next features): the person\'s own entries from My Plan\'s "Things that help me", then "Go do your thing. You don\'t need to accomplish anything. Just spend a few minutes doing it." [I\'m heading out]');

H(3,'Cozy up (owner request)');
const CZ=G('COZY');
P('Calm (replaces "Make something warm") and I feel low; SENSE, real world; one thing at a time, every step skippable; nothing saved; not a treatment.');
P(''); P(`"${CZ.title}" / "${CZ.sub}" [Start] → `+G('COZY_ITEMS').map(([,t,l])=>`"${l}"`).join(' → ')+' (the drink step links to the warm drink steps; then "Next cozy thing"). Buttons: "Done. Next one" · "Skip this one" · "That\'s enough".');
P(''); P(`End: "${CZ.end}" with Zags in a small blanket (never on crisis screens) [I\'m done] / "How do I feel now?"`);
P(''); P(`From I feel low ("Cozy up" / "15 minutes, then one tiny thing."): "${CZ.low}" [Start a gentle 15-minute timer] and "Talk to someone" on every screen. At 15 minutes: "${CZ.lowEnd}" [One tiny thing] [Not now].`);
P(''); P(`Night (00:00–05:59): "${CZ.sleepEntry}" ("Soft light, something warm with no caffeine, phone out of reach") → `+G('COZY_SLEEP').map(([,t,l])=>`"${l}"`).join(' → ')+` / "${CZ.sleepNote}" No sleep-medication advice.`);

H(3,'Have coffee with ZigZag (owner handoff) — CLINICIAN REVIEW: companionship wording');
P('A few quiet minutes with a cup, then back to real life. Scripted lines only, no AI; an illustrated cup labelled "ZigZag" (not Zags); "ZigZag is an app, not a person. Nothing you type here is kept." on the screen; finite (after four choices it ends). Typed text is safety-checked and dropped. Calm card and "Have it with ZigZag" from Warm & comfort; the engine can pick it for anxious, low or spiraling (not alone, not craving). Compare 6.18 A ("stay with you" → "guide you") and the on-hold 6.7c "Zags listens".');
const C_=G('COFFEE');
P(''); P(`Entry: "${C_.entry}" / "${C_.entrySub}" → drinks → "${C_.go[0]}" / "${C_.go[1]}" [I\'m ready] → "${C_.intro[0]}" … "${C_.intro[1]}" → "${C_.menu}" Talk · Just sit · Tell me something random (hidden while YELLOW or after a crisis screen; three at most) · I need to get something out · I\'m not sure`);
list([`Talk (one at a time): `+C_.talk.map(x=>`"${x}"`).join(' · ')+` → replies: `+C_.ack.map(x=>`"${x}"`).join(' · '),
  `Just sit (slow, about 9 seconds apart): `+C_.sit.map(x=>`"${x}"`).join(' → '),
  `Random: `+C_.random.map(x=>`"${x}"`).join(' · '),
  `Get it out: "${C_.out[0]}" / "${C_.out[1]}" → "${C_.outDone}" [Keep going] [Just sit] [Let\'s Zig]`,
  `I\'m not sure: "${C_.unsure}" → Just sit`,
  `Between choices: `+C_.moments.map(x=>`"${x}"`).join(' · '),
  `End: "${C_.enough[0]}" / "${C_.enough[1]}" `+C_.how.map(([,l])=>l).join(' · ')+` → `+Object.entries(C_.reply).map(([k,[a,b]])=>`${k}: "${a} ${b}"`).join(' · ')+` → "${C_.end[0]}" → "${C_.end[1]}" (A little better + own things: "${C_.yours}" [Go do your thing] [Just enjoy my coffee]; Still rough → Let\'s Zig)`]);

H(3,'Warm & comfort (owner handoff)');
P('An ordinary ritual, not a treatment; the ritual is the point, not caffeine (decaf and caffeine-free first; regular coffee isn\'t suggested). Now the first step of Cozy up ("Show me the warm drink steps"), and reachable from Social Zig and Have coffee with ZigZag; the engine suggests Cozy up rather than this. No timer, every step skippable, nothing saved.');
P(''); P(`"${G('WARM_TITLE')}" / "${G('WARM_SUB')}" `+G('WARM_DRINKS').map(([,e,l])=>`${e} ${l}`.trim()).join(' · '));
P(''); P(`"Go make it." / "Take your time." / "${G('WARM_HOT')}" / "While it\'s getting ready, find something around you" [It\'s ready] [That\'s enough]`);
P(''); P('Steps: '+G('WARM_STEPS').map(x=>`"${x}"`).join(' → ')+' ("A slower version": '+G('WARM_SLOW').map(x=>`"${x}"`).join(' → ')+')');
P(''); P(`End: "${G('WARM_END[0]')}" / "${G('WARM_END[1]')}" [Now go do something that\'s yours] [I\'m done → "You can put the phone down now."] / "How do I feel now?"`);

H(3,'Social Zig (owner handoff)');
P('Not anti-social-media: "Yes" means carry on. No shaming, no diagnosis, no platform asked, nothing read from other apps, nothing stored (typed text is safety-checked, then dropped). Tech check → "I\'ve been scrolling" / "Is this helping?".');
const SZ_=G('SZ');
P(''); P(`"${SZ_.q}" [Yes → "${SZ_.yes}"] [Not really → "${SZ_.zig}" / "${SZ_.life[0]}" / "${SZ_.life[1]}"] [I don\'t know → "${SZ_.unsure}"]`);
P(''); P('Directions: Something that\'s yours (only if the person has their own things) · Find something worth looking at · Make something warm · Borrow ten minutes · What\'s also true · Talk to someone · Pick something for me (the engine) · Put the phone down ("'+SZ_.enough+'" / "You can put the phone down now.")');
P(''); P(`Or: "I keep checking the same thing" → "${SZ_.checked[0]}" / "${SZ_.checked[1]}" [Borrow ten minutes] · "I\'m comparing my life to someone else\'s" → "${SZ_.compare}" [Someone else\'s → "${SZ_.side[0]}" / "${SZ_.side[1]}"] [My own → "${SZ_.ownSide}"] · "I\'m about to send something" → "${SZ_.send}" [Send → "${SZ_.sent}"] [Save for later → "${SZ_.saveHint}" (copy only)] [Don\'t send → "${SZ_.letGo}"] · "The last thing I saw" → "${SZ_.last}" (optional) → "${SZ_.felt}" → "${SZ_.change}" · "Too much noise" → "${SZ_.mute}" `+SZ_.muteChoices.join(' · ')+` → "${SZ_.muteHow}" / "${SZ_.instead}"`);

H(3,'Stage 6.19: reach, trust and simplicity');
P('A. Home, below everything else: "Worried about someone? How to help →" (opens the supporter guide at support/#worried). Supporter guide, very top: "Take it seriously, even if they seem fine. Listen more than you talk." Opening section, shown only when arriving that way: "Someone you care about is struggling." / "You don\'t need the right words. Being there and taking it seriously matters most." / "What to say →".');
P(''); P('B. My Plan: "Print my plan" / "A full page and a wallet card to cut out. Printed from this phone; nothing is uploaded." / [ ] "Include my code word" (off by default, never saved). Printed page: "My plan for hard moments", each filled-in section, then "988 Suicide & Crisis Lifeline: call or text 988. Free, 24/7." / "911 if someone is hurt or in danger." / "✂ Cut along the dashed line" and a wallet card: first trusted person and number, "988 — call or text", "911 if someone is hurt or in danger", first reason to stay.');
P(''); P('C. **Privacy & terms — DRAFT, lawyer review required** (the page itself does not say "draft"). Linked from Settings, About and the first onboarding screen. Every paragraph, with the PRIVACY_DATA_FLOW.md sentence that supports it:');
list(G('PRIVACY_PAGE').map(([h,t,src])=>`${h?`**${h}:** `:''}"${t}"${src?` — source: "${src.replace(/\*\*/g,'').replace(/`/g,'')}"`:' — (product terms, no data claim)'}`));
P(''); P('Contact line (only when CONTACT_EMAIL is set): "Questions? Email [address]."');
P(''); P('D. Crisis Text Line (**hidden until the owner verifies it**; CRISIS_TEXT_LINE.verified is '+G('CRISIS_TEXT_LINE.verified')+'): one line below the 988 buttons on the full crisis screen and Connect, on the printed plan, and in the supporter guide\'s "Get help together": "'+G('CTL_LINE')+'" (phones: Text HOME to 741741 is a text link; computers: shown as text).');
P(''); P('E. Spanish interface: **scaffolding only, nothing shown**. SPANISH_ENABLED is '+G('SPANISH_ENABLED')+'. '+G('Object.keys(L10N.en).length')+' strings (onboarding, Home, crisis screens, Calm, Connect, My Plan, Help, Settings labels) now live in one table; English is unchanged. Every Spanish line is a DRAFT for a human translator and the clinician: docs/SPANISH_REVIEW.md. A draft crisis-screen line is never shown, even with Spanish on.');
P(''); P('F. Feedback (only when FEEDBACK_URL is set; it is '+(G('FEEDBACK_URL')?'set':'empty')+'): on About only, "Did ZigZag Mind help? Tell us anonymously →" (new tab). Privacy page adds: "'+G('FEEDBACK_PRIVACY[0]')+'"');
P(''); P('G. "Help near me (Treasure Coast)" (**hidden until the owner verifies at least one entry**; on Change the scene and Connect). Screen: "Local services can change. For a crisis, call or text 988." Entries (all verified:false today):');
list(G('NEAR_ME').map(e=>`${e.name}: "${e.what}"${e.phone?' · '+e.phone:''} (verified: ${e.verified})`));
P(''); P('H. Simplicity audit: report only, nothing applied (docs/SIMPLICITY_AUDIT.md).');

H(3,'Owner verification, 2026-10-05 (docs/CRISIS_RESOURCE_VERIFICATION.md)');
P('Found on each organization\'s official site by search; the owner (JB) then opened the official pages and confirmed them. Now on: '+[...G('TRAUMA_RESOURCES'),...G('BULLY_RESOURCES'),...G('GRIEF_RESOURCES')].filter(e=>e.verified).map(e=>e.name+(e.number?' ('+e.number+')':'')).join(' · ')+' · Crisis Text Line (text HOME to 741741, one line below 988). Still hidden: Help near me (211, New Horizons, NAMI, recovery meetings). The Florida Warm Line needs the owner\'s phone call. Owner settings and the urge chip wording: pending owner input. Clinician and translator decisions: pending (none recorded).');

H(3,'Stage 6.28 A: Home chips');
P('"'+G('l10n("home.sitLabel")')+'" now shows five chips plus "'+G('l10n("home.more")')+'": I\'m anxious · I\'m spiraling · I feel sad or low · '+G('l10n("home.craving")')+' · I feel alone · More → (in place) Just out of the ER · I lost someone · Bullied — now or before · PTSD, trauma, or military.');

H(3,'Stage 6.28: PTSD, trauma, or military (CLINICIAN REVIEW REQUIRED for the whole path)');
P('Why (for reviewers only; never shown as statements about people): in 2023 an average of 17.5 veterans died by suicide each day; firearms were involved in 73.3% of veteran suicides (52.9% non-veteran); 61% had not received VA care in their last year (VA 2025 National Veteran Suicide Prevention Annual Report). The rule above all others: ZigZag Mind never asks about the trauma; no typing in the flashback or nightmare flows.');
const PT=G('PTSD');
list([
  'Home → More → "'+G('l10n("home.ptsd")')+'" → "'+PT.q+'" → '+PT.opts.map(([,t,m])=>`"${t}"${m?` ("${m}")`:''}`).join(' · ')
]);
list([
  'C. It\'s happening right now (plain, large type, one instruction per screen, Next only, no typing): Now screen "It\'s [Weekday, Month Day, Year]. It\'s [h:mm AM/PM]." / "'+PT.thenNow+'" → '+PT.flash.filter(x=>x!=='now').map(x=>`"${x}"`).join(' → ')+' → the Now screen again → "'+PT.reachQ+'" → "'+PT.reachVet+'" · "'+PT.reachTalk+'" · "'+PT.reachOk+'"',
  'D. Nightmare (plain, no typing): "'+PT.night[0]+'" → the Now screen with "'+PT.over+'" → "'+PT.night[2]+'" → "'+PT.nightZags+'" · "'+PT.nightCozy+'" (night only) · "'+PT.nightTalk+'" · "'+PT.nightDown+'"'
]);
list([
  'E. On edge: "'+PT.edgeSay+'" → one idea at a time ("'+PT.another+'", "'+PT.howNow+'"): '+PT.edge.map(([,t])=>`"${t}"`).join(' · ')+' → the normal check-in and Let\'s Zig ("Make it smaller" not built yet)'
]);
list([
  'F. Veteran or service member: "'+PT.vetSay+'" → "'+PT.vetBeen+'": Vet Center Call Center — 1-877-927-8387 ("'+PT.vetCenterLine+'") "'+PT.vetCall+'" · Veterans Crisis Line ("'+PT.vclLine+'"): "'+PT.vclCall+'" · "'+PT.vclText+'" · "'+PT.vclChat+'" · PTSD Coach ("'+PT.coachLine+'") "'+PT.coachLink+'" · "'+PT.noVA+'"',
  'Guns (OWNER-APPROVED INTERIM, clinician review): "'+PT.guns+'" → "'+PT.gunsLink+'" (My Plan → Time and distance plan)'
]);
list([
  'G. Something happened to me (not military): "'+PT.otherSay+'" → "'+PT.otherNow+'" (C) · "'+PT.otherEdge+'" (E) · resources hidden until verified (RAINN National Sexual Assault Hotline; National Domestic Violence Hotline) · "'+PT.counselor+'" → "'+PT.reachTalk+'"'
]);
list([
  'H. Someone I love: "'+PT.loveSay+'" → '+PT.loveGuide.map(x=>`"${x}"`).join(' · ')+' · "'+PT.loveVet+'" (call button) · "'+PT.loveGuideLink+'"'
]);

H(3,'Most of my days feel heavy (owner request, 2026-10-05; CLINICIAN REVIEW REQUIRED)');
const HV=G('HEAVY');
list([
  'Entry: Home → More → "'+G('l10n("home.heavy")')+'", and a small link on "I feel sad or low". Not in the engine. No typing; nothing saved.',
  '1: "'+HV.say+'" / "'+HV.sub+'"',
  '2: "'+HV.steps[0][1]+'" / "'+HV.steps[0][2]+'" → "'+HV.doctorLine+'" / "'+HV.doctorNote+'" / "'+HV.friendLbl+'" → prepared text "'+HV.friendMsg+'" (Copy on computers)',
  '3: "'+HV.steps[1][1]+'" / "'+HV.steps[1][2]+'" → '+HV.smallOpts.map(o=>`"${o[1]}"`).join(' · ')+' (the low tiny things / A line for today / Borrow ten minutes)',
  'End: "'+HV.end+'" → Put the phone down · Talk to someone',
  'Every screen: "'+HV.more+'" Call 988 · Text 988 (computers: chat)'
]);

H(3,'It feels like panic (2026-10-05 research pass; wording drafted by Claude Code; CLINICIAN REVIEW REQUIRED)');
const PA=G('PANIC');
list([
  'Entry: Home → More → "'+G('l10n("home.panic")')+'", and a small link "'+PA.link+'" on the first "I\'m anxious" screen. Not in the engine. No typing; nothing saved.',
  ...PA.steps.map((x,i)=>(i+1)+': "'+x[0]+'" / "'+x[1]+'" → "'+PA.next+'"'),
  'Then: "'+PA.endQ+'" → '+PA.ends.map(e=>`"${e[1]}"`).join(' · '),
  'Coming down: "'+PA.downSay+'" → Put the phone down · Calm down',
  'Still strong: "'+PA.strongSay+'" → "'+PA.again+'" · Talk to someone · "'+PA.scared+'" Get help now',
  'Every screen: "'+PA.medical+'" ['+PA.call911+']'
]);

H(3,'I\'m really angry: step away (2026-10-05 research pass; wording drafted by Claude Code; CLINICIAN REVIEW REQUIRED)');
const AN=G('ANGRY');
list([
  'Entry: Home → More → "'+G('l10n("home.angry")')+'". Not in the engine. Never asks what happened or who. No typing; nothing saved.',
  ...AN.steps.map((x,i)=>(i+1)+': "'+x[0]+'" / "'+x[1]+'"'),
  'Step 2 also: "'+AN.msgLbl+'" → prepared text "'+AN.msg+'" (they choose who; Copy on computers)',
  'Step 4 options: '+AN.downOpts.map(o=>`"${o[1]}"`).join(' · '),
  'End: "'+AN.end+'" → Put the phone down · Talk to someone',
  'Every screen: "'+AN.danger+'" Get help now (opens the crisis screen)'
]);

H(3,'Park it for later (worry time; 2026-10-05 research pass; wording drafted by Claude Code; CLINICIAN REVIEW REQUIRED)');
const WO=G('WORRY');
list([
  'Entry: a small link "'+WO.link+'" on the first "I\'m spiraling" screen. No typing, no reminders, nothing saved.',
  '1: "'+WO.say+'" / "'+WO.sub+'" → '+WO.times.map(o=>`"${o[1]}"`).join(' · '),
  '2 (e.g. After dinner): "'+G('WORRY.parked("After dinner")')+'" / "'+G('WORRY.notNow("After dinner")')+'" / "'+WO.paper+'"',
  '3: "'+WO.laterHead+'" → '+WO.later.map(x=>`"${x}"`).join(' · ')+' · "'+WO.scared+'" Get help now → Put the phone down · Get out of my head'
]);

H(3,'One problem, one step (2026-10-05 research pass; wording drafted by Claude Code; CLINICIAN REVIEW REQUIRED)');
const PR=G('PROBLEM');
list([
  'Entry: a small link "'+PR.link+'" on the first "I\'m spiraling" screen. Said out loud or in your head: no typing, nothing saved.',
  ...PR.steps.map((x,i)=>(i+1)+': "'+x[0]+'" / "'+x[1]+'"'),
  '4: "'+PR.whenQ+'" → '+PR.whens.map(o=>`"${o[1]}"`).join(' · '),
  'End: "'+PR.endNow+'" (Now) or "'+PR.end+'" · "'+PR.big+'" Talk to someone → Put the phone down'
]);

H(3,'My hope box (2026-10-05 research pass; wording drafted by Claude Code; CLINICIAN REVIEW REQUIRED)');
const HB=G('HOPE_BOX');
list([
  'Entry: My Plan → "'+HB.name+'" ("'+HB.planHint+'"). Read-only: shows reasons to stay, saved songs (Play) and up to '+HB.shown+' things from Things I noticed. Stores nothing of its own. Not on crisis screens.',
  'Screen: "'+HB.name+'" / "'+HB.sub+'" → sections "'+HB.reasons+'" · "'+HB.songs+'" · "'+HB.noticed+'"',
  'Empty: "'+HB.empty+'" → '+HB.add.map(o=>`"${o[1]}"`).join(' · ')+' (only the missing ones are shown)',
  'End line: "'+HB.end+'"'
]);

H(3,'Hold & answer (owner handoff, 2026-10-05; CLINICIAN REVIEW REQUIRED)');
P('A small grounding exercise: hold your thumb gently while answering five easy questions, one at a time. Calm → "'+G('HOLD.name')+'" ("'+G('HOLD.entryMeta')+'"); the engine and Let\'s Zig may offer it for anxious or spiraling moments. Not therapy or treatment; no claims it stops anxiety; no scores; nothing saved.');
const HO=G('HOLD');
list([
  'Intro: '+HO.intro.map(x=>`"${x}"`).join(' / ')+' → "'+HO.start+'"',
  'Hand (optional): '+HO.hand.map(x=>`"${x}"`).join(' / ')+' → "'+HO.next+'" · "'+HO.noHand+'" (straight to the questions without the hand instruction)',
  'Q1 "'+HO.q[0]+'" (small: "'+HO.keep+'") → Q2 "'+HO.q[1]+'" → Q3 "'+HO.q[2]+'" (each "'+HO.next+'")',
  'Q4 "'+HO.q[3]+'" → '+HO.feet.map(f=>`"${f[1]}"`).join(' · ')+' (any answer continues)',
  'Q5 "'+HO.q[4]+'" → '+HO.need.map(f=>`"${f[1]}"`).join(' · ')+' or "'+HO.ownLabel+'" → "'+HO.ownBtn+'" (safety-checked, not kept)',
  'End: "'+HO.done[0]+'" / "'+HO.done[1]+'" / "'+HO.nextQ+'" → '+HO.after.map(f=>`"${f[1]}"`).join(' · ')+' (Calm / Get out of my head / Connect / I don\'t know what I need; the one matching Q5 is listed first) · "'+HO.bye.join(' ')+'"'
]);

H(3,'Understand it (owner handoff, 2026-10-04; CLINICIAN REVIEW REQUIRED; not validated)');
P('Optional and short (2–3 questions), one question at a time, then one real step through the existing routes or the engine. No labels, scores or storage. Reached from: I don\'t know what I need (small link), the first screen of I\'m anxious / I\'m spiraling (small link), I feel sad or low (small link), Connect → Something else. Not on Home.');
const UN=G('UNDERSTAND');
list([
  'Entry: "'+UN.name+'" ("'+UN.entryMeta+'") or "'+UN.link+'"; lead line: "'+UN.lead+'"',
  '"'+UN.q1+'" → '+UN.a1.map(a=>`"${a[1]}"`).join(' · ')+' ("Nothing obvious" and "I don\'t know" skip to the third question)',
  '"'+UN.q2+'" → '+UN.a2.map(a=>`"${a[1]}"`).join(' · ')+' ("I can\'t stop thinking about it" → Stop figuring it out)',
  '"'+UN.q3+'" → '+UN.a3.map(a=>`"${a[1]}"`).join(' · ')+' → Calm / Get out of my head / Connect / Change the scene / Find something / the engine',
  'Ending: "'+UN.known+'" / "'+UN.step+'" → "'+UN.nextStep+'"',
  'What else could be true: "'+UN.thoughtLink+'" → "'+UN.thoughtQ+'" → '+UN.thoughts.map(([,t,say,alts])=>`"${t}" → "${say}"`+(alts?` / "${UN.elseQ}" → `+alts.map(x=>`"${x}"`).join(' · '):` / "${UN.easierQ}" → the third question\'s choices`)).join(' ; ')+' ; "'+UN.thoughtOwn+'" ("'+UN.thoughtOwnLabel+'", safety-checked, not kept) → "'+UN.ownSay+'" / "'+UN.elseQ+'" → '+UN.ownAlts.map(x=>`"${x}"`).join(' · ')+'. Choosing a sentence counts as the person\'s words, so "Nobody cares about me." and "Everyone hates me." turn on YELLOW like typing them would.',
  'Stop figuring it out: "'+UN.stop1+'" / "'+UN.stop2+'" → '+UN.stopOpts.map(o=>`"${o[1]}"`).join(' · ')+' (Find something · Find something real · Change the scene · Make something warm · Step outside for 5 minutes)'
]);

H(3,'Stage 6.27: Bullied, now or before (CLINICIAN REVIEW REQUIRED for all of it)');
P('Why (for reviewers only; never shown to people as statements about them): frequent childhood bullying is linked to more adult depression (OR 1.95), anxiety disorders (OR 1.65) and suicidality (OR 2.21) (Takizawa, Maughan & Arseneault, 2014); 32% of Americans reported being directly bullied at work in 2024 (Workplace Bullying Institute); 41% of U.S. adults have experienced online harassment (Pew Research Center, 2021).');
const BU=G('BULLY');
list([
  'Home chip: "'+G('l10n("home.bullied")')+'". First screen: "'+BU.intro+'" / "'+BU.closest+'" → '+BU.paths.map(p=>`"${p[1]}"`).join(' · '),
  'Every screen in this path ends with: "'+BU.line988+'" Call 988 · Text 988 (computers: Chat with 988 online)'
]);
list([
  'B. Years ago: "'+BU.past.say+'" → one idea at a time ("'+BU.another+'" · "'+BU.doneForNow+'"): '+BU.past.ideas.map(([,t,m])=>`"${t}" ("${m}")`).join(' · '),
  'Then and now (tap-only chips; optional short line each, "'+BU.lineOpt+'"; safety-checked; nothing saved): "'+BU.then.lbl+'": '+BU.then.chips.map(x=>`"${x}"`).join(' · ')+' / "'+BU.now.lbl+'": '+BU.now.chips.map(x=>`"${x}"`).join(' · ')+' → "'+BU.thenDone+'"',
  'Younger self: "'+BU.younger+'" / "'+BU.youngerSub+'" → "You said it." → "'+BU.letGo+'" (default) · "'+BU.keepDiary+'" (diary entry tagged "'+G('DIARY_TAGS.younger')+'"; a locked diary asks "'+BU.unlockTitle+'" / "'+BU.unlockSub+'" first) → "'+BU.letGone+'" / "'+BU.keptDiary+'"',
  'Ground: "'+BU.ground+'" (existing 5-4-3-2-1) · "'+BU.zags+'" (existing)',
  'End (years ago): "'+BU.past.end+'" → Put the phone down · Talk to someone · "'+BU.backStart+'"'
]);
list([
  'C. At work: "'+BU.work.say+'" → one idea at a time: '+BU.work.ideas.map(([,t,m])=>`"${t}" ("${m}")`).join(' · '),
  'Write it down: "'+BU.workDate+'" (today by default) · "'+BU.workWhat+'" · "'+BU.workWho+'" (safety-checked) → "You wrote it down." → "'+BU.saveDiary+'" (diary entry tagged "'+G('DIARY_TAGS.work')+'"; a locked diary asks for the passcode first) · "'+BU.dontSave+'" ("'+BU.notSaved+'"). If the diary isn\'t locked: "'+BU.workTip+'"',
  'Talk: "'+BU.talkMsg+'" ("'+BU.talkPick+'")',
  'Make it through today: "'+BU.borrow+'" ("'+BU.smaller+'" appears once 6.24 is built)',
  'Resource (hidden until verified): Workplace Bullying Institute'
]);
list([
  'D. Online: "'+BU.online.say+'" → one idea at a time: '+BU.online.ideas.map(([,t,m])=>`"${t}"${m?` ("${m}")`:''}`).join(' · ')+'; Tell one person: "'+BU.onlineMsg+'"; Step away → "'+BU.scene+'"',
  'On the first and last screen: "'+BU.threatsQ+'" / "'+BU.threatsMore+' '+BU.threats+'" → "'+BU.call911+'"; resource (hidden until verified): Cyber Civil Rights Initiative helpline'
]);
list([
  'E. Someone I love (adults supporting someone, including a parent of a child): "'+BU.love.say+'" → "'+BU.love.guideTitle+'": '+BU.love.guide.map(x=>`"${x}"`).join(' · ')+' · "'+BU.love.supporter+'" (the supporter guide); resource (hidden until verified): StopBullying.gov'
]);
list([
  'F. YELLOW phrases (OWNER-APPROVED INTERIM, pending clinician; should any be RED?): '+G('YELLOW_PHRASES.slice(16)').map(p=>`"${p}"`).join(', ')
]);
list([
  'G. FOUNDER_NOTE (owner\'s choice): '+(G('FOUNDER_NOTE')?'set':'empty, so nothing is shown')+'. When set: About page only, under "Why ZigZag Mind exists", in the owner\'s exact words.'
]);

H(3,'Stage 6.23: I feel sad or low (CLINICIAN REVIEW REQUIRED for all of it)');
const SA=G('SAD');
list([
  'Home chip renamed: "'+G('l10n("home.low")')+'" (was "I feel low").',
  'First screen (Zags under a small soft-gray cloud; the cloud drifts gently, still with reduced motion, never on crisis screens): "'+SA.q+'" / "'+SA.ok+'" / small: "'+SA.sky+'" → "'+SA.letOut+'" · "'+SA.tiny+'" (the existing low path: optional rating, then the same tiny things)',
  '"'+SA.letOut+'", one idea at a time ("'+SA.another+'" · "'+SA.doneForNow+'"): '+SA.ideas.map(([,t,m])=>`"${t}" ("${m}")`).join(' · '),
  'Sit with it: "'+SA.sitTitle+'" / "'+SA.sitSub+'" → "'+SA.sitDone+'" (no timer)',
  'Put it somewhere: "'+SA.putDiary+'" · "'+SA.putDoodle+'" · "'+SA.putSong+'"; Find a gap: "'+SA.gapGo+'" (the tiny-things list); songs: no links or recommendations',
  'Ending: "'+SA.end+'" → Put the phone down · Talk to someone · '+SA.tiny
]);

H(3,'Stage 6.22: Doodle');
P('Get out of my head → "Doodle" ("Draw anything. No skill needed."). SENSE, real world; Let\'s Zig may pick it ("'+G('findIntervention("doodle").description')+'"). Nothing analyzed or sent; kept only on Keep.');
const DO=G('DOODLE');
list([
  'Prompts, one at a time ("'+DO.another+'"): '+DO.prompts.map(x=>`"${x}"`).join(' · '),
  'Tools: colors '+DO.colors.map(c=>c[0]).join(', ')+' · '+DO.sizes.map(x=>x[0]).join(' / ')+' · "'+DO.eraser+'" · "'+DO.undo+'" · "'+DO.clear+'" → "'+DO.clearQ+'" '+DO.clearYes+' / '+DO.cancel,
  '"'+DO.done+'" → "Keep it, or let it go?" (empty page: "Nothing on the page. That\'s okay too.") → "'+DO.keep+'" / "'+DO.letGo+'" ("'+DO.letGoLine+'") / "Keep drawing"',
  'Ending: "'+DO.kept+'" (if kept) · "'+DO.end+'" → I\'m done · How do I feel now?',
  'Things I noticed labels it "'+DO.label+'". Privacy & terms: "doodles" added to what is saved only on Keep; "Photos and doodles never leave this phone through ZigZag Mind."'
]);

H(3,'Stage 6.21: A line for today');
P('Only from My Plan ("'+G('DIARY.title')+'") and a small link under "Put the phone down" ("'+G('DIARY.phoneDown')+'"). Never on crisis screens; never suggested. Only on this phone (its own key). No counts, streaks, charts or reminders.');
const DI=G('DIARY');
list([
  'Diary screen: "'+DI.title+'" / "'+DI.planHint+'" → "'+DI.write+'" · "'+DI.back+'"',
  'Step 1: "'+DI.feel+'" (tap any, optional; Skip): '+DI.feelings.join(' · '),
  'Step 2: "'+DI.words+'" (placeholder "'+DI.wordsPh+'"; up to 1,000 characters)',
  'Step 3: "'+DI.still+'" (Optional; up to 120 characters). Examples: '+DI.stillEx.map(x=>`"${x}"`).join(' · '),
  'Step 4: "'+DI.keep+'" (with saving off: "'+DI.keepOff+'") / "'+DI.dontKeep+'" → "'+DI.kept+'" / "'+DI.keptOff+'" / "'+DI.dropped+'"',
  'Both fields are safety-checked on Keep: RED → crisis screen, entry NOT saved (clinician item D-diary); YELLOW → support bar, entry saved.',
  'Storage full: "'+DI.full+'" (the words stay on screen)',
  'Looking back: newest first, grouped by date; each entry shows its feeling words, the few words and the "still true" line (stronger brand style). Tap to read in full; "Delete" → "'+DI.deleteQ+'" Delete / Keep → "'+DI.deleted+'". Only at 7 or more entries, at the top: "'+DI.backNote+'". No stats, counts or graphs.',
  'Passcode lock (off by default): "'+DI.lock+'" → warning "'+DI.warn+'" / "'+DI.warnSub+'" ['+DI.understand+'] ['+DI.notNow+'] → "'+DI.setTitle+'" / "'+DI.setSub+'" ("'+DI.pass1+'", "'+DI.pass2+'"; errors "'+DI.tooShort+'", "'+DI.mismatch+'") → "'+DI.setBtn+'" → "'+DI.locked+'"',
  'Locked: "'+DI.unlockTitle+'" (passcode field only) → "'+DI.unlockBtn+'"; wrong: "'+DI.wrong+'" (no lockout, no hints); "'+DI.forgot+'" → "'+DI.forgotTitle+'" / "'+DI.forgotSub+'" → "'+DI.forgotBtn+'" → "'+DI.forgotQ+'" '+DI.forgotYes+' / '+DI.cancel+' → "'+DI.forgotDone+'"',
  'Lock options: "'+DI.lockOn+'" · "'+DI.lockNow+'" · "'+DI.lockOff+'" ("'+DI.offSub+'" → "'+DI.offDone+'"); without saving: "'+DI.lockNeedsSaving+'"; old browsers: "'+DI.lockNoCrypto+'". Re-locks when leaving the diary, when the page is hidden, or after 5 minutes.',
  'Export: diary entries only when the diary is unlocked; locked: "'+DI.exportLocked+'". Delete everything removes the diary, its salt and check value. Saving off: the diary can be written for the visit, never stored.',
  'Privacy & terms now says: "The optional diary lock encrypts diary entries on the phone; everything else is not encrypted" (lawyer review: the page is a DRAFT).'
]);

H(3,'Stage 6.20: When you\'ve lost someone (CLINICIAN REVIEW REQUIRED for the whole path)');
P('Entered only by the person: Home chip "'+G('l10n("home.lost")')+'", and on Tech check\'s "My AI changed or is gone" last screen: "Lost a person or a pet? →". The engine and Let\'s Zig never suggest it. Who/when pick wording only and are never saved. Every free-text field is safety-checked (RED → crisis, nothing kept).');
const GR=G('GRIEF');
list([
  'Who: "'+GR.who+'" → '+GR.whoOpts.map(([,t,m])=>`"${t}"${m?` ("${m}")`:''}`).join(' · '),
  'When: "'+GR.when+'" → '+GR.whenOpts.map(([,t,m])=>`"${t}"${m?` ("${m}")`:''}`).join(' · '),
  'Acknowledgment (person): "'+GR.ack.person+'"',
  'Acknowledgment (pet): "'+GR.ack.pet+'"',
  'Acknowledgment (something else): "'+GR.ack.else+'"',
  'Added when "Today is a hard day": "'+GR.hardDay+'"',
  'Small text on every acknowledgment: "'+GR.suicideLoss+'"',
  'Faith & hope on only (KJV): "'+GR.faith[0]+'" ('+GR.faith[1]+')',
  'Choices: "'+GR.help+'" / "'+GR.helpSub+'" → '+GR.helpOpts.map(([,t,m])=>`"${t}"${m?` ("${m}")`:''}`).join(' · ')+' · "'+GR.doneForNow+'"; below: "If it gets heavier" + Call 988 / Text 988',
  'Breathe: the existing Calm down with Zags; its last screen adds "Back to \"'+GR.help+'\""',
  'Find (Find something, "Remembering" mission): "'+G('GRIEF_MISSION.prompt')+'" (camera optional; "No camera? Just look"; Keep saves to Things I noticed labeled "Remembering")',
  'Write: "'+GR.write+'" / "'+GR.writeSub+'" → "'+GR.wrote+'" / "'+GR.wroteSub+'" → Delete (default, primary) · Keep → "'+GR.kept+'" or "'+GR.deleted+'"',
  'Tell one person: "'+GR.tellName+'" → "'+GR.tellPick+'" (computers: "'+GR.tellCopy+'"). Messages (with a name / without): '+G('griefMsgs("Sam")').map(m=>`"${m}"`).join(' · ')+' / '+G('griefMsgs("")').map(m=>`"${m}"`).join(' · '),
  'Hard date: "'+GR.date+'" / "'+GR.dateSub+'" → calendar file, once a year at 9am: "'+GR.dateTitle+'" → "'+GR.dateAdded+'"',
  'Ending: "'+GR.end+'" → Put the phone down · Something else (the engine, Let\'s Zig, state "low") · Talk to someone (Connect)',
  'Resources (hidden until verified; card "'+GR.resources+'"): '+G('GRIEF_RESOURCES').map(e=>`${e.name}: "${e.what}" (verified: ${e.verified}${e.faith?'; Faith & hope only':''})`).join(' · '),
  'YELLOW phrases (OWNER-APPROVED INTERIM, pending clinician; should any be RED?): '+G('YELLOW_PHRASES.slice(10)').map(p=>`"${p}"`).join(', ')
]);

H(3,'North star pass (2026-10-04): at most 8 choices, nothing removed');
P('Progressive disclosure only; wording of every hidden option is unchanged. One tap shows the rest (kept open for this visit, in memory only):');
list([
  'Calm: "'+G('l10n("calm.more")')+'" ("'+G('l10n("calm.moreMeta")')+'") shows: '+['breathe','ground','feet','real'].map(k=>'"'+G('l10n("calm.'+k+'")')+'"').join(', ')+'.',
  'Connect: "'+G('l10n("connect.more")')+'" ("'+G('l10n("connect.moreMeta")')+'") shows: "'+G('l10n("connect.around")')+'", "'+G('l10n("connect.zags")')+'", "'+G('l10n("connect.song")')+'". The Warm Line, your people, message ideas and 988 stay in view.',
  'Change the scene: "Find something" ("Something alive, or something worth looking at") shows: "Find something alive", "Find something worth looking at".'
]);

H(3,'Stage 6.18 owner-approved updates (OWNER-APPROVED INTERIM, pending clinician)');
P('A. Zags: first line now "'+G('ZAGS_LINES.hello')+'"; Connect: "Calm down with Zags while you wait" (no subtitle).');
P(''); P('B. Supporter guide, "Look after yourself": "Talk to someone who gets it. The Florida Warm Line is free and is also for family and friends supporting someone: 1-800-945-1355, every day 4pm–10pm Eastern. Not a crisis line. For a crisis, call or text 988."');
P(''); P('C. Spanish RED phrases: quiero morir · me quiero morir · quiero matarme · me voy a matar · quitarme la vida · suicidarme · no quiero vivir. Accents are folded before matching. A reviewed Spanish YELLOW list is requested.');
P(''); P('D1. Under the 988 buttons (first crisis screen, full crisis screen, Connect): "'+G('VETERAN_LINE')+'"');
P(''); P('D2. Night (00:00–05:59, phone clock, nothing saved). Home: "'+G('NIGHT_HOME_LINE')+'" Connect: 988 first; Warm Line moves below your people with "'+G('WARMLINE_NIGHT')+'" (button never disabled); "Can\'t sleep, you up?" first. Crisis screens never change.');
P(''); P('D3. crisis-no and full crisis screen, below the options: "'+G('USING_LINE')+'"');
P(''); P('D4. Full crisis screen, below 988 and the veteran line: "'+G('NOT_POLICE_HEAD')+' '+G('NOT_POLICE_TEXT')+'" [Call 211]');
P(''); P('D5. My Plan "Reasons to stay" (hint: "'+G('REASONS_HINT')+'"; "Your songs are here too."). Shown on "I need my plan" and as "Your reasons to stay" on the full crisis screen when filled in.');
P(''); P('D6. Time-and-distance help text and supporter guide: "'+G('GUN_LINE')+'"');
P(''); P('E1. About and the first onboarding screen: "'+G('TAGLINE_ZIG')+'" E2. About: "'+G('PROMISE')+'"');
P(''); P('E3. "Something else" on the recommendation shows five directions: '+G('DIRECTIONS').map(([,t,m])=>`${t} ("${m}")`).join(' · ')+'. Tapping one picks the best eligible step in that channel; YELLOW priority still wins; "Never mind" closes it. If nothing fits: "Nothing new in that direction right now. Here\'s something else."');
P(''); P('E4. Connect message ideas add "Hey. Just saying hi." · "Got a minute?" with "'+G('IDEAS_NOTE')+'"');
P(''); P('E5. Connect: "Be around people, no talking needed" → "'+G('AROUND_PEOPLE')+'" + Somewhere to go (Maps).');
P(''); P('E6. Change the scene: "Go to a window" → "Look outside for one minute. You don\'t have to notice anything in particular."');
P(''); P('E7. "You\'re ready": [Put it down for one minute] → "Put it down for one minute." (1:00 timer, "Pick it up again when it\'s done, or don\'t.") → "Still need me?" Yes → Home; No → "Good. Go live your life for a bit."');
P(''); P('E8. I don\'t know what I need: "That\'s okay. We don\'t need to name it."');

H(3,'Desktop support (no phone or SMS)');
P('Phone stays the priority: links stay as they are unless the device is clearly a desktop or laptop (desktop browser, no touch). Unsure means phone. The crisis flow and the NO-branch safety-check rule are unchanged; a Copy button from the NO branch still sets "Do you feel safer?" in the same tap.');
list(['"Text 988" → "Chat with 988 online" (https://988lifeline.org/chat, new tab). On crisis-full and Talk the separate "Chat online with 988" button is not shown twice.',
  'Call buttons add the number: "Call Jordan · 555-0142", "Call the Warm Line · 1-800-945-1355".',
  'Prepared texts: "Text [name] ([number]) from your phone, or paste this anywhere:" then the message and [Copy message]. With no message: "… from your phone." [Copy number]. After copying: "Copied" (or "Couldn\'t copy. Select the text above.").',
  'Code word setup and check-in asks: "Send it to [name] ([number]) from your phone, or paste it anywhere." [Copy message]. Connect ideas: "Tap one to copy it:".',
  'About: "In crisis right now?" Call 988 · Chat with 988 online. Supporter guide: "Text 988" → "Chat with 988 online".']);

H(3,'Faith & hope (6.15, opt-in)');
P('Off by default. Settings → "What gives you strength?" (optional; "Only on this phone. Tap again to clear."): '+G('STRENGTH_OPTIONS').map(([,l])=>l).join(' · ')+'. Only "Bible" turns on a "Need a little hope?" link on Calm and Connect; the other answers change nothing for now. Clinician or chaplain review required: for some people, religious content in distress brings guilt rather than comfort. Verses are King James Version (public domain); some are the well-known part of the verse, not the whole verse.');
list(G('FAITH_PASSAGES').map(([,m,t,ref])=>`${m}: "${t}" (${ref}, KJV)`));
P(''); P('Each passage screen: one passage, "Take this with you. Then:" Pray · Text someone · Take a walk · Ground myself · Open my plan. No scrolling, no reading plans, no daily verses.');
P(''); P(`Pray: "${G('FAITH_PRAY')}" [Done] [I'd like to talk to someone]`);

H(3,'Tech check (6.14)');
P('From the Tech check row on Home. Copy rule: no shame, ever. Nothing typed or tapped here is saved. Each path ends at a person or a real-world step, then the usual "How do you feel now?" check-in. Option 6, "I\'m not sure what\'s real" (ai_reality), is NOT built: it needs clinician review first.');
P(''); P(`Intro: "${G('TC_INTRO')}"`);
list(G('TC_OPTIONS').map(([,t,m,id])=>`"${t}"${m?` (${m})`:''} → ${code(id)}`));
P(''); P(`**Asking AI again:** "${G('TC_RELIANCE')}" `+G('TC_SDA').map(([h,t])=>`${h}: "${t}"`).join(' · ')+' → [Start a 10-minute break] or [I\'m done]');
P(''); P(`**Checking:** "${G('TC_CHECK_Q')}" [Information] [Reassurance] (either; "Either is okay. Just notice which.") → 10-minute loop break, countdown and checklist: `+G('TC_LOOP_STEPS').map(([,t])=>`"${t}"`).join(' · ')+`. "${G('TC_LOOP_ASK')}" At zero: "${G('TC_LOOP_END')}"`);
P(''); P('**Falling behind:** "Afraid you\'re falling behind?" / "What are you afraid of missing?" '+G('TC_FOMO_MISS').join(' · ')+'. Fields (safety-checked, "Only on this screen. Not saved."): '+G('TC_FOMO_FIELDS').map(([,l,ph])=>`"${l}" (example: "${ph}")`).join(' · ')+`. Then: "${G('TC_FOMO_END')}" / Talk it over with someone / "${G('TC_FOMO_USING')}" [Help with an urge]`);
P(''); P(`**Attached to AI / instead of people:** "${G('TC_ATTACHED')}" What does it give you? `+G('TC_GIVES').join(' · ')+' / What might it be replacing? '+G('TC_REPLACING').join(' · ')+' / "Would one real-world connection help right now?" Text someone · Call someone · Be around people · Go somewhere · Take a tech break.');
P(''); P(`Set a boundary with your AI ("Paste this into your AI's custom instructions."): "${G('TC_BOUNDARY')}" [Copy boundary text] "${G('TC_BOUNDARY_NOTE')}"`);
P(''); P(`**My AI changed or is gone:** "${G('TC_LOSS')}" → "${G('TC_LOSS_GROUND')}" → optional "Write what you'd want to say" ("Optional. Only on this screen. Not saved."; safety-checked; afterwards: "You said it. It isn't kept anywhere.") → Tell one person: "${G('TC_LOSS_MSG')}"`);
P(''); P('Self-reflection at the end of options 1, 2 and 4: "Which feels closest right now?" / "Only you can say. Nothing is scored or saved." '+G('TC_REFLECT').map(x=>`"${x}"`).join(' · ')+' · Skip');

H(3,'Turn it into a song (6.16)');
P('The person picks a mood and writes three short lines; the phone turns them into a short song (Web Audio). No AI, no server, no recording, no in-browser speech recognition. Every line is safety-checked: RED goes to the crisis screen and no song is made. Saved only when the person taps Keep (max 50; each can be deleted; in Export; removed by Delete everything). Entry: the top card in Get out of my head, "Make a song while you wait" on Connect, and My songs in My Plan.');
P(''); P(`Intro: "${G('SONG_INTRO')}"`);
P(''); P('Moods: '+Object.values(G('SONG_MOODS')).map(m=>m.label).join(' · ')+'. Lines 1 and 2 are in a minor key; line 3 and any added lines move to the relative major; the anxious song slows from 96 to 66 bpm.');
list(G('SONG_PROMPTS').map(([q,sub,ph])=>`"${q}" / "${sub}" (example: "${ph}")`));
P(''); P(`Under each line: "${G('SONG_TYPE_HINT')}" Under Play: "${G('SONG_SILENT')}" Voice is off by default.`);
P(''); P(`After the song: "${G('SONG_MADE')}" [Keep it in My songs] [Share how you're doing with someone: "${G('SONG_SHARE_MSG')}"] [Done → "Did the intensity change?"] [Make another]`);
P(''); P('Replaying a kept song ends with "How does this feel now?"');
list(Object.values(G('SONG_REFLECT')).map(([l,m])=>`${l}: "${m}"`+(l==='Heavier'?' (Call 988 · Text 988 · Text someone you trust shown first)':'')));
P(''); P('Then: "Add something that\'s still true today" / "It becomes a new last line, so the song grows with you." [Add it and play] [Not now]');
P(''); P('My songs: "Saved only on this phone. Listen back and notice what\'s changed." Delete asks once: "Delete this song?"');

H(3,'After the ER or hospital: first 30 days (6.13)');
P('A mode the person turns on from Home ("Just out of the ER"); nothing prompts it. Saved on the phone because the person chose it (not safety state). Ends by itself after 30 days, or from Settings ("End the first 30 days mode") or Delete everything. Never shown on crisis screens. No counting, no streaks, no celebration; every item is optional.');
P(''); P('Setup: "When did you leave?" '+G('AFTER_LEFT').map(([,l])=>`"${l}"`).join(' · '));
P(''); P('Checklist: "Welcome home. One small thing at a time." / "All optional. Any order." Items: '+G('AFTER_ITEMS').map(([,l])=>`"${l}"`).join(' · '));
P(''); P(`Prepared text to one person: "${G('AFTER_HOME_MSG')}"`);
P(''); P(`Under the appointment: "${G('AFTER_NO_APPT')}" The calendar file has one event ("Follow-up appointment", 60 minutes) with a reminder the day before. Made on the phone; nothing is sent.`);
P(''); P(`Daily reminders: 14 calendar events, one a day from tomorrow at 10am, titled "${G('AFTER_DAILY_TITLE')}" with: "${G('AFTER_DAILY_TEXT')}"`);
P(''); P('Home bar while active (below "I don\'t feel safe"): "First 30 days · support is close" with Call 988 and the code word button when one is set. Also on the checklist: "Getting help is a strength, not a weakness."');
P(''); P(`At 30 days, once, on Home: "${G('AFTER_END_NOTE')}" [Okay]`);

H(3,'Zags: every line he can say (ZAGS_LINES)');
P('Scripted, not AI. Taps only. Says he is not a person in every session\'s first line. No relationship language, no pressure to stay, no memory between sessions, never the person\'s name. Every session ends at a person. RED stops Zags. At most two breathing rounds per session (4 breaths each: in 4 seconds, out 6; 3 breaths with reduced motion). Voice is off by default and uses the device\'s own speech only.');
list(Object.entries(G('ZAGS_LINES')).map(([k,v])=>`${code(k)}: "${v}"`));
P('**Voice (owner request, 2026-10-05: "a cute sweet voice")**: still off by default ("Voice off" button on the Zags screen only). When on, he reads these lines with the phone\'s own speech voice, higher and softer (pitch '+G('ZAGS_VOICE.pitch')+', rate '+G('ZAGS_VOICE.rate')+'), preferring a gentle voice that runs on the phone itself; never an online-only voice. Clinician: does a voice make Zags feel more like a companion (D5, D28)?');
P('');
P(`Under every Zags screen: "${G('ZAGS_NOTE')}"`);
const zShots=[['Hello','hello',''],['Breathing (in)','breathe','ui.zags.half="in"; ui.zags.breath=1;'],['Grounding step','steps',''],['How are you feeling now?','check',''],
  ['A bit better','better',''],['Still hard, first time','again','ui.zags.hard=1; ui.zags.rounds=1;'],['Still hard, second time','hard','ui.zags.hard=2; ui.zags.rounds=2;'],['Bye','bye','']];
for(const [label,phase,extra] of zShots){
  P(''); P(`_${label}_`); P('');
  md.push(...screenText(w, `${withPerson}; session.currentState="anxious"; session.currentInterventionId="zags"; ui.zags={phase:${JSON.stringify(phase)},step:0,rounds:0,hard:0,breath:0,half:null}; ${extra} session.screen="zags"`));
  w.eval('zagsStopBreathing()');
}
P('');
P('Worse → straight to the crisis screen (`openCrisis()`, RED).');

H(3,'On hold, not built: 6.7b Snuggle Zags, 6.7c Zags listens, 6.7d Safe place (need owner + clinician sign-off)');
P('Copy from STAGE6-SPEC.md for early review. These lines are not in the app yet.');
list([
  '6.7b ending: "Feeling a bit more settled? I\'m here if you need me, and so are your people." (Check against Zags rule 3: never "I\'m always here for you".)',
  '6.7b tip: "Hold me close"',
  '6.7c prompt: "I\'m listening. Go ahead."',
  '6.7c acknowledgment (example): "Thank you for getting that out. That sounds heavy to carry."',
  '6.7c: "I\'m not a person, but I\'m here while you get it out."',
  '6.7c choices: "I\'m not done — keep listening" · "Let it go" · "Keep it private" · "Help me calm down" · "I want a real person"',
  '6.7d on every step: "Stop — I want to come back" (→ 5-4-3-2-1 grounding). Trauma caution: guided imagery can bring up distressing memories.',
  '6.7d Part B: "This is a safe space. Nothing you type here leaves your phone." · "Call first" · "Directions"'
]);

H(2,'7. Every other screen');
P('Rendered for each state where the screen changes by state. Identical renders are listed once.');
const crisis=new Set(G('CRISIS_SCREENS').concat(['talk']));
const states=['anxious','spiraling','low','craving','distraction'];
const seenRenders=new Map();
for(const s of G('Object.keys(SCREENS)')){
  if(crisis.has(s)) continue;
  const variants=[];
  const ctx = st => `${withPerson}; session.screen=${JSON.stringify(s)}; session.currentState=${JSON.stringify(st)}; session.currentBeforeRating=7;
    ui.thoughts=[{text:"(your thought)",place:null}]; ui.cravingStart=Date.now(); ui.cravingEnd=Date.now()+900000; ui.nextStep="(your next step)";
    session.currentInterventionId=${JSON.stringify(st==='spiraling'?'thought_parking':st==='craving'?'craving_delay':st==='low'?'hydration':st==='distraction'?'distraction_game':'grounding')};
    ${s==='plan-edit'?'ui.editSection="trustedPeople";':''}
    ${s==='recommendation'?'runEngine();':''} ${s==='suggestion'?'ui.sugg="music";':''} ui.flash="";`;
  for(const st of states){
    let txt; try { txt=screenText(w, ctx(st)); } catch(e){ txt=[`- (could not render: ${e.message})`]; }
    const key=txt.join('\n');
    const v=variants.find(x=>x.key===key); if(v) v.states.push(st); else variants.push({key,txt,states:[st]});
  }
  H(3,code(s));
  if(variants.length===1) md.push(...variants[0].txt);
  else for(const v of variants){ P(''); P(`_When: ${v.states.join(', ')}_`); P(''); md.push(...v.txt); }
}
H(3,'Each intervention screen');
for(const i of G('INTERVENTION_LIBRARY')){
  H(4,i.name);
  md.push(...screenText(w, `${withPerson}; session.screen="intervention"; session.currentState=${JSON.stringify(i.states[0])}; session.currentInterventionId=${JSON.stringify(i.id)}`));
}
H(3,'Home, iPhone Safari (shows the add-to-home-screen tip)');
w.eval('prefs.homeTipDismissed=false; Object.defineProperty(navigator,"userAgent",{value:"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",configurable:true})');
md.push(...screenText(w, `ACTIONS.deleteAll(); session.screen="home"`).filter(l=>/home screen|Got it/.test(l)));

H(2,'8. Sample data (fictional, only when someone taps "Load sample data" in Settings)');
P('```json'); P(JSON.stringify(G('SAMPLE_PLAYBOOK'),null,2)); P('```');

const text=md.join('\n').replace(/\n{3,}/g,'\n\n').trim()+'\n';
if(require.main===module){ fs.writeFileSync(OUT,text); console.log(`Wrote REVIEW.md (${text.split('\n').length} lines)`); }
module.exports={ build:()=>text };
