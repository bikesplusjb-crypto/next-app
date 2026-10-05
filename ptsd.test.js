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

// ================= C. It's happening right now =================
const FIX=new Date(2026,9,5,21,41).getTime();   // Monday, October 5, 2026, 9:41 PM
{const a=boot({now:FIX}); a.G('ACTIONS.ptsdStart()'); a.click(act('ptsdPath','now'));
 const t=a.T();
 r.push(['C1: the Now screen reads the phone\'s clock', a.S()==='ptsd-now' && t.includes("It's Monday, October 5, 2026.") && t.includes("It's 9:41 PM.") && t.includes('That was then. This is now.')]);
 r.push(['C1: very large type', a.has('.ptsd-big.ptsd-day') && /\.ptsd-big\{font-size:clamp\(30px/.test(HTML)]);
 const steps=[]; for(let i=0;i<4;i++){ a.click(act('ptsdStep')); steps.push(a.w.document.getElementById('screen-title').textContent); }
 r.push(['C2–5: one instruction per screen, in order', JSON.stringify(steps)===JSON.stringify(["Put both feet flat on the floor. Press down.","Look around. Name three things you can see, out loud or in your head.","Drink something cold, or hold something cool in your hands.","Say where you are, out loud if you can."])]);
 r.push(['C: a single Next button on each step', a.w.document.querySelectorAll('.actions [data-act]').length===1 && a.has(act('ptsdStep'))]);
 a.click(act('ptsdStep')); r.push(['C6: back to the Now screen', a.T().includes("It's Monday, October 5, 2026.") && a.T().includes('That was then. This is now.')]);
 a.click(act('ptsdStep'));
 r.push(['C6: "Do you want to reach someone?" → veteran option, Talk to someone, I\'m okay for now', a.S()==='ptsd-reach' && a.T().includes('Do you want to reach someone?') && a.has(act('ptsdPath','vet')) && a.has(act('route','connect')) && a.has(act('putDown'))]); }
{const a=boot(); a.G('ACTIONS.ptsdStart(); ACTIONS.ptsdPath("now")'); const t1=a.G('ptsdNowText()[1]');
 const real=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}); r.push(['C1: uses the real current time', t1==="It's "+real+"." || t1==="It's "+new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})+"."]); }
// ================= D. Nightmare =================
const NIGHT=new Date(2026,9,5,2,41).getTime();   // night mode (midnight to 6am)
{const a=boot({now:NIGHT}); a.G('ACTIONS.ptsdStart()'); a.click(act('ptsdPath','nightmare'));
 r.push(['D1: "Turn on a light."', a.S()==='ptsd-night' && a.w.document.getElementById('screen-title').textContent==='Turn on a light.']);
 a.click(act('ptsdStep')); r.push(['D2: the Now screen with "It\'s over. You\'re here now."', a.T().includes("It's Monday, October 5, 2026.") && a.T().includes("It's 2:41 AM.") && a.T().includes("It's over. You're here now.")]);
 a.click(act('ptsdStep')); r.push(['D3: "Drink some water. Sit up for a minute."', a.w.document.getElementById('screen-title').textContent==='Drink some water. Sit up for a minute.']);
 a.click(act('ptsdStep')); r.push(['D4: Calm down with Zags · Cozy up for sleep (night) · Talk to someone · Put the phone down', a.S()==='ptsd-night-opts' && a.has(act('zags','calm')) && a.has(act('ptsdCozy')) && a.has(act('route','connect')) && a.has(act('putDown'))]);
 a.click(act('ptsdCozy')); r.push(['D4: Cozy up for sleep opens the existing sleep steps', a.S()==='cozy-step' && a.G('ui.cozy.sleep')===true]); }
{const DAY=new Date(2026,9,5,14,0).getTime(); const a=boot({now:DAY}); a.G('ACTIONS.ptsdStart(); ACTIONS.ptsdPath("nightmare"); ACTIONS.ptsdStep(); ACTIONS.ptsdStep(); ACTIONS.ptsdStep()');
 r.push(['D4: Cozy up for sleep only at night', a.S()==='ptsd-night-opts' && !a.has(act('ptsdCozy'))]); }
