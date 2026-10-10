// Audit record (docs/PRIVACY_DATA_FLOW.md): the app's network and storage surface. If a new API or external address
// appears, this fails so the privacy document and claims can be reviewed first.
const fs=require('fs'), path=require('path');
const strip=s=>s.replace(/<!--[\s\S]*?-->/g,'');
const APP=strip(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'));
const GUIDE=strip(fs.readFileSync(path.join(__dirname,'support','index.html'),'utf8'));
const SW=fs.readFileSync(path.join(__dirname,'sw.js'),'utf8');
const r=[];
const NET=/\bfetch\s*\(|XMLHttpRequest|sendBeacon|new WebSocket|EventSource|importScripts|navigator\.geolocation|<script[^>]+src=|<link[^>]+href="https?:|@import|<img[^>]+src="https?:/;
r.push(['app: no network or location APIs, no external scripts, fonts or images', !NET.test(APP)]);
r.push(['supporter guide: none either', !NET.test(GUIDE)]);
r.push(['app: no sessionStorage, IndexedDB or cookies', !/sessionStorage|indexedDB|document\.cookie/.test(APP)]);
r.push(['service worker: fetches only this site\'s files, never reads user data', !/localStorage|sessionStorage|indexedDB|next\.v1/.test(SW.replace(/^\s*\/\/.*$/gm,''))]);
const KNOWN=['https://rainn.org/help-and-healing/hotline/','https://cybercivilrights.org/ccri-crisis-helpline/','https://workplacebullying.org/help4targets/','https://www.stopbullying.gov/resources/get-help-now','https://www.treasurehealth.org/care-services/grief-support','https://www.vet.cornell.edu/impact/community-impact/pet-loss-resources-and-support','https://find.griefshare.org/find','https://www.crisistextline.org/text-us/','https://www.thehotline.org/get-help/',   // owner verification 2026-10-05 (PRIVACY_DATA_FLOW.md)
  'https://zigzagmind.com/',   // Share ZigZag Mind fallback link (PRIVACY_DATA_FLOW.md)
  'https://www.samhsa.gov/find-help/helplines/national-helpline','https://findahealthcenter.hrsa.gov/','https://mchb.hrsa.gov/programs-impact/national-maternal-mental-health-hotline','https://www.nami.org/helpline','https://www.1800myreset.org/','https://www.ncpgambling.org/','https://translifeline.org/','https://translifeline.org/contact/','https://anad.org/','https://www.weather.gov/',   // Other kinds of help (2026-10-09): resources hidden until verified, and Leave quickly (PRIVACY_DATA_FLOW.md)
  'https://afsp.org/find-a-support-group/','https://postpartum.net/','https://postpartum.net/get-help/','https://www.nfcc.org/','https://www.consumerfinance.gov/consumer-tools/debt-collection/','https://www.ssa.gov/','https://reportfraud.ftc.gov/',   // grief and money (2026-10-10): hidden until verified (PRIVACY_DATA_FLOW.md)
  'https://www.veteranscrisisline.net/','https://www.vetcenter.va.gov/','https://www.ptsd.va.gov/appvid/mobile/ptsdcoach_app.asp',   // 6.28 F, person-tapped (PRIVACY_DATA_FLOW.md)
  'https://988lifeline.org/chat','https://findahelpline.com','https://ko-fi.com/zigzagmind','https://maps.apple.com/?q=','https://www.google.com/maps/search/','https://'];
const found=[...new Set((APP.match(/https?:\/\/[A-Za-z0-9./_?=&%#-]*/g)||[]))];
r.push(['every external address in the app is on the known list (update PRIVACY_DATA_FLOW.md first)', found.every(u=>KNOWN.includes(u)), found.filter(u=>!KNOWN.includes(u)).join()]);
r.push(['F7: the app and the supporter guide both set no-referrer (links don\'t send the app\'s address)', /<meta name="referrer" content="no-referrer">/.test(APP) && /name="referrer" content="no-referrer"/.test(GUIDE)]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]+(x[1]||!x[2]?'':' — '+x[2])).join('\n'));
process.exit(0);
