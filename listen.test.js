// Stage 6.7c: Zags listens. A big text box; Zags never replies to the content (no AI).
// Done and Keep both go through the safety check. Nothing is stored unless the person taps Keep; kept words are deletable in Settings.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump,
   bubble:()=>w.document.getElementById('screen-title').textContent};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const open=()=>{ const a=boot(); a.click(act('route','calm')); a.click(act('zags','calm')); a.click(act('listenStart')); return a; };
const write=(a,t)=>{ a.doc.getElementById('listenBox').value=t; a.click(act('listenDone')); };
const r=[];
const L=boot().G('ZAGS_LINES');
const SAID='My landlord yelled at me about the rent and my sister will not call me back';
const all=a=>Object.values(a.dump()).join('\n');

{const a=open();
 r.push(['Zags → "I need to get something out" → "I\'m listening. Go ahead."', a.S().screen==='listen' && a.bubble()===L.listen && a.S().currentInterventionId==='zags_listen']);
 r.push(['a large text box, labelled', !!a.doc.querySelector('textarea#listenBox') && !!a.doc.querySelector('label[for="listenBox"]')]);
 r.push(['says nothing is kept unless you choose; Help in the top bar', a.T().includes('Nothing you write is kept unless you choose.') && !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 write(a,SAID);
 r.push(['Done → one scripted acknowledgment + "I\'m not a person…"', a.bubble()===L.listenAck && a.T().includes(L.listenNotPerson)]);
 const zagsSays=a.bubble()+' '+a.doc.querySelector('.zsub').textContent;
 const words=SAID.toLowerCase().split(/\W+/).filter(x=>x.length>3);
 r.push(['the acknowledgment never quotes or reacts to what was written', words.every(x=>!zagsSays.toLowerCase().includes(x))]);
 const b=open(); write(b,'I had a great day at the beach with my dog');
 r.push(['...it is the same line whatever is written', b.bubble()===a.bubble()]);
 r.push(['the choices: keep listening, let it go, keep private, calm down, a real person', ['listenMore','listenLetGo','listenKeep','listenCalm'].every(x=>!!a.doc.querySelector(act(x))) && !!a.doc.querySelector('.actions [data-act="route"][data-arg="connect"]')
   && a.T().includes("I'm not done — keep listening") && a.T().includes('I want a real person')]);
 r.push(['nothing stored after Done', !all(a).includes('landlord')]);
 a.click(act('listenMore'));
 r.push(['"keep listening" → the box again, with what they wrote', a.G('ui.listen.phase')==='write' && a.doc.getElementById('listenBox').value===SAID]);}

// Let it go
{const a=open(); write(a,SAID); a.G('prefs.reduce=true'); a.click(act('listenLetGo'));
 r.push(['Let it go → deleted, "It\'s gone."', a.bubble()===L.listenGone && a.G('ui.listen.text')==='' && !a.T().includes('landlord') && !all(a).includes('landlord')]);
 r.push(['...still ends at a person, or Done → check-in', !!a.doc.querySelector('[data-act="route"][data-arg="connect"]')]);
 a.click(act('listenFinish')); r.push(['Done → the usual check-in', a.S().screen==='checkin']);}
{const a=open(); write(a,SAID); a.click(act('listenLetGo'));
 r.push(['Let it go: the words fade first (motion allowed)', a.doc.getElementById('listenSaid').classList.contains('fading') && a.G('ui.listen.text')==='']);}

// Keep it private
{const a=open(); write(a,SAID); a.click(act('listenKeep'));
 const saved=JSON.parse(a.dump()['next.v1.sensitive']);
 r.push(['Keep → saved on the device only (store.sensitive)', a.bubble()===L.listenKept && saved.kept.length===1 && saved.kept[0].text===SAID]);
 a.G('ACTIONS.tab("settings")');
 r.push(['Settings lists kept words with Delete', a.T().includes('Kept private') && a.T().includes('landlord') && !!a.doc.querySelector(act('keptDelete','0'))]);
 a.click(act('keptDelete','0'));
 r.push(['Delete removes them from the phone', !all(a).includes('landlord') && !a.T().includes('landlord')]);}
{const a=open(); write(a,SAID); a.click(act('listenKeep')); a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['"Delete everything" removes kept words too', !all(a).includes('landlord')]);}
{const a=open(); write(a,SAID); a.click(act('listenKeep')); a.G('ACTIONS.tab("settings")'); a.click(act('exportData'));
 r.push(['kept words are in Export my data', a.doc.getElementById('exportBox').value.includes('landlord')]);}

// Safety
{const a=open(); write(a,'nothing matters, I want to kill myself');
 r.push(['RED words on Done → crisis screen; nothing kept', a.S().screen==='crisis' && a.S().safetyLevel==='RED' && !all(a).includes('kill myself') && a.G('ui.listen.text')==='']);}
{const a=open(); write(a,SAID); a.G('ui.listen.text="I want to end it all"'); a.click(act('listenKeep'));
 r.push(['RED words on Keep → crisis screen; nothing kept', a.S().screen==='crisis' && !all(a).includes('end it all')]);}
{const a=open(); write(a,'I feel so hopeless about all of it');
 r.push(['YELLOW words: support bar on; Zags still doesn\'t comment', a.S().yellow===true && a.bubble()===L.listenAck]);}
{const a=open(); a.click(act('listenDone')); r.push(['empty Done: a gentle nudge, nothing else', a.G('ui.listen.phase')==='write' && a.T().includes('Write as much or as little as you like.')]);}
{const a=open(); write(a,SAID); a.click(act('listenCalm')); r.push(['"Help me calm down" → Calm (with Zags and Snuggle Zags)', a.S().screen==='calm' && !!a.doc.querySelector(act('snuggleStart','calm'))]);}
{const a=open(); write(a,SAID); a.click('.actions [data-act="route"][data-arg="connect"]'); r.push(['"I want a real person" → Connect', a.S().screen==='connect']);}
{const a=open(); a.click('header .help-pill[data-act="crisis"]'); a.G('ACTIONS.listenStart()');
 r.push(['RED: Zags listens cannot start', a.S().screen==='crisis']);}
r.push(['no reminders or counts in its lines', !/remind|times|again tomorrow|\d/.test([L.listen,L.listenAck,L.listenNotPerson,L.listenGone,L.listenKept].join(' '))]);

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
