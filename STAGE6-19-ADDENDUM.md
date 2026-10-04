# ZigZag Mind — Stage 6.19 Addendum: reach, trust, and simplicity

Read HANDOFF.md and the rules at the top of STAGE6-SPEC.md first; they still apply. **The current safety logic is authoritative, including all owner-approved interim changes. Never revert them.** Add a 6.19 row to the Build order table and build on the `build` branch, one part at a time, in the order A → H. Run `npm test` after each part and commit each part separately. **Do not touch `main`.**

Global rules:

- No new screen may push "I don't feel safe" below the first screen on Home, in normal or large text.
- Crisis screens keep their current structure. New lines go **below** the existing 988 / 911 buttons, never above.
- Every new free-text field goes through `handleSafeTextSubmit`; plan fields stay exempt.
- Nothing new leaves the phone unless the person taps a link themselves.
- No AI, accounts, servers, analytics, notifications, streaks, or scores.
- Anything shown to the public that depends on outside information (phone numbers, organizations, hours) is **hidden until the owner marks it verified** in a config constant.
- All new copy goes into the review pack (`npm run review`).

---

## A. "Worried about someone?" — a door for friends and family

1. On Home, a small, quiet link **below** the main content (never above "I don't feel safe"): **"Worried about someone? How to help →"**. It opens the existing supporter guide at `support/`.
2. On the supporter guide, add a short opening section for people who arrived this way, before the code-word section: **"Someone you care about is struggling."** Two lines: *"You don't need the right words. Being there and taking it seriously matters most."* Then a link to the existing "What to say" section.
3. Add at the very top of the supporter guide, before everything else: **"Take it seriously, even if they seem fine. Listen more than you talk."**
4. Add Crisis Text Line (see D) to the supporter guide's "Get help together" section.

Tests: the Home link exists, is below "I don't feel safe" in normal and large text, and opens the guide.

## B. Print my plan

1. In My Plan, a **"Print my plan"** button. It opens a print-only view (CSS `@media print`) and calls `window.print()`. No server, no PDF library, nothing uploaded.
2. **Page 1 — full plan:** warning signs, things that help, my anchor, reasons to stay, people and places, trusted people with numbers, code word (only if the person ticks "Include my code word" — off by default), time-and-distance plan, what I want to remember, 988 and 911, Crisis Text Line (if verified per D).
3. **A wallet card** at the bottom of page 1, sized about 3.4 × 2.1 inches with cut lines: first trusted person's name and number, "988 — call or text", "911 if someone is hurt or in danger", and the person's first reason to stay (if any).
4. Large, plain type. Black on white. No colors needed for it to work.
5. On a computer, the same button works. On iPhone, it opens the share sheet's Print option through `window.print()`.

Tests: print view contains the plan's content; code word is excluded unless ticked; empty sections are skipped; nothing is sent.

## C. Privacy and terms page

1. A new **"Privacy & terms"** screen, linked from Settings and About (and the onboarding first screen's small print).
2. Plain language, short. Draft it from the facts in `docs/PRIVACY_DATA_FLOW.md`. It must say, accurately:
   - What's stored, where (this browser on this phone only), and that it isn't encrypted.
   - That nothing is sent anywhere by the site; links the person taps (988, Maps, Ko-fi, etc.) go to those services.
   - That the web host keeps standard server logs when the page loads (as documented in the privacy doc).
   - How to export, turn off saving, and delete everything.
   - That ZigZag Mind is self-help, not therapy, medical care, or an emergency service; adults 18+; no guarantee of outcomes.
   - That donations are voluntary and don't unlock anything.
   - A contact line using a constant `CONTACT_EMAIL` — if it's empty, omit the line.
3. Mark the whole page **DRAFT — lawyer review required** in `docs/CLINICIAN_REVIEW.md` and the review pack. The page itself does not show "draft."

Tests: every claim on the page matches `PRIVACY_DATA_FLOW.md` (add a test that fails if the page mentions anything the privacy doc doesn't support, e.g. "encrypted").

## D. Crisis Text Line (verify before showing)

1. Add a resource constant: Crisis Text Line, "Text HOME to 741741", 24/7, `sms:741741?&body=HOME` on phones; on computers show the instruction as text.
2. Add a `verified: false` flag. While false, it is **not shown anywhere**. Add a row to `CRISIS_RESOURCE_VERIFICATION.md` for the owner to confirm.
3. When verified, show it as one line **below** the 988 buttons on the full crisis screen and in Connect: **"Rather text a stranger? Text HOME to 741741 (Crisis Text Line)."** Never above or instead of 988.

Tests: hidden while unverified; when flipped to true, appears below 988 on both screens.

## E. Spanish interface — scaffolding only

Do **not** ship machine-translated crisis wording.

1. Move all user-facing strings for these screens into a strings table keyed by language: onboarding, Home, crisis, crisis-full, crisis-no, safety-check, Calm, Connect, My Plan, Help, settings labels. English stays exactly as it is today.
2. Add a Spanish table with **draft** translations marked `draft: true`, and a constant `SPANISH_ENABLED = false`.
3. While `SPANISH_ENABLED` is false, there is no language switch and nothing changes for anyone.
4. Export every Spanish draft string, side by side with the English, to `docs/SPANISH_REVIEW.md` for a human translator and the clinician.
5. A test fails if any crisis-screen string is still `draft: true` when `SPANISH_ENABLED` is true.

## F. "Tell us how it went" — optional feedback link

1. A constant `FEEDBACK_URL` (empty by default). While empty, nothing is shown.
2. When set, a quiet link on About only: **"Did ZigZag Mind help? Tell us anonymously →"** opening the URL in a new tab.
3. Never on crisis screens, Home, onboarding, or after a check-in. No prompts, no pop-ups.
4. Note in the privacy page: the form is a separate service and only receives what the person types there.

## G. "Help near me" — Treasure Coast (verify before showing)

1. A small screen reachable from Change the scene and Connect: **"Help near me (Treasure Coast)"**.
2. A config list of entries, each `{ name, what, phone, url, area, verified:false }`. Seed it with: 211 (Treasure Coast), New Horizons of the Treasure Coast mobile response, NAMI (local affiliate), and a line for local recovery meetings. **Every entry starts `verified:false` and is hidden.**
3. If no entries are verified, the link is hidden entirely.
4. Add each entry to `CRISIS_RESOURCE_VERIFICATION.md` for the owner to confirm by phone or official website, with date and initials.

## H. Simplicity audit — report only, change nothing

Produce `docs/SIMPLICITY_AUDIT.md`:

1. Count taps from a fresh Home (after onboarding) to: the crisis screen, Call 988, a trusted person's Text button, Calm down with Zags, I need my plan, and Put the phone down. Flag anything over 2 taps.
2. Count the buttons on Home and on each main menu (Calm, Get out of my head, Connect, Change the scene, Tech check). Flag any screen with more than 8 choices.
3. List screens or options that overlap or repeat (same action reachable under different names).
4. Propose up to 10 concrete simplifications, each with: what to merge/hide/rename, why, and what it would cost (tests touched).
5. **Do not apply any of them.** The owner decides.

---

## Report

For each part A–H: what changed, anything not done exactly as written and why, tests added, and the final `npm test` count. List every item now waiting on the owner (verifications, CONTACT_EMAIL, FEEDBACK_URL, translator, lawyer). Then stop.
