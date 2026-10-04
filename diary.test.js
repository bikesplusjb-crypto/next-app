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

// ================= C. Passcode lock =================
const PASS='blue-heron-42';
async function lockIt(a,pass=PASS){ a.G('ACTIONS.diaryOpen()'); a.click(act('diaryLockStart')); a.click(act('diaryLockOk'));
  a.fill('diaryPass1',pass); a.fill('diaryPass2',pass); a.click(act('diaryLockSet')); return until(()=>a.S()==='diary' && a.G('!!store.diaryLock') && !a.G('ui.diaryBusy')); }
{const a=boot(); a.G('ACTIONS.diaryOpen()');
 r.push(['C: off by default; "Lock with a passcode" in the diary', a.G('store.diaryLock')===null && a.has(act('diaryLockStart')) && a.T().includes('Lock with a passcode')]);
 a.click(act('diaryLockStart'));
 r.push(['C1: warning first: "If you forget this passcode, your entries can\'t be recovered." [I understand] [Not now]', a.S()==='diary-lock-warn' && a.T().includes("If you forget this passcode, your entries can't be recovered.") && a.T().includes("Not by you, not by anyone. ZigZag Mind doesn't store it anywhere.") && a.has(act('diaryLockOk')) && a.T().includes('Not now')]);
 a.G('session.screen="diary-lock-set"; lastRendered=null; render()'); r.push(['C1: can\'t skip the warning', a.T().includes("If you forget this passcode") && !a.w.document.getElementById('diaryPass1')]);
 a.click(act('diaryLockOk')); a.fill('diaryPass1','abc'); a.fill('diaryPass2','abc'); a.click(act('diaryLockSet'));
 r.push(['C2: at least 4 characters', a.T().includes('At least 4 characters.') && a.G('store.diaryLock')===null]);
 a.fill('diaryPass1','abcd'); a.fill('diaryPass2','abce'); a.click(act('diaryLockSet'));
 r.push(['C2: entered twice to confirm', a.T().includes("Those don't match.") && a.G('store.diaryLock')===null]); }
{const a=boot(); await write(a,{text:'My secret words tonight', still:'Still here, still me'}); await write(a,{text:'Another private line', still:''});
 const ok=await lockIt(a);
 const raw=a.dump()['next.v1.diary']||''; const d=JSON.parse(raw||'{}');
 r.push(['C3: locking works', ok && a.T().includes('Your diary is locked.')]);
 r.push(['C3: stored = salt, encrypted check value, IV, ciphertext only', JSON.stringify(Object.keys(d).sort())==='["ct","iv","lock","v"]' && JSON.stringify(Object.keys(d.lock).sort())==='["check","salt"]' && atob(d.lock.salt).length===16 && atob(d.iv).length===12]);
 const all=JSON.stringify(a.dump());
 r.push(['C3: storage never holds the passcode or any entry text in plain form', !all.includes(PASS) && !all.includes('secret words') && !all.includes('Still here, still me') && !all.includes('Another private line') && !all.includes('"entries"')]);
 r.push(['C3: PBKDF2 SHA-256 ≥ 310,000 iterations, AES-GCM 256 (in the code)', a.G('DIARY_ITER')>=310000 && /name:"PBKDF2", salt, iterations:DIARY_ITER, hash:"SHA-256"/.test(HTML) && /name:"AES-GCM", length:256/.test(HTML) && /getRandomValues\(new Uint8Array\(16\)\)/.test(HTML) && /getRandomValues\(new Uint8Array\(12\)\)/.test(HTML)]);
 const iv1=d.iv; await write(a,{text:'Third line'}); const d2=JSON.parse(a.dump()['next.v1.diary']);
 r.push(['C3: a fresh IV on every save, still encrypted', d2.iv!==iv1 && d2.lock.salt===d.lock.salt && !a.dump()['next.v1.diary'].includes('Third line')]);
 r.push(['C3: the key is not extractable and lives in memory only', a.G('diaryKey && diaryKey.extractable===false') && !all.includes('"key"')]);
 // leaving re-locks
 a.G('ACTIONS.home()'); r.push(['C5: leaving the diary re-locks it (entries leave memory)', a.G('diaryKey')===null && a.G('store.diary')===null]);
 a.G('ACTIONS.diaryOpen()'); r.push(['C4: while locked, only a passcode field', a.S()==='diary' && !!a.w.document.getElementById('diaryPass') && a.w.document.getElementById('diaryPass').type==='password' && !a.T().includes('Looking back') && a.has(act('diaryForgot'))]);
 a.G('ACTIONS.diaryBack()'); r.push(['C4: Looking back is locked too', !!a.w.document.getElementById('diaryPass') && !a.T().includes('secret words')]);
 a.fill('diaryPass','wrong-pass'); a.click(act('diaryUnlock')); await until(()=>!a.G('ui.diaryBusy'));
 r.push(['C4: wrong passcode → "That\'s not it."', a.T().includes("That's not it.") && a.G('diaryKey')===null]);
 a.fill('diaryPass','wrong-again'); a.click(act('diaryUnlock')); await until(()=>!a.G('ui.diaryBusy'));
 a.fill('diaryPass',PASS); a.click(act('diaryUnlock')); await until(()=>!a.G('ui.diaryBusy') && a.G('!!diaryKey'));
 r.push(['C4: right passcode unlocks (no lockout after wrong tries), back to the same screen', a.S()==='diary-back' && a.T().includes('My secret words tonight') && a.T().includes('Third line')]);
 // visibilitychange
 Object.defineProperty(a.w.document,'hidden',{value:true,configurable:true}); a.w.document.dispatchEvent(new a.w.Event('visibilitychange'));
 r.push(['C5: re-locks when the page is hidden', a.G('diaryKey')===null && !!a.w.document.getElementById('diaryPass') && !a.T().includes('My secret words')]);
 Object.defineProperty(a.w.document,'hidden',{value:false,configurable:true});
 a.fill('diaryPass',PASS); a.click(act('diaryUnlock')); await until(()=>a.G('!!diaryKey'));
 r.push(['C5: re-locks after 5 minutes (timer set)', a.G('DIARY_RELOCK_MS')===300000 && a.G('diaryRelockTimer')!==null]);
 a.G('diaryRelock(true)'); r.push(['C5: when the timer fires, it locks', a.G('diaryKey')===null]);
 // a half-written line survives a re-lock
 a.fill('diaryPass',PASS); a.click(act('diaryUnlock')); await until(()=>a.G('!!diaryKey'));
 a.G('ACTIONS.diaryWrite()'); a.click(act('diaryToWords')); a.fill('diaryText','Half a thought');
 Object.defineProperty(a.w.document,'hidden',{value:true,configurable:true}); a.w.document.dispatchEvent(new a.w.Event('visibilitychange')); Object.defineProperty(a.w.document,'hidden',{value:false,configurable:true});
 a.fill('diaryPass',PASS); a.click(act('diaryUnlock')); await until(()=>a.G('!!diaryKey'));
 r.push(['C5: a half-written line is still there after unlocking', a.S()==='diary-words' && a.w.document.getElementById('diaryText').value==='Half a thought']);
 // reload: still locked
 const b=boot({storage:a.dump()}); b.G('ACTIONS.diaryOpen()');
 r.push(['C: after a reload the diary is locked', b.G('diaryLockedNow()') && !!b.w.document.getElementById('diaryPass')]);
 b.fill('diaryPass',PASS); b.click(act('diaryUnlock')); await until(()=>b.G('!!diaryKey'));
 r.push(['C: and opens with the passcode', b.G('diaryEntries().length')===3]);
 // turn off
 b.click(act('diaryLockOff')); b.fill('diaryPassOff','nope'); b.click(act('diaryLockOffGo')); await until(()=>!b.G('ui.diaryBusy'));
 r.push(['C7: turning the lock off needs the passcode', b.T().includes("That's not it.") && !!b.G('store.diaryLock')]);
 b.fill('diaryPassOff',PASS); b.click(act('diaryLockOffGo')); await until(()=>b.G('store.diaryLock')===null);
 const plain=JSON.parse(b.dump()['next.v1.diary']);
 r.push(['C7: then decrypts and saves as normal', plain.entries.length===3 && !plain.lock && b.T().includes('The lock is off.')]); }
