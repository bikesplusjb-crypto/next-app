// Stage 6.19 (STAGE6-19-ADDENDUM.md): reach, trust and simplicity.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const SUPPORT=fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8');
function boot({phone,pre}={}){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   if(typeof phone==='boolean') w.__zzPhone=phone;
   w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();}; w.navigator.sendBeacon=()=>{w.netCalls++; return true;};
   w.printed=0; w.print=()=>{w.printed++;};
   if(pre) pre(w); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s),all:s=>[...w.document.querySelectorAll(s)]};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const show=(a,s,extra='')=>a.G(`${extra} lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);
const r=[];

// ---- A. Worried about someone? ----
{const a=boot(); const l=a.doc.querySelector('a.worried-link');
 r.push(['A1: Home link "Worried about someone? How to help →"', !!l && l.textContent==='Worried about someone? How to help →']);
 r.push(['A1: opens the supporter guide (support/#worried)', !!l && l.getAttribute('href')==='support/#worried']);
 r.push(['A1: below "I don\'t feel safe" (and below the main content)', !!l && !!(a.doc.querySelector('.home-safe').compareDocumentPosition(l)&4) && !!(a.doc.querySelector('.routes').compareDocumentPosition(l)&4)]);
 const g=new JSDOM(SUPPORT).window.document;
 const main=g.querySelector('main');
 r.push(['A3: guide starts with "Take it seriously, even if they seem fine. Listen more than you talk."', main.firstElementChild.textContent==='Take it seriously, even if they seem fine. Listen more than you talk.']);
 const wsec=g.getElementById('worried'), code=g.getElementById('h-code').closest('section');
 r.push(['A2: "Someone you care about is struggling." before the code-word section', !!wsec && wsec.querySelector('h2').textContent==='Someone you care about is struggling.' && !!(wsec.compareDocumentPosition(code)&4)]);
 r.push(['A2: the two lines and a link to "What to say"', wsec.textContent.includes("You don't need the right words. Being there and taking it seriously matters most.") && wsec.querySelector('a').getAttribute('href')==='#h-say' && !!g.getElementById('h-say')]);
 r.push(['A2: shown only to people who came this way (#worried)', /\.worried\{display:none\}/.test(SUPPORT) && /\.worried:target\{display:block\}/.test(SUPPORT)]);}

// ---- B. Print my plan ----
{const a=boot(); a.G('ACTIONS.loadSample(); getPlan().codeWord={personIndex:0,word:"lighthouse",setAt:1,phone:"5550142"}; getPlan().reasons=["My niece","Fishing in May"]; getPlan().anchor="a smooth stone"; getPlan().timeDistance={keepAway:"the car keys",holder:"my brother",getBack:"after we talk"}; ACTIONS.tab("plan")');
 r.push(['B1: "Print my plan" in My Plan', a.has(act('printPlan')) && a.T().includes('Print my plan')]);
 const cb=a.doc.getElementById('printCode');
 r.push(['B2: "Include my code word" is off by default', !!cb && cb.checked===false && a.T().includes('Include my code word')]);
 a.click(act('printPlan'));
 const pv=a.doc.getElementById('printView'), t=pv.textContent.replace(/\s+/g,' ');
 r.push(['B1: calls window.print()', a.w.printed===1]);
 const P=a.G('getPlan()');
 r.push(['B2: the print view has the plan', [...P.warningSigns, ...P.helps.map(h=>a.G(`helpLabel(${JSON.stringify(h)})`)), 'a smooth stone', 'My niece', ...P.places, P.trustedPeople[0].name, P.trustedPeople[0].phone, 'the car keys', 'my brother', ...P.reminders].every(x=>t.includes(x))]);
 r.push(['B2: 988 and 911', t.includes('call or text 988') && t.includes('911 if someone is hurt or in danger')]);
 r.push(['B2: code word excluded unless ticked', !t.includes('lighthouse')]);
 cb.checked=true; a.click(act('printPlan'));
 r.push(['B2: ...and included when ticked', a.doc.getElementById('printView').textContent.includes('lighthouse')]);
 a.G('ACTIONS.tab("plan")'); r.push(['B2: the tick is never saved (off again next time)', a.doc.getElementById('printCode').checked===false && !/printCode/.test(JSON.stringify(a.w.localStorage))]);
 a.click(act('printPlan'));
 const card=a.doc.querySelector('#printView .wallet');
 r.push(['B3: wallet card: first person and number, 988, 911, first reason to stay', !!card && card.textContent.includes(P.trustedPeople[0].name) && card.textContent.includes(P.trustedPeople[0].phone) && card.textContent.includes('988 — call or text') && card.textContent.includes('911 if someone is hurt or in danger') && card.textContent.includes('My niece') && !card.textContent.includes('Fishing in May')]);
 r.push(['B3: about 3.4 × 2.1 inches with cut lines', /\.wallet\{width:3\.4in;height:2\.1in;border:1\.5pt dashed #000/.test(HTML) && a.has('#printView .cut')]);
 r.push(['B4: black on white, print-only', /@media print\{[\s\S]*#printView\{display:block !important;[^}]*color:#000;background:#fff\}/.test(HTML) && /#printView\{display:none\}/.test(HTML)]);
 r.push(['B: nothing is sent', a.w.netCalls===0]);
 a.w.dispatchEvent(new a.w.Event('afterprint'));
 r.push(['B: the print view is cleared after printing', a.doc.getElementById('printView').innerHTML===''] );}
{const a=boot(); a.G('getPlan().trustedPeople=[{name:"Sam",phone:"555-0100",relationship:""}]; ACTIONS.tab("plan")'); a.click(act('printPlan'));
 const pv=a.doc.getElementById('printView'), h=[...pv.querySelectorAll('h2')].map(x=>x.textContent);
 r.push(['B2: empty sections are skipped', JSON.stringify(h)===JSON.stringify(["My trusted people"]) && !pv.textContent.includes('Reasons to stay')]);
 r.push(['B3: no reason line on the card when there are none', pv.querySelectorAll('.wallet p').length===3]);}
{const a=boot(); a.G('ACTIONS.loadSample(); openCrisis(); ACTIONS.cNo(); ACTIONS.noPlan()');
 r.push(['B: no Print button on the plan opened from the crisis "No" path or "I need my plan"', !a.has(act('printPlan'))]);}

//@@NEXT@@
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
