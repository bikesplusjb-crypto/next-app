// Read aloud (owner request, 2026-10-09): off by default; a button at the top of each screen; the phone's own voice;
// stops on any tap and on a new screen; never on crisis screens; saves only the on/off setting.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({speech=true,storage}={}){ const errs=[], spoken=[], c={n:0};
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=true; w.addEventListener('error',e=>errs.push(e.message));
    if(speech){ w.speechSynthesis={speak(u){spoken.push(u)},cancel(){c.n++},getVoices(){return [{name:'Google US English',lang:'en-US',localService:false},{name:'Samantha',lang:'en-US',localService:true,default:true}]}}; w.SpeechSynthesisUtterance=function(t){this.text=t;}; }
    if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  return {w,click,errs,spoken,c,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
{const a=boot(); r.push(['off by default: no button', !a.has(act('readAloud'))]);
 a.G('ACTIONS.tab("settings")'); r.push(['Settings: "Read aloud" Off / On with an honest hint', a.has(act('readAloudSet','on')) && a.w.document.getElementById('app').textContent.includes("It uses your phone's own voice, and nothing is sent anywhere.")]);
 a.click(act('readAloudSet','on')); a.G('ACTIONS.home()');
 r.push(['on: a Read aloud button next to Help (Help stays)', a.has('header .top-right '+act('readAloud')) && a.has('header .help-pill[data-act="crisis"]')]);
 a.click(act('readAloud')); const u=a.spoken.at(-1)||{};
 r.push(['tap: reads the screen, then the choices', /It's okay not to be okay/.test(u.text) && /You can choose: .*I don't feel safe/.test(u.text)]);
 r.push(['uses a voice on the phone, never an online-only one', u.voice && u.voice.name==='Samantha']);
 const n=a.c.n; a.click(act('dontKnow')); r.push(['stops on any tap / new screen', a.c.n>n]);
 r.push(['the setting is remembered; nothing else is saved', JSON.parse(a.G('localStorage.getItem("next.v1.prefs")')).prefs.readAloud===true && !/okay not to be okay/.test(a.G('JSON.stringify(localStorage)'))]);
 let on=''; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(a.has(act('readAloud'))) on=sc; }
 r.push(['never on crisis screens (their structure is fixed)', !on]);
 a.G('session={...initialSession,screen:"settings"}; lastRendered=null; render()'); a.click(act('readAloudSet','off')); r.push(['off again: the button goes', !a.has(act('readAloud'))]); }
{const a=boot({speech:false}); a.G('ACTIONS.tab("settings")'); r.push(['phones without speech: no setting shown', !a.has(act('readAloudSet','on'))]);
 a.G('prefs.readAloud=true; ACTIONS.home()'); r.push(['…and no button', !a.has(act('readAloud'))]);
 r.push(['no script errors', a.errs.length===0]); }
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
