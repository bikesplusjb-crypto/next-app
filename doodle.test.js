// Stage 6.22: Doodle. A drawing canvas (pointer events, no libraries); SENSE + realWorld, eligible for Let's Zig;
// Keep saves a shrunk PNG to Things I noticed (same rules as photos); Let it go clears it; nothing analyzed or sent.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot({canvas=true, phone=true}={}){ const errs=[];
  const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.__zzPhone=phone; w.addEventListener('error',e=>errs.push(e.message));
    w.__calls=[];
    if(canvas){
      const ctx={ save(){}, restore(){}, beginPath(){ w.__calls.push('begin'); }, moveTo(){}, lineTo(){ w.__calls.push('line'); }, arc(){}, fill(){}, stroke(){ w.__calls.push('stroke'); },
        clearRect(){ w.__calls.push('clear'); }, fillRect(){}, drawImage(){ w.__calls.push('draw'); }, setTransform(){}, set globalCompositeOperation(v){ w.__calls.push('op:'+v); } };
      w.HTMLCanvasElement.prototype.getContext=function(){ return ctx; };
      w.HTMLCanvasElement.prototype.toDataURL=function(t){ w.__calls.push('png:'+this.width+'x'+this.height); return 'data:image/png;base64,iVBORw0KGgo='; };
    } else { w.HTMLCanvasElement.prototype.getContext=function(){ return null; }; }
    w.HTMLCanvasElement.prototype.setPointerCapture=function(){};
    w.HTMLCanvasElement.prototype.getBoundingClientRect=function(){ return {left:0,top:0,width:300,height:400,right:300,bottom:400}; };
  }}).window;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
  if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
  const ptr=(type,x,y,id=1)=>{ const c=w.document.getElementById('doodleCanvas'); const e=new w.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y}); Object.defineProperty(e,'pointerId',{value:id}); c.dispatchEvent(e); };
  const draw=(pts,id=1)=>{ ptr('pointerdown',...pts[0],id); for(const p of pts.slice(1)) ptr('pointermove',...p,id); ptr('pointerup',...pts[pts.length-1],id); };
  const T=()=>w.document.getElementById('app').textContent.replace(/\s+/g,' ');
  const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
  return {w,click,ptr,draw,T,dump,errs,G:x=>w.eval(x),has:s=>!!w.document.querySelector(s),S:()=>w.eval('session.screen')}; }
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];

