import mongoose from "mongoose";
import { MongoClient, ObjectId } from "mongodb";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { ac, roles } from "../lib/permissions.js";
import { defaultSiteSettings } from "../features/site-settings/defaults.js";
import { ANNOUNCEMENTS, CITIES, CONTACT_MESSAGES, COURSES, STREAMS, STUDENTS } from "./demo-data.js";

const required = ["MONGODB_URI", "BETTER_AUTH_SECRET", "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD", "SEED_STUDENT_EMAIL", "SEED_STUDENT_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing env: ${missing.join(", ")}. Fill .env.local first.`);
  process.exit(1);
}

const host = new URL(process.env.MONGODB_URI.replace(/^mongodb(\+srv)?:\/\//, "http://")).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(host) && !process.argv.includes("--force")) {
  console.error(`Refusing to reset "${host}". The demo script wipes courses, orders and students. Run with --force only on a demo database.`);
  process.exit(1);
}

const DEMO_PASSWORD = process.env.DEMO_STUDENT_PASSWORD || "demo1234";
const DAY = 86400000;
const NOW = Date.now();

let seed = 20261014;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (list) => list[Math.floor(random() * list.length)];
const between = (min, max) => Math.floor(min + random() * (max - min + 1));
const daysAgo = (days, hour = between(9, 22)) => {
  const date = new Date(NOW - days * DAY);
  date.setHours(hour, between(0, 59), 0, 0);
  return date;
};
const dayKey = (date) => date.toISOString().slice(0, 10);
const CODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const certCode = (date) => `INST-${date.getFullYear()}-${Array.from({ length: 8 }, () => CODE[Math.floor(random() * CODE.length)]).join("")}`;

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
mongoose.connection.setClient(client);
const db = client.db();
const col = (name) => db.collection(name);

const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: { enabled: true },
  plugins: [admin({ ac, roles, defaultRole: "STUDENT", adminRoles: ["ADMIN"] })],
});

console.log("resetting demo data…");
const wipe = ["courses", "sections", "lessons", "quizzes", "questions", "quizattempts", "enrollments", "orders", "paymentEvents", "lessonProgress", "courseProgress", "activityLogs", "certificates", "announcements", "playbackSessions", "contactMessages", "rateLimit", "rateLimits"];
await Promise.all(wipe.map((name) => col(name).deleteMany({})));
const oldUsers = await col("user").find({ role: { $ne: "ADMIN" } }, { projection: { _id: 1 } }).toArray();
const oldIds = oldUsers.map((u) => u._id);
await Promise.all([col("account").deleteMany({ userId: { $in: oldIds } }), col("session").deleteMany({ userId: { $in: oldIds } }), col("user").deleteMany({ _id: { $in: oldIds } })]);

const createUser = async ({ email, password, name, role = "STUDENT", joined, extra = {} }) => {
  if (!(await col("user").findOne({ email }))) await auth.api.signUpEmail({ body: { email, password, name } });
  await col("user").updateOne({ email }, { $set: { role, emailVerified: true, name, ...(joined && { createdAt: joined }), ...extra } });
  const user = await col("user").findOne({ email });
  return { id: String(user._id), name, email };
};

