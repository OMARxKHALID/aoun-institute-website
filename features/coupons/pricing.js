import "server-only";
import { connectDB } from "@/lib/db";
import { dayKey } from "@/lib/format";
import Coupon from "@/features/coupons/model";
import { couponCodeSchema } from "@/features/coupons/schemas";

const discountFor = (coupon, base) => Math.min(base, coupon.kind === "percent" ? Math.round((base * coupon.value) / 100) : coupon.value);

export const couponState = (coupon) => {
  if (!coupon.active) return "paused";
  if (coupon.expiresOn && coupon.expiresOn < dayKey()) return "expired";
  if (coupon.maxUses && coupon.uses >= coupon.maxUses) return "used up";
  return "active";
};

const problems = { paused: "This code is not valid", expired: "This code has expired", "used up": "This code has been used up" };

const findUsableCoupon = async (code, courseId) => {
  const parsed = couponCodeSchema.safeParse(code ?? "");
  if (!parsed.success) return { error: "This code is not valid" };
  await connectDB();
  const coupon = await Coupon.findOne({ code: parsed.data }).lean();
  if (!coupon) return { error: "This code is not valid" };
  const state = couponState(coupon);
  if (state !== "active") return { error: problems[state] };
  if (coupon.courseId && String(coupon.courseId) !== String(courseId)) return { error: "This code does not apply to this course" };
  return { coupon };
};

export const priceWithCoupon = async (course, code) => {
  const base = course.discountPrice ?? course.price;
  if (!code) return { amount: base };
  const { coupon, error } = await findUsableCoupon(code, course._id);
  if (error) return { error };
  const discount = discountFor(coupon, base);
  return { amount: base - discount, coupon, applied: { code: coupon.code, discount } };
};

export const claimCoupon = (couponId) =>
  Coupon.updateOne({ _id: couponId, active: true, $or: [{ maxUses: null }, { $expr: { $lt: ["$uses", "$maxUses"] } }] }, { $inc: { uses: 1 } }).then((r) => r.modifiedCount === 1);

export const releaseCoupon = (match) => Coupon.updateOne({ ...match, uses: { $gt: 0 } }, { $inc: { uses: -1 } });
