import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { canTeach } from "@/features/courses/access";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import { buildOutline } from "@/features/progress/service";
import { muxEnabled, signPlayback } from "@/features/video/mux";
import { dayKey } from "@/lib/format";

const denied = (reason) => ({ ok: false, reason });

const access = async (lesson, user) => {
  if (user && (await canTeach(user, lesson.courseId))) return { enrolled: false };
  const course = await Course.findById(lesson.courseId, "status sequentialUnlock").lean();
  if (!course || lesson.status !== "published") return { reason: "not-found" };
  if (lesson.releaseOn && lesson.releaseOn > dayKey()) return { reason: "scheduled" };
  const enrolled = user && (await Enrollment.exists({ userId: user.id, courseId: lesson.courseId, status: "active" }));
  if (!enrolled) {
    if (course.status !== "published") return { reason: "not-found" };
    return lesson.isFreePreview ? { enrolled: false } : { reason: user ? "locked" : "login" };
  }
  if (course.sequentialUnlock) {
    const result = await buildOutline(user.id, lesson.courseId);
    const target = result?.outline.flatMap((s) => s.lessons).find((l) => l.id === String(lesson._id));
    if (target?.status === "locked") return { reason: "sequence" };
  }
  return { enrolled: true };
};

export const getPlayback = async (lessonId, user) => {
  if (!isValidObjectId(lessonId)) return denied("not-found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId, "courseId title status isFreePreview releaseOn durationSec video").lean();
  if (!lesson) return denied("not-found");
  const { reason, enrolled } = await access(lesson, user);
  if (reason) return denied(reason);
  const progress = enrolled ? await LessonProgress.findOne({ userId: user.id, lessonId }, "lastPosition completedAt").lean() : null;
  const { provider, playbackId, src, status, drm } = lesson.video ?? {};
  const viewer = user && { name: user.name, email: user.email, tag: user.id.slice(-6).toUpperCase() };
  const base = { ok: true, provider, title: lesson.title, viewer, track: Boolean(enrolled), startTime: progress?.completedAt ? 0 : (progress?.lastPosition ?? 0) };
  if (provider === "embed" || provider === "url") return { ...base, src };
  if (provider !== "mux") return denied("no-video");
  if (status !== "ready" || !playbackId) return denied("processing");
  if (!muxEnabled || !process.env.MUX_SIGNING_KEY || !process.env.MUX_PRIVATE_KEY) return denied("unavailable");
  const tokens = await signPlayback(playbackId, lesson.durationSec, drm);
  return { ...base, playbackId, tokens, drm: Boolean(drm) };
};
