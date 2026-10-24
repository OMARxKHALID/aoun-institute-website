# Reference: sheryians.com design analysis

Captured 2026-10-24 with agent-browser (Helium), viewport 1440×900, full-page PNGs in `screenshots/`.
Reference only — study layout/rhythm, never copy assets, copy text or photos.

| # | File | URL | Height |
|---|---|---|---|
| 01 | `01-home.png` | / | 11.6k px |
| 02 | `02-courses.png` | /courses | 5.0k |
| 03 | `03-course-detail.png` | /courses/3-0-job-ready-ai-powered-cohort | 12.5k |
| 04 | `04-course-detail-java-dsa.png` | /courses/java-and-dsa-domination | 8.8k |
| 05 | `05-about.png` | /about | 7.5k |
| 06 | `06-support.png` | /support | 1.5k |
| 07 | `07-privacy-policy.png` | /privacy-policy | 7.2k |
| 08 | `08-pricing-and-refund.png` | /pricing-and-refund | 2.3k |
| 09 | `09-terms-and-condition.png` | /terms-and-condition | 9.6k |
| 10 | `10-resume-checker.png` | /resume-checker | 2.5k |
| 11 | `11-hire.png` | /hire | 3.2k |
| 12 | `12-jobs.png` | /jobs | 5.3k |
| 13 | `13-submit-projects.png` | /submit-projects | redirects to Sign In (auth-gated) |
| 14 | `14-bootcamp.png` | bootcamp.sheryians.com | 14.1k |
| 15 | `15-offline.png` | offline.sheryians.com | 16.2k |

Capture caveats: `04` shows a "Get Discount" modal over the hero (auto popup). `15` has a long empty black band where a GSAP scroll-pinned section did not render in a static capture.

---

## 1. Global design system

### Color
| Token | Value | Use |
|---|---|---|
| bg | `#000` / `#010101` | page background, almost everywhere |
| surface | `rgba(0,0,0,.1–.6)` over dark, `#0b0b0b`-ish cards | cards, FAQ rows, nav pill |
| brand orange | `#E8602E` (rgb 232,96,46) | CTAs, eyebrow labels, prices, highlights |
| orange tint | `rgba(232,96,46,.13)` | label chips, button glow |
| cream | `#FDEFEA` (rgb 253,239,234) | light "sheet" sections that break the dark |
| deep brown | `#210B06` | warm radial glow behind hero |
| text | `#fff`, then white at 90/70/60/40% opacity, `#D3D3D3`, `#797979` | strict opacity-based text hierarchy |

Per-product accent overrides the orange: Cohort 3.0 → green (`~#3FAE5A` glow), Java & DSA → blue/violet gradient, Bootcamp (KODR) → purple + lime, Jobs → ultramarine/violet. Brand stays black; only the accent swaps. Good idea for course-specific landing pages.

### Typography
- **Neue Machina** (geometric, slightly mechanical display) — hero H1 ~57px/400, big words, outlined footer wordmark.
- **Manrope** — everything else. Weights 300/400/500 dominate; 700 is rare. Headings are *light* (300–400) at 36px, line-height ≈ 1.0–1.1.
- Section H2 ≈ 36px, card title ≈ 23px/500, body ≈ 14–16px, meta ≈ 11–12px.
- Light-weight large headings + tiny meta text = premium feel. Title Case On Every Word in headings.

### Shape & depth
- Radii: 6, 9, 12, 18, 24px, plus full pills (`9999px`) for buttons/chips/nav.
- Borders: 1px white at ~8–12% opacity on cards; no heavy shadows.
- Depth via **radial glows** (orange/brown in hero, green/blue/purple on product pages), not drop shadows.
- Hero background: faint geometric line pattern + dot grids at the edges.

