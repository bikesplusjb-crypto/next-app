// Stage 6.17: Let's Zig + real-world steps. A simple product rule (different channel after "didn't help"),
// a calm "You're ready." ending, and six small real-world steps. Safety routing always comes first.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump,
   has:sel=>!!w.document.querySelector(sel)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const ch=(a,id)=>a.G(`findIntervention(${JSON.stringify(id)}).channel`);
// Finish a step and answer the check-in.
const finish=(a,state,id,how,rating)=>{ a.G(`session.currentState=${JSON.stringify(state)}; startIntervention(${JSON.stringify(id)}); go("checkin")`); if(rating!=null) a.click(act('rate',String(rating))); a.click(act(how)); };

// ---------- A. Let's Zig ----------
{const a=boot(); const lib=a.G('INTERVENTION_LIBRARY');
 r.push(['every intervention has one of the five channels', lib.every(i=>['BODY','SPACE','SENSE','PEOPLE','ACTION'].includes(i.channel)), lib.filter(i=>!i.channel).map(i=>i.id).join()]);
 r.push(['channels as specified', ['grounding','breathing','hydration','walking','touch_real_world'].every(i=>ch(a,i)==='BODY') && ['change_scene','environment_change','find_alive'].every(i=>ch(a,i)==='SPACE')
   && ['distraction_game','distraction_color_hunt','ridiculous_mode','zags'].every(i=>ch(a,i)==='SENSE') && ch(a,'connection')==='PEOPLE'
   && ['thought_parking','still_true','true_sentence','kind_stranger','borrow_ten'].every(i=>ch(a,i)==='ACTION')]);
 r.push(['INTERVENTION_LIBRARY is still an array, looked up with .find', a.G('Array.isArray(INTERVENTION_LIBRARY)') && /const findIntervention = id => INTERVENTION_LIBRARY\.find\(i => i\.id === id\);/.test(HTML)]);
 r.push(['no IDs from the draft that do not exist', !['touch_real','digital_fidget','show_good','make_smile','tiny_mission','object_anchor','one_song','emergency_pocket','the_door','where_am_i','one_true_thing'].some(id=>a.G(`!!findIntervention("${id}")`))]);}
for(const [state,id] of [['anxious','breathing'],['anxious','grounding'],['spiraling','thought_parking'],['low','hydration'],['distraction','distraction_around_me']]){
  const a=boot(); finish(a,state,id,'ciBad',5);
  const pick=a.S().lastEnginePick;
  r.push([`didn't help after ${id} (${ch(a,id)}) → a different channel (${pick}: ${pick&&ch(a,pick)})`, !!pick && ch(a,pick)!==ch(a,id)]);
}
{const a=boot(); finish(a,'anxious','breathing','ciBad',5);
 r.push(['"Okay. That wasn\'t it. Let\'s Zig." + the new direction', a.T().includes("Okay. That wasn't it.Let's Zig.") && Object.values(a.G('CHANNEL_LINE')).some(l=>a.T().includes(l))]);}
{const a=boot(); finish(a,'anxious','breathing','ciSkip');
 r.push(['no "Let\'s Zig" after Skip', a.S().screen==='recommendation' && !a.T().includes("Let's Zig")]);}
{const a=boot(); finish(a,'anxious','breathing','ciHelped'); a.click(act('phoneDownElse'));
 r.push(['no "Let\'s Zig" after "That helped"', !a.T().includes("Let's Zig") && a.T().includes('What would make this 10% easier?')]);}
{const a=boot(); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"})'); finish(a,'anxious','grounding','ciBad',5);
 r.push(['YELLOW priority still wins (connection first, even after a "didn\'t help")', a.S().lastEnginePick==='connection']);}
{const a=boot(); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"})'); finish(a,'spiraling','connection','ciBad',5);
 r.push(['YELLOW: after connection, still the YELLOW order (not Let\'s Zig)', ['grounding','environment_change'].includes(a.S().lastEnginePick) || a.G('getPlan().helps.includes(session.lastEnginePick)')]);}
{const a=boot(); finish(a,'spiraling','still_true','ciBad',9);
 const p=a.S().lastEnginePick;
 r.push([`latest rating 8+ → BODY, SPACE or PEOPLE when available (${p}: ${ch(a,p)})`, ['BODY','SPACE','PEOPLE'].includes(ch(a,p))]);}
{const a=boot(); finish(a,'spiraling','grounding','ciBad',4);
 r.push(['below 8, ACTION steps can be offered (rule 3 only applies at 8+)', !!a.S().lastEnginePick]);}
{const scan=HTML+fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8')+fs.readFileSync(path.join(__dirname,'REVIEW.md'),'utf8');
 r.push(['no screen says "make you feel better" or "will help you feel"', !/make you feel better|will help you feel/i.test(scan)]);}
{const a=boot(); a.click(act('dontKnow')); const t=a.T(); a.G('ACTIONS.tab("settings")'); a.click(act('about'));
 r.push(['"What would make this 10% easier?" on I don\'t know what I need', t.includes('What would make this 10% easier?')]);
 r.push(['About: the signature lines (no ™)', a.T().includes("When something isn't helping, ZigZag doesn't tell you to try harder. It helps you try a different direction.") && a.T().includes("Don't fight the feeling. Change one variable.") && !/™/.test(HTML)]);}

