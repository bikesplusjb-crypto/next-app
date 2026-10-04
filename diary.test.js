// Stage 6.21: A line for today. A line a day, ending on "still true"; only on this phone; safety-checked; no counts,
// streaks, charts or reminders; optional passcode lock (Web Crypto, on the phone); export / delete / saving off.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const {webcrypto}=require('crypto');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({storage, full=false}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true;
    try{ Object.defineProperty(w,'crypto',{value:webcrypto,configurable:true}); }catch(_){}
    w.TextEncoder=TextEncoder; w.TextDecoder=TextDecoder; w.addEventListener('error',e=>errs.push(e.message));
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
const r=[];
async function write(a,{feel=['heavy','tired'],text='Rough day at work.',still='I got through today.'}={}){
  a.G('ACTIONS.diaryWrite()'); for(const f of feel) a.click(act('diaryFeel',f)); a.click(act('diaryToWords'));
  a.fill('diaryText',text); a.click(act('diaryToTrue')); a.fill('diaryTrue',still); a.click(act('diaryKeep')); await tick(5); }
const stored=a=>JSON.parse(a.dump()['next.v1.diary']||'null');

(async()=>{
// ================= A. Writing an entry =================
{const a=boot(); a.G('ACTIONS.tab("plan")');
 r.push(['A: My Plan → "A line for today"', a.T().includes('A line for today') && a.has(act('diaryOpen'))]);
 a.click(act('diaryOpen')); r.push(['A: opens the diary', a.S()==='diary' && a.has(act('diaryWrite')) && a.has(act('diaryBack'))]);
 a.G('session.screen="phone-down"; lastRendered=null; render()');
 const acts=[...a.w.document.querySelectorAll('.actions [data-act]')]; const iPut=acts.findIndex(e=>e.dataset.act==='putDown'), iD=acts.findIndex(e=>e.dataset.act==='diaryWrite');
 r.push(['A: "Write a line about today?" on Put the phone down, below it, smaller (a link)', iPut>=0 && iD>iPut && acts[iD].textContent.trim()==='Write a line about today?' && acts[iD].classList.contains('link')]);
 a.click(act('diaryWrite')); r.push(['A1: "How was today?" with ten feeling words and Skip', a.S()==='diary-feel' && a.w.document.querySelectorAll(act('diaryFeel')).length===10 && a.has(act('diaryToWords','skip')) && a.T().includes('How was today?')]);
 a.click(act('diaryFeel','calm')); a.click(act('diaryFeel','okay')); a.click(act('diaryFeel','calm'));
 r.push(['A1: multi-select (tap again to clear)', JSON.stringify(a.G('ui.diaryDraft.feelings'))==='["okay"]' && a.has('[data-arg="okay"][aria-pressed="true"]')]);
 a.click(act('diaryToWords')); const ta=a.w.document.getElementById('diaryText');
 r.push(['A2: "A few words about it." textarea: 3 lines, maxlength 1000, placeholder', a.T().includes('A few words about it.') && ta.tagName==='TEXTAREA' && ta.getAttribute('rows')==='3' && ta.maxLength===1000 && ta.placeholder==='Just a line or two is enough.']);
 a.fill('diaryText','Quiet.'); a.click(act('diaryToTrue')); const inp=a.w.document.getElementById('diaryTrue');
 r.push(['A3: "One thing that\'s still true today", optional, 120 characters, three example chips', a.T().includes("One thing that's still true today") && inp.maxLength===120 && a.w.document.querySelectorAll(act('diaryTrueEx')).length===3]);
 a.click(act('diaryTrueEx','2')); r.push(['A3: a chip fills the field', inp.value==="I'm still here."]);
 const keep=a.w.document.querySelector('.actions [data-act]'); r.push(['A4: Keep (primary) / Don\'t keep', keep.dataset.act==='diaryKeep' && keep.classList.contains('btn-primary') && keep.textContent.trim()==='Keep' && a.has(act('diaryDontKeep'))]);
 a.click(act('diaryKeep')); await tick(5);
 const d=stored(a); const e=d && d.entries[0];
 r.push(['A4: kept with today\'s date attached', !!e && e.day===a.G('diaryDay()') && e.text==='Quiet.' && e.trueLine==="I'm still here." && JSON.stringify(e.feelings)==='["okay"]' && a.S()==='diary']);
 await write(a,{text:'Second line today.'});
 r.push(['A: writing again the same day adds a new entry (no overwriting)', stored(a).entries.length===2 && stored(a).entries.every(x=>x.day===a.G('diaryDay()')) && stored(a).entries.some(x=>x.text==='Quiet.')]);
 r.push(['A: the diary has its own storage key (not in the plan)', !a.dump()['next.v1.sensitive'] || !a.dump()['next.v1.sensitive'].includes('Second line today')]); }
{const a=boot(); a.G('ACTIONS.diaryWrite()'); a.click(act('diaryToWords','skip')); a.fill('diaryText','Something private'); a.click(act('diaryToTrue')); a.click(act('diaryDontKeep'));
 r.push(['A4: Don\'t keep deletes the draft', !a.dump()['next.v1.diary'] && a.G('ui.diaryDraft')===null && !a.w.document.body.innerHTML.includes('Something private')]);
 a.G('ACTIONS.diaryWrite()'); a.click(act('diaryToWords')); a.fill('diaryText','Draft words'); a.click(act('diaryToTrue')); a.G('ACTIONS.home()');
 r.push(['A: leaving the diary drops an unsaved draft', a.G('ui.diaryDraft')===null && !a.dump()['next.v1.diary']]); }
// RED / YELLOW
for(const [where,opts] of [['few words',{text:'Last year I wanted to kill myself'}],['still true',{still:'I want to kill myself'}]]){
 const a=boot(); await write(a,opts);
 r.push([`A: RED in ${where} → crisis, entry not saved`, a.S()==='crisis' && !a.dump()['next.v1.diary'] && a.G('diaryEntries().length')===0 && a.G('ui.diaryDraft')===null]); }
{const a=boot(); await write(a,{text:'I feel hopeless tonight'});
 r.push(['A: YELLOW → support bar on, entry saved normally', a.G('session.yellow')===true && stored(a).entries.length===1 && a.S()==='diary']); }
{const a=boot(); await write(a,{text:'One', still:''}); r.push(['A: words split across the two fields don\'t join into a phrase', a.G('safetyCheck("I want to")')==='GREEN']); }
// storage full
{const a=boot(); a.G('Storage.prototype._set=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==="next.v1.diary") throw new Error("QuotaExceededError"); return this._set(k,v); }');
 await write(a,{text:'Words I do not want to lose', still:'Still here'});
 r.push(['A: storage full → stays on screen with the message and the words', a.S()==='diary-true' && a.T().includes("This phone's storage is full, so this couldn't be saved. Your words are still here.") && a.T().includes('Words I do not want to lose') && a.w.document.getElementById('diaryTrue').value==='Still here']);
 r.push(['A: storage full → not counted as kept', a.G('diaryEntries().length')===0 && a.G('ui.diaryDraft')!==null]); }
// never suggested / not on crisis screens
{const a=boot();
 r.push(['A: not in INTERVENTION_LIBRARY (never suggested)', a.G('INTERVENTION_LIBRARY.every(i=>!/diary|journal/i.test(i.id))')]);
 let found=false; for(const s of ['crisis','crisis-full','crisis-no','safety-check','plan-now','home','calm','connect','dont-know','recommendation']){ a.G(`session.screen=${JSON.stringify(s)}; lastRendered=null; render()`); if(a.has(act('diaryWrite'))||a.has(act('diaryOpen'))) found=s; }
 r.push(['A: never on crisis screens, Home or the menus', found===false, found]);
 a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); a.G('ACTIONS.diaryWrite()'); r.push(['A: blocked while RED', a.S()==='crisis']); }

// ================= B. Looking back =================
const seed=(a,n)=>a.G(`store.diary={entries:Array.from({length:${n}},(_,i)=>{ const t=new Date(2026,9,4-Math.floor(i/2),12-i).getTime(); return {id:"e"+i,date:t,day:diaryDay(t),feelings:i%2?["tired"]:[],text:"Entry text "+i+(i===0?" "+"x".repeat(300):""),trueLine:i%3?"":"Still true "+i}; })}; saveDiary()`);
{const a=boot(); seed(a,4); a.G('ACTIONS.diaryOpen()'); a.click(act('diaryBack')); const t=a.T();
 const items=[...a.w.document.querySelectorAll('.diary-item')].map(e=>e.dataset.arg), heads=[...a.w.document.querySelectorAll('.diary-day')].map(h=>h.textContent);
 r.push(['B: list newest first, grouped by date', JSON.stringify(items)==='["e0","e1","e2","e3"]' && heads.length===2 && heads[0].includes('October 4, 2026') && heads[1].includes('October 3, 2026')]);
 r.push(['B: shows feeling words, the few words, and "still true" in the brand style', t.includes('tired') && t.includes('Entry text 1') && a.w.document.querySelector('.diary-item .diary-still').textContent==='Still true 0']);
 r.push(['B: long entries are shortened in the list', a.w.document.querySelector('[data-arg="e0"]').textContent.includes('…')]);
 r.push(['B: no "hard day" note under 7 entries', !t.includes("Every 'still true' here")]);
 a.click(act('diaryEntry','e0')); r.push(['B: tap to read in full', a.S()==='diary-entry' && a.T().includes('x'.repeat(300))]);
 a.click(act('diaryDel')); r.push(['B: Delete asks to confirm first', a.T().includes('Delete this entry?') && a.G('diaryEntries().length')===4]);
 a.click(act('diaryDelNo')); r.push(['B: "Keep" cancels', a.G('diaryEntries().length')===4 && !a.T().includes('Delete this entry?')]);
 a.click(act('diaryDel')); a.click(act('diaryDelYes')); await tick(5);
 r.push(['B: confirmed Delete removes it (and from storage)', a.G('diaryEntries().length')===3 && !stored(a).entries.some(e=>e.id==='e0') && a.S()==='diary-back' && a.T().includes('Entry deleted.')]); }
{const a=boot(); seed(a,7); a.G('ACTIONS.diaryBack()'); const t=a.T();
 r.push(['B: at 7+ entries, only the note at the top', t.includes("Every 'still true' here is something you noticed on a hard day.") && a.w.document.querySelector('.diary-note').compareDocumentPosition(a.w.document.querySelector('.diary-item'))&4]); }

for(const [n,ok,info] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||info===undefined?'':' ('+info+')'));
})();
