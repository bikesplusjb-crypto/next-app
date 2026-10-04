# ZigZag Mind — Stage 6.21 Addendum: A line for today

Read HANDOFF.md and the rules at the top of STAGE6-SPEC.md first; they still apply. **The current safety logic is authoritative, including all owner-approved interim changes. Never revert them.** Add a 6.21 row to the Build order table and build on the `build` branch in the order A → F, committing each part. Run `npm test` after each part, push `build`, and report. **Do not touch `main`.**

## Why

People want somewhere private to write how today felt. Short, structured writing that ends on something true tends to help; long, open-ended venting repeated night after night can deepen rumination. So this is **a line a day**, not a blank journal, and it ends on "still true."

## Global rules

- Everything stays on the phone. No server, no sync, no analytics.
- Every text field goes through `handleSafeTextSubmit`.
- No streaks, counts, charts, reminders, notifications, or "you haven't written in…" messages. Ever.
- Help stays on every screen; every flow calls `blockIfRed()` first.
- Never shown on crisis screens, and never suggested by Let's Zig or the engine.
- All new copy goes into the review pack.

---

## A. Writing an entry

Entry points: **My Plan → "A line for today"**, and one quiet link on the "You're ready / Put the phone down" screen: **"Write a line about today?"** (below Put the phone down, smaller).

Screens, one at a time:

1. **"How was today?"** Tap any feeling words (multi-select, optional): heavy · calm · anxious · okay · lonely · hopeful · numb · angry · tired · mixed. "Skip" always available.
2. **"A few words about it."** A textarea that starts 3 lines tall (it can grow), `maxlength` 1000, placeholder "Just a line or two is enough."
3. **"One thing that's still true today"** (optional), 120 characters, with optional example chips: "I got through today." · "Someone was kind to me." · "I'm still here."
4. **Keep** (primary) / **Don't keep** (deletes the draft). Today's date is attached automatically.

Rules:

- Both text fields go through `handleSafeTextSubmit` when the person taps Keep.
  - **RED** → `openCrisis()` immediately, and under the current rule the entry is **not saved**. Add clinician decision **D-diary**: "Writing about past feelings ('Last year I wanted to die…') opens the crisis screen and the entry is lost. Should the person be offered the chance to keep it after the crisis flow?" Do not change the rule.
  - **YELLOW** → the support bar turns on, and the entry **is** saved normally.
- If saving fails (storage full), keep the text on screen and show: "This phone's storage is full, so this couldn't be saved. Your words are still here." Never lose a draft silently.
- One entry per day by default; writing again the same day appends a new entry under that date (no overwriting).

## B. Looking back

**My Plan → A line for today → Looking back**: a simple list, newest first, grouped by date.

- Each entry shows the date, the feeling words, the few words, and the **"still true" line in the stronger brand style** so those stand out when scrolling.
- Tap to read in full. Each entry has Delete (with confirm).
- At the top, only once there are 7 or more entries: **"Every 'still true' here is something you noticed on a hard day."** Nothing else: no stats, no counts, no mood graph.

## C. Optional passcode lock (the important part)

Off by default. In **A line for today → Lock with a passcode**.

1. Before setting one, a plain warning screen, which must be read and confirmed:
   > **If you forget this passcode, your entries can't be recovered.** Not by you, not by anyone. ZigZag Mind doesn't store it anywhere. [I understand] [Not now]
2. Passcode: at least 4 characters; entered twice to confirm.
3. Encryption, done entirely on the phone with the browser's Web Crypto API:
   - Derive a key with **PBKDF2 (SHA-256, at least 310,000 iterations, random 16-byte salt)** from the passcode.
   - Encrypt the diary with **AES-GCM 256** and a fresh random 12-byte IV every time it's saved.
   - Store only the salt, IV, and ciphertext (diary key separate from the plan key). **Never store the passcode or the derived key.**
   - Store an encrypted check value to verify the passcode on unlock.
4. While locked, the diary screens show only a passcode field. Wrong passcode: "That's not it." No lockout, no hints.
5. The diary re-locks when the person leaves the diary screens, when the page is hidden (`visibilitychange`), or after 5 minutes.
6. **"Forgot my passcode"** → explains again that it can't be recovered → the only option is **"Delete my diary and start over"** (with confirm).
7. Turning the lock off requires the passcode, then decrypts and saves as normal.
8. The Privacy & terms page: update the "isn't encrypted" line to say **the optional diary lock encrypts diary entries on the phone; everything else is not encrypted.** Update `PRIVACY_DATA_FLOW.md` to match.

## D. Export, delete, and saving off

- **Export my data**: includes diary entries only when the diary is unlocked; if locked, the export says "Diary not included (locked)."
- **Delete everything** removes all diary data, including the salt and check value.
- With **saving turned off**, the diary can still be written for the visit but is never stored; the Keep button says "Keep for now (saving is off)."

## E. Tests (minimum)

- RED in either field → crisis, nothing saved; YELLOW → saved and support bar on.
- Storage-full: the draft stays on screen.
- No counts, streaks, charts, or reminder strings anywhere in the diary (string test).
- Lock: the stored data never contains the passcode or any entry text in plain form; unlock with the right passcode works; the wrong one fails; re-lock on `visibilitychange`; "Forgot" path deletes only the diary.
- Export with locked vs unlocked diary; Delete everything wipes it.
- Never reachable from crisis screens; never suggested by the engine.
- "I don't feel safe" stays on Home's first screen (no Home changes in this part).

## F. Report

What changed per part, anything not done exactly as written and why, tests added, final `npm test` count, and new clinician items (including D-diary). Then stop.