const adminUser = await createUser({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, name: "Aoun", role: "ADMIN" });
const testStudent = await createUser({
  email: process.env.SEED_STUDENT_EMAIL,
  password: process.env.SEED_STUDENT_PASSWORD,
  name: "Test Student",
  joined: daysAgo(120),
  extra: { phone: "+92 300 1234567", city: "Lahore", country: "Pakistan", bio: "Aspiring full-stack developer." },
});
const students = [];
for (const [i, name] of STUDENTS.entries()) {
  const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@demo.pk`;
  students.push(await createUser({ email, password: DEMO_PASSWORD, name, joined: daysAgo(between(3, 175)), extra: { city: CITIES[i % CITIES.length], country: "Pakistan" } }));
}
console.log(`users: admin, test student, ${students.length} demo students`);

await col("siteSettings").updateOne(
  { _id: "site" },
  {
    $set: {
      ...defaultSiteSettings,
      payment: {
        ...defaultSiteSettings.payment,
        bank: { bankName: "Meezan Bank", accountTitle: "Aoun Institute (Demo)", accountNumber: "0101 0000 1234 5678", iban: "PK00 MEZN 0001 0100 0012 3456" },
        wallets: [
          { name: "JazzCash", accountTitle: "Aoun Institute", number: "0300 0000000" },
          { name: "Easypaisa", accountTitle: "Aoun Institute", number: "0345 0000000" },
        ],
      },
    },
  },
  { upsert: true },
);

const built = [];
const streamCycle = ["a", "b", "c"];
for (const [ci, data] of COURSES.entries()) {
  const courseId = new ObjectId();
  const created = daysAgo(200 - ci * 10);
  const sections = [];
  const lessons = [];
  data.sections.forEach((section, si) => {
    const sectionId = new ObjectId();
    sections.push({ _id: sectionId, courseId, title: section.title, order: si, createdAt: created, updatedAt: created });
    section.lessons.forEach((title, li) => {
      const first = si === 0 && li === 0;
      const stream = first ? STREAMS.intro : STREAMS[streamCycle[(si + li + ci) % 3]];
      lessons.push({
        _id: new ObjectId(),
        courseId,
        sectionId,
        title,
        order: li,
        description: first ? `Start here: what you will build in ${data.title} and how to get the most out of it.` : `In this lesson you will learn ${title.toLowerCase()} with a worked example and a short exercise.`,
        isFreePreview: first || (si === 0 && li === 1),
        durationSec: stream.durationSec,
        status: "published",
        video: { provider: "url", src: stream.src, status: "ready", drm: false },
        attachments: [],
        createdAt: created,
        updatedAt: created,
      });
    });
  });
  const quizzes = [];
  const questions = [];
  const addQuiz = (title, sectionId, lessonId, list, extra) => {
    const quizId = new ObjectId();
    quizzes.push({
      _id: quizId,
      courseId,
      sectionId,
      lessonId,
      title,
      order: quizzes.length,
      passingPercent: 60,
      maxAttempts: 3,
      timeLimitSec: extra?.timeLimitSec ?? null,
      shuffleQuestions: false,
      shuffleOptions: true,
      showAnswers: "always",
      displayMode: extra?.displayMode ?? "all",
      requiredForCertificate: true,
      status: "published",
      createdAt: created,
      updatedAt: created,
    });
    list.forEach((question, order) => questions.push({ ...question, _id: new ObjectId(), quizId, order, options: question.options.map((o) => ({ ...o, _id: new ObjectId() })), createdAt: created, updatedAt: created }));
    return quizId;
  };
  if (data.lessonQuiz) addQuiz(`${data.sections[0].lessons[0]} — quick check`, sections[0]._id, lessons[0]._id, data.lessonQuiz);
  if (data.sectionQuiz) addQuiz(`${data.sections[1].title} quiz`, sections[1]._id, undefined, data.sectionQuiz, { timeLimitSec: 600, displayMode: "one" });
  const course = {
    _id: courseId,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    category: data.category,
    level: data.level,
    thumbnail: { url: `/demo/${data.thumbnail}.svg`, publicId: `demo/${data.thumbnail}`, name: `${data.thumbnail}.svg` },
    price: data.price,
    discountPrice: data.discountPrice ?? null,
    currency: "PKR",
    status: data.status ?? "published",
    outcomes: data.outcomes,
    prerequisites: data.prerequisites,
    estimatedDuration: lessons.reduce((sum, l) => sum + l.durationSec, 0),
    attachments: [],
    sequentialUnlock: true,
    certificateRule: { type: "all", percent: 100, requireQuizzes: true },
    contentVersion: 1,
    createdAt: created,
    updatedAt: created,
  };
  await col("courses").insertOne(course);
  await col("sections").insertMany(sections);
  await col("lessons").insertMany(lessons);
  if (quizzes.length) await col("quizzes").insertMany(quizzes);
  if (questions.length) await col("questions").insertMany(questions);
  built.push({ course, sections, lessons, quizzes, questions });
}
console.log(`courses: ${built.length} (${built.filter((b) => b.course.status === "published").length} published)`);

const byslug = (slug) => built.find((b) => b.course.slug === slug);
const published = built.filter((b) => b.course.status === "published");
const docs = { enrollments: [], orders: [], lessonProgress: [], courseProgress: [], quizattempts: [], certificates: [], activityLogs: [] };
const watch = new Map();
const METHODS = ["Bank transfer", "JazzCash", "Easypaisa"];

const logWatch = (userId, date, seconds) => {
  const key = `${userId}|${dayKey(date)}`;
  watch.set(key, (watch.get(key) ?? 0) + seconds);
};

const lessonsInOrder = (b) => b.sections.flatMap((s) => b.lessons.filter((l) => String(l.sectionId) === String(s._id)).sort((x, y) => x.order - y.order));

const attempt = (user, b, quiz, date, attemptNo, wantPass) => {
  const list = b.questions.filter((q) => String(q.quizId) === String(quiz._id));
  let score = 0;
  let maxScore = 0;
  const answers = list.map((question, i) => {
    const correct = question.options.filter((o) => o.isCorrect).map((o) => o._id);
    const right = wantPass ? !(i === list.length - 1 && random() < 0.35) : i === 0;
    maxScore += question.points;
    if (right) score += question.points;
    return { questionId: question._id, selected: right ? correct : [question.options.find((o) => !o.isCorrect)._id] };
  });
  const percent = Math.round((score / maxScore) * 100);
  const passed = percent >= quiz.passingPercent;
  docs.quizattempts.push({
    _id: new ObjectId(),
    userId: user.id,
    quizId: quiz._id,
    courseId: b.course._id,
    attemptNo,
    questionOrder: list.map((q) => q._id),
    optionOrder: Object.fromEntries(list.map((q) => [String(q._id), q.options.map((o) => o._id)])),
    answers,
    startedAt: new Date(date.getTime() - between(3, 9) * 60000),
    submittedAt: date,
    score,
    maxScore,
    percent,
    passed,
    status: "submitted",
    createdAt: date,
    updatedAt: date,
  });
  docs.activityLogs.push({ userId: user.id, courseId: b.course._id, type: "quiz_submitted", refId: quiz._id, meta: { percent, passed }, createdAt: date });
  return passed;
};

const enroll = ({ user, b, daysBack, completed, method = pick(METHODS), source, takeQuizzes = true }) => {
  const enrolledAt = daysAgo(daysBack);
  const orderId = new ObjectId();
  const paid = (b.course.discountPrice ?? b.course.price) > 0;
  if (paid && source !== "manual") {
    docs.orders.push({
      _id: orderId,
      userId: user.id,
      courseId: b.course._id,
      amount: b.course.discountPrice ?? b.course.price,
      currency: "PKR",
      provider: "manual",
      method,
      status: "PAID",
      providerRef: `manual:TXN${between(10000000, 99999999)}`,
      reviewedBy: adminUser.id,
      paidAt: enrolledAt,
      createdAt: new Date(enrolledAt.getTime() - between(1, 20) * 3600000),
      updatedAt: enrolledAt,
    });
  }
  docs.enrollments.push({ userId: user.id, courseId: b.course._id, status: "active", source: paid && source !== "manual" ? "order" : "manual", orderId: paid && source !== "manual" ? orderId : undefined, enrolledAt, createdAt: enrolledAt, updatedAt: enrolledAt });
  docs.activityLogs.push({ userId: user.id, courseId: b.course._id, type: "enrolled", refId: orderId, createdAt: enrolledAt });

  const ordered = lessonsInOrder(b);
  const count = Math.min(ordered.length, completed === "all" ? ordered.length : completed);
  const span = Math.max(1, daysBack - 1);
  let last = enrolledAt;
  let time = 0;
  ordered.slice(0, count).forEach((lesson, i) => {
    const done = daysAgo(Math.max(0, daysBack - Math.round(((i + 1) / Math.max(count, 1)) * span)));
    last = done;
    time += lesson.durationSec;
    logWatch(user.id, done, lesson.durationSec);
    docs.lessonProgress.push({ userId: user.id, courseId: b.course._id, lessonId: lesson._id, watchedSeconds: lesson.durationSec, lastPosition: 0, percent: 1, completedAt: done, createdAt: done, updatedAt: done });
    docs.activityLogs.push({ userId: user.id, courseId: b.course._id, type: "lesson_completed", refId: lesson._id, createdAt: done });
  });
  const current = ordered[count];
  if (current && count > 0) {
    const watched = Math.round(current.durationSec * (0.2 + random() * 0.5));
    time += watched;
    logWatch(user.id, daysAgo(between(0, 3)), watched);
    docs.lessonProgress.push({ userId: user.id, courseId: b.course._id, lessonId: current._id, watchedSeconds: watched, lastPosition: watched, percent: watched / current.durationSec, completedAt: null, createdAt: last, updatedAt: last });
  }

  const completedIds = new Set(ordered.slice(0, count).map((l) => String(l._id)));
  let passedRequired = 0;
  b.quizzes.forEach((quiz) => {
    const unlocked = quiz.lessonId ? completedIds.has(String(quiz.lessonId)) : b.lessons.filter((l) => String(l.sectionId) === String(quiz.sectionId)).every((l) => completedIds.has(String(l._id)));
    if (!unlocked || !takeQuizzes) return;
    const date = new Date(last.getTime() + between(1, 5) * 3600000);
    const firstPassed = attempt(user, b, quiz, date, 1, random() > 0.25);
    const passed = firstPassed || attempt(user, b, quiz, new Date(date.getTime() + DAY), 2, true);
    if (passed) passedRequired += 1;
  });

  const eligible = count === ordered.length && passedRequired === b.quizzes.length;
  docs.courseProgress.push({
    userId: user.id,
    courseId: b.course._id,
    completedLessons: count,
    totalLessons: ordered.length,
    passedRequiredQuizzes: passedRequired,
    totalRequiredQuizzes: b.quizzes.length,
    percent: Math.round((count / ordered.length) * 100),
    timeSpentSec: time,
    lastLessonId: (current ?? ordered[count - 1] ?? ordered[0])._id,
    lastPosition: 0,
    lastActiveAt: count ? last : enrolledAt,
    eligible,
    missing: { lessons: ordered.length - count, quizzes: [] },
    contentVersion: 0,
    createdAt: enrolledAt,
    updatedAt: last,
  });
  if (eligible) {
    const issuedAt = new Date(last.getTime() + 2 * 3600000 * 24);
    const cert = { _id: new ObjectId(), code: certCode(issuedAt), userId: user.id, courseId: b.course._id, studentName: user.name, courseTitle: b.course.title, issuedAt, status: "VALID", createdAt: issuedAt, updatedAt: issuedAt };
    docs.certificates.push(cert);
    docs.activityLogs.push({ userId: user.id, courseId: b.course._id, type: "certificate_issued", refId: cert._id, createdAt: issuedAt });
  }
};

enroll({ user: testStudent, b: byslug("full-stack-web-development-nextjs"), daysBack: 95, completed: "all", method: "JazzCash" });
enroll({ user: testStudent, b: byslug("javascript-for-beginners"), daysBack: 40, completed: 3, takeQuizzes: false });
enroll({ user: testStudent, b: byslug("python-for-data-analysis"), daysBack: 6, completed: 0, method: "Bank transfer" });
enroll({ user: testStudent, b: byslug("freelancing-starter-kit"), daysBack: 15, completed: 2 });
for (let d = 0; d < 28; d += 1) if (random() < 0.6) logWatch(testStudent.id, daysAgo(d), between(600, 3600));

students.forEach((user, i) => {
  const count = i < 4 ? 3 : i < 14 ? 2 : 1;
  const chosen = [...published].sort(() => random() - 0.5).slice(0, count);
  chosen.forEach((b) => {
    const total = b.lessons.length;
    const roll = random();
    const completed = roll < 0.3 ? "all" : roll < 0.8 ? between(1, total - 1) : 0;
    enroll({ user, b, daysBack: Math.min(170, Math.round(Math.pow(random(), 1.6) * 170) + 1), completed });
  });
});

const pendingOrder = (user, b, hoursAgo, method) =>
  docs.orders.push({
    _id: new ObjectId(),
    userId: user.id,
    courseId: b.course._id,
    amount: b.course.discountPrice ?? b.course.price,
    currency: "PKR",
    provider: "manual",
    method,
    status: "PENDING",
    providerRef: `manual:TXN${between(10000000, 99999999)}`,
    note: method === "Bank transfer" ? "Paid from my father's account" : undefined,
    createdAt: new Date(NOW - hoursAgo * 3600000),
    updatedAt: new Date(NOW - hoursAgo * 3600000),
  });

pendingOrder(testStudent, byslug("machine-learning-with-python"), 5, "Easypaisa");
pendingOrder(students[20], byslug("full-stack-web-development-nextjs"), 2, "Bank transfer");
pendingOrder(students[21], byslug("ui-ux-design-with-figma"), 9, "JazzCash");
pendingOrder(students[22], byslug("flutter-mobile-app-development"), 20, "Easypaisa");

const failed = byslug("python-for-data-analysis");
docs.orders.push({ _id: new ObjectId(), userId: students[23].id, courseId: failed.course._id, amount: failed.course.discountPrice, currency: "PKR", provider: "manual", method: "JazzCash", status: "FAILED", providerRef: "manual:TXN00000000", note: "Transaction ID not found in our JazzCash statement", reviewedBy: adminUser.id, createdAt: daysAgo(4), updatedAt: daysAgo(3) });

const refunded = byslug("flutter-mobile-app-development");
const refundOrderId = new ObjectId();
docs.orders.push({ _id: refundOrderId, userId: students[19].id, courseId: refunded.course._id, amount: refunded.course.discountPrice, currency: "PKR", provider: "manual", method: "Bank transfer", status: "REFUNDED", providerRef: `manual:TXN${between(10000000, 99999999)}`, note: "Duplicate payment", reviewedBy: adminUser.id, paidAt: daysAgo(30), refundedAt: daysAgo(28), createdAt: daysAgo(31), updatedAt: daysAgo(28) });

const seen = new Set();
docs.enrollments = docs.enrollments.filter((e) => {
  const key = `${e.userId}|${e.courseId}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
const keep = (list) => {
  const used = new Set();
  return list.filter((doc) => {
    const key = `${doc.userId}|${doc.courseId}|${doc.lessonId ?? ""}`;
    if (used.has(key)) return false;
    used.add(key);
    return true;
  });
};
docs.lessonProgress = keep(docs.lessonProgress);
docs.courseProgress = keep(docs.courseProgress);
docs.certificates = keep(docs.certificates);
const attemptKeys = new Set();
docs.quizattempts = docs.quizattempts.filter((a) => {
  const key = `${a.userId}|${a.quizId}|${a.attemptNo}`;
  if (attemptKeys.has(key)) return false;
  attemptKeys.add(key);
  return true;
});

watch.forEach((seconds, key) => {
  const [userId, day] = key.split("|");
  docs.activityLogs.push({ userId, type: "lesson_viewed", meta: { day, seconds }, createdAt: new Date(`${day}T12:00:00Z`) });
});

for (const [name, list] of Object.entries(docs)) if (list.length) await col(name).insertMany(list);

await col("announcements").insertMany(
  ANNOUNCEMENTS.map(([slug, title, body], i) => {
    const date = daysAgo(i * 4 + 1);
    return { courseId: byslug(slug).course._id, authorId: adminUser.id, title, body, createdAt: date, updatedAt: date };
  }),
);
await col("contactMessages").insertMany(
  CONTACT_MESSAGES.map(([name, email, phone, topic, message], i) => {
    const date = daysAgo(i * 2);
    return { name, email, phone, topic, message, status: "new", createdAt: date, updatedAt: date };
  }),
);

const counts = Object.fromEntries(await Promise.all(["enrollments", "orders", "lessonProgress", "quizattempts", "certificates", "announcements"].map(async (name) => [name, await col(name).countDocuments()])));
console.log(counts);
await client.close();
console.log(`
Demo ready.
  Admin:        ${process.env.SEED_ADMIN_EMAIL}
  Test student: ${process.env.SEED_STUDENT_EMAIL}
  Demo students: any *@demo.pk address (e.g. ${students[0].email}) / password ${DEMO_PASSWORD}
Restart the server (or bun dev) so cached pages pick up the new data.`);