// ---- entry, library, channel ----
{const a=boot(); const it=a.G('findIntervention("doodle")');
 r.push(['in the library: SENSE, realWorld, Let\'s Zig may pick it', !!it && it.channel==='SENSE' && it.realWorld===true && it.states.length>0]);
 a.G('session.screen="distract"; lastRendered=null; render()');
 r.push(['entry: Get out of my head → "Doodle"', a.has(act('doodleStart')) && a.T().includes('Doodle')]);
 r.push(['Get out of my head stays at 8 or fewer choices', a.w.document.querySelectorAll('#app main [data-act], #app main a[href]').length<=8]);
 a.click(act('doodleStart'));
 r.push(['opens the canvas, Help visible', a.S()==='doodle' && a.has('#doodleCanvas') && a.has('header .help-pill[data-act="crisis"]')]);
 r.push(['five calm colors plus dark ink', a.w.document.querySelectorAll(act('doodleColor')).length===6 && a.G('DOODLE.colors[5][0]')==='ink']);
 r.push(['two brush sizes, eraser, Undo, Clear', a.w.document.querySelectorAll(act('doodleSize')).length===2 && a.has(act('doodleErase')) && a.has(act('doodleUndo')) && a.has(act('doodleClear'))]);
 r.push(['canvas: touch-action none (drawing doesn\'t scroll)', /\.doodle-canvas\{[^}]*touch-action:none/.test(HTML)]);
 r.push(['no drawing libraries, no network', !/<script[^>]+src=/i.test(HTML) && !/\bfetch\(|XMLHttpRequest|sendBeacon/.test(HTML)]); }
{let found=false; const engineSaw=new Set();
 const a=boot();
 for(const st of ['anxious','spiraling','low','distraction']){ for(let k=0;k<30;k++){ a.G(`dispatch({type:"SET_CURRENT_STATE",state:${JSON.stringify(st)}}); ui.exclude=[]; ui.dirChannel="SENSE"; runEngine()`); const id=a.G('ui.engine && ui.engine.interventionId'); engineSaw.add(id); if(id==='doodle') found=true; a.G('dispatch({type:"ADD_PICK",id:ui.engine.interventionId}); ui.exclude=[]'); } }
 r.push(['eligible for Let\'s Zig: the engine can pick it (SENSE direction)', found || a.G('interventionEngine({state:"distraction",intensity:5,history:[],yellow:false,playbook:getPlan(),picks:[],interventionCount:1,exclude:INTERVENTION_LIBRARY.filter(i=>i.id!=="doodle").map(i=>i.id),zigFrom:null,recentHigh:false,hidden:[],channel:"SENSE"}).interventionId')==='doodle']); }

// ---- prompts ----
{const a=boot(); a.G('ACTIONS.doodleStart()');
 const seen=[a.w.document.getElementById('doodlePrompt').textContent];
 for(let i=0;i<5;i++){ a.click(act('doodleIdea')); seen.push(a.w.document.getElementById('doodlePrompt').textContent); }
 r.push(['prompts: one at a time, "Another idea" cycles all five', JSON.stringify(seen.slice(0,5))===JSON.stringify(["Scribble as hard as you want.","Draw today as weather.","Fill the page with one color.","Draw something that's still true.","Draw the view from where you're sitting."]) && seen[5]===seen[0]]); }

// ---- drawing, undo, clear, eraser ----
{const a=boot(); a.G('ACTIONS.doodleStart()');
 a.draw([[10,10],[50,60],[90,120]]);
 r.push(['pointer events draw a stroke (relative points)', a.G('ui.doodle.strokes.length')===1 && a.G('ui.doodle.strokes[0].points.length')===3 && a.G('ui.doodle.strokes[0].points[2][0]')===0.3 && a.w.__calls.includes('stroke')]);
 r.push(['Undo / Clear enabled once something is drawn', !a.w.document.querySelector(act('doodleUndo')).disabled]);
 a.click(act('doodleColor','2')); a.click(act('doodleSize','1')); a.draw([[100,100],[120,140]]);
 r.push(['color and size apply to the next stroke', a.G('ui.doodle.strokes[1].color')==='#A9A4D6' && a.G('ui.doodle.strokes[1].size')===14]);
 a.click(act('doodleErase')); a.draw([[100,100],[110,110]]);
 r.push(['eraser erases (destination-out)', a.G('ui.doodle.strokes[2].erase')===true && a.w.__calls.includes('op:destination-out')]);
 a.click(act('doodleUndo')); r.push(['Undo removes the last stroke', a.G('ui.doodle.strokes.length')===2]);
 a.click(act('doodleClear')); r.push(['Clear asks to confirm', a.T().includes('Clear the page?') && a.G('ui.doodle.strokes.length')===2]);
 a.click(act('doodleClearNo')); r.push(['Cancel keeps the drawing', a.G('ui.doodle.strokes.length')===2]);
 a.click(act('doodleClear')); a.click(act('doodleClearYes')); r.push(['confirmed Clear empties the page', a.G('ui.doodle.strokes.length')===0]);
 a.draw([[5,5]]); r.push(['a single tap makes a dot', a.G('ui.doodle.strokes.length')===1]);
 a.G('lastRendered=null; render()'); r.push(['strokes survive a re-render (redrawn)', a.G('ui.doodle.strokes.length')===1]); }
{const a=boot({canvas:false}); a.G('ACTIONS.doodleStart()'); a.draw([[10,10],[20,20]]); a.click(act('doodleDone'));
 r.push(['no canvas support: no crash, nothing to keep, Let it go still works', a.S()==='doodle-done' && !a.has(act('doodleKeep')) && a.has(act('doodleLetGo')) && a.errs.length===0]); }

// ---- Done → Keep ----
{const a=boot(); a.G('ACTIONS.doodleStart()'); a.draw([[10,10],[200,300]]); a.click(act('doodleDone'));
 r.push(['Done → Keep or Let it go, with a preview', a.S()==='doodle-done' && a.has('img.doodle-img') && a.has(act('doodleKeep')) && a.has(act('doodleLetGo'))]);
 r.push(['the PNG is shrunk (longest edge ≤ 640)', a.w.__calls.some(c=>/^png:/.test(c) && Math.max(...c.slice(4).split('x').map(Number))<=640)]);
 a.click(act('doodleKeep'));
 const n=JSON.parse(a.dump()['next.v1.noticed']||'[]');
 r.push(['Keep saves a PNG to Things I noticed', n.length===1 && n[0].mission==='doodle' && /^data:image\/png;base64,/.test(n[0].img)]);
 r.push(['then "That\'s enough. You can put the phone down."', a.S()==='doodle-end' && a.T().includes("That's enough. You can put the phone down.") && a.T().includes('Kept in Things I noticed.') && a.has(act('putDown'))]);
 r.push(['the drawing leaves memory', a.G('ui.doodle.strokes.length')===0 && a.G('ui.doodle.img')===null]);
 a.G('ACTIONS.noticedOpen()'); r.push(['Things I noticed shows it labeled "Doodle"', a.T().includes('Doodle') && a.has('img.fs-photo')]);
 r.push(['export lists it (no image data in the export)', (()=>{ const ex=JSON.stringify(a.G('buildExport()').thingsINoticed); return ex.includes('"doodle"') && !ex.includes('base64'); })()]);
 a.G('ACTIONS.deleteAll()'); r.push(['Delete everything removes it', !a.dump()['next.v1.noticed'] && a.G('noticed().length')===0]); }
{const a=boot(); a.G(`store.noticed=[{id:"1",date:1,mission:"doodle",img:"data:image/png;base64,iVBORw0KGgo="}]; saveNoticed()`);
 const st=a.dump(); const b=(()=>{ const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; for(const [k,v] of Object.entries(st)) w.localStorage.setItem(k,v); }}).window; return w; })();
 r.push(['a kept doodle (PNG) survives a reload', b.eval('noticed().length')===1 && b.eval('noticed()[0].mission')==='doodle']);
 const c=(()=>{ const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.localStorage.setItem('next.v1.noticed',JSON.stringify([{id:"2",date:1,mission:"find_beautiful",img:"data:image/png;base64,AAAA"}])); }}).window; return w; })();
 r.push(['PNG is accepted only for doodles (photos stay JPEG)', c.eval('noticed().length')===0]); }
