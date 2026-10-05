// Owner verification 2026-10-05: JB opened the official pages and confirmed they work. These resources are on, with
// source and date; the ones still waiting stay hidden. Spanish stays off; owner settings stay empty.
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const DOC=fs.readFileSync(path.join(__dirname,'docs/CRISIS_RESOURCE_VERIFICATION.md'),'utf8');
const w=new JSDOM(HTML,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>null; }}).window;
const G=x=>w.eval(x); const r=[];
const ON=[['TRAUMA_RESOURCES',0,'8006564673'],['TRAUMA_RESOURCES',1,'18007997233'],['BULLY_RESOURCES',1,'18448782274'],['GRIEF_RESOURCES',0,'7724034500'],['GRIEF_RESOURCES',1,'6072187457']];
r.push(['verified entries have the owner-confirmed numbers', ON.every(([l,i,ph])=>G(`${l}[${i}].verified===true && ${l}[${i}].phone==="${ph}" && ${l}[${i}].checked==="2026-10-05"`))]);
r.push(['every verified entry records its official source and date', G('[...GRIEF_RESOURCES,...BULLY_RESOURCES,...TRAUMA_RESOURCES].every(e=>e.verified!==true || (/^https:\\/\\//.test(e.source) && e.checked==="2026-10-05"))')]);
r.push(['Crisis Text Line on (text HOME to 741741), owner-verified', G('CRISIS_TEXT_LINE.verified===true && ctlShown() && CRISIS_TEXT_LINE.sms==="sms:741741?&body=HOME"')]);
r.push(['the DV hotline is phone and text only (no link to its website chat)', G('TRAUMA_RESOURCES[1].url===""')]);
r.push(['Help near me stays hidden (211 / New Horizons / NAMI / recovery not yet verified)', G('NEAR_ME.every(e=>e.verified===false) && nearMe().length===0')]);
r.push(['VA links unchanged', G('VET_RESOURCES.vetCenter.tel==="tel:18779278387" && VET_RESOURCES.vcl.chat==="https://www.veteranscrisisline.net/" && VET_RESOURCES.vcl.text==="838255" && VET_RESOURCES.ptsdCoach.url==="https://www.ptsd.va.gov/appvid/mobile/ptsdcoach_app.asp"')]);
r.push(['Warm Line unchanged', G('WARMLINE.tel==="tel:18009451355" && WARMLINE.number==="1-800-945-1355"')]);
r.push(['Spanish stays off', G('SPANISH_ENABLED')===false]);
r.push(['owner settings still empty (pending owner input)', G('CONTACT_EMAIL==="" && FEEDBACK_URL==="" && FOUNDER_NOTE===""')]);
r.push(['urge chip wording unchanged (pending owner decision)', G('l10n("home.craving")')==='I have an urge to use (drink or drugs)']);
r.push(['the verification doc records the 2026-10-05 results', /# OWNER VERIFICATION — 2026-10-05/.test(DOC) && /PENDING OWNER INPUT/.test(DOC) && /PENDING CLINICIAN REVIEW/.test(DOC) && /PENDING TRANSLATOR REVIEW/.test(DOC) && /\| RAINN[^\n]*\| VERIFIED/.test(DOC)]);
for(const [n,ok] of r) console.log((ok?'PASS':'FAIL')+' '+n);
