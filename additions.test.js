// 2026-10-05 research pass: "It feels like panic", "I'm really angry" (step away) and "My hope box".
// Wording drafted by Claude Code and waiting on the clinician. No typing, nothing saved, never on crisis screens.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone; w.addEventListener('error',e=>errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext=()=>null; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{let el=w.document.querySelector(sel); if(!el && w.document.querySelector('[data-act="homeMore"]')){ w.document.querySelector('[data-act="homeMore"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true})); el=w.document.querySelector(sel); }
    if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{ const o=JSON.parse(JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])))); const sv=JSON.parse(o['next.v1.sensitive']||'{}'); delete sv.activity; delete sv.history; o['next.v1.sensitive']=sv; return JSON.stringify(o); };
  return {w,click,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const title=a=>a.w.document.getElementById('screen-title').textContent;
const noInputs=a=>!a.has('#app main input, #app main textarea');
const r=[];

// ---- It feels like panic ----
{const a=boot(); r.push(['panic: not among the first five Home chips', !a.has(act('panicStart'))]);
 a.click(act('homeMore')); r.push(['panic: Home → More → "It feels like panic"', a.w.document.querySelector(act('panicStart')).textContent==='It feels like panic']);
 const b=boot(); b.G('ACTIONS.flow("anxious")'); r.push(['panic: a small link on the first "I\'m anxious" screen', b.S()==='before' && b.has('button.link[data-act="panicStart"]')]);
 const c=boot(); c.G('ACTIONS.flow("spiraling")'); r.push(['panic: not on the spiraling first screen', !c.has(act('panicStart'))]); }
{const a=boot(); a.click(act('panicStart')); const P=a.G('PANIC'); let ok=true, i911=true, inputs=true;
 for(let i=0;i<P.steps.length;i++){ if(title(a)!==P.steps[i][0] || !a.T().includes(P.steps[i][1])) ok=false; if(!a.has('.panic-911 a[href="tel:911"]')) i911=false; if(!noInputs(a)) inputs=false; a.click(act('panicNext')); }
 r.push(['panic: four steps, one instruction per screen', ok]);
 r.push(['panic: the 911 line on every step', i911 && a.T().includes(P.medical)]);
 r.push(['panic: no typing', inputs]);
 r.push(['panic: "How is it now?" → coming down / still strong', title(a)==='How is it now?' && a.has(act('panicEnd','down')) && a.has(act('panicEnd','strong'))]);
 a.click(act('panicEnd','down')); r.push(['panic: coming down → Put the phone down · Calm down', title(a)===P.downSay && a.has(act('putDown')) && a.has(act('route','calm'))]);
 const b=boot(); b.G('ACTIONS.panicStart(); for(let i=0;i<4;i++) ACTIONS.panicNext()'); b.click(act('panicEnd','strong'));
 r.push(['panic: still strong → again · Talk to someone · Get help now', title(b)===P.strongSay && b.has(act('panicStart')) && b.has(act('route','connect')) && b.has(act('getHelpNow'))]);
 b.click(act('panicStart')); r.push(['panic: "Go through it again" restarts at step 1', title(b)===P.steps[0][0]]);
 r.push(['panic: never says it isn\'t a heart attack or promises safety', !/heart attack|not dangerous|can't hurt you|you'?re safe|you will be fine/i.test(JSON.stringify(P))]); }

// ---- I'm really angry ----
{const a=boot(); r.push(['angry: not among the first five Home chips', !a.has(act('angryStart'))]);
 a.click(act('homeMore')); r.push(['angry: Home → More → "I\'m really angry"', a.w.document.querySelector(act('angryStart')).textContent==="I'm really angry"]);
 a.click(act('angryStart')); const A=a.G('ANGRY'); let ok=true, danger=true, inputs=true;
 for(let i=0;i<A.steps.length;i++){ if(title(a)!==A.steps[i][0] || !a.T().includes(A.steps[i][1])) ok=false; if(!a.has('.angry-danger [data-act="getHelpNow"]')) danger=false; if(!noInputs(a)) inputs=false;
   if(i===1) r.push(['angry: prepared text they send themselves', a.has('a.sit[href^="sms:"]') && decodeURIComponent(a.w.document.querySelector('a.sit').getAttribute('href')).endsWith(A.msg)]);
   if(i===3) r.push(['angry: three ways to let the body come down', ['breathe','head','borrow'].every(k=>a.has(act('angryDown',k)))]);
   a.click(act('angryNext')); }
 r.push(['angry: four steps', ok]);
 r.push(['angry: "Get help now" on every screen', danger && a.has('.angry-danger [data-act="getHelpNow"]')]);
 r.push(['angry: no typing', inputs]);
 r.push(['angry: end → Put the phone down · Talk to someone', title(a)===A.end && a.has(act('putDown')) && a.has(act('route','connect'))]);
 a.click(act('getHelpNow')); r.push(['angry: Get help now → crisis', a.S().startsWith('crisis')]);
 r.push(['angry: never asks what happened or who', !/what happened|who did|tell me about|their fault|your fault/i.test(JSON.stringify(A))]); }
for(const [k,ok] of [['breathe',a=>a.G('session.currentInterventionId')==='breathing'],['head',a=>a.S()==='distract'],['borrow',a=>a.G('session.currentInterventionId')==='borrow_ten']]){
 const a=boot(); a.G('ACTIONS.angryStart(); ACTIONS.angryNext(); ACTIONS.angryNext(); ACTIONS.angryNext()'); a.click(act('angryDown',k)); r.push([`angry: "${k}" → the existing step`, ok(a)]); }
{const a=boot({phone:false}); a.G('ACTIONS.angryStart(); ACTIONS.angryNext()'); r.push(['angry: computer gets Copy, not a text link', !a.has('a.sit[href^="sms:"]') && a.has('[data-copy]')]); }

// ---- My hope box ----
{const a=boot(); a.G('ACTIONS.tab("plan")'); r.push(['hope box: a row in My Plan', a.has('.hope-row [data-act="hopeOpen"]')]);
 a.click(act('hopeOpen')); r.push(['hope box: empty → explains and offers three ways to fill it', title(a)==='My hope box' && a.T().includes(a.G('HOPE_BOX.empty')) && ['reasons','song','find'].every(k=>a.has(act('hopeAdd',k)))]);
 a.click(act('hopeAdd','reasons')); r.push(['hope box: "Add a reason to stay" → the plan editor', a.S()==='plan-edit' && a.G('ui.editSection')==='reasons']); }
{const a=boot(); a.G(`getPlan().reasons=["My dog, Biscuit","Seeing the ocean again"]; store.sensitive.songs=[{id:"s1",date:Date.now(),mood:"heavy",lines:["Some days are long","x"],still:[]}]; store.noticed=[{id:"n1",date:Date.now(),mission:"remembering",text:"Grandma's garden"}]; saveStore()`);
 const before=a.dump(); a.G('ACTIONS.hopeOpen()'); const t=a.T();
 r.push(['hope box: shows reasons, songs and things noticed', t.includes('My dog, Biscuit') && t.includes('Seeing the ocean again') && a.has('.hope-songs [data-act="songOpen"][data-arg="s1"]') && t.includes("Grandma's garden")]);
 r.push(['hope box: no "add" prompts when everything is filled', !a.has(act('hopeAdd'))]);
 r.push(['hope box: read-only (nothing saved by opening it)', a.dump()===before && noInputs(a)]);
 a.G('getPlan().reasons=["<img src=x onerror=alert(1)>"]; lastRendered=null; render()'); r.push(['hope box: escapes what it shows', !a.has('.hope-reasons img')]); }

// ---- shared rules ----
{const a=boot(); a.G('saveStore()'); const before=a.dump();
 a.G('ACTIONS.panicStart(); for(let i=0;i<4;i++) ACTIONS.panicNext(); ACTIONS.panicEnd("down"); ACTIONS.angryStart(); for(let i=0;i<4;i++) ACTIONS.angryNext()');
 r.push(['nothing saved by panic or angry', a.dump()===before]);
 r.push(['not in the engine', a.G('INTERVENTION_LIBRARY.every(i=>!/panic|angry|hope/.test(i.id))')]);
 let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/panicStart|angryStart|hopeOpen|panic-911|angry-danger/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
 r.push(['never on crisis screens', !on]);
 for(const x of ['panicStart','panicNext','panicEnd','angryStart','angryNext','angryDown','hopeOpen','hopeAdd']){ const b=boot(); b.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); b.G(`ACTIONS.${x}("down")`);
   if(!b.S().startsWith('crisis')) r.push([`blockIfRed: ${x}`, false]); }
 r.push(['blockIfRed on every new action', true]);
 for(const s of ['panicStart','angryStart','hopeOpen']){ const b=boot(); b.G(`ACTIONS.${s}()`); r.push([`Help visible (${s})`, b.has('header .help-pill[data-act="crisis"]')]); }
 r.push(['Home: "I don\'t feel safe" still first', (()=>{ const b=boot(); b.click(act('homeMore')); const f=[...b.w.document.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act)); return f && f.dataset.act==='crisis'; })()]);
 r.push(['no script errors', a.errs.length===0]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
