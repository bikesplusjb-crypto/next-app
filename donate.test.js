// Quiet "Support ZigZag Mind" link: one constant; Settings, About and Share with a friend, plus (owner, 2026-10-09) a quiet
// footer line on ordinary screens. Never on crisis screens, never while YELLOW or RED, hidden when empty. Nothing stored or tracked.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const SRC=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
const URL_='https://ko-fi.com/zigzagmind-test';
const withUrl=u=>SRC.replace(/const DONATE_URL = "[^"]*";/,`const DONATE_URL = ${JSON.stringify(u)};`);
const EMPTY=withUrl('');
function boot(html){const dom=new JSDOM(html,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const links=a=>[...a.doc.querySelectorAll('#app a')].filter(x=>/Support ZigZag Mind/.test(x.textContent));
const r=[];
r.push(['the real link is set: https://ko-fi.com/zigzagmind', /const DONATE_URL = "https:\/\/ko-fi\.com\/zigzagmind";/.test(SRC)]);

r.push(['one constant at the top of the app script', /<script>\s*"use strict";\s*\/\*[^]*?\*\/\s*const DONATE_URL = "[^"]*";/.test(SRC) && (SRC.match(/const DONATE_URL/g)||[]).length===1]);

// ---- set ----
{const a=boot(withUrl(URL_)); a.click(act('tab','settings'));
 const l=links(a); const app=a.doc.getElementById('app'); const main=app.querySelector('main')||app;
 r.push(['Settings: "Support ZigZag Mind" row with its line', l.length===1 && a.T().includes('Free for everyone, always. If it helped, you can help keep it running.')]);
 const all=[...main.querySelectorAll('h2, button, a, p, label, select, input')]; const last=all.filter(e=>!e.closest('.donate-row')).at(-1);
 r.push(['...at the bottom of Settings', !!l[0] && l[0].closest('.donate-row') && (last.compareDocumentPosition(l[0].closest('.donate-row')) & 4)]);
 r.push(['opens in a new tab: target="_blank", rel="noopener"', l[0].getAttribute('href')===URL_ && l[0].getAttribute('target')==='_blank' && l[0].getAttribute('rel')==='noopener']);
 const before=JSON.stringify(a.dump()); const acts=a.G('store.sensitive.activity.length');
 l[0].addEventListener('click',e=>e.preventDefault()); l[0].dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['tapping it stores and tracks nothing', JSON.stringify(a.dump())===before && a.G('store.sensitive.activity.length')===acts && a.S().screen==='settings']);
 a.click(act('about'));
 const la=links(a);
 r.push(['About: one plain line with the same link', la.length===1 && la[0].getAttribute('href')===URL_ && la[0].getAttribute('target')==='_blank' && la[0].getAttribute('rel')==='noopener']);}

// ---- never anywhere else ----
{const a=boot(withUrl(URL_)); a.G('ACTIONS.loadSample()');
 // 2026-10-09: Join ZigZag Mind (owner request: "App and support or tell a friend") also shows it, as its third part.
 const screens=a.G('Object.keys(SCREENS)').filter(s=>s!=='settings' && s!=='about' && s!=='join');
 const found=[];
 for(const s of screens){
   for(const st of ['anxious','low','distraction']){
     a.G(`lastRendered=null; ui=freshUi(); session={...initialSession, screen:${JSON.stringify(s)}, currentState:${JSON.stringify(st)}, currentInterventionId:"grounding", yellow:true, safetyLevel:${['crisis','crisis-full','crisis-no','safety-check'].includes(s)?'"RED"':'"YELLOW"'}}; ui.placesOpen=true; ui.talkOpen=true; ${s==='recommendation'?'runEngine();':''} render();`);
     if(/Support ZigZag Mind|ko-fi/i.test(a.doc.body.innerHTML.replace(/<script[\s\S]*?<\/script>/g,''))){ found.push(s); break; }
   }
 }
 r.push([`never on any other screen while YELLOW or RED (${screens.length}: Home, flows, Calm, crisis, Help, My Plan, check-ins…)`, screens.length>=50 && found.length===0, found.join()]);
 r.push(['the list covers Home, crisis, Help, Calm, My Plan and the check-ins', ['home','crisis','crisis-full','talk','calm','plan','checkin','game-check','recommendation','zags','connect'].every(s=>screens.includes(s))]);}

// ---- the footer line (owner, 2026-10-09) ----
{const a=boot(withUrl(URL_)); const foot=()=>a.doc.querySelector('#app main .donate-foot a.donate');
 r.push(['footer: a quiet line at the bottom of Home (GREEN)', !!foot() && foot().getAttribute('href')===URL_ && foot().getAttribute('target')==='_blank' && foot().getAttribute('rel')==='noopener']);
 r.push(['footer: Home\'s first choice is still "I don\'t feel safe"', [...a.doc.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
 r.push(['footer: it is the last thing on the screen', a.doc.querySelector('#app main .content').lastElementChild.classList.contains('donate-foot')]);
 a.G('ACTIONS.tab("plan")'); r.push(['footer: on the main screens (My Plan)', !!foot()]);
 a.G('ACTIONS.moreHelp()'); r.push(['footer: on Other kinds of help', !!foot()]);
 let inMoment=''; for(const x of ['ACTIONS.route("calm")','ACTIONS.route("connect")','ACTIONS.flow("anxious")','ACTIONS.pathStart("slipped")','ACTIONS.panicStart()','ACTIONS.bullyStart()','ACTIONS.holdStart()']){ a.G(`session={...initialSession, screen:"home"}; ${x}`); if(foot()) inMoment+=x+' '; }
 r.push(['footer: never inside a hard moment (Calm, Connect, flows, paths, panic, bullying, Hold & answer)', !inMoment, inMoment]);
 let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session={...initialSession, screen:${JSON.stringify(sc)}}; lastRendered=null; render()`); if(foot()) on=sc; }
 r.push(['footer: never on crisis screens, even when GREEN', !on]);
 a.G('session={...initialSession, screen:"home"}; dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"}); lastRendered=null; render()'); r.push(['footer: hidden while YELLOW (support bar on)', !foot() && !!a.doc.querySelector('header .ybar')]);
 const b=boot(withUrl(URL_)); b.G('ACTIONS.tab("settings")'); r.push(['footer: not doubled where the donate row already shows (Settings)', b.doc.querySelectorAll('#app .donate-foot').length===0]);
 const c=boot(EMPTY); r.push(['footer: hidden when the link is empty', !c.doc.querySelector('.donate-foot')]); }
{const g=fs.readFileSync(require('path').join(__dirname,'support','index.html'),'utf8');
 r.push(['supporter guide: "Support ZigZag Mind" in its footer', /<footer>[^]*Free for everyone, always\. <a href="https:\/\/ko-fi\.com\/zigzagmind" target="_blank" rel="noopener">Support ZigZag Mind<\/a><\/footer>/.test(g)]); }

// ---- hidden when empty (or left as the placeholder) ----
for(const [label,html] of [['empty',EMPTY],['placeholder left in',withUrl('PASTE-LINK-HERE')],['not a web link',withUrl('javascript:alert(1)')]]){
  const a=boot(html); a.click(act('tab','settings')); const s1=links(a).length + (/Support ZigZag Mind/.test(a.T())?1:0);
  a.click(act('about')); const s2=links(a).length + (/Support ZigZag Mind/.test(a.T())?1:0);
  r.push([`hidden everywhere when ${label}`, s1===0 && s2===0]);
}

// ---- no storage keys added ----
{const a=boot(EMPTY), b=boot(withUrl(URL_));
 for(const x of [a,b]){ x.click(act('tab','settings')); x.click(act('about')); }
 r.push(['no storage keys added', JSON.stringify(Object.keys(a.dump()).sort())===JSON.stringify(Object.keys(b.dump()).sort()) && !/donat|ko-fi|support/i.test(JSON.stringify(b.dump()))]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
