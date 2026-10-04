// Stage 6.15: Faith & hope. Off by default; only "Bible" unlocks it; KJV only; one passage, then a next action; no network.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(storage){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();}; const X=w.XMLHttpRequest; w.XMLHttpRequest=function(){w.netCalls++; return new X();};
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump,has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const show=(a,s)=>a.G(`lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);
const hopeOn=(a)=>{ show(a,'calm'); const c=a.has(act('faith')); show(a,'connect'); return c && a.has(act('faith')); };
const hopeAny=(a)=>{ show(a,'calm'); const c=a.has(act('faith')); show(a,'connect'); return c || a.has(act('faith')); };

{const a=boot();
 r.push(['off by default: no "Need a little hope?" on Calm or Connect', a.G('prefs.strength')===null && !hopeAny(a) && !/Need a little hope/.test(a.T())]);
 a.G('ACTIONS.faith()'); r.push(['...and the screens can\'t be reached', a.S().screen!=='faith']);
 a.G('ACTIONS.tab("settings")');
 r.push(['Settings: "What gives you strength?" with seven choices', a.T().includes('What gives you strength?') && ['Bible','Another faith or tradition','Spiritual but not religious','Nature','Family','Personal values','Something else'].every(x=>a.T().includes(x)) && a.doc.querySelectorAll('[data-act="strength"]').length===7]);
 const others=['faith','spiritual','nature','family','values','other'];
 r.push(['every other answer unlocks nothing', others.every(k=>{ a.click(act('strength',k)); const ok=a.G('prefs.strength')===k && !hopeAny(a); a.G('ACTIONS.tab("settings")'); return ok; })]);
 a.click(act('strength','bible'));
 r.push(['only "Bible" unlocks it', a.G('faithOn()') && a.T().includes('Faith & hope is on')]);
 r.push(['"Need a little hope?" appears on Calm and Connect', hopeOn(a)]);
 const b=boot(a.dump()); r.push(['the choice is remembered on this phone', b.G('faithOn()')]);
 a.G('ACTIONS.tab("settings")'); a.click(act('strength','bible'));
 r.push(['tap again to clear', a.G('prefs.strength')===null && !hopeAny(a) && JSON.parse(a.dump()['next.v1.prefs']).prefs.strength===null]);}

{const a=boot(); a.G('prefs.strength="bible"; ACTIONS.loadSample()'); show(a,'calm'); a.click(act('faith'));
 r.push(['six moments', a.S().screen==='faith' && a.doc.querySelectorAll('[data-act="faithPick"]').length===6
   && ["When I'm afraid","When I'm overwhelmed","When I'm lonely","When I need hope","When I need strength","When my thoughts won't stop"].every(x=>a.T().includes(x))]);
 const P=a.G('FAITH_PASSAGES');
 r.push(['the right passages, King James Version', P.map(x=>x[3]).join('|')==='Isaiah 41:10|Matthew 11:28|Hebrews 13:5|Psalm 30:5|Philippians 4:13|Psalm 46:10'
   && /Fear thou not/.test(P[0][2]) && /heavy laden/.test(P[1][2]) && /never leave thee/.test(P[2][2]) && /joy cometh in the morning/.test(P[3][2]) && /strengtheneth me/.test(P[4][2]) && /Be still, and know that I am God/.test(P[5][2])]);
 const nexts=[];
 for(const [k] of P){ a.G(`ACTIONS.faithPick(${JSON.stringify(k)})`);
   const ok=a.S().screen==='faith-passage' && a.T().includes('(KJV)') && a.doc.querySelectorAll('.step-big').length===1
     && a.has(act('faithPray')) && a.has('a[href^="sms:"]') && a.has(act('lowPick','walking')) && a.has(act('lowPick','grounding')) && a.has(act('planNow'))
     && a.T().includes('Take this with you. Then:');
   nexts.push(ok); }
 r.push(['every passage screen: one passage, then Pray · Text someone · Take a walk · Ground myself · Open my plan', nexts.every(Boolean)]);
 r.push(['no scrolling feed, reading plan or daily verse', !/daily verse|reading plan|verse of the day/i.test(HTML) && a.doc.querySelectorAll('.step-big').length===1]);
 a.click(act('faithPray')); r.push(['Pray: a quiet moment, then Done or talk to someone', a.T().includes("Pray in your own words, or just sit with it. There's no wrong way.") && a.has(act('home')) && a.has(act('route','connect'))]);
 a.G('ACTIONS.faithPick("afraid")'); a.click(act('lowPick','walking')); r.push(['Take a walk opens the walking step', a.S().currentInterventionId==='walking']);
 a.G('ACTIONS.faith(); ACTIONS.faithPick("afraid")'); a.click(act('planNow')); r.push(['Open my plan opens the essentials view', a.S().screen==='plan-now']);
 r.push(['no network calls', a.w.netCalls===0 && !/fetch\(|XMLHttpRequest|sendBeacon/.test(HTML.replace(/\/\*[\s\S]*?\*\//g,''))]);
 r.push(['no console errors', a.errs.length===0, a.errs.join(';')]);}

{const a=boot(); a.G('prefs.strength="bible"'); a.G('openCrisis()'); a.G('ACTIONS.faith()');
 r.push(['RED: Faith & hope cannot open over a crisis', a.S().screen==='crisis']);}
r.push(['Help on every Faith & hope screen', (()=>{ const a=boot(); a.G('prefs.strength="bible"; ui.faithKey="hope"'); return ['faith','faith-passage','faith-pray'].every(s=>{ show(a,s); return a.S().screen===s && a.has('header .help-pill[data-act="crisis"]'); }); })()]);
{const a=boot(); a.G('ACTIONS.tab("settings")'); a.click(act('strength','bible')); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything clears the faith answer', a.G('prefs.strength')===null && JSON.parse(a.dump()['next.v1.prefs']).prefs.strength===null]);}
{const a=boot(); a.G('ACTIONS.tab("settings")'); a.click(act('persist','off')); a.click(act('strength','bible'));
 r.push(['with saving off, the answer is not written to the phone', a.G('faithOn()') && JSON.parse(a.dump()['next.v1.prefs']).prefs.strength===null]);}
{const a=boot({'next.v1.prefs':JSON.stringify({prefs:{onboarded:true,strength:'<script>'},theme:'auto',persist:true})});
 r.push(['an unknown saved answer is ignored', a.G('prefs.strength')===null]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
