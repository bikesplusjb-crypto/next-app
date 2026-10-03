// Quiet "Support ZigZag Mind" link: one constant, Settings and About only, hidden when empty. Nothing stored or tracked.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const SRC=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
const URL_='https://ko-fi.com/zigzagmind-test';
const withUrl=u=>SRC.replace('const DONATE_URL = "";',`const DONATE_URL = ${JSON.stringify(u)};`);
function boot(html){const dom=new JSDOM(html,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const links=a=>[...a.doc.querySelectorAll('#app a')].filter(x=>/Support ZigZag Mind/.test(x.textContent));
const r=[];

r.push(['one constant at the top of the app script, empty by default', /<script>\s*"use strict";\s*\/\*[^]*?\*\/\s*const DONATE_URL = "";/.test(SRC) && (SRC.match(/const DONATE_URL/g)||[]).length===1]);

// ---- set ----
{const a=boot(withUrl(URL_)); a.click(act('tab','settings'));
 const l=links(a); const app=a.doc.getElementById('app'); const main=app.querySelector('main')||app;
 r.push(['Settings: "Support ZigZag Mind" row with its line', l.length===1 && a.T().includes('Free for everyone, always. If it helped, you can help keep it running.')]);
 const all=[...main.querySelectorAll('h2, button, a, p, label, select, input')]; const last=all.filter(e=>!e.closest('.donate-row')).at(-1);
 r.push(['...at the bottom of Settings', !!l[0] && l[0].closest('.donate-row') && (last.compareDocumentPosition(l[0].closest('.donate-row')) & 4)]);
 r.push(['opens in a new tab: target="_blank", rel="noopener"', l[0].getAttribute('href')===URL_ && l[0].getAttribute('target')==='_blank' && l[0].getAttribute('rel')==='noopener']);
 const before=JSON.stringify(a.dump()); const acts=a.G('store.sensitive.activity.length');
 l[0].addEventListener('click',e=>e.preventDefault()); l[0].dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['tapping it stores and tracks nothing', JSON.stringify(a.dump())===before && a.G('store.sensitive.activity.length')===acts && a.S().screen==='settings']);
 a.click(act('about'));
 const la=links(a);
 r.push(['About: one plain line with the same link', la.length===1 && la[0].getAttribute('href')===URL_ && la[0].getAttribute('target')==='_blank' && la[0].getAttribute('rel')==='noopener']);}

// ---- never anywhere else ----
{const a=boot(withUrl(URL_)); a.G('ACTIONS.loadSample()');
 const screens=a.G('Object.keys(SCREENS)').filter(s=>s!=='settings' && s!=='about');
 const found=[];
 for(const s of screens){
   for(const st of ['anxious','low','distraction']){
     a.G(`lastRendered=null; ui=freshUi(); session={...initialSession, screen:${JSON.stringify(s)}, currentState:${JSON.stringify(st)}, currentInterventionId:"grounding", yellow:true, safetyLevel:${['crisis','crisis-full','crisis-no','safety-check'].includes(s)?'"RED"':'"YELLOW"'}}; ui.placesOpen=true; ui.talkOpen=true; ${s==='recommendation'?'runEngine();':''} render();`);
     if(/Support ZigZag Mind|ko-fi/i.test(a.doc.body.innerHTML.replace(/<script[\s\S]*?<\/script>/g,''))){ found.push(s); break; }
   }
 }
 r.push([`never on any other screen (${screens.length}: Home, flows, Calm, crisis, Help, My Plan, check-ins…)`, screens.length>=50 && found.length===0, found.join()]);
 r.push(['the list covers Home, crisis, Help, Calm, My Plan and the check-ins', ['home','crisis','crisis-full','talk','calm','plan','checkin','game-check','recommendation','zags','connect'].every(s=>screens.includes(s))]);}

// ---- hidden when empty (or left as the placeholder) ----
for(const [label,html] of [['empty',SRC],['placeholder left in',withUrl('PASTE-LINK-HERE')],['not a web link',withUrl('javascript:alert(1)')]]){
  const a=boot(html); a.click(act('tab','settings')); const s1=links(a).length + (/Support ZigZag Mind/.test(a.T())?1:0);
  a.click(act('about')); const s2=links(a).length + (/Support ZigZag Mind/.test(a.T())?1:0);
  r.push([`hidden everywhere when ${label}`, s1===0 && s2===0]);
}

// ---- no storage keys added ----
{const a=boot(SRC), b=boot(withUrl(URL_));
 for(const x of [a,b]){ x.click(act('tab','settings')); x.click(act('about')); }
 r.push(['no storage keys added', JSON.stringify(Object.keys(a.dump()).sort())===JSON.stringify(Object.keys(b.dump()).sort()) && !/donat|ko-fi|support/i.test(JSON.stringify(b.dump()))]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
