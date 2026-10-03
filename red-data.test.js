// Exactly what is (and is not) kept after a RED moment (docs/SAFETY_AUDIT.md §4). After F3 (owner-approved):
// nothing is saved from crisis screens or while RED; the only entry is the "moment" for opening the flow, BEFORE the crisis.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(storage){const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,G:x=>w.eval(x),dump};}
const r=[];
const a=boot();
a.click('[data-act="flow"][data-arg="anxious"]'); a.click('[data-act="rate"][data-arg="9"]'); a.click('[data-act="beforeContinue"]'); a.click('[data-act="feetDone"]');
a.w.document.getElementById('three0').value='I want to die'; a.click('[data-act="threeDone"]');
const all=()=>Object.values(a.dump()).join('\n');
const app=()=>a.w.document.getElementById('app').innerHTML;
r.push(['RED opens the crisis screen', a.G('session.screen')==='crisis' && a.G('session.safetyLevel')==='RED']);
r.push(['NOT kept: the typed words (storage, app state, page)', !all().includes('want to die') && !JSON.stringify(a.G('ui')).includes('want to die') && !app().includes('want to die')]);
r.push(['NOT kept: any outcome from the interrupted flow', a.G('session.sessionHistory.length')===0 && JSON.parse(a.dump()['next.v1.sensitive']).history.length===0]);
const types=()=>JSON.parse(a.dump()['next.v1.sensitive']).activity.map(x=>x.type);
r.push(['F3: opening the crisis screen saves nothing (only the earlier flow start is there)', types().join()==='moment']);
const l=a.w.document.querySelector('#app a[href="tel:988"]'); l.addEventListener('click',e=>e.preventDefault()); l.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
r.push(['F3: tapping Call 988 on the crisis screen saves nothing', types().join()==='moment']);
a.click('[data-act="cNo"]'); a.click('[data-act="noGround"]'); for(let i=0;i<5;i++) a.click('[data-act="groundNext"]');
const h=JSON.parse(a.dump()['next.v1.sensitive']).history;
r.push(['by design: grounding from the NO branch keeps {crisis-no, grounding, null, null} and goes to the safety check',
  a.G('session.screen')==='safety-check' && h.length===1 && h[0].state==='crisis-no' && h[0].interventionId==='grounding' && h[0].before===null && h[0].after===null]);
r.push(['no sessionStorage, IndexedDB or cookies used', a.w.sessionStorage.length===0 && a.w.document.cookie==='']);
const b=boot(a.dump());
r.push(['CURRENT: a reload starts at GREEN (safety level is per visit, never stored)', b.G('session.safetyLevel')==='GREEN' && !all().includes('YELLOW') && !all().includes('"RED"')]);
r.push(['Export shows nothing from the crisis screens', JSON.stringify(b.G('buildExport()').activity.map(x=>x.type))==='["moment"]']);
{const c=boot(); c.click('.help-pill[data-act="crisis"]'); c.click('[data-act="cYes"]'); c.click('[data-act="cPlan"]');
 const l2=c.w.document.querySelector('#app a[href="tel:988"]'); l2.addEventListener('click',e=>e.preventDefault()); l2.dispatchEvent(new c.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 c.click('[data-act="planDone"]'); c.click('[data-act="cFullBack"]'); c.click('[data-act="safeNo"]');
 const st=c.dump()['next.v1.sensitive']; const d=st?JSON.parse(st):{activity:[],history:[]};
 r.push(['F3: Help → Yes → Open my plan → Call 988 → back → safety check: nothing saved at all', d.activity.length===0 && d.history.length===0]);}
b.G('ACTIONS.deleteAll()');
const after=JSON.parse(b.dump()['next.v1.sensitive']);
r.push(['Delete everything removes them', after.history.length===0 && after.activity.length===0]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
process.exit(0);
