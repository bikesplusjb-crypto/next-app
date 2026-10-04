// Stage 6.13: After the ER or hospital (30 days). A mode the person chooses, saved on the phone; never on crisis screens.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(storage,{now}={}){const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   if(!w.TextEncoder) w.TextEncoder=TextEncoder;
   if(now){ const real=w.Date; w.Date.now=()=>now; }
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump,has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const DAY=86400000;
// RFC 5545 checks (same as checkins.test.js)
function validICS(ics){
  const errs=[]; if(!ics.endsWith('\r\n')) errs.push('CRLF end'); if(/[^\r]\n/.test(ics)) errs.push('bare LF');
  const raw=ics.split('\r\n').slice(0,-1); raw.forEach((l,i)=>{ if(Buffer.byteLength(l,'utf8')>75) errs.push('long line '+i); });
  const lines=[]; raw.forEach(l=>{ if(/^[ \t]/.test(l)) lines[lines.length-1]+=l.slice(1); else lines.push(l); });
  if(lines[0]!=='BEGIN:VCALENDAR'||lines.at(-1)!=='END:VCALENDAR') errs.push('wrapper');
  const stack=[]; for(const l of lines){ if(l.startsWith('BEGIN:')) stack.push(l.slice(6)); else if(l.startsWith('END:')&&stack.pop()!==l.slice(4)) errs.push('unbalanced'); }
  const ev=[]; let cur=null,al=false; for(const l of lines){ if(l==='BEGIN:VEVENT') cur={}; else if(l==='END:VEVENT'){ev.push(cur);cur=null;} else if(l==='BEGIN:VALARM') al=true; else if(l==='END:VALARM') al=false; else if(cur&&!al){ cur[l.split(/[;:]/)[0]]=l.slice(l.indexOf(':')+1);} }
  ev.forEach((e,i)=>{ for(const k of ['UID','DTSTAMP','DTSTART']) if(!e[k]) errs.push(`ev ${i} ${k}`); if(!/^\d{8}T\d{6}Z$/.test(e.DTSTAMP||'')) errs.push('stamp'); });
  if(new Set(ev.map(e=>e.UID)).size!==ev.length) errs.push('uids');
  return {errs,ev};
}

// ---- entry and setup ----
{const a=boot();
 r.push(['Home has the "Just out of the ER" chip; nothing prompts it', a.has(act('afterStart')) && !a.has('.after-bar') && !a.T().includes('First 30 days')]);
 a.click(act('afterStart'));
 r.push(['setup: "When did you leave?" today / yesterday / a few days ago', a.S().screen==='after-setup' && a.doc.querySelectorAll('[data-act="afterLeft"]').length===3 && a.T().includes('When did you leave?')]);
 a.click(act('afterLeft','yesterday'));
 const ac=a.G('store.sensitive.afterCrisis'); const sod=a.G('startOfDay(Date.now())');
 r.push(['afterCrisis = { start, until: start + 30 days }', ac.start===sod-DAY && ac.until===ac.start+30*DAY]);
 r.push(['the checklist: "Welcome home. One small thing at a time." · all optional', a.S().screen==='after' && a.T().includes('Welcome home. One small thing at a time.') && a.T().includes('All optional. Any order.')
   && ["Tell one person you're home","Set up your code word","Add your follow-up appointment","Ask your people to check in","Daily reminders for 2 weeks"].every(x=>a.T().includes(x))]);
 r.push(['"No appointment yet? Ask the place you were seen to help schedule one."', a.T().includes('No appointment yet? Ask the place you were seen to help schedule one.')]);
 r.push(['includes the anti-stigma note', a.T().includes('Getting help is a strength, not a weakness.')]);
 r.push(['saved on the phone (a mode the person chose)', JSON.parse(a.dump()['next.v1.sensitive']).afterCrisis.until===ac.until]);
 // survives reload
 const b=boot(a.dump());
 r.push(['survives a reload: the calm bar is on Home', b.G('afterActive()') && b.has('.after-bar') && b.T().includes('First 30 days · support is close')]);
 r.push(['the bar has Call 988', b.has('.after-bar a[href="tel:988"]')]);
 r.push(['"I don\'t feel safe" stays first, above the bar', b.doc.querySelector('.home-safe').compareDocumentPosition(b.doc.querySelector('.after-bar'))===4]);
 b.click(act('afterOpen')); r.push(['tapping the bar opens the checklist', b.S().screen==='after']);
 b.click(act('afterToggle','tell')); r.push(['items tick on and off (optional, any order)', b.G('store.sensitive.afterCrisis.done.tell')===true]);
 b.click(act('afterToggle','tell')); r.push(['...and off again', b.G('store.sensitive.afterCrisis.done.tell')===false]);}
{const a=boot(); a.G('ACTIONS.loadSample(); getPlan().codeWord={personIndex:0,word:"lighthouse",setAt:1,phone:"5550142"}'); a.click(act('afterStart')); a.click(act('afterLeft','today'));
 r.push(['tell one person: a prepared text to them', a.has(`a[href="sms:5550142?&body=${encodeURIComponent("I'm home now. It would mean a lot to hear from you this week.")}"]`)]);
 r.push(['code word already set shows as done', a.has('[data-act="afterToggle"][data-arg="code"][aria-pressed="true"]')]);
 a.click(act('home')); r.push(['the bar carries the code word button', a.has('.after-bar a.codeword')]);}