// ---------- B. Put the phone down ----------
{const a=boot(); finish(a,'anxious','breathing','ciHelped',3);
 r.push(['after "That helped": "You\'re ready." with Put the phone down as the main button', a.S().screen==='phone-down' && a.T().includes("You're ready.") && a.T().includes('You can put me away for a few minutes.') && a.doc.querySelector('.actions .btn-primary').dataset.act==='putDown']);
 const count=a.S().interventionCount; a.click(act('putDown'));
 r.push(['Put the phone down → Home, quietly; nothing else starts', a.S().screen==='home' && a.S().interventionCount===count && !a.has('.notice')]);}
{const a=boot(); finish(a,'anxious','breathing','ciSkip');
 r.push(['the recommendation screen offers "I\'m good for now"', !!a.has(act('phoneDown')) && a.T().includes("I'm good for now")]);
 a.click(act('phoneDown')); r.push(['...which goes to "You\'re ready."', a.S().screen==='phone-down']);}
{const a=boot(); a.G('startFlow("anxious"); ACTIONS.beforeSkip(); go("phone-down")');
 r.push(['the ending never suggests another activity', !/Try |Something else|recTry/.test(a.doc.getElementById('app').innerHTML.replace(/data-act="phoneDownElse"[^>]*>Something else/,''))]);}

