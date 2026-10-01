// Runs every *.test.js file and fails if any check prints FAIL or throws.
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
let pass = 0, fail = 0;
for (const f of fs.readdirSync(__dirname).filter(f => f.endsWith(".test.js")).sort()){
  let out = "";
  try { out = execFileSync(process.execPath, [path.join(__dirname, f)], { encoding:"utf8", stdio:["ignore","pipe","ignore"] }); }
  catch (e){ out = (e.stdout || "") + "\nFAIL crashed: " + f; }
  const lines = out.split("\n").filter(l => /^(PASS|FAIL)/.test(l));
  lines.forEach(l => { if (l.startsWith("PASS")) pass++; else { fail++; console.log(f + ": " + l); } });
  console.log(`${f}: ${lines.filter(l => l.startsWith("PASS")).length} passed`);
}
console.log(`\nTotal: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
