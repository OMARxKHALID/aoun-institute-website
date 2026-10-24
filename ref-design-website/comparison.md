# Aoun vs sheryians.com: page-by-page comparison

Public pages only (dashboard/admin ignored). Captured 2026-10-24 at 1440px, logged out, local dev (`localhost:3000`) with seed data.
Aoun shots: `screenshots/aoun/`. Sheryians shots: `screenshots/`.

Priority: **P1** visibly broken or empty, **P2** missing section that hurts conversion/trust, **P3** polish.

## Page map

| Aoun | Sheryians counterpart | Verdict |
|---|---|---|
| `/` home | 01-home | Same skeleton, several empty placeholders |
| `/courses` | 02-courses | Aoun ahead (search, filters, ratings) |
| `/courses/[slug]` | 03 / 04 / 16–18 course detail | Aoun thinner, centered hero, no video |
| `/about` | 05-about | Aoun much shorter, no people/story |
| `/contact` | 06-support | Aoun ahead (real form) |
| `/faq` | FAQ section on every page | Duplicate heading |
| `/privacy-policy`, `/terms-and-conditions`, `/pricing-and-refund` | 07 / 09 / 08 | Equal; Aoun nicer |
| `/login`, `/register`, `/forgot-password` | 13 (sign in) | Aoun ahead; Google button hidden (no env keys) |
| `/verify`, `/verify/[code]` | 10-resume-checker (as "tool page" style) | Aoun only; plain but works |
| `/learners/[id]` | — | Aoun only; 404 when profile is private (expected) |
| `/checkout/[slug]` | — | Redirects to `/login` when logged out, not captured |
| — | hire, jobs, bootcamp, offline | Out of scope (removed extras per architecture) |

---

## Global (all pages)

| Area | Sheryians | Aoun | Gap |
|---|---|---|---|
| Palette | black, orange `#E8602E`, cream sheets | same | none |
| Display font | Neue Machina hero, Manrope light body | same system (`font-machina`) | none |
| Navbar | pill nav 4 items + "Request Call" + Sign In | pill nav 3 items + "Contact us" + Sign in | none |
| Eyebrow chips | dashed corner box above every H2 | same | none |
| Footer | outlined wordmark, 3 columns | outlined wordmark, 4 columns + bottom bar | Aoun ahead |
| Section rhythm | dark → cream sheet → dark, many sections | same pattern, fewer sections | content volume |
| Imagery | real photos everywhere | generated gradient tiles, no photos | **P2** biggest overall gap |
| Social proof | logo marquee, testimonial wall, placement photos | numbers + 2 reviews on course page | **P2** |
| H2 wrapping | balanced 2-line headings | short headings wrap to 1–2 words a line ("About This / Course", "What / Students Say", "Keep / Exploring", "What We / Stand For") | **P3** container `max-w` too narrow on short titles |

---

## 1. Home

| Section | Sheryians | Aoun | Note |
|---|---|---|---|
| Hero | eyebrow, H1 with framed word, avatar stack, CTA | same, own copy | match |
| Bento panel | stats + "Unlock" tile + **video tile** | stats + "Unlock" tile + **empty "Start Learning" tile** | **P1** tile is a blank gradient; add image/video/course collage |
| Logo marquee | partner logos | missing | P3 (only if real partners exist) |
| Impact carousel | real photos | **empty gradient cards** + ~500px black gap below | **P1** add photos or remove section; fix gap |
| Courses sheet | alternating white/orange/black cards | same, all 4 courses alternating | match; thumbnails are generic gradients (P2) |
| Worldwide stats + flags | — | Aoun only | keep, good trust element |
| Free previews | YouTube carousel | lesson preview carousel | match, thumbnails blank (P2) |
| Testimonials wall | 2 drifting rows | **missing** | **P2** reviews exist on course pages, surface them here |
| Community bento | placement photos | missing | P3 |
| Comparison card | us vs others | same | match |
| FAQ | accordion | same | match |
| Closing CTA | blurred poster collage | **floating empty grey rectangles** | **P1** placeholders look broken; fill with course thumbnails |

## 2. Courses (catalog)

| | Sheryians | Aoun |
|---|---|---|
| Header | eyebrow + H2 | eyebrow + H2 + sub-line |
| Filtering | none | **search + category chips** |
| Card | window dots, thumbnail, tag chips, price, % OFF badge, outlined CTA | category badge, arrow, rating, students, graduated, duration, lessons, level, price + strike |
| After grid | comparison, FAQ, CTA | FAQ |

