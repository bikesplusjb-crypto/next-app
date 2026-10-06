// Bridge (owner request, 2026-10-06): when steps aren't helping, help the person reach a person and follow through.
// "Did Jordan answer?" Yes → put the phone down and talk; Not yet → who else → 988. The app never contacts anyone.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true,people=2}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone; w.addEventListener('error',e=>errs.push(e.message)); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.addEventListener('click',e=>{ if(e.target.closest && e.target.closest('a[href]')) e.preventDefault(); });   // jsdom can't open tel:/sms:
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const ppl=[{name:"Jordan",phone:"555-0142",relationship:"friend"},{name:"Sam",phone:"555-0199",relationship:"brother"}].slice(0,people);
  w.eval(`getPlan().trustedPeople=${JSON.stringify(ppl)}; saveStore(); lastRendered=null; render()`);
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{ const o=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])); const sv=JSON.parse(o['next.v1.sensitive']||'{}'); delete sv.activity; delete sv.history; o['next.v1.sensitive']=sv; return JSON.stringify(o); };
  const flush=()=>new Promise(res=>setTimeout(res,450));
  return {w,click,T,dump,errs,flush,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const title=a=>a.w.document.getElementById('screen-title').textContent;
const r=[];
(async()=>{
 // Human First → the new link, and the first person's buttons feed the follow-up
 {const a=boot(); a.G('session.screen="human-first"; lastRendered=null; render()');
  r.push(['Human First: "Someone else, or 988" opens the Bridge', a.has(act('bridgeStart')) && a.w.document.querySelector(act('bridgeStart')).textContent==='Someone else, or 988']);
  a.click('.actions a[href^="sms:"][data-bridge="0"]'); await a.flush();
  r.push(['Human First: Text someone → "Did Jordan answer?" waiting when they come back', a.S()==='bridge' && title(a)==='Did Jordan answer?']); }
 {const a=boot(); a.G('ACTIONS.bridgeStart()'); const B=a.G('BRIDGE');
  r.push(['1: "Who could you reach right now?" and "Another exercise may not be what you need."', title(a)===B.whoQ && a.T().includes(B.sub)]);
  r.push(['1: each person: Text (prepared message) and Call; then 988', a.has('.bridge-person a[href="tel:5550142"]') && a.has('.bridge-person a[href="tel:5550199"]') && a.has('.bridge-988 a[href="tel:988"]') && a.has('.bridge-988 a[href="sms:988"]')]);
  const sms=a.w.document.querySelector('.bridge-person a[href^="sms:5550142"]').getAttribute('href');
  r.push(['1: the text is "I\'m having a really hard time. Can you call me?"', decodeURIComponent(sms).endsWith("I'm having a really hard time. Can you call me?") && a.T().includes(B.msgNote)]);
  r.push(['1: people before 988; 911 line; no typing', (()=>{ const all=[...a.w.document.querySelectorAll('#app main a[href]')].map(x=>x.getAttribute('href')); return all.indexOf('tel:5550142')<all.indexOf('tel:988'); })() && a.has('.bridge-danger a[href="tel:911"]') && !a.has('#app main input, #app main textarea')]);
  a.click('.bridge-person a[href^="sms:5550142"]'); await a.flush();
  r.push(['2: "Did Jordan answer?" Yes / Not yet', title(a)==='Did Jordan answer?' && a.has(act('bridgeAnswer','yes')) && a.has(act('bridgeAnswer','no')) && a.T().includes(B.waitSub)]);
  a.click(act('bridgeAnswer','no'));
  r.push(['3: Not yet → "Who else could you reach?" without Jordan', title(a)===B.elseQ && a.T().includes(B.elseSub) && !a.has('.bridge-person a[href="tel:5550142"]') && a.has('.bridge-person a[href="tel:5550199"]')]);
  a.click('.bridge-person a[href="tel:5550199"]'); await a.flush(); r.push(['3: Call Sam → "Did Sam answer?"', title(a)==='Did Sam answer?']);
  a.click(act('bridgeAnswer','no'));
  r.push(['4: no one left → "Would you like to call or text 988?" with 988 first', title(a)===B.noneLeft && a.has('.bridge-988 a[href="tel:988"]') && !a.has('.bridge-person')]);
  a.click('.bridge-988 a[href="tel:988"]'); await a.flush(); r.push(['4: 988 → "Did you get through to 988?"', title(a)===B.wait988]);
  a.click(act('bridgeAnswer','yes')); r.push(['5: Yes → "Good. Put the phone down and talk."', title(a)===B.done && a.has(act('putDown'))]); }
 {const a=boot({people:0}); a.G('ACTIONS.bridgeStart()'); r.push(['nobody in the plan: 988 and "Add someone"', a.has('.bridge-988 a[href="tel:988"]') && a.has(act('tab','plan')) && a.T().includes(a.G('BRIDGE.noPeople'))]); }
 {const a=boot({phone:false}); a.G('ACTIONS.bridgeStart()'); r.push(['computer: Copy the message; chat with 988', a.has('.bridge-person [data-copy]') && a.has('.bridge-988 a[href*="988lifeline.org/chat"]')]); }
 {const a=boot(); a.G('saveStore()'); const before=a.dump(); a.G('ACTIONS.bridgeStart()'); a.click('.bridge-person a[href^="sms:5550142"]'); await a.flush(); a.G('ACTIONS.bridgeAnswer("no")');
  r.push(['nothing saved about who was tried or answered', a.dump()===before]);
  r.push(['never contacts anyone itself (links only, no network)', !/\bfetch\(|XMLHttpRequest|sendBeacon/.test(HTML.replace(/<!--[\s\S]*?-->/g,''))]);
  let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/data-bridge|bridgeStart/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
  r.push(['never on crisis screens', !on]);
  const b=boot(); b.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); b.G('ACTIONS.bridgeStart(); ACTIONS.bridgeAnswer("yes")'); r.push(['blockIfRed', b.S().startsWith('crisis')]);
  const c=boot(); c.G('ACTIONS.bridgeStart()'); r.push(['Help visible', c.has('header .help-pill[data-act="crisis"]')]);
  const d=boot(); d.G('ACTIONS.bridgeStart()'); d.click(act('dontKnow')); r.push(['"Try something else" → I don\'t know what I need', d.S()==='dont-know']);
  r.push(['no script errors', a.errs.length===0]); }
 for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
 process.exit(0);
})();
