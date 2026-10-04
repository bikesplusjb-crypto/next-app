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

//@@NEXT@@
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
