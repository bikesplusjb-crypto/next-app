// Stage 6.10: Check-in reminders. The supporter's phone builds an .ics file (RFC 5545) from the guide;
// the person's side shares a link with only a first name. Nothing sensitive in any URL.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const PAGE=fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const r=[];
function guide(url){ const dom=new JSDOM(PAGE,{url,runScripts:'dangerously',beforeParse(w){ if(!w.TextEncoder) w.TextEncoder=TextEncoder; }}); return dom.window; }

// ---- RFC 5545 checks ----
function validICS(ics){
  const errs=[];
  if(!ics.endsWith('\r\n')) errs.push('must end with CRLF');
  if(/[^\r]\n/.test(ics)) errs.push('bare LF');
  const raw=ics.split('\r\n').slice(0,-1);
  raw.forEach((l,i)=>{ if(Buffer.byteLength(l,'utf8')>75) errs.push('line '+i+' over 75 octets'); });
  const lines=[]; raw.forEach(l=>{ if(/^[ \t]/.test(l)) lines[lines.length-1]+=l.slice(1); else lines.push(l); });   // unfold
  if(lines[0]!=='BEGIN:VCALENDAR' || lines.at(-1)!=='END:VCALENDAR') errs.push('VCALENDAR wrapper');
  for(const p of ['VERSION:2.0','PRODID:']) if(!lines.some(l=>l.startsWith(p))) errs.push('missing '+p);
  const stack=[]; for(const l of lines){ if(l.startsWith('BEGIN:')) stack.push(l.slice(6)); else if(l.startsWith('END:')){ if(stack.pop()!==l.slice(4)) errs.push('unbalanced '+l); } }
  if(stack.length) errs.push('unclosed '+stack.join());
  if(lines.some(l=>!/^[A-Z-]+[;:]/.test(l))) errs.push('bad content line');
  const events=[]; let cur=null, inAlarm=false;
  for(const l of lines){
    if(l==='BEGIN:VEVENT') cur={}; else if(l==='END:VEVENT'){ events.push(cur); cur=null; }
    else if(l==='BEGIN:VALARM') inAlarm=true; else if(l==='END:VALARM') inAlarm=false;
    else if(cur && !inAlarm){ const k=l.split(/[;:]/)[0]; cur[k]=l.slice(l.indexOf(':')+1); }
  }
  events.forEach((e,i)=>{ for(const k of ['UID','DTSTAMP','DTSTART']) if(!e[k]) errs.push(`event ${i} missing ${k}`);
    if(!/^\d{8}T\d{6}Z$/.test(e.DTSTAMP||'')) errs.push(`event ${i} DTSTAMP not UTC`);
    if(!/^\d{8}T\d{6}$/.test(e.DTSTART||'')) errs.push(`event ${i} DTSTART`);
    if(/(^|[^\\])[;,]/.test(e.SUMMARY||'') || /(^|[^\\])[;,]/.test((e.DESCRIPTION||'').replace(/\\\\/g,''))) errs.push(`event ${i} unescaped text`); });
  if(new Set(events.map(e=>e.UID)).size!==events.length) errs.push('UIDs not unique');
  return {errs,events};
}
const day=s=>{ const m=s.match(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)/); return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]); };
const gap=(a,b)=>Math.round((day(b)-day(a))/86400000);

