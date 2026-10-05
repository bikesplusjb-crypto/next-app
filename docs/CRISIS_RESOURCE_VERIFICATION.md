# Crisis resource verification

# OWNER VERIFICATION — 2026-10-05

Checked by Claude Code for JB on 2026-10-05, at JB's request. **How:** the build environment's network blocks every one of these websites (the official pages could not be opened directly). Each resource was instead searched with web search **restricted to the organization's own official domain**, and the search results (page titles, addresses and quoted page text) were recorded below. Under the owner's own rule ("do not rely on search-result snippets alone; open the official page"), **that is not enough to mark anything VERIFIED**, so:

- Every resource below is **PENDING VERIFICATION** (or **OWNER DECISION REQUIRED**), with what the official site's indexed text says, so JB can confirm each one in a minute by opening the listed page.
- **Nothing was activated in the app.** Every `verified:false` entry stays hidden. No phone number, URL or wording in the app changed.
- "Initials JB" records who requested this check, not that JB opened the page. When JB opens a page and it matches, change its status to VERIFIED (or tell Claude Code: "RAINN verified: …") and it will be switched on.
- To let Claude Code open these pages itself next time: add the domains to the environment's allowed network domains (environment settings → Network access → Custom → Allowed domains), e.g. `rainn.org`, `thehotline.org`, `crisistextline.org`, `211pbtc.org`, `treasurehealth.org`, `vet.cornell.edu`, `griefshare.org`, `workplacebullying.org`, `cybercivilrights.org`, `stopbullying.gov`, `va.gov`, `vetcenter.va.gov`, `veteranscrisisline.net`, `ptsd.va.gov`, `nami.org`.

## Resources

| Resource | Phone | Official Website | Relevant Page | Status | Verified | Initials |
|---|---|---|---|---|---|---|
| RAINN (National Sexual Assault Hotline) | 800-656-HOPE (4673); text HOPE to 64673; online chat | https://rainn.org | https://rainn.org/help-and-healing/hotline/ | PENDING VERIFICATION | 2026-10-05 (search of rainn.org) | JB |
| National Domestic Violence Hotline | 1-800-799-SAFE (7233); text START to 88788; chat | https://www.thehotline.org | https://www.thehotline.org/get-help/ | PENDING VERIFICATION (qualification noted) | 2026-10-05 (search of thehotline.org) | JB |
| Crisis Text Line | Text only: text HOME to 741741 (Spanish: AYUDA or HOLA to 741741) | https://www.crisistextline.org | https://www.crisistextline.org/text-us/ | PENDING VERIFICATION | 2026-10-05 (search of crisistextline.org) | JB |
| Florida Warm Line | 1-800-945-1355 | (no official program page found) | news coverage only (WFSU / WUSF / WGCU, 2022) | PENDING VERIFICATION | 2026-10-05 (web search) | JB |
| Florida 211 (211 Palm Beach / Treasure Coast) | 2-1-1, or (561) 383-1112; text question + ZIP to 898211 | 211 Palm Beach/Treasure Coast (211pbtc.org: not confirmed) | (official page not found in search) | PENDING VERIFICATION | 2026-10-05 (web search) | JB |
| Treasure Coast Help Near Me | see notes (four entries) | — | — | PENDING VERIFICATION | 2026-10-05 (web search) | JB |
| Treasure Coast Hospice bereavement (now part of Treasure Health) | 772-403-4500 | https://www.treasurehealth.org | https://www.treasurehealth.org/care-services/grief-support | PENDING VERIFICATION | 2026-10-05 (search of treasurehealth.org) | JB |
| Pet Loss | Cornell Pet Loss Support Hotline 607-218-7457 (candidate) | https://www.vet.cornell.edu | https://www.vet.cornell.edu/impact/community-impact/pet-loss-resources-and-support | OWNER DECISION REQUIRED | 2026-10-05 (search of cornell.edu) | JB |
| GriefShare | (no single phone; local groups) | https://www.griefshare.org | https://find.griefshare.org/find | PENDING VERIFICATION (qualification noted) | 2026-10-05 (search of griefshare.org) | JB |
| Workplace Bullying Institute | (none found) | https://workplacebullying.org | https://workplacebullying.org/help4targets/ | OWNER DECISION REQUIRED | 2026-10-05 (search of workplacebullying.org) | JB |
| Cyber Civil Rights Initiative | 1-844-878-2274 (844-878-CCRI) | https://cybercivilrights.org | https://cybercivilrights.org/ccri-crisis-helpline/ | PENDING VERIFICATION | 2026-10-05 (search of cybercivilrights.org) | JB |
| StopBullying.gov | (informational site; HHS line 1-877-696-6775 is general, not a bullying hotline) | https://www.stopbullying.gov | https://www.stopbullying.gov/resources/get-help-now | PENDING VERIFICATION (informational, not a crisis line) | 2026-10-05 (search of stopbullying.gov) | JB |

