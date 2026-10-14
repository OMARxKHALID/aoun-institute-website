import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";
import CourseProgress from "@/features/progress/models/course-progress";
import ActivityLog from "@/features/progress/models/activity-log";
import Certificate from "@/features/certificates/model";
import Order from "@/features/payments/models/order";
import Quiz from "@/features/quizzes/models/quiz";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import { buildOutline, findLessonInOutline, recomputeProgress } from "@/features/progress/service";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const getMyCourses = async () => {
  const user = await requireUser();
  await connectDB();
  const enrollments = await Enrollment.find({ userId: user.id, status: "active" }).sort({ enrolledAt: -1 }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const [courses, progress] = await Promise.all([
    Course.find({ _id: { $in: courseIds } }, "title slug subtitle thumbnail category level estimatedDuration contentVersion").lean(),
    CourseProgress.find({ userId: user.id, courseId: { $in: courseIds } }).lean(),
  ]);
  const byCourse = new Map(progress.map((p) => [String(p.courseId), p]));
  const stale = courses.filter((c) => byCourse.get(String(c._id))?.contentVersion !== c.contentVersion);
  const fresh = await Promise.all(stale.map((c) => recomputeProgress(user.id, c._id).then(() => CourseProgress.findOne({ userId: user.id, courseId: c._id }).lean())));
  fresh.forEach((p) => p && byCourse.set(String(p.courseId), p));
  const lastLessons = await Lesson.find({ _id: { $in: [...byCourse.values()].map((p) => p.lastLessonId).filter(Boolean) } }, "title").lean();
  const titles = new Map(lastLessons.map((l) => [String(l._id), l.title]));
  return plain(
    enrollments
      .map((e) => {
        const course = courses.find((c) => String(c._id) === String(e.courseId));
        if (!course) return null;
        const p = byCourse.get(String(course._id));
        return {
          id: String(course._id),
          slug: course.slug,
          title: course.title,
          subtitle: course.subtitle,
          thumbnail: course.thumbnail,
          category: course.category,
          estimatedDuration: course.estimatedDuration,
          enrolledAt: e.enrolledAt,
          percent: p?.percent ?? 0,
          completedLessons: p?.completedLessons ?? 0,
          totalLessons: p?.totalLessons ?? 0,
          timeSpentSec: p?.timeSpentSec ?? 0,
          lastActiveAt: p?.lastActiveAt ?? null,
          lastLesson: p?.lastLessonId ? { id: String(p.lastLessonId), title: titles.get(String(p.lastLessonId)) } : null,
          eligible: p?.eligible ?? false,
        };
      })
      .filter(Boolean),
  );
};

const dayKey = (date) => date.toISOString().slice(0, 10);

export const getStudentOverview = async () => {
  const user = await requireUser();
  const courses = await getMyCourses();
  const since = new Date(Date.now() - 41 * 86400000);
  const [certificates, activity, pendingOrders, watch, outlines] = await Promise.all([
    Certificate.find({ userId: user.id }, "code courseTitle status issuedAt").sort({ issuedAt: -1 }).limit(5).lean(),
    ActivityLog.find({ userId: user.id, type: { $ne: "lesson_viewed" } }).sort({ createdAt: -1 }).limit(6).lean(),
    Order.countDocuments({ userId: user.id, status: "PENDING" }),
    ActivityLog.find({ userId: user.id, type: "lesson_viewed", "meta.day": { $gte: dayKey(since) } }, "meta").lean(),
    Promise.all(courses.map((c) => buildOutline(user.id, c.id))),
  ]);
  const totalWatch = await ActivityLog.aggregate([{ $match: { userId: user.id, type: "lesson_viewed" } }, { $group: { _id: null, seconds: { $sum: "$meta.seconds" } } }]);
  const titles = new Map(courses.map((c) => [c.id, c.title]));
  const seconds = new Map(watch.map((w) => [w.meta.day, w.meta.seconds]));
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000);
    return { day: dayKey(date), label: date.toLocaleDateString("en-GB", { weekday: "short" }), minutes: Math.round((seconds.get(dayKey(date)) ?? 0) / 60) };
  });
  const quizzes = outlines
    .filter(Boolean)
    .flatMap((o) =>
      o.outline
        .flatMap((s) => [...s.quizzes, ...s.lessons.map((l) => l.quiz).filter(Boolean)])
        .filter((q) => q.status === "available" || q.status === "retry")
        .map((q) => ({ ...q, course: o.course.title, slug: o.course.slug })),
    )
    .slice(0, 5);
  return plain({
    user: { name: user.name },
    courses,
    week,
    activeDays: [...seconds.keys()],
    quizzes,
    certificates: certificates.map((c) => ({ code: c.code, courseTitle: c.courseTitle, status: c.status, issuedAt: c.issuedAt })),
    stats: {
      enrolled: courses.length,
      completedCourses: courses.filter((c) => c.totalLessons && c.completedLessons === c.totalLessons).length,
      completedLessons: courses.reduce((sum, c) => sum + c.completedLessons, 0),
      hours: Math.round((Math.max(courses.reduce((sum, c) => sum + c.timeSpentSec, 0), totalWatch[0]?.seconds ?? 0) / 3600) * 10) / 10,
      certificates: certificates.filter((c) => c.status === "VALID").length,
      pendingOrders,
    },
    activity: activity.map((a) => ({ id: String(a._id), type: a.type, course: titles.get(String(a.courseId)), createdAt: a.createdAt })),
  });
};

