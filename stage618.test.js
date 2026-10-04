// Stage 6.18 (STAGE6-18-ADDENDUM.md): owner-approved updates. OWNER-APPROVED INTERIM items still go to the clinician.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const SUPPORT=fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8');
function boot({now,phone}={}){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   if(typeof phone==='boolean') w.__zzPhone=phone;
   if(now){ const RD=w.Date; const fixed=now; class D extends RD{ constructor(...a){ super(...(a.length?a:[fixed])); } static now(){ return fixed; } } w.Date=D; } }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s),all:s=>[...w.document.querySelectorAll(s)]};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const show=(a,s,extra='')=>a.G(`${extra} lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);
const r=[];

// ---- A. Zags wording ----
{const a=boot();
 r.push(['A: old Zags wording is gone', !/I can stay with you|Stay with Zags|Until someone calls back/.test(HTML)]);
 const hello=a.G('ZAGS_LINES.hello');
 r.push(['A: first line "I can guide you through the next few minutes." and still says "not a person"', hello.includes('I can guide you through the next few minutes.') && hello.includes('not a person')]);
 show(a,'connect'); const z=a.doc.querySelector(act('zags','connect'));
 r.push(['A: Connect "Calm down with Zags while you wait" (no subtitle)', !!z && z.textContent.trim()==='Calm down with Zags while you wait' && !z.querySelector('.meta')]);
 a.click(act('zags','connect')); r.push(['A: Zags says it in his first line', a.T().includes('I can guide you through the next few minutes.')]);}

// ---- B. Warm Line on the supporter page ----
{const {synced,SUP}=require('./sync-support.js');
 r.push(['B: supporter page Warm Line block is in sync with WARMLINE in index.html (npm run sync-support)', synced()===fs.readFileSync(SUP,'utf8')]);
 const d=new JSDOM(SUPPORT).window.document; const p=d.getElementById('warmline');
 r.push(['B: exact wording', !!p && p.textContent.replace(/\s+/g,' ').trim()==="Talk to someone who gets it. The Florida Warm Line is free and is also for family and friends supporting someone: 1-800-945-1355, every day 4pm–10pm Eastern. Not a crisis line. For a crisis, call or text 988."]);
 r.push(['B: in "Look after yourself"', !!p && p.closest('section').querySelector('h2').textContent==='Look after yourself']);
 r.push(['B: the number is shown as text (dial from a computer) and links to the same tel:', !!p && p.querySelector('a').textContent==='1-800-945-1355' && p.querySelector('a').getAttribute('href')===boot().G('WARMLINE.tel')]);}

// ---- C. Spanish crisis phrases ----
{const a=boot(); const sc=t=>a.G(`safetyCheck(${JSON.stringify(t)})`);
 const ES=["quiero morir","me quiero morir","quiero matarme","me voy a matar","quitarme la vida","suicidarme","no quiero vivir"];
 r.push(['C: the seven Spanish phrases are RED', ES.every(p=>a.G('RED_PHRASES').includes(p) && sc(p)==='RED')]);
 r.push(['C: in sentences, with capitals and Spanish punctuation', ['¡Me voy a matar!','Ya no quiero vivir','Pienso en SUICIDARME.','quiero quitarme la vida hoy'].every(t=>sc(t)==='RED')]);
 r.push(['C: accents match with and without them', ['QUIERO MORÍR','quiero suicidárme','quíero matarme','me vóy a matar'].every(t=>sc(t)==='RED')]);
 r.push(['C: a Spanish RED line opens the crisis screen like English', (()=>{ a.G('session.screen="spiral-input"; lastRendered=null; render()'); a.G('handleSafeTextSubmit({text:"quiero morir", onRed(){applySafetyResult("RED")}, onYellow(){}, onGreen(){}})'); return a.S().screen==='crisis' && a.S().safetyLevel==='RED'; })()]);
 // English is unchanged: for plain-ASCII text the new normalization is identical to the audited one.
 const oldNorm=t=>" "+String(t||"").toLowerCase().replace(/[\u2018\u2019']/g,"").replace(/[^a-z0-9]+/g," ").trim()+" ";
 const {CASES}=require('./safety-audit.js');
 const english=[...CASES.map(c=>c[1]).filter(t=>/^[\x00-\x7F\u2019]*$/.test(t)), ...a.G('RED_PHRASES'), ...a.G('YELLOW_PHRASES'), "I'm fine thanks", "It's been a long day", "can't sleep", "Something else"];
 r.push(['C: English behavior unchanged (same normalization for every English test input and phrase)', english.length>60 && english.every(t=>a.G(`normalizeText(${JSON.stringify(t)})`)===oldNorm(t))]);
 r.push(['C: English results unchanged for the matrix inputs', CASES.filter(c=>!/Spanish|Non-English/.test(c[0])).every(([,t])=>{ const n=oldNorm(t); const R=a.G('RED_PHRASES').map(oldNorm), Y=a.G('YELLOW_PHRASES').map(oldNorm); const exp=R.some(p=>n.includes(p))?'RED':Y.some(p=>n.includes(p))?'YELLOW':'GREEN'; return sc(t)===exp; })]);
 r.push(['C: marked OWNER-APPROVED INTERIM in the code', /6\.18 C, Spanish, OWNER-APPROVED INTERIM/.test(HTML)]);}

// ---- D. Research-backed additions ----
const NIGHT=new Date(2026,9,5,1,0,0).getTime(), DAY=new Date(2026,9,5,13,0,0).getTime();
const SAMPLE='ACTIONS.loadSample();';
// D1 veteran line
{const a=boot(); a.G(SAMPLE); const V="Veteran or service member? Call 988 and press 1.";
 const under=(scr)=>{ show(a,scr, scr.startsWith('crisis')?'session.safetyLevel="RED";':''); const v=[...a.doc.querySelectorAll('.vet-line')]; if(v.length!==1||v[0].textContent!==V) return false;
   const call=a.doc.querySelector('a[href="tel:988"]'); return !!(call.compareDocumentPosition(v[0]) & 4); };
 r.push(['D1: veteran line under the 988 buttons on the first crisis screen, the full crisis screen and Connect', under('crisis') && under('crisis-full') && under('connect')]);
 show(a,'crisis'); const kids=[...a.doc.querySelector('.content').children]; const iRow=kids.findIndex(e=>e.querySelector&&e.querySelector('a[href="tel:988"]')), iVet=kids.findIndex(e=>e.classList.contains('vet-line'));
 r.push(['D1: crisis screen keeps 988 first; the line comes right after the 988 buttons', iRow>=0 && iVet===iRow+1 && kids.slice(0,iRow).every(e=>e.id==='screen-title')]);}
// D2 night mode
{const n=boot({now:NIGHT}), d=boot({now:DAY});
 r.push(['D2: isNight() reads the clock: 01:00 yes, 13:00 no', n.G('isNight()')===true && d.G('isNight()')===false]);
 r.push(['D2: Home line at 01:00, not at 13:00', n.T().includes("It's late. Everything feels heavier at night. You don't have to decide anything before morning.") && !d.T().includes("It's late.")]);
 r.push(['D2: the Home line uses the secondary text style (hidden in large text with .home-sub)', n.has('p.home-sub.home-night')]);
 r.push(['D2: nothing about night is saved', !/night/i.test(JSON.stringify(n.w.localStorage))]);
 n.G(SAMPLE); d.G(SAMPLE); show(n,'connect'); show(d,'connect');
 const order=a=>[...a.doc.querySelector('.content').children].map(e=>e.id||e.className.split(' ')[0]||e.tagName).filter(x=>['connWarm','connPeople','pair','lbl'].includes(x));
 const nw=n.doc.getElementById('connWarm'), np=n.doc.getElementById('connPeople'), n988=n.doc.querySelector('a[href="tel:988"]');
 r.push(['D2: Connect at night: 988 at the top, Warm Line below "Reach one of your people"', !!(n988.compareDocumentPosition(np)&4) && !!(np.compareDocumentPosition(nw)&4)]);
 const dw=d.doc.getElementById('connWarm'), dp=d.doc.getElementById('connPeople'), d988=d.doc.querySelector('a[href="tel:988"]');
 r.push(['D2: Connect by day unchanged: Warm Line, people, then 988', !!(dw.compareDocumentPosition(dp)&4) && !!(dp.compareDocumentPosition(d988)&4)]);
 r.push(['D2: Warm Line card says "Usually closed right now · opens at 4pm Eastern" at night only', n.T().includes('Usually closed right now · opens at 4pm Eastern') && !d.T().includes('Usually closed right now')]);
 const btn=n.doc.querySelector('#connWarm a.btn');
 r.push(['D2: the Warm Line button stays enabled at night', !!btn && btn.getAttribute('href')==='tel:18009451355' && !btn.hasAttribute('disabled') && !btn.hasAttribute('aria-disabled')]);
 r.push(['D2: "Can\'t sleep, you up?" is the first message idea at night', n.doc.querySelector('.sits .idea').textContent==="Can't sleep, you up?"]);
 const same=['crisis','crisis-full','crisis-no','safety-check'].every(s=>{ for(const a of [n,d]){ a.G('ui=freshUi(); ui.talkOpen=true; ui.placesOpen=true;'); show(a,s,'session.safetyLevel="RED";'); } return n.doc.getElementById('app').innerHTML===d.doc.getElementById('app').innerHTML; });
 r.push(['D2: crisis screens are identical at night and by day', same]);}
// D3 alcohol and drugs line
{const a=boot(); a.G(SAMPLE); const U="Been drinking or using? Alcohol and drugs can make hard moments feel more final. Don't decide anything tonight, and try to be near someone.";
 const below=(scr,lastOpt)=>{ show(a,scr,'session.safetyLevel="RED";'); const u=a.doc.querySelector('.using-line'); const o=a.doc.querySelector(lastOpt); return !!u && u.textContent===U && !!o && !!(o.compareDocumentPosition(u)&4); };
 r.push(['D3: the line on crisis-no and the full crisis screen, below the existing options', below('crisis-no','[data-act="noGround"]') && below('crisis-full','[data-act="cPlan"]')]);
 r.push(['D3: information only (no question, no button, nothing saved)', !a.doc.querySelector('.using-line button, .using-line a') && !/\?$/.test(U.split('. ').pop())]);
 show(a,'crisis','session.safetyLevel="RED";'); r.push(['D3: not on the first crisis screen', !a.has('.using-line')]);}
// D4 someone who isn't police
{const a=boot(); a.G(SAMPLE); show(a,'crisis-full','session.safetyLevel="RED";');
 const np=a.doc.querySelector('.not-police'), vet=a.doc.querySelector('.vet-line'), c988=a.doc.querySelector('a[href="tel:988"]');
 r.push(['D4: full crisis screen: "Want someone to come to you who isn\'t police?" with Call 211', !!np && np.textContent.includes("Want someone to come to you who isn't police? In many Florida counties, 211 can connect you to a mobile crisis team.") && !!np.querySelector('a[href="tel:211"]')]);
 r.push(['D4: below the 988 buttons and the veteran line', !!(c988.compareDocumentPosition(np)&4) && !!(vet.compareDocumentPosition(np)&4)]);
 r.push(['D4: 911 is still the first button', a.doc.querySelector('.content a.btn').getAttribute('href')==='tel:911']);
 r.push(['D4: in CRISIS_RESOURCE_VERIFICATION for the owner', /6\.18 D4[\s\S]*OWNER to confirm local availability/.test(fs.readFileSync(path.join(__dirname,'docs','CRISIS_RESOURCE_VERIFICATION.md'),'utf8'))]);}
// D5 reasons to stay
{const a=boot(); a.G('ACTIONS.tab("plan")');
 const heads=[...a.doc.querySelectorAll('.plan-head h3')].map(h=>h.textContent);
 r.push(['D5: "Reasons to stay" right after "Things that help me"', heads[heads.indexOf('Things that help me on my own')+1]==='Reasons to stay']);
 a.click(act('planEdit','reasons'));
 r.push(['D5: hint "People, plans, things you\'re looking forward to, songs, anything."', a.T().includes("People, plans, things you're looking forward to, songs, anything.") && a.has('#edList')]);
 a.doc.getElementById('edList').value="My niece\nI want to die\nFishing in May"; a.click(act('planSave'));
 r.push(['D5: plan field, exempt from safetyCheck (saved as typed, no crisis screen)', a.S().screen!=='crisis' && JSON.stringify(a.G('getPlan().reasons'))===JSON.stringify(["My niece","I want to die","Fishing in May"])]);
 r.push(['D5: saved with the plan', JSON.parse(a.w.localStorage.getItem('next.v1.sensitive')).plan.reasons.length===3]);
 r.push(['D5: in Export', a.G('buildExport().plan.reasons.length')===3]);
 a.G('store.sensitive.songs=[{id:"1",date:1,mood:"heavy",lines:["a","b","c"],still:[]}]; ACTIONS.tab("plan")');
 r.push(['D5: "Your songs are here too." when there are songs', a.T().includes('Your songs are here too.')]);
 a.G('ACTIONS.planNow()'); const pn=[...a.doc.querySelectorAll('.pn .lbl')].map(x=>x.textContent);
 r.push(['D5: on "I need my plan", right after "Reach a person"', pn[pn.indexOf('Reach a person')+1]==='Reasons to stay' && a.T().includes('Fishing in May')]);
 show(a,'crisis-full','session.safetyLevel="RED";'); const rc=a.doc.querySelector('.reasons-card');
 r.push(['D5: full crisis screen: small "Your reasons to stay" card below the people and places', !!rc && rc.textContent.includes('Your reasons to stay') && !!(a.doc.querySelector('[data-act="cPlaces"]').compareDocumentPosition(rc)&4)]);
 a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['D5: Delete everything wipes it', a.G('getPlan().reasons.length')===0]);
 show(a,'crisis-full','session.safetyLevel="RED";'); r.push(['D5: no card when empty', !a.has('.reasons-card')]);
 a.G('ui.planFrom="no"; ACTIONS.planNow ? 0:0'); show(a,'plan-now'); r.push(['D5: no reasons panel on "I need my plan" when empty', !a.T().includes('Reasons to stay')]);}
// D6 gun storage
{const a=boot(); const G="If there's a gun at home: the safest step during hard times is to store it away from the person for a while — with someone you trust, or at a gun shop, range, or police department that offers temporary storage. It's temporary, and it's yours.";
 a.G('ACTIONS.tab("plan")'); a.click(act('planEdit','timeDistance'));
 r.push(['D6: time-and-distance help text includes the gun-storage line', a.doc.querySelector('.td-gun').textContent===G]);
 const sup=new JSDOM(SUPPORT).window.document.getElementById('gunLine');
 r.push(['D6: supporter guide "Time and distance" has it too', !!sup && sup.textContent===G && sup.closest('section').querySelector('h2').textContent==='Time and distance']);
 a.G(SAMPLE); a.G('getPlan().timeDistance.keepAway="x"');
 const onCrisis=['crisis','crisis-full','crisis-no','safety-check','plan-now'].some(s=>{ show(a,s,'session.safetyLevel="RED";'); return /gun/i.test(a.T()); });
 r.push(['D6: never on crisis screens (or "I need my plan")', !onCrisis]);
 r.push(['D6: no other methods named', !/firearm|ammunition|knife|rope|medication lock|lock box/i.test(G)]);}

//@@NEXT@@
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
