// Step 6: accessibility. Every screen: a focusable title, Help, named controls, labelled fields.
// Every animation respects reduced motion. Large text never buries Help under pinned bars.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
const CSS=(HTML.match(/<style>([\s\S]*?)<\/style>/)||[])[1]||'';
const r=[];
function boot(extra){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; if(extra) extra(w); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 return {w,click,G:x=>w.eval(x),doc:w.document};}

// ---- reduced motion ----
const decls=[...CSS.matchAll(/(animation|transition)\s*:([^;}]*)/g)].map(m=>m[0]);
const moving=decls.filter(d=>!/:\s*none/.test(d));
r.push(['CSS has animations to cover (sanity)', moving.length>=9, moving.length]);
r.push(['phone setting stops every CSS animation and transition', /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\*,\*::before,\*::after\{animation:none!important;transition:none!important\}/.test(CSS)]);
r.push(['app "Reduce motion" setting stops every CSS animation and transition', /:root\.reduce \*,:root\.reduce \*::before,:root\.reduce \*::after\{animation:none!important;transition:none!important\}/.test(CSS)]);
r.push(['no animation can override reduced motion with !important', moving.every(d=>!/!important/.test(d))]);
const SCRIPT=(HTML.match(/<script>([\s\S]*?)<\/script>/)||[])[1]||'';
r.push(['smooth scrolling only when motion is allowed', [...SCRIPT.matchAll(/behavior\s*:[^,}]*"smooth"/g)].length===[...SCRIPT.matchAll(/reducedMotion\(\) \? "auto" : "smooth"/g)].length]);
r.push(['no Web Animations API calls', !/\.animate\(/.test(SCRIPT)]);
// Focus game: reduced motion drops the up-down bob.
function focusY(reduce){
  const a=boot(); ['obNext','obAdult','obLater'].forEach(x=>a.click(`[data-act="${x}"]`));
  if(reduce) a.G('prefs.reduce=true');
  a.G('ui=freshUi(); session={...initialSession, screen:"focus", currentState:"distraction"}; render();');
  const area=a.doc.getElementById('focusArea'); Object.defineProperty(area,'clientWidth',{value:300});
  a.G('ui.focusStart=0; cancelAnimationFrame(focusRaf); focusLoop(1300); cancelAnimationFrame(focusRaf);');
  const m=(a.doc.getElementById('focusOrb').style.transform||'').match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
  return m?Number(m[2]):NaN;
}
r.push(['focus game bobs normally', Math.abs(focusY(false))>1]);
r.push(['focus game: reduced motion is side to side only', focusY(true)===0]);
{const a=boot(); ['obNext','obAdult','obLater'].forEach(x=>a.click(`[data-act="${x}"]`));
 a.click('[data-act="tab"][data-arg="settings"]'); a.click('[data-act="motion"][data-arg="reduce"]');
 r.push(['Reduce motion setting applies the class', a.doc.documentElement.classList.contains('reduce')]);}

// ---- every screen: title, Help, names, labels ----
{const a=boot(); a.G('prefs.onboarded=true; ACTIONS.loadSample()');
 const screens=a.G('Object.keys(SCREENS)');
 const name=e=>(e.getAttribute('aria-label')||e.textContent||'').trim();
 const bad={title:[],help:[],names:[],labels:[]};
 for(const s of screens){
   a.G(`lastRendered=null; ui=freshUi(); ui.thoughts=[{text:"A worried thought",place:null}]; ui.editSection=${s==='plan-edit'?'"trustedPeople"':'null'};
        session={...initialSession, screen:${JSON.stringify(s)}, currentState:"anxious", currentInterventionId:"walking", currentBeforeRating:7}; render();`);
   const d=a.doc;
   if(!d.getElementById('screen-title') || d.activeElement!==d.getElementById('screen-title')) bad.title.push(s);
   if(!d.querySelector('header .help-pill[data-act="crisis"]')) bad.help.push(s);
   d.querySelectorAll('#app button, #app a[href]').forEach(e=>{ if(!name(e)) bad.names.push(s); });
   d.querySelectorAll('#app input, #app textarea, #app select').forEach(e=>{ if(!(e.id&&d.querySelector(`label[for="${e.id}"]`)) && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.closest('label')) bad.labels.push(s+'#'+e.id); });
 }
 r.push([`all ${screens.length} screens move focus to their title`, screens.length>=37 && bad.title.length===0, bad.title.join()]);
 r.push(['Help is in the top bar of every screen', bad.help.length===0, bad.help.join()]);
 r.push(['every button and link has a name', bad.names.length===0, [...new Set(bad.names)].join()]);
 r.push(['every text field has a label', bad.labels.length===0, bad.labels.join()]);
}
r.push(['emoji icons are hidden from screen readers', !/<span class="em">/.test(HTML)]);
r.push(['buttons are at least 56px, crisis included', /\.btn\{min-height:56px/.test(CSS)]);
r.push(['visible focus ring', /:focus-visible\{outline:3px solid/.test(CSS)]);
r.push(['craving countdown is a timer, not a chatty live region', /role="timer"/.test(HTML) && !/id="crvTime"[^>]*aria-live="(polite|assertive)"/.test(HTML)]);

// ---- large text: pinned bars ----
function chrome({header,actions=0,tabbar=0,vh=812,screen='home',yellow=true}){
  const heights={'top':header,'actions':actions,'tabbar':tabbar};
  const a=boot(w=>{ Object.defineProperty(w,'innerHeight',{value:vh,configurable:true});
    Object.defineProperty(w.HTMLElement.prototype,'offsetHeight',{configurable:true,get(){ for(const c of this.classList||[]) if(c in heights) return heights[c]; return 0; }}); });
  a.G(`prefs.onboarded=true; session={...initialSession, screen:${JSON.stringify(screen)}, currentState:"anxious", yellow:${yellow}, safetyLevel:${yellow?'"YELLOW"':'"GREEN"'}}; ui=freshUi(); render();`);
  return a;
}
{const a=chrome({header:290,tabbar:83});
 r.push(['200% text + YELLOW: bottom bars stop being pinned', a.doc.documentElement.classList.contains('crowded')]);
 r.push(['...while Help and Call 988 stay in the pinned top bar', !!a.doc.querySelector('header.top .help-pill') && !!a.doc.querySelector('header.top .ybar a[href="tel:988"]')]);
 r.push(['...and the CSS unpins only the bottom bars', /:root\.crowded \.tabbar,:root\.crowded \.actions\{position:static\}/.test(CSS) && !/:root\.crowded header/.test(CSS)]);}
r.push(['normal text: nothing changes', !chrome({header:68,tabbar:58,yellow:false}).doc.documentElement.classList.contains('crowded')]);
{const a=chrome({header:68,tabbar:58,yellow:false});
 a.G('window.innerHeight'); Object.defineProperty(a.w,'innerHeight',{value:300,configurable:true}); a.w.dispatchEvent(new a.w.Event('resize'));
 r.push(['re-checked on resize (e.g. turning the phone)', a.doc.documentElement.classList.contains('crowded')]);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[2]?'  ('+x[2]+')':'')).join('\n'));
