// Stage 6.27: Bullied, now or before. Entered only by the person; four paths; 988 on every screen; nothing saved unless
// the person chooses the diary (respecting its lock); resources hidden until verified; copy rules; YELLOW phrases;
// FOUNDER_NOTE only on About.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const {webcrypto}=require('crypto');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true, storage, html=HTML}={}){ const errs=[];
  const w=new JSDOM(html,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone;
    try{ Object.defineProperty(w,'crypto',{value:webcrypto,configurable:true}); }catch(_){}
    w.TextEncoder=TextEncoder; w.TextDecoder=TextDecoder; w.addEventListener('error',e=>errs.push(e.message));
    w.HTMLCanvasElement.prototype.getContext=function(){ return null; };
    if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
  const fill=(id,v)=>{ w.document.getElementById(id).value=v; };
  return {w,click,T,dump,fill,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const tick=(ms=0)=>new Promise(r=>setTimeout(r,ms));
async function until(f,ms=8000){ const t0=Date.now(); while(Date.now()-t0<ms){ if(f()) return true; await tick(10); } return false; }
const has988=a=>a.has('.bully-988 a[href="tel:988"]') && a.T().includes('Call or text 988 any time.');
const r=[];

(async()=>{
// ================= A. Entry =================
{const a=boot(); const chip=[...a.w.document.querySelectorAll('.sit')].find(x=>x.dataset.act==='bullyStart');
 r.push(['A: Home chip "Bullied — now or before"', !!chip && chip.textContent==='Bullied — now or before' && !!chip.closest('.sits')]);
 const btns=[...a.w.document.querySelectorAll('#app main [data-act]')];
 r.push(['A: "I don\'t feel safe" stays the first choice on Home', btns.find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
 chip.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
 r.push(['A: first screen wording', a.S()==='bully' && a.T().includes("Being bullied is not your fault. Whether it's happening now or happened a long time ago, it's real.") && a.T().includes('Which is closest?')]);
 const paths=[...a.w.document.querySelectorAll(act('bullyPath'))].map(b=>b.textContent.trim());
 r.push(['A: four choices in order', JSON.stringify(paths)===JSON.stringify(["It happened years ago, but it still gets to me","It's happening at work","It's happening online","Someone I love is being bullied"])]);
 r.push(['A: Help visible and the 988 line at the bottom', a.has('header .help-pill[data-act="crisis"]') && has988(a) && a.w.document.querySelector('#app main .content').lastElementChild.classList.contains('bully-988')]); }
{const a=boot({phone:false}); a.G('ACTIONS.bullyStart()'); r.push(['A: on a computer the 988 line offers chat', a.has('.bully-988 a[href*="988lifeline.org/chat"]')]); }
{const a=boot(); r.push(['A: never suggested (not in the engine)', a.G('INTERVENTION_LIBRARY.every(i=>!/bull/i.test(i.id) && !/^bully/.test(String(i.route||"")))')]);
 let on=''; for(const s of ['crisis','crisis-full','crisis-no','safety-check','calm','connect','dont-know','recommendation','distract','scene']){ a.G(`session.screen=${JSON.stringify(s)}; lastRendered=null; render()`); if(a.has(act('bullyStart'))) on=s; }
 r.push(['A: only on Home (not on crisis screens or the menus)', !on]);
 a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); a.G('ACTIONS.bullyStart()'); r.push(['A: blocked while RED', a.S()==='crisis']); }

// ================= B. It happened years ago =================
const PASS='quiet-harbor-7';
async function lockDiary(a){ a.G('ACTIONS.diaryOpen()'); a.click(act('diaryLockStart')); a.click(act('diaryLockOk')); a.fill('diaryPass1',PASS); a.fill('diaryPass2',PASS); a.click(act('diaryLockSet')); await until(()=>a.G('!!store.diaryLock') && !a.G('ui.diaryBusy')); a.G('ACTIONS.home()'); }
const toPast=a=>{ a.G('ACTIONS.bullyStart()'); a.click(act('bullyPath','past')); };
{const a=boot(); toPast(a);
 r.push(['B1: "What happened to you was real, and it wasn\'t your fault..."', a.S()==='bully-past' && a.T().includes("What happened to you was real, and it wasn't your fault. Bullying can leave marks long after it stops. Still feeling it doesn't mean you're weak.") && has988(a)]);
 a.click(act('bullyIdeas'));
 const seen=[a.w.document.getElementById('screen-title').textContent];
 r.push(['B2: one idea at a time, with "Another idea" and "I\'m done for now"', a.S()==='bully-idea' && a.has(act('bullyNext')) && a.has(act('bullyEnd')) && has988(a)]);
 a.click(act('bullyNext')); seen.push(a.w.document.getElementById('screen-title').textContent);
 a.click(act('bullyNext')); seen.push(a.w.document.getElementById('screen-title').textContent);
 r.push(['B2: Then and now · A note to your younger self · Ground', JSON.stringify(seen)==='["Then and now","A note to your younger self","Ground yourself"]']);
 r.push(['B2: Ground (existing) or Calm down with Zags (existing)', a.has(act('calmPick','ground')) && a.has(act('zags','calm'))]);
 a.click(act('bullyNext'));
 r.push(['B3: the end: "Old hurts like this are one of the things counselors help with most..."', a.S()==='bully-end' && a.T().includes("Old hurts like this are one of the things counselors help with most. It's never too late to talk about it.") && has988(a) && a.has(act('putDown')) && a.has(act('route','connect'))]); }
{const a=boot(); toPast(a); a.click(act('bullyIdeas')); a.click(act('bullyGo','bully-thennow'));
 const t=a.T();
 r.push(['Then and now: two groups of tap-only chips', a.w.document.querySelectorAll('[data-act="bullyChip"][data-arg^="then:"]').length===4 && a.w.document.querySelectorAll('[data-act="bullyChip"][data-arg^="now:"]').length===5 && t.includes('What was true then') && t.includes("What's true now") && t.includes("I couldn't get away") && t.includes("I'm still here")]);
 r.push(['Then and now: two columns on wider screens (stacked on phones)', a.has('.tn-grid .tn-col + .tn-col') && /@media \(min-width:600px\)\{\.tn-grid\{grid-template-columns:1fr 1fr\}\}/.test(HTML)]);
 a.fill('tn-then','Typed before tapping'); a.click(act('bullyChip','then:3')); a.click(act('bullyChip','now:0'));
 r.push(['Then and now: chips toggle, typed lines stay', a.has('[data-arg="then:3"][aria-pressed="true"]') && a.has('[data-arg="now:0"][aria-pressed="true"]') && a.w.document.getElementById('tn-then').value==='Typed before tapping']);
 const before=JSON.stringify(a.dump());
 a.fill('tn-now','I have friends now'); a.click(act('bullyThenDone'));
 r.push(['Then and now ends: "Then was then. You got through it."', a.S()==='bully-thennow-end' && a.T().includes('Then was then. You got through it.')]);
 r.push(['Then and now: nothing saved, nothing kept in memory', JSON.stringify(a.dump())===before && !JSON.stringify(a.G('ui.bully')).includes('friends now') && a.G('ui.bully.then.length')===0]); }
for(const [k,txt] of [['then','I want to kill myself'],['now','I want to die']]){
 const a=boot(); toPast(a); a.click(act('bullyIdeas')); a.click(act('bullyGo','bully-thennow')); const before=JSON.stringify(a.dump());
 a.fill('tn-'+k,txt); a.click(act('bullyThenDone'));
 r.push([`Then and now (${k} line) RED → crisis, nothing saved`, a.S()==='crisis' && JSON.stringify(a.dump())===before]); }
// note to your younger self
{const a=boot(); toPast(a); a.click(act('bullyIdeas')); a.click(act('bullyNext')); a.click(act('bullyGo','bully-younger'));
 r.push(['Younger self: "What would you tell them now?"', a.S()==='bully-younger' && a.T().includes('What would you tell them now?') && has988(a)]);
 const before=JSON.stringify(a.dump());
 a.fill('youngerBox','It was never your fault, kid.'); a.click(act('bullyYounger'));
 const first=a.w.document.querySelector('.actions [data-act]');
 r.push(['Younger self: Let it go is the default (first), Keep in my diary second', a.S()==='bully-younger-done' && first.dataset.act==='bullyLetGo' && first.classList.contains('btn-primary') && a.has(act('bullyKeepDiary','younger'))]);
 a.click(act('bullyLetGo'));
 r.push(['Younger self: Let it go stores nothing', JSON.stringify(a.dump())===before && a.G('ui.bully.note')===null && a.T().includes("Let go. It isn't kept anywhere.")]);
 a.G('ACTIONS.bullyGo("bully-younger")'); a.fill('youngerBox','You were brave.'); a.click(act('bullyYounger')); a.G('ACTIONS.home()');
 r.push(['Younger self: leaving without choosing keeps nothing', JSON.stringify(a.dump())===before && a.G('ui.bully.note')===null]);
 a.G('ACTIONS.bullyStart(); ACTIONS.bullyPath("past"); ACTIONS.bullyIdeas(); ACTIONS.bullyNext(); ACTIONS.bullyGo("bully-younger")');
 a.fill('youngerBox','You were brave.'); a.click(act('bullyYounger')); a.click(act('bullyKeepDiary','younger')); await tick(5);
 const d=JSON.parse(a.dump()['next.v1.diary']||'null');
 r.push(['Younger self: Keep in my diary saves one tagged entry', !!d && d.entries.length===1 && d.entries[0].text==='You were brave.' && d.entries[0].tag==='younger' && a.T().includes('Kept in your diary.')]);
 a.G('ACTIONS.diaryBack()'); r.push(['Looking back labels it "Note to my younger self"', a.T().includes('Note to my younger self') && a.T().includes('You were brave.')]); }
{const a=boot(); toPast(a); a.click(act('bullyIdeas')); a.click(act('bullyNext')); a.click(act('bullyGo','bully-younger')); const before=JSON.stringify(a.dump());
 a.fill('youngerBox','I still want to end my life'); a.click(act('bullyYounger'));
 r.push(['Younger self RED → crisis, nothing saved or kept', a.S()==='crisis' && JSON.stringify(a.dump())===before && !JSON.stringify(a.G('ui')).includes('end my life')]); }
{const a=boot(); await lockDiary(a); const lockedBefore=a.dump()['next.v1.diary'];
 toPast(a); a.click(act('bullyIdeas')); a.click(act('bullyNext')); a.click(act('bullyGo','bully-younger'));
 a.fill('youngerBox','Locked note text'); a.click(act('bullyYounger')); a.click(act('bullyKeepDiary','younger')); await tick(5);
 r.push(['Locked diary: asks for the passcode first, nothing written yet', a.S()==='bully-unlock' && a.dump()['next.v1.diary']===lockedBefore]);
 a.fill('bullyPass','wrong'); a.click(act('bullyUnlock')); await until(()=>!a.G('ui.diaryBusy'));
 r.push(['Locked diary: wrong passcode → "That\'s not it."', a.T().includes("That's not it.") && a.dump()['next.v1.diary']===lockedBefore]);
 a.fill('bullyPass',PASS); a.click(act('bullyUnlock')); await until(()=>a.S()==='bully-idea');
 const raw=a.dump()['next.v1.diary']||'';
 r.push(['Locked diary: kept encrypted (no plain text stored) and locked again', raw!==lockedBefore && !raw.includes('Locked note text') && a.G('diaryKey')===null && a.T().includes('Kept in your diary.')]);
 a.G('ACTIONS.diaryBack()'); a.fill('diaryPass',PASS); a.click(act('diaryUnlock')); await until(()=>a.G('!!diaryKey'));
 r.push(['Locked diary: the note is there after unlocking', a.T().includes('Locked note text') && a.T().includes('Note to my younger self')]); }

// ================= C. At work =================
const toWork=a=>{ a.G('ACTIONS.bullyStart()'); a.click(act('bullyPath','work')); };
{const a=boot(); toWork(a);
 r.push(['C1: "This is about their behavior, not your worth..."', a.S()==='bully-work' && a.T().includes("This is about their behavior, not your worth. A lot of people go through this at work, and it's not something you have to just take.") && has988(a)]);
 r.push(['C3: Workplace Bullying Institute hidden while unverified', !a.T().includes('Workplace Bullying Institute') && !a.has('.bully-res')]);
 a.click(act('bullyIdeas')); const seen=[a.w.document.getElementById('screen-title').textContent];
 a.click(act('bullyNext')); seen.push(a.w.document.getElementById('screen-title').textContent); r.push(['C2: talk: "a coworker, a friend outside work, or HR if it feels safe"', a.T().includes('A coworker, a friend outside work, or HR if it feels safe.')]);
 a.click(act('bullyNext')); seen.push(a.w.document.getElementById('screen-title').textContent);
 r.push(['C2: Write down what happened · Talk to someone you trust · Make it through today', JSON.stringify(seen)==='["Write down what happened","Talk to someone you trust","Make it through today"]']);
 r.push(['C2: Make it through today → Borrow ten minutes ("Make it smaller" only once 6.24 exists)', a.has(act('lowPick','borrow_ten')) && !a.has(act('smallerStart'))]); }
{const a=boot(); a.G('getPlan().trustedPeople=[{name:"Jordan",phone:"555-0142",relationship:"friend"}]'); toWork(a); a.click(act('bullyIdeas')); a.click(act('bullyNext')); a.click(act('bullyGo','bully-work-talk'));
 const h=decodeURIComponent(a.w.document.querySelector('a.sit').getAttribute('href'));
 r.push(['C2: prepared text opens Messages (the person sends it)', h==="sms:5550142?&body=Something's been going on at work and it's getting to me. Can we talk?"]);
 const c=boot({phone:false}); toWork(c); c.click(act('bullyIdeas')); c.click(act('bullyNext')); c.click(act('bullyGo','bully-work-talk'));
 r.push(['C2: on a computer, Copy instead of a text link', !c.has('a[href^="sms:"]') && c.has('[data-copy]')]); }
{const a=boot(); toWork(a); a.click(act('bullyIdeas')); a.click(act('bullyGo','bully-work-write'));
 r.push(['C2: the note: date (defaults to today), what happened, who saw it; explainer', a.w.document.getElementById('wkDate').value===a.G('diaryDay()') && !!a.w.document.getElementById('wkWhat') && !!a.w.document.getElementById('wkWho') && a.T().includes('Writing it down as it happens can help later, if you decide to report it.')]);
 const before=JSON.stringify(a.dump());
 a.fill('wkDate','2026-10-01'); a.fill('wkWhat','My manager yelled at me in front of the team.'); a.fill('wkWho','Sam, Lee'); a.click(act('bullyWorkDone'));
 r.push(['C2: then Save in my diary / Don\'t save, with the lock tip when the diary isn\'t locked', a.S()==='bully-work-done' && a.has(act('bullyKeepDiary','work')) && a.has(act('bullyDontSave')) && a.T().includes('Tip: lock your diary first if someone else might see your phone.')]);
 a.click(act('bullyDontSave'));
 r.push(['C2: Don\'t save stores nothing', JSON.stringify(a.dump())===before && a.G('ui.bully.work')===null && a.T().includes('Not saved.')]);
 a.G('ACTIONS.bullyGo("bully-work-write")'); a.fill('wkDate','2026-10-01'); a.fill('wkWhat','My manager yelled at me in front of the team.'); a.fill('wkWho','Sam, Lee'); a.click(act('bullyWorkDone'));
 a.click(act('bullyKeepDiary','work')); await tick(5);
 const d=JSON.parse(a.dump()['next.v1.diary']||'null'); const e=d && d.entries[0];
 r.push(['C2: Save in my diary: one entry tagged "Work notes" with the date, what happened and who saw it', !!e && e.tag==='work' && e.text==="Date: 2026-10-01\nWhat happened: My manager yelled at me in front of the team.\nWho saw it: Sam, Lee"]);
 a.G('ACTIONS.diaryBack()'); r.push(['Looking back labels it "Work notes"', a.T().includes('Work notes')]); }
for(const [id,txt] of [['wkWhat','They told me to go kill myself'],['wkWho','I want to die']]){
 const a=boot(); toWork(a); a.click(act('bullyIdeas')); a.click(act('bullyGo','bully-work-write')); const before=JSON.stringify(a.dump());
 a.fill(id,txt); a.click(act('bullyWorkDone'));
 r.push([`C2: RED in "${id==='wkWhat'?'what happened':'who saw it'}" → crisis, nothing saved`, a.S()==='crisis' && JSON.stringify(a.dump())===before && !JSON.stringify(a.G('ui')).includes(txt)]); }
{const a=boot(); await lockDiary(a); const lockedBefore=a.dump()['next.v1.diary'];
 toWork(a); a.click(act('bullyIdeas')); a.click(act('bullyGo','bully-work-write')); a.fill('wkWhat','Locked work note'); a.click(act('bullyWorkDone'));
 r.push(['C2: no lock tip once the diary is locked', !a.T().includes('Tip: lock your diary first')]);
 a.click(act('bullyKeepDiary','work')); await tick(5);
 r.push(['C2: locked diary: passcode first', a.S()==='bully-unlock' && a.dump()['next.v1.diary']===lockedBefore]);
 a.fill('bullyPass',PASS); a.click(act('bullyUnlock')); await until(()=>a.S()==='bully-idea');
 r.push(['C2: locked diary: saved encrypted, locked again', a.dump()['next.v1.diary']!==lockedBefore && !a.dump()['next.v1.diary'].includes('Locked work note') && a.G('diaryKey')===null]); }

// ================= D. Online =================
const toOnline=a=>{ a.G('ACTIONS.bullyStart()'); a.click(act('bullyPath','online')); };
{const a=boot(); toOnline(a); const t=a.T();
 r.push(['D1: "Being targeted online is real harm, even if it\'s \'just a screen.\'"', a.S()==='bully-online' && t.includes("Being targeted online is real harm, even if it's 'just a screen.'") && has988(a)]);
 r.push(['D3: threats, stalking, private images: report to police; danger → 911', t.includes('If there are threats, stalking, or private images shared without your consent') && t.includes("You can report threats to the police. If you're in danger right now, call 911.") && a.has('.bully-threats a[href="tel:911"]')]);
 r.push(['D3: Cyber Civil Rights Initiative hidden while unverified', !t.includes('Cyber Civil Rights')]);
 a.click(act('bullyIdeas')); const seen=[[a.w.document.getElementById('screen-title').textContent, a.T()]];
 for(let i=0;i<4;i++){ a.click(act('bullyNext')); seen.push([a.w.document.getElementById('screen-title').textContent, a.T()]); }
 r.push(['D2: five ideas in order', JSON.stringify(seen.map(x=>x[0]))==='["Don\'t reply","Take screenshots","Mute, block, and report","Tell one person","Step away for a bit"]']);
 r.push(['D2: their lines', seen[0][1].includes('Replying usually feeds it.') && seen[1][1].includes('Keep a record, even if you never use it.') && seen[2][1].includes("Every app has these. You're allowed to use them.")]);
 r.push(['D2: Step away → Change the scene', a.has(act('route','scene'))]);
 a.click(act('bullyNext')); r.push(['D: the end repeats the threats line and 911', a.S()==='bully-end' && a.has('.bully-threats a[href="tel:911"]') && has988(a)]); }
{const a=boot(); toOnline(a); a.click(act('bullyIdeas')); for(let i=0;i<3;i++) a.click(act('bullyNext')); a.click(act('bullyGo','bully-online-tell'));
 r.push(['D2: Tell one person: "Someone\'s been going after me online and I don\'t want to deal with it alone."', decodeURIComponent(a.w.document.querySelector('a.sit').getAttribute('href')).endsWith("Someone's been going after me online and I don't want to deal with it alone.")]); }
{const a=boot(); toOnline(a); r.push(['D: nothing helps look up, contact or expose anyone (no links out but 988/911)', [...a.w.document.querySelectorAll('#app main a[href]')].every(x=>/^(tel:(988|911)|sms:988)/.test(x.getAttribute('href')))]); }

// ================= E. Someone I love =================
{const a=boot(); a.G('ACTIONS.bullyStart()'); a.click(act('bullyPath','love'));
 r.push(['E1: "Thank you for taking it seriously. That matters more than anything."', a.S()==='bully-love' && a.T().includes('Thank you for taking it seriously. That matters more than anything.') && has988(a)]);
 a.click(act('bullyGo','bully-love-guide')); const items=[...a.w.document.querySelectorAll('.bully-guide li')].map(l=>l.textContent);
 r.push(['E2: the six guidance lines', JSON.stringify(items)===JSON.stringify(["Listen first. Let them tell it their way.","Believe them, and say it's not their fault.","Don't say \"just ignore it\" or \"stand up to them.\"","Ask what they want to happen before you act.","Keep checking in, not just once.","If they talk about not wanting to be alive, take it seriously and call or text 988 together."])]);
 r.push(['E3: StopBullying.gov hidden while unverified', !a.T().includes('StopBullying')]);
 const l=a.w.document.querySelector('a.worried-link'); r.push(['E4: link to the existing supporter guide', !!l && l.getAttribute('href')==='support/' && l.target==='_blank']);
 r.push(['E: 988 line', has988(a)]);
 a.click(act('bullyEnd')); r.push(['E: Done → the ending', a.S()==='bully-end']); }
// all resources: hidden while unverified, shown once verified
{const a=boot(); r.push(['every bullying resource starts verified:false', a.G('BULLY_RESOURCES.length')===3 && a.G('BULLY_RESOURCES.every(e=>e.verified===false)')]);
 let seen=''; for(const sc of ['bully','bully-past','bully-work','bully-online','bully-love','bully-love-guide','bully-end']){ a.G(`ui.bully={path:"online"}; session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/Workplace Bullying|Cyber Civil|StopBullying/.test(a.T())) seen=sc; }
 r.push(['no resource renders anywhere while unverified', !seen, seen]);
 a.G('BULLY_RESOURCES.forEach(e=>{ e.verified=true; e.url="https://example.org/"+e.key; })');
 a.G('ACTIONS.bullyStart(); ACTIONS.bullyPath("work")'); const w1=a.T().includes('Workplace Bullying Institute');
 a.G('ACTIONS.bullyStart(); ACTIONS.bullyPath("online")'); const w2=a.T().includes('Cyber Civil Rights Initiative helpline');
 a.G('ACTIONS.bullyStart(); ACTIONS.bullyPath("love"); ACTIONS.bullyGo("bully-love-guide")'); const w3=a.T().includes('StopBullying.gov');
 r.push(['once verified, each shows on its own path', w1 && w2 && w3]); }

//@@PARTS@@

for(const [n,ok,info] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||info===undefined?'':' ('+info+')'));
process.exit(0);   // the diary's re-lock timer would otherwise keep this process alive
})().catch(e=>{ console.log('FAIL crashed: '+e.message); process.exit(1); });