### Recurring components
1. **Navbar** — logo left, centered pill nav (Home / Courses / Bootcamp / Offline) inside a bordered dark capsule, right: outlined-orange "Request Call" pill + text "Sign In". Same on every main-domain page.
2. **Eyebrow label** — tiny uppercase word in a box with dashed/corner-marked border, orange text on orange tint (`COURSES`, `IMPACT`, `FAQS`). Used above every section H2. Signature element.
3. **Section header** — eyebrow → centered 2-line H2 (light weight) → optional orange pill CTA.
4. **Primary button** — small orange pill/rounded rect with "→", gradient orange-to-darker-orange. Secondary: white pill on black, or outlined dark.
5. **Logo marquee** — hiring partner logos, greyscale, infinite scroll.
6. **Testimonial wall** — 2 rows of dark cards, avatar + name + role, star rating, 2-line quote, edges fade out; rows drift in opposite directions.
7. **Comparison card** — "Us vs Others": left column green border + green glow with check icons, right column plain with red x icons.
8. **FAQ accordion** — narrow centered column (~780px), dark rows with 1px border, chevron right, first item open.
9. **Closing CTA** — blurred collage of course posters behind a big Neue Machina headline, brand word in a dashed highlight box.
10. **Footer** — giant outlined "Sheryians" wordmark (stroke only, ~200px) as a divider, then logo + social icons left, 3 link columns (About / Company / Contact) right. Very minimal.

### Motion (observed/inferred)
GSAP + scroll: marquee logos, horizontally-scrolling image carousels, drifting testimonial rows, pinned scroll sections (offline page), rotated/tilted leader cards on About, stacked fanned team cards with prev/next on course pages, number counters on stat cards.

### Rhythm
Dark → **cream sheet** (rounded-top 24px, full-width) → dark. The cream sheets host course listings, community grid and curriculum — content-dense parts get the light background so the page "breathes". Sections spaced ~160–200px.

---

## 2. Page-by-page

### 01 Home
1. Hero: orange eyebrow "LEARN. BUILD. GET PLACED.", 2-line Neue Machina H1 with one word framed in a dashed orange box, sub-line, avatar stack + "1 Million+" social proof, orange CTA. Warm radial glow + line pattern.
2. Bento grid card (dark glass panel): two stat tiles (YouTube subs, learners), big "UNLOCK [avatars] YOUR FIRST JOB…" type tile with arrow pill, video/brand tile with "Get in touch".
3. Partner logo marquee.
4. "Impact" — horizontally scrolling photo cards, staggered vertically, arrow badge in corner.
5. Cream sheet: "Courses" — large horizontal course cards alternating style (white, solid orange, black): image one side, title + icon meta (duration / certified / support) + price with struck original + CTA.
6. Testimonial wall (2 rows).
7. YouTube: free tutorial thumbnails carousel.
8. Cream sheet: "Community" masonry/bento of placement photos + video tiles + one orange stat tile ("01 Million Students Taught" in mono font).
9. Comparison card, FAQ, closing CTA collage, footer.

### 02 Courses
Same hero glow, eyebrow + H2. 3-column grid of course cards styled like **mac windows** (three traffic-light dots top-left), thumbnail with "LIVE" badge, tag chips (pill outlines), title, price + strikethrough + "% OFF" badge, outlined "Check Course →". Then comparison, FAQ, CTA, footer. Clean catalog template.

### 03 Course detail (Cohort 3.0, green theme)
1. Split hero: big video thumbnail (play button) left + title / short description under it; right sticky-style card: meta chips (schedule, certificate, language, class type), feature checklist, "The Next Big Thing" divider, green "Join Cohort Now" + outlined "View Full Syllabus".
2. Giant green gradient headline "Build Real Products" + 3D illustration + 3 glowing stat boxes (Months / Lectures / Questions).
3. Tabbed product demos (browser mock).
4. Comparison **table** (3 columns, highlighted middle column = this course).
5. "Placed" portrait wall (2 rows, edges fade).
6. Technologies: tab pills (Frontend/Backend/AI…) + icon tile grid.
7. Light sheet: curriculum — left dark "Course Prerequisites" card (level, weeks, checklist, CTA), right accordion of modules with "MODULE n" chip + "44 More →" expander.
8. "We also support builders" — 4 icon cards.
9. Certification card: text + certificate mockup.
10. Testimonials (green-tinted cards), team carousel (fanned cards, center one larger), FAQ, footer.