// C/D plain: no inputs, no Zags, no animation
{const a=boot(); let bad='';
 for(const [path,scr,n] of [['now','ptsd-now',6],['nightmare','ptsd-night',3]]){
   a.G(`ACTIONS.ptsdStart(); ACTIONS.ptsdPath(${JSON.stringify(path)})`);
   for(let i=0;i<=n;i++){ if(a.has('#app main input, #app main textarea')) bad+=a.S()+':input '; if(a.has('.zmark,.zface,.zcard,svg.zags')) bad+=a.S()+':zags '; if(a.has('main.screen.enter')) bad+=a.S()+':anim '; if(!a.has('header .help-pill[data-act="crisis"]')) bad+=a.S()+':help '; a.G('ACTIONS.ptsdStep()'); }
 }
 r.push(['C/D: no text inputs, no Zags, no animation, Help on every screen', !bad, bad]); }
{const a=boot(); a.G('ACTIONS.ptsdStart(); ACTIONS.ptsdPath("now")'); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); a.G('ACTIONS.ptsdStep()');
 r.push(['C/D: blockIfRed on Next', a.S()==='crisis']); }

// ================= E. On edge =================
{const a=boot(); a.G('ACTIONS.ptsdStart()'); a.click(act('ptsdPath','edge'));
 r.push(['E1: "Your body learned to stay ready. It\'s not a flaw, and it\'s not your fault."', a.S()==='ptsd-edge' && a.T().includes("Your body learned to stay ready. It's not a flaw, and it's not your fault.") && a.G('session.currentInterventionId')==='on_edge']);
 a.click(act('ptsdEdgeNext')); const seen=[a.w.document.getElementById('screen-title').textContent];
 r.push(['E2: one idea at a time, optional ("Another idea", "How do I feel now?")', a.has(act('stepCheckin')) && a.w.document.querySelectorAll('.actions .btn-secondary[data-act="ptsdEdgeNext"]').length===1]);
 for(let i=0;i<3;i++){ a.w.document.querySelector('.actions .btn-secondary[data-act="ptsdEdgeNext"], .actions .btn-primary[data-act="ptsdEdgeNext"]').dispatchEvent(new a.w.MouseEvent('click',{bubbles:true})); seen.push(a.w.document.getElementById('screen-title').textContent); }
 r.push(['E2: the four ideas in order', JSON.stringify(seen)===JSON.stringify(["Sit where you can see the door, if that helps.","Breathe for 1 minute.","Take a short walk.","Step away before you say something you don't mean. You can come back to it."])]);
 a.click(act('ptsdEdgeNext')); r.push(['E3: then the normal check-in', a.S()==='checkin']); }
{const a=boot(); a.G('ACTIONS.ptsdStart(); ACTIONS.ptsdPath("edge"); ACTIONS.ptsdEdgeNext(); ACTIONS.ptsdEdgeNext()'); a.click(act('calmPick','breathe'));
 r.push(['E2: Breathe for 1 minute → the existing breathing step', a.G('session.currentInterventionId')==='breathing']);
 const b=boot(); b.G('ACTIONS.ptsdStart(); ACTIONS.ptsdPath("edge"); ACTIONS.ptsdEdgeNext(); ACTIONS.ptsdEdgeNext(); ACTIONS.ptsdEdgeNext()'); b.click(act('scenePick','walk'));
 r.push(['E2: Take a short walk → the existing walk step', b.G('session.currentInterventionId')==='change_scene' && b.G('ui.sceneOpt')==='walk']); }
{const a=boot(); a.G('ACTIONS.ptsdStart(); ACTIONS.ptsdPath("edge"); ACTIONS.ptsdEdgeNext()'); a.click(act('stepCheckin')); a.click(act('ciBad'));
 r.push(['E3: "I still feel bad" → Let\'s Zig: the next step comes from a different direction than BODY', ['recommendation','human-first'].includes(a.S()) && a.G('ui.zigFrom')==='BODY' && a.G('!ui.engine.interventionId || findIntervention(ui.engine.interventionId).channel!=="BODY"')]); }
{const a=boot(); r.push(['E: never suggested by the engine (no states)', a.G('findIntervention("on_edge").states.length')===0 && a.G('findIntervention("on_edge").channel')==='BODY']); }

//@@PARTS@@

for(const [n,ok,info] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||info===undefined?'':' ('+info+')'));
