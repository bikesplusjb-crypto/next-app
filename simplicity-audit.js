// 6.19 H: measures tap counts and menu sizes in the real app (jsdom) for docs/SIMPLICITY_AUDIT.md. Report only.
// Run: node simplicity-audit.js   (prints JSON; the audit document quotes these numbers)
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){ const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  for(const a of ['obNext','obAdult','obLater']) w.document.querySelector(`[data-act="${a}"]`).dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
  // a plan with one trusted person (so a Text button can exist); otherwise a fresh Home
  w.eval('getPlan().trustedPeople=[{name:"Jordan",phone:"555-0142",relationship:"friend"}]; saveStore(); lastRendered=null; render()');
  return w; }
// tappable things in the page (not the tab bar's current tab); links count as taps that end the path
function tappables(w){ return [...w.document.querySelectorAll('#app [data-act], #app a[href]')].filter(e=>!e.disabled); }
function sig(e){ return (e.getAttribute('data-act')||'')+'|'+(e.getAttribute('data-arg')||'')+'|'+(e.getAttribute('href')||''); }
function replay(path){ const w=boot(); for(const s of path){ const e=tappables(w).find(x=>sig(x)===s); if(!e) return null; if(e.tagName==='A' && !e.hasAttribute('data-act')) return w; e.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true})); } return w; }
const TARGETS={
  'the crisis screen': w=>w.eval('session.screen')==='crisis',
  'Call 988': (w,e)=>e && e.getAttribute('href')==='tel:988',
  "a trusted person's Text button": (w,e)=>e && /^sms:5550142/.test(e.getAttribute('href')||''),
  'Calm down with Zags': w=>w.eval('session.screen')==='zags',
  'I need my plan': w=>w.eval('session.screen')==='plan-now',
  'Put the phone down': (w,e)=>e && e.getAttribute('data-act')==='putDown'
};
function shortest(name, test, maxDepth=7){
  // BFS by taps; a link (tel:/sms:) target counts the tap on it; screen targets count taps to reach them
  let frontier=[[]]; const seen=new Set(['home']);
  for(let d=1; d<=maxDepth; d++){
    const next=[];
    for(const p of frontier){
      const w=replay(p); if(!w) continue;
      for(const e of tappables(w)){
        const s=sig(e);
        if(test.length===2 && test(w,e)) return { taps:d, path:[...p,s] };
        if(e.tagName==='A' && !e.hasAttribute('data-act')) continue;
        const w2=replay([...p,s]); if(!w2) continue;
        if(test.length===1 && test(w2)) return { taps:d, path:[...p,s] };
        const key=w2.eval('session.screen')+'|'+w2.eval('JSON.stringify([ui.talkOpen,ui.placesOpen,ui.dirOpen])');
        if(seen.has(key)) continue; seen.add(key); next.push([...p,s]);
      }
    }
    frontier=next;
  }
  return { taps:null, path:[] };
}
const out={ taps:{}, menus:{} };
for(const [n,t] of Object.entries(TARGETS)) out.taps[n]=shortest(n,t);
// menu sizes: choices in the page content (not the top bar or tab bar)
const MENUS={ 'Home':'home','Calm':'calm','Get out of my head':'distract','Connect':'connect','Change the scene':'scene','Tech check':'tech' };
for(const [n,s] of Object.entries(MENUS)){ const w=boot(); w.eval(`lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);
  const items=[...w.document.querySelectorAll('#app main [data-act], #app main a[href]')].map(e=>e.textContent.replace(/\s+/g,' ').trim()).filter(Boolean);
  out.menus[n]={ count:items.length, items }; }
console.log(JSON.stringify(out,null,1));
