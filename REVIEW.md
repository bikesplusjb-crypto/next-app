# ZigZag Mind: clinician review pack

Every safety rule, phrase list, crisis-screen string, intervention, and piece of flow copy in the app, word for word, so a licensed clinician can review it in one place.

**Generated from `index.html` by `npm run review`. Do not edit by hand.** If the app's wording changes, the tests fail until this file is regenerated.

How to read screen text: each screen is listed top to bottom as it appears on a phone. **Button** and **Link** lines are things a person can tap. Links show where they go (`tel:` opens the phone dialer, `sms:` opens Messages with the text shown). ZigZag Mind never calls or texts anyone itself.

## 1. Escalation rules

Safety level lives only for the current visit and is **never saved**. Levels: GREEN (default), YELLOW (elevated), RED (crisis).

- **Free-text check.** Every free-text box (except My Plan fields, which are exempt) is checked when submitted. Text is lowercased, apostrophes removed, and everything that isn't a letter or number becomes a space. If it contains any RED phrase → RED. Otherwise, any YELLOW phrase → YELLOW. Otherwise GREEN. Matching is on whole words/phrases.
- **RED** stops everything (flows, games, check-ins) and opens the crisis screen immediately. Nothing from that moment is saved.
- **YELLOW** shows the support bar ("You don't have to handle this alone." · Call 988 · Talk to someone) on every non-crisis screen for the rest of the visit, and the suggestion engine offers connection, the person's own plan, grounding, or a change of space first.
- **Automatic YELLOW:** tapping "I still feel bad" twice in a visit (a game answered "No" counts as one), or giving a 9 or 10 rating (before or after) twice in a visit.
- **Tapping Help** (top right of every screen) or **"I don't feel safe"** → RED crisis screen. One tap, no confirmation.
- **Crisis question:** "Are you in danger of hurting yourself or someone else right now?" Yes or I'm not sure → full crisis screen (RED). No → YELLOW, "What would help right now?" (talk to someone / open my plan / do something grounding), then "Do you feel safer than a few minutes ago?" Yes → Home (YELLOW). No or Not sure → full crisis screen (RED).
- **Leaving RED** is only possible through "That's not what I meant — go back", No on the danger question, or Yes on "Do you feel safer". Each leads to YELLOW. Nothing ever returns to GREEN in the same visit.
- **Calling or texting** from the "What would help" screen moves straight to "Do you feel safer" in the same tap, before the phone app opens.
- **Human First** (this visit only, never saved): after 2 taps on "Something else", or 2 finished steps without "That helped" (a game answered "No" counts), ask once: "Would talking to a person help more than another answer?" Call someone · Text someone · Be around people (→ Change the scene, Somewhere to go) · Not right now. Never shown over a crisis screen.
- **Warm line** (Connect): Florida Warm Line, `tel:18009451355`. "Every day, 4pm–10pm. Not a crisis line. Just real people who've been through it." Hours are display text only; the button is never disabled by the clock. "After 10pm or outside Florida: find a warmline near you" → `https://findahelpline.com`.
- **First launch:** onboarding never blocks the crisis screens. Leaving a crisis screen during onboarding returns to onboarding at YELLOW.
- **Outside the US** (guessed from the phone's time zone, then language; can be set in Settings): adds "Find a helpline in your country" (findahelpline.com) under 988. 911 and 988 are never hidden.

## 2. Safety phrase lists

### RED phrases (23) → crisis screen

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

Changed for review: the craving button now reads "I have an urge to use (drink or drugs)" (was "I want to use"). It still opens the same craving flow (`flow:craving`).

### My Plan sections

- "How I know a hard moment is starting" (hint: "In your own words. One per line.")
- "Things that help me on my own"
- "People and places that take my mind off things" (hint: "Names or places. One per line.")
- "My trusted people"
- "Professional and crisis support"
- "Making my space safer" (hint: "Things I'll put away or give to someone when I'm struggling.")
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
- Florida Warm Line: Every day, 4pm–10pm.
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
- Florida Warm Line: Every day, 4pm–10pm.
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
- **Heading:** Get through what's happening right now.
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
- Do you want to calm down, get distracted, connect with someone, or get out of where you are?
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
- **Heading:** Walking helped you before.
- Want to try it first?
- **Heading:** Something that helped you before: Music.
- **Button:** I'll do that
- **Button:** Try walking
- **Button:** Something else
- **Button:** That's enough for now

_When: spiraling, low, craving_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Walking
- This is on your list of things that help. A short, slow walk.
- **Heading:** Something that helped you before: Music.
- **Button:** I'll do that
- **Button:** Try walking
- **Button:** Something else
- **Button:** That's enough for now

_When: distraction_

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Grounding
- One small step to try. Notice what's around you, one sense at a time.
- **Heading:** Something that helped you before: Music.
- **Button:** I'll do that
- **Button:** Try grounding
- **Button:** Something else
- **Button:** That's enough for now

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
- **Link → `tel:988`:** Call or text 988 for support.
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
- **Link → `tel:988`:** Call or text 988 for support.
- **Button:** I already used
- **Button:** Check in early

### `craving-used`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** Thanks for telling me.
- No judgment here. What matters is the next few minutes.
- **Link → `tel:911`:** Took too much, or feel unwell? Call 911.
- Shaking, sweating, confused, or seeing things? Withdrawal can be a medical emergency. Get medical help.
- **Link → `tel:988`:** Call or text 988 for support.
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

### `connect`

- **Button:** × _(screen reader: "Close and go to home")_
- **Button:** Help _(screen reader: "Get help now")_
- **Heading:** You don't have to sit with this alone.
- Talk to someone who's been there
- **Heading:** Florida Warm Line
- Every day, 4pm–10pm. Not a crisis line. Just real people who've been through it.
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
- **Button:** Color hunt — Find 5 blue things, then 3 red
- **Button:** Around me — Something soft, cold, older than you
- **Button:** Rapid categories — 5 animals, 5 cities, 5 foods
- **Button:** Memory snap — See 6 shapes, then find them again
- **Button:** Pattern break — Watch a pattern, tap it back
- **Button:** 60-second challenge — Your only job: beat the timer
- **Button:** Focus — Tap when the dot reaches the ring. One minute.
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
- **Heading:** Professional and crisis support
- **Button:** Edit _(screen reader: "Edit: Professional and crisis support")_
- 988 Suicide & Crisis Lifeline, free and 24/7. Always in your plan.
- **Link → `tel:988`:** Call 988 _(screen reader: "Call 988, the Suicide and Crisis Lifeline")_
- **Link → `sms:988`:** Text 988 _(screen reader: "Text 988, the Suicide and Crisis Lifeline")_
- Getting help is a strength, not a weakness. Read more
- **Heading:** Making my space safer
- **Button:** Edit _(screen reader: "Edit: Making my space safer")_
- Nothing here yet.
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
- **Button:** Back

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
- **Link → `tel:988`:** Call or text 988 for support.
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
