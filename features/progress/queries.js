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
