// FIND SOMETHING: one photo mission; camera optional (file input), no AI, private, keep/discard, put the phone down.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
// North star pass: Calm, Connect and Change the scene keep some options one tap behind a toggle; tap it when the target isn't shown yet.
const MORE_TOGGLES='[data-act="calmMore"],[data-act="connMore"],[data-act="sceneFind"]';
function boot(storage){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   w.netCalls=0; w.fetch=()=>{w.netCalls++; return Promise.reject();};
   w.URL.createObjectURL=()=>'blob:local-preview'; w.URL.revokeObjectURL=()=>{ w.revoked=(w.revoked||0)+1; };
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.eval('shrinkPhoto = () => Promise.resolve("data:image/jpeg;base64,QUJD")');   // jsdom has no canvas: stand-in for the on-phone shrink
 const click=(sel)=>{let el=w.document.querySelector(sel); if(!el){ const t=w.document.querySelector(MORE_TOGGLES); if(t){ t.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true})); el=w.document.querySelector(sel); } } if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const takePhoto=()=>{ const i=w.document.getElementById('fsCam'); const f=new w.File(['x'],'p.jpg',{type:'image/jpeg'}); Object.defineProperty(i,'files',{value:[f],configurable:true}); i.dispatchEvent(new w.Event('change',{bubbles:true})); };
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,errs,takePhoto,dump,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const tick=()=>new Promise(r=>setTimeout(r,5));
const r=[];
(async()=>{
{const a=boot(); a.G('ACTIONS.route("scene")');
 r.push(['entry on Change the scene: behind "Find something" (north star)', !a.has(act('fsStart')) && a.has(act('sceneFind'))]);
 a.G('ACTIONS.sceneFind()');
 r.push(['entry on Change the scene: "Find something worth looking at"', a.has(act('fsStart'))]);
 a.click(act('fsStart'));
 r.push(['1: one mission at a time (never a list of missions)', a.S().screen==='fs' && a.doc.querySelectorAll('.step-big').length===1 && a.T().includes("Find something you walk past all the time but never really notice.") && !a.T().includes('Find something beautiful.')]);
 r.push(['"Let\'s Zig. Find something worth looking at."', a.T().includes("Let's Zig. Find something worth looking at.")]);
 r.push(['19: "Don\'t risk your safety for the photo."', a.T().includes("Don't risk your safety for the photo.")]);
 const cam=a.doc.getElementById('fsCam');
 r.push(['2: Start opens the phone camera (image input, rear camera), no in-page camera API', !!cam && cam.type==='file' && cam.accept==='image/*' && cam.getAttribute('capture')==='environment' && a.doc.querySelector('label[for="fsCam"]').textContent==='Start' && !/getUserMedia|mediaDevices/.test(HTML)]);
 a.click(act('fsAnother')); r.push(['26: Try another moves to the next mission, deterministically', a.T().includes('Find something that makes you smile.')]);
 for(let i=0;i<11;i++) a.click(act('fsAnother')); r.push(['26: ...and cycles through all ten, then on', a.T().includes('Find something with an interesting texture.')]);
 a.takePhoto();
 r.push(['4: taking a photo shows a local preview and "You found it."', a.S().screen==='fs-found' && a.T().includes('You found it.') && a.doc.querySelector('.fs-photo').getAttribute('src')==='blob:local-preview']);
 r.push(['8: Keep it · Try another · I\'m done; nothing kept yet', a.has(act('fsKeep')) && a.has(act('fsAnother')) && a.has(act('fsDone')) && !a.dump()['next.v1.noticed']]);
 r.push(['16: optional one-sentence caption', a.T().includes('Want to write one sentence about it? Optional.') && a.has('#fsCaption')]);
 a.doc.getElementById('fsCaption').value='I forgot how old this watch is.'; a.click(act('fsKeep')); await tick();
 const kept=JSON.parse(a.dump()['next.v1.noticed']||'[]');
 r.push(['7: Keep saves it on this phone (its own key), with the note', kept.length===1 && kept[0].caption==='I forgot how old this watch is.' && /^data:image\/jpeg/.test(kept[0].img) && kept[0].mission==='find_texture' && a.T().includes('Kept in Things I noticed.')]);
 r.push(['5/6: nothing sent anywhere; no image-analysis API', a.w.netCalls===0 && !/vision|openai|anthropic|rekognition|tensorflow|tfjs|faceapi|ml5|classif/i.test(HTML.replace(/No image analysis[^.]*\./g,''))]);
 r.push(['17: neutral words only (no praise)', !/great job|beautiful!|proud|amazing|well done/i.test(a.T())]);
 a.click(act('fsDone'));
 r.push(['9: "I\'m done" → "You can put the phone down now."', a.S().screen==='put-down-now' && a.T().includes('You can put the phone down now.')]);
 a.click(act('putDown')); r.push(['...→ Home', a.S().screen==='home']);
 a.G('ACTIONS.tab("plan")'); r.push(['Things I noticed in My Plan', a.T().includes('Things I noticed') && a.T().includes('1 kept on this phone')]);
 a.click(act('noticedOpen')); r.push(['the collection: photo, note, date; no likes, counts or streaks', a.S().screen==='noticed-list' && a.T().includes('I forgot how old this watch is.') && !/like|streak|points|badge|this week/i.test(a.T().replace('Only on this phone. Not a feed, not shared.',''))]);
 const id=a.G('noticed()[0].id'); a.click(act('noticedDel',id)); a.click(act('noticedDelYes',id));
 r.push(['each photo can be deleted', a.G('noticed().length')===0 && !a.dump()['next.v1.noticed']]);
 r.push(['no console errors', a.errs.length===0, a.errs.join(';')]);}
{const a=boot(); a.G('ACTIONS.fsStart()'); a.takePhoto(); a.click(act('fsDone'));
 r.push(['8: leaving without Keep saves nothing, and the preview is dropped', !a.dump()['next.v1.noticed'] && a.G('ui.fsPhoto')===null && a.w.revoked>=1]);}
{const a=boot(); a.G('ACTIONS.fsStart()'); a.click(act('fsNoCam'));
 r.push(['3/21/22: no camera → "No camera? That\'s okay." "Just find something and look at it for a moment."', a.T().includes("No camera? That's okay.") && a.T().includes('Just find something and look at it for a moment.') && a.has(act('fsFoundNoPhoto')) && a.has(act('fsElse'))]);
 a.click(act('fsFoundNoPhoto')); r.push(['...I found something → "You found it." without a photo', a.S().screen==='fs-found' && !a.has('.fs-photo') && !a.has(act('fsKeep'))]);
 a.G('ACTIONS.fsStart(); ACTIONS.fsNoCam()'); a.click(act('fsElse')); r.push(['...Try something else → the "I don\'t know what I need" chooser', a.S().screen==='dont-know']);}
{const a=boot(); a.G('ACTIONS.fsStart()'); a.takePhoto(); a.doc.getElementById('fsCaption').value='i want to die'; a.click(act('fsKeep')); await tick();
 r.push(['caption goes through safetyCheck: RED → crisis, nothing kept', a.S().screen==='crisis' && !a.dump()['next.v1.noticed'] && a.G('ui.fsPhoto')===null]);
 a.G('ACTIONS.fsStart()'); r.push(['RED blocks Find something', a.S().screen==='crisis']);}
{const a=boot(); a.G('ACTIONS.tab("settings")'); a.click(act('persist','off')); a.G('ACTIONS.fsStart()'); a.takePhoto(); a.click(act('fsKeep')); await tick();
 r.push(['saving off: a kept photo is only for this visit (nothing written)', !a.dump()['next.v1.noticed'] && a.G('noticed().length')===1]);}
{const a=boot(); a.G('ACTIONS.tab("settings")'); a.click(act('persist','off')); a.G('ACTIONS.fsStart()'); a.takePhoto(); a.click(act('fsKeep')); await tick();
 a.G('ACTIONS.tab("settings")'); a.click(act('persist','on'));
 r.push(['turning saving back on also saves photos kept while it was off', JSON.parse(a.dump()['next.v1.noticed']||'[]').length===1]);}
{const a=boot(); a.G('ACTIONS.fsStart()'); a.takePhoto(); a.click(act('fsKeep')); await tick();
 a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything removes kept photos', !a.dump()['next.v1.noticed'] && a.G('noticed().length')===0]);}
{const a=boot(); a.G('ACTIONS.fsStart()'); a.takePhoto(); a.click(act('fsKeep')); await tick();
 const ex=a.G('buildExport()'); r.push(['export lists what was kept but not the photo itself', ex.thingsINoticed.length===1 && !JSON.stringify(ex).includes('base64')]);
 const b=boot(a.dump()); r.push(['kept photos survive a reload', b.G('noticed().length')===1]);
 const bad=boot({'next.v1.prefs':JSON.stringify({prefs:{onboarded:true},theme:'auto',persist:true}),'next.v1.noticed':JSON.stringify([{id:"1",date:1,mission:"find_old",img:"javascript:alert(1)"},"x"])});
 r.push(['bad saved data is dropped', bad.G('noticed().length')===0]);}
// engine / Let's Zig
{const a=boot(); const lib=a.G('findIntervention("find_something")');
 r.push(['24: in INTERVENTION_LIBRARY (still an array), channel SENSE, real world', Array.isArray(a.G('INTERVENTION_LIBRARY')) && lib && lib.channel==='SENSE' && lib.realWorld===true]);
 const elig=a.G('INTERVENTION_LIBRARY.filter(i=>i.states.includes("anxious")).map(i=>i.id)');
 r.push(['10/27: a failed BODY step can Zig to it (eligible, different channel)', elig.includes('find_something') && a.G('interventionEngine({state:"anxious", zigFrom:"BODY", exclude:INTERVENTION_LIBRARY.filter(i=>i.id!=="find_something" && i.channel!=="BODY").map(i=>i.id)}).interventionId')==='find_something']);
 r.push(['13: YELLOW priority still wins over it', a.G('interventionEngine({state:"anxious", yellow:true, playbook:{helps:[]}}).interventionId')==='connection']);
 a.G('session.currentState="anxious"; startIntervention("find_something")'); r.push(['the engine opens the Find something screen', a.S().screen==='fs']);}
{const a=boot(); a.G('getPlan().helps=["baseball cards","walking"]');
 a.G('startIntervention("find_something",{yours:"Baseball cards"})');
 r.push(['11/14: connects to your things: "Find something from one of your things: Baseball cards."', a.T().includes('Find something from one of your things: Baseball cards.')]);}
r.push(['15: reduced motion: no animation added', !/@keyframes fs|\.fs-[a-z]+\{[^}]*animation/.test(HTML)]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
})();
