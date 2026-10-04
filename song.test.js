// Stage 6.16: Turn it into a song. The person's own words; made on the phone; saved only on Keep; RED → crisis, no song.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function boot(storage,{speech}={}){const errs=[];const dom=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{};
   w.addEventListener('error',e=>errs.push(e.message));
   if(speech){ w.spoken=[]; w.speechSynthesis={speak:u=>w.spoken.push(u.text),cancel:()=>{}}; w.SpeechSynthesisUtterance=function(t){this.text=t;}; }
   if(storage) for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v); }});
 const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
 const click=(sel)=>{const el=w.document.querySelector(sel); if(!el) throw new Error('missing '+sel+' on '+w.eval('session.screen')); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));};
 if(w.eval('session.screen').startsWith('ob-')) ['obNext','obAdult','obLater'].forEach(a=>click(`[data-act="${a}"]`));
 const dump=()=>{const o={}; for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i); o[k]=w.localStorage.getItem(k);} return o;};
 return {w,click,errs,S:()=>w.eval('session'),G:x=>w.eval(x),doc:w.document,T:()=>w.document.getElementById('app').textContent.replace(/\s+/g,' '),dump,has:s=>!!w.document.querySelector(s)};}
const act=(a,arg)=>arg!==undefined?`[data-act="${a}"][data-arg="${arg}"]`:`[data-act="${a}"]`;
const r=[];
const LINES=["I can't stop thinking about work","I need to slow down","My sister still picks up when I call"];
function write(a,lines){ for(const t of lines){ a.doc.getElementById('songBox').value=t; a.click(act('songLine')); } }
function make(a,mood='anxious',lines=LINES){ a.G('session.screen="distract"; lastRendered=null; render()'); a.click(act('songStart','head')); a.click(act('songMood',mood)); a.click(act('songNext')); write(a,lines); }
const stored=a=>{ const raw=a.dump()['next.v1.sensitive']; return raw?JSON.parse(raw):{}; };

// ---- entry points ----
{const a=boot(); a.G('session.screen="distract"; lastRendered=null; render()');
 const first=a.doc.querySelector('.content .card');
 r.push(['Get out of my head: "Turn it into a song" is the featured card at the top', first && first.dataset.act==='songStart' && /Turn it into a song/.test(first.textContent)]);
 a.G('ACTIONS.route ? 0 : 0; session.screen="connect"; lastRendered=null; render()');
 r.push(['Connect: "Make a song while you wait"', a.has(act('songStart','connect')) && a.T().includes('Make a song while you wait')]);
 a.G('ACTIONS.tab("plan")'); r.push(['My Plan: My songs row', a.T().includes('My songs') && a.has(act('songNew'))]);
 const lib=a.G('findIntervention("song")');
 r.push(['"song" is in the library for anxious, low, spiraling, distraction and alone', !!lib && ['anxious','low','spiraling','distraction','alone'].every(s=>lib.states.includes(s)) && !lib.states.includes('craving')]);}

