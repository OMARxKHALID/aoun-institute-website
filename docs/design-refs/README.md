# Panel design references

Two third-party dashboard shots guide the **layout and structure** of the panels. They are references only: never copy their branding, illustrations, copy or exact visuals, and never ship them in `public/`. All panels use this site's own design system (see `app/globals.css`):

- Page background `#000`, panel surfaces `#070707` / `#0C0C0C`, borders `#302C2A`
- Accent `#E8602E` (gradient `#E8602E → #A8401A`), accent tint `bg-accent/15`, dark accent `#4B1E0E`
- Cream highlight surface `#FFF3EF` with black text (promo cards, callouts)
- Fonts: `font-machina` (Space Grotesk) for headings, Manrope for body
- Shared shell: `components/ui/panel-shell.jsx`, `panel-nav.jsx`, `panel-header.jsx`

Save the original images next to this file with these names (kept out of git history is fine; they are only for local reference):

| File | Used for |
|---|---|
| `student-dashboard-ref.jpg` | Student panel `/dashboard` (Focotech-style shot) |
| `admin-panel-ref.jpg` | Admin panel `/admin` (Eduplex-style shot) |

## Student dashboard (`/dashboard`) — structure to follow

- **Left sidebar:** brand at top, "MENU" label, items: Overview, My Courses, Quizzes, Certificates, Orders, Settings; unread count badge on items that need one; active item = tinted pill with accent text/icon; bottom promo card (cream) e.g. "Explore new courses".
- **Top bar:** page title left; search field (with shortcut hint), notifications bell, avatar right.
- **Main column:**
  - "Continue Learning": 2-up cards — course icon, title, category label, accent progress bar, `X/Y lessons` and time left, "Resume course →" link.
  - "Recommended courses": grid of video-thumbnail cards (badge like "New", duration, title, instructor, rating, price).
- **Right column (collapsible "details"):** profile card (avatar ring, name, headline, points); 3 mini stats (day streak, goals this month, rank); weekly streak strip (days as pills, completed days filled accent); two stat tiles (courses in progress / completed); weekly watch-time bar chart with highlighted current bar and tooltip.
- **Mobile:** sidebar becomes top bar + menu; right column stacks below main; cards go 1-up.

## Admin panel (`/admin`) — structure to follow

- **Left sidebar:** dark rounded card; brand + ADMIN badge; nav items as large pills (active = accent gradient pill); notification count badge; bottom promo card (cream) e.g. "View site".
- **Top bar:** "Welcome back {name} 👋" heading; search field; avatar.
- **Main column:**
  - Overview cards row: 3-up compact cards (icon tile, title, small meta: count/rating/type) — e.g. top courses.
  - Two-up row: activity bar chart (weekly revenue/enrollments, dropdown for range, "+x% vs last week" delta, highlighted bar with tooltip) beside a "Today / Schedule" list (icon tile, title, subtitle, chevron) — e.g. pending payments, new messages.
  - List section with filter dropdown + add button: rows with avatar/icon, title, owner, "remaining"/meta column, circular progress %.
- **Right column:** promo/feature card (dark with illustration area), month calendar with highlighted day, list with status pills (In progress / Completed / Upcoming) — e.g. orders or certificates queue.
- **Mobile:** same stacking rules as the student panel.

## Shared rules

- Responsive first: no horizontal scroll at 375px; grids collapse 3 → 2 → 1; tables scroll inside their own container.
- Status pills: Pending = amber tint, Paid/Completed/Valid = green tint, Failed/Revoked = red tint, In progress = accent tint.
- Charts are simple CSS/SVG bars (no chart library) until a real need appears.
