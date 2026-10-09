// Public help pages (owner request, 2026-10-09: "help people… even if it's one person"). Plain pages for things people
// search for at 2am: a crisis line first, three real steps, then a link into ZigZag Mind. No scripts, no tracking, no
// outside resources. Wording drafted by Claude Code; clinician review (D60). Run: npm run help-pages
const fs = require("fs"), path = require("path");
const PAGES = [
  { slug:"panic-attack-at-night", title:"Panic attack at night: what to do right now",
    desc:"Three simple steps for a panic attack at night, and where to get help right now.",
    lead:"Panic is awful, and it comes in a wave. It rises, it peaks, and it comes down. You don't have to stop it.",
    steps:[["Breathe out slowly.","Make the out-breath longer than the in-breath. In for 4, out for 6. A few times."],
      ["Put your feet on the floor.","Press down. Name three things you can see, out loud or in your head."],
      ["Let it rise. It will come down.","You don't have to do anything else right now. Just the next breath."]],
    note:"If this is new for you, or you have chest pain or trouble breathing, call 911." },
  { slug:"cant-stop-crying", title:"Can't stop crying? Small steps for right now",
    desc:"What to do when you can't stop crying: three small steps, and who to reach.",
    lead:"Crying is allowed. It often helps. You don't have to fix anything right now.",
    steps:[["Let it happen.","Find a place where you can let it out. It usually eases on its own."],
      ["Cool water and a drink.","Wash your face with cool water and sip some water. Breathe out slowly."],
      ["Tell one person.","You could text: \"Having a hard night. Can you talk for a few minutes?\""]] },
  { slug:"urge-to-drink-or-use", title:"Urge to drink or use right now",
    desc:"Three steps for a strong urge to drink or use, and where to get support.",
    lead:"An urge rises, peaks and passes. You don't have to decide anything right now.",
    steps:[["Wait 15 minutes first.","Set a timer. Tell yourself you'll decide after it goes off."],
      ["Change where you are.","Step outside, go to another room, or get away from what's in front of you."],
      ["Reach someone.","Text or call someone who supports you. You don't have to explain it all."]],
    note:"If you've already been drinking or using: don't drive, drink water, and stay near someone. If someone can't wake up or isn't breathing, call 911." },
  { slug:"cant-sleep-anxiety", title:"Can't sleep because of anxiety",
    desc:"Three steps for a night when worry keeps you awake.",
    lead:"Lying there fighting it usually makes it harder. Try something different.",
    steps:[["Get up for a bit.","If you've been awake about 20 minutes, go somewhere dim and quiet. Come back when you feel sleepy."],
      ["Park the worry.","Write it down, and pick a time tomorrow to think about it. It will still be there; you don't have to hold it now."],
      ["Slow your breathing.","Breathe out longer than you breathe in. Warm drink (no caffeine), blanket, soft light."]] },
  { slug:"feeling-lonely-tonight", title:"Feeling lonely tonight",
    desc:"Three small steps when you feel alone, and who to reach.",
    lead:"Lonely is a real kind of hurt. A small step toward people can help.",
    steps:[["Send one small message.","It doesn't have to be deep. \"Thinking of you. How's your week?\" counts."],
      ["Be around people, no talking needed.","A store, a café, a library, a park. Being near people can help."],
      ["Talk to someone tonight.","If it's more than lonely, you can call or text 988, any time. It's for anyone who's struggling."]] },
  { slug:"cant-stop-overthinking", title:"Can't stop overthinking",
    desc:"Three steps to get racing thoughts out of your head.",
    lead:"You don't have to solve it all right now. Get it out of your head first.",
    steps:[["Write every thought down.","On paper or in your notes. One line each. Don't sort them yet."],
      ["Pick one you can do something about.","Just one small step for it. Park the rest for later."],
      ["Give your mind somewhere else to go.","Ten minutes: a walk, a game, music, a shower."]] },
  // Round 2 (2026-10-09)
  { slug:"so-angry-right-now", title:"So angry right now: what to do first",
    desc:"Three steps for strong anger, before you say or do something you regret.",
    lead:"Angry is allowed. What you do next is the part you choose. Give it some room first.",
    steps:[["Step away.","Say \"I need a few minutes. I'll come back.\" Then leave the room or go outside."],
      ["Let your body come down.","Breathe out slowly. Cold water on your hands. Walk it off. Don't drive while you're this angry."],
      ["Come back later.","Talk about it when your body has calmed down, maybe tomorrow."]],
    note:"If you're afraid you might hurt someone, or you're afraid of someone, call 911 if there's danger now, or call or text 988." },
  { slug:"woke-up-from-a-nightmare", title:"Woke up from a nightmare",
    desc:"Three steps to settle after a nightmare.",
    lead:"It's over. You're here now.",
    steps:[["Turn on a light.","Look around and name where you are, out loud if you can."],
      ["Feel the room.","Feet on the floor. Hold something cool. Drink some water."],
      ["Settle again.","Sit up for a few minutes and breathe out slowly. Go back to bed when you feel calmer."]] },
  { slug:"feel-numb", title:"Feeling numb or empty",
    desc:"Small steps when you can't feel much of anything.",
    lead:"Numb is a real feeling too. You don't have to force anything.",
    steps:[["Wake up your senses.","Something cold to hold, something with a strong smell or taste, a few minutes outside."],
      ["Do one tiny thing.","Make the bed, wash one dish, step outside. Small is enough."],
      ["Tell someone.","\"I've been feeling kind of empty lately.\" One sentence is enough."]],
    note:"If you've felt this way most days for two weeks or more, talking to a doctor or counselor can really help." },
  { slug:"after-a-breakup", title:"After a breakup: getting through tonight",
    desc:"Three steps for the first hard nights after a breakup.",
    lead:"Heartbreak is a real loss. It can hurt in your body and come in waves.",
    steps:[["Don't text them tonight.","If you want to, write it in your notes instead and decide tomorrow."],
      ["Step back from their profile.","Mute or hide them for now. You can undo it later."],
      ["Lean on someone.","\"I'm having a hard time with the breakup. Can we talk?\""]] },
  { slug:"grief-tonight", title:"Grief tonight: when you miss them",
    desc:"Small steps for a hard night of grief.",
    lead:"Grief comes and goes. There's no right way to do this.",
    steps:[["Let it be what it is.","Sad, numb, angry, foggy: all of it is normal in grief."],
      ["Do something with the missing.","Look at a photo, hold something of theirs, or write them a few lines."],
      ["Reach one person.","\"Today's a hard day. I'm thinking about them.\""]],
    note:"If you lost someone to suicide, you're not alone. You can call or text 988 to talk about it, any time." },
  { slug:"cant-get-out-of-bed", title:"Can't get out of bed",
    desc:"Small steps for mornings that feel like too much.",
    lead:"You don't have to fix the whole day. Just the next small thing.",
    steps:[["Start in bed.","Sit up. Feet on the floor. Open the curtains or turn on a light."],
      ["One small thing.","A glass of water. Wash your face. Clothes for the day, even comfortable ones."],
      ["Then one tiny task.","Just one. That counts."]],
    note:"If most of your days feel this heavy, talking to a doctor or counselor can really help." }
];
const CSS = `:root{--bg:#f7f3ec;--surface:#fff;--text:#1f2a2a;--muted:#5b6464;--primary:#33726b;--safety:#b85c44;--line:#e4ddd2}
@media (prefers-color-scheme:dark){:root{--bg:#141a1a;--surface:#1d2525;--text:#eef2f1;--muted:#a9b4b2;--primary:#7cc3b8;--safety:#e59a84;--line:#2c3636}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:17px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
main{max-width:640px;margin:0 auto;padding:16px 16px 40px}a{color:var(--primary)}
.crisis{border:1.5px solid var(--safety);border-radius:14px;padding:12px 14px;background:var(--surface);font-weight:600;margin:0 0 20px}
.crisis a{color:var(--safety)}h1{font-size:28px;line-height:1.2;margin:8px 0 10px}h2{font-size:19px;margin:0 0 4px}
.lead{color:var(--muted);font-size:18px}.steps{padding-left:22px}.steps li{margin:0 0 16px}.steps p{margin:0}
.note{border-left:4px solid var(--safety);padding:4px 12px;margin:18px 0}
.open{display:block;text-align:center;background:var(--primary);color:#fff;text-decoration:none;font-weight:600;padding:14px;border-radius:14px;margin:24px 0 12px}
@media (prefers-color-scheme:dark){.open{color:#0d1414}}.small{color:var(--muted);font-size:14px}nav ul{padding-left:18px}`;
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const CRISIS = `<p class="crisis">In crisis or thinking about suicide? <a href="tel:988">Call 988</a> or <a href="sms:988">text 988</a> (US), any time. In danger right now? <a href="tel:911">Call 911</a>.</p>`;
const ABOUT = `<p class="small">ZigZag Mind is a free app with small steps for hard moments. It's not therapy or an emergency service. This page has no ads and no tracking.</p>`;
function head(title, desc){ return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer">
<title>${esc(title)} | ZigZag Mind</title><meta name="description" content="${esc(desc)}"><link rel="icon" href="../../icon.svg"><style>${CSS}</style></head>`; }
function page(p){
  const others = PAGES.filter(x => x.slug !== p.slug).map(x => `<li><a href="../${x.slug}/">${esc(x.title)}</a></li>`).join("");
  return `${head(p.title, p.desc)}<body><main>
${CRISIS}
<h1>${esc(p.title)}</h1>
<p class="lead">${esc(p.lead)}</p>
<ol class="steps">${p.steps.map(([h, t]) => `<li><h2>${esc(h)}</h2><p>${esc(t)}</p></li>`).join("")}</ol>
${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}
<a class="open" href="../../">Open ZigZag Mind: one small step at a time</a>
${ABOUT}
<nav aria-label="More help"><p class="small">More:</p><ul>${others}</ul><p class="small"><a href="../">All help pages</a></p></nav>
</main></body></html>
`;
}
function index(){
  return `${head("Help for hard moments", "Simple steps for panic, crying, urges, sleep, loneliness and overthinking.").replace(/\.\.\/\.\.\/icon\.svg/,"../icon.svg")}<body><main>
${CRISIS}
<h1>Help for hard moments</h1>
<p class="lead">Short pages with three real steps for right now.</p>
<ul>${PAGES.map(p => `<li><a href="${p.slug}/">${esc(p.title)}</a></li>`).join("")}</ul>
<a class="open" href="../">Open ZigZag Mind: one small step at a time</a>
${ABOUT}
</main></body></html>
`;
}
function build(){ const out = { "help/index.html":index() }; for (const p of PAGES) out[`help/${p.slug}/index.html`] = page(p); return out; }
if (require.main === module){
  for (const [f, html] of Object.entries(build())){ fs.mkdirSync(path.join(__dirname, path.dirname(f)), { recursive:true }); fs.writeFileSync(path.join(__dirname, f), html); }
  console.log(`Wrote ${Object.keys(build()).length} help pages`);
}
module.exports = { build, PAGES };
