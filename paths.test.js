// Other kinds of help (owner request, 2026-10-09): a hub and ten short paths on one engine. One idea per screen, a help
// line on every screen, no typing, nothing saved, outside resources hidden until verified, Leave quickly on "Not safe".
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone; w.addEventListener('error',e=>errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext=()=>null; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.addEventListener('click',e=>{ if(e.target.closest && e.target.closest('a[href]')) e.preventDefault(); });
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{ const o=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])); const sv=JSON.parse(o['next.v1.sensitive']||'{}'); delete sv.activity; delete sv.history; o['next.v1.sensitive']=sv; return JSON.stringify(o); };
  return {w,click,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const title=a=>a.w.document.getElementById('screen-title').textContent;
const r=[];
const IDS=boot().G('Object.keys(PATHS)');
// ---- hub ----
{const a=boot(); a.click(act('homeMore')); r.push(['Home → More → "Other kinds of help"', a.w.document.querySelector(act('moreHelp')).textContent==='Other kinds of help']);
 a.click(act('moreHelp')); const first=[...a.w.document.querySelectorAll(act('pathStart'))].map(b=>b.dataset.arg);
 r.push(['hub: 7 paths, then "More" (at most 8 choices)', first.length===7 && a.has(act('moreHelpAll')) && first.join()==='care,slipped,heartbreak,money,notsafe,newparent,caregiver']);
 a.click(act('moreHelpAll')); const shown=[...a.w.document.querySelectorAll(act('pathStart'))].map(b=>b.dataset.arg);
 r.push([`hub: "More" shows all ${IDS.length}, each once, under headings`, shown.length===IDS.length && new Set(shown).size===IDS.length && a.w.document.querySelectorAll('.lbl').length>=4]);
 r.push(['hub: Home\'s first choice still "I don\'t feel safe"', (()=>{ const b=boot(); return [...b.w.document.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis'; })()]); }
// ---- every path ----
for(const id of IDS){
  const a=boot(); a.G('saveStore()'); const before=a.dump(); a.G(`ACTIONS.pathStart(${JSON.stringify(id)})`);
  let screens=0, line=true, inputs=false, help=true;
  for(let k=0;k<12;k++){ screens++;
    if(!a.has('.path-988 a[href="tel:988"]')) line=false;
    if(a.has('#app main input, #app main textarea')) inputs=true;
    if(!a.has('header .help-pill[data-act="crisis"]')) help=false;
    if(!a.has(act('pathNext'))) break; a.click(act('pathNext')); }
  const P=a.G(`PATHS[${JSON.stringify(id)}]`);
  r.push([`${id}: ${screens} screens, ends on "${P.end.h}" with Put the phone down · Talk to someone`, title(a)===P.end.h && a.has(act('putDown')) && a.has(act('route','connect'))]);
  r.push([`${id}: a help line (988) and Help on every screen; no typing`, line && help && !inputs]);
  r.push([`${id}: nothing saved`, a.dump()===before]);
}
// ---- honest, no promises ----
{const a=boot(); const copy=JSON.stringify(a.G('PATHS'))+JSON.stringify(a.G('MORE_HELP'));
 r.push(['no promises or labels ("you\'re safe", "cure", "will get better", diagnoses)', !/you'?re safe now|cure|will get better|guarantee|diagnos|you have (depression|anxiety)/i.test(copy)]);
 r.push(['no crisis word in the wording that would trip the safety check', a.G('Object.values(PATHS).every(P=>[P.title,P.meta,...P.steps.flatMap(s=>[s.h,s.p||"",...(s.list||[]),s.say||"",s.msg||""]),P.end.h].every(t=>safetyCheck(t)!=="RED"))')]); }
// ---- resources hidden until verified ----
{const a=boot(); r.push(['new outside resources are all unverified (owner to verify)', a.G('Object.values(MORE_RESOURCES).every(e=>e.verified===false && e.source)')]);
 let shown=''; for(const id of IDS){ a.G(`ACTIONS.pathStart(${JSON.stringify(id)})`); for(let k=0;k<12;k++){ const h=a.w.document.getElementById('app').innerHTML;
   for(const [key,e] of Object.entries(a.G('MORE_RESOURCES'))) if(e.phone && h.includes('tel:'+e.phone)) shown+=id+':'+key+' ';
   if(!a.has(act('pathNext'))) break; a.click(act('pathNext')); } }
 r.push(['unverified numbers never show', shown==='', shown]);
 a.G('MORE_RESOURCES.mmh.verified=true; ACTIONS.pathStart("newparent"); ACTIONS.pathNext(); ACTIONS.pathNext(); ACTIONS.pathNext()');
 r.push(['once verified, it shows (e.g. the Maternal Mental Health Hotline at the end of New parent)', a.has('.path-res a[href="tel:18338526262"]')]);
 const b=boot(); b.G('ACTIONS.pathStart("notsafe"); ACTIONS.pathNext()'); r.push(['Not safe at home: the (verified) Domestic Violence Hotline', b.has('.path-res a[href="tel:18007997233"]')]); }
// ---- Leave quickly ----
{const a=boot(); a.G('ACTIONS.pathStart("notsafe")'); let ok=true; for(let k=0;k<6;k++){ if(!a.has(act('leaveQuickly'))) ok=false; if(!a.has(act('pathNext'))) break; a.click(act('pathNext')); }
 r.push(['Not safe at home: "Leave quickly" on every screen', ok]);
 a.G('window.__went=null; quickExit=u=>{window.__went=u;}'); const acts=a.G('store.sensitive.activity.length'); a.click(act('leaveQuickly'));
 r.push(['Leave quickly: blanks the page and goes to a plain weather page (no history entry)', a.G('window.__went')==='https://www.weather.gov/' && a.w.document.getElementById('app').innerHTML==='' && a.G('store.sensitive.activity.length')===acts]);
 r.push(['Leave quickly uses location.replace (no back-button trail)', /location\.replace\(url\)/.test(HTML)]);
 const b=boot(); b.G('ACTIONS.pathStart("heartbreak")'); r.push(['only on Not safe at home', !b.has(act('leaveQuickly'))]); }
// ---- specific bits ----
{const a=boot(); a.G('getPlan().trustedPeople=[{name:"Jordan",phone:"555-0142",relationship:"friend"}]; ACTIONS.pathStart("slipped"); ACTIONS.pathNext()');
 r.push(['I slipped: "Don\'t drive" and the 911 line', a.T().includes("Don't drive.") && a.T().includes('call 911 now')]);
 a.click(act('pathNext')); r.push(['I slipped: a prepared text to their person (they send it)', decodeURIComponent(a.w.document.querySelector('a.sit').getAttribute('href')).startsWith('sms:5550142') && a.T().includes("I slipped tonight.")]);
 const b=boot(); b.G('ACTIONS.flow("craving")'); r.push(['urge first screen: "Already drank or used? I slipped"', b.has('.slipped-link'+act('pathStart','slipped'))]);
 const c=boot(); c.G('ACTIONS.pathStart("money"); ACTIONS.pathNext(); ACTIONS.pathNext()'); r.push(['Money: Call 211 and a payment-plan script', c.has('a[href="tel:211"]') && c.T().includes('payment plan')]);
 const d=boot(); d.G('ACTIONS.pathStart("heartbreak"); ACTIONS.pathNext()'); d.click(act('pathOpt','0')); r.push(['Heartbreak: "Borrow ten minutes" opens the existing step', d.G('session.currentInterventionId')==='borrow_ten']);
 const e=boot(); e.G('ACTIONS.pathStart("care"); ACTIONS.pathNext()'); r.push(['Getting to real care: what to say on the call', e.T().includes('sliding scale') && e.T().includes('You could say:')]);
 const f=boot({phone:false}); f.G('ACTIONS.pathStart("slipped"); ACTIONS.pathNext(); ACTIONS.pathNext()'); r.push(['computer: Copy instead of a text link', f.has('[data-copy]') && !f.has('a.sit[href^="sms:"]')]); }
// ---- search ----
{const a=boot(); for(const [q,id] of [['job interview','scary'],['sensory overload','sensory'],['christmas','holidays'],['sunday scaries','sunday'],['new city','newplace'],['cant get out of bed','bed'],['we had a fight','fight'],['waiting for test results','health'],['burned out','burnout'],['chronic pain','pain'],['finals','school'],['broke up','heartbreak'],['i slipped','slipped'],['rent','money'],['abuse','notsafe'],['postpartum','newparent'],['caregiver','caregiver'],['sports betting','gambling'],['trans','lgbtq'],['binge','eating'],['find a therapist','care']]){
  r.push([`search "${q}" → ${id} first`, a.G(`searchMatch(${JSON.stringify(q)})[0].id`)===id]); } }
// ---- safety ----
{const a=boot(); let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/pathStart|moreHelp|leaveQuickly|path-988/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
 r.push(['never on crisis screens', !on]);
 const b=boot(); b.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); for(const x of ['moreHelp','moreHelpAll','pathStart','pathNext','pathOpt']) b.G(`ACTIONS.${x}("slipped")`);
 r.push(['blockIfRed on every action', b.S()==='crisis' && !b.G('ui.path')]);
 r.push(['not in the engine', a.G('INTERVENTION_LIBRARY.every(i=>!PATHS[i.id])')]);
 r.push(['no script errors', a.errs.length===0 && b.errs.length===0]); }
for(const [n,ok,d] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||!d?'':' — '+d));
