// Your reset map (owner request, 2026-10-06): what helped this person before, by situation, from check-ins already on
// the phone. Counts, never percentages or scores; "You've been here before" on the first screen of a flow.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; w.addEventListener('error',e=>errs.push(e.message)); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  return {w,click,T,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const H=(st,id,b,a,extra='')=>`{source:"session",state:"${st}",interventionId:"${id}",before:${b},after:${a},timestamp:Date.now()-${Math.floor(Math.random()*1e6)}${extra}}`;
const r=[];
{const a=boot(); a.G('ACTIONS.tab("progress")');
 r.push(['empty: explains how it fills in', a.has('.reset-map') && a.T().includes(a.G('RESET_MAP.empty')) && !a.has(act('mapTry'))]); }
{const a=boot();
 a.G(`store.sensitive.baseHistory=[${H('anxious','walking',8,5)},${H('anxious','walking',7,4)},${H('anxious','walking',6,6)},${H('anxious','breathing',8,7)},${H('anxious','grounding',7,7)},${H('craving','craving_delay',9,6)},${H('spiraling','thought_parking',8,null,',helped:true')}]; saveStore()`);
 a.G('ACTIONS.tab("progress")'); const t=a.T();
 r.push(['groups by situation', t.includes("When you're anxious") && t.includes("When there's an urge") && t.includes("When you're spiraling")]);
 r.push(['counts, not percentages: "Helped 2 of 3 times"', t.includes('WalkingHelped 2 of 3 times') && !/%/.test(a.w.document.querySelector('.reset-map').textContent)]);
 r.push(['ordered by what helped most (Walking before Breathing)', t.indexOf('Walking')<t.indexOf('Breathing')]);
 r.push(['things that never helped are left out (Grounding 7 → 7)', !a.has(act('mapTry','anxious|grounding'))]);
 r.push(['"That helped" with no rating still counts', a.has(act('mapTry','spiraling|thought_parking'))]);
 r.push(['"Not a score." note', t.includes(a.G('RESET_MAP.note'))]);
 a.click(act('mapTry','anxious|walking'));
 r.push(['Try it → the flow starts with that step ("Okay. We\'ll start with Walking.")', a.S()==='before' && a.G('ui.firstPick')==='walking' && a.T().includes("Okay. We'll start with Walking.")]);
 a.click(act('beforeSkip')); r.push(['…and then runs it', a.G('session.currentInterventionId')==='walking']); }
{const a=boot(); a.G(`store.sensitive.baseHistory=[${H('anxious','walking',9,5).replace(/timestamp:[^}]+/,'timestamp:1000')},${H('anxious','breathing',8,6).replace(/timestamp:[^}]+/,'timestamp:2000')}]; saveStore()`);
 a.G('ACTIONS.flow("anxious")');
 r.push(['"You\'ve been here before. Last time, Breathing took you from 8 → 6." (the most recent)', a.T().includes("You've been here before. Last time, Breathing took you from 8 → 6.")]);
 a.click(act('mapAgain','breathing')); r.push(['Try that again → "Okay. We\'ll start with Breathing."', a.G('ui.firstPick')==='breathing' && a.T().includes("Okay. We'll start with Breathing.") && !a.has(act('mapAgain'))]);
 a.click(act('beforeContinue')); r.push(['…and Continue starts it', a.G('session.currentInterventionId')==='breathing']);
 const b=boot(); b.G('ACTIONS.flow("anxious")'); r.push(['no history: no "been here" line', !b.T().includes("You've been here before")]);
 const c=boot(); c.G(`store.sensitive.baseHistory=[${H('anxious','walking',9,5)}]; dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"}); ACTIONS.flow("anxious")`); r.push(['hidden while YELLOW', !c.T().includes("You've been here before")]); }
{const a=boot(); a.G('ACTIONS.flow("anxious"); ACTIONS.beforeSkip()'); a.G('session.screen="checkin"; lastRendered=null; render()'); a.click(act('ciHelped'));
 const last=a.G('JSON.stringify(session.sessionHistory.at(-1))'); r.push(['"That helped" is noted on its check-in (helped:true)', JSON.parse(last).helped===true]);
 r.push(['export includes it', a.G('JSON.stringify(buildExport().checkIns.at(-1))').includes('"helped":true')]); }
{const a=boot(); a.G(`store.sensitive.baseHistory=[${H('anxious','walking',9,5)}]`); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"}); ACTIONS.mapTry("anxious|walking"); ACTIONS.mapAgain("walking")');
 r.push(['blockIfRed', a.S().startsWith('crisis')]);
 const b=boot(); b.G('ACTIONS.mapTry("anxious|nope"); ACTIONS.mapTry("crisis|walking")'); r.push(['ignores unknown steps or situations', b.S()==='home']);
 r.push(['no script errors', a.errs.length===0 && b.errs.length===0]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
