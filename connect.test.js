// Stage 6.6: Connect (I just feel alone) and Human First.
// Warm line, your people with prepared messages, 988. Human First: at most once a visit, never saved.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
// North star pass: Calm, Connect and Change the scene keep some options one tap behind a toggle; tap it when the target isn't shown yet.
const MORE_TOGGLES='[data-act="calmMore"],[data-act="connMore"],[data-act="sceneFind"]';
function boot(storage){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{let el=w.document.querySelector(sel); if(!el){ const t=w.document.querySelector(MORE_TOGGLES); if(t){ t.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true})); el=w.document.querySelector(sel); } } if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(!storage) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const hrefs=a=>[...a.doc.querySelectorAll('#app a[href]')].map(x=>x.getAttribute('href'));
const r=[];

// ---- how you get there ----
{const a=boot(); a.click(act('route','connect')); r.push(['Home: Connect → Connect screen', a.S().screen==='connect' && a.doc.getElementById('screen-title').textContent==="You don't have to sit with this alone."]);
 r.push(['opening Connect counts as a hard moment', a.G('store.sensitive.activity.filter(x=>x.type==="moment").length')===1]);}
{const a=boot(); const b=[...a.doc.querySelectorAll('.sit')].find(x=>x.textContent==='I feel alone'); b.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true}));
 r.push(['Home: "I feel alone" → Connect screen', a.S().screen==='connect']);}
{const a=boot(); a.click(act('dontKnow')); a.click(act('route','connect')); r.push(['"I don\'t know" → Connect with someone → Connect screen', a.S().screen==='connect']);}
{const a=boot(); a.click(act('route','calm')); a.click(act('route','connect')); r.push(['Calm → "I\'d rather talk to someone" → Connect screen', a.S().screen==='connect']);}

// ---- the warm line ----
{const a=boot(); a.click(act('route','connect')); const t=a.T(); const call=[...a.doc.querySelectorAll('#app a')].find(x=>x.textContent.trim()==='Call the Warm Line');
 r.push(['warm line: Florida Warm Line, tel:18009451355', !!call && call.getAttribute('href')==='tel:18009451355' && t.includes('Florida Warm Line') && t.includes("Talk to someone who's been there")]);
 r.push(['warm line: hours and "not a crisis line" text', t.includes("Every day, 4pm–10pm Eastern. Not a crisis line. Just real people who've been through it.")]);
 const more=[...a.doc.querySelectorAll('#app a')].find(x=>x.textContent.trim()==='After 10pm or outside Florida: find a warmline near you');
 r.push(['after 10pm or outside Florida → findahelpline.com', !!more && more.getAttribute('href')==='https://findahelpline.com']);
 r.push(['number and hours live in one constant', (HTML.match(/18009451355/g)||[]).length===1 && (HTML.match(/4pm–10pm/g)||[]).length===1 && a.G('WARMLINE.tel')==='tel:18009451355']);
 r.push(['988 call and text under "If it gets heavier"', t.includes('If it gets heavier') && hrefs(a).includes('tel:988') && hrefs(a).includes('sms:988')]);
 a.click('[data-act="connMore"]'); { const t=a.T();
 r.push(['"Calm down with Zags while you wait" (6.18 A; no subtitle)', t.includes('Calm down with Zags while you wait') && !t.includes('Stay with Zags') && !t.includes('Until someone calls back') && !!a.doc.querySelector('[data-act="zags"][data-arg="connect"]')]); }
 r.push(['code word waits for 6.8', !/code word/i.test(t)]);
 r.push(['no emoji; Help in the top bar', !/\p{Extended_Pictographic}/u.test(t) && !!a.doc.querySelector('header .help-pill[data-act="crisis"]')]);}
for(const hour of [3,23]){
  const a=boot(); a.G(`Date.prototype.getHours=function(){return ${hour}}`); a.click(act('route','connect'));
  const call=[...a.doc.querySelectorAll('#app a')].find(x=>x.textContent.trim()==='Call the Warm Line');
  r.push([`warm line button is never disabled by clock (${hour}:00)`, !!call && call.getAttribute('href')==='tel:18009451355' && !call.hasAttribute('aria-disabled') && !call.hasAttribute('disabled')]);
}

