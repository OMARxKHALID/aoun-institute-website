# Panel design references

**Dark mode only.** The whole codebase is dark; there is no light theme.

Both panels follow the layout of the **"Welcome back" dashboard reference (Eduplex-style shot)**, rebuilt in this site's dark design system. The second reference (Focotech-style shot) only contributes student-specific content blocks. They are references for structure: never copy their branding, illustrations, copy or exact visuals, and never ship them in `public/`.

Design tokens (see `app/globals.css`):
- Page background `#000`; panel surface `#070707`; cards `#0C0C0C`; borders `#302C2A`
- Accent `#E8602E` (gradient `#E8602E → #A8401A`), tint `bg-accent/15`, deep accent `#4B1E0E`
- Cream highlight `#FFF3EF` with black text for promo/feature cards
- Headings `font-machina` (Space Grotesk), body Manrope
- Shared shell: `components/ui/panel-shell.jsx`, `panel-nav.jsx`, `panel-header.jsx`

Optional local copies of the originals: `docs/design-refs/admin-panel-ref.jpg` (Eduplex-style) and `docs/design-refs/student-dashboard-ref.jpg` (Focotech-style).

## Shared layout (both panels, from the Eduplex-style reference)
- **Sidebar:** dark rounded card; brand at top; nav items as large pills, active = accent gradient pill; count badges (e.g. pending orders, new messages); cream promo card at the bottom; collapsible to an icon rail.
- **Header:** "Welcome back {firstName} 👋" (overview pages) or page title; rounded search field; avatar.
- **Main column:** a 3-up row of compact course cards (icon tile, title, lessons count, rate, type) → two-up row of an activity bar chart (range dropdown, "+x% vs last week", highlighted bar with tooltip) beside a schedule/list card (icon tile, title, subtitle, chevron) → a list section with filter dropdown and add button (rows with icon, title, owner, remaining time, circular progress %).
- **Right column (xl screens):** dark featured card (accent CTA), month calendar with highlighted day, list with status pills.
- **Responsive:** right column stacks under main below `xl`; card rows go 3 → 2 → 1; tables scroll inside their own container; no horizontal page scroll at 375px.

## Student `/dashboard` content
- Course cards row → "Continue learning" (title, category, accent progress bar, X/Y lessons, time left, Resume →)
- Chart → weekly watch time; schedule list → pending quizzes with due dates
- List → "Courses you're taking" with remaining time + progress ring
- Right column → featured "Explore courses" card, calendar (quiz due dates / activity days), certificates list with status pills; streak + stats tiles from the Focotech-style reference

## Admin `/admin` content
- Course cards row → top courses (students, rating, category)
- Chart → weekly revenue/enrollments; schedule list → pending payments, new messages
- List → recent orders or latest enrollments
- Right column → featured "View site" card, calendar, queue list (orders/certificates) with status pills

## Status pills
Pending = amber, Paid/Completed/Valid/Published = green, Failed/Revoked = red, In progress/Upcoming = accent, Draft = gray (`components/ui/status-pill.jsx`).
