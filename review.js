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
  `**RED** stops everything (flows, games, check-ins) and opens the crisis screen immediately. Nothing from that moment is saved.`,
  `**YELLOW** shows the support bar ("You don't have to handle this alone." · Call 988 · Talk to someone) on every non-crisis screen for the rest of the visit, and the suggestion engine offers connection, the person's own plan, grounding, or a change of space first.`,
  `**Automatic YELLOW:** tapping "I still feel bad" twice in a visit (a game answered "No" counts as one), or giving a 9 or 10 rating (before or after) twice in a visit.`,
  `**Tapping Help** (top right of every screen) or **"I don't feel safe"** → RED crisis screen. One tap, no confirmation.`,
  `**Crisis question:** "Are you in danger of hurting yourself or someone else right now?" Yes or I'm not sure → full crisis screen (RED). No → YELLOW, "What would help right now?" (talk to someone / open my plan / do something grounding), then "Do you feel safer than a few minutes ago?" Yes → Home (YELLOW). No or Not sure → full crisis screen (RED).`,
  `**Leaving RED** is only possible through "That's not what I meant — go back", No on the danger question, or Yes on "Do you feel safer". Each leads to YELLOW. Nothing ever returns to GREEN in the same visit.`,
  `**Calling or texting** from the "What would help" screen moves straight to "Do you feel safer" in the same tap, before the phone app opens.`,
  `**Human First** (this visit only, never saved): after 2 taps on "Something else", or 2 finished steps without "That helped" (a game answered "No" counts), ask once: "Would talking to a person help more than another answer?" Call someone · Text someone · Be around people (→ Change the scene, Somewhere to go) · Not right now. Never shown over a crisis screen.`,
  `**Warm line** (Connect): ${G('WARMLINE.name')}, ${code(G('WARMLINE.tel'))}. "${G('WARMLINE.hours')} ${G('WARMLINE.about')}" Hours are display text only; the button is never disabled by the clock. "${G('WARMLINE.elsewhere')}" → ${code(G('WARMLINE.elsewhereUrl'))}.`,
  `**First launch:** onboarding never blocks the crisis screens. Leaving a crisis screen during onboarding returns to onboarding at YELLOW.`,
  `**Outside the US** (guessed from the phone's time zone, then language; can be set in Settings): adds "Find a helpline in your country" (findahelpline.com) under 988. 911 and 988 are never hidden.`,
]);

H(2,'2. Safety phrase lists');
H(3,`RED phrases (${G('RED_PHRASES.length')}) → crisis screen`);
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
list([...w.document.querySelectorAll('.sits .sit')].map(b=>`"${b.textContent}" → ${code(b.dataset.act+':'+b.dataset.arg)}`));
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
    sec.querySelectorAll('p').forEach(x=>P(`- ${x.textContent.replace(/\s+/g,' ').trim()}`));
    sec.querySelectorAll('a[href]').forEach(x=>P(`- **Link → \`${x.getAttribute('href')}\`:** ${x.textContent.trim()}`));
  }
  P(''); P(`Footer: "${g.querySelector('footer').textContent.trim()}"`); }

H(3,'Zags: every line he can say (ZAGS_LINES)');
P('Scripted, not AI. Taps only. Says he is not a person in every session\'s first line. No relationship language, no pressure to stay, no memory between sessions, never the person\'s name. Every session ends at a person. RED stops Zags. At most two breathing rounds per session (4 breaths each: in 4 seconds, out 6; 3 breaths with reduced motion). Voice is off by default and uses the device\'s own speech only.');
list(Object.entries(G('ZAGS_LINES')).map(([k,v])=>`${code(k)}: "${v}"`));
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
