import "server-only";
import { Types, isValidObjectId } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import Assignment from "@/features/assignments/model";
import Submission from "@/features/assignments/submission-model";
import { canTeach, taughtCourseIds } from "@/features/courses/access";
import { plain } from "@/lib/format";

const fileList = (files = [], submissionId) => files.map((f, i) => ({ name: f.name, href: `/api/submissions/${submissionId}/file?i=${i}` }));

const mySubmission = (s) =>
  s && { id: String(s._id), text: s.text ?? "", files: fileList(s.files, s._id), uploads: (s.files ?? []).map((f) => ({ publicId: f.publicId, name: f.name })), status: s.status, grade: s.grade ?? null, feedback: s.feedback ?? "", submittedAt: s.submittedAt };

export const getStudentAssignments = async () => {
  const user = await requireUser();
  await connectDB();
  const courseIds = (await Enrollment.find({ userId: user.id, status: "active" }, "courseId").lean()).map((e) => e.courseId);
  const [assignments, courses, submissions] = await Promise.all([
    Assignment.find({ courseId: { $in: courseIds }, status: "published" }).sort({ dueOn: 1, createdAt: -1 }).lean(),
    Course.find({ _id: { $in: courseIds } }, "title").lean(),
    Submission.find({ userId: user.id }, "assignmentId status grade").lean(),
  ]);
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  const byAssignment = new Map(submissions.map((s) => [String(s.assignmentId), s]));
  return plain(
    assignments.map((a) => {
      const s = byAssignment.get(String(a._id));
      return { id: String(a._id), title: a.title, course: titles.get(String(a.courseId)) ?? "", dueOn: a.dueOn, status: s?.status ?? "todo", grade: s?.grade ?? null };
    }),
  );
};

export const getStudentAssignment = async (id) => {
  const user = await requireUser();
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const assignment = await Assignment.findOne({ _id: id, status: "published" }).lean();
  if (!assignment || !(await Enrollment.exists({ userId: user.id, courseId: assignment.courseId, status: "active" }))) return null;
  const [course, submission] = await Promise.all([Course.findById(assignment.courseId, "title slug").lean(), Submission.findOne({ assignmentId: id, userId: user.id }).lean()]);
  return plain({ assignment: { id, title: assignment.title, instructions: assignment.instructions ?? "", dueOn: assignment.dueOn, course: course?.title, slug: course?.slug }, submission: mySubmission(submission) });
};

export const getAdminAssignments = async () => {
  const user = await requireStaff();
  await connectDB();
  const taught = await taughtCourseIds(user);
  const scope = taught ? { courseId: { $in: taught } } : {};
  const [assignments, courses, counts] = await Promise.all([
    Assignment.find(scope).sort({ createdAt: -1 }).limit(500).lean(),
    Course.find(taught ? { _id: { $in: taught } } : {}, "title").sort({ title: 1 }).lean(),
    Submission.aggregate([{ $match: scope }, { $group: { _id: "$assignmentId", total: { $sum: 1 }, waiting: { $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] } } } }]),
  ]);
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  const byId = new Map(counts.map((c) => [String(c._id), c]));
  return plain({
    assignments: assignments.map((a) => ({
      id: String(a._id),
      title: a.title,
      courseId: String(a.courseId),
      course: titles.get(String(a.courseId)) ?? "Deleted course",
      instructions: a.instructions ?? "",
      dueOn: a.dueOn ?? "",
      status: a.status,
      submissions: byId.get(String(a._id))?.total ?? 0,
      waiting: byId.get(String(a._id))?.waiting ?? 0,
    })),
    courses: courses.map((c) => ({ value: String(c._id), label: c.title })),
  });
};

export const getAdminAssignment = async (id) => {
  const user = await requireStaff();
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const assignment = await Assignment.findById(id).lean();
  if (!assignment || !(await canTeach(user, assignment.courseId))) return null;
  const [course, submissions] = await Promise.all([Course.findById(assignment.courseId, "title").lean(), Submission.find({ assignmentId: id }).sort({ submittedAt: -1 }).lean()]);
  const ids = submissions.map((s) => s.userId).filter(Types.ObjectId.isValid).map((x) => new Types.ObjectId(x));
  const users = await db.collection("user").find({ _id: { $in: ids } }, { projection: { name: 1, email: 1 } }).toArray();
  const byUser = new Map(users.map((u) => [String(u._id), u]));
  return plain({
    assignment: { id, title: assignment.title, course: course?.title, instructions: assignment.instructions ?? "", dueOn: assignment.dueOn, status: assignment.status },
    submissions: submissions.map((s) => ({
      id: String(s._id),
      student: byUser.get(s.userId)?.name ?? "Former student",
      email: byUser.get(s.userId)?.email ?? "",
      text: s.text ?? "",
      files: fileList(s.files, s._id),
      status: s.status,
      grade: s.grade ?? null,
      feedback: s.feedback ?? "",
      submittedAt: s.submittedAt,
      late: Boolean(assignment.dueOn && s.submittedAt && new Date(s.submittedAt).toISOString().slice(0, 10) > assignment.dueOn),
    })),
  });
};

export const getSubmissionFile = async (submissionId, index, user) => {
  if (!user || !isValidObjectId(submissionId)) return null;
  await connectDB();
  const submission = await Submission.findById(submissionId, "userId courseId files").lean();
  const file = submission?.files?.[index];
  if (!file) return null;
  const allowed = submission.userId === user.id || (await canTeach(user, submission.courseId));
  return allowed ? file : null;
};
