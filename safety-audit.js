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
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','quiero morir',''],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','Me quiero morir',''],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','quiero matarme',''],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','me voy a matar',''],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','Quiero quitarme la vida',''],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','pienso en suicidarme',''],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','Ya no quiero vivir',''],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','QUIERO MORÍR','accent where none belongs'],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','quiero suicidárme','accent where none belongs'],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','¡Me voy a matar!','Spanish punctuation'],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','me muero de risa','idiom ("dying of laughter"); not in the list'],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','estoy sin esperanza','hopeless: no Spanish YELLOW list yet'],
  ['Spanish (6.18 C, OWNER-APPROVED INTERIM)','no quiero vivir aquí','"I don\'t want to live here": possible false positive'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I just want to be with him again','CLINICIAN: should this be RED?'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I want to be with her again','CLINICIAN: should this be RED?'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I want to be with them again','CLINICIAN: should this be RED?'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I want to join him','CLINICIAN: should this be RED?'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I want to join her','CLINICIAN: should this be RED?'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I want to join them','CLINICIAN: should this be RED?'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I want to join them for dinner','possible false positive (everyday use)'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I want to be with my mom again','not in the list (a name or relationship instead of him/her/them)'],
  ['Grief (6.20 C, OWNER-APPROVED INTERIM, YELLOW only)','I miss her so much','not in the list (ordinary grief)'],
  ['Bullying (6.27 F, OWNER-APPROVED INTERIM, YELLOW only)','Everyone hates me','CLINICIAN: should this be RED?'],
  ['Bullying (6.27 F, OWNER-APPROVED INTERIM, YELLOW only)','Everyone would be happier without me','CLINICIAN: should this be RED? (close to "better off without me", which is RED)'],
  ['Bullying (6.27 F, OWNER-APPROVED INTERIM, YELLOW only)',"I'm a joke to everyone",'CLINICIAN: should this be RED?'],
  ['Bullying (6.27 F, OWNER-APPROVED INTERIM, YELLOW only)','Maybe I deserve it','CLINICIAN: should this be RED?'],
  ['Bullying (6.27 F, OWNER-APPROVED INTERIM, YELLOW only)','I worked hard for this raise, I deserve it','possible false positive (everyday use)'],
  ['Bullying (6.27 F, OWNER-APPROVED INTERIM, YELLOW only)','Everyone would be better off without me','already RED ("better off without me")'],
  ['Bullying (6.27 F, OWNER-APPROVED INTERIM, YELLOW only)','They all hate me','not in the list'],
];
const HEADER=`| | |
|---|---|
| ZigZag Mind version | \`package.json\` 0.5.0 (the app and export report "0.4-prototype": see SAFETY_AUDIT F4) |
| Git commit audited | \`dba656d\` on branch \`build\` (Stage 6.12) |
| Review pack | \`REVIEW.md\`, generated by \`npm run review\` from the same commit |
| Date | 2026-10-03 |
| Safety logic version | No version marker in the code. Audited at \`dba656d\` (23 RED, 10 YELLOW); now 43 RED (23 + 13 owner-approved interim + 7 Spanish, 6.18 C), 20 YELLOW (10 + 6 grief, 6.20 C + 4 bullying, 6.27 F; owner-approved interim). Matching unchanged since the first upload except accent folding (6.18 C) |
| Owner-approved changes | Factual bugs F1–F7 fixed; RED additions and the full-crisis-screen change are **OWNER-APPROVED INTERIM, pending clinician** |
| Clinician review status | **NOT STARTED. Every decision is OPEN (interim items included).** |`;
// OWNER-APPROVED INTERIM additions (2026-10-03), pending clinician confirmation. Applied in index.html RED_PHRASES.
const INTERIM=["kms","unalive myself","unaliving myself","don't want to wake up","took all my pills","want to disappear","took too much",
  "kill him","kill her","kill them","kill someone","hurt someone","hurt somebody",
  // 6.18 C, Spanish (OWNER-APPROVED INTERIM)
  "quiero morir","me quiero morir","quiero matarme","me voy a matar","quitarme la vida","suicidarme","no quiero vivir"];
// 6.20 C grief (OWNER-APPROVED INTERIM, pending clinician): YELLOW only. Applied in index.html YELLOW_PHRASES.
const YELLOW_INTERIM=["want to be with him again","want to be with her again","want to be with them again","want to join him","want to join her","want to join them",
  // 6.27 F bullying (OWNER-APPROVED INTERIM, YELLOW only)
  "everyone hates me","everyone would be happier without me","i'm a joke to everyone","i deserve it"];

function build(){
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const w=new JSDOM(html,{url:'https://zigzagmind.com/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; }}).window;
  const G=x=>w.eval(x);
  const current=t=>G(`safetyCheck(${JSON.stringify(t)})`);
  // Sandbox: same normalize + matching as safetyCheck, WITHOUT the interim additions (= the audited code). Nothing in the app changes.
  const RED=G('RED_PHRASES').filter(p=>!INTERIM.includes(p)), YEL=G('YELLOW_PHRASES').filter(p=>!YELLOW_INTERIM.includes(p));
  const norm=t=>G(`normalizeText(${JSON.stringify(t)})`);
  // The audited normalization (before 6.18 C added accent folding): letters outside a-z were dropped.
  const oldNorm=t=>" "+String(t||"").toLowerCase().replace(/[\u2018\u2019']/g,"").replace(/[^a-z0-9]+/g," ").trim()+" ";
  const RN=RED.map(oldNorm), YN=YEL.map(oldNorm);
  const before=t=>{ const n=oldNorm(t); return RN.some(p=>n.includes(p))?'RED':YN.some(p=>n.includes(p))?'YELLOW':'GREEN'; };
  const md=[];
  md.push('# Safety test matrix: current `safetyCheck()` behavior','');
  md.push(HEADER,'');
  md.push('**Generated by `npm run safety-audit` from `index.html`. Do not edit by hand.** `safety-matrix.test.js` fails if this file no longer matches the code.','');
  md.push('This documents **current behavior only**. A result here is not a judgment that it is correct. Every row is for clinician review.','');
  md.push('Matching (from the code): text is lowercased, accents are folded to plain letters (é → e, ñ → n; since 6.18 C), apostrophes (straight and curly) are removed, every run of characters that is not `a-z` or `0-9` becomes one space, and the result is padded with spaces. A phrase matches if its normalized form appears as whole words. RED is checked before YELLOW. There is no negation, context or spelling-variant handling; the only non-English phrases are the Spanish RED entries (6.18 C). Other scripts (for example Chinese) are dropped.','');
  md.push(`Phrase lists in the code today: ${G('RED_PHRASES.length')} RED (incl. ${INTERIM.length} interim), ${G('YELLOW_PHRASES.length')} YELLOW (listed in REVIEW.md, section 2).`,'');
  md.push('**Note for the clinician (owner):** a missed crisis is more dangerous than a false alarm, because the crisis screen is safe to show.','');
  md.push('**OWNER-APPROVED INTERIM, pending clinician:** the RED list now includes '+INTERIM.map(p=>`"${p}"`).join(', ')+'. "Before" shows what the audited code (`dba656d`) returned, computed in a sandbox without them.','');
  md.push('**OWNER-APPROVED INTERIM (6.20 C), pending clinician:** the YELLOW list now includes '+YELLOW_INTERIM.map(p=>`"${p}"`).join(', ')+' (6.20 grief: wanting to be with someone who died; 6.27 bullying: "everyone hates me", "everyone would be happier without me", "i\'m a joke to everyone", "i deserve it"). **Question for the clinician: should any of these be RED?**','');
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
