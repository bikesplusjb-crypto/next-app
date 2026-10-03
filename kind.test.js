// Anti-stigma note ("Getting help is a strength") and "Helping others", plus the optional "Do something kind" step.
// Texts live in one constant each; never on Home, crisis/Help screens or Calm; nothing kept about who was messaged.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; w.__opened=0; w.open=()=>{ w.__opened++; return null; }; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const A="Getting help is a strength, not a weakness. Seeing a psychiatrist, therapist or counselor is care for your mind, the same way you'd see a doctor for your body. It doesn't mean you're 'crazy', broken or weak. Lots of people get help at some point, and many feel better for it. If medication is suggested, that's a choice you make together with a professional, and it's okay either way.";
const A1="Getting help is a strength, not a weakness.";
const B="Helping someone else can help you too. Small acts of kindness can lift your mood and make you feel less alone. It doesn't have to be big: a kind text, a thank-you, checking on a friend. Only if you have the energy. Taking care of yourself comes first.";
const norm=t=>t.replace(/\s+/g,' ');

// ---- one constant each ----
{const a=boot();
 r.push(['Text A is word for word in one constant', a.G('HELP_IS_STRENGTH')===A && HTML.split(A).length===2]);
 r.push(['Text B is word for word in one constant', a.G('HELPING_OTHERS')===B && HTML.split(B).length===2]);}

// ---- where they appear ----
{const a=boot(); a.click(act('tab','settings')); a.click(act('about')); const t=a.T();
 r.push(['About: Text A in full', t.includes(norm(A))]);
 r.push(['About: Text B next to it', t.includes(norm(B)) && t.indexOf(norm(B))>t.indexOf(norm(A))]);}
{const a=boot(); a.click(act('tab','plan')); const t=a.T();
 r.push(['My Plan (professionals): first sentence + "Read more"', t.includes(A1+' Read more') && !t.includes('Seeing a psychiatrist') && !!a.doc.querySelector(act('readStrength'))]);
 a.click(act('readStrength'));
 r.push(['Read more → About, at the full text', a.S().screen==='about' && a.doc.activeElement && a.doc.activeElement.id==='strength']);}

// ---- where they never appear ----
const SHOWS=t=>t.includes(A1) || t.includes('Helping someone else') || /Something kind|Do something kind/.test(t);
{const a=boot(); const where=[];
 const check=(label,setup)=>{ a.G(`lastRendered=null; ui=freshUi(); ${setup}; render();`); if(SHOWS(a.T())) where.push(label); };
 check('Home','session={...initialSession, screen:"home"}');
 for(const s of ['crisis','crisis-full','crisis-no','safety-check']) check(s,`ACTIONS.loadSample(); session={...initialSession, safetyLevel:"RED", screen:${JSON.stringify(s)}}; ui.placesOpen=true; ui.talkOpen=true`);
 check('Help (Talk to someone)','session={...initialSession, yellow:true, screen:"talk"}');
 check('Calm','session={...initialSession, screen:"calm", currentState:"anxious"}');
 check('My Plan from a crisis screen','ACTIONS.loadSample(); session={...initialSession, safetyLevel:"YELLOW", screen:"plan"}; ui.planFrom="no"');
 r.push(['never on Home, crisis or Help screens, Calm, or the plan opened from a crisis screen', where.length===0, where.join()]);}
{const a=boot(); a.click('header .help-pill[data-act="crisis"]'); r.push(['Help pill → crisis screen has neither text', !SHOWS(a.T())]);}

// ---- Do something kind: I feel low only, never first or only ----
{const a=boot(); a.click(act('flow','low')); a.click(act('beforeSkip'));
 const cards=[...a.doc.querySelectorAll('#app .list .card')];
 r.push(['I feel low offers it as one tiny step, last, never first or only', cards.length>=4 && cards.at(-1).dataset.act==='kindStart' && cards[0].dataset.act!=='kindStart']);
 r.push(['framed as optional, not a duty', a.T().includes('Only if you have the energy.') && !/should|have to|must/i.test(cards.at(-1).textContent)]);}
{const a=boot(); r.push(['the engine never picks it (not in the library)', a.G('!findIntervention("kind_act") && INTERVENTION_LIBRARY.every(i=>!/kind/.test(i.id))')]);
 a.G('session.currentState="anxious"'); a.G('ACTIONS.kindStart()'); r.push(['outside I feel low it does nothing', a.S().screen!=='kind']);}

