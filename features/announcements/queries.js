import "server-only";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/dal";
import Announcement from "@/features/announcements/model";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const getAdminAnnouncements = async () => {
  await requireAdmin();
  await connectDB();
  const [list, courses] = await Promise.all([Announcement.find().sort({ createdAt: -1 }).limit(500).lean(), Course.find({}, "title").sort({ title: 1 }).lean()]);
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  return plain({
    announcements: list.map((a) => ({ id: String(a._id), title: a.title, body: a.body, course: titles.get(String(a.courseId)) ?? "Deleted course", createdAt: a.createdAt })),
    courses: courses.map((c) => ({ value: String(c._id), label: c.title })),
  });
};

export const getMyAnnouncements = async (courseId, limit = 5) => {
  const user = await requireUser();
  await connectDB();
  const ids = courseId ? [courseId] : (await Enrollment.find({ userId: user.id, status: "active" }, "courseId").lean()).map((e) => e.courseId);
  const [list, courses] = await Promise.all([Announcement.find({ courseId: { $in: ids } }).sort({ createdAt: -1 }).limit(limit).lean(), Course.find({ _id: { $in: ids } }, "title").lean()]);
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  return plain(list.map((a) => ({ id: String(a._id), title: a.title, body: a.body, course: titles.get(String(a.courseId)), createdAt: a.createdAt })));
};
