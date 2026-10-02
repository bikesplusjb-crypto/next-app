// Step 3: first-launch onboarding. Remembered in prefs only; never blocks the crisis path.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(seed,url='https://next.example/'){const dom=new JSDOM(HTML,{url,runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){ if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v); w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 const dump=()=>{const o={}; try{ for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} }catch(_){} return o;};
 const hrefs=()=>[...w.document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
 return {w,click,S:()=>w.eval('session'),T:()=>w.document.body.textContent,dump,hrefs,
   has:sel=>!!w.document.querySelector(sel)};}
const act=a=>`[data-act="${a}"]`;
const prefsOf=d=>{ try { return JSON.parse(d['next.v1.prefs']||'null'); } catch(_){ return null; } };
const r=[];

// First launch: what it is and isn't, with 988 before anything else is asked.
{const a=boot();
 r.push(['first launch opens onboarding', a.S().screen==='ob-about']);
 r.push(['screen 1 shows Call and Text 988', a.hrefs().includes('tel:988') && a.hrefs().includes('sms:988')]);
 r.push(['screen 1 says not an emergency service', a.T().includes('Not an emergency service')]);
 r.push(['screen 1 says it never contacts anyone', a.T().includes('never contacts anyone')]);
 r.push(['no tab bar during onboarding', !a.has('.tabbar')]);
 const helpEverywhere=[];
 helpEverywhere.push(a.has('.help-pill[data-act="crisis"]'));
 a.click(act('obNext')); r.push(['screen 2 asks 18+', a.S().screen==='ob-age' && a.T().includes('18 or older')]); helpEverywhere.push(a.has('.help-pill[data-act="crisis"]'));
 a.click(act('obMinor')); r.push(['under 18 shows 988 and a trusted adult', a.S().screen==='ob-minor' && a.hrefs().includes('tel:988') && a.T().includes('adult you trust')]); helpEverywhere.push(a.has('.help-pill[data-act="crisis"]'));
 r.push(['under 18 saves nothing', !(prefsOf(a.dump())||{prefs:{}}).prefs.onboarded]);
 a.click(act('obAgeBack')); r.push(['under 18 can go back to the question', a.S().screen==='ob-age']);
 a.click(act('obAdult')); r.push(['screen 3 offers My Plan now or later', a.S().screen==='ob-plan' && a.has(act('obPlanNow')) && a.has(act('obLater'))]); helpEverywhere.push(a.has('.help-pill[data-act="crisis"]'));
 r.push(['Help is on every onboarding screen', helpEverywhere.length===4 && helpEverywhere.every(Boolean)]);
 r.push(['nothing remembered before the last step', !(prefsOf(a.dump())||{prefs:{}}).prefs.onboarded]);
 a.click(act('obLater'));
 const p=prefsOf(a.dump());
 r.push(['Later goes to Home', a.S().screen==='home' && a.has('.tabbar')]);
 r.push(['completion remembered in prefs', !!p && p.prefs.onboarded===true]);
 r.push(['nothing about onboarding in sensitive data', !String(a.dump()['next.v1.sensitive']||'').includes('onboard')]);
 r.push(['no safety state in prefs', !/safetyLevel|YELLOW|RED|stillBad|highRating/.test(a.dump()['next.v1.prefs'])]);
 const b=boot(a.dump());
 r.push(['second launch skips onboarding', b.S().screen==='home']);
}
// "Make my plan now" opens the editable plan.
{const a=boot(); a.click(act('obNext')); a.click(act('obAdult')); a.click(act('obPlanNow'));
 r.push(['Make my plan now opens My Plan', a.S().screen==='plan' && a.w.eval('ui.planFrom')==='tab' && prefsOf(a.dump()).prefs.onboarded===true]);}

// Crisis is never gated by onboarding.
{const a=boot(); a.click(act('obNext')); a.click('.help-pill[data-act="crisis"]');
 r.push(['Help during onboarding opens crisis at once', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
 a.click(act('cBack'));
 r.push(['leaving crisis returns to onboarding as YELLOW', a.S().screen==='ob-about' && a.S().safetyLevel==='YELLOW' && a.has('.ybar')]);
 r.push(['leaving crisis does not complete onboarding', !(prefsOf(a.dump())||{prefs:{}}).prefs.onboarded]);}
{const a=boot(); a.click('.help-pill[data-act="crisis"]'); a.click(act('cNo')); a.click(act('noPlan')); a.click(act('planDone'));
 const atCheck=a.S().screen==='safety-check';
 a.click(act('safeYes'));
 r.push(['feeling safer during onboarding returns to onboarding', atCheck && a.S().screen==='ob-about' && a.S().safetyLevel==='YELLOW']);}

// Storage blocked: onboarding still shows, completes, and the app works.
{const a=boot(null,'about:blank');
 r.push(['no storage: onboarding still shows', a.S().screen==='ob-about' && a.w.eval('STORAGE_OK')===false]);
 a.click(act('obNext')); a.click(act('obAdult')); a.click(act('obLater'));
 r.push(['no storage: app works after onboarding', a.S().screen==='home']);}
// Saving turned off still remembers onboarding (prefs are kept apart from sensitive data).
{const a=boot(); ['obNext','obAdult','obLater'].forEach(x=>a.click(act(x)));
 a.click('[data-act="tab"][data-arg="settings"]'); a.click('[data-act="persist"][data-arg="off"]');
 const b=boot(a.dump());
 r.push(['saving off: onboarding not shown again', b.S().screen==='home' && b.w.eval('persistOn')===false]);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
