# ZigZag Mind — Stage 6.27 Addendum: Bullied, now or before

Build after 6.21 (it uses the diary) and 6.24 (it uses "Make it smaller"). Read HANDOFF.md and the rules at the top of STAGE6-SPEC.md first; they still apply. **The current safety logic is authoritative, including all owner-approved interim changes. Never revert them.** Add a 6.27 row to the Build order table and build on the `build` branch in the order A → G, committing each part and running `npm test` after each. Push `build` and report. **Do not touch `main`.**

## Why (for the code comments and review pack)

- A five-decade British birth cohort found adults who were frequently bullied as children had higher rates of depression (OR 1.95), anxiety disorders (OR 1.65), and suicidality (OR 2.21), with effects similar to being placed in care; at age 50 they had fewer social relationships and more economic hardship (Takizawa, Maughan & Arseneault, 2014).
- In 2024, 32% of Americans reported being directly bullied at work; targets often lost their jobs, and coworkers rarely helped (Workplace Bullying Institute).
- 41% of U.S. adults have experienced online harassment; adults under 30 report it most (Pew Research Center, 2021).

Never present these numbers to users as statements about them. This feature matters personally to the owner; build it with care.

## Global rules

- ZigZag Mind is 18+. Path D is for adults supporting someone else.
- Every new free-text field goes through `handleSafeTextSubmit`. RED → `openCrisis()`, nothing saved.
- Nothing is saved unless this file says so. Nothing is sent by the app.
- The app never helps anyone look up, contact, expose, or retaliate against another person.
- Help stays on every screen; every flow calls `blockIfRed()` first; a small "Call or text 988" line sits at the bottom of every screen in this path.
- "I don't feel safe" stays on Home's first screen in normal and large text.
- All new copy goes into the review pack. **Clinician review required.**

## Copy rules (never break)

Never: "just ignore them," "toughen up," "sticks and stones," "they're just jealous," "it builds character," "kids will be kids," "what did you do to start it," or anything suggesting the person caused it or should have handled it differently. No advice to confront or retaliate.

---

## A. Entry

Home → "Or tell me what's happening" chips: add **"Bullied — now or before"**. Also link it from Tech check → "I keep checking" when the person indicates the content is about people being cruel to them online (if a matching option exists; otherwise skip).

First screen: **"Being bullied is not your fault. Whether it's happening now or happened a long time ago, it's real."** Then **"Which is closest?"**:

1. It happened years ago, but it still gets to me → B
2. It's happening at work → C
3. It's happening online → D
4. Someone I love is being bullied → E

## B. "It happened years ago, but it still gets to me"

1. **"What happened to you was real, and it wasn't your fault. Bullying can leave marks long after it stops. Still feeling it doesn't mean you're weak."**
2. One at a time, all optional:
   - **Then and now.** Two columns, tap-only chips plus an optional short line each (safety-checked):
     - *What was true then:* I couldn't get away · No one stood up for me · I was alone with it · I was a kid.
     - *What's true now:* I'm an adult · I choose who's in my life · I can leave a room · I can ask for help · I'm still here.
     Ends: **"Then was then. You got through it."** Nothing saved.
   - **A note to your younger self.** One textarea (safety-checked), prompt: *"What would you tell them now?"* Then **Keep in my diary** (only if A line for today exists; respects the diary lock) or **Let it go** (default).
   - **Ground** (existing) or **Calm down with Zags** (existing).
3. Gentle line at the end: **"Old hurts like this are one of the things counselors help with most. It's never too late to talk about it."**

## C. "It's happening at work"

1. **"This is about their behavior, not your worth. A lot of people go through this at work, and it's not something you have to just take."**
2. One at a time, all optional:
   - **Write down what happened.** A short structured note: date (defaults to today), what happened, who saw it (all text safety-checked). Explainer: *"Writing it down as it happens can help later, if you decide to report it."* Save options: **Save in my diary** (respects the lock; the note is tagged "Work notes") or **Don't save**. If the diary isn't locked, show: *"Tip: lock your diary first if someone else might see your phone."*
   - **Talk to someone you trust:** a coworker, a friend outside work, or HR if it feels safe. Prepared text: "Something's been going on at work and it's getting to me. Can we talk?"
   - **Make it through today:** links to Borrow ten minutes and "Make it smaller".
3. Resource (`verified:false`, hidden until the owner verifies): Workplace Bullying Institute information page.

## D. "It's happening online"

1. **"Being targeted online is real harm, even if it's 'just a screen.'"**
2. One at a time:
   - **Don't reply** — "Replying usually feeds it."
   - **Take screenshots** — "Keep a record, even if you never use it."
   - **Mute, block, and report** — "Every app has these. You're allowed to use them."
   - **Tell one person** — prepared text: "Someone's been going after me online and I don't want to deal with it alone."
   - **Step away for a bit** — links to Change the scene.
3. **If there are threats, stalking, or private images shared without your consent**, that's more than bullying: **"You can report threats to the police. If you're in danger right now, call 911."** Plus resources (`verified:false`, hidden until verified): Cyber Civil Rights Initiative helpline (for image-based abuse).

## E. "Someone I love is being bullied"

For an adult supporting someone (including a parent of a child).

1. **"Thank you for taking it seriously. That matters more than anything."**
2. Short guidance screen:
   - Listen first. Let them tell it their way.
   - Believe them, and say it's not their fault.
   - Don't say "just ignore it" or "stand up to them."
   - Ask what they want to happen before you act.
   - Keep checking in, not just once.
   - If they talk about not wanting to be alive, take it seriously and call or text 988 together.
3. Resource (`verified:false`, hidden until verified): stopbullying.gov (U.S. government resource).
4. Link to the existing supporter guide.

## F. Safety phrases (OWNER-APPROVED INTERIM, YELLOW only)

Add to **YELLOW**: `everyone hates me` · `everyone would be happier without me` (if not already RED via "better off without me") · `i'm a joke to everyone` · `i deserve it`. Add to `SAFETY_TEST_MATRIX` with a note asking the clinician whether any should be RED.

## G. "Why ZigZag Mind exists" (owner's choice)

Add a constant `FOUNDER_NOTE = ""`. While empty, nothing is shown. When the owner fills it in, it appears on the About page under a small heading **"Why ZigZag Mind exists"**, in the owner's exact words, with no edits. Never shown anywhere else.

## Tests (minimum)

- Entry from Home; each path reachable; never suggested by the engine.
- Every text field: RED → crisis, nothing saved.
- Work notes and notes to younger self save only to the diary, only when the person chooses, and respect the lock; "Don't save" / "Let it go" store nothing.
- Banned phrases never appear (string test).
- All four resources hidden while `verified:false`.
- New YELLOW phrases return YELLOW; existing RED unchanged.
- `FOUNDER_NOTE` empty → nothing shown; set → shown only on About.
- "I don't feel safe" stays on Home's first screen in normal and large text.

## Report

What changed per part, anything not done exactly as written and why, tests added, final `npm test` count, every item waiting on the owner (resource verification, `FOUNDER_NOTE`) and every new clinician item. Then stop.
