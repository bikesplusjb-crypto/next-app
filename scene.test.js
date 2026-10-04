// Stage 6.5: Change the scene. Five options shown full-screen, then check-in.
// "Somewhere to go" opens the phone's Maps with a plain search: no location read or sent. 211 for local help.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
const IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
function boot(ua){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   if(ua) Object.defineProperty(w.navigator,'userAgent',{value:ua,configurable:true});
   w.__geo=0; Object.defineProperty(w.navigator,'geolocation',{configurable:true,get(){ w.__geo++; return {getCurrentPosition(){},watchPosition(){}}; }}); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ')};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const scene=ua=>{ const a=boot(ua); a.click(act('route','scene')); return a; };
const r=[];
const OPTS=[['outside','Step outside for 5 minutes'],['walk','Take a short walk'],['sit','Sit somewhere different'],['shower','Take a shower'],['drink','Get something to drink'],['window','Go to a window']];   // window: 6.18 E6

{const a=scene(); const t=a.T();
 r.push(['Change the scene opens its menu, no before-rating', a.S().screen==='scene' && a.doc.getElementById('screen-title').textContent==='Change the scene.']);
 r.push(['opening line', t.includes('Sometimes your brain needs a different place, not another question. Pick one.')]);
 r.push(['six options in spec order (6.18 E6 added the window)', [...a.doc.querySelectorAll('[data-act="scenePick"]')].map(b=>b.dataset.arg+'|'+b.textContent.trim()).join()===OPTS.map(([k,l])=>k+'|'+l).join()]);
 r.push(['no emoji; Help in the top bar', !/\p{Extended_Pictographic}/u.test(t) && !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 r.push(['opening it counts as a hard moment', a.G('store.sensitive.activity.filter(x=>x.type==="moment").length')===1]);}
{const a=boot(); a.click(act('dontKnow')); a.click(act('route','scene')); r.push(['"I don\'t know" → Get out of where I am → Change the scene', a.S().screen==='scene']);}

// Each option: full-screen with Done, then the usual check-in, recorded as change_scene.
for(const [k,label] of OPTS){
  const a=scene(); a.click(act('scenePick',k));
  const full=a.S().screen==='scene-step' && a.doc.getElementById('screen-title').textContent===a.G('CHANGE_SCENE').find(x=>x[0]===k)[2] && !!a.doc.querySelector(act('sceneDone'))
    && a.doc.querySelectorAll('#app .card, #app a.sit').length===0;
  a.click(act('sceneDone'));
  const ci=a.S().screen==='checkin';
  a.click(act('rate','4')); a.click(act('ciHelped')); a.click(act('phoneDownElse'));
  const o=a.S().sessionHistory.at(-1);
  r.push([`"${label}": full-screen, Done, check-in, outcome saved`, full && ci && o.interventionId==='change_scene' && o.option===k && o.after===4 && a.S().screen==='recommendation']);
}
{const a=boot(); r.push(['change_scene is an intervention the engine can suggest', a.G('!!findIntervention("change_scene") && findIntervention("change_scene").steps.length===5')]);
 a.G('startFlow("low"); ACTIONS.beforeSkip(); ui.engine={interventionId:"change_scene",reason:"x"}; ACTIONS.recTry();');
 r.push(['when the engine suggests it, Try opens the menu to pick one', a.S().screen==='scene' && a.S().currentInterventionId==='change_scene']);
 const n=a.S().interventionCount; a.click(act('scenePick','walk'));
 r.push(['...and picking one does not count it twice', a.S().screen==='scene-step' && a.S().interventionCount===n]);}

// Somewhere to go: Maps with a plain search, nothing about where the person is.
const places=a=>[...a.doc.querySelectorAll('.places a')].map(x=>[x.textContent.trim(),x.getAttribute('href')]);
{const a=scene(IPHONE); const p=places(a);
 r.push(['four places: Library, Park, Coffee shop, Community center', p.map(x=>x[0]).join()==='Library,Park,Coffee shop,Community center']);
 r.push(['iPhone: Apple Maps search', p.map(x=>x[1]).join()==='https://maps.apple.com/?q=library,https://maps.apple.com/?q=park,https://maps.apple.com/?q=coffee+shop,https://maps.apple.com/?q=community+center']);}
{const a=scene(ANDROID); const p=places(a);
 r.push(['elsewhere: Google Maps search', p.map(x=>x[1]).join()==='https://www.google.com/maps/search/library,https://www.google.com/maps/search/park,https://www.google.com/maps/search/coffee+shop,https://www.google.com/maps/search/community+center']);}
for(const ua of [IPHONE,ANDROID]){
  const a=scene(ua);
  const bad=places(a).filter(([,h])=>{ const u=new URL(h); const keys=[...u.searchParams.keys()];
    return keys.some(k=>k!=='q') || /@-?\d|\d+\.\d+\s*,\s*-?\d+\.\d+|near|loc|ll=|sll=|center=|daddr|saddr/i.test(u.pathname+u.search); });
  r.push([`Maps links carry no location data (${ua===IPHONE?'iPhone':'Android'})`, bad.length===0, JSON.stringify(bad)]);
  r.push([`the page never touches navigator.geolocation (${ua===IPHONE?'iPhone':'Android'})`, a.w.__geo===0]);
}
r.push(['no geolocation, places API or location lookup in the code', !/geolocation|getCurrentPosition|watchPosition|maps\.googleapis|places\b.*api/i.test(HTML)]);
{const a=scene(); const box=a.doc.querySelector('.scene-211'); const call=box && box.querySelector('a[href]');
 r.push(['211: the line and a Call 211 button to tel:211', !!box && box.textContent.includes('Need real-world help near you?') && box.textContent.includes('211 connects you to local help: food, housing, support groups. Free.')
   && call.getAttribute('href')==='tel:211' && call.textContent.trim()==='Call 211']);
 const local=[...a.doc.querySelectorAll('.places, .scene-211')].map(x=>x.textContent).join(' ')+' '+a.doc.querySelector('h2').textContent+' '+a.doc.querySelector('h2').nextElementSibling.textContent;
 r.push(['places and 211 are never labelled as crisis help', !/crisis|emergency|988|911|suicid|safe place/i.test(local)]);
 r.push(['crisis help stays separate: Help is still in the top bar', !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);}

// Safety
{const a=scene(); a.click(act('scenePick','walk')); a.click('header .help-pill[data-act="crisis"]');
 r.push(['Help from a scene step → crisis screen (RED)', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
 a.G('ACTIONS.sceneDone()'); r.push(['RED: Done cannot leave the crisis screen', a.S().screen==='crisis']);
 a.G('ACTIONS.scenePick("drink")'); r.push(['RED: no option can start', a.S().screen==='crisis']);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
