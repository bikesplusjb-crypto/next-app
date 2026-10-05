// One-time Home hint that Zags can be tapped (owner request, 2026-10-05): "Tap me when you want to breathe together."
// Shown until Okay or the first tap on Zags; never over "I don't feel safe" (real Chromium layout, normal and large text).
const {JSDOM}=require('jsdom');
const {chromium}=require('playwright');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const URL='file://'+path.join(__dirname,'index.html');
function boot(storage){ const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=s=>{const el=w.document.querySelector(s); if(!el) throw new Error('missing '+s); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const store=()=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
  return {w,click,store,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),T:()=>w.document.getElementById('app').textContent}; }
const r=[];
{const a=boot(); r.push(['shows on Home the first time', a.has('#zagsHint') && a.T().includes('Tap me when you want to breathe together.')]);
 a.click('[data-act="zagsHintOk"]'); r.push(['Okay hides it', !a.has('#zagsHint')]);
 const b=boot(a.store()); r.push(['and it never comes back', !b.has('#zagsHint')]); }
{const a=boot(); a.click('.brand-row [data-act="zags"]'); r.push(['tapping Zags opens Calm down with Zags', a.G('session.screen')==='zags']);
 a.G('ACTIONS.home ? ACTIONS.home() : go("home")'); a.G('zagsHush(); session.screen="home"; lastRendered=null; render()');
 r.push(['tapping Zags also counts as found: no hint after', !a.has('#zagsHint')]);
 const b=boot(a.store()); r.push(['still gone after reopening', !b.has('#zagsHint')]); }
{const a=boot(); r.push(['the small Zags in the large-text card also opens Zags', a.has('#zagsHint [data-act="zags"][data-arg="calm"]')]);
 a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"}); session.screen="home"; lastRendered=null; render()'); r.push(['hidden while YELLOW', !a.has('#zagsHint')]); }
{const a=boot(); let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check','calm','plan']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(a.has('#zagsHint')) on=sc; }
 r.push(['only on Home (never on crisis screens)', !on]); }
(async()=>{
 const b=await chromium.launch();
 for(const [name,viewport,dsf] of [['normal text',{width:390,height:844},3],['large text (200%)',{width:195,height:422},6],['small phone',{width:320,height:568},2]]){
  const p=await b.newPage({viewport,deviceScaleFactor:dsf}); await p.goto(URL);
  for(const a of ['obNext','obAdult','obLater']) await p.click(`[data-act="${a}"]`);
  await p.waitForTimeout(700);
  const m=await p.evaluate(()=>{ const h=document.getElementById('zagsHint'), s=document.querySelector('main .home-safe'), z=document.querySelector('.brand-row .zmark-btn');
   if(!h) return null; const a=h.getBoundingClientRect(), c=s.getBoundingClientRect(), zz=z.getBoundingClientRect();
   const ov=(x,y)=>x.left<y.right && x.right>y.left && x.top<y.bottom && x.bottom>y.top;
   const hit=document.elementFromPoint(c.left+c.width/2,c.top+c.height/2);
   return {overSafe:ov(a,c), overZags:ov(a,zz), safeOnTop:!!hit && s.contains(hit), inline:h.classList.contains('zhint-inline'), safeVisible:c.bottom<=innerHeight, x:a.right<=innerWidth+1}; });
  r.push([`${name}: the hint is there`, !!m]);
  if(m){ r.push([`${name}: never over "I don't feel safe", which stays visible and tappable`, !m.overSafe && m.safeOnTop && m.safeVisible, JSON.stringify(m)]);
   r.push([`${name}: doesn't cover Zags; fits the screen`, !m.overZags && m.x, JSON.stringify(m)]); }
  await p.close(); }
 await b.close();
 console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
 process.exit(0);
})();