// ---- flow ----
{const a=boot(); a.G('session.screen="distract"; lastRendered=null; render()'); a.click(act('songStart','head'));
 r.push(['"How does it feel right now?" Heavy · Anxious · Angry · Numb · Mixed', a.S().screen==='song' && ['Heavy','Anxious','Angry','Numb','Mixed'].every(x=>a.T().includes(x)) && a.T().includes('How does it feel right now?')]);
 r.push(['Next waits for a mood', a.doc.querySelector(act('songNext')).disabled===true]);
 a.click(act('songMood','heavy')); a.click(act('songNext'));
 r.push(['line 1: "What\'s happening?" with the keyboard-mic hint, 120 characters max', a.S().screen==='song-line' && a.T().includes("What's happening?") && a.T().includes('Type it, or tap the mic on your keyboard to say it.') && a.doc.getElementById('songBox').maxLength===120]);
 r.push(['no in-browser speech recognition anywhere', !/SpeechRecognition/.test(HTML)]);
 a.click(act('songLine')); r.push(['an empty line asks gently', a.T().includes('Write a few words first. Anything is okay.') && a.S().screen==='song-line']);
 a.doc.getElementById('songBox').value=LINES[0]; a.click(act('songLine'));
 r.push(['line 2: "What do you need right now?"', a.T().includes('What do you need right now?') && a.T().includes('Line 2 of 3')]);
 a.click(act('songBack')); r.push(['Back keeps line 1', a.doc.getElementById('songBox').value===LINES[0]]);
 a.click(act('songLine')); a.doc.getElementById('songBox').value=LINES[1]; a.click(act('songLine'));
 r.push(['line 3: "One thing that\'s still true", then "Make my song"', a.T().includes("One thing that's still true") && a.doc.querySelector(act('songLine')).textContent==='Make my song']);
 a.doc.getElementById('songBox').value=LINES[2]; a.click(act('songLine'));
 r.push(['the player: Zags, level bars, the three lines word by word', a.S().screen==='song-play' && a.has('#songZags') && a.doc.querySelectorAll('.song-bar').length===12 && a.doc.querySelectorAll('.lyric').length===3 && a.has('#sw0_0') && a.doc.getElementById('sw2_0').textContent==='My']);
 r.push(['"No sound? Check your phone\'s silent switch and volume."', a.T().includes("No sound? Check your phone's silent switch and volume.")]);
 r.push(['nothing saved before Keep', !(stored(a).songs||[]).length && a.G('songs().length')===0]);
 a.click(act('songToggle')); r.push(['Play starts (works without Web Audio: the words still play)', a.G('songPlaying')===true && a.doc.getElementById('songPlayBtn').textContent.includes('Stop')]);
 a.click(act('songToggle')); r.push(['Stop stops', a.G('songPlaying')===false]);
 a.G('ui.songEnded=true; render()');
 r.push(['after the song: "You turned a hard moment into something you made." Keep · Share · Make another', a.T().includes('You turned a hard moment into something you made.') && a.has(act('songKeep')) && a.has(act('songAgain')) && a.T().includes("Share how you're doing with someone")]);
 r.push(['share is a prepared text (opens Messages; nothing sent by the app)', a.has(`a[href="sms:?&body=${encodeURIComponent("Rough day, but I'm working through it. Can we talk later?")}"]`)]);
 a.click(act('songKeep'));
 const s=stored(a).songs;
 r.push(['Keep saves { id, date, mood, lines, still } on the phone', Array.isArray(s) && s.length===1 && s[0].mood==='heavy' && s[0].lines.join('|')===LINES.join('|') && Array.isArray(s[0].still) && typeof s[0].date==='number']);
 r.push(['...and says so', a.T().includes('Kept in My songs') && a.doc.querySelector(act('songKeep')).disabled]);
 a.click(act('songKeep')); r.push(['Keep twice saves once', stored(a).songs.length===1]);
 a.click(act('songDone')); r.push(['Done → "Did the intensity change?"', a.S().screen==='game-check']);
 a.click(act('gameChange','a_little'));
 const o=a.G('session.sessionHistory').at(-1);
 r.push(['recorded as a check-in outcome with interventionId "song"', o.interventionId==='song' && o.change==='a_little']);
 r.push(['the saved outcome never includes the words', !JSON.stringify(stored(a).history||[]).includes('slow down')]);
 r.push(['no console errors', a.errs.length===0, a.errs.join(';')]);}

// ---- safety ----
{const a=boot(); a.G('session.screen="distract"; lastRendered=null; render()'); a.click(act('songStart','head')); a.click(act('songMood','numb')); a.click(act('songNext'));
 write(a,[LINES[0]]); a.doc.getElementById('songBox').value='i want to die'; a.click(act('songLine'));
 r.push(['RED line → crisis', a.S().screen==='crisis' && a.S().safetyLevel==='RED']);
 r.push(['...no song is made and the lines are dropped', a.G('ui.song')===null && !a.G('JSON.stringify(ui.songLines)').includes('work') && !a.G('songs().length')]);
 a.G('ACTIONS.songStart("head")'); r.push(['RED: songs cannot start over a crisis', a.S().screen==='crisis']);}
{const a=boot(); a.G('session.screen="distract"; lastRendered=null; render()'); a.click(act('songStart','head')); a.click(act('songMood','mixed')); a.click(act('songNext'));
 write(a,['I feel hopeless today']); r.push(['YELLOW continues with the support bar', a.S().screen==='song-line' && a.S().safetyLevel==='YELLOW' && a.G('session.yellow')===true]);}
{const a=boot(); make(a); a.click(act('songToggle')); a.G('openCrisis()');
 r.push(['RED stops playback immediately', a.G('songPlaying')===false && a.G('songTimers.length')===0]);}
{const a=boot(); make(a); a.click(act('songToggle')); a.click('header [data-act="crisis"]');
 r.push(['Help stops the song too', a.G('songPlaying')===false]);}
