import "server-only";
import Lesson from "@/features/courses/models/lesson";
import { recomputeCourse } from "@/features/courses/recompute";
import { deleteVideo, fetchUploadState, muxEnabled } from "@/features/video/mux";

export const syncLessonVideo = async (lesson) => {
  const { uploadId, status: current } = lesson.upload ?? {};
  if (!muxEnabled || !uploadId || current === "failed") return { status: current ?? lesson.video?.status };
  const { status, durationSec, ...video } = await fetchUploadState(uploadId);
  const match = { _id: lesson._id, "upload.uploadId": uploadId };
  if (status !== "ready") {
    await Lesson.updateOne(match, { $set: { "upload.status": status } });
    return { status };
  }
  const { modifiedCount } = await Lesson.updateOne(match, { $set: { video: { provider: "mux", uploadId, status, ...video }, ...(durationSec && { durationSec }) }, $unset: { upload: 1 } });
  if (!modifiedCount) return { status };
  await deleteVideo(lesson.video);
  await recomputeCourse(lesson.courseId);
  return { status };
};
