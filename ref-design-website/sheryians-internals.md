# How the sheryians.com landing page works (REA analysis)

Captured 2026-10-24 with [REA](https://github.com/morluto/rea) 6.7.0 (`bunx rea-agents@latest`, no agent setup):
`inspect-web-page --include-script-sources` over CDP (agent-browser's Helium) → `export-web-scripts` → static reading of the exported chunks.
`analyze-web-bundle` ran out of Node heap on their 494 KB main chunk, so library detection was done by searching the exported files.
Notes below describe techniques and settings in our own words; no code was copied into this repo.

## Stack

| Layer | What they use | Evidence |
|---|---|---|
| Framework | React SPA built with **Vite** (hashed chunks: `index-*.js`, `ui-*.js`, `router-*.js`, per-section chunks like `CTASection-*`, `CSSMarquee-*`, `MovingLogos-*`, `TestimonialSection-*`) | chunk names, ESM imports between chunks |
| Smooth scroll | **Lenis** via its React root wrapper, `autoRaf: false`, `lerp: 0.1`, `duration: 1.2` | main chunk |
| Scroll animation | **GSAP + ScrollTrigger**; Lenis `raf` is driven from `gsap.ticker`, `lagSmoothing(0)`, Lenis `scroll` event calls `ScrollTrigger.update` | main chunk |
| Component motion | **Motion (framer-motion)**: `whileInView`, `layoutId`, `initial/animate` present in the `ui` vendor chunk | ui chunk |
| Marquees | own `CSSMarquee` component, pure CSS keyframes | `CSSMarquee-*` |
| Lazy media | `IntersectionObserver` (images, CTA background) | home + CTA chunks |
| Routing | scroll to top instantly + `ScrollTrigger.refresh()` on route change | main chunk |

Same core as Aoun (`components/motion/smooth-scroll.jsx` already wires Lenis → GSAP ticker → ScrollTrigger the same way).

## Section by section

### Hero
- Text block enters with a Motion `initial → animate` fade/rise (inline `opacity:1; transform:none` after mount).
- Bento panel is a glass card: `backdrop-filter: blur(20px)` plus a stacked multi-layer soft shadow.
- "Start Learning" tile is a **muted autoplay looping webm** (`herosection.webm`).

### Logo strip (`MovingLogos`)
- Not separate logo elements: **one wide PNG of all company logos**, rendered twice inside the marquee.
- Marquee speed prop → duration `round(2000 / speed)` seconds (min 5s).

### `CSSMarquee` (logos, testimonials, YouTube)
- Track is `width: max-content`, children rendered twice, keyframes move `translateX(0 → -50%)` (left) or `(-50% → 0)` (right), `linear infinite`.
- Pause on hover; on touch devices a tap toggles pause (`onTouchEnd`), and the wrapper is focusable with `aria-pressed`.
- Testimonials = two rows, opposite directions.

### Impact carousel
- **Desktop (≥1024px): no pin.** One GSAP tween moves all `.impactCard` elements `x: -150%` with `scrollTrigger { trigger: wrapper, start: "top 40%", end: "bottom 30%", scrub: true }`. Cards drift sideways while the page keeps scrolling normally → no empty spacer after the section.
- **Mobile/tablet:** native horizontal scroll with `snap-center` cards. A passive scroll listener, throttled with `requestAnimationFrame`, finds the card whose centre is closest to the viewport centre and highlights the matching **pagination dot**. Clicking a dot scrolls the row so that card is centred.
- Hover (desktop): grayscale swap, tag chip fades in, gradient text panel slides up, arrow badge rotates.

### Course stack
- Each course card is `position: sticky` with its own inline `top` offset, `mb-6`, `w-[90%]`, rounded. Cards slide up and stack over the previous one while scrolling, no JS.
- Card theme (white / orange / black) picked from the index.

### Testimonial card
- Gradient hairline border: outer wrapper with `p-[.5px]` and a top-to-bottom grey→black gradient, inner card with a near-black → dark-red vertical gradient.
- Fixed footprint: `md:w-[45vw] lg:w-[30vw]`, height `30ch`. Partial stars drawn with a `clip-path: inset(...)` mask.

### Section labels (`HeadingWithSub`)
- Default: the orange dashed/cornered chip (Neue Machina, uppercase, `bg-[#e8602e21]`).
- Colour variants (green, blue, orange, purple, yellow) render a **pill with a radial-gradient background** instead. This is how course pages get their per-course accent without new components.

### Closing CTA
- Background is **one blurred collage image (webp)**, not separate floating cards. It is attached only when the section is within 100px of the viewport (`IntersectionObserver` with `rootMargin: 100px`), then the observer disconnects.
- `py-44 lg:h-screen`, centred heading + framed brand word, same as Aoun.

### Images in general
- Many images use a small lazy component: `src` is empty until an `IntersectionObserver` (threshold 0.1) sees it, then it sets `src` and disconnects.

## What this means for Aoun

| Topic | Aoun today | Take from sheryians |
|---|---|---|
| Lenis + GSAP sync | same pattern, plus reduced-motion guard | nothing to change |
| Impact desktop | **pinned** horizontal scrub → leaves a tall black spacer | switch to their **unpinned scrub** (`start "top 40%"`, `end "bottom 30%"`) or keep pin but shorten `end`; removes the gap |
| Impact mobile | snap row, no indicator | add rAF-throttled active-card detection + clickable dots |
| Marquee | CSS keyframes, pause on hover | add tap-to-pause for touch and keyboard focus |
| Course stack | sticky cards | already matches |
| Hero tile | image/video slot (added in 421d9f3) | upload a short muted loop |
| Logos | `LogoMarquee` hidden (no data) | a single combined logo strip image is the cheap option |
| CTA | blurred course thumbnails | fine; their single collage image is lighter (1 request) |
| Section chips | orange chip only | optional colour variants (radial-gradient pill) for course-specific accents |
| Lazy images | native `loading="lazy"` | native lazy is enough; no need to copy their observer |
