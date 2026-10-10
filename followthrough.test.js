// Grief and money paths with follow-through (owner, 2026-10-10: "both, i want more follow through"). After a path:
// pick one next step → "Did you do it?" → I did it / Not yet (a smaller way in) / It didn't work out (another way).
// Nothing saved unless the person taps "Add this to My Plan". Outside resources hidden until verified.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({phone=true}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone; w.addEventListener('error',e=>errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext=()=>null; }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.addEventListener('click',e=>{ if(e.target.closest && e.target.closest('a[href]')) e.preventDefault(); });
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{ const o=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])); const sv=JSON.parse(o['next.v1.sensitive']||'{}'); delete sv.activity; delete sv.history; o['next.v1.sensitive']=sv; return JSON.stringify(o); };
  return {w,click,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),n:s=>w.document.querySelectorAll(s).length,S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const title=a=>a.w.document.getElementById('screen-title').textContent;
const toEnd=(a,id)=>{ a.G(`ACTIONS.pathStart(${JSON.stringify(id)})`); for(let k=0;k<12 && a.has(act('pathNext'));k++) a.click(act('pathNext')); };
const NEW=['suicideloss','babyloss','griefnot','afterdeath','debt','medbills','owemoney','joblost','regret','legal','lifechange','recovery'];
const r=[];
const FOLLOWED=boot().G('Object.keys(PATHS).filter(k=>PATHS[k].follow)');
r.push([`the seven new paths, plus Money and Getting to real care, end with a next step (${FOLLOWED.length})`, NEW.every(id=>FOLLOWED.includes(id)) && FOLLOWED.includes('money') && FOLLOWED.includes('care')]);
r.push(['round 5: follow-through on I slipped, Heartbreak, New parent, Caring for someone, Gambling, Burned out, New place, Health worry', ['slipped','heartbreak','newparent','caregiver','gambling','burnout','newplace','health'].every(id=>FOLLOWED.includes(id))]);
r.push(['never on "Not safe at home" (nothing saved on a phone someone else may check)', !FOLLOWED.includes('notsafe')]);
r.push(['every "When…, I\'ll…" line fits My Plan (120 characters)', boot().G('Object.values(PATHS).filter(P=>P.follow).every(P=>P.follow.when.length<=120 && P.follow.picks.every(x=>x.then && x.then.length<=120))')]);
// ---- hub ----
{const a=boot(); a.G('ACTIONS.moreHelp(); ACTIONS.moreHelpAll()'); const heads=[...a.w.document.querySelectorAll('#app .lbl')].map(e=>e.textContent);
 r.push(['hub: "Grief and loss" and "Money, work and legal" headings', heads.includes('Grief and loss') && heads.includes('Money, work and legal')]);
 r.push(['hub: every new path listed', NEW.every(id=>a.has(act('pathStart',id)))]);
 r.push(['hub: first screen still 7 paths + More', a.G('MORE_HELP.first.length')===7]); }
