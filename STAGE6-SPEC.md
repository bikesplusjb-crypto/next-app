# ZigZag Mind — Stage 6 Spec (merged)

**Read HANDOFF.md first. Its Safety rules override everything in this file.**

**Visual reference:** `mockup.html` shows every Stage 6 screen (22 phone screens). Match its look, structure, copy, and tone. `zags-preview.html` is the reference for Zags's animation and script, and `song-preview.html` for Turn it into a song (6.16). Neither file is shipped: build every screen inside `index.html` using the existing architecture, safety layer, storage adapter, and tests.

## Why Stage 6 exists

Stages 1–5 built a solid version of what already exists. That category mostly fails people: the median mental health app keeps about 3% of users after 30 days, and standalone apps show no significant effect on suicidal thoughts.

What the evidence points to instead:

- **Other people.** Caring contacts (short, non-demanding messages from someone who cares) are one of the few interventions shown to reduce suicide attempts. Two-way human messages outperform automated ones.
- **Feeling like a burden stops people reaching out.** Lower the cost of asking for help to one tap.
- **Time and distance from lethal means** is among the most effective ways to reduce suicide deaths.
- **The weeks after an ER visit or hospital discharge** carry sharply elevated risk.
- **Technology itself is now part of the problem for many people:** compulsive checking, reassurance-seeking, AI attachment, grief when an AI changes, and AI job fear. Almost nothing serves this.

## The product model

**FEEL → ORIENT → ACT → CHECK → CONNECT → NEXT.**

What's happening → what kind of moment is this → one safe step → did anything change → does this need a person → leave the app and get on with life.

ZigZag Mind is comfortable with people leaving. That is the goal, not a failure. Its line: *"I'm here to help you get through this moment, not to replace the people in your life."*

## Rules for every Stage 6 feature (non-negotiable)

1. **Person-initiated only.** Nothing is suggested, pushed, or shown automatically across visits. No agent, no "next step" cards, no tracking of patterns between visits.
2. **Prepare, never send.** Flows may draft messages, build calendar files, and fill in forms. Only the person sends, calls, or shares. ZigZag Mind never contacts anyone.
3. **No AI or LLM anywhere.** Zags is scripted.
4. **One crisis system.** Every new feature feeds into the existing GREEN/YELLOW/RED architecture, `openCrisis()`, and the NO-branch/safety-check flow. Never build a second crisis path. Every flow checks `blockIfRed()`.
5. **Free text runs through `safetyCheck`** via `handleSafeTextSubmit`. My Plan fields stay exempt.
6. **No engagement mechanics:** no streaks, points, scores, rewards, levels, leaderboards, endless content, "come back tomorrow" pressure, or notifications.
7. **No diagnoses or labels**, and no claims that ZigZag Mind keeps anyone safe.
8. **Everything stays on the device**, using the existing storage adapter and keys.
9. **Help stays one tap away** on every new screen.
10. **Never delete a safety test.** When a change replaces a flow (for example the old triage), replace its tests with equivalent ones in the same commit.

**Reusable step types** for guided flows (one step per screen, large type, Help visible): `info`, `choose_person`, `choose_word`, `compose_sms` (opens `sms:` with a prepared body), `download_ics` (builds a calendar file on-device), `share_link` (Web Share API, falling back to copy), `checklist`, `text_input` (through `handleSafeTextSubmit`), `confirm` ("Did you send it?").

## Build order — one part per session, in the order of this table; stop and report after each

| Phase | Part | Feature |
| --- | --- | --- |
| 1 Core | 6.1 | New Home |
| 1 Core | 6.2 | I don't know what I need |
| 1 Core | 6.3 | Calm |
| 1 Core | 6.4 | Get out of my head (games) |
| 1 Core | 6.5 | Change the scene |
| 1 Core | 6.6 | Connect (I just feel alone) + Human First |
| 2 Zags | 6.7 | Zags, the calm-down guide |
| 2 Zags | 6.7b | Snuggle Zags |
| 2 Zags | 6.7c | Zags listens (proposed) |
| 2 Zags | 6.7d | Safe place (proposed) |
| 2 Zags | 6.16 | Turn it into a song |
| 3 People & safety | 6.8 | Code word |
| 3 People & safety | 6.9 | Supporter guide page |
| 3 People & safety | 6.10 | Check-in reminders |
| 3 People & safety | 6.11 | Time and distance plan |
| 3 People & safety | 6.12 | I need my plan (essentials view) |
| 3 People & safety | 6.13 | After the ER or hospital (30 days) |
| 4 Tech check | 6.14 | Tech check (AI, checking, scrolling) |
| 5 Faith | 6.15 | Faith & hope (opt-in) |