### Verification notes

- **RAINN.** rainn.org's indexed hotline and contact pages say: call 800.656.HOPE (4673), chat at RAINN.org/hotline, or text "HOPE" to 64673; free, confidential, 24/7, English and Spanish; also WhatsApp. Appropriate for ZigZag (6.28 G, "Something happened to me"). To activate: JB opens https://rainn.org/help-and-healing/hotline/ and confirms the number and 24/7.
- **National Domestic Violence Hotline.** thehotline.org's indexed home and Get Help pages say: call 1.800.799.SAFE (7233), chat, or text "START" to 88788; 24/7, free, confidential. **Qualification:** the search summary says the site also offers an A.I. chat bot when a live advocate isn't available. ZigZag has no AI of its own; linking to the phone and text lines (not the AI bot) is the safer choice. Owner to confirm on the Get Help page.
- **Crisis Text Line.** crisistextline.org's indexed pages say: text HOME to 741741, free, 24/7, confidential, English and Spanish, anywhere in the U.S.; Spanish: HOLA or AYUDA to 741741. **A text line, not a phone hotline.** The app's current wording ("Text HOME to 741741 (Crisis Text Line)") matches. Note: the app's Spanish screens are off, so the Spanish keyword isn't needed yet.
- **Florida Warm Line.** No official program web page was found (searches return 2022 public-radio coverage and third-party lists). That coverage says: 1-800-945-1355, 365 days a year, 4pm–10pm, not a crisis line, staffed by certified peer specialists, funded by the Florida Department of Children and Families through the Peer Support Coalition of Florida. Current operator and 2025–2026 status could not be confirmed from an official source. **Note: this number is already shown in the app (Connect) from the original spec.** Owner to call the number during hours to confirm it is still operating (the earlier "OPEN" row below stays open).
- **Florida 211.** For the Treasure Coast, the provider is **211 Palm Beach/Treasure Coast**. Third-party and city pages (e.g. City of Port St. Lucie flyers) say it serves **Indian River, Martin, Okeechobee, Palm Beach and St. Lucie** counties: dial 2-1-1 or (561) 383-1112 (24/7), text question and ZIP code to 898211, chat 10am–8pm, email help@211pbtc.org. So all three of Martin, St. Lucie and Okeechobee are covered, and dialing 211 is still the instruction. The organization's own website did not come up in search, so this stays PENDING until JB confirms on its official site or by dialing 211.
- **Treasure Coast Help Near Me.** In the repo this is `NEAR_ME` (index.html, 6.19 G): a hidden screen with four entries. Search results: (1) **211 Treasure Coast**: see Florida 211 above. (2) **New Horizons of the Treasure Coast mobile response**: news and Florida Department of Health (Indian River) pages say the Mobile Response Team is reached by **dialing 211**; New Horizons main office (772) 468-5600, Fort Pierce. (3) **NAMI (local affiliate)**: nami.org lists **NAMI Treasure Coast, FL** (NAMI Martin County, Inc.), 101 SE Central Pkwy, Stuart; 772-223-4440; serves Martin, Indian River, Okeechobee and St. Lucie; https://www.nami.org/find-your-local-nami/florida/nami-treasure-coast-fl/ . (4) **Local recovery meetings**: no single official source; needs an owner choice. All four stay hidden.
- **Treasure Coast Hospice bereavement.** treasurehealth.org (Treasure Coast Hospice is part of **Treasure Health**) indexed pages say grief support is **open to anyone in Martin, St. Lucie and Okeechobee counties, whether or not their loved one was in hospice care**: individual counseling, support groups, children's and family programs (Good Grief); no cost; call 772-403-4500 any hour. Another listing gives 1-800-435-7352 and 772-403-4530 (youth and family programs). Appropriate for ZigZag (6.20 grief resources). Owner to confirm the number on https://www.treasurehealth.org/care-services/grief-support .
- **Pet loss.** No local Treasure Coast pet-loss grief line was found. The UF College of Veterinary Medicine's pet-loss page points people to the **Cornell University Pet Loss Support Hotline (607-218-7457)** and the **Tufts University Pet Loss Support Hotline (508-839-7966)**; Cornell's page gives evening and weekend hours that vary by season (staffed by veterinary students). Treasure Health also mentions a "Treasured Pets Program", likely for patients' pets rather than pet-loss grief. **OWNER DECISION REQUIRED:** use the Cornell line (national, limited hours), or leave the pet-loss slot empty. Shelters and animal control were not considered.
- **GriefShare.** griefshare.org says it is a **Christ-centered** grief recovery support group that "helps people apply biblical principles", meeting weekly in churches (and online) with a 30-minute video; find a group at https://find.griefshare.org/find . **Qualification:** religious, peer-led, local-chapter dependent, not clinical treatment. The app already shows it only when Faith & hope is on, labeled "Faith-based grief support groups." Owner to confirm.
- **Workplace Bullying Institute.** workplacebullying.org is online with a "Help for Workplace Bullied Workers" page (https://workplacebullying.org/help4targets/). Search summaries mention the founders, **Drs. Namie, "stepping aside"**, but no clear official statement of the organization's current status or services was found. **STATUS: CURRENT (site online), but founders stepping aside: unclear. OWNER DECISION REQUIRED:** keep it as an information link, or remove it. No other organization was substituted.
- **Cyber Civil Rights Initiative.** cybercivilrights.org's indexed helpline page: **CCRI Crisis Helpline 1-844-878-2274 (844-878-CCRI), toll-free, 24/7**, free, interpretation in most languages; provides information, guidance on image documentation and takedown, attorney referrals and emotional support to victims of nonconsensual pornography, recorded sexual assault and **sextortion**. Relevant page: https://cybercivilrights.org/ccri-crisis-helpline/ (the "Safety Center" page wasn't in the results). Appropriate for 6.27 D (online: private images). Owner to confirm.
- **StopBullying.gov.** The federal site's "Get Help Now" page (https://www.stopbullying.gov/resources/get-help-now) gives what to do and who to contact, including: if there's a crime or immediate risk, call 911; if someone is thinking of suicide, call or text 988; for cyberbullying, document it and report it to the platform. **Informational government resource, not a crisis hotline.** The HHS number on the site (1-877-696-6775) is a general HHS line and shouldn't be shown as a bullying hotline. Appropriate for 6.27 E (someone I love).

