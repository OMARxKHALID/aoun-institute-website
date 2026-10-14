"use server";

import { updateTag } from "next/cache";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import Lesson from "@/features/courses/models/lesson";
import PlaybackSession from "@/features/video/playback-session";
import { createDirectUpload, deleteVideo, muxEnabled } from "@/features/video/mux";
import { syncLessonVideo } from "@/features/video/sync";
import { deviceIdSchema, videoLinkSchema } from "@/features/video/schemas";

const loadLesson = async (lessonId) => {
  if (!isValidObjectId(lessonId)) return null;
  await connectDB();
  return Lesson.findById(lessonId);
};

const invalidate = (lesson) => {
  updateTag("catalog");
  updateTag(`course:${lesson.courseId}`);
};

export const startVideoUpload = async (lessonId) => {
  await requireAdmin();
  if (!muxEnabled) return fail("Mux is not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to the environment.");
  const lesson = await loadLesson(lessonId);
  if (!lesson) return fail("Lesson not found");
  const upload = await createDirectUpload(String(lesson._id));
  await deleteVideo(lesson.video);
  await Lesson.updateOne({ _id: lesson._id }, { $set: { video: { provider: "mux", uploadId: upload.id, status: "uploading" } } });
  invalidate(lesson);
  return { ok: true, data: { url: upload.url } };
};

export const refreshVideoStatus = async (lessonId) => {
  await requireAdmin();
  const lesson = await loadLesson(lessonId);
  if (!lesson) return fail("Lesson not found");
  const video = await syncLessonVideo(lesson.toObject());
  if (video.status === "ready") invalidate(lesson);
  return { ok: true, data: { status: video.status ?? "none" } };
};

export const setVideoLink = async (lessonId, input) => {
  await requireAdmin();
  const result = parse(videoLinkSchema, input);
  if (!result.ok) return result;
  const lesson = await loadLesson(lessonId);
  if (!lesson) return fail("Lesson not found");
  await deleteVideo(lesson.video);
  await Lesson.updateOne({ _id: lesson._id }, { $set: { video: { ...result.data, status: "ready", drm: false } } });
  invalidate(lesson);
  return { ok: true };
};

export const removeVideo = async (lessonId) => {
  await requireAdmin();
  const lesson = await loadLesson(lessonId);
  if (!lesson) return fail("Lesson not found");
  await deleteVideo(lesson.video);
  await Lesson.updateOne({ _id: lesson._id }, { $set: { video: { status: "none" } } });
  invalidate(lesson);
  return { ok: true };
};

export const claimStream = async (lessonId, deviceId) => {
  const user = await requireUser();
  if (!isValidObjectId(lessonId) || !deviceIdSchema.safeParse(deviceId).success) return fail("Invalid request");
  await connectDB();
  const now = new Date();
  await PlaybackSession.updateOne({ userId: user.id }, { $set: { deviceId, lessonId, startedAt: now, heartbeatAt: now } }, { upsert: true });
  return { ok: true };
};

export const streamHeartbeat = async (lessonId, deviceId) => {
  const user = await requireUser();
  if (!isValidObjectId(lessonId) || !deviceIdSchema.safeParse(deviceId).success) return fail("Invalid request");
  await connectDB();
  const session = await PlaybackSession.findOne({ userId: user.id }, "deviceId").lean();
  if (session && session.deviceId !== deviceId) return { ok: false, errors: { root: ["Your account is playing a video on another device or tab."] } };
  await PlaybackSession.updateOne({ userId: user.id }, { $set: { deviceId, lessonId, heartbeatAt: new Date() } }, { upsert: true });
  return { ok: true };
};
