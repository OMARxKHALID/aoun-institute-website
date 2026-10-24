# Aoun Institute LMS — Architecture

Course-selling LMS for an institute: students register, buy recorded video courses, watch DRM-protected lessons, take server-graded quizzes, track progress, and earn publicly verifiable certificates. The owner manages everything from an admin panel.

Domain language lives in `CONTEXT.md`; architectural decisions in `docs/adr/`.

## Stack (fixed)
- Next.js 16.4 App Router, `cacheComponents: true`, React 19.3, plain JS/JSX (no TypeScript), `jsconfig.json` alias `@/*`
- Tailwind CSS 4.3 (CSS-first config in `app/globals.css`), GSAP for marketing animations
- MongoDB (Atlas) via Mongoose 9 + native driver 7 (one shared client)
- Bun is the package manager and runtime (`bun add`, `bun dev`, `bun run build`, `bun test`)
- Hosting: Vercel + MongoDB Atlas

## Packages (versions verified Oct 2026 with `bun pm view`)
| Package | Purpose |
|---|---|
| mongoose 9.11.2, mongodb 7.7.0 | ODM + shared native client (Better Auth uses the same client) |
| better-auth 1.7.7, @better-auth/mongo-adapter 1.7.7 | email+password, email verification, reset, Google OAuth, sessions, admin plugin (roles, ban, revoke sessions), DB-backed auth rate limits |
| zod 4.6.7 | validation on server (authoritative) and client (UX). v4 idioms: `z.email()`, `error` param, `z.strictObject()`, `z.flattenError()` |
| react-hook-form 7.90.0, @hookform/resolvers 5.9.1 | client forms with `zodResolver`; server errors mapped with `setError` |
| @tanstack/react-query 5.104.2 | client cache for interactive views; reads via route handlers, mutations via Server Actions |
| @tanstack/react-table 9.3.1 | admin tables (v9 API: `createTableHook`, `tableFeatures`, `create*RowModel`) — added in Phase 2 |
| cloudinary 2.11.0 | signed direct image/PDF uploads (own dropzone in `components/ui/image-upload.jsx`, XHR to the Cloudinary upload API), delivery |
| @mux/ts 15.6.1, @mux/mux-player-react 3.14.0, @mux/upchunk 3.5.0 | video: direct upload, signed + DRM playback, player — Phase 3 (`@mux/mux-node` is deprecated) |
| resend 6.32.1 | transactional email (console fallback in dev without key) |
| @react-pdf/renderer 4.9.0, qrcode 1.5.4 | certificate/receipt PDFs with QR — Phase 7 |
| rate-limiter-flexible 11.2.2 | Mongo-backed limits for verify/uploads/quiz — added when needed |
| server-only 0.0.1 | guards server modules from client bundles |
| lenis 1.3.26 | smooth wheel scrolling on public pages, synced with GSAP ScrollTrigger (`components/motion/smooth-scroll.jsx`) |

Skipped: zustand (quiz and player state fit in component state). Rejected: pdf-lib (abandoned), @dnd-kit (stale/pre-1.0; pointer-event sortable in `hooks/use-sortable.js` with touch support, plus menu move buttons for keyboard users), Vidstack/Plyr (deprecated), sharp (Cloudinary transforms), bcrypt (Better Auth hashes).

## Decisions
- Payments: **manual first** (PKR; bank transfer + JazzCash/Easypaisa with receipt upload; admin approves). Gateway later behind `PaymentProvider` (Safepay/PayFast/JazzCash/Easypaisa to verify).
- Demo checkout: with `DEMO_PAYMENTS=true` the checkout adds a "Card" tab (`features/payments/providers/demo-card.js`): test card 4242 4242 4242 4242 pays instantly (order `PAID`, provider `demo_card`) and enrolls; 4000 0000 0000 0002 is declined. Never enable it for real customers. A real gateway replaces this provider later.
- Search: panel header search (`next/form`) → `/admin/search` or `/dashboard/search` (`features/analytics/search.js`) covering pages (from `lib/nav.js`), courses, lessons, quizzes, notes, certificates, students, orders and announcements.
- Video: **Mux with DRM from day one** (paid add-on ~$100/mo + $0.003/play), Mux Player for all adapters. Fallback adapters: `embed` (YouTube/Vimeo, flagged insecure), `url` (HLS/MP4 testing).
- Access: an enrollment has no expiry; it ends only on refund or owner revoke (`CONTEXT.md`). One video stream at a time per account.
- Auth: email+password (verification required) + Google (enabled only when env keys exist).
- Email: Resend. Brand: current orange/black look; logo/colors editable in Site Settings.
- Roles: Owner, Teacher, Student (`docs/adr/0001-owner-teacher-student-roles.md`). Stored as Better Auth roles `ADMIN` (the Owner), `TEACHER` and `STUDENT`; course access via `features/courses/access.js` (`canTeach`, `taughtCourseIds`).
- Removed marketing extras (jobs, hire, resume checker, submit projects, webinars, request callback).

