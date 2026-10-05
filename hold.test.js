// Hold & answer (owner handoff, 2026-10-05): hold your thumb gently while answering five easy questions, one at a
// time. Optional hand step; no scores, claims or storage; typed answer safety-checked; existing routes reused.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; w.addEventListener('error',e=>errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext=()=>null; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])));
  return {w,click,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const title=a=>a.w.document.getElementById('screen-title').textContent;
const Q=["What do you see right now?","What do you hear right now?","What can you feel right now?","Can you feel your feet on the floor?","What do you need right now?"];
const r=[];
const toQ1=(a,{noHand=false}={})=>{ a.G('ACTIONS.route("calm")'); a.click(act('holdStart')); a.click(act('holdNext')); a.click(act(noHand?'holdNoHand':'holdNext')); };

// ---- entry ----
{const a=boot(); a.G('ACTIONS.route("calm")');
 r.push(['entry: Calm → "Hold & answer"', a.has(act('holdStart')) && a.T().includes('Hold & answer')]);
 r.push(['Calm stays at 8 or fewer choices', a.w.document.querySelectorAll('#app main [data-act], #app main a[href]').length<=8]);
 r.push(['in the library for anxious and spiraling moments (the engine / Let\'s Zig may offer it)', a.G('JSON.stringify(findIntervention("hold_answer").states)')==='["anxious","spiraling"]' && a.G('findIntervention("hold_answer").channel')==='BODY']);
 a.click(act('holdStart'));
 r.push(['intro: "Try something with me." / "Hold your thumb gently." / "Squeeze while you answer each question." / "There\'s no right answer." → Start', title(a)==='Try something with me.' && a.T().includes('Hold your thumb gently.') && a.T().includes('Squeeze while you answer each question.') && a.T().includes("There's no right answer.") && a.w.document.querySelector(act('holdNext')).textContent.trim()==='Start']);
 a.click(act('holdNext'));
 r.push(['hand: "Hold your thumb gently." / "Squeeze. Release." / "Keep doing that while you answer." with "I\'d rather not"', title(a)==='Hold your thumb gently.' && a.T().includes('Squeeze. Release.') && a.T().includes('Keep doing that while you answer.') && a.has(act('holdNoHand'))]); }

// ---- normal flow: one question at a time ----
{const a=boot(); toQ1(a); const seen=[];
 for(let i=0;i<3;i++){ seen.push([title(a), Q.filter(q=>a.T().includes(q)).length, a.T().includes('Keep holding your thumb gently while you answer.')]); a.click(act('holdNext')); }
 seen.push([title(a), Q.filter(q=>a.T().includes(q)).length]);
 r.push(['questions 1–4 appear one at a time, in order', JSON.stringify(seen.map(x=>x[0]))===JSON.stringify(Q.slice(0,4)) && seen.every(x=>x[1]===1)]);
 r.push(['"Keep holding your thumb gently while you answer." on question 1', seen[0][2]===true]);
 r.push(['question 4: Yes · A little · Not right now', JSON.stringify([...a.w.document.querySelectorAll(act('holdFeet'))].map(b=>b.textContent.trim()))==='["Yes","A little","Not right now"]']);
 a.click(act('holdFeet','yes'));
 r.push(['question 5 alone, with Quiet · A distraction · Someone · A small step · I don\'t know', title(a)===Q[4] && Q.filter(q=>a.T().includes(q)).length===1 && JSON.stringify([...a.w.document.querySelectorAll(act('holdNeed'))].map(b=>b.textContent.trim()))==='["Quiet","A distraction","Someone","A small step","I don\'t know"]']);
 a.click(act('holdNeed','quiet'));
 r.push(['after question 5: "You stayed with this moment for five questions." / "You don\'t have to solve everything right now." / "What would help next?"', a.S()==='hold-end' && title(a)==='You stayed with this moment for five questions.' && a.T().includes("You don't have to solve everything right now.") && a.T().includes('What would help next?')]);
 r.push(['four choices at most: Calm my body · Get out of my head · Connect · I\'m not sure', a.w.document.querySelectorAll('#app main [data-act]').length===4 && ['Calm my body','Get out of my head','Connect',"I'm not sure"].every(x=>a.T().includes(x))]);
 r.push(['ending gives permission to leave: "That\'s enough for now. You can put me away for a few minutes."', a.T().includes("That's enough for now. You can put me away for a few minutes.") && a.has('header [data-act="home"], header .x, header [aria-label="Close"]')]); }
for(const k of ['yes','little','notnow']){ const a=boot(); toQ1(a); for(let i=0;i<3;i++) a.click(act('holdNext')); a.click(act('holdFeet',k)); r.push([`question 4: "${k}" continues to question 5`, title(a)===Q[4]]); }
for(const [need,first] of [['quiet','calm'],['distraction','head'],['someone','connect'],['step','unsure'],['unsure','unsure']]){
 const a=boot(); toQ1(a); for(let i=0;i<3;i++) a.click(act('holdNext')); a.click(act('holdFeet','little')); a.click(act('holdNeed',need));
 r.push([`question 5: "${need}" → the end screen, with the matching next step first (${first}); all four still there`, a.S()==='hold-end' && a.w.document.querySelector(act('holdAfter')).dataset.arg===first && a.w.document.querySelectorAll(act('holdAfter')).length===4]); }
for(const [k,want] of [['calm','calm'],['head','distract'],['connect','connect'],['unsure','dont-know']]){
 const a=boot(); toQ1(a); for(let i=0;i<3;i++) a.click(act('holdNext')); a.click(act('holdFeet','yes')); a.click(act('holdNeed','quiet')); a.click(act('holdAfter',k));
 r.push([`"${k}" → the existing ${want} screen`, a.S()===want && !a.G('ui.hold')]); }

// ---- I'd rather not ----
{const a=boot(); toQ1(a,{noHand:true});
 r.push(['"I\'d rather not" → straight to the questions, no hand instruction', title(a)===Q[0] && !/thumb|squeeze/i.test(a.T())]);
 for(let i=0;i<3;i++) a.click(act('holdNext')); a.click(act('holdFeet','notnow')); a.click(act('holdNeed','unsure'));
 r.push(['fully usable without the hand step (reaches the end)', a.S()==='hold-end']);
 r.push(['nothing ever requires holding a gesture (plain taps only)', !/pointerdown|touchstart/.test(HTML.slice(HTML.indexOf('HOLD & ANSWER: one screen'), HTML.indexOf('"hold-end"(){')))]); }

// ---- free text ----
{const a=boot(); toQ1(a); for(let i=0;i<3;i++) a.click(act('holdNext')); a.click(act('holdFeet','yes')); const before=a.dump();
 a.w.document.getElementById('holdOwn').value='Just a minute to breathe'; a.click(act('holdOwn'));
 r.push(['own answer: checked, then the end screen; not kept or shown', a.S()==='hold-end' && a.dump()===before && !a.T().includes('Just a minute to breathe') && !JSON.stringify(a.G('ui')).includes('minute to breathe')]); }
{const a=boot(); toQ1(a); for(let i=0;i<3;i++) a.click(act('holdNext')); a.click(act('holdFeet','yes')); const before=a.dump();
 a.w.document.getElementById('holdOwn').value='I want to kill myself'; a.click(act('holdOwn'));
 r.push(['crisis wording → the existing crisis screen at once, nothing saved, the sequence stops', a.S()==='crisis' && a.G('session.safetyLevel')==='RED' && a.dump()===before && !JSON.stringify(a.G('ui')).includes('kill myself')]);
 r.push(['the crisis screen is the existing one: 988 first', a.w.document.querySelector('#app main a.btn').getAttribute('href')==='tel:988']);
 for(const x of ['holdStart','holdNext','holdNoHand','holdFeet','holdNeed','holdOwn','holdAfter']) a.G(`ACTIONS.${x}("yes")`);
 r.push(['blockIfRed on every action', a.S()==='crisis']); }
{const a=boot(); toQ1(a); for(let i=0;i<3;i++) a.click(act('holdNext')); a.click(act('holdFeet','yes'));
 a.w.document.getElementById('holdOwn').value='I feel hopeless'; a.click(act('holdOwn'));
 r.push(['YELLOW wording → support bar on, continues', a.G('session.yellow')===true && a.S()==='hold-end']); }

// ---- copy rules / boundaries ----
{const a=boot(); const copy=JSON.stringify(a.G('HOLD'));
 r.push(['no claims it worked or that the person is calm or safe', !/anxiety should be gone|calm now|fixed it|this worked|nervous system|safe now|you are safe|treat|cure|stop(s)? anxiety/i.test(copy)]);
 r.push(['no scores, ratings, symptom or clinical language', !/score|rate|rating|1.?10|severity|symptom|heart|vagus|brain|diagnos|clinical|disorder/i.test(copy)]);
 r.push(['never claims to detect the action', !/I can feel you|until I tell you|detect|sensor/i.test(copy)]);
 r.push(['never asks to squeeze hard or for a set time', !/hard|tight|seconds|as long as|pain/i.test(copy)]);
 r.push(['no counts, progress meters or celebrations', !/\d\s*(\/|of|·)\s*5|complete|well done|great job|points|streak/i.test(copy+a.T())]);
 let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/data-act="hold/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
 r.push(['never on crisis screens', !on]);
 a.G('ACTIONS.holdStart()'); r.push(['no Zags in the exercise', !a.has('.zmark,.zface')]);
 r.push(['no script errors', a.errs.length===0]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
