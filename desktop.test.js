// Desktop support: with no phone or SMS, "Text 988" → "Chat with 988 online", call buttons show the number,
// prepared texts show the message with Copy. Phone stays the priority; crisis flow and the safety-check rule unchanged.
const {JSDOM,ResourceLoader}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const SUPPORT=fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8');
function boot({phone,ua,touch}={}){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,...(ua?{resources:new ResourceLoader({userAgent:ua})}:{}),beforeParse(w){ w.scrollTo=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   if(typeof phone==='boolean') w.__zzPhone=phone;
   if(touch!==undefined) Object.defineProperty(w.navigator,'maxTouchPoints',{value:touch});
   w.copied=[]; Object.defineProperty(w.navigator,'clipboard',{value:{writeText:t=>{w.copied.push(t);return Promise.resolve();}}}); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s),all:s=>[...w.document.querySelectorAll(s)]};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const show=(a,s,extra='')=>a.G(`${extra} lastRendered=null; session={...session, screen:${JSON.stringify(s)}}; render()`);
const SAMPLE='ACTIONS.loadSample(); getPlan().codeWord={personIndex:0,word:"lighthouse",setAt:1,phone:"5550142"}; getPlan().professional={name:"Dr. Lee",phone:"555-0199"}; prefs.strength="bible"; ui.faithKey="hope";';
// every screen, rendered with sample data
function sweep(a, fn){ const out=[]; for(const s of a.G('Object.keys(SCREENS)')){ try{
  a.G(`ui=freshUi(); ${SAMPLE} ui.talkOpen=true; ui.placesOpen=true; ui.editSection=null; ui.songNow="heavier"; ui.song={mood:"heavy",lines:["a","b","c"],still:[]}; ui.songEnded=true; ui.kindPerson=0; ui.kindWord="kind"; ui.kindText="hi"; ui.cwWord="lighthouse"; ui.cwPerson=0; ui.ciPerson=0;`);
  show(a,s,`session.safetyLevel=${JSON.stringify(['crisis','crisis-full','crisis-no','safety-check'].includes(s)?'RED':'YELLOW')}; session.currentState="anxious"; session.currentInterventionId="walking";`);
  const x=fn(s); if(x) out.push(x); }catch(e){} } return out; }

