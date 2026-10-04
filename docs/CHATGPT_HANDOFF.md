# ZigZag Mind — handoff for ChatGPT (2026-10-04)

You're helping the owner plan and write copy for ZigZag Mind. The code is built by Claude Code in the GitHub repo `bikesplusjb-crypto/next-app`. Your job: ideas, wording, and handoffs the owner pastes into Claude Code. Please read this whole thing first.

## What it is

ZigZag Mind (zigzagmind.com; live now at https://next-app-69bs.onrender.com) is a free, private, phone-first website (installable as an app) for hard moments: anxiety, spiraling thoughts, cravings (drink or drugs), low mood, loneliness, feeling unsafe, and tech/AI/scrolling stress. Tagline: "Your mind doesn't move in a straight line." Promise: "Help for hard moments, one small step at a time."

It gives one small, concrete thing to try, asks if it helped, and picks the next one. Loop: FEEL → ACT → CHECK → LEARN → NEXT. Its purpose is to get people back to other people.

It is NOT therapy, diagnosis, treatment, a chatbot, or an emergency service. Adults 18+. No clinical claims ever.

## Hard rules (any idea must fit these)

- **No AI in the product.** Everything is fixed, scripted wording. No chat, no LLMs.
- **No accounts, servers, databases, analytics, ads, notifications, streaks, points, scores or gamification.**
- **Everything stays on the phone** (browser storage, not encrypted). Nothing is sent unless the person taps a call/text/link themselves. The app never contacts anyone for them.
- **Safety comes first and its logic is locked.** Every free-text box is checked for crisis words. A crisis word opens the crisis screen immediately (988 Call/Text first, 911 below). Nothing is saved from crisis moments. A "Help" button is top-right on every screen.
- **Crisis screens keep their structure.** New lines only go below the 988/911 buttons.
- **"I don't feel safe" must stay at the top of Home**, visible without scrolling, in normal and large text.
- **No method, dose or lethality information anywhere.**
- **Never say the app keeps anyone safe, monitors anyone, or contacts anyone.**
- **Outside info (phone numbers, organizations, hours) is hidden until the owner verifies it.**
- **Keep it simple.** Aim for 8 or fewer choices per screen and short, plain sentences.
- **Zags**, the round teal mascot, appears only in a few calm places. He is never on crisis screens. His lines are scripted.

## What's on Home now

Help (top right) · Zags + "ZigZag Mind" · "It's okay not to be okay." · **I don't feel safe** · I don't know what I need · Calm down · Get out of my head · Connect · Change the scene · "Or tell me what's happening": I'm anxious / I'm spiraling / I have an urge to use (drink or drugs) / I feel low / I feel alone / Just out of the ER / I lost someone · Tech check (AI, scrolling, or checking) · Worried about someone? How to help → · tabs incl. My Plan.

## What's built

- First-time welcome and setup (18+, start empty).
- The crisis flow:
  - "Are you in danger of hurting yourself or someone else right now?"
  - "No" path: Talk to someone / Open my plan / Do something grounding, then "Do you feel safer?"
- **Calm:**
  - Calm down with Zags (breathing)
  - What's true
  - Cozy up (warm decaf drink, blanket, soft light, soft sound, something soft or your pet, warm shower; there's a sleep version at night)
  - Have coffee with ZigZag (a scripted keep-you-company moment)
  - and more
- **Get out of my head:**
  - Turn it into a song
  - Quick games (six)
  - Focus
  - Make this less serious
  - Borrow ten minutes
- **Connect:**
  - Florida Warm Line
  - trusted people: Text and Call, a code word, "Don't know what to say?" message ideas
  - Be around people, no talking needed
  - 988
- **Change the scene:**
  - small moves
  - Find something (photo missions, with the option to keep a photo)
  - Somewhere to go (Maps search words, 211)
- **Cravings:** a 15-minute delay timer and Ride the wave.
- **Tech check:**
  - I've been scrolling (Social Zig, "Is this helping?")
  - AI is taking the place of people
  - and other options (6 total)
- **My Plan:**
  - an editable safety plan: warning signs, what helps, people and places, reasons to stay, time and distance plan
  - "I need my plan now"
  - Print my plan (with a wallet card)
- **Other:**
  - Faith & hope (optional, KJV verses)
  - After the ER / first 30 days
  - check-in reminders a supporter can add to their calendar
  - a supporter guide at /support
  - Privacy & terms (draft)
  - export and delete everything
  - large text, dark mode, desktop support (on computers, "Chat with 988 online" and Copy buttons replace texting)

## Waiting on people (not code)

- **Owner to verify:**
  - Florida Warm Line
  - Crisis Text Line (741741)
  - 211 mobile crisis by county
  - Treasure Coast "Help near me" entries
  - a contact email and a feedback link
- **Clinician:** 29 open review items (all crisis wording, the safety word lists, Zags, Coffee, Cozy, etc.).
- **Translator:** Spanish is drafted but switched off until a human translator and the clinician approve it.
- **Lawyer:** the Privacy & terms page, and whether Zags or "Have coffee with ZigZag" count as a "companion chatbot" under laws like California SB 243.

## On hold / do not build

- **On hold:** Snuggle Zags, Zags listens, Safe place, the "Is this real?" AI-reality option, new experiences (7C).
- **Do not build:** emergency pocket, the door, tiny mission, one song, one true thing, where am I, REAL WORLD menu.
- **Ideas started but unfinished:** YOUR THINGS (the handoff stopped at section 13), Mind Scribble. Loss/grief is built as 6.20 ("I lost someone").
- **Open decisions:**
  - remove the "I feel alone" chip? (currently kept)
  - rename the crisis button "Open my plan" to "I need my plan"? (waits for the clinician)

## How to write a handoff for Claude Code

1. **Name it** (e.g. "HANDOFF: <feature>") and say where it lives: which screen, and which button opens it.
2. **Give the exact wording** for every button and line, in quotes. Keep the sentences short.
3. **Spell out the safety rules:**
   - What happens if the person types something worrying.
   - Nothing is saved, or exactly what is saved.
   - The Help button stays.
   - Never on crisis screens.
4. **Say what's NOT included** (no AI, no tracking, no streaks).
5. **List the acceptance checks** as bullets, e.g. "Home: I don't feel safe still on first screen".
6. **End with:** "Build on the build branch, add tests, put new wording in the review pack, push build, report. Don't touch main."

How releases work: Claude Code works on the `build` branch. The site goes live only when the owner says "Fast-forward main to commit <id> and push main." Main is on **0edd8d6** (live).
