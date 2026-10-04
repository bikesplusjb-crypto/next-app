const {JSDOM}=require('jsdom');
const fs=require('fs');
const FILE=require('path').join(__dirname,'index.html');
function boot(seed){const dom=new JSDOM(fs.readFileSync(FILE,'utf8'),{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){ if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v); w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(String(w.eval('session.screen')).startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`)); // first-launch onboarding: see onboarding.test.js
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),T:()=>w.document.body.textContent,dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
let saved;
{const a=boot();
 a.click(act('tab','plan')); a.click(act('planEdit','reminders')); a.w.document.getElementById('edList').value='Call Jordan first'; a.click(act('planSave'));
 a.click(act('tab','home')); a.click(act('flow','low')); a.click(act('sadTiny'));   /* 6.23: the sad first screen */ a.click(act('rate','6')); a.click(act('beforeContinue')); a.click(act('lowPick','hydration')); a.click(act('ivNext')); a.click(act('ivDone')); a.click(act('rate','4')); a.click(act('ciHelped')); a.click(act('phoneDownElse'));
 a.click(act('crisis')); a.click(act('cBack'));   // YELLOW this session
 a.click(act('tab','settings')); a.click(act('theme','dark'));
 saved=a.dump();
 r.push(['saved keys', !!saved['next.v1.sensitive'] && !!saved['next.v1.prefs']]);
 r.push(['no safety state saved', !/safetyLevel|YELLOW|stillBad|highRating/.test(saved['next.v1.sensitive']+saved['next.v1.prefs'])]);
}
{const b=boot(saved);
 r.push(['plan survives reload', JSON.stringify(b.G('getPlan().reminders'))==='["Call Jordan first"]']);
 r.push(['check-in survives', b.G('store.sensitive.baseHistory').some(h=>h.state==='low'&&h.before===6&&h.after===4)]);
 r.push(['theme survives', b.w.document.documentElement.dataset.theme==='dark']);
 r.push(['session resets to GREEN', b.S().safetyLevel==='GREEN' && !b.S().yellow]);
 b.click(act('tab','progress')); r.push(['progress counts saved data', b.T().includes('Hard moments handled')]);
 b.click(act('tab','settings')); b.click(act('askDelete')); b.click(act('deleteAll'));
 saved=b.dump();
}
{const c=boot(saved);
 r.push(['delete survives reload', c.G('getPlan().trustedPeople.length')===0 && c.G('store.sensitive.baseHistory.length')===0]);
 c.click(act('tab','settings')); c.click(act('persist','off'));
 const d=c.dump(); r.push(['saving off clears data', !d['next.v1.sensitive'] && JSON.parse(d['next.v1.prefs']).persist===false]);
 c.click(act('loadSample')); const d2=c.dump(); r.push(['nothing written while off', !d2['next.v1.sensitive']]);
 saved=d2;
}
{const e=boot(saved);
 r.push(['off persists; starts empty', e.G('persistOn')===false && e.G('getPlan().trustedPeople.length')===0 && e.G('store.sensitive.baseHistory.length')===0]);
}
{const f=boot({'next.v1.sensitive':'{broken json','next.v1.prefs':'also broken'});
 r.push(['corrupt data does not crash', f.S().screen==='home' && f.G('getPlan().trustedPeople.length')===0]);}
// RED text still never saved
{const g=boot(); g.click(act('flow','spiraling')); g.click(act('beforeSkip')); g.w.document.getElementById('thoughts').value='I want to die'; g.click(act('spMake'));
 const d=g.dump(); r.push(['crisis text not saved', !JSON.stringify(d).includes('want to die') && g.S().screen==='crisis']);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
