import "server-only";
import { Types } from "mongoose";
import Course from "@/features/courses/models/course";
import Section from "@/features/courses/models/section";
import Lesson from "@/features/courses/models/lesson";
import Quiz from "@/features/quizzes/models/quiz";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import LessonProgress from "@/features/progress/models/lesson-progress";
import CourseProgress from "@/features/progress/models/course-progress";

export const COMPLETE_RATIO = 0.9;

const id = (value) => String(value);

const bestAttempts = async (userId, quizIds) => {
  const attempts = await QuizAttempt.find({ userId, quizId: { $in: quizIds }, status: { $ne: "in_progress" } }, "quizId percent passed").lean();
  const byQuiz = new Map();
  attempts.forEach((a) => {
    const current = byQuiz.get(id(a.quizId)) ?? { count: 0, best: null, passed: false };
    current.count += 1;
    current.passed ||= Boolean(a.passed);
    current.best = Math.max(current.best ?? 0, a.percent ?? 0);
    byQuiz.set(id(a.quizId), current);
  });
  return byQuiz;
};

export const buildOutline = async (userId, courseId) => {
  const course = await Course.findById(courseId).lean();
  if (!course) return null;
  const [sections, lessons, quizzes, progress] = await Promise.all([
    Section.find({ courseId }, "title order").sort({ order: 1 }).lean(),
    Lesson.find({ courseId, status: "published" }, "sectionId title order durationSec isFreePreview video.provider video.status attachments description").sort({ order: 1 }).lean(),
    Quiz.find({ courseId, status: "published" }, "sectionId lessonId title order passingPercent maxAttempts timeLimitSec requiredForCertificate").sort({ order: 1 }).lean(),
    LessonProgress.find({ userId, courseId }, "lessonId percent lastPosition completedAt").lean(),
  ]);
  const attempts = await bestAttempts(userId, quizzes.map((q) => q._id));
  const progressBy = new Map(progress.map((p) => [id(p.lessonId), p]));

  let previousDone = true;
  const outline = sections
    .map((section) => {
      const sectionLessons = lessons
        .filter((l) => id(l.sectionId) === id(section._id))
        .map((l) => {
          const p = progressBy.get(id(l._id));
          const completed = Boolean(p?.completedAt);
          const locked = course.sequentialUnlock && !previousDone;
          previousDone = completed;
          return {
            id: id(l._id),
            title: l.title,
            durationSec: l.durationSec,
            hasVideo: l.video?.status === "ready",
            provider: l.video?.provider,
            percent: Math.round((p?.percent ?? 0) * 100),
            lastPosition: p?.lastPosition ?? 0,
            status: completed ? "completed" : locked ? "locked" : p ? "in_progress" : "available",
          };
        });
      const quizState = (q, unlocked) => {
        const a = attempts.get(id(q._id));
        const exhausted = q.maxAttempts && (a?.count ?? 0) >= q.maxAttempts;
        const status = a?.passed ? "passed" : !unlocked ? "locked" : exhausted ? "failed" : a ? "retry" : "available";
        return { id: id(q._id), title: q.title, required: q.requiredForCertificate, attempts: a?.count ?? 0, best: a?.best ?? null, maxAttempts: q.maxAttempts, status };
      };
      sectionLessons.forEach((lesson) => {
        const quiz = quizzes.find((q) => id(q.lessonId) === lesson.id);
        if (quiz) lesson.quiz = quizState(quiz, lesson.status === "completed");
      });
      const sectionDone = sectionLessons.every((l) => l.status === "completed");
      const sectionQuizzes = quizzes.filter((q) => !q.lessonId && id(q.sectionId) === id(section._id)).map((q) => quizState(q, !course.sequentialUnlock || sectionDone));
      return { id: id(section._id), title: section.title, lessons: sectionLessons, quizzes: sectionQuizzes };
    })
    .filter((s) => s.lessons.length || s.quizzes.length);

  const flatLessons = outline.flatMap((s) => s.lessons);
  const allQuizzes = outline.flatMap((s) => [...s.quizzes, ...s.lessons.map((l) => l.quiz).filter(Boolean)]);
  const completed = flatLessons.filter((l) => l.status === "completed").length;
  const required = allQuizzes.filter((q) => q.required);
  const passedRequired = required.filter((q) => q.status === "passed").length;
  const percent = flatLessons.length ? Math.round((completed / flatLessons.length) * 100) : 0;
  const rule = course.certificateRule ?? { type: "all", percent: 100, requireQuizzes: true };
  const lessonsOk = rule.type === "percent" ? percent >= rule.percent : completed === flatLessons.length;
  const quizzesOk = !rule.requireQuizzes || passedRequired === required.length;

  return {
    course,
    outline,
    stats: {
      completedLessons: completed,
      totalLessons: flatLessons.length,
      passedRequiredQuizzes: passedRequired,
      totalRequiredQuizzes: required.length,
      percent,
      eligible: flatLessons.length > 0 && lessonsOk && quizzesOk,
      missing: {
        lessons: rule.type === "percent" ? Math.max(0, Math.ceil((rule.percent / 100) * flatLessons.length) - completed) : flatLessons.length - completed,
        quizzes: rule.requireQuizzes ? required.filter((q) => q.status !== "passed").map((q) => ({ quizId: q.id, title: q.title })) : [],
      },
    },
  };
};

export const recomputeProgress = async (userId, courseId) => {
  const result = await buildOutline(userId, courseId);
  if (!result) return null;
  const { stats, course } = result;
  await CourseProgress.updateOne(
    { userId, courseId },
    {
      $set: {
        completedLessons: stats.completedLessons,
        totalLessons: stats.totalLessons,
        passedRequiredQuizzes: stats.passedRequiredQuizzes,
        totalRequiredQuizzes: stats.totalRequiredQuizzes,
        percent: stats.percent,
        eligible: stats.eligible,
        missing: stats.missing,
        contentVersion: course.contentVersion,
      },
    },
    { upsert: true },
  );
  return result;
};

export const findLessonInOutline = (outline, lessonId) => {
  const flat = outline.flatMap((s) => s.lessons.map((l) => ({ ...l, sectionTitle: s.title })));
  const index = flat.findIndex((l) => l.id === lessonId);
  return index < 0 ? null : { lesson: flat[index], prev: flat[index - 1] ?? null, next: flat[index + 1] ?? null, index, total: flat.length };
};

export const toObjectId = (value) => new Types.ObjectId(String(value));
