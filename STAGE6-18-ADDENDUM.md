# ZigZag Mind — Stage 6.18 Addendum: owner-approved updates

Read HANDOFF.md and the rules at the top of STAGE6-SPEC.md first; they still apply. **The current safety logic is authoritative, including all owner-approved interim changes. Never revert them.** Add a 6.18 row to the Build order table and build everything below on the `build` branch, in the order A → F. Run `npm test` after each part. Push to `build` and report. **Do not touch `main`.**

Everything marked **OWNER-APPROVED INTERIM** is approved by the owner now and still goes to the clinician: mark it that way in the code comments, `docs/CLINICIAN_REVIEW.md` (decision table, status OPEN), and the regenerated review pack.

Global rules for this part:

- Every new free-text field goes through `handleSafeTextSubmit`. Plan fields stay exempt.
- Nothing new is saved unless this file says so.
- No new screen may push "I don't feel safe" below the first screen on Home, in normal or large text.
- Crisis screens keep their current structure and order. New lines on crisis screens go **below** the existing 988 / 911 buttons, never above them.
- Help stays on every new screen; every new flow calls `blockIfRed()` first.

---

## A. Zags wording (OWNER-APPROVED INTERIM)

1. Connect: "Stay with Zags for a few minutes — Until someone calls back" → **"Calm down with Zags while you wait"** (no subtitle).
2. Zags's first line: "I can stay with you for a few minutes." → **"I can guide you through the next few minutes."** The line must still contain "not a person."
3. Search all copy for any other "stay with you" / "stay with me" wording spoken by Zags and list it in the report (do not change anything else).

Tests: the old wording no longer appears; Zags's first line still says "not a person."

## B. Warm Line on the supporter page

On `support/index.html`, in "Look after yourself," add:

> **Talk to someone who gets it.** The Florida Warm Line is free and is also for family and friends supporting someone: 1-800-945-1355, every day 4pm–10pm Eastern. Not a crisis line. For a crisis, call or text 988.

Use the same Warm Line constant/config the app uses so the number and hours live in one place. Show the number as text so it can be dialed from a computer.

## C. Spanish crisis phrases (OWNER-APPROVED INTERIM)

Add to RED, using the existing normalization (accents should match with and without them; if normalization currently strips non-ASCII, make it fold accents to plain letters first, and add a test proving English behavior is unchanged):

`quiero morir` · `me quiero morir` · `quiero matarme` · `me voy a matar` · `quitarme la vida` · `suicidarme` · `no quiero vivir`

Update `SAFETY_TEST_MATRIX` (add a Spanish section) and tests. Note for the clinician: request a reviewed Spanish YELLOW list and a review of these entries.

## D. Research-backed additions (OWNER-APPROVED INTERIM)

### D1. Veteran line
On the first crisis screen, the full crisis screen, and Connect, directly under the 988 buttons:

> **Veteran or service member? Call 988 and press 1.**

### D2. Night mode (clock-based, nothing tracked)
Active from 00:00 to 05:59 local time, read from the phone clock on each render. Nothing about it is saved.

- Home: one calm line under the tagline, in the existing secondary text style: **"It's late. Everything feels heavier at night. You don't have to decide anything before morning."** In large text, this line may be hidden to protect the first-screen rule.
- Connect: the Warm Line card shows **"Usually closed right now · opens at 4pm Eastern"** (display only; never disable the button), and moves below "Reach one of your people." 988 moves to the top of Connect. Add a message idea: **"Can't sleep. You up?"** (it already exists; put it first at night).
- Never change crisis screens at night.

Tests: line shows at 01:00, not at 13:00; Warm Line button stays enabled; crisis screens identical at night and day.

### D3. Alcohol and drugs line
On `crisis-no` and the full crisis screen, below the existing options, one plain line:

> **Been drinking or using? Alcohol and drugs can make hard moments feel more final. Don't decide anything tonight, and try to be near someone.**

It's information only, not a question, and nothing is saved.

### D4. Someone who isn't police
On the full crisis screen, below the 988 buttons and the veteran line:

> **Want someone to come to you who isn't police?** In many Florida counties, 211 can connect you to a mobile crisis team. [Call 211]

Mark the wording for clinician review and add a row to `CRISIS_RESOURCE_VERIFICATION.md` (owner to confirm local availability).

### D5. Reasons to stay (My Plan section)
A new My Plan section, **"Reasons to stay"**, placed right after "Things that help me." It's a list in the person's own words, with a hint: *"People, plans, things you're looking forward to, songs, anything."* If the person has songs in My songs, show a small link: "Your songs are here too."

- Plan field: exempt from `safetyCheck`, saved with the plan, included in Export, wiped by Delete everything.
- Shown on "I need my plan now" (after "Reach a person") and on the full crisis screen as a small **"Your reasons to stay"** card below the people and places — only if the person has filled it in.

### D6. Respectful gun-storage wording
In the time-and-distance plan help text, and in the supporter guide's "Time and distance" section, add (respectful of gun owners; no other methods named anywhere):

> **If there's a gun at home:** the safest step during hard times is to store it away from the person for a while — with someone you trust, or at a gun shop, range, or police department that offers temporary storage. It's temporary, and it's yours.

Do not add this line to crisis screens. Clinician review required.

## E. Small copy additions

1. **Tagline:** "Your mind doesn't move in a straight line." on the About page and on the first onboarding screen, below the welcome line.
2. **Product promise** on About: "We'll help you find something you can do next. If one direction doesn't help, we'll try another."
3. **"Something else" shows five directions:** on the recommendation screen, tapping "Something else" shows five buttons — Body · Space · Sense · People · Action — each with its plain line ("Change something physical," "Change where you are," "Give your senses something to do," "Reach a person," "One tiny thing"). Tapping one picks the best eligible step in that channel with the existing engine. YELLOW priority still wins; ridiculous mode stays hidden when it should be.
4. **Tiny-signal texts** in Connect's message ideas: "Hey. Just saying hi." · "Got a minute?" Note under them: "You don't have to explain anything."
5. **Be around people:** a Connect option, "Be around people, no talking needed" → one screen: "You don't have to talk. Sit with someone at home, or go somewhere familiar with people around." with the existing Maps "Somewhere to go" buttons. Channel PEOPLE.
6. **Window:** a Change the scene option, "Go to a window" → "Look outside for one minute. You don't have to notice anything in particular." Channel SPACE.
7. **"Still need me?"** On the "You're ready / Put the phone down" screen, add an optional "Put it down for one minute" button → a calm screen with a soft one-minute timer → "Still need me?" Yes → Home. No → "Good. Go live your life for a bit." and nothing else.
8. **"I don't know what I need"** opens with: "That's okay. We don't need to name it." (replaces "That's okay. One question."; keep the 10% line and the four choices).

## F. Report

Report: what changed per part (A–E), anything you could not do exactly as written and why, the "stay with" search results from A3, tests added, final `npm test` count. Then stop.
