import "server-only";
import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { TIME_ZONE } from "@/lib/format";
import Course from "@/features/courses/models/course";
import Order from "@/features/payments/models/order";

export const RANGES = [
  { value: "30d", label: "Last 30 days", days: 30, unit: "day" },
  { value: "90d", label: "Last 90 days", days: 90, unit: "week" },
  { value: "12m", label: "Last 12 months", days: 365, unit: "month" },
  { value: "all", label: "All time", days: null, unit: "month" },
];

const formats = { day: "%Y-%m-%d", week: "%G-W%V", month: "%Y-%m" };

const bucketLabel = (key, unit) => {
  if (unit === "week") return key.split("-")[1];
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d || 1));
  return unit === "day" ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : date.toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
};

export const resolveRange = (value) => RANGES.find((r) => r.value === value) ?? RANGES[0];

export const getSalesReport = async (rangeValue) => {
  await requireAdmin();
  await connectDB();
  const range = resolveRange(rangeValue);
  const since = range.days ? new Date(Date.now() - range.days * 86400000) : new Date(0);
  const paidMatch = { status: "PAID", paidAt: { $gte: since } };
  const group = (field) => ({ $dateToString: { format: formats[range.unit], date: field, timezone: TIME_ZONE } });
  const [totals, series, byCourse, byMethod, statusCounts, refunds, signups] = await Promise.all([
    Order.aggregate([{ $match: paidMatch }, { $group: { _id: null, revenue: { $sum: "$amount" }, orders: { $sum: 1 }, students: { $addToSet: "$userId" } } }]),
    Order.aggregate([{ $match: paidMatch }, { $group: { _id: group("$paidAt"), value: { $sum: "$amount" } } }, { $sort: { _id: 1 } }]),
    Order.aggregate([{ $match: paidMatch }, { $group: { _id: "$courseId", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } }, { $sort: { revenue: -1 } }]),
    Order.aggregate([{ $match: paidMatch }, { $group: { _id: "$method", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } }, { $sort: { revenue: -1 } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { status: "REFUNDED", refundedAt: { $gte: since } } }, { $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    db.collection("user").aggregate([{ $match: { role: { $ne: "ADMIN" }, createdAt: { $gte: since } } }, { $group: { _id: group("$createdAt"), value: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray(),
  ]);
  const courses = await Course.find({ _id: { $in: byCourse.map((c) => c._id) } }, "title").lean();
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  const counts = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
  const reviewed = (counts.PAID ?? 0) + (counts.FAILED ?? 0) + (counts.REFUNDED ?? 0);
  const t = totals[0] ?? { revenue: 0, orders: 0, students: [] };
  return {
    range,
    totals: {
      revenue: t.revenue,
      orders: t.orders,
      students: t.students.length,
      average: t.orders ? Math.round(t.revenue / t.orders) : 0,
      refunded: refunds[0]?.amount ?? 0,
      refunds: refunds[0]?.count ?? 0,
      pending: counts.PENDING ?? 0,
      approvalRate: reviewed ? Math.round(((counts.PAID ?? 0) / reviewed) * 100) : null,
    },
    revenue: series.map((s) => ({ key: s._id, label: bucketLabel(s._id, range.unit), value: s.value })),
    signups: signups.map((s) => ({ key: s._id, label: bucketLabel(s._id, range.unit), value: s.value })),
    byCourse: byCourse.map((c) => ({ id: String(c._id), title: titles.get(String(c._id)) ?? "Deleted course", revenue: c.revenue, orders: c.orders, share: t.revenue ? Math.round((c.revenue / t.revenue) * 100) : 0 })),
    byMethod: byMethod.map((m) => ({ method: m._id ?? "Other", revenue: m.revenue, orders: m.orders, share: t.revenue ? Math.round((m.revenue / t.revenue) * 100) : 0 })),
  };
};

export const getOrdersForExport = async (rangeValue) => {
  await requireAdmin();
  await connectDB();
  const range = resolveRange(rangeValue);
  const since = range.days ? new Date(Date.now() - range.days * 86400000) : new Date(0);
  const orders = await Order.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).lean();
  const [courses, users] = await Promise.all([
    Course.find({ _id: { $in: [...new Set(orders.map((o) => String(o.courseId)))] } }, "title").lean(),
    db.collection("user").find({ _id: { $in: [...new Set(orders.map((o) => o.userId))].filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id)) } }, { projection: { name: 1, email: 1 } }).toArray(),
  ]);
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  const people = new Map(users.map((u) => [String(u._id), u]));
  return orders.map((o) => ({
    date: o.createdAt.toISOString(),
    student: people.get(o.userId)?.name ?? "",
    email: people.get(o.userId)?.email ?? "",
    course: titles.get(String(o.courseId)) ?? "",
    amount: o.amount,
    currency: o.currency,
    method: o.method ?? o.provider,
    reference: o.providerRef?.replace(/^manual:/, "") ?? "",
    status: o.status,
    paidAt: o.paidAt?.toISOString() ?? "",
  }));
};
