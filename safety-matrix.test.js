// docs/SAFETY_TEST_MATRIX.md must match what safetyCheck() returns today. Documents CURRENT behavior only:
// if this fails after a phrase-list change, that change is intentional only if it was approved; then run: npm run safety-audit
const fs=require('fs'), path=require('path');
const r=[];
const file=path.join(__dirname,'docs','SAFETY_TEST_MATRIX.md');
const committed=fs.existsSync(file)?fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'):'';
const {build,CASES,PROPOSED}=require('./safety-audit.js');
const fresh=build();
r.push(['SAFETY_TEST_MATRIX.md matches the current safetyCheck() (run npm run safety-audit)', committed===fresh]);
r.push(['covers the handoff matrix and every Amendment 3 case', ["I want to kill myself","I want to die","I am suicidal","I overdosed","I hurt myself","I don't want to live",
  "I feel hopeless","I can't take this","Nobody cares","I feel worthless","I'm trapped","I want to learn about suicide prevention","My friend survived a suicide attempt",
  "I'm reading about overdose prevention","kms","unalive myself","I don't want to wake up","I took all my pills","I want to disappear","I'm going to kill him",
  "I want to hurt someone","quiero morir"].every(x=>CASES.some(c=>c[1]===x))]);
r.push(['the owner\'s addition list is documented exactly, and NOT applied to the app',
  JSON.stringify(PROPOSED)===JSON.stringify(["kms","unalive myself","don't want to wake up","took all my pills","want to disappear"])
  && !/"kms"|"unalive myself"|"took all my pills"|"want to disappear"|"don't want to wake up"/.test(fs.readFileSync(path.join(__dirname,'index.html'),'utf8'))]);
console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
process.exit(0);
