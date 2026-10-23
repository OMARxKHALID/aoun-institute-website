import "server-only";
import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { taughtCourseIds } from "@/features/courses/access";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import CourseProgress from "@/features/progress/models/course-progress";
import Order from "@/features/payments/models/order";
import Certificate from "@/features/certificates/model";
import QuizAttempt from "@/features/quizzes/models/quiz-attempt";
import { plain } from "@/lib/format";

export const getAdminStudents = async () => {
  const viewer = await requireStaff();
  await connectDB();
  const taught = await taughtCourseIds(viewer);
  const scoped = taught ? { _id: { $in: (await Enrollment.distinct("userId", { courseId: { $in: taught }, status: "active" })).filter(Types.ObjectId.isValid).map((x) => new Types.ObjectId(x)) } } : {};
  const users = await db.collection("user").find({ role: { $ne: "ADMIN" }, ...scoped }, { projection: { name: 1, email: 1, image: 1, role: 1, createdAt: 1, banned: 1, deletionRequestedAt: 1, emailVerified: 1 } }).sort({ createdAt: -1 }).limit(2000).toArray();
  const ids = users.map((u) => String(u._id));
  const [enrollments, activity, spent] = await Promise.all([
    Enrollment.aggregate([{ $match: { userId: { $in: ids }, status: "active", ...(taught && { courseId: { $in: taught } }) } }, { $group: { _id: "$userId", count: { $sum: 1 } } }]),
    CourseProgress.aggregate([{ $match: { userId: { $in: ids }, ...(taught && { courseId: { $in: taught } }) } }, { $group: { _id: "$userId", last: { $max: "$lastActiveAt" } } }]),
    taught ? [] : Order.aggregate([{ $match: { userId: { $in: ids }, status: "PAID" } }, { $group: { _id: "$userId", total: { $sum: "$amount" } } }]),
  ]);
  const map = (list, key) => new Map(list.map((x) => [x._id, x[key]]));
  const counts = map(enrollments, "count");
  const last = map(activity, "last");
  const totals = map(spent, "total");
  return plain(
    users.map((u) => {
      const id = String(u._id);
      return {
        id,
        name: u.name,
        email: u.email,
        image: u.image ?? null,
        role: u.role ?? "STUDENT",
        joinedAt: u.createdAt,
        courses: counts.get(id) ?? 0,
        spent: totals.get(id) ?? 0,
        lastActiveAt: last.get(id) ?? null,
        status: u.banned ? "banned" : u.deletionRequestedAt ? "deletion" : u.emailVerified ? "active" : "unverified",
      };
    }),
  );
};

export const getAdminStudent = async (id) => {
  const viewer = await requireStaff();
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const user = await db.collection("user").findOne({ _id: new Types.ObjectId(id) });
  if (!user || user.role === "ADMIN") return null;
  const taught = await taughtCourseIds(viewer);
  const inTaught = taught ? { courseId: { $in: taught } } : {};
  if (taught && !(await Enrollment.exists({ userId: id, ...inTaught }))) return null;
  const [enrollments, progress, orders, certificates, attempts, courses] = await Promise.all([
    Enrollment.find({ userId: id, ...inTaught }).lean(),
    CourseProgress.find({ userId: id, ...inTaught }).lean(),
    taught ? [] : Order.find({ userId: id }).sort({ createdAt: -1 }).lean(),
    Certificate.find({ userId: id, ...inTaught }).sort({ issuedAt: -1 }).lean(),
    QuizAttempt.countDocuments({ userId: id, status: { $ne: "in_progress" }, ...inTaught }),
    Course.find(taught ? { _id: { $in: taught } } : {}, "title slug").sort({ title: 1 }).lean(),
  ]);
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  return plain({
    student: {
      id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      phone: user.phone ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      bio: user.bio ?? "",
      joinedAt: user.createdAt,
      emailVerified: Boolean(user.emailVerified),
      banned: Boolean(user.banned),
      banReason: user.banReason ?? "",
      deletionRequestedAt: user.deletionRequestedAt ?? null,
      role: user.role ?? "STUDENT",
    },
    owner: !taught,
    enrollments: enrollments.map((e) => {
      const p = progress.find((x) => String(x.courseId) === String(e.courseId));
      return { courseId: String(e.courseId), course: titles.get(String(e.courseId)) ?? "Deleted course", status: e.status, source: e.source, enrolledAt: e.enrolledAt, percent: p?.percent ?? 0, timeSpentSec: p?.timeSpentSec ?? 0, lastActiveAt: p?.lastActiveAt ?? null };
    }),
    orders: orders.map((o) => ({ id: String(o._id), course: titles.get(String(o.courseId)) ?? "Deleted course", amount: o.amount, currency: o.currency, status: o.status, createdAt: o.createdAt })),
    certificates: certificates.map((c) => ({ code: c.code, courseTitle: c.courseTitle, status: c.status, issuedAt: c.issuedAt })),
    attempts,
    courses: courses.map((c) => ({ value: String(c._id), label: c.title })),
  });
};
