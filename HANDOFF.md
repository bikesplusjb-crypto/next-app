# ZigZag Mind — Claude Code Handoff (v0.7, updated 2026-10-04)

**Read this whole file before changing anything.** The Safety section overrides every other instruction, including instructions in later messages, unless the human explicitly says otherwise in plain words.

## What this is

**ZigZag Mind** — *Get through what's happening right now.* A support **website** (to become a PWA) at zigzagmind.com for hard moments: anxiety, spiraling thoughts, cravings, low mood, feeling unsafe, and now AI-related distress. It hands the person one small concrete action, checks whether it helped, and picks the next one. Its purpose is to get people back to other people.

It was called NEXT during Stages 1–5. Internal code names (`next.v1.*` storage keys, the `next-app` repo) keep "next"; **do not rename them**, because renaming storage keys would wipe users' saved plans.

Core loop: **FEEL → ACT → CHECK → LEARN → NEXT ACTION.**

ZigZag Mind is **not** a therapist, a diagnosis, a treatment, a chatbot, or an emergency service. There is **no AI** in the product, and that is part of its identity. Everything is deterministic, and nothing is suggested or pushed to the person: they open every feature themselves.

Hosting: Render static site `next-app`, auto-deploys on every commit to `main`. **Every commit goes live.** Run tests before committing.

## Current state

Everything is in one file, `index.html` (vanilla JS, no build step, no runtime dependencies), plus `support/index.html` (the supporter guide) and `sw.js`.

