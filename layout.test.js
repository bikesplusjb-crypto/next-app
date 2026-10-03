// Stage 7 visual QA: every screen at 375, 390 and 430px wide (real Chromium layout):
// no horizontal scrolling, no clipped text, no tap target under 44px.
const {chromium}=require('playwright');
const URL='file://'+require('path').join(__dirname,'index.html');
const r=[];
(async()=>{
 const b=await chromium.launch();
 for(const width of [375,390,430]){
  const p=await b.newPage({viewport:{width,height:844}});
  await p.goto(URL);
  for(const a of ['obNext','obAdult','obLater']) await p.click(`[data-act="${a}"]`);
  const res=await p.evaluate(()=>{ ACTIONS.loadSample(); const bad={over:[],small:[],clipped:[]}; let n=0;
   for(const s of Object.keys(SCREENS)){
    lastRendered=null; ui=freshUi(); ui.thoughts=[{text:"A worried thought",place:null}]; ui.editSection=s==='plan-edit'?'trustedPeople':null;
    session={...initialSession, screen:s, currentState:"anxious", currentInterventionId:"walking", currentBeforeRating:7, yellow:true,
      safetyLevel:['crisis','crisis-full','crisis-no','safety-check'].includes(s)?'RED':'YELLOW'};
    if(s==='zags') ui.zags={phase:'check',step:0,rounds:0,hard:0}; if(s==='recommendation') runEngine();
    render(); zagsStopBreathing(); stopGameTimers(); n++;
    if(document.documentElement.scrollWidth>innerWidth+1) bad.over.push(s);
    const small=[...document.querySelectorAll('#app button, #app a.btn, #app a.chip, #app a.sit, header button, header a')]
      .filter(e=>{const q=e.getBoundingClientRect(); return q.width>0 && q.height<44 && !e.classList.contains('inline');});
    if(small.length) bad.small.push(s+': '+small.map(e=>e.textContent.trim().slice(0,20)).join('/'));
    if([...document.querySelectorAll('#app *')].some(e=>e.scrollWidth>e.clientWidth+2 && getComputedStyle(e).overflowX==='hidden' && e.textContent.trim())) bad.clipped.push(s);
   } return {bad,n}; });
  r.push([`${width}px: all ${res.n} screens, no horizontal scrolling`, res.n>=50 && res.bad.over.length===0, res.bad.over.join()]);
  r.push([`${width}px: no clipped text`, res.bad.clipped.length===0, res.bad.clipped.join()]);
  r.push([`${width}px: every tap target at least 44px tall`, res.bad.small.length===0, res.bad.small.join(' | ')]);
  await p.close();
 }
 await b.close();
})().catch(e=>r.push(['layout check ran: '+e.message,false])).finally(()=>{
 console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
 process.exit(0);
});
