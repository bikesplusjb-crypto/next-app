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

//@@NEXT@@
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
