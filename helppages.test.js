// Public help pages + printable card (owner request, 2026-10-09): crisis line first, three steps, a link into the app,
// no scripts, no tracking, nothing from outside. The card draws a QR code of the site's plain address on the device.
const fs=require('fs'), path=require('path');
const {chromium}=require('playwright');
const {build,PAGES}=require('./help-pages.js');
const r=[];
(async()=>{
 const out=build();
 r.push(['help pages are up to date (npm run help-pages)', Object.entries(out).every(([f,h])=>fs.existsSync(path.join(__dirname,f)) && fs.readFileSync(path.join(__dirname,f),'utf8')===h)]);
 r.push([`${PAGES.length} topic pages plus an index`, PAGES.length>=6 && Object.keys(out).length===PAGES.length+1]);
 for(const [f,h] of Object.entries(out)){
  const body=h.replace(/<style>[\s\S]*?<\/style>/,'');
  r.push([`${f}: crisis line first (Call 988, Text 988, Call 911)`, body.indexOf('tel:988')>-1 && body.indexOf('tel:988')<body.indexOf('<h1') && /sms:988/.test(body) && /tel:911/.test(body)]);
  r.push([`${f}: no scripts, no outside resources, no tracking`, !/<script|<iframe|https?:\/\//i.test(body) && /no ads and no tracking/.test(body)]);
  r.push([`${f}: a title, a description, a link into the app, "not therapy"`, /<title>[^<]+\| ZigZag Mind<\/title>/.test(h) && /<meta name="description" content="[^"]{20,}"/.test(h) && /class="open" href="\.\.\/(\.\.\/)?"/.test(h) && /not therapy or an emergency service/.test(h)]);
 }
 r.push(['steps make no promises or diagnoses', !/cure|guarantee|diagnos|you have (depression|anxiety)|you'?re safe now/i.test(JSON.stringify(PAGES))]);
 const lib=fs.readFileSync(path.join(__dirname,'card/qrcode.js'),'utf8');
 r.push(['card: the QR library is vendored with its MIT notice and makes no network calls', /Licensed under the MIT license/.test(lib) && !/\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(lib)]);
 const card=fs.readFileSync(path.join(__dirname,'card/index.html'),'utf8');
 r.push(['card: no outside scripts or resources (only the local QR library)', !/src="https?:|href="https?:/i.test(card) && /<script src="qrcode\.js"><\/script>/.test(card)]);
 const b=await chromium.launch(); const p=await b.newPage(); await p.goto('file://'+path.join(__dirname,'card/index.html'));
 const m=await p.evaluate(()=>({cards:document.querySelectorAll('.card').length, svg:[...document.querySelectorAll('.card .qr svg')].filter(s=>s.querySelector('path,rect')).length, where:document.getElementById('where').textContent, text:document.querySelector('.card').textContent}));
 r.push(['card: eight cards, each with a QR code', m.cards===8 && m.svg===8]);
 r.push(['card: the plain site address (no tracking codes), shown under the code', m.where==='https://zigzagmind.com/' && /zigzagmind\.com/.test(m.text)]);
 r.push(['card: "In crisis? Call or text 988" and "Not therapy or an emergency service."', /In crisis\? Call or text 988\./.test(m.text) && /Not therapy or an emergency service\./.test(m.text)]);
 await b.close();
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
 r.push(['the Share screen links to the card', /href="card\/" target="_blank" rel="noopener"/.test(html)]);
 console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
 process.exit(0);
})();
