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

// ---- B. Print my plan ----
{const a=boot(); a.G('ACTIONS.loadSample(); getPlan().codeWord={personIndex:0,word:"lighthouse",setAt:1,phone:"5550142"}; getPlan().reasons=["My niece","Fishing in May"]; getPlan().anchor="a smooth stone"; getPlan().timeDistance={keepAway:"the car keys",holder:"my brother",getBack:"after we talk"}; ACTIONS.tab("plan")');
 r.push(['B1: "Print my plan" in My Plan', a.has(act('printPlan')) && a.T().includes('Print my plan')]);
 const cb=a.doc.getElementById('printCode');
 r.push(['B2: "Include my code word" is off by default', !!cb && cb.checked===false && a.T().includes('Include my code word')]);
 a.click(act('printPlan'));
 const pv=a.doc.getElementById('printView'), t=pv.textContent.replace(/\s+/g,' ');
 r.push(['B1: calls window.print()', a.w.printed===1]);
 const P=a.G('getPlan()');
 r.push(['B2: the print view has the plan', [...P.warningSigns, ...P.helps.map(h=>a.G(`helpLabel(${JSON.stringify(h)})`)), 'a smooth stone', 'My niece', ...P.places, P.trustedPeople[0].name, P.trustedPeople[0].phone, 'the car keys', 'my brother', ...P.reminders].every(x=>t.includes(x))]);
 r.push(['B2: 988 and 911', t.includes('call or text 988') && t.includes('911 if someone is hurt or in danger')]);
 r.push(['B2: code word excluded unless ticked', !t.includes('lighthouse')]);
 cb.checked=true; a.click(act('printPlan'));
 r.push(['B2: ...and included when ticked', a.doc.getElementById('printView').textContent.includes('lighthouse')]);
 a.G('ACTIONS.tab("plan")'); r.push(['B2: the tick is never saved (off again next time)', a.doc.getElementById('printCode').checked===false && !/printCode/.test(JSON.stringify(a.w.localStorage))]);
 a.click(act('printPlan'));
 const card=a.doc.querySelector('#printView .wallet');
 r.push(['B3: wallet card: first person and number, 988, 911, first reason to stay', !!card && card.textContent.includes(P.trustedPeople[0].name) && card.textContent.includes(P.trustedPeople[0].phone) && card.textContent.includes('988 — call or text') && card.textContent.includes('911 if someone is hurt or in danger') && card.textContent.includes('My niece') && !card.textContent.includes('Fishing in May')]);
 r.push(['B3: about 3.4 × 2.1 inches with cut lines', /\.wallet\{width:3\.4in;height:2\.1in;border:1\.5pt dashed #000/.test(HTML) && a.has('#printView .cut')]);
 r.push(['B4: black on white, print-only', /@media print\{[\s\S]*#printView\{display:block !important;[^}]*color:#000;background:#fff\}/.test(HTML) && /#printView\{display:none\}/.test(HTML)]);
 r.push(['B: nothing is sent', a.w.netCalls===0]);
 a.w.dispatchEvent(new a.w.Event('afterprint'));
 r.push(['B: the print view is cleared after printing', a.doc.getElementById('printView').innerHTML===''] );}
{const a=boot(); a.G('getPlan().trustedPeople=[{name:"Sam",phone:"555-0100",relationship:""}]; ACTIONS.tab("plan")'); a.click(act('printPlan'));
 const pv=a.doc.getElementById('printView'), h=[...pv.querySelectorAll('h2')].map(x=>x.textContent);
 r.push(['B2: empty sections are skipped', JSON.stringify(h)===JSON.stringify(["My trusted people"]) && !pv.textContent.includes('Reasons to stay')]);
 r.push(['B3: no reason line on the card when there are none', pv.querySelectorAll('.wallet p').length===3]);}
{const a=boot(); a.G('ACTIONS.loadSample(); openCrisis(); ACTIONS.cNo(); ACTIONS.noPlan()');
 r.push(['B: no Print button on the plan opened from the crisis "No" path or "I need my plan"', !a.has(act('printPlan'))]);}

// ---- C. Privacy & terms ----
{const DOC=fs.readFileSync(path.join(__dirname,'docs','PRIVACY_DATA_FLOW.md'),'utf8');
 const a=boot(); a.G('ACTIONS.tab("settings")');
 r.push(['C1: linked from Settings', a.has(act('privacyOpen'))]);
 a.click(act('privacyOpen'));
 r.push(['C1: opens "Privacy & terms"', a.S().screen==='privacy' && a.doc.getElementById('screen-title').textContent==='Privacy & terms']);
 const page=a.all('.privacy-p').map(p=>p.textContent);
 const PP=a.G('PRIVACY_PAGE');
 r.push(['C2: every paragraph on the page comes from PRIVACY_PAGE', page.length===PP.length && page.every((t,i)=>t===PP[i][1])]);
 const missing=PP.filter(x=>x[2] && !DOC.includes(x[2])).map(x=>x[1].slice(0,40));
 r.push(['C2: every data claim cites a sentence that is in PRIVACY_DATA_FLOW.md', missing.length===0 && PP.filter(x=>x[2]).length>=6, missing.join(' | ')]);
 const text=page.join(' ');
 r.push(['C2: says it is stored only in this browser on this phone, and not encrypted', text.includes('only in this browser on this phone') && text.includes('not encrypted')]);
 r.push(['C2: "encrypted" only ever as "not encrypted"', !/(?<!not )encrypted/i.test(text)]);
 const unsupported=/\bsecure\b|anonymous|HIPAA|end-to-end|never logged|no logs|we never store|guarantee(?!d)|100%|cannot be read|completely private/i;
 r.push(['C2: no claims the privacy doc doesn\'t support (secure, anonymous, HIPAA, no logs…)', !unsupported.test(text), (text.match(unsupported)||[''])[0]]);
 r.push(['C2: nothing sent by the site; links go to those services', text.includes("ZigZag Mind doesn't send anything anywhere") && /988, opening Maps, or the donation page/.test(text)]);
 r.push(['C2: the web host receives standard request information', text.includes('the web host receives standard request information')]);
 r.push(['C2: export, turn off saving, delete everything', /export a copy of your data, turn off saving on this device[^.]*, or delete everything/.test(text)]);
 r.push(['C2: self-help, not therapy, medical care or an emergency service; adults 18+; no guarantee of outcomes', text.includes("A self-help tool for adults 18 and over. It is not therapy, medical care or an emergency service, and it can't promise any outcome.")]);
 r.push(['C2: donations voluntary, unlock nothing', text.includes("Donations are voluntary and don't unlock anything.")]);
 r.push(['C2: no contact line while CONTACT_EMAIL is empty', a.G('CONTACT_EMAIL')==='' && !a.has('.privacy-contact')]);
 r.push(['C3: the page itself does not say "draft"', !/draft/i.test(a.T())]);
 r.push(['C3: marked DRAFT — lawyer review required in CLINICIAN_REVIEW.md', /Privacy & terms page \(6\.19 C\): DRAFT — lawyer review required/.test(fs.readFileSync(path.join(__dirname,'docs','CLINICIAN_REVIEW.md'),'utf8'))]);
 a.click(act('privacyBack')); r.push(['C1: Back returns to Settings', a.S().screen==='settings']);
 a.G('ACTIONS.about()'); r.push(['C1: linked from About', a.has(act('privacyOpen'))]);
 const ob=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};}}).window;
 r.push(['C1: linked from the first onboarding screen\'s small print', ob.eval('session.screen')==='ob-about' && !!ob.document.querySelector('.ob-privacy [data-act="privacyOpen"]')]);
 const c=boot({pre:w=>{}}); c.G('lastRendered=null; session={...session,screen:"privacy"}; render()');
 const withMail=new JSDOM(HTML.replace('const CONTACT_EMAIL = "";','const CONTACT_EMAIL = "hello@example.org";'),{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};}}).window;
 withMail.eval('prefs.onboarded=true; lastRendered=null; session={...session,screen:"privacy"}; render()');
 const m=withMail.document.querySelector('.privacy-contact a');
 r.push(['C2: contact line appears when CONTACT_EMAIL is set', !!m && m.getAttribute('href')==='mailto:hello@example.org']);}

