"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { fail } from "@/lib/validate";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import CourseProgress from "@/features/progress/models/course-progress";
import ActivityLog from "@/features/progress/models/activity-log";
import { COMPLETE_RATIO, recomputeProgress } from "@/features/progress/service";
import { issueCertificateIfEligible } from "@/features/certificates/service";

const MAX_TICK = 40;

const loadForUser = async (user, lessonId) => {
  if (!isValidObjectId(lessonId)) return null;
  await connectDB();
  const lesson = await Lesson.findOne({ _id: lessonId, status: "published" }, "courseId durationSec video.provider").lean();
  if (!lesson) return null;
  const enrolled = await Enrollment.exists({ userId: user.id, courseId: lesson.courseId, status: "active" });
  return enrolled ? lesson : null;
};

const complete = async (user, lesson) => {
  const updated = await LessonProgress.findOneAndUpdate(
    { userId: user.id, lessonId: lesson._id, completedAt: null },
    { $set: { completedAt: new Date(), percent: 1 }, $setOnInsert: { courseId: lesson.courseId } },
    { upsert: true, new: false },
  ).catch((error) => (error?.code === 11000 ? "exists" : Promise.reject(error)));
  if (updated === "exists") return false;
  await ActivityLog.create({ userId: user.id, courseId: lesson.courseId, type: "lesson_completed", refId: lesson._id });
  const result = await recomputeProgress(user.id, lesson.courseId);
  if (result?.stats.eligible) await issueCertificateIfEligible(user, lesson.courseId, result);
  return true;
};

export const saveProgress = async (lessonId, input) => {
  const user = await requireUser();
  const lesson = await loadForUser(user, lessonId);
  if (!lesson) return fail("Lesson not available");
  const position = Math.max(0, Number(input?.position) || 0);
  const previous = await LessonProgress.findOne({ userId: user.id, lessonId: lesson._id }, "updatedAt").lean();
  const elapsed = previous ? (Date.now() - new Date(previous.updatedAt).getTime()) / 1000 + 2 : MAX_TICK;
  const watched = Math.min(MAX_TICK, elapsed, Math.max(0, Number(input?.watched) || 0));
  const duration = lesson.durationSec || Math.max(0, Number(input?.duration) || 0);
  const doc = await LessonProgress.findOneAndUpdate(
    { userId: user.id, lessonId: lesson._id },
    { $set: { lastPosition: position }, $inc: { watchedSeconds: watched }, $setOnInsert: { courseId: lesson.courseId } },
    { upsert: true, new: true },
  );
  const percent = duration ? Math.min(1, doc.watchedSeconds / duration) : 0;
  await Promise.all([
    LessonProgress.updateOne({ _id: doc._id, completedAt: null }, { $set: { percent } }),
    watched > 0 &&
      ActivityLog.updateOne(
        { userId: user.id, type: "lesson_viewed", "meta.day": new Date().toISOString().slice(0, 10) },
        { $inc: { "meta.seconds": watched }, $set: { courseId: lesson.courseId, refId: lesson._id } },
        { upsert: true },
      ),
    CourseProgress.updateOne(
      { userId: user.id, courseId: lesson.courseId },
      { $set: { lastLessonId: lesson._id, lastPosition: position, lastActiveAt: new Date() }, $inc: { timeSpentSec: watched } },
      { upsert: true },
    ),
  ]);
  const completed = !doc.completedAt && percent >= COMPLETE_RATIO ? await complete(user, lesson) : false;
  return { ok: true, data: { completed, percent: Math.round(percent * 100) } };
};

export const markLessonComplete = async (lessonId) => {
  const user = await requireUser();
  const lesson = await loadForUser(user, lessonId);
  if (!lesson) return fail("Lesson not available");
  const trackable = lesson.video?.provider === "mux" || lesson.video?.provider === "url";
  if (trackable) {
    const doc = await LessonProgress.findOne({ userId: user.id, lessonId: lesson._id }, "watchedSeconds completedAt").lean();
    if (doc?.completedAt) return { ok: true };
    if (!lesson.durationSec || (doc?.watchedSeconds ?? 0) < lesson.durationSec * COMPLETE_RATIO) return fail(`Watch at least ${COMPLETE_RATIO * 100}% of the video to complete this lesson`);
  }
  await complete(user, lesson);
  return { ok: true };
};
