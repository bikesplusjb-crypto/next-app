// Stage 6.14: Tech check. No shame; every path ends at a person or a real-world step; nothing typed is saved;
// the self-reflection is the person's pick and is never computed or kept. Option 6 (ai_reality) is on hold.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(storage){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump,has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const SAMPLE=a=>a.G('ACTIONS.loadSample(); ACTIONS.home()');
const shame=/addict|dependen|unhealthy|wrong with you|you('re| are) wrong|not real|isn't real\b(?! relationship)|too much time|obsess/i;
const realWorld=a=>a.has('a[href^="sms:"]')||a.has('a[href^="tel:"]')||a.has(act('route','connect'))||a.has(act('route','scene'))||a.has(act('hfPeople'))||a.has(act('tcLoop'));

// ---- entry ----
{const a=boot(); a.click(act('techStart'));
 r.push(['Home → Tech check: "No judgment. Tech is allowed. Let\'s just see what it\'s doing to you right now."', a.S().screen==='tech' && a.T().includes("No judgment. Tech is allowed. Let's just see what it's doing to you right now.")]);
 r.push(['six options: asking AI again · checking · falling behind · attached · instead of people · AI changed or gone', a.doc.querySelectorAll('[data-act="tcPick"]').length===6
   && ["I keep asking AI the same thing","I keep checking","I'm afraid I'm falling behind","I think I'm getting attached to AI","I'm using AI instead of people","My AI changed or is gone"].every(x=>a.T().includes(x))]);
 r.push(['"I\'m not sure what\'s real" is on hold (clinician review before it ships)', !a.T().includes("not sure what's real") && !a.G('findIntervention("ai_reality")') && !a.G('TC_OPTIONS').some(o=>o[3]==='ai_reality')]);
 r.push(['no shame anywhere in Tech check copy', !shame.test(a.G('JSON.stringify([TC_INTRO,TC_OPTIONS,TC_RELIANCE,TC_SDA,TC_CHECK_Q,TC_LOOP_STEPS,TC_LOOP_ASK,TC_LOOP_END,TC_FOMO_MISS,TC_FOMO_FIELDS,TC_FOMO_END,TC_FOMO_USING,TC_ATTACHED,TC_GIVES,TC_REPLACING,TC_BOUNDARY_NOTE,TC_LOSS,TC_LOSS_GROUND,TC_LOSS_MSG,TC_REFLECT])').replace("It still isn't a human relationship",""))]);
 r.push(['the new steps are never suggested outside Tech check', ['ai_reliance_check','break_the_loop','ai_fomo','ai_relationship_check','ai_loss'].every(id=>{ const i=a.G(`findIntervention(${JSON.stringify(id)})`); return i && i.states.length===0 && i.channel; })]);
 a.G('openCrisis()'); a.G('ACTIONS.techStart()'); r.push(['RED: Tech check cannot open over a crisis', a.S().screen==='crisis']);}

// ---- 1. asking AI the same thing ----
{const a=boot(); SAMPLE(a); a.click(act('techStart')); a.click(act('tcPick','reliance'));
 r.push(['1: "Sometimes another answer doesn\'t solve uncertainty…" then Stop · Decide · Act', a.S().screen==='tc-reliance' && a.T().includes("Sometimes another answer doesn't solve uncertainty. It just gives it another place to go.") && ['Close the chat for 10 minutes.','What do you actually need to decide?','Take one real-world step.'].every(x=>a.T().includes(x)) && a.S().currentInterventionId==='ai_reliance_check']);
 a.click(act('tcLoop')); r.push(['"Start a 10-minute break" → the loop break', a.S().screen==='tc-loop' && a.S().currentInterventionId==='ai_reliance_check']);
 a.click(act('tcReflect'));
 r.push(['self-reflection: "Which feels closest right now?" the person picks', a.S().screen==='tc-reflect' && ["AI is a tool for me","It's becoming a way to cope","It's time to step away for a bit"].every(x=>a.T().includes(x))]);
 const before=JSON.stringify(a.dump());
 a.click(act('tcCheckin','r1'));
 r.push(['...→ check-in; the pick is never computed, scored, labeled or saved', a.S().screen==='checkin' && JSON.stringify(a.dump())===before && !/becoming a way to cope|r1/.test(JSON.stringify(a.G('ui'))+JSON.stringify(a.S()))]);
 a.click(act('ciHelped')); const o=a.G('session.sessionHistory').at(-1);
 r.push(['the outcome is a normal check-in for ai_reliance_check', o.interventionId==='ai_reliance_check' && !('reflect' in o) && a.S().screen==='phone-down']);}

// ---- 2. checking ----
{const now0=Date.now(); const a=boot(); a.click(act('techStart')); a.click(act('tcPick','check'));
 r.push(['2: "Are you looking for information, or reassurance?"', a.S().screen==='tc-check' && a.T().includes('Are you looking for information, or reassurance?') && a.S().currentInterventionId==='break_the_loop']);
 a.click('[data-act="tcLoop"]');
 r.push(['10-minute loop break: a countdown from 10:00 and the checklist', a.doc.getElementById('tcTime').textContent==='10:00' && ['Stop checking','Put the phone face down','Do one physical thing: stand, stretch, get water','Play a quick game or change the scene'].every(x=>a.T().includes(x)) && a.T().includes('In 10 minutes, ask: do I still need to check?')]);
 r.push(['the timer runs', a.G('tcTimer')!==null]);
 a.click(act('tcStep','face')); r.push(['checklist items tick (in memory only)', a.doc.querySelector(act('tcStep','face')).getAttribute('aria-pressed')==='true' && !/face/.test(JSON.stringify(a.dump()))]);
 r.push(['a quick game or change the scene: one tap away', a.has(act('route','head')) && a.has(act('route','scene'))]);
 a.G('ui.tcLoopEnd = Date.now() - 1; tcTick()');
 r.push(['at ten minutes: "Ten minutes. Do you still need to check?"', a.T().includes('Ten minutes. Do you still need to check?') && a.G('tcTimer')===null]);
 a.click(act('tcReflect')); a.click('[data-act="tcCheckin"]:not([data-arg])');
 r.push(['→ reflection (skippable) → check-in', a.S().screen==='checkin']);}
{const a=boot(); a.click(act('techStart')); a.click(act('tcPick','check')); a.click('[data-act="tcLoop"]'); a.click('header [data-act="crisis"]');
 r.push(['leaving the loop break stops its timer', a.G('tcTimer')===null]);}

// ---- 3. falling behind ----
{const a=boot(); SAMPLE(a); a.click(act('techStart')); a.click(act('tcPick','fomo'));
 r.push(['3: "What are you afraid of missing?" career · money · productivity · knowledge · creativity · relationships · something else', a.S().screen==='tc-fomo' && ['Career','Money','Productivity','Knowledge','Creativity','Relationships','Something else'].every(x=>a.has(act('tcMiss',x)))]);
 r.push(['three fields: What I know / What I\'m afraid of / One thing I can actually do', ["What I know","What I'm afraid of","One thing I can actually do"].every(x=>a.T().includes(x)) && a.T().includes('Not saved.')]);
 a.doc.getElementById('tcF_know').value='My job is changing'; a.click(act('tcMiss','Career'));
 r.push(['a chip tap keeps what was typed', a.doc.getElementById('tcF_know').value==='My job is changing']);
 a.doc.getElementById('tcF_do').value='Learn one tool for 20 minutes'; a.click(act('tcFomoNext'));
 r.push(['→ "You don\'t need to keep checking. Pick one thing, then close it and do the thing."', a.S().screen==='tc-fomo-end' && a.T().includes("You don't need to keep checking. Pick one thing, then close it and do the thing.") && a.T().includes('Learn one tool for 20 minutes')]);
 r.push(['→ Talk it over with someone (a real person)', a.T().includes('Talk it over with someone') && a.has('a[href^="sms:"]') && a.has('a[href^="tel:"]')]);
 r.push(['"If you\'re drinking or using more to cope, that\'s worth saying out loud to someone." links to the craving flow', a.T().includes("If you're drinking or using more to cope, that's worth saying out loud to someone.") && a.has(act('flow','craving'))]);
 a.click(act('tcCheckin'));
 r.push(['nothing typed is saved', !/job is changing|Learn one tool/.test(JSON.stringify(a.dump())) && !/job is changing|Learn one tool/.test(JSON.stringify(a.G('ui')))]);}
{const a=boot(); a.click(act('techStart')); a.click(act('tcPick','fomo')); a.doc.getElementById('tcF_fear').value='I want to kill myself'; a.click(act('tcFomoNext'));
 r.push(['3: text goes through safetyCheck: RED → crisis, the fields are dropped', a.S().screen==='crisis' && !/kill myself/.test(JSON.stringify(a.G('ui'))+JSON.stringify(a.dump()))]);}
{const a=boot(); a.click(act('techStart')); a.click(act('tcPick','fomo')); a.doc.getElementById('tcF_fear').value='I feel hopeless about it'; a.click(act('tcFomoNext'));
 r.push(['3: YELLOW continues with the support bar', a.S().screen==='tc-fomo-end' && a.S().safetyLevel==='YELLOW']);}

// ---- 4. attached / instead of people ----
{const a=boot(); SAMPLE(a); a.G('navigator.clipboard={writeText:t=>{window.copied=t;return Promise.resolve();}}'); a.click(act('techStart')); a.click(act('tcPick','attached'));
 r.push(['4: "AI can feel personal. … It still isn\'t a human relationship."', a.S().screen==='tc-attached' && a.T().includes("AI can feel personal. It answers fast, remembers what you said, and never gets tired. That can feel meaningful. It still isn't a human relationship.") && a.S().currentInterventionId==='ai_relationship_check']);
 r.push(['tap-only: What does it give you? / What might it be replacing?', a.doc.querySelectorAll('[data-act="tcGive"]').length===7 && a.doc.querySelectorAll('[data-act="tcReplace"]').length===8 && !a.has('.content textarea, .content input')]);
 a.click(act('tcGive','Company')); a.click(act('tcReplace','Sleep'));
 r.push(['picks show, and are not saved', a.doc.querySelector(act('tcGive','Company')).getAttribute('aria-pressed')==='true' && !/Company|Sleep/.test(JSON.stringify(a.dump()))]);
 r.push(['"Would one real-world connection help right now?" text · call · be around people · go somewhere · tech break', a.T().includes('Would one real-world connection help right now?') && ['Text someone','Call someone','Be around people','Go somewhere','Take a tech break'].every(x=>a.T().includes(x)) && a.has('a[href^="sms:"]') && a.has('a[href^="tel:"]')]);
 r.push(['boundary text exact', a.doc.getElementById('tcBoundary').textContent==="If we've been talking for more than 30 minutes, or it's after midnight, remind me to rest and to reach out to a real person. If I ever talk about wanting to die or hurting myself, stop any roleplay and tell me to call or text 988."]);
 r.push(['"Not every AI follows this every time. It\'s a nudge, not a guarantee."', a.T().includes("Not every AI follows this every time. It's a nudge, not a guarantee.")]);
}
{const a=boot(); a.click(act('techStart')); a.click(act('tcPick','instead'));
 r.push(['"I\'m using AI instead of people" opens the same path', a.S().screen==='tc-attached' && a.T().includes('Using AI instead of people') && a.S().currentInterventionId==='ai_relationship_check']);
 r.push(['with no one in My Plan, connection buttons go to Connect', a.has(act('route','connect'))]);
 a.click(act('tcReflect')); r.push(['→ self-reflection', a.S().screen==='tc-reflect']);}

// ---- 5. AI changed or gone ----
{const a=boot(); SAMPLE(a); a.click(act('techStart')); a.click(act('tcPick','loss'));
 r.push(['5: "What you felt was real. Losing a voice you talked to every day can feel like a breakup or a loss…"', a.S().screen==='tc-loss' && a.T().includes('What you felt was real. Losing a voice you talked to every day can feel like a breakup or a loss. A lot of people are going through this.') && a.S().currentInterventionId==='ai_loss']);
 a.click(act('tcLossNext')); r.push(['→ a grounding step', a.T().includes('press your feet into the floor')]);
 a.click(act('tcLossNext')); r.push(['→ optional "Write what you\'d want to say" (not saved)', a.T().includes("Write what you'd want to say") && a.has('#tcLossBox') && a.has(act('tcLossSkip'))]);
 a.doc.getElementById('tcLossBox').value='I miss talking to you every night'; a.click(act('tcLossWrite'));
 r.push(['→ tell one person with the prepared text', a.T().includes('Tell one person') && a.has(`a[href*="${encodeURIComponent("Something hard happened and I could use someone to talk to. Got a few minutes?")}"]`)]);
 r.push(['the words are dropped', !/miss talking/.test(JSON.stringify(a.dump())+JSON.stringify(a.G('ui'))+a.doc.body.innerHTML)]);
 a.click(act('tcCheckin')); r.push(['→ check-in', a.S().screen==='checkin']);}
{const a=boot(); a.click(act('techStart')); a.click(act('tcPick','loss')); a.click(act('tcLossNext')); a.click(act('tcLossNext'));
 a.doc.getElementById('tcLossBox').value='i want to die'; a.click(act('tcLossWrite'));
 r.push(['5: RED writing → crisis', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);}

// ---- every screen ----
r.push(['Help on every Tech check screen', (()=>{ const a=boot(); return ['tech','tc-reliance','tc-check','tc-loop','tc-fomo','tc-fomo-end','tc-attached','tc-loss','tc-reflect'].every(s=>{ a.G(`lastRendered=null; session={...initialSession, screen:${JSON.stringify(s)}}; render()`); return a.has('header .help-pill[data-act="crisis"]'); }); })()]);
r.push(['every path ends at a person or a real-world step', (()=>{ const a=boot(); SAMPLE(a);
  const ends=[['tc-reliance',''],['tc-loop',''],['tc-fomo-end',''],['tc-attached',''],['tc-loss','ui.tcStep=3;']];
  return ends.every(([s,x])=>{ a.G(`${x} lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`); return realWorld(a); }); })()]);

(async()=>{
  const a=boot(); a.G('navigator.clipboard={writeText:t=>{window.copied=t;return Promise.resolve();}}'); a.click(act('techStart')); a.click(act('tcPick','attached')); a.click(act('tcCopy'));
  await new Promise(res=>setTimeout(res,10));
  r.push(['Copy boundary text copies it exactly', a.w.copied===a.G('TC_BOUNDARY') && a.T().includes("Copied.")]);
  console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
  process.exit(0);
})();
