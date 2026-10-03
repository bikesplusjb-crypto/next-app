// Stage 6.7b: Snuggle Zags. Short comfort mode: slow breathing, a heartbeat glow, optional buzz and sound (both off by default).
// Fixed lengths (2/3/5 min, default 3), no endless mode; ends with one scripted line, then the usual check-in. Only settings are stored.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot({vibrate=false,audio=false}={}){
 const buzz=[];
 const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   if(vibrate) w.navigator.vibrate=p=>{ buzz.push(p); return true; };
   if(audio) w.AudioContext=function(){ this.currentTime=0; this.destination={}; this.closed=false;
     this.createOscillator=()=>({type:'',frequency:{value:0},connect(){},start(){},stop(){}});
     this.createGain=()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}});
     this.close=()=>{ this.closed=true; }; w.__ctx=this; }; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 // Controllable clock and timers
 const T={now:Date.now(), timeouts:[], intervals:[]};
 const hold=()=>{ w.Date.now=()=>T.now; w.setTimeout=(fn,ms)=>{ T.timeouts.push({fn,ms}); return T.timeouts.length; }; w.setInterval=(fn,ms)=>{ T.intervals.push({fn,ms}); return 1000+T.intervals.length; }; };
 const step=()=>{ const t=T.timeouts.shift(); if(!t) return null; T.now+=t.ms; t.fn(); return t; };
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump,buzz,hold,step,clock:T,
   bubble:()=>w.document.getElementById('screen-title').textContent};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const fromCalm=o=>{ const a=boot(o); a.click(act('route','calm')); a.click(act('snuggleStart','calm')); return a; };
const r=[];
const L=boot().G('ZAGS_LINES');

// ---- entry ----
{const a=fromCalm(); r.push(['Calm → Snuggle Zags', a.S().screen==='snuggle' && a.S().currentInterventionId==='zags_snuggle']);
 r.push(['first line says he is not a person', a.bubble()===L.snuggleHello && a.bubble().includes('not a person')]);
 r.push(['"Hold me close" tip', a.T().includes(L.snuggleTip) && L.snuggleTip.startsWith('Hold me close')]);
 r.push(['curled up in a blanket', !!a.doc.querySelector('.zblanket')]);
 r.push(['Help one tap away; "Not right now" and close always there', !!a.doc.querySelector('header .help-pill[data-act="crisis"]') && !!a.doc.querySelector('.actions [data-act="home"]') && !!a.doc.querySelector('[data-act="home"][aria-label]')]);}
{const a=boot(); a.click(act('route','calm')); a.click(act('zags','calm')); a.click(act('snuggleStart','zags'));
 r.push(['Zags\'s start screen → "Just snuggle"', a.S().screen==='snuggle' && a.S().currentInterventionId==='zags_snuggle']);}
{const a=boot(); r.push(['in the library for the same states as Zags', a.G('findIntervention("zags_snuggle").states.join()')==='anxious,low,distraction,alone']);}

// ---- settings: length, buzz, sound ----
{const a=fromCalm();
 const lens=[...a.doc.querySelectorAll('[data-act="snuggleLen"]')].map(b=>b.dataset.arg+(b.getAttribute('aria-pressed')==='true'?'*':''));
 r.push(['length 2 / 3 / 5 minutes, default 3', lens.join()==='2,3*,5']);
 a.G('ACTIONS.snuggleLen("60"); ACTIONS.snuggleLen("0"); ACTIONS.snuggleLen("Infinity")');
 r.push(['no endless mode (no other lengths accepted)', a.G('prefs.snuggleMin')===3 && !/endless|forever|keep going/i.test(a.T())]);
 r.push(['no buzz or sound switch where the device has neither', !a.doc.querySelector(act('snuggleBuzz')) && !a.doc.querySelector(act('snuggleSound'))]);}
{const a=fromCalm({vibrate:true,audio:true});
 const bz=a.doc.querySelector(act('snuggleBuzz')), sd=a.doc.querySelector(act('snuggleSound'));
 r.push(['buzz is off by default (Android: navigator.vibrate)', !!bz && bz.getAttribute('aria-pressed')==='false' && a.G('prefs.snuggleBuzz')===false]);
 r.push(['sound is off by default', !!sd && sd.getAttribute('aria-pressed')==='false' && a.G('prefs.snuggleSound')===false]);
 a.hold(); a.click(act('snuggleGo')); for(const iv of a.clock.intervals) iv.fn();
 r.push(['with both off: no buzz and no sound', a.buzz.length===0 && !a.w.__ctx]);}
{const a=boot(); a.G('ACTIONS.snuggleBuzz()'); r.push(['no navigator.vibrate (iPhone): buzz can\'t be turned on', a.G('prefs.snuggleBuzz')===false]);}

