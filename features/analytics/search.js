import "server-only";
import { connectDB, db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/dal";
import { searchPattern } from "@/lib/search";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Order from "@/features/payments/models/order";
import Certificate from "@/features/certificates/model";
import Enrollment from "@/features/enrollments/model";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const adminSearch = async (q) => {
  await requireAdmin();
  const re = searchPattern(q);
  if (!re) return null;
  await connectDB();
  const [courses, students, certificates, refOrders] = await Promise.all([
    Course.find({ $or: [{ title: re }, { slug: re }, { category: re }] }, "title category status").limit(8).lean(),
    db.collection("user").find({ role: { $ne: "ADMIN" }, $or: [{ name: re }, { email: re }] }, { projection: { name: 1, email: 1 } }).limit(8).toArray(),
    Certificate.find({ $or: [{ code: re }, { studentName: re }, { courseTitle: re }] }, "code studentName courseTitle status").limit(8).lean(),
    Order.find({ providerRef: re }, "providerRef status amount currency").limit(8).lean(),
  ]);
  const lessons = await Lesson.find({ title: re }, "title courseId").limit(8).lean();
  return plain({
    courses: courses.map((c) => ({ id: String(c._id), title: c.title, meta: `${c.category || "Course"} · ${c.status}`, href: `/admin/courses/${c._id}` })),
    lessons: lessons.map((l) => ({ id: String(l._id), title: l.title, meta: "Lesson", href: `/admin/courses/${l.courseId}/lessons/${l._id}` })),
    students: students.map((s) => ({ id: String(s._id), title: s.name, meta: s.email, href: `/admin/students/${s._id}` })),
    orders: refOrders.map((o) => ({ id: String(o._id), title: o.providerRef.replace(/^manual:/, ""), meta: `${o.status} · ${o.currency} ${o.amount}`, href: "/admin/orders" })),
    certificates: certificates.map((c) => ({ id: String(c._id), title: c.code, meta: `${c.studentName} · ${c.courseTitle} · ${c.status}`, href: `/verify/${c.code}` })),
  });
};

export const studentSearch = async (q) => {
  const user = await requireUser();
  const re = searchPattern(q);
  if (!re) return null;
  await connectDB();
  const enrolled = (await Enrollment.find({ userId: user.id, status: "active" }, "courseId").lean()).map((e) => e.courseId);
  const [mine, catalog, lessons] = await Promise.all([
    Course.find({ _id: { $in: enrolled }, $or: [{ title: re }, { category: re }] }, "title slug category").lean(),
    Course.find({ _id: { $nin: enrolled }, status: "published", $or: [{ title: re }, { category: re }, { subtitle: re }] }, "title slug category").limit(8).lean(),
    Lesson.find({ courseId: { $in: enrolled }, status: "published", title: re }, "title courseId").limit(10).lean(),
  ]);
  const slugs = new Map((await Course.find({ _id: { $in: enrolled } }, "slug title").lean()).map((c) => [String(c._id), c]));
  return plain({
    courses: mine.map((c) => ({ id: String(c._id), title: c.title, meta: c.category || "Course", href: `/dashboard/courses/${c.slug}` })),
    lessons: lessons.map((l) => ({ id: String(l._id), title: l.title, meta: slugs.get(String(l.courseId))?.title, href: `/dashboard/courses/${slugs.get(String(l.courseId))?.slug}/lessons/${l._id}` })),
    catalog: catalog.map((c) => ({ id: String(c._id), title: c.title, meta: c.category || "Course", href: `/courses/${c.slug}` })),
  });
};
