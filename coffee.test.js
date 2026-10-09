// HAVE COFFEE WITH ZIGZAG: a few quiet minutes, scripted, finite, nothing kept, not a person, ends at putting the phone down.
// 6.29: the search word list (SEARCH_INDEX) is plain words people might type ("chatbot", "tiktok", "safe word"); it is left out of the wording guards below.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{};
   w.addEventListener('error',e=>errs.push(e.message)); w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])));
 return {w,click,errs,dump,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const tick=ms=>new Promise(r=>setTimeout(r,ms||5));
const toTable=a=>{ a.G('ACTIONS.coffeeStart()'); a.click(act('coffeePick','decaf')); a.click(act('coffeeReady')); };
const toMenu=a=>{ toTable(a); a.G('coffeeClear(); ui.coffee.phase="menu"; ui.coffee.line=COFFEE.intro[1]; render()'); };
const r=[];
(async()=>{
{const a=boot(); a.G('ACTIONS.route("calm")');
 r.push(['1: entry on Calm: "Have coffee with ZigZag" / "Make something warm. I\'ll sit with you for a few minutes."', a.has(act('coffeeStart')) && a.T().includes('Have coffee with ZigZag') && a.T().includes("Make something warm. I'll sit with you for a few minutes.")]);
 a.click(act('coffeeStart'));
 r.push(['1: the same drinks as Warm & comfort (decaf first)', a.doc.querySelectorAll('[data-act="coffeePick"]').length===7 && a.doc.querySelector('[data-act="coffeePick"]').dataset.arg==='decaf']);
 a.click(act('coffeePick','tea'));
 r.push(['1/4: "Go make something warm." "I\'ll wait." [I\'m ready]; no loading screen', a.S().screen==='coffee-go' && a.T().includes('Go make something warm.') && a.T().includes("I'll wait.") && a.has(act('coffeeReady'))]);
 a.click(act('coffeeReady')); await tick(20);
 r.push(['1/5: the companion screen: a cup, "ZigZag", no chat bubbles, no person', a.S().screen==='coffee-table' && a.has('svg.coffee-cup') && a.T().includes('ZigZag') && !a.has('.bubble, .chat, .message')]);
 r.push(['7: "I made coffee too." first', a.doc.getElementById('coffeeLine').textContent==='I made coffee too.']);
 r.push(['2/7: no question straight away (choices wait for a quiet pause)', !a.has(act('coffeeDo','talk')) && a.G('coffeeTimers.length')>0]);
 r.push(['10: says it isn\'t a person', a.T().includes('ZigZag is an app, not a person.')]);
 r.push(['24: Help (crisis access) stays in the top bar', a.has('header .help-pill[data-act="crisis"]')]);
 a.click('header [data-act="crisis"]'); r.push(['leaving stops the quiet lines', a.G('coffeeTimers.length')===0]);}
{const a=boot(); toMenu(a);
 r.push(['8: "Talk · Just sit · Tell me something random · I need to get something out · I\'m not sure"', ['talk','sit','random','out','unsure'].every(k=>a.has(act('coffeeDo',k)))]);
 a.click(act('coffeeDo','talk'));
 r.push(['9: Talk: one prompt at a time', a.doc.getElementById('coffeeLine').textContent==="What's going on?" && a.has('#coffeeBox')]);
 a.doc.getElementById('coffeeBox').value='Work was rough and my sister is mad at me'; a.click(act('coffeeSayIt'));
 r.push(['3: GREEN text continues; a neutral reply, no claims of understanding', a.S().screen==='coffee-table' && a.doc.getElementById('coffeeLine').textContent==='Okay. Thanks for saying it.']);
 r.push(['27: what was typed isn\'t kept anywhere', !/sister/.test(a.dump()) && !/sister/.test(JSON.stringify(a.G('ui'))+JSON.stringify(a.G('session')))]);}
{const a=boot(); toMenu(a); a.click(act('coffeeDo','talk')); a.doc.getElementById('coffeeBox').value='I want to kill myself'; a.click(act('coffeeSayIt'));
 r.push(['4: RED → the existing crisis screen; the coffee stops', a.S().screen==='crisis' && a.S().safetyLevel==='RED' && a.G('coffeeTimers.length')===0]);
 a.G('ACTIONS.coffeeDo("sit")'); r.push(['4: nothing continues while RED', a.S().screen==='crisis']);}
{const a=boot(); toMenu(a); a.click(act('coffeeDo','talk')); a.doc.getElementById('coffeeBox').value='I feel hopeless'; a.click(act('coffeeSayIt'));
 r.push(['5: YELLOW → existing YELLOW behavior, and it persists', a.S().safetyLevel==='YELLOW' && a.G('session.yellow')===true && a.S().screen==='coffee-table']);
 r.push(['25: while YELLOW, "Tell me something random" is hidden', !a.has(act('coffeeDo','random'))]);}
{const a=boot(); toMenu(a); a.click(act('coffeeDo','random'));
 const first=a.doc.getElementById('coffeeLine').textContent;
 r.push(['6: a harmless random observation from a fixed list', a.G('COFFEE.random').includes(first)]);
 a.click(act('coffeeDo','random')); a.click(act('coffeeDo','random'));
 r.push(['6: no endless feed (three at most)', !a.has(act('coffeeDo','random'))]);}
{const a=boot(); toMenu(a); a.click(act('coffeeDo','sit'));
 r.push(['11/7: Just sit: the cup, no forced conversation, lines on a slow timer', !a.has('#coffeeBox') && a.G('coffeeTimers.length')===5 && a.G('COFFEE.sit').join('|')==="☕ sip|Still here.|Look at your coffee for a second.|I'm still here.|You don't have to fill the silence."]);}
{const a=boot(); toMenu(a); a.click(act('coffeeDo','out'));
 r.push(['13/8: "Okay. Get it out." (lightweight; Mind Scribble isn\'t built)', a.doc.getElementById('coffeeLine').textContent==='Okay. Get it out.' && a.has('#coffeeBox')]);
 a.doc.getElementById('coffeeBox').value='work work work why'; a.click(act('coffeeOutDone'));
 r.push(['13: "Okay. Leave the mess here." → Keep going · Just sit · Let\'s Zig; nothing kept', a.doc.getElementById('coffeeLine').textContent==='Okay. Leave the mess here.' && a.has(act('coffeeBack')) && a.has(act('coffeeZig')) && !/work work/.test(a.dump())]);
 a.click(act('coffeeZig')); r.push(['23: Let\'s Zig → the existing engine', a.S().screen==='recommendation' && a.G('ui.zigFrom')==='SENSE']);}
{const a=boot(); toMenu(a); for(let i=0;i<6;i++){ if(a.has(act('coffeeDo','sit'))) a.click(act('coffeeDo','sit')); if(a.has(act('coffeeBack'))) a.click(act('coffeeBack')); }
 r.push(['15: finite: after a few choices, "I think we\'ve sat here long enough." "How are you doing now?"', a.T().includes("I think we've sat here long enough.") && a.T().includes('How are you doing now?') && ['better','same','rough','unsure'].every(k=>a.has(act('coffeeHow',k)))]);
 a.click(act('coffeeHow','same'));
 r.push(['16/17: About the same → "That\'s okay." "You don\'t have to solve it all right now." "Go enjoy the rest of your coffee."', a.T().includes("That's okay.") && a.T().includes("You don't have to solve it all right now.") && a.T().includes('Go enjoy the rest of your coffee.')]);
 a.click(act('fsDone')); r.push(['9/13: → "You can put the phone down now." [I\'m done]', a.T().includes('You can put the phone down now.') && a.has(act('putDown'))]);
 r.push(['15: not a mood score (nothing calculated or stored)', !/coffeeHow|same/.test(a.dump())]);}
{const a=boot(); toMenu(a); a.click(act('coffeeEnough')); a.click(act('coffeeHow','rough'));
 r.push(['16: Still rough → "Let\'s Zig" through the existing engine', a.S().screen==='recommendation']);}
{const a=boot(); a.G('getPlan().helps=["baseball cards"]'); toMenu(a); a.click(act('coffeeEnough')); a.click(act('coffeeHow','better'));
 r.push(['19: A little better + own things → "Go do your thing" or "Just enjoy my coffee"', a.T().includes('Good.') && a.has(act('yourThings')) && a.T().includes('Just enjoy my coffee')]);
 const b=boot(); b.G('getPlan().helps=["baseball cards"]'); toMenu(b); b.click(act('coffeeEnough')); b.click(act('coffeeHow','same'));
 r.push(['19: ...not every time (not offered on "About the same")', !b.has(act('yourThings'))]);}
{const a=boot(); a.G('ACTIONS.warmStart()'); a.click(act('warmPick','cocoa')); a.click(act('warmCoffee'));
 r.push(['18: from Warm & comfort: "Have it with ZigZag" goes straight to "Go make something warm."', a.S().screen==='coffee-go' && a.G('ui.warmDrink')==='cocoa']);}
{const a=boot(); const lib=a.G('findIntervention("coffee_with_zigzag")');
 r.push(['22: in INTERVENTION_LIBRARY (array), SENSE, real world', Array.isArray(a.G('INTERVENTION_LIBRARY')) && lib.channel==='SENSE' && lib.realWorld===true]);
 r.push(['23: one possible route, not for "alone" (people first) or craving', !lib.states.includes('alone') && !lib.states.includes('craving')]);
 r.push(['25: YELLOW priority still wins in the engine', a.G('interventionEngine({state:"low", yellow:true, playbook:{helps:[]}}).interventionId')==='connection']);
 a.G('session.currentState="low"; startIntervention("coffee_with_zigzag")'); r.push(['23: the engine can open it', a.S().screen==='coffee']);}
{const copy=boot().G('JSON.stringify(COFFEE)');
 r.push(['10: never claims to be human or a friend, or to know how you feel', !/I'm a real person|I am a person|beside you|know exactly how you feel|been through this|your friend|always here|don't need anyone/i.test(copy)]);
 r.push(['21: no clichés', !/better place|happens for a reason|time heals|move on/i.test(copy)]);
 r.push(['12: no points, streaks, badges or scores', !/streak|points|badge|score|level/i.test(copy)]);
 r.push(['26: no AI or network', !/openai|anthropic|chatbot|llm/i.test(HTML.replace(/const SEARCH_INDEX = \[[\s\S]*?\n\];/,'').replace(/\/\*[\s\S]*?\*\//g,'')) && boot().w.netCalls===0]);}
r.push(['10/29: reduced motion: steam and sip are static', /@media \(prefers-reduced-motion:reduce\)\{\.coffee-cup \.steam path,\.coffee-cup \.cup\{animation:none\}\}/.test(HTML) && /html\.reduce \.coffee-cup \.steam path,html\.reduce \.coffee-cup \.cup\{animation:none\}/.test(HTML)]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
})();
