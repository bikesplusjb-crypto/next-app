// Stage 6.3: Calm. A short menu; every option ends at the existing check-in.
// Includes "What's still true?" (from the REAL WORLD ideas): the person decides, nothing is argued or saved.
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
const calm=()=>{ const a=boot(); a.click(act('route','calm')); return a; };
const r=[];

{const a=calm(); const t=a.T();
 r.push(['Calm opens from Home', a.S().screen==='calm' && a.doc.getElementById('screen-title').textContent==="Let's slow things down."]);
 r.push(['short menu: breathe, 5-4-3-2-1, feet on the floor, what\'s still true', [...a.doc.querySelectorAll('[data-act="calmPick"]')].map(b=>b.dataset.arg).join()==='breathe,ground,feet,true']);
 r.push(['"I\'d rather talk to someone" goes to Connect', !!a.doc.querySelector('.actions [data-act="route"][data-arg="connect"]') && t.includes("I'd rather talk to someone")]);
 r.push(['no emoji; Help in the top bar', !/\p{Extended_Pictographic}/u.test(t) && !!a.doc.querySelector('header .help-pill')]);
 r.push(['Zags is the featured card, first on the menu (6.7)', /^Calm down with Zags/.test(a.doc.querySelector('#app .zcard').textContent.trim()) && a.doc.querySelector('#app .zcard').compareDocumentPosition(a.doc.querySelector('[data-act="calmPick"]'))===4]);
 r.push(['opening Calm counts as a hard moment', a.G('store.sensitive.activity.filter(x=>x.type==="moment").length')===1]);
 a.click(act('route','connect')); r.push(['talk to someone → Connect screen', a.S().screen==='connect']);}
{const a=boot(); a.click(act('dontKnow')); a.click(act('route','calm')); r.push(['"I don\'t know" → Calm down → Calm menu', a.S().screen==='calm']);}

// Each option ends at the check-in, and the outcome is recorded like any other.
{const a=calm(); a.click(act('calmPick','breathe'));
 r.push(['Breathe → breathing steps', a.S().screen==='intervention' && a.S().currentInterventionId==='breathing']);
 let n=0; while(a.doc.querySelector(act('ivNext')) && n<6){ a.click(act('ivNext')); n++; } a.click(act('ivDone'));
 r.push(['...then the check-in', a.S().screen==='checkin']);
 a.click(act('rate','3')); a.click(act('ciHelped'));
 const o=a.S().sessionHistory.at(-1); r.push(['...and the outcome is recorded', o.interventionId==='breathing' && o.after===3 && o.state==='anxious']);}
{const a=calm(); a.click(act('calmPick','ground'));
 r.push(['5-4-3-2-1 → grounding game', a.S().screen==='ground' && a.S().currentInterventionId==='grounding']);
 for(let i=0;i<5;i++) a.click(act('groundNext'));
 r.push(['...then the check-in (not the safety check)', a.S().screen==='checkin']);}
{const a=calm(); a.click(act('calmPick','feet'));
 r.push(['Feet on the floor → the existing anxious steps', a.S().screen==='anx-feet']);
 a.click(act('feetDone')); a.click(act('threeSkip')); a.click(act('stepsDone')); for(let i=0;i<5;i++) a.click(act('groundNext'));
 r.push(['...then the check-in', a.S().screen==='checkin']);}

// What's still true?
{const a=calm(); a.click(act('calmPick','true'));
 const STILL=a.G('STILL_TRUE');
 r.push(['what\'s still true: one statement at a time', a.S().screen==='still-true' && a.T().includes(STILL[0]) && !a.T().includes(STILL[1])]);
 r.push(['...opens with "start with what you know"', a.T().includes('When everything feels like too much, start with what you know.')]);
 r.push(['...two plain choices, no typing', !!a.doc.querySelector(act('trueYes')) && !!a.doc.querySelector(act('trueNo')) && !a.doc.querySelector('#app input, #app textarea')]);
 a.click(act('trueNo'));
 r.push(['Not true for me → just the next statement, no arguing', a.T().includes(STILL[1]) && !/but |actually|try to|should/i.test(a.T())]);
 a.click(act('trueYes')); a.click(act('trueYes')); a.click(act('trueYes'));
 r.push(['3 true → "You found something that was true for you."', a.T().includes('You found something that was true for you.')]);
 a.click(act('trueDone')); a.click(act('rate','4')); a.click(act('ciHelped'));
 r.push(['...Next → check-in, recorded as still_true', a.S().sessionHistory.at(-1).interventionId==='still_true']);
 r.push(['nothing about the answers is saved', !/I am here|trueCount|My feet/.test(JSON.stringify(a.dump()))]);}
{const a=calm(); a.click(act('calmPick','true'));
 const n=a.G('STILL_TRUE.length'); for(let i=0;i<n;i++) a.click(act('trueNo'));
 const hrefs=[...a.doc.querySelectorAll('#app a[href]')].map(x=>x.getAttribute('href'));
 r.push(['nothing true → no forced positivity', a.T().includes("That's okay. Nothing has to feel true right now.") && !a.T().includes('You found something')]);
 r.push(['...offers a person and 988 instead', !!a.doc.querySelector('#app [data-act="talk"]') && hrefs.includes('tel:988') && hrefs.includes('sms:988')]);
 r.push(['...and can still go on to the check-in', (a.click(act('trueDone')), a.S().screen==='checkin')]);
 r.push(['...without raising the safety level', a.S().safetyLevel==='GREEN']);}
r.push(['statements kept in one constant for review', /const STILL_TRUE = \[/.test(HTML) && fs.readFileSync(require('path').join(__dirname,'REVIEW.md'),'utf8').includes('"I am here right now."')]);
r.push(['still_true is in the intervention library', /id:"still_true"/.test(HTML)]);
// RED stops it.
{const a=calm(); a.click(act('calmPick','true')); a.click('.help-pill[data-act="crisis"]');
 r.push(['Help mid-flow → crisis, RED', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
 a.G('ACTIONS.trueYes()'); r.push(['RED blocks the flow from continuing', a.S().screen==='crisis']);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
process.exit(0);