// ---------- C. Borrow ten minutes ----------
{const a=boot(); a.click(act('flow','low')); a.click(act('beforeSkip'));
 r.push(['C entry: I feel low', a.has(act('lowPick','borrow_ten'))]);
 a.click(act('lowPick','borrow_ten'));
 r.push(['"You don\'t have to decide the rest of your day." · "Just borrow the next ten minutes."', a.S().screen==='borrow' && a.T().includes("You don't have to decide the rest of your day.") && a.T().includes('Just borrow the next ten minutes.')]);
 const opts=[...a.doc.querySelectorAll('[data-act="borrowPick"]')].map(b=>b.textContent);
 r.push(['eight options', opts.join('|')==='Walk|Shower|Sit outside|Put on music|Drink water|Call someone|Tidy one thing|Change rooms']);
 a.click(act('borrowPick','walk'));
 r.push(['one thing, full screen; the timer is optional', a.S().screen==='borrow-step' && a.has(act('borrowTimer')) && !a.has('#borrowTime')]);
 a.click(act('borrowTimer')); r.push(['starting it shows a gentle timer', a.has('#borrowTime') && a.T().includes('Leave any time.')]);
 a.click(act('borrowDone'));
 r.push(['leaving early is not failing: "The ten minutes are yours."', a.S().screen==='borrow-end' && a.T().includes('The ten minutes are yours.') && !/fail|didn't finish|gave up|early/i.test(a.T())]);
 a.click(act('stepCheckin')); r.push(['then the check-in', a.S().screen==='checkin']);}
{const a=boot(); a.click(act('flow','craving')); a.click(act('beforeSkip'));
 r.push(['C entry: the urge-to-use flow, next to the 15-minute delay', a.S().screen==='craving-delay' && a.has(act('crvBorrow'))]);
 a.click(act('crvBorrow')); r.push(['...opens Borrow ten minutes', a.S().screen==='borrow']);}
{const a=boot(); a.click(act('route','head')); r.push(['C entry: Get out of my head', a.has(act('lowPick','borrow_ten'))]);}

// ---------- D. What's also true ----------
const tsStart=a=>{ a.click(act('route','calm')); a.click(act('calmPick','truth')); a.click(act('calmPick','also')); };
{const a=boot(); tsStart(a);
 r.push(['D entry: Calm; "What\'s the sentence your brain keeps repeating?" (120 characters)', a.S().screen==='ts' && a.T().includes("What's the sentence your brain keeps repeating?") && a.doc.getElementById('tsBox').maxLength===120]);
 a.doc.getElementById('tsBox').value='Everything is going wrong'; a.click(act('tsNext'));
 r.push(['then "What\'s also true?" with optional examples', a.T().includes("What's also true?") && a.doc.querySelectorAll('[data-act="tsExample"]').length===3]);
 a.click(act('tsExample','0')); r.push(['an example only fills the box (not submitted)', a.doc.getElementById('tsBox').value==="I'm having a really hard night." && a.S().screen==='ts']);
 a.click(act('tsNext'));
 r.push(['both lines shown, the second larger', a.S().screen==='ts-show' && a.doc.querySelector('.ts-worst').textContent==='Everything is going wrong' && a.doc.getElementById('screen-title').textContent==="I'm having a really hard night."]);
 r.push(['nothing saved on success', !Object.values(a.dump()).join('').includes('Everything is going wrong') && !Object.values(a.dump()).join('').includes('hard night')]);}
{const a=boot(); tsStart(a); a.doc.getElementById('tsBox').value='I want to kill myself'; a.click(act('tsNext'));
 r.push(['D: RED in the first line → crisis, nothing saved', a.S().screen==='crisis' && a.G('ui.tsWorst')==='' && !Object.values(a.dump()).join('').includes('kill myself')]);}
{const a=boot(); tsStart(a); a.doc.getElementById('tsBox').value='Nothing works'; a.click(act('tsNext')); a.doc.getElementById('tsBox').value='kms'; a.click(act('tsNext'));
 r.push(['D: RED in the second line → crisis, nothing saved', a.S().screen==='crisis' && a.G('ui.tsWorst')==='' && !Object.values(a.dump()).join('').includes('Nothing works')]);}
{const a=boot(); a.click(act('flow','spiraling')); a.click(act('beforeSkip')); r.push(['D entry: the I\'m spiraling flow', a.has(act('spAlsoTrue'))]);}

// ---------- E. kind stranger ----------
{const a=boot(); a.click(act('flow','low')); a.click(act('beforeSkip')); a.click(act('lowPick','kind_stranger'));
 r.push(['E: the question and five taps, no typing', a.T().includes('If someone you cared about felt like this, what would you tell them?') && a.doc.querySelectorAll('[data-act="strangerPick"]').length===5 && !a.has('#app input, #app textarea')]);
 a.click(act('strangerPick','0')); r.push(['...then "You can give yourself the same."', a.T().includes('You can give yourself the same.') && a.has(act('putDown'))]);}

// ---------- F. find something alive ----------
{const a=boot(); a.click(act('route','scene')); a.click(act('sceneAlive'));
 r.push(['F: "Find something alive." / "Do you have a pet nearby?"', a.S().screen==='alive' && a.T().includes('Find something alive.') && a.T().includes('Do you have a pet nearby?')]);
 a.click(act('alivePet','yes')); r.push(['yes → go find them', a.T().includes("Go find them. Notice what they're doing, how they move, what they sound like.")]);
 a.click(act('aliveDone')); r.push(['...ends: "You spent a moment noticing something outside yourself."', a.T().includes('You spent a moment noticing something outside yourself.')]);}
{const a=boot(); a.click(act('route','scene')); a.click(act('sceneAlive')); a.click(act('alivePet','no'));
 r.push(['no → look outside', a.T().includes('Look outside. Find a bird, a tree, an insect, or anything growing.')]);}

// ---------- G. Ridiculous mode ----------
{const a=boot(); a.click(act('route','head'));
 r.push(['G: in Get out of my head (only there)', a.has(act('ridiculousStart')) && !HTML.slice(HTML.indexOf('"low-choose"(){'),HTML.indexOf('"low-choose"(){')+2000).includes('ridiculous')]);
 a.click(act('ridiculousStart'));
 r.push(['one mission: "Make this less serious. Just for a moment."', a.S().screen==='ridiculous' && a.T().includes('Make this less serious. Just for a moment.') && a.G('RIDICULOUS_LINES').includes(a.doc.getElementById('screen-title').textContent)]);
 a.click(act('ridDone')); r.push(['"Okay. Back to reality." → check-in', a.S().screen==='checkin']);
 a.click(act('home')); a.click(act('route','head')); a.click(act('ridiculousStart')); a.click(act('home')); a.click(act('route','head'));
 r.push(['at most two per visit', !a.has(act('ridiculousStart')) && a.G('startIntervention("ridiculous_mode")')===false]);}
{const a=boot(); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"})'); a.click(act('route','head'));
 r.push(['hidden while YELLOW (menu and engine)', !a.has(act('ridiculousStart')) && a.G('runEngine(), interventionEngine({state:"distraction",hidden:ridiculousAvailable()?[]:["ridiculous_mode"]}).interventionId')!=='ridiculous_mode']);}
{const a=boot(); a.click('header .help-pill[data-act="crisis"]'); a.G('session.safetyLevel="GREEN"; session.yellow=false; go("home")'); a.click(act('route','head'));
 r.push(['hidden for the rest of the visit after any crisis screen (never saved)', !a.has(act('ridiculousStart')) && a.S().sawCrisis===true && !Object.values(a.dump()).join('').includes('sawCrisis')]);}
{const BANNED=/suicid|kill|die|dead|death|self.?harm|hurt|cut|blood|mental|crazy|insane|psycho|depress|anxi|trauma|emergenc|hospital|body|fat|ugly|weight|race|gender|gay|religio|disab|stupid|pathetic|loser|cry/i;
 const L=boot().G('RIDICULOUS_LINES');
 r.push(['RIDICULOUS_LINES: the five lines, none touching distress, bodies, identity or health', L.length===5 && L.every(x=>!BANNED.test(x)), L.filter(x=>BANNED.test(x)).join(' | ')]);}

// ---------- H. Find something real (+ anchor) ----------
{const a=boot(); a.click(act('route','calm')); a.click(act('calmPick','real'));
 r.push(['H: a Calm option, "Find something real." one prompt at a time', a.S().screen==='touch' && a.T().includes('Find something real.') && a.T().includes('Find something you can hold.')]);
 a.click(act('touchTex','cool')); r.push(['texture chips are optional toggles, nothing typed', a.has('[data-act="touchTex"][aria-pressed="true"]') && !a.has('#app input, #app textarea')]);
 a.click(act('touchNext')); r.push(['Next → the next prompt', a.doc.getElementById('screen-title').textContent==='Find something cooler.']);
 a.click(act('touchDone')); r.push(['Done any time → "You found something real."', a.T().includes('You found something real.')]);}
{const a=boot(); a.click(act('tab','plan')); a.click(act('planEdit','helps')); a.doc.getElementById('edAnchor').value='my bracelet'; a.click(act('planSave'));
 r.push(['My Plan → Things that help → "My anchor" saved with the plan', a.G('getPlan().anchor')==='my bracelet' && JSON.parse(a.dump()['next.v1.sensitive']).plan.anchor==='my bracelet' && a.T().includes('My anchor: my bracelet')]);
 a.click(act('tab','home')); a.click(act('route','calm')); a.click(act('calmPick','real'));
 r.push(['with an anchor: "Do you have your anchor nearby?"', a.T().includes('Do you have your anchor nearby?')]);
 a.click(act('anchorAns','yes')); r.push(['yes → "Hold it for a moment."', a.T().includes('Hold it for a moment.')]);
 a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything removes the anchor', a.G('getPlan().anchor')==='' && !Object.values(a.dump()).join('').includes('bracelet')]);}
{const a=boot(); a.G('getPlan().anchor="a stone"'); a.click(act('route','calm')); a.click(act('calmPick','real')); a.click(act('anchorAns','no'));
 r.push(['no → "Find something else you can safely hold."', a.T().includes('Find something else you can safely hold.')]);}

// ---------- every new screen: Help, and RED blocks it ----------
{const a=boot(); const screens=['phone-down','borrow','borrow-step','borrow-end','ts','ts-show','stranger','alive','ridiculous','touch'];
 const noHelp=[]; for(const s of screens){ a.G(`lastRendered=null; ui=freshUi(); session={...initialSession, screen:${JSON.stringify(s)}, currentState:"low"}; render()`); if(!a.has('header .help-pill[data-act="crisis"]')) noHelp.push(s); }
 r.push(['every new screen has Help in the top bar', noHelp.length===0, noHelp.join()]);
 const acts=['borrowPick("walk")','borrowTimer()','borrowDone()','tsNext()','strangerPick()','alivePet("yes")','aliveDone()','ridDone()','touchNext()','touchDone()','anchorAns("yes")','stepCheckin()','phoneDown()','crvBorrow()','spAlsoTrue()','sceneAlive()','ridiculousStart()'];
 const leaked=[]; for(const x of acts){ a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"}); session.screen="crisis"'); a.G(`ACTIONS.${x}`); if(a.S().screen!=='crisis') leaked.push(x); }
 r.push(['RED: every new action returns to the crisis screen (blockIfRed first)', leaked.length===0, leaked.join()]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
