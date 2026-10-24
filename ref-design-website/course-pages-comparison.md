# Course pages: Aoun vs sheryians.com

Catalog (`/courses`) and course detail (`/courses/[slug]`), desktop 1440, tablet 768, mobile 390.
Captured 2026-10-24. Shots: `screenshots/course-pages/{sher,aoun}-{catalog,detail}-{1440,768,390}.png` (gitignored).
Sheryians detail = Cohort 3.0 (green theme); Java & DSA also inspected with REA. Aoun detail = Full-Stack Web Development with Next.js.
Internals were read with REA 6.7.0 (`inspect-web-page --include-script-sources` → `export-web-scripts`); notes are our own summary, no code copied.

## Measured

| Page | Width | Height (px) | Sticky elements | Enroll/Buy CTAs | Videos | Horizontal overflow |
|---|---|---|---|---|---|---|
| sher catalog | 1440 / 768 / 390 | 5.0k / 5.5k / 6.9k | 0 | 0 (cards link) | 0 | none |
| aoun catalog | 1440 / 768 / 390 | 3.3k / 3.9k / 5.2k | 0 | 0 (cards link) | 0 | none |
| sher detail | 1440 / 768 / 390 | 12.5k / 13.1k / 11.1k | 4 / 4 / 3 | 4 | 2 | none |
| aoun detail | 1440 / 768 / 390 | 4.2k / 5.3k / 5.8k | 1 / 0 / 0 | 1 | 0 | none |

Double-check of the previous round (same session): `bun test` lib + courses 10/10 pass; 9 public pages loaded and scrolled with 0 console errors or warnings.

---

## 1. Catalog

| Aspect | Sheryians | Aoun | Verdict |
|---|---|---|---|
| Header | eyebrow + 2-line H2 | eyebrow + H2 + subline | equal |
| Find a course | none | **search + category chips** | Aoun ahead |
| Grid | 3 / 2 / 1 columns | 3 / 2 / 1 columns | equal |
| Card chrome | "window" with 3 traffic-light dots, rounded dark glass, LIVE badge | category badge + arrow button, hover zoom on thumbnail | equal, different style |
| Card data | tag chips, title, price + strike + % OFF, outlined "Check course" | subtitle, rating, students, graduates, duration, lessons, level, price + strike + **% OFF** (added this session) | Aoun richer |
| Thumbnails | real photos of instructors with 3D icons | generated gradient + glyph | **P2** real cover images |
| After grid | comparison card, FAQ, poster CTA, footer | FAQ, footer | P3 add closing CTA |
| Mobile 390 | single column, cards ~full width, tags wrap | single column, chips wrap to 2 rows | equal |
| Tablet 768 | 2 columns | 2 columns | equal |

## 2. Course detail: section map