Aoun ahead on function. Gaps: **P3** no "% OFF" badge next to discounted prices; **P2** gradient+icon thumbnails all feel same-y, real cover images would lift it; **P3** add comparison card or closing CTA so the page doesn't end abruptly after FAQ.

## 3. Course detail

| Section | Sheryians | Aoun | Note |
|---|---|---|---|
| Hero | split: **video preview left**, sticky info card right (chips, checklist, 2 CTAs) | centered text, rating, flags, price, 1 CTA | **P2** no thumbnail/preview video above the fold; switch to split layout |
| Stats | 3 big glowing boxes | 7 small meta tiles | fine; tiles are small, could be bolder |
| Theme per course | accent colour per course | single orange | P3 optional |
| About | — | short text block | ok |
| Comparison table | 3-column table | missing | P3 |
| Curriculum | cream sheet, prerequisite card left + module accordion right | cream sheet, centered accordion with preview/lock rows | Aoun accordion better (previews, durations); **P3** move prerequisites into left card like reference |
| Outcomes / prerequisites | inside prerequisite card | two columns of pill rows | ok |
| Technologies | tabbed tool tiles | missing | P3 |
| Certificate | text + certificate mockup | **missing** | **P2** "verifiable certificate" is a core selling point; show the real PDF design |
| Reviews | testimonial cards | rating summary + distribution + cards | Aoun ahead |
| Instructor / team | fanned team cards | **missing** | **P2** no teacher shown anywhere |
| FAQ | course-specific FAQ | missing | P3 |
| More courses | — | "Keep Exploring" cards | Aoun only, good |

## 4. About

Sheryians: hero with 2 CTAs, logo marquee, big mission statement, showcase, vision cards linking to programs, team photo, tilted leader cards.
Aoun: hero, 4 stat tiles, 4 value cards, CTA. Page is ~2k px vs 7.5k.

Gaps: **P2** no people (founder/teachers with photos), **P2** no story/mission paragraph, **P3** no photo of classroom/work, **P3** value cards could link to courses/verify.

## 5. Contact vs Support

Sheryians: 4 contact cards (email, online, offline, Discord), no form.
Aoun: 3 info cards + full message form with topic select. **Aoun ahead.** P3: add WhatsApp/phone card (common in PK).

## 6. FAQ

Aoun only as a page; sheryians uses FAQ sections. **P1** page shows two headings back to back ("Answers To Common Questions" hero, then "FAQS / Frequently Asked Questions From Our Learners"); drop the second. **P3** only 5 questions, same as home; group by topic (payments, certificates, access, account) and add more.

## 7. Legal (privacy, terms, pricing & refund)

Sheryians: plain orange title, long numbered lists.
Aoun: glow hero + "Legal" chip, short sections with dividers. **Aoun cleaner.** P3: "Last updated: / October 13, 2026" breaks onto two lines; keep on one.

## 8. Auth (login, register, forgot password)

Sheryians: bare form (phone + Google).
Aoun: glow hero, eyebrow, card form, links. **Aoun ahead.** Google button hidden because env keys are absent locally (expected).

## 9. Verify certificate (Aoun only)

`/verify` is clean but very empty (hero + one input, then footer). P3: add a "what a certificate looks like" sample and a short how-it-works row (like sheryians' resume-checker 3-step strip).
`/verify/[code]`: result card is good. P3: show certificate thumbnail/preview beside the data.

## 10. Learner profile (Aoun only)

Seed student has `publicProfile: false`, so page returns 404 (correct). A Next dev "1 Issue" badge showed on that page; worth checking the dev overlay separately.

---

## Top fixes in order

1. **P1 Home:** fill or remove empty Impact cards, fix black gap under them, fill "Start Learning" tile, replace grey placeholder rectangles in closing CTA.
2. **P1 FAQ page:** remove duplicate heading.
3. **P2 Imagery:** real course thumbnails + real photos (classes, teachers, students).
4. **P2 Course detail:** split hero with preview video + sticky enroll card; add certificate mockup and instructor section.
5. **P2 Home:** testimonials wall from existing reviews.
6. **P2 About:** founder/teachers and a short story.
7. **P3:** H2 width on short titles, % OFF badge, catalog closing CTA, legal date wrap, verify page sample certificate.
