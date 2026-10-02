const {JSDOM}=require('jsdom');
const fs=require('fs');
function boot(){
 const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
 const w=dom.window; w.scrollTo=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 const S=()=>w.eval('session');
 if(String(S().screen).startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`)); // first-launch onboarding: see onboarding.test.js
 return {w,click,S};
}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
let r=[];
// Test 1 + 10
{const {w,click,S}=boot();
 click(act('flow','anxious')); click(act('rate','7')); click(act('beforeContinue'));
 click(act('feetDone')); click(act('threeSkip')); click(act('stepsDone'));
 for(let i=0;i<5;i++) click(act('groundNext'));
 click(act('rate','4')); click(act('ciHelped'));
 let s=S(); r.push(['T1 recommendation', s.screen==='recommendation' && s.sessionHistory.length===1 && s.sessionHistory[0].interventionId==='grounding' && s.sessionHistory[0].before===7&&s.sessionHistory[0].after===4, s.lastEngineReason]);
 click(act('recTry')); s=S(); r.push(['T10 walking screen', s.screen==='intervention'&&s.currentInterventionId==='walking']);
 for(let i=0;i<3;i++) click(act('ivNext')); click(act('ivDone')); click(act('ciSkip'));
 s=S(); r.push(['T10 saved walking', s.sessionHistory.at(-1).interventionId==='walking'&&s.interventionPicks.includes('walking'), s.interventionPicks.join()]);
}
// Test 2 RED text
{const {w,click,S}=boot();
 click(act('flow','anxious')); click(act('beforeSkip')); click(act('feetDone'));
 w.document.getElementById('three0').value='I want to die'; click(act('threeDone'));
 const s=S(); r.push(['T2 RED', s.screen==='crisis'&&s.safetyLevel==='RED'&&s.sessionHistory.length===0]);
}
// Test 3 YELLOW via 9s + persistence
{const {w,click,S}=boot();
 click(act('flow','anxious')); click(act('rate','9')); click(act('beforeContinue'));
 click(act('feetDone')); click(act('threeSkip')); click(act('stepsDone'));
 for(let i=0;i<5;i++) click(act('groundNext'));
 click(act('rate','9')); click(act('ciHelped'));
 let s=S(); r.push(['T3 YELLOW', s.yellow&&s.safetyLevel==='YELLOW']);
 click(act('home')); r.push(['T3 bar on home', !!w.document.querySelector('.ybar')]);
 r.push(['YELLOW rec is connection?', true, s.lastEnginePick]);
}
// Test 4 still bad x2
{const {w,click,S}=boot();
 click(act('flow','low')); click(act('beforeSkip')); click(act('lowPick','hydration'));
 click(act('ivNext')); click(act('ivDone')); click(act('ciBad'));
 click(act('recTry')); let n=0; while(w.document.querySelector(act('ivNext'))&&n<6){click(act('ivNext'));n++} click(act('ivDone')); click(act('ciBad'));
 const s=S(); r.push(['T4 still bad YELLOW', s.yellow&&s.stillBadCount===2, s.lastEnginePick]);
}
// Test 5 spiraling
{const {w,click,S}=boot();
 click(act('flow','spiraling')); click(act('beforeSkip'));
 w.document.getElementById('thoughts').value='I might lose my job\nThe weather\nCall mom';
 click(act('spMake')); click(act('spPlace','0:now')); click(act('spPlace','1:notmine')); click(act('spPlace','2:later'));
 click(act('spSortNext')); click(act('spTemplate','Put it on my calendar')); click(act('spNextDone')); click(act('ciSkip'));
 const s=S(); r.push(['T5 spiral', s.screen==='recommendation'&&s.sessionHistory[0].interventionId==='thought_parking']);
}
// Test 6, 7 (Stage 6.2 replaced the six-option triage with "I don't know what I need")
{const {w,click,S}=boot(); click(act('dontKnow')); click(act('route','scene')); click(act('beforeSkip'));
 const s=S(); r.push(['T6 dont-know -> change the scene', s.currentInterventionId==='environment_change'&&s.screen==='intervention']);}
{const {w,click,S}=boot(); click(act('dontKnow')); click(act('getHelpNow'));
 const s=S(); r.push(['T7 dont-know Get help now -> crisis RED', s.screen==='crisis'&&s.safetyLevel==='RED']);}
// Test 9
{const {w,click,S}=boot(); click(act('crisis')); click(act('cBack'));
 const s=S(); r.push(['T9 exit', s.screen==='home'&&s.safetyLevel==='YELLOW'&&s.yellow&&!!w.document.querySelector('.ybar')]);}
// Test 11 grounding + call
{const {w,click,S}=boot(); click(act('crisis'));
 r.push(['wording', w.document.body.textContent.includes('Are you in danger of hurting yourself or someone else right now?')]);
 click(act('cNo')); let s=S(); r.push(['NO -> crisis-no YELLOW', s.screen==='crisis-no'&&s.safetyLevel==='YELLOW']);
 click(act('noGround')); for(let i=0;i<5;i++) click(act('groundNext'));
 s=S(); r.push(['ground -> safety-check', s.screen==='safety-check']);
 click(act('safeNotSure')); s=S(); r.push(['not sure -> RED full', s.screen==='crisis-full'&&s.safetyLevel==='RED']);
}
{const {w,click,S}=boot(); click(act('tab','settings')); click(act('loadSample')); // needs a trusted person; real users start empty
 click(act('crisis')); click(act('cNo')); click(act('noTalk'));
 const a=w.document.querySelector('[data-noexit]'); a.addEventListener('click',e=>e.preventDefault()); click('[data-noexit]');
 let s=S(); r.push(['call sets safety-check', s.screen==='safety-check']);

}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[2]?'  ('+x[2]+')':'')).join('\n'));
