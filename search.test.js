// 6.29 Search (STAGE6-29-ADDENDUM.md E): safety first on every query, never an empty page, nothing remembered,
// one result per table row, "pills" vs "took all my pills", Faith only when on, Home's first screen unchanged.
const {JSDOM}=require('jsdom');
const {chromium}=require('playwright');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const URL='file://'+path.join(__dirname,'index.html');
function boot(){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; w.addEventListener('error',e=>errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext=()=>null; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.addEventListener('click',e=>{ if(e.target.closest && e.target.closest('a[href]')) e.preventDefault(); });   // jsdom can't follow links
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const box=()=>w.document.getElementById('searchQ');
  const submit=q=>{ box().value=q; w.document.getElementById('searchForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); };
  const type=q=>{ box().value=q; box().dispatchEvent(new w.Event('input',{bubbles:true})); };
  const store=()=>JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])))+JSON.stringify(Object.fromEntries(Object.keys(w.sessionStorage).map(k=>[k,w.sessionStorage.getItem(k)])));
  const state=()=>w.eval('JSON.stringify(session)+JSON.stringify(ui)+String(searchQ)');
  const app=()=>w.document.getElementById('app').innerHTML;
  const first=()=>{ const c=w.document.querySelector('.search-hits .card'); return c ? (c.dataset.arg||c.dataset.search) : null; };
  return {w,click,box,submit,type,store,state,app,first,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const wait=ms=>new Promise(res=>setTimeout(res,ms));
const r=[];
(async()=>{
 // ---- A: entry ----
 {const a=boot(); r.push(['A: Home has the search field, under "I don\'t feel safe"', a.has('main .home-search') && !!(a.w.document.querySelector('main .home-safe').compareDocumentPosition(a.w.document.querySelector('main .home-search')) & 4)]);
  r.push(['A: "I don\'t feel safe" is still the first choice on Home', [...a.w.document.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
  r.push(['A: placeholder "Search: panic, breakup, can\'t sleep…"', a.w.document.querySelector('.home-search').textContent.includes("Search: panic, breakup, can't sleep…")]);
  r.push(['A: magnifier next to Help in the top bar (shown on tight screens), never replacing Help', a.has('header .top-right .search-btn[data-act="searchOpen"]') && a.has('header .top-right .help-pill[data-act="crisis"]')]);
  a.click('.home-search');
  r.push(['A: Search screen, field focused', a.S()==='search' && a.w.document.activeElement===a.box()]);
  r.push(['A: five suggestions before typing: Panic · Can\'t sleep · Breakup · Lonely · Urge', [...a.w.document.querySelectorAll('.search-suggest .sit')].map(b=>b.textContent).join('|')==="Panic|Can't sleep|Breakup|Lonely|Urge"]);
  r.push(['A: autocomplete off, no name (nothing for the browser to remember)', a.box().getAttribute('autocomplete')==='off' && a.w.document.getElementById('searchForm').getAttribute('autocomplete')==='off' && !a.box().hasAttribute('name')]);
  r.push(['A: Help visible on Search', a.has('header .help-pill[data-act="crisis"]')]);
  a.click(act('searchSuggest','panic')); r.push(['A: a suggestion searches it', a.first()==='panic' && a.box().value==='panic']); }

 // ---- RED: typed (debounced) and submitted ----
 for(const q of ['I want to die','kms','quiero morir']){
  for(const how of ['submit','pause']){
   const a=boot(); a.G('saveStore()'); const before=a.store(); a.G('ACTIONS.searchOpen()');
   if(how==='submit') a.submit(q); else { a.type(q); r.push([`RED "${q}" (typing): nothing happens before the pause`, a.S()==='search']); await wait(700); }
   r.push([`RED "${q}" (${how}) → crisis screen immediately`, a.S()==='crisis' && a.G('session.safetyLevel')==='RED']);
   const low=q.toLowerCase();
   r.push([`RED "${q}" (${how}): query discarded, nothing stored (localStorage, sessionStorage, app state)`, a.store()===before && !a.state().toLowerCase().includes(low) && !a.app().toLowerCase().includes(low) && a.G('searchQ')==='']); } }
 {const a=boot(); a.G('ACTIONS.searchOpen()'); a.submit('took all my pills'); r.push(['"took all my pills" → crisis (via safetyCheck)', a.S()==='crisis']);
  const b=boot(); b.G('ACTIONS.searchOpen()'); b.submit('pills'); r.push(['"pills" alone → the urge path first', b.first()==='urge' && b.S()==='search']);
  b.click(act('searchGo','urge')); r.push(['…and tapping it starts the urge flow', b.S()==='before' && b.G('session.currentState')==='craving']); }

 // ---- YELLOW ----
 {const a=boot(); a.G('ACTIONS.searchOpen()'); a.submit('hopeless');
  r.push(['YELLOW "hopeless" → support bar on, results still shown', a.G('session.yellow')===true && a.has('header .ybar') && a.has('.search-hits .card') && a.S()==='search']);
  r.push(['YELLOW: the field keeps the query and focus', a.box().value==='hopeless' && a.w.document.activeElement===a.box()]); }

 // ---- never an empty page ----
 for(const q of ['asdfgh','nothing helps']){
  const a=boot(); a.G('ACTIONS.searchOpen()'); a.submit(q);
  r.push([`no match "${q}" → "Here are some places to start:" with the four options`, a.w.document.getElementById('searchResults').textContent.includes('Here are some places to start:') && a.has('#searchResults '+act('dontKnow')) && a.has('#searchResults '+act('talk')) && a.has('#searchResults '+act('zags','calm')) && a.has('#searchResults '+act('crisis'))]); }
 r.push(['"No results" never appears (screens and source)', !/no results/i.test(HTML)]);

 // ---- one query per table row → that path first ----
 const ROWS=[['Calm down / breathing / grounding','freaking out','calm'],['Get out of my head / games','games','head'],['Connect / I feel alone','lonely','connect'],
  ['Change the scene','need air','scene'],['Sad or low','depressed','low'],['Urge','vape','urge'],['Heartbreak','broke up','heartbreak'],
  ['Grief','my dog died','grief'],['Bullied','cyberbullying','bully'],['PTSD, trauma, or military','flashback','ptsd'],['Tech check','doomscrolling','tech'],
  ['Cozy up / sleep',"can't sleep",'cozy'],['My plan','safety plan','plan'],['Code word','code word','codeword'],['I need my plan','need my plan','plannow'],
  ['Just out of the ER','psych ward','after'],['A line for today','journal','diary'],['Doodle','draw','doodle'],['Song','music','song'],
  ['Worried about someone','my daughter','support'],['Help / crisis','crisis','help'],['Panic','panic attack','panic']];
 for(const [row,q,id] of ROWS){ const a=boot(); a.G('ACTIONS.searchOpen()'); a.submit(q); r.push([`row "${row}": "${q}" → ${id} first`, a.first()===id, a.first()]); }
 {const a=boot(); a.G('ACTIONS.searchOpen()'); a.submit('prayer'); r.push(['Faith entry hidden when Faith is off', !a.has('[data-arg="faith"]') && a.first()!=='faith']);
  const b=boot(); b.G('prefs.strength="bible"; ACTIONS.searchOpen()'); b.submit('prayer'); r.push(['Faith row: "prayer" → Faith & hope first when it\'s on', b.first()==='faith']); }

 // ---- matching details ----
 {const a=boot(); const m=q=>a.G(`searchMatch(${JSON.stringify(q)}).map(e=>e.id).join()`);
  r.push(['C: a phrase inside a longer query ("I lost my dog yesterday")', m('I lost my dog yesterday').split(',')[0]==='grief']);
  r.push(['C: one letter off for words of 5+ letters ("lonley", "insomia", "nightmere")', m('lonley').startsWith('connect') && m('insomia').startsWith('cozy') && m('nightmere').startsWith('ptsd')]);
  r.push(['C: punctuation, case and accents don\'t matter ("CAN\'T SLEEP!!", "ánxiety")', m("CAN'T SLEEP!!").startsWith('cozy') && m('ánxiety').startsWith('calm')]);
  r.push(['C: at most 5 results', a.G('SEARCH_INDEX.every(e=>searchMatch(e.title).length<=5)') && a.G('searchMatch("help me with my anxiety and my sleep and my friend and my plan").length')<=5]);
  r.push(['C: typing the start of a word works ("pan" → panic)', m('pan').startsWith('panic')]); }

 // ---- D: results ----
 {const a=boot(); a.G('ACTIONS.searchOpen()'); a.submit('my dog died');
  r.push(['D: cards show the title and a one-line description', a.w.document.querySelector('.search-hits .card').textContent.includes('I lost someone') && a.has('.search-hits .card .meta')]);
  r.push(['D: always "Not it? I don\'t know what I need →" below the results', a.w.document.querySelector('.search-not').textContent.includes("Not it? I don't know what I need →") && a.has('.search-not '+act('dontKnow'))]);
  a.click(act('searchGo','grief')); r.push(['D: tapping a result goes straight into the path', a.S().startsWith('grief')]); }
 {const bad=[]; const ids=boot().G('SEARCH_INDEX.filter(e=>!e.href&&!e.faith).map(e=>e.id)');
  for(const id of ids){ const a=boot(); a.G(`ACTIONS.searchOpen(); ACTIONS.searchGo(${JSON.stringify(id)})`); if(a.S()==='search') bad.push(id); }
  r.push([`D: every entry opens its path (${ids.length} checked)`, bad.length===0, bad.join()]); }

 // ---- B: the index ----
 {const a=boot();
  r.push(['B: SEARCH_INDEX is a constant with {id,title,screen,words} entries', a.G('Array.isArray(SEARCH_INDEX) && SEARCH_INDEX.length>=40 && SEARCH_INDEX.every(e=>e.id&&e.title&&e.screen&&Array.isArray(e.words)&&e.words.length)')]);
  r.push(['B: no crisis words in the index (every word and title is not RED)', a.G('SEARCH_INDEX.flatMap(e=>[e.title,...e.words]).every(x=>safetyCheck(x)!=="RED")')]);
  r.push(['B: every entry names a real ACTIONS function (or a link)', a.G('SEARCH_INDEX.every(e=>e.href||typeof ACTIONS[e.act]==="function")')]); }

 // ---- nothing remembered ----
 {const a=boot(); a.G('saveStore()'); a.G('ACTIONS.searchOpen()'); a.submit('my ex cheated on me'); a.click(act('searchGo','heartbreak'));
  a.G('ACTIONS.home()'); a.G('ACTIONS.searchOpen()');
  r.push(['no history: after searching and coming back, the field is empty and no earlier query appears', a.box().value==='' && !/cheated/i.test(a.app()) && !/recent/i.test(a.w.document.getElementById('searchResults').textContent)]);
  r.push(['no history: storage holds no query text', !/cheated/i.test(a.store())]);
  const b=boot(); b.G('ACTIONS.searchOpen()'); b.type('lonely'); b.G('ACTIONS.home()'); r.push(['leaving the screen clears the query (and any pending pause)', b.G('searchQ')==='' && b.G('searchTimer')===null]); }

 // ---- never on crisis screens; blocked while RED ----
 {const a=boot(); let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(a.has('.home-search, .search-btn, #searchQ')) on=sc; }
  r.push(['never on crisis screens', !on]);
  const b=boot(); b.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"}); ACTIONS.searchOpen()'); r.push(['blockIfRed: search can\'t open while RED', b.S()==='crisis']);
  r.push(['no script errors', a.errs.length===0 && b.errs.length===0]); }

 // ---- real browser: Home's first screen, normal and large text; typing pause → crisis ----
 const br=await chromium.launch();
 for(const [name,viewport,dsf] of [['normal text',{width:390,height:844},3],['large text (200%)',{width:195,height:422},6]]){
  const p=await br.newPage({viewport,deviceScaleFactor:dsf}); await p.goto(URL);
  for(const x of ['obNext','obAdult','obLater']) await p.click(`[data-act="${x}"]`);
  await p.waitForTimeout(500);
  const m=await p.evaluate(()=>{ const el=document.querySelector('main .home-safe'), b=el.getBoundingClientRect(), tab=document.querySelector('.tabbar').getBoundingClientRect();
    const vis=s=>{ const e=document.querySelector(s); return !!e && getComputedStyle(e).display!=='none' && e.getBoundingClientRect().height>0; };
    return {first:b.top>=0 && b.bottom<=tab.top, field:vis('main .home-search'), btn:vis('header .search-btn'), help:vis('header .help-pill')}; });
  r.push([`${name}: "I don't feel safe" stays on Home's first screen`, m.first, JSON.stringify(m)]);
  r.push([`${name}: ${name.startsWith('large')?'the magnifier next to Help (the field is hidden)':'the search field (no extra top-bar button)'}`, name.startsWith('large') ? (m.btn && !m.field && m.help) : (m.field && !m.btn && m.help), JSON.stringify(m)]);
  await p.close(); }
 {const p=await br.newPage({viewport:{width:390,height:844}}); await p.goto(URL); for(const x of ['obNext','obAdult','obLater']) await p.click(`[data-act="${x}"]`);
  await p.click('.home-search'); await p.keyboard.type('kms'); await p.waitForTimeout(250);
  const mid=await p.evaluate(()=>session.screen); await p.waitForTimeout(700);
  r.push(['browser: typing "kms" and pausing opens the crisis screen (no submit needed)', mid==='search' && await p.evaluate(()=>session.screen)==='crisis']);
  await p.close(); }
 await br.close();
 console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
 process.exit(0);
})();
