import "server-only";
import { isValidObjectId } from "mongoose";
import { fail } from "@/lib/validate";
import { connectDB } from "@/lib/db";
import Course from "@/features/courses/models/course";
import Order from "@/features/payments/models/order";
import Enrollment from "@/features/enrollments/model";
import { endEnrollment, grantEnrollment } from "@/features/enrollments/enroll";
import { claimCoupon, priceWithCoupon, releaseCoupon } from "@/features/coupons/pricing";
import { ORDER_EVENTS, canRequestRefund, checkoutProblem } from "@/features/payments/transitions";

const COURSE_FIELDS = { path: "courseId", select: "title slug", model: Course };

const courseIdOf = (order) => order.populated("courseId") ?? order.courseId;

const applyEffects = async (order, rule) => {
  if (rule.coupon === "release" && order.coupon?.code) await releaseCoupon({ code: order.coupon.code });
  const link = { userId: order.userId, courseId: courseIdOf(order), orderId: order._id };
  if (rule.enrollment === "grant") await grantEnrollment({ ...link, source: "order" });
  if (rule.enrollment === "end") await endEnrollment(link);
};

const transition = async (orderId, event, changes = {}) => {
  if (!isValidObjectId(orderId)) return null;
  const rule = ORDER_EVENTS[event];
  await connectDB();
  const order = await Order.findOneAndUpdate({ _id: orderId, status: rule.from }, { $set: { ...changes, status: rule.to } }).populate(COURSE_FIELDS);
  if (!order) return null;
  await applyEffects(order, rule);
  return order;
};

const cancelPending = async (userId, courseId, note) => {
  const pending = await Order.find({ userId, courseId, status: "PENDING" }, "_id").lean();
  await Promise.all(pending.map((o) => transition(o._id, "cancel", { note })));
};

const submitPending = async ({ userId, courseId, fields, applied }) => {
  const reopened = await Order.findOneAndUpdate(
    { userId, courseId, providerRef: fields.providerRef, status: "REJECTED" },
    { $set: { ...fields, status: "PENDING" }, $unset: { reviewedBy: 1, ...(!applied && { coupon: 1 }) } },
  );
  if (reopened) return reopened;
  return Order.create({ ...fields, userId, courseId }).catch((error) => (error?.code === 11000 ? null : Promise.reject(error)));
};

const couponPayment = (applied) => ({ ok: true, status: "PAID", cancelNote: "Enrolled with a coupon instead", fields: { provider: "coupon", method: `Coupon ${applied.code}` } });

export const checkout = async ({ userId, course, couponCode, adapter, input }) => {
  const courseId = course._id;
  await connectDB();
  if (await Enrollment.exists({ userId, courseId, status: "active" })) return fail("You are already enrolled in this course");
  if (adapter && !adapter.instant && (await Order.exists({ userId, courseId, status: "PENDING" }))) return fail("Your payment for this course is already under review");
  const priced = await priceWithCoupon(course, couponCode);
  if (priced.error) return fail(priced.error);
  const problem = checkoutProblem({ base: priced.amount + (priced.applied?.discount ?? 0), amount: priced.amount, paid: Boolean(adapter) });
  if (problem) return fail(problem);
  if (priced.coupon && !(await claimCoupon(priced.coupon._id))) return fail("This code has just been used up");
  const giveBack = () => priced.coupon && releaseCoupon({ _id: priced.coupon._id });
  const payment = adapter ? await adapter.pay(input, { userId }) : couponPayment(priced.applied);
  if (!payment.ok) {
    await giveBack();
    return fail(payment.error, payment.field);
  }
  const fields = { ...payment.fields, amount: priced.amount, currency: course.currency, coupon: priced.applied };
  if (payment.status === "PENDING") {
    const order = await submitPending({ userId, courseId, fields, applied: priced.applied });
    if (!order) {
      await giveBack();
      return fail("This transaction ID was already submitted", "reference");
    }
    return { ok: true, data: { order, payment } };
  }
  const order = await Order.create({ ...fields, userId, courseId, status: "PAID", paidAt: new Date() });
  await cancelPending(userId, courseId, payment.cancelNote ?? adapter?.cancelNote);
  await grantEnrollment({ userId, courseId, source: "order", orderId: order._id });
  return { ok: true, data: { order, payment } };
};

export const approve = async (orderId, { by }) => {
  const order = await transition(orderId, "approve", { paidAt: new Date(), reviewedBy: by });
  return order ? { ok: true, data: order } : fail("This order was already reviewed");
};

export const reject = async (orderId, { by, note }) => {
  const order = await transition(orderId, "reject", { reviewedBy: by, note });
  return order ? { ok: true, data: order } : fail("This order was already reviewed");
};

export const refund = async (orderId, { by, note }) => {
  const order = await transition(orderId, "refund", { refundedAt: new Date(), reviewedBy: by, note });
  if (!order) return fail("Only paid orders can be refunded");
  if (order.refundRequest?.status === "open") await Order.updateOne({ _id: order._id }, { $set: { "refundRequest.status": "approved", "refundRequest.decidedAt": new Date() } });
  return { ok: true, data: order };
};

export const openRefundRequest = async (orderId, { userId, reason }) => {
  if (!isValidObjectId(orderId)) return fail("Order not found");
  await connectDB();
  const order = await Order.findOne({ _id: orderId, userId, status: "PAID" }).populate({ ...COURSE_FIELDS, select: "title" }).lean();
  if (!order) return fail("Only paid orders can be refunded");
  if (!order.amount) return fail("Free enrollments cannot be refunded");
  if (!canRequestRefund(order)) return fail("Your refund request is already being reviewed");
  const updated = await Order.updateOne(
    { _id: order._id, status: "PAID", "refundRequest.status": { $ne: "open" } },
    { $set: { refundRequest: { reason, requestedAt: new Date(), status: "open" } } },
  );
  if (!updated.modifiedCount) return fail("Your refund request is already being reviewed");
  return { ok: true, data: order };
};

export const declineRefundRequest = async (orderId, { note }) => {
  if (!isValidObjectId(orderId)) return fail("Order not found");
  await connectDB();
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: "PAID", "refundRequest.status": "open" },
    { $set: { "refundRequest.status": "declined", "refundRequest.note": note, "refundRequest.decidedAt": new Date() } },
  ).populate({ ...COURSE_FIELDS, select: "title" });
  return order ? { ok: true, data: order } : fail("This request was already handled");
};
