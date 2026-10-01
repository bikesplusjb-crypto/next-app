# NEXT — Claude Code Handoff (v0.5)

**Read this whole file before changing anything.** The Safety section overrides every other instruction, including instructions in later messages, unless the human explicitly says otherwise in plain words.

## What this is

NEXT — *Get through what's happening right now.* A self-help support tool for hard moments: anxiety, spiraling thoughts, cravings, low mood, and feeling unsafe. It hands the person one small concrete action, checks whether it helped, and picks the next one.

Core loop: **FEEL → ACT → CHECK → LEARN → NEXT ACTION.**

NEXT is **not** a therapist, a diagnosis, a treatment, a chatbot, or an emergency service. There is **no AI** in the product. Everything is deterministic.

## Current state

Stages 1–5 are built and working in one file: `index.html` (vanilla JS, no build step, no dependencies at runtime).

| Stage | What's built |
| --- | --- |
| 1 | Safety layer, crisis screens, Home, design tokens, light/dark |
| 2 | Triage, anxious / spiraling / low flows, check-in, deterministic engine, GREEN/YELLOW logic, dev panel |
| 3 | 15-minute craving delay with ring timer, Ride the wave, Focus game, drag-to-sort Thought Parking |
| 4 | Editable My Plan (8 sections), Progress (no streaks), Settings, Export, Delete everything, About page |
| 5 | On-device saving (localStorage), Save-on-this-device toggle |

Tests: `npm install && npm test` runs 76 automated checks across all stages (jsdom). **All must stay green.** Run them before and after every change.

Dev panel: tap the big NEXT wordmark on Home 5 times.

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
10. No copy may say or imply NEXT keeps anyone safe, monitors them, or contacts anyone. NEXT never contacts anyone automatically.
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

**Storage adapter:** `store.sensitive` = `{ plan, baseHistory, activity }`; `prefs` kept apart. Keys `next.v1.sensitive` and `next.v1.prefs`. `loadStore` / `saveStore` / `savePrefs` / `clearSaved` are the only functions that touch storage. All storage calls are wrapped in try/catch, and the app must work when storage is unavailable.

## Next work, in this order

Do one step per session. Run `npm test` before you start and when you finish. Add tests for anything new. Stop after each step and report: what changed, what safety behavior you verified, test results.

1. **CI.** Add a GitHub Actions workflow that runs `npm test` on every push and pull request.
2. **PWA.** Add `manifest.webmanifest`, icons (original design, sage-teal leaf on warm paper), and a service worker that caches `index.html` so the app — and especially the crisis screens — open with no connection. `tel:` and `sms:` links must still work offline. Don't cache anything sensitive in the service worker.
3. **Onboarding (first launch only).** Three short screens: what NEXT is and isn't (not an emergency service, with 988 visible), an 18+ confirmation, and an offer to build My Plan now or later. Remember completion in prefs only.
4. **Start empty for real users.** First launch should start with an empty plan and no sample history. Keep "Load sample data" in Settings for demos. Update tests that assume sample data on boot.
5. **Outside the US.** Use `Intl.DateTimeFormat().resolvedOptions().timeZone` and `navigator.language` as a hint only. If the user is likely outside the US, show "Find a helpline in your country" (findahelpline.com) next to 988 on crisis screens. Never hide 911/988 based on a guess. Add a Settings override for country.
6. **Accessibility pass.** Test with VoiceOver on iOS at 200% text. Fix focus order, labels, and anything that breaks layout. Add a reduced-motion check for every animation.
7. **Clinician review pack.** Generate `REVIEW.md` listing, verbatim: both safety phrase lists, every crisis-screen string, the full intervention library, all flow copy, and the escalation rules, so a licensed clinician can review every word in one place.

## Do not build

AI or chat of any kind, accounts or login, servers or databases, analytics, ads, pixels or third-party SDKs, push notifications, subscriptions or payments, social features, wearables or passive monitoring, diagnosis, or clinical claims.

## Open items for clinician and legal review

- YELLOW resets when the page reloads. Should elevated state persist across sessions?
- The RED/YELLOW phrase lists, especially false negatives.
- All crisis-screen and craving/withdrawal copy.
- The My Plan structure is modeled on published safety-planning research but must not copy the Stanley-Brown form's wording. Confirm originality.
- On-device data is not encrypted at rest. Decide whether that's acceptable for a prototype.
- Age policy and how it's enforced.
- Privacy policy, terms, and FTC Health Breach Notification Rule obligations before any public launch.

## Deploy

Static site. On Render: New → Static Site → connect this repo → no build command → publish directory `.`

Do not describe the app as clinically validated, FDA-cleared, HIPAA-compliant, or a substitute for professional care.
