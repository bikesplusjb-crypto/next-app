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
 r.push(['wordmark and tagline', !!a.doc.querySelector('.brand[data-act="wordmark"]') && a.doc.getElementById('screen-title').textContent==="Get through what's happening right now."]);
 const order=["I don't know what I need","Calm down","Get out of my head","Connect","Change the scene","Or tell me what's happening","I'm anxious","I'm spiraling","I want to use","I feel low","I feel alone","I don't feel safe"];
 r.push(['Home items in the spec order', order.every((x,i)=>t.indexOf(x)>-1 && (i===0 || t.indexOf(x)>t.indexOf(order[i-1])))]);
 r.push(['four escape routes in a 2x2 grid, each with a stroke icon', a.doc.querySelectorAll('.routes .route').length===4 && [...a.doc.querySelectorAll('.routes .route')].every(b=>b.querySelector('.ico[aria-hidden="true"] svg'))]);
 r.push(['no emoji on Home', !/\p{Extended_Pictographic}/u.test(t)]);
 r.push(['bottom tabs: Home, My Plan, Progress, Settings', [...a.doc.querySelectorAll('.tabbar .tab')].map(b=>b.textContent.trim()).join('|')==='Home|My Plan|Progress|Settings']);
 r.push(['Help in the top bar', !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 r.push(['not built yet, so hidden: Tech check, Just out of the ER', !t.includes('Tech check') && !t.includes('Just out of the ER')]);
}
// Routing
const go=(sel,after)=>{ const a=boot(); a.click(sel); if(after) after(a); return a.S(); };
let s;
s=go(act('triage')); r.push(['I don\'t know what I need → triage (6.2 later)', s.screen==='triage']);
s=go(act('route','calm'),a=>a.click(act('beforeSkip'))); r.push(['Calm down → calming steps (6.3 later)', s.currentState==='anxious' && s.screen==='anx-feet']);
s=go(act('route','head'),a=>a.click(act('beforeSkip'))); r.push(['Get out of my head → games (6.4 later)', s.currentState==='distraction' && s.screen==='distraction-choose']);
s=go(act('route','connect')); r.push(['Connect → Talk to someone (6.6 later)', s.screen==='talk']);
{const a=boot(); a.click(act('route','connect')); a.click(act('talkBack')); r.push(['Talk to someone → Back returns Home', a.S().screen==='home']);}
s=go(act('route','scene'),a=>a.click(act('beforeSkip'))); r.push(['Change the scene → Fresh air step (6.5 later)', s.screen==='intervention' && s.currentInterventionId==='environment_change']);
for(const [arg,label] of [['anxious',"I'm anxious"],['spiraling',"I'm spiraling"],['low','I feel low']]){
  const a=boot(); const b=[...a.doc.querySelectorAll('.sit')].find(x=>x.textContent===label); b.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
  r.push([`"${label}" opens the existing ${arg} flow`, a.S().screen==='before' && a.S().currentState===arg]);
}
s=go(act('flow','craving'),a=>a.click(act('beforeSkip'))); r.push(['"I want to use" still reaches the craving delay', s.screen==='craving-delay' && s.currentInterventionId==='craving_delay']);
{const a=boot(); const b=[...a.doc.querySelectorAll('.sit')].find(x=>x.textContent==='I feel alone'); b.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
 r.push(['"I feel alone" → Talk to someone (6.6 later)', a.S().screen==='talk']);}
s=go('.card.safety[data-act="crisis"]'); r.push(['"I don\'t feel safe" calls openCrisis (RED, crisis screen)', s.screen==='crisis' && s.safetyLevel==='RED']);
{const a=boot(); for(let i=0;i<5;i++) a.click('.brand[data-act="wordmark"]'); r.push(['5 taps on the wordmark opens the dev panel', a.S().devPanelOpen===true]);}
// YELLOW: the support bar still shows above Home.
{const a=boot(); a.click(act('crisis')); a.click(act('cBack'));
 r.push(['YELLOW bar still above Home content', a.S().screen==='home' && !!a.doc.querySelector('header .ybar')]);}
// Crisis copy fix
r.push(['no "coming soon" copy left', !/coming soon/i.test(HTML)]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
process.exit(0);   // the craving timer would otherwise keep Node running
