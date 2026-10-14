import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { isAdmin } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";
import { muxEnabled, signPlayback } from "@/features/video/mux";

const denied = (reason) => ({ ok: false, reason });

const canWatch = async (lesson, user) => {
  if (isAdmin(user)) return null;
  const course = await Course.findById(lesson.courseId, "status").lean();
  if (lesson.status !== "published" || course?.status !== "published") return "not-found";
  if (lesson.isFreePreview) return null;
  if (!user) return "login";
  const enrolled = await Enrollment.exists({ userId: user.id, courseId: lesson.courseId, status: "active" });
  return enrolled ? null : "locked";
};

export const getPlayback = async (lessonId, user) => {
  if (!isValidObjectId(lessonId)) return denied("not-found");
  await connectDB();
  const lesson = await Lesson.findById(lessonId, "courseId title status isFreePreview durationSec video").lean();
  if (!lesson) return denied("not-found");
  const reason = await canWatch(lesson, user);
  if (reason) return denied(reason);
  const { provider, playbackId, src, status, drm } = lesson.video ?? {};
  const viewer = user && { name: user.name, email: user.email, tag: user.id.slice(-6).toUpperCase() };
  const base = { ok: true, provider, title: lesson.title, viewer };
  if (provider === "embed" || provider === "url") return { ...base, src };
  if (provider !== "mux") return denied("no-video");
  if (status !== "ready" || !playbackId) return denied("processing");
  if (!muxEnabled || !process.env.MUX_SIGNING_KEY || !process.env.MUX_PRIVATE_KEY) return denied("unavailable");
  const tokens = await signPlayback(playbackId, lesson.durationSec, drm);
  return { ...base, playbackId, tokens, drm: Boolean(drm) };
};