r.push(['Help on every song screen', (()=>{ const a=boot(); a.G('ui.song={mood:"heavy",lines:["a","b","c"],still:[]}; ui.songNow="heavier"'); return ['song','song-line','song-play','song-reflect','song-list'].every(s=>{ a.G(`lastRendered=null; session={...initialSession, screen:${JSON.stringify(s)}}; render()`); return a.has('header .help-pill[data-act="crisis"]'); }); })()]);

// ---- music: deterministic, key change, tempo ----
{const a=boot();
 const m1=a.G(`JSON.stringify(songPlan({mood:"anxious",lines:${JSON.stringify(LINES)},still:[]}))`);
 const b=boot(); const m2=b.G(`JSON.stringify(songPlan({mood:"anxious",lines:${JSON.stringify(LINES)},still:[]}))`);
 r.push(['same lines → identical melody (across separate loads)', m1===m2 && JSON.parse(m1).secs[1].mel.notes.length>0]);
 const other=a.G(`JSON.stringify(songPlan({mood:"anxious",lines:["Something else entirely now","I need rest","Still here"],still:[]}).secs[1].mel)`);
 r.push(['different words → a different melody', other!==JSON.stringify(JSON.parse(m1).secs[1].mel)]);
 const P=JSON.parse(m1);
 r.push(['lines 1 and 2 in minor; line 3 in the relative major (root + 3 semitones)', !P.secs[1].major && !P.secs[2].major && P.secs[3].major && P.secs[3].root===P.secs[1].root+3]);
 const steps=a.G(`(()=>{ const out=[]; for(const w of "My sister still picks up when I call stop".split(" ")){ const h=songHash(w); for(let s=0;s<4;s++) out.push(((h >>> (s * 3)) % 5) - 2); } return out; })()`);
 r.push(['melody steps stay within -2..+2 (no drift to the bottom)', steps.every(x=>x>=-2&&x<=2) && /h >>> \(s \* 3\)/.test(HTML)]);
 const pitches=P.secs[3].mel.notes.map(n=>n.pitch);
 r.push(['the "still true" line moves (several notes, not stuck low)', new Set(pitches).size>=3 && pitches.filter(x=>x===Math.min(...pitches)).length<pitches.length/2]);
 r.push(['ends on a major chord (outro)', P.secs.at(-1).outro && P.secs.at(-1).major]);
 const bpms=P.secs.map(s=>s.bpm);
 r.push(['anxious: the tempo slows across the song (96 → 66)', bpms[0]===96 && bpms.at(-1)===66 && bpms.every((x,i)=>i===0||x<bpms[i-1])]);
 const moods=a.G('JSON.stringify(Object.fromEntries(Object.entries(SONG_MOODS).map(([k,m])=>[k,[m.root%12,m.bpm]])))');
 r.push(['moods match the reference: heavy A, anxious D, angry E, numb C, mixed G', moods===JSON.stringify({heavy:[9,[68,62]],anxious:[2,[96,66]],angry:[4,[92,72]],numb:[0,[72,66]],mixed:[7,[84,70]]})]);
 const S=JSON.parse(a.G(`JSON.stringify(songPlan({mood:"heavy",lines:${JSON.stringify(LINES)},still:["I made it through that week"]}))`));
 r.push(['an added "still true" line becomes the new last line, in the major key', S.secs.length===6 && S.secs[4].text==='I made it through that week' && S.secs[4].major && S.secs[5].outro]);}

// ---- voice ----
{const a=boot(null,{speech:true}); make(a);
 r.push(['voice is off by default', a.G('!!ui.songVoice')===false && a.doc.querySelector(act('songVoice')).getAttribute('aria-pressed')==='false']);
 a.G('songSay("hello")'); r.push(['...and says nothing while off', a.w.spoken.length===0]);
 a.click(act('songVoice')); a.G('songSay("hello")'); r.push(['when on, the phone\'s own voice reads the line', a.w.spoken[0]==='hello']);}