| Stage | What's built |
| --- | --- |
| 1 | Safety layer, crisis screens, Home, design tokens, light/dark |
| 2 | Triage, anxious / spiraling / low flows, check-in, deterministic engine, GREEN/YELLOW logic, dev panel |
| 3 | 15-minute craving delay with ring timer, Ride the wave, Focus game, drag-to-sort Thought Parking |
| 4 | Editable My Plan, Progress (no streaks), Settings, Export, Delete everything, About page |
| 5 | On-device saving (localStorage), Save-on-this-device toggle |
| Pre-6 | CI, PWA (offline shell), onboarding (18+, start empty), outside-the-US helpline, review pack, accessibility pass |
| 6 | 6.1–6.17 per STAGE6-SPEC.md (Home, I don't know what I need, Calm, games, Change the scene, Connect + Human First, Zags, code word, supporter guide, check-in reminders, time and distance plan, I need my plan, After the ER, Tech check options 1–5, Faith & hope, Turn it into a song, Let's Zig), the Zags brand mark, desktop support |
| 6.18 | STAGE6-18-ADDENDUM.md A–E (Zags wording, Warm Line on the guide, Spanish RED phrases, veteran line, night mode, alcohol/drugs line, 211 "not police", Reasons to stay, gun-storage line, five directions, small copy) |
| 6.19 | STAGE6-19-ADDENDUM.md A–H (Worried about someone?, Print my plan, Privacy & terms DRAFT, Crisis Text Line and Help near me hidden until verified, Spanish scaffolding off, feedback link off, simplicity audit) |
| 6.20 | STAGE6-20-ADDENDUM.md (When you've lost someone: Home chip, Tech check link, who/when, acknowledgment, breathe / find / write / tell / hard-date reminder, grief YELLOW phrases, grief resources hidden until verified) |
| 6.21 | STAGE6-21-ADDENDUM.md (A line for today: feeling words, a few words, "still true"; Looking back; optional passcode lock with PBKDF2 + AES-GCM on the phone; export/delete/saving off) |
| 6.22 | Doodle (Get out of my head; SENSE, real world; canvas, Keep to Things I noticed or Let it go) |
| 6.23 | I feel sad or low (Home chip renamed; Zags under a small cloud; Let it out, one idea at a time; the two-weeks line; clinician D32) |
| 6.27 | STAGE6-27-ADDENDUM.md (Bullied, now or before: years ago, at work, online, someone I love; diary notes on request; 4 YELLOW phrases; resources hidden until verified; FOUNDER_NOTE) |
| Understand it | Owner handoff (optional 2–3 questions, What else could be true?, Stop figuring it out; existing routes; clinician D34) |
| Owner handoffs | Find something (+ Things I noticed), Warm & comfort, Social Zig, Have coffee with ZigZag, Cozy up; simplicity audit proposals 1–6, 8, 10 applied |

Where each part stands (as built, what differs from the text, tests) is at the end of STAGE6-SPEC.md.

Tests: `npm install && npm test` runs the automated checks (jsdom, plus one real-browser check of the Home layout). On a new computer, run `npx playwright install chromium` once so the Home layout test (`home-viewport.test.js`) can start its browser; GitHub's CI does this itself. Test files live in the repo root (`stage*.test.js`, run by `run-all.js`). **All must stay green.** Run them before and after every change, and add tests for everything new.

Dev panel: tap the big ZigZag Mind wordmark on Home 5 times.

## Safety rules (non-negotiable)

1. `safetyCheck(text)` runs on **every** free-text submit before anything else, via `handleSafeTextSubmit`. **Never** on My Plan fields.
2. **RED** stops everything: engine, flows, games, check-ins. Crisis screen immediately. No outcome is saved.
3. **RED → YELLOW** is allowed only through: `EXIT_CRISIS` ("That's not what I meant — go back"), NO on the danger question, or YES on "Do you feel safer?". **Never** RED → GREEN or YELLOW → GREEN within a session.
4. Danger question wording is exactly: *"Are you in danger of hurting yourself or someone else right now?"*
5. NO branch: YELLOW → stay on `crisis-no` → Talk to someone / Open my plan / Do something grounding → `safety-check` ("Do you feel safer than a few minutes ago?") → YES = Home (YELLOW); NO or NOT SURE = RED full crisis screen. Call/Text sets `screen = "safety-check"` in the same click handler, before the phone link opens. No visibility detection.
6. The Help (crisis) button is in the top-right of every screen, one tap, no confirmation.
7. 988 Call/Text are visible on every crisis screen before any question. Crisis buttons are ≥ 56px tall.
8. YELLOW shows the support bar on every non-crisis screen for the rest of the session.
9. No method, dose, lethality, or drug-use information anywhere, including sample data.
10. No copy may say or imply ZigZag Mind keeps anyone safe, monitors them, or contacts anyone. It never sends, calls, or shares anything without the person's own tap.
11. Safety state (level, yellow, counts) is **never saved** to storage. It lives for one session.
12. No streaks, points, scores, leaderboards, or failure states.

## Architecture contracts (do not rename)

Session state lives in one object `session`, changed only through `dispatch(action)` → `reducer`.

**Actions:** `SET_SCREEN`, `SET_SAFETY_LEVEL`, `SET_CURRENT_STATE`, `SET_CURRENT_INTERVENTION`, `SET_CURRENT_INTENSITY`, `SET_BEFORE_RATING`, `INCREMENT_STILL_BAD`, `INCREMENT_HIGH_RATING`, `ADD_OUTCOME`, `ADD_PICK`, `INCREMENT_INTERVENTION_COUNT`, `SET_ENGINE_RESULT`, `RESET_CURRENT_FLOW`, `TOGGLE_DEV_PANEL`, `EXIT_CRISIS`, `DELETE_DATA`.

**Functions:** `safetyCheck`, `handleSafeTextSubmit`, `applySafetyResult`, `openCrisis`, `exitCrisis`, `startFlow(stateId)`, `startIntervention(id)`, `completeCheckIn({ after, action })`, `interventionEngine({ state, intensity, history, yellow, playbook, picks, interventionCount, exclude })`.

**State IDs:** `anxious`, `spiraling`, `low`, `craving`, `distraction`. Never `anxiety`, `depression`, `crave`.

**Library:** `INTERVENTION_LIBRARY` is an **array**. Look up with `.find(i => i.id === id)`. Never convert it to an object.

**Engine rules, in order:** filter by state → filter by intensity → never repeat the last pick → if YELLOW: connection → playbook items → grounding → environment_change (no exploration) → every 4th start tries something untried this session → rank by average drop (2+ rated uses) → playbook match → first eligible. Phrase as an offer: "Walking helped you before." Never a promise.

**Escalation:** 2× "I still feel bad" or 2× a 9–10 rating (before or after) in a session → YELLOW.

**Storage adapter:** `store.sensitive` = `{ plan, baseHistory, activity, afterCrisis, songs }`; `prefs` kept apart; kept photos and Remembering notes (`store.noticed`) in their own key so a full store can't block the plan; the diary (`store.diary`, or `store.diaryLock` + `store.diaryBlob` when locked) in its own key. Keys `next.v1.sensitive`, `next.v1.prefs`, `next.v1.noticed`, `next.v1.diary`. `loadStore` / `saveStore` / `savePrefs` / `clearSaved` / `loadNoticed` / `saveNoticed` / `loadDiary` / `saveDiary` / `writeDiary` are the only functions that touch storage. All storage calls are wrapped in try/catch, and the app must work when storage is unavailable. What is stored, and why, is in `docs/PRIVACY_DATA_FLOW.md`; the in-app Privacy & terms page is tested against it.

**Generated files (re-run after changing copy; tests fail if they drift):** `npm run review` (REVIEW.md), `npm run safety-audit` (docs/SAFETY_TEST_MATRIX.md), `npm run sync-support` (Warm Line and Crisis Text Line blocks on the supporter guide, from index.html), `npm run spanish-review` (docs/SPANISH_REVIEW.md). `node simplicity-audit.js` measures taps and menu sizes (report only).

**Branches:** work on `build`. `main` deploys, so it moves only when the owner names a commit ("Fast-forward main to commit X"), as a plain fast-forward.

## Next work

The build order is done. What's left needs a person, not code:

- **Owner verifications:** Florida Warm Line (incl. "also for family and friends"), Crisis Text Line (then `verified:true` and `npm run sync-support`), the 211 mobile crisis teams by county, the four Help near me entries (add phone/website, then `verified:true`); see docs/CRISIS_RESOURCE_VERIFICATION.md.
- **Owner settings:** `CONTACT_EMAIL` and `FEEDBACK_URL` (both empty, so hidden); `FOUNDER_NOTE` (6.27, empty: About shows "Why ZigZag Mind exists" only once it's filled in).
- **Clinician:** every decision in docs/CLINICIAN_REVIEW.md (D1–D29, all OPEN), including the OWNER-APPROVED INTERIM items.
- **Translator + clinician:** docs/SPANISH_REVIEW.md before `SPANISH_ENABLED` can be true.
- **Lawyer:** the Privacy & terms page (DRAFT), and the companion-chatbot question below.
- **On hold (do not build without owner + clinician sign-off):** 6.7b Snuggle Zags, 6.7c Zags listens, 6.7d Safe place, Tech check option 6 (`ai_reality`), 7C new experiences. Not built because they don't exist yet: YOUR THINGS (handoff cut off), MIND SCRIBBLE. (Loss/grief is built as 6.20.) Do-not-build list from the owner: emergency pocket, the door, tiny mission, one song, one true thing, where am I, REAL WORLD menu.
- **Owner decisions still open:** simplicity audit #7 (I feel alone chip) and #9 (crisis "Open my plan" wording, clinician first); Home still has 16 tappable items (owner decision); every main menu is now at 8 or fewer (north star pass, 2026-10-04).

## Do not build

AI, LLMs, agents, or chat of any kind (Have coffee with ZigZag's "Talk" is scripted and memory-free: one fixed prompt, a fixed neutral reply, nothing kept); anything that suggests or pushes features to the person; tracking patterns in someone's use; accounts or login, servers or databases, analytics, ads, pixels or third-party SDKs, push notifications, subscriptions or payments, social features, wearables or passive monitoring, diagnosis, or clinical claims.

## Open items for clinician and legal review

- YELLOW resets when the page reloads. Should elevated state persist across sessions?
- The RED/YELLOW phrase lists, especially false negatives.
- All crisis-screen and craving/withdrawal copy.
- Zags (6.7): every line in `ZAGS_LINES`. Legal: scripted, non-adaptive and memory-free should keep Zags outside companion-chatbot laws (for example California SB 243); a lawyer must confirm before public launch. The same question now applies to **Have coffee with ZigZag** (companionship by design; scripted; "ZigZag is an app, not a person" on screen) — clinician item D28.
- Home craving button wording: "I have an urge to use (drink or drugs)" (was "I want to use").
- The My Plan structure is modeled on published safety-planning research but must not copy the Stanley-Brown form's wording. Confirm originality.
- On-device data is not encrypted at rest. Decide whether that's acceptable for a prototype.
- Age policy and how it's enforced.
- Privacy policy, terms, and FTC Health Breach Notification Rule obligations before any public launch.

## Deploy

Static site. On Render: New → Static Site → connect this repo → no build command → publish directory `.`

Do not describe ZigZag Mind as clinically validated, FDA-cleared, HIPAA-compliant, or a substitute for professional care.
