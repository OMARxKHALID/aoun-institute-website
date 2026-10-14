"use server";

import { updateTag } from "next/cache";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { rateLimit } from "@/lib/rate-limit";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import Review from "@/features/reviews/model";
import { replySchema, reviewSchema } from "@/features/reviews/schemas";
import { audit } from "@/features/audit/service";

const invalidate = (courseId) => {
  updateTag("catalog");
  updateTag(`course:${courseId}`);
};

export const saveReview = async (courseId, input) => {
  const user = await requireUser();
  if (!(await rateLimit("community", user.id))) return fail("Too many reviews. Try again later.");
  const result = parse(reviewSchema, input);
  if (!result.ok) return result;
  if (!isValidObjectId(courseId)) return fail("Course not found");
  await connectDB();
  if (!(await Enrollment.exists({ userId: user.id, courseId, status: "active" }))) return fail("Only enrolled students can review this course");
  if (!(await LessonProgress.exists({ userId: user.id, courseId, completedAt: { $ne: null } }))) return fail("Finish at least one lesson before reviewing");
  await Review.updateOne({ userId: user.id, courseId }, { $set: { ...result.data, studentName: user.name }, $setOnInsert: { status: "published" } }, { upsert: true });
  invalidate(courseId);
  return { ok: true };
};

export const deleteMyReview = async (courseId) => {
  const user = await requireUser();
  if (!isValidObjectId(courseId)) return fail("Course not found");
  await connectDB();
  await Review.deleteOne({ userId: user.id, courseId });
  invalidate(courseId);
  return { ok: true };
};

const loadReview = async (id) => {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  return Review.findById(id);
};

export const setReviewStatus = async (id, status) => {
  const admin = await requireAdmin();
  if (!["published", "hidden"].includes(status)) return fail("Invalid status");
  const review = await loadReview(id);
  if (!review) return fail("Review not found");
  await Review.updateOne({ _id: id }, { $set: { status } });
  invalidate(review.courseId);
  await audit(admin, `review.${status === "hidden" ? "hide" : "show"}`, `${status === "hidden" ? "Hid" : "Showed"} a ${review.rating}-star review by ${review.studentName}`, { type: "course", id: review.courseId });
  return { ok: true };
};

export const replyToReview = async (id, input) => {
  const admin = await requireAdmin();
  const result = parse(replySchema, input);
  if (!result.ok) return result;
  const review = await loadReview(id);
  if (!review) return fail("Review not found");
  await Review.updateOne({ _id: id }, { $set: { reply: { body: result.data.body, at: new Date() } } });
  invalidate(review.courseId);
  await audit(admin, "review.reply", `Replied to a review by ${review.studentName}`, { type: "course", id: review.courseId });
  return { ok: true };
};

export const deleteReview = async (id) => {
  const admin = await requireAdmin();
  const review = await loadReview(id);
  if (!review) return fail("Review not found");
  await Review.deleteOne({ _id: id });
  invalidate(review.courseId);
  await audit(admin, "review.delete", `Deleted a ${review.rating}-star review by ${review.studentName}`, { type: "course", id: review.courseId });
  return { ok: true };
};
