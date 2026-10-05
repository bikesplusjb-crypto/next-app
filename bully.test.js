// Stage 6.27: Bullied, now or before. Entered only by the person; four paths; 988 on every screen; nothing saved unless
// the person chooses the diary (respecting its lock); resources hidden until verified; copy rules; YELLOW phrases;
// FOUNDER_NOTE only on About.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const {webcrypto}=require('crypto');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true, storage, html=HTML}={}){ const errs=[];
  const w=new JSDOM(html,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone;
    try{ Object.defineProperty(w,'crypto',{value:webcrypto,configurable:true}); }catch(_){}
    w.TextEncoder=TextEncoder; w.TextDecoder=TextDecoder; w.addEventListener('error',e=>errs.push(e.message));
    w.HTMLCanvasElement.prototype.getContext=function(){ return null; };
    if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
  const fill=(id,v)=>{ w.document.getElementById(id).value=v; };
  return {w,click,T,dump,fill,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const tick=(ms=0)=>new Promise(r=>setTimeout(r,ms));
async function until(f,ms=8000){ const t0=Date.now(); while(Date.now()-t0<ms){ if(f()) return true; await tick(10); } return false; }
const has988=a=>a.has('.bully-988 a[href="tel:988"]') && a.T().includes('Call or text 988 any time.');
const r=[];

(async()=>{
// ================= A. Entry =================
{const a=boot(); const chip=[...a.w.document.querySelectorAll('.sit')].find(x=>x.dataset.act==='bullyStart');
 r.push(['A: Home chip "Bullied — now or before"', !!chip && chip.textContent==='Bullied — now or before' && !!chip.closest('.sits')]);
 const btns=[...a.w.document.querySelectorAll('#app main [data-act]')];
 r.push(['A: "I don\'t feel safe" stays the first choice on Home', btns.find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
 chip.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
 r.push(['A: first screen wording', a.S()==='bully' && a.T().includes("Being bullied is not your fault. Whether it's happening now or happened a long time ago, it's real.") && a.T().includes('Which is closest?')]);
 const paths=[...a.w.document.querySelectorAll(act('bullyPath'))].map(b=>b.textContent.trim());
 r.push(['A: four choices in order', JSON.stringify(paths)===JSON.stringify(["It happened years ago, but it still gets to me","It's happening at work","It's happening online","Someone I love is being bullied"])]);
 r.push(['A: Help visible and the 988 line at the bottom', a.has('header .help-pill[data-act="crisis"]') && has988(a) && a.w.document.querySelector('#app main .content').lastElementChild.classList.contains('bully-988')]); }
{const a=boot({phone:false}); a.G('ACTIONS.bullyStart()'); r.push(['A: on a computer the 988 line offers chat', a.has('.bully-988 a[href*="988lifeline.org/chat"]')]); }
{const a=boot(); r.push(['A: never suggested (not in the engine)', a.G('INTERVENTION_LIBRARY.every(i=>!/bull/i.test(i.id) && !/^bully/.test(String(i.route||"")))')]);
 let on=''; for(const s of ['crisis','crisis-full','crisis-no','safety-check','calm','connect','dont-know','recommendation','distract','scene']){ a.G(`session.screen=${JSON.stringify(s)}; lastRendered=null; render()`); if(a.has(act('bullyStart'))) on=s; }
 r.push(['A: only on Home (not on crisis screens or the menus)', !on]);
 a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); a.G('ACTIONS.bullyStart()'); r.push(['A: blocked while RED', a.S()==='crisis']); }

//@@PARTS@@

for(const [n,ok,info] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||info===undefined?'':' ('+info+')'));
process.exit(0);   // the diary's re-lock timer would otherwise keep this process alive
})().catch(e=>{ console.log('FAIL crashed: '+e.message); process.exit(1); });