## VA verification

These three are already shown in the app (`VET_RESOURCES`, `verified:true`, owner-confirmed 2026-10-04). They could not be opened from the build environment. The search index of each official domain lists the exact URL the app uses, with the right page title:

| VA Resource | Existing ZigZag URL | Destination | Result | Verified | Initials |
|---|---|---|---|---|---|
| VA Vet Center | https://www.vetcenter.va.gov/ | "Vet Centers (Readjustment Counseling) Home" (va.gov). Indexed text: the Vet Center Call Center, 1-877-927-8387, is free, around the clock, confidential, staffed by combat veterans and family members; Vet Centers counsel for PTSD and military sexual trauma | RIGHT PAGE (by official search index; not opened) | 2026-10-05 | JB |
| Veterans Crisis Line | https://www.veteranscrisisline.net/ (also used for chat) | "Veterans Crisis Line" home. Indexed text: dial 988 then press 1, chat online, or text 838255; 24/7, confidential; no VA enrollment needed. The site's dedicated chat page is https://www.veteranscrisisline.net/get-help-now/chat/ | RIGHT PAGE (by official search index; not opened) | 2026-10-05 | JB |
| PTSD Coach | https://www.ptsd.va.gov/appvid/mobile/ptsdcoach_app.asp | "National Center for PTSD - Apps Videos - PTSD Coach". Indexed text: free, publicly available, created by VA's National Center for PTSD and DoD | RIGHT PAGE (by official search index; not opened) | 2026-10-05 | JB |

No VA link was changed. Optional improvement for the owner: point the app's "Chat online" button at the dedicated chat page above instead of the home page (not changed; owner decision).

## Owner settings (searched the whole repo)

- **Contact email:** `PENDING OWNER INPUT` (`CONTACT_EMAIL = ""` in index.html; the only address in the repo is a test placeholder, `hello@example.org`).
- **Feedback link:** `PENDING OWNER INPUT` (`FEEDBACK_URL = ""`).
- **Why ZigZag Mind exists:** `PENDING OWNER INPUT` (`FOUNDER_NOTE = ""`; no approved wording anywhere in the repo or review files).
- **Urge chip:** `PENDING OWNER DECISION` (the app says "I have an urge to use (drink or drugs)"; the 6.28 addendum lists "(drink, drugs, or vape)"; no owner yes/no is recorded anywhere).

