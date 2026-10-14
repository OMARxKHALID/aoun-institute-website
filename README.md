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

- With `MONGODB_URI=mongodb://127.0.0.1:27018/aoun-institute?replicaSet=rs0`, `bun dev` starts a local MongoDB replica set (data in `.mongo-data/`) together with Next.js and restarts it if it stops. With an Atlas URI it just runs Next.js. `bun run db` starts the database on its own (needed once before `bun run seed` or `bun run demo`).
- `bun run seed` creates the admin and a test student from the `SEED_*` variables, the default site settings and a demo course. It is safe to run again.
- Open http://localhost:3000. Admins land on `/admin`, students on `/dashboard`.

## Demo data

```bash
bun run demo
```

Resets courses, orders, progress and students, then loads a realistic demo: 8 courses (7 published, 1 draft, 1 free) with playable sample videos, quizzes, 24 students in Pakistani cities, paid/pending/failed/refunded orders over six months, progress, quiz results, 15 certificates, announcements and contact messages. The admin account is kept.

- Admin: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
- Showcase student: `SEED_STUDENT_EMAIL` / `SEED_STUDENT_PASSWORD` (one finished course with certificate, one half done, one just started, a free course and a pending payment)
- Other students: any `*@demo.pk` address, e.g. `ayesha.khan@demo.pk`, password `DEMO_STUDENT_PASSWORD` (default `demo1234`)

Every course starts with a 1-minute intro lesson, so you can show a lesson completing and its quiz unlocking live. Sample videos are public test streams; the course artwork lives in `public/demo/`.

The script only runs against a local database. To load the demo into a hosted database, run `bun run demo -- --force` with that `MONGODB_URI`.

## Environment

Every variable is documented in `.env.example`. The site runs without the optional services; their features show a notice until keys are added.

| Service | Needed for | Without it |
|---|---|---|
| MongoDB | everything | site settings fall back to defaults in dev |
| Better Auth secret + URL | sign in | required |
| Resend | emails | emails print to the server console |
| Cloudinary | logos, thumbnails, PDFs, avatars, payment receipts | upload buttons show a notice; run `bun run cloudinary:presets` once after adding keys |
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
- One account can stream on one device at a time; a second device pauses the first.
- Lessons can only be played by enrolled students (or anyone, for free previews), and sequential unlock is enforced on the server.

Honest limits:
- No website can block screenshots or phone cameras. The watermark makes leaks traceable.
- DRM blacks out screen recordings only where hardware DRM exists (Safari, iOS, Android, Edge on Windows). Desktop Chrome and Firefox use software DRM, which stops downloading but not every screen recorder.
- YouTube/Vimeo embeds and direct links are not protected; use them only for free or low-value content.

## Deploy to Vercel

1. Create a MongoDB Atlas cluster. Under Network Access allow `0.0.0.0/0` (Vercel has no fixed IPs) and copy the connection string with the database name in the path.
2. Push the repo to GitHub and import it in Vercel. The framework is detected as Next.js and Bun is used automatically because of `bun.lock`. No build settings need changing.
3. Add the environment variables from `.env.example` in Vercel → Settings → Environment Variables. Required: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (your Vercel or custom domain, e.g. `https://aoun-institute.vercel.app`). The database must be reachable during the build because the catalog and settings are prerendered.
4. Load data once from your computer: `MONGODB_URI=... bun run seed` (admin and settings only) or `MONGODB_URI=... bun run demo -- --force` (full demo).
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
bun run db
bun run cloudinary:presets
```
