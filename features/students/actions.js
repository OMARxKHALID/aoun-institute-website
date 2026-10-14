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
import { audit } from "@/features/audit/service";
import Note from "@/features/notes/model";
import StudyPlan from "@/features/calendar/model";
import Review from "@/features/reviews/model";
import { linkEmail, sendEmail } from "@/lib/email";

const passwordSchema = z.strictObject({ password: z.string().min(8, { error: "At least 8 characters" }).max(128) });

const banSchema = z.strictObject({ reason: z.string().trim().min(3, { error: "Give a reason" }).max(300) });

const loadStudent = async (userId) => {
  if (!Types.ObjectId.isValid(userId)) return null;
  await connectDB();
  const user = await db.collection("user").findOne({ _id: new Types.ObjectId(userId) }, { projection: { role: 1, email: 1, name: 1 } });
  return user && user.role !== "ADMIN" ? user : null;
};

export const banStudent = async (userId, input) => {
  const admin = await requireAdmin();
  const result = parse(banSchema, input);
  if (!result.ok) return result;
  if (!(await loadStudent(userId))) return fail("Student not found");
  await auth.api.banUser({ headers: await headers(), body: { userId, banReason: result.data.reason } });
  await PlaybackSession.deleteMany({ userId });
  await audit(admin, "student.block", `Blocked a student: ${result.data.reason}`, { type: "student", id: userId });
  return { ok: true };
};

export const unbanStudent = async (userId) => {
  const admin = await requireAdmin();
  if (!(await loadStudent(userId))) return fail("Student not found");
  await auth.api.unbanUser({ headers: await headers(), body: { userId } });
  await audit(admin, "student.unblock", "Unblocked a student", { type: "student", id: userId });
  return { ok: true };
};

export const enrollStudent = async (userId, courseId) => {
  const admin = await requireAdmin();
  if (!(await loadStudent(userId))) return fail("Student not found");
  if (!isValidObjectId(courseId) || !(await Course.exists({ _id: courseId }))) return fail("Choose a course", "courseId");
  await grantEnrollment({ userId, courseId, source: "manual" });
  await audit(admin, "student.enroll", "Enrolled a student for free", { type: "student", id: userId });
  return { ok: true };
};

export const revokeEnrollment = async (userId, courseId) => {
  const admin = await requireAdmin();
  if (!(await loadStudent(userId)) || !isValidObjectId(courseId)) return fail("Enrollment not found");
  await Enrollment.updateOne({ userId, courseId }, { $set: { status: "revoked" } });
  await audit(admin, "student.revoke_access", "Removed a student's course access", { type: "student", id: userId });
  return { ok: true };
};

export const deleteStudent = async (userId) => {
  const admin = await requireAdmin();
  if (!(await loadStudent(userId))) return fail("Student not found");
  await Promise.all([
    Enrollment.deleteMany({ userId }),
    LessonProgress.deleteMany({ userId }),
    CourseProgress.deleteMany({ userId }),
    ActivityLog.deleteMany({ userId }),
    QuizAttempt.deleteMany({ userId }),
    PlaybackSession.deleteMany({ userId }),
    Note.deleteMany({ userId }),
    StudyPlan.deleteMany({ userId }),
    Review.deleteMany({ userId }),
  ]);
  await auth.api.removeUser({ headers: await headers(), body: { userId } });
  await audit(admin, "student.delete", "Deleted a student account", { type: "student", id: userId });
  return { ok: true };
};

export const setStudentPassword = async (userId, input) => {
  const admin = await requireAdmin();
  const result = parse(passwordSchema, input);
  if (!result.ok) return result;
  const student = await loadStudent(userId);
  if (!student) return fail("Student not found");
  const requestHeaders = await headers();
  await auth.api.setUserPassword({ headers: requestHeaders, body: { userId, newPassword: result.data.password } });
  await auth.api.revokeUserSessions({ headers: requestHeaders, body: { userId } });
  await PlaybackSession.deleteMany({ userId });
  if (student.email)
    await sendEmail({
      to: student.email,
      subject: "Your password was changed",
      html: linkEmail({ title: "Your password was changed", text: "An administrator set a new password for your account and signed you out on all devices. If you did not ask for this, contact us.", url: `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/login`, cta: "Sign in" }),
    }).catch((error) => console.error("[students] email failed", error));
  await audit(admin, "student.password", "Set a new password for a student", { type: "student", id: userId });
  return { ok: true };
};
