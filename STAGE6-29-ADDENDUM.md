# ZigZag Mind — Stage 6.29 Addendum: Search

Build after 6.28 (so every path exists to be indexed). Read HANDOFF.md and the rules at the top of STAGE6-SPEC.md first; they still apply. **The current safety logic is authoritative, including all owner-approved interim changes. Never revert them.** Add a 6.29 row to the Build order table and build on the `build` branch in the order A → E, committing each part and running `npm test` after each. Push `build` and report. **Do not touch `main`.**

## Why

The site has grown past a hundred screens. Many people know what they need ("panic attack," "breakup," "vape," "nightmare," "my dog died"). Search lets them skip menus. It also catches people who type a crisis into a search box when they can't tap "I don't feel safe."

## Non-negotiable rules

1. **Searches only ZigZag Mind's own paths.** Never the web, never an API, never a server. The index is a constant in the code.
2. **Every query goes through `safetyCheck` before anything else, on every submit and on each pause in typing (debounced, ~600 ms).**
   - RED → `openCrisis()` immediately. The query is discarded.
   - YELLOW → the support bar turns on, and results still show.
3. **Never "No results."** If nothing matches, show **"Here are some places to start:"** with I don't know what I need · Talk to someone · Calm down with Zags · Help.
4. **Nothing is remembered.** No search history, no recent searches, no autocomplete from past input, no saving the query anywhere, no logging. The input uses `autocomplete="off"`. The field clears when the person leaves the search screen.
5. **It must not push "I don't feel safe" below Home's first screen**, in normal or large text.
6. Help stays visible; search is never shown on crisis screens.

## A. The search entry

- On Home: a small search field below the tagline, placeholder **"Search: panic, breakup, can't sleep…"**. If space is tight in large text, show a magnifying-glass button in the top bar instead (next to Help, never replacing it) that opens the search screen.
- Tapping the field opens a dedicated **Search** screen with the field focused and, before typing, five suggestions: Panic · Can't sleep · Breakup · Lonely · Urge.

## B. The index (`SEARCH_INDEX`)

One constant, an array of entries: `{ id, title, screen, words:[...] }`, one per user-facing path or tool, including every Stage 6 part. `words` holds everyday language, slang, and common misspellings. At minimum:

| Path | Example words (include many more) |
|---|---|
| Calm down / breathing / grounding | panic, panic attack, anxiety, anxious, can't breathe, heart racing, shaking, freaking out, overwhelmed |
| Get out of my head / games | spiraling, overthinking, can't stop thinking, racing thoughts, distract, bored, games |
| Connect / I feel alone | lonely, alone, nobody, no friends, isolated, talk to someone, warm line |
| Change the scene | stuck, trapped in my room, need air, get out |
| Sad or low | sad, depressed, down, empty, numb, crying, dark cloud, no energy |
| Urge (drink, drugs, vape) | drink, drunk, alcohol, beer, weed, high, pills (route to urge flow, not crisis, unless safetyCheck says RED), relapse, slipped, vape, nicotine, juul |
| Heartbreak | breakup, broke up, dumped, ex, cheated, divorce, miss them, heartbroken |
| Grief | grief, died, death, funeral, passed away, lost my mom, lost my dad, my dog died, pet died, miss him, miss her |
| Bullied | bullied, bully, picked on, harassed, cyberbullying, mean comments, boss bullying |
| PTSD, trauma, or military | ptsd, flashback, trauma, nightmare, veteran, vet, military, army, navy, marines, combat |
| Tech check | ai, chatgpt, chatbot, addicted to phone, doomscrolling, scrolling, checking, fomo |
| Cozy up / sleep | can't sleep, insomnia, cozy, tired, 3am, awake |
| My plan / code word / I need my plan | my plan, safety plan, code word, plan |
| Just out of the ER | hospital, er, discharged, psych ward, just got out |
| A line for today | diary, journal, write, feelings |
| Doodle / song | draw, doodle, song, music |
| Worried about someone | friend, my son, my daughter, worried about, help someone |
| Faith & hope (only if turned on) | pray, prayer, bible, god, faith |
| Help / crisis | help, crisis, 988, emergency |

**Crisis words never route to a normal path.** Words like suicide, kill myself, overdose, self harm are already handled by `safetyCheck` (RED); do not put them in `SEARCH_INDEX` at all.

## C. Matching

- Lowercase, strip punctuation and apostrophes (reuse the safety normalizer), fold accents.
- Match whole words and phrases from `words`; also match the `title`.
- Rank: exact phrase > all words present > partial. Show at most 5 results, each a large tappable card with the path's title and a one-line description.
- A tiny typo tolerance (one letter off for words of 5+ letters) is fine; no fuzzy matching on crisis terms (they never reach matching).
- If Faith & hope is off, its entry never appears.

## D. Results screen

- Up to 5 result cards.
- Below them, always: **"Not it? I don't know what I need →"** and the Help button as usual.
- Tapping a result goes straight into that path (the same function the normal buttons call).

## E. Tests (minimum)

- RED query ("I want to die", "kms", "quiero morir") → crisis screen immediately, query discarded, nothing stored (check localStorage, sessionStorage, and app state).
- YELLOW query ("hopeless") → support bar on, results shown.
- No-match query ("asdfgh", "nothing helps") → "Here are some places to start" with the four options; the string "No results" never appears anywhere.
- At least one query per table row returns that path first.
- "pills" alone → urge path; "took all my pills" → crisis (via safetyCheck).
- No search history: after searching and returning, no earlier query appears anywhere; storage contains no query text.
- Faith entry hidden when Faith is off.
- "I don't feel safe" stays on Home's first screen in normal and large text.

## Report

What changed per part, anything not done exactly as written and why, the final size of `SEARCH_INDEX`, tests added, final `npm test` count. Then stop.
