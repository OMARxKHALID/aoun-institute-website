# Aoun Institute LMS

Course-selling website and learning platform. Students register, buy recorded courses (manual payments in PKR), watch protected video lessons, take server-graded quizzes, track progress and earn certificates that anyone can verify. The owner runs everything from the admin panel.

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, MongoDB (Mongoose + Better Auth), Cloudinary, Mux, Resend. Full design notes live in [architecture.md](architecture.md).

## Quick start (local)

```bash
bun install
cp .env.example .env.local
bun run seed
bun dev
```

- `MONGODB_URI` points at MongoDB Atlas. Use a separate database for demos (a name ending in `-demo`, e.g. `.../aoun-institute-demo`) so the live data is never touched.
- `bun run seed` creates the admin and a test student from the `SEED_*` variables, the default site settings and a demo course. It is safe to run again.
- Open http://localhost:3000. Admins land on `/admin`, students on `/dashboard`.

## Demo data

```bash
bun run demo
```

Resets courses, orders, progress and students, then loads a realistic demo: 8 courses (7 published, 1 draft, 1 free) with playable sample videos, quizzes, 24 students from Pakistan, the UK, France, Italy, the UAE and 10 more countries, paid/pending/failed/refunded orders over six months, progress, quiz results (including written answers), certificates, course reviews, lesson Q&A with instructor answers, timestamped notes, study plans, an admin activity log, announcements, contact messages, coupons (active, course-specific and expired), assignments with graded and ungraded submissions, student notifications and home page testimonials. Every account except `SEED_ADMIN_EMAIL` and `SEED_STUDENT_EMAIL` is removed and recreated.

- Admin: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
- Showcase student: `SEED_STUDENT_EMAIL` / `SEED_STUDENT_PASSWORD` (one finished course with certificate, one half done, one just started, a free course, a pending payment, a graded assignment and unread notifications)
- Teacher: `sara.ahmed@demo.pk`, password `DEMO_STUDENT_PASSWORD` (default `demo1234`), assigned to every course
- Other students: any `*@demo.pk` address, e.g. `ayesha.khan@demo.pk`, password `DEMO_STUDENT_PASSWORD` (default `demo1234`)

Every course starts with a 1-minute intro lesson, so you can show a lesson completing and its quiz unlocking live. Sample videos are public test streams; the course artwork lives in `public/demo/`.

Demo payments: set `DEMO_PAYMENTS=true` and the checkout shows a **Card** tab. Pay with `4242 4242 4242 4242`, any future expiry and any CVC to enroll instantly (`4000 0000 0000 0002` shows a declined card). No money moves. Keep it off for real customers.

The script wipes and reloads the database in `MONGODB_URI`, so it only runs when the database name ends in `-demo` (e.g. `aoun-institute-demo`). It refuses any other database unless you pass `bun run demo -- --force`.

## Environment

Every variable is documented in `.env.example`. The site runs without the optional services; their features show a notice until keys are added.

| Service | Needed for | Without it |
|---|---|---|
| MongoDB | everything | site settings fall back to defaults in dev |
| Better Auth secret + URL | sign in | required |
| Resend | emails | emails print to the server console |
| Cloudinary | logos, thumbnails, PDFs, avatars, payment receipts | upload boxes show a notice; run `bun run cloudinary:presets` once after adding keys, or uploads fail with "Upload preset not found" |
| Mux | protected video uploads | use YouTube/Vimeo or direct video links per lesson |
| Google OAuth | "Continue with Google" | button hidden |

## How the owner uses it

1. **Site Settings**: brand, contact details, homepage sections, SEO and payment details (bank account, JazzCash/Easypaisa).
2. **Courses → New course**: details, price, thumbnail. In the **Syllabus** tab add sections and lessons, drag to reorder, publish lessons, mark free previews.
3. **Click a lesson** to open its page: upload the video (Mux), or paste a YouTube/Vimeo/direct link, and edit description, duration and attachments. Add a quiz after the lesson from the same page or from the lesson's ⋯ menu.
4. **Quizzes**: add questions (single choice, multiple choice, true/false), set pass mark, attempts, time limit and when answers are shown, then publish. Results show per-question accuracy and export to CSV.
5. **Orders**: students submit a transaction ID and receipt; approve to enroll them, reject with a reason, or refund (removes access).
6. **Students**: see progress, enroll for free, remove access, block or delete accounts.
7. **Certificates** are issued automatically when a student meets the course rule (all lessons or a percentage, plus required quizzes). Admins can also issue, reissue or revoke. Anyone can check one at `/verify`.
8. **Announcements** reach enrolled students on their dashboard and by email (students can turn emails off).

## Video protection: what it does and does not do

- Mux videos use signed playback tokens that expire shortly after the video length, and DRM when `MUX_DRM_CONFIGURATION_ID` is set (paid Mux add-on).
- Every viewer sees a moving watermark with their name, email and a short ID, also in fullscreen.
- A faint tiled watermark covers the whole frame, so cropping cannot remove it.
- The video pauses behind a cover when the window loses focus, the tab is hidden, a screenshot shortcut is pressed (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5) or the page is printed. Right-click, drag-to-save, picture-in-picture and casting are disabled. There is no download button.
- One account can stream on one device at a time; a second device pauses the first.
- Lessons can only be played by enrolled students (or anyone, for free previews), and sequential unlock is enforced on the server.

Honest limits:
- No website can fully block screenshots, screen recorders or phone cameras. The shortcuts above are deterrents a determined user can get around; the watermark makes any leak traceable to the account.
- DRM blacks out screen recordings only where hardware DRM exists (Safari, iOS, Android, Edge on Windows). Desktop Chrome and Firefox use software DRM, which stops downloading but not every screen recorder.
- YouTube/Vimeo embeds and direct links are not protected; use them only for free or low-value content.

## Deploy to Vercel

1. Create a MongoDB Atlas cluster. Under Network Access allow `0.0.0.0/0` (Vercel has no fixed IPs) and copy the connection string with the database name in the path.
2. Push the repo to GitHub and import it in Vercel. The framework is detected as Next.js and Bun is used automatically because of `bun.lock`. No build settings need changing.
3. Add the environment variables from `.env.example` in Vercel → Settings → Environment Variables. Required: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (your Vercel or custom domain, e.g. `https://aoun-institute.vercel.app`). The database must be reachable during the build because the catalog and settings are prerendered.
4. Load data once from your computer: `MONGODB_URI=... bun run seed` (admin and settings only) or `MONGODB_URI=... bun run demo -- --force` (full demo). Then redeploy in Vercel: the course catalog is prerendered at build time, and data written by these scripts does not refresh pages that are already cached.
5. Optional services: Resend (email), Cloudinary (uploads; run `bun run cloudinary:presets` once), Mux (protected video; webhook `https://your-domain/api/webhooks/mux`), Google OAuth (redirect `https://your-domain/api/auth/callback/google`).
6. Redeploy after changing environment variables.

## Before going live

- Change the admin password (the seed one is for development).
- Use MongoDB Atlas and set `BETTER_AUTH_URL` to the real domain (it also sets Mux upload CORS and email links).
- Add Resend with a verified sending domain, Cloudinary keys (then `bun run cloudinary:presets`), and Mux keys plus a webhook at `https://your-domain/api/webhooks/mux`.
- Fill in payment details and legal pages in Site Settings.

## Commands

```bash
bun dev
bun run build
bun run start
bun run seed
bun run demo
bun run cloudinary:presets
```
