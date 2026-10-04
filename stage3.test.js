const {JSDOM}=require('jsdom');
const fs=require('fs');
function boot(){const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
 const w=dom.window; w.scrollTo=()=>{}; w.scrollBy=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(String(w.eval('session.screen')).startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`)); // first-launch onboarding: see onboarding.test.js
 return {w,click,S:()=>w.eval('session'),U:()=>w.eval('ui')};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
{const {w,click,S,U}=boot();
 click(act('flow','craving'));
 r.push(['craving question', w.document.body.textContent.includes('How strong is the craving right now?')]);
 click(act('rate','8')); click(act('beforeContinue'));
 let s=S(); r.push(['craving-delay screen', s.screen==='craving-delay'&&s.currentInterventionId==='craving_delay']);
 r.push(['timer shows 15:00', w.document.getElementById('crvTime').textContent.startsWith('15:00')||w.document.getElementById('crvTime').textContent.startsWith('14:5'), w.document.getElementById('crvTime').textContent]);
 r.push(['safety row', w.document.body.textContent.includes('Call 911')]);
 click(act('crvStep','water')); r.push(['step toggles', U().cravingDone.water===true]);
 click(act('crvWave')); r.push(['wave opens', !!w.document.querySelector('.wave')]);
 click(act('crvFocus')); s=S(); r.push(['focus from craving', s.screen==='focus' && s.currentInterventionId==='craving_delay' && s.interventionCount===1]);
 click(act('focusDone')); r.push(['focus returns to craving', S().screen==='craving-delay']);
 w.eval('ui.cravingStart=Date.now()-16*60000; ui.cravingEnd=Date.now()-1000; render();');
 r.push(['done state', w.document.body.textContent.includes('You gave it the time.') && !!w.document.querySelector(act('crvCheck')+'.btn-primary')]);
 click(act('crvCheck'));
 const tx=w.document.body.textContent;
 r.push(['checkin craving copy', tx.includes('How strong is the craving now?') && tx.includes('You just put 16 minutes between the urge and the decision.') && !!w.document.querySelector(act('crvMore'))]);
 click(act('crvMore')); r.push(['add 5 min', S().screen==='craving-delay' && (U().cravingEnd-Date.now())>4*60000]);
 click(act('crvCheck')); click(act('rate','5')); click(act('ciHelped')); click(act('phoneDownElse'));
 s=S(); const o=s.sessionHistory.at(-1);
 r.push(['outcome 8->5', s.screen==='recommendation'&&o.before===8&&o.after===5&&o.interventionId==='craving_delay', s.lastEngineReason+' / '+s.lastEnginePick]);
 r.push(['change line', w.document.body.textContent.includes('8 → 5')]);
}
{const {w,click,S}=boot();
 click(act('flow','craving')); click(act('beforeSkip')); click(act('crvUsed'));
 r.push(['used screen', S().screen==='craving-used' && w.document.body.textContent.includes('Thanks for telling me.')]);
 click(act('usedYes')); const s=S();
 r.push(['used -> rec not craving_delay', s.screen==='recommendation' && s.lastEnginePick!=='craving_delay' && s.sessionHistory.length===1, s.lastEnginePick]);
}
{const {w,click,S}=boot();
 click(act('route','head')); /* Home: Get out of my head → games menu (6.4) */ click(act('distFocus'));
 let s=S(); r.push(['distraction focus', s.screen==='focus'&&s.currentInterventionId==='distraction_game']);
 click(act('focusDone')); r.push(['focus -> checkin', S().screen==='checkin']);
}
{const {w,click,S}=boot();
 click(act('flow','spiraling')); /* 6.4 moved Thought Parking out of the games menu; same RED check */ click(act('beforeSkip'));
 w.document.getElementById('thoughts').value='work stuff\nI want to end it all';
 click(act('spMake')); const s=S(); r.push(['RED in thought parking', s.screen==='crisis'&&s.safetyLevel==='RED']);
}
{const {w,click,S,U}=boot();
 click(act('flow','spiraling')); click(act('beforeSkip'));
 w.document.getElementById('thoughts').value='a\nb\nc';
 click(act('spMake'));
 r.push(['zones render', w.document.querySelectorAll('[data-zone]').length===3 && w.document.querySelectorAll('[data-drag]').length===3]);
 click(act('spPlace','1:notmine')); r.push(['parked chip', !!w.document.querySelector('.tchip')]);
 click(act('spPlace','1:notmine')); r.push(['unpark', U().thoughts[1].place===null]);
 // simulate drop via endDrag internals
 w.eval('ui.thoughts[0].place="now"; ui.thoughts[1].place="later"; ui.thoughts[2].place="notmine"; render();');
 r.push(['next enabled', !w.document.querySelector(act('spSortNext')).disabled]);
}
// crisis icon in craving
{const {w,click,S}=boot(); click(act('flow','craving')); click(act('beforeSkip')); click(act('crisis'));
 r.push(['crisis from craving', S().screen==='crisis'&&S().safetyLevel==='RED']);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[2]?'  ('+x[2]+')':'')).join('\n'));