// ---- detection: phone stays the priority ----
const UA={iphone:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  android:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
  ipadMac:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',
  win:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  mac:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  cros:'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  odd:'SomeBrowser/1.0'};
r.push(['iPhone and Android: phone', boot({ua:UA.iphone}).G('canPhone()')===true && boot({ua:UA.android}).G('canPhone()')===true]);
r.push(['an iPad that reports as a Mac (touch): phone', boot({ua:UA.ipadMac,touch:5}).G('canPhone()')===true]);
r.push(['Windows, Mac and Chromebook with no touch: desktop', boot({ua:UA.win,touch:0}).G('canPhone()')===false && boot({ua:UA.mac,touch:0}).G('canPhone()')===false && boot({ua:UA.cros,touch:0}).G('canPhone()')===false]);
r.push(['a touch laptop: phone (keep the phone links)', boot({ua:UA.win,touch:10}).G('canPhone()')===true]);
r.push(['unknown device: phone', boot({ua:UA.odd,touch:0}).G('canPhone()')===true]);

// ---- phone: unchanged ----
{const a=boot({phone:true});
 const sms=sweep(a,s=>a.has('a[href^="sms:"]')?s:null);
 r.push(['phone: Text links are still sms: links', sms.includes('crisis') && sms.includes('crisis-full') && sms.includes('connect') && sms.includes('plan-now')]);
 const copies=sweep(a,s=>a.has('[data-copy]')?s:null);
 r.push(['phone: no Copy buttons anywhere', copies.length===0, copies.join()]);
 const t988=sweep(a,s=>a.has('a[href="sms:988"]')?s:null);
 r.push(['phone: "Text 988" on the crisis screens', ['crisis','crisis-full','crisis-no','talk','plan-now'].every(s=>t988.includes(s))]);
 a.G(SAMPLE); show(a,'crisis-full');
 r.push(['phone: call buttons say "Call Jordan" (no number added)', a.all('a[href^="tel:5550142"]').every(x=>x.textContent.trim()==='Call Jordan')]);
 r.push(['phone: code word is an sms: link with the word', a.has(`a.codeword[href="sms:5550142?&body=lighthouse"]`)]);
 r.push(['phone: crisis-full keeps its chat button, now named "Chat with 988 online" everywhere (simplicity audit #1)', a.T().includes('Chat with 988 online') && !a.T().includes('Chat online with 988')]);}

// ---- desktop ----
{const a=boot({phone:false});
 const sms=sweep(a,s=>a.has('a[href^="sms:"]')?s:null);
 r.push(['desktop: no sms: links on any screen', sms.length===0, sms.join()]);
 const t988=sweep(a,s=>/Text 988/.test(a.T())?s:null);
 r.push(['desktop: no "Text 988" button anywhere', t988.length===0, t988.join()]);
 const chat=sweep(a,s=>a.all('a').filter(x=>x.textContent.trim()==='Chat with 988 online').length?s:null);
 r.push(['desktop: "Chat with 988 online" wherever "Text 988" was', ['crisis','crisis-full','crisis-no','talk','plan-now','plan','connect','ob-about','song-reflect'].every(s=>chat.includes(s)), chat.join()]);
 const badChat=sweep(a,s=>a.all('a').filter(x=>x.textContent.trim()==='Chat with 988 online' && (x.getAttribute('href')!=='https://988lifeline.org/chat'||x.target!=='_blank'||!/noopener/.test(x.rel))).length?s:null);
 r.push(['...linking to https://988lifeline.org/chat in a new tab', badChat.length===0, badChat.join()]);
 const noNum=sweep(a,s=>{ const bad=a.all('a[href^="tel:"]').filter(x=>{ const d=x.getAttribute('href').slice(4); return !x.textContent.replace(/\D/g,'').includes(d); }); return bad.length?s+': '+bad.map(x=>x.textContent.trim()).join('/'):null; });
 r.push(['desktop: every call button shows the number it dials', noNum.length===0, noNum.join(' | ')]);
 const dup=sweep(a,s=>a.all('a[href="https://988lifeline.org/chat"]').length>1&&['crisis-full','talk'].includes(s)?s:null);
 r.push(['desktop: no duplicate chat button on crisis-full or Talk', dup.length===0, dup.join()]);
 a.G(SAMPLE); show(a,'crisis-full');
 r.push(['desktop: "Call Jordan · 555-0142"', a.all('a[href="tel:5550142"]').some(x=>x.textContent.trim()==='Call Jordan · 555-0142')]);
 const cw=a.doc.querySelector('[data-copy="lighthouse"]');
 r.push(['desktop: code word shows the word with a Copy button', !!cw && cw.textContent==='Copy message' && a.T().includes('lighthouse') && a.T().includes('Send my code word to Jordan (555-0142) from your phone')]);
 const msg=a.doc.querySelector(`[data-copy="${"I'm having a really hard time. Can you call me?"}"]`);
 r.push(['desktop: trusted-person text shows the prepared message with Copy', !!msg && a.T().includes("I'm having a really hard time. Can you call me?")]);
 a.click('[data-copy="lighthouse"]');
 r.push(['Copy puts the message on the clipboard', a.w.copied.at(-1)==='lighthouse' && a.S().screen==='crisis-full']);
 show(a,'connect'); a.click(act('ideasToggle')); a.click(`[data-copy="${a.G('MESSAGE_IDEAS[0]')}"]`);
 r.push(['desktop: Connect message ideas copy too', a.w.copied.at(-1)===a.G('MESSAGE_IDEAS[0]') && a.T().includes('Tap one to copy it')]);
 show(a,'connect'); r.push(['desktop: Warm Line shows its number', a.T().includes('Call the Warm Line · 1-800-945-1355')]);
 r.push(['no console errors', a.errs.length===0, a.errs.join(';')]);}

{const a=boot({phone:false}); a.G(SAMPLE); a.G('session.currentState="low"; ACTIONS.kindStart()');
 a.G('ui.kindPerson=0; ui.kindWord="kind"; ui.kindText="Thank you"'); const before=a.G('store.sensitive.activity.length');
 const scr=a.G('Object.keys(SCREENS).find(k=>/kind/.test(k) && SCREENS[k]().body.includes("kind-open"))');
 if(scr){ show(a,scr); a.click('.kind-open'); }
 r.push(['desktop: copying a kind message is not logged as reaching out (same as the phone)', !!scr && a.G('store.sensitive.activity.length')===before && a.w.copied.length>0]);}

// ---- crisis flow and the safety-check rule: unchanged ----
for(const phone of [true,false]){ const m=phone?'phone':'desktop';
 const a=boot({phone}); a.G(SAMPLE); a.G('openCrisis()');
 r.push([`${m}: crisis screen keeps Yes / No / I'm not sure / That's not what I meant`, ['cYes','cNo','cNotSure','cBack'].every(x=>a.has(act(x))) && a.has('a[href="tel:988"]')]);
 a.click(act('cNo')); a.click(act('noTalk'));
 const contact=phone?'.panel a[data-noexit][href^="sms:"]':`.panel button[data-noexit][data-copy="I'm having a really hard time. Can you call me?"]`;
 r.push([`${m}: crisis-no Text is ${phone?'an sms: link':'a Copy button'} carrying the safety-check rule`, a.has(contact) && a.has('a[data-noexit][href^="tel:"]')]);
 a.click(contact);
 r.push([`${m}: tapping it sets "Do you feel safer?" in the same tap`, a.S().screen==='safety-check']);
 if(!phone) r.push(['desktop: ...and the message was copied first', a.w.copied.at(-1)==="I'm having a really hard time. Can you call me?"]);
 const b=boot({phone}); b.G(SAMPLE); b.G('openCrisis()'); b.click(act('cNo')); b.click(act('noPlan'));
 const n=b.all('[data-noexit]');
 r.push([`${m}: "I need my plan" from the NO branch: every call, text and 988 button carries the rule`, n.length>=5 && b.all('.pn a[href^="tel:"], .pn a[href^="sms:"], .pn [data-copy], a.btn-safety').every(x=>x.hasAttribute('data-noexit'))]);
 const chatNo=b.doc.querySelector('a[href="https://988lifeline.org/chat"].btn-safety');
 if(!phone) r.push(['desktop: there, "Chat with 988 online" also goes to the safety check', !!chatNo && chatNo.hasAttribute('data-noexit')]);
 if(!phone){ chatNo.dispatchEvent(new b.w.MouseEvent('click',{bubbles:true,cancelable:true})); r.push(['...in the same tap', b.S().screen==='safety-check']); }}

// ---- supporter guide ----
function bootSupport(phone){ const dom=new JSDOM(SUPPORT,{url:'https://zigzagmind.com/support/',runScripts:'dangerously',beforeParse(w){ w.__zzPhone=phone; }}); return dom.window.document; }
{const d=bootSupport(true), e=d.getElementById('text988'); r.push(['supporter guide, phone: Text 988 stays sms:988', e.getAttribute('href')==='sms:988' && e.textContent==='Text 988']);}
{const d=bootSupport(false), e=d.getElementById('text988'); r.push(['supporter guide, desktop: Chat with 988 online', e.getAttribute('href')==='https://988lifeline.org/chat' && e.textContent==='Chat with 988 online' && e.target==='_blank']);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
