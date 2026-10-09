// Share ZigZag Mind (owner request, 2026-10-09): the phone's share sheet with the link and one line, or Copy link.
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
 r.push(['Home: "Share ZigZag Mind" at the bottom, next to "Worried about someone?"', a.has('.share-row [data-act="shareApp"]') && a.w.document.querySelector('.share-row').previousElementSibling.querySelector('.worried-link')]);
 r.push(['Home: "I don\'t feel safe" is still the first choice', [...a.w.document.querySelectorAll('#app main [data-act]')].find(e=>!['wordmark','zags'].includes(e.dataset.act)).dataset.act==='crisis']);
 a.click('.share-row [data-act="shareApp"]'); const d=a.shared[0]||{};
 r.push(['tap → the phone\'s share sheet with the title, one line and the link', a.shared.length===1 && d.title==='ZigZag Mind' && d.text===a.G('SHARE.text') && d.url==='https://zigzagmind.com/']);
 r.push(['shares nothing about the person (no names, numbers, plan) and no tracking codes', !/Jordan|5550142|555-0142|Biscuit/.test(JSON.stringify(d)) && !/[?#]/.test(d.url)]);
 r.push(['wording makes no clinical claim', !/therap|treat|cure|diagnos/i.test(a.G('SHARE.text'))]);
 a.G('ACTIONS.tab("settings")'); r.push(['Settings: the button, with "Shares the link only. Nothing about you."', a.has('#app main [data-act="shareApp"]') && a.w.document.getElementById('app').textContent.includes('Shares the link only. Nothing about you.')]);
 a.G('ACTIONS.about()'); r.push(['About: the button', a.has('#app main [data-act="shareApp"]')]); }
{const a=boot({share:false}); const l=a.w.document.querySelector('.share-row a[href^="sms:"][data-kind="share"]');
 r.push(['phone without a share sheet: a text-message link with the line and the link (no Copy buttons on phones)', !!l && decodeURIComponent(l.getAttribute('href')).endsWith(a.G('SHARE.text')+' https://zigzagmind.com/') && !a.has('.share-row [data-copy]')]); }
{const a=boot({share:false,phone:false});
 const b=a.w.document.querySelector('.share-row [data-copy]');
 r.push(['computer without a share sheet: a Copy link button with the line and the link', !!b && b.getAttribute('data-copy')===a.G('SHARE.text')+' https://zigzagmind.com/' && b.textContent.includes('Copy link')]);
 const before=a.G('store.sensitive.activity.length'); b.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['copying the link isn\'t logged as "reaching out"', a.G('store.sensitive.activity.length')===before]); }
{const a=boot(); let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(a.has('[data-act="shareApp"], [data-kind="share"]')) on=sc; }
 r.push(['never on crisis screens', !on]);
 a.G('session={...initialSession, screen:"home"}; ACTIONS.searchOpen()'); a.G('searchRun("tell a friend")');
 r.push(['search: "tell a friend" finds it', a.has('[data-act="searchGo"][data-arg="share"]')]);
 r.push(['no network: sharing uses the phone, not a server', !/\bfetch\(|XMLHttpRequest|sendBeacon/.test(HTML.replace(/<!--[\s\S]*?-->/g,''))]);
 r.push(['no script errors', a.errs.length===0]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
