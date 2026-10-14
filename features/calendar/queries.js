import "server-only";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { TIME_ZONE, dayKey } from "@/lib/format";
import StudyPlan from "@/features/calendar/model";
import ActivityLog from "@/features/progress/models/activity-log";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";

const plain = (value) => JSON.parse(JSON.stringify(value));

const timeOf = (date) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(date);

export const getCalendar = async (month) => {
  const user = await requireUser();
  await connectDB();
  const current = /^\d{4}-\d{2}$/.test(month ?? "") ? month : dayKey().slice(0, 7);
  const [y, m] = current.split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 1, 1) - 5 * 3600000);
  const to = new Date(Date.UTC(y, m, 1) - 5 * 3600000);
  const [plans, upcoming, watch, enrollments] = await Promise.all([
    StudyPlan.find({ userId: user.id, startsAt: { $gte: from, $lt: to } }).sort({ startsAt: 1 }).lean(),
    StudyPlan.find({ userId: user.id, startsAt: { $gte: new Date(Date.now() - 3600000) }, done: false }).sort({ startsAt: 1 }).limit(8).lean(),
    ActivityLog.find({ userId: user.id, type: "lesson_viewed", "meta.day": { $regex: `^${current}` } }, "meta").lean(),
    Enrollment.find({ userId: user.id, status: "active" }, "courseId").lean(),
  ]);
  const courses = await Course.find({ _id: { $in: enrollments.map((e) => e.courseId) } }, "title slug").lean();
  const titles = new Map(courses.map((c) => [String(c._id), c]));
  const shape = (p) => ({ id: String(p._id), title: p.title, day: dayKey(p.startsAt), time: timeOf(p.startsAt), startsAt: p.startsAt, durationMin: p.durationMin, done: p.done, course: p.courseId ? titles.get(String(p.courseId)) ?? null : null });
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  return plain({
    month: current,
    prev,
    next,
    today: dayKey(),
    plans: plans.map(shape),
    upcoming: upcoming.map(shape),
    studied: watch.map((w) => ({ day: w.meta.day, minutes: Math.round(w.meta.seconds / 60) })),
    courses: courses.map((c) => ({ value: String(c._id), label: c.title })),
  });
};

export const getTodayPlans = async () => {
  const user = await requireUser();
  await connectDB();
  const today = dayKey();
  const plans = await StudyPlan.find({ userId: user.id, startsAt: { $gte: new Date(`${today}T00:00:00+05:00`), $lt: new Date(`${today}T23:59:59+05:00`) } }).sort({ startsAt: 1 }).lean();
  return plain(plans.map((p) => ({ id: String(p._id), title: p.title, startsAt: p.startsAt, time: timeOf(p.startsAt), durationMin: p.durationMin, done: p.done })));
};
