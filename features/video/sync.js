import "server-only";
import Lesson from "@/features/courses/models/lesson";
import { recomputeCourse } from "@/features/courses/recompute";
import { fetchUploadState, muxEnabled } from "@/features/video/mux";

export const syncLessonVideo = async (lesson) => {
  const video = lesson.video ?? {};
  if (!muxEnabled || video.provider !== "mux" || !video.uploadId || ["ready", "failed"].includes(video.status)) return video;
  const state = await fetchUploadState(video.uploadId);
  const { durationSec, ...rest } = state;
  const next = { ...video, ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) };
  const ready = state.status === "ready";
  await Lesson.updateOne({ _id: lesson._id, "video.uploadId": video.uploadId }, { $set: { video: next, ...(ready && durationSec && { durationSec }) } });
  if (ready) await recomputeCourse(lesson.courseId);
  return next;
};