{const w=guide('https://zigzagmind.com/support/?for=Sam#checkins'); const Z=w.zzCheckins;
 const start=new w.Date(2026,0,30,9,0), stamp=new w.Date(Date.UTC(2026,0,30,14,0,0));
 const G=validICS(Z.build('gentle','Sam',start,stamp)), C=validICS(Z.build('close','Sam',start,stamp));
 r.push(['Gentle: a valid .ics (RFC 5545)', G.errs.length===0, G.errs.join('; ')]);
 r.push(['Close: a valid .ics (RFC 5545)', C.errs.length===0, C.errs.join('; ')]);
 r.push(['Gentle: 9 events (4 weekly, then 5 monthly)', G.events.length===9]);
 r.push(['Close: 10 events (every 3 days for 2 weeks, then 6 weekly)', C.events.length===10]);
 const gg=G.events.map(e=>e.DTSTART), cc=C.events.map(e=>e.DTSTART);
 r.push(['Gentle: weekly for 4 weeks', [0,1,2].every(i=>gap(gg[i],gg[i+1])===7) && gap('20260130T180000',gg[0])===7]);
 r.push(['Gentle: then monthly (month ends clamped: Feb 27 → Mar 27…)', gg.slice(4).map(d=>d.slice(0,8)).join()==='20260327,20260427,20260527,20260627,20260727']);
 r.push(['Close: every 3 days, then weekly; all within 8 weeks', [0,1,2].every(i=>gap(cc[i],cc[i+1])===3) && [4,5,6,7,8].every(i=>gap(cc[i],cc[i+1])===7) && gap('20260130T180000',cc[9])<=8*7]);
 r.push(['each event: "Check in on Sam" with the 3 message ideas', G.events.every(e=>e.SUMMARY==='Check in on Sam' && e.DESCRIPTION.includes('Thinking of you. No need to reply.') && e.DESCRIPTION.includes('Want to grab food this week?') && e.DESCRIPTION.includes("How's your week going?"))]);
 r.push(['reminders at 6pm local, with an alert', gg.every(d=>d.endsWith('T180000')) && /BEGIN:VALARM\r\nACTION:DISPLAY/.test(Z.build('gentle','Sam',start,stamp))]);
 r.push(['the page says who asked (from ?for=)', w.document.getElementById('askLine').textContent==='Sam would like you to check in now and then.' && !w.document.getElementById('askLine').hidden]);
 const long=validICS(Z.build('close','Ünïcødé-Name Ok',start,stamp));
 r.push(['long and non-ASCII names fold correctly', long.errs.length===0, long.errs.join('; ')]);}
{const w=guide('https://zigzagmind.com/support/'); const Z=w.zzCheckins; const ics=Z.build('gentle','',new w.Date(2026,5,1));
 r.push(['no name: still works ("Check in on your friend")', validICS(ics).errs.length===0 && /SUMMARY:Check in on your friend/.test(ics) && w.document.getElementById('askLine').hidden]);}

// ---- ?for= sanitized ----
{const w=guide('https://zigzagmind.com/support/'); const c=w.zzCheckins.cleanName;
 const cases=[['Sam','Sam'],['Mary-Jane','Mary-Jane'],['  José   Luis ','José Luis'],['<img src=x onerror=alert(1)>','img srcx onerroraler'],
   ['Sam;DROP','SamDROP'],['A'.repeat(40),'A'.repeat(20)],['Sam\nBEGIN:VEVENT','SamBEGINVEVENT'],['555-0142','-'],['😀',''],['',''],[null,'']];
 const bad=cases.filter(([i,o])=>c(i)!==o);
 r.push(['?for=: letters, spaces, hyphens only, 20 characters max', bad.length===0, JSON.stringify(bad.map(([i])=>[i,c(i)]))]);}
{const w=guide('https://zigzagmind.com/support/?for=%3Cscript%3Ealert(1)%3C%2Fscript%3E#checkins');
 r.push(['a hostile ?for= is shown as plain text, never as markup', !w.document.querySelector('#askLine script') && w.document.getElementById('askLine').textContent==='scriptalertscript would like you to check in now and then.']);}

// ---- the guide's buttons ----
{let made=null; const w=guide('https://zigzagmind.com/support/?for=Sam#checkins');
 w.URL.createObjectURL=b=>{ made=b; return 'blob:x'; }; w.URL.revokeObjectURL=()=>{}; w.HTMLAnchorElement.prototype.click=function(){ this.__clicked=this.download; };
 const btns=[...w.document.querySelectorAll('[data-plan]')].map(b=>b.dataset.plan);
 r.push(['Gentle and Close choices on the guide (#checkins)', btns.join()==='gentle,close' && !!w.document.getElementById('checkins')]);
 w.document.querySelector('[data-plan="close"]').click();
 r.push(['tapping one makes the calendar file on the phone (no network)', !!made && made.type.startsWith('text/calendar') && w.document.getElementById('made').textContent.startsWith('Close reminders are ready.')]);
 r.push(['the guide never stores anything', !/localStorage|sessionStorage|indexedDB|document\.cookie/.test(PAGE)]);}

