// North star pass (2026-10-04): at most 8 choices per main menu (progressive disclosure, nothing removed),
// toggles are blocked while RED and save nothing, and Coffee / Zags keep to scripted, non-companion wording.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){ const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  w.eval('getPlan().trustedPeople=[{name:"Jordan",phone:"555-0142",relationship:"friend"}]; saveStore(); lastRendered=null; render()');
  const show=s=>w.eval(`lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);
  // Crisis contacts (the Crisis Text Line line under 988) are safety lines, not menu choices.
  const choices=()=>[...w.document.querySelectorAll('#app main [data-act], #app main a[href]')].filter(e=>!e.closest('.ctl-line')).length;
  const has=s=>!!w.document.querySelector(s);
  return {w,click,show,choices,has,G:x=>w.eval(x)}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];

// ---- at most 8 choices on each main menu (one trusted person in My Plan) ----
for(const [name,s] of [['Calm','calm'],['Get out of my head','distract'],['Connect','connect'],['Change the scene','scene'],['Tech check','tech']]){
  const a=boot(); a.show(s); r.push([`${name}: at most 8 choices (${a.choices()})`, a.choices()<=8]); }

// ---- Calm: four quick tools one tap behind "Something else"; What's true, Zags, Cozy, Coffee stay in view ----
{const a=boot(); a.show('calm');
 r.push(['Calm: Coffee, Cozy, Zags and What\'s true in view', a.has(act('coffeeStart')) && a.has(act('cozyStart')) && a.has(act('zags','calm')) && a.has(act('calmPick','truth'))]);
 r.push(['Calm: breathe/ground/feet/real hidden until "Something else"', ['breathe','ground','feet','real'].every(k=>!a.has(act('calmPick',k))) && a.has(act('calmMore'))]);
 r.push(['Calm: "I\'d rather talk to someone" stays', a.has(act('route','connect'))]);
 a.click(act('calmMore'));
 r.push(['Calm: one tap shows all four', ['breathe','ground','feet','real'].every(k=>a.has(act('calmPick',k))) && !a.has(act('calmMore'))]);
 a.click(act('calmPick','breathe'));
 r.push(['Calm: Breathe for 1 minute still starts', a.G('session.currentIntervention')!==null && a.G('session.screen')!=='calm']); }

// ---- Connect: Warm Line, people, ideas and 988 in view; three extras behind "Something else" ----
{const a=boot(); a.show('connect');
 r.push(['Connect: 988 Call and Text in view', a.has('#app main a[href="tel:988"]') && a.has('#app main a[href^="sms:988"]')]);
 r.push(['Connect: Warm Line and the trusted person in view', a.has('#connWarm a[href^="tel:"]') && a.has('#connPeople a[href^="sms:5550142"]') && a.has('#connPeople a[href="tel:5550142"]')]);
 r.push(['Connect: around people / Zags / song hidden until "Something else"', !a.has(act('aroundPeople')) && !a.has(act('zags','connect')) && !a.has(act('songStart','connect')) && a.has(act('connMore'))]);
 a.click(act('connMore'));
 r.push(['Connect: one tap shows all three', a.has(act('aroundPeople')) && a.has(act('zags','connect')) && a.has(act('songStart','connect'))]);
 r.push(['Connect: 988 below the extras by day, first at night (6.18 D2)', (()=>{const all=[...a.w.document.querySelectorAll('#app main [data-act], #app main a[href]')]; const i988=all.findIndex(e=>e.getAttribute('href')==='tel:988'); const iZ=all.findIndex(e=>e.dataset.act==='zags'); return a.G('isNight()') ? i988<iZ : i988>iZ; })()]); }

// ---- Change the scene: the two "Find" items behind "Find something" ----
{const a=boot(); a.show('scene');
 r.push(['Scene: six small moves and Somewhere to go in view', a.w.document.querySelectorAll(act('scenePick')).length===6 && a.has(act('placesOpen'))]);
 r.push(['Scene: Find items hidden until "Find something"', !a.has(act('sceneAlive')) && !a.has(act('fsStart')) && a.has(act('sceneFind'))]);
 a.click(act('sceneFind'));
 r.push(['Scene: one tap shows both', a.has(act('sceneAlive')) && a.has(act('fsStart'))]); }

// ---- toggles: blocked while RED, save nothing ----
{const a=boot(); a.G('saveStore()'); const before=a.w.localStorage.getItem('next.v1.sensitive'), bp=a.w.localStorage.getItem('next.v1.prefs');
 a.show('calm'); a.click(act('calmMore')); a.show('connect'); a.click(act('connMore')); a.show('scene'); a.click(act('sceneFind'));
 r.push(['Toggles write nothing to storage', a.w.localStorage.getItem('next.v1.sensitive')===before && a.w.localStorage.getItem('next.v1.prefs')===bp]);
 const b=boot(); b.show('calm'); b.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); b.G('ACTIONS.calmMore()');
 r.push(['calmMore while RED → crisis, not the menu', b.G('session.screen').startsWith('crisis') && !b.G('ui.calmMoreOpen')]);
 const c=boot(); c.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); c.G('ACTIONS.connMore(); ACTIONS.sceneFind()');
 r.push(['connMore / sceneFind while RED do nothing', !c.G('ui.connMoreOpen') && !c.G('ui.sceneFindOpen')]); }

// ---- Home: "I don't feel safe" stays the first big choice ----
{const a=boot(); const first=[...a.w.document.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act));
 r.push(['Home: "I don\'t feel safe" is the first choice', first && first.dataset.act==='crisis']); }

// ---- Coffee and Zags: scripted, finite, no companion / dependency wording ----
{const a=boot(); const coffee=JSON.stringify(a.G('COFFEE')), zags=JSON.stringify(a.G('ZAGS_LINES'));
 const BANNED=/your friend|i'm your|always here for you|missed you|come back and talk|know exactly how you feel|don't need anyone|i love you|i'll always|don't leave/i;
 r.push(['Coffee: no friend / dependency wording', !BANNED.test(coffee)]);
 r.push(['Zags: no friend / dependency wording', !BANNED.test(zags)]);
 r.push(['Coffee: says it is an app, not a person', /an app, not a person/.test(a.G('COFFEE.note'))]);
 r.push(['Coffee: ends by handing back to the real world', a.G('COFFEE.end').join(' ').includes('You can put the phone down now.')]);
 r.push(['Coffee: finite (a fixed number of turns)', Number.isFinite(a.G('COFFEE_TURNS')) && a.G('COFFEE_TURNS')<=6]);
 r.push(['Zags: says it is not a person', /not a person/.test(a.G('ZAGS_LINES.hello')) && /not a person and not AI/.test(a.G('ZAGS_NOTE'))]); }

// ---- product boundary: no network, AI, analytics or notifications in the page ----
{const src=HTML.replace(/<!--[\s\S]*?-->/g,'');
 r.push(['No fetch / XHR / beacon / WebSocket', !/\bfetch\(|XMLHttpRequest|sendBeacon|new WebSocket|EventSource\(/.test(src)]);
 r.push(['No notifications API', !/Notification\.requestPermission|new Notification\(|PushManager/.test(src)]);
 r.push(['No AI APIs', !/api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis/.test(src)]); }

for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