// ---- the loop, on every path that has one ----
for(const id of FOLLOWED){
  const a=boot(); a.G('saveStore()'); const before=a.dump(); toEnd(a,id);
  const P=a.G(`PATHS[${JSON.stringify(id)}]`), n=P.follow.picks.length;
  const choices=a.n('#app main button, #app main a.btn, #app .actions button');
  r.push([`${id}: the ending offers "Pick one next step" (${n} choices) with Put the phone down · Talk to someone`, a.has('.follow-pick') && a.n('.follow-pick '+act('pathPick'))===n && n<=3 && a.has(act('putDown')) && a.has(act('route','connect'))]);
  a.click(act('pathPick','0'));
  r.push([`${id}: the step opens, then "Did you do it?" with I did it · Not yet · It didn't work out`, title(a)===P.follow.picks[0].label && a.T().includes('Did you do it?') && a.has(act('pathDid','did')) && a.has(act('pathDid','notyet')) && a.has(act('pathDid','nope')) && a.has('.path-988 a[href="tel:988"]')]);
  a.click(act('pathDid','notyet'));
  r.push([`${id}: Not yet → a smaller way in, and still "Did you do it?"`, title(a)==="That's okay. Let's make it smaller." && a.T().includes('Ask someone to sit with you') && a.has(act('pathDid','did'))]);
  a.click(act('pathDid','did'));
  const others=[...a.w.document.querySelectorAll(act('pathPick'))].map(b=>b.dataset.arg);
  r.push([`${id}: I did it → "You did it" and the other steps (not the one just done)`, title(a)==="You did it. That took something." && others.length===n-1 && !others.includes('0') && a.has(act('putDown'))]);
  a.click(act('pathPick',others[0])); a.click(act('pathDid','nope'));
  const left=[...a.w.document.querySelectorAll(act('pathPick'))].map(b=>b.dataset.arg);
  r.push([`${id}: It didn't work out → another way in (no done steps) and 211`, title(a)==="That happens. It doesn't mean nothing will help." && !left.includes('0') && !left.includes(others[0]) && a.has('a[href="tel:211"]')]);
  r.push([`${id}: Help on every follow-through screen; no typing; nothing saved without a tap`, a.has('header .help-pill[data-act="crisis"]') && !a.has('#app main input, #app main textarea') && a.dump()===before]);
  r.push([`${id}: no script errors`, a.errs.length===0, a.errs.join('; ')]);
}
// ---- Add this to My Plan (only on a tap) ----
{const a=boot(); a.G('saveStore()'); toEnd(a,'debt'); a.click(act('pathPick','0'));
 r.push(['"Add this to My Plan" is offered, nothing saved yet', a.has(act('pathSave')) && a.G('getPlan().ifThen.length')===0]);
 a.click(act('pathSave'));
 const it=a.G('getPlan().ifThen'); const saved=JSON.parse(a.w.localStorage.getItem('next.v1.sensitive')||'{}');
 r.push(['tap → one "When this happens, I\'ll…" line, in our words, saved', it.length===1 && it[0].when==='bills pile up' && it[0].then==='call a nonprofit credit counselor' && saved.plan.ifThen.length===1]);
 r.push(['shown back: "Added to My Plan" and the line', a.T().includes('Added to My Plan') && a.T().includes("When bills pile up, I'll call a nonprofit credit counselor.") && !a.has(act('pathSave'))]);
 a.G('ACTIONS.pathSave()'); r.push(['tapping again doesn\'t duplicate it', a.G('getPlan().ifThen.length')===1]);
 a.G('ACTIONS.tab("plan")'); r.push(['it shows in My Plan', a.T().includes("When bills pile up, I'll call a nonprofit credit counselor.")]);
 const b=boot(); b.G('getPlan().ifThen=[{when:"a",then:"b"},{when:"c",then:"d"},{when:"e",then:"f"}]'); toEnd(b,'medbills'); b.click(act('pathPick','1')); b.click(act('pathSave'));
 r.push(['plan already has three: nothing replaced, an honest note', b.G('getPlan().ifThen.length')===3 && b.G('getPlan().ifThen[2].then')==='f' && b.T().includes('already has three')]);
 const c=boot(); toEnd(c,'babyloss'); c.click(act('pathPick','0')); c.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})');
 for(const x of ['pathPick','pathDid','pathSave','pathBack']) c.G(`ACTIONS.${x}("0")`);
 r.push(['blockIfRed on every follow-through action, and nothing saved from RED', c.S()==='crisis' && c.G('getPlan().ifThen.length')===0]);
 const d=boot(); toEnd(d,'care'); d.click(act('pathPick','2')); d.click(act('pathBack')); r.push(['"Pick a different step" goes back to the list', d.has('.follow-pick')]); }
// ---- outside resources ----
{const a=boot(); r.push(['new resources (AFSP, PSI, NFCC, CFPB, Social Security, FTC, CareerOneStop, legal aid) are all hidden until verified', ['afsp','psi','nfcc','cfpb','ssa','ftc','careeronestop','lsc'].every(k=>a.G(`MORE_RESOURCES.${k}.verified===false && !!MORE_RESOURCES.${k}.source`))]);
 let shown=''; for(const id of FOLLOWED){ toEnd(a,id); for(let k=0;k<3;k++){ a.G(`ACTIONS.pathPick("${k}")`); const h=a.w.document.getElementById('app').innerHTML;
   for(const [key,e] of Object.entries(a.G('MORE_RESOURCES'))) if((e.phone && h.includes('tel:'+e.phone)) || h.includes(e.url)) shown+=id+':'+key+' '; a.G('ACTIONS.pathBack()'); } }
 r.push(['unverified numbers and links never show, in steps or picks', shown==='', shown]);
 a.G('MORE_RESOURCES.psi.verified=true'); toEnd(a,'babyloss'); a.click(act('pathPick','0'));
 r.push(['once verified, it shows (PSI HelpLine on the pregnancy loss pick)', a.has('.path-res a[href="tel:18009444773"]')]); }