## Folder structure (feature-based)
```
app/
  layout.js · globals.css · not-found.js · providers.jsx
  (site)/      layout.js, page.js, courses/, courses/[slug]/, checkout/[slug]/, about/, contact/, faq/, verify/, verify/[code]/,
               privacy-policy/, terms-and-conditions/, pricing-and-refund/
  (auth)/      layout.js, login/, register/, forgot-password/, reset-password/, verify-email/
  dashboard/   layout.js, page.js, courses/, courses/[slug]/, courses/[slug]/lessons/[lessonId]/,
               quizzes/, quizzes/[quizId]/, quizzes/attempts/[attemptId]/, certificates/, orders/, settings/
  admin/       layout.js, page.js, courses/, courses/new/, courses/[id]/, courses/[id]/lessons/[lessonId]/, courses/[id]/quizzes/[quizId]/,
               quizzes/[id]/results/, students/, students/[id]/, orders/, certificates/, announcements/, settings/
  api/auth/[...all]/route.js · api/webhooks/mux/route.js · api/lessons/[lessonId]/playback/route.js · api/progress/route.js
  api/certificates/[code]/pdf/route.js · api/orders/[id]/invoice/route.js · api/admin/orders/[id]/receipt/route.js · api/admin/quiz-results/[quizId]/route.js (CSV)
features/<name>/   model(s).js · schemas.js · actions.js · queries.js · components/ · (providers/, store.js, *.test.js)
  auth · site-settings · courses · video · payments · enrollments · progress · quizzes ·
  certificates · announcements · students · analytics · profile · notifications
components/ui/ · components/motion/ · components/sections/    shared UI (existing design system)
lib/  db.js · auth.js · auth-client.js · permissions.js · dal.js · validate.js · query-client.js ·
      cloudinary.js · email.js · rate-limit.js · ids.js · format.js
hooks/ · scripts/seed.js · proxy.js · .env.example
```

## Data-flow rules
- **Reads:** Server Components call feature `queries.js` (guarded by `lib/dal.js`). Public catalog/settings use `'use cache'` + `cacheTag(...)`; admin mutations call `updateTag(...)` so students see changes instantly.
- **Client reads (TanStack Query):** through route handlers under `app/api/...`, never Server Actions in `queryFn`.
- **Mutations:** Server Actions in `features/*/actions.js`: `requireUser`/`requireAdmin` first, Zod parse, return `{ ok: true, data }` or `{ ok: false, errors }` (field errors for RHF `setError`).
- **Session:** `lib/dal.js` calls `await connection()` then `auth.api.getSession({ headers: await headers() })` (session checks read the clock, which partial prefetching flags otherwise); request-time reads sit behind `<Suspense>` or a page with `instant = false`.
- **DB:** always `await connectDB()` before Mongoose queries. Node runtime only (no edge).

## MongoDB collections
Better Auth owns `user`, `session`, `account`, `verification`, `rateLimit`; `user` extended with additionalFields (phone, bio, country, city, birthDate, avatarPublicId, notify* booleans, lastActiveAt, deletionRequestedAt) plus admin-plugin fields (role, banned, banReason, banExpires). Avatar URL lives in Better Auth's `image`.

