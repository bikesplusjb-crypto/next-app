// docs/SAFETY_TEST_MATRIX.md must match what safetyCheck() returns today. Documents current behavior:
// if this fails after a phrase-list change, that change is intentional only if it was approved; then run: npm run safety-audit
const fs=require('fs'), path=require('path');
const r=[];
const file=path.join(__dirname,'docs','SAFETY_TEST_MATRIX.md');
const committed=fs.existsSync(file)?fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'):'';
const {build,CASES,INTERIM}=require('./safety-audit.js');
const fresh=build();
r.push(['SAFETY_TEST_MATRIX.md matches the current safetyCheck() (run npm run safety-audit)', committed===fresh]);
r.push(['covers the handoff matrix and every Amendment 3 case', ["I want to kill myself","I want to die","I am suicidal","I overdosed","I hurt myself","I don't want to live",
  "I feel hopeless","I can't take this","Nobody cares","I feel worthless","I'm trapped","I want to learn about suicide prevention","My friend survived a suicide attempt",
  "I'm reading about overdose prevention","kms","unalive myself","I don't want to wake up","I took all my pills","I want to disappear","I'm going to kill him",
  "I want to hurt someone","quiero morir"].every(x=>CASES.some(c=>c[1]===x))]);
// OWNER-APPROVED INTERIM (pending clinician): exactly these were added to RED, nothing else.
const {JSDOM}=require('jsdom');
const w=new JSDOM(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; }}).window;
const RED=w.eval('RED_PHRASES');
r.push(['the owner-approved interim RED additions are in the code exactly', JSON.stringify(INTERIM)===JSON.stringify(["kms","unalive myself","unaliving myself","don't want to wake up","took all my pills","want to disappear","took too much","kill him","kill her","kill them","kill someone","hurt someone","hurt somebody",
  "quiero morir","me quiero morir","quiero matarme","me voy a matar","quitarme la vida","suicidarme","no quiero vivir"])
  && INTERIM.every(p=>RED.includes(p)) && RED.length===23+INTERIM.length]);
const GRIEF_Y=["want to be with him again","want to be with her again","want to be with them again","want to join him","want to join her","want to join them"];
r.push(['every interim phrase now returns RED; original 10 YELLOW unchanged + 6 grief (6.20 C)', INTERIM.every(p=>w.eval(`safetyCheck(${JSON.stringify("I "+p)})`)==='RED') && w.eval('YELLOW_PHRASES.length')===16
  && JSON.stringify(w.eval('YELLOW_PHRASES.slice(0,10)'))===JSON.stringify(["hopeless","can't take it","can't take this","give up","giving up","nobody cares","no one cares","worthless","trapped","can't do this anymore"])
  && JSON.stringify(w.eval('YELLOW_PHRASES.slice(10)'))===JSON.stringify(GRIEF_Y)]);
r.push(['6.20 C grief phrases return YELLOW (not RED)', GRIEF_Y.every(p=>w.eval(`safetyCheck(${JSON.stringify("I "+p)})`)==='YELLOW')]);
r.push(['the confirmed misses from the audit are now RED (incl. harm to others)', ["kms","unalive myself","I don't want to wake up","I took all my pills","I want to disappear","I'm going to kill him","I want to hurt someone"].every(t=>w.eval(`safetyCheck(${JSON.stringify(t)})`)==='RED')]);
r.push(['Spanish now detected (6.18 C, interim); other languages still not (documented for the clinician)', w.eval('safetyCheck("quiero morir")')==='RED' && w.eval('safetyCheck("je veux mourir")')==='GREEN']);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
process.exit(0);
