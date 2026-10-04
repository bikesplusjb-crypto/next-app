// Stage 6.7: Zags, the calm-down guide. Scripted, not AI; taps only; every session ends at a person.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot({speech=false}={}){
 const spoken=[], cancels={n:0};
 const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   if(speech){ w.speechSynthesis={speak(u){spoken.push(u.text)},cancel(){cancels.n++}}; w.SpeechSynthesisUtterance=function(t){this.text=t;}; } }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')+'/'+w.eval('ui.zags&&ui.zags.phase')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 // Controllable timers for the breathing: queue them instead of waiting.
 const q=[]; const realST=w.setTimeout;
 const hold=()=>{ w.setTimeout=(fn,ms)=>{ q.push({fn,ms}); return q.length; }; };
 const tick=()=>{ const t=q.shift(); if(t) t.fn(); return t; };
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),
   Z:()=>w.eval('ui.zags'),bubble:()=>w.document.getElementById('screen-title').textContent,spoken,cancels,hold,tick,q,dump,realST};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const fromCalm=o=>{ const a=boot(o); a.click(act('route','calm')); a.click(act('zags','calm')); return a; };
const r=[];
const L=boot().G('ZAGS_LINES');
const hrefs=a=>[...a.doc.querySelectorAll('#app a[href]')].map(x=>x.getAttribute('href'));
// Breathe through a whole round with the queued timers.
function breatheThrough(a){ a.hold(); a.click(act('zagsBreathe')); let n=0; while(a.Z().phase==='breathe' && n<40){ a.tick(); n++; } return n; }
function stepsThrough(a){ for(let i=0;i<4;i++) a.click(act('zagsNext')); }

// ---- entry points ----
{const a=fromCalm(); r.push(['Calm → Zags (featured)', a.S().screen==='zags' && a.S().currentInterventionId==='zags' && a.S().currentState==='anxious']);}
{const a=boot(); a.click(act('route','connect')); a.click(act('zags','connect')); r.push(['Connect → "Calm down with Zags while you wait" (state: alone)', a.S().screen==='zags' && a.S().currentState==='alone']);}
{const a=boot(); a.click(act('route','head')); a.click(act('zags','head')); r.push(['Get out of my head menu → Zags', a.S().screen==='zags' && a.S().currentState==='distraction']);}
{const a=boot(); const z=a.G('findIntervention("zags")');
 r.push(['zags is in the library for anxious, low, distraction, alone', !!z && ['anxious','low','distraction','alone'].every(s=>z.states.includes(s))]);
 a.G('session.currentState="low"; ui.engine={interventionId:"zags",reason:"x"}; ACTIONS.recTry()');
 r.push(['when the engine suggests Zags, Try starts a session', a.S().screen==='zags' && a.Z().phase==='hello']);}

