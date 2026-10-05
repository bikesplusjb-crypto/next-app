# ZigZag Mind — Stage 6.28 Addendum: PTSD, trauma, or military

Read HANDOFF.md and the rules at the top of STAGE6-SPEC.md first; they still apply. **The current safety logic is authoritative, including all owner-approved interim changes. Never revert them.** Add a 6.28 row to the Build order table and build on the `build` branch in the order A → H, committing each part and running `npm test` after each. Push `build` and report. **Do not touch `main`.**

## Why (for the code comments and review pack)

- In 2023, an average of 17.5 veterans died by suicide each day (VA 2025 National Veteran Suicide Prevention Annual Report).
- Firearms were involved in 73.3% of veteran suicides in 2023, versus 52.9% for non-veteran adults (same report).
- 61% of veterans who died by suicide in 2023 had not received VA health care in their last year (same report). A free site veterans can find on their own can reach people outside the VA system.
- Free resources (confirmed on official VA sites on 2026-10-04): Veterans Crisis Line (dial 988 then press 1, text 838255, or chat), Vet Center Call Center 1-877-927-8387 (24/7, confidential, staffed by combat veterans and family members; Vet Centers also counsel for PTSD and military sexual trauma), and the free PTSD Coach app from the VA's National Center for PTSD. Some VA mental health services are available even without VA health care enrollment, including same-day care.

Never present these numbers to users as statements about them.

## The rule above all others

**ZigZag Mind never asks what happened.** No questions about the trauma, no text boxes in the flashback or nightmare flows, no "tell me about it," no reliving, no exposure exercises. Processing trauma belongs with trained professionals. This path only helps someone get through the moment and reach a person.

## Global rules

- Every free-text field anywhere in this path goes through `handleSafeTextSubmit` (there should be very few; none in B, C, or D).
- Nothing is saved. Nothing is sent by the app.
- Help stays on every screen; every flow calls `blockIfRed()` first.
- Screens B, C, and D are plain: no Zags, no animation, large type, high contrast, one action per screen. Respect reduced motion everywhere.
- "I don't feel safe" stays on Home's first screen in normal and large text.
- All new copy goes into the review pack. **Clinician review required for the whole path.**

## Copy rules (never break)

Never: "What happened?", "Tell me about it," "Thank you for your service" (it can land badly in a hard moment), "you're safe now" as a promise, "get over it," "it was a long time ago," any mention of combat details, or anything implying weakness. Use "That was then. This is now." instead of promises about safety.

---

## A. Home: a "More" chip (simplicity)

Home chips are getting crowded. Change "Or tell me what's happening" to show **five** chips plus **"More"**:

- Visible: I'm anxious · I'm spiraling · I feel sad or low · I have an urge (drink, drugs, or vape) · I feel alone.
- **More** (expands in place, no new screen): Just out of the ER · I lost someone · Bullied — now or before · **PTSD, trauma, or military** · and any other existing chips.

Keep every existing chip reachable. Update tests that look for specific chips. "I don't feel safe," "I don't know what I need," and the four escape routes are unchanged.

## B. Entry

**PTSD, trauma, or military** → **"What's going on right now?"**

1. It's happening right now (a flashback, or feeling like I'm back there) → C
2. I woke up from a nightmare → D
3. I'm on edge → E
4. I'm a veteran or service member → F
5. Something happened to me (not military) → G
6. Someone I love has PTSD or served → H

## C. "It's happening right now" (flashback)

One instruction per screen, large type, a single **Next** button:

1. **Now screen:** read the phone's clock and show, in very large type: **"It's [Weekday, Month Day, Year]. It's [h:mm AM/PM]."** Below: **"That was then. This is now."**
2. **"Put both feet flat on the floor. Press down."**
3. **"Look around. Name three things you can see, out loud or in your head."**
4. **"Drink something cold, or hold something cool in your hands."**
5. **"Say where you are, out loud if you can."**
6. Back to the Now screen (date and time refreshed), then: **"Do you want to reach someone?"** → F's resources if the person is a veteran (show both F and general options), Talk to someone (Connect), or **"I'm okay for now"** → Put the phone down.

No typing anywhere in C.

## D. "I woke up from a nightmare"

1. **"Turn on a light."**
2. The Now screen (date and time), with **"It's over. You're here now."**
3. **"Drink some water. Sit up for a minute."**
4. Options: Calm down with Zags · Cozy up for sleep (night mode only, existing) · Talk to someone · Put the phone down.

No typing anywhere in D.

## E. "I'm on edge" (startle, scanning, snapping at people)

1. **"Your body learned to stay ready. It's not a flaw, and it's not your fault."**
2. One at a time, optional: **"Sit where you can see the door, if that helps."** · Breathe for 1 minute (existing) · Take a short walk (existing, with Make it smaller) · **"Step away before you say something you don't mean. You can come back to it."**
3. Then the normal check-in and Let's Zig.

## F. "I'm a veteran or service member"

1. **"You don't have to carry this alone, and you don't have to explain it to a civilian."**
2. **Talk to someone who's been there:** **Vet Center Call Center — 1-877-927-8387.** "Free, confidential, 24/7. You'll talk with combat veterans and their families. They also help with PTSD and military sexual trauma." (Call button; number shown as text on desktop.)
3. **Veterans Crisis Line:** **Call 988, then press 1** · **Text 838255** · chat (link to veteranscrisisline.net). "Free, confidential, 24/7."
4. **PTSD Coach:** "A free app from the VA's National Center for PTSD." Link to its official page. (No app-store deep links needed.)
5. **"Even if you've never used the VA, some help is available right away."**
6. **Guns, respectfully (OWNER-APPROVED INTERIM, clinician review):** **"A lot of vets have a buddy hold their guns for a while when things get heavy. It's temporary, and it's yours."** Link to My Plan → Time and distance plan.
7. Resource config: these three resources may be marked `verified:true` with `source` and `checked:"2026-10-04"` because they were confirmed on official VA sites; add them to `CRISIS_RESOURCE_VERIFICATION.md` with the official URLs and a note "Owner to re-check periodically."

## G. "Something happened to me" (not military)

1. **"Whatever happened, it wasn't your fault. You don't have to explain it here."**
2. Grounding tools: links to C (the Now screen and steps) and E.
3. Resources (`verified:false`, hidden until the owner verifies): RAINN National Sexual Assault Hotline; the domestic violence hotlines from 6.25 (reuse the same config entries).
4. **"Talking to a trauma-trained counselor can really help. It's never too late."**

## H. "Someone I love has PTSD or served"

1. **"Thank you for showing up for them."**
2. Short guidance: don't push them to talk about what happened · notice what helps them settle and offer it · don't take snapping or distance personally, and still look after yourself · if they talk about not wanting to be alive, call or text 988 together (press 1 if they're a veteran).
3. **Vet Center Call Center (1-877-927-8387) also supports families.** Link to the existing supporter guide.

## Tests (minimum)

- A: exactly five visible chips plus More; every previous chip still reachable; "I don't feel safe" on Home's first screen in normal and large text.
- C/D: the Now screen shows the phone's current date and time; no text inputs exist in C or D; no Zags or animation on C/D screens.
- No screen in this path contains "What happened" or any banned phrase (string test).
- F: Vet Center, 988-press-1, and 838255 render (verified); PTSD Coach link present; gun line present only in F and the time-and-distance plan, never on crisis screens.
- G: unverified resources hidden.
- Every screen in the path: Help visible, `blockIfRed()` respected.

## Report

What changed per part, anything not done exactly as written and why, tests added, final `npm test` count, and every item waiting on the owner (RAINN and other verifications) and every new clinician item. Then stop.
