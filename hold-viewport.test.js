// Hold & answer on a phone: each question screen fits without scrolling (real Chromium layout), normal and large text.
const {chromium}=require('playwright');
const URL='file://'+require('path').join(__dirname,'index.html');
const r=[];
(async()=>{
 const b=await chromium.launch();
 for(const [name,viewport,deviceScaleFactor] of [['phone 390x844',{width:390,height:844},3],['small phone 375x667',{width:375,height:667},2],['large text (200%)',{width:195,height:422},6]]){
  const p=await b.newPage({viewport,deviceScaleFactor});
  await p.goto(URL);
  for(const a of ['obNext','obAdult','obLater']) await p.click(`[data-act="${a}"]`);
  await p.evaluate(()=>{ ACTIONS.holdStart(); });
  const fits=[];
  for(let i=0;i<7;i++){
    const m=await p.evaluate(()=>{ const btn=[...document.querySelectorAll('.actions [data-act], #app main [data-act]')].find(e=>/hold(Next|Feet|Need|Own|After)/.test(e.dataset.act));
      const t=document.getElementById('screen-title'); const tb=t.getBoundingClientRect(); const bb=btn?btn.getBoundingClientRect():null;
      return { screen:session.screen, step:ui.hold&&ui.hold.step, titleIn:tb.top>=0 && tb.bottom<=innerHeight, btnIn:!!bb && bb.top>=0 && bb.bottom<=innerHeight, scrollable:document.scrollingElement.scrollHeight>innerHeight+1 }; });
    fits.push(m);
    if(m.screen==='hold-end') break;
    await p.evaluate(()=>{ const h=ui.hold; if(h.step===4) ACTIONS.holdFeet('yes'); else if(h.step===5) ACTIONS.holdNeed('quiet'); else ACTIONS.holdNext(); });
  }
  const qs=fits.filter(m=>m.screen==='hold' && m.step>=1 && m.step<=4);
  r.push([`${name}: questions 1–4: the question and its answer button are on screen without scrolling`, qs.length===4 && qs.every(m=>m.titleIn && m.btnIn), JSON.stringify(qs)]);
  const q5=fits.find(m=>m.step===5); r.push([`${name}: question 5 title and its first answer are on screen`, !!q5 && q5.titleIn && q5.btnIn, JSON.stringify(q5)]);
  await p.close();
 }
 await b.close();
 for(const [n,ok,info] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||!info?'':' '+info));
})().catch(e=>{ console.log('FAIL crashed: '+e.message); process.exit(1); });
