// Step 7: REVIEW.md must match the app word for word. If this fails after a copy change, run: npm run review
const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');
const r=[];
const file=path.join(__dirname,'REVIEW.md');
const committed=fs.existsSync(file)?fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'):'';
const fresh=require('./review.js').build();
r.push(['REVIEW.md is up to date with index.html (run npm run review)', committed===fresh]);

// Spot-check it really contains what a clinician needs, taken straight from the app.
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),{url:'https://next.example/',runScripts:'dangerously',beforeParse(w){ w.scrollTo=()=>{}; }});
const G=x=>dom.window.eval(x);
r.push(['every RED phrase is listed', G('RED_PHRASES').every(p=>fresh.includes(`- "${p}"`))]);
r.push(['every YELLOW phrase is listed', G('YELLOW_PHRASES').every(p=>fresh.includes(`- "${p}"`))]);
r.push(['danger question is word for word', fresh.includes('Are you in danger of hurting yourself or someone else right now?')]);
r.push(['every intervention step is listed', G('INTERVENTION_LIBRARY').every(i=>i.steps.every(s=>fresh.includes(s)) && fresh.includes(i.description))]);
r.push(['all four crisis screens are included', ['### Crisis (first screen)','### Full crisis screen','### "What would help right now?"','### "Do you feel safer?"'].every(h=>fresh.includes(h))]);
r.push(['every screen in the app is included', G('Object.keys(SCREENS)').filter(s=>!G('CRISIS_SCREENS').includes(s) && s!=='talk').every(s=>fresh.includes('### `'+s+'`'))]);
r.push(['escalation rules are included', /## 1\. Escalation rules/.test(fresh) && /twice in a visit/.test(fresh) && /never saved/.test(fresh)]);
r.push(['outside-US and onboarding copy are included', fresh.includes('Find a helpline in your country') && fresh.includes('Are you 18 or older?')]);
r.push(['no render errors in the pack', !/could not render|undefined|NaN|\bNull\b/.test(fresh)]);
r.push(['npm run review is set up', JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'),'utf8')).scripts.review==='node review.js']);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
