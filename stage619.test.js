// Stage 6.19 (STAGE6-19-ADDENDUM.md): reach, trust and simplicity.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const SUPPORT=fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8');
function boot({phone,pre}={}){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   if(typeof phone==='boolean') w.__zzPhone=phone;
   w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();}; w.navigator.sendBeacon=()=>{w.netCalls++; return true;};
   w.printed=0; w.print=()=>{w.printed++;};
   if(pre) pre(w); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s),all:s=>[...w.document.querySelectorAll(s)]};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const show=(a,s,extra='')=>a.G(`${extra} lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);
const r=[];

// ---- A. Worried about someone? ----
{const a=boot(); const l=a.doc.querySelector('a.worried-link');
 r.push(['A1: Home link "Worried about someone? How to help →"', !!l && l.textContent==='Worried about someone? How to help →']);
 r.push(['A1: opens the supporter guide (support/#worried)', !!l && l.getAttribute('href')==='support/#worried']);
 r.push(['A1: below "I don\'t feel safe" (and below the main content)', !!l && !!(a.doc.querySelector('.home-safe').compareDocumentPosition(l)&4) && !!(a.doc.querySelector('.routes').compareDocumentPosition(l)&4)]);
 const g=new JSDOM(SUPPORT).window.document;
 const main=g.querySelector('main');
 r.push(['A3: guide starts with "Take it seriously, even if they seem fine. Listen more than you talk."', main.firstElementChild.textContent==='Take it seriously, even if they seem fine. Listen more than you talk.']);
 const wsec=g.getElementById('worried'), code=g.getElementById('h-code').closest('section');
 r.push(['A2: "Someone you care about is struggling." before the code-word section', !!wsec && wsec.querySelector('h2').textContent==='Someone you care about is struggling.' && !!(wsec.compareDocumentPosition(code)&4)]);
 r.push(['A2: the two lines and a link to "What to say"', wsec.textContent.includes("You don't need the right words. Being there and taking it seriously matters most.") && wsec.querySelector('a').getAttribute('href')==='#h-say' && !!g.getElementById('h-say')]);
 r.push(['A2: shown only to people who came this way (#worried)', /\.worried\{display:none\}/.test(SUPPORT) && /\.worried:target\{display:block\}/.test(SUPPORT)]);}

//@@NEXT@@
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