// forgot
{const a=boot(); a.G('ACTIONS.tab("plan")'); a.G('getPlan().anchor="My dog"; saveStore()'); await write(a,{text:'Forgettable'}); await lockIt(a); a.G('diaryRelock(true)');
 a.G('store.noticed=[{id:"1",date:1,mission:"remembering",text:"note"}]; saveNoticed()');
 a.click(act('diaryForgot'));
 r.push(['C6: "Forgot my passcode" explains it can\'t be recovered', a.S()==='diary-forgot' && a.T().includes("Your passcode can't be recovered.") && a.has(act('diaryForgotAsk')) && a.w.document.querySelectorAll('.actions [data-act]').length===2]);
 a.click(act('diaryForgotAsk')); r.push(['C6: "Delete my diary and start over" asks to confirm', a.T().includes("Delete your diary? This can't be undone.") && !!a.dump()['next.v1.diary']]);
 a.click(act('diaryForgotYes'));
 r.push(['C6: deletes only the diary', !a.dump()['next.v1.diary'] && a.G('store.diaryLock')===null && a.dump()['next.v1.sensitive'].includes('My dog') && !!a.dump()['next.v1.noticed'] && a.S()==='diary' && a.has(act('diaryLockStart'))]); }
// privacy wording
{const a=boot(); const t=a.G('PRIVACY_PAGE.map(x=>x[1]).join(" ")');
 r.push(['C8: Privacy & terms: the optional diary lock encrypts diary entries; everything else is not encrypted', t.includes('The optional diary lock encrypts diary entries on the phone; everything else is not encrypted')]);
 r.push(['C8: PRIVACY_DATA_FLOW.md matches', /the optional diary lock encrypts diary entries on the phone; everything else is not encrypted/.test(fs.readFileSync(path.join(__dirname,'docs/PRIVACY_DATA_FLOW.md'),'utf8'))]); }