// ---- every session starts the same ----
{const a=fromCalm();
 r.push(['first line says he is not a person', a.bubble()===L.hello && a.bubble().includes('not a person')]);
 r.push(['"Okay, Zags" and "Not right now"; close and Help always there', !!a.doc.querySelector(act('zagsBreathe')) && !!a.doc.querySelector(act('zagsBye')) && !!a.doc.querySelector('[data-act="home"][aria-label]') && !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 r.push(['says what he is under every screen: "not a person and not AI"', a.T().includes('Zags is a scripted guide, not a person and not AI.')]);
 a.click(act('zagsBye')); a.click(act('home')); a.click(act('route','calm')); a.click(act('zags','calm'));
 r.push(['a second session in the same visit says it again (said every session)', a.bubble()===L.hello]);
 r.push(['...and starts fresh: no rounds or answers carried over', JSON.stringify(a.Z())===JSON.stringify({phase:'hello',step:0,rounds:0,hard:0,breath:0,half:null})]);}

// ---- the lines ----
const BANNED=/love you|miss(ed)? you|always here|special to me|you're special|welcome back|friend|partner|boyfriend|girlfriend|need you|don'?t (go|leave)|stay with me|please stay|come back|last time|remember you|i('| a)m (a )?(real|human)|here if you need|hold me|cozy|cosy|snuggl|cuddl/i;
const vals=Object.values(L);
r.push(['ZAGS_LINES has none of the banned phrases', vals.every(v=>!BANNED.test(v)), vals.filter(v=>BANNED.test(v)).join(' | ')]);
r.push(['no placeholders: never the person\'s name or generated text', vals.every(v=>!/\$\{|\{|\}|%s|name/i.test(v))]);
{const t=HTML.slice(HTML.indexOf('const ZAGS_LINES'), HTML.indexOf('const ZAGS_STEPS'));
 r.push(['every line is one fixed string in one constant', vals.every(v=>t.includes(JSON.stringify(v).slice(1,-1)) || t.includes(v))]);}

// ---- breathing ----
{const a=fromCalm(); a.hold(); a.click(act('zagsBreathe'));
 r.push(['breathing starts quietly, "Skip breathing" always there', a.Z().phase==='breathe' && a.bubble()===L.quiet && !!a.doc.querySelector(act('zagsSkip'))]);
 a.tick(); const body=a.doc.getElementById('zbody');
 r.push(['in for 4 seconds: "Breathe in…", Zags grows', a.bubble()===L.in && body.classList.contains('zin') && a.q.at(-1).ms===4000 && a.doc.getElementById('zagsSub').textContent==='Breath 1 of 4']);
 a.tick();
 r.push(['out for 6 seconds: "And out, slowly…", Zags shrinks, eyes go calm', a.bubble()===L.out && body.classList.contains('zout') && a.q.at(-1).ms===6000 && a.doc.getElementById('zEyesCalm').style.display==='' && a.doc.getElementById('zEyesOpen').style.display==='none']);
 r.push(['focus stays put during breaths (no re-render)', a.doc.getElementById('zbody')===body]);
 let n=0; while(a.Z().phase==='breathe' && n<40){ a.tick(); n++; }
 r.push(['4 breaths, then the grounding steps', a.Z().phase==='steps' && a.bubble()===L.feet && n===7]);}   // 2 ticks above + 7 = 4 breaths (in and out) + the closing tick
{const a=fromCalm(); a.G('prefs.reduce=true'); a.hold(); a.click(act('zagsBreathe')); a.tick();
 r.push(['reduced motion: no scaling, a color fade instead', !a.doc.getElementById('zbody').classList.contains('zin') && a.G('zagsFadeRaf')!==null && a.doc.getElementById('zagsSub').textContent==='Breath 1 of 3']);
 let n=0; while(a.Z().phase==='breathe' && n<40){ a.tick(); n++; }
 r.push(['reduced motion: 3 breaths', a.Z().phase==='steps' && n===6]);}
{const a=fromCalm(); a.hold(); a.click(act('zagsBreathe')); a.tick(); a.click(act('zagsSkip'));
 r.push(['Skip breathing → straight to the steps, timer stopped', a.Z().phase==='steps' && a.G('zagsTimer')===null]);}
{const CSS=(HTML.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||'';
 r.push(['Zags animations are covered by the reduced-motion rule (no !important)', /\.zbody\{[^}]*transition/.test(CSS) && !/\.z[a-z]*\{[^}]*!important/.test(CSS)]);}

// ---- grounding steps ----
{const a=fromCalm(); a.click(act('zagsBreathe')); a.click(act('zagsSkip')); const seen=[a.bubble()];
 for(let i=0;i<3;i++){ a.click(act('zagsNext')); seen.push(a.bubble()); }
 r.push(['three grounding steps: feet, something blue, the farthest sound', seen.join('|')===[L.feet,L.blue,L.sound,L.doing].join('|')]);
 r.push(['taps only, no text box anywhere', !a.doc.querySelector('#app input, #app textarea')]);
 a.click(act('zagsNext'));
 r.push(['"How are you feeling now?" A bit better / Still hard / Worse', a.Z().phase==='check' && a.bubble()===L.check && ['better','hard','worse'].every(x=>!!a.doc.querySelector(act('zagsFeel',x)))]);}

// ---- endings ----
const toCheck=a=>{ a.click(act('zagsBreathe')); a.click(act('zagsSkip')); stepsThrough(a); };
{const a=fromCalm(); a.G('ACTIONS.loadSample()'); toCheck(a); a.click(act('zagsFeel','better'));
 const o=a.S().sessionHistory.at(-1);
 r.push(['A bit better → recorded as a normal check-in outcome (zags)', o.interventionId==='zags' && o.feeling==='better' && o.state==='anxious']);
 r.push(['A bit better → trusted people + warm line + "I\'m okay for now"', a.bubble()===L.better && hrefs(a).includes('sms:5550142') && hrefs(a).includes('tel:18009451355') && !!a.doc.querySelector(act('zagsBye'))]);
 a.click(act('zagsBye'));
 r.push(['"Bye for now. Go be with your people." still ends at a person', a.bubble()===L.bye && !!a.doc.querySelector('[data-act="route"][data-arg="connect"]')]);}
{const a=fromCalm(); toCheck(a); a.click(act('zagsFeel','hard'));
 r.push(['Still hard (first time) → one more round', a.Z().phase==='again' && a.bubble()===L.again && !!a.doc.querySelector(act('zagsBreathe')) && hrefs(a).includes('tel:18009451355')]);
 breatheThrough(a); stepsThrough(a); a.click(act('zagsFeel','hard'));
 r.push(['Still hard (second time) → people, warm line, Call/Text 988', a.Z().phase==='hard' && a.bubble()===L.stillHard && hrefs(a).includes('tel:988') && hrefs(a).includes('sms:988') && hrefs(a).includes('tel:18009451355')]);
 r.push(['nobody in the plan: a way to find someone', !!a.doc.querySelector('[data-act="route"][data-arg="connect"]')]);}
{const a=fromCalm(); breatheThrough(a); stepsThrough(a); a.click(act('zagsFeel','hard')); breatheThrough(a);
 r.push(['two breathing rounds so far', a.Z().rounds===2]);
 a.G('ACTIONS.zagsBreathe()');
 r.push(['at most two breathing rounds per session', a.Z().rounds===2 && a.Z().phase!=='breathe']);}
{const a=fromCalm(); toCheck(a); a.click(act('zagsFeel','worse'));
 r.push(['Worse → openCrisis(): RED, crisis screen', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
 r.push(['Worse saves nothing (RED saves nothing)', a.S().sessionHistory.length===0 && !Object.values(a.dump()).join('').includes('"zags"')]);}
{const a=fromCalm(); a.G('openCrisis = (() => { const f = openCrisis; return () => { window.__oc = 1; f(); }; })()'); toCheck(a); a.click(act('zagsFeel','worse'));
 r.push(['Worse calls openCrisis() itself (one crisis path)', a.G('window.__oc')===1]);}

// ---- RED stops Zags ----
{const a=fromCalm(); a.hold(); a.click(act('zagsBreathe')); a.tick(); a.click('header .help-pill[data-act="crisis"]');
 const before=a.q.length; a.tick(); a.tick();
 r.push(['Help mid-breath → crisis screen and the breathing stops', a.S().screen==='crisis' && a.G('zagsTimer')===null && !a.doc.querySelector('.zags')]);
 a.G('ACTIONS.zags("calm")'); r.push(['RED: Zags cannot start', a.S().screen==='crisis']);
 a.G('ACTIONS.zagsNext()'); r.push(['RED: Zags cannot continue', a.S().screen==='crisis']);}
{const a=boot(); a.G('ACTIONS.crisis()'); r.push(['no Zags on crisis screens', ['crisis','crisis-full','crisis-no','safety-check'].every(s=>{ a.G(`session.screen=${JSON.stringify(s)}; render()`); return !/Zags/.test(a.T()); })]);}

// ---- no memory ----
{const a=fromCalm(); toCheck(a); a.click(act('zagsFeel','better'));
 const all=Object.values(a.dump()).join('\n'); const saved=JSON.parse(a.dump()['next.v1.sensitive']);
 r.push(['nothing about the Zags session itself is saved (only the outcome)', !/"phase"|"rounds"|zagsVoice|Hi, I'm Zags/.test(all) && saved.history.at(-1).interventionId==='zags']);}

// ---- voice ----
{const a=fromCalm(); r.push(['no speech on this device: no voice toggle', !a.doc.querySelector(act('zagsVoice'))]);}
{const a=fromCalm({speech:true}); const b=a.doc.querySelector(act('zagsVoice'));
 r.push(['voice is off by default', !!b && b.getAttribute('aria-pressed')==='false' && b.textContent==='Voice off' && a.spoken.length===0]);
 a.click(act('zagsVoice'));
 r.push(['turning it on speaks the current line, on the device', a.spoken.at(-1)===L.hello && a.doc.querySelector(act('zagsVoice')).getAttribute('aria-pressed')==='true']);
 const c=a.cancels.n; a.click(act('zagsBreathe'));
 r.push(['it stops the moment the person taps anything', a.cancels.n>c]);
 const c2=a.cancels.n; a.click(act('home'));
 r.push(['leaving Zags stops it', a.cancels.n>c2]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
