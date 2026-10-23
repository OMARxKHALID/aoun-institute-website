import "server-only";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Coupon from "@/features/coupons/model";
import { couponState } from "@/features/coupons/pricing";
import { plain } from "@/lib/format";

export const getAdminCoupons = async () => {
  await requireAdmin();
  await connectDB();
  const [coupons, courses] = await Promise.all([Coupon.find().sort({ createdAt: -1 }).limit(1000).lean(), Course.find({}, "title").sort({ title: 1 }).lean()]);
  const titles = new Map(courses.map((c) => [String(c._id), c.title]));
  return plain({
    coupons: coupons.map((c) => ({
      id: String(c._id),
      code: c.code,
      kind: c.kind,
      value: c.value,
      course: c.courseId ? (titles.get(String(c.courseId)) ?? "Deleted course") : "All courses",
      expiresOn: c.expiresOn,
      uses: c.uses,
      maxUses: c.maxUses,
      active: c.active,
      state: couponState(c),
      createdAt: c.createdAt,
    })),
    courses: [{ value: "", label: "All courses" }, ...courses.map((c) => ({ value: String(c._id), label: c.title }))],
  });
};
