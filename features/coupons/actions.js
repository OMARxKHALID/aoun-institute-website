"use server";

import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import { formatPrice } from "@/lib/format";
import Course from "@/features/courses/models/course";
import Coupon from "@/features/coupons/model";
import { couponSchema } from "@/features/coupons/schemas";
import { priceWithCoupon } from "@/features/coupons/pricing";
import { audit } from "@/features/audit/service";

export const createCoupon = async (input) => {
  const admin = await requireAdmin();
  const result = parse(couponSchema, input);
  if (!result.ok) return result;
  await connectDB();
  const { courseId, expiresOn, maxUses, ...data } = result.data;
  if (courseId && !(await Course.exists({ _id: courseId }))) return fail("Choose a course", "courseId");
  const coupon = await Coupon.create({ ...data, courseId: courseId || null, expiresOn: expiresOn || null, maxUses: maxUses ?? null, createdBy: admin.id }).catch((error) =>
    error?.code === 11000 ? null : Promise.reject(error),
  );
  if (!coupon) return fail("This code already exists", "code");
  await audit(admin, "coupon.create", `Created coupon ${coupon.code}`, { type: "coupon", id: coupon._id });
  return { ok: true };
};

export const setCouponActive = async (id, active) => {
  const admin = await requireAdmin();
  if (!isValidObjectId(id)) return fail("Coupon not found");
  await connectDB();
  const coupon = await Coupon.findByIdAndUpdate(id, { $set: { active: Boolean(active) } });
  if (!coupon) return fail("Coupon not found");
  await audit(admin, active ? "coupon.resume" : "coupon.pause", `${active ? "Resumed" : "Paused"} coupon ${coupon.code}`, { type: "coupon", id });
  return { ok: true };
};

export const deleteCoupon = async (id) => {
  const admin = await requireAdmin();
  if (!isValidObjectId(id)) return fail("Coupon not found");
  await connectDB();
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) return fail("Coupon not found");
  await audit(admin, "coupon.delete", `Deleted coupon ${coupon.code}`, { type: "coupon", id });
  return { ok: true };
};

export const previewCoupon = async (courseId, code) => {
  const user = await requireUser();
  if (!(await rateLimit("coupon", user.id))) return fail("Too many tries. Wait a minute and try again.", "coupon");
  if (!isValidObjectId(courseId)) return fail("This course is not available", "coupon");
  await connectDB();
  const course = await Course.findOne({ _id: courseId, status: "published" }, "price discountPrice currency").lean();
  if (!course) return fail("This course is not available", "coupon");
  const priced = await priceWithCoupon(course, code);
  if (priced.error) return fail(priced.error, "coupon");
  return { ok: true, data: { code: priced.applied.code, amount: priced.amount, discountLabel: formatPrice(priced.applied.discount, course.currency), amountLabel: formatPrice(priced.amount, course.currency) } };
};
