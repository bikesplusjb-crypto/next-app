// Zags brand mark: the exact character from zags-preview.html, still, in five places only; never on crisis screens or "I need my plan".
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const PREVIEW=fs.readFileSync(path.join(__dirname,'zags-preview.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,has:s=>!!w.document.querySelector(s)};}
const r=[];
const show=(a,s,extra='')=>a.G(`${extra} lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);

{const a=boot();
 r.push(['onboarding welcome: Zags', a.S().screen==='ob-about' && a.has('main .zmark')]);
 ['obNext','obAdult','obLater'].forEach(x=>a.click(`[data-act="${x}"]`));
 const m=a.doc.querySelector('.brand-row .zmark-btn');
 r.push(['Home: Zags next to the wordmark', !!m && m.previousElementSibling.classList.contains('brand') && m.getAttribute('aria-label')==='Calm down with Zags']);
 r.push(['Home: still (no animation class) and silent (no speech bubble)', !a.has('.home-hero .zmark-wave') && !a.has('.home-hero .bubble')]);
 r.push(['Home: Zags is above "I don\'t feel safe", which stays the first card', a.doc.querySelector('.home-safe').compareDocumentPosition(m)===2]);
 a.click('.brand-row .zmark-btn');
 r.push(['tapping him opens Calm down with Zags', a.S().screen==='zags' && a.S().currentInterventionId==='zags' && a.S().currentState==='anxious']);
 show(a,'phone-down'); r.push(['"You\'re ready": Zags waving', a.has('main .zmark.zmark-wave')]);
 a.G('ACTIONS.tab("plan")'); r.push(['empty My Plan: Zags', a.G('planEmpty()') && a.has('main .zmark')]);
 show(a,'song-list'); r.push(['empty My songs: Zags', a.has('main .zmark') && a.doc.querySelector('main').textContent.includes('No songs yet.')]);
 a.G('ACTIONS.loadSample()'); a.G('ACTIONS.tab("plan")'); r.push(['My Plan with content: no Zags', !a.has('main .zmark')]);
 a.G('store.sensitive.songs=[{id:"1",date:1,mood:"heavy",lines:["a","b","c"],still:[]}]'); show(a,'song-list'); r.push(['My songs with a song: no Zags', !a.has('main .zmark')]);
 const never=[]; for(const s of ['crisis','crisis-full','crisis-no','safety-check','plan-now']){ show(a,s); if(a.has('.zmark')) never.push(s); }
 r.push(['never on crisis, crisis-full, crisis-no, safety-check or "I need my plan"', never.length===0, never.join()]);
 a.G('ui.planFrom="no"; store.sensitive.plan=emptyPlan()'); show(a,'plan'); r.push(['never on the plan opened from the crisis "No" path', !a.has('.zmark')]);
 // only these places, across every screen
 const allowed=['home','phone-down','ob-about','plan','song-list','cozy-end','sad'];   // cozy-end: owner request (Zags in a small blanket); sad: 6.23 (Zags under a small cloud)
 const where=[]; for(const s of a.G('Object.keys(SCREENS)')){ try{ a.G('ui=freshUi(); ui.faithKey="hope"; ui.editSection="warningSigns"; prefs.strength="bible"; store.sensitive.plan=emptyPlan(); store.sensitive.songs=[]'); show(a,s); if(a.has('main .zmark')) where.push(s); }catch(e){} }
 r.push(['the brand mark appears in those places only', where.every(s=>allowed.includes(s)), where.join()]);}

{const a=boot(); const mark=a.G('session.screen="home"; zagsMark()');
 const parts=['M92 52 L102 30 L110 46 L120 24 L128 52','M110 48 C160 48 186 84 186 128 C186 170 154 196 110 196 C66 196 34 170 34 128 C34 84 60 48 110 48 Z','cx="110" cy="160" rx="44" ry="26"','cx="86" cy="118" rx="8" ry="10"','cx="134" cy="118" rx="8" ry="10"','cx="89" cy="114" r="2.6"','cx="137" cy="114" r="2.6"','cx="70" cy="138" rx="10" ry="6"','cx="150" cy="138" rx="10" ry="6"','M100 140 Q110 148 120 140'];
 r.push(['the exact character from zags-preview.html (tuft, body, belly, eyes, cheeks, smile)', parts.every(x=>mark.includes(x)&&PREVIEW.includes(x))]);
 r.push(['decorative inside its button (no duplicate screen-reader name)', /aria-hidden="true"/.test(mark)]);}
r.push(['waving stops for reduced motion', /prefers-reduced-motion:reduce\)\{\.zmark-wave \.zmark-body\{animation:none\}/.test(HTML) && /html\.reduce \.zmark-wave \.zmark-body\{animation:none\}/.test(HTML)]);

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
