# Simplicity audit (6.19 H): report only

**Nothing here has been applied.** The owner decides. Numbers were measured in the real app (`node simplicity-audit.js`, jsdom, phone mode) at the 6.19 G commit, from a fresh Home after onboarding, with one trusted person in My Plan (so a Text button can exist). Tap counts are the shortest path found by trying every tappable thing on each screen.

## 1. Taps from a fresh Home

| Goal | Taps | Shortest path | Flag (> 2) |
|---|---|---|---|
| The crisis screen | **1** | "I don't feel safe" (Help in the top bar is also 1) | |
| Call 988 | **2** | "I don't feel safe" → Call 988 | |
| A trusted person's Text button | **2** | Connect → Text | |
| Calm down with Zags | **1** | Zags next to the wordmark (Calm down → Calm down with Zags is 2) | |
| I need my plan | **2** | My Plan tab → I need my plan now | |
| Put the phone down | **3** | Connect → Be around people, no talking needed → Put the phone down | **Yes (3)** |

"Put the phone down" is an ending, so it normally comes after a step (recommendation → "I'm good for now" → Put the phone down). From Home it can't be reached in 2 taps. That may be fine; see proposal 10.

## 2. Choices per screen (more than 8 is flagged)

Counted: every tappable item in the page content (not the top bar or the tab bar).

| Screen | Choices | Flag (> 8) | What they are |
|---|---|---|---|
| Home | **16** | **Yes** | wordmark (hidden 5-tap developer panel), Zags, I don't feel safe, I don't know what I need, 4 routes, 6 "tell me what's happening" chips, Tech check, Worried about someone? |
| Calm | 8 | at the limit | Calm down with Zags, 6 options, I'd rather talk to someone |
| Get out of my head | **11** | **Yes** | Turn it into a song, 6 games (Color hunt, Around me, Rapid categories, Memory snap, Pattern break, 60-second challenge), Focus, Make this less serious, Borrow ten minutes, Calm down with Zags |
| Connect | **14** | **Yes** | Call the Warm Line, find a warmline, Text, Call, 5 message ideas, Be around people, Calm down with Zags while you wait, Make a song while you wait, Call 988, Text 988 (more with a code word, more people, Faith & hope on, or a verified Help near me) |
| Change the scene | **12** | **Yes** | 6 scene options, Find something alive, 4 Maps places, Call 211 |
| Tech check | 6 | | 6 options |

Home's "I don't feel safe" stays on the first screen in normal and large text despite the count (`home-viewport.test.js`).

## 3. Overlaps and repeats (same action under different names, or many doors to one place)

1. **Connect has two doors on Home:** the "Connect" route and the "I feel alone" chip open the same screen.
2. **Calm down with Zags has four doors:** the Zags mark on Home, Calm, Get out of my head, and Connect ("…while you wait").
3. **The 988 chat button has two names:** "Chat online with 988" (full crisis screen, Talk to someone) and "Chat with 988 online" (computers, 6.18 desktop support, About).
4. **"Open my plan" vs "I need my plan":** the crisis screens say "Open my plan"; My Plan says "I need my plan now". Both open the same read-only essentials view from the "No" path.
5. **Places with people, four ways:** "Somewhere to go" (Change the scene), "Be around people, no talking needed" (Connect), "Be around people" (Human First → Change the scene), and "Go where other people are" (full crisis screen).
6. **Two "true" tools side by side in Calm:** "What's still true?" and "What's also true" have nearly the same name and purpose.
7. **Tech check "I think I'm getting attached to AI" and "I'm using AI instead of people"** open the same screen.
8. **"Borrow ten minutes"** appears in Get out of my head, I feel low and the craving screen. That's intended, but it's another repeated door.
9. **211** appears on Change the scene ("local help") and the full crisis screen ("mobile crisis team") with different purposes under the same number. Owner verification is pending for the second.
10. **Choosers stacked on choosers:** "I don't know what I need" (four routes), the I feel low chooser (seven cards), and "Something else" (five directions) all ask the person to pick a direction.

## 4. Proposals (not applied)

| # | What to merge / hide / rename | Why | Cost (tests touched) |
|---|---|---|---|
| 1 | **Use one name for the 988 chat button** ("Chat with 988 online" everywhere). | Same action, two names, on crisis screens; one name is easier to recognize under stress. | `desktop.test.js`, review pack; crisis-screen snapshot unchanged otherwise |
| 2 | **Merge the two Tech check AI options** into one: "AI is taking the place of people". | They already open the same screen; 6 → 5 choices. | `tech.test.js` |
| 3 | **Group the six games in Get out of my head under one "Quick games" card** that opens the list. | 11 → 6 choices on the menu; games stay one extra tap away. | `games.test.js`, `layout.test.js` (screen count), `stage618.test.js` (directions), review pack |
| 4 | **Remove "Calm down with Zags" from Get out of my head** (keep it on Calm, Connect and the Zags mark). | Four doors to one place; Zags is a calming tool, not a distraction. | `zags.test.js` |
| 5 | **Put Connect's five message ideas behind "Don't know what to say?"** (tap to show). | 14 → 9 choices; the ideas are a second step anyway. | `connect.test.js`, `desktop.test.js`, `stage618.test.js` |
| 6 | **Move the 4 Maps places and 211 under one "Somewhere to go" card** on Change the scene. | 12 → 8 choices; places are one tap further. | `scene.test.js`, `stage618.test.js`, `connect.test.js` (Human First "Be around people" lands on places) |
| 7 | **Drop the "I feel alone" chip on Home** (the Connect route does the same). | 16 → 15 on Home, one less duplicate. | `home.test.js`, `connect.test.js` |
| 8 | **Merge "What's still true?" and "What's also true"** into one Calm option with both paths inside. | Near-identical names side by side; Calm 8 → 7. | `calm.test.js`, `lets-zig.test.js`, `song.test.js` |
| 9 | **Rename "Open my plan" on the crisis screens to "I need my plan"**, matching My Plan. | Same view, one name. Crisis-screen wording is a clinician item. | `plannow.test.js`, `red-data.test.js`, `desktop.test.js`, `onboarding.test.js`, `faith.test.js`, `outside-us.test.js`, `home-tip.test.js`, `stage618.test.js`, `stage619.test.js`, Spanish table |
| 10 | **Leave "Put the phone down" at 3 taps from Home** (or add it nowhere new). | It's an ending, not a destination; adding it to Home would add a 17th choice there. | none |

Also noted, not proposed: the wordmark on Home is a hidden developer panel (5 taps). It's counted above but invisible to people; removing it in production would touch `home.test.js` and `zags-mark.test.js`.