// ---- wording that matters ----
{const a=boot(); const t=id=>{ a.G(`ACTIONS.pathStart(${JSON.stringify(id)})`); let s=''; for(let k=0;k<12;k++){ s+=a.T()+' '; if(!a.has(act('pathNext'))) break; a.click(act('pathNext')); } return s; };
 r.push(['money paths: "If money worries ever make you think about not being here, call or text 988"', ['debt','medbills'].every(id=>t(id).includes('If money worries ever make you think about not being here'))]);
 r.push(['After a death: the scam warning (gift cards, wire, crypto; hang up and call the official number)', /gift cards, a wire transfer or crypto/.test(t('afterdeath')) && /Scammers read obituaries/.test(t('afterdeath'))]);
 r.push(['Someone says I owe money: "You don\'t have to pay right now" and if you already paid, call your bank', /You don't have to pay right now/.test(t('owemoney')) && /Call your bank/.test(t('owemoney'))]);
 r.push(['Early recovery: the warning about stopping some substances suddenly', /can be dangerous. Talk to a doctor about stopping safely/.test(t('recovery'))]);
 r.push(['Court or legal trouble: never ignore a court date; public defender; 211', /Never ignore a court date/.test(t('legal')) && /public defender/.test(t('legal'))]);
 r.push(['Lost my job: apply for unemployment soon; the 988 line', /Apply for unemployment/.test(t('joblost')) && /If losing your job ever makes you think about not being here/.test(t('joblost'))]);
 r.push(['I did something I regret: guilt vs shame, a real apology, no excuses', /You can work with guilt/.test(t('regret')) && /doesn't make excuses/.test(t('regret'))]);
 r.push(['Debt: a payday-loan pause', /payday or title loan/.test(t('debt'))]);
 r.push(['After a suicide loss: "not your fault" and their own safety (988)', /doesn't mean it was your fault/.test(t('suicideloss')) && /Look after your own safety too/.test(t('suicideloss'))]);
 r.push(['Pregnancy or baby loss: the medical warning (bleeding, fever, pain → doctor or 911)', /heavy bleeding, a fever, or severe pain/.test(t('babyloss'))]);
 r.push(['Grief others don\'t understand: "If it isn\'t easing" → Getting to real care', /Grief has no deadline/.test(t('griefnot'))]);
 const copy=JSON.stringify(a.G('PATHS'))+JSON.stringify(a.G('FOLLOW'));
 r.push(['no promises, streaks or pressure ("will get better", "streak", "you should have")', !/will get better|guarantee|streak|you should have|cure/i.test(copy)]); }
// ---- search and safety ----
{const a=boot(); for(const [q,id] of [['miscarriage','babyloss'],['stillborn','babyloss'],['took his own life','suicideloss'],['only a pet','griefnot'],['funeral home','afterdeath'],['debt collector','debt'],['medical bills','medbills'],['gift cards','owemoney'],['laid off','joblost'],['i feel guilty','regret'],['court date','legal'],['empty nest','lifechange'],['early recovery','recovery']])
   r.push([`search "${q}" → ${id} first`, a.G(`searchMatch(${JSON.stringify(q)})[0].id`)===id]);
 r.push(['"suicide" is never in the search index, title or words (the safety check sends it to the crisis screen)', a.G('SEARCH_INDEX.every(e=>![e.title,e.desc,...(e.words||[])].some(w=>/suicid/i.test(w)))')]);
 const b=boot(); b.G('ACTIONS.searchOpen()'); const q=b.w.document.getElementById('searchQ'); q.value='lost my brother to suicide'; q.form.dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));
 r.push(['search "lost my brother to suicide" → crisis screen (authoritative safety logic, unchanged)', b.S()==='crisis']);
 let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/pathPick|pathDid|pathSave|follow-pick/.test(a.w.document.getElementById('app').innerHTML)) on=sc; }
 r.push(['never on crisis screens', !on]); }
for(const [n,ok,d] of r) console.log((ok?'PASS':'FAIL')+' '+n+(ok||!d?'':' — '+d));
const f=r.filter(x=>!x[1]).length; console.log(`\n${r.length-f}/${r.length} passed`); process.exit(f?1:0);