---

## Phase 1 — Core

### 6.1 New Home (mockup: Home)

Top to bottom:

1. Top bar with the Help button (unchanged behavior).
2. Wordmark "ZigZag Mind" and "Get through what's happening right now." The 5-tap dev panel stays on the wordmark.
3. The warm-clay card, directly under the tagline: **I don't feel safe** — "Get to a real person fast" → `openCrisis()`. It must be on the first screen without scrolling at 390×844, in normal and large text (`home-viewport.test.js`).
4. One big primary button: **I don't know what I need** (6.2).
5. A 2×2 grid of the four escape routes: **Calm down** (6.3), **Get out of my head** (6.4), **Connect** (6.6), **Change the scene** (6.5). Each has a small inline stroke icon (no emoji).
6. "Or tell me what's happening" with chips that open the **existing** flows: I'm anxious · I'm spiraling · I have an urge to use (drink or drugs) · I feel low · I feel alone (6.6) · Just out of the ER (6.13).
7. A row: **Tech check** — "AI, scrolling, or checking is getting to me" (6.14).
8. Bottom tabs: Home · My Plan · Progress · Settings.

The YELLOW bar and the 30-day bar (6.13) still appear above content when active. Home must fit a 390×844 screen without the critical items (Help, I don't know what I need, I don't feel safe) falling below the fold.

**Tests:** every Home control routes to the right flow; "I have an urge to use (drink or drugs)" still reaches the craving delay; "I don't feel safe" still calls `openCrisis()`.

### 6.2 I don't know what I need (mockup: DontKnow)

Replaces the old six-option triage. One screen, one question:

> That's okay. One question. Do you want to calm down, get distracted, connect with someone, or get out of where you are?

Four large options → Calm / Get out of my head / Connect / Change the scene. Below them: "Scared of what you might do? **Get help now**" → `openCrisis()` (RED, no extra screen).

**Tests:** each option routes correctly; the "Get help now" link sets RED and shows the crisis screen immediately (this replaces the old "I'm scared of what I might do" triage test).

### 6.3 Calm (mockup: Calm)

A short menu, one featured option:

- **Calm down with Zags** (6.7) — featured card with a small Zags.
- Breathe for 1 minute (existing breathing intervention).
- 5-4-3-2-1 grounding (existing Ground game).
- Feet on the floor (existing anxious step sequence).
- Secondary button: "I'd rather talk to someone" → Connect.

All end at the existing check-in.

### 6.4 Get out of my head (mockup: Distract, Game)

"Quick games to interrupt the loop. 1 to 5 minutes. No points, no levels." Six games, each a new intervention in `INTERVENTION_LIBRARY` (ids prefixed `distraction_`). Keep the existing Focus game available here too.

- **Color hunt** (`distraction_color_hunt`): find 5 blue things (tap a dot each), then 3 red.
- **Around me** (`distraction_around_me`): find something soft, something cold, something rectangular, something older than you, something that makes a sound. Tap each when found.
- **Rapid categories** (`distraction_categories`): name 5 animals, then 5 cities, then 5 foods, out loud or in your head. A tap counter, no typing.
- **Memory snap** (`distraction_memory`): show 6 simple drawn shapes for 5 seconds, hide them, then show 12 and let the person tap the ones they remember. Then reveal the answers. Never show a count or score.
- **Pattern break** (`distraction_pattern`): 4 soft pads light up in a sequence of 4; the person taps it back. A wrong tap just replays the pattern gently. No fail state.
- **60-second challenge** (`distraction_60_second`): "For the next 60 seconds, your only job is to beat the timer," using the Focus game mechanic.

Each game ends with "Did the intensity change?" **Yes / A little / No**, which feeds the existing check-in and engine. "Thoughts stuck on repeat? **Break the loop**" links to 6.14.

