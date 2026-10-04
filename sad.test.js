// Stage 6.23: "I feel sad or low". A first screen (Zags under a small soft cloud), "Let it out" one idea at a time,
// "One sad song, then one gentler one", the two-weeks line at the end. Nothing saved; never on crisis screens.
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
const r=[];

// ---- Home chip and first screen ----
{const a=boot(); const chip=[...a.w.document.querySelectorAll('.sit')].find(x=>x.dataset.act==='flow' && x.dataset.arg==='low');
 r.push(['Home chip renamed "I feel sad or low"', !!chip && chip.textContent==='I feel sad or low' && !a.T().includes('I feel low ')]);
 const btns=[...a.w.document.querySelectorAll('#app main [data-act]')]; r.push(['"I don\'t feel safe" still comes first on Home', btns.find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
 chip.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true})); const t=a.T();
 r.push(['first screen: "Feels like a dark cloud over you?"', a.S()==='sad' && t.includes('Feels like a dark cloud over you?')]);
 r.push(['then "It\'s okay to feel sad. You don\'t have to fix it right now."', t.includes("It's okay to feel sad. You don't have to fix it right now.")]);
 r.push(['smaller: "You\'re the sky, not the cloud. Clouds can be heavy, and they still move."', a.w.document.querySelector('.sad-sky.small').textContent==="You're the sky, not the cloud. Clouds can be heavy, and they still move."]);
 r.push(['Zags (the brand mark) with a small soft-gray cloud above him', a.has('.sad-art .zmark') && a.has('.sad-art .sad-cloud svg') && a.w.document.querySelector('.sad-art').firstElementChild.classList.contains('sad-cloud') && /#C9CED1/.test(a.w.document.querySelector('.sad-cloud').innerHTML)]);
 r.push(['same Zags character as the brand mark (zagsMark)', a.w.document.querySelector('.sad-art .zmark').outerHTML===a.G('(()=>{ const d=document.createElement("div"); d.innerHTML=zagsMark("zmark-lg sad-zags"); return d.firstElementChild.outerHTML; })()')]);
 r.push(['the cloud is still with reduced motion', /@media \(prefers-reduced-motion:reduce\)\{\.sad-cloud\{animation:none\}\}/.test(HTML) && /:root\.reduce \*[^{]*\{animation:none!important/.test(HTML)]);
 r.push(['two choices: "Let it out" and "Do one tiny thing"', a.has(act('sadOut')) && a.has(act('sadTiny')) && a.w.document.querySelectorAll('.actions [data-act]').length===2]);
 r.push(['Help visible', a.has('header .help-pill[data-act="crisis"]')]);
 a.click(act('sadTiny')); r.push(['"Do one tiny thing" → the existing low path (optional rating)', a.S()==='before' && a.G('session.currentState')==='low']);
 a.click(act('beforeSkip')); r.push(['… then the existing low options, unchanged', a.S()==='low-choose' && a.w.document.querySelectorAll('.list .card').length===8]); }

// ---- Let it out ----
{const a=boot(); a.G('ACTIONS.flow("low")'); a.click(act('sadOut'));
 const seen=[];
 r.push(['"Let it out" starts with "Let it rain" ("Crying is allowed. It often helps.")', a.S()==='sad-out' && a.T().includes('Let it rain') && a.T().includes('Crying is allowed. It often helps.')]);
 r.push(['one idea at a time, with "Another idea" and "I\'m done for now"', a.w.document.querySelectorAll('.step-big').length===1 && a.has(act('sadNext')) && a.has(act('sadEnd'))]);
 seen.push(a.w.document.getElementById('screen-title').textContent);
 for(let i=0;i<4;i++){ a.w.document.querySelector('.actions .btn-secondary[data-act="sadNext"]').dispatchEvent(new a.w.MouseEvent('click',{bubbles:true})); seen.push(a.w.document.getElementById('screen-title').textContent); }
 r.push(['five ideas in order', JSON.stringify(seen)===JSON.stringify(["Let it rain","Sit with it for a minute","Put it somewhere","One sad song, then one gentler one","Find a gap in the clouds"])]);
 r.push(['"Find a gap in the clouds": the line, then the tiny-things list', a.T().includes("Find one small thing that's a little lighter: a window, a song, a text from someone.") && a.has(act('sadTiny','list'))]);
 a.click(act('sadTiny','list')); r.push(['… goes straight to the tiny things', a.S()==='low-choose']);
 a.G('ACTIONS.flow("low"); ACTIONS.sadOut(); ACTIONS.sadNext()'); a.click(act('sadSit'));
 const t=a.T(); r.push(['"Sit with it for a minute": a calm screen, no timer', a.S()==='sad-sit' && !a.has('[role="timer"]') && !/\d:\d\d/.test(t) && a.G('typeof ui.minuteEnd==="undefined" || !ui.minuteEnd')]);
 a.click(act('sadNext')); r.push(['… then the next idea', a.S()==='sad-out' && a.T().includes('Put it somewhere')]);
 r.push(['"Put it somewhere": A line for today, Doodle, Turn it into a song', a.has(act('diaryWrite')) && a.has(act('doodleStart')) && a.has(act('songStart','sad'))]);
 a.click(act('songStart','sad')); r.push(['… the song keeps the "low" state', a.S()==='song' && a.G('session.currentState')==='low']);
 a.G('ACTIONS.flow("low"); ACTIONS.sadOut(); ACTIONS.sadNext(); ACTIONS.sadNext()'); a.click(act('doodleStart')); r.push(['… Doodle opens', a.S()==='doodle']);
 a.G('ACTIONS.flow("low"); ACTIONS.sadOut(); ACTIONS.sadNext(); ACTIONS.sadNext()'); a.click(act('diaryWrite')); r.push(['… A line for today opens', a.S()==='diary-feel']); }
{const a=boot(); a.G('ACTIONS.flow("low"); ACTIONS.sadOut(); ACTIONS.sadNext(); ACTIONS.sadNext(); ACTIONS.sadNext()'); const t=a.T();
 r.push(['"One sad song, then one gentler one": the person picks; no links or recommendations', t.includes("Play one song that matches how you feel. Then one that's a little lighter. You pick them.") && !a.has('#app main a[href]')]);
 r.push(['no music services anywhere in the sad path', !/spotify|apple music|youtube|pandora|playlist/i.test(JSON.stringify(a.G('SAD')))]); }

// ---- ending ----
{const a=boot(); a.G('ACTIONS.flow("low"); ACTIONS.sadOut()'); for(let i=0;i<5;i++) a.G('ACTIONS.sadNext()');
 r.push(['after all five ideas: the ending', a.S()==='sad-end']);
 const t=a.T(); r.push(['ending: "If you\'ve felt this way most days for two weeks or more, talking to a doctor or counselor can really help."', t.includes("If you've felt this way most days for two weeks or more, talking to a doctor or counselor can really help.")]);
 r.push(['ending choices: Put the phone down, Talk to someone, Do one tiny thing', a.has(act('putDown')) && a.has(act('route','connect')) && a.has(act('sadTiny','list'))]);
 const b=boot(); b.G('ACTIONS.flow("low"); ACTIONS.sadOut()'); b.click(act('sadEnd')); r.push(['"I\'m done for now" → the ending', b.S()==='sad-end']); }

// ---- nothing saved, safety, crisis ----
{const a=boot(); a.G('saveStore()'); const strip=()=>{ const o=JSON.parse(a.dump()); const sv=JSON.parse(o['next.v1.sensitive']||'{}'); const acts=(sv.activity||[]).map(x=>x.type); delete sv.activity; o['next.v1.sensitive']=sv; return [JSON.stringify(o),acts]; };
 const [before]=strip();
 a.G('ACTIONS.flow("low"); ACTIONS.sadOut(); ACTIONS.sadNext(); ACTIONS.sadSit(); ACTIONS.sadNext(); ACTIONS.sadEnd()');
 const [after,acts]=strip();
 r.push(['nothing from the sad path is saved (only the usual "moment" activity, no words, no choices)', after===before && JSON.stringify(acts)==='["moment"]']); }
{const a=boot(); a.G('ACTIONS.flow("low")'); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})');
 for(const x of ['sadOut','sadNext','sadSit','sadEnd','sadTiny']) a.G(`ACTIONS.${x}()`);
 r.push(['blockIfRed on every action', a.S()==='crisis']);
 let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/sad-cloud|sad-art/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
 r.push(['the cloud never appears on crisis screens', !on && a.G('session.screen="crisis"; sadCloud()')==='']);
 r.push(['no script errors', a.errs.length===0]); }
{const a=boot(); r.push(['not in the engine (only the person opens it)', a.G('INTERVENTION_LIBRARY.every(i=>!/^sad/.test(i.id) && !/^sad/.test(String(i.route||"")))')]); }

for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