## Clinician

`PENDING CLINICIAN REVIEW`. docs/CLINICIAN_REVIEW.md lists D1–D35 plus D-diary; every row's status is OPEN, and no clinician name, date or decision is recorded. The OWNER-APPROVED INTERIM items are owner decisions, not clinician decisions.

## Translator

`PENDING TRANSLATOR REVIEW`. docs/SPANISH_REVIEW.md lists every Spanish string as a draft (`draft:true`); no translator or clinician approval is recorded. `SPANISH_ENABLED` stays `false`.

## Resources not safe to activate yet

All of them, until JB confirms each on its official page: RAINN, National Domestic Violence Hotline, Crisis Text Line, 211 / Help near me (four entries), Treasure Coast Hospice bereavement, pet loss (owner decision), GriefShare, Workplace Bullying Institute (owner decision), Cyber Civil Rights Initiative, StopBullying.gov. The Florida Warm Line is already live from the original spec and still needs the owner's phone check.

---


| | |
|---|---|
| ZigZag Mind version | 0.5.0 (app, export and `package.json` now match: F4 fixed) |
| Git commit audited | `dba656d` on branch `build` (Stage 6.12) |
| Review pack | `REVIEW.md`, generated by `npm run review` from the same commit |
| Date | 2026-10-03 |
| Safety logic version | No version marker in the code. Audited at `dba656d` (23 RED, 10 YELLOW); now 43 RED (23 + 13 owner-approved interim + 7 Spanish, 6.18 C), 10 YELLOW. Matching unchanged since the first upload except accent folding (6.18 C) |
| Owner-approved changes (2026-10-03, after this audit) | Factual bugs **F1–F7 fixed**. RED additions (13 phrases, incl. harm to others) and the full-crisis-screen "That's not what I meant" change are **OWNER-APPROVED INTERIM, pending clinician**. |
| Clinician review status | **NOT STARTED. Every decision is OPEN (interim items included).** |

Every phone number, link, label, hour and availability claim in the code, with where it appears. **No resource was changed.** "Verified" below means only what is stated in its row; a person must confirm each one before launch.

## Resources

