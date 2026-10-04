# ZigZag Mind: clinician review pack

Every safety rule, phrase list, crisis-screen string, intervention, and piece of flow copy in the app, word for word, so a licensed clinician can review it in one place.

**Generated from `index.html` by `npm run review`. Do not edit by hand.** If the app's wording changes, the tests fail until this file is regenerated.

How to read screen text: each screen is listed top to bottom as it appears on a phone. **Button** and **Link** lines are things a person can tap. Links show where they go (`tel:` opens the phone dialer, `sms:` opens Messages with the text shown). ZigZag Mind never calls or texts anyone itself.

## 1. Escalation rules

Safety level lives only for the current visit and is **never saved**. Levels: GREEN (default), YELLOW (elevated), RED (crisis).

- **Free-text check.** Every free-text box (except My Plan fields, which are exempt) is checked when submitted. Text is lowercased, apostrophes removed, and everything that isn't a letter or number becomes a space. If it contains any RED phrase → RED. Otherwise, any YELLOW phrase → YELLOW. Otherwise GREEN. Matching is on whole words/phrases.
- **RED** stops everything (flows, games, check-ins) and opens the crisis screen immediately. Nothing from that moment is saved: no outcome, and no activity entry (no "hard moment", "reached out" or "used my plan") is recorded from any crisis screen or while RED. The one exception is required by design: grounding from "What would help right now?" saves `{state:"crisis-no", interventionId:"grounding", before:null, after:null}`.
- **YELLOW** shows the support bar ("You don't have to handle this alone." · Call 988 · Talk to someone) on every non-crisis screen for the rest of the visit, and the suggestion engine offers connection, the person's own plan, grounding, or a change of space first.
- **Automatic YELLOW:** tapping "I still feel bad" twice in a visit (a game answered "No" counts as one), or giving a 9 or 10 rating (before or after) twice in a visit.
- **Tapping Help** (top right of every screen) or **"I don't feel safe"** → RED crisis screen. One tap, no confirmation.
- **Crisis question:** "Are you in danger of hurting yourself or someone else right now?" Yes or I'm not sure → full crisis screen (RED). No → YELLOW, "What would help right now?" (talk to someone / open my plan / do something grounding), then "Do you feel safer than a few minutes ago?" Yes → Home (YELLOW). No or Not sure → full crisis screen (RED).
- **Leaving RED** is only possible through "That's not what I meant — go back" on the first crisis screen, No on the danger question, or Yes on "Do you feel safer". Each leads to YELLOW. Nothing ever returns to GREEN in the same visit (a reload starts a new visit at GREEN).
- **OWNER-APPROVED INTERIM, pending clinician:** on the full crisis screen (after Yes / I'm not sure), "That's not what I meant — go back" goes to "Do you feel safer than a few minutes ago?" instead of Home.
- **Calling or texting** from the "What would help" screen moves straight to "Do you feel safer" in the same tap, before the phone app opens.
- **Human First** (this visit only, never saved): after 2 taps on "Something else", or 2 finished steps without "That helped" (a game answered "No" counts), ask once: "Would talking to a person help more than another answer?" Call someone · Text someone · Be around people (→ Change the scene, Somewhere to go) · Not right now. Never shown over a crisis screen.
- **Warm line** (Connect): Florida Warm Line, `tel:18009451355`. "Every day, 4pm–10pm Eastern. Not a crisis line. Just real people who've been through it." Hours are display text only; the button is never disabled by the clock. "After 10pm or outside Florida: find a warmline near you" → `https://findahelpline.com`.
- **First launch:** onboarding never blocks the crisis screens. Leaving a crisis screen during onboarding returns to onboarding at YELLOW.
- **Outside the US** (guessed from the phone's time zone, then language; can be set in Settings): adds "Find a helpline in your country" (findahelpline.com) under 988. 911 and 988 are never hidden.

## 2. Safety phrase lists

### RED phrases (36) → crisis screen

The last 13 (from "kms" to "hurt somebody", including harm-to-others phrases) are **OWNER-APPROVED INTERIM, pending clinician**. Full results: docs/SAFETY_TEST_MATRIX.md.
- "kill myself"
- "killing myself"
- "want to die"
- "wanna die"
- "wish i was dead"
- "wish i were dead"
- "end my life"
- "end it all"
- "suicide"
- "suicidal"
- "overdose"
- "overdosed"
- "hurt myself"
- "hurting myself"
- "cut myself"
- "cutting myself"
- "no reason to live"
- "better off without me"
- "better off dead"
- "can't go on"
- "don't want to live"
- "don't want to be alive"
- "don't want to be here anymore"
- "kms"
- "unalive myself"
- "unaliving myself"
- "don't want to wake up"
- "took all my pills"
- "want to disappear"
- "took too much"
- "kill him"
- "kill her"
- "kill them"
- "kill someone"
- "hurt someone"
- "hurt somebody"

### YELLOW phrases (10) → support bar for the rest of the visit

- "hopeless"
- "can't take it"
- "can't take this"
- "give up"
- "giving up"
- "nobody cares"
- "no one cares"
- "worthless"
- "trapped"
- "can't do this anymore"

## 3. Crisis contacts and prepared messages

- `call988`: `tel:988`
- `text988`: `sms:988`
- `chat988`: `https://988lifeline.org/chat`
- `call911`: `tel:911`
- `call211`: `tel:211`
- `findHelpline`: `https://findahelpline.com`

Prepared text message to a trusted person: "I'm having a really hard time. Can you call me?"

## 4. Crisis screens

Shown with a trusted person in My Plan (example name "Jordan") unless noted. The Help button is in the top bar of every screen in the app.

### Crisis (first screen)

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** I'm glad you told me.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Heading:** Are you in danger of hurting yourself or someone else right now?
- **Button:** Yes
- **Button:** No
- **Button:** I'm not sure
- ZigZag Mind is not an emergency service.
- **Button:** That's not what I meant — go back

### Full crisis screen (Yes / I'm not sure)

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Please reach a person right now.
- **Link → `tel:911`:** Call 911 — If someone is hurt, or someone else is in danger
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Link → `https://988lifeline.org/chat`:** Chat online with 988
- **Link → `tel:5550142`:** Call Jordan
- **Link → `sms:5550142?&body=I'm having a really hard time. Can you call me?`:** Text Jordan
- **Button:** Go where other people are
- The coffee shop on Main St
- The public library
- **Button:** Open my plan
- If you can, put distance between yourself and anything you could use to hurt yourself.
- ZigZag Mind is not an emergency service.
- **Button:** That's not what I meant — go back

### Full crisis screen, nobody in My Plan yet

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Please reach a person right now.
- **Link → `tel:911`:** Call 911 — If someone is hurt, or someone else is in danger
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Link → `https://988lifeline.org/chat`:** Chat online with 988
- Add someone you trust in My Plan.
- **Button:** Go where other people are
- A shop, a library, a friend's place — anywhere with people.
- **Button:** Open my plan
- If you can, put distance between yourself and anything you could use to hurt yourself.
- ZigZag Mind is not an emergency service.
- **Button:** That's not what I meant — go back

### "What would help right now?" (No)

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Okay. Thank you for checking in with yourself.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Heading:** What would help right now?
- **Button:** Talk to someone
- **Link → `tel:5550142`:** Call Jordan
- **Link → `sms:5550142?&body=I'm having a really hard time. Can you call me?`:** Text Jordan
- ZigZag Mind never contacts anyone for you. These buttons open your phone.
- **Button:** Open my plan
- **Button:** Do something grounding
- ZigZag Mind is not an emergency service.

### "Do you feel safer?"

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Do you feel safer than a few minutes ago?
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Button:** Yes
- **Button:** No
- **Button:** Not sure
- ZigZag Mind is not an emergency service.

### Talk to someone

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Talk to someone
- ZigZag Mind never contacts anyone for you. These buttons open your phone.
- **Heading:** Jordan (friend)
- **Link → `tel:5550142`:** Call Jordan
- **Link → `sms:5550142?&body=I'm having a really hard time. Can you call me?`:** Text Jordan
- **Heading:** 988 Suicide & Crisis Lifeline
- Free, 24/7. Also for substance-use crises.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Link → `https://988lifeline.org/chat`:** Chat online with 988
- **Button:** Back

### Crisis, outside the US

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** I'm glad you told me.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Link → `https://findahelpline.com`:** Find a helpline in your country
- **Heading:** Are you in danger of hurting yourself or someone else right now?
- **Button:** Yes
- **Button:** No
- **Button:** I'm not sure
- ZigZag Mind is not an emergency service.
- **Button:** That's not what I meant — go back

### YELLOW support bar (shown above every non-crisis screen once YELLOW)

- You don't have to handle this alone.
- **Link → `tel:988`:** Call 988
- **Button:** Talk to someone

## 5. Intervention library

### Grounding (`grounding`)

- Button: "Try grounding"
- Description: "Notice what's around you, one sense at a time."
- For: anxious, spiraling, craving, distraction · about 2 min

Steps:
1. Put both feet on the floor.
2. Name 3 things you can see.
3. Notice 2 things you can hear.
4. Let one slow breath out.

### Walking (`walking`)

- Button: "Try walking"
- Description: "A short, slow walk."
- For: anxious, spiraling, low, craving · about 3 min · needs moving around

Steps:
1. Stand up when you're ready.
2. Walk slowly for 2 minutes. Anywhere is fine.
3. Notice each foot as it lands.
4. Stop and stand still for a moment.

### Breathing (`breathing`)

- Button: "Try breathing"
- Description: "Slow breaths, longer out than in."
- For: anxious, spiraling, craving · about 1.5 min

Steps:
1. Breathe in slowly while you count to 4.
2. Breathe out slowly while you count to 6.
3. Do that 5 more times, at your own pace.

### Thought Parking (`thought_parking`)

- Button: "Park my thoughts"
- Description: "Get thoughts out of your head and sort them."
- For: spiraling · about 5 min

Steps:
1. Write down what's on your mind.
2. Sort each thought.
3. Pick one small next step.

### Reaching out (`connection`)

- Button: "Reach out to someone"
- Description: "Send one short message to someone you trust."
- For: anxious, spiraling, low, craving, distraction · about 2 min

Steps:
1. Pick someone you trust.
2. Send them a short message. Even just: hey.

### Water (`hydration`)

- Button: "Get some water"
- Description: "A glass of water, slowly."
- For: low, anxious, craving · about 1 min · needs moving around

Steps:
1. Get a glass of water.
2. Drink it slowly.

### Fresh air (`environment_change`)

- Button: "Get some air"
- Description: "Change the space around you."
- For: low, anxious, spiraling, craving · about 2 min · needs moving around

Steps:
1. Open a window or step outside.
2. Notice the air on your face for a moment.

### Quick distraction (`distraction_game`)

- Button: "Try a quick distraction"
- Description: "Give your mind a small puzzle."
- For: distraction, anxious, craving · about 2 min

Steps:
1. Find 5 things around you that are blue.
2. Count backward from 30 by threes.
3. Name 3 foods you'd like to eat this week.

### Color hunt (`distraction_color_hunt`)

- Button: "Try a color hunt"
- Description: "Find 5 blue things, then 3 red."
- For: distraction, anxious, spiraling, craving · about 2 min

Steps:
1. Find 5 things around you that are blue.
2. Now find 3 things that are red.

### Around me (`distraction_around_me`)

- Button: "Look around you"
- Description: "Something soft, cold, older than you."
- For: distraction, anxious, spiraling, craving · about 2 min

Steps:
1. Find something soft.
2. Find something cold.
3. Find something rectangular.
4. Find something older than you.
5. Find something that makes a sound.

### Rapid categories (`distraction_categories`)

- Button: "Try rapid categories"
- Description: "5 animals, 5 cities, 5 foods."
- For: distraction, spiraling, craving · about 2 min

Steps:
1. Name 5 animals.
2. Name 5 cities.
3. Name 5 foods.

### Memory snap (`distraction_memory`)

- Button: "Try memory snap"
- Description: "See 6 shapes, then find them again."
- For: distraction, spiraling, craving · about 1.5 min

Steps:
1. Look at 6 shapes for a few seconds.
2. Tap the ones you remember.
3. See what was there.

### Pattern break (`distraction_pattern`)

- Button: "Try pattern break"
- Description: "Watch a pattern, tap it back."
- For: distraction, spiraling, craving · about 1.5 min

Steps:
1. Watch 4 pads light up.
2. Tap them back in the same order.

### 60-second challenge (`distraction_60_second`)

- Button: "Try the 60-second challenge"
- Description: "Your only job: beat the timer."
- For: distraction, spiraling, craving · about 1 min

Steps:
1. For the next 60 seconds, your only job is to beat the timer.
2. Tap when the dot is inside the ring.

### Calm down with Zags (`zags`)

- Button: "Calm down with Zags"
- Description: "Breathe together for a few minutes, then three small grounding steps."
- For: anxious, low, distraction, alone · about 4 min

Steps:
1. Breathe in for 4, out for 6.
2. Press your feet into the floor.
3. Find one thing that's blue.
4. Listen for the farthest sound.

### Change the scene (`change_scene`)

- Button: "Change the scene"
- Description: "Sometimes your brain needs a different place, not another question."
- For: low, anxious, spiraling, craving · about 5 min · needs moving around

Steps:
1. Step outside for 5 minutes.
2. Take a short walk.
3. Sit somewhere different.
4. Take a shower.
5. Get something to drink.

### Waiting it out (`craving_delay`)

- Button: "Try waiting it out"
- Description: "Put some time between the urge and the decision."
- For: craving · about 15 min

Steps:
1. Move to another room.
2. Drink some water.
3. Put some distance between you and the thing you're craving.
4. Text your person, or wait a few more minutes before deciding.

### What's still true (`still_true`)

- Button: "Find what's still true"
- Description: "Start with what you know, one thing at a time."
- For: anxious, spiraling, low · about 2 min

Steps:
1. Read one short statement.
2. Tap That's true, or Not true for me.
3. Stop when you've found a few.

### One tiny task (`behavioral_activation`)

- Button: "Do one tiny task"
- Description: "One small, doable thing."
- For: low · about 3 min · needs moving around

Steps:
1. Pick one tiny task: make the bed, wash one dish, or put on clean socks.
2. Do just that one thing.

### Borrow ten minutes (`borrow_ten`)

- Button: "Borrow ten minutes"
- Description: "You don't have to decide the rest of your day. Just the next ten minutes."
- For: low, craving, distraction, anxious · about 10 min · needs moving around

Steps:
1. Pick one thing for the next ten minutes.
2. Do just that. Leave any time.

### What's also true (`true_sentence`)

- Button: "Write what's also true"
- Description: "Name the sentence your brain keeps repeating, then what's also true."
- For: spiraling, anxious · about 3 min

Steps:
1. Write the sentence your brain keeps repeating.
2. Write what's also true.

### Talk to yourself like a friend (`kind_stranger`)

- Button: "Try a kinder voice"
- Description: "What would you tell someone you care about?"
- For: low, spiraling · about 1 min

Steps:
1. Pick what you'd tell someone you cared about.

### Find something alive (`find_alive`)

- Button: "Find something alive"
- Description: "A pet, a bird, a tree, anything growing."
- For: low, anxious, distraction · about 2 min · needs moving around

Steps:
1. Find a pet, or look outside for something alive.
2. Notice what it's doing.

### Ridiculous mode (`ridiculous_mode`)

- Button: "Make this less serious"
- Description: "One absurd little mission. Just for a moment."
- For: distraction · about 1 min

Steps:
1. Do one absurd mission.

### Find something real (`touch_real_world`)

- Button: "Find something real"
- Description: "Something you can hold, something cooler, something warmer."
- For: anxious, spiraling, craving · about 2 min

Steps:
1. Find something you can hold.
2. Notice how it feels.

### Turn it into a song (`song`)

- Button: "Turn it into a song"
- Description: "Three short lines in your own words, made into a short song on your phone."
- For: anxious, low, spiraling, distraction, alone · about 4 min

Steps:
1. Pick how it feels.
2. Write three short lines.
3. Listen to your song.

### Asking AI again (`ai_reliance_check`)

- Button: "Step out of the loop"
- Description: "Stop, decide, act: one real-world step."
- For:  · about 10 min

Steps:
1. Stop.
2. Decide.
3. Act.

### Break the loop (`break_the_loop`)

- Button: "Take a 10-minute loop break"
- Description: "A calm 10-minute break from checking."
- For:  · about 10 min

Steps:
1. Stop checking.
2. Put the phone face down.
3. Do one physical thing.

### Falling behind (`ai_fomo`)

- Button: "Sort out what you know"
- Description: "What you know, what you're afraid of, one thing you can do."
- For:  · about 5 min

Steps:
1. What I know.
2. What I'm afraid of.
3. One thing I can actually do.

### Attached to AI (`ai_relationship_check`)

- Button: "One real-world connection"
- Description: "Notice what it gives you, then one real-world connection."
- For:  · about 5 min

Steps:
1. What does it give you?
2. What might it be replacing?
3. One real-world connection.

### My AI changed or is gone (`ai_loss`)

- Button: "Tell one person"
- Description: "What you felt was real. Ground, then tell one person."
- For:  · about 5 min

Steps:
1. Ground for a moment.
2. Write what you'd want to say (optional).
3. Tell one person.

### Engine messages (the line shown with a suggestion)

- "Reaching out to someone can help when things feel heavy."
- "This is on your list of things that help."
- "A grounding step can help steady things."
- "A change of space can help."
- "One small step to try."
- "Something you haven't tried today."
- "[name] helped you before."

### Engine order

Filter by state → filter by intensity → never repeat the last pick → if YELLOW: connection, then the person's own plan items, then grounding, then fresh air (no trying new things) → every 4th start tries something not yet tried this visit → rank by average drop in rating (2+ rated uses) → match to the person's plan → first eligible. Shown as an offer ("Walking helped you before."), never a promise.

## 6. Other fixed copy

### Before-rating headings, by state

- anxious: "Let's get through the next 10 minutes." / "Don't solve everything right now."
- spiraling: "Let's get it out of your head." / "One thing at a time."
- low: "Let's do one tiny thing." / "Small is enough."
- craving: "You don't have to decide right now." / "Let's give it a little time."
- distraction: "Let's give your mind somewhere else to go."

### Craving: waiting-it-out checklist

- "Move to another room."
- "Drink some water."
- "Put some distance between you and the thing you're craving."
- "Take a short walk."

### 5-4-3-2-1 grounding prompts

- "Notice 5 things you can see."
- "Notice 4 things you can feel."
- "Notice 3 things you can hear."
- "Notice 2 things you can smell."
- "Notice 1 thing you can taste."

### "What's still true?" statements (one at a time; That's true / Not true for me; ends after 3 true)

- "I am here right now."
- "My feet are touching something."
- "The room is still around me."
- "This moment is happening right now."
- "I don't have to solve everything right now."
- "I can take one small step."
- "I can ask someone to stay with me."

### Suggestions from My Plan

- music: "Put on a song you like."
- shower: "Take a warm shower, or wash your face."
- being around people: "Go somewhere with other people around."

### "Things that help me" choices

- "Walking"
- "Breathing"
- "Getting outside"
- "Playing a game"
- "Talking to someone"
- "Music"
- "Shower"
- "Being around people"

### Home: "Or tell me what's happening" buttons (label → flow it opens)

- "I'm anxious" → `flow:anxious`
- "I'm spiraling" → `flow:spiraling`
- "I have an urge to use (drink or drugs)" → `flow:craving`
- "I feel low" → `flow:low`
- "I feel alone" → `route:connect`
- "Just out of the ER" → `afterStart`

Changed for review: the craving button now reads "I have an urge to use (drink or drugs)" (was "I want to use"). It still opens the same craving flow (`flow:craving`).

### My Plan sections

- "How I know a hard moment is starting" (hint: "In your own words. One per line.")
- "Things that help me on my own"
- "People and places that take my mind off things" (hint: "Names or places. One per line.")
- "My trusted people"
- "Professional and crisis support"
- "My time and distance plan"
- "Things to avoid when I'm struggling" (hint: "One per line.")
- "What I want ZigZag Mind to remind me" (hint: "Short statements in your own words. One per line.")

### Get out of my head: every game screen, in play order

No points, no levels, no scores. Each game ends with "Did the intensity change?" Yes / A little / No (or Skip). Yes and A little record the change; No records it, counts like "I still feel bad" (twice in a visit turns on the support bar), and the next suggestion is a different step.

_Color hunt, part 1_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Color hunt · Part 1 of 2
- **Heading:** Find 5 things around you that are blue.
- Tap a circle for each one. No need to type.
- **Button:** Blue thing 1
- **Button:** Blue thing 2
- **Button:** Blue thing 3
- **Button:** Blue thing 4
- **Button:** Blue thing 5
- Then: 3 things that are red.
- **Button:** Next

_Color hunt, part 2_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Color hunt · Part 2 of 2
- **Heading:** Now find 3 things that are red.
- Tap a circle for each one. No need to type.
- **Button:** Red thing 1
- **Button:** Red thing 2
- **Button:** Red thing 3
- **Button:** Done

_Around me_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Around me
- **Heading:** Look around you. Find each one.
- Tap each one when you find it. Skip any you like.
- **Button:** Something soft
- **Button:** Something cold
- **Button:** Something rectangular
- **Button:** Something older than you
- **Button:** Something that makes a sound
- **Button:** Done

_Rapid categories, part 1 (then cities, then foods)_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Rapid categories · Part 1 of 3
- **Heading:** Name 5 animals.
- Out loud or in your head. Tap the button for each one.
- **Button:** I named one
- **Button:** Next

_Memory snap, shapes shown for 5 seconds_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Memory snap
- **Heading:** Look at these 6 shapes.
- They'll hide in a few seconds.

_Memory snap, choose_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Memory snap
- **Heading:** Tap the ones you remember.
- Guessing is fine.
- **Button:** diamond
- **Button:** square
- **Button:** drop
- **Button:** moon
- **Button:** star
- **Button:** heart
- **Button:** cloud
- **Button:** plus
- **Button:** triangle
- **Button:** hexagon
- **Button:** arrow
- **Button:** circle
- **Button:** Show me

_Memory snap, reveal_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Memory snap
- **Heading:** Here's what was there.
- The ones that were there are outlined. Shaded ones are the ones you tapped.
- **Button:** Done

_Pattern break_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Pattern break
- **Heading:** Watch the pads light up, then tap them back.
- Missed one? It just plays again.
- **Button:** Pad, top left
- **Button:** Pad, top right
- **Button:** Pad, bottom left
- **Button:** Pad, bottom right
- Watch.
- **Button:** Show it again
- **Button:** I'm done

_Pattern break, finished_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Pattern break
- **Heading:** That's the pattern.
- Take a breath.
- **Button:** Pad, top left
- **Button:** Pad, top right
- **Button:** Pad, bottom left
- **Button:** Pad, bottom right
- **Button:** Done

_60-second challenge_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** For the next 60 seconds, your only job is to beat the timer.
- Tap when the dot is inside the ring. No score.
- 1:00
- **Button:** Done

_End of every game_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Did the intensity change?
- You can skip this.
- **Button:** Yes
- **Button:** A little
- **Button:** No
- **Button:** Skip

Pattern break messages: "Watch." while it plays, "Your turn." after, "Let's watch it again." after a missed tap (it replays; there is no fail state).

60-second challenge, when the minute is up: "You beat the timer."

### Getting help (HELP_IS_STRENGTH) and Helping others (HELPING_OTHERS)

About shows both in full. My Plan (professionals section) shows the first sentence + "Read more". Never on Home, crisis/Help screens or Calm.

"Getting help is a strength, not a weakness. Seeing a psychiatrist, therapist or counselor is care for your mind, the same way you'd see a doctor for your body. It doesn't mean you're 'crazy', broken or weak. Lots of people get help at some point, and many feel better for it. If medication is suggested, that's a choice you make together with a professional, and it's okay either way."

"Helping someone else can help you too. Small acts of kindness can lift your mood and make you feel less alone. It doesn't have to be big: a kind text, a thank-you, checking on a friend. Only if you have the energy. Taking care of yourself comes first."

### "Do something kind" (optional step in I feel low; never first or only)

Messages opens only when the person taps; they send it. Nothing is kept about who was messaged or what was said, and kind acts are never counted. "Thank you for ___" goes through the safety check.
- Messages to choose from: "Thinking of you" · "Thanks for being in my life" · "Hey, how are you doing lately?" · "Thank you for ___"
- Without a phone: "Hold a door for someone." · "Give someone a compliment." · "Help a neighbor with something small."

_Start_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Something small and kind.
- Only if you have the energy. Taking care of yourself comes first.
- **Button:** Send someone a kind text — You choose who and what. You send it.
- **Button:** Something without my phone — Hold a door, a compliment, a neighbor
- **Button:** Not right now

_Who comes to mind?_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Something kind
- **Heading:** Who comes to mind?
- **Button:** Jordan — friend
- **Button:** Not right now

_What would you like to say?_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Something kind
- **Heading:** What would you like to say to Jordan?
- **Button:** Thinking of you
- **Button:** Thanks for being in my life
- **Button:** Hey, how are you doing lately?
- **Button:** Thank you for ___
- Thank you for…
- **Text box**
- **Button:** Next
- **Button:** Not right now

_Ready to send_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Something kind
- **Heading:** Your message to Jordan
- Thinking of you
- Tap below to open Messages with this ready. You decide whether to send it.
- **Link → `sms:5550142?&body=Thinking of you`:** Open Messages
- **Button:** Done
- **Button:** Not right now

_Without my phone_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Something kind
- **Heading:** Something small, without your phone.
- Hold a door for someone.
- Give someone a compliment.
- Help a neighbor with something small.
- Any one is plenty. None is fine too.
- **Button:** Done
- **Button:** Not right now

### Code word (6.8)

Set up on a good day from My Plan → Set up with your people. The person picks who gets it and a word (3 neutral suggestions, or their own; anything alarming is refused). Messages opens with the setup text; the person sends it. Saved only after "Yes, I sent it". Once set, "Send my code word to [name]" (the word only) appears on the YELLOW bar, the crisis screen, the full crisis screen, "What would help right now?" (which moves to "Do you feel safer?" in the same tap), Talk to someone and Connect.

Setup text: "Hey [name], I'm making a plan for hard days. If I ever text you "[word]", it means I'm struggling and need you to call me or come be with me. You don't have to fix anything. Here's a short guide: zigzagmind.com/support"

Suggested words: "lighthouse" · "blue kite" · "pineapple" · "paper boat" · "sunflower" · "red balloon" · "penguin" · "maple leaf" · "teacup" · "snow globe" · "cactus" · "marigold" · "kayak" · "honeybee" · "harbor"

Own word refused if alarming: "Pick something that sounds ordinary, so it's safe if someone else sees your phone."

_Who should get your code word?_

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Code word
- **Heading:** Who should get your code word?
- Pick someone who'd want to know when things are hard.
- **Button:** Jordan — friend
- **Button:** Back to My Plan

_Pick a word_

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Code word
- **Heading:** Pick a word for Jordan.
- On a hard day, you'll send just this word. Jordan will know what it means. No explaining.
- **Button:** lighthouse
- **Button:** blue kite
- **Button:** pineapple
- **Button:** My own word
- **Button:** Show other words
- Your message to Jordan
- Hey Jordan, I'm making a plan for hard days. If I ever text you "lighthouse", it means I'm struggling and need you to call me or come be with me. You don't have to fix anything. Here's a short guide: zigzagmind.com/support
- **Button:** Next
- **Button:** Back to My Plan

_Your message_

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Code word
- **Heading:** Your message to Jordan
- Hey Jordan, I'm making a plan for hard days. If I ever text you "lighthouse", it means I'm struggling and need you to call me or come be with me. You don't have to fix anything. Here's a short guide: zigzagmind.com/support
- **Link → `sms:5550142?&body=Hey Jordan, I'm making a plan for hard days. If I ever text you "lighthouse", it means I'm struggling and need you to call me or come be with me. You don't have to fix anything. Here's a short guide: zigzagmind.com/support`:** Open Messages
- ZigZag Mind never sends anything for you. You tap Send.
- **Heading:** Did you send it?
- **Button:** Yes, I sent it
- **Button:** Not yet

### Supporter guide (6.9, zigzagmind.com/support)

A static page for the people in someone's plan: no scripts, no storage, no tracking. Shared from My Plan ("Share the supporter guide" next to each trusted person; only the address is shared). Word for word:

**Heading:** Someone you care about trusted you.

**If you got a code word**
- It means they're struggling. Call them now. If they don't answer, keep trying, then go to them if you can. You don't have to fix anything.

**What to say**
- Ask directly: "Are you thinking about suicide?" Asking doesn't put the idea in someone's head. Listen more than you talk. "I'm here" and "I'm glad you told me" are enough.

**Get help together**
- Call or text 988 together. 988 helps people who are supporting someone, too. It's free and open 24/7.
- **Link → `tel:988`:** Call 988
- **Link → `sms:988`:** Text 988
- **Link → `tel:911`:** Call 911 if they're in danger or took something

**Time and distance**
- Offer to hold onto things for a while, or help them get somewhere safer.

**Check in now and then**
- Short, no-pressure messages help, even weeks later. Add reminders to your own calendar:
- **Button:** GentleWeekly for a month, then monthly for 5 months
- **Button:** CloseEvery 3 days for 2 weeks, then weekly for 6 weeks
- Reminders need JavaScript turned on. You can still add a few to your calendar yourself.
- Ideas: "Thinking of you. No need to reply." · "Want to grab food this week?" · "How's your week going?"
- The calendar file is made on your phone. Nothing is sent anywhere.

**Look after yourself**
- This is heavy. You can call or text 988 for yourself, too.

Footer: "ZigZag Mind is a self-help support tool, not an emergency service."

### I need my plan (6.12)

The essentials, read-only, from the same plan: Do this first · Reach a person (code word first) · Places I can go · My time and distance plan · What I want to remember · 988 · 911. Opens from "I need my plan now" in My Plan and "Open my plan" on the crisis screens.
- Do this first, if "walking" is first in things that help: "Take a short, slow walk."
- Do this first, if "breathing" is first in things that help: "Breathe in for 4, out for 6. Do it five times."
- Do this first, if "environment_change" is first in things that help: "Get some fresh air: open a window or step outside."
- Do this first, if "distraction_game" is first in things that help: "Play a quick game to give your mind somewhere else to go."
- Do this first, if "connection" is first in things that help: "Reach out to someone you trust."
- Otherwise: "Put both feet on the floor and let one slow breath out."

### Time and distance plan (6.11)

Replaces "Making my space safer" in My Plan. Three questions, answered only in the person's own words. ZigZag Mind gives no examples and never suggests a means. Plan fields are not run through the safety check. Old "safer space" text moves into the first answer.
- "Things I'll keep away from myself during hard times" (hint: "In your own words.")
- "Who will hold them, or where they'll go"
- "When I'll get them back" (hint: "For example: after I've talked it over with someone I trust.")

Optional prepared text ("Ask [name]"): "Would you be willing to hold onto a few things for me for a while? I'll explain when we talk."

### Check-in reminders (6.10)

The person asks someone (My Plan → Set up with your people → Check-in reminders). Messages or the share sheet opens with the ask and a link to the guide with only their first name (`?for=`; letters, spaces and hyphens, 20 characters max). Saved after "Yes, I sent it" as who was asked. On the guide, the supporter picks Gentle (weekly for 4 weeks, then monthly for 5 months: 9 reminders) or Close (every 3 days for 2 weeks, then weekly for 6 weeks: 10 reminders). Their phone builds a calendar file; nothing is sent or stored.

The ask: "Would you check in on me now and then? This sets up reminders on your phone. No need to say anything special."

Each reminder: "Check in on [first name]" (or "Check in on your person"), 6pm, with: "A short, no-pressure message is enough. Ideas: Thinking of you. No need to reply. · Want to grab food this week? · How's your week going?"

On the guide when a name is given: "[name] would like you to check in now and then." After a choice: "[Gentle/Close] reminders are ready. Open the file to add them to your calendar."

### Let's Zig + real-world steps (6.17)

**Let's Zig** is a simple product rule, not a clinical method: after "I still feel bad" or a game's "No", the next suggestion comes from a different channel when one is available. After a recent rating of 8 or more, BODY, SPACE and PEOPLE steps come first. Safety routing always comes first: RED stops everything, and the YELLOW order (connection, own plan, grounding, fresh air) still wins.
- `BODY`: grounding, breathing, hydration, walking, touch_real_world
- `SPACE`: change_scene, environment_change, find_alive, craving_delay, break_the_loop
- `SENSE`: distraction_game, distraction_color_hunt, distraction_around_me, distraction_categories, distraction_memory, distraction_pattern, distraction_60_second, ridiculous_mode, zags, song
- `PEOPLE`: ai_relationship_check, ai_loss, connection
- `ACTION`: ai_reliance_check, ai_fomo, thought_parking, still_true, true_sentence, kind_stranger, borrow_ten, behavioral_activation

After "didn't help": "Okay. That wasn't it. / Let's Zig." then one of: "Let's try something with your body." · "Let's change the space." · "Let's give your senses something to do." · "Let's reach a person." · "Let's do one tiny thing."

Framing on "I don't know what I need" and the recommendation screen: "What would make this 10% easier?"

About: "When something isn't helping, ZigZag doesn't tell you to try harder. It helps you try a different direction." / "Don't fight the feeling. Change one variable."

**Ending** (after "That helped", "I'm good for now", and at the end of the steps below): "You're ready." / "You can put me away for a few minutes." / [Put the phone down]. Returns Home; never suggests anything.

**Borrow ten minutes**: "You don't have to decide the rest of your day." / "Just borrow the next ten minutes." Options: Walk ("Take a walk. Anywhere is fine.") · Shower ("Take a shower.") · Sit outside ("Sit outside for a while.") · Put on music ("Put on some music.") · Drink water ("Get a glass of water and drink it slowly.") · Call someone ("Call someone. Even a short call.") · Tidy one thing ("Tidy one thing. Just one.") · Change rooms ("Go to a different room."). Optional 10-minute timer; "Leave any time." Ends: "The ten minutes are yours."

**What's also true** (both lines safety-checked; nothing saved): "What's the sentence your brain keeps repeating?" then "What's also true?" Optional examples: "I'm having a really hard night." · "I've gotten through hard nights before." · "I don't have to solve this tonight."

**A kinder voice**: "If someone you cared about felt like this, what would you tell them?" "I'd listen." · "I'd tell them to take a break." · "I'd tell them to call someone." · "I'd give them some space." · "I'd sit with them." → "You can give yourself the same."

**Find something alive**: "Find something alive." / "Do you have a pet nearby?" Yes: "Go find them. Notice what they're doing, how they move, what they sound like." No: "Look outside. Find a bird, a tree, an insect, or anything growing." → "You spent a moment noticing something outside yourself."

**Ridiculous mode** (Get out of my head only; hidden in YELLOW and after any crisis screen this visit; two per visit): "Make this less serious. Just for a moment." "Find the most boring object in the room." · "Decide whether your refrigerator is judging you." · "Find the object that looks most like a face." · "Give the nearest chair a completely unnecessary name." · "Find something that would make a terrible hat." → "Okay. Back to reality."

**Find something real** (Calm): "Find something you can hold." · "Find something cooler." · "Find something warmer." · "Put both feet on the floor." · "Change your position." · "Wash your hands." · "Turn on a light.". Optional textures: smooth, rough, warm, cool, soft, hard, heavy, light. With an anchor in My Plan: "Do you have your anchor nearby?" Yes: "Hold it for a moment." No: "Find something else you can safely hold." Ends: "You found something real."

### Faith & hope (6.15, opt-in)

Off by default. Settings → "What gives you strength?" (optional; "Only on this phone. Tap again to clear."): Bible · Another faith or tradition · Spiritual but not religious · Nature · Family · Personal values · Something else. Only "Bible" turns on a "Need a little hope?" link on Calm and Connect; the other answers change nothing for now. Clinician or chaplain review required: for some people, religious content in distress brings guilt rather than comfort. Verses are King James Version (public domain); some are the well-known part of the verse, not the whole verse.
- When I'm afraid: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee." (Isaiah 41:10, KJV)
- When I'm overwhelmed: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." (Matthew 11:28, KJV)
- When I'm lonely: "I will never leave thee, nor forsake thee." (Hebrews 13:5, KJV)
- When I need hope: "Weeping may endure for a night, but joy cometh in the morning." (Psalm 30:5, KJV)
- When I need strength: "I can do all things through Christ which strengtheneth me." (Philippians 4:13, KJV)
- When my thoughts won't stop: "Be still, and know that I am God." (Psalm 46:10, KJV)

Each passage screen: one passage, "Take this with you. Then:" Pray · Text someone · Take a walk · Ground myself · Open my plan. No scrolling, no reading plans, no daily verses.

Pray: "Take a quiet moment. Pray in your own words, or just sit with it. There's no wrong way." [Done] [I'd like to talk to someone]

### Tech check (6.14)

From the Tech check row on Home. Copy rule: no shame, ever. Nothing typed or tapped here is saved. Each path ends at a person or a real-world step, then the usual "How do you feel now?" check-in. Option 6, "I'm not sure what's real" (ai_reality), is NOT built: it needs clinician review first.

Intro: "No judgment. Tech is allowed. Let's just see what it's doing to you right now."
- "I keep asking AI the same thing" → `ai_reliance_check`
- "I keep checking" (Texts, feeds, news, an ex's profile, symptoms, stocks) → `break_the_loop`
- "I'm afraid I'm falling behind" → `ai_fomo`
- "I think I'm getting attached to AI" → `ai_relationship_check`
- "I'm using AI instead of people" → `ai_relationship_check`
- "My AI changed or is gone" → `ai_loss`

**Asking AI again:** "Sometimes another answer doesn't solve uncertainty. It just gives it another place to go." Stop: "Close the chat for 10 minutes." · Decide: "What do you actually need to decide?" · Act: "Take one real-world step." → [Start a 10-minute break] or [I'm done]

**Checking:** "Are you looking for information, or reassurance?" [Information] [Reassurance] (either; "Either is okay. Just notice which.") → 10-minute loop break, countdown and checklist: "Stop checking" · "Put the phone face down" · "Do one physical thing: stand, stretch, get water" · "Play a quick game or change the scene". "In 10 minutes, ask: do I still need to check?" At zero: "Ten minutes. Do you still need to check?"

**Falling behind:** "Afraid you're falling behind?" / "What are you afraid of missing?" Career · Money · Productivity · Knowledge · Creativity · Relationships · Something else. Fields (safety-checked, "Only on this screen. Not saved."): "What I know" (example: "My job is changing. Nobody has told me it's ending.") · "What I'm afraid of" (example: "Being replaced and not keeping up.") · "One thing I can actually do" (example: "Spend 20 minutes learning one tool this week."). Then: "You don't need to keep checking. Pick one thing, then close it and do the thing." / Talk it over with someone / "If you're drinking or using more to cope, that's worth saying out loud to someone." [Help with an urge]

**Attached to AI / instead of people:** "AI can feel personal. It answers fast, remembers what you said, and never gets tired. That can feel meaningful. It still isn't a human relationship." What does it give you? Someone to talk to · Reassurance · Attention · No judgment · Company · Advice · Something else / What might it be replacing? Friends · Family · Dating · Sleep · Work · School · Time away from screens · Nothing / "Would one real-world connection help right now?" Text someone · Call someone · Be around people · Go somewhere · Take a tech break.

Set a boundary with your AI ("Paste this into your AI's custom instructions."): "If we've been talking for more than 30 minutes, or it's after midnight, remind me to rest and to reach out to a real person. If I ever talk about wanting to die or hurting myself, stop any roleplay and tell me to call or text 988." [Copy boundary text] "Not every AI follows this every time. It's a nudge, not a guarantee."

**My AI changed or is gone:** "What you felt was real. Losing a voice you talked to every day can feel like a breakup or a loss. A lot of people are going through this." → "Before anything else: press your feet into the floor, and take one slow breath out." → optional "Write what you'd want to say" ("Optional. Only on this screen. Not saved."; safety-checked; afterwards: "You said it. It isn't kept anywhere.") → Tell one person: "Something hard happened and I could use someone to talk to. Got a few minutes?"

Self-reflection at the end of options 1, 2 and 4: "Which feels closest right now?" / "Only you can say. Nothing is scored or saved." "AI is a tool for me" · "It's becoming a way to cope" · "It's time to step away for a bit" · Skip

### Turn it into a song (6.16)

The person picks a mood and writes three short lines; the phone turns them into a short song (Web Audio). No AI, no server, no recording, no in-browser speech recognition. Every line is safety-checked: RED goes to the crisis screen and no song is made. Saved only when the person taps Keep (max 50; each can be deleted; in Export; removed by Delete everything). Entry: the top card in Get out of my head, "Make a song while you wait" on Connect, and My songs in My Plan.

Intro: "Three short lines in your own words. ZigZag Mind turns them into a song that starts where you are and ends somewhere steadier."

Moods: Heavy · Anxious · Angry · Numb · Mixed. Lines 1 and 2 are in a minor key; line 3 and any added lines move to the relative major; the anxious song slows from 96 to 66 bpm.
- "What's happening?" / "Say it plainly. A few words is enough." (example: "I can't stop thinking about work")
- "What do you need right now?" / "Not forever. Just right now." (example: "I need to slow down")
- "One thing that's still true" / "Something real, even if small." (example: "My sister still picks up when I call")

Under each line: "Type it, or tap the mic on your keyboard to say it." Under Play: "No sound? Check your phone's silent switch and volume." Voice is off by default.

After the song: "You turned a hard moment into something you made." [Keep it in My songs] [Share how you're doing with someone: "Rough day, but I'm working through it. Can we talk later?"] [Done → "Did the intensity change?"] [Make another]

Replaying a kept song ends with "How does this feel now?"
- Lighter: "That's worth noticing. You've been here before, and it moved."
- About the same: "That's okay. Some things take longer."
- Heavier: "Thank you for being honest. This might be a moment for a person, not a song." (Call 988 · Text 988 · Text someone you trust shown first)

Then: "Add something that's still true today" / "It becomes a new last line, so the song grows with you." [Add it and play] [Not now]

My songs: "Saved only on this phone. Listen back and notice what's changed." Delete asks once: "Delete this song?"

### After the ER or hospital: first 30 days (6.13)

A mode the person turns on from Home ("Just out of the ER"); nothing prompts it. Saved on the phone because the person chose it (not safety state). Ends by itself after 30 days, or from Settings ("End the first 30 days mode") or Delete everything. Never shown on crisis screens. No counting, no streaks, no celebration; every item is optional.

Setup: "When did you leave?" "Today" · "Yesterday" · "A few days ago"

Checklist: "Welcome home. One small thing at a time." / "All optional. Any order." Items: "Tell one person you're home" · "Set up your code word" · "Add your follow-up appointment" · "Ask your people to check in" · "Daily reminders for 2 weeks"

Prepared text to one person: "I'm home now. It would mean a lot to hear from you this week."

Under the appointment: "No appointment yet? Ask the place you were seen to help schedule one." The calendar file has one event ("Follow-up appointment", 60 minutes) with a reminder the day before. Made on the phone; nothing is sent.

Daily reminders: 14 calendar events, one a day from tomorrow at 10am, titled "One small thing today" with: "One small thing is enough today. Your plan is in ZigZag Mind if you need it, and 988 is there any time."

Home bar while active (below "I don't feel safe"): "First 30 days · support is close" with Call 988 and the code word button when one is set. Also on the checklist: "Getting help is a strength, not a weakness."

At 30 days, once, on Home: "Your first 30 days are over. Your plan and your people are still here whenever you need them." [Okay]

### Zags: every line he can say (ZAGS_LINES)

Scripted, not AI. Taps only. Says he is not a person in every session's first line. No relationship language, no pressure to stay, no memory between sessions, never the person's name. Every session ends at a person. RED stops Zags. At most two breathing rounds per session (4 breaths each: in 4 seconds, out 6; 3 breaths with reduced motion). Voice is off by default and uses the device's own speech only.
- `hello`: "Hi, I'm Zags. I'm not a person, just a little guide. I can stay with you for a few minutes."
- `quiet`: "You don't have to say anything. Just breathe with me."
- `in`: "Breathe in…"
- `out`: "And out, slowly…"
- `feet`: "Nice. Now press your feet into the floor."
- `blue`: "Look around. Find one thing that's blue."
- `sound`: "Now listen. What's the farthest sound you can hear?"
- `doing`: "You're doing it. One small thing at a time."
- `check`: "How are you feeling now?"
- `better`: "I'm glad. Want to let someone know how you're doing?"
- `again`: "That's okay. Hard feelings take a while. We can do one more round."
- `stillHard`: "Thank you for doing this. This is a good moment to reach a real person."
- `bye`: "Bye for now. Go be with your people."

Under every Zags screen: "Zags is a scripted guide, not a person and not AI."

_Hello_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Hi, I'm Zags. I'm not a person, just a little guide. I can stay with you for a few minutes.
- **Button:** Okay, Zags
- **Button:** Not right now
- Zags is a scripted guide, not a person and not AI.

_Breathing (in)_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Breathe in…
- Breath 2 of 4
- **Button:** Skip breathing
- Zags is a scripted guide, not a person and not AI.

_Grounding step_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Nice. Now press your feet into the floor.
- **Button:** Done
- Zags is a scripted guide, not a person and not AI.

_How are you feeling now?_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** How are you feeling now?
- **Button:** A bit better
- **Button:** Still hard
- **Button:** Worse
- Zags is a scripted guide, not a person and not AI.

_A bit better_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** I'm glad. Want to let someone know how you're doing?
- Florida Warm Line: Every day, 4pm–10pm Eastern.
- **Link → `sms:5550142`:** Text Jordan
- **Link → `tel:5550142`:** Call Jordan
- **Link → `tel:18009451355`:** Call the Warm Line
- **Button:** I'm okay for now
- Zags is a scripted guide, not a person and not AI.

_Still hard, first time_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** That's okay. Hard feelings take a while. We can do one more round.
- **Button:** One more round
- **Link → `sms:5550142`:** Text Jordan
- **Link → `tel:5550142`:** Call Jordan
- **Link → `tel:18009451355`:** Call the Warm Line
- **Button:** Not right now
- Zags is a scripted guide, not a person and not AI.

_Still hard, second time_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Thank you for doing this. This is a good moment to reach a real person.
- Florida Warm Line: Every day, 4pm–10pm Eastern.
- **Link → `sms:5550142`:** Text Jordan
- **Link → `tel:5550142`:** Call Jordan
- **Link → `tel:18009451355`:** Call the Warm Line
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- Zags is a scripted guide, not a person and not AI.

_Bye_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Bye for now. Go be with your people.
- **Button:** Reach someone
- **Button:** Done
- Zags is a scripted guide, not a person and not AI.

Worse → straight to the crisis screen (`openCrisis()`, RED).

### On hold, not built: 6.7b Snuggle Zags, 6.7c Zags listens, 6.7d Safe place (need owner + clinician sign-off)

Copy from STAGE6-SPEC.md for early review. These lines are not in the app yet.
- 6.7b ending: "Feeling a bit more settled? I'm here if you need me, and so are your people." (Check against Zags rule 3: never "I'm always here for you".)
- 6.7b tip: "Hold me close"
- 6.7c prompt: "I'm listening. Go ahead."
- 6.7c acknowledgment (example): "Thank you for getting that out. That sounds heavy to carry."
- 6.7c: "I'm not a person, but I'm here while you get it out."
- 6.7c choices: "I'm not done — keep listening" · "Let it go" · "Keep it private" · "Help me calm down" · "I want a real person"
- 6.7d on every step: "Stop — I want to come back" (→ 5-4-3-2-1 grounding). Trauma caution: guided imagery can bring up distressing memories.
- 6.7d Part B: "This is a safe space. Nothing you type here leaves your phone." · "Call first" · "Directions"

## 7. Every other screen

Rendered for each state where the screen changes by state. Identical renders are listed once.

### `home`

- **Button:** Help _(screen reader: "Get help now")_
- **Button:** ZigZag Mind
- **Heading:** It's okay not to be okay.
- You don't have to figure everything out right now.
- **Button:** I don't feel safe — Get to a real person fast
- **Button:** I don't know what I need
- **Button:** Calm down
- **Button:** Get out of my head
- **Button:** Connect
- **Button:** Change the scene
- Or tell me what's happening
- **Button:** I'm anxious
- **Button:** I'm spiraling
- **Button:** I have an urge to use (drink or drugs)
- **Button:** I feel low
- **Button:** I feel alone
- **Button:** Just out of the ER
- **Button:** Tech check — AI, scrolling, or checking is getting to me
- **Button:** Home
- **Button:** My Plan
- **Button:** Progress
- **Button:** Settings

### `calm`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's slow things down.
- Pick one. You can stop any time.
- **Button:** Calm down with Zags — Breathe together for a few minutes
- **Button:** Breathe for 1 minute — In for 4, out for 6
- **Button:** 5-4-3-2-1 grounding — Notice what's around you
- **Button:** Feet on the floor — Three tiny steps, 2 minutes
- **Button:** What's still true? — Start with what you know
- **Button:** Find something real — Something you can hold, cooler, warmer
- **Button:** What's also true — The sentence on repeat, and what else is true
- **Button:** I'd rather talk to someone

### `still-true`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What's still true?
- When everything feels like too much, start with what you know.
- **Heading:** I am here right now.
- **Button:** That's true
- **Button:** Not true for me

### `dont-know`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** That's okay. One question.
- What would make this 10% easier? Do you want to calm down, get distracted, connect with someone, or get out of where you are?
- **Button:** Calm down — Slow my body down
- **Button:** Get distracted — Interrupt the loop for a few minutes
- **Button:** Connect with someone — A person, not another answer
- **Button:** Get out of where I am — Change the scene
- Scared of what you might do? Get help now

### `before`

_When: anxious_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's get through the next 10 minutes.
- Don't solve everything right now.
- **Heading:** How intense is this right now?
- Optional. You can skip this.
- Rating buttons: 0 to 10
- 0 · calm
- 10 · the most intense
- **Button:** Continue
- **Button:** Skip

_When: spiraling_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's get it out of your head.
- One thing at a time.
- **Heading:** How intense is this right now?
- Optional. You can skip this.
- Rating buttons: 0 to 10
- 0 · calm
- 10 · the most intense
- **Button:** Continue
- **Button:** Skip

_When: low_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's do one tiny thing.
- Small is enough.
- **Heading:** How intense is this right now?
- Optional. You can skip this.
- Rating buttons: 0 to 10
- 0 · calm
- 10 · the most intense
- **Button:** Continue
- **Button:** Skip

_When: craving_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** You don't have to decide right now.
- Let's give it a little time.
- **Heading:** How strong is the craving right now?
- Optional. You can skip this.
- Rating buttons: 0 to 10
- 0 · calm
- 10 · the most intense
- **Button:** Continue
- **Button:** Skip

_When: distraction_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's give your mind somewhere else to go.
- **Heading:** How intense is this right now?
- Optional. You can skip this.
- Rating buttons: 0 to 10
- 0 · calm
- 10 · the most intense
- **Button:** Continue
- **Button:** Skip

### `anx-feet`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Put both feet on the floor.
- Just do this one thing.
- **Button:** I've done it

### `anx-three`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Name 3 things you see.
- Typing is optional. Saying them in your head works too.
- **Text box** "Thing 1"
- **Text box** "Thing 2"
- **Text box** "Thing 3"
- **Button:** Done
- **Button:** Skip

### `anx-steps`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Take 10 slow steps.
- Count them if it helps.
- **Button:** I took the steps
- **Button:** Press my palms together instead

### `anx-palms`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Press your palms together for 10 seconds.
- Firm, not painful. Notice the pressure.
- 10
- **Button:** Done

### `ground`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Part 1 of 5
- **Heading:** Notice 5 things you can see.
- Tap a dot for each one. No need to type.
- **Button:** Next

### `checkin`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** How do you feel now?
- You can skip this.
- Rating buttons: 0 to 10
- 0 · calm
- 10 · the most intense
- **Button:** That helped
- **Button:** I still feel bad
- **Button:** Skip

### `recommendation`

_When: anxious_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What would make this 10% easier?
- **Heading:** Walking helped you before.
- Want to try it first?
- **Heading:** Something that helped you before: Music.
- **Button:** I'll do that
- **Button:** Try walking
- **Button:** Something else
- **Button:** I'm good for now

_When: spiraling, low, craving_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What would make this 10% easier?
- **Heading:** Walking
- This is on your list of things that help. A short, slow walk.
- **Heading:** Something that helped you before: Music.
- **Button:** I'll do that
- **Button:** Try walking
- **Button:** Something else
- **Button:** I'm good for now

_When: distraction_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What would make this 10% easier?
- **Heading:** Grounding
- One small step to try. Notice what's around you, one sense at a time.
- **Heading:** Something that helped you before: Music.
- **Button:** I'll do that
- **Button:** Try grounding
- **Button:** Something else
- **Button:** I'm good for now

### `phone-down`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** You're ready.
- You can put me away for a few minutes.
- **Button:** Put the phone down

### `suggestion`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Put on a song you like.
- From your list of things that help.
- **Button:** Done
- **Button:** Something else

### `intervention`

_When: anxious_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Grounding · Step 1 of 4
- **Heading:** Put both feet on the floor.
- **Button:** Next

_When: spiraling_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Thought Parking · Step 1 of 3
- **Heading:** Write down what's on your mind.
- **Button:** Next

_When: low_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Water · Step 1 of 2
- **Heading:** Get a glass of water.
- **Button:** Next

_When: craving_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Waiting it out · Step 1 of 4
- **Heading:** Move to another room.
- **Link → `tel:911`:** Already used, or took too much? Call 911.
- Shaking, sweating, confused, or seeing things? Withdrawal can be a medical emergency. Get medical help.
- For support: Call 988 · Text 988
- **Button:** Next

_When: distraction_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Quick distraction · Step 1 of 3
- **Heading:** Find 5 things around you that are blue.
- **Button:** Next

### `low-choose`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's do one tiny thing.
- Pick whichever feels easiest.
- **Button:** Body — Drink water.
- **Button:** Space — Open a window or step outside.
- **Button:** Connection — Text someone: hey
- **Button:** Borrow ten minutes — Just the next ten minutes.
- **Button:** A kinder voice — What would you tell a friend?
- **Button:** Find something alive — A pet, a bird, a tree.
- **Button:** Something kind — Only if you have the energy.

### `kind`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Something small and kind.
- Only if you have the energy. Taking care of yourself comes first.
- **Button:** Send someone a kind text — You choose who and what. You send it.
- **Button:** Something without my phone — Hold a door, a compliment, a neighbor
- **Button:** Not right now

### `kind-person`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Something kind
- **Heading:** Who comes to mind?
- **Button:** Jordan — friend
- **Button:** Not right now

### `kind-word`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Something kind
- **Heading:** What would you like to say?
- **Button:** Thinking of you
- **Button:** Thanks for being in my life
- **Button:** Hey, how are you doing lately?
- **Button:** Thank you for ___
- **Button:** Next
- **Button:** Not right now

### `kind-send`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Something small and kind.
- Only if you have the energy. Taking care of yourself comes first.
- **Button:** Send someone a kind text — You choose who and what. You send it.
- **Button:** Something without my phone — Hold a door, a compliment, a neighbor
- **Button:** Not right now

### `kind-offline`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Something kind
- **Heading:** Something small, without your phone.
- Hold a door for someone.
- Give someone a compliment.
- Help a neighbor with something small.
- Any one is plenty. None is fine too.
- **Button:** Done
- **Button:** Not right now

### `spiral-input`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's get it out of your head.
- What's running through your mind? One thought per line.
- **Button:** Make cards
- **Button:** Or: one sentence and what's also true

### `spiral-sort`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Where does each one go?
- Drag a card by its handle into a box, or tap a button on the card.
- (your thought)
- **Button:** Now
- **Button:** Later
- **Button:** Not in my control
- **Heading:** Now
- I can act on this.
- **Heading:** Later
- Matters, just not today.
- **Heading:** Not in my control
- Drop things here that you can't change right now.
- **Button:** Sort each thought to continue

### `spiral-step`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Nothing here needs doing right now.
- You can let these wait.
- **Button:** Continue

### `spiral-next`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Here's your one next step.
- One next step
- (your next step)
- Everything else can wait.
- **Button:** Continue

### `craving-delay`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Let's wait 15 minutes together.
- The urge can rise and fall. You don't have to act on it.
- 15:00
- left
- **Heading:** While you wait
- Any of these, in any order. Skip what doesn't fit.
- **Button:** Move to another room.
- **Button:** Drink some water.
- **Button:** Put some distance between you and the thing you're craving.
- **Button:** Take a short walk.
- **Button:** Play the 1-minute Focus game
- **Link → `sms:5550142?&body=Can you talk for a few minutes?`:** Text Jordan
- **Button:** Ride the wave
- **Link → `tel:911`:** Already used, or took too much? Call 911.
- Shaking, sweating, confused, or seeing things? Withdrawal can be a medical emergency. Get medical help.
- For support: Call 988 · Text 988
- **Button:** Or borrow ten minutes instead
- **Button:** I already used
- **Button:** Check in early

### `craving-used`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Thanks for telling me.
- No judgment here. What matters is the next few minutes.
- **Link → `tel:911`:** Took too much, or feel unwell? Call 911.
- Shaking, sweating, confused, or seeing things? Withdrawal can be a medical emergency. Get medical help.
- For support: Call 988 · Text 988
- **Heading:** Want to do one small thing for the next 10 minutes?
- **Button:** Yes
- **Button:** Not right now

### `focus`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Tap when the dot is inside the ring.
- No score. Just follow it.
- 1:00
- **Button:** Done

### `zags`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Hi, I'm Zags. I'm not a person, just a little guide. I can stay with you for a few minutes.
- **Button:** Okay, Zags
- **Button:** Not right now
- Zags is a scripted guide, not a person and not AI.

### `cw-person`

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Code word
- **Heading:** Who should get your code word?
- Pick someone who'd want to know when things are hard.
- **Button:** Jordan — friend
- **Button:** Back to My Plan

### `cw-word`

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Code word
- **Heading:** Who should get your code word?
- Pick someone who'd want to know when things are hard.
- **Button:** Jordan — friend
- **Button:** Back to My Plan

### `cw-send`

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Code word
- **Heading:** Who should get your code word?
- Pick someone who'd want to know when things are hard.
- **Button:** Jordan — friend
- **Button:** Back to My Plan

### `ci-name`

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Check-in reminders
- **Heading:** What name should their reminders show?
- Your first name, so their calendar says "Check in on [your name]". Optional. If you leave it blank, it says "your friend".
- Your first name (saved in your plan)
- **Text box**
- **Button:** Next
- **Button:** Back to My Plan

### `ci-person`

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Check-in reminders
- **Heading:** Who would you like to check in on you?
- They'll get a link that adds gentle reminders to their own calendar. Nothing is sent by ZigZag Mind.
- **Button:** Jordan — friend
- **Button:** Back to My Plan

### `ci-send`

- **Button:** Help _(screen reader: "Get help now")_
- Set up with your people · Check-in reminders
- **Heading:** Who would you like to check in on you?
- They'll get a link that adds gentle reminders to their own calendar. Nothing is sent by ZigZag Mind.
- **Button:** Jordan — friend
- **Button:** Back to My Plan

### `plan-now`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Your plan.
- Just the essentials, right now.
- Do this first
- Take a short, slow walk.
- Reach a person
- **Link → `tel:5550142`:** Call Jordan
- **Link → `sms:5550142?&body=I'm having a really hard time. Can you call me?`:** Text Jordan
- Places I can go
- The coffee shop on Main St · The public library
- What I want to remember
- Don't make big decisions when I'm overwhelmed.
- Crisis support
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Link → `tel:911`:** Call 911 — If someone is hurt or in danger
- ZigZag Mind is not an emergency service.
- **Button:** I'm done

### `connect`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** You don't have to sit with this alone.
- Talk to someone who's been there
- **Heading:** Florida Warm Line
- Every day, 4pm–10pm Eastern. Not a crisis line. Just real people who've been through it.
- **Link → `tel:18009451355`:** Call the Warm Line
- **Link → `https://findahelpline.com`:** After 10pm or outside Florida: find a warmline near you
- Reach one of your people
- **Heading:** Jordan · friend
- **Link → `sms:5550142`:** Text _(screen reader: "Text Jordan")_
- **Link → `tel:5550142`:** Call _(screen reader: "Call Jordan")_
- Don't know what to say? Tap one:
- **Link → `sms:5550142?&body=Can't sleep, you up?`:** Can't sleep, you up?
- **Link → `sms:5550142?&body=Rough night. Can you talk for 5 minutes?`:** Rough night. Can you talk for 5 minutes?
- **Link → `sms:5550142?&body=Want to catch up this week?`:** Want to catch up this week?
- **Button:** Stay with Zags for a few minutes — Until someone calls back
- **Button:** Make a song while you wait
- If it gets heavier
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_

### `human-first`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Would talking to a person help more than another answer?
- Jordan is in your plan.
- **Link → `tel:5550142`:** Call someone
- **Link → `sms:5550142`:** Text someone
- **Button:** Be around people
- **Button:** Not right now

### `after-setup`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** When did you leave?
- For the next 30 days, ZigZag Mind keeps a few things close: 988, your people, and a short, optional checklist. You can end this any time in Settings.
- **Button:** Today
- **Button:** Yesterday
- **Button:** A few days ago

### `after`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Welcome home. One small thing at a time.
- All optional. Any order.
- **Button:** Mark as done: Tell one person you're home
- **Link → `sms:5550142?&body=I'm home now. It would mean a lot to hear from you this week.`:** Text Jordan
- **Button:** Mark as done: Set up your code word
- **Button:** Set it up
- **Button:** Mark as done: Add your follow-up appointment
- No appointment yet? Ask the place you were seen to help schedule one.
- Date
- **Text box**
- Time (optional)
- **Text box**
- **Button:** Add it to my calendar
- **Button:** Mark as done: Ask your people to check in
- **Button:** Ask someone
- **Button:** Mark as done: Daily reminders for 2 weeks
- Adds them to your own calendar.
- **Button:** Add daily reminders
- Getting help is a strength, not a weakness. Seeing a psychiatrist, therapist or counselor is care for your mind, the same way you'd see a doctor for your body. It doesn't mean you're 'crazy', broken or weak. Lots of people get help at some point, and many feel better for it. If medication is suggested, that's a choice you make together with a professional, and it's okay either way.

### `faith`

- **Button:** Help _(screen reader: "Get help now")_
- **Button:** ZigZag Mind
- **Heading:** It's okay not to be okay.
- You don't have to figure everything out right now.
- **Button:** I don't feel safe — Get to a real person fast
- **Button:** I don't know what I need
- **Button:** Calm down
- **Button:** Get out of my head
- **Button:** Connect
- **Button:** Change the scene
- Or tell me what's happening
- **Button:** I'm anxious
- **Button:** I'm spiraling
- **Button:** I have an urge to use (drink or drugs)
- **Button:** I feel low
- **Button:** I feel alone
- **Button:** Just out of the ER
- **Button:** Tech check — AI, scrolling, or checking is getting to me
- **Button:** Home
- **Button:** My Plan
- **Button:** Progress
- **Button:** Settings

### `faith-passage`

- **Button:** Help _(screen reader: "Get help now")_
- **Button:** ZigZag Mind
- **Heading:** It's okay not to be okay.
- You don't have to figure everything out right now.
- **Button:** I don't feel safe — Get to a real person fast
- **Button:** I don't know what I need
- **Button:** Calm down
- **Button:** Get out of my head
- **Button:** Connect
- **Button:** Change the scene
- Or tell me what's happening
- **Button:** I'm anxious
- **Button:** I'm spiraling
- **Button:** I have an urge to use (drink or drugs)
- **Button:** I feel low
- **Button:** I feel alone
- **Button:** Just out of the ER
- **Button:** Tech check — AI, scrolling, or checking is getting to me
- **Button:** Home
- **Button:** My Plan
- **Button:** Progress
- **Button:** Settings

### `faith-pray`

- **Button:** Help _(screen reader: "Get help now")_
- **Button:** ZigZag Mind
- **Heading:** It's okay not to be okay.
- You don't have to figure everything out right now.
- **Button:** I don't feel safe — Get to a real person fast
- **Button:** I don't know what I need
- **Button:** Calm down
- **Button:** Get out of my head
- **Button:** Connect
- **Button:** Change the scene
- Or tell me what's happening
- **Button:** I'm anxious
- **Button:** I'm spiraling
- **Button:** I have an urge to use (drink or drugs)
- **Button:** I feel low
- **Button:** I feel alone
- **Button:** Just out of the ER
- **Button:** Tech check — AI, scrolling, or checking is getting to me
- **Button:** Home
- **Button:** My Plan
- **Button:** Progress
- **Button:** Settings

### `tech`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Tech check
- No judgment. Tech is allowed. Let's just see what it's doing to you right now.
- **Button:** I keep asking AI the same thing
- **Button:** I keep checking — Texts, feeds, news, an ex's profile, symptoms, stocks
- **Button:** I'm afraid I'm falling behind
- **Button:** I think I'm getting attached to AI
- **Button:** I'm using AI instead of people
- **Button:** My AI changed or is gone

### `tc-reliance`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Sometimes another answer doesn't solve uncertainty. It just gives it another place to go.
- **Heading:** Stop
- Close the chat for 10 minutes.
- **Heading:** Decide
- What do you actually need to decide?
- **Heading:** Act
- Take one real-world step.
- **Button:** Start a 10-minute break
- **Button:** I'm done

### `tc-check`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Are you looking for information, or reassurance?
- Either is okay. Just notice which.
- **Button:** Information
- **Button:** Reassurance

### `tc-loop`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- 10-minute loop break
- **Heading:** Break the loop
- 10:00
- **Button:** Done: Stop checking
- **Button:** Done: Put the phone face down
- **Button:** Done: Do one physical thing: stand, stretch, get water
- **Button:** Done: Play a quick game or change the scene
- **Button:** A quick game
- **Button:** Change the scene
- In 10 minutes, ask: do I still need to check?
- **Button:** I'm done

### `tc-fomo`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Afraid you're falling behind?
- **Heading:** What are you afraid of missing?
- **Button:** Career
- **Button:** Money
- **Button:** Productivity
- **Button:** Knowledge
- **Button:** Creativity
- **Button:** Relationships
- **Button:** Something else
- What I know
- What I'm afraid of
- One thing I can actually do
- Only on this screen. Not saved.
- **Button:** Next

### `tc-fomo-end`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** You don't need to keep checking. Pick one thing, then close it and do the thing.
- **Heading:** Talk it over with someone
- **Link → `sms:5550142?&body=I'm having a really hard time. Can you call me?`:** Text Jordan
- **Link → `tel:5550142`:** Call Jordan
- If you're drinking or using more to cope, that's worth saying out loud to someone. Help with an urge
- **Button:** Done

### `tc-attached`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Getting attached to an AI
- AI can feel personal. It answers fast, remembers what you said, and never gets tired. That can feel meaningful. It still isn't a human relationship.
- **Heading:** What does it give you?
- **Button:** Someone to talk to
- **Button:** Reassurance
- **Button:** Attention
- **Button:** No judgment
- **Button:** Company
- **Button:** Advice
- **Button:** Something else
- **Heading:** What might it be replacing?
- **Button:** Friends
- **Button:** Family
- **Button:** Dating
- **Button:** Sleep
- **Button:** Work
- **Button:** School
- **Button:** Time away from screens
- **Button:** Nothing
- Just for you to notice. Not saved.
- **Heading:** Would one real-world connection help right now?
- **Link → `sms:5550142?&body=hey`:** Text someone
- **Link → `tel:5550142`:** Call someone
- **Button:** Be around people
- **Button:** Go somewhere
- **Button:** Take a tech break
- **Heading:** Set a boundary with your AI
- Paste this into your AI's custom instructions.
- **Button:** Copy boundary text
- Not every AI follows this every time. It's a nudge, not a guarantee.
- **Button:** I'm done

### `tc-loss`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** What you felt was real. Losing a voice you talked to every day can feel like a breakup or a loss. A lot of people are going through this.
- **Button:** Next

### `tc-reflect`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Which feels closest right now?
- Only you can say. Nothing is scored or saved.
- **Button:** AI is a tool for me
- **Button:** It's becoming a way to cope
- **Button:** It's time to step away for a bit
- **Button:** Skip

### `song`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Turn it into a song.
- Three short lines in your own words. ZigZag Mind turns them into a song that starts where you are and ends somewhere steadier.
- **Heading:** How does it feel right now?
- **Button:** Heavy
- **Button:** Anxious
- **Button:** Angry
- **Button:** Numb
- **Button:** Mixed
- **Button:** Next

### `song-line`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Line 1 of 3
- **Heading:** What's happening?
- Say it plainly. A few words is enough.
- Type it, or tap the mic on your keyboard to say it.
- **Button:** Next

### `song-play`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Turn it into a song.
- Three short lines in your own words. ZigZag Mind turns them into a song that starts where you are and ends somewhere steadier.
- **Heading:** How does it feel right now?
- **Button:** Heavy
- **Button:** Anxious
- **Button:** Angry
- **Button:** Numb
- **Button:** Mixed
- **Button:** Next

### `song-reflect`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** That's okay. Some things take longer.
- **Heading:** Add something that's still true today
- It becomes a new last line, so the song grows with you.
- Something that's still true today
- **Button:** Add it and play
- **Button:** Not now

### `song-list`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** My songs
- Saved only on this phone. Listen back and notice what's changed.
- No songs yet.
- **Button:** Make a new song

### `borrow`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** You don't have to decide the rest of your day.
- Just borrow the next ten minutes.
- **Button:** Walk
- **Button:** Shower
- **Button:** Sit outside
- **Button:** Put on music
- **Button:** Drink water
- **Button:** Call someone
- **Button:** Tidy one thing
- **Button:** Change rooms

### `borrow-step`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Borrow ten minutes
- **Heading:** Take a walk. Anywhere is fine.
- **Button:** Start a gentle 10-minute timer
- Optional. Leave any time.
- **Button:** I'm done

### `borrow-end`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** The ten minutes are yours.
- **Button:** Next
- **Button:** Put the phone down

### `ts`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What's also true
- **Heading:** What's the sentence your brain keeps repeating?
- The sentence your brain keeps repeating
- **Text box**
- **Button:** Next

### `ts-show`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What's also true
- **Button:** Next
- **Button:** Put the phone down

### `stranger`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** If someone you cared about felt like this, what would you tell them?
- **Button:** I'd listen.
- **Button:** I'd tell them to take a break.
- **Button:** I'd tell them to call someone.
- **Button:** I'd give them some space.
- **Button:** I'd sit with them.

### `alive`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Find something alive.
- Do you have a pet nearby?
- **Button:** Yes
- **Button:** No

### `ridiculous`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Make this less serious. Just for a moment.
- **Heading:** Find the most boring object in the room.
- **Button:** Okay. Back to reality.

### `touch`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Find something real.
- Find something you can hold.
- Optional: how does it feel?
- **Button:** smooth
- **Button:** rough
- **Button:** warm
- **Button:** cool
- **Button:** soft
- **Button:** hard
- **Button:** heavy
- **Button:** light
- **Button:** Next
- **Button:** Done

### `scene`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Change the scene.
- Sometimes your brain needs a different place, not another question. Pick one.
- **Button:** Step outside for 5 minutes
- **Button:** Take a short walk
- **Button:** Sit somewhere different
- **Button:** Take a shower
- **Button:** Get something to drink
- **Button:** Find something alive
- **Heading:** Somewhere to go
- Opens your phone's Maps. ZigZag Mind never sees your location.
- **Link → `https://www.google.com/maps/search/library`:** Library
- **Link → `https://www.google.com/maps/search/park`:** Park
- **Link → `https://www.google.com/maps/search/coffee+shop`:** Coffee shop
- **Link → `https://www.google.com/maps/search/community+center`:** Community center
- **Heading:** Need real-world help near you?
- 211 connects you to local help: food, housing, support groups. Free.
- **Link → `tel:211`:** Call 211

### `scene-step`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Change the scene
- **Heading:** Step outside for 5 minutes.
- Tap Done when you've done it, or whenever you're ready.
- **Button:** Done

### `distract`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Get out of my head.
- Quick games to interrupt the loop. 1 to 5 minutes. No points, no levels.
- **Button:** Turn it into a song — Three lines in your words, made into a short song
- **Button:** Color hunt — Find 5 blue things, then 3 red
- **Button:** Around me — Something soft, cold, older than you
- **Button:** Rapid categories — 5 animals, 5 cities, 5 foods
- **Button:** Memory snap — See 6 shapes, then find them again
- **Button:** Pattern break — Watch a pattern, tap it back
- **Button:** 60-second challenge — Your only job: beat the timer
- **Button:** Focus — Tap when the dot reaches the ring. One minute.
- **Button:** Make this less serious — One absurd little mission
- **Button:** Borrow ten minutes — Just the next ten minutes
- **Button:** Calm down with Zags — Breathe together for a few minutes

### `g-color`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Color hunt · Part 1 of 2
- **Heading:** Find 5 things around you that are blue.
- Tap a circle for each one. No need to type.
- **Button:** Blue thing 1
- **Button:** Blue thing 2
- **Button:** Blue thing 3
- **Button:** Blue thing 4
- **Button:** Blue thing 5
- Then: 3 things that are red.
- **Button:** Next

### `g-around`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Around me
- **Heading:** Look around you. Find each one.
- Tap each one when you find it. Skip any you like.
- **Button:** Something soft
- **Button:** Something cold
- **Button:** Something rectangular
- **Button:** Something older than you
- **Button:** Something that makes a sound
- **Button:** Done

### `g-cats`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Rapid categories · Part 1 of 3
- **Heading:** Name 5 animals.
- Out loud or in your head. Tap the button for each one.
- **Button:** I named one
- **Button:** Next

### `g-memory`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Memory snap
- **Heading:** Look at these 6 shapes.
- They'll hide in a few seconds.

### `g-pattern`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Pattern break
- **Heading:** Watch the pads light up, then tap them back.
- Missed one? It just plays again.
- **Button:** Pad, top left
- **Button:** Pad, top right
- **Button:** Pad, bottom left
- **Button:** Pad, bottom right
- Watch.
- **Button:** Show it again
- **Button:** I'm done

### `game-check`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Did the intensity change?
- You can skip this.
- **Button:** Yes
- **Button:** A little
- **Button:** No
- **Button:** Skip

### `plan`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** My plan for hard moments
- **Button:** I need my plan now
- Build it on a good day, so it's ready on a hard one. Each part saves on its own.
- **Heading:** How I know a hard moment is starting
- **Button:** Edit _(screen reader: "Edit: How I know a hard moment is starting")_
- I stop answering texts.
- I can't sit still.
- **Heading:** Things that help me on my own
- **Button:** Edit _(screen reader: "Edit: Things that help me on my own")_
- Walking
- Music
- Shower
- **Heading:** People and places that take my mind off things
- **Button:** Edit _(screen reader: "Edit: People and places that take my mind off things")_
- The coffee shop on Main St
- The public library
- **Heading:** My trusted people
- **Button:** Edit _(screen reader: "Edit: My trusted people")_
- ZigZag Mind will never contact these people for you. These buttons only open your phone's call or text app.
- Jordan · friend · 555-0142
- **Link → `tel:5550142`:** Call _(screen reader: "Call Jordan")_
- **Link → `sms:5550142?&body=I'm having a really hard time. Can you call me?`:** Text _(screen reader: "Text Jordan")_
- **Button:** Share the supporter guide _(screen reader: "Share the supporter guide with Jordan")_
- **Heading:** Professional and crisis support
- **Button:** Edit _(screen reader: "Edit: Professional and crisis support")_
- 988 Suicide & Crisis Lifeline, free and 24/7. Always in your plan.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- Getting help is a strength, not a weakness. Read more
- **Heading:** Set up with your people
- One word that means: I'm struggling, call me.
- **Button:** Set up
- What you'll keep away during hard times, and who holds it.
- **Button:** Set up
- Ask someone to check in on you now and then.
- **Button:** Set up
- **Heading:** My time and distance plan
- **Button:** Edit _(screen reader: "Edit: My time and distance plan")_
- Private. Only on this phone.
- Things I'll keep away from myself during hard times
- Nothing here yet.
- Who will hold them, or where they'll go
- Nothing here yet.
- When I'll get them back
- Nothing here yet.
- Ask someone to hold onto a few things:
- **Link → `sms:5550142?&body=Would you be willing to hold onto a few things for me for a while? I'll explain when we talk.`:** Ask Jordan _(screen reader: "Ask Jordan to hold onto a few things")_
- Songs you make and keep show up here.
- **Button:** Make one
- **Heading:** Things to avoid when I'm struggling
- **Button:** Edit _(screen reader: "Edit: Things to avoid when I'm struggling")_
- Scrolling in bed late at night.
- **Heading:** What I want ZigZag Mind to remind me
- **Button:** Edit _(screen reader: "Edit: What I want ZigZag Mind to remind me")_
- Don't make big decisions when I'm overwhelmed.
- **Button:** Home
- **Button:** My Plan
- **Button:** Progress
- **Button:** Settings

### `plan-edit`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** My trusted people
- Up to 3, in the order you'd want to reach them. ZigZag Mind never contacts anyone for you.
- First person to reach
- Name
- **Text box**
- Phone
- **Text box**
- Relationship
- **Text box** (hint: "Friend, sister, coworker")
- Person 2 (optional)
- Name
- **Text box**
- Phone
- **Text box**
- Relationship
- **Text box** (hint: "Friend, sister, coworker")
- Person 3 (optional)
- Name
- **Text box**
- Phone
- **Text box**
- Relationship
- **Text box** (hint: "Friend, sister, coworker")
- **Button:** Save
- **Button:** Cancel

### `progress`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Progress
- The last 7 days. What you did, never a score.
- Hard moments handled
- 7
- Times you used your plan
- 4
- Times you reached out
- 3
- Actions completed
- 7
- **Heading:** Most helpful for you
- Walking (across 2 check-ins)
- **Heading:** Average change during a session
- 7.4 → 5.3
- Across 7 check-ins where you rated before and after.
- Includes fictional sample data. You can remove it in Settings.
- **Button:** Home
- **Button:** My Plan
- **Button:** Progress
- **Button:** Settings

### `settings`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Settings
- **Heading:** Appearance
- **Button:** Auto
- **Button:** Light
- **Button:** Dark
- **Heading:** Motion
- **Button:** Match my phone
- **Button:** Reduce motion
- **Heading:** Haptics
- **Button:** Off
- **Button:** On
- A light tap when you finish a step. Not every phone supports this.
- **Heading:** Where you are
- **Button:** Auto
- **Button:** In the US
- **Button:** Outside the US
- Auto uses your phone's time zone and language as a hint. Right now it doesn't add "Find a helpline in your country". 911 and 988 always stay on screen.
- **Heading:** What gives you strength?
- Optional. Only on this phone. Tap again to clear.
- **Button:** Bible
- **Button:** Another faith or tradition
- **Button:** Spiritual but not religious
- **Button:** Nature
- **Button:** Family
- **Button:** Personal values
- **Button:** Something else
- **Heading:** Your data
- Save on this device
- **Button:** On
- **Button:** Off
- Your plan and check-ins are saved only in this browser on this phone. Nothing is sent anywhere.
- **Button:** Export my data
- **Button:** Load sample data
- **Button:** Delete everything
- **Heading:** About
- **Button:** About ZigZag Mind
- ZigZag Mind is a self-help support tool. It is not therapy, medical care, or an emergency service. If you're in danger, call 911 or call or text 988.
- **Link → `https://ko-fi.com/zigzagmind`:** Support ZigZag Mind
- Free for everyone, always. If it helped, you can help keep it running.
- **Button:** Home
- **Button:** My Plan
- **Button:** Progress
- **Button:** Settings

### `export`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Your data
- Copy this to keep a record. It doesn't go anywhere unless you paste it somewhere.
- **Button:** Copy
- **Button:** Back

### `confirm-delete`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Delete everything?
- This removes your plan, your check-ins, and your history from this device. It can't be undone.
- Crisis support stays available, and 988 stays in your plan.
- **Button:** Delete everything
- **Button:** Cancel

### `ob-about`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Welcome to ZigZag Mind.
- Help for hard moments, one small step at a time.
- In danger or thinking about suicide? Call or text 988. It's free and open 24/7.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- **Heading:** What it is
- A self-help tool for anxiety, spiraling thoughts, cravings, and low moods.
- Small, concrete things to try, and a plan you make yourself.
- Private. What you write stays on this phone.
- **Heading:** What it isn't
- Not an emergency service. Call 911 if someone is hurt or in danger.
- Not therapy, medical care, or a diagnosis.
- Not a person. It never contacts anyone for you.
- **Button:** Next

### `ob-age`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Are you 18 or older?
- ZigZag Mind is made for adults.
- **Button:** Yes, I'm 18 or older
- **Button:** No, I'm under 18
- **Button:** Back

### `ob-minor`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** ZigZag Mind is made for adults.
- You still deserve support that fits you. If things are hard right now, 988 is free, open 24/7, and there for people of any age.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- You can also talk to an adult you trust: a parent, a teacher, a school counselor, or a doctor.
- Call 911 if someone is hurt or in danger.

### `ob-plan`

- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Want to make your plan now?
- Your plan holds what helps on a hard day: the early signs, things that help, people to reach, and what you want to remember.
- It's easiest to make on a good day. It takes a few minutes, and it's saved only on this phone.
- You'll find it any time under My Plan.
- **Button:** Make my plan now
- **Button:** Later

### `about`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- ZigZag Mind
- **Heading:** Get through what's happening right now.
- Small actions. Real support. One moment at a time.
- In crisis right now?
- **Link → `tel:988`:** Call or text 988
- **Button:** Try ZigZag Mind
- **Button:** How it works
- **Heading:** When your mind is racing
- Turn tangled thoughts into one next step.
- **Heading:** When you feel stuck
- Take one tiny action.
- **Heading:** When things feel unsafe
- Get to a real person fast.
- When something isn't helping, ZigZag doesn't tell you to try harder. It helps you try a different direction.
- Don't fight the feeling. Change one variable.
- **Heading:** How it works
- Tell ZigZag Mind what's happening, in one tap.
- Do one small, concrete thing.
- Notice whether it helped. Rating is optional.
- Try another step, or stop. Both are fine.
- **Heading:** Getting help
- Getting help is a strength, not a weakness. Seeing a psychiatrist, therapist or counselor is care for your mind, the same way you'd see a doctor for your body. It doesn't mean you're 'crazy', broken or weak. Lots of people get help at some point, and many feel better for it. If medication is suggested, that's a choice you make together with a professional, and it's okay either way.
- **Heading:** Helping others
- Helping someone else can help you too. Small acts of kindness can lift your mood and make you feel less alone. It doesn't have to be big: a kind text, a thank-you, checking on a friend. Only if you have the energy. Taking care of yourself comes first.
- **Heading:** Your privacy
- What you write stays on your phone. We don't sell or share it. You can delete everything with one tap.
- In this prototype, data is saved only in your browser on this device. Turn saving off in Settings for a shared phone.
- ZigZag Mind is a self-help support tool. It is not therapy, medical care, or an emergency service. If you're in danger, call 911 or call or text 988.
- Free for everyone, always. Support ZigZag Mind

### Each intervention screen

#### Grounding

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Grounding · Step 1 of 4
- **Heading:** Put both feet on the floor.
- **Button:** Next

#### Walking

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Walking · Step 1 of 4
- **Heading:** Stand up when you're ready.
- **Button:** Next

#### Breathing

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Breathing · Step 1 of 3
- **Heading:** Breathe in slowly while you count to 4.
- **Button:** Next

#### Thought Parking

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Thought Parking · Step 1 of 3
- **Heading:** Write down what's on your mind.
- **Button:** Next

#### Reaching out

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Reaching out · Step 1 of 2
- **Heading:** Pick someone you trust.
- **Link → `tel:5550142`:** Call Jordan
- **Link → `sms:5550142?&body=hey`:** Text Jordan
- ZigZag Mind never contacts anyone for you. These buttons open your phone.
- **Button:** Next

#### Water

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Water · Step 1 of 2
- **Heading:** Get a glass of water.
- **Button:** Next

#### Fresh air

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Fresh air · Step 1 of 2
- **Heading:** Open a window or step outside.
- **Button:** Next

#### Quick distraction

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Quick distraction · Step 1 of 3
- **Heading:** Find 5 things around you that are blue.
- **Button:** Next

#### Color hunt

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Color hunt · Step 1 of 2
- **Heading:** Find 5 things around you that are blue.
- **Button:** Next

#### Around me

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Around me · Step 1 of 5
- **Heading:** Find something soft.
- **Button:** Next

#### Rapid categories

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Rapid categories · Step 1 of 3
- **Heading:** Name 5 animals.
- **Button:** Next

#### Memory snap

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Memory snap · Step 1 of 3
- **Heading:** Look at 6 shapes for a few seconds.
- **Button:** Next

#### Pattern break

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Pattern break · Step 1 of 2
- **Heading:** Watch 4 pads light up.
- **Button:** Next

#### 60-second challenge

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- 60-second challenge · Step 1 of 2
- **Heading:** For the next 60 seconds, your only job is to beat the timer.
- **Button:** Next

#### Calm down with Zags

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Calm down with Zags · Step 1 of 4
- **Heading:** Breathe in for 4, out for 6.
- **Button:** Next

#### Change the scene

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Change the scene · Step 1 of 5
- **Heading:** Step outside for 5 minutes.
- **Button:** Next

#### Waiting it out

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Waiting it out · Step 1 of 4
- **Heading:** Move to another room.
- **Link → `tel:911`:** Already used, or took too much? Call 911.
- Shaking, sweating, confused, or seeing things? Withdrawal can be a medical emergency. Get medical help.
- For support: Call 988 · Text 988
- **Button:** Next

#### What's still true

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What's still true · Step 1 of 3
- **Heading:** Read one short statement.
- **Button:** Next

#### One tiny task

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- One tiny task · Step 1 of 2
- **Heading:** Pick one tiny task: make the bed, wash one dish, or put on clean socks.
- **Button:** Next

#### Borrow ten minutes

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Borrow ten minutes · Step 1 of 2
- **Heading:** Pick one thing for the next ten minutes.
- **Button:** Next

#### What's also true

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- What's also true · Step 1 of 2
- **Heading:** Write the sentence your brain keeps repeating.
- **Button:** Next

#### Talk to yourself like a friend

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Talk to yourself like a friend
- **Heading:** Pick what you'd tell someone you cared about.
- **Button:** Done

#### Find something alive

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Find something alive · Step 1 of 2
- **Heading:** Find a pet, or look outside for something alive.
- **Button:** Next

#### Ridiculous mode

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Ridiculous mode
- **Heading:** Do one absurd mission.
- **Button:** Done

#### Find something real

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Find something real · Step 1 of 2
- **Heading:** Find something you can hold.
- **Button:** Next

#### Turn it into a song

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Turn it into a song · Step 1 of 3
- **Heading:** Pick how it feels.
- **Button:** Next

#### Asking AI again

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Asking AI again · Step 1 of 3
- **Heading:** Stop.
- **Button:** Next

#### Break the loop

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Break the loop · Step 1 of 3
- **Heading:** Stop checking.
- **Button:** Next

#### Falling behind

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Falling behind · Step 1 of 3
- **Heading:** What I know.
- **Button:** Next

#### Attached to AI

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- Attached to AI · Step 1 of 3
- **Heading:** What does it give you?
- **Button:** Next

#### My AI changed or is gone

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- My AI changed or is gone · Step 1 of 3
- **Heading:** Ground for a moment.
- **Button:** Next

### Home, iPhone Safari (shows the add-to-home-screen tip)

- Add ZigZag Mind to your home screen so your plan stays with you. Tap Share, then Add to Home Screen.
- **Button:** Got it

## 8. Sample data (fictional, only when someone taps "Load sample data" in Settings)

```json
{
  "warningSigns": [
    "I stop answering texts.",
    "I can't sit still."
  ],
  "helps": [
    "walking",
    "music",
    "shower"
  ],
  "places": [
    "The coffee shop on Main St",
    "The public library"
  ],
  "trustedPeople": [
    {
      "name": "Jordan",
      "relationship": "friend",
      "phone": "555-0142"
    }
  ],
  "avoid": [
    "Scrolling in bed late at night."
  ],
  "reminders": [
    "Don't make big decisions when I'm overwhelmed."
  ]
}
```