// ---- My songs: replay, reflections, still true, delete ----
{const a=boot(); make(a); a.G('ui.songEnded=true; render()'); a.click(act('songKeep'));
 const b=boot(a.dump()); b.G('ACTIONS.tab("plan")');
 r.push(['songs survive a reload; My Plan shows them', b.T().includes('1 saved on this phone')]);
 b.click(act('songList')); r.push(['My songs lists it with date and mood', b.S().screen==='song-list' && b.T().includes('Anxious') && b.T().includes(LINES[0].slice(0,20))]);
 const id=b.G('songs()[0].id'); b.click(act('songOpen',id));
 r.push(['replay opens the player', b.S().screen==='song-play' && b.doc.querySelectorAll('.lyric').length===3]);
 b.G('ui.songEnded=true; render()');
 r.push(['replay ends with "How does this feel now?" Lighter · About the same · Heavier', b.T().includes('How does this feel now?') && ['lighter','same','heavier'].every(k=>b.has(act('songReflect',k)))]);
 b.click(act('songReflect','lighter')); r.push(['Lighter: "That\'s worth noticing. You\'ve been here before, and it moved."', b.T().includes("That's worth noticing. You've been here before, and it moved.") && !b.has('a[href="tel:988"].btn-safety')]);
 b.G('ui.songNow="same"; lastRendered=null; render()'); r.push(['About the same: "That\'s okay. Some things take longer."', b.T().includes("That's okay. Some things take longer.")]);
 b.click(act('songList')); b.click(act('songOpen',id)); b.G('ui.songEnded=true; render()'); b.click(act('songReflect','heavier'));
 const safety=[...b.doc.querySelectorAll('.content a, .content button, .actions button')];
 r.push(['Heavier: 988 shown first, then a trusted person, then the still-true box', b.T().includes('This might be a moment for a person, not a song.') && safety[0].getAttribute('href')==='tel:988' && safety[1].getAttribute('href')==='sms:988' && /Text someone you trust|Text /.test(safety[2].textContent)]);
 b.doc.getElementById('songBox').value='I made it through that week'; b.click(act('songAdd'));
 r.push(['"Add it and play": a new last line, saved, replayed', b.S().screen==='song-play' && b.doc.querySelectorAll('.lyric').length===4 && stored(b).songs[0].still[0]==='I made it through that week']);
 b.G('ui.songEnded=true; render()'); b.click(act('songReflect','same')); b.doc.getElementById('songBox').value='kill myself'; b.click(act('songAdd'));
 r.push(['a RED still-true line → crisis, not saved', b.S().screen==='crisis' && stored(b).songs[0].still.length===1]);}
{const a=boot(); make(a); a.G('ui.songEnded=true; render()'); a.click(act('songKeep')); a.G('ACTIONS.songList()');
 const id=a.G('songs()[0].id'); a.click(act('songDel',id));
 r.push(['delete asks once', a.T().includes('Delete this song?') && stored(a).songs.length===1]);
 a.click(act('songDelNo')); r.push(['Keep keeps it', stored(a).songs.length===1]);
 a.click(act('songDel',id)); a.click(act('songDelYes',id)); r.push(['Delete removes it', !stored(a).songs && a.G('songs().length')===0]);}
{const a=boot(); make(a); a.G('ui.songEnded=true; render()'); a.click(act('songKeep'));
 const ex=a.G('JSON.stringify(buildExport())'); r.push(['Export includes songs', JSON.parse(ex).songs.length===1 && JSON.parse(ex).songs[0].lines[1]===LINES[1]]);
 a.G('ACTIONS.tab("settings")'); a.click(act('askDelete')); a.click(act('deleteAll'));
 r.push(['Delete everything removes songs', a.G('songs().length')===0 && !stored(a).songs]);}
{const bad=JSON.stringify({v:1,plan:{},history:[],activity:[],songs:[{id:"1",date:1,mood:"heavy",lines:["a","b","c"],still:[]},{id:"2",mood:"nope",lines:["a"]},"x"]});
 const a=boot({'next.v1.prefs':JSON.stringify({prefs:{onboarded:true},theme:'auto',persist:true}),'next.v1.sensitive':bad});
 r.push(['bad saved data is dropped, good songs kept', a.G('songs().length')===1]);}

console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