**Tests:** each game completes and reaches check-in; no game shows a number that judges performance; games respect reduced motion.

### 6.5 Change the scene (mockup: ChangeScene)

> Sometimes your brain needs a different place, not another question. Pick one.

Five options (`change_scene` intervention): step outside for 5 minutes · take a short walk · sit somewhere different · take a shower · get something to drink. Picking one shows it full-screen with Done, then check-in.

**Somewhere to go** — buttons that open the phone's own Maps app with a search, so ZigZag Mind never sees or sends location: Library · Park · Coffee shop · Community center. Use `https://maps.apple.com/?q=library` on Apple devices and `https://www.google.com/maps/search/library` elsewhere (detect platform from the user agent; no geolocation API, no places API, no server).

**Need real-world help near you?** "211 connects you to local help: food, housing, support groups. Free." → `tel:211`.

Never label a library, park, or café as a crisis service. Crisis help stays separate (Help, 988, 911).

**Tests:** Maps links contain no location data; no use of `navigator.geolocation`; 211 link correct.

### 6.6 Connect — I just feel alone (mockup: Connect)

Reached from the Connect route and the "I feel alone" chip.

1. **Talk to someone who's been there:** Florida Warm Line, `tel:18009451355`, "Every day, 4pm–10pm. Not a crisis line. Just real people who've been through it." Plus "After 10pm or outside Florida: find a warmline near you" → findahelpline.com. Hours are display text only; never disable the button by clock. Keep number and hours in one config constant.
2. **Reach one of your people:** trusted people with Text and Call; the code word button if set (6.8); message ideas that open `sms:` prepared: "Can't sleep, you up?" · "Rough night. Can you talk for 5 minutes?" · "Want to catch up this week?"
3. **Stay with Zags for a few minutes** (6.7): "Until someone calls back."
4. **If it gets heavier:** Call 988 · Text 988.

**Human First prompt (session only):** if, within the current visit, the person taps "Something else" twice, or completes two interventions without choosing "That helped," show once: *"Would talking to a person help more than another answer?"* with Call someone · Text someone · Be around people (→ 6.5 Somewhere to go) · Not right now. Track this only in session state; never save it, never carry it across visits.

**Tests:** warmline link; message ideas prepare the right SMS body; Human First appears at most once per visit and is never written to storage.

**Also include on Connect (added after 6.6 was built):**
- The anti-stigma note `HELP_IS_STRENGTH` ("Getting help is a strength, not a weakness. …"), from its one constant. Not built into Connect yet.
- "Do something kind" (`KIND_WORDS`, `KIND_OFFLINE`; see *Anti-stigma note and helping others* below) as an optional, never-first step. Not built into Connect yet.


### Anti-stigma note and helping others (built after 6.6)

