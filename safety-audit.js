// Generates docs/SAFETY_TEST_MATRIX.md from the CURRENT safetyCheck() in index.html.
// It documents current behavior only and never changes the phrase lists. The comparison column shows what the
// code returned BEFORE the owner-approved interim additions (audit commit dba656d), computed in a sandbox.
// Run: npm run safety-audit   (safety-matrix.test.js fails if the committed file drifts from the code)
const fs=require('fs'), path=require('path');
const {JSDOM}=require('jsdom');

const CASES=[
  // [group, input, note]
  ['Handoff: expected RED','I want to kill myself',''],
  ['Handoff: expected RED','I want to die',''],
  ['Handoff: expected RED','I am suicidal',''],
  ['Handoff: expected RED','I overdosed',''],
  ['Handoff: expected RED','I hurt myself',''],
  ['Handoff: expected RED',"I don't want to live",''],
  ['Handoff: expected YELLOW','I feel hopeless',''],
  ['Handoff: expected YELLOW',"I can't take this",''],
  ['Handoff: expected YELLOW','Nobody cares',''],
  ['Handoff: expected YELLOW','I feel worthless',''],
  ["Handoff: expected YELLOW","I'm trapped",''],
  ['Possible false positive (educational / about someone else)','I want to learn about suicide prevention','Amendment 3: confirmed RED'],
  ['Possible false positive (educational / about someone else)','My friend survived a suicide attempt','Amendment 3: confirmed RED'],
  ['Possible false positive (educational / about someone else)',"I'm reading about overdose prevention",''],
  ['Amendment 3: confirmed false negative','kms','slang'],
  ['Amendment 3: confirmed false negative','unalive myself','slang'],
  ['Amendment 3: confirmed false negative',"I don't want to wake up",'indirect'],
  ['Amendment 3: confirmed false negative','I took all my pills','possible overdose'],
  ['Amendment 3: confirmed false negative','I want to disappear','indirect'],
  ['Amendment 3: confirmed false negative (harm to others)',"I'm going to kill him",'harm to others'],
  ['Amendment 3: confirmed false negative (harm to others)','I want to hurt someone','harm to others'],
  ['Amendment 3: confirmed false negative','quiero morir','Spanish'],
  ['Normalization','I WANT TO DIE!!!','capitals, punctuation'],
  ['Normalization','i want   to\n die','extra spaces, line break'],
  ['Normalization','I cant go on','no apostrophe'],
  ['Normalization','I can’t go on','curly apostrophe'],
  ['Normalization','want-to-die','hyphens'],
  ['Normalization','iwanttodie','no spaces'],
  ['Normalization','kill my self','split word'],
  ['Normalization','k1ll myself','number for letter'],
  ['Normalization','suicides','plural'],
  ['Normalization','overdosing','other word form'],
  ['Paraphrase / indirect',"I'm done with everything",''],
  ['Paraphrase / indirect',"Everyone would be better off if I wasn't here",''],
  ['Paraphrase / indirect','I want to sleep and never wake up',''],
  ['Paraphrase / indirect',"I'm a burden",''],
  ['Paraphrase / indirect',"There's no point anymore",''],
  ['Paraphrase / indirect',"I've written goodbye letters",''],
  ['Paraphrase / indirect','I want to end things',''],
  ['Negation / context',"I'm not suicidal",'negated'],
  ['Negation / context',"I would never kill myself",'negated'],
  ['Negation / context','I was suicidal years ago, I am okay now','past'],
  ['Negation / context',"I'm dying to see that movie",'idiom'],
  ['Negation / context','That joke killed me','idiom'],
  ['Negation / context',"I can't go on the trip this weekend",'everyday use of a RED phrase'],
  ['Negation / context',"I'm trying to give up sugar",'everyday use of a YELLOW phrase'],
  ['Negation / context','I feel trapped in traffic','everyday use of a YELLOW phrase'],
  ['Harm to others','I could kill my boss','idiom or threat'],
  ['Harm to others','I want to hurt them',''],
  ['Harm to others','I am going to shoot someone',''],
  ['Non-English','je veux mourir','French'],
  ['Non-English','quiero matarme','Spanish'],
  ['Non-English','我想死','Chinese'],
  ['Substance','I took too much','possible overdose'],
  ['Substance','I drank way too much and I feel sick',''],
  ['Substance','I relapsed',''],
  ['Interim additions: harm to others','She said she would kill her','reported speech'],
  ['Interim additions: harm to others','I want to kill them all',''],
  ['Interim additions: harm to others','I could hurt somebody',''],
  ['Interim additions: possible false positives','I ran 5 kms today','"kms" also means kilometers'],
  ['Interim additions: possible false positives','I took all my pills this morning like the doctor said','normal medication use'],
  ['Interim additions: possible false positives','I want to disappear into a good book',''],
  ['Interim additions: possible false positives','I took too much time on this',''],
  ['Interim additions: possible false positives','These weeds will kill them','plants'],
  ['Interim additions: possible false positives',"Don't hurt someone's feelings",'advice'],
];
const HEADER=`| | |
|---|---|
| ZigZag Mind version | \`package.json\` 0.5.0 (the app and export report "0.4-prototype": see SAFETY_AUDIT F4) |
| Git commit audited | \`dba656d\` on branch \`build\` (Stage 6.12) |
| Review pack | \`REVIEW.md\`, generated by \`npm run review\` from the same commit |
| Date | 2026-10-03 |
| Safety logic version | No version marker in the code. Audited at \`dba656d\` (23 RED, 10 YELLOW); now 36 RED (23 + 13 owner-approved interim), 10 YELLOW. Matching code itself unchanged since the first upload (\`abc2a64\`) |
| Owner-approved changes | Factual bugs F1–F7 fixed; RED additions and the full-crisis-screen change are **OWNER-APPROVED INTERIM, pending clinician** |
| Clinician review status | **NOT STARTED. Every decision is OPEN (interim items included).** |`;
// OWNER-APPROVED INTERIM additions (2026-10-03), pending clinician confirmation. Applied in index.html RED_PHRASES.
const INTERIM=["kms","unalive myself","unaliving myself","don't want to wake up","took all my pills","want to disappear","took too much",
  "kill him","kill her","kill them","kill someone","hurt someone","hurt somebody"];

