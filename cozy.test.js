// COZY UP: one cozy thing at a time; warm drink flow inside; low = 15 minutes then one tiny thing (Connect one tap away);
// night = "Cozy up for sleep"; ends with Zags in a small blanket; nothing saved.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({now}={}){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{};
   w.addEventListener('error',e=>errs.push(e.message)); w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();};
   if(now){ const RD=w.Date; class D extends RD{ constructor(...a){ super(...(a.length?a:[now])); } static now(){ return now; } } w.Date=D; } }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])));
 return {w,click,errs,dump,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const DAY=new Date(2026,9,5,13,0,0).getTime(), NIGHT=new Date(2026,9,5,1,0,0).getTime();
const r=[];
{const a=boot({now:DAY}); a.G('ACTIONS.route("calm")');
 r.push(['Calm: "Cozy up" replaces "Make something warm"', a.has(act('cozyStart')) && a.T().includes('Cozy up') && !a.has(act('warmStart'))]);
 a.click(act('cozyStart'));
 r.push(['"Cozy up." / "One thing at a time. Skip anything."', a.S().screen==='cozy' && a.T().includes('Cozy up.') && a.T().includes('One thing at a time. Skip anything.') && !a.has(act('cozySleep'))]);
 a.click(act('cozyGo'));
 const seen=[]; for(let i=0;i<6;i++){ seen.push(a.doc.getElementById('screen-title').textContent); if(i<5) a.click(act('cozyNext')); }
 r.push(['one thing at a time: warm drink, blanket/hoodie/socks, lamp, soft sound, something soft or your pet, warm shower', JSON.stringify(seen)===JSON.stringify(["Make something warm to drink. Decaf, caffeine-free tea, cocoa, warm milk, warm water or warm apple juice.","Put on a blanket, a hoodie or warm socks.","Turn off the overhead light. Turn on a lamp instead.","Put on a soft sound: rain, a fan or quiet music.","Hold something soft, or your pet.","Take a warm shower."])]);
 a.click(act('cozyEnd'));
 r.push(['end: "Stay cozy for a bit. You can put the phone down."', a.S().screen==='cozy-end' && a.T().includes('Stay cozy for a bit. You can put the phone down.')]);
 r.push(['...with Zags in a small blanket (the same character)', a.has('.cozy-mark .zmark .zmark-blanket') && /M92 52 L102 30 L110 46 L120 24 L128 52/.test(a.doc.querySelector('.cozy-mark').innerHTML)]);
 a.click(act('putDown')); r.push(['I\'m done → Home', a.S().screen==='home']);}
{const a=boot({now:DAY}); a.G('ACTIONS.cozyStart()'); a.click(act('cozyGo'));
 r.push(['"That\'s enough" and "Skip this one" on every step', a.has(act('cozyEnd')) && a.T().includes('Skip this one')]);
 a.click(act('cozyWarm'));
 const drinks=[...a.doc.querySelectorAll('[data-act="warmPick"]')].map(b=>b.textContent.replace(/\s+/g,' ').trim());
 r.push(['the existing warm flow, decaf first, "Warm apple juice" (not cider)', a.S().screen==='warm' && drinks[0].includes('Decaf coffee') && drinks.some(d=>d.includes('Warm apple juice')) && !/cider/i.test(HTML)]);
 a.click(act('warmPick','decaf')); a.click(act('warmEnough'));
 r.push(['after the drink: "Next cozy thing"', a.has(act('cozyBack'))]);
 a.click(act('cozyBack')); r.push(['...back to Cozy up at the next thing (the blanket)', a.S().screen==='cozy-step' && a.T().includes('Put on a blanket, a hoodie or warm socks.') && a.S().currentInterventionId==='cozy_up']);}
// From "I feel low"
{const a=boot({now:DAY}); a.G('dispatch({type:"SET_CURRENT_STATE",state:"low"}); go("low-choose")');
 r.push(['I feel low: "Cozy up" is one of the choices', a.has(act('cozyStart','low'))]);
 a.click(act('cozyStart','low'));
 r.push(['low: time-boxed: "Get cozy for 15 minutes. Then one tiny thing."', a.T().includes('Get cozy for 15 minutes. Then one tiny thing.')]);
 r.push(['low: Connect one tap away', a.has('.cozy-connect[data-act="route"][data-arg="connect"]')]);
 a.click(act('cozyTimer')); r.push(['low: optional gentle 15-minute timer', a.doc.getElementById('cozyTime').textContent==='15:00' && a.G('cozyTimer')!==null]);
 a.click(act('cozyGo')); r.push(['low: Connect stays one tap away on every step', a.has('.cozy-connect')]);
 a.G('ui.cozy.until=Date.now()-1; cozyTick()');
 r.push(['low: at 15 minutes: "Fifteen minutes is up. Ready for one tiny thing?"', a.S().screen==='cozy-end' && a.T().includes('Fifteen minutes is up. Ready for one tiny thing?')]);
 a.click(act('cozyTiny')); r.push(['low: → one tiny thing (the I feel low chooser)', a.S().screen==='low-choose']);}
{const a=boot({now:DAY}); a.G('ACTIONS.cozyStart()'); r.push(['not low: no time box, no extra Connect button', !a.T().includes('15 minutes') && !a.has('.cozy-connect')]);}
// Night
{const a=boot({now:NIGHT}); a.G('ACTIONS.cozyStart()');
 r.push(['night: "Cozy up for sleep" is offered', a.has(act('cozySleep')) && a.T().includes('Cozy up for sleep')]);
 a.click(act('cozySleep'));
 const steps=[]; for(let i=0;i<3;i++){ steps.push(a.doc.getElementById('screen-title').textContent); if(i<2) a.click(act('cozyNext')); }
 r.push(['night: soft light, warm decaf/caffeine-free, phone face down out of reach', JSON.stringify(steps)===JSON.stringify(["Turn the lights down. A lamp, not the overhead light.","If you want something warm, make it decaf or caffeine-free.","Put the phone face down, out of reach."])]);
 r.push(['night: "If you\'re not asleep in about 20 minutes, get up and do something quiet in dim light until you feel sleepy."', a.T().includes("If you're not asleep in about 20 minutes, get up and do something quiet in dim light until you feel sleepy.")]);
 const copy=a.G('JSON.stringify([COZY_ITEMS,COZY_SLEEP,COZY])');
 r.push(['night: no sleep medication advice', !/melatonin|sleeping pill|sleep aid|medication|medicine|pill|benadryl|antihistamine|alcohol|nightcap/i.test(copy)]);
 r.push(['no medical claims', !/anxiety|depress|treat|cure|insomnia|nervous system|cortisol/i.test(copy)]);}
{const a=boot({now:DAY}); a.G('ACTIONS.cozySleep()'); r.push(['"Cozy up for sleep" only at night', a.S().screen!=='cozy-step' || !a.G('ui.cozy && ui.cozy.sleep')]);}
// Zags rule, safety, nothing saved, engine
{const a=boot(); a.G('ui.cozy={idx:0,low:false,sleep:false,until:0,timeUp:false}');
 const bad=['crisis','crisis-full','crisis-no','safety-check','plan-now'].filter(s=>{ a.G(`lastRendered=null; session={...session, screen:${JSON.stringify(s)}, safetyLevel:"RED"}; render()`); return a.has('.zmark'); });
 r.push(['Zags never on crisis screens', bad.length===0, bad.join()]);
 a.G('openCrisis(); ACTIONS.cozyStart()'); r.push(['RED blocks Cozy up', a.S().screen==='crisis']);}
{const a=boot({now:DAY}); a.G('ACTIONS.cozyStart("low")'); a.click(act('cozyTimer')); a.click(act('cozyGo')); a.click(act('cozyNext')); a.click(act('cozyEnd'));
 r.push(['nothing saved', !/cozy|blanket|lamp/i.test(a.dump()) && a.w.netCalls===0 && a.errs.length===0]);}
{const a=boot(); const lib=a.G('findIntervention("cozy_up")');
 r.push(['cozy_up: channel SENSE, realWorld, in the array library', Array.isArray(a.G('INTERVENTION_LIBRARY')) && lib.channel==='SENSE' && lib.realWorld===true]);
 r.push(['YELLOW priority still wins', a.G('interventionEngine({state:"low", yellow:true, playbook:{helps:[]}}).interventionId')==='connection']);
 a.G('session.currentState="low"; startIntervention("cozy_up")'); r.push(['from the engine in a low state, it is time-boxed too', a.S().screen==='cozy' && a.G('ui.cozy.low')===true]);}
r.push(['reduced motion: no new animation', !/\.cozy-[a-z]+\{[^}]*animation|\.zmark-blanket\{[^}]*animation/.test(HTML)]);
{const a=boot({now:DAY}); a.G('ACTIONS.cozyStart()'); a.click(act('cozyGo')); a.click(act('cozyWarm')); a.click(act('home'));
 a.G('ACTIONS.techStart(); ACTIONS.tcPick("scroll"); ACTIONS.szAnswer("no"); ACTIONS.szGo("warm")'); a.click(act('warmPick','decaf')); a.click(act('warmEnough'));
 r.push(['leaving the warm steps early: a later warm flow (e.g. from Social Zig) doesn\'t offer "Next cozy thing"', !a.has(act('cozyBack'))]);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