- **`HELP_IS_STRENGTH`** (Text A, anti-stigma): full text in About; My Plan's professionals section shows the first sentence + "Read more" (opens About at the full text). To add to Connect (6.6) and After the ER (6.13).
- **`HELPING_OTHERS`** (Text B): About, next to Text A.
- **"Do something kind"** (optional): offered in the I feel low flow as one tiny step, last, never first or only (not in the engine's library). choose_person → choose_word (`KIND_WORDS`: "Thinking of you" / "Thanks for being in my life" / "Hey, how are you doing lately?" / "Thank you for ___") → compose_sms (Messages opens only on tap; the person sends). Or the no-phone list (`KIND_OFFLINE`). Ends at the usual check-in as `kind_act`. To add to Connect (6.6).
- **Never** on Home, crisis/Help screens, Calm, or the plan opened from a crisis screen, and never when RED. Never framed as a duty; kind acts are never counted; nothing stored about who was messaged or what was said; "Thank you for ___" goes through `handleSafeTextSubmit`.

---

## Phase 2 — Zags

### 6.7 Zags, the calm-down guide (mockup: ZagsBreathe, ZagsCheck; reference: zags-preview.html)

A small, cute character (a soft sage-teal blob with a zigzag tuft) who breathes with you, talks you through a few grounding steps, then points you to a person. **Scripted, not AI.** Taps only; no text box.

**Entry points:** Calm (featured), Connect ("Stay with Zags"), and the Get out of my head menu.

**Session:**

1. "Hi, I'm Zags. I'm not a person, just a little guide. I can stay with you for a few minutes." Said **every** session.
2. Breathing: 4 rounds of in for 4 seconds, out for 6, with Zags gently growing and shrinking and his eyes going calm on the out-breath. "Skip breathing" always available. Reduced motion: 3 rounds and a color fade instead of scaling.
3. Three grounding steps: press your feet into the floor → find one thing that's blue → listen for the farthest sound.
4. "How are you feeling now?" A bit better / Still hard / Worse.
   - A bit better → trusted people + warmline + "I'm okay for now."
   - Still hard (first time) → one more round. Second time → trusted people, warmline, Call/Text 988.
   - Worse → `openCrisis()`.
5. "Bye for now. Go be with your people."

Record a normal check-in outcome with `interventionId: "zags"` (add `zags` to the library for states anxious, low, distraction, and alone).

**Voice:** optional, off by default, browser `speechSynthesis` on the device only. Stops the moment the person taps anything. Hide the toggle if unsupported.

**Zags rules (non-negotiable):**

1. All lines live in one constant, `ZAGS_LINES`, for clinician review. No generated or combined sentences.
2. Zags says he's not a person in every session's first line.
3. No relationship language, ever: never "I love you," "I missed you," "I'm always here for you," "you're special to me," or anything that frames him as a friend or partner.
4. No guilt or pressure when leaving. "Not right now" and close are always available; he never asks anyone to stay.
5. No memory between sessions: never references past sessions, never uses the person's name, never says "welcome back."
6. Every session ends at a human option.
7. RED stops Zags. No Zags on crisis screens. Help visible on every Zags screen.
8. At most two breathing rounds per session.

**Tests:** first line contains "not a person"; `ZAGS_LINES` contains none of the banned phrases; Worse calls `openCrisis()`; second Still hard shows 988; voice off by default.

**Legal note:** scripted, non-adaptive, and memory-free should keep Zags outside companion chatbot laws (for example California SB 243). A lawyer must confirm before public launch.

### 6.7b Snuggle Zags (built)

A short comfort mode. Zags curls up in a blanket and breathes slowly (about 4 seconds in, 6 out); the person matches it.

- **Heartbeat glow:** a soft glow at about 60 per minute.
- **Vibration (Android only):** optional vibration in time with the breathing (`navigator.vibrate`), **off by default** and feature-detected. iPhone shows the glow instead.
- **"Hold me close" tip:** e.g. hold the phone against your chest.
- **Sound:** optional soft sound, **off by default**, on the device only.
- **Reduced motion:** Zags stays still; a slow fading glow only.
- **Length:** 2 / 3 / 5 minutes (default 3). No endless mode.
- **Ending:** one scripted line, "Feeling a bit more settled? I'm here if you need me, and so are your people.", then the normal check-in step and the NO-branch / safety flow.
- **Entry:** Calm and Zags's own start screen.
- **Rules:** `blockIfRed()` first; Help one tap away; no reminders, no "Zags misses you", no counts. Only settings are stored (length, vibration, sound). All lines in `ZAGS_LINES`.
- **For clinician review:** "I'm here if you need me" sits close to the banned "I'm always here for you" (Zags rule 3). Built as written; confirm it's acceptable or reword.
- **As built:** first line "Hi, I'm Zags. I'm not a person, just a little guide. Let's get cozy and breathe slowly."; tip "Hold me close. Rest your phone on your chest and breathe with me."; the buzz is a soft lub-dub with each heartbeat; the sound is a quiet low tone with each heartbeat (Web Audio, no files).

**Tests (when built):** vibration and sound off by default; vibration only when `navigator.vibrate` exists; ends at the check-in; no endless mode; RED stops it; only settings stored.

### 6.7c Zags listens (proposed — spec only, build after 6.7 when its turn comes)

Zags: "I'm listening. Go ahead." over a large text box. **No AI; Zags never replies to the content.**

- After **Done**: one scripted acknowledgment from `ZAGS_LINES` (for example "Thank you for getting that out. That sounds heavy to carry."), plus "I'm not a person, but I'm here while you get it out."
- Then tap choices:
  - "I'm not done — keep listening" (back to the text box)
  - "Let it go" (the text fades and is deleted)
  - "Keep it private" (saved on the device in `store.sensitive`, deletable in Settings)
  - "Help me calm down" (Calm, or Snuggle Zags once built)
  - "I want a real person" (Connect, or `openCrisis()`)
- All text goes through `handleSafeTextSubmit` / `safetyCheck` on **Done** and on **Keep**; RED opens the existing crisis flow.
- Never saved unless the person taps Keep. No reminders, no counts.
- **For clinician review:** the acknowledgment must stay the same whatever the person writes (it never reflects the content). Confirm wording, and where "I want a real person" goes (Connect vs. crisis).

**Tests (when built):** RED text on Done and on Keep opens the crisis screen; nothing stored unless Keep; Let it go deletes the text; the acknowledgment never quotes or reacts to the content.

### 6.7d Safe place (proposed — spec only, build after 6.7 when its turn comes)

**Part A — "My safe place":** built once by the person: where it is, what they see, what they hear, what they smell or feel, who's there (or nobody), and optional words of their own. Saved in `store.sensitive`; editable and deletable.

- "Go to my safe place" reads their choices back, one slow step per screen, with a breathing cue.
- **Every** step has "Stop — I want to come back" → 5-4-3-2-1 grounding, and Help.
- Ends with the check-in step and the safety flow.
- Free text through `handleSafeTextSubmit`.
- **Trauma caution for clinician review:** guided imagery can bring up distressing memories for some people. Confirm the wording, the "Stop" path, and whether to add a note before starting.

**Part B — "Safe places I can go"** (My Plan): a list the person types (name and optional phone).

- No geolocation, no maps API.
- "Call first" (`tel:`) and "Directions" (opens their own Maps app with exactly what **they** typed) only on tap.
- Copy: "This is a safe space. Nothing you type here leaves your phone."
- Note: My Plan already has "People and places that take my mind off things". Decide whether Part B replaces, extends, or sits beside it.

**Tests (when built):** "Stop" on every step goes to grounding; Help on every step; Directions uses only the typed text and no location; nothing leaves the device.

### 6.16 Turn it into a song (reference: song-preview.html)

The person writes three short lines in their own words, and ZigZag Mind turns them into a short song made on the phone. No AI, no server, no recordings. Built after 6.7 because it reuses Zags.

**Entry points:** a featured card at the top of Get out of my head ("Turn it into a song"), a "Make a song while you wait" link on Connect, and **My songs** in My Plan.

**Flow:**

1. "How does it feel right now?" Heavy · Anxious · Angry · Numb · Mixed.
2. Three lines, one per screen, 120 characters max each, with "Type it, or tap the mic on your keyboard to say it." Do **not** use in-browser speech recognition: it sends audio to Apple or Google servers.
   - What's happening?
   - What do you need right now?
   - One thing that's still true
3. Every line goes through `handleSafeTextSubmit`. **RED → `openCrisis()` and no song is made.** YELLOW continues with the support bar.
4. The player: Zags (bobbing, mouth moving on each note), level bars, and the three lines shown karaoke-style with the current word highlighted. Voice is **off by default**; when on, the device's own `speechSynthesis` reads each line at the start of its section.
5. After the song: "You turned a hard moment into something you made." → **Keep it in My songs** · **Make another** · **Share how you're doing with someone** (prepared text). Then the standard "Did the intensity change?" Yes / A little / No, recorded as a check-in outcome with `interventionId: "song"` (add `song` to the library for anxious, low, spiraling, distraction, and alone).

**Music engine (match song-preview.html exactly):**

- Web Audio API only. Pad, sine bass, triangle lead with light vibrato, soft kick and hat, generated reverb.
- Each mood sets key, tempo, and texture: heavy (A minor, 68→62 bpm, no hats), anxious (D minor, 96→66 bpm, so the song slows as it plays), angry (E minor, 92→72, stronger kick), numb (C minor, 72→66, sparse, more reverb), mixed (G minor, 84→70).
- Structure: intro → line 1 (minor) → line 2 (minor) → line 3 and any added "still true" lines in the **relative major** → outro on a major chord. The key change at "still true" is the emotional point of the feature; keep it.
- Melody is **deterministic**: syllables from each word, pitch steps from a hash of the word, notes from a pentatonic scale. The same words always make the same song, so saved songs replay identically.
- Show "No sound? Check your phone's silent switch and volume." under the play button (iPhones mute web audio on silent).

**My songs (growing over time):**

- Saved only when the person taps Keep: `store.sensitive.songs = [{ id, date, mood, lines:[3], still:[] }]`, newest first, max 50. Each can be deleted. Included in Export and wiped by Delete everything.
- Replaying a saved song ends with "How does this feel now?" **Lighter** ("That's worth noticing. You've been here before, and it moved.") · **About the same** ("That's okay. Some things take longer.") · **Heavier** ("This might be a moment for a person, not a song.", with Call 988 · Text 988 · Text someone you trust shown first).
- Then "Add something that's still true today" (through `safetyCheck`). It's appended to `still` and becomes the song's new final line, in the major key.

**Rules:**

- No generated or AI lyrics: only the person's own words.
- No sharing of the song file or lyrics outside the phone in this version.
- Never shame or score anything written.
- Help stays one tap away on every screen; RED stops playback immediately.

**Tests:** RED line → crisis and no song; same lines → identical melody; key changes to relative major at line 3; anxious tempo decreases across sections; voice off by default; nothing saved without Keep; Delete everything removes songs; replay "Heavier" shows 988 first.

---

## Phase 3 — People and safety

### 6.8 Code word (mockup: CodeWord)

**Why:** people who feel like a burden don't reach out. A word agreed on a good day makes asking for help one tap with no explaining.

**Setup** (My Plan → Set up with your people → Code word):

1. `choose_person` from trusted people (none → add one first).
2. `choose_word`: 3 random neutral words from a fixed list (e.g. lighthouse, blue kite, pineapple) or the person's own. Never anything alarming.
3. `compose_sms` with:

   > Hey [name], I'm making a plan for hard days. If I ever text you "[word]", it means I'm struggling and need you to call me or come be with me. You don't have to fix anything. Here's a short guide: zigzagmind.com/support

4. `confirm` → save `plan.codeWord = { personIndex, word, setAt }`.

**Once set**, a "Send my code word to [name]" button appears on: the YELLOW bar, the crisis screen, `crisis-full`, `crisis-no`, Talk to someone, Connect (6.6), and I need my plan (6.12). It opens `sms:` with the word only. On `crisis-no` it follows the existing rule: set `screen = "safety-check"` in the same handler before the link opens.

**This replaces the "safe word" idea.** Nobody types a word into ZigZag Mind to enter a mode; in a crisis, one tap on "I need my plan" (6.12) is faster than typing.

**Tests:** setup text includes the word and guide link; crisis-no button routes to safety-check; buttons absent when no code word is set.

### 6.9 Supporter guide page (mockup: Support)

New static page `support.html` at `zigzagmind.com/support`, same design tokens, readable in 3 minutes, no storage, no tracking. Sections: If you got a code word · What to say (ask directly: "Are you thinking about suicide?"; asking doesn't put the idea in someone's head; listen; "I'm here" is enough) · Get help together (988, including for supporters; 911 if in danger or they took something) · Time and distance (offer to hold onto things; no specifics) · Check in now and then (6.10) · Look after yourself. Footer: "ZigZag Mind is a self-help support tool, not an emergency service."

Add "Share the supporter guide" next to each trusted person in My Plan (`share_link`).

**Tests:** no network calls; 988 and 911 present; no storage APIs.

### 6.10 Check-in reminders

**Supporter side** (`support.html#checkins`): pick **Gentle** (weekly for 4 weeks, then monthly for 5 months) or **Close** (every 3 days for 2 weeks, then weekly for 6 weeks). The page builds an `.ics` file on their phone: events "Check in on [name]," each with 3 message ideas ("Thinking of you. No need to reply." · "Want to grab food this week?" · "How's your week going?"). `[name]` comes from `?for=`: letters, spaces, hyphens only, 20 characters max, optional. Nothing else ever goes in the URL.

**User side** (My Plan → Set up with your people → Check-in reminders): `share_link` with `zigzagmind.com/support?for=[first name]#checkins` and "Would you check in on me now and then? This sets up reminders on your phone. No need to say anything special." Then `confirm` → `plan.checkinCircle = [{ personIndex, at }]`.

**Tests:** valid ICS (RFC 5545); correct event counts; `?for=` sanitized; nothing sensitive in URLs.

### 6.11 Time and distance plan

Replace "Making my space safer" with a structured, private plan: **Things I'll keep away from myself during hard times** (own words; no examples, no suggestions of means) · **Who will hold them, or where they'll go** · **When I'll get them back** (e.g. "after I've talked it over with Jordan"). Optional `compose_sms`: "Would you be willing to hold onto a few things for me for a while? I'll explain when we talk." Migrate existing `saferSpace` text into the first field. Plan fields exempt from `safetyCheck`. No method, dose, or lethality content anywhere.

### 6.12 I need my plan — essentials view (mockup: PlanNow, MyPlan)

**One plan, two views.** My Plan (editing, built on a good day) stays as is, plus a "Set up with your people" section (Code word · Check-in reminders · Time and distance plan, each "Set up" or "Done · Change"). The **essentials view** shows only what helps right now, read-only, in this order: Do this first (their grounding action from "things that help") · Reach a person (code word button, then trusted people) · Places I can go · My time-and-distance plan · What I want to remember · 988 · 911.

**Entry:** a big "I need my plan now" button at the top of My Plan, plus "Open my plan" on `crisis-full` and the NO branch (replacing the read-only plan view there). The NO-branch rule still applies: after "I'm done," go to `safety-check`.

Do **not** create a second plan or a separate "When things get really bad" data store.

### 6.13 After the ER or hospital — 30 days (mockup: AfterER)

**Entry:** the "Just out of the ER" chip on Home. Nothing prompts it automatically.

**Setup:** "When did you leave?" (today / yesterday / a few days ago) → `afterCrisis = { start, until: start + 30 days }` in `store.sensitive`. A person-chosen mode, not safety state, so it may be saved.

**While active:** a calm bar, "First 30 days · support is close," with 988 and the code word button; it opens a checklist, all optional, any order: tell one person you're home (prepared text) · set up your code word · add your follow-up appointment (date → `download_ics`; none: "Ask the place you were seen to help schedule one") · ask your people to check in · daily reminders for 2 weeks (`download_ics` to their own calendar). At day 30, a gentle note with no counting or celebration; the mode ends. Settings can end it early.

**Tests:** survives reload; expires at 30 days; bar hidden on crisis screens; ICS correct.


**Also include:** the anti-stigma note `HELP_IS_STRENGTH` ("Getting help is a strength, not a weakness. …"), from its one constant.
---

## Phase 4 — Tech check

### 6.14 Tech check (mockup: TechCheck, BreakLoop, AIReliance, AIAttached, AIFomo)

**Entry:** the Tech check row on Home. Intro: "No judgment. Tech is allowed. Let's just see what it's doing to you right now."

**Copy rule: no shame, ever.** Never call anyone addicted, dependent, unhealthy, or wrong. Never say their feelings aren't real. The goal is more human connection and less looping, not less technology.

Options, each a new intervention id:

1. **I keep asking AI the same thing** (`ai_reliance_check`): "Sometimes another answer doesn't solve uncertainty. It just gives it another place to go." Then **Stop** (close the chat for 10 minutes) · **Decide** (what do you actually need to decide?) · **Act** (one real-world step) → "Start a 10-minute break" (Break the loop).
2. **I keep checking** — texts, feeds, news, an ex's profile, symptoms, stocks (`break_the_loop`): "Are you looking for information, or reassurance?" Then a 10-minute loop break: a calm countdown plus a checklist (stop checking · put the phone face down · do one physical thing · a quick game or change the scene) → "In 10 minutes, ask: do I still need to check?" → check-in.
3. **I'm afraid I'm falling behind** (`ai_fomo`): what are you afraid of missing (career · money · productivity · knowledge · creativity · relationships · something else) → three short fields, **What I know** / **What I'm afraid of** / **One thing I can actually do** (all through `safetyCheck`, not saved unless the person taps Keep) → "You don't need to keep checking. Pick one thing, then close it and do the thing." → Talk it over with someone. Include: "If you're drinking or using more to cope, that's worth saying out loud to someone," linking to the craving flow.
4. **I think I'm getting attached to AI** and **I'm using AI instead of people** (`ai_relationship_check`): "AI can feel personal. It answers fast, remembers what you said, and never gets tired. That can feel meaningful. It still isn't a human relationship." Tap-only: What does it give you? (someone to talk to · reassurance · attention · no judgment · company · advice · something else) and What might it be replacing? (friends · family · dating · sleep · work · school · time away from screens · nothing). Then "Would one real-world connection help right now?" → text someone · call someone · be around people · go somewhere · take a tech break. Plus **Set a boundary with your AI**: a Copy button for:

   > If we've been talking for more than 30 minutes, or it's after midnight, remind me to rest and to reach out to a real person. If I ever talk about wanting to die or hurting myself, stop any roleplay and tell me to call or text 988.

   with "Not every AI follows this every time. It's a nudge, not a guarantee."
5. **My AI changed or is gone** (`ai_loss`): "What you felt was real. Losing a voice you talked to every day can feel like a breakup or a loss. A lot of people are going through this." → a grounding step → optional "Write what you'd want to say" (`safetyCheck`, never saved unless Keep) → tell one person ("Something hard happened and I could use someone to talk to. Got a few minutes?").
6. **I'm not sure what's real** (`ai_reality`) — **clinician review required before this ships:** "It can help to take a break from the AI today and talk to someone you trust in person or by phone." If they're hearing or seeing things others don't, or feel an AI chose them for a special mission, show a professional-help message plus Call or text 988.

**Optional self-reflection** at the end of options 1, 2, and 4: "Which feels closest right now?" — *AI is a tool for me* · *It's becoming a way to cope* · *It's time to step away for a bit.* The **person picks**; ZigZag Mind never calculates, scores, labels, or saves it.

**Tests:** every path ends at a human or real-world action; no label is ever computed; boundary text exact; text inputs go through `safetyCheck`; nothing from these paths is saved unless the person taps Keep.

---

## Phase 5 — Faith

### 6.15 Faith & hope (mockup: Faith) — opt-in only

**Off by default.** Turned on in Settings under "What gives you strength?" (Bible · another faith or tradition · spiritual but not religious · nature · family · personal values · something else). Never assume anyone's faith. Only "Bible" unlocks Faith & hope; other answers simply personalize nothing for now.

When on, a small "Need a little hope?" link appears on Calm and Connect. It shows **one** short passage for the moment, then actions: **Pray · Text someone · Take a walk · Ground myself · Open my plan.** No scrolling, no reading plans, no daily verses.

Moments and passages (King James Version only — public domain; do not use modern translations without a license):

| Moment | Passage |
| --- | --- |
| When I'm afraid | Isaiah 41:10 |
| When I'm overwhelmed | Matthew 11:28 |
| When I'm lonely | Hebrews 13:5 |
| When I need hope | Psalm 30:5 |
| When I need strength | Philippians 4:13 |
| When my thoughts won't stop | Psalm 46:10 |

Store verse text in one constant for review. **Clinician or chaplain review required:** for some people, religious content during distress brings guilt rather than comfort.

**Tests:** off by default; only Bible unlocks it; every passage screen ends at a next action; no network calls.

---

## Storage additions (all in `store.sensitive`)

`plan.codeWord`, `plan.timeDistance`, `plan.checkinCircle`, `afterCrisis`, `prefs.strength` (faith choice, in prefs). Tech check writings and reflections are **not** saved unless the person taps Keep. Human First and session counts are **never** saved.

## Do not

- Use AI, LLMs, or agents anywhere.
- Push or auto-suggest features, or track patterns across visits.
- Send, call, or share anything without a tap.
- Use geolocation, a places API, or any server for "somewhere to go."
- Build a second crisis system, a second plan, or a typed safe word.
- Add notifications, streaks, points, scores, levels, or labels.
- Put the code word or plan content in any URL.

## Clinician, chaplain, and legal review items added by Stage 6

- Code word text, supporter guide, check-in messages.
- Time-and-distance plan; whether to link a lethal-means resource.
- After-ER checklist.
- All Tech check copy, especially "My AI changed or is gone" and "I'm not sure what's real."
- Warmline wording and Human First prompt.
- Every line in `ZAGS_LINES`; legal confirmation that scripted Zags is outside companion chatbot laws.
- Faith & hope passages and framing.
- Turn it into a song: prompts, after-song copy, the replay reflections, and whether replaying hard songs helps or hurts.
