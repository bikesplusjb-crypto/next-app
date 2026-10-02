// Step 4: real users start with an empty plan and no sample history. Sample data is opt-in from Settings.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(seed){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){ if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v); w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),T:()=>w.document.getElementById('app').textContent,dump};}   // on-screen text only, not the script
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const onboard=a=>['obNext','obAdult','obLater'].forEach(x=>a.click(act(x)));
const r=[];

{const a=boot();
 const plan=a.G('getPlan()');
 r.push(['first launch: empty plan', Object.entries(plan).every(([k,v])=>Array.isArray(v)?v.length===0:typeof v==='string'?v==='':!v.name&&!v.phone)]);
 r.push(['first launch: no sample history or activity', a.G('store.sensitive.baseHistory.length')===0 && a.G('store.sensitive.activity.length')===0]);
 r.push(['first launch: no fictional people anywhere', !a.T().includes('Jordan')]);
 onboard(a);
 r.push(['first launch writes no sensitive data', !a.dump()['next.v1.sensitive']]);
 r.push(['Home offers to build a plan', !!a.w.document.querySelector('.card[data-act="tab"][data-arg="plan"]')]);
 a.click(act('tab','progress'));
 r.push(['Progress is quiet, with no sample note', a.T().includes("Nothing logged this week") && !a.T().includes('sample data')]);
 // Flows and crisis still work with nothing set up.
 a.click(act('tab','home')); a.click(act('flow','low')); a.click(act('beforeSkip')); a.click(act('lowPick','hydration'));
 r.push(['flows work with an empty plan', a.S().screen==='intervention' && a.S().currentInterventionId==='hydration']);
 a.click('.help-pill[data-act="crisis"]'); a.click(act('cYes'));
 const hrefs=[...a.w.document.querySelectorAll('a[href]')].map(x=>x.getAttribute('href'));
 r.push(['crisis with empty plan still has 988 and 911', ['tel:988','sms:988','tel:911'].every(h=>hrefs.includes(h))]);
}
// "Load sample data" in Settings still works for demos, and is labelled.
{const a=boot(); onboard(a);
 a.click(act('tab','settings'));
 r.push(['Settings still offers Load sample data', !!a.w.document.querySelector(act('loadSample'))]);
 a.click(act('loadSample'));
 r.push(['sample loads a plan and history', a.G('getPlan().trustedPeople.length')===1 && a.G('store.sensitive.baseHistory.length')>0]);
 a.click(act('tab','progress'));
 r.push(['sample is labelled in Progress', a.T().includes('Includes fictional sample data')]);
 a.click(act('tab','settings')); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything empties it again', a.G('getPlan().trustedPeople.length')===0 && a.G('store.sensitive.baseHistory.length')===0]);
}
// People who already have saved data keep it.
{const saved={'next.v1.prefs':JSON.stringify({prefs:{onboarded:true},theme:'auto',persist:true}),
  'next.v1.sensitive':JSON.stringify({v:1,plan:{trustedPeople:[{name:'Ana',relationship:'sister',phone:'5550100'}],helps:['walking']},history:[{state:'low',interventionId:'walking',before:6,after:4,timestamp:Date.now()}],activity:[]})};
 const a=boot(saved);
 r.push(['existing saved data is kept', a.S().screen==='home' && a.G('getPlan().trustedPeople[0].name')==='Ana' && a.G('store.sensitive.baseHistory.length')===1]);
}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
