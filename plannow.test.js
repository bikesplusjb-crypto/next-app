// Stage 6.12: "I need my plan": the essentials view. Same plan data (never a second plan), read-only, in a fixed order.
// Entry: My Plan's "I need my plan now", and "Open my plan" on crisis-full and the NO branch (which still ends at safety-check).
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const full=a=>{ a.G(`ACTIONS.loadSample(); getPlan().trustedPeople.push({name:"Sam",relationship:"sister",phone:"555-0199"});
  getPlan().timeDistance={keepAway:"Some things",holder:"Sam",getBack:"after I talk it over with Jordan"};
  getPlan().codeWord={personIndex:0,word:"lighthouse",setAt:1,phone:"5550142"}`); };
const labels=a=>[...a.doc.querySelectorAll('#app .lbl')].map(x=>x.textContent);

// ---- from My Plan ----
{const a=boot(); full(a); a.click(act('tab','plan'));
 const btn=a.doc.querySelector(act('planNow'));
 r.push(['a big "I need my plan now" at the top of My Plan', !!btn && btn.textContent==='I need my plan now' && btn.compareDocumentPosition(a.doc.querySelector('.plan-head'))===4]);
 a.click(act('planNow'));
 r.push(['opens "Your plan." (Help in the top bar)', a.S().screen==='plan-now' && a.doc.getElementById('screen-title').textContent==='Your plan.' && !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 r.push(['in order: do this first · reach a person · places · time and distance · remember · crisis support',
   labels(a).join('|')==='Do this first|Reach a person|Places I can go|My time and distance plan|What I want to remember|Crisis support']);
 r.push(['do this first: from their first "thing that helps"', a.doc.querySelector('.pn-first').textContent==='Take a short, slow walk.']);
 const reach=a.doc.querySelectorAll('.panel.pn')[1];
 const links=[...reach.querySelectorAll('a')].map(x=>x.textContent.trim());
 r.push(['reach a person: code word first, then each trusted person', links.join('|')==='Send my code word to Jordan|Call Jordan|Text Jordan|Call Sam|Text Sam']);
 r.push(['places, time and distance, and reminders from the same plan', a.T().includes('The coffee shop on Main St · The public library') && a.T().includes('after I talk it over with Jordan') && a.T().includes("Don't make big decisions when I'm overwhelmed.")]);
 const hrefs=[...a.doc.querySelectorAll('#app a[href]')].map(x=>x.getAttribute('href'));
 r.push(['988 call/text and 911', hrefs.includes('tel:988') && hrefs.includes('sms:988') && hrefs.includes('tel:911') && a.T().includes('Call 911If someone is hurt or in danger')]);
 r.push(['read-only: nothing to edit', !a.doc.querySelector('#app [data-act="planEdit"], #app input, #app textarea')]);
 a.click(act('planDone')); r.push(['"I\'m done" → back to My Plan', a.S().screen==='plan']);}
{const a=boot(); a.click(act('tab','plan')); a.click(act('planNow'));
 r.push(['an empty plan still works: a simple first step, 988 and 911', a.doc.querySelector('.pn-first').textContent==='Put both feet on the floor and let one slow breath out.' && a.T().includes('No one in your plan yet.') && labels(a).join('|')==='Do this first|Reach a person|Crisis support']);}
{const a=boot(); a.G('getPlan().helps=["music"]'); a.click(act('tab','plan')); a.click(act('planNow'));
 r.push(['a personal "thing that helps" becomes the first step', a.doc.querySelector('.pn-first').textContent==='Put on a song you like.']);}

// ---- same plan, never a second one ----
{const a=boot(); full(a); a.click(act('tab','plan')); a.click(act('planEdit','reminders')); a.doc.getElementById('edList').value='Call Jordan first'; a.click(act('planSave')); a.click(act('planNow'));
 r.push(['edits to My Plan show up right away (one plan, two views)', a.T().includes('Call Jordan first')]);
 r.push(['no second plan or "really bad" store', !/reallyBad|planNow"|essentials"/.test(Object.keys(a.dump()).join()+JSON.stringify(JSON.parse(a.dump()['next.v1.sensitive']).plan ? Object.keys(JSON.parse(a.dump()['next.v1.sensitive']).plan) : []))
   && Object.keys(a.dump()).sort().join()==='next.v1.prefs,next.v1.sensitive']);}

// ---- from crisis-full ----
{const a=boot(); full(a); a.click('header .help-pill[data-act="crisis"]'); a.click(act('cYes')); a.click(act('cPlan'));
 r.push(['crisis-full → "Open my plan" → the essentials view', a.S().screen==='plan-now' && a.S().safetyLevel==='RED']);
 r.push(['...calls and texts are plain links there', !a.doc.querySelector('#app a[data-noexit]')]);
 a.click(act('planDone')); r.push(['...and "I\'m done" returns to crisis-full', a.S().screen==='crisis-full']);}

// ---- from the NO branch ----
{const a=boot(); full(a); a.click('header .help-pill[data-act="crisis"]'); a.click(act('cNo')); a.click(act('noPlan'));
 r.push(['NO branch → "Open my plan" → the essentials view', a.S().screen==='plan-now' && a.S().safetyLevel==='YELLOW']);
 const contacts=[...a.doc.querySelectorAll('#app a[href^="tel:"], #app a[href^="sms:"]')];
 r.push(['NO branch: every call/text is marked to go to the safety check', contacts.length>=8 && contacts.every(x=>x.dataset.noexit==='1')]);
 contacts[1].addEventListener('click',e=>e.preventDefault()); contacts[1].dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['NO branch: tapping one sets the safety check in the same tap', a.S().screen==='safety-check']);}
{const a=boot(); a.click('header .help-pill[data-act="crisis"]'); a.click(act('cNo')); a.click(act('noPlan')); a.click(act('planDone'));
 r.push(['NO branch: "I\'m done" → safety-check', a.S().screen==='safety-check']);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
