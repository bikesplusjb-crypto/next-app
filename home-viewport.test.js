// "I don't feel safe" is on the first screen of Home, no scrolling, on a 390x844 phone.
// Real Chromium layout (jsdom has none). Large text = 200% zoom, which makes the same phone 195x422 CSS px.
const {chromium}=require('playwright');
const URL='file://'+require('path').join(__dirname,'index.html');
const r=[];
(async()=>{
 const b=await chromium.launch();
 for(const [name,viewport,deviceScaleFactor] of [['normal text',{width:390,height:844},3],['large text (200%)',{width:195,height:422},6]]){
  const p=await b.newPage({viewport,deviceScaleFactor});
  await p.goto(URL);
  for(const a of ['obNext','obAdult','obLater']) await p.click(`[data-act="${a}"]`);
  const m=await p.evaluate(()=>{
   const el=[...document.querySelectorAll('main [data-act="crisis"]')].find(e=>e.textContent.includes("I don't feel safe"));
   if(!el) return null;
   const b=el.getBoundingClientRect(), tab=document.querySelector('.tabbar'), head=document.querySelector('header.top');
   const hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
   return {screen:session.screen, scrollY, top:b.top, bottom:b.bottom, left:b.left, right:b.right, vw:innerWidth, vh:innerHeight,
     headBottom:head?head.getBoundingClientRect().bottom:0, tabTop:tab?tab.getBoundingClientRect().top:innerHeight,
     onTop:!!hit && el.contains(hit), crisisInMain:document.querySelectorAll('main [data-act="crisis"]').length,
     aboveDontKnow:!!(el.compareDocumentPosition(document.querySelector('[data-act="dontKnow"]')) & Node.DOCUMENT_POSITION_FOLLOWING)};
  });
  r.push([`${name}: Home shows "I don't feel safe"`, !!m && m.screen==='home' && m.scrollY===0]);
  if(!m) continue;
  r.push([`${name}: it is inside the viewport without scrolling`, m.top>=0 && m.left>=0 && m.right<=m.vw && m.bottom<=m.vh, JSON.stringify(m)]);
  r.push([`${name}: not hidden under the top bar or the tab bar`, m.top>=m.headBottom && m.bottom<=m.tabTop && m.onTop, JSON.stringify(m)]);
  r.push([`${name}: it sits above "I don't know what I need"`, m.aboveDontKnow]);
  r.push([`${name}: one crisis control on Home, no second path`, m.crisisInMain===1]);
  await p.click('main [data-act="crisis"]');
  r.push([`${name}: tapping it opens the crisis screen (openCrisis)`, await p.evaluate(()=>session.screen==='crisis' && session.safetyLevel==='RED')]);
  await p.close();
 }
 await b.close();
})().catch(e=>r.push(['viewport test ran: '+e.message,false])).finally(()=>{
 console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
 process.exit(0);
});
