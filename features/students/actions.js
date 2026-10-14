"use server";

import { headers } from "next/headers";
import { Types, isValidObjectId } from "mongoose";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB, db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import CourseProgress from "@/features/progress/models/course-progress";
import ActivityLog from "@/features/progress/models/activity-log";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import PlaybackSession from "@/features/video/playback-session";
import { grantEnrollment } from "@/features/enrollments/enroll";

const banSchema = z.strictObject({ reason: z.string().trim().min(3, { error: "Give a reason" }).max(300) });

const loadStudent = async (userId) => {
  if (!Types.ObjectId.isValid(userId)) return null;
  await connectDB();
  const user = await db.collection("user").findOne({ _id: new Types.ObjectId(userId) }, { projection: { role: 1 } });
  return user && user.role !== "ADMIN" ? user : null;
};

export const banStudent = async (userId, input) => {
  await requireAdmin();
  const result = parse(banSchema, input);
  if (!result.ok) return result;
  if (!(await loadStudent(userId))) return fail("Student not found");
  await auth.api.banUser({ headers: await headers(), body: { userId, banReason: result.data.reason } });
  await PlaybackSession.deleteMany({ userId });
  return { ok: true };
};

export const unbanStudent = async (userId) => {
  await requireAdmin();
  if (!(await loadStudent(userId))) return fail("Student not found");
  await auth.api.unbanUser({ headers: await headers(), body: { userId } });
  return { ok: true };
};

export const enrollStudent = async (userId, courseId) => {
  await requireAdmin();
  if (!(await loadStudent(userId))) return fail("Student not found");
  if (!isValidObjectId(courseId) || !(await Course.exists({ _id: courseId }))) return fail("Choose a course", "courseId");
  await grantEnrollment({ userId, courseId, source: "manual" });
  return { ok: true };
};

export const revokeEnrollment = async (userId, courseId) => {
  await requireAdmin();
  if (!(await loadStudent(userId)) || !isValidObjectId(courseId)) return fail("Enrollment not found");
  await Enrollment.updateOne({ userId, courseId }, { $set: { status: "revoked" } });
  return { ok: true };
};

export const deleteStudent = async (userId) => {
  await requireAdmin();
  if (!(await loadStudent(userId))) return fail("Student not found");
  await Promise.all([
    Enrollment.deleteMany({ userId }),
    LessonProgress.deleteMany({ userId }),
    CourseProgress.deleteMany({ userId }),
    ActivityLog.deleteMany({ userId }),
    QuizAttempt.deleteMany({ userId }),
    PlaybackSession.deleteMany({ userId }),
  ]);
  await auth.api.removeUser({ headers: await headers(), body: { userId } });
  return { ok: true };
};
