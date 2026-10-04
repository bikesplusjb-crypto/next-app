// WARM & COMFORT: an ordinary ritual; decaf first; every step skippable; no timer, no tracking, no medical claims.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{};
   w.addEventListener('error',e=>errs.push(e.message)); w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const COPY=()=>{ const a=boot(); return a.G('JSON.stringify([WARM_DRINKS,WARM_TITLE,WARM_SUB,WARM_HOT,WARM_STEPS,WARM_SLOW,WARM_END,findIntervention("warm_comfort")])'); };
{const a=boot(); a.G('ACTIONS.route("calm")');
 r.push(['1: entry on Calm: "Make something warm"', a.has(act('warmStart')) && a.T().includes('Make something warm')]);
 a.click(act('warmStart'));
 r.push(['4: "Make something warm." / "Nothing needs to be solved right now."', a.S().screen==='warm' && a.T().includes('Make something warm.') && a.T().includes('Nothing needs to be solved right now.')]);
 const opts=[...a.doc.querySelectorAll('[data-act="warmPick"]')].map(b=>b.textContent.replace(/\s+/g,' ').trim());
 r.push(['2: decaf coffee, caffeine-free tea, hot cocoa, warm milk, warm water, warm cider, something else', JSON.stringify(opts)===JSON.stringify(["☕Decaf coffee","🍵Caffeine-free tea","🍫Hot cocoa","🥛Warm milk","💧Warm water","🍎Warm cider","Something else"])]);
 r.push(['3/17: decaf first; regular coffee is not suggested', opts[0].includes('Decaf coffee') && !opts.some(o=>/^☕Coffee|Regular coffee/i.test(o))]);
 a.click(act('warmPick','decaf'));
 r.push(['5: "Go make it." / "Take your time." (no countdown)', a.S().screen==='warm-go' && a.T().includes('Go make it.') && a.T().includes('Take your time.') && !a.has('[role="timer"]')]);
 r.push(['22: "Make it comfortably warm, not dangerously hot."', a.T().includes('Make it comfortably warm, not dangerously hot.')]);
 a.click(act('warmReady'));
 r.push(['6: hold → warmth → first sip', a.T().includes('Hold the cup for a moment.')]); a.click(act('warmNext'));
 r.push(['...', a.T().includes('Notice the warmth.')]); a.click(act('warmNext'));
 r.push(['...', a.T().includes('Take your time with the first sip.')]); a.click(act('warmEnough'));
 r.push(['9: "That\'s enough." / "You don\'t have to stay here. Go enjoy your drink."', a.S().screen==='warm-end' && a.T().includes("That's enough.") && a.T().includes("You don't have to stay here. Go enjoy your drink.")]);
 a.click(act('fsDone')); r.push(['16: ends at "You can put the phone down now."', a.S().screen==='put-down-now' && a.T().includes('You can put the phone down now.')]);}
{const a=boot(); a.G('ACTIONS.warmStart()'); a.click(act('warmPick','else')); a.click(act('warmEnough'));
 r.push(['5/6: every step can be skipped ("That\'s enough" at any point); no fixed time', a.S().screen==='warm-end']);
 a.G('ACTIONS.warmStart()'); a.click(act('warmPick','tea')); a.click(act('warmReady')); a.click(act('warmSlow'));
 r.push(['7: optional slower version: look, smell, touch, taste', a.T().includes('Look at the drink for a moment.')]);}
{const a=boot(); a.G('getPlan().helps=["baseball cards"]; ACTIONS.warmStart()'); a.click(act('warmPick','decaf')); a.click(act('warmEnough'));
 r.push(['10: connects to the person\'s own things', a.has(act('yourThings'))]);
 a.click(act('yourThings')); a.click(act('yourThing','0'));
 r.push(['...→ "Baseball cards" · "Go do your thing." · I\'m heading out', a.T().includes('Baseball cards') && a.T().includes('Go do your thing.') && a.has(act('putDown'))]);}
{const a=boot(); a.G('ACTIONS.warmStart()'); a.click(act('warmPick','decaf')); a.click(act('warmFind'));
 r.push(['14: "While it\'s getting ready, find something around you" → Find something', a.S().screen==='fs']);}
{const c=COPY();
 r.push(['4/24: no medical claims', !/anxiety|depress|calm(s|ing)? (you|your)|nervous system|cortisol|treat|cure|reduce|lower|therap|heal/i.test(c)]);
 r.push(['23: no food or drink judgment', !/sugar|calorie|diet|healthy|unhealthy/i.test(c)]);}
{const a=boot(); const lib=a.G('findIntervention("warm_comfort")');
 r.push(['25: in INTERVENTION_LIBRARY (array), channel SENSE, real world', Array.isArray(a.G('INTERVENTION_LIBRARY')) && lib.channel==='SENSE' && lib.realWorld===true]);
 r.push(['not offered in the craving flow', !lib.states.includes('craving')]);
 r.push(['11/12: Let\'s Zig can pick it after a different channel didn\'t help', a.G('interventionEngine({state:"low", zigFrom:"ACTION", exclude:INTERVENTION_LIBRARY.filter(i=>i.id!=="warm_comfort" && i.channel!=="ACTION").map(i=>i.id)}).interventionId')==='warm_comfort']);
 r.push(['33: YELLOW priority still wins', a.G('interventionEngine({state:"low", yellow:true, playbook:{helps:[]}}).interventionId')==='connection']);
 a.G('openCrisis(); ACTIONS.warmStart()'); r.push(['32: RED blocks it', a.S().screen==='crisis']);}
{const a=boot(); a.G('ACTIONS.warmStart()'); a.click(act('warmPick','cocoa')); a.click(act('warmEnough'));
 r.push(['28: nothing saved or tracked (no drink, no count)', !/cocoa|warm/i.test(JSON.stringify(a.w.localStorage)) && a.w.netCalls===0 && a.errs.length===0]);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