// ---- a snuggle ----
{const a=fromCalm({vibrate:true}); a.click(act('snuggleBuzz')); a.click(act('snuggleLen','2')); a.hold(); a.click(act('snuggleGo'));
 r.push(['starts quietly; "I\'m done" any time', a.G('ui.snuggle.phase')==='run' && a.bubble()===L.quiet && !!a.doc.querySelector(act('snuggleStop'))]);
 r.push(['heartbeat about 60 a minute', a.clock.intervals.length===1 && a.clock.intervals[0].ms===1000 && !!a.doc.getElementById('snGlow')]);
 a.clock.intervals[0].fn(); r.push(['buzz in time with the heartbeat when turned on', a.buzz.filter(Array.isArray).length===1]);
 a.step(); const body=a.doc.getElementById('zbody');
 r.push(['breathe in for 4 seconds, Zags grows', a.bubble()===L.in && body.classList.contains('zin') && a.clock.timeouts.at(-1).ms===4000]);
 a.step(); r.push(['out for 6 seconds, calm eyes', a.bubble()===L.out && body.classList.contains('zout') && a.clock.timeouts.at(-1).ms===6000 && a.doc.getElementById('zEyesCalm').style.display==='']);
 let n=0; while(a.G('ui.snuggle.phase')==='run' && n<100){ a.step(); n++; }
 const breaths=(2+n)/2;
 r.push(['stops by itself after the chosen length (2 min = 12 slow breaths)', a.G('ui.snuggle.phase')==='end' && breaths>=12 && breaths<=13, breaths]);
 r.push(['ends with his line', a.bubble()===L.snuggleEnd]);
 r.push(['...buzz stopped', a.buzz.at(-1)===0]);
 a.click(act('snuggleNext'));
 r.push(['then the usual check-in', a.S().screen==='checkin']);
 a.click(act('ciBad'));
 const o=a.S().sessionHistory.at(-1);
 r.push(['outcome recorded like any other (I still feel bad → next step)', o.interventionId==='zags_snuggle' && a.S().stillBadCount===1 && a.S().screen==='recommendation']);}
{const a=fromCalm(); a.hold(); a.click(act('snuggleGo')); a.step(); a.click(act('snuggleStop'));
 r.push(['"I\'m done" early → his line, then check-in; timers stopped', a.G('ui.snuggle.phase')==='end' && a.G('snugTimer===null && snugBeat===null')]);
 r.push(['the end still offers a person', !!a.doc.querySelector('[data-act="route"][data-arg="connect"]')]);}
{const a=fromCalm({audio:true}); a.click(act('snuggleSound')); a.hold(); a.click(act('snuggleGo'));
 r.push(['sound, when turned on, is made on the device (Web Audio)', !!a.w.__ctx]);
 a.click(act('snuggleStop')); r.push(['...and stops with the snuggle', a.w.__ctx.closed===true]);}

// ---- reduced motion ----
{const a=fromCalm(); a.G('prefs.reduce=true'); a.hold(); a.click(act('snuggleGo')); a.step();
 r.push(['reduced motion: Zags stays still', !a.doc.getElementById('zbody').classList.contains('zin') && !a.doc.getElementById('zbody').classList.contains('zout')]);
 r.push(['reduced motion: a slow fading glow instead', a.G('snugRaf')!==null]);
 a.clock.intervals[0].fn(); r.push(['reduced motion: no heartbeat pulse animation', !a.doc.getElementById('snGlow').classList.contains('beat')]);}

// ---- safety ----
{const a=fromCalm({vibrate:true}); a.click(act('snuggleBuzz')); a.hold(); a.click(act('snuggleGo')); a.step();
 a.click('header .help-pill[data-act="crisis"]');
 r.push(['Help mid-snuggle → crisis screen; everything stops', a.S().screen==='crisis' && a.S().safetyLevel==='RED' && a.G('snugTimer===null && snugBeat===null') && a.buzz.at(-1)===0]);
 a.G('ACTIONS.snuggleStart("calm")'); r.push(['RED: Snuggle Zags cannot start (blockIfRed first)', a.S().screen==='crisis']);
 a.G('ACTIONS.snuggleGo()'); r.push(['RED: cannot resume', a.S().screen==='crisis']);}

// ---- stores only settings ----
{const a=fromCalm(); a.click(act('snuggleLen','5')); a.hold(); a.click(act('snuggleGo')); a.step(); a.click(act('snuggleStop')); a.click(act('snuggleNext')); a.click(act('ciSkip'));
 const d=a.dump(); const prefs=JSON.parse(d['next.v1.prefs']).prefs; const all=Object.values(d).join('\n');
 r.push(['remembers only its settings (length, buzz, sound)', prefs.snuggleMin===5 && prefs.snuggleBuzz===false && prefs.snuggleSound===false]);
 r.push(['nothing about the snuggle itself is stored (no times, no counts)', !/endsAt|"phase"|snuggleCount|snuggles|lastSnuggle/.test(all)]);}
r.push(['his closing line is in ZAGS_LINES, word for word', L.snuggleEnd==="Feeling a bit more settled? I'm here if you need me, and so are your people."]);
r.push(['no "Zags misses you", no reminders', !/miss(es|ed)? you|remind/i.test(Object.values(L).join(' '))]);

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
