# ZigZag Mind — Stage 6.20 Addendum: When you've lost someone

Read HANDOFF.md and the rules at the top of STAGE6-SPEC.md first; they still apply. **The current safety logic is authoritative, including all owner-approved interim changes. Never revert them.** Add a 6.20 row to the Build order table and build on the `build` branch. Run `npm test`, push `build`, and report. **Do not touch `main`.**

## Why

Grief is one of the most common reasons someone has a terrible night, and losing a pet is a kind of grief people often feel they're not allowed to have. Bereavement — especially losing someone to suicide — can raise risk. ZigZag Mind currently only covers losing an AI. This adds a gentle path for losing a person, a pet, or something else that mattered.

## Global rules

- No new screen may push "I don't feel safe" below Home's first screen, in normal or large text.
- Every new free-text field goes through `handleSafeTextSubmit`. RED → `openCrisis()`, nothing saved.
- Nothing is saved unless the person taps **Keep**.
- Help stays on every screen; every flow calls `blockIfRed()` first.
- The grief path is **only** entered by the person. Let's Zig and the engine never suggest it.
- All new copy goes into the review pack. **Clinician review required for the whole path.**

## Copy rules (never break)

Never say or imply: "They're in a better place," "Everything happens for a reason," "At least…," "It was just a pet," "You should be over it by now," stages or timelines of grief, or anything about how the person died. No religious language unless Faith & hope is on (see step 6). No guilt about decisions made (including for pets).

---

## A. Entry

1. Home → "Or tell me what's happening" chips: add **"I lost someone"**. It must not push "I don't feel safe" below the first screen (if needed, follow the existing large-text rules).
2. Tech check → "My AI changed or is gone": add a small link at the end: "Lost a person or a pet? →" opening this path.

## B. The path (one screen at a time)

1. **"Who did you lose?"** → A person · A pet · Something else that mattered (a relationship, a home, a job, a part of your life).
2. **"When was it?"** → Recently · A while ago · Today is a hard day (an anniversary, a birthday, a holiday). Not saved; only used to pick wording.
3. **Acknowledgment** (one screen, no buttons except Next):
   - Person: **"I'm sorry. Grief can feel like a lot of things at once: heavy, numb, angry, foggy. There's no right way to do this."**
   - Pet: **"Losing a pet is losing family. This grief is real, even if not everyone understands it."**
   - Something else: **"Losing something that mattered is real grief too."**
   - If "Today is a hard day": add **"Hard days can bring it all back. That makes sense."**
   - Below, on every version, in small text: **"If you lost someone to suicide, you're not alone. You can call or text 988 to talk about it, any time."** (Clinician review.)
4. **"What would help right now?"** One thing at a time, any order, all optional:
   - **Breathe for a minute** (existing breathing, or Calm down with Zags).
   - **Find something that reminds you of them.** Reuse the Find something photo flow: "Find something that reminds you of them — their spot, a photo, something they loved." Camera optional ("No camera? Just look"). Keep saves to My Plan → Things I noticed, with the label "Remembering". Max and storage rules unchanged.
   - **Write what you'd want to say to them.** One text field (safety-checked). Then: Delete (default) or Keep (saves to Things I noticed as a text note labeled "Remembering").
   - **Tell one person.** Optional first-name field for who they lost (safety-checked, not saved). Prepared texts, opened with `sms:` (Copy on desktop):
     - "I lost [name] and I'm having a really hard time. Can you call me?"
     - "Today's a hard day. I'm thinking about [name]."
     - "I don't need you to say anything. I just didn't want to be alone with this."
     If no name: use "someone" / "them".
   - **Add a gentle reminder for a hard date** (anniversary, birthday): a date picker → `download_ics` for the person's own calendar, titled "Be gentle with yourself today." Nothing stored in the app.
5. **Ending:** **"Grief comes and goes. You don't have to carry it all today."** → Put the phone down · Something else (existing Let's Zig) · Talk to someone (Connect).
6. **If Faith & hope is on** (only then): offer one KJV passage on the acknowledgment screen's Next step: Psalm 34:18 — "The LORD is nigh unto them that are of a broken heart." followed by the normal step 4 choices.

## C. Safety phrases (OWNER-APPROVED INTERIM, YELLOW only)

Grief can carry thoughts of wanting to be with the person who died. Add to **YELLOW** (not RED): `want to be with him again` · `want to be with her again` · `want to be with them again` · `want to join him` · `want to join her` · `want to join them`. Mark OWNER-APPROVED INTERIM, add to `SAFETY_TEST_MATRIX` with a note for the clinician asking whether any of these should be RED.

## D. Resources (hidden until verified)

Add to the resource config, each `verified:false` and **not shown** until the owner verifies and flips it:

- A local hospice bereavement program on the Treasure Coast (many offer free grief support to anyone in the community; owner to identify and verify).
- A pet loss support line (owner to identify and verify).
- GriefShare (faith-based grief groups) — show only when Faith & hope is on, after verification.

When any are verified, show them on step 4 as a small "Grief support near you" card. 988 is always shown.

Add every entry to `CRISIS_RESOURCE_VERIFICATION.md`.

## E. Tests (minimum)

- Path reachable from the Home chip and the Tech check link; never suggested by the engine.
- RED in any field → crisis, nothing saved; Delete is the default for written notes.
- Copy contains none of the banned phrases in "Copy rules" (test the strings).
- The suicide-loss line appears on every acknowledgment version.
- The KJV passage appears only when Faith & hope is on.
- Unverified resources never render.
- The new YELLOW phrases return YELLOW; English RED phrases unchanged.
- "I don't feel safe" stays on Home's first screen in normal and large text.

## Report

What changed, anything not done exactly as written and why, tests added, final `npm test` count, and every item waiting on the owner or the clinician. Then stop.
