"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import { verifyUpload } from "@/lib/cloudinary";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import Assignment from "@/features/assignments/model";
import Submission from "@/features/assignments/submission-model";
import { assignmentSchema, gradeSchema, submissionSchema } from "@/features/assignments/schemas";
import { canTeach } from "@/features/courses/access";
import { notifyInApp, notifyCourseStudents } from "@/features/notifications/service";
import { audit } from "@/features/audit/service";

const NOT_YOURS = "You can only manage courses you teach";

const loadTaught = async (user, assignmentId) => {
  if (!isValidObjectId(assignmentId)) return null;
  await connectDB();
  const assignment = await Assignment.findById(assignmentId);
  return assignment && (await canTeach(user, assignment.courseId)) ? assignment : null;
};

export const saveAssignment = async (assignmentId, input) => {
  const user = await requireStaff();
  const result = parse(assignmentSchema, input);
  if (!result.ok) return result;
  if (!(await canTeach(user, result.data.courseId))) return fail(NOT_YOURS, "courseId");
  const data = { ...result.data, dueOn: result.data.dueOn || null };
  let wasPublished = false;
  let saved;
  if (assignmentId) {
    const existing = await loadTaught(user, assignmentId);
    if (!existing) return fail("Assignment not found");
    wasPublished = existing.status === "published";
    saved = await Assignment.findByIdAndUpdate(assignmentId, { $set: data }, { new: true });
  } else {
    saved = await Assignment.create({ ...data, createdBy: user.id });
  }
  if (!wasPublished && saved.status === "published") {
    const course = await Course.findById(saved.courseId, "title").lean();
    await notifyCourseStudents(saved.courseId, "notifyAnnouncement", { subject: `New assignment in ${course?.title}`, title: "New assignment", text: `${saved.title} (${course?.title})`, path: `/dashboard/assignments/${saved._id}` });
  }
  await audit(user, assignmentId ? "assignment.update" : "assignment.create", `${assignmentId ? "Updated" : "Created"} assignment "${saved.title}"`, { type: "course", id: saved.courseId });
  return { ok: true, data: { id: String(saved._id) } };
};

export const deleteAssignment = async (assignmentId) => {
  const user = await requireStaff();
  const assignment = await loadTaught(user, assignmentId);
  if (!assignment) return fail("Assignment not found");
  await Promise.all([Submission.deleteMany({ assignmentId: assignment._id }), Assignment.deleteOne({ _id: assignment._id })]);
  await audit(user, "assignment.delete", `Deleted assignment "${assignment.title}"`, { type: "course", id: assignment.courseId });
  return { ok: true };
};

export const submitAssignment = async (assignmentId, input) => {
  const user = await requireUser();
  if (!(await rateLimit("community", user.id))) return fail("You are submitting too fast. Try again in a few minutes.");
  const result = parse(submissionSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(assignmentId)) return fail("Assignment not found");
  await connectDB();
  const assignment = await Assignment.findOne({ _id: assignmentId, status: "published" }).lean();
  if (!assignment || !(await Enrollment.exists({ userId: user.id, courseId: assignment.courseId, status: "active" }))) return fail("Assignment not found");
  const existing = await Submission.findOne({ assignmentId, userId: user.id }).lean();
  if (existing?.status === "graded") return fail("This assignment is already graded");
  const kept = new Map((existing?.files ?? []).map((f) => [f.publicId, f]));
  const files = [];
  for (const file of result.data.files) {
    const previous = kept.get(file.publicId);
    if (previous) {
      files.push(previous);
      continue;
    }
    if (await Submission.exists({ "files.publicId": file.publicId, userId: { $ne: user.id } })) return fail("Invalid upload", "files");
    const check = await verifyUpload("submission", file.publicId);
    if (!check.ok) return fail(check.error, "files");
    files.push({ publicId: check.asset.publicId, name: file.name ?? "file", format: check.asset.format });
  }
  await Submission.updateOne(
    { assignmentId, userId: user.id },
    { $set: { courseId: assignment.courseId, text: result.data.text, files, status: "submitted", submittedAt: new Date() } },
    { upsert: true },
  );
  const course = await Course.findById(assignment.courseId, "teacherIds").lean();
  await notifyInApp(course?.teacherIds ?? [], { title: "New submission", text: `${user.name}: ${assignment.title}`, path: `/admin/assignments/${assignmentId}` });
  return { ok: true };
};

export const gradeSubmission = async (submissionId, input) => {
  const user = await requireStaff();
  const result = parse(gradeSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(submissionId)) return fail("Submission not found");
  await connectDB();
  const submission = await Submission.findById(submissionId);
  if (!submission || !(await canTeach(user, submission.courseId))) return fail("Submission not found");
  await Submission.updateOne({ _id: submission._id }, { $set: { ...result.data, status: "graded", gradedBy: user.id, gradedAt: new Date() } });
  const assignment = await Assignment.findById(submission.assignmentId, "title").lean();
  await notifyInApp(submission.userId, { title: "Assignment graded", text: `${assignment?.title}: ${result.data.grade}/100`, path: `/dashboard/assignments/${submission.assignmentId}` });
  await audit(user, "assignment.grade", `Graded a submission for "${assignment?.title}" (${result.data.grade}/100)`, { type: "course", id: submission.courseId });
  return { ok: true };
};