// ---- D. Crisis Text Line ----
function bootSrc(src,{phone}={}){ const w=new JSDOM(src,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{}; w.print=()=>{}; if(typeof phone==='boolean') w.__zzPhone=phone;}}).window; w.HTMLElement.prototype.scrollIntoView=()=>{}; w.eval('prefs.onboarded=true; ACTIONS.loadSample(); lastRendered=null; render()'); return w; }
const SCREENS_ALL=w=>w.eval('Object.keys(SCREENS)');
{const w=bootSrc(HTML);
 r.push(['D1: resource constant (Text HOME to 741741, 24/7, sms:741741?&body=HOME)', JSON.stringify(w.eval('CRISIS_TEXT_LINE'))===JSON.stringify({name:"Crisis Text Line",instruction:"Text HOME to 741741",hours:"24/7",sms:"sms:741741?&body=HOME",verified:false})]);
 const seen=[]; for(const s of SCREENS_ALL(w)){ try{ w.eval(`ui=freshUi(); ui.talkOpen=true; lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`); if(/741741|Crisis Text Line/.test(w.document.getElementById('app').innerHTML)) seen.push(s); }catch(e){} }
 r.push(['D2: hidden everywhere while verified:false', seen.length===0, seen.join()]);
 w.eval('ACTIONS.tab("plan"); ACTIONS.printPlan()'); r.push(['D2: not on the printed plan either', !/741741/.test(w.document.getElementById('printView').innerHTML)]);
 r.push(['D2: not on the supporter guide', !/741741/.test(SUPPORT)]);
 r.push(['D2: a row for the owner in CRISIS_RESOURCE_VERIFICATION.md', /Crisis Text Line \(6\.19 D\)[^\n]*OPEN: OWNER to confirm/.test(fs.readFileSync(path.join(__dirname,'docs','CRISIS_RESOURCE_VERIFICATION.md'),'utf8'))]);}
{const ON=HTML.replace('sms:"sms:741741?&body=HOME", verified:false }','sms:"sms:741741?&body=HOME", verified:true }');
 for(const phone of [true,false]){ const w=bootSrc(ON,{phone}); const m=phone?'phone':'computer';
  const check=s=>{ w.eval(`lastRendered=null; session={...session, screen:${JSON.stringify(s)}, safetyLevel:${s==='crisis-full'?'"RED"':'"GREEN"'}}; render()`);
    const l=w.document.querySelector('.ctl-line'), c=w.document.querySelector('a[href="tel:988"]');
    return !!l && l.textContent==="Rather text a stranger? Text HOME to 741741 (Crisis Text Line)." && !!(c.compareDocumentPosition(l)&4); };
  r.push([`D3 (${m}): when verified, one line below 988 on the full crisis screen and Connect`, check('crisis-full') && check('connect')]);
  w.eval('lastRendered=null; session={...session, screen:"crisis-full"}; render()');
  r.push([`D1 (${m}): ${phone?'an sms: link with HOME':'the instruction as text, no sms: link'}`, phone ? !!w.document.querySelector('.ctl-line a[href="sms:741741?&body=HOME"]') : !w.document.querySelector('.ctl-line a')]);
  r.push([`D3 (${m}): 988 stays first on the full crisis screen (911, then 988)`, [...w.document.querySelectorAll('.content a.btn')].slice(0,2).map(a=>a.getAttribute('href')).join()==='tel:911,tel:988']); }
 const w=bootSrc(ON); w.eval('ACTIONS.tab("plan"); ACTIONS.printPlan()'); r.push(['D3: on the printed plan when verified', w.document.getElementById('printView').textContent.includes('Text HOME to 741741')]);
 const {synced,ctlBlock}=require('./sync-support.js');
 r.push(['A4: supporter guide "Get help together" gets the line when verified', /id="ctl"[^\n]*Text HOME to 741741/.test(synced(ON)) && !/741741/.test(synced(HTML))]);
 r.push(['A4: supporter guide is in sync with the constant (npm run sync-support)', synced()===SUPPORT]);}

//@@NEXT@@
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
