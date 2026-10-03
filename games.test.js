// Stage 6.4: Get out of my head. Six quick games plus Focus; each ends with "Did the intensity change?"
// No points, no levels, no score. Help stays one tap away; RED stops every game.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(extra){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; if(extra) extra(w); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ')};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const menu=()=>{ const a=boot(); a.click(act('route','head')); return a; };
const r=[];
const IDS=['distraction_color_hunt','distraction_around_me','distraction_categories','distraction_memory','distraction_pattern','distraction_60_second'];
// Judging words or "x of y"/"x/10" style results. Part labels ("Part 1 of 2") are progress, not a result, so .step-count is left out.
const JUDGING=/score|points?\b|level|correct|wrong|perfect|great job|well done|streak|best|record|\d+\s*(\/|out of)\s*\d+|you (got|found|remembered) \d/i;
const gameText=a=>{ const c=a.doc.getElementById('app').cloneNode(true); c.querySelectorAll('.step-count').forEach(e=>e.remove()); return c.textContent.replace(/\s+/g,' ').replace(/no (score|points|levels)/gi,''); };

// ---- the menu ----
{const a=menu(); const t=a.T();
 r.push(['Get out of my head opens the games menu, no before-rating', a.S().screen==='distract' && a.S().currentState==='distraction' && a.doc.getElementById('screen-title').textContent==='Get out of my head.']);
 r.push(['menu line: "1 to 5 minutes. No points, no levels."', t.includes('Quick games to interrupt the loop. 1 to 5 minutes. No points, no levels.')]);
 r.push(['six games in spec order, then Focus', [...a.doc.querySelectorAll('[data-act="game"]')].map(b=>b.dataset.arg).join()==='color,around,cats,memory,pattern,sixty' && !!a.doc.querySelector('[data-act="distFocus"]')
   && ['Color hunt','Around me','Rapid categories','Memory snap','Pattern break','60-second challenge','Focus'].every(x=>t.includes(x))]);
 r.push(['no emoji; Help in the top bar', !/\p{Extended_Pictographic}/u.test(t) && !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 r.push(['"Break the loop" waits for 6.14 (Tech check)', !/Break the loop/.test(t)]);
 r.push(['opening the menu counts as a hard moment', a.G('store.sensitive.activity.filter(x=>x.type==="moment").length')===1]);}
{const a=boot(); a.click(act('dontKnow')); a.click(act('route','head')); r.push(['"I don\'t know" → Get distracted → the games menu', a.S().screen==='distract']);}
{const a=boot(); r.push(['each game is an intervention prefixed distraction_', IDS.every(id=>a.G(`!!findIntervention(${JSON.stringify(id)}) && findIntervention(${JSON.stringify(id)}).states.includes("distraction")`))]);}

// ---- each game completes and reaches the check-in ----
const judged=[];
const look=(a,name)=>{ const t=gameText(a); if(JUDGING.test(t)) judged.push(name+': '+t.match(JUDGING)[0]); };
function finish(a,id,name){
  r.push([`${name}: ends at "Did the intensity change?"`, a.S().screen==='game-check' && a.S().currentInterventionId===id
    && a.doc.getElementById('screen-title').textContent==='Did the intensity change?'
    && ['yes','a_little','no'].every(x=>!!a.doc.querySelector(act('gameChange',x))) && a.T().includes('Yes') && a.T().includes('A little') && !!a.doc.querySelector(act('ciSkip'))]);
  look(a,name+' check-in');
}
{const a=menu(); a.click(act('game','color'));
 r.push(['Color hunt: part 1, 5 blue circles to tap', a.S().screen==='g-color' && a.doc.querySelectorAll('.dot.blue').length===5 && a.T().includes('Find 5 things around you that are blue.') && a.T().includes('Color hunt · Part 1 of 2')]);
 look(a,'color 1'); a.click(act('gDot','0')); a.click(act('gDot','1'));
 r.push(['Color hunt: a tap fills a circle', a.doc.querySelectorAll('.dot[aria-pressed="true"]').length===2]);
 a.click(act('gNext'));
 r.push(['Color hunt: part 2, 3 red circles', a.doc.querySelectorAll('.dot.red').length===3 && a.T().includes('Now find 3 things that are red.')]);
 look(a,'color 2'); a.click(act('gNext')); finish(a,'distraction_color_hunt','Color hunt');}
{const a=menu(); a.click(act('game','around'));
 r.push(['Around me: the five things to find', a.S().screen==='g-around' && ['Something soft','Something cold','Something rectangular','Something older than you','Something that makes a sound'].every(x=>a.T().includes(x))]);
 a.click(act('gFound','0')); a.click(act('gFound','3'));
 r.push(['Around me: tap each when found', a.doc.querySelectorAll('.todo[aria-pressed="true"]').length===2]);
 look(a,'around'); a.click(act('gDone')); finish(a,'distraction_around_me','Around me');}
{const a=menu(); a.click(act('game','cats'));
 r.push(['Rapid categories: animals first, a tap counter, no typing', a.S().screen==='g-cats' && a.T().includes('Name 5 animals.') && !!a.doc.querySelector(act('gTally')) && !a.doc.querySelector('#app input, #app textarea')]);
 for(let i=0;i<7;i++) a.click(act('gTally'));
 r.push(['Rapid categories: the counter fills, never past 5, no number shown', a.doc.querySelectorAll('.dots .dot.on').length===5]);
 look(a,'cats 1'); a.click(act('gNext')); r.push(['...then cities', a.T().includes('Name 5 cities.') && a.doc.querySelectorAll('.dots .dot.on').length===0]);
 a.click(act('gNext')); r.push(['...then foods', a.T().includes('Name 5 foods.')]);
 look(a,'cats 3'); a.click(act('gNext')); finish(a,'distraction_categories','Rapid categories');}
{const a=menu(); a.click(act('game','memory'));
 r.push(['Memory snap: 6 shapes shown first, nothing to tap yet', a.S().screen==='g-memory' && a.doc.querySelectorAll('.shapes .shape').length===6 && !a.doc.querySelector(act('memPick'))]);
 r.push(['Memory snap: hides after 5 seconds', a.G('memTimer!==null && MEMORY_SHOW_MS')===5000]);
 a.G('memHide()');
 r.push(['Memory snap: then 12 to choose from', a.doc.querySelectorAll('[data-act="memPick"]').length===12 && a.T().includes('Tap the ones you remember.')]);
 const shown=a.G('MEMORY_ROUNDS[ui.memRound].show'); a.click(act('memPick',shown[0])); a.click(act('memPick','arrow'));
 look(a,'memory pick'); a.click(act('memReveal'));
 r.push(['Memory snap: reveal outlines the 6 that were there', a.doc.querySelectorAll('.shape.was').length===6 && a.T().includes("Here's what was there.")]);
 r.push(['Memory snap: never a count or score', !/\d/.test(gameText(a))]);
 look(a,'memory reveal'); a.click(act('gDone')); finish(a,'distraction_memory','Memory snap');}
{const a=menu(); a.click(act('game','memory')); a.click(act('home')); a.G('memHide()');
 r.push(['Memory snap: leaving early stops its timer', a.S().screen==='home' && a.G('memTimer')===null]);}
{const a=menu(); a.click(act('game','pattern'));
 r.push(['Pattern break: 4 soft pads, a sequence of 4', a.S().screen==='g-pattern' && a.doc.querySelectorAll('.pad').length===4 && a.G('ui.patSeq.length')===4 && a.G('ui.patPlaying')===true]);
 a.G('stopGameTimers()');
 const seq=a.G('ui.patSeq'); const wrong=(seq[0]+1)%4;
 a.click(act('padTap',String(seq[0]))); a.click(act('padTap',String(wrong)));
 r.push(['Pattern break: a wrong tap just replays it gently, no fail state', a.S().screen==='g-pattern' && a.G('ui.patDone')===false && a.doc.getElementById('patMsg').textContent==="Let's watch it again." && a.G('ui.patPlaying')===true]);
 look(a,'pattern wrong'); a.G('stopGameTimers(); ui.patInput=[]');
 for(const k of seq) a.click(act('padTap',String(k)));
 r.push(['Pattern break: tap it back and it ends calmly', a.G('ui.patDone')===true && a.T().includes("That's the pattern.")]);
 look(a,'pattern done'); a.click(act('gDone')); finish(a,'distraction_pattern','Pattern break');}
{const a=menu(); a.click(act('game','pattern')); a.G('stopGameTimers()'); a.click(act('gDone'));
 r.push(['Pattern break: "I\'m done" any time still reaches the check-in', a.S().screen==='game-check']);}
{const a=menu(); a.click(act('game','sixty'));
 r.push(['60-second challenge: the Focus mechanic with its own line', a.S().screen==='focus' && a.S().currentInterventionId==='distraction_60_second' && a.doc.getElementById('screen-title').textContent==='For the next 60 seconds, your only job is to beat the timer.']);
 look(a,'sixty'); a.click(act('focusDone')); finish(a,'distraction_60_second','60-second challenge');}
{const a=menu(); a.click(act('distFocus'));
 r.push(['Focus is still here and works as before', a.S().screen==='focus' && a.S().currentInterventionId==='distraction_game' && a.doc.getElementById('screen-title').textContent==='Tap when the dot is inside the ring.']);
 a.click(act('focusDone')); r.push(['...Focus ends at the usual check-in', a.S().screen==='checkin']);}
r.push(['no game screen shows a number that judges performance', judged.length===0, judged.join(' | ')]);

// ---- the check-in feeds outcomes and the engine ----
function played(arg, change){ const a=menu(); a.click(act('game',arg)); a.G('stopGameTimers()'); if(a.S().screen==='focus') a.click(act('focusDone')); else a.G('ACTIONS.gDone()'); a.click(act('gameChange',change)); return a; }
{const a=played('around','yes'); const o=a.S().sessionHistory.at(-1);
 r.push(['Yes → outcome recorded with the change, then the engine\'s next step', o.interventionId==='distraction_around_me' && o.state==='distraction' && o.change==='yes' && o.after===null && a.S().screen==='recommendation']);
 r.push(['outcome saved on the device like any other', (a.w.localStorage.getItem(a.G('STORE_KEY'))||'').includes('"change":"yes"')]);}
{const a=played('cats','a_little'); r.push(['A little → recorded as a_little', a.S().sessionHistory.at(-1).change==='a_little' && a.S().screen==='recommendation']);}
{const a=played('color','no');
 r.push(['No → "Let\'s try something different", never the same game again', a.S().screen==='recommendation' && a.S().lastEnginePick!=='distraction_color_hunt' && a.T().includes("Let's try something different.")]);
 r.push(['No is not "I still feel bad" (no automatic YELLOW from games)', a.S().stillBadCount===0]);}
{const a=menu(); a.click(act('game','memory')); a.G('memHide()'); a.click(act('memReveal')); a.click(act('gDone')); a.click(act('ciSkip'));
 r.push(['Skip → recorded with no change, then the next step', a.S().sessionHistory.at(-1).change===undefined && a.S().screen==='recommendation']);}
{const a=played('around','yes'); a.G('ui.engine={interventionId:"distraction_pattern",reason:"x"}'); a.click(act('recTry'));
 r.push(['when the engine suggests a game, Try opens that game', a.S().screen==='g-pattern' && a.S().currentInterventionId==='distraction_pattern']);}

// ---- safety ----
for(const [arg,screen] of [['color','g-color'],['around','g-around'],['cats','g-cats'],['memory','g-memory'],['pattern','g-pattern'],['sixty','focus']]){
  const a=menu(); a.click(act('game',arg));
  const ok=a.S().screen===screen && !!a.doc.querySelector('header .help-pill[data-act="crisis"]');
  a.click('header .help-pill[data-act="crisis"]');
  r.push([`${arg}: Help is one tap to the crisis screen`, ok && a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
}
{const a=menu(); a.click(act('game','color')); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})');
 a.G('ACTIONS.gNext()'); r.push(['RED stops a game mid-way', a.S().screen==='crisis']);
 a.G('ACTIONS.game("pattern")'); r.push(['RED: no game can start', a.S().screen==='crisis' && a.S().currentInterventionId==='distraction_color_hunt']);}

// ---- reduced motion ----
{const CSS=(HTML.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||'';
 const block=(CSS.match(/\/\* Stage 6\.4[\s\S]*?\/\* Large text/)||[''])[0];
 r.push(['game styles: no animations, nothing moves (color and opacity only)', block.length>0 && !/animation|transform|translate/.test(block)]);
 const a=boot(); const n=a.G('patGap()'); a.G('prefs.reduce=true'); const rm=a.G('patGap()');
 r.push(['Pattern break plays slower with reduced motion', rm>n]);
 a.G('ui=freshUi(); session={...initialSession, screen:"focus", currentState:"distraction", currentInterventionId:"distraction_60_second"}; render();');
 const area=a.doc.getElementById('focusArea'); Object.defineProperty(area,'clientWidth',{value:300});
 a.G('ui.focusStart=0; cancelAnimationFrame(focusRaf); focusLoop(1300); cancelAnimationFrame(focusRaf);');
 const m=(a.doc.getElementById('focusOrb').style.transform||'').match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
 r.push(['60-second challenge: reduced motion is side to side only', !!m && Number(m[2])===0]);}

// ---- Pattern break really plays (real timers) ----
{const a=menu(); a.click(act('game','pattern'));
 setTimeout(()=>{
   r.push(['Pattern break lights the pads in turn', a.doc.querySelectorAll('.pad.lit').length===1 && a.doc.getElementById('patMsg').textContent==='Watch.']);
   a.click(act('padTap','0'));
   r.push(['taps while it plays are ignored', a.G('ui.patInput.length')===0]);
   console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
   process.exit(0);
 }, 700);}
