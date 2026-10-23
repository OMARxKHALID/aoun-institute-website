"use server";

import { Types, isValidObjectId } from "mongoose";
import { requireAdmin, requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { verifyUpload } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";
import { linkEmail, sendEmail } from "@/lib/email";
import { connectDB, db } from "@/lib/db";
import Course from "@/features/courses/models/course";
import Order from "@/features/payments/models/order";
import Enrollment from "@/features/enrollments/model";
import { grantEnrollment } from "@/features/enrollments/enroll";
import { getSiteSettings } from "@/features/site-settings/queries";
import { cardSchema, checkoutSchema, rejectSchema } from "@/features/payments/schemas";
import { chargeDemoCard, demoPaymentsEnabled } from "@/features/payments/providers/demo-card";
import { audit } from "@/features/audit/service";
import { SITE_URL } from "@/lib/site";

const loadPublishedCourse = async (courseId) => {
  if (!isValidObjectId(courseId)) return null;
  await connectDB();
  return Course.findOne({ _id: courseId, status: "published" }, "title slug price discountPrice currency").lean();
};

const amountOf = (course) => course.discountPrice ?? course.price;

const findUser = (userId) => db.collection("user").findOne({ _id: new Types.ObjectId(userId) }, { projection: { name: 1, email: 1 } }).catch(() => null);

const notify = (task) => task.catch((error) => console.error("[payments] email failed", error));

export const createManualOrder = async (courseId, input) => {
  const user = await requireUser();
  if (!(await rateLimit("payment", user.id))) return fail("Too many payment submissions. Try again in a few minutes.");
  const result = parse(checkoutSchema, input);
  if (!result.ok) return result;
  const course = await loadPublishedCourse(courseId);
  if (!course) return fail("This course is not available");
  if (amountOf(course) === 0) return fail("This course is free. Use the enroll button.");
  if (await Enrollment.exists({ userId: user.id, courseId, status: "active" })) return fail("You are already enrolled in this course");
  if (await Order.exists({ userId: user.id, courseId, status: "PENDING" })) return fail("Your payment for this course is already under review");
  const { receipt, ...data } = result.data;
  let stored;
  if (receipt) {
    if (await Order.exists({ "receipt.publicId": receipt.publicId, userId: { $ne: user.id } })) return fail("Invalid upload", "receipt");
    const check = await verifyUpload("receipt", receipt.publicId);
    if (!check.ok) return fail(check.error, "receipt");
    stored = { publicId: check.asset.publicId, format: check.asset.format };
  }
  const fields = { amount: amountOf(course), currency: course.currency, method: data.method, receipt: stored, note: data.note || undefined };
  const providerRef = `manual:${data.reference}`;
  const reopened = await Order.findOneAndUpdate({ userId: user.id, courseId, providerRef, status: "REJECTED" }, { $set: { ...fields, status: "PENDING" }, $unset: { reviewedBy: 1 } });
  const order =
    reopened ??
    (await Order.create({ ...fields, userId: user.id, courseId, provider: "manual", providerRef }).catch((error) => (error?.code === 11000 ? null : Promise.reject(error))));
  if (!order) return fail("This transaction ID was already submitted", "reference");
  const { contact } = await getSiteSettings();
  if (contact?.email)
    await notify(
      sendEmail({
        to: contact.email,
        subject: `New payment to review: ${course.title}`,
        html: linkEmail({ title: "New payment to review", text: `${user.name} (${user.email}) paid for ${course.title} by ${data.method}. Reference: ${data.reference}.`, url: `${SITE_URL}/admin/orders`, cta: "Review payment" }),
      }),
    );
  return { ok: true };
};

export const payWithDemoCard = async (courseId, input) => {
  const user = await requireUser();
  if (!demoPaymentsEnabled()) return fail("Card payments are not available");
  if (!(await rateLimit("payment", user.id))) return fail("Too many payment attempts. Try again in a few minutes.");
  const result = parse(cardSchema, input);
  if (!result.ok) return result;
  const course = await loadPublishedCourse(courseId);
  if (!course) return fail("This course is not available");
  if (amountOf(course) === 0) return fail("This course is free. Use the enroll button.");
  if (await Enrollment.exists({ userId: user.id, courseId, status: "active" })) return fail("You are already enrolled in this course");
  const charge = await chargeDemoCard(result.data);
  if (!charge.ok) return fail(charge.error, charge.field);
  const paidAt = new Date();
  const order = await Order.create({ userId: user.id, courseId, amount: amountOf(course), currency: course.currency, provider: "demo_card", method: `Card •••• ${charge.last4}`, providerRef: charge.ref, status: "PAID", paidAt });
  await Order.updateMany({ userId: user.id, courseId, status: "PENDING" }, { $set: { status: "CANCELLED", note: "Paid by card instead" } });
  await grantEnrollment({ userId: user.id, courseId, source: "order", orderId: order._id });
  await notify(
    sendEmail({
      to: user.email,
      subject: `You're enrolled in ${course.title}`,
      html: linkEmail({ title: "Payment received", text: `We charged ${course.currency} ${amountOf(course)} to your card ending ${charge.last4}. You now have lifetime access to ${course.title}.`, url: `${SITE_URL}/dashboard/courses/${course.slug}`, cta: "Start learning" }),
    }),
  );
  return { ok: true, data: { slug: course.slug } };
};

export const enrollFree = async (courseId) => {
  const user = await requireUser();
  const course = await loadPublishedCourse(courseId);
  if (!course) return fail("This course is not available");
  if (amountOf(course) !== 0) return fail("This course is not free");
  await grantEnrollment({ userId: user.id, courseId, source: "free" });
  return { ok: true };
};

const loadPendingOrder = async (orderId) => {
  if (!isValidObjectId(orderId)) return null;
  await connectDB();
  return Order.findOne({ _id: orderId, status: "PENDING" }).populate({ path: "courseId", select: "title slug", model: Course });
};

export const approveOrder = async (orderId) => {
  const admin = await requireAdmin();
  const order = await loadPendingOrder(orderId);
  if (!order) return fail("This order was already reviewed");
  const updated = await Order.updateOne({ _id: order._id, status: "PENDING" }, { $set: { status: "PAID", paidAt: new Date(), reviewedBy: admin.id } });
  if (!updated.modifiedCount) return fail("This order was already reviewed");
  await grantEnrollment({ userId: order.userId, courseId: order.courseId._id, source: "order", orderId: order._id });
  const student = await findUser(order.userId);
  if (student?.email)
    await notify(
      sendEmail({
        to: student.email,
        subject: `You're enrolled in ${order.courseId.title}`,
        html: linkEmail({ title: "Payment approved", text: `Your payment was confirmed. You now have lifetime access to ${order.courseId.title}.`, url: `${SITE_URL}/dashboard/courses/${order.courseId.slug}`, cta: "Start learning" }),
      }),
    );
  await audit(admin, "order.approve", `Approved ${order.currency} ${order.amount} for "${order.courseId.title}"`, { type: "order", id: order._id });
  return { ok: true };
};

export const rejectOrder = async (orderId, input) => {
  const admin = await requireAdmin();
  const result = parse(rejectSchema, input);
  if (!result.ok) return result;
  const order = await loadPendingOrder(orderId);
  if (!order) return fail("This order was already reviewed");
  await Order.updateOne({ _id: order._id, status: "PENDING" }, { $set: { status: "REJECTED", reviewedBy: admin.id, note: result.data.note } });
  const student = await findUser(order.userId);
  if (student?.email)
    await notify(
      sendEmail({
        to: student.email,
        subject: `Payment not confirmed: ${order.courseId.title}`,
        html: linkEmail({ title: "We could not confirm your payment", text: `Reason: ${result.data.note}. You can submit your payment details again.`, url: `${SITE_URL}/checkout/${order.courseId.slug}`, cta: "Try again" }),
      }),
    );
  await audit(admin, "order.reject", `Rejected a payment for "${order.courseId.title}": ${result.data.note}`, { type: "order", id: order._id });
  return { ok: true };
};

export const refundOrder = async (orderId, input) => {
  const admin = await requireAdmin();
  const result = parse(rejectSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(orderId)) return fail("Order not found");
  await connectDB();
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: "PAID" },
    { $set: { status: "REFUNDED", refundedAt: new Date(), reviewedBy: admin.id, note: result.data.note } },
  ).populate({ path: "courseId", select: "title slug", model: Course });
  if (!order) return fail("Only paid orders can be refunded");
  await Enrollment.updateOne({ userId: order.userId, courseId: order.courseId._id, orderId: order._id }, { $set: { status: "revoked" } });
  const student = await findUser(order.userId);
  if (student?.email)
    await notify(
      sendEmail({
        to: student.email,
        subject: `Refund for ${order.courseId.title}`,
        html: linkEmail({ title: "Your payment was refunded", text: `Reason: ${result.data.note}. Your access to ${order.courseId.title} has been removed.`, url: `${SITE_URL}/dashboard/orders`, cta: "View orders" }),
      }),
    );
  await audit(admin, "order.refund", `Refunded ${order.currency} ${order.amount} for "${order.courseId.title}"`, { type: "order", id: order._id });
  return { ok: true };
};