| Resource | Exactly as in the code | Where it appears | Label / claim shown | Status |
|---|---|---|---|---|
| 988 Suicide & Crisis Lifeline: call | `tel:988` (`LINKS.call988`) | Crisis, full crisis, crisis-no, safety-check (via `row988()`), Talk to someone, Connect, I need my plan, YELLOW bar, onboarding, under-18 screen, craving screens, supporter guide | "Call 988"; "Free, 24/7. Also for substance-use crises." (Talk to someone); "free and open 24/7" (onboarding, under-18) | OPEN: owner to confirm wording and availability claims |
| 988: text | `sms:988` (`LINKS.text988`) | Same places as call (via `row988()`), supporter guide | "Text 988" | OPEN |
| 988: online chat | `https://988lifeline.org/chat` (`LINKS.chat988`) | Talk to someone, full crisis screen | "Chat online with 988" | OPEN: confirm the URL still lands on the chat (not checked here) |
| 988 on craving screens | `tel:988` and `sms:988` | 3 craving screens: `intervention` (when the state is craving), `craving-delay`, `craving-used` | "For support: Call 988 · Text 988" (was "Call or text 988 for support.", call only) | **F2 fixed**: both links now |
| 911 | `tel:911` (`LINKS.call911`) | Full crisis ("If someone is hurt, or someone else is in danger"), I need my plan ("If someone is hurt or in danger"), craving screens ("Already used, or took too much? Call 911." / "Took too much, or feel unwell? Call 911."), under-18 screen, supporter guide ("Call 911 if they're in danger or took something") | as quoted | OPEN: the craving wording is a CLINICAL DECISION (see CLINICIAN_REVIEW §11) |
| 211 | `tel:211` (`LINKS.call211`) | Change the scene | "211 connects you to local help: food, housing, support groups. Free." | OPEN: 211 availability varies by area; claim "Free" to confirm |
| Crisis Text Line (6.19 D) | `sms:741741?&body=HOME` on phones; "Text HOME to 741741" as text on computers (`CRISIS_TEXT_LINE`, **`verified:false`: hidden everywhere**) | When verified: one line below the 988 buttons on the full crisis screen and Connect; printed plan; supporter guide "Get help together" | "Rather text a stranger? Text HOME to 741741 (Crisis Text Line)." · 24/7 | **OPEN: OWNER to confirm (number, keyword, 24/7, US coverage), then set `verified:true` and run `npm run sync-support`. Date: ____ Initials: ____** |
| 211: mobile crisis team (6.18 D4) | `tel:211` (`LINKS.call211`) | Full crisis screen, below the 988 buttons and the veteran line | "Want someone to come to you who isn't police? In many Florida counties, 211 can connect you to a mobile crisis team." [Call 211] | **OPEN: OWNER to confirm local availability (which counties); wording for clinician review (OWNER-APPROVED INTERIM)** |
| 988 Veterans Crisis Line (6.18 D1) | `tel:988` then press 1 (shown as text, not a separate link) | First crisis screen, full crisis screen, Connect: directly under the 988 buttons | "Veteran or service member? Call 988 and press 1." | OPEN: confirm the "press 1" option (OWNER-APPROVED INTERIM) |
| Florida Warm Line on the supporter guide (6.18 B) | `tel:18009451355`, written from `WARMLINE` by `sync-support.js` | Supporter guide, "Look after yourself" | "…is also for family and friends supporting someone: 1-800-945-1355, every day 4pm–10pm Eastern. Not a crisis line." | OPEN: the "also for family and friends" claim is part of the owner's Warm Line verification |
| Find a helpline (outside the US) | `https://findahelpline.com` (`LINKS.findHelpline`) | Next to 988 when the phone looks like it is outside the US (time zone, then language; Settings override) | "Find a helpline in your country" | OPEN |
| Florida Warm Line | `tel:18009451355` (`WARMLINE.tel`) | Connect (at night: "Usually closed right now · opens at 4pm Eastern", button never disabled); Zags (A bit better / Still hard); supporter guide (6.18 B) | "Florida Warm Line" · "Every day, 4pm–10pm Eastern. Not a crisis line. Just real people who've been through it." · "After 10pm or outside Florida: find a warmline near you" → `https://findahelpline.com` | **OPEN: verified by: OWNER (phone call required)**. See below |
| Trusted person | `tel:` / `sms:` built from the number the person typed in My Plan | Talk to someone, crisis screens, Connect, Zags, I need my plan, code word, check-in and time-and-distance asks | Prepared texts (see REVIEW.md) | Not a public resource. The app checks only that the number has 7+ digits |
| Professional (optional) | `tel:` from My Plan | My Plan | "Call [name]" | Not a public resource |

## Help near me, Treasure Coast (6.19 G)

Every entry is **hidden** (`NEAR_ME` in index.html, `verified:false`). The screen and its links (Change the scene, Connect) appear only once at least one entry is verified. For each: confirm by phone or the official website, fill in `phone` and/or `url` (https), set `verified:true`, and record it here.

| Entry | What the app would say | Phone in code | Website in code | Confirmed by (phone / official site) | Date | Initials |
|---|---|---|---|---|---|---|
| 211 Treasure Coast | "Local help: food, housing, mental health and support services." | 211 | (none) | | | |
| New Horizons of the Treasure Coast — mobile response | "A mobile crisis team that can come to you." | (none: owner to add) | (none: owner to add) | | | |
| NAMI (local affiliate) | "Support groups and classes for people and families living with mental health conditions." | (none: owner to add) | (none: owner to add) | | | |
| Local recovery meetings | "Meetings for people working on drinking or drug use." | (none: owner to add) | (none: owner to add) | | | |

## Grief support (6.20 D)

Every entry is **hidden** (`GRIEF_RESOURCES` in index.html, `verified:false`). Shown on "What would help right now?" as "Grief support near you" only once verified (and, for GriefShare, only when Faith & hope is on). 988 is always shown there. The owner identifies each one, confirms it by phone or official website, fills in phone and/or website, and sets `verified:true`.

| Entry | What the app would say | Phone in code | Website in code | Confirmed by (phone / official site) | Date | Initials |
|---|---|---|---|---|---|---|
| Hospice bereavement program (Treasure Coast) | "Free grief support for anyone in the community." | (none: owner to identify and add) | (none: owner to add) | | | |
| Pet loss support line | "Someone to talk to after losing a pet." | (none: owner to identify and add) | (none: owner to add) | | | |
| GriefShare (Faith & hope only) | "Faith-based grief support groups." | (none: owner to add) | (none: owner to add) | | | |