// ---- the flow ----
const low=()=>{ const a=boot(); a.G('ACTIONS.loadSample()'); a.click(act('flow','low')); a.click(act('beforeSkip')); a.click(act('kindStart')); return a; };
{const a=low();
 r.push(['start: kind text or something without my phone; Not right now', a.S().screen==='kind' && !!a.doc.querySelector(act('kindPhone')) && !!a.doc.querySelector(act('kindOffline')) && !!a.doc.querySelector(act('kindBack'))]);
 r.push(['Help one tap away', !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);
 a.click(act('kindPhone'));
 r.push(['choose_person: your trusted people', a.S().screen==='kind-person' && !!a.doc.querySelector(act('kindPerson','0')) && a.T().includes('Jordan')]);
 a.click(act('kindPerson','0'));
 const words=[...a.doc.querySelectorAll('[data-act="kindWord"]')].map(b=>b.textContent.trim());
 r.push(['choose_word: the four messages', words.join('|')==="Thinking of you|Thanks for being in my life|Hey, how are you doing lately?|Thank you for ___"]);
 a.click(act('kindWord','1')); a.click(act('kindWordNext'));
 const link=a.doc.querySelector('a.kind-open');
 r.push(['compose_sms: Messages prepared with that text', a.S().screen==='kind-send' && !!link && link.getAttribute('href')==='sms:5550142?&body='+encodeURIComponent('Thanks for being in my life')]);
 r.push(['compose_sms opens only on tap (a link, nothing opened by itself)', link.tagName==='A' && a.w.__opened===0 && a.w.location.href==='https://next.example/']);
 const acts=a.G('store.sensitive.activity.length'); link.addEventListener('click',e=>e.preventDefault()); link.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['the kind text is not counted', a.G('store.sensitive.activity.length')===acts]);
 a.click(act('kindDone'));
 r.push(['Done → the usual check-in', a.S().screen==='checkin']);
 a.click(act('ciHelped'));
 const o=a.S().sessionHistory.at(-1); const saved=JSON.parse(a.dump()['next.v1.sensitive']).history.at(-1);
 r.push(['outcome recorded with no person and no message', o.interventionId==='kind_act' && JSON.stringify(saved).indexOf('Jordan')===-1 && JSON.stringify(saved).indexOf('5550142')===-1 && !/body|message|person|to"/.test(JSON.stringify(saved))]);
 const all=Object.values(a.dump()).join('\n');
 r.push(['nothing stored about who was messaged or what was said', !all.includes('Thanks for being in my life') && !/kind(Person|Text|Word)/.test(all)]);
 r.push(['the person and text are cleared after', a.G('ui.kindPerson===null && ui.kindText===""')]);}
{const a=low(); a.click(act('kindPhone')); a.click(act('kindPerson','0')); a.click(act('kindWord','3'));
 r.push(['"Thank you for ___" asks for the rest', !!a.doc.getElementById('kindThanks')]);
 a.click(act('kindWordNext')); r.push(['...empty is a gentle nudge, not an error state', a.S().screen==='kind-word' && a.T().includes("Add what you're thankful for, or pick another message.")]);
 a.doc.getElementById('kindThanks').value='always picking up'; a.click(act('kindWordNext'));
 r.push(['...goes into the message', a.doc.querySelector('a.kind-open').getAttribute('href')==='sms:5550142?&body='+encodeURIComponent('Thank you for always picking up')]);}
{const a=low(); a.click(act('kindPhone')); a.click(act('kindPerson','0')); a.click(act('kindWord','3'));
 a.doc.getElementById('kindThanks').value='nothing, I want to die'; a.click(act('kindWordNext'));
 r.push(['free text goes through the safety check: RED → crisis screen', a.S().screen==='crisis' && a.S().safetyLevel==='RED' && !a.doc.querySelector('a.kind-open')]);
 a.G('ACTIONS.kindStart()'); r.push(['RED: the kind step cannot start', a.S().screen==='crisis']);}
{const a=low(); a.click(act('kindPhone')); a.click(act('kindPerson','0')); a.click(act('kindWord','3'));
 a.doc.getElementById('kindThanks').value='being there when I felt hopeless'; a.click(act('kindWordNext'));
 r.push(['YELLOW words: support bar on, and it continues', a.S().yellow===true && a.S().screen==='kind-send']);}
{const a=low(); a.click(act('kindOffline'));
 r.push(['no-phone list: hold a door, a compliment, a neighbor', a.S().screen==='kind-offline' && ['Hold a door for someone.','Give someone a compliment.','Help a neighbor with something small.'].every(x=>a.T().includes(x))]);
 r.push(['no ticking off or counting', !a.doc.querySelector('#app [aria-pressed]') && !/\d/.test(a.doc.querySelector('.kind-list').textContent)]);
 a.click(act('kindDone')); r.push(['...Done → check-in', a.S().screen==='checkin']);}
{const a=boot(); a.click(act('flow','low')); a.click(act('beforeSkip')); a.click(act('kindStart')); a.click(act('kindPhone'));
 r.push(['nobody in My Plan: offers the no-phone list instead', a.S().screen==='kind-person' && !!a.doc.querySelector(act('kindOffline'))]);}
{const a=low(); a.click(act('kindBack')); r.push(['Not right now → back to the tiny steps, nothing recorded', a.S().screen==='low-choose' && a.S().sessionHistory.length===0]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
