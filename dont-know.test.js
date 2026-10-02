// Stage 6.2: "I don't know what I need". One question, four options, and Get help now → crisis at once.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
function boot(){const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 click('[data-act="dontKnow"]');
 return {w,click,S:()=>w.eval('session'),doc:w.document};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];

{const a=boot(); const app=a.doc.getElementById('app'); const t=app.textContent.replace(/\s+/g,' ');
 r.push(['one screen, one question', a.S().screen==='dont-know' && a.doc.getElementById('screen-title').textContent==="That's okay. One question."
   && t.includes('Do you want to calm down, get distracted, connect with someone, or get out of where you are?')]);
 const opts=[...a.doc.querySelectorAll('.list .card[data-act="route"]')];
 r.push(['four large options', opts.length===4 && opts.map(b=>b.dataset.arg).join()==='calm,head,connect,scene']);
 r.push(['options read Calm down / Get distracted / Connect with someone / Get out of where I am',
   ['Calm down','Get distracted','Connect with someone','Get out of where I am'].every((x,i)=>opts[i] && opts[i].textContent.startsWith(x))]);
 r.push(['no emoji', !/\p{Extended_Pictographic}/u.test(t)]);
 r.push(['"Scared of what you might do? Get help now" is there', t.includes('Scared of what you might do? Get help now')]);
 r.push(['Help in the top bar, and a way back home', !!a.doc.querySelector('header .help-pill') && !!a.doc.querySelector('header [data-act="home"]')]);
 r.push(['the old six-option triage is gone', !t.includes('Which feels closest?') && !/data-act="triagePick"/.test(HTML)]);
}
// Each option routes like the matching Home escape route.
const pick=(arg,then)=>{ const a=boot(); a.click(act('route',arg)); if(then) then(a); return a.S(); };
let s;
s=pick('calm'); r.push(['Calm down → the Calm menu (6.3)', s.screen==='calm']);
s=pick('head',a=>a.click(act('beforeSkip'))); r.push(['Get distracted → games (6.4 later)', s.currentState==='distraction' && s.screen==='distraction-choose']);
s=pick('connect'); r.push(['Connect with someone → Talk to someone (6.6 later)', s.screen==='talk']);
s=pick('scene',a=>a.click(act('beforeSkip'))); r.push(['Get out of where I am → Fresh air (6.5 later)', s.screen==='intervention' && s.currentInterventionId==='environment_change']);
// Get help now: RED and the crisis screen immediately, no extra screen.
{const a=boot(); a.click(act('getHelpNow'));
 const hrefs=[...a.doc.querySelectorAll('#app a[href]')].map(x=>x.getAttribute('href'));
 r.push(['Get help now → RED crisis screen at once', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
 r.push(['...with Call and Text 988 and the danger question', hrefs.includes('tel:988') && hrefs.includes('sms:988') && a.doc.body.textContent.includes('Are you in danger of hurting yourself or someone else right now?')]);
 r.push(['...counted as a hard moment, like Help', a.w.eval('store.sensitive.activity.filter(x=>x.type==="moment").length')===1]);}
// YELLOW: the support bar shows here too.
{const a=boot(); a.click(act('getHelpNow')); a.click(act('cBack')); a.click(act('dontKnow'));
 r.push(['YELLOW bar shows on this screen', a.S().screen==='dont-know' && !!a.doc.querySelector('header .ybar')]);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
process.exit(0);
