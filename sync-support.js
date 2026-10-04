// 6.18 B: writes the Warm Line block on the supporter guide from WARMLINE in index.html,
// so the number and hours live in one place. support.test.js / stage618.test.js fail if it drifts.
const fs=require('fs'), path=require('path'), vm=require('vm');
const APP=path.join(__dirname,'index.html'), SUP=path.join(__dirname,'support','index.html');
function warmline(){
  const src=fs.readFileSync(APP,'utf8');
  const m=src.match(/const WARMLINE = (\{[\s\S]*?\n\});/);
  if(!m) throw new Error('WARMLINE not found in index.html');
  return vm.runInNewContext('('+m[1]+')');
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// "Every day, 4pm–10pm Eastern." → "every day 4pm–10pm Eastern"
const shortHours=h=>String(h).replace(/\.$/,'').replace(/^Every day, /,'every day ');
function block(W){
  return `    <!-- WARMLINE:start (written by sync-support.js from WARMLINE in index.html; do not edit by hand) -->
    <p id="warmline"><strong>Talk to someone who gets it.</strong> The ${esc(W.name)} is free and is also for family and friends supporting someone: <a href="${esc(W.tel)}">${esc(W.number)}</a>, ${esc(shortHours(W.hours))}. Not a crisis line. For a crisis, call or text 988.</p>
    <!-- WARMLINE:end -->`;
}
function synced(){
  const sup=fs.readFileSync(SUP,'utf8');
  return sup.replace(/    <!-- WARMLINE:start[\s\S]*?<!-- WARMLINE:end -->/, block(warmline()));
}
if(require.main===module){ fs.writeFileSync(SUP, synced()); console.log('Wrote the Warm Line block in support/index.html'); }
module.exports={synced,warmline,SUP};
