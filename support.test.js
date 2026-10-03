// Stage 6.9: Supporter guide page (support/index.html → zigzagmind.com/support) and "Share the supporter guide" in My Plan.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const PAGE=fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const r=[];

// ---- the page ----
const g=new JSDOM(PAGE,{url:'https://zigzagmind.com/support/'}).window.document;
const text=g.body.textContent.replace(/\s+/g,' ');
const hrefs=[...g.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
r.push(['the guide lives at support/ (zigzagmind.com/support)', fs.existsSync(path.join(__dirname,'support','index.html')) && /Here's a short guide: \$\{SUPPORT_URL_TEXT\}/.test(HTML) && /SUPPORT_URL_TEXT = "zigzagmind\.com\/support"/.test(HTML)]);
r.push(['no scripts at all', !/<script/i.test(PAGE) && !/\son[a-z]+=/i.test(PAGE)]);
r.push(['no network calls: nothing loaded from anywhere else', !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|@import|url\(/i.test(PAGE)
  && [...g.querySelectorAll('[src], link[href]')].every(e=>!/^(https?:)?\/\//.test(e.getAttribute('src')||e.getAttribute('href')))]);
r.push(['no storage APIs', !/localStorage|sessionStorage|indexedDB|document\.cookie|caches\./.test(PAGE)]);
r.push(['no tracking: no analytics, pixels or third-party links', !/analytics|gtag|pixel|facebook|google|plausible|segment/i.test(PAGE) && hrefs.every(h=>/^(tel|sms):/.test(h))]);
r.push(['988 present: call and text', hrefs.includes('tel:988') && hrefs.includes('sms:988') && /988 helps people who are supporting someone, too/.test(text)]);
r.push(['911 present: if they\'re in danger or took something', hrefs.includes('tel:911') && text.includes("Call 911 if they're in danger or took something")]);
const H=[...g.querySelectorAll('h2')].map(h=>h.textContent);
r.push(['sections in order: code word · what to say · help together · time and distance · check in · look after yourself',
  H.join('|')==='If you got a code word|What to say|Get help together|Time and distance|Check in now and then|Look after yourself']);
r.push(['what to say: ask directly; asking doesn\'t put the idea in their head; "I\'m here" is enough',
  text.includes('Ask directly: "Are you thinking about suicide?"') && text.includes("Asking doesn't put the idea in someone's head.") && text.includes('"I\'m here"')]);
r.push(['time and distance: no specifics', text.includes('Offer to hold onto things for a while') && !/gun|firearm|pill|medication|knife|rope|lock/i.test(text)]);
r.push(['footer: not an emergency service', g.querySelector('footer').textContent.trim()==='ZigZag Mind is a self-help support tool, not an emergency service.']);
const words=g.querySelector('main').textContent.trim().split(/\s+/).length;
r.push(['readable in 3 minutes (well under 600 words)', words<600, words]);
r.push(['same design tokens, light and dark', /--primary:#2F6F6A/.test(PAGE) && /prefers-color-scheme:dark/.test(PAGE) && /--safety:#B5562E/.test(PAGE)]);
r.push(['phone-friendly: viewport, one main heading', /name="viewport"/.test(PAGE) && g.querySelectorAll('h1').length===1]);
r.push(['no referrer sent when a supporter taps a link', /name="referrer" content="no-referrer"/.test(PAGE)]);

// ---- Share the supporter guide (My Plan) ----
function boot(nav){const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; if(nav) nav(w); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ')};}
{let shared=null; const a=boot(w=>{ w.navigator.share=d=>{ shared=d; return Promise.resolve(); }; });
 a.G('ACTIONS.loadSample(); getPlan().trustedPeople.push({name:"Sam",relationship:"sister",phone:"555-0199"})');
 a.click('[data-act="tab"][data-arg="plan"]');
 const btns=[...a.doc.querySelectorAll('[data-act="shareGuide"]')];
 r.push(['"Share the supporter guide" next to each trusted person', btns.length===2 && btns[0].getAttribute('aria-label')==='Share the supporter guide with Jordan']);
 btns[0].dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
 r.push(['share_link: shares the guide\'s address', !!shared && shared.url==='https://zigzagmind.com/support/']);
 r.push(['...and nothing else: no name, code word or plan content', !/Jordan|Sam|555|lighthouse/.test(JSON.stringify(shared))]);}
{let copied=null; const a=boot(w=>{ Object.defineProperty(w.navigator,'clipboard',{value:{writeText:t=>{ copied=t; return Promise.resolve(); }},configurable:true}); });
 a.G('ACTIONS.loadSample()'); a.click('[data-act="tab"][data-arg="plan"]'); a.click('[data-act="shareGuide"]');
 setTimeout(()=>{
   r.push(['no share sheet: copies the link instead', copied==='https://zigzagmind.com/support/' && a.T().includes('Link copied.')]);
   {const b=boot(); b.G('ACTIONS.loadSample(); ui.planFrom="no"; go("plan")');
    r.push(['not on the plan opened from a crisis screen', !b.doc.querySelector('[data-act="shareGuide"]')]);}
   console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
   process.exit(0);
 },20);}
