import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/dal";
import { canTeach, courseScope, taughtCourseIds } from "@/features/courses/access";
import Review from "@/features/reviews/model";
import Course from "@/features/courses/models/course";

const plain = (value) => JSON.parse(JSON.stringify(value));

export const reviewStats = async (courseIds) => {
  const rows = await Review.aggregate([
    { $match: { courseId: { $in: courseIds.map((id) => new Types.ObjectId(String(id))) }, status: "published" } },
    { $group: { _id: { course: "$courseId", rating: "$rating" }, count: { $sum: 1 } } },
  ]);
  const stats = new Map();
  rows.forEach(({ _id, count }) => {
    const key = String(_id.course);
    const s = stats.get(key) ?? { count: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    s.count += count;
    s.total += _id.rating * count;
    s.distribution[_id.rating - 1] += count;
    stats.set(key, s);
  });
  return new Map([...stats].map(([key, s]) => [key, { count: s.count, average: Math.round((s.total / s.count) * 10) / 10, distribution: s.distribution }]));
};

export const getMyReview = async (courseId) => {
  const user = await requireUser();
  await connectDB();
  const review = await Review.findOne({ userId: user.id, courseId }, "rating body status reply").lean();
  return review && plain({ ...review, id: String(review._id) });
};

export const getAdminReviews = async () => {
  const user = await requireStaff();
  await connectDB();
  const reviews = await Review.find(await courseScope(user)).sort({ createdAt: -1 }).limit(2000).lean();
  const courses = await Course.find({ _id: { $in: [...new Set(reviews.map((r) => String(r.courseId)))] } }, "title slug").lean();
  const byId = new Map(courses.map((c) => [String(c._id), c]));
  return plain(
    reviews.map((r) => ({
      id: String(r._id),
      studentName: r.studentName,
      userId: r.userId,
      course: byId.get(String(r.courseId))?.title ?? "Deleted course",
      slug: byId.get(String(r.courseId))?.slug,
      rating: r.rating,
      body: r.body,
      status: r.status,
      reply: r.reply?.body ?? "",
      createdAt: r.createdAt,
    })),
  );
};
