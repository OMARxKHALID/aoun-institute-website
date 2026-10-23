import "server-only";
import { Types } from "mongoose";
import { connectDB, db } from "@/lib/db";
import { isAdmin, requireAdmin, requireUser } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Order from "@/features/payments/models/order";
import { canRequestRefund } from "@/features/payments/transitions";

export const getAdminOrders = async () => {
  await requireAdmin();
  await connectDB();
  const orders = await Order.find().populate({ path: "courseId", select: "title slug", model: Course }).sort({ createdAt: -1 }).limit(500).lean();
  const ids = [...new Set(orders.map((o) => o.userId))].filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id));
  const users = await db.collection("user").find({ _id: { $in: ids } }, { projection: { name: 1, email: 1 } }).toArray();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  return orders.map((o) => ({
    id: String(o._id),
    student: byId.get(o.userId)?.name ?? "Former student",
    email: byId.get(o.userId)?.email ?? "",
    course: o.courseId?.title ?? "Deleted course",
    amount: o.amount,
    currency: o.currency,
    method: o.method ?? o.provider,
    reference: o.providerRef?.replace(/^manual:/, "") ?? "",
    hasReceipt: Boolean(o.receipt?.publicId),
    note: o.note ?? "",
    status: o.status,
    refund: o.refundRequest?.status ? { status: o.refundRequest.status, reason: o.refundRequest.reason ?? "", note: o.refundRequest.note ?? "" } : null,
    createdAt: o.createdAt.toISOString(),
  }));
};

export const getMyOrders = async () => {
  const user = await requireUser();
  await connectDB();
  const orders = await Order.find({ userId: user.id }).populate({ path: "courseId", select: "title slug", model: Course }).sort({ createdAt: -1 }).lean();
  return orders.map((o) => ({
    id: String(o._id),
    course: o.courseId?.title ?? "Deleted course",
    slug: o.courseId?.slug ?? null,
    amount: o.amount,
    currency: o.currency,
    method: o.method ?? o.provider,
    reference: o.providerRef?.replace(/^manual:/, "") ?? "",
    note: o.status === "REJECTED" || o.status === "CANCELLED" ? (o.note ?? "") : "",
    status: o.status,
    refund: o.refundRequest?.status ? { status: o.refundRequest.status, reason: o.refundRequest.reason ?? "", note: o.refundRequest.note ?? "" } : null,
    canRequestRefund: canRequestRefund(o),
    createdAt: o.createdAt.toISOString(),
  }));
};

export const getInvoice = async (orderId, user) => {
  if (!user || !Types.ObjectId.isValid(orderId)) return null;
  await connectDB();
  const order = await Order.findOne({ _id: orderId, status: { $in: ["PAID", "REFUNDED"] }, ...(isAdmin(user) ? {} : { userId: user.id }) })
    .populate({ path: "courseId", select: "title", model: Course })
    .lean();
  if (!order) return null;
  const student = Types.ObjectId.isValid(order.userId) ? await db.collection("user").findOne({ _id: new Types.ObjectId(order.userId) }, { projection: { name: 1, email: 1 } }) : null;
  const paidAt = order.paidAt ?? order.updatedAt;
  return {
    number: `INV-${new Date(paidAt).getFullYear()}-${String(order._id).slice(-8).toUpperCase()}`,
    studentName: student?.name ?? "Former student",
    studentEmail: student?.email ?? "",
    courseTitle: order.courseId?.title ?? "Deleted course",
    currency: order.currency,
    amount: order.amount,
    subtotal: order.amount + (order.coupon?.discount ?? 0),
    coupon: order.coupon?.code ? { code: order.coupon.code, discount: order.coupon.discount } : null,
    method: order.method ?? order.provider,
    reference: order.providerRef?.replace(/^manual:/, "") ?? "",
    paidAt,
    refundedAt: order.status === "REFUNDED" ? (order.refundedAt ?? order.updatedAt) : null,
  };
};