| Collection | Key fields | Indexes |
|---|---|---|
| siteSettings | singleton `_id:"site"`: brand{name,logo}, contact{email,phone,address,hours}, socials[], hero, footer, seo, payment{bank, wallets[]} | — |
| courses | slug, title, description, thumbnail, price, discountPrice, currency, status, outcomes[], prerequisites[], estimatedDuration, syllabusFile, attachments[], sequentialUnlock, certificateRule{type,percent,requireQuizzes}, contentVersion, teacherIds[] | slug unique; status+createdAt; teacherIds |
| sections | courseId, title, order | courseId+order |
| lessons | courseId, sectionId, title, order, description, isFreePreview, durationSec, status, video{provider,assetId,playbackId,status,src,drm}, attachments[] | courseId; sectionId+order |
| quizzes | courseId, sectionId?, lessonId?, title, order, passingPercent, maxAttempts, timeLimitSec, shuffleQuestions, shuffleOptions, showAnswers, displayMode, requiredForCertificate, dueAt, status | courseId; sectionId+order |
| questions | quizId, type (single/multiple/true_false; short_answer later via acceptedAnswers), prompt, options[{text,isCorrect}], points, explanation, order | quizId+order |
| enrollments | userId, courseId, status active/revoked, source order/free/gift, orderId, enrolledAt | userId+courseId unique |
| orders | userId, courseId, amount, currency, provider, status PENDING/PAID/REJECTED/CANCELLED/REFUNDED, providerRef, receipt, coupon{code,discount}, refundRequest{reason,requestedAt,status open/approved/declined,note,decidedAt}, reviewedBy, paidAt, refundedAt | userId+createdAt; status+createdAt; providerRef unique sparse |
| coupons | code, kind percent/fixed, value, courseId?, expiresOn, maxUses, uses, active | code unique |
| paymentEvents | provider, eventId, orderId, processedAt | provider+eventId unique |
| lessonProgress | userId, courseId, lessonId, watchedSeconds, lastPosition, percent, completedAt | userId+lessonId unique; userId+courseId |
| quizAttempts | userId, quizId, courseId, attemptNo, questionOrder[], optionOrder, answers[], startedAt, expiresAt, submittedAt, score, maxScore, percent, passed, status | userId+quizId+attemptNo unique; quizId |
| attemptGrants | userId, quizId, courseId, extra | userId+quizId unique |
| courseProgress | userId, courseId, counts, percent, timeSpentSec, lastLessonId, lastPosition, lastActiveAt, eligible, missing, contentVersion | userId+courseId unique |
| certificates | code INST-YYYY-XXXXXXXX, userId, courseId, studentName, courseTitle, issuedAt, status VALID/REVOKED, revokedAt, reason, reissuedFrom | code unique; userId+courseId partial unique (VALID) |
| announcements | courseId, authorId, title, body | courseId+createdAt |
| activityLogs | userId, courseId, type, refId, meta | userId+createdAt |
| playbackSessions | userId, deviceId, lessonId, startedAt, heartbeatAt | userId unique; TTL heartbeatAt |

Progress staleness: structural course edits bump `contentVersion`; an older `courseProgress` is recomputed on read and after lesson/quiz events. Issued certificates are never silently revoked.

## Security rules
- `proxy.js` does optimistic cookie redirects only. Real checks happen in `lib/dal.js` inside every action, route handler and protected query.
- Lesson quizzes: a quiz the teacher attaches to a lesson (`quiz.lessonId`) stays locked until the student completes that lesson's video; the server checks `lessonProgress.completedAt` before starting an attempt (section/course quizzes follow sequential unlock).
- Quizzes graded only on the server; student queries never select `isCorrect`/`explanation`; attempts have server `expiresAt`; attempt limits and ownership enforced server-side.
- Video: enrollment (or free preview) checked before minting Mux tokens; tokens per view with `exp` = duration + buffer; domain/UA playback restriction; DRM; moving watermark (name + email + short id); one stream per account.
- Video flow: admin uploads straight to Mux (UpChunk to a direct-upload URL, `passthrough` = lessonId). Lesson status syncs from the Mux API (`features/video/sync.js`), triggered by the webhook and by the admin page polling, so dev works without a public webhook. Env: `MUX_TOKEN_ID/SECRET`, `MUX_SIGNING_KEY`, `MUX_PRIVATE_KEY`, `MUX_WEBHOOK_SECRET`, `MUX_DRM_CONFIGURATION_ID` (signed-only without it), `MUX_PLAYBACK_RESTRICTION_ID`.
- One stream: player claims `playbackSessions` on play and heartbeats every 30s; another device claiming the slot pauses the first player. Client-enforced on top of server state (a modified client can ignore it; tokens still expire).
- Payments: student submits method + transaction ID (+ optional private receipt); one PENDING order per course; admin approve → `PAID` + enrollment; reject → `REJECTED` with reason, student can resubmit (same reference reopens their rejected order). Free courses enroll directly.
- Uploads: server-signed Cloudinary params; after upload the server re-checks format/size via Admin API and deletes invalid assets; old asset destroyed on replace; receipts use `authenticated` delivery.
- Deterrents in `video-player.jsx`: player pauses behind a cover when the window loses focus, the tab is hidden, a screenshot shortcut (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5) is pressed or the page is printed; right-click, drag, long-press save, picture-in-picture and casting are disabled; moving watermark plus a faint tiled watermark (email + id) so leaks are traceable.
- Honest limits (README): no website can block screenshots; DRM blacks out recordings only where hardware DRM exists (not desktop Chrome/Firefox).

