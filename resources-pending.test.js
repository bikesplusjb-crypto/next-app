// Owner verification 2026-10-05: everything found by search stays hidden until the owner opens the official page.
// Guards that no outside resource was switched on, no VA link changed, and Spanish stays off.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const DOC=fs.readFileSync(path.join(__dirname,'docs/CRISIS_RESOURCE_VERIFICATION.md'),'utf8');
const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>null; }}).window;
const G=x=>w.eval(x); const r=[];
r.push(['grief resources all hidden (verified:false)', G('GRIEF_RESOURCES.every(e=>e.verified===false) && griefResources().length===0')]);
r.push(['bullying resources all hidden', G('BULLY_RESOURCES.every(e=>e.verified===false)')]);
r.push(['trauma resources (RAINN, DV hotline) hidden', G('TRAUMA_RESOURCES.every(e=>e.verified===false)')]);
r.push(['Crisis Text Line hidden', G('CRISIS_TEXT_LINE.verified===false && !ctlShown()')]);
r.push(['Help near me hidden', G('NEAR_ME.every(e=>e.verified===false) && nearMe().length===0')]);
r.push(['no phone or URL filled in for an unverified entry', G('[...GRIEF_RESOURCES,...BULLY_RESOURCES,...TRAUMA_RESOURCES].every(e=>!e.phone && !e.url)')]);
r.push(['VA links unchanged', G('VET_RESOURCES.vetCenter.tel==="tel:18779278387" && VET_RESOURCES.vcl.chat==="https://www.veteranscrisisline.net/" && VET_RESOURCES.vcl.text==="838255" && VET_RESOURCES.ptsdCoach.url==="https://www.ptsd.va.gov/appvid/mobile/ptsdcoach_app.asp"')]);
r.push(['Spanish stays off', G('SPANISH_ENABLED')===false]);
r.push(['owner settings still empty (pending owner input)', G('CONTACT_EMAIL==="" && FEEDBACK_URL==="" && FOUNDER_NOTE===""')]);
r.push(['urge chip wording unchanged (pending owner decision)', G('l10n("home.craving")')==='I have an urge to use (drink or drugs)']);
r.push(['the verification doc records the 2026-10-05 check, statuses and pending items', /# OWNER VERIFICATION — 2026-10-05/.test(DOC) && /PENDING OWNER INPUT/.test(DOC) && /PENDING CLINICIAN REVIEW/.test(DOC) && /PENDING TRANSLATOR REVIEW/.test(DOC) && (DOC.match(/\| (PENDING VERIFICATION|OWNER DECISION REQUIRED)/g)||[]).length===12 && !/\| VERIFIED \|/.test(DOC.split('## VA verification')[0])]);
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
