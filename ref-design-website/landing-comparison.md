# Landing page deep-dive: Aoun `/` vs sheryians.com `/`

Component by component, with motion, scroll behaviour and responsiveness. Captured 2026-10-24.
Desktop 1440×900, tablet 768, mobile 390 (`screenshots/responsive/{sher,aoun}-home-{390,768}.png`).
Motion data was read live from the DOM (`document.getAnimations()`, GSAP inline styles while scrolling, sticky/fixed elements).

> Status 2026-10-24: fix list items 1–3 and 6 done; Impact is now unpinned with mobile dots. Items 4–5 need content (Site Settings data, real thumbnails).

## 0. Engine

| | Sheryians | Aoun |
|---|---|---|
| Smooth scroll | Lenis (`html.lenis`) | Lenis, synced to GSAP ticker + ScrollTrigger (`components/motion/smooth-scroll.jsx`), off under reduced motion |
| Scroll animation lib | GSAP/Framer-style bundled (inline `transform`/`opacity` set on scroll) | GSAP + ScrollTrigger |
| Section reveal | hero block fades/rises once; few other reveals | `Reveal` wrapper: `from {opacity:0, y:30}`, 0.8s `power3.out`, `top 90%`, once. Used on nearly every section heading/block |
| Marquees | 4 CSS keyframe marquees (logos 24s, testimonials 33s ← and 33s →, YouTube 20s) | 1 running (free previews 40s). `Marquee` component supports reverse + pause on hover, but logo/testimonial sections are hidden (no data) |
| Sticky | 3 course cards `position: sticky` → stacking cards on scroll | 4 course cards sticky → same stacking effect |
| Pinned | none on home | Impact section pinned, horizontal scrub (`scrub: 0.6`, lg+ only) |
| Video | hero tile autoplays muted loop `herosection.webm`; placement clips play on click | none |
| Fixed | navbar (300ms transition on scroll) + mobile drawer | navbar (300ms transition) |
| Reduced motion | not detected | respected (Lenis + Impact pin skipped) |

Verdict: Aoun's motion system is equal or better in code. What's missing is the *content* that the motion runs on (logos, testimonials, videos, photos).

## 1. Component-by-component

| # | Component | Sheryians | Aoun | Motion compare | Gap / action |
|---|---|---|---|---|---|
| 1 | **Navbar** | logo, centered pill nav (4), "Request Call" pill, Sign In; mobile: phone icon + burger → full-height black drawer | same layout, 3 links, "Contact us", Sign in; mobile phone icon + burger | both fixed, bg/blur fades in on scroll (300ms) | match |
| 2 | **Hero text** | eyebrow, Neue Machina H1 with framed word, sub, avatar stack + "1 Million+", CTA | identical structure (`hero.jsx`) | Sher: block fades up on load. Aoun: static server-rendered, no entrance | P3 add load-in stagger (eyebrow → H1 → sub → CTA) |
| 3 | **Hero background** | radial orange glow, diagonal line pattern, dot grids | `HeroBackground` same idea | both static | match |
| 4 | **Bento panel** | glass card (`backdrop-filter: blur(20px)` + layered shadow); 2 stat tiles with brand icons; "Unlock" tile with avatar stack; **autoplay video tile** | bordered panel, 2 live stat tiles, Unlock tile, **empty gradient "Start Learning" tile** | Sher: video loop = motion. Aoun: none | **P1** put a muted looping video or image in the tile (add `video`/`image` to Site Settings hero). **P1 tablet bug** below |
| 5 | **Logo marquee** | greyscale partner logos, CSS marquee 24s | `LogoMarquee` exists, hidden (`home.partners` empty) | — | P2 add partners in Site Settings (only real ones) or keep hidden |
| 6 | **Impact** | eyebrow + H2, cards slide horizontally (GSAP `translate3d(-136%)` carousel), hover: grayscale toggle, tag chip + text panel slide up, arrow rotates; mobile: swipe + **dot pagination** | same card design + hover (`impact.jsx`), lg: section **pinned** with horizontal scrub; < lg: native scroll-snap row | Aoun pin/scrub is the stronger effect | **P1** cards have no images → empty gradients. Add photos to `impactCards[].image`. P3 mobile: add pagination dots like reference |
| 7 | **Courses (cream sheet)** | rounded-top cream sheet; large horizontal course cards, alternating white/orange/black, **sticky stack** while scrolling | same, 4 cards, sticky stack | match | P2 real thumbnails (currently generic gradient + icon) |
| 8 | **Testimonials** | 2 rows, opposite-direction marquees 33s, edges fade, star rating with clip-path partial stars | `Testimonials` exists, hidden (`home.testimonials` empty) | — | **P2** add testimonials (or feed from course reviews). Biggest missing trust block |
| 9 | **YouTube / Free previews** | thumbnail carousel, marquee 20s, glass cards with inset shadow | lesson preview cards, marquee 40s | similar | P2 thumbnails are blank gradients → use Mux poster image (`image.mux.com/{playbackId}/thumbnail.jpg`) |
| 10 | **Worldwide** | — | stats strip + country flag chips on cream sheet | `Reveal` | Aoun only, keep |
| 11 | **Community bento** | cream sheet, photo/video masonry + orange stat tile | `Community` exists, hidden (`home.communityTiles` empty) | — | P3 enable once photos exist |
| 12 | **Comparison** | us (green border + green glow) vs others | same | both static | match. P3 mobile: outer border box + inner card double padding is cramped at 390 |
| 13 | **FAQ** | narrow accordion, first open, glass rows (`backdrop-filter: blur(21px)`) | same, accent chevron | both height transition | match |
| 14 | **Closing CTA** | blurred **course poster collage** behind headline, framed brand word | same headline + framed word; background = **5 grey placeholder rectangles** | Sher: posters drift slightly. Aoun: static | **P1** replace `floaters` with course thumbnails (`courses[].thumbnail`) or remove them |
| 15 | **Footer** | outlined giant wordmark, logo + socials, 3 columns | outlined wordmark, 4 columns + bottom bar | static | Aoun ahead |

