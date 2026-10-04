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
| 2 Zags | 6.7b | Snuggle Zags (on hold: needs owner + clinician sign-off) |
| 2 Zags | 6.7c | Zags listens (on hold: needs owner + clinician sign-off) |
| 2 Zags | 6.7d | Safe place (on hold: needs owner + clinician sign-off) |
| 2 Zags | 6.16 | Turn it into a song |
| 2 Real world | 6.17 | Let's Zig + real-world steps |
| 6.18 | 6.18 | Owner-approved updates (STAGE6-18-ADDENDUM.md) |
| 6.19 | 6.19 | Reach, trust and simplicity (STAGE6-19-ADDENDUM.md) |
| 6.20 | 6.20 | When you've lost someone (STAGE6-20-ADDENDUM.md) |
| 6.21 | 6.21 | A line for today (STAGE6-21-ADDENDUM.md) |
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
3. **Calm down with Zags while you wait** (6.7; wording changed in 6.18 A, OWNER-APPROVED INTERIM).
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

**Entry points:** Calm (featured), Connect ("Calm down with Zags while you wait"), and the Get out of my head menu.

**Session:**

1. "Hi, I'm Zags. I'm not a person, just a little guide. I can guide you through the next few minutes." Said **every** session. (6.18 A, OWNER-APPROVED INTERIM; was "I can stay with you for a few minutes.")
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

### 6.7b Snuggle Zags (ON HOLD — do not build until the owner and a clinician sign off)

