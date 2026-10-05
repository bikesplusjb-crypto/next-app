// "Most of my days feel heavy" (owner request, 2026-10-05): take it seriously without labels, make it easier to tell a
// doctor, counselor or friend, one small thing for today, 988 close by. No typing, nothing saved, never suggested.
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
const has988=a=>a.has('.heavy-988 a[href="tel:988"]') && a.T().includes('If it ever feels like more than heavy, call or text 988, any time.');
const r=[];
{const a=boot(); r.push(['entry: not among the first five Home chips', !a.has(act('heavyStart'))]);
 a.click(act('homeMore')); r.push(['entry: Home → More → "Most of my days feel heavy"', a.w.document.querySelector(act('heavyStart')).textContent==='Most of my days feel heavy']);
 const b=boot(); b.G('ACTIONS.flow("low")'); r.push(['entry: also a small link on "I feel sad or low"', b.S()==='sad' && b.has('button.link[data-act="heavyStart"]')]); }
{const a=boot(); a.click(act('heavyStart'));
 r.push(['1: "When most days feel heavy, that\'s worth taking seriously." / not weakness, not your fault', title(a)==="When most days feel heavy, that's worth taking seriously." && a.T().includes("It's not weakness, and it's not your fault. You don't have to fix all of it.") && has988(a)]);
 a.click(act('heavyNext'));
 r.push(['2: "Tell someone who can help", the two-weeks line and one sentence to say', title(a)==='Tell someone who can help' && a.T().includes("If you've felt this way most days for two weeks or more, talking to a doctor or counselor can really help.") && a.T().includes("Most of my days have felt heavy for a while, and I'd like some help with it.") && has988(a)]);
 r.push(['2: a prepared text for someone they trust (they send it)', a.has('a.sit[href^="sms:"]') && decodeURIComponent(a.w.document.querySelector('a.sit').getAttribute('href')).endsWith('Most of my days have felt heavy lately. Can we talk sometime soon?')]);
 a.click(act('heavyNext'));
 r.push(['3: "One small thing for today": tiny thing · a line about today · borrow ten minutes', title(a)==='One small thing for today' && a.has(act('heavySmall','tiny')) && a.has(act('heavySmall','line')) && a.has(act('heavySmall','borrow')) && has988(a)]);
 a.click(act('heavyNext'));
 r.push(['end: "You don\'t have to carry all of it today. One small thing is enough." → Put the phone down · Talk to someone', title(a)==="You don't have to carry all of it today. One small thing is enough." && a.has(act('putDown')) && a.has(act('route','connect')) && has988(a)]); }
for(const [k,ok] of [['tiny',a=>a.S()==='low-choose'],['line',a=>a.S()==='diary-feel'],['borrow',a=>a.G('session.currentInterventionId')==='borrow_ten']]){
 const a=boot(); a.G('ACTIONS.heavyStart(); ACTIONS.heavyNext(); ACTIONS.heavyNext()'); a.click(act('heavySmall',k)); r.push([`small thing "${k}" → the existing step`, ok(a)]); }
{const a=boot({phone:false}); a.G('ACTIONS.heavyStart(); ACTIONS.heavyNext()'); r.push(['computer: Copy instead of a text link; 988 chat', !a.has('a.sit[href^="sms:"]') && a.has('[data-copy]') && a.has('.heavy-988 a[href*="988lifeline.org/chat"]')]); }
{const a=boot(); a.G('saveStore()'); const before=a.dump(); a.G('ACTIONS.heavyStart(); ACTIONS.heavyNext(); ACTIONS.heavyNext(); ACTIONS.heavyNext()');
 r.push(['no typing anywhere, nothing saved', a.dump()===before && (()=>{ let any=false; a.G('ui.heavy={step:0}'); for(let i=0;i<4;i++){ a.G(`ui.heavy.step=${i}; session.screen="heavy"; lastRendered=null; render()`); if(a.has('#app main input, #app main textarea')) any=true; } return !any; })()]);
 const copy=JSON.stringify(a.G('HEAVY'));
 r.push(['no labels, diagnosis, scores or promises', !/depress|disorder|diagnos|symptom|score|rate|cure|treat|will get better|everything will be|you'?re safe/i.test(copy)]);
 r.push(['not in the engine', a.G('INTERVENTION_LIBRARY.every(i=>!/heavy/.test(i.id))')]);
 let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/heavyStart|heavy-988/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
 r.push(['never on crisis screens', !on]);
 a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); for(const x of ['heavyStart','heavyNext','heavySmall']) a.G(`ACTIONS.${x}("tiny")`);
 r.push(['blockIfRed on every action', a.S()==='crisis']);
 r.push(['Help visible', (()=>{ const b=boot(); b.G('ACTIONS.heavyStart()'); return b.has('header .help-pill[data-act="crisis"]'); })()]);
 r.push(['no script errors', a.errs.length===0]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
