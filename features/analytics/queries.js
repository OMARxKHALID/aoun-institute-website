import "server-only";
import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import Order from "@/features/payments/models/order";
import Certificate from "@/features/certificates/model";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const getAdminDashboard = async () => {
  const admin = await requireAdmin();
  await connectDB();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonths = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [paid, monthly, students, activeEnrollments, pending, certificates, topCourses, recentOrders, monthDays] = await Promise.all([
    Order.aggregate([{ $match: { status: "PAID" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: "PAID", paidAt: { $gte: sixMonths } } },
      { $group: { _id: { y: { $year: "$paidAt" }, m: { $month: "$paidAt" } }, total: { $sum: "$amount" } } },
    ]),
    db.collection("user").countDocuments({ role: { $ne: "ADMIN" } }),
    Enrollment.countDocuments({ status: "active" }),
    Order.find({ status: "PENDING" }).sort({ createdAt: 1 }).limit(5).populate({ path: "courseId", select: "title", model: Course }).lean(),
    Certificate.countDocuments({ status: "VALID" }),
    Enrollment.aggregate([{ $match: { status: "active" } }, { $group: { _id: "$courseId", students: { $sum: 1 } } }, { $sort: { students: -1 } }, { $limit: 3 }]),
    Order.find().sort({ createdAt: -1 }).limit(6).populate({ path: "courseId", select: "title", model: Course }).lean(),
    Order.aggregate([{ $match: { status: "PAID", paidAt: { $gte: monthStart } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } } } }]),
  ]);
  const pendingCount = await Order.countDocuments({ status: "PENDING" });
  const courses = await Course.find({ _id: { $in: topCourses.map((c) => c._id) } }, "title category thumbnail slug").lean();
  const userIds = [...new Set([...recentOrders, ...pending].map((o) => o.userId))].filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  const users = await db.collection("user").find({ _id: { $in: userIds } }, { projection: { name: 1 } }).toArray();
  const names = new Map(users.map((u) => [String(u._id), u.name]));
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const found = monthly.find((m) => m._id.y === date.getFullYear() && m._id.m === date.getMonth() + 1);
    return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("en-GB", { month: "short" }), value: found?.total ?? 0 };
  });
  const thisMonth = months.at(-1).value;
  const lastMonth = months.at(-2).value;
  const orderRow = (o) => ({ id: String(o._id), student: names.get(o.userId) ?? "Deleted user", course: o.courseId?.title ?? "Deleted course", amount: o.amount, currency: o.currency, status: o.status, createdAt: o.createdAt });
  return plain({
    admin: { name: admin.name },
    stats: { revenue: paid[0]?.total ?? 0, paidOrders: paid[0]?.count ?? 0, thisMonth, change: lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null, students, activeEnrollments, pending: pendingCount, certificates },
    months,
    topCourses: topCourses.map((t) => {
      const c = courses.find((x) => String(x._id) === String(t._id));
      return { id: String(t._id), title: c?.title ?? "Deleted course", category: c?.category ?? "", thumbnail: c?.thumbnail ?? null, students: t.students };
    }),
    pending: pending.map(orderRow),
    recentOrders: recentOrders.map(orderRow),
    salesDays: monthDays.map((d) => d._id),
  });
};
