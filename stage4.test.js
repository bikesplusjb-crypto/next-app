const {JSDOM}=require('jsdom');
const fs=require('fs');
function boot(){const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
 const w=dom.window; w.scrollTo=()=>{}; w.scrollBy=()=>{}; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(String(w.eval('session.screen')).startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`)); // first-launch onboarding: see onboarding.test.js
 return {w,click,S:()=>w.eval('session'),G:(x)=>w.eval(x),T:()=>w.document.body.textContent};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
{const {w,click,S,G,T}=boot();
 click(act('tab','plan'));
 r.push(['plan editable', w.document.querySelectorAll('[data-act="planEdit"]').length===8]);
 r.push(['never-contact line', T().includes('ZigZag Mind will never contact these people for you')]);
 click(act('planEdit','warningSigns')); w.document.getElementById('edList').value='I stop eating\n\nI go quiet'; click(act('planSave'));
 r.push(['list saved', JSON.stringify(G('getPlan().warningSigns'))==='["I stop eating","I go quiet"]' && T().includes('Saved.')]);
 // plan fields not safety-checked
 click(act('planEdit','warningSigns')); w.document.getElementById('edList').value='I think about wanting to die'; click(act('planSave'));
 r.push(['plan not safety-checked', S().screen==='plan' && S().safetyLevel==='GREEN']);
 click(act('planEdit','helps')); click(act('helpToggle','music')); w.document.getElementById('edCustom').value='Painting'; click(act('helpAdd')); click(act('helpToggle','breathing')); click(act('planSave'));
 r.push(['helps saved', JSON.stringify(G('getPlan().helps'))==='["walking","shower","painting","breathing"]', JSON.stringify(G('getPlan().helps'))]);
 click(act('planEdit','trustedPeople')); w.document.getElementById('pn1').value='Sam'; w.document.getElementById('pp1').value='12'; click(act('planSave'));
 r.push(['bad phone rejected', S().screen==='plan-edit' && T().includes('needs a name and a phone')]);
 r.push(['draft kept', w.document.getElementById('pn1').value==='Sam']); w.document.getElementById('pp1').value='772-555-0100'; click(act('planSave'));
 r.push(['2 people saved', G('getPlan().trustedPeople.length')===2]);
 click(act('planEdit','saferSpace')); w.document.getElementById('edText').value='Give my keys to Sam'; click(act('planSave'));
 r.push(['safer space', G('getPlan().saferSpace')==='Give my keys to Sam']);
}
{const {w,click,S,G,T}=boot();
 click(act('tab','progress'));
 const t=T(); r.push(['progress sample', t.includes('Hard moments handled') && t.includes('Walking') && t.includes('→') && !/streak/i.test(t), (t.match(/(\d+(\.\d)?) → (\d+(\.\d)?)/)||[''])[0]]);
 click(act('tab','settings')); click(act('askDelete')); click(act('deleteAll'));
 r.push(['deleted', S().screen==='settings' && G('getPlan().trustedPeople.length')===0 && G('store.sensitive.baseHistory.length')===0 && T().includes('Everything was deleted.')]);
 click(act('tab','progress')); r.push(['quiet week', T().includes("Nothing logged this week — that's okay.")]);
 click(act('tab','home')); r.push(['build plan card', !!w.document.querySelector('[data-act="tab"][data-arg="plan"].card')]);
 // flows still work with empty plan: connection shows add someone
 click(act('flow','low')); click(act('beforeSkip')); click(act('lowPick','connection'));
 r.push(['empty plan connection', T().includes('Add someone you trust')]);
 click(act('crisis')); r.push(['crisis w/ empty plan', S().screen==='crisis']); click(act('cYes'));
 r.push(['crisis-full empty plan', T().includes('Call 911') && T().includes('Add someone you trust')]);
}
{const {w,click,S,G,T}=boot();
 // delete keeps YELLOW
 click(act('crisis')); click(act('cBack')); click(act('tab','settings')); click(act('askDelete')); click(act('deleteAll'));
 r.push(['delete keeps YELLOW', S().yellow && S().safetyLevel==='YELLOW' && !!w.document.querySelector('.ybar')]);
 click(act('loadSample')); r.push(['load sample', G('getPlan().trustedPeople.length')===1]);
 click(act('exportData')); const v=w.document.getElementById('exportBox').value; const j=JSON.parse(v);
 r.push(['export json', j.plan && Array.isArray(j.checkIns) && j.checkIns.length===7]);
 click(act('toSettings')); click(act('about'));
 r.push(['about page', T().includes('Small actions. Real support. One moment at a time.') && T().includes('Call or text 988') && T().includes('not therapy')]);
 click(act('home')); r.push(['try next -> home', S().screen==='home']);
 click(act('tab','settings')); click(act('motion','reduce')); r.push(['reduce motion', w.document.documentElement.classList.contains('reduce')]);
}
{const {w,click,S,G,T}=boot();
 // reach logging + plan usage counters
 const before=G('store.sensitive.activity.filter(a=>a.type==="reach").length');
 click(act('crisis')); w.document.querySelector('a[href="tel:988"]').addEventListener('click',e=>e.preventDefault()); w.document.querySelector('a[href="tel:988"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['reach logged', G('store.sensitive.activity.filter(a=>a.type==="reach").length')===before+1]);
 // engine uses edited plan: YELLOW + helps
}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[2]?'  ('+x[2]+')':'')).join('\n'));
