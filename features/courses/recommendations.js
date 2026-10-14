import "server-only";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Enrollment from "@/features/enrollments/model";
import CourseProgress from "@/features/progress/models/course-progress";
import { getCatalog } from "@/features/courses/queries";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const rankRecommendations = (catalog, taken) => {
  const takenIds = new Set(taken.map((t) => t.id));
  const categories = new Map();
  taken.forEach((t) => categories.set(t.category, Math.max(categories.get(t.category) ?? 0, t.percent ?? 0)));
  const finishedLevels = taken.filter((t) => (t.percent ?? 0) >= 50).map((t) => LEVELS.indexOf(t.level));
  return catalog
    .filter((c) => !takenIds.has(c.id))
    .map((c) => {
      let score = (c.rating?.average ?? 3.5) / 2;
      let reason = "Popular with other students";
      if (categories.has(c.category)) {
        score += 3;
        reason = `Because you are learning ${c.category}`;
      }
      const level = LEVELS.indexOf(c.level);
      if (level > 0 && finishedLevels.includes(level - 1) && categories.has(c.category)) {
        score += 2;
        reason = `Next step after your ${LEVELS[level - 1].toLowerCase()} course`;
      }
      if ((c.discountPrice ?? c.price) === 0) score += 0.5;
      return { ...c, score, reason };
    })
    .toSorted((a, b) => b.score - a.score);
};

export const getRecommendations = async (limit = 3) => {
  const user = await requireUser();
  await connectDB();
  const [catalog, enrollments] = await Promise.all([getCatalog(), Enrollment.find({ userId: user.id, status: "active" }, "courseId").lean()]);
  const ids = enrollments.map((e) => e.courseId);
  const [courses, progress] = await Promise.all([Course.find({ _id: { $in: ids } }, "category level").lean(), CourseProgress.find({ userId: user.id, courseId: { $in: ids } }, "courseId percent").lean()]);
  const percent = new Map(progress.map((p) => [String(p.courseId), p.percent]));
  const taken = courses.map((c) => ({ id: String(c._id), category: c.category, level: c.level, percent: percent.get(String(c._id)) ?? 0 }));
  return rankRecommendations(catalog, taken).slice(0, limit);
};
