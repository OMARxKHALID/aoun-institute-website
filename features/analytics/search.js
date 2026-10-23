import "server-only";
import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/dal";
import { searchPattern } from "@/lib/search";
import Course from "@/features/courses/models/course";
import Lesson from "@/features/courses/models/lesson";
import Order from "@/features/payments/models/order";
import Certificate from "@/features/certificates/model";
import Enrollment from "@/features/enrollments/model";
import Quiz from "@/features/quizzes/models/quiz";
import Note from "@/features/notes/model";
import Announcement from "@/features/announcements/model";
import { navs } from "@/lib/nav";
import { plain } from "@/lib/format";

const pages = (panel, re) =>
  navs[panel].groups.flatMap((g) => g.items.filter((i) => re.test(i.label) || re.test(g.label)).map((i) => ({ id: i.href, title: i.label, meta: g.label, href: i.href })));

export const adminSearch = async (q) => {
  await requireAdmin();
  const re = searchPattern(q);
  if (!re) return null;
  await connectDB();
  const [courses, students, certificates, refOrders] = await Promise.all([
    Course.find({ $or: [{ title: re }, { slug: re }, { category: re }] }, "title category status").limit(8).lean(),
    db.collection("user").find({ role: { $ne: "ADMIN" }, $or: [{ name: re }, { email: re }] }, { projection: { name: 1, email: 1 } }).limit(8).toArray(),
    Certificate.find({ $or: [{ code: re }, { studentName: re }, { courseTitle: re }] }, "code studentName courseTitle status").limit(8).lean(),
    Order.find({ providerRef: re }, "providerRef status amount currency userId").limit(8).lean(),
  ]);
  const [lessons, quizzes, announcements, buyerOrders] = await Promise.all([
    Lesson.find({ title: re }, "title courseId").limit(8).lean(),
    Quiz.find({ title: re }, "title courseId").limit(8).lean(),
    Announcement.find({ $or: [{ title: re }, { body: re }] }, "title").sort({ createdAt: -1 }).limit(5).lean(),
    students.length ? Order.find({ userId: { $in: students.map((u) => String(u._id)) } }, "providerRef status amount currency userId").sort({ createdAt: -1 }).limit(8).lean() : [],
  ]);
  const orders = [...refOrders, ...buyerOrders.filter((o) => !refOrders.some((r) => String(r._id) === String(o._id)))];
  const buyers = orders.length ? await db.collection("user").find({ _id: { $in: [...new Set(orders.map((o) => o.userId))].filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id)) } }, { projection: { name: 1 } }).toArray() : [];
  const names = new Map(buyers.map((u) => [String(u._id), u.name]));
  return plain({
    courses: courses.map((c) => ({ id: String(c._id), title: c.title, meta: `${c.category || "Course"} · ${c.status}`, href: `/admin/courses/${c._id}` })),
    lessons: lessons.map((l) => ({ id: String(l._id), title: l.title, meta: "Lesson", href: `/admin/courses/${l.courseId}/lessons/${l._id}` })),
    students: students.map((s) => ({ id: String(s._id), title: s.name, meta: s.email, href: `/admin/students/${s._id}` })),
    quizzes: quizzes.map((x) => ({ id: String(x._id), title: x.title, meta: "Quiz", href: `/admin/courses/${x.courseId}/quizzes/${x._id}` })),
    orders: orders.map((o) => ({ id: String(o._id), title: names.get(o.userId) ?? o.providerRef?.replace(/^manual:/, "") ?? "Order", meta: `${o.status} · ${o.currency} ${o.amount}${o.providerRef ? ` · ${o.providerRef.replace(/^manual:/, "")}` : ""}`, href: `/admin/orders?q=${encodeURIComponent(o.providerRef?.replace(/^manual:/, "") ?? "")}` })),
    announcements: announcements.map((a) => ({ id: String(a._id), title: a.title, meta: "Announcement", href: "/admin/announcements" })),
    pages: pages("admin", re),
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
  const [quizzes, notes, certificates] = await Promise.all([
    Quiz.find({ courseId: { $in: enrolled }, status: "published", title: re }, "title").limit(8).lean(),
    Note.find({ userId: user.id, body: re }, "body lessonId courseId sec").sort({ createdAt: -1 }).limit(8).lean(),
    Certificate.find({ userId: user.id, $or: [{ code: re }, { courseTitle: re }] }, "code courseTitle status").lean(),
  ]);
  const slugs = new Map((await Course.find({ _id: { $in: enrolled } }, "slug title").lean()).map((c) => [String(c._id), c]));
  return plain({
    courses: mine.map((c) => ({ id: String(c._id), title: c.title, meta: c.category || "Course", href: `/dashboard/courses/${c.slug}` })),
    lessons: lessons.map((l) => ({ id: String(l._id), title: l.title, meta: slugs.get(String(l.courseId))?.title, href: `/dashboard/courses/${slugs.get(String(l.courseId))?.slug}/lessons/${l._id}` })),
    quizzes: quizzes.map((x) => ({ id: String(x._id), title: x.title, meta: "Quiz", href: `/dashboard/quizzes/${x._id}` })),
    notes: notes.map((n) => ({ id: String(n._id), title: n.body, meta: slugs.get(String(n.courseId))?.title, href: `/dashboard/courses/${slugs.get(String(n.courseId))?.slug}/lessons/${n.lessonId}?t=${Math.floor(n.sec)}` })),
    certificates: certificates.map((c) => ({ id: String(c._id), title: c.courseTitle, meta: `${c.code} · ${c.status}`, href: "/dashboard/certificates" })),
    catalog: catalog.map((c) => ({ id: String(c._id), title: c.title, meta: c.category || "Course", href: `/courses/${c.slug}` })),
    pages: pages("student", re),
  });
};
