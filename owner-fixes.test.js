// Owner-approved fixes after the safety audit (docs/SAFETY_AUDIT.md §1), plus the interim full-crisis-screen change.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document};}
const r=[];
// F2: wherever it offers "call or text 988", both are there
{const a=boot(); const bad=[];
 for(const s of ['intervention','craving-delay','craving-used']){
   a.G(`lastRendered=null; ui=freshUi(); ui.cravingStart=Date.now(); ui.cravingEnd=Date.now()+900000; session={...initialSession, screen:${JSON.stringify(s)}, currentState:"craving", currentInterventionId:"craving_delay"}; render(); clearInterval(cravingTimer);`);
   const hrefs=[...a.doc.querySelectorAll('#app a[href]')].map(x=>x.getAttribute('href'));
   if(!hrefs.includes('tel:988') || !hrefs.includes('sms:988')) bad.push(s);
 }
 r.push(['F2: craving screens offer both Call 988 and Text 988', bad.length===0, bad.join()]);
 r.push(['F2: no "Call or text 988" link that only calls', !/>Call or text 988 for support\.<\/a>/.test(HTML)]);}
// F4
{const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'),'utf8')); const a=boot();
 r.push(['F4: one version number (package.json = app = export)', a.G('store.product.appVersion')===pkg.version && a.G('buildExport().app')===pkg.version]);}
// F5
{const a=boot(); r.push(['F5: Warm Line hours say Eastern', a.G('WARMLINE.hours')==='Every day, 4pm–10pm Eastern.']);}
// F7
r.push(['F7: no-referrer policy in the app', /<meta name="referrer" content="no-referrer">/.test(HTML)]);
// Item 3 (OWNER-APPROVED INTERIM): full crisis screen "That's not what I meant" → "Do you feel safer?"
{const a=boot(); a.click('header .help-pill[data-act="crisis"]'); a.click('[data-act="cYes"]');
 const back=[...a.doc.querySelectorAll('#app button')].find(b=>b.textContent.includes("That's not what I meant"));
 r.push(['full crisis screen still offers "That\'s not what I meant — go back"', !!back && back.dataset.act==='cFullBack']);
 a.click('[data-act="cFullBack"]');
 r.push(['...which now asks "Do you feel safer?" (not Home), still RED until answered', a.S().screen==='safety-check' && a.S().safetyLevel==='RED']);
 a.click('[data-act="safeNo"]'); r.push(['...No → back to the full crisis screen', a.S().screen==='crisis-full']);
 a.click('[data-act="cFullBack"]'); a.click('[data-act="safeYes"]'); r.push(['...Yes → Home at YELLOW', a.S().screen==='home' && a.S().safetyLevel==='YELLOW']);}
{const a=boot(); a.click('header .help-pill[data-act="crisis"]'); a.click('[data-act="cBack"]');
 r.push(['the FIRST crisis screen\'s "That\'s not what I meant" is unchanged (Home at YELLOW)', a.S().screen==='home' && a.S().safetyLevel==='YELLOW']);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
