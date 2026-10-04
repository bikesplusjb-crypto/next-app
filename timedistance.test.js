// Stage 6.11: Time and distance plan (replaces "Making my space safer"). The person's own words only;
// no examples or suggestions of means anywhere; plan fields are exempt from safetyCheck.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(storage){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const Q=["Things I'll keep away from myself during hard times","Who will hold them, or where they'll go","When I'll get them back"];
// Words that would suggest a means. None may appear in anything ZigZag Mind itself writes for this part.
const MEANS=/gun|firearm|weapon|ammo|pill|medic|tablet|prescription|dose|overdose|knife|knives|blade|razor|rope|cord|belt|poison|bleach|chemical|alcohol|drug|car key|keys|bridge|height|lethal/i;

{const a=boot(); a.click(act('tab','plan')); const panel=a.doc.getElementById('tdPanel');
 r.push(['"Making my space safer" is replaced by "My time and distance plan"', !!panel && a.T().includes('My time and distance plan') && !a.T().includes('Making my space safer')]);
 const qs=[...panel.querySelectorAll('.td-q')].map(x=>x.textContent);
 r.push(['three questions, in order', qs.join('|')===Q.join('|')]);
 r.push(['says it stays private', panel.textContent.includes('Private. Only on this phone.')]);
 r.push(['"Set up with your people" has a Time and distance row', !!a.doc.querySelector('#setupPeople [data-act="planEdit"][data-arg="timeDistance"]')]);
 a.click(act('planEdit','timeDistance'));
 const labels=[...a.doc.querySelectorAll('.td-label')].map(x=>x.textContent);
 r.push(['edit: three labelled fields', labels.join('|')===Q.join('|') && ['td0','td1','td2'].every(id=>!!a.doc.querySelector(`label[for="${id}"]`) && !!a.doc.getElementById(id))]);
 const screenText=a.T()+' '+a.doc.querySelectorAll('textarea')[0].getAttribute('placeholder');
 // 6.18 D6 (owner-approved, clinician review): the one gun-storage sentence is the only exception.
 const gun=a.G('GUN_LINE'); r.push(['no examples or suggestions of means on the edit screen (except the approved gun-storage line, 6.18 D6)', !MEANS.test(screenText.replace(gun,'')) && screenText.includes(gun), (screenText.replace(gun,'').match(MEANS)||[''])[0]]);
 a.doc.getElementById('td0').value='The things I wrote down'; a.doc.getElementById('td1').value='Jordan'; a.doc.getElementById('td2').value="after I've talked it over with Jordan";
 a.click(act('planSave'));
 const td=a.G('getPlan().timeDistance');
 r.push(['saves the three answers', td.keepAway==='The things I wrote down' && td.holder==='Jordan' && td.getBack==="after I've talked it over with Jordan"]);
 r.push(['shown in My Plan', a.T().includes('The things I wrote down') && a.T().includes("after I've talked it over with Jordan")]);
 r.push(['saved on this phone with the plan', JSON.parse(a.dump()['next.v1.sensitive']).plan.timeDistance.holder==='Jordan']);}
{const a=boot(); a.click(act('tab','plan')); a.click(act('planEdit','timeDistance'));
 a.doc.getElementById('td0').value='I want to die some days, so this matters'; a.click(act('planSave'));
 r.push(['plan fields are exempt from the safety check (no crisis screen)', a.S().screen==='plan' && a.S().safetyLevel==='GREEN' && a.G('getPlan().timeDistance.keepAway').startsWith('I want to die')]);}

// Migration
{const old={ 'next.v1.prefs':JSON.stringify({prefs:{onboarded:true},theme:'auto',persist:true}),
   'next.v1.sensitive':JSON.stringify({v:1,plan:{saferSpace:'Give my spare set to my sister',trustedPeople:[]},history:[],activity:[]}) };
 const a=boot(old);
 r.push(['old "safer space" text moves into the first field', a.G('getPlan().timeDistance.keepAway')==='Give my spare set to my sister' && a.G('getPlan().saferSpace')===undefined]);
 a.G('saveStore()');
 const saved=JSON.parse(a.dump()['next.v1.sensitive']).plan;
 r.push(['...and is saved in the new shape', saved.timeDistance.keepAway==='Give my spare set to my sister' && !('saferSpace' in saved)]);}
{const old={ 'next.v1.prefs':JSON.stringify({prefs:{onboarded:true},theme:'auto',persist:true}),
   'next.v1.sensitive':JSON.stringify({v:1,plan:{saferSpace:'old text',timeDistance:{keepAway:'new text'}},history:[],activity:[]}) };
 r.push(['never overwrites an answer already there', boot(old).G('getPlan().timeDistance.keepAway')==='new text']);}

// compose_sms: ask someone to hold onto things
{const a=boot(); a.G('ACTIONS.loadSample()'); a.click(act('tab','plan'));
 const ask=[...a.doc.querySelectorAll('#tdPanel a.sit')];
 r.push(['optional: "Ask Jordan" opens Messages with the prepared text', ask.length===1 && ask[0].textContent==='Ask Jordan'
   && ask[0].getAttribute('href')==='sms:5550142?&body='+encodeURIComponent("Would you be willing to hold onto a few things for me for a while? I'll explain when we talk.")]);
 r.push(['the prepared text names nothing', !MEANS.test(a.G('TD_ASK'))]);
 a.G('ui.planFrom="no"; go("plan")');
 r.push(['the plan opened from a crisis screen shows the plan, without the ask buttons', !!a.doc.getElementById('tdPanel') && !a.doc.querySelector('#tdPanel a.sit')]);}
r.push(['nothing ZigZag Mind writes for this part suggests a means', ![...boot().G('TD_FIELDS')].flat().some(x=>MEANS.test(x)) && !MEANS.test(boot().G('TD_ASK'))]);
{const a=boot(); a.click(act('tab','plan')); a.click(act('planEdit','timeDistance')); a.doc.getElementById('td0').value='x'; a.click(act('planSave'));
 a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything clears it', a.G('getPlan().timeDistance.keepAway')==='']);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
