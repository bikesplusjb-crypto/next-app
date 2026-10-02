// iPhone "Add to Home Screen" tip: iPhone Safari only, not when installed, Home only, dismissal kept in prefs.
const {JSDOM}=require('jsdom');
const fs=require('fs');
const HTML=fs.readFileSync(require('path').join(__dirname,'index.html'),'utf8');
const UA={
  iphoneSafari:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1',
  ipad:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  android:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  desktop:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
};
const TIP='Add ZigZag Mind to your home screen so your plan stays with you. Tap Share, then Add to Home Screen.';
function boot({ua=UA.iphoneSafari, standalone, displayStandalone=false, seed}={}){
  const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
    w.scrollTo=()=>{}; w.scrollBy=()=>{};
    if(seed) for(const [k,v] of Object.entries(seed)) w.localStorage.setItem(k,v);
    Object.defineProperty(w.navigator,'userAgent',{value:ua});
    if(standalone!==undefined) Object.defineProperty(w.navigator,'standalone',{value:standalone});
    w.matchMedia=q=>({matches:displayStandalone && q==='(display-mode: standalone)', addEventListener(){}, removeEventListener(){}});
  }});
  const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(String(w.eval('session.screen')).startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`)); // first-launch onboarding
  const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
  return {w,click,S:()=>w.eval('session'),tip:()=>w.document.getElementById('homeTip'),dump};
}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];

{const a=boot();
 r.push(['iPhone Safari: tip shows on Home', a.S().screen==='home' && !!a.tip()]);
 r.push(['tip text is exact', !!a.tip() && a.tip().textContent.replace(/\s+/g,' ').includes(TIP)]);
 r.push(['tip does not push out "I don\'t feel safe"', !!a.w.document.querySelector('.card.safety[data-act="crisis"]')]);
 // Never on crisis screens.
 const seen=[];
 a.click('.help-pill[data-act="crisis"]'); seen.push(a.S().screen+':'+!!a.tip());
 a.click(act('cYes')); seen.push(a.S().screen+':'+!!a.tip());
 a.click(act('cBack')); a.click('.help-pill[data-act="crisis"]'); a.click(act('cNo')); seen.push(a.S().screen+':'+!!a.tip());
 a.click(act('noPlan')); a.click(act('planDone')); seen.push(a.S().screen+':'+!!a.tip());
 r.push(['never on crisis screens', seen.join(',')==='crisis:false,crisis-full:false,crisis-no:false,safety-check:false']);
 a.click(act('safeYes'));
 r.push(['back on Home it shows again until dismissed', a.S().screen==='home' && !!a.tip()]);
 a.click(act('dismissHomeTip'));
 r.push(['Got it hides the tip', a.S().screen==='home' && !a.tip()]);
 const p=JSON.parse(a.dump()['next.v1.prefs']);
 r.push(['dismissal saved in prefs', p.prefs.homeTipDismissed===true]);
 r.push(['dismissal not in sensitive data', !String(a.dump()['next.v1.sensitive']||'').includes('homeTip')]);
 r.push(['no safety state in prefs', !/safetyLevel|YELLOW|RED|stillBad|highRating/.test(a.dump()['next.v1.prefs'])]);
 const b=boot({seed:a.dump()});
 r.push(['stays dismissed after reload', b.S().screen==='home' && !b.tip()]);
}
r.push(['not when opened from home screen (navigator.standalone)', !boot({standalone:true}).tip()]);
r.push(['not when display-mode is standalone', !boot({displayStandalone:true}).tip()]);
r.push(['not in Chrome on iPhone', !boot({ua:UA.iphoneChrome}).tip()]);
r.push(['not on iPad', !boot({ua:UA.ipad}).tip()]);
r.push(['not on Android', !boot({ua:UA.android}).tip()]);
r.push(['not on desktop Safari', !boot({ua:UA.desktop}).tip()]);
{const dom=new JSDOM(HTML,{url:'https://next.example/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; Object.defineProperty(w.navigator,'userAgent',{value:UA.iphoneSafari}); }});
 r.push(['not during first-launch onboarding', dom.window.eval('session.screen')==='ob-about' && !dom.window.document.getElementById('homeTip')]);}
{const a=boot(); a.click(act('tab','plan'));
 r.push(['not on other screens', a.S().screen==='plan' && !a.tip()]);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