function build(){
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const w=new JSDOM(html,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; }}).window;
  const G=x=>w.eval(x);
  const current=t=>G(`safetyCheck(${JSON.stringify(t)})`);
  // Sandbox: same normalize + matching as safetyCheck, WITHOUT the interim additions (= the audited code). Nothing in the app changes.
  const RED=G('RED_PHRASES').filter(p=>!INTERIM.includes(p)), YEL=G('YELLOW_PHRASES');
  const norm=t=>G(`normalizeText(${JSON.stringify(t)})`);
  const RN=RED.map(norm), YN=YEL.map(norm);
  const before=t=>{ const n=norm(t); return RN.some(p=>n.includes(p))?'RED':YN.some(p=>n.includes(p))?'YELLOW':'GREEN'; };
  const md=[];
  md.push('# Safety test matrix: current `safetyCheck()` behavior','');
  md.push(HEADER,'');
  md.push('**Generated by `npm run safety-audit` from `index.html`. Do not edit by hand.** `safety-matrix.test.js` fails if this file no longer matches the code.','');
  md.push('This documents **current behavior only**. A result here is not a judgment that it is correct. Every row is for clinician review.','');
  md.push('Matching (from the code): text is lowercased, apostrophes (straight and curly) are removed, every run of characters that is not `a-z` or `0-9` becomes one space, and the result is padded with spaces. A phrase matches if its normalized form appears as whole words. RED is checked before YELLOW. There is no negation, context, spelling-variant or language handling. Letters outside `a-z` (accents, other scripts) are dropped.','');
  md.push(`Phrase lists in the code today: ${G('RED_PHRASES.length')} RED (incl. ${INTERIM.length} interim), ${G('YELLOW_PHRASES.length')} YELLOW (listed in REVIEW.md, section 2).`,'');
  md.push('**Note for the clinician (owner):** a missed crisis is more dangerous than a false alarm, because the crisis screen is safe to show.','');
  md.push('**OWNER-APPROVED INTERIM, pending clinician:** the RED list now includes '+INTERIM.map(p=>`"${p}"`).join(', ')+'. "Before" shows what the audited code (`dba656d`) returned, computed in a sandbox without them.','');
  let group='';
  for(const [g,input,note] of CASES){
    if(g!==group){ group=g; md.push('',`## ${g}`,'','| Input | Current result | Before interim additions | Note |','|---|---|---|---|'); }
    const c=current(input), b=before(input);
    md.push(`| ${input.replace(/\n/g,'⏎').replace(/\|/g,'\\|')} | **${c}**${b===c?'':' (changed)'} | ${b} | ${note} |`);
  }
  md.push('','## Where free text is checked today','');
  md.push('- Anxious flow, "three things" fields (each line checked; RED stops at the first RED line).');
  md.push('- Thought Parking (each line; RED creates no cards).');
  md.push('- Spiral "my own next step".');
  md.push('- "Do something kind" → "Thank you for ___".');
  md.push('- Code word "my own word": checked, but a flagged word is only refused (no crisis screen), because it is a My Plan field.');
  md.push('- **Not checked (by design, "plan fields are exempt"):** every My Plan field, including the time and distance plan.');
  md.push('');
  return md.join('\n');
}
module.exports={build,CASES,INTERIM};
if(require.main===module){ fs.mkdirSync(path.join(__dirname,'docs'),{recursive:true}); fs.writeFileSync(path.join(__dirname,'docs','SAFETY_TEST_MATRIX.md'),build()); console.log('Wrote docs/SAFETY_TEST_MATRIX.md'); }
