// SOCIAL ZIG: "Is this helping?" No shaming, no platforms, nothing read or stored; routes to existing steps.
// 6.29: the search word list (SEARCH_INDEX) is plain words people might type ("chatbot", "tiktok", "safe word"); it is left out of the wording guards below.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{};
   w.addEventListener('error',e=>errs.push(e.message)); w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();};
   w.copied=[]; Object.defineProperty(w.navigator,'clipboard',{value:{writeText:t=>{w.copied.push(t);return Promise.resolve();}}}); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)])));
 return {w,click,errs,dump,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const start=a=>{ a.click(act('techStart')); a.click(act('tcPick','scroll')); };
const r=[];
(async()=>{
{const a=boot(); a.click(act('techStart'));
 r.push(['entry: Tech check → "I\'ve been scrolling" (first)', a.doc.querySelector('[data-act="tcPick"]').dataset.arg==='scroll']);
 a.click(act('tcPick','scroll'));
 r.push(['1: "Before you keep scrolling: is this actually helping right now?" Yes · Not really · I don\'t know', a.S().screen==='sz' && a.T().includes('Before you keep scrolling: is this actually helping right now?') && ['yes','no','unsure'].every(k=>a.has(act('szAnswer',k)))]);
 r.push(['5: no platform is asked for', !/Instagram|TikTok|Facebook|Reddit|Snapchat|YouTube|\bX\b/.test(a.T())]);
 a.click(act('szAnswer','yes')); r.push(['18: Yes → "Okay. Enjoy it." and nothing else', a.S().screen==='sz-yes' && a.T().includes('Okay. Enjoy it.') && a.doc.querySelectorAll('.actions button').length===1]);}
{const a=boot(); a.G('getPlan().helps=["baseball cards","walking"]'); start(a); a.click(act('szAnswer','no'));
 r.push(['2/9: Not really → "Okay. Let\'s Zig." "You\'ve been looking at everyone else\'s life." "Want to look at something that\'s yours?"', a.S().screen==='sz-zig' && a.T().includes("Okay. Let's Zig.") && a.T().includes("You've been looking at everyone else's life.") && a.T().includes("Want to look at something that's yours?")]);
 const opts=[...a.doc.querySelectorAll('[data-act="szGo"]')].map(b=>b.dataset.arg);
 r.push(['the directions (at most 8): yours, find, warm, borrow, what\'s also true, talk, pick for me, put the phone down', JSON.stringify(opts)===JSON.stringify(["yours","find","warm","borrow","true","talk","pick","down"])]);
 a.click(act('szGo','yours')); a.click(act('yourThing','0'));
 r.push(['4/26: → the person\'s own things ("Baseball cards" · Go do your thing · I\'m heading out)', a.T().includes('Baseball cards') && a.T().includes('Go do your thing.')]);}
{const a=boot(); start(a); a.click(act('szAnswer','unsure'));
 r.push(['1: I don\'t know → "That\'s okay. Let\'s try something different for a few minutes."', a.T().includes("That's okay. Let's try something different for a few minutes.")]);
 r.push(['no "yours" option when the person has no own things yet', !a.has(act('szGo','yours'))]);
 a.click(act('szGo','find')); r.push(['5/10: → Find something', a.S().screen==='fs']);}
{const a=boot(); start(a); a.click(act('szAnswer','no')); a.click(act('szGo','warm')); r.push(['→ Make something warm', a.S().screen==='warm']);}
{const a=boot(); start(a); a.click(act('szAnswer','no')); a.click(act('szGo','borrow')); r.push(['3: → Borrow ten minutes', a.S().screen==='borrow']);}
{const a=boot(); start(a); a.click(act('szAnswer','no')); a.click(act('szGo','pick'));
 r.push(['19: "Pick something for me" uses the existing engine', a.S().screen==='recommendation' && !!a.G('ui.engine.interventionId') && a.G('ui.engine.interventionId')!=='social_zig']);}
{const a=boot(); start(a); a.click(act('szAnswer','no')); a.click(act('szGo','down'));
 r.push(['16/25: → "That\'s enough internet for a minute." "You can put the phone down now."', a.T().includes('That\'s enough internet for a minute.') && a.T().includes('You can put the phone down now.')]);}
{const a=boot(); start(a); a.click(act('szTool','check'));
 r.push(['7: "You already checked." "You don\'t have to check again right now." → Borrow ten minutes', a.T().includes('You already checked.') && a.T().includes("You don't have to check again right now.") && a.has(act('szGo','borrow'))]);}
{const a=boot(); start(a); a.click(act('szTool','compare'));
 r.push(['12: "Are you looking at someone else\'s life or your own?"', a.T().includes("Are you looking at someone else's life or your own?")]);
 a.click(act('szZig','side')); r.push(['...Someone else\'s → "Come back to your side." "What\'s something that\'s actually yours?"', a.T().includes('Come back to your side.') && a.T().includes("What's something that's actually yours?")]);}
{const a=boot(); start(a); a.click(act('szTool','mute'));
 r.push(['13: "What\'s one thing you don\'t need to see for the next hour?"', a.T().includes("What's one thing you don't need to see for the next hour?") && a.doc.querySelectorAll('[data-act="szMute"]').length===6]);
 a.click(act('szMute','0')); r.push(['...→ "You can mute or pause that in its own app." then what to do instead; never stored', a.T().includes('You can mute or pause that in its own app.') && a.T().includes('What do you want to do instead?') && !/News/.test(a.dump())]);}
{const a=boot(); start(a); a.click(act('szTool','send'));
 r.push(['8/14: "Want to send that right now, or borrow 10 minutes?" Send · Save for later · Don\'t send', a.T().includes('Want to send that right now, or borrow 10 minutes?') && ['send','later','dont'].every(k=>a.has(act('szSend',k)))]);
 a.click(act('szSend','send')); r.push(['...Send leaves the decision with the person ("Okay. It\'s your call.")', a.T().includes("Okay. It's your call.")]);}
{const a=boot(); start(a); a.click(act('szTool','send')); a.click(act('szSend','later'));
 a.doc.getElementById('szBox').value='I can\'t believe you said that'; a.click(act('szCopy')); await new Promise(r=>setTimeout(r,5));
 r.push(['...Save for later: copy only; never saved', a.w.copied.at(-1)==="I can't believe you said that" && !/believe/.test(a.dump())]);}
{const a=boot(); start(a); a.click(act('szTool','send')); a.click(act('szSend','later'));
 a.doc.getElementById('szBox').value='I want to kill myself'; a.click(act('szCopy'));
 r.push(['12 (safety): typed text goes through safetyCheck: RED → crisis', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);}
{const a=boot(); start(a); a.click(act('szTool','last'));
 r.push(['4: "What was the last thing you saw?" optional input', a.T().includes('What was the last thing you saw?') && a.has('#szLast')]);
 a.doc.getElementById('szLast').value='a post about my ex'; a.click(act('szLastNext'));
 r.push(['...→ "How did it leave you feeling?" Better · Worse · About the same · I don\'t know', a.T().includes('How did it leave you feeling?') && ['Better','Worse','About the same',"I don't know"].every(x=>a.T().includes(x))]);
 a.click(act('szZig','felt')); r.push(['...→ "Want to change the input?" with the directions', a.T().includes('Want to change the input?') && a.has(act('szGo','find'))]);
 r.push(['11: the words typed are not stored', !/my ex/.test(a.dump()) && !/my ex/.test(JSON.stringify(a.G('ui')))]);}
{const a=boot(); start(a); a.click(act('szTool','last')); a.doc.getElementById('szLast').value='i want to die'; a.click(act('szLastNext'));
 r.push(['...RED in the last-thing box → crisis', a.S().screen==='crisis']);}
{const a=boot(); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"YELLOW"})'); start(a); a.click(act('szAnswer','no')); a.click(act('szGo','pick'));
 r.push(['14: YELLOW: "Pick something for me" follows the YELLOW order (connection first)', a.G('ui.engine.interventionId')==='connection' && a.G('session.yellow')===true]);
 a.G('openCrisis()'); a.G('ACTIONS.szGo("find")'); r.push(['13: RED blocks every Social Zig action', a.S().screen==='crisis']);}
{const a=boot(); const copy=a.G('JSON.stringify(SZ)');
 r.push(['17: no shaming or diagnosis', !/wast|addict|should know|ruin|bad for you|stop being|too much time|compulsive|disorder/i.test(copy)]);
 r.push(['9/10/15: no platform access, no AI, no tracking', !/instagram|tiktok|facebook|graph\.|screen time|ScreenTime|openai|anthropic/i.test(HTML.replace(/const SEARCH_INDEX = \[[\s\S]*?\n\];/,'').replace(/\/\*[\s\S]*?\*\//g,'')) ]);
 r.push(['15: no streaks, points, badges or likes', !/streak|points|badge|likes/i.test(copy)]);
 r.push(['in the library as an array entry, never suggested outside Tech check', a.G('findIntervention("social_zig").states.length')===0]);}
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
})();
