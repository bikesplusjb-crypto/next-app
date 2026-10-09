// Join ZigZag Mind / Share (owner request, 2026-10-09): get the app, tell a friend (the phone's share sheet with the link
// and one line, or a text / Copy link), support it. No account.
// Never anything about the person; never on crisis screens; Home's first choice unchanged.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({share=true,phone=true}={}){ const errs=[], shared=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone; w.addEventListener('error',e=>errs.push(e.message));
    if(share) w.navigator.share=d=>{ shared.push(d); return Promise.resolve(); }; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  w.eval('getPlan().trustedPeople=[{name:"Jordan",phone:"555-0142",relationship:"friend"}]; getPlan().reasons=["My dog Biscuit"]; saveStore(); lastRendered=null; render()');
  return {w,click,errs,shared,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const r=[];
{const a=boot();
 r.push(['Home: "Share with a friend" at the bottom, under "Worried about someone?"', a.has('.share-row [data-act="joinOpen"]') && a.w.document.querySelector('.share-row [data-act="joinOpen"]').textContent==='Share with a friend' && a.w.document.querySelector('.share-row').previousElementSibling.querySelector('.worried-link')]);
 r.push(['Home: "I don\'t feel safe" is still the first choice', [...a.w.document.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
 a.click('.share-row [data-act="joinOpen"]');
 a.click('.join-friend [data-act="shareApp"]'); const d=a.shared[0]||{};
 r.push(['tap → the phone\'s share sheet with the title, one line and the link', a.shared.length===1 && d.title==='ZigZag Mind' && d.text===a.G('SHARE.text') && d.url==='https://zigzagmind.com/']);
 r.push(['shares nothing about the person (no names, numbers, plan) and no tracking codes', !/Jordan|5550142|555-0142|Biscuit/.test(JSON.stringify(d)) && !/[?#]/.test(d.url)]);
 r.push(['honest: says it\'s not therapy or an emergency service, and gives 988 for a crisis', /not therapy or an emergency service/.test(a.G('SHARE.text')) && /call or text 988/.test(a.G('SHARE.text'))]);
 r.push(['no promises it can\'t keep (no "private", "cure", "treat", "safe", "always")', !/private|cure|treat|diagnos|keeps? you safe|guarantee/i.test(a.G('SHARE.text')+a.G('JOIN.sub')+a.G('JOIN.appMeta'))]);
 r.push(['shows the exact message before sending', a.w.document.querySelector('.share-preview').textContent===a.G('SHARE.text')+' https://zigzagmind.com/' && a.w.document.getElementById('app').textContent.includes("This is exactly what they'll get:")]);
 r.push(['not called "Join" (there is nothing to join)', !/Join/.test(a.w.document.getElementById('app').textContent)]);
 a.G('ACTIONS.tab("settings")'); r.push(['Settings: "Share with a friend", with "Only this message and the link are shared. Nothing about you."', a.has('#app main [data-act="joinOpen"]') && a.w.document.getElementById('app').textContent.includes('Only this message and the link are shared. Nothing about you.')]);
 a.G('ACTIONS.about()'); r.push(['About: "Share with a friend"', a.has('#app main [data-act="joinOpen"]')]); }
{const a=boot({share:false}); a.G('ACTIONS.joinOpen()'); const l=a.w.document.querySelector('.join-friend a[href^="sms:"][data-kind="share"]');
 r.push(['phone without a share sheet: a text-message link with the line and the link (no Copy buttons on phones)', !!l && decodeURIComponent(l.getAttribute('href')).endsWith(a.G('SHARE.text')+' https://zigzagmind.com/') && !a.has('.join-friend [data-copy]')]); }
{const a=boot({share:false,phone:false}); a.G('ACTIONS.joinOpen()');
 const b=a.w.document.querySelector('.join-friend [data-copy]');
 r.push(['computer without a share sheet: a Copy message button with the line and the link', !!b && b.getAttribute('data-copy')===a.G('SHARE.text')+' https://zigzagmind.com/' && b.textContent.includes('Copy message')]);
 const before=a.G('store.sensitive.activity.length'); b.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['copying the link isn\'t logged as "reaching out"', a.G('store.sensitive.activity.length')===before]); }
{const a=boot(); let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(a.has('[data-act="shareApp"], [data-kind="share"], [data-act="joinOpen"], [data-act="installApp"]')) on=sc; }
 r.push(['never on crisis screens', !on]);
 a.G('session={...initialSession, screen:"home"}; ACTIONS.searchOpen()'); a.G('searchRun("tell a friend")');
 r.push(['search: "tell a friend" and "install" find Join', a.has('[data-act="searchGo"][data-arg="join"]') && a.G('searchMatch("install")[0].id')==='join']);
 r.push(['no network: sharing uses the phone, not a server', !/\bfetch\(|XMLHttpRequest|sendBeacon/.test(HTML.replace(/<!--[\s\S]*?-->/g,''))]);
 r.push(['no script errors', a.errs.length===0]); }
// ---- Join: get the app ----
{const a=boot(); a.G('ACTIONS.joinOpen()'); const t=a.w.document.getElementById('app').textContent;
 r.push(['title "Share with a friend", "No account and no sign-up." and the three parts', t.includes('Share with a friend') && t.includes('No account and no sign-up.') && a.has('.join-app') && a.has('.join-friend') && a.has('.join-support a.donate[href="https://ko-fi.com/zigzagmind"]')]);
 r.push(['Join: no install prompt yet (computer/other) → how to add it', a.has('.join-how') && !a.has('[data-act="installApp"]')]);
 let prompted=0; a.G('0'); a.w.__p=()=>{prompted++;}; a.w.eval('(()=>{ const e=new Event("beforeinstallprompt",{cancelable:true}); e.prompt=()=>window.__p(); e.userChoice=Promise.resolve({outcome:"accepted"}); window.dispatchEvent(e); })()');
 r.push(['Android/Chrome: the browser\'s prompt → "Add to my phone"', a.has('.join-app [data-act="installApp"]')]);
 a.click('[data-act="installApp"]'); r.push(['…tapping it opens the browser\'s install prompt (once)', prompted===1 && !a.has('[data-act="installApp"]')]); }
{const errs=[]; const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; Object.defineProperty(w.navigator,'userAgent',{value:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'}); w.addEventListener('error',e=>errs.push(e.message)); }}).window;
 w.HTMLElement.prototype.scrollIntoView=()=>{}; w.eval('prefs.onboarded=true; ACTIONS.joinOpen()');
 r.push(['iPhone: "On iPhone: tap Share, then Add to Home Screen."', w.document.getElementById('app').textContent.includes('On iPhone: tap Share, then Add to Home Screen.')]);
 w.eval('navigator.standalone=true; lastRendered=null; render()'); r.push(['already installed: "It\'s already on this phone."', w.document.getElementById('app').textContent.includes("It's already on this phone.")]); }
{const a=boot(); a.G('saveStore()'); const before=a.G('localStorage.getItem("next.v1.sensitive")+localStorage.getItem("next.v1.prefs")'); a.G('ACTIONS.joinOpen()');
 r.push(['Join collects and saves nothing (no account, no email)', a.G('localStorage.getItem("next.v1.sensitive")+localStorage.getItem("next.v1.prefs")')===before && !a.has('#app main input')]);
 const b=boot(); b.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"}); ACTIONS.joinOpen()'); r.push(['blockIfRed', b.S()==='crisis']);
 const c=boot(); c.G('ACTIONS.joinOpen()'); r.push(['Help visible on Join', c.has('header .help-pill[data-act="crisis"]')]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
