// Stage 6.28: PTSD, trauma, or military. Never asks about the trauma; no typing in the flashback or nightmare flows;
// plain screens there (no Zags, no animation); verified VA resources; others hidden until verified; nothing saved.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true, now}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone; w.addEventListener('error',e=>errs.push(e.message));
    w.HTMLCanvasElement.prototype.getContext=function(){ return null; };
    if(now){ const RD=w.Date; const fixed=now; w.Date=class extends RD{ constructor(...a){ a.length?super(...a):super(fixed); } static now(){ return fixed; } }; } }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{let el=w.document.querySelector(sel); if(!el && w.document.querySelector('[data-act="homeMore"]')){ w.document.querySelector('[data-act="homeMore"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true})); el=w.document.querySelector(sel); }
    if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])));
  return {w,click,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];

// ================= B. Entry =================
{const a=boot(); r.push(['B: the chip is under More, not among the first five', !a.has(act('ptsdStart'))]);
 a.click(act('homeMore')); const chip=a.w.document.querySelector(act('ptsdStart'));
 r.push(['B: More → "PTSD, trauma, or military"', !!chip && chip.textContent==='PTSD, trauma, or military']);
 a.click(act('ptsdStart'));
 r.push(['B: "What\'s going on right now?" with the six choices', a.S()==='ptsd' && a.w.document.getElementById('screen-title').textContent==="What's going on right now?"
   && JSON.stringify([...a.w.document.querySelectorAll(act('ptsdPath'))].map(b=>b.querySelector('span').firstChild.textContent))===JSON.stringify(["It's happening right now","I woke up from a nightmare","I'm on edge","I'm a veteran or service member","Something happened to me","Someone I love has PTSD or served"])]);
 r.push(['B: plain (no Zags, no enter animation), Help visible', !a.has('.zmark,.zface,.zcard') && !a.has('main.screen.enter') && a.has('header .help-pill[data-act="crisis"]')]);
 r.push(['B: no text inputs', !a.has('#app main input, #app main textarea')]); }
{const a=boot(); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); a.G('ACTIONS.ptsdStart()'); r.push(['B: blocked while RED', a.S()==='crisis']);
 r.push(['not in the engine', a.G('INTERVENTION_LIBRARY.every(i=>!/^ptsd/.test(String(i.route||"")) && !/ptsd/.test(i.id))')]); }

//@@PARTS@@

for(const [n,ok,info] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||info===undefined?'':' ('+info+')'));