// ---- never on crisis screens ----
{const a=boot(); a.click(act('afterStart')); a.click(act('afterLeft','today')); a.click(act('home'));
 const bad=[]; for(const s of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`lastRendered=null; ui=freshUi(); session={...initialSession, screen:${JSON.stringify(s)}, safetyLevel:"RED"}; render()`); if(a.has('.after-bar')||/First 30 days/.test(a.T())) bad.push(s); }
 r.push(['bar hidden on crisis screens', bad.length===0, bad.join()]);
 a.G('ACTIONS.afterStart()'); r.push(['RED: the mode cannot open over a crisis', a.S().screen==='crisis']);}

// ---- expiry ----
{const now=Date.UTC(2026,9,4,15,0,0);
 const store=JSON.stringify({v:1,plan:{},history:[],activity:[],afterCrisis:{start:now-31*DAY,until:now-DAY,done:{}}});
 const a=boot({'next.v1.prefs':JSON.stringify({prefs:{onboarded:true},theme:'auto',persist:true}),'next.v1.sensitive':store},{now});
 r.push(['expires at 30 days: no bar, a gentle note instead', !a.G('afterActive()') && !a.has('.after-bar') && a.T().includes('Your first 30 days are over.')]);
 r.push(['the note has no counting or celebration', !/congrat|you did it|well done|\d+ days|streak|!/i.test(a.doc.querySelector('.after-end').textContent.replace('30 days',''))]);
 a.click(act('afterEndOk')); r.push(['...and the mode ends', a.G('store.sensitive.afterCrisis')===null && !a.T().includes('Your first 30 days are over.')]);}
{const now=Date.UTC(2026,9,4,15,0,0);
 const store=JSON.stringify({v:1,plan:{},history:[],activity:[],afterCrisis:{start:now-29*DAY,until:now+DAY,done:{}}});
 const a=boot({'next.v1.prefs':JSON.stringify({prefs:{onboarded:true},theme:'auto',persist:true}),'next.v1.sensitive':store},{now});
 r.push(['day 29: still active', a.G('afterActive()') && a.has('.after-bar')]);
 a.G('ACTIONS.tab("settings")'); r.push(['Settings can end it early', a.has(act('afterEnd'))]);
 a.click(act('afterEnd')); r.push(['...ended', a.G('store.sensitive.afterCrisis')===null && !JSON.parse(a.dump()['next.v1.sensitive']).afterCrisis]);}
{const a=boot(); a.click(act('afterStart')); a.click(act('afterLeft','today')); a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything ends it too', a.G('store.sensitive.afterCrisis')===null]);}

// ---- calendar files ----
{const a=boot(); const stamp='new Date(Date.UTC(2026,9,4,12,0,0))';
 const appt=a.G(`icsBuild(afterApptEvents("2026-10-12","14:30"), ${stamp})`); const A=validICS(appt);
 r.push(['follow-up appointment: a valid .ics (RFC 5545)', A.errs.length===0, A.errs.join(';')]);
 r.push(['...one event on that date and time, with a reminder the day before', A.ev.length===1 && A.ev[0].DTSTART==='20261012T143000' && A.ev[0].SUMMARY==='Follow-up appointment' && /TRIGGER:-P1D/.test(appt)]);
 r.push(['...no date picked → nothing made', a.G('afterApptEvents("","")')===null]);
 const daily=a.G(`icsBuild(afterDailyEvents(new Date(2026,9,4,15,0).getTime()), ${stamp})`); const D=validICS(daily);
 r.push(['daily reminders: a valid .ics (RFC 5545)', D.errs.length===0, D.errs.join(';')]);
 const days=D.ev.map(e=>e.DTSTART);
 r.push(['...14 reminders, one a day from tomorrow, 10am', days.length===14 && days[0]==='20261005T100000' && days[13]==='20261018T100000' && days.every(x=>x.endsWith('T100000'))]);
 r.push(['...plain wording, no claims or counting', D.ev.every(e=>e.SUMMARY==='One small thing today') && !/day \d|\d+ of|you will feel/i.test(daily)]);}
{let made=null; const a=boot(); a.w.URL.createObjectURL=b=>{ made=b; return 'blob:x'; }; a.w.URL.revokeObjectURL=()=>{}; a.w.HTMLAnchorElement.prototype.click=function(){};
 a.click(act('afterStart')); a.click(act('afterLeft','today')); a.click(act('afterDaily'));
 r.push(['"Add daily reminders" makes the file on the phone and ticks the item', !!made && made.type.startsWith('text/calendar') && a.G('store.sensitive.afterCrisis.done.daily')===true]);
 a.click(act('afterAppt')); r.push(['appointment without a date asks for the date first', a.T().includes('Pick the date first.')]);}
r.push(['Help on both new screens', (()=>{ const a=boot(); return ['after-setup','after'].every(s=>{ a.G(`lastRendered=null; session={...initialSession, screen:${JSON.stringify(s)}}; render()`); return a.has('header .help-pill[data-act="crisis"]'); }); })()]);

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