### 04 Course detail (Java & DSA, blue/violet theme)
Same template as 03 with different accent: 3D hero illustration, gradient-text title, 3 stat boxes, comparison, curriculum sheet (orange CTA), logo marquee, testimonials, certificate, FAQ. Proves the course page is one **themeable template**.

### 05 About
Hero "Where Dreams Transform Into Code" (Neue Machina) + 2 CTAs (orange filled, outlined). Logo marquee. Large faded statement paragraph (grey, reveals white on scroll). Showcase of a student project in a browser frame. "Vision of the brand" + 3 dashed-border cards (Online / Offline / Bootcamp) with mono font text and round arrow buttons. Team section with photo + orange side glows. "Leaders" — tilted orange gradient portrait cards zig-zagging down the page.

### 06 Support
Minimal: icon badge, H1 "Support Center", sub-line, 4 contact cards in a row (Email / Online / Offline / Discord) each with orange icon, orange value and grey hint. Good template for our contact page.

### 07 Privacy / 08 Pricing & Refund / 09 Terms
Legal template: orange centered H1, ~880px text column, numbered H2s, bold sub-heads, bullets + roman-numeral lists, white/grey text on black. Plain and readable — fine for our legal pages.

### 10 Resume checker (tool page)
Two-column hero: "ATS" in orange gradient + white headline, 3 feature ticks; right dashed dropzone card. Then preview dashboard: resume mock with "Scanning…" chip, score ring (92%), progress bar, checklist. Stats strip, 3 feature cards with chips, 3-step "How it works" row. Strong example of a product-UI page in the same system.

### 11 Hire
Breaks the system: white hero with 3D black torus, black band "Let's Get In Touch" with white pill buttons, grey section with 6 illustrated service cards. Heavy bold Manrope. Shows the B2B page uses an inverted palette.

### 12 Jobs
Own sub-brand: violet/ultramarine gradient hero with chrome 3D shapes, outlined pill nav, huge sliding word marquee, B&W team portraits. More playful/agency style.

### 13 Submit projects
Auth-gated → shows Sign In: centered narrow form, phone input, "Or" divider, "Continue with Google" button. Simple auth reference.

### 14 Bootcamp (KODR, subdomain)
Purple theme + lime highlight word in H1. 4 stat cards with 3D icons (package, partners). Coloured logo marquee. Success-story card (video + "₹47 LAKHS" in lime). Side-by-side comparison (KODR card glowing purple vs "Typical bootcamp" grey). Project accordion with 3D folder art. Numbered (01/02/03 big purple numerals) feature rows with photo cards.

### 15 Offline (subdomain)
Photo-led: full-bleed classroom hero with dark overlay, serif italic accent word ("Grow Your Career") mixed with sans. Red/orange gradient buttons. Stat glass tiles over photo. Numbered 01/02/03 vertical timeline with fading inactive items. Filter-chip course grid. Photo banner with 3 orange feature tiles.

---

## 3. What to take for Aoun Institute
Our brand is already black/orange/cream — very close match. Worth adopting:
- **Eyebrow chip** with dashed border above every section heading.
- **Light-weight large headings** (300–400) instead of bold; one display font for heroes only.
- **Cream sheet sections** with rounded top corners to break long dark pages (course list, curriculum).
- **Course detail as one themeable template**: split hero + sticky info card, stat boxes, comparison table, curriculum accordion with prerequisite card, certificate mockup, FAQ.
- **Course card**: window-dots header, tag chips, price + strike + % OFF badge, outlined CTA.
- **Comparison card** (us vs others) with green/red icons.
- **Support page** 4-card layout; **legal page** narrow column layout.
- **Footer** with outlined giant wordmark.
- Glows (radial gradients) for depth instead of shadows.

Avoid: auto discount popup on load, and inconsistent sub-brand styles (Hire/Jobs look like different companies).