const loadEnrolledCourse = async (user, slug) => {
  await connectDB();
  const course = await Course.findOne({ slug }, "_id").lean();
  if (!course) return null;
  const enrolled = await Enrollment.exists({ userId: user.id, courseId: course._id, status: "active" });
  return enrolled ? course._id : null;
};

export const getStudentCourse = async (slug) => {
  const user = await requireUser();
  const courseId = await loadEnrolledCourse(user, slug);
  if (!courseId) return null;
  const result = await recomputeProgress(user.id, courseId);
  const progress = await CourseProgress.findOne({ userId: user.id, courseId }, "lastLessonId timeSpentSec").lean();
  const certificate = await Certificate.findOne({ userId: user.id, courseId, status: "VALID" }, "code").lean();
  const lessons = result.outline.flatMap((s) => s.lessons);
  const resume = lessons.find((l) => l.id === String(progress?.lastLessonId) && l.status !== "completed") ?? lessons.find((l) => l.status === "available" || l.status === "in_progress") ?? lessons[0];
  const { course } = result;
  return plain({
    course: { id: String(course._id), slug: course.slug, title: course.title, subtitle: course.subtitle, thumbnail: course.thumbnail, attachments: course.attachments, syllabusFile: course.syllabusFile, sequentialUnlock: course.sequentialUnlock, certificateRule: course.certificateRule },
    outline: result.outline,
    stats: { ...result.stats, timeSpentSec: progress?.timeSpentSec ?? 0 },
    resume: resume ?? null,
    certificate: certificate?.code ?? null,
  });
};

export const getStudentLesson = async (slug, lessonId) => {
  const user = await requireUser();
  if (!isValidObjectId(lessonId)) return null;
  const courseId = await loadEnrolledCourse(user, slug);
  if (!courseId) return null;
  const result = await buildOutline(user.id, courseId);
  const found = findLessonInOutline(result.outline, lessonId);
  if (!found) return null;
  const lesson = await Lesson.findById(lessonId, "description attachments").lean();
  return plain({
    course: { id: String(courseId), slug, title: result.course.title },
    outline: result.outline,
    stats: result.stats,
    ...found,
    lesson: { ...found.lesson, description: lesson?.description ?? "", attachments: lesson?.attachments ?? [] },
  });
};

export const getLearningReport = async () => {
  const user = await requireUser();
  const courses = await getMyCourses();
  const since = new Date(Date.now() - 84 * 86400000);
  const [attempts, watch] = await Promise.all([
    QuizAttempt.find({ userId: user.id, status: { $ne: "in_progress" } }, "quizId courseId percent passed submittedAt attemptNo").sort({ submittedAt: -1 }).limit(50).lean(),
    ActivityLog.find({ userId: user.id, type: "lesson_viewed" }, "meta").lean(),
  ]);
  const quizzes = await Quiz.find({ _id: { $in: attempts.map((a) => a.quizId) } }, "title").lean();
  const quizTitles = new Map(quizzes.map((q) => [String(q._id), q.title]));
  const courseTitles = new Map(courses.map((c) => [c.id, c.title]));
  const seconds = new Map(watch.map((w) => [w.meta.day, w.meta.seconds]));
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const end = new Date(Date.now() - (11 - i) * 7 * 86400000);
    const total = Array.from({ length: 7 }, (_, d) => seconds.get(dayKey(new Date(end.getTime() - d * 86400000))) ?? 0).reduce((a, b) => a + b, 0);
    return { key: dayKey(end), label: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: Math.round(total / 60) };
  });
  let streak = 0;
  for (let d = seconds.has(dayKey(new Date())) ? 0 : 1; seconds.has(dayKey(new Date(Date.now() - d * 86400000))); d += 1) streak += 1;
  const days = [...seconds.keys()].sort();
  let best = 0;
  let run = 0;
  days.forEach((day, i) => {
    run = i && new Date(day) - new Date(days[i - 1]) === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  const bestByQuiz = new Map();
  attempts.forEach((a) => bestByQuiz.set(String(a.quizId), Math.max(bestByQuiz.get(String(a.quizId)) ?? 0, a.percent ?? 0)));
  return plain({
    courses,
    weeks,
    streak,
    bestStreak: best,
    activeDays: days.filter((d) => d >= dayKey(since)).length,
    totals: {
      minutes: Math.round([...seconds.values()].reduce((a, b) => a + b, 0) / 60),
      lessons: courses.reduce((sum, c) => sum + c.completedLessons, 0),
      quizzesPassed: new Set(attempts.filter((a) => a.passed).map((a) => String(a.quizId))).size,
      averageScore: bestByQuiz.size ? Math.round([...bestByQuiz.values()].reduce((a, b) => a + b, 0) / bestByQuiz.size) : null,
    },
    attempts: attempts.slice(0, 10).map((a) => ({ id: String(a._id), quiz: quizTitles.get(String(a.quizId)) ?? "Quiz", course: courseTitles.get(String(a.courseId)) ?? "", percent: a.percent, passed: a.passed, submittedAt: a.submittedAt, attemptNo: a.attemptNo })),
  });
};
