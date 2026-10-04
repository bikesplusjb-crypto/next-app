// Stage 6.20: When you've lost someone. Entered only by the person; never suggested; free text safety-checked;
// nothing saved unless Keep; copy rules; Faith & hope only when on; resources hidden until verified; grief YELLOW phrases.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true, storage}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone;
    w.TextEncoder=TextEncoder; w.addEventListener('error',e=>errs.push(e.message));
    if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.__ics=[]; w.URL.createObjectURL=b=>{ w.__ics.push(b); return 'blob:x'; }; w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){};   // the calendar download link (no navigation in jsdom)
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return JSON.stringify(o);};
  return {w,click,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const toHelp=(a,who='person',when='recent')=>{ a.click(act('griefStart')); a.click(act('griefWho',who)); a.click(act('griefWhen',when)); a.click(act('griefAckNext')); };

// ---- A. entry ----
{const a=boot();
 const btns=[...a.w.document.querySelectorAll('#app main [data-act]')];
 const iCrisis=btns.findIndex(b=>b.dataset.act==='crisis'), iLost=btns.findIndex(b=>b.dataset.act==='griefStart');
 r.push(['A1: Home chip "I lost someone" in "Or tell me what\'s happening"', iLost>0 && btns[iLost].textContent.trim()==='I lost someone' && !!btns[iLost].closest('.sits')]);
 r.push(['A1: the chip comes after "I don\'t feel safe"', iCrisis>=0 && iCrisis<iLost]);
 a.click(act('griefStart')); r.push(['A1: the chip opens "Who did you lose?"', a.S()==='grief-who' && a.T().includes('Who did you lose?')]);
 r.push(['Help is on the grief screens', a.has('header .help-pill[data-act="crisis"]')]); }
{const a=boot(); a.G('ui.tcStep=3; session.screen="tc-loss"; lastRendered=null; render()');
 const link=a.w.document.querySelector(act('griefStart'));
 r.push(['A2: Tech check "My AI changed or is gone" ends with "Lost a person or a pet? →"', !!link && link.textContent.trim()==='Lost a person or a pet? →']);
 a.click(act('griefStart')); r.push(['A2: the link opens the grief path', a.S()==='grief-who']); }

// ---- never suggested ----
{const a=boot();
 r.push(['not in INTERVENTION_LIBRARY (the engine can\'t pick it)', a.G('INTERVENTION_LIBRARY.every(i=>!/grief/i.test(i.id) && !/^grief/.test(String(i.route||"")))')]);
 const states=['anxious','spiraling','low','craving','distraction','alone'];
 let seen=false;
 for(const st of states){ for(let k=0;k<6;k++){ a.G(`dispatch({type:"SET_CURRENT_STATE",state:${JSON.stringify(st)}}); ui.exclude=[]; runEngine(); session.screen="recommendation"; lastRendered=null; render()`);
   if(a.has(act('griefStart')) || /grief-/.test(a.G('String(ui.engine&&ui.engine.interventionId)'))) seen=true; a.G('ACTIONS.recElse && 0'); } }
 r.push(['the engine\'s recommendations never offer the grief path', !seen]);
 for(const s of ['dont-know','calm','connect','scene','distract']){ a.G(`session.screen=${JSON.stringify(s)}; lastRendered=null; render()`); if(a.has(act('griefStart'))) seen=true; }
 r.push(['not offered on I don\'t know what I need or the main menus', !seen]); }

// ---- B3. acknowledgment ----
{const G0=boot().G('GRIEF');
 for(const who of ['person','pet','else']) for(const when of ['recent','while','hard']){
   const a=boot(); a.click(act('griefStart')); a.click(act('griefWho',who)); a.click(act('griefWhen',when)); const t=a.T();
   r.push([`B3 ${who}/${when}: right acknowledgment + suicide-loss line${when==='hard'?' + hard-day line':''}`, a.S()==='grief-ack' && t.includes(G0.ack[who]) && t.includes("If you lost someone to suicide, you're not alone. You can call or text 988 to talk about it, any time.")
     && (when==='hard') === t.includes('Hard days can bring it all back. That makes sense.') && a.w.document.querySelectorAll('.actions [data-act]').length===1]); }
 r.push(['B3: exact wording (person, pet, something else)', G0.ack.person==="I'm sorry. Grief can feel like a lot of things at once: heavy, numb, angry, foggy. There's no right way to do this."
   && G0.ack.pet==="Losing a pet is losing family. This grief is real, even if not everyone understands it." && G0.ack.else==="Losing something that mattered is real grief too."]); }

// ---- B6. Faith & hope ----
{const a=boot(); toHelp(a);
 r.push(['B6: Faith off → straight to "What would help right now?", no passage', a.S()==='grief-help' && !/LORD|nigh|Psalm/.test(a.T())]);
 const b=boot(); b.G('prefs.strength="bible"'); b.click(act('griefStart')); b.click(act('griefWho','person')); b.click(act('griefWhen','recent')); b.click(act('griefAckNext'));
 r.push(['B6: Faith on → Psalm 34:18 (KJV)', b.S()==='grief-faith' && b.T().includes('The LORD is nigh unto them that are of a broken heart.') && b.T().includes('Psalm 34:18')]);
 b.click(act('griefBack')); r.push(['B6: then the normal choices', b.S()==='grief-help']);
 const c=boot(); c.G('session.screen="grief-faith"; lastRendered=null; render()'); r.push(['B6: the passage screen can\'t show with Faith off', !/LORD/.test(c.T())]); }

// ---- copy rules ----
{const a=boot();
 const copy=JSON.stringify([a.G('GRIEF'), a.G('griefMsgs("Sam")'), a.G('griefMsgs("")'), a.G('GRIEF_MISSION'), a.G('GRIEF_RESOURCES')]).replace(a.G('JSON.stringify(GRIEF.faith).slice(1,-1)'),'');
 const BANNED=/better place|happens for a reason|at least|just a pet|over it|should be over|move on|stages? of grief|five stages|closure|by now|it was (their|his|her) time|how (they|he|she) died|cause of death|your fault|could have|should have|put (him|her|them) down|euthan/i;
 r.push(['copy rules: no banned phrases in any grief string', !BANNED.test(copy)]);
 const RELIGIOUS=/\b(god|lord|heaven|pray|prayer|bless|blessed|angel|rainbow bridge|church|amen|soul)\b/i;
 r.push(['copy rules: no religious language outside the Faith & hope passage', !RELIGIOUS.test(copy)]);
 r.push(['copy rules: no timelines (days, weeks, months, years)', !/\b(\d+ )?(days?|weeks?|months?) (later|after|from now)|\bget over\b/i.test(copy)]); }

// ---- B4. choices + 988 always ----
{const a=boot(); toHelp(a); const t=a.T();
 r.push(['B4: "What would help right now?" with all five choices', ['breathe','find','write','tell','date'].every(k=>a.has(act('griefPick',k))) && t.includes('What would help right now?')]);
 r.push(['B4: 988 Call and Text always shown', a.has('#app main a[href="tel:988"]') && a.has('#app main a[href^="sms:988"]')]);
 r.push(['D: no "Grief support near you" card while nothing is verified', !t.includes('Grief support near you') && a.G('griefResources().length')===0]); }

// ---- write: Delete default, Keep, RED, YELLOW ----
{const a=boot(); toHelp(a); const before=a.dump();
 a.click(act('griefPick','write')); a.w.document.getElementById('griefBox').value='Dear Sam, I wish I had one more day.'; a.click(act('griefWrite'));
 const first=a.w.document.querySelector('.actions [data-act]');
 r.push(['write: then Delete (primary, first) or Keep', a.S()==='grief-write-done' && first && first.dataset.act==='griefNoteDelete' && first.classList.contains('btn-primary') && a.has(act('griefNoteKeep'))]);
 r.push(['write: nothing saved before a choice', a.dump()===before]);
 a.click(act('griefNoteDelete'));
 r.push(['write: Delete keeps nothing, anywhere', a.dump()===before && a.G('ui.griefNote')===null && !a.w.document.getElementById('app').innerHTML.includes('one more day') && a.T().includes("Deleted. It isn't kept anywhere.")]);
 a.click(act('griefPick','write')); a.w.document.getElementById('griefBox').value='Dear Sam, I wish I had one more day.'; a.click(act('griefWrite'));
 a.G('ACTIONS.home()');
 r.push(['write: leaving without choosing deletes it', a.G('ui.griefNote')===null && a.dump()===before]);
 a.click(act('griefStart')); a.click(act('griefWho','pet')); a.click(act('griefWhen','while')); a.click(act('griefAckNext'));
 a.click(act('griefPick','write')); a.w.document.getElementById('griefBox').value='Good boy, Max.'; a.click(act('griefWrite')); a.click(act('griefNoteKeep'));
 const kept=JSON.parse(a.w.localStorage.getItem('next.v1.noticed')||'[]');
 r.push(['write: Keep saves to Things I noticed as a "Remembering" note', kept.length===1 && kept[0].mission==='remembering' && kept[0].text==='Good boy, Max.' && !kept[0].img && a.T().includes('Kept in Things I noticed.')]);
 r.push(['write: who/when are never saved', !/"(who|when)"|"pet"|"while"/.test(a.dump())]);
 a.G('ACTIONS.noticedOpen()'); r.push(['Things I noticed shows it labeled "Remembering"', a.T().includes('Remembering') && a.T().includes('Good boy, Max.')]);
 r.push(['export includes the note text', JSON.stringify(a.G('buildExport()')).includes('Good boy, Max.')]);
 const b=boot({storage:{'next.v1.noticed':a.w.localStorage.getItem('next.v1.noticed')}});
 r.push(['a kept note survives reload (validNoticed accepts it)', b.G('noticed().length')===1 && b.G('noticed()[0].text')==='Good boy, Max.']); }
{const a=boot(); toHelp(a); const before=a.dump();
 a.click(act('griefPick','write')); a.w.document.getElementById('griefBox').value='I want to kill myself so I can see her'; a.click(act('griefWrite'));
 r.push(['write RED → crisis, nothing saved, nothing kept in memory', a.S()==='crisis' && a.dump()===before && a.G('ui.griefNote')===null && a.G('ui.grief')===null && !JSON.stringify(a.G('ui')).includes('see her')]);
 a.G('ACTIONS.griefStart()'); r.push(['while RED the path can\'t open', a.S().startsWith('crisis')]); }
{const a=boot(); toHelp(a);
 a.click(act('griefPick','write')); a.w.document.getElementById('griefBox').value='Some days I just want to be with her again'; a.click(act('griefWrite'));
 r.push(['write YELLOW → support bar on, continues to Delete/Keep', a.G('session.yellow')===true && a.S()==='grief-write-done']); }

// ---- tell one person ----
{const a=boot(); a.G('getPlan().trustedPeople=[{name:"Jordan",phone:"555-0142",relationship:"friend"}]'); toHelp(a);
 a.click(act('griefPick','tell')); a.w.document.getElementById('griefName').value='Sam'; a.click(act('griefTellNext'));
 const hrefs=[...a.w.document.querySelectorAll('a.sit')].map(x=>decodeURIComponent(x.getAttribute('href')));
 r.push(['tell: three prepared texts with the name, to the first trusted person', hrefs.length===3 && hrefs.every(h=>h.startsWith('sms:5550142?&body='))
   && hrefs[0].endsWith("I lost Sam and I'm having a really hard time. Can you call me?") && hrefs[1].endsWith("Today's a hard day. I'm thinking about Sam.")
   && hrefs[2].endsWith("I don't need you to say anything. I just didn't want to be alone with this.")]);
 r.push(['tell: the name is never saved', !a.dump().includes('Sam')]);
 a.click(act('griefBack')); a.click(act('griefPick','tell')); a.click(act('griefTellNext'));
 const t=a.T(); r.push(['tell: no name → "someone" / "them"', t.includes("I lost someone and I'm having a really hard time. Can you call me?") && t.includes("Today's a hard day. I'm thinking about them.")]); }
{const a=boot({phone:false}); toHelp(a); a.click(act('griefPick','tell')); a.click(act('griefTellNext'));
 r.push(['tell (computer): Copy buttons, no sms: links', !a.has('a[href^="sms:"]') && a.w.document.querySelectorAll('[data-copy]').length===3]); }
{const a=boot(); toHelp(a); a.click(act('griefPick','tell')); a.w.document.getElementById('griefName').value='I want to die'; a.click(act('griefTellNext'));
 r.push(['tell: name field RED → crisis, name dropped', a.S()==='crisis' && a.G('ui.grief')===null]); }

// ---- hard date ----
{const a=boot(); toHelp(a); const before=a.dump();
 a.click(act('griefPick','date')); a.click(act('griefDateAdd'));
 r.push(['date: no date → "Pick a date first."', a.S()==='grief-date' && a.T().includes('Pick a date first.')]);
 a.w.document.getElementById('griefDate').value='2020-03-04'; a.click(act('griefDateAdd'));
 const ics=a.G('icsBuild(griefDateEvents("2020-03-04"))');
 r.push(['date: calendar file "Be gentle with yourself today." once a year', a.w.__ics.length===1 && /SUMMARY:Be gentle with yourself today\./.test(ics) && /RRULE:FREQ=YEARLY/.test(ics) && /DTSTART:\d{4}0304T090000/.test(ics)]);
 r.push(['date: nothing stored in the app', a.dump()===before && a.S()==='grief-help']);
 const ev=a.G('griefDateEvents("2020-03-04", new Date(2026,9,4).getTime())[0].start.getFullYear()');
 r.push(['date: starts at the next occurrence', ev===2027]); }

// ---- find something that reminds you of them ----
{const a=boot(); toHelp(a); a.click(act('griefPick','find')); const t=a.T();
 r.push(['find: the Remembering mission, camera optional', a.S()==='fs' && t.includes('Find something that reminds you of them — their spot, a photo, something they loved.') && a.has(act('fsNoCam')) && a.has('#fsCam')]);
 r.push(['find: no "Try another" and no "Let\'s Zig" lead in the grief version', !a.has(act('fsAnother')) && !t.includes("Let's Zig")]);
 r.push(['find: Keep would save with mission "remembering"', a.G('fsMission().id')==='remembering']);
 a.click(act('fsNoCam')); a.click(act('griefBack')); r.push(['find: Back returns to the choices and ends the Remembering mode', a.S()==='grief-help' && a.G('ui.fsGrief')===false]);
 a.G('ACTIONS.fsStart()'); r.push(['ordinary Find something is unchanged afterwards', a.G('fsMission().id')!=='remembering']); }

// ---- breathe (Zags) and back ----
{const a=boot(); toHelp(a); a.click(act('griefPick','breathe'));
 r.push(['breathe: opens Calm down with Zags', a.S()==='zags']);
 a.click(act('zagsBye')); r.push(['breathe: Zags\' last screen offers a way back', a.has(act('griefBack'))]);
 a.click(act('griefBack')); r.push(['breathe: back to "What would help right now?"', a.S()==='grief-help']);
 a.G('ACTIONS.zags("calm")'); a.click(act('zagsBye')); r.push(['Zags opened from Calm later has no grief Back link', !a.has(act('griefBack'))]); }

// ---- ending ----
{const a=boot(); toHelp(a); a.click(act('griefEnd')); const t=a.T();
 r.push(['B5: ending wording + three choices', t.includes("Grief comes and goes. You don't have to carry it all today.") && a.has(act('putDown')) && a.has(act('griefElse')) && a.has(act('route','connect'))]);
 a.click(act('griefElse')); r.push(['B5: Something else → the existing engine (Let\'s Zig)', ['recommendation','human-first'].includes(a.S()) && a.G('session.currentState')==='low']); }

// ---- D. resources ----
{const a=boot(); r.push(['D: every grief resource starts verified:false', a.G('GRIEF_RESOURCES.length')===3 && a.G('GRIEF_RESOURCES.every(e=>e.verified===false)')]);
 a.G('GRIEF_RESOURCES[0].verified=true; GRIEF_RESOURCES[0].phone="5550100"; GRIEF_RESOURCES[2].verified=true; GRIEF_RESOURCES[2].url="https://example.org"'); toHelp(a);
 r.push(['D: once verified, "Grief support near you" shows (988 still shown)', a.T().includes('Grief support near you') && a.T().includes('Hospice bereavement program') && a.has('#app main a[href="tel:988"]')]);
 r.push(['D: GriefShare only when Faith & hope is on', !a.T().includes('GriefShare')]);
 a.G('prefs.strength="bible"; lastRendered=null; render()'); r.push(['D: GriefShare shows with Faith & hope on', a.T().includes('GriefShare')]);
 a.G('GRIEF_RESOURCES[1].verified=true'); r.push(['D: a verified entry with no phone or website still never renders', !a.T().includes('Pet loss support line')]); }

// ---- C. safety phrases ----
{const a=boot(); const sc=t=>a.G(`safetyCheck(${JSON.stringify(t)})`);
 const Y=["want to be with him again","want to be with her again","want to be with them again","want to join him","want to join her","want to join them"];
 r.push(['C: the six grief phrases return YELLOW', Y.every(p=>sc('I '+p)==='YELLOW') && Y.every(p=>a.G('YELLOW_PHRASES').includes(p))]);
 r.push(['C: RED list unchanged (43) and still RED', a.G('RED_PHRASES.length')===43 && sc('I want to die')==='RED' && sc('kill myself')==='RED' && sc('I just want to be with her again and kill myself')==='RED']);
 r.push(['C: ordinary grief stays GREEN', sc('I miss her so much')==='GREEN' && sc('I lost my dog today')==='GREEN']); }

// ---- nothing saved walking the path without Keep ----
{const a=boot(); a.G('saveStore()'); const before=a.dump();
 toHelp(a,'pet','hard'); a.click(act('griefPick','tell')); a.w.document.getElementById('griefName').value='Max'; a.click(act('griefTellNext')); a.click(act('griefBack')); a.click(act('griefEnd'));
 r.push(['walking the path without Keep saves nothing', a.dump()===before]);
 r.push(['no script errors', a.errs.length===0]); }

for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