## 2. Scroll journey (desktop)

| Scroll % | Sheryians | Aoun |
|---|---|---|
| 0–8 | hero + video bento | hero + empty bento tile |
| 8–15 | logo marquee | — (hidden) → straight to Impact |
| 15–25 | impact carousel slides | **Impact pinned**, horizontal scrub across cards, ~500px empty band after release (pin spacer with blank cards) |
| 25–45 | course cards stack (sticky) | course cards stack (sticky) |
| 45–60 | testimonials double marquee, YouTube marquee | worldwide stats, free previews marquee |
| 60–80 | community bento, comparison | comparison |
| 80–100 | FAQ, poster CTA, footer | FAQ, placeholder CTA, footer |

Aoun's page is ~9.0k px vs 11.6k: shorter because 3 sections are hidden, not because of design.

## 3. Responsiveness

No horizontal overflow on either site at 390 or 768 (only off-canvas element on Sheryians is its closed mobile drawer).

| Component | 390 (mobile) | 768 (tablet) |
|---|---|---|
| Navbar | both: logo + phone icon + burger | both same |
| Hero H1 | both 4 lines, framed word fits | both fine |
| Bento panel | both stack: 2 stat tiles, Unlock, Start Learning tile. Sher tile has video; Aoun tile empty gradient | **Aoun bug: "Start Learning" tile collapses to a thin line.** Its children are all `absolute` and the height only exists at `max-sm:h-[40vh]`; between `sm` and `lg` it has no height. Sher shows tile at full height |
| Impact | Sher: 1 card + peek + dots. Aoun: 1 card + peek, no dots | both 2-card row with stagger offset; Aoun cards empty |
| Courses | both full-width stacked cards, image on top | both fine |
| Testimonials | Sher: horizontal cards, 1 + peek | — |
| Comparison | Aoun: card inside bordered box, tight side padding | ok |
| CTA | Aoun: grey placeholders visible above headline + large empty space below button | — |
| Footer | Aoun: 2-col links, good | good |
| Next dev "N" badge | shown on Aoun (dev only, ignore) | — |

## 4. Fix list (landing only)

1. **P1** `components/sections/hero.jsx`: "Start Learning" tile, give it height for all widths below `lg` (e.g. replace `max-sm:h-[40vh]` with `max-lg:h-[40vh]` / `max-lg:min-h-80`) and render an image/video from Site Settings.
2. **P1** `components/sections/impact.jsx`: impact cards need images (data); until then hide the section or use course thumbnails.
3. **P1** `components/sections/cta.jsx`: swap grey `floaters` for real course thumbnails (pass `courses`), or drop them.
4. **P2** Fill Site Settings: `home.partners`, `home.testimonials`, `home.communityTiles` → enables 3 existing sections with their marquees.
5. **P2** Free previews: Mux poster thumbnails.
6. **P3** Hero entrance stagger; mobile pagination dots on Impact; comparison mobile padding.