## Veterans (6.28 F): shown, confirmed by the owner on official VA sites on 2026-10-04

These are `verified:true` in `VET_RESOURCES` (index.html) with `source` and `checked:"2026-10-04"`. **Owner to re-check periodically.** The links below could not be opened from the build environment (its network blocks these sites); tap each once on a phone to confirm it opens the right page.

| Resource | What the app shows | Phone / text in code | Official URL (link in the app) | Checked | Note |
|---|---|---|---|---|---|
| Vet Center Call Center | "Free, confidential, 24/7. You'll talk with combat veterans and their families. They also help with PTSD and military sexual trauma." | 1-877-927-8387 (`tel:18779278387`) | https://www.vetcenter.va.gov/ | 2026-10-04 (owner) | Owner to re-check periodically |
| Veterans Crisis Line | "Free, confidential, 24/7." · "Call 988, then press 1" · "Text 838255" · "Chat online" | `tel:988` (the person presses 1), `sms:838255` | https://www.veteranscrisisline.net/ | 2026-10-04 (owner) | Owner to re-check periodically |
| PTSD Coach (VA National Center for PTSD) | "A free app from the VA's National Center for PTSD." | (none) | https://www.ptsd.va.gov/appvid/mobile/ptsdcoach_app.asp | 2026-10-04 (owner) | Owner to re-check periodically; confirm the page address |

## Trauma (6.28 G): hidden until verified

Both are `verified:false` in `TRAUMA_RESOURCES` and not shown. Owner to confirm by phone or official website, fill in phone and/or website, and set `verified:true`. The domestic violence entry is the one 6.25 should reuse when it's built.

| Entry | What the app would say | Phone in code | Website in code | Confirmed by (phone / official site) | Date | Initials |
|---|---|---|---|---|---|---|
| RAINN National Sexual Assault Hotline | "Free, confidential support, any time." | (none: owner to add) | (none: owner to add) | | | |
| National Domestic Violence Hotline | "Free, confidential support, any time." | (none: owner to add) | (none: owner to add) | | | |

## Bullied, now or before (6.27)

Every entry is **hidden** (`BULLY_RESOURCES` in index.html, `verified:false`) until the owner confirms it by phone or official website, fills in phone and/or website, and sets `verified:true`. 988 is always shown in this path.

| Entry | Where | What the app would say | Phone in code | Website in code | Confirmed by (phone / official site) | Date | Initials |
|---|---|---|---|---|---|---|---|
| Workplace Bullying Institute (information page) | It's happening at work | "Information about bullying at work and what you can do." | (none) | (none: owner to add) | | | |
| Cyber Civil Rights Initiative helpline | It's happening online (threats, stalking, private images) | "For private images shared without your consent." | (none: owner to add) | (none: owner to add) | | | |
| StopBullying.gov | Someone I love is being bullied | "U.S. government information on bullying and how to help." | (none) | (none: owner to add) | | | |

## Florida Warm Line (Amendment 4)

| Field | Value |
|---|---|
| Number in code | 1-800-945-1355 (`tel:18009451355`), in one constant: `WARMLINE` |
| Hours shown | "Every day, 4pm–10pm Eastern." (F5: time zone added by the owner, 2026-10-03) |
| Coverage claimed | Florida ("After 10pm or outside Florida: find a warmline near you") |
| Public sources found (not verification) | News coverage from July 2022 (WGCU, WFSU, WUSF/Health News Florida) and resource lists describe it as open 365 days a year, 4pm–10pm **Eastern**, staffed by certified peer specialists, not a crisis line, free, run with the Florida Department of Children and Families and the Peer Support Coalition of Florida. These sources are about three years old. |
| Note | Florida's panhandle is on Central time, where 4pm–10pm Eastern is 3pm–9pm. |
| Source used for the code | The approved spec (STAGE6-SPEC.md 6.6) |
| Date verified | Not verified |
| Verified by | **OWNER (phone call required)** |
| Person responsible | Owner |
| Status | **OPEN** |

## Things this check could not verify (need a person)

- That every number connects today, from a US mobile phone, by call and (for 988) by text.
- The 988 chat URL, the findahelpline.com landing page, and 211 coverage claims.
- Whether "Also for substance-use crises" (Talk to someone) is the wording 988 itself uses.
- Hours and availability statements anywhere other than the Warm Line ("24/7" for 988).