// saving off, storage full, cap
{const a=boot(); a.G('ACTIONS.persist("off")'); a.G('ACTIONS.doodleStart()'); a.draw([[10,10],[20,20]]); a.click(act('doodleDone')); a.click(act('doodleKeep'));
 r.push(['saving off: kept for the visit only, never stored', a.G('noticed().length')===1 && !a.dump()['next.v1.noticed']]); }
{const a=boot(); a.G('Storage.prototype._s=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==="next.v1.noticed") throw new Error("full"); return this._s(k,v); }');
 a.G('ACTIONS.doodleStart()'); a.draw([[10,10],[20,20]]); a.click(act('doodleDone')); a.click(act('doodleKeep'));
 r.push(['storage full: says so and stays (nothing lost silently)', a.S()==='doodle-done' && a.T().includes("Couldn't keep it: this phone's browser storage is full.") && a.has(act('doodleKeep')) && a.G('noticed().length')===0]); }
{const a=boot(); a.G(`store.noticed=Array.from({length:20},(_,i)=>({id:"p"+i,date:i,mission:"find_old",img:"data:image/jpeg;base64,AA"})); saveNoticed()`);
 a.G('ACTIONS.doodleStart()'); a.draw([[1,1],[2,2]]); a.click(act('doodleDone')); a.click(act('doodleKeep'));
 r.push(['same cap as photos (20)', a.G('noticed().length')===20 && a.G('noticed()[0].mission')==='doodle']); }

// ---- Let it go ----
{const a=boot(); const before=JSON.stringify(a.dump()); a.G('ACTIONS.doodleStart()'); a.draw([[10,10],[20,20]]); a.click(act('doodleDone')); a.click(act('doodleLetGo'));
 r.push(['Let it go: "Some things are just for now." then the ending, nothing saved', a.S()==='doodle-end' && a.T().includes('Some things are just for now.') && a.T().includes("That's enough. You can put the phone down.") && JSON.stringify(a.dump())===before && a.G('ui.doodle.strokes.length')===0]); }
{const a=boot(); a.G('ACTIONS.doodleStart()'); a.draw([[10,10],[20,20]]); a.G('ACTIONS.home()');
 r.push(['leaving the canvas drops the drawing', a.G('ui.doodle.strokes.length')===0]); }

// ---- safety ----
{const a=boot(); a.G('ACTIONS.doodleStart()'); a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})');
 for(const x of ['doodleUndo','doodleDone','doodleKeep','doodleLetGo','doodleStart']) a.G(`ACTIONS.${x}()`);
 r.push(['blockIfRed: every Doodle action goes to the crisis screen while RED', a.S()==='crisis']);
 let on=false; for(const sc of ['crisis','crisis-full','crisis-no','safety-check']){ a.G(`session.screen=${JSON.stringify(sc)}; lastRendered=null; render()`); if(/doodle/i.test(a.w.document.getElementById('app').innerHTML)) on=true; }
 r.push(['never on crisis screens', !on]); }
{const a=boot(); a.G('ACTIONS.doodleStart()'); a.draw([[10,10],[20,20]]);
 a.G('dispatch({type:"SET_SAFETY_LEVEL",level:"RED"})'); a.ptr('pointerdown',30,30,2);
 r.push(['drawing is blocked while RED', a.S()==='crisis']); }
{const a=boot();
 r.push(['no image analysis: the PNG is only shrunk and stored', !/getImageData|putImageData|tensorflow|classif|analy[sz]e\(/i.test(HTML.slice(HTML.indexOf('6.22 DOODLE: drawing'), HTML.indexOf('---------- SHELL ----------')))]);
 r.push(['reduced motion: no animation on the canvas', !/\.doodle[^{]*\{[^}]*(animation|transition)/.test(HTML)]);
 r.push(['no script errors', a.errs.length===0]); }

for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