// ---- the person's side (My Plan) ----
function boot(nav){const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; if(nav) nav(w); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,G:x=>w.eval(x),S:()=>w.eval('session'),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const ASK="Would you check in on me now and then? This sets up reminders on your phone. No need to say anything special.";
{let shared=null; const a=boot(w=>{ w.navigator.share=d=>{ shared=d; return Promise.resolve(); }; });
 a.G('ACTIONS.loadSample(); getPlan().trustedPeople[0].name="Jordan Lee"; getPlan().codeWord={personIndex:0,word:"lighthouse",setAt:1,phone:"5550142"}');
 a.click('[data-act="tab"][data-arg="plan"]');
 r.push(['My Plan → Set up with your people → Check-in reminders', a.T().includes('Check-in reminders') && !!a.doc.querySelector('[data-act="ciStart"]')]);
 a.click('[data-act="ciStart"]');
 r.push(['F1: first asks for MY first name (optional, saved in my plan)', a.S().screen==='ci-name' && !!a.doc.querySelector('label[for="ciNameBox"]') && a.T().includes('your friend')]);
 a.doc.getElementById('ciNameBox').value='Alex Rivera'; a.click('[data-act="ciName"]');
 r.push(['F1: saved in the plan', a.G('getPlan().myName')==='Alex Rivera' && JSON.parse(a.dump()['next.v1.sensitive']).plan.myName==='Alex Rivera']);
 a.click('[data-act="ciPerson"][data-arg="0"]');
 const link=a.doc.querySelector('a.ci-open'); const body=decodeURIComponent(link.getAttribute('href').split('body=')[1]);
 r.push(['F1: the message links with MY first name, not the supporter\'s', body===`${ASK} https://zigzagmind.com/support/?for=Alex#checkins`]);
 a.click('[data-act="ciShare"]');
 r.push(['share_link: the same link and ask', !!shared && shared.url==='https://zigzagmind.com/support/?for=Alex#checkins' && shared.text===ASK]);
 const all=body+' '+JSON.stringify(shared);
 r.push(['nothing sensitive in the link: no surname, supporter name, phone, code word or plan', !/Rivera|Jordan|Lee|555|0142|lighthouse|walking|Coffee/i.test(all.replace('sms:5550142',''))]);
 r.push(['nothing saved before "Yes, I sent it"', !a.G('getPlan().checkinCircle')]);
 a.click('[data-act="ciSaved"]');
 const c=a.G('getPlan().checkinCircle');
 r.push(['confirm → plan.checkinCircle = [{ personIndex, at }]', c.length===1 && c[0].personIndex===0 && typeof c[0].at==='number']);
 r.push(['My Plan shows who was asked', a.S().screen==='plan' && a.T().includes('Asked: Jordan Lee')]);
 a.click('[data-act="ciStart"]');
 r.push(['F1: the name is remembered next time', a.doc.getElementById('ciNameBox').value==='Alex Rivera']);
 a.click('[data-act="ciName"]'); a.click('[data-act="ciPerson"][data-arg="0"]'); a.click('[data-act="ciSaved"]');
 r.push(['asking the same person again doesn\'t duplicate them', a.G('getPlan().checkinCircle.length')===1]);
 a.G('ACTIONS.tab("settings")'); a.click('[data-act="askDelete"]'); a.click('[data-act="deleteAll"]');
 r.push(['Delete everything clears it', !a.G('getPlan().checkinCircle') && !Object.values(a.dump()).join('').includes('checkinCircle')]);}
{const a=boot(); a.G('ACTIONS.loadSample()'); a.click('[data-act="tab"][data-arg="plan"]'); a.click('[data-act="ciStart"]');
 a.doc.getElementById('ciNameBox').value='<b>Ann-Marie</b> 555'; a.click('[data-act="ciName"]'); a.click('[data-act="ciPerson"][data-arg="0"]');
 const href=a.doc.querySelector('a.ci-open').getAttribute('href');
 r.push(['the app sanitizes my name the same way before it goes in the link', decodeURIComponent(href).includes('?for=bAnn-Marieb#checkins')]);}
{const a=boot(); a.G('ACTIONS.loadSample()'); a.click('[data-act="tab"][data-arg="plan"]'); a.click('[data-act="ciStart"]'); a.click('[data-act="ciName"]'); a.click('[data-act="ciPerson"][data-arg="0"]');
 const href=decodeURIComponent(a.doc.querySelector('a.ci-open').getAttribute('href'));
 r.push(['F1: name left blank → no name in the link (reminders say "your friend")', href.includes('/support/#checkins') && !/for=/.test(href) && a.T().includes('your friend')]);}
{const a=boot(); a.click('[data-act="tab"][data-arg="plan"]'); a.click('[data-act="ciStart"]'); a.click('[data-act="ciName"]');
 r.push(['nobody in the plan: add someone first', !a.doc.querySelector('[data-act="ciPerson"]') && !!a.doc.querySelector('[data-act="planEdit"][data-arg="trustedPeople"]')]);}
r.push(['no reminders or notifications from ZigZag Mind itself', !/Notification\.|showNotification|PushManager/.test(HTML)]);

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
