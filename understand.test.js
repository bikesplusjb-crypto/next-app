// UNDERSTAND IT (owner handoff, 2026-10-04): optional, one question at a time, 2–3 questions, then a real next step
// through the existing routes/engine. No labels, scores or storage; never argues; crisis and YELLOW rules unchanged.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; w.addEventListener('error',e=>errs.push(e.message));
    w.HTMLCanvasElement.prototype.getContext=function(){ return null; }; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])));
  return {w,click,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const titleOf=a=>a.w.document.getElementById('screen-title').textContent;
const r=[];

// ---- entry ----
{const a=boot();
 r.push(['not on Home (Home unchanged, "I don\'t feel safe" first)', !a.has(act('undStart')) && [...a.w.document.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
 a.G('ACTIONS.dontKnow ? ACTIONS.dontKnow() : (session.screen="dont-know", lastRendered=null, render())'); if(a.S()!=='dont-know') a.G('session.screen="dont-know"; lastRendered=null; render()');
 r.push(['entry: I don\'t know what I need → "Understand it" (a small link, not a big card)', a.has('button.link[data-act="undStart"]') && a.T().includes("Before we change anything, let's see what's going on.") && a.w.document.querySelectorAll('.dk-opt').length===4]);
 for(const st of ['anxious','spiraling']){ const b=boot(); b.G(`ACTIONS.flow(${JSON.stringify(st)})`); r.push([`entry: I'm ${st} → "Understand it first" on the first screen`, b.S()==='before' && b.has(act('undStart'))]); }
 const c=boot(); c.G('ACTIONS.flow("spiraling")'); r.push(['entry: spiraling also offers "Stop figuring it out"', c.has(act('undStopStart'))]);
 const d=boot(); d.G('ACTIONS.flow("craving")'); r.push(['not offered for cravings (the 15-minute delay comes first)', !d.has(act('undStart'))]);
 const e=boot(); e.G('ACTIONS.flow("low")'); r.push(['entry: I feel sad or low → "Understand it first"', e.S()==='sad' && e.has(act('undStart'))]);
 const f=boot(); f.G('ACTIONS.route("connect"); ACTIONS.connMore()'); r.push(['entry: I feel alone → Connect → Something else → "Understand it first"', f.has(act('undStart'))]);
 const g=boot(); g.G('ACTIONS.route("connect")'); r.push(['Connect stays at 8 or fewer choices', g.w.document.querySelectorAll('#app main [data-act], #app main a[href]').length<=8]);
 r.push(['never suggested by the engine as an intervention (only offered by the person\'s own choices)', g.G('INTERVENTION_LIBRARY.every(i=>!/understand/i.test(i.id))')]); }

// ---- questions, one at a time ----
{const a=boot(); a.G('ACTIONS.undStart()');
 r.push(['Q1: "What happened right before this?" with the seven choices, and the lead line', titleOf(a)==='What happened right before this?' && a.T().includes("Before we try to change it, let's figure out what's happening.")
   && JSON.stringify([...a.w.document.querySelectorAll(act('undA1'))].map(b=>b.textContent.trim()))===JSON.stringify(["Something someone said","Something I saw","Something I remembered","Something I'm worried will happen","Something happened","Nothing obvious","I don't know"])]);
 r.push(['one question at a time: no other question, no progress bar, no score', !a.T().includes('What feels hardest') && !a.T().includes('What do you need') && !a.has('progress,[role="progressbar"],.score') && !/\b\d+\s*(of|\/)\s*\d+\b/.test(a.T())]);
 r.push(['Help visible', a.has('header .help-pill[data-act="crisis"]')]);
 a.click(act('undA1','said'));
 r.push(['Q2: "What feels hardest about it?" with the six choices', titleOf(a)==='What feels hardest about it?' && JSON.stringify([...a.w.document.querySelectorAll(act('undA2'))].map(b=>b.textContent.trim()))===JSON.stringify(["What happened","What might happen","What someone thinks of me","Being alone with it","I can't stop thinking about it","I don't know"])]);
 a.click(act('undA2','thinks'));
 r.push(['Q3: "What do you need right now?" with the six choices', titleOf(a)==='What do you need right now?' && JSON.stringify([...a.w.document.querySelectorAll(act('undA3'))].map(b=>b.textContent.trim()))===JSON.stringify(["To calm down","To get it out","Someone to talk to","A change of scene","Something real to do","I don't know"])]);
 a.click(act('undA3','talk'));
 r.push(['ending: "Okay. We know a little more." / "Let\'s take one small step." → Next step', titleOf(a)==='Okay. We know a little more.' && a.T().includes("Let's take one small step.") && a.has(act('undNext'))]);
 a.click(act('undNext')); r.push(['Someone to talk to → Connect', a.S()==='connect' && a.G('ui.und')===null]); }
{const a=boot(); a.G('ACTIONS.undStart()'); a.click(act('undA1','nothing')); r.push(['"Nothing obvious" skips to "What do you need right now?" (no over-asking)', titleOf(a)==='What do you need right now?']);
 const b=boot(); b.G('ACTIONS.undStart()'); b.click(act('undA1','unsure')); r.push(['"I don\'t know" skips to "What do you need right now?"', titleOf(b)==='What do you need right now?']); }
// routing
for(const [k,want] of [['calm','calm'],['out','distract'],['scene','scene'],['real','fs']]){
 const a=boot(); a.G('ACTIONS.undStart()'); a.click(act('undA1','saw')); a.click(act('undA2','what')); a.click(act('undA3',k)); a.click(act('undNext'));
 r.push([`"${k}" → existing ${want}`, a.S()===want]); }
{const a=boot(); a.G('ACTIONS.undStart()'); a.click(act('undA1','unsure')); a.click(act('undA3','unsure')); a.click(act('undNext'));
 r.push(['"I don\'t know" → the existing engine (recommendation)', ['recommendation','human-first'].includes(a.S()) && !!a.G('ui.engine')]); }
{const a=boot(); a.G('ACTIONS.undStart()'); let n=0; a.click(act('undA1','worried')); n++; a.click(act('undA2','might')); n++; a.click(act('undA3','calm')); n++;
 r.push(['at most three questions before the next step', n===3 && a.S()==='understand-next']); }

// ---- What else could be true? ----
{const a=boot(); a.G('ACTIONS.undStart()'); a.click(act('undThought'));
 r.push(['What else could be true: the thought choices', titleOf(a)==='What is the thought saying?' && a.w.document.querySelectorAll(act('undThoughtPick')).length===4]);
 a.click(act('undThoughtPick','nobody'));
 r.push(['"Nobody cares about me." → "That\'s how it feels right now." / "What else could be true?"', a.T().includes("That's how it feels right now.") && titleOf(a)==='What else could be true?']);
 r.push(['… the five possibilities, "I don\'t know" included', JSON.stringify([...a.w.document.querySelectorAll(act('undElse'))].map(b=>b.textContent.trim()))===JSON.stringify(["Someone cares, but isn't here","I haven't reached out","Something happened that made me feel this way","I'm overwhelmed right now","I don't know"])]);
 r.push(['… choosing it as theirs follows the existing YELLOW rule ("nobody cares")', a.G('session.yellow')===true]);
 a.click(act('undElse','4')); r.push(['… any answer (even "I don\'t know") → one small step', a.S()==='understand-next']); }
{const a=boot(); a.G('ACTIONS.undStart(); ACTIONS.undThought()'); a.click(act('undThoughtPick','hates'));
 r.push(['"Everyone hates me." → "It feels that way right now." + its four possibilities', a.T().includes('It feels that way right now.') && a.w.document.querySelectorAll(act('undElse')).length===4 && a.T().includes('Someone is upset with me, but that isn\'t everyone')]);
 const b=boot(); b.G('ACTIONS.undStart(); ACTIONS.undThought()'); b.click(act('undThoughtPick','screw'));
 r.push(['"I\'m going to screw everything up." → "That\'s what your mind is predicting."', b.T().includes("That's what your mind is predicting.") && b.T().includes("I might make a mistake, but not ruin everything") && b.G('session.yellow')===false]);
 const c=boot(); c.G('ACTIONS.undStart(); ACTIONS.undThought()'); c.click(act('undThoughtPick','handle'));
 r.push(['"I can\'t handle this." → "It feels like too much right now." / "What would make the next 10 minutes easier?"', c.T().includes('It feels like too much right now.') && titleOf(c)==='What would make the next 10 minutes easier?' && c.has(act('undA3','calm'))]); }
{const a=boot(); a.G('ACTIONS.undStart(); ACTIONS.undThought()'); a.w.document.getElementById('undOwn').value='I always ruin things'; a.click(act('undThoughtOwn'));
 r.push(['own words: checked, then "What else could be true?"', titleOf(a)==='What else could be true?' && a.T().includes("That's how it feels right now.") && !a.T().includes('I always ruin things')]);
 r.push(['own words: never stored or kept', !a.dump().includes('ruin things') && !JSON.stringify(a.G('ui')).includes('ruin things')]); }

// ---- Stop figuring it out ----
{const a=boot(); a.G('ACTIONS.undStart()'); a.click(act('undA1','remembered')); a.click(act('undA2','loop'));
 r.push(['"I can\'t stop thinking about it" → Stop figuring it out', titleOf(a)==="You've been trying to solve this in your head." && a.T().includes("Let's stop solving it for a minute.")]);
 r.push(['Look · Touch · Move · Drink · Step outside', JSON.stringify([...a.w.document.querySelectorAll(act('undStop'))].map(b=>b.textContent.trim()))==='["Look","Touch","Move","Drink","Step outside"]']); }
for(const [k,ok] of [['look',a=>a.S()==='fs'],['touch',a=>a.G('session.currentInterventionId')==='touch_real_world'],['move',a=>a.S()==='scene'],['drink',a=>a.G('session.currentInterventionId')==='warm_comfort'],['outside',a=>a.G('session.currentInterventionId')==='change_scene' && a.G('ui.sceneOpt')==='outside']]){
 const a=boot(); a.G('ACTIONS.flow("spiraling")'); a.click(act('undStopStart')); a.click(act('undStop',k));
 r.push([`Stop figuring it out: ${k} → an existing experience`, ok(a)]); }

// ---- safety ----
{const a=boot(); a.G('ACTIONS.undStart(); ACTIONS.undThought()'); const before=a.dump();
 a.w.document.getElementById('undOwn').value='I want to kill myself'; a.click(act('undThoughtOwn'));
 r.push(['RED in own words → the existing crisis screen at once, nothing saved, questions stop', a.S()==='crisis' && a.dump()===before && a.G('ui.und')===null && !/What else could be true|What happened right before/.test(a.T())]);
 for(const x of ['undStart','undA1','undA2','undA3','undNext','undThought','undElse','undStop','undStopStart']) a.G(`ACTIONS.${x}("said")`);
 r.push(['blockIfRed on every action', a.S()==='crisis']); }
{const a=boot(); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"})'); a.G('ACTIONS.undStart()');
 const barOnQ=a.has('.ybar'); a.click(act('undA1','unsure')); a.click(act('undA3','calm')); a.click(act('undNext'));
 r.push(['YELLOW persists through Understand it (support bar on the questions and after)', barOnQ && a.G('session.yellow')===true && a.G('session.safetyLevel')==='YELLOW' && a.has('.ybar')]); }
{const a=boot(); let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/data-act="und/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
 r.push(['never on crisis screens', !on]); }

// ---- copy rules / boundaries ----
{const a=boot(); const copy=JSON.stringify(a.G('UNDERSTAND'));
 r.push(['never argues or forces positivity', !/not true|think positive|grateful|everything will be okay|cheer up|look on the bright side/i.test(copy)]);
 r.push(['no clinical labels or diagnoses', !/depress|anxiety disorder|you have anxiety|trauma|attachment|personality|disorder|diagnos|symptom|ptsd|bipolar|therapy|therapist/i.test(copy)]);
 r.push(['no scores, profiles or counts', !/score|profile|percent|level \d|points?\b/i.test(copy)]);
 r.push(['no copyrighted character references in the app', !/Dr\.? Charles|Chicago Med|Oliver Platt/i.test(HTML)]);
 r.push(['nothing saved walking the flow', (()=>{ a.G('saveStore()'); const b=a.dump().replace(/\\"activity\\":\[[^\]]*\]/,''); a.G('ACTIONS.undStart(); ACTIONS.undA1("said"); ACTIONS.undA2("what"); ACTIONS.undA3("calm")'); return a.dump().replace(/\\"activity\\":\[[^\]]*\]/,'')===b; })()]);
 r.push(['no script errors', a.errs.length===0]); }

for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
