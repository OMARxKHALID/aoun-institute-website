import "server-only";
import { Types, isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import Course from "@/features/courses/models/course";
import Section from "@/features/courses/models/section";
import Lesson from "@/features/courses/models/lesson";
import Enrollment from "@/features/enrollments/model";
import LessonProgress from "@/features/progress/models/lesson-progress";
import Discussion from "@/features/discussions/model";
import { canTeach } from "@/features/courses/access";

export const getLessonAnalytics = async (courseId) => {
  const user = await requireStaff();
  if (!isValidObjectId(courseId) || !(await canTeach(user, courseId))) return null;
  await connectDB();
  const [course, sections, lessons, enrolled, progress, questions] = await Promise.all([
    Course.findById(courseId, "title").lean(),
    Section.find({ courseId }, "order").lean(),
    Lesson.find({ courseId, status: "published" }, "title sectionId order").lean(),
    Enrollment.countDocuments({ courseId, status: "active" }),
    LessonProgress.aggregate([
      { $match: { courseId: new Types.ObjectId(courseId) } },
      { $group: { _id: "$lessonId", started: { $sum: 1 }, completed: { $sum: { $cond: [{ $ifNull: ["$completedAt", false] }, 1, 0] } }, avgPercent: { $avg: "$percent" } } },
    ]),
    Discussion.aggregate([{ $match: { courseId: new Types.ObjectId(courseId), parentId: null } }, { $group: { _id: "$lessonId", count: { $sum: 1 } } }]),
  ]);
  if (!course) return null;
  const sectionOrder = new Map(sections.map((s) => [String(s._id), s.order]));
  const stats = new Map(progress.map((p) => [String(p._id), p]));
  const asked = new Map(questions.map((q) => [String(q._id), q.count]));
  const ordered = [...lessons].sort((a, b) => (sectionOrder.get(String(a.sectionId)) ?? 0) - (sectionOrder.get(String(b.sectionId)) ?? 0) || a.order - b.order);
  return {
    course: { id: String(course._id), title: course.title },
    enrolled,
    lessons: ordered.map((l, i) => {
      const s = stats.get(String(l._id));
      return {
        id: String(l._id),
        number: i + 1,
        title: l.title,
        started: s?.started ?? 0,
        completed: s?.completed ?? 0,
        completionRate: enrolled ? Math.round(((s?.completed ?? 0) / enrolled) * 100) : 0,
        avgWatched: Math.round((s?.avgPercent ?? 0) * 100),
        questions: asked.get(String(l._id)) ?? 0,
      };
    }),
  };
};

