// Stage 6.8: Code word. Set up on a good day (My Plan); on a hard day one tap sends just the word.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const cwLinks=a=>[...a.doc.querySelectorAll('a.codeword')];
// Set up with Jordan (sample plan), picking the first suggested word.
function setUp(a, own){
  a.G('ACTIONS.loadSample()'); a.click(act('tab','plan')); a.click(act('cwStart')); a.click(act('cwPerson','0'));
  if(own!==undefined){ a.click(act('cwOwn')); a.doc.getElementById('cwOwnBox').value=own; }
  a.click(act('cwNext'));
}

// ---- setup ----
{const a=boot(); a.G('ACTIONS.loadSample()'); a.click(act('tab','plan'));
 r.push(['My Plan → "Set up with your people" → Code word', !!a.doc.getElementById('setupPeople') && a.T().includes('Set up with your people') && !!a.doc.querySelector(act('cwStart'))]);
 a.click(act('cwStart'));
 r.push(['choose_person: your trusted people', a.S().screen==='cw-person' && !!a.doc.querySelector(act('cwPerson','0')) && a.T().includes('Jordan')]);
 a.click(act('cwPerson','0'));
 const opts=[...a.doc.querySelectorAll('[data-act="cwWord"]')].map(b=>b.dataset.arg);
 r.push(['choose_word: 3 neutral words from the fixed list, plus your own', opts.length===3 && new Set(opts).size===3 && opts.every(x=>a.G('CODE_WORDS').includes(x)) && !!a.doc.querySelector(act('cwOwn'))]);
 r.push(['every suggested word is neutral (passes the safety check)', a.G('CODE_WORDS.every(w=>safetyCheck(w)==="GREEN")')]);
 a.click(act('cwShuffle')); const opts2=[...a.doc.querySelectorAll('[data-act="cwWord"]')].map(b=>b.dataset.arg);
 r.push(['"Show other words" gives three new ones', opts2.length===3 && opts2.every(x=>!opts.includes(x))]);
 a.click(act('cwWord',opts2[1])); a.click(act('cwNext'));
 const link=a.doc.querySelector('a.cw-open'); const body=decodeURIComponent((link.getAttribute('href').split('body=')[1])||'');
 r.push(['compose_sms: the setup text includes the word and the guide link', a.S().screen==='cw-send' && body===`Hey Jordan, I'm making a plan for hard days. If I ever text you "${opts2[1]}", it means I'm struggling and need you to call me or come be with me. You don't have to fix anything. Here's a short guide: zigzagmind.com/support`]);
 r.push(['...to Jordan\'s number, opened only on tap', link.getAttribute('href').startsWith('sms:5550142?&body=') && link.tagName==='A']);
 r.push(['nothing saved before "Yes, I sent it"', !a.G('getPlan().codeWord')]);
 a.click(act('cwSaved'));
 const cw=a.G('getPlan().codeWord');
 r.push(['confirm → plan.codeWord = { personIndex, word, setAt }', cw.personIndex===0 && cw.word===opts2[1] && typeof cw.setAt==='number']);
 r.push(['saved with the plan on this phone', JSON.parse(a.dump()['next.v1.sensitive']).plan.codeWord.word===opts2[1]]);
 r.push(['My Plan shows it, with Change and Remove', a.S().screen==='plan' && a.T().includes(`${opts2[1]} · with Jordan`) && !!a.doc.querySelector(act('cwRemove'))]);}
{const a=boot(); setUp(a); a.click(act('cwCancel'));
 r.push(['"Not yet" saves nothing', a.S().screen==='plan' && !a.G('getPlan().codeWord')]);}
{const a=boot(); setUp(a,'  Purple   Umbrella '); a.click(act('cwSaved'));
 r.push(['your own word works', a.G('getPlan().codeWord.word')==='Purple Umbrella']);}
{const a=boot(); setUp(a,'suicide');
 r.push(['an alarming own word is refused (and no crisis is triggered from My Plan)', a.S().screen==='cw-word' && a.T().includes('sounds ordinary') && a.S().safetyLevel==='GREEN']);}
{const a=boot(); setUp(a,'');
 r.push(['an empty own word is a gentle nudge', a.S().screen==='cw-word' && a.T().includes('Type a word, or pick one above.')]);}
{const a=boot(); a.click(act('tab','plan')); a.click(act('cwStart'));
 r.push(['nobody in the plan yet: add someone first', !a.doc.querySelector(act('cwPerson','0')) && !!a.doc.querySelector(act('planEdit','trustedPeople'))]);}

