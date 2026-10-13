import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { ac, roles } from "../lib/permissions.js";
import { defaultSiteSettings } from "../features/site-settings/defaults.js";
import SiteSettings from "../features/site-settings/model.js";
import Course from "../features/courses/models/course.js";
import Section from "../features/courses/models/section.js";
import Lesson from "../features/courses/models/lesson.js";
import Quiz from "../features/quizzes/models/quiz.js";
import Question from "../features/quizzes/models/question.js";
import QuizAttempt from "../features/quizzes/models/quiz-attempt.js";
import Enrollment from "../features/enrollments/model.js";
import Order from "../features/payments/models/order.js";
import PaymentEvent from "../features/payments/models/payment-event.js";
import LessonProgress from "../features/progress/models/lesson-progress.js";
import CourseProgress from "../features/progress/models/course-progress.js";
import ActivityLog from "../features/progress/models/activity-log.js";
import Certificate from "../features/certificates/model.js";
import Announcement from "../features/announcements/model.js";
import PlaybackSession from "../features/video/playback-session.js";
import ContactMessage from "../features/contact/model.js";

const required = ["MONGODB_URI", "BETTER_AUTH_SECRET", "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing env: ${missing.join(", ")}. Fill .env.local first.`);
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
mongoose.connection.setClient(client);
const db = client.db();

const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: { enabled: true },
  plugins: [admin({ ac, roles, defaultRole: "STUDENT", adminRoles: ["ADMIN"] })],
});

const models = [SiteSettings, Course, Section, Lesson, Quiz, Question, QuizAttempt, Enrollment, Order, PaymentEvent, LessonProgress, CourseProgress, ActivityLog, Certificate, Announcement, PlaybackSession, ContactMessage];
await Promise.all(models.map((m) => m.createIndexes()));
console.log(`indexes ensured on ${models.length} collections`);

const ensureUser = async ({ email, password, name, role }) => {
  const users = db.collection("user");
  if (!(await users.findOne({ email }))) {
    await auth.api.signUpEmail({ body: { email, password, name } });
    console.log(`created ${role.toLowerCase()} ${email}`);
  } else {
    console.log(`${role.toLowerCase()} ${email} exists`);
  }
  await users.updateOne({ email }, { $set: { role, emailVerified: true } });
};

await ensureUser({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, name: "Institute Owner", role: "ADMIN" });
if (process.env.SEED_STUDENT_EMAIL && process.env.SEED_STUDENT_PASSWORD) {
  await ensureUser({ email: process.env.SEED_STUDENT_EMAIL, password: process.env.SEED_STUDENT_PASSWORD, name: "Test Student", role: "STUDENT" });
}

if (!(await SiteSettings.exists({ _id: "site" }))) {
  await SiteSettings.create({ _id: "site", ...defaultSiteSettings });
  console.log("created default site settings");
}

const slug = "javascript-for-beginners";
if (!(await Course.exists({ slug }))) {
  const course = await Course.create({
    slug,
    title: "JavaScript for Beginners",
    subtitle: "From zero to building interactive web pages",
    description: "Learn JavaScript step by step with short videos, hands-on exercises, and quizzes after every section.",
    category: "Development",
    level: "Beginner",
    price: 4999,
    discountPrice: 2999,
    status: "published",
    outcomes: ["Write modern JavaScript with confidence", "Manipulate the DOM and handle events", "Build two small projects"],
    prerequisites: ["Basic computer skills", "Any modern browser"],
    sequentialUnlock: true,
    certificateRule: { type: "all", percent: 100, requireQuizzes: true },
  });
  const outline = [
    { title: "Getting Started", lessons: [{ title: "What is JavaScript?", durationSec: 420, isFreePreview: true }, { title: "Variables and Types", durationSec: 780 }] },
    { title: "Working with the Page", lessons: [{ title: "Selecting Elements", durationSec: 660 }, { title: "Events and Listeners", durationSec: 900 }] },
  ];
  const sections = await Promise.all(outline.map((s, order) => Section.create({ courseId: course._id, title: s.title, order })));
  await Promise.all(
    outline.flatMap((s, si) =>
      s.lessons.map((lesson, order) => Lesson.create({ courseId: course._id, sectionId: sections[si]._id, order, status: "published", description: `${lesson.title} explained with examples.`, ...lesson })),
    ),
  );
  const quiz = await Quiz.create({ courseId: course._id, sectionId: sections[0]._id, title: "Basics Check", order: 99, passingPercent: 60, maxAttempts: 3, timeLimitSec: 600, status: "published" });
  await Question.insertMany([
    { quizId: quiz._id, order: 0, type: "single", prompt: "Which keyword declares a value that cannot be reassigned?", points: 1, explanation: "const creates a binding that cannot be reassigned.", options: [{ text: "var" }, { text: "let" }, { text: "const", isCorrect: true }] },
    { quizId: quiz._id, order: 1, type: "multiple", prompt: "Which of these are primitive types?", points: 2, explanation: "string and number are primitives; objects are not.", options: [{ text: "string", isCorrect: true }, { text: "number", isCorrect: true }, { text: "object" }] },
    { quizId: quiz._id, order: 2, type: "true_false", prompt: "JavaScript runs only in the browser.", points: 1, explanation: "It also runs on servers, for example with Node.js or Bun.", options: [{ text: "True" }, { text: "False", isCorrect: true }] },
  ]);
  await Course.updateOne({ _id: course._id }, { estimatedDuration: outline.flatMap((s) => s.lessons).reduce((sum, l) => sum + l.durationSec, 0) });
  console.log(`created demo course "${course.title}" with ${sections.length} sections and a quiz`);
}

await client.close();
console.log("seed complete");