// ---- your people and message ideas ----
const IDEAS=["Can't sleep, you up?","Rough night. Can you talk for 5 minutes?","Want to catch up this week?","Hey. Just saying hi.","Got a minute?"];   // last two: 6.18 E4
{const a=boot(); a.G('ACTIONS.loadSample()'); a.click(act('route','connect'));
 r.push(['message ideas are one tap behind "Don\'t know what to say?" (simplicity audit #5)', !a.doc.querySelector('a.idea') && !!a.doc.querySelector('[data-act="ideasToggle"][aria-expanded="false"]')]);
 a.click(act('ideasToggle')); const box=a.doc.getElementById('connPeople');
 r.push(['your person, with Text and Call', box.textContent.includes('Jordan') && box.textContent.includes('friend')
   && !!box.querySelector('a[href="sms:5550142"][aria-label="Text Jordan"]') && !!box.querySelector('a[href="tel:5550142"][aria-label="Call Jordan"]')]);
 const ideas=[...box.querySelectorAll('a.idea')];
 r.push(['five message ideas, in order (6.18 E4 added two)', ideas.map(x=>x.textContent).join('|')===IDEAS.join('|')]);
 r.push(['each idea prepares exactly that text message (sms: with the body)', ideas.every((x,i)=>x.getAttribute('href')==='sms:5550142?&body='+encodeURIComponent(IDEAS[i]))]);
 r.push(['prepare, never send: these are links that open Messages', ideas.every(x=>x.tagName==='A' && !x.dataset.act)]);}
{const a=boot(); a.G('ACTIONS.loadSample(); getPlan().trustedPeople.push({name:"Sam",relationship:"sister",phone:"555-0199"})'); a.click(act('route','connect'));
 r.push(['every trusted person gets Text and Call', !!a.doc.querySelector('a[href="tel:5550199"][aria-label="Call Sam"]') && !!a.doc.querySelector('a[href="sms:5550199"][aria-label="Text Sam"]')]);
 a.click(act('ideasToggle')); r.push(['with more than one person, the ideas say who they go to', a.T().includes("Don't know what to say to Jordan? Tap one:")]);}
{const a=boot(); a.click(act('route','connect'));
 r.push(['nobody in the plan yet: a way to add someone, no message ideas', !a.doc.querySelector('a.idea') && !!a.doc.querySelector(act('planFromConnect'))]);
 a.click(act('planFromConnect')); r.push(['...which opens My Plan', a.S().screen==='plan']);}
{const a=boot(); a.click(act('route','connect')); a.click('header .help-pill[data-act="crisis"]');
 r.push(['Help from Connect → crisis screen (RED)', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
 a.G('ACTIONS.route("connect")'); r.push(['RED: Connect cannot replace the crisis screen', a.S().screen==='crisis']);}

// ---- Human First ----
const atRec=a=>a.G('session.currentState="anxious"; runEngine(); go("recommendation")');
// 6.18 E3: "Something else" opens five directions; picking one is the new suggestion (and counts toward Human First).
const elseTap=x=>{ x.click(act('recElse')); x.click('[data-act="recDir"]'); };
const finishStep=(a,how)=>{ a.G('startIntervention("breathing"); go("checkin")'); a.click(act(how)); };
const HF="Would talking to a person help more than another answer?";
{const a=boot(); atRec(a); elseTap(a);
 r.push(['one "Something else" is not enough', a.S().screen==='recommendation']);
 elseTap(a);
 r.push(['two "Something else" taps → Human First', a.S().screen==='human-first' && a.doc.getElementById('screen-title').textContent===HF]);
 const labels=[...a.doc.querySelectorAll('.actions a, .actions button')].map(x=>x.textContent.trim());
 r.push(['Call someone · Text someone · Be around people · Someone else, or 988 · Not right now', labels.join('|')==='Call someone|Text someone|Be around people|Someone else, or 988|Not right now']);
 a.click(act('hfNotNow')); r.push(['Not right now → back to the suggestion', a.S().screen==='recommendation']);
 for(let i=0;i<4;i++) elseTap(a);
 finishStep(a,'ciSkip'); finishStep(a,'ciBad');
 r.push(['at most once a visit', a.S().screen==='recommendation' && a.S().humanFirstShown===true]);
 const all=JSON.stringify(a.dump());
 r.push(['never written to storage', !/humanFirst|elseTaps|unhelped/i.test(all) && !all.includes(HF)]);
 const b=boot(a.dump());
 r.push(['a new visit starts fresh (counts and the once-flag are not carried over)', b.S().humanFirstShown===false && b.S().elseTaps===0 && b.S().unhelpedCount===0]);
 atRec(b); elseTap(b); elseTap(b); r.push(['...so it can show once in the next visit', b.S().screen==='human-first']);}
{const a=boot(); a.G('ACTIONS.loadSample()'); a.click(act('route','calm')); a.click(act('calmPick','breathe'));
 let n=0; while(a.doc.querySelector(act('ivNext')) && n<6){ a.click(act('ivNext')); n++; } a.click(act('ivDone')); a.click(act('ciBad'));
 r.push(['one step without "That helped" is not enough', a.S().screen==='recommendation']);
 a.click(act('recTry')); n=0; while(a.doc.querySelector(act('ivNext')) && n<6){ a.click(act('ivNext')); n++; }
 if(a.doc.querySelector(act('ivDone'))) a.click(act('ivDone')); else a.G('go("checkin")');
 a.click(act('ciSkip'));
 r.push(['two finished steps without "That helped" → Human First', a.S().screen==='human-first']);
 r.push(['with a person in the plan: Call and Text open the phone for them', hrefs(a).includes('tel:5550142') && hrefs(a).includes('sms:5550142')]);}
{const a=boot(); finishStep(a,'ciHelped'); finishStep(a,'ciHelped'); finishStep(a,'ciHelped');
 r.push(['"That helped" never counts toward it', a.S().screen==='phone-down' && a.S().unhelpedCount===0]);}
{const a=boot(); a.G('session.currentState="distraction"; startIntervention("distraction_around_me")'); a.G('ACTIONS.gDone()'); a.click(act('gameChange','no'));
 a.G('startIntervention("distraction_color_hunt")'); a.G('ACTIONS.gDone()'); a.click(act('gameChange','no'));
 r.push(['two games answered "No" also count', a.S().screen==='human-first']);}
{const a=boot(); atRec(a); elseTap(a); elseTap(a);
 r.push(['nobody in the plan: Call someone → Connect', !!a.doc.querySelector('.actions [data-act="route"][data-arg="connect"]')]);
 a.click(act('hfPeople'));
 r.push(['Be around people → "Somewhere to go"', a.S().screen==='scene-places' && a.doc.getElementById('screen-title').textContent==='Somewhere to go']);}
{const a=boot(); atRec(a); elseTap(a); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); a.G('ACTIONS.recElse()');
 r.push(['never shown over a crisis (RED goes to the crisis screen)', a.S().screen==='crisis' && a.S().humanFirstShown===false]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