// ================= D. Export, delete, saving off =================
{const a=boot(); await write(a,{text:'Exported words', still:'Exported still'});
 const ex=a.G('buildExport()');
 r.push(['D: export includes diary entries (plain diary)', Array.isArray(ex.diary) && ex.diary[0].words==='Exported words' && ex.diary[0].stillTrue==='Exported still']);
 await lockIt(a); r.push(['D: export while the locked diary is open includes entries', Array.isArray(a.G('buildExport()').diary)]);
 a.G('diaryRelock(true)'); const ex2=a.G('buildExport()');
 r.push(['D: export with the diary locked: "Diary not included (locked)."', ex2.diary==='Diary not included (locked).' && !JSON.stringify(ex2).includes('Exported words')]);
 a.G('ACTIONS.deleteAll()');
 r.push(['D: Delete everything removes all diary data, incl. salt and check value', !a.dump()['next.v1.diary'] && a.G('store.diaryLock')===null && a.G('store.diaryBlob')===null && a.G('diaryEntries().length')===0 && a.G('diaryKey')===null]);
 a.G('ACTIONS.diaryOpen()'); r.push(['D: after Delete everything the diary opens fresh (no passcode)', !a.w.document.getElementById('diaryPass') && a.has(act('diaryLockStart'))]); }
{const a=boot(); a.G('ACTIONS.persist("off")');
 a.G('ACTIONS.diaryWrite()'); a.click(act('diaryToWords')); a.fill('diaryText','Visit only'); a.click(act('diaryToTrue'));
 r.push(['D: saving off → "Keep for now (saving is off)"', a.w.document.querySelector(act('diaryKeep')).textContent.trim()==='Keep for now (saving is off)']);
 a.click(act('diaryKeep')); await tick(5);
 r.push(['D: saving off → written for the visit, never stored', a.G('diaryEntries().length')===1 && !a.dump()['next.v1.diary'] && a.T().includes('Kept for this visit.')]);
 r.push(['D: saving off → no lock offered', !a.has(act('diaryLockStart')) && a.T().includes('Turn on saving in Settings to lock the diary.')]);
 a.G('ACTIONS.persist("on")'); r.push(['D: turning saving back on stores what was kept this visit', JSON.parse(a.dump()['next.v1.diary']).entries[0].text==='Visit only']); }
{const a=boot(); await write(a,{text:'Kept before'}); await lockIt(a); const before=a.dump()['next.v1.diary'];
 a.G('ACTIONS.persist("off")'); r.push(['D: turning saving off removes the stored diary', !a.dump()['next.v1.diary']]);
 a.G('ACTIONS.persist("on")'); r.push(['D: turning it back on restores the locked diary (still encrypted)', !!a.dump()['next.v1.diary'] && !a.dump()['next.v1.diary'].includes('Kept before') && JSON.parse(a.dump()['next.v1.diary']).lock.salt===JSON.parse(before).lock.salt]); }

for(const [n,ok,info] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||info===undefined?'':' ('+info+')'));
process.exit(0);   // the diary's 5-minute re-lock timer would otherwise keep this process alive
})().catch(e=>{ console.log('FAIL crashed: '+e.message); process.exit(1); });