> **Review findings (why it's on hold).** A first build was removed. Its closing line ("I'm here if you need me…") is close to the banned "I'm always here for you" (Zags rule 3); "Hold me close", "get cozy" and "Snuggle" frame Zags as something to cuddle, which cuts against the attachment warning and the not-a-companion-chatbot position (e.g. California SB 243); and 2–5 minutes of continuous breathing breaks Zags rule 8 (at most two breathing rounds). Any future version must fix all three. The Zags wording test now bans "here if you need", "hold me", "cozy", "snuggle" and "cuddle".

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
- **For clinician review:** "I'm here if you need me" sits close to the banned "I'm always here for you" (Zags rule 3). Confirm it's acceptable or reword before building.

**Tests (when built):** vibration and sound off by default; vibration only when `navigator.vibrate` exists; ends at the check-in; no endless mode; RED stops it; only settings stored.

### 6.7c Zags listens (ON HOLD — do not build until the owner and a clinician sign off)

> **Review findings (why it's on hold).** A first build was removed. A text box that Zags answers is the closest thing here to the "chat" the HANDOFF forbids, even with a fixed reply.

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

### 6.7d Safe place (ON HOLD — do not build until the owner and a clinician sign off)

> **Review findings (why it's on hold).** Guided imagery carries a trauma risk. Not built.

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

### 6.17 Let's Zig + real-world steps (built)

Built from the owner's addendum (the revised version with five channels). **Let's Zig:** every intervention has a `channel` (BODY, SPACE, SENSE, PEOPLE, ACTION). After "I still feel bad" or a game's "No", the next suggestion comes from a different channel when one is eligible; after a latest rating of 8+, BODY/SPACE/PEOPLE come first. RED and the YELLOW order always win. Copy: "Okay. That wasn't it. / Let's Zig." plus one channel line. "What would make this 10% easier?" on I don't know what I need and the recommendation screen; the two signature lines on About. **Ending:** "You're ready." after "That helped" (and game Yes / A little), "I'm good for now", and at the end of the new steps; "Something else" stays available after "That helped". **New steps:** `borrow_ten` (I feel low, the craving delay, Get out of my head), `true_sentence` (Calm, spiraling), `kind_stranger` (I feel low), `find_alive` (I feel low, Change the scene), `ridiculous_mode` (Get out of my head only; hidden in YELLOW and after any crisis screen; two per visit), `touch_real_world` (Calm; optional anchor in My Plan → Things that help).

> **As built, closest-channel assignments:** `craving_delay` → SPACE, `behavioral_activation` → ACTION. "Not really" is not an answer anywhere in the app, so it isn't used. Not built (per the addendum): emergency pocket, the door, tiny mission, one song, one true thing, where am I, any REAL WORLD menu.

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

**As built (2026-10-04):** as above, with the engine from song-preview.html. "Done" after a new song leads to "Did the intensity change?" (outcome `song`, never the words). Without Web Audio the words still play through silently. Deleting a song asks once. Leaving the player for any reason (Help, X, RED) stops the song. `song` is in the SENSE channel for Let's Zig. Tests: `song.test.js`.

---

## Phase 3 — People and safety

### 6.8 Code word (mockup: CodeWord)

> **As built:** the person it goes to is matched by phone number (stored with the code word), so editing or reordering trusted people never sends it to the wrong person; if that person is removed, the buttons disappear. Own words that `safetyCheck` flags are refused (no crisis is triggered from My Plan). Not yet on "I need my plan" (6.12) — add it there when 6.12 is built. The guide link (zigzagmind.com/support) works once 6.9 is built.

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

> **As built:** `support/index.html`, so `zigzagmind.com/support` works on a plain static host (check the live address once it ships). No scripts at all. The service worker keeps it available offline (cache v3). The "Check in now and then" section has its text and message ideas; the calendar reminders (Gentle / Close) are added with 6.10. "Share the supporter guide" shares only the address, never a name, the code word or plan content.

New static page `support.html` at `zigzagmind.com/support`, same design tokens, readable in 3 minutes, no storage, no tracking. Sections: If you got a code word · What to say (ask directly: "Are you thinking about suicide?"; asking doesn't put the idea in someone's head; listen; "I'm here" is enough) · Get help together (988, including for supporters; 911 if in danger or they took something) · Time and distance (offer to hold onto things; no specifics) · Check in now and then (6.10) · Look after yourself. Footer: "ZigZag Mind is a self-help support tool, not an emergency service."

Add "Share the supporter guide" next to each trusted person in My Plan (`share_link`).

**Tests:** no network calls; 988 and 911 present; no storage APIs.

### 6.10 Check-in reminders

> **As built:** the guide (`support/index.html#checkins`) has one small inline script that only builds the `.ics` (no network, no storage). Gentle = 9 reminders (days 7, 14, 21, 28, then the same date each month for 5 months, clamped to month ends); Close = 10 (days 3, 6, 9, 12, then weekly for 6 weeks). Each is 6pm local time, 15 minutes, with an alert. The app sanitizes the first name the same way before it goes in the link, and offers "Text it to [name]" plus "Share another way" (Web Share, then copy). `plan.checkinCircle` also stores the phone digits so the right person is shown if the list is reordered.

**Supporter side** (`support.html#checkins`): pick **Gentle** (weekly for 4 weeks, then monthly for 5 months) or **Close** (every 3 days for 2 weeks, then weekly for 6 weeks). The page builds an `.ics` file on their phone: events "Check in on [name]," each with 3 message ideas ("Thinking of you. No need to reply." · "Want to grab food this week?" · "How's your week going?"). `[name]` comes from `?for=`: letters, spaces, hyphens only, 20 characters max, optional. Nothing else ever goes in the URL.

**User side** (My Plan → Set up with your people → Check-in reminders): `share_link` with `zigzagmind.com/support?for=[first name]#checkins` and "Would you check in on me now and then? This sets up reminders on your phone. No need to say anything special." Then `confirm` → `plan.checkinCircle = [{ personIndex, at }]`.

**Tests:** valid ICS (RFC 5545); correct event counts; `?for=` sanitized; nothing sensitive in URLs.

### 6.11 Time and distance plan

> **As built:** `plan.timeDistance = { keepAway, holder, getBack }`, shown in My Plan as "My time and distance plan" (also in "Set up with your people"). The only hint is on "When I'll get them back": "For example: after I've talked it over with someone I trust." "Ask [name]" buttons (sms: with the prepared text) appear in the editable plan only. A test guards against any means-related word in the app's own copy for this part.

Replace "Making my space safer" with a structured, private plan: **Things I'll keep away from myself during hard times** (own words; no examples, no suggestions of means) · **Who will hold them, or where they'll go** · **When I'll get them back** (e.g. "after I've talked it over with Jordan"). Optional `compose_sms`: "Would you be willing to hold onto a few things for me for a while? I'll explain when we talk." Migrate existing `saferSpace` text into the first field. Plan fields exempt from `safetyCheck`. No method, dose, or lethality content anywhere.

### 6.12 I need my plan — essentials view (mockup: PlanNow, MyPlan)

> **As built:** screen `plan-now`. "Do this first" maps the first "thing that helps" to a plain step (`FIRST_STEP`; personal items use their own text), or "Put both feet on the floor and let one slow breath out." Empty sections are left out; 988 and 911 are always there. From the NO branch every call/text link moves to `safety-check` in the same tap, and the YELLOW bar is hidden on this screen (it has its own 988 buttons). The read-only plan view is no longer used from crisis screens.

**One plan, two views.** My Plan (editing, built on a good day) stays as is, plus a "Set up with your people" section (Code word · Check-in reminders · Time and distance plan, each "Set up" or "Done · Change"). The **essentials view** shows only what helps right now, read-only, in this order: Do this first (their grounding action from "things that help") · Reach a person (code word button, then trusted people) · Places I can go · My time-and-distance plan · What I want to remember · 988 · 911.

**Entry:** a big "I need my plan now" button at the top of My Plan, plus "Open my plan" on `crisis-full` and the NO branch (replacing the read-only plan view there). The NO-branch rule still applies: after "I'm done," go to `safety-check`.

Do **not** create a second plan or a separate "When things get really bad" data store.

### 6.13 After the ER or hospital — 30 days (mockup: AfterER)

**Entry:** the "Just out of the ER" chip on Home. Nothing prompts it automatically.

**Setup:** "When did you leave?" (today / yesterday / a few days ago) → `afterCrisis = { start, until: start + 30 days }` in `store.sensitive`. A person-chosen mode, not safety state, so it may be saved.

**While active:** a calm bar, "First 30 days · support is close," with 988 and the code word button; it opens a checklist, all optional, any order: tell one person you're home (prepared text) · set up your code word · add your follow-up appointment (date → `download_ics`; none: "Ask the place you were seen to help schedule one") · ask your people to check in · daily reminders for 2 weeks (`download_ics` to their own calendar). At day 30, a gentle note with no counting or celebration; the mode ends. Settings can end it early.

**Tests:** survives reload; expires at 30 days; bar hidden on crisis screens; ICS correct.


**Also include:** the anti-stigma note `HELP_IS_STRENGTH` ("Getting help is a strength, not a weakness. …"), from its one constant.

**As built (2026-10-04):** as above. The bar sits below "I don't feel safe" on Home (never above the critical items) and on the checklist; never on crisis screens; the mode cannot open while RED. Calendar files are made on the phone (`icsBuild`, RFC 5545): the appointment is one 60-minute event with a reminder the day before; daily reminders are 14 events from tomorrow at 10am ("One small thing today"). Ticks are stored with the mode; Delete everything and Settings end it; Export includes it as `first30Days`. Tests: `after.test.js`. All copy is in REVIEW.md for clinician review.
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

**As built (2026-10-04):** options 1–5 as above. **Option 6 (`ai_reality`) is not built**, pending clinician review. No Keep button was added: nothing typed or tapped in Tech check is saved at all (owner to decide whether a Keep is wanted, and where it would go). The new intervention ids have no states, so the engine never suggests them outside Tech check; each ends at the usual check-in. The loop break is a 10-minute countdown that stops when the person leaves the screen. Tests: `tech.test.js`.

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

**As built (2026-10-04):** as above. Hebrews 13:5, Psalm 30:5, Psalm 46:10 and Isaiah 41:10 show the well-known part of the verse (KJV wording), not the whole verse; the chaplain/clinician should confirm. Pray opens a quiet moment ("Pray in your own words, or just sit with it. There's no wrong way.") with Done or "I'd like to talk to someone". Tap the same answer again to clear it. The answer is not written to the phone while saving is off, and Delete everything clears it. Tests: `faith.test.js`.

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

---

## Stage 7 — Premium + honest visual redesign

**Part A (built): visual pass, styling only.** New palette (light and dark), a quiet system serif for page titles (nothing downloaded), softer cards (shadow instead of borders in light mode), the ZigZag mark (a thin, soft line drawn once on Home, About and the first welcome screen; static with reduced motion), crisis screens kept plain (no serif, no shadows, no motion). No flow, copy or safety changes. `layout.test.js` checks every screen at 375, 390 and 430px.

**Part B (first step built, owner said continue): Home tagline.** Only the line under the wordmark changed: "It's okay not to be okay." (serif) with "You don't have to figure everything out right now." Everything else on Home is unchanged; in large text the second line and the zigzag are hidden so "I don't feel safe" stays on the first screen. The rest of the proposal below still needs the owner's decision.

**Part B (original proposal): Home redesign.** The proposal (hero "It's okay not to be okay.", "Find my next step", a quieter "I'm stuck") would replace the 6.1 Home. Whatever is chosen must keep **"I don't feel safe" and Help on the first screen** in normal and large text (`home-viewport.test.js`) and a way into the existing flows (including "I have an urge to use (drink or drugs)"). "I'm stuck" overlaps "I don't know what I need" (6.2): pick one.

**Part C (ON HOLD — new experiences, need owner + clinician sign-off before building).** All person-initiated, local-only, no scores/streaks/feeds, Help one tap away, `blockIfRed()` first, at most five items where a list is involved, and never on crisis screens.

- **Find something real (REAL WORLD + Touch):** "Find something real." / "You don't have to feel okay. Let's just notice something that's here." One large image card ("Touch something real", Try it) → "Put your hand on something near you." → "Notice the texture." → "Notice the temperature." → "You found something real." No progress bar, no score.
- **Digital fidget (a soft pebble):** press / hold / release; haptics off by default; reduced motion respected; no sound by default; tap alternative to any drag. Ends: "Now find something real that feels good to hold." / I'm done.
- **Show me something good:** "Give me something good." / "You don't have to feel happy. Just look at something that exists." One image + a short caption at a time; Another / I'm done; five at most; no autoplay.
- **Make me smile:** "I need something stupid." / "No pressure to feel better. Just something a little lighter." One joke, absurd observation, animal fact or silly image at a time; five at most. **Clinician review of every item**; never about suicide, self-harm, mental illness, trauma, medical emergencies or protected characteristics.
- **Borrow a little calm:** invitations, not "fake it": put both feet down · unclench your hands · sit somewhere comfortable · take one slow step · look around the room · let your shoulders drop → "You don't have to believe you're okay yet."
- **Put the phone down:** after some REAL WORLD activities: "You're ready." / "You can put me away for a few minutes." / Put the phone down. Never auto-launches or suggests another feature.
- **Photography:** needs a curated, licensed **local** image set (real, ordinary moments; no staged wellness, no smiling-at-camera stock, nothing implying diagnosis or treatment). No remote images or image APIs. Until it exists, these features would rely on placeholders, which is a reason to wait.
- **Microcopy rules** (apply everywhere): short and honest ("It's okay not to be okay." · "You can stop here."); never "You got this!", "Great job!", "This will make you feel better" or treatment claims.


## Zags brand mark (owner request, 2026-10-04)

A small, still Zags (the exact character from zags-preview.html) in these places only (plus, by later owner request, the end of Cozy up in a small blanket): next to the wordmark on Home (tap → Calm down with Zags; no talking or animation there), waving on "You're ready" (a gentle side-to-side sway three times, since the character has no arms; none with reduced motion), the onboarding welcome, empty My Plan, and empty My songs. Never on crisis, crisis-full, crisis-no, safety-check or "I need my plan" (`BRAND_ZAGS_NEVER`). On narrow screens (large text) he sits beside "Mind" so Home doesn't grow; `home-viewport.test.js` still passes. Tests: `zags-mark.test.js`.

## Desktop support (owner request, 2026-10-04)

Phone stays the priority. Only when the device is clearly a desktop or laptop (desktop browser, no touch; unsure means phone, `canPhone()`): every "Text 988" becomes "Chat with 988 online" (https://988lifeline.org/chat), every call button also shows the number it dials, and code word / trusted-person texts show the prepared message with a Copy button instead of an sms: link. The crisis flow and the NO-branch safety-check rule are unchanged: a Copy button from the NO branch still sets "Do you feel safer?" in the same tap. The supporter guide swaps its "Text 988" the same way. Tests: `desktop.test.js` (phone and desktop).

## Owner decisions (2026-10-04)

- **7B Home:** keep "I don't know what I need" on Home. No further 7B changes ("Find my next step" / "I'm stuck" are not built).
- **Tech check:** no Keep button for now. Nothing typed or tapped in Tech check is saved.
- **Still on hold:** 6.7b Snuggle Zags, 6.7c Zags listens, 6.7d Safe place, Tech check option 6 (`ai_reality`), and 7C new experiences.

## 6.18 Owner-approved updates (as built, 2026-10-04)

Built from STAGE6-18-ADDENDUM.md, parts A–E, on `build`. Items marked OWNER-APPROVED INTERIM are in the code and listed in `docs/CLINICIAN_REVIEW.md` (D5, D16–D22, status OPEN) and REVIEW.md. Notes where the build differs in form from the text:
- B: the supporter page can't load the app's script (one inline script, nothing loaded), so `sync-support.js` (`npm run sync-support`) writes the Warm Line block from `WARMLINE` in index.html; a test fails if it drifts.
- D2: "Can't sleep, you up?" was already the first message idea (existing wording kept); at night it is forced first.
- D6: the gun-storage line is the only exception to the "no means named" tests, matched exactly.
- E3: "Something else" opens the five directions; the direction pick is the new suggestion and counts toward Human First as before.
- E5: `be_around_people` (PEOPLE) is opened from Connect only (no states, so it is never suggested elsewhere). E6 is a Change the scene option (SPACE).
Tests: `stage618.test.js`; `home-viewport.test.js` also runs at night.

## 6.19 Reach, trust and simplicity (as built, 2026-10-04)

Built from STAGE6-19-ADDENDUM.md, parts A–H, each committed separately on `build`. Notes where the build differs in form from the text:
- A: the guide's opening section shows only for people who came from the app (`support/#worried`, CSS `:target`, no script). A4 (Crisis Text Line on the guide) was built with D, since it depends on D's constant.
- B: "Things to avoid" and the professional contact are also printed (they're part of the full plan). The Print button isn't on the read-only plan opened from the crisis "No" path.
- C: each paragraph is paired with the PRIVACY_DATA_FLOW.md sentence that supports it; Ko-fi is called "the donation page" so donation links stay on Settings and About only. Onboarding links to the page without "you agree" wording (lawyer item).
- D: hidden until `CRISIS_TEXT_LINE.verified` is true; the supporter guide's line is written by `npm run sync-support`.
- E: 211 strings in `L10N`; English proven unchanged by comparing 544 renders before and after; dynamic Settings sentences (the country hint, saving on/off text) and prepared messages to other people stay English-only for now.
- G: no phone numbers or websites were invented for New Horizons, NAMI or recovery meetings; 211 uses "211".
- H: measured with `simplicity-audit.js`; nothing applied.
Tests: `stage619.test.js`; `home-viewport.test.js` also checks the "Worried about someone?" link and the guide's opening section.

## Find something (owner handoff, built 2026-10-04)

One photo mission at a time from `PHOTO_MISSIONS` (10, deterministic; "Try another" moves to the next). The camera is the phone's own (an `image/*` file input with `capture="environment"`): no in-page camera, no permission prompt, and a "No camera? Just look" path that always works. No AI or image analysis. Photos are previewed in the page and dropped on leaving; kept only on Keep (shrunk to 640px JPEG, max 20, own key `next.v1.noticed`, not written while saving is off, removed by Delete everything, listed but not included in Export). Optional one-line note through `handleSafeTextSubmit` (RED → crisis, nothing kept). Ends at "You can put the phone down now." Library: `find_something` (SENSE, `realWorld:true`), so Let's Zig and "Something else → Sense" can pick it; YELLOW/RED rules come first. Entry: Change the scene; My Plan "Things I noticed". "Something that's yours" uses My Plan's own entries in "Things that help me" (YOUR THINGS isn't built; the handoff was cut off). MIND SCRIBBLE and LOSS connections aren't built (those features aren't built). The "find_alive" mission asks for a plant, tree, bird or pet (not strangers). Tests: `findsomething.test.js`.

## Warm & comfort (owner handoff, built 2026-10-04)

`warm_comfort` (SENSE, `realWorld:true`; states anxious, spiraling, low, alone, distraction; **not craving**, so a drink is never suggested in the urge-to-use flow). Calm card (line icon, since Calm has no emoji). Choices: decaf coffee first, caffeine-free tea, hot cocoa, warm milk, warm water, warm cider, something else (regular coffee isn't suggested). "Go make it" → hold → warmth → first sip, or "A slower version" (look, smell, touch, taste); "That's enough" at any point; no timer. Ends: "Now go do something that's yours" (when the person has their own things) or "I'm done" → "You can put the phone down now." Optional link to Find something while the drink is made. Nothing saved. LOSS and MIND SCRIBBLE connections aren't built. Tests: `warm.test.js`.

## Social Zig (owner handoff, built 2026-10-04)

Tech check → "I've been scrolling" (`social_zig`, no states: never suggested elsewhere). "Is this helping?" Yes → "Okay. Enjoy it." and nothing else; Not really → "Okay. Let's Zig." / your feed → your life; I don't know → "Let's try something different". One list of directions (max 8): something that's yours (My Plan's own things), Find something, Make something warm, Borrow ten minutes, What's also true (the existing step, standing in for ONE TRUE THING, which is on the do-not-build list), Talk to someone, Pick something for me (the existing engine; YELLOW first), Put the phone down ("That's enough internet for a minute."). Tools: don't check again (→ Borrow ten), come back to your side, mute the noise (no app settings touched), don't send it yet (Send / Save for later = copy only, never stored / Don't send), the last thing you saw (optional, safety-checked, not saved). Not built: ONE SONG (do-not-build list), MOVE and GO OUTSIDE as separate items (Borrow ten minutes offers walk and sit outside), the LOSS and MIND SCRIBBLE routes, and no event logging (nothing about scrolling is stored). Tests: `socialzig.test.js`.

## Have coffee with ZigZag (owner handoff, built 2026-10-04)

`coffee_with_zigzag` (SENSE, `realWorld:true`; states anxious, low, spiraling; not alone, not craving). Calm card; "Have it with ZigZag" on Warm & comfort's "Go make it" (drink choice reused). "Go make something warm. / I'll wait." → companion screen: an illustrated cup with slow steam and an occasional sip (static with reduced motion), "ZigZag", one line at a time, "ZigZag is an app, not a person. Nothing you type here is kept." Quiet intro (two lines with pauses) before any choice. Choices: Talk (one prompt, safety-checked, dropped, neutral reply), Just sit (slow lines), Tell me something random (fixed list, max 3; hidden while YELLOW or after a crisis screen), I need to get something out (a light version: Mind Scribble isn't built), I'm not sure. After four choices (or "I'm done") it ends: "How are you doing now?" (not a score; nothing stored) → reply → "Go enjoy the rest of your coffee." → "You can put the phone down now." Still rough and "Let's Zig" use the existing engine through `completeCheckIn` (counts like a game's "No"). Not Zags: an illustrated cup, since the Zags mark is limited to five places. Not added to Social Zig's list (kept at 8). Clinician item D28. Tests: `coffee.test.js`.

## Cozy up (owner request, built 2026-10-04)

`cozy_up` (SENSE, `realWorld:true`; anxious, spiraling, low, alone, distraction) replaces "Make something warm" on Calm and takes its place in the engine (`warm_comfort` now has no states; it's reached from Cozy up's first step, Social Zig and coffee). One thing at a time: a warm drink (links to the existing warm flow, decaf first; "Warm apple juice" replaces "Warm cider" everywhere), a blanket/hoodie/warm socks, a lamp instead of the overhead light, a soft sound, something soft or a pet, a warm shower; "Done. Next one", "Skip this one", "That's enough". End: "Stay cozy for a bit. You can put the phone down." with Zags in a small blanket (the same character plus a blanket; added to the Zags places; never on crisis screens). From I feel low (a new card there, or the engine in a low state): "Get cozy for 15 minutes. Then one tiny thing.", an optional 15-minute timer, "Talk to someone" on every screen, and at time-up "One tiny thing" → the I feel low chooser. Night mode: "Cozy up for sleep" (soft light, decaf/caffeine-free, phone face down out of reach, the 20-minute get-up line); no sleep-medication advice. Nothing saved. Tests: `cozy.test.js`.

## North star & stabilization pass (owner handoff, 2026-10-04)

No new features. Progressive disclosure only, nothing removed, no wording changed on existing options: Calm puts Breathe for 1 minute, 5-4-3-2-1 grounding, Feet on the floor and Find something real behind "Something else" (9 → 6 choices); Connect puts Be around people, Zags-while-you-wait and Make a song behind "Something else" (10 → 8; Warm Line, your people, message ideas and 988 stay in view); Change the scene puts the two "Find something" items behind "Find something" (9 → 8). Toggles start with `blockIfRed()`, live in `ui` only, and save nothing. Safety logic, crisis screens, Home order, Coffee and Zags wording untouched. Tests: `northstar.test.js` (menu limits, toggles, RED, storage, Coffee/Zags wording guards, no network/AI/notifications).

## 6.20 When you've lost someone (as built, 2026-10-04)

Built per STAGE6-20-ADDENDUM.md A–E. Screens `grief-who` → `grief-when` → `grief-ack` → (`grief-faith`, Faith & hope only) → `grief-help` → `grief-end`, plus `grief-write`, `grief-write-done`, `grief-tell`, `grief-tell-msgs`, `grief-date`. Copy in `GRIEF`; entered only by `griefStart` (Home chip, Tech check AI-loss last screen); not in `INTERVENTION_LIBRARY`, so the engine and Let's Zig never offer it. Who/when/name live in `ui.grief` (memory only; cleared on any crisis screen). Differences from the text, and why:
- **Breathe for a minute** opens the existing Calm down with Zags (one choice, not two); its last screen adds "Back to "What would help right now?"" so the person can return.
- **Find** reuses the Find something screens with a `remembering` mission (no "Try another", no lead line, "Back" returns to the grief choices). Keep saves to `next.v1.noticed` labeled "Remembering"; cap and storage rules unchanged.
- **Written note**: Delete is the primary button; leaving the screen any other way also deletes it. Keep stores `{mission:"remembering", text}` (≤1,000 characters) in Things I noticed; the export includes its text.
- **Tell one person**: the messages open to the first trusted person in My Plan if there is one (the person can change the recipient), otherwise a blank Messages compose; Copy on computers.
- **Hard date**: the calendar file repeats yearly (`RRULE:FREQ=YEARLY`), 9am, starting at the date's next occurrence.
- **Something else** on the ending runs the existing engine for state "low" (Let's Zig recommendation).
- **Resources**: `GRIEF_RESOURCES` (all `verified:false`, hidden); "If it gets heavier" + 988 is always on the choices screen.
Tests: `grief.test.js`.
