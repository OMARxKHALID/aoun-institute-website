"use server";

import { Types, isValidObjectId } from "mongoose";
import { requireAdmin, requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import { linkEmail, sendEmail } from "@/lib/email";
import { connectDB, db } from "@/lib/db";
import Course from "@/features/courses/models/course";
import { grantEnrollment } from "@/features/enrollments/enroll";
import { getSiteSettings } from "@/features/site-settings/queries";
import { cardSchema, checkoutSchema, refundRequestSchema, rejectSchema } from "@/features/payments/schemas";
import { demoCardPayment, demoPaymentsEnabled } from "@/features/payments/providers/demo-card";
import { manualPayment } from "@/features/payments/providers/manual";
import { approve, checkout, declineRefundRequest, openRefundRequest, refund, reject } from "@/features/payments/lifecycle";
import { audit } from "@/features/audit/service";
import { SITE_URL } from "@/lib/site";

const loadPublishedCourse = async (courseId) => {
  if (!isValidObjectId(courseId)) return null;
  await connectDB();
  return Course.findOne({ _id: courseId, status: "published" }, "title slug price discountPrice currency").lean();
};

const findUser = (userId) => db.collection("user").findOne({ _id: new Types.ObjectId(userId) }, { projection: { name: 1, email: 1 } }).catch(() => null);

const notify = (task) => task.catch((error) => console.error("[payments] email failed", error));

const notifyStudent = async (userId, message) => {
  const student = await findUser(userId);
  if (student?.email) await notify(sendEmail({ to: student.email, ...message }));
};

const notifyOwner = async (message) => {
  const { contact } = await getSiteSettings();
  if (contact?.email) await notify(sendEmail({ to: contact.email, ...message }));
};

export const createManualOrder = async (courseId, input, couponCode) => {
  const user = await requireUser();
  if (!(await rateLimit("payment", user.id))) return fail("Too many payment submissions. Try again in a few minutes.");
  const result = parse(checkoutSchema, input);
  if (!result.ok) return result;
  const course = await loadPublishedCourse(courseId);
  if (!course) return fail("This course is not available");
  const done = await checkout({ userId: user.id, course, couponCode, adapter: manualPayment, input: result.data });
  if (!done.ok) return done;
  const { method, reference } = result.data;
  await notifyOwner({
    subject: `New payment to review: ${course.title}`,
    html: linkEmail({ title: "New payment to review", text: `${user.name} (${user.email}) paid for ${course.title} by ${method}. Reference: ${reference}.`, url: `${SITE_URL}/admin/orders`, cta: "Review payment" }),
  });
  return { ok: true };
};

export const payWithDemoCard = async (courseId, input, couponCode) => {
  const user = await requireUser();
  if (!demoPaymentsEnabled()) return fail("Card payments are not available");
  if (!(await rateLimit("payment", user.id))) return fail("Too many payment attempts. Try again in a few minutes.");
  const result = parse(cardSchema, input);
  if (!result.ok) return result;
  const course = await loadPublishedCourse(courseId);
  if (!course) return fail("This course is not available");
  const done = await checkout({ userId: user.id, course, couponCode, adapter: demoCardPayment, input: result.data });
  if (!done.ok) return done;
  const { order, payment } = done.data;
  await notify(
    sendEmail({
      to: user.email,
      subject: `You're enrolled in ${course.title}`,
      html: linkEmail({ title: "Payment received", text: `We charged ${course.currency} ${order.amount} to your card ending ${payment.last4}. You are now enrolled in ${course.title}.`, url: `${SITE_URL}/dashboard/courses/${course.slug}`, cta: "Start learning" }),
    }),
  );
  return { ok: true, data: { slug: course.slug } };
};

export const enrollFree = async (courseId) => {
  const user = await requireUser();
  const course = await loadPublishedCourse(courseId);
  if (!course) return fail("This course is not available");
  if ((course.discountPrice ?? course.price) !== 0) return fail("This course is not free");
  await grantEnrollment({ userId: user.id, courseId, source: "free" });
  return { ok: true };
};

export const enrollWithCoupon = async (courseId, couponCode) => {
  const user = await requireUser();
  if (!(await rateLimit("payment", user.id))) return fail("Too many attempts. Try again in a few minutes.");
  const course = await loadPublishedCourse(courseId);
  if (!course) return fail("This course is not available");
  const done = await checkout({ userId: user.id, course, couponCode, adapter: null });
  if (!done.ok) return done;
  return { ok: true, data: { slug: course.slug } };
};

export const approveOrder = async (orderId) => {
  const admin = await requireAdmin();
  const done = await approve(orderId, { by: admin.id });
  if (!done.ok) return done;
  const order = done.data;
  await notifyStudent(order.userId, {
    subject: `You're enrolled in ${order.courseId.title}`,
    html: linkEmail({ title: "Payment approved", text: `Your payment was confirmed. You are now enrolled in ${order.courseId.title}.`, url: `${SITE_URL}/dashboard/courses/${order.courseId.slug}`, cta: "Start learning" }),
  });
  await audit(admin, "order.approve", `Approved ${order.currency} ${order.amount} for "${order.courseId.title}"`, { type: "order", id: order._id });
  return { ok: true };
};

export const rejectOrder = async (orderId, input) => {
  const admin = await requireAdmin();
  const result = parse(rejectSchema, input);
  if (!result.ok) return result;
  const { note } = result.data;
  const done = await reject(orderId, { by: admin.id, note });
  if (!done.ok) return done;
  const order = done.data;
  await notifyStudent(order.userId, {
    subject: `Payment not confirmed: ${order.courseId.title}`,
    html: linkEmail({ title: "We could not confirm your payment", text: `Reason: ${note}. You can submit your payment details again.`, url: `${SITE_URL}/checkout/${order.courseId.slug}`, cta: "Try again" }),
  });
  await audit(admin, "order.reject", `Rejected a payment for "${order.courseId.title}": ${note}`, { type: "order", id: order._id });
  return { ok: true };
};

export const refundOrder = async (orderId, input) => {
  const admin = await requireAdmin();
  const result = parse(rejectSchema, input);
  if (!result.ok) return result;
  const { note } = result.data;
  const done = await refund(orderId, { by: admin.id, note });
  if (!done.ok) return done;
  const order = done.data;
  await notifyStudent(order.userId, {
    subject: `Refund for ${order.courseId.title}`,
    html: linkEmail({ title: "Your payment was refunded", text: `Reason: ${note}. Your access to ${order.courseId.title} has been removed.`, url: `${SITE_URL}/dashboard/orders`, cta: "View orders" }),
  });
  await audit(admin, "order.refund", `Refunded ${order.currency} ${order.amount} for "${order.courseId.title}"`, { type: "order", id: order._id });
  return { ok: true };
};

export const requestRefund = async (orderId, input) => {
  const user = await requireUser();
  if (!(await rateLimit("payment", user.id))) return fail("Too many requests. Try again in a few minutes.");
  const result = parse(refundRequestSchema, input);
  if (!result.ok) return result;
  const { reason } = result.data;
  const done = await openRefundRequest(orderId, { userId: user.id, reason });
  if (!done.ok) return done;
  const order = done.data;
  await notifyOwner({
    subject: `Refund requested: ${order.courseId?.title ?? "a course"}`,
    html: linkEmail({ title: "A student asked for a refund", text: `${user.name} (${user.email}) asked for a refund of ${order.currency} ${order.amount}. Reason: ${reason}`, url: `${SITE_URL}/admin/orders`, cta: "Review request" }),
  });
  return { ok: true };
};

export const declineRefund = async (orderId, input) => {
  const admin = await requireAdmin();
  const result = parse(rejectSchema, input);
  if (!result.ok) return result;
  const { note } = result.data;
  const done = await declineRefundRequest(orderId, { note });
  if (!done.ok) return done;
  const order = done.data;
  await notifyStudent(order.userId, {
    subject: `Refund request for ${order.courseId?.title ?? "your course"}`,
    html: linkEmail({ title: "We could not approve your refund", text: `Reason: ${note}. You keep full access to the course.`, url: `${SITE_URL}/dashboard/orders`, cta: "View orders" }),
  });
  await audit(admin, "order.refund_decline", `Declined a refund request for "${order.courseId?.title}": ${note}`, { type: "order", id: order._id });
  return { ok: true };
};
