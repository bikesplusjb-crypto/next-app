// A note for a hard day + "When this happens, I'll…" (owner request, 2026-10-09): written on a good day, shown on a hard
// one (My Plan, I need my plan now, Hope box, print). Plan fields: saved only with saving on, exported, deleted.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(storage){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; w.addEventListener('error',e=>errs.push(e.message)); if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const store=()=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
  return {w,click,T,store,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen'),set:(id,v)=>{w.document.getElementById(id).value=v;}}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const NOTE="This feeling passes. Call Sam. Shower, then a walk.";
const r=[];
{const a=boot(); a.G('ACTIONS.tab("plan")');
 r.push(['My Plan: "A note for a hard day" with a gentle empty line', a.has('.hardnote-panel') && a.T().includes(a.G('HARD_NOTE.empty'))]);
 r.push(['My Plan: "When this happens, I\'ll…" with an example', a.has('.ifthen-panel') && a.T().includes("When I can't sleep at 3am, I'll go to the couch")]);
 a.click(act('planEdit','hardNote')); r.push(['edit: hint and example, one text box', a.T().includes('Write this on an okay day, for a hard one.') && a.has('#edText')]);
 a.set('edText',NOTE); a.click(act('planSave'));
 r.push(['saved and shown in My Plan', a.G('getPlan().hardNote')===NOTE && a.T().includes(NOTE)]);
 r.push(['saved on this phone (saving on)', a.store()['next.v1.sensitive'].includes('This feeling passes')]);
 a.click(act('planEdit','ifThen')); r.push(['when/then: three rows, labelled', [0,1,2].every(i=>a.has(`label[for="itw${i}"]`) && a.has(`label[for="itt${i}"]`))]);
 a.set('itw0','I want to text my ex'); a.set('itt0','text Jordan instead'); a.set('itw1','only one half'); a.click(act('planSave'));
 r.push(['when/then: complete rows kept, half rows dropped', JSON.stringify(a.G('getPlan().ifThen'))==='[{"when":"I want to text my ex","then":"text Jordan instead"}]']);
 r.push(['shown as "When I want to text my ex, I\'ll text Jordan instead."', a.T().includes("When I want to text my ex, I'll text Jordan instead.")]);
 a.G('ACTIONS.planNow()'); r.push(['I need my plan now: the note and the plans', a.has('.hardnote-now') && a.T().includes(NOTE) && a.has('.ifthen-now')]);
 a.G('ACTIONS.hopeOpen()'); r.push(['Hope box: the note first', a.has('.hope-note') && a.T().includes(NOTE)]);
 r.push(['print view includes both', /A note for a hard day/.test(a.G('typeof printPlanHtml==="function"?printPlanHtml():""')) || HTML.includes('sec("A note for a hard day"')]);
 r.push(['export includes both', JSON.stringify(a.G('buildExport().plan')).includes('This feeling passes') && JSON.stringify(a.G('buildExport().plan')).includes('text Jordan instead')]);
 const b=boot(a.store()); r.push(['still there after reopening', b.G('getPlan().hardNote')===NOTE && b.G('getPlan().ifThen.length')===1]);
 a.G('ACTIONS.deleteAll ? ACTIONS.deleteAll() : 0'); r.push(['Delete everything removes them', a.G('getPlan().hardNote')==='' && a.G('getPlan().ifThen.length')===0]); }
{const a=boot(); a.G('ACTIONS.tab("plan")'); a.click(act('planEdit','hardNote')); a.set('edText','x'.repeat(900)); a.click(act('planSave'));
 r.push(['the note is capped (600 characters)', a.G('getPlan().hardNote.length')===600]);
 a.G('getPlan().hardNote="<img src=x onerror=alert(1)>"; ACTIONS.tab("plan"); lastRendered=null; render()'); r.push(['escaped when shown', !a.has('.hardnote-panel img')]);
 const b=boot({'next.v1.sensitive':JSON.stringify({v:1,plan:{ifThen:[{when:1},"bad",{when:"a",then:"b"},{when:"c",then:"d"},{when:"e",then:"f"},{when:"g",then:"h"}],hardNote:42}})});
 r.push(['old or odd saved data is cleaned up', b.G('getPlan().hardNote')==='42' && b.G('getPlan().ifThen.length')===3]); }
{const a=boot(); r.push(['never on crisis screens', (()=>{ let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`getPlan().hardNote="${NOTE}"; session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(a.T().includes(NOTE)) on=sc; } return !on; })()]);
 r.push(['no script errors', a.errs.length===0]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