| # | Sheryians (top → bottom) | Aoun | Gap |
|---|---|---|---|
| 1 | **Split hero**: big media left (thumbnail with play → autoplay muted webm), title + "Job ready" badge, description. Right: **sticky info card** (`top-10`, ~30% width) with meta chips (schedule, certificate, language, class), feature checklist, "Join" + "View syllabus" buttons | **Centered hero**: category chip, title, subtitle, stars + review count, country flags, price + strike, one enroll button | **P2** no media and no persistent info card. Our rating + flags are good trust signals they lack |
| 2 | Giant gradient headline + 3D illustration (floating keyframes, translateY −20px loop) + 3 glowing stat boxes | 7 small stat tiles (duration, lessons, level, certificate, access, students, graduates) | P3 7 tiles leave an orphan tile on the last row at 2 and 3 columns |
| 3 | Tabbed live product demos (browser mock, auto-playing video) | — | optional |
| 4 | 3-column comparison table, highlighted middle column | — | P3 |
| 5 | Placed-students portrait wall | — | content |
| 6 | Tech tabs → tool tiles (Motion fade-up 0.5s, delay 0.2) | — | P3 |
| 7 | Cream sheet: **sticky prerequisites card** (`top 25%`, left) + module accordion right, "N More" expander that sticks to bottom while open and scrolls back on collapse | Cream sheet: centered module accordion with lesson rows, **Preview** chips, durations, locked rows | Aoun accordion better (previews, durations). **P3** put prerequisites/what's included in a sticky side card on lg |
| 8 | "We support builders" icon cards | Outcomes + prerequisites as two lists | equal |
| 9 | **Certificate** card: text + per-course themed SVG certificate mockup | — | **P2** we issue real verifiable PDFs; show a preview |
| 10 | Course testimonials: **3D coverflow** (perspective 1400px, rotateY/translateZ/scale by offset, only ±2 rendered), sticky heading on md | Reviews: average, star distribution bars, review cards | Aoun more informative; theirs more visual |
| 11 | **Team/instructor** fanned cards with arrows | — | **P2** no teacher shown |
| 12 | Course FAQ (Motion height/opacity 0.3s) | — | P3 per-course FAQ |
| 13 | — | "Keep exploring" more courses | Aoun only, keep |
| Java page extras | Batch cards: slide in from x+100 on view (GSAP, IntersectionObserver), **mouse tilt** (perspective 1000, ±12° Y, scale 1.03, spring back 400ms); logo marquee (`react-fast-marquee`) | — | optional polish |

## 3. Detail page responsiveness

| Width | Sheryians | Aoun |
|---|---|---|
| 1440 | 2 columns: media + text left, sticky info card right | centered single column, max ~80% width |
| 768 | stacks: media → title → info card (card no longer sticky) | centered hero, 3-column stat grid with **orphan 7th tile** |
| 390 | stacks: media → title/badge → full info card with both buttons, all above ~1.2 screens | hero with price + enroll in first screen (good), 2-column stat grid with **orphan 7th tile**, curriculum readable |
| CTA reach | 4 CTAs spread down the page | **1 CTA only, at the top**; on a 5.8k px mobile page nothing to tap after the first screen |

## 4. Motion summary (detail page)

| Effect | Sheryians | Aoun |
|---|---|---|
| Smooth scroll | Lenis | Lenis |
| Section reveals | Motion fade-ups on some blocks | `Reveal` fade-up on every heading |
| Sticky | hero card, prerequisites card, expander button, testimonial heading | none below lg |
| Hero media | autoplay muted loop | none |
| Ambient | floating 3D icons (CSS keyframes) | hero glow only |
| Carousels | 3D coverflow testimonials, team carousel | none |
| Hover | mouse tilt on batch cards | card hover zoom (catalog) |
| Accordion | Motion height + opacity | CSS grid-rows transition (equal result) |

## 5. Fix list (course pages)

Status 2026-10-24: items 1–4, 6–8 done (split hero + sticky enroll card, hero preview video modal, mobile enroll bar, 4 CTAs, certificate preview, instructor section from `teacherIds` (hidden until teachers are assigned), centred fact tiles, sticky "Before you start" card, per-course FAQ from course data, catalog closing CTA). Item 5 (real thumbnails) and 9 (accent colours, tilt) remain.

**P2**
1. Detail hero → split layout on lg: course thumbnail/preview video left, **sticky enroll card** right (price, what's included, enroll, free-preview link). Stack on md/mobile.
2. More CTAs: repeat enroll after curriculum and at page end; on mobile a small sticky bottom enroll bar.
3. Certificate preview section using our real certificate design.
4. Instructor section (course `teacherIds` → teacher name, photo, bio).
5. Real course thumbnails (content).

**P3**
6. Stat tiles: 8 tiles or a centered flex-wrap so no orphan tile.
7. Prerequisites / what's included as sticky side card next to curriculum on lg.
8. Per-course FAQ; closing CTA on catalog.
9. Optional per-course accent colour (their radial-gradient label pill), tilt hover on course cards.