// ---- once set: where the button appears ----
const withWord=()=>{ const a=boot(); setUp(a); a.click(act('cwSaved')); return a; };
const render=(a,setup)=>a.G(`lastRendered=null; ui=freshUi(); ${setup}; render();`);
{const a=withWord(); const word=a.G('getPlan().codeWord.word'); const want='sms:5550142?&body='+encodeURIComponent(word);
 const where={
   'YELLOW bar':'session={...initialSession, screen:"home", yellow:true, safetyLevel:"YELLOW"}',
   'crisis screen':'session={...initialSession, screen:"crisis", safetyLevel:"RED"}',
   'crisis-full':'session={...initialSession, screen:"crisis-full", safetyLevel:"RED"}',
   'crisis-no':'session={...initialSession, screen:"crisis-no", safetyLevel:"YELLOW", yellow:true}',
   'Talk to someone':'session={...initialSession, screen:"talk"}',
   'Connect':'session={...initialSession, screen:"connect"}'};
 const bad=[];
 for(const [k,setup] of Object.entries(where)){ render(a,setup); const l=cwLinks(a);
   if(!l.length || l.some(x=>x.getAttribute('href')!==want || x.textContent.trim()!=='Send my code word to Jordan')) bad.push(k); }
 r.push(['"Send my code word to Jordan" (word only) on the YELLOW bar, crisis, crisis-full, crisis-no, Talk, Connect', bad.length===0, bad.join()]);
 render(a,'session={...initialSession, screen:"home"}');
 r.push(['not on Home without the YELLOW bar', cwLinks(a).length===0]);}
{const a=withWord(); render(a,'session={...initialSession, screen:"crisis-no", safetyLevel:"YELLOW", yellow:true}');
 const l=cwLinks(a)[0];
 r.push(['crisis-no: the button is marked to go to the safety check', l.dataset.noexit==='1' && l.dataset.act==='noContact']);
 l.addEventListener('click',e=>e.preventDefault()); l.dispatchEvent(new a.w.MouseEvent('click',{bubbles:true,cancelable:true}));
 r.push(['crisis-no: tapping it sets the safety check in the same tap', a.S().screen==='safety-check']);}
{const a=boot(); a.G('ACTIONS.loadSample()');
 const bad=[];
 for(const [k,setup] of Object.entries({'YELLOW bar':'session={...initialSession, screen:"home", yellow:true, safetyLevel:"YELLOW"}','crisis':'session={...initialSession, screen:"crisis", safetyLevel:"RED"}',
   'crisis-full':'session={...initialSession, screen:"crisis-full", safetyLevel:"RED"}','crisis-no':'session={...initialSession, screen:"crisis-no", yellow:true, safetyLevel:"YELLOW"}','talk':'session={...initialSession, screen:"talk"}','connect':'session={...initialSession, screen:"connect"}'})){
   render(a,setup); if(cwLinks(a).length || /code word/i.test(a.T())) bad.push(k); }
 r.push(['buttons absent when no code word is set', bad.length===0, bad.join()]);}
{const a=withWord(); a.G('getPlan().trustedPeople.unshift({name:"Sam",relationship:"sister",phone:"555-0199"})'); render(a,'session={...initialSession, screen:"talk"}');
 r.push(['editing the list never sends it to the wrong person (matched by phone)', cwLinks(a)[0].getAttribute('href').startsWith('sms:5550142') && cwLinks(a)[0].textContent.includes('Jordan')]);
 a.G('getPlan().trustedPeople=getPlan().trustedPeople.filter(p=>p.name!=="Jordan")'); render(a,'session={...initialSession, screen:"talk"}');
 r.push(['if that person is removed, the button disappears', cwLinks(a).length===0]);}
{const a=withWord(); a.click(act('cwRemove'));
 r.push(['Remove code word', !a.G('getPlan().codeWord') && !JSON.parse(a.dump()['next.v1.sensitive']).plan.codeWord]);}
{const a=withWord(); a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything removes it', !a.G('getPlan().codeWord') && !Object.values(a.dump()).join('').includes('codeWord')]);}
r.push(['no "safe word" mode: nothing typed into the app opens a mode', !/safe ?word/i.test(HTML.replace(/This replaces the "safe word" idea[^.]*\./,''))]);

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