## Phases
1. Foundation: deps, DB, Better Auth + roles, proxy, DAL, providers, all models + indexes, site settings, auth pages, dashboard/admin shells, remove extras, seed, `.env.example`
2. Admin course/section/lesson CRUD, drag reorder, syllabus settings, uploads, cache tags, admin tables
3. Video layer (Mux + DRM, embed, url), direct upload + webhooks, player, watermark, one-stream heartbeat
4. Catalog, course page + previews, checkout + manual payments, approval → enrollment
5. Student dashboard, syllabus view, lesson progress, overview stats, settings + avatar
6. Quiz builder, quiz taking, server grading, results + stats + CSV
7. Certificates: eligibility, auto-issue, PDF + QR, verify pages, admin issue/revoke
8. Admin students/orders/announcements/analytics, notifications, polish, README

## Panel design
Dark mode only. Student `/dashboard` and admin `/admin` both follow the "Welcome back" (Eduplex-style) dashboard layout described in `docs/design-refs/README.md`, in the site's own black/orange/cream design system; the second reference only adds student content blocks. Shared shell: `components/ui/panel-shell.jsx`, `panel-nav.jsx`, `panel-header.jsx`; every panel page folder gets a `loading.js` (spinner from `panel-loader`) so per-user data stays inside a Suspense boundary.

## UI consistency
- Every table uses `components/ui/data-table.jsx` (TanStack Table v9: search, sort, 10 rows per page; collapsible cards below `xl`).
- Every dropdown uses `components/ui/select.jsx` (custom listbox over a hidden native select, works with RHF `register`); every row/section menu uses `components/ui/action-menu.jsx`. Both share `menuPanel`/`menuItem` from `lib/ui.js`.
- Tabs use `components/ui/tab-list.jsx`; panel cards `panel-card.jsx`; stats `stat-card.jsx`; charts `bar-chart.jsx`; `progress-bar.jsx`, `progress-ring.jsx`, `mini-calendar.jsx`.
- Sub-pages pass `back` to `PanelHeader`.

## Progress & certificates
- `features/progress/service.js#buildOutline` is the single source of lesson/quiz states (completed, in progress, available, locked; quiz passed/retry/failed/locked) and certificate eligibility. Playback, quiz start and dashboards all use it.
- Lesson completes at 90% watched (watch time is counted client-side from real playback, capped server-side by elapsed time). Embeds and lessons without video use "Mark as complete".
- Certificates auto-issue on the event that makes a student eligible (lesson completion or quiz submission).

## SEO
- `app/robots.js` and `app/sitemap.js` (public pages + published courses); base URL from `lib/site.js` (`NEXT_PUBLIC_SITE_URL`, falls back to `BETTER_AUTH_URL`).
- Root layout sets `metadataBase`, Open Graph and Twitter defaults; public pages set title, description and canonical; course pages add Course JSON-LD, the home page EducationalOrganization JSON-LD (`components/ui/json-ld.jsx`).
- Dashboard, admin, auth pages, checkout and certificate pages are `noindex`.

## Conventions
- Zero comments; `const` arrow functions only; event handlers prefixed `handle`; early returns; kebab-case filenames; Tailwind only; ES modules.
- Look for an existing helper in `lib/`, `components/ui/`, or the feature folder before writing a new one.
- Read the bundled Next.js docs in `node_modules/next/dist/docs/` before using a Next API.
- Verify a package's version and maintenance status before adding it.
