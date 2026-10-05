// Stage 6.1: new Home. Every control routes somewhere real; crisis stays one tap; no emoji.
// Until 6.2–6.6 are built, the escape routes open the closest existing flow (see ACTIONS.route).
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,S:()=>w.eval('session'),doc:w.document,app:()=>w.document.getElementById('app')};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];

{const a=boot(); const t=a.app().textContent;
 r.push(['wordmark and tagline', !!a.doc.querySelector('.brand[data-act="wordmark"]') && a.doc.getElementById('screen-title').textContent==="It's okay not to be okay." && a.doc.querySelector('.home-sub').textContent==="You don't have to figure everything out right now."]);
 const order=["I don't feel safe","I don't know what I need","Calm down","Get out of my head","Connect","Change the scene","Or tell me what's happening","I'm anxious","I'm spiraling","I feel sad or low","I have an urge to use (drink or drugs)","I feel alone","More"];
 r.push(['Home items in the spec order', order.every((x,i)=>t.indexOf(x)>-1 && (i===0 || t.indexOf(x)>t.indexOf(order[i-1])))]);
 const chips=[...a.doc.querySelectorAll('#sitLabel + .sits .sit')];
 r.push(['6.28 A: exactly five chips plus "More"', chips.length===6 && chips[5].dataset.act==='homeMore' && chips[5].textContent==='More']);
 r.push(['6.28 A: the rest are hidden until More', !a.doc.querySelector('[data-act="afterStart"],[data-act="griefStart"],[data-act="bullyStart"]')]);
 a.click('[data-act="homeMore"]');
 const more=[...a.doc.querySelectorAll('#sitLabel + .sits .sit')].map(c=>c.textContent);
 r.push(['6.28 A: More opens them in place (same screen), every earlier chip still reachable', a.S().screen==='home' && JSON.stringify(more)===JSON.stringify(["I'm anxious","I'm spiraling","I feel sad or low","I have an urge to use (drink or drugs)","I feel alone","Just out of the ER","I lost someone","Bullied — now or before","PTSD, trauma, or military","Most of my days feel heavy"])]);
 r.push(['four escape routes in a 2x2 grid, each with a stroke icon', a.doc.querySelectorAll('.routes .route').length===4 && [...a.doc.querySelectorAll('.routes .route')].every(b=>b.querySelector('.ico[aria-hidden="true"] svg'))]);
 r.push(['no emoji on Home', !/\p{Extended_Pictographic}/u.test(t)]);
 r.push(['bottom tabs: Home, My Plan, Progress, Settings', [...a.doc.querySelectorAll('.tabbar .tab')].map(b=>b.textContent.trim()).join('|')==='Home|My Plan|Progress|Settings']);
 r.push(['Help in the top bar', !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 r.push(['Tech check row (6.14) below the chips; "Just out of the ER" is a chip', t.includes('Tech check') && t.includes('AI, scrolling, or checking is getting to me') && t.indexOf('Tech check')>t.indexOf('Just out of the ER')]);
}
// Routing
const go=(sel,after)=>{ const a=boot(); a.click(sel); if(after) after(a); return a.S(); };
let s;
s=go(act('dontKnow')); r.push(['I don\'t know what I need → its one-question screen (6.2)', s.screen==='dont-know']);
s=go(act('route','calm')); r.push(['Calm down → the Calm menu (6.3)', s.screen==='calm']);
s=go(act('route','head')); r.push(['Get out of my head → the games menu (6.4)', s.currentState==='distraction' && s.screen==='distract']);
s=go(act('route','connect')); r.push(['Connect → the Connect screen (6.6)', s.screen==='connect']);
{const a=boot(); a.click(act('route','connect')); a.click(act('home')); r.push(['Connect → close returns Home', a.S().screen==='home']);}
{const a=boot(); a.w.eval('ACTIONS.talk()'); a.click(act('talkBack')); r.push(['Talk to someone (YELLOW bar) → Back returns Home', a.S().screen==='home']);}
s=go(act('route','scene')); r.push(['Change the scene → its menu (6.5)', s.screen==='scene']);
for(const [arg,label] of [['anxious',"I'm anxious"],['spiraling',"I'm spiraling"],['low','I feel sad or low']]){
  const a=boot(); const b=[...a.doc.querySelectorAll('.sit')].find(x=>x.textContent===label); b.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
  if(arg==='low'){ r.push(['"I feel sad or low" opens its first screen (6.23), then "Do one tiny thing" reaches the existing low flow', a.S().screen==='sad' && a.S().currentState==='low']); a.click(act('sadTiny')); }
  r.push([`"${label}" opens the existing ${arg} flow`, a.S().screen==='before' && a.S().currentState===arg]);
}
s=go(act('flow','craving'),a=>a.click(act('beforeSkip'))); r.push(['"I have an urge to use (drink or drugs)" still reaches the craving delay', s.screen==='craving-delay' && s.currentInterventionId==='craving_delay']);
{const a=boot(); const b=[...a.doc.querySelectorAll('.sit')].find(x=>x.textContent==='I feel alone'); b.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
 r.push(['"I feel alone" → the Connect screen (6.6)', a.S().screen==='connect']);}
s=go('.card.safety[data-act="crisis"]'); r.push(['"I don\'t feel safe" calls openCrisis (RED, crisis screen)', s.screen==='crisis' && s.safetyLevel==='RED']);
{const a=boot(); for(let i=0;i<5;i++) a.click('.brand[data-act="wordmark"]'); r.push(['5 taps on the wordmark opens the dev panel', a.S().devPanelOpen===true]);}
// YELLOW: the support bar still shows above Home.
{const a=boot(); a.click(act('crisis')); a.click(act('cBack'));
 r.push(['YELLOW bar still above Home content', a.S().screen==='home' && !!a.doc.querySelector('header .ybar')]);}
// Crisis copy fix
r.push(['no "coming soon" copy left', !/coming soon/i.test(HTML)]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
process.exit(0);   // the craving timer would otherwise keep Node running
