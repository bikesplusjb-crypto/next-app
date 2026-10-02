// Step 5: outside the US. Time zone and language are a hint only; the helpline link is only ever ADDED.
// 911 and 988 never disappear, whatever the guess or setting.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
const FIND='https://findahelpline.com';
function boot({tz='America/Chicago', lang='en-US', seed}={}){
  const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
    w.scrollTo=()=>{}; w.scrollBy=()=>{};
    if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v);
    const real=w.Intl;
    w.Intl=new Proxy(real,{get:(t,k)=>k==='DateTimeFormat'
      ? function(){ if(tz===null) throw new Error('no Intl'); return { resolvedOptions:()=>({ timeZone:tz }) }; }
      : t[k]});
    Object.defineProperty(w.navigator,'language',{value:lang});
  }});
  const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(String(w.eval('session.screen')).startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const hrefs=()=>[...w.document.querySelectorAll('#app a[href]')].map(a=>a.getAttribute('href'));
  const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
  return {w,click,S:()=>w.eval('session'),hrefs,dump,G:x=>w.eval(x)};
}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
// Walk all four crisis screens and record what each shows.
function crisisTour(a){
  const out={};
  const look=()=>{ const h=a.hrefs(); out[a.S().screen]={ find:h.includes(FIND), c988:h.includes('tel:988'), t988:h.includes('sms:988'), c911:h.includes('tel:911') }; };
  a.click('.help-pill[data-act="crisis"]'); look();
  a.click(act('cNo')); look();
  a.click(act('noPlan')); a.click(act('planDone')); look();
  a.click(act('safeNotSure')); look();
  return out;
}
const SCREENS=['crisis','crisis-no','safety-check','crisis-full'];
const r=[];

{const t=crisisTour(boot());
 r.push(['US time zone: no extra link', SCREENS.every(s=>t[s] && !t[s].find)]);
 r.push(['US: 988 on every crisis screen, 911 on crisis-full', SCREENS.every(s=>t[s].c988 && t[s].t988) && t['crisis-full'].c911]);}
{const t=crisisTour(boot({tz:'Europe/London', lang:'en-GB'}));
 r.push(['outside US: "Find a helpline" on every crisis screen', SCREENS.every(s=>t[s] && t[s].find)]);
 r.push(['outside US: 988 and 911 still shown', SCREENS.every(s=>t[s].c988 && t[s].t988) && t['crisis-full'].c911]);}
{const a=boot({tz:'Asia/Tokyo', lang:'ja-JP'}); a.click('.help-pill[data-act="crisis"]');
 const link=[...a.w.document.querySelectorAll('#app a')].find(x=>x.getAttribute('href')===FIND);
 r.push(['link text and address are exact, with nothing personal in it', !!link && link.textContent.trim()==='Find a helpline in your country' && link.getAttribute('href')===FIND]);
 r.push(['link is full-size and opens separately', !!link && link.classList.contains('btn') && link.getAttribute('target')==='_blank' && link.getAttribute('rel')==='noopener']);}

const guess=(o)=>boot(o).G('likelyOutsideUS()');
r.push(['Canada (Toronto) counts as outside', guess({tz:'America/Toronto', lang:'en-CA'})===true]);
r.push(['Mexico City counts as outside', guess({tz:'America/Mexico_City', lang:'es-MX'})===true]);
r.push(['US zones incl. Hawaii, Alaska, Indiana, Puerto Rico, Guam count as US',
  ['America/New_York','America/Los_Angeles','Pacific/Honolulu','America/Anchorage','America/Indiana/Indianapolis','America/Puerto_Rico','Pacific/Guam'].every(tz=>guess({tz})===false)]);
r.push(['time zone wins over language (Spanish speaker in LA)', guess({tz:'America/Los_Angeles', lang:'es-MX'})===false]);
r.push(['no time zone: language region decides', guess({tz:null, lang:'en-GB'})===true && guess({tz:null, lang:'en-US'})===false]);
r.push(['UTC or unknown with no region: no extra link', guess({tz:'UTC', lang:'en'})===false && guess({tz:null, lang:''})===false]);

// Settings override, remembered in prefs.
{const a=boot({tz:'America/Chicago'});
 a.click(act('tab','settings'));
 r.push(['Settings shows Where you are with Auto selected', !!a.w.document.querySelector('[data-act="country"][data-arg="auto"][aria-pressed="true"]')]);
 a.click(act('country','other'));
 r.push(['override to outside adds the link', a.G('likelyOutsideUS()')===true]);
 const p=JSON.parse(a.dump()['next.v1.prefs']);
 r.push(['country saved in prefs only', p.prefs.country==='other' && !String(a.dump()['next.v1.sensitive']||'').includes('country')]);
 const b=boot({tz:'America/Chicago', seed:a.dump()});
 const t=crisisTour(b);
 r.push(['override survives reload; 988 and 911 still there', SCREENS.every(s=>t[s].find && t[s].c988) && t['crisis-full'].c911]);}
{const a=boot({tz:'Europe/Berlin', lang:'de-DE'});
 a.click(act('tab','settings')); a.click(act('country','us'));
 const t=crisisTour(a);
 r.push(['override to US removes only the extra link', SCREENS.every(s=>!t[s].find && t[s].c988 && t[s].t988) && t['crisis-full'].c911]);}
{const a=boot({tz:'Europe/Berlin', lang:'de-DE'});
 a.click(act('tab','settings')); a.click(act('country','us')); a.click(act('country','auto'));
 r.push(['back to Auto uses the guess again', a.G('likelyOutsideUS()')===true]);}
r.push(['bad saved value falls back to the guess', boot({tz:'Europe/Paris', seed:{'next.v1.prefs':JSON.stringify({prefs:{onboarded:true,country:'zz'}})}}).G('likelyOutsideUS()')===true]);
r.push(['no location APIs used', !/geolocation|getCurrentPosition|watchPosition/.test(HTML)]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
